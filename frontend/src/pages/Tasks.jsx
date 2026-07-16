import React, { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import MapPanel from "../components/MapPanel";
import { reportsSeed, assignments } from "../data/seedData";

export default function Tasks({ setPage }) {
  const [activeId, setActiveId] = useState(assignments[0]?.id || "");
  const [logs, setLogs] = useState(["Crew assigned. Awaiting first field update."]);
  
  const activeItem = assignments.find((a) => a.id === activeId);

  return (
    <main className="page" style={{ padding: 0 }}>
      <div className="task-layout">
        {/* Left Column (Feed) */}
        <div className="assignment-list">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", margin: "0 0 8px", color: "#111" }}>Active Assignments</h2>
            <div style={{ fontSize: "0.95rem", color: "#6b7280" }}>{assignments.length} Tasks Currently Dispatched</div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {assignments.map(item => {
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
                <div style={{ flex: 1, paddingRight: 40 }}>
                  <h1 style={{ fontFamily: "Georgia, serif", fontSize: "3.2rem", margin: "0 0 24px", lineHeight: 1.1, color: "#111" }}>{activeItem.title.replace("Critical Pothole - ", "")}</h1>
                  <p style={{ fontSize: "1.05rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>{activeItem.summary}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                {/* Map Area */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1 }}>GPS COORDINATES</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111" }}>{activeItem.coords[0]}° N, {Math.abs(activeItem.coords[1])}° W</span>
                  </div>
                  <div style={{ position: "relative", borderRadius: 2, overflow: "hidden", height: 200, backgroundColor: "#f3f4f6" }}>
                    <MapPanel compact coords={activeItem.coords} />
                  </div>
                </div>
                
                {/* Visual Evidence Area */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "24px", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 16 }}>REPORTED VISUAL EVIDENCE</div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16, flex: 1 }}>
                    <img src={reportsSeed[0]?.evidence || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80"} alt="Evidence" style={{ flex: 1, objectFit: "cover", borderRadius: 2, height: 120 }} />
                    <img src="https://images.unsplash.com/photo-1617195920950-1145bf9a9c20?auto=format&fit=crop&w=400&q=80" alt="Evidence" style={{ flex: 1, objectFit: "cover", borderRadius: 2, height: 120 }} />
                  </div>
                  <button style={{ width: "100%", padding: "12px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>
                    View All 4 Photos
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid #e5e7eb" }}>
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
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
