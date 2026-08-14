from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class CostItem(BaseModel):
    item: str
    quantity: str
    unit_cost: float
    total: float

class RepairBudgetCreate(BaseModel):
    report_id: Optional[str] = None
    work_order_id: str
    title: str
    department: str = "PWD - Road & Drainage"
    urgency: str = "Normal"
    requested_by_name: str
    material_cost: float = 0.0
    labor_cost: float = 0.0
    equipment_cost: float = 0.0
    contingency_cost: float = 0.0
    timeline_days: Optional[int] = None
    cost_breakdown: Optional[List[Dict[str, Any]]] = []

class RepairBudgetUpdateStatus(BaseModel):
    status: str # "Approved", "Rejected", "Revision Requested"
    approved_by: Optional[str] = None
    decision_notes: Optional[str] = None
    timeline_days: Optional[int] = None
    target_completion_date: Optional[str] = None

class RepairBudgetResponse(BaseModel):
    id: str
    report_id: Optional[str] = None
    work_order_id: str
    title: str
    department: str
    urgency: str
    requested_by_name: str
    material_cost: float
    labor_cost: float
    equipment_cost: float
    contingency_cost: float
    total_estimated_cost: float
    status: str
    approval_level: str
    approved_by: Optional[str] = None
    decision_notes: Optional[str] = None
    timeline_days: Optional[int] = 7
    target_completion_date: Optional[str] = None
    discount_rate: Optional[float] = 10.0
    cost_breakdown: Optional[List[Dict[str, Any]]] = []
    created_at: str
    updated_at: str
