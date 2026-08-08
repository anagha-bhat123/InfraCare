from datetime import datetime
import random
import string
from typing import Optional
import math
from fastapi import APIRouter, Form, UploadFile, File, Query
from app.database import supabase, create_client
from app.schemas.report import DamageReport
from app.utils.email import send_status_update_email, send_new_report_admin_notification, send_engineer_task_assignment_email
from app.config import settings

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("")
def list_reports(page: Optional[int] = Query(None, ge=1), limit: Optional[int] = Query(None, ge=1, le=100)):
    if not supabase:
        return {"reports": []}
    
    if page is not None and limit is not None:
        start = (page - 1) * limit
        end = page * limit - 1
        result = supabase.table("damage_reports").select("*", count="exact").order("created_at", desc=True).range(start, end).execute()
        total = result.count if result.count is not None else len(result.data or [])
        total_pages = math.ceil(total / limit) if limit > 0 else 1
        return {
            "reports": result.data,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
    
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
    
    # Send Notification Alert to Admin & Citizen
    try:
        send_new_report_admin_notification(row)
    except Exception as e:
        print(f"Admin email alert skipped: {e}")
    create_notification_record(
        report_id=tracking_id,
        notif_type="NEW_REPORT",
        title="New Infrastructure Report",
        message=f"New report filed: '{report.title or report.category}' in Ward/Zone.",
        role="admin"
    )

    if not local_supabase:
        return {"report": {**row, "id": getattr(report, "id", tracking_id), "created_at": datetime.utcnow().isoformat()}}
    
    # Module 5: Duplicate Complaint Detection
    try:
        recent = local_supabase.table("damage_reports").select("latitude, longitude").eq("category", report.category).eq("status", "Pending").execute()
        for rec in recent.data:
            lat = rec.get("latitude") or 0.0
            lng = rec.get("longitude") or 0.0
            if abs(lat - report.latitude) < 0.0005 and abs(lng - report.longitude) < 0.0005:
                row["status"] = "Duplicate"
                row["priority"] = "Low"
                break
    except Exception as e:
        print(f"Duplicate detection failed: {e}")
        
    try:
        created = local_supabase.table("damage_reports").insert(row).execute()
        return {"report": created.data[0]}
    except Exception as e:
        print(f"Error inserting report with new columns: {e}")
        try:
            fallback_row = {k:v for k,v in row.items() if k not in ["tracking_id", "priority", "assigned_engineer", "engineer_notes"]}
            created = local_supabase.table("damage_reports").insert(fallback_row).execute()
            result = created.data[0]
            result["tracking_id"] = tracking_id
            result["priority"] = report.priority
            result["assigned_engineer"] = report.assigned_engineer
            result["engineer_notes"] = report.engineer_notes
            return {"report": result}
        except Exception as ex:
            print(f"Fallback insert also failed: {ex}")
            return {"report": {**row, "id": tracking_id, "created_at": datetime.utcnow().isoformat()}}

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

IN_MEMORY_NOTIFICATIONS = []

def create_notification_record(
    report_id: str,
    notif_type: str,
    title: str,
    message: str,
    user_id: Optional[str] = None,
    role: Optional[str] = None,
    engineer_name: Optional[str] = None
):
    notif_data = {
        "id": f"notif-{int(datetime.utcnow().timestamp()*1000)}-{random.randint(1000, 9999)}",
        "user_id": user_id,
        "role": role,
        "engineer_name": engineer_name,
        "report_id": report_id,
        "type": notif_type,
        "title": title,
        "message": message,
        "read": False,
        "created_at": datetime.utcnow().isoformat()
    }
    
    print(f"[NOTIFICATION LOG] Created notification: type={notif_type}, target_role={role}, target_engineer={engineer_name}, report_id={report_id}", flush=True)
    
    IN_MEMORY_NOTIFICATIONS.insert(0, notif_data)
    
    if supabase:
        try:
            db_row = {
                "user_id": user_id,
                "role": role,
                "engineer_name": engineer_name,
                "report_id": report_id,
                "type": notif_type,
                "title": title,
                "message": message,
                "read": False
            }
            res = supabase.table("notifications").insert(db_row).execute()
            if res.data:
                print(f"[NOTIFICATION LOG] Saved notification to DB: ID {res.data[0].get('id')}", flush=True)
                return res.data[0]
        except Exception as e:
            print(f"[NOTIFICATION LOG] DB notification insert skipped (using in-memory store): {e}", flush=True)
            
    return notif_data

@router.get("/notifications")
def list_notifications(role: Optional[str] = None, engineer_name: Optional[str] = None, user_id: Optional[str] = None):
    db_notifs = []
    if supabase:
        try:
            query = supabase.table("notifications").select("*").order("created_at", desc=True)
            if engineer_name:
                query = query.ilike("engineer_name", f"%{engineer_name}%")
            elif role:
                query = query.eq("role", role)
            elif user_id:
                query = query.eq("user_id", user_id)
            res = query.execute()
            db_notifs = res.data or []
        except Exception as e:
            print(f"[NOTIFICATION LOG] DB fetch notifications error: {e}", flush=True)
            
    # Combine DB and in-memory notifications
    all_notifs = list(db_notifs)
    for mem in IN_MEMORY_NOTIFICATIONS:
        if not any(n.get("id") == mem.get("id") for n in all_notifs):
            # Check matching filters
            match = True
            if engineer_name:
                eng_target = (mem.get("engineer_name") or "").lower()
                req_eng = engineer_name.lower()
                match = req_eng in eng_target or eng_target in req_eng or mem.get("role") == "engineer"
            elif role:
                match = mem.get("role") == role
            elif user_id:
                match = mem.get("user_id") == user_id
            if match:
                all_notifs.append(mem)
                
    # Sort descending by created_at
    all_notifs.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"notifications": all_notifs}

