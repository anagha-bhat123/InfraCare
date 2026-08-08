# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from app.database import supabase
from app.routers.reports import create_notification_record

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.post("/{report_id}/dispatch")
def dispatch(report_id: str, engineer_id: str):
    create_notification_record(
        report_id=report_id,
        notif_type="NEW_ASSIGNMENT",
        title="Dispatched Complaint Assignment",
        message=f"You have been dispatched to complaint #{report_id[:8].upper()}.",
        role="engineer",
        engineer_name=engineer_id
    )
    if not supabase:
        return {"report_id": report_id, "engineer_id": engineer_id, "status": "Dispatched"}
    result = supabase.table("maintenance_assignments").insert({
        "report_id": report_id,
        "engineer_id": engineer_id,
        "status": "Dispatched",
    }).execute()
    return {"assignment": result.data[0]}

@router.get("")
def get_assignments():
    if not supabase:
        return {"assignments": []}
    result = supabase.table("maintenance_assignments").select("*").order("created_at", desc=True).execute()
    return {"assignments": result.data}
