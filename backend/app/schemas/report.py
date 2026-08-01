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
