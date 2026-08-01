from datetime import datetime
import random
import string
from fastapi import APIRouter, Form, UploadFile, File
from app.database import supabase, create_client
from app.schemas.report import DamageReport
from app.utils.email import send_status_update_email, send_new_report_admin_notification, send_engineer_task_assignment_email
from app.config import settings

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("")
def list_reports():
    if not supabase:
        return {"reports": []}
    result = supabase.table("damage_reports").select("*").order("created_at", desc=True).execute()
    return {"reports": result.data}

@router.post("")
def create_report(report: DamageReport):
    local_supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY) if settings.SUPABASE_URL else None
    
    # Generate Tracking ID (Module 2)
    seq = "".join(random.choices(string.digits, k=4))
    tracking_id = f"CMP-{datetime.utcnow().strftime('%Y%m%d')}-{seq}"
    
    row = {
        "tracking_id": tracking_id,
        "title": report.title,
        "category": report.category,
        "urgency": report.urgency,
        "priority": report.priority,
        "description": report.description,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "status": report.status,
        "evidence": report.evidence,
        "assigned_engineer": report.assigned_engineer,
        "engineer_notes": report.engineer_notes,
    }
    
    # Send Notification Alert to Admin
    send_new_report_admin_notification(row)

    if not local_supabase:
        return {"report": {**row, "id": report.id or "local-demo", "created_at": datetime.utcnow().isoformat()}}
    
    # Module 5: Duplicate Complaint Detection
    try:
        recent = local_supabase.table("damage_reports").select("latitude, longitude").eq("category", report.category).eq("status", "Pending").execute()
        for rec in recent.data:
            if abs(rec.get("latitude", 0) - report.latitude) < 0.0005 and abs(rec.get("longitude", 0) - report.longitude) < 0.0005:
                row["status"] = "Duplicate"
                row["priority"] = "Low"
                break
    except Exception as e:
        print(f"Duplicate detection failed: {e}")
        
    try:
        created = local_supabase.table("damage_reports").insert(row).execute()
        return {"report": created.data[0]}
    except Exception as e:
        # Fallback if new columns aren't in DB yet
        print(f"Error inserting report with new columns: {e}")
        fallback_row = {k:v for k,v in row.items() if k not in ["tracking_id", "priority", "assigned_engineer", "engineer_notes"]}
        created = local_supabase.table("damage_reports").insert(fallback_row).execute()
        result = created.data[0]
        result["tracking_id"] = tracking_id
        result["priority"] = report.priority
        result["assigned_engineer"] = report.assigned_engineer
        result["engineer_notes"] = report.engineer_notes
        return {"report": result}

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
    
    # Module 3: AI-Based Damage Detection Mock
    ai_damage_types = ["Pothole", "Cracked Asphalt", "Deterioration"]
    ai_severities = ["Minor", "Moderate", "Severe"]
    ai_damage = random.choice(ai_damage_types)
    ai_sev = random.choice(ai_severities)
    
    row = {
        "report_id": report_id,
        "photo_url": public_url,
        "latitude": latitude,
        "longitude": longitude,
        "captured_at": captured_at,
    }
    
    try:
        supabase.table("damage_reports").update({
            "ai_damage_type": ai_damage,
            "ai_severity": ai_sev,
            "ai_verified": True,
            "evidence": public_url
        }).eq("id", report_id).execute()
    except Exception as e:
        print(f"Failed to update damage_reports with AI metadata & photo evidence: {e}")

    try:
        result = supabase.table("report_photos").insert(row).execute()
        return {"photo": result.data[0], "ai_metadata": {"damage_type": ai_damage, "severity": ai_sev}}
    except Exception as e:
        print(f"Failed to insert into report_photos (table might be missing): {e}")
        return {"photo": {"report_id": report_id, "photo_url": public_url}, "ai_metadata": {"damage_type": ai_damage, "severity": ai_sev}}

@router.patch("/{report_id}/status")
def update_status(report_id: str, status: str, note: str = "", assigned_engineer: str = "", engineer_notes: str = ""):
    update_payload = {"status": status}
    if assigned_engineer:
        update_payload["assigned_engineer"] = assigned_engineer
    if engineer_notes:
        update_payload["engineer_notes"] = engineer_notes

    if not supabase:
        if assigned_engineer:
            send_engineer_task_assignment_email(assigned_engineer, report_id[:8].upper(), "Road Damage Task", "General Maintenance", note)
        return {"report_id": report_id, "status": status, "note": note, "assigned_engineer": assigned_engineer, "engineer_notes": engineer_notes}

    try:
        supabase.table("damage_reports").update(update_payload).eq("id", report_id).execute()
    except Exception as e:
        print(f"Failed to update damage_reports status/assignment: {e}")
    
    try:
        hist_title = f"{status}"
        hist_desc = note or (f"Assigned to {assigned_engineer}" if assigned_engineer else "Status updated.")
        supabase.table("report_status_history").insert({"report_id": report_id, "title": hist_title, "description": hist_desc}).execute()
    except Exception as e:
        print(f"Failed to insert into report_status_history (table might be missing): {e}")
        
    # Trigger Notifications
    send_status_update_email(
        to_email="citizen@demo.com",
        report_id=report_id[:8].upper(),
        new_status=status,
        note=note or (f"Assigned to {assigned_engineer}" if assigned_engineer else "")
    )

    if assigned_engineer:
        send_engineer_task_assignment_email(
            engineer_name=assigned_engineer,
            report_id=report_id[:8].upper(),
            title="Assigned Road Damage Incident",
            category="Infrastructure Repair",
            note=note
        )
        
    return {"report_id": report_id, "status": status, "assigned_engineer": assigned_engineer, "engineer_notes": engineer_notes}
