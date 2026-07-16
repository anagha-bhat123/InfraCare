# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from app.database import supabase
from pydantic import BaseModel
from app.dependencies import get_current_user, RoleChecker

router = APIRouter(prefix="/inspections", tags=["inspections"])

class InspectionSubmit(BaseModel):
    severity: str
    notes: str
    signature: str

@router.get("")
def get_inspections(user: dict = Depends(RoleChecker(["admin", "engineer"]))):
    if not supabase:
        return {"inspections": []}
    result = supabase.table("inspections").select("*").order("created_at", desc=True).execute()
    return {"inspections": result.data}

@router.post("/{inspection_id}/submit")
def submit_inspection(inspection_id: str, data: InspectionSubmit, user: dict = Depends(RoleChecker(["admin", "engineer"]))):
    if not supabase:
        return {"inspection_id": inspection_id, "status": "Completed"}
    
    # Update the inspection record
    result = supabase.table("inspections").update({
        "status": "Completed",
        "verified_severity": data.severity,
        "inspector_notes": data.notes,
        "digital_signature": data.signature
    }).eq("id", inspection_id).execute()
    
    return {"inspection": result.data[0] if result.data else None}
