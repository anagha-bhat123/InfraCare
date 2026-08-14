from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Any
from datetime import datetime, timedelta, timezone
import uuid

def _safe_float(val: Any) -> float:
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        try:
            return float(val)
        except ValueError:
            return 0.0
    return 0.0

from app.database import supabase
from app.schemas.budget import RepairBudgetCreate, RepairBudgetUpdateStatus

router = APIRouter(prefix="/budget-approvals", tags=["budget-approvals"])

# In-memory storage for demo fallback mode if Supabase database is not connected
MOCK_BUDGET_REQUESTS = [
    {
        "id": "req-101",
        "report_id": "rep-402",
        "work_order_id": "WO-2026-0891",
        "title": "Major Highway Asphalt Resurfacing & Drainage Repair",
        "department": "Roads & Bridges",
        "urgency": "Critical",
        "requested_by_name": "Er. Rajesh Sharma (Chief Highway Eng.)",
        "material_cost": 185000.0,
        "labor_cost": 65000.0,
        "equipment_cost": 45000.0,
        "contingency_cost": 25000.0,
        "total_estimated_cost": 320000.0,
        "status": "Pending",
        "approval_level": "Level 3 (> Rs. 2,50,000)",
        "approved_by": None,
        "decision_notes": "Awaiting Board / Financial Director approval due to threshold > Rs. 2.5L.",
        "cost_breakdown": [
            {"item": "Bituminous Concrete Grade II (80 Tons)", "quantity": "80 Tons", "unit_cost": 2100.0, "total": 168000.0},
            {"item": "Heavy Roller & Paver Hire (3 Days)", "quantity": "3 Days", "unit_cost": 15000.0, "total": 45000.0},
            {"item": "Skilled Asphalt Paving Crew (12 Workers)", "quantity": "40 Shifts", "unit_cost": 1625.0, "total": 65000.0},
            {"item": "Sub-surface Drainage Culvert Pipes", "quantity": "10 Units", "unit_cost": 1700.0, "total": 17000.0},
            {"item": "Safety Barriers & Signage Overhead", "quantity": "Flat", "unit_cost": 25000.0, "total": 25000.0}
        ],
        "created_at": "2026-08-10T14:30:00Z",
        "updated_at": "2026-08-10T14:30:00Z"
    },
    {
        "id": "req-102",
        "report_id": "rep-108",
        "work_order_id": "WO-2026-0744",
        "title": "Main Water Supply Pipeline Leakage Patch & Valve Replacement",
        "department": "Water & Sewerage",
        "urgency": "Urgent",
        "requested_by_name": "Er. Priya Nair (Senior Hydraulic Eng.)",
        "material_cost": 42000.0,
        "labor_cost": 28000.0,
        "equipment_cost": 18000.0,
        "contingency_cost": 8000.0,
        "total_estimated_cost": 96000.0,
        "status": "Pending",
        "approval_level": "Level 2 (Rs. 50k-Rs. 2.5L)",
        "approved_by": None,
        "decision_notes": None,
        "cost_breakdown": [
            {"item": "Ductile Iron Pipe Segment 300mm", "quantity": "4 Meters", "unit_cost": 6500.0, "total": 26000.0},
            {"item": "High Pressure Sluice Valve 12 Inch", "quantity": "1 Unit", "unit_cost": 16000.0, "total": 16000.0},
            {"item": "Excavator & Dewatering Pump", "quantity": "2 Days", "unit_cost": 9000.0, "total": 18000.0},
            {"item": "Plumbing & Welding Crew", "quantity": "14 Shifts", "unit_cost": 2000.0, "total": 28000.0},
            {"item": "Emergency Water Tanker Bypass Reserve", "quantity": "Flat", "unit_cost": 8000.0, "total": 8000.0}
        ],
        "created_at": "2026-08-11T08:15:00Z",
        "updated_at": "2026-08-11T08:15:00Z"
    },
    {
        "id": "req-103",
        "report_id": "rep-088",
        "work_order_id": "WO-2026-0612",
        "title": "Emergency High-Voltage Transformer Cable Isolation & Box Repair",
        "department": "Electrical Grid",
        "urgency": "Urgent",
        "requested_by_name": "Er. Vikram R. (Substation Supervisor)",
        "material_cost": 22000.0,
        "labor_cost": 12000.0,
        "equipment_cost": 8000.0,
        "contingency_cost": 3000.0,
        "total_estimated_cost": 45000.0,
        "status": "Approved",
        "approval_level": "Level 1 (< Rs. 50,000)",
        "approved_by": "Chief Admin (S. Verma)",
        "decision_notes": "Approved under Level 1 emergency delegation cap.",
        "cost_breakdown": [
            {"item": "Insulated High-Voltage Cable 33kV", "quantity": "15 Meters", "unit_cost": 1200.0, "total": 18000.0},
            {"item": "Transformer Distribution Bus Bar Junction", "quantity": "2 Units", "unit_cost": 2000.0, "total": 4000.0},
            {"item": "Bucket Truck & Lift Equipment", "quantity": "1 Day", "unit_cost": 8000.0, "total": 8000.0},
            {"item": "Electrical Line Technicians", "quantity": "6 Shifts", "unit_cost": 2000.0, "total": 12000.0},
            {"item": "Contingency & Safety Testing", "quantity": "Flat", "unit_cost": 3000.0, "total": 3000.0}
        ],
        "created_at": "2026-08-09T11:20:00Z",
        "updated_at": "2026-08-09T16:00:00Z"
    },
    {
        "id": "req-104",
        "report_id": "rep-055",
        "work_order_id": "WO-2026-0419",
        "title": "Bridge Footpath Concrete Slab Reconstruction & Barrier Refitting",
        "department": "Public Infrastructure",
        "urgency": "Normal",
        "requested_by_name": "Er. Amit Kumar (Civil Inspector)",
        "material_cost": 75000.0,
        "labor_cost": 45000.0,
        "equipment_cost": 25000.0,
        "contingency_cost": 15000.0,
        "total_estimated_cost": 160000.0,
        "status": "Revision Requested",
        "approval_level": "Level 2 (Rs. 50k-Rs. 2.5L)",
        "approved_by": "Budget Committee Chair",
        "decision_notes": "Please reduce heavy equipment rental quote and re-evaluate concrete volume.",
        "cost_breakdown": [
            {"item": "Pre-cast Reinforced Concrete Panels", "quantity": "12 Units", "unit_cost": 5000.0, "total": 60000.0},
            {"item": "Galvanized Steel Railings", "quantity": "15 Meters", "unit_cost": 1000.0, "total": 15000.0},
            {"item": "Hydraulic Crane (2 Days)", "quantity": "2 Days", "unit_cost": 12500.0, "total": 25000.0},
            {"item": "Masonry & Steel Workers", "quantity": "30 Shifts", "unit_cost": 1500.0, "total": 45000.0},
            {"item": "Contingency Reserve", "quantity": "Flat", "unit_cost": 15000.0, "total": 15000.0}
        ],
        "created_at": "2026-08-08T09:10:00Z",
        "updated_at": "2026-08-08T15:45:00Z"
    }
]

