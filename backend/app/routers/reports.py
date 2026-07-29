from datetime import datetime
from fastapi import APIRouter, Form, UploadFile, File
from app.database import supabase
from app.schemas.report import DamageReport

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("")
def list_reports():
    if not supabase:
        return {"reports": []}
    result = supabase.table("damage_reports").select("*").order("created_at", desc=True).execute()
    return {"reports": result.data}

from app.database import create_client
from app.config import settings

@router.post("")
def create_report(report: DamageReport):
    local_supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY) if settings.SUPABASE_URL else None
    row = {
        "title": report.title,
        "category": report.category,
        "urgency": report.urgency,
        "description": report.description,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "status": report.status,
    }
    if not local_supabase:
        return {"report": {**row, "id": report.id or "local-demo", "created_at": datetime.utcnow().isoformat()}}
    created = local_supabase.table("damage_reports").insert(row).execute()
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
    try:
        result = supabase.table("report_photos").insert(row).execute()
        return {"photo": result.data[0]}
    except Exception as e:
        print(f"Failed to insert into report_photos (table might be missing): {e}")
        return {"photo": {"report_id": report_id, "photo_url": public_url}}

@router.patch("/{report_id}/status")
def update_status(report_id: str, status: str, note: str = ""):
    if not supabase:
        return {"report_id": report_id, "status": status, "note": note}
    supabase.table("damage_reports").update({"status": status}).eq("id", report_id).execute()
    
    try:
        supabase.table("report_status_history").insert({"report_id": report_id, "title": status, "description": note}).execute()
    except Exception as e:
        print(f"Failed to insert into report_status_history (table might be missing): {e}")
        
    return {"report_id": report_id, "status": status}
