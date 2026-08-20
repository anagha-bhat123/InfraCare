from datetime import datetime
import random
import string
from typing import Optional
import math
from fastapi import APIRouter, Form, UploadFile, File, Query, HTTPException
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
    
    cat = (report.category or "").strip().lower()
    dept = report.assigned_department or ("MESCOM - Streetlight & Grid" if "light" in cat or "electric" in cat or "lamp" in cat else "PWD - Road & Drainage")
    
    row = {
        "tracking_id": tracking_id,
        "title": report.title,
        "category": report.category,
        "urgency": report.urgency,
        "priority": report.priority,
        "description": report.description,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "status": report.status or "Submitted",
        "assigned_department": dept,
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
        message=f"New report filed: '{report.title or report.category}' assigned to {dept}.",
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
            # Only send valid 36-char UUID to Postgres FK column if present
            db_report_id = report_id if (report_id and len(str(report_id)) == 36) else None
            if db_report_id:
                db_row = {
                    "user_id": user_id,
                    "role": role,
                    "engineer_name": engineer_name,
                    "report_id": db_report_id,
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
            return {"notifications": res.data or []}
        except Exception as e:
            print(f"[NOTIFICATION LOG] DB fetch notifications error: {e}", flush=True)
            
    # Fallback to in-memory notifications if DB fails or is unconfigured
    all_notifs = []
    for mem in IN_MEMORY_NOTIFICATIONS:
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
def update_status(
    report_id: str,
    status: str,
    note: str = "",
    assigned_engineer: str = "",
    engineer_notes: str = "",
    assigned_department: str = "",
    site_visit_crew: str = "",
    estimated_budget: float = None,
    approved_budget: float = None,
    timeline_days: int = None,
    repaired_photo_url: str = ""
):
    try:
        is_uuid = len(str(report_id)) == 36 and "-" in str(report_id)

        # Enforce workflow rule: Cannot assign work execution crew until budget is approved by Approval Authority
        if status in ["Work In Progress", "In Progress", "Crew Assigned"]:
            if supabase:
                try:
                    query = supabase.table("damage_reports").select("*")
                    query = query.eq("id", report_id) if is_uuid else query.eq("tracking_id", report_id)
                    curr_res = query.execute()
                    if curr_res.data:
                        curr_item = curr_res.data[0]
                        curr_status = curr_item.get("status")
                        curr_budget = curr_item.get("approved_budget") or curr_item.get("estimated_budget")
                        if curr_status not in ["Budget Approved", "Work In Progress", "In Progress", "Resolved"] and not curr_budget and approved_budget is None:
                            raise HTTPException(
                                status_code=400,
                                detail="Cannot assign repair work crew until the Approval Authority has sanctioned the repair budget."
                            )
                except Exception as e:
                    if isinstance(e, HTTPException):
                        raise e
                    print(f"Supabase workflow check warning: {e}")

        update_payload = {"status": status}
        if assigned_engineer:
            update_payload["assigned_engineer"] = assigned_engineer
        if engineer_notes:
            update_payload["engineer_notes"] = engineer_notes
        if assigned_department:
            update_payload["assigned_department"] = assigned_department
        if site_visit_crew:
            update_payload["site_visit_crew"] = site_visit_crew
        if estimated_budget is not None:
            update_payload["estimated_budget"] = estimated_budget
        if approved_budget is not None:
            update_payload["approved_budget"] = approved_budget
        if timeline_days is not None:
            update_payload["timeline_days"] = timeline_days
        if repaired_photo_url:
            update_payload["repaired_photo_url"] = repaired_photo_url

        # 1. Update Database
        real_db_id = report_id
        if supabase:
            try:
                db_query = supabase.table("damage_reports").select("id")
                db_query = db_query.eq("id", report_id) if is_uuid else db_query.eq("tracking_id", report_id)
                db_lookup = db_query.execute()
                if db_lookup.data:
                    real_db_id = db_lookup.data[0]["id"]
            except Exception:
                pass

            try:
                up_query = supabase.table("damage_reports").update(update_payload)
                up_query = up_query.eq("id", report_id) if is_uuid else up_query.eq("tracking_id", report_id)
                up_query.execute()
            except Exception as e:
                print(f"Failed to update damage_reports status/assignment: {e}")
            
            try:
                hist_title = f"{status}"
                hist_desc = note or (f"Assigned to {assigned_engineer or site_visit_crew}" if (assigned_engineer or site_visit_crew) else "Status updated.")
                supabase.table("report_status_history").insert({"report_id": real_db_id, "title": hist_title, "description": hist_desc}).execute()
            except Exception as e:
                print(f"Failed to insert into report_status_history: {e}")

        # 2. Notification Triggers
        if assigned_engineer or site_visit_crew or status in ["Site Visit Assigned", "Crew Assigned", "Approved", "In Progress", "Work In Progress"]:
            eng_target = assigned_engineer or site_visit_crew or "Assigned Crew"
            notif_msg = f"You have been assigned to complaint #{report_id[:8].upper()}. Status: {status}."
            if note:
                notif_msg += f" Note: {note}"
                
            create_notification_record(
                report_id=real_db_id,
                notif_type="NEW_ASSIGNMENT",
                title="New Complaint Assignment",
                message=notif_msg,
                role="engineer",
                engineer_name=eng_target
            )

        if status in ["Pending Final Verification", "Completed by Engineer", "Completed", "Resolved"]:
            create_notification_record(
                report_id=real_db_id,
                notif_type="COMPLAINT_COMPLETED",
                title="Field Repair Completed",
                message=f"Field crew completed work on complaint #{report_id[:8].upper()}. Repaired photo uploaded.",
                role="admin"
            )
            create_notification_record(
                report_id=real_db_id,
                notif_type="REPORT_RESOLVED",
                title="Complaint Verified & Resolved",
                message=f"Your complaint #{report_id[:8].upper()} has been inspected, repaired, and resolved with photographic proof.",
                role="citizen"
            )

        return {
            "report_id": report_id,
            "status": status,
            "assigned_engineer": assigned_engineer,
            "engineer_notes": engineer_notes,
            "repaired_photo_url": repaired_photo_url,
            "notification_sent": True
        }
    except Exception as exc:
        import traceback
        print("EXCEPTION IN UPDATE_STATUS:", exc, flush=True)
        traceback.print_exc()
        if isinstance(exc, HTTPException):
            raise exc
        raise HTTPException(status_code=500, detail=str(exc))

from pydantic import BaseModel

class RepairCompletionSchema(BaseModel):
    repaired_photo_url: str
    engineer_notes: Optional[str] = ""
    is_delayed: Optional[bool] = False

@router.post("/{report_id}/complete-repair")
def complete_repair_with_photo(
    report_id: str,
    payload: Optional[RepairCompletionSchema] = None,
    repaired_photo_url: Optional[str] = Form(None),
    engineer_notes: Optional[str] = Form(""),
    is_delayed: Optional[bool] = Form(False)
):
    final_photo_url = (payload.repaired_photo_url if payload else repaired_photo_url) or ""
    final_notes = (payload.engineer_notes if payload else engineer_notes) or ""
    final_is_delayed = (payload.is_delayed if payload else is_delayed) or False

    is_uuid = len(str(report_id)) == 36 and "-" in str(report_id)
    existing = None
    real_db_id = report_id

    if supabase:
        try:
            q = supabase.table("damage_reports").select("*")
            q = q.eq("id", report_id) if is_uuid else q.eq("tracking_id", report_id)
            res = q.execute()
            if res.data:
                existing = res.data[0]
                real_db_id = existing.get("id", report_id)
        except Exception:
            pass

    approved_budget = (existing.get("approved_budget") if existing else None) or 50000.0
    delay_applied = final_is_delayed

    if delay_applied:
        final_bill = round(approved_budget * 0.9, 2) # 10% discount
    else:
        final_bill = approved_budget

    update_payload = {
        "status": "Resolved",
        "repaired_photo_url": final_photo_url,
        "engineer_notes": final_notes,
        "delay_discount_applied": delay_applied,
        "final_bill_amount": final_bill,
        "updated_at": datetime.utcnow().isoformat()
    }

    if supabase:
        try:
            up_q = supabase.table("damage_reports").update(update_payload)
            up_q = up_q.eq("id", report_id) if is_uuid else up_q.eq("tracking_id", report_id)
            up_q.execute()
        except Exception as e:
            print("Failed to update completed report in DB:", e)

    create_notification_record(
        report_id=real_db_id,
        notif_type="REPORT_RESOLVED",
        title="Repair Completed & Verified",
        message=f"Repair for complaint #{report_id[:8].upper()} completed! Repaired image uploaded. Final bill: Rs. {final_bill} ({'10% SLA Delay Discount Applied' if delay_applied else 'On-time'}).",
        role="citizen"
    )

    return {
        "report_id": report_id,
        "status": "Resolved",
        "repaired_photo_url": final_photo_url,
        "delay_discount_applied": delay_applied,
        "final_bill_amount": final_bill,
        "report": update_payload
    }
