import React, { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import MapPanel from "../components/MapPanel";
import { reportsSeed, assignments } from "../data/seedData";

export default function Tasks({ reports = [], updateReportStatus, setPage, selectedReportId, setSelectedReportId }) {
  const allAssignments = React.useMemo(() => {
    const sortedReports = [...(reports || [])].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
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
      crew: r.assigned_engineer || "Eng. Marcus Thorne (M-001-AB12)",
      photos: r.evidence ? [r.evidence] : (r.report_photos ? r.report_photos.map(p => p.photo_url) : []),
      is_raw: true,
      raw_report: r
    }));
    return [...liveItems, ...assignments];
  }, [reports]);

  const [activeId, setActiveId] = useState("");
  const [logs, setLogs] = useState(["Crew assigned by Admin. Awaiting field repair update."]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [engineerNote, setEngineerNote] = useState("");

  React.useEffect(() => {
    if (selectedReportId) {
      const match = allAssignments.find(a => 
        String(a.id).toLowerCase() === String(selectedReportId).toLowerCase() || 
        String(a.raw_id).toLowerCase() === String(selectedReportId).toLowerCase() ||
        String(a.id).toLowerCase().includes(String(selectedReportId).toLowerCase())
      );
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
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", margin: "0 0 8px", color: "#111" }}>Active Assignments</h2>
            <div style={{ fontSize: "0.95rem", color: "#6b7280" }}>{allAssignments.length} Tasks Currently Dispatched</div>
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

              {/* Complete & Report to Admin */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "24px", backgroundColor: "#f9fafb", marginBottom: 40 }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 12px", color: "#111" }}>Complete Repair & Report to Admin</h4>
                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: 16 }}>Log final field observations before sending completion sign-off to Admin.</p>
                <textarea
                  placeholder="Enter repair notes (e.g., Pothole filled, asphalt resurfaced, traffic clear)..."
                  value={engineerNote}
                  onChange={(e) => setEngineerNote(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: 4, border: "1px solid #ccc", minHeight: 80, fontSize: "0.9rem", marginBottom: 16 }}
                />
                <button
                  onClick={() => {
                    const note = engineerNote || "Field repair completed by engineer. Sent to Admin for final review.";
                    if (activeItem?.raw_id && updateReportStatus) {
                      updateReportStatus(activeItem.raw_id, "Pending Final Verification", note, activeItem.crew, note);
                      alert("Report submitted to Admin for final resolution!");
                      setEngineerNote("");
                    } else {
                      alert("Mock task updated: Status changed to 'Pending Final Verification' and sent to Admin.");
                      setEngineerNote("");
                    }
                  }}
                  style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 4, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Complete Task & Report to Admin ✓
                </button>
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
