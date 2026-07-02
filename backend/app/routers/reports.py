from datetime import datetime
from fastapi import APIRouter, Form, UploadFile, File
from app.database import supabase
from app.schemas.report import DamageReport

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("")
def list_reports():
    if not supabase:
        return {"reports": []}
    result = supabase.table("damage_reports").select("*, report_photos(*), report_status_history(*)").order("created_at", desc=True).execute()
    return {"reports": result.data}

@router.post("")
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

@router.post("/{report_id}/photo")
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

@router.patch("/{report_id}/status")
def update_status(report_id: str, status: str, note: str = ""):
    if not supabase:
        return {"report_id": report_id, "status": status, "note": note}
    supabase.table("damage_reports").update({"status": status}).eq("id", report_id).execute()
    supabase.table("report_status_history").insert({"report_id": report_id, "title": status, "description": note}).execute()
    return {"report_id": report_id, "status": status}