@router.patch("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str):
    for mem in IN_MEMORY_NOTIFICATIONS:
        if str(mem.get("id")) == str(notif_id):
            mem["read"] = True
            
    if supabase:
        try:
            supabase.table("notifications").update({"read": True}).eq("id", notif_id).execute()
        except Exception as e:
            print(f"[NOTIFICATION LOG] DB mark read failed: {e}", flush=True)
            
    return {"status": "success", "id": notif_id}

@router.patch("/{report_id}/status")
def update_status(report_id: str, status: str, note: str = "", assigned_engineer: str = "", engineer_notes: str = ""):
    update_payload = {"status": status}
    if assigned_engineer:
        update_payload["assigned_engineer"] = assigned_engineer
    if engineer_notes:
        update_payload["engineer_notes"] = engineer_notes

    # 1. Update Database
    if supabase:
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

    # 2. Notification Triggers
    
    # A) Assignment -> Engineer Alert
    if assigned_engineer or status in ["Crew Assigned", "Approved", "In Progress"]:
        eng_target = assigned_engineer or "Assigned Engineer"
        notif_msg = f"You have been assigned to complaint #{report_id[:8].upper()}. Status: {status}."
        if note:
            notif_msg += f" Note: {note}"
            
        create_notification_record(
            report_id=report_id,
            notif_type="NEW_ASSIGNMENT",
            title="New Complaint Assignment",
            message=notif_msg,
            role="engineer",
            engineer_name=eng_target
        )
        
        send_engineer_task_assignment_email(
            engineer_name=eng_target,
            report_id=report_id[:8].upper(),
            title="Assigned Road Damage Incident",
            category="Infrastructure Repair",
            note=note
        )

    # B) Completion -> Admin Alert
    if status in ["Pending Final Verification", "Completed by Engineer", "Completed"]:
        create_notification_record(
            report_id=report_id,
            notif_type="COMPLAINT_COMPLETED",
            title="Field Repair Completed",
            message=f"Field crew completed work on complaint #{report_id[:8].upper()}. Pending final admin verification.",
            role="admin"
        )

    # C) Resolution -> Citizen Confirmation
    if status == "Resolved":
        create_notification_record(
            report_id=report_id,
            notif_type="REPORT_RESOLVED",
            title="Complaint Verified & Resolved",
            message=f"Your complaint #{report_id[:8].upper()} has been inspected, verified, and officially resolved.",
            role="citizen"
        )
        
    # Email alert to citizen
    send_status_update_email(
        to_email="citizen@demo.com",
        report_id=report_id[:8].upper(),
        new_status=status,
        note=note or (f"Assigned to {assigned_engineer}" if assigned_engineer else "")
    )

    return {
        "report_id": report_id,
        "status": status,
        "assigned_engineer": assigned_engineer,
        "engineer_notes": engineer_notes,
        "notification_sent": True
    }