DEPARTMENT_ALLOCATIONS = {
    "Roads & Bridges": {"total_budget": 5000000.0, "used_budget": 2450000.0, "pending_approval": 320000.0},
    "Water & Sewerage": {"total_budget": 3500000.0, "used_budget": 1820000.0, "pending_approval": 96000.0},
    "Electrical Grid": {"total_budget": 2500000.0, "used_budget": 1100000.0, "pending_approval": 0.0},
    "Public Infrastructure": {"total_budget": 4000000.0, "used_budget": 1600000.0, "pending_approval": 160000.0}
}

def determine_approval_level(total_cost: float) -> str:
    if total_cost <= 50000.0:
        return "Level 1 (< Rs. 50,000)"
    elif total_cost <= 250000.0:
        return "Level 2 (Rs. 50k-Rs. 2.5L)"
    else:
        return "Level 3 (> Rs. 2,50,000)"

def get_timeline_days_for_urgency(urgency: str) -> int:
    u = (urgency or "").strip().lower()
    if u == "critical":
        return 3
    elif u in ["urgent", "high priority", "high"]:
        return 5
    else:
        return 7

@router.get("")
def list_budget_requests(
    status: Optional[str] = None,
    department: Optional[str] = None,
    urgency: Optional[str] = None,
    search: Optional[str] = None
):
    items = []
    if supabase:
        try:
            query = supabase.table("repair_budget_requests").select("*").order("created_at", desc=True)
            if status and isinstance(status, str):
                query = query.eq("status", status)
            if department and isinstance(department, str):
                query = query.eq("department", department)
            if urgency and isinstance(urgency, str):
                query = query.eq("urgency", urgency)
            res = query.execute()
            if res.data and len(res.data) > 0:
                items = res.data
        except Exception:
            items = []
    
    if not items:
        items = list(MOCK_BUDGET_REQUESTS)
        if status and isinstance(status, str):
            items = [x for x in items if str(x.get("status") or "").lower() == status.lower()]
        if department and isinstance(department, str):
            items = [x for x in items if str(x.get("department") or "").lower() == department.lower()]
        if urgency and isinstance(urgency, str):
            items = [x for x in items if str(x.get("urgency") or "").lower() == urgency.lower()]
        if search and isinstance(search, str):
            q = search.lower()
            items = [x for x in items if q in str(x.get("title") or "").lower() or q in str(x.get("work_order_id") or "").lower() or q in str(x.get("requested_by_name") or "").lower()]

    for item in items:
        if not item.get("timeline_days"):
            urgency_str = str(item.get("urgency") or "Normal")
            item["timeline_days"] = get_timeline_days_for_urgency(urgency_str)
        if not item.get("discount_rate"):
            item["discount_rate"] = 10.0

    return {"requests": items}

