import os
from datetime import datetime
from typing import Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY else None

app = FastAPI(title="InfraCare API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "http://127.0.0.1:5173"), "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    identifier: str
    password: str
    role: Literal["citizen", "engineer", "admin"]

class DamageReport(BaseModel):
    id: Optional[str] = None
    title: str
    category: Optional[str] = None
    urgency: str = "Normal"
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    status: str = "Pending"
    evidence: Optional[str] = None

@app.get("/health")
def health():
    return {"status": "ok", "supabase": bool(supabase)}

@app.post("/auth/demo-login")
def demo_login(payload: LoginRequest):
    role_home = {"citizen": "track", "engineer": "tasks", "admin": "map"}
    return {
        "user": {
            "id": f"demo-{payload.role}",
            "role": payload.role,
            "name": payload.identifier or payload.role.title(),
        },
        "redirect": role_home[payload.role],
    }

@app.get("/reports")
def list_reports():
    if not supabase:
        return {"reports": []}
    result = supabase.table("damage_reports").select("*, report_photos(*), report_status_history(*)").order("created_at", desc=True).execute()
    return {"reports": result.data}

@app.post("/reports")
def create_report(report: DamageReport):
    row = {
        "title": report.title,
        "category": report.category,
        "urgency": report.urgency,
        "description": report.description,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "status": report.status,
    }
    if not supabase:
        return {"report": {**row, "id": report.id or "local-demo", "created_at": datetime.utcnow().isoformat()}}
    created = supabase.table("damage_reports").insert(row).execute()
    report_id = created.data[0]["id"]
    supabase.table("report_status_history").insert({
        "report_id": report_id,
        "title": "Report Received",
        "description": "Citizen report filed with GPS metadata.",
    }).execute()
    return {"report": created.data[0]}

@app.post("/reports/{report_id}/photo")
async def upload_report_photo(
    report_id: str,
    latitude: float = Form(...),
    longitude: float = Form(...),
    captured_at: str = Form(...),
    photo: UploadFile = File(...),
):
    if not supabase:
        return {"photo": {"report_id": report_id, "filename": photo.filename, "latitude": latitude, "longitude": longitude, "captured_at": captured_at}}
    data = await photo.read()
    path = f"reports/{report_id}/{int(datetime.utcnow().timestamp())}-{photo.filename}"
    storage = supabase.storage.from_("report-photos")
    storage.upload(path, data, {"content-type": photo.content_type})
    public_url = storage.get_public_url(path)
    row = {
        "report_id": report_id,
        "photo_url": public_url,
        "latitude": latitude,
        "longitude": longitude,
        "captured_at": captured_at,
    }
    result = supabase.table("report_photos").insert(row).execute()
    return {"photo": result.data[0]}

@app.patch("/reports/{report_id}/status")
def update_status(report_id: str, status: str, note: str = ""):
    if not supabase:
        return {"report_id": report_id, "status": status, "note": note}
    supabase.table("damage_reports").update({"status": status}).eq("id", report_id).execute()
    supabase.table("report_status_history").insert({"report_id": report_id, "title": status, "description": note}).execute()
    return {"report_id": report_id, "status": status}

@app.post("/assignments/{report_id}/dispatch")
def dispatch(report_id: str, engineer_id: str):
    if not supabase:
        return {"report_id": report_id, "engineer_id": engineer_id, "status": "Dispatched"}
    result = supabase.table("maintenance_assignments").insert({
        "report_id": report_id,
        "engineer_id": engineer_id,
        "status": "Dispatched",
    }).execute()
    return {"assignment": result.data[0]}
