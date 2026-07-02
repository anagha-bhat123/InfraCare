from typing import Optional
from pydantic import BaseModel, Field

class DamageReport(BaseModel):
    id: Optional[str] = None
    title: str
    category: Optional[str] = None
    urgency: str = "Normal"
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    status: str = "Pending"
    evidence: Optional[str] = None