@router.post("")
def create_budget_request(payload: RepairBudgetCreate):
    total = payload.material_cost + payload.labor_cost + payload.equipment_cost + payload.contingency_cost
    approval_level = determine_approval_level(total)
    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()

    timeline_days = payload.timeline_days or get_timeline_days_for_urgency(payload.urgency or "Normal")
    target_date = (now_dt + timedelta(days=timeline_days)).isoformat()

    new_item = {
        "id": f"req-{uuid.uuid4().hex[:8]}",
        "report_id": payload.report_id,
        "work_order_id": payload.work_order_id,
        "title": payload.title,
        "department": payload.department,
        "urgency": payload.urgency,
        "requested_by_name": payload.requested_by_name,
        "material_cost": payload.material_cost,
        "labor_cost": payload.labor_cost,
        "equipment_cost": payload.equipment_cost,
        "contingency_cost": payload.contingency_cost,
        "total_estimated_cost": total,
        "status": "Pending",
        "approval_level": approval_level,
        "approved_by": None,
        "decision_notes": None,
        "timeline_days": timeline_days,
        "target_completion_date": target_date,
        "discount_rate": 10.0,
        "cost_breakdown": payload.cost_breakdown or [],
        "created_at": now_iso,
        "updated_at": now_iso
    }

    if supabase:
        try:
            res = supabase.table("repair_budget_requests").insert(new_item).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            print("Supabase insert error:", e)

    # Fallback in-memory insert
    MOCK_BUDGET_REQUESTS.insert(0, new_item)
    return new_item

