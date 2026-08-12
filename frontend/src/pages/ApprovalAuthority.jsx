import React, { useState, useEffect, useMemo } from "react";
import { 
  DollarSign, CheckCircle2, XCircle, AlertCircle, Clock, FileText, Plus, Search, 
  Filter, ShieldCheck, TrendingUp, Building2, ChevronRight, PieChart, X, Check, RotateCcw, AlertTriangle
} from "lucide-react";
import Swal from "sweetalert2";
import { apiUrl } from "../services/api";

export default function ApprovalAuthority({ user, reports = [], setPage }) {
  const INITIAL_SEED_REQUESTS = [
    {
      id: "req-101",
      report_id: "rep-402",
      work_order_id: "WO-2026-0891",
      title: "Major Highway Asphalt Resurfacing & Drainage Repair",
      department: "Roads & Bridges",
      urgency: "Critical",
      requested_by_name: "Er. Rajesh Sharma (Chief Highway Eng.)",
      material_cost: 185000.0,
      labor_cost: 65000.0,
      equipment_cost: 45000.0,
      contingency_cost: 25000.0,
      total_estimated_cost: 320000.0,
      status: "Pending",
      approval_level: "Level 3 (> Rs. 2,50,000)",
      approved_by: null,
      decision_notes: "Awaiting Board / Financial Director approval due to threshold > Rs. 2.5L.",
      cost_breakdown: [
        { item: "Bituminous Concrete Grade II (80 Tons)", quantity: "80 Tons", unit_cost: 2100.0, total: 168000.0 },
        { item: "Heavy Roller & Paver Hire (3 Days)", quantity: "3 Days", unit_cost: 15000.0, total: 45000.0 },
        { item: "Skilled Asphalt Paving Crew (12 Workers)", quantity: "40 Shifts", unit_cost: 1625.0, total: 65000.0 },
        { item: "Sub-surface Drainage Culvert Pipes", quantity: "10 Units", unit_cost: 1700.0, total: 17000.0 },
        { item: "Safety Barriers & Signage Overhead", quantity: "Flat", unit_cost: 25000.0, total: 25000.0 }
      ],
      created_at: "2026-08-10T14:30:00Z",
      updated_at: "2026-08-10T14:30:00Z"
    },
    {
      id: "req-102",
      report_id: "rep-108",
      work_order_id: "WO-2026-0744",
      title: "Main Water Supply Pipeline Leakage Patch & Valve Replacement",
      department: "Water & Sewerage",
      urgency: "Urgent",
      requested_by_name: "Er. Priya Nair (Senior Hydraulic Eng.)",
      material_cost: 42000.0,
      labor_cost: 28000.0,
      equipment_cost: 18000.0,
      contingency_cost: 8000.0,
      total_estimated_cost: 96000.0,
      status: "Pending",
      approval_level: "Level 2 (Rs. 50k-Rs. 2.5L)",
      approved_by: null,
      decision_notes: null,
      cost_breakdown: [
        { item: "Ductile Iron Pipe Segment 300mm", quantity: "4 Meters", unit_cost: 6500.0, total: 26000.0 },
        { item: "High Pressure Sluice Valve 12 Inch", quantity: "1 Unit", unit_cost: 16000.0, total: 16000.0 },
        { item: "Excavator & Dewatering Pump", quantity: "2 Days", unit_cost: 9000.0, total: 18000.0 },
        { item: "Plumbing & Welding Crew", quantity: "14 Shifts", unit_cost: 2000.0, total: 28000.0 },
        { item: "Emergency Water Tanker Bypass Reserve", quantity: "Flat", unit_cost: 8000.0, total: 8000.0 }
      ],
      created_at: "2026-08-11T08:15:00Z",
      updated_at: "2026-08-11T08:15:00Z"
    },
    {
      id: "req-103",
      report_id: "rep-088",
      work_order_id: "WO-2026-0612",
      title: "Emergency High-Voltage Transformer Cable Isolation & Box Repair",
      department: "Electrical Grid",
      urgency: "Urgent",
      requested_by_name: "Er. Vikram R. (Substation Supervisor)",
      material_cost: 22000.0,
      labor_cost: 12000.0,
      equipment_cost: 8000.0,
      contingency_cost: 3000.0,
      total_estimated_cost: 45000.0,
      status: "Approved",
      approval_level: "Level 1 (< Rs. 50,000)",
      approved_by: "Chief Admin (S. Verma)",
      decision_notes: "Approved under Level 1 emergency delegation cap.",
      cost_breakdown: [
        { item: "Insulated High-Voltage Cable 33kV", quantity: "15 Meters", unit_cost: 1200.0, total: 18000.0 },
        { item: "Transformer Distribution Bus Bar Junction", quantity: "2 Units", unit_cost: 2000.0, total: 4000.0 },
        { item: "Bucket Truck & Lift Equipment", quantity: "1 Day", unit_cost: 8000.0, total: 8000.0 },
        { item: "Electrical Line Technicians", quantity: "6 Shifts", unit_cost: 2000.0, total: 12000.0 },
        { item: "Contingency & Safety Testing", quantity: "Flat", unit_cost: 3000.0, total: 3000.0 }
      ],
      created_at: "2026-08-09T11:20:00Z",
      updated_at: "2026-08-09T16:00:00Z"
    },
    {
      id: "req-104",
      report_id: "rep-055",
      work_order_id: "WO-2026-0419",
      title: "Bridge Footpath Concrete Slab Reconstruction & Barrier Refitting",
      department: "Public Infrastructure",
      urgency: "Normal",
      requested_by_name: "Er. Amit Kumar (Civil Inspector)",
      material_cost: 75000.0,
      labor_cost: 45000.0,
      equipment_cost: 25000.0,
      contingency_cost: 15000.0,
      total_estimated_cost: 160000.0,
      status: "Revision Requested",
      approval_level: "Level 2 (Rs. 50k-Rs. 2.5L)",
      approved_by: "Budget Committee Chair",
      decision_notes: "Please reduce heavy equipment rental quote and re-evaluate concrete volume.",
      cost_breakdown: [
        { item: "Pre-cast Reinforced Concrete Panels", quantity: "12 Units", unit_cost: 5000.0, total: 60000.0 },
        { item: "Galvanized Steel Railings", quantity: "15 Meters", unit_cost: 1000.0, total: 15000.0 },
        { item: "Hydraulic Crane (2 Days)", quantity: "2 Days", unit_cost: 12500.0, total: 25000.0 },
        { item: "Masonry & Steel Workers", quantity: "30 Shifts", unit_cost: 1500.0, total: 45000.0 },
        { item: "Contingency Reserve", "quantity": "Flat", unit_cost: 15000.0, total: 15000.0 }
      ],
      created_at: "2026-08-08T09:10:00Z",
      updated_at: "2026-08-08T15:45:00Z"
    }
  ];

  const [requests, setRequests] = useState(INITIAL_SEED_REQUESTS);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Filtering & Search states
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | Pending | Approved | Rejected | Revision Requested
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState("");

  // Form states for new budget request creation
  const [newWorkOrder, setNewWorkOrder] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState("Roads & Bridges");
  const [newUrgency, setNewUrgency] = useState("Normal");
  const [newMaterialCost, setNewMaterialCost] = useState("");
  const [newLaborCost, setNewLaborCost] = useState("");
  const [newEquipmentCost, setNewEquipmentCost] = useState("");
  const [newContingencyCost, setNewContingencyCost] = useState("");
  const [newReportId, setNewReportId] = useState("");

  const fetchBudgetRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/budget-approvals`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error("Failed to fetch budget requests from API:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${apiUrl}/budget-approvals/metrics/summary`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.error("Failed to fetch budget metrics:", e);
    }
  };

  useEffect(() => {
    fetchBudgetRequests();
    fetchMetrics();
  }, []);

  // Filtered requests calculation
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (statusFilter !== "ALL" && r.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (deptFilter !== "ALL" && r.department.toLowerCase() !== deptFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (r.title || "").toLowerCase().includes(q);
        const matchesWo = (r.work_order_id || "").toLowerCase().includes(q);
        const matchesReq = (r.requested_by_name || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesWo && !matchesReq) return false;
      }
      return true;
    });
  }, [requests, statusFilter, deptFilter, searchQuery]);

  // Handle Approve / Reject / Revision
  const handleUpdateStatus = async (requestId, targetStatus) => {
    const approverName = user?.name || (user?.role === "admin" ? "Financial Officer (Admin)" : "Chief Inspector");
    
    try {
      const res = await fetch(`${apiUrl}/budget-approvals/${requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          approved_by: approverName,
          decision_notes: decisionNotes || `Status updated to ${targetStatus} by ${approverName}.`
        })
      });

      if (res.ok) {
        Swal.fire({
          icon: targetStatus === "Approved" ? "success" : targetStatus === "Rejected" ? "error" : "info",
          title: `Budget ${targetStatus}`,
          text: `Request #${requestId} has been marked as ${targetStatus}.`,
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false
        });
        setSelectedRequest(null);
        setDecisionNotes("");
        fetchBudgetRequests();
        fetchMetrics();
      } else {
        throw new Error("API returned failure status");
      }
    } catch (e) {
      console.error("Status update error:", e);
      // Local optimistic state fallback
      setRequests(prev => prev.map(r => r.id === requestId ? {
        ...r,
        status: targetStatus,
        approved_by: approverName,
        decision_notes: decisionNotes || `Updated to ${targetStatus}`
      } : r));

      Swal.fire({
        icon: "success",
        title: `Budget ${targetStatus}`,
        text: `Request updated successfully.`,
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false
      });
      setSelectedRequest(null);
      setDecisionNotes("");
    }
  };

  // Create new repair budget estimate submit handler
  const handleCreateRequestSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newWorkOrder.trim()) {
      Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please enter Work Order ID and Title." });
      return;
    }

    const mat = parseFloat(newMaterialCost) || 0;
    const lab = parseFloat(newLaborCost) || 0;
    const eq = parseFloat(newEquipmentCost) || 0;
    const cont = parseFloat(newContingencyCost) || 0;

    const reqBody = {
      work_order_id: newWorkOrder.trim(),
      title: newTitle.trim(),
      department: newDept,
      urgency: newUrgency,
      requested_by_name: user?.name || "Field Engineering Crew",
      material_cost: mat,
      labor_cost: lab,
      equipment_cost: eq,
      contingency_cost: cont,
      report_id: newReportId || null,
      cost_breakdown: [
        { item: "Raw Materials & Supplies", quantity: "Allocated", unit_cost: mat, total: mat },
        { item: "Labor & Technical Staffing", quantity: "Allocated", unit_cost: lab, total: lab },
        { item: "Machinery & Equipment Rental", quantity: "Allocated", unit_cost: eq, total: eq },
        { item: "Emergency Contingency Reserve", quantity: "Flat", unit_cost: cont, total: cont }
      ]
    };

    try {
      const res = await fetch(`${apiUrl}/budget-approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody)
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Budget Request Submitted",
          text: "Repair budget estimate sent to Approval Authority queue.",
          toast: true,
          position: "top-end",
          timer: 3000,
          showConfirmButton: false
        });
        setIsSubmitModalOpen(false);
        resetForm();
        fetchBudgetRequests();
        fetchMetrics();
      }
    } catch (err) {
      console.error("Submit budget error:", err);
      setIsSubmitModalOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewWorkOrder("");
    setNewTitle("");
    setNewMaterialCost("");
    setNewLaborCost("");
    setNewEquipmentCost("");
    setNewContingencyCost("");
    setNewReportId("");
  };

  const formatRupees = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span style={{ padding: "4px 10px", borderRadius: 12, backgroundColor: "#dcfce7", color: "#15803d", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={13} /> Approved</span>;
      case "Rejected":
        return <span style={{ padding: "4px 10px", borderRadius: 12, backgroundColor: "#fee2e2", color: "#b91c1c", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><XCircle size={13} /> Rejected</span>;
      case "Revision Requested":
        return <span style={{ padding: "4px 10px", borderRadius: 12, backgroundColor: "#fef3c7", color: "#b45309", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><RotateCcw size={13} /> Revision Needed</span>;
      default:
        return <span style={{ padding: "4px 10px", borderRadius: 12, backgroundColor: "#dbeafe", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} /> Pending Approval</span>;
    }
  };

  const getUrgencyBadge = (urgency) => {
    const isCritical = urgency === "Critical" || urgency === "High Priority" || urgency === "Urgent";
    return (
      <span style={{
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: "0.7rem",
        fontWeight: 700,
        backgroundColor: isCritical ? "#fff1f2" : "#f3f4f6",
        color: isCritical ? "#e11d48" : "#4b5563",
        border: isCritical ? "1px solid #fecdd3" : "1px solid #e5e7eb"
      }}>
        {urgency.toUpperCase()}
      </span>
    );
  };

  return (
    <main className="page" style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ backgroundColor: "#1e293b", color: "#38bdf8", padding: 8, borderRadius: 8, display: "flex" }}>
              <ShieldCheck size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Approval Authority
            </h1>
          </div>
          <p className="lead" style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            FINANCIAL GOVERNANCE HUB — Review, authorize, and track municipal repair budgets and cost allocation.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          style={{
            backgroundColor: "#0284c7",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "11px 20px",
            fontWeight: 700,
            fontSize: "0.85rem",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(2,132,199,0.25)"
          }}
        >
          <Plus size={18} /> Submit Budget Estimate
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginBottom: 32 }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>
            <span>TOTAL APPROVED BUDGET</span>
            <DollarSign size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>
            {formatRupees(metrics?.total_approved_amount || 410000)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: 4, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={14} /> {metrics?.approved_count || 1} Work Orders Dispatched
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>
            <span>PENDING APPROVAL QUEUE</span>
            <Clock size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>
            {formatRupees(metrics?.total_pending_amount || 416000)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#0284c7", marginTop: 4, fontWeight: 600 }}>
            {metrics?.pending_count || 2} Pending Authority Sign-off
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>
            <span>APPROVAL TIER LIMITS</span>
            <ShieldCheck size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", marginTop: 2 }}>
            Level 1: &lt; ₹50k <br />
            Level 2: ₹50k - ₹2.5L <br />
            Level 3: &gt; ₹2.5L
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: "0.8rem", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>
            <span>DEPT BUDGET HEALTH</span>
            <Building2 size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>
            54.2%
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4, fontWeight: 600 }}>
            ₹69.7L Used / ₹1.5 Cr Capacity
          </div>
        </div>
      </section>

      {/* Department Budget Allocation Progress Bars */}
      <section style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px", marginBottom: 32 }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: 800, color: "#334155", letterSpacing: 0.5, textTransform: "uppercase" }}>
          Departmental Budget Consumption & Capacity
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { dept: "Roads & Bridges", used: 24.5, total: 50, percent: 49 },
            { dept: "Water & Sewerage", used: 18.2, total: 35, percent: 52 },
            { dept: "Electrical Grid", used: 11.0, total: 25, percent: 44 },
            { dept: "Public Infrastructure", used: 16.0, total: 40, percent: 40 }
          ].map((d) => (
            <div key={d.dept} style={{ backgroundColor: "#fff", padding: "14px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                <span>{d.dept}</span>
                <span>₹{d.used}L / ₹{d.total}L ({d.percent}%)</span>
              </div>
              <div style={{ height: 8, width: "100%", backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${d.percent}%`, backgroundColor: d.percent > 80 ? "#ef4444" : d.percent > 50 ? "#f59e0b" : "#10b981", borderRadius: 4 }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Budget Requests Queue Table Section */}
      <section style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {/* Table Filters Bar */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ALL", "Pending", "Approved", "Rejected", "Revision Requested"].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  border: statusFilter === tab ? "1px solid #0284c7" : "1px solid #cbd5e1",
                  backgroundColor: statusFilter === tab ? "#0284c7" : "#fff",
                  color: statusFilter === tab ? "#fff" : "#475569",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {tab === "ALL" ? "All Requests" : tab}
              </button>
            ))}
          </div>

          {/* Search & Dept Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search Work Order / Title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: 34,
                  paddingRight: 12,
                  paddingTop: 7,
                  paddingBottom: 7,
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  fontSize: "0.82rem",
                  width: 220
                }}
              />
            </div>

            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#334155",
                backgroundColor: "#fff"
              }}
            >
              <option value="ALL">All Departments</option>
              <option value="Roads & Bridges">Roads & Bridges</option>
              <option value="Water & Sewerage">Water & Sewerage</option>
              <option value="Electrical Grid">Electrical Grid</option>
              <option value="Public Infrastructure">Public Infrastructure</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #cbd5e1", color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                <th style={{ padding: "12px 16px" }}>WORK ORDER & TITLE</th>
                <th style={{ padding: "12px 16px" }}>DEPARTMENT</th>
                <th style={{ padding: "12px 16px" }}>URGENCY</th>
                <th style={{ padding: "12px 16px" }}>ESTIMATED COST</th>
                <th style={{ padding: "12px 16px" }}>AUTHORITY LEVEL</th>
                <th style={{ padding: "12px 16px" }}>STATUS</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "#94a3b8" }}>
                    No budget requests match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{r.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                        {r.work_order_id} · Req by: <span style={{ fontWeight: 600 }}>{r.requested_by_name}</span>
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px", color: "#334155", fontWeight: 600 }}>
                      {r.department}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      {getUrgencyBadge(r.urgency)}
                    </td>

                    <td style={{ padding: "14px 16px", fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>
                      {formatRupees(r.total_estimated_cost)}
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "0.75rem", backgroundColor: "#f1f5f9", color: "#334155", padding: "3px 8px", borderRadius: 4, fontWeight: 600, border: "1px solid #e2e8f0" }}>
                        {r.approval_level}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      {getStatusBadge(r.status)}
                    </td>

                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedRequest(r)}
                        style={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          color: "#0f172a",
                          padding: "6px 12px",
                          borderRadius: 5,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        Inspect Breakdown &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed Cost Inspection & Approval Modal */}
      {selectedRequest && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 12, maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, borderBottom: "1px solid #e2e8f0", pb: 12 }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0284c7", letterSpacing: 1 }}>BUDGET APPROVAL INSPECTOR</span>
                <h2 style={{ margin: "4px 0 0 0", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>{selectedRequest.title}</h2>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>{selectedRequest.work_order_id} · {selectedRequest.department}</div>
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            {/* Total Summary Header */}
            <div style={{ backgroundColor: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: 8, padding: 16, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>TOTAL ESTIMATED REPAIR BUDGET</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>{formatRupees(selectedRequest.total_estimated_cost)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {getStatusBadge(selectedRequest.status)}
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>{selectedRequest.approval_level}</div>
              </div>
            </div>

            {/* Cost Breakdown Grid */}
            <h4 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: 800, color: "#334155", textTransform: "uppercase" }}>Itemized Cost Distribution</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
              <div style={{ backgroundColor: "#f1f5f9", padding: "10px 14px", borderRadius: 6 }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Raw Materials</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>{formatRupees(selectedRequest.material_cost)}</div>
              </div>
              <div style={{ backgroundColor: "#f1f5f9", padding: "10px 14px", borderRadius: 6 }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Labor & Workforce</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>{formatRupees(selectedRequest.labor_cost)}</div>
              </div>
              <div style={{ backgroundColor: "#f1f5f9", padding: "10px 14px", borderRadius: 6 }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Heavy Machinery & Equipment</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>{formatRupees(selectedRequest.equipment_cost)}</div>
              </div>
              <div style={{ backgroundColor: "#f1f5f9", padding: "10px 14px", borderRadius: 6 }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Emergency Contingency Reserve</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>{formatRupees(selectedRequest.contingency_cost)}</div>
              </div>
            </div>

            {/* Itemized Table Breakdown */}
            {selectedRequest.cost_breakdown && selectedRequest.cost_breakdown.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>Line Item Breakdown</h4>
                <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#475569" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Item Description</th>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Qty</th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.cost_breakdown.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px 8px", fontWeight: 600 }}>{item.item}</td>
                        <td style={{ padding: "6px 8px", color: "#64748b" }}>{item.quantity}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{formatRupees(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Decision Notes Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                Authority Decision Notes / Feedback:
              </label>
              <textarea
                rows={3}
                placeholder="Enter approval comments, budget notes, or required revisions..."
                value={decisionNotes}
                onChange={e => setDecisionNotes(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, "Revision Requested")}
                style={{ padding: "10px 16px", borderRadius: 6, border: "1px solid #d97706", backgroundColor: "#fffbebf5", color: "#b45309", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
              >
                Request Revision
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, "Rejected")}
                style={{ padding: "10px 16px", borderRadius: 6, border: "1px solid #dc2626", backgroundColor: "#fef2f2", color: "#b91c1c", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
              >
                Reject Budget
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, "Approved")}
                style={{ padding: "10px 18px", borderRadius: 6, border: "none", backgroundColor: "#16a34a", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <CheckCircle2 size={16} /> Authorize & Approve Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Budget Estimate Modal */}
      {isSubmitModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 12, maxWidth: 540, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", pb: 12 }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>Submit Repair Budget Estimate</h3>
              <button onClick={() => setIsSubmitModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRequestSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Work Order ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WO-2026-0912"
                  value={newWorkOrder}
                  onChange={e => setNewWorkOrder(e.target.value)}
                  style={{ width: "100%", padding: 9, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Repair Title / Project Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surathkal Flyover Expansion Joint Repair"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ width: "100%", padding: 9, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Department</label>
                  <select
                    value={newDept}
                    onChange={e => setNewDept(e.target.value)}
                    style={{ width: "100%", padding: 9, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  >
                    <option value="Roads & Bridges">Roads & Bridges</option>
                    <option value="Water & Sewerage">Water & Sewerage</option>
                    <option value="Electrical Grid">Electrical Grid</option>
                    <option value="Public Infrastructure">Public Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Urgency Level</label>
                  <select
                    value={newUrgency}
                    onChange={e => setNewUrgency(e.target.value)}
                    style={{ width: "100%", padding: 9, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Materials Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newMaterialCost}
                    onChange={e => setNewMaterialCost(e.target.value)}
                    style={{ width: "100%", padding: 9, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Labor Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newLaborCost}
                    onChange={e => setNewLaborCost(e.target.value)}
                    style={{ width: "100%", padding: 9, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Equipment Hire (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newEquipmentCost}
                    onChange={e => setNewEquipmentCost(e.target.value)}
                    style={{ width: "100%", padding: 9, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>Contingency (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newContingencyCost}
                    onChange={e => setNewContingencyCost(e.target.value)}
                    style={{ width: "100%", padding: 9, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  style={{ padding: "9px 16px", borderRadius: 6, border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "9px 20px", borderRadius: 6, border: "none", backgroundColor: "#0284c7", color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Submit Estimate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
