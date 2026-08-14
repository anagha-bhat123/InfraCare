from typing import Optional
from pydantic import BaseModel, Field

class DamageReport(BaseModel):
    id: Optional[str] = None
    tracking_id: Optional[str] = None
    title: str
    category: Optional[str] = None
    urgency: str = "Normal"
    priority: str = "Medium"
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    status: str = "Pending"
    assigned_engineer: Optional[str] = None
    engineer_notes: Optional[str] = None
    evidence: Optional[str] = None
    ai_damage_type: Optional[str] = None
    ai_severity: Optional[str] = None
    ai_verified: Optional[bool] = False
    assigned_department: Optional[str] = None
    site_visit_crew: Optional[str] = None
    site_visit_notes: Optional[str] = None
    estimated_budget: Optional[float] = None
    approved_budget: Optional[float] = None
    timeline_days: Optional[int] = None
    target_completion_date: Optional[str] = None
    repaired_photo_url: Optional[str] = None
    delay_discount_applied: Optional[bool] = False
    final_bill_amount: Optional[float] = None