@router.get("/metrics/summary")
def get_budget_metrics():
    requests = list_budget_requests().get("requests", [])
    
    total_requested = sum(_safe_float(r.get("total_estimated_cost")) for r in requests)
    approved_requests = [r for r in requests if str(r.get("status")).lower() == "approved"]
    pending_requests = [r for r in requests if str(r.get("status")).lower() == "pending"]
    rejected_requests = [r for r in requests if str(r.get("status")).lower() == "rejected"]
    revision_requests = [r for r in requests if str(r.get("status")).lower() == "revision requested"]

    total_approved_amount = sum(_safe_float(r.get("total_estimated_cost")) for r in approved_requests)
    total_pending_amount = sum(_safe_float(r.get("total_estimated_cost")) for r in pending_requests)

    return {
        "total_requests_count": len(requests),
        "total_requested_amount": total_requested,
        "approved_count": len(approved_requests),
        "total_approved_amount": total_approved_amount,
        "pending_count": len(pending_requests),
        "total_pending_amount": total_pending_amount,
        "rejected_count": len(rejected_requests),
        "revision_count": len(revision_requests),
        "departments": DEPARTMENT_ALLOCATIONS
    }

@router.get("/{request_id}")
def get_budget_request_detail(request_id: str):
    if supabase:
        try:
            res = supabase.table("repair_budget_requests").select("*").eq("id", request_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception:
            pass
            
    for req in MOCK_BUDGET_REQUESTS:
        if req["id"] == request_id:
            return req
            
    raise HTTPException(status_code=404, detail="Budget approval request not found")

@router.put("/{request_id}/status")
def update_budget_request_status(request_id: str, payload: RepairBudgetUpdateStatus):
    now_dt = datetime.now(timezone.utc)
    now_iso = now_dt.isoformat()
    
    existing = None
    if supabase:
        try:
            res_ex = supabase.table("repair_budget_requests").select("*").eq("id", request_id).execute()
            if res_ex.data:
                existing = res_ex.data[0]
        except Exception:
            pass

    if not existing:
        for r in MOCK_BUDGET_REQUESTS:
            if r["id"] == request_id:
                existing = r
                break

    urgency_val = str(existing.get("urgency") or "Normal") if existing else "Normal"
    timeline_days = payload.timeline_days or get_timeline_days_for_urgency(urgency_val)
    target_date = payload.target_completion_date or (now_dt + timedelta(days=timeline_days)).isoformat() + "Z"

    data_to_update = {
        "status": payload.status,
        "approved_by": payload.approved_by,
        "decision_notes": payload.decision_notes,
        "timeline_days": timeline_days,
        "target_completion_date": target_date,
        "updated_at": now_iso
    }

    # In-memory update fallback / sync
    found_item = None
    for req in MOCK_BUDGET_REQUESTS:
        if req["id"] == request_id or (req.get("report_id") and req.get("report_id") == request_id):
            req["status"] = payload.status
            req["approved_by"] = payload.approved_by or ""
            req["decision_notes"] = payload.decision_notes or ""
            req["timeline_days"] = timeline_days
            req["target_completion_date"] = target_date
            req["updated_at"] = now_iso
            found_item = req
            break

    if supabase:
        try:
            res = supabase.table("repair_budget_requests").update(data_to_update).eq("id", request_id).execute()
            if res.data and len(res.data) > 0:
                result = res.data[0]
                rep_id = result.get("report_id")
                if rep_id and payload.status in ["Approved", "Budget Approved"]:
                    try:
                        is_u = len(str(rep_id)) == 36 and "-" in str(rep_id)
                        up_rep = supabase.table("damage_reports").update({
                            "status": "Budget Approved",
                            "approved_budget": result.get("total_estimated_cost"),
                            "timeline_days": timeline_days,
                            "target_completion_date": target_date
                        })
                        up_rep = up_rep.eq("id", rep_id) if is_u else up_rep.eq("tracking_id", rep_id)
                        up_rep.execute()
                    except Exception as e_rep:
                        print("Failed to sync report status on budget approval:", e_rep)
                return result
        except Exception as e:
            print("Supabase update error:", e)

    if found_item:
        return found_item

    return {
        "id": request_id,
        "status": payload.status,
        "approved_by": payload.approved_by or "",
        "decision_notes": payload.decision_notes or "",
        "timeline_days": timeline_days,
        "target_completion_date": target_date,
        "updated_at": now_iso
    }
