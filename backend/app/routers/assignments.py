# pyrefly: ignore [missing-import]
from fastapi import APIRouter
from app.database import supabase

router = APIRouter(prefix="/assignments", tags=["assignments"])

@router.post("/{report_id}/dispatch")
def dispatch(report_id: str, engineer_id: str):
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
