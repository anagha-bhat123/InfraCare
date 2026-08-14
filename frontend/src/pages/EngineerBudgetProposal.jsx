import React, { useState, useMemo } from "react";
import { 
  Calculator, Plus, Clock, CheckCircle2, AlertCircle, RefreshCw, Send, FileText, 
  MapPin, ShieldAlert, ArrowRight, Wrench, Layers, ChevronRight, X, DollarSign
} from "lucide-react";
import Swal from "sweetalert2";
import { apiUrl } from "../services/api";

export default function EngineerBudgetProposal({ user, reports = [], updateReportStatus, setPage }) {
  const department = user?.department || (user?.emp_id?.toUpperCase()?.startsWith("M-002") ? "MESCOM - Streetlight & Grid" : "PWD - Road & Drainage");

  // Initial seed proposals submitted by engineers
  const [proposals, setProposals] = useState([
    {
      id: "prop-201",
      report_id: "rep-402",
      work_order_id: "WO-2026-0891",
      title: "Asphalt Patching & Culvert Reconstruction",
      department: "PWD - Road & Drainage",
      urgency: "Critical",
      engineer_name: user?.name || "Er. Rajesh Sharma",
      material_cost: 120000,
      labor_cost: 45000,
      equipment_cost: 30000,
      contingency_cost: 15000,
      total_estimated_cost: 210000,
      status: "Pending Financial Approval",
      site_notes: "Deep asphalt degradation observed over 45m section. Needs heavy roller and sub-surface culvert alignment.",
      cost_items: [
        { item: "Bituminous Concrete Grade II", qty: "50 Tons", cost: 105000 },
        { item: "Heavy Roller & Paver Hire", qty: "2 Days", cost: 30000 },
        { item: "Skilled Asphalt Paving Crew", qty: "24 Shifts", cost: 45000 },
        { item: "Contingency & Traffic Safety", qty: "Flat", cost: 30000 }
      ],
      created_at: "2026-08-11T10:30:00Z"
    },
    {
      id: "prop-202",
      report_id: "rep-108",
      work_order_id: "WO-2026-0744",
      title: "Streetlight Pole & Transformer Junction Repair",
      department: "MESCOM - Streetlight & Grid",
      urgency: "Urgent",
      engineer_name: user?.name || "Er. Vikram R.",
      material_cost: 28000,
      labor_cost: 18000,
      equipment_cost: 12000,
      contingency_cost: 6000,
      total_estimated_cost: 64000,
      status: "Approved",
      site_notes: "Leaning metal mast with damaged junction box at main intersection.",
      cost_items: [
        { item: "Galvanized Octagonal Pole 9m", qty: "2 Units", cost: 24000 },
        { item: "High-Bay LED Fixtures 150W", qty: "4 Units", cost: 16000 },
        { item: "Bucket Truck Rental", qty: "1 Day", cost: 12000 },
        { item: "Electrical Technicians", qty: "6 Shifts", cost: 12000 }
      ],
      created_at: "2026-08-10T14:15:00Z"
    }
  ]);

  // Modal State for New Budget Submission
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [title, setTitle] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [materialCost, setMaterialCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [equipmentCost, setEquipmentCost] = useState("");
  const [contingencyCost, setContingencyCost] = useState("");
  const [siteNotes, setSiteNotes] = useState("");

  // Filter complaints available for site visit budget estimation
  const pendingReports = useMemo(() => {
    return (reports || []).filter(r => {
      const s = (r.status || "").toLowerCase();
      return !s.includes("resolved") && !s.includes("approved");
    });
  }, [reports]);

  // Merge live report estimates into proposals list
  const allProposals = useMemo(() => {
    const list = [...proposals];
    const existingIds = new Set(list.map(p => p.report_id));

    (reports || []).forEach(rep => {
      if (rep.estimated_budget && !existingIds.has(rep.id)) {
        const est = rep.estimated_budget;
        const mat = Math.round(est * 0.55);
        const lab = Math.round(est * 0.25);
        const eq = Math.round(est * 0.12);
        const cont = Math.round(est * 0.08);

        list.unshift({
          id: `prop-${rep.id.substring(0, 6)}`,
          report_id: rep.id,
          work_order_id: rep.tracking_id || `WO-${rep.id.substring(0, 6).toUpperCase()}`,
          title: rep.title || rep.category || "Field Site Repair",
          department: rep.assigned_department || department,
          urgency: rep.urgency || "Normal",
          engineer_name: rep.site_visit_crew || user?.name || "Er. Field Inspector",
          material_cost: mat,
          labor_cost: lab,
          equipment_cost: eq,
          contingency_cost: cont,
          total_estimated_cost: est,
          status: rep.status === "Budget Approved" ? "Approved" : "Pending Financial Approval",
          site_notes: rep.site_visit_notes || "Site visit inspection completed. Estimate generated.",
          cost_items: [
            { item: "Raw Repair Materials", qty: "Allocated", cost: mat },
            { item: "Labor & Shifts", qty: "Allocated", cost: lab },
            { item: "Equipment Rental", qty: "Allocated", cost: eq },
            { item: "Contingency Reserve", qty: "Flat", cost: cont }
          ],
          created_at: rep.created_at || new Date().toISOString()
        });
      }
    });

    return list;
  }, [proposals, reports, department, user]);

  const calculateTotal = () => {
    const m = parseFloat(materialCost) || 0;
    const l = parseFloat(laborCost) || 0;
    const e = parseFloat(equipmentCost) || 0;
    const c = parseFloat(contingencyCost) || 0;
    return m + l + e + c;
  };

  const handleReportSelect = (reportId) => {
    setSelectedReportId(reportId);
    const rep = reports.find(r => r.id === reportId);
    if (rep) {
      setTitle(rep.title || rep.category || "Site Repair Work");
      setUrgency(rep.urgency || "Normal");
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    const total = calculateTotal();
    if (total <= 0) {
      return Swal.fire("Invalid Budget", "Total estimated repair cost must be greater than Rs. 0", "warning");
    }

    const newProp = {
      id: `req-${Date.now().toString().slice(-6)}`,
      report_id: selectedReportId || "custom-rep",
      work_order_id: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title || "Field Site Repair Work",
      department: department,
      urgency: urgency,
      requested_by_name: user?.name || "Field Engineer",
      material_cost: parseFloat(materialCost) || 0,
      labor_cost: parseFloat(laborCost) || 0,
      equipment_cost: parseFloat(equipmentCost) || 0,
      contingency_cost: parseFloat(contingencyCost) || 0,
      total_estimated_cost: total,
      status: "Pending Financial Approval",
      site_notes: siteNotes || "Estimate generated during field inspection.",
      cost_items: [
        { item: "Raw Repair Materials", qty: "Calculated", cost: parseFloat(materialCost) || 0 },
        { item: "Field Labor & Crew Shifts", qty: "Calculated", cost: parseFloat(laborCost) || 0 },
        { item: "Machinery & Tool Hire", qty: "Calculated", cost: parseFloat(equipmentCost) || 0 },
        { item: "Contingency & Testing", qty: "Flat", cost: parseFloat(contingencyCost) || 0 }
      ],
      created_at: new Date().toISOString()
    };

    setProposals([newProp, ...proposals]);
    setIsModalOpen(false);

    // Save to local storage so Approval Authority page picks it up immediately
    try {
      const reqForApproval = {
        id: newProp.id,
        report_id: selectedReportId || null,
        work_order_id: newProp.work_order_id,
        title: title || "Field Site Repair Work",
        department: department,
        urgency: urgency,
        requested_by_name: user?.name || "Field Engineer",
        material_cost: parseFloat(materialCost) || 0,
        labor_cost: parseFloat(laborCost) || 0,
        equipment_cost: parseFloat(equipmentCost) || 0,
        contingency_cost: parseFloat(contingencyCost) || 0,
        total_estimated_cost: total,
        status: "Pending",
        approval_level: total <= 50000 ? "Level 1 (< Rs. 50,000)" : total <= 250000 ? "Level 2 (Rs. 50k-Rs. 2.5L)" : "Level 3 (> Rs. 2,50,000)",
        approved_by: null,
        decision_notes: siteNotes || "Estimate generated during field inspection by engineer.",
        cost_breakdown: newProp.cost_items.map(ci => ({
          item: ci.item,
          quantity: ci.qty,
          unit_cost: ci.cost,
          total: ci.cost
        })),
        created_at: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem("infracare_budget_requests") || "[]");
      localStorage.setItem("infracare_budget_requests", JSON.stringify([reqForApproval, ...existing]));
    } catch (e) {
      console.error("Failed to save budget request locally:", e);
    }

    // Reset form
    setSelectedReportId("");
    setTitle("");
    setMaterialCost("");
    setLaborCost("");
    setEquipmentCost("");
    setContingencyCost("");
    setSiteNotes("");

    if (selectedReportId && updateReportStatus) {
      updateReportStatus(
        selectedReportId,
        "Budget Submitted",
        siteNotes || `Estimated repair budget of Rs. ${total.toLocaleString()} submitted to Approval Authority`,
        user?.name || "Field Engineer",
        "",
        total
      );
    }

    try {
      const token = localStorage.getItem("infracare_token");
      const headers = token ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };

      // 1. Post to budget-approvals endpoint so Approval Authority sees it
      await fetch(`${apiUrl}/budget-approvals`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          report_id: selectedReportId || null,
          work_order_id: newProp.work_order_id,
          title: title || "Field Site Repair Work",
          department: department,
          urgency: urgency,
          requested_by_name: user?.name || "Field Engineer",
          material_cost: parseFloat(materialCost) || 0,
          labor_cost: parseFloat(laborCost) || 0,
          equipment_cost: parseFloat(equipmentCost) || 0,
          contingency_cost: parseFloat(contingencyCost) || 0,
          timeline_days: urgency === "Critical" ? 3 : urgency === "Urgent" ? 5 : 7,
          cost_breakdown: newProp.cost_items.map(ci => ({
            item: ci.item,
            quantity: ci.qty,
            unit_cost: ci.cost,
            total: ci.cost
          }))
        })
      });

      // 2. Patch damage report status and estimated_budget
      if (selectedReportId) {
        const queryParams = new URLSearchParams({
          status: "Budget Submitted",
          estimated_budget: total.toString(),
          note: siteNotes || `Estimated budget of Rs. ${total.toLocaleString()} submitted to Approval Authority`
        });
        await fetch(`${apiUrl}/reports/${selectedReportId}/status?${queryParams.toString()}`, {
          method: "PATCH",
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
      }
    } catch (err) {
      console.error("Budget proposal submit sync error:", err);
    }

    Swal.fire({
      icon: "success",
      title: "Budget Proposal Submitted!",
      text: `Your repair budget estimate of Rs. ${total.toLocaleString()} has been forwarded to the Approval Authority for financial sanction.`,
      confirmButtonColor: "#0f172a"
    });
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("approved")) {
      return <span style={{ backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={13} /> SANCTIONED & APPROVED</span>;
    }
    if (s.includes("revision")) {
      return <span style={{ backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}><AlertCircle size={13} /> REVISION REQUESTED</span>;
    }
    return <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={13} /> PENDING AUTHORITY REVIEW</span>;
  };

  return (
    <main className="page" style={{ maxWidth: 1240, margin: "0 auto", padding: "24px 20px" }}>
      {/* Engineer Workspace Header */}
      <div style={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: 12, padding: "24px 28px", marginBottom: 28, boxShadow: "0 10px 25px -5px rgba(15,23,42,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ backgroundColor: "#38bdf8", color: "#0f172a", padding: 6, borderRadius: 6, display: "flex" }}>
                <Calculator size={20} />
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#38bdf8", letterSpacing: 1, textTransform: "uppercase" }}>
                ENGINEER WORKSPACE · {department}
              </span>
            </div>
            <h1 style={{ margin: "0 0 6px 0", fontSize: "1.75rem", fontWeight: 800, color: "#fff" }}>
              Field Repair Budget & Cost Estimator
            </h1>
            <div style={{ fontSize: "0.88rem", color: "#94a3b8", maxWidth: 650 }}>
              Submit site visit cost estimates to the Municipal Approval Authority and track financial sanction status in real time.
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: "#38bdf8",
              color: "#0f172a",
              border: "none",
              padding: "12px 20px",
              borderRadius: 8,
              fontSize: "0.88rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(56,189,248,0.3)",
              transition: "transform 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <Plus size={18} /> Submit New Repair Budget
          </button>
        </div>
      </div>

      {/* Engineer Status Summary Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            TOTAL SUBMITTED PROPOSALS
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>
            {allProposals.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
            Field Estimates Logged
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            AWAITING AUTHORITY SANCTION
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0284c7" }}>
            {allProposals.filter(p => p.status.includes("Pending")).length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#0369a1", marginTop: 4 }}>
            Under Board Review
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            APPROVED & SANCTIONED
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#16a34a" }}>
            {allProposals.filter(p => p.status.includes("Approved")).length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: 4 }}>
            Ready for Crew Execution
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            TOTAL ESTIMATED VALUE
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>
            Rs. {allProposals.reduce((sum, p) => sum + (p.total_estimated_cost || 0), 0).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
            Aggregate Repair Budget
          </div>
        </div>
      </section>

      {/* Submitted Proposals Cards Grid */}
      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
        👷 My Field Repair Budget Proposals
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        {allProposals.map(prop => (
          <div key={prop.id} style={{ backgroundColor: "#fff", border: "1px solid #cbd5e1", borderRadius: 10, padding: 20, boxShadow: "0 2px 6px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: 0.5 }}>{prop.work_order_id}</span>
                  <h3 style={{ margin: "2px 0 0 0", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>{prop.title}</h3>
                </div>
                {getStatusBadge(prop.status)}
              </div>

              {/* Necessary Budget Card Summary */}
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>SUBMITTED NECESSARY REPAIR BUDGET</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "2px 0 8px 0" }}>
                  Rs. {prop.total_estimated_cost.toLocaleString()}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.75rem", color: "#334155" }}>
                  <div>• Materials: <b>Rs. {prop.material_cost.toLocaleString()}</b></div>
                  <div>• Labor: <b>Rs. {prop.labor_cost.toLocaleString()}</b></div>
                  <div>• Machinery: <b>Rs. {prop.equipment_cost.toLocaleString()}</b></div>
                  <div>• Contingency: <b>Rs. {prop.contingency_cost.toLocaleString()}</b></div>
                </div>
              </div>

              {/* Site Notes */}
              {prop.site_notes && (
                <div style={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.4, marginBottom: 16, fontStyle: "italic", borderLeft: "3px solid #38bdf8", paddingLeft: 10 }}>
                  "{prop.site_notes}"
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", pt: 12 }}>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                Urgency: <b style={{ color: prop.urgency === "Critical" ? "#dc2626" : "#d97706" }}>{prop.urgency}</b> ({prop.urgency === "Critical" ? "3 Days SLA" : prop.urgency === "Urgent" ? "5 Days SLA" : "7 Days SLA"})
              </div>
              <button
                onClick={() => {
                  Swal.fire({
                    title: `Itemized Budget Details — ${prop.work_order_id}`,
                    html: `
                      <div style="text-align:left; font-size:0.88rem; line-height:1.6;">
                        <p><strong>Title:</strong> ${prop.title}</p>
                        <p><strong>Department:</strong> ${prop.department}</p>
                        <p><strong>Total Estimated Budget:</strong> <span style="color:#16a34a; font-weight:bold;">Rs. ${prop.total_estimated_cost.toLocaleString()}</span></p>
                        <hr style="border:0; border-top:1px solid #ddd; margin:12px 0;"/>
                        <p><strong>Breakdown Line Items:</strong></p>
                        <ul style="padding-left:20px; margin:0;">
                          ${prop.cost_items.map(i => `<li>${i.item} (${i.qty}): <strong>Rs. ${i.cost.toLocaleString()}</strong></li>`).join("")}
                        </ul>
                      </div>
                    `,
                    confirmButtonColor: "#0f172a"
                  });
                }}
                style={{ backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", color: "#0f172a", padding: "5px 10px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
              >
                Inspect Line Items
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Budget Proposal Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: 12, maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #e2e8f0", pb: 12 }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#38bdf8", letterSpacing: 0.8, textTransform: "uppercase" }}>
                  ENGINEER FIELD ESTIMATOR
                </span>
                <h2 style={{ margin: "2px 0 0 0", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                  Submit Necessary Repair Budget
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Select Assigned Citizen Complaint / Work Order
                </label>
                <select
                  value={selectedReportId}
                  onChange={e => handleReportSelect(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", backgroundColor: "#fff" }}
                >
                  <option value="">-- Choose Assigned Complaint (Optional) --</option>
                  {pendingReports.map(r => (
                    <option key={r.id} value={r.id}>
                      #{r.tracking_id || r.id.substring(0,8)} — {r.title || r.category} ({r.assigned_department || department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Work Order Repair Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Major Asphalt Resurfacing & Drainage Culvert Replacement"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Urgency & SLA Completion Target Timeline *
                </label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", backgroundColor: "#fff" }}
                >
                  <option value="Normal">Normal Urgency — 1 Week (7 Days Timeline)</option>
                  <option value="Urgent">Urgent Urgency — 5 Days Timeline</option>
                  <option value="Critical">Critical Hazard — 3 Days Timeline</option>
                </select>
              </div>

              {/* Itemized Cost Input Grid */}
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>
                  Itemized Repair Cost Breakdown (INR ₹)
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Raw Materials Cost (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={materialCost}
                      onChange={e => setMaterialCost(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Field Labor & Shifts (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 20000"
                      value={laborCost}
                      onChange={e => setLaborCost(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Machinery & Tool Hire (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={equipmentCost}
                      onChange={e => setEquipmentCost(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Contingency Reserve (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={contingencyCost}
                      onChange={e => setContingencyCost(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1.5px dashed #cbd5e1" }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>TOTAL ESTIMATED BUDGET:</span>
                  <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0284c7" }}>
                    Rs. {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Site Visit Observations & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe damage area, soil/asphalt condition, and material requirements..."
                  value={siteNotes}
                  onChange={e => setSiteNotes(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "10px 16px", borderRadius: 6, border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#334155", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: 6, border: "none", backgroundColor: "#0f172a", color: "#fff", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  Submit Proposal to Authority <Send size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
