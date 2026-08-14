import React, { useState } from "react";
import { MapPin, Navigation, FileText, Download } from "lucide-react";
import MapPanel from "../components/MapPanel";
import { reportsSeed, assignments } from "../data/seedData";
import { generateFinalBillPDF } from "../utils/pdfGenerator";

const mescomAssignments = [
  {
    id: "RD-7701",
    state: "DISPATCHED",
    title: "Broken Streetlight Mast - Hampankatta",
    place: "Hampankatta, Mangalore",
    coords: [12.8697, 74.8423],
    summary: "Streetlight mast is leaning dangerously over the footpath. Needs immediate stabilization and bulb replacement.",
    type: "Streetlight Hazard",
    surface: "Electrical Grid Pole",
    crew: "Crew #09-E (MESCOM)",
    photos: [
      "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RD-7702",
    state: "IN PROGRESS",
    title: "Dim Streetlight Grid",
    place: "Manipal Main Rd, Udupi",
    coords: [13.3525, 74.7865],
    summary: "Entire streetlight grid on the junction has gone dim or is flickering constantly.",
    type: "Streetlight Hazard",
    surface: "Electrical Grid Junction Box",
    crew: "Crew #05-F (MESCOM)",
    photos: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export default function Tasks({ reports = [], updateReportStatus, setPage, selectedReportId, setSelectedReportId, user }) {
  const department = user?.department || (user?.emp_id?.toUpperCase()?.startsWith("M-002") ? "MESCOM - Streetlight & Grid" : "PWD - Road & Drainage");

  const allAssignments = React.useMemo(() => {
    // Filter reports by department or include all allocated tasks:
    const filteredReports = (reports || []).filter(r => {
      const cat = (r.category || "").toLowerCase();
      const isStreetlight = cat.includes("light") || cat.includes("electric") || cat.includes("lamp");
      if (department === "MESCOM - Streetlight & Grid") {
        return isStreetlight;
      } else {
        return !isStreetlight || true; // Show all latest complaint assignments
      }
    });

    const sortedReports = [...filteredReports].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    const liveItems = sortedReports.map(r => ({
      id: (r.tracking_id || (r.id ? (String(r.id).startsWith("CMP") ? r.id : r.id.substring(0, 8)) : "REP")).toUpperCase(),
      raw_id: r.id,
      state: (r.status || "CREW ASSIGNED").toUpperCase(),
      title: r.title || r.category || "Road Damage Incident",
      place: `Lat: ${r.latitude}, Lng: ${r.longitude}`,
      coords: [r.latitude || 13.3409, r.longitude || 74.7421],
      summary: r.description || "Citizen complaint assigned by Admin for field inspection and repair.",
      type: r.category || "General Damage",
      surface: "Asphalt / Roadway",
      crew: r.assigned_engineer || r.site_visit_crew || r.crew || "Field Engineer Crew",
      photos: r.evidence ? [r.evidence] : (r.report_photos ? r.report_photos.map(p => p.photo_url) : []),
      is_raw: true,
      raw_report: r
    }));

    const staticAssignments = department === "MESCOM - Streetlight & Grid" ? mescomAssignments : assignments;
    const combined = [...liveItems];
    
    // Append static assignments if not already present
    staticAssignments.forEach(s => {
      if (!combined.some(c => c.id === s.id)) {
        combined.push(s);
      }
    });

    return combined;
  }, [reports, department]);

  const [activeId, setActiveId] = useState("");
  const [logs, setLogs] = useState(["Crew assigned by Admin. Awaiting field repair update."]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [engineerNote, setEngineerNote] = useState("");
  const [repairedPhotoUrl, setRepairedPhotoUrl] = useState("");
  const [isWorkDelayed, setIsWorkDelayed] = useState(false);

  React.useEffect(() => {
    if (selectedReportId) {
      const sTarget = String(selectedReportId).toLowerCase().replace("#", "").trim();
      const match = allAssignments.find(a => {
        const aId = String(a.id || "").toLowerCase().replace("#", "").trim();
        const aRaw = String(a.raw_id || "").toLowerCase().replace("#", "").trim();
        const aTrack = a.raw_report?.tracking_id ? String(a.raw_report.tracking_id).toLowerCase().replace("#", "").trim() : "";
        return aId === sTarget || aRaw === sTarget || aTrack === sTarget || aId.includes(sTarget) || sTarget.includes(aId.substring(0, 8)) || (aRaw && sTarget.includes(aRaw.substring(0, 8)));
      });
      if (match) {
        setActiveId(match.id);
        return;
      }
    }
    if (allAssignments.length > 0) {
      const liveItem = allAssignments.find(a => a.is_raw);
      if (liveItem) {
        setActiveId(liveItem.id);
      } else {
        setActiveId(allAssignments[0].id);
      }
    }
  }, [reports, allAssignments, selectedReportId]);

  const activeItem = allAssignments.find((a) => a.id === activeId || a.raw_id === activeId) || allAssignments[0];

  const activePhotos = activeItem?.photos?.length ? activeItem.photos : (assignments[0]?.photos || []);

  return (
    <main className="page" style={{ padding: 0 }}>
      <div className="task-layout">
        {/* Left Column (Feed) */}
        <div className="assignment-list">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", margin: "0 0 6px", color: "#111" }}>Scheduling & Tasks</h2>
            <div style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 600 }}>Latest Complaint List ({allAssignments.length} Assignments)</div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allAssignments.map(item => {
              const priorityColor = item.state === "DISPATCHED" ? "#fef3c7" : item.state === "IN PROGRESS" ? "#ffedd5" : item.state === "ON SITE" ? "#e0e7ff" : "#f3f4f6";
              const priorityText = item.state === "DISPATCHED" ? "#d97706" : item.state === "IN PROGRESS" ? "#ea580c" : item.state === "ON SITE" ? "#4f46e5" : "#6b7280";
              
              return (
                <div 
                  key={item.id} 
                  className={`assignment ${activeItem?.id === item.id ? "selected" : ""}`}
                  onClick={() => setActiveId(item.id)}
                  style={{ cursor: "pointer", gridTemplateColumns: "1fr" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0", color: "#111", flex: 1, paddingRight: 16 }}>{item.title}</h3>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{ backgroundColor: priorityColor, color: priorityText, fontSize: "0.65rem", fontWeight: 700, padding: "4px 8px", borderRadius: 2, letterSpacing: 0.5 }}>
                        {item.state}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600 }}>#{item.id}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8rem", color: "#6b7280", fontWeight: 500 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={14} /> {item.place}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (Detail) */}
        <div className="task-detail" style={{ backgroundColor: "#fff", overflowY: "auto" }}>
          {activeItem && (
            <div style={{ maxWidth: 840, margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600, letterSpacing: 0.5 }}>Task Details <span style={{ margin: "0 8px" }}>&gt;</span> <span style={{ color: "#111", fontWeight: 700 }}>#{activeItem.id}</span></div>
                <button style={{ backgroundColor: "#000", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 4, fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => window.open(`https://www.google.com/maps?q=${activeItem.coords[0]},${activeItem.coords[1]}`, "_blank")}>
                  Navigate <Navigation size={14} />
                </button>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
                <div style={{ flex: 1, paddingRight: "clamp(0px, 4vw, 40px)" }}>
                  <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", margin: "0 0 24px", lineHeight: 1.1, color: "#111" }}>{activeItem.title.replace("Critical Pothole - ", "")}</h1>
                  <p style={{ fontSize: "1.05rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>{activeItem.summary}</p>
                </div>
              </div>

              <div className="task-grid" style={{ marginBottom: 32 }}>
                {/* Map Area */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>GPS COORDINATES</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111" }}>{activeItem.coords[0]}° N, {activeItem.coords[1] >= 0 ? activeItem.coords[1] + "° E" : Math.abs(activeItem.coords[1]) + "° W"}</span>
                  </div>
                  <div style={{ position: "relative", borderRadius: 2, overflow: "hidden", height: 200, backgroundColor: "#f3f4f6" }}>
                    <MapPanel compact coords={activeItem.coords} />
                  </div>
                </div>
                
                {/* Visual Evidence Area */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "24px", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 16 }}>REPORTED VISUAL EVIDENCE</div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16, flex: 1 }}>
                    <img src={activePhotos[0] || reportsSeed[0]?.evidence} alt="Evidence" style={{ flex: 1, objectFit: "cover", borderRadius: 2, height: 120 }} />
                    <img src={activePhotos[1] || reportsSeed[1]?.evidence} alt="Evidence" style={{ flex: 1, objectFit: "cover", borderRadius: 2, height: 120 }} />
                  </div>
                  <button 
                    onClick={() => setIsPhotoModalOpen(true)}
                    style={{ width: "100%", padding: "12px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    View All 4 Photos
                  </button>
                </div>
              </div>

              <div className="three" style={{ display: "grid", gap: 24, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid #e5e7eb" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 8 }}>TYPE</div>
                  <div style={{ fontSize: "1.05rem", color: "#111" }}>{activeItem.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 8 }}>SURFACE</div>
                  <div style={{ fontSize: "1.05rem", color: "#111" }}>{activeItem.surface}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 8 }}>ASSIGNED TO</div>
                  <div style={{ fontSize: "1.05rem", color: "#111" }}>{activeItem.crew}</div>
                </div>
              </div>

              {/* Activity Log */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "32px 40px", marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>Activity Log & Updates</h3>
                  <button style={{ backgroundColor: "#000", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 4, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }} onClick={() => setLogs([`Update logged at ${new Date().toLocaleTimeString()}`, ...logs])}>Log Activity +</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {logs.map((log, index) => (
                    <div key={index} style={{ paddingLeft: 20, borderLeft: index === 0 ? "2px solid #111" : "2px solid #e5e7eb" }}>
                      <p style={{ fontStyle: "italic", color: index === 0 ? "#111" : "#6b7280", margin: 0, fontSize: "1.05rem", lineHeight: 1.5 }}>
                        {log}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage 5: Work Completion & Repaired Photo Upload */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "24px", backgroundColor: "#f9fafb", marginBottom: 40, boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 800, margin: 0, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
                    📸 Stage 5: Upload Repaired Image & Complete Work
                  </h4>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "4px 10px", borderRadius: 4 }}>
                    Timeline: {activeItem?.raw_report?.urgency === "Critical" ? "3 Days" : activeItem?.raw_report?.urgency === "Urgent" ? "5 Days" : "1 Week (7 Days)"}
                  </span>
                </div>
                
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: 16 }}>
                  Upload photographic proof of the repaired road, drainage, or streetlight. This proof will be made visible to the citizen who filed the complaint.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Repaired Photo URL (Proof for Citizen):
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7..."
                      value={repairedPhotoUrl}
                      onChange={(e) => setRepairedPhotoUrl(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: 4, border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => setRepairedPhotoUrl("https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80")}
                        style={{ fontSize: "0.7rem", backgroundColor: "#f3f4f6", border: "1px solid #ccc", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}
                      >
                        Sample Fixed Road Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setRepairedPhotoUrl("https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?auto=format&fit=crop&w=800&q=80")}
                        style={{ fontSize: "0.7rem", backgroundColor: "#f3f4f6", border: "1px solid #ccc", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}
                      >
                        Sample Fixed Streetlight Photo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      SLA Work Timeline Status:
                    </label>
                    <div style={{ padding: "10px", backgroundColor: isWorkDelayed ? "#fef2f2" : "#f0fdf4", border: isWorkDelayed ? "1px solid #fecdd3" : "1px solid #bbf7d0", borderRadius: 4 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, color: isWorkDelayed ? "#b91c1c" : "#166534" }}>
                        <input
                          type="checkbox"
                          checked={isWorkDelayed}
                          onChange={(e) => setIsWorkDelayed(e.target.checked)}
                        />
                        Work Delayed Beyond Target Timeline (10% Discount Penalty Applied)
                      </label>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }}>
                        {isWorkDelayed 
                          ? "⚠️ Final Invoice Bill: Approved Budget - 10% SLA Discount"
                          : "✓ Work Completed On-Time: 100% Full Approved Budget"}
                      </div>
                    </div>
                  </div>
                </div>

                {repairedPhotoUrl && (
                  <div style={{ marginBottom: 16, border: "1px solid #e5e7eb", borderRadius: 4, padding: 8, backgroundColor: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={repairedPhotoUrl} alt="Repaired preview" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 4 }} />
                    <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 700 }}>✓ Repaired Image Ready to display for Citizen</span>
                  </div>
                )}

                <textarea
                  placeholder="Enter final repair completion notes (e.g. Road resurfacing completed, streetlight bulb & mast replaced)..."
                  value={engineerNote}
                  onChange={(e) => setEngineerNote(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: 4, border: "1px solid #ccc", minHeight: 70, fontSize: "0.88rem", marginBottom: 16 }}
                />
                
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    onClick={async () => {
                      const photoUrl = repairedPhotoUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80";
                      const note = engineerNote || "Work completed on site. Final bill generated and submitted for admin review.";
                      const targetId = activeItem?.raw_id || activeItem?.id;
                      const approvedBudget = activeItem?.approved_budget || activeItem?.estimated_budget || 50000;
                      const mat = Math.round(approvedBudget * 0.55);
                      const lab = Math.round(approvedBudget * 0.25);
                      const eq = Math.round(approvedBudget * 0.12);
                      const cont = Math.round(approvedBudget * 0.08);
                      const finalBillAmount = isWorkDelayed ? Math.round(approvedBudget * 0.9) : approvedBudget;

                      // Create Final Bill Object
                      const finalBillObj = {
                        id: `bill-${Date.now().toString().slice(-6)}`,
                        report_id: String(targetId),
                        work_order_id: activeItem.tracking_id || `WO-2026-${String(targetId).substring(0, 4).toUpperCase()}`,
                        title: activeItem.title || activeItem.summary || "Field Infrastructure Repair Project",
                        department: activeItem.assigned_department || activeItem.department || "PWD - Road & Drainage",
                        engineer_name: user?.name || activeItem.crew || "Er. Field Inspector Crew",
                        admin_name: "Municipal Works Admin",
                        approved_by: "Approval Authority",
                        approved_budget: approvedBudget,
                        material_cost: mat,
                        labor_cost: lab,
                        equipment_cost: eq,
                        contingency_cost: cont,
                        delay_discount_applied: isWorkDelayed,
                        final_bill_amount: finalBillAmount,
                        notes: note,
                        status: "Final Bill Submitted by Engineer",
                        repaired_photo_url: photoUrl,
                        created_at: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      };

                      // Save Final Bill to localStorage
                      try {
                        const existingBills = JSON.parse(localStorage.getItem("infracare_final_bills") || "[]");
                        const filtered = existingBills.filter(b => b.report_id !== String(targetId) && b.work_order_id !== finalBillObj.work_order_id);
                        localStorage.setItem("infracare_final_bills", JSON.stringify([finalBillObj, ...filtered]));
                      } catch (e) {}

                      try {
                        const formData = new FormData();
                        formData.append("repaired_photo_url", photoUrl);
                        formData.append("engineer_notes", note);
                        formData.append("is_delayed", isWorkDelayed ? "true" : "false");

                        await fetch(`http://127.0.0.1:8000/reports/${targetId}/complete-repair`, {
                          method: "POST",
                          body: formData
                        }).catch(() => {});
                      } catch (err) {
                        console.error("API complete error:", err);
                      }

                      if (updateReportStatus && activeItem?.raw_id) {
                        updateReportStatus(activeItem.raw_id, "Final Bill Submitted by Engineer", note, activeItem.crew, note, photoUrl);
                      }
                      
                      alert(`Final Bill of Rs. ${finalBillAmount.toLocaleString()} generated & submitted to Admin! ${isWorkDelayed ? '10% SLA Delay Penalty applied.' : 'Completed on-time.'}`);
                      
                      // Trigger PDF bill download preview
                      generateFinalBillPDF(finalBillObj);
                      setEngineerNote("");
                    }}
                    style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "12px 20px", borderRadius: 6, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    <FileText size={18} /> Generate Final Bill & Submit to Admin ✓
                  </button>

                  <button
                    onClick={() => {
                      const approvedBudget = activeItem?.approved_budget || activeItem?.estimated_budget || 50000;
                      const finalBillAmount = isWorkDelayed ? Math.round(approvedBudget * 0.9) : approvedBudget;
                      generateFinalBillPDF({
                        work_order_id: activeItem.tracking_id || `WO-2026-${String(activeItem?.id || '101').substring(0, 4).toUpperCase()}`,
                        title: activeItem.title || activeItem.summary || "Field Repair Execution",
                        department: activeItem.assigned_department || "PWD - Road & Drainage",
                        engineer_name: user?.name || activeItem.crew || "Er. Site Engineer",
                        approved_budget: approvedBudget,
                        material_cost: Math.round(approvedBudget * 0.55),
                        labor_cost: Math.round(approvedBudget * 0.25),
                        equipment_cost: Math.round(approvedBudget * 0.12),
                        contingency_cost: Math.round(approvedBudget * 0.08),
                        delay_discount_applied: isWorkDelayed,
                        final_bill_amount: finalBillAmount,
                        notes: engineerNote || "Final site repair work execution complete."
                      });
                    }}
                    style={{ backgroundColor: "#0284c7", color: "#fff", border: "none", padding: "12px 18px", borderRadius: 6, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    <Download size={18} /> Preview PDF Bill 📥
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {isPhotoModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", flexDirection: "column", padding: "40px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <button onClick={() => setIsPhotoModalOpen(false)} style={{ backgroundColor: "transparent", color: "#fff", border: "none", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer" }}>Close </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto", width: "100%" }}>
            {activePhotos.map((photo, idx) => (
              <div key={idx} style={{ borderRadius: 8, overflow: "hidden", border: "2px solid #444", background: "#222", height: 240 }}>
                <img
                  src={photo}
                  alt={`Evidence ${idx + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = `<div style="color:#aaa;display:flex;align-items:center;justify-content:center;height:100%;font-size:0.85rem">Photo ${idx+1} unavailable</div>`; }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
