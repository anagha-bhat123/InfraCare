import React, { useState } from "react";
import {
  MapPin, CheckCircle, AlertTriangle, Eye, Thermometer, XCircle
} from "lucide-react";
import MapPanel from "../components/MapPanel";

const feedData = [
  {
    id: "#REP-8821",
    priority: "CRITICAL",
    priorityColor: "#fee2e2",
    priorityText: "#dc2626",
    title: "Severe Pothole - West Corridor",
    desc: "Structure degradation detected at junction A-1...",
    time: "14m ago",
    zone: "Zone 4",
    score: 94,
    aiText: "Identification: Asphalt Discontinuity with Exposed Sub-base.",
    metrics: { depth: "14.2", vol: "0.8", area: "2.4" },
    risks: { vehicle: "HIGH", ped: "LOW", weather: "CRITICAL" }
  },
  {
    id: "#REP-8819",
    priority: "MEDIUM",
    priorityColor: "#e5e7eb",
    priorityText: "#374151",
    title: "Linear Crack Development",
    desc: "1.2m crack on asphalt surface near 5th St.",
    time: "1h ago",
    zone: "Zone 2",
    score: 72,
    aiText: "Identification: Superficial linear fatigue cracking along the seam.",
    metrics: { depth: "3.1", vol: "0.1", area: "1.2" },
    risks: { vehicle: "LOW", ped: "MEDIUM", weather: "HIGH" }
  },
  {
    id: "#REP-8815",
    priority: "LOW",
    priorityColor: "#f3f4f6",
    priorityText: "#9ca3af",
    title: "Surface Erosion",
    desc: "Minor aggregate loss reported on parking dec...",
    time: "3h ago",
    zone: "Zone 1",
    score: 45,
    aiText: "Identification: Top-layer aggregate wear. No immediate structural threat.",
    metrics: { depth: "1.5", vol: "0.05", area: "4.5" },
    risks: { vehicle: "LOW", ped: "LOW", weather: "MEDIUM" }
  }
];

export default function AIVerification({ reports, updateReportStatus, setPage }) {
  const [activeTab, setActiveTab] = useState("Pending");
  
  const mappedReports = React.useMemo(() => {
    if (!reports || reports.length === 0) return feedData;
    return reports.filter(r => r.ai_verified || r.ai_damage_type).map(r => ({
      id: r.tracking_id || `#${r.id.substring(0, 8).toUpperCase()}`,
      priority: r.priority?.toUpperCase() || "MEDIUM",
      priorityColor: r.priority === 'High' ? "#fee2e2" : r.priority === 'Low' ? "#f3f4f6" : "#e5e7eb",
      priorityText: r.priority === 'High' ? "#dc2626" : r.priority === 'Low' ? "#9ca3af" : "#374151",
      title: r.title,
      desc: r.description || "No description provided.",
      time: new Date(r.created_at).toLocaleDateString(),
      zone: "Zone",
      score: r.ai_severity === "Severe" ? 94 : r.ai_severity === "Moderate" ? 72 : 45,
      aiText: `Identification: ${r.ai_damage_type || "Object Detected"}. Severity: ${r.ai_severity || "Unknown"}.`,
      metrics: { depth: r.ai_severity === "Severe" ? "14.2" : "3.1", vol: "0.8", area: "2.4" },
      risks: { vehicle: r.ai_severity === "Severe" ? "HIGH" : "LOW", ped: "LOW", weather: "MEDIUM" },
      raw_report: r
    }));
  }, [reports]);

  const displayData = mappedReports.length > 0 ? mappedReports : feedData;
  const [activeItem, setActiveItem] = useState(displayData[0]);

  React.useEffect(() => {
    if (displayData.length > 0 && !activeItem) {
      setActiveItem(displayData[0]);
    }
  }, [displayData, activeItem]);


  return (
    <main className="page" style={{ padding: 0 }}>
      <div className="task-layout">
        
        {/* Left Column (Feed) */}
        <div className="assignment-list">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", margin: 0, color: "#111" }}>Active Feed</h2>
            <span style={{ backgroundColor: "#dc2626", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "4px 8px", borderRadius: 4, letterSpacing: 1 }}>12 NEW</span>
          </div>
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
            <button
              onClick={() => setActiveTab("Pending")}
              style={{ flex: 1, padding: "12px 0", border: "none", background: "none", fontWeight: 700, fontSize: "0.9rem", color: activeTab === "Pending" ? "#111" : "#6b7280", borderBottom: activeTab === "Pending" ? "2px solid #111" : "2px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("Reviewed")}
              style={{ flex: 1, padding: "12px 0", border: "none", background: "none", fontWeight: 700, fontSize: "0.9rem", color: activeTab === "Reviewed" ? "#111" : "#6b7280", borderBottom: activeTab === "Reviewed" ? "2px solid #111" : "2px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
            >
              Reviewed
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {displayData.map(item => (
              <div
                key={item.id}
                className={`assignment ${activeItem.id === item.id ? "selected" : ""}`}
                onClick={() => setActiveItem(item)}
                style={{ cursor: "pointer", gridTemplateColumns: "1fr" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>{item.id}</span>
                  <span style={{ backgroundColor: item.priorityColor, color: item.priorityText, fontSize: "0.7rem", fontWeight: 700, padding: "4px 8px", borderRadius: 4, letterSpacing: 0.5 }}>
                    {item.priority}
                  </span>
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 8px", color: "#111" }}>{item.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#6b7280", margin: "0 0 16px", lineHeight: 1.5 }}>{item.desc}</p>
                <div style={{ display: "flex", gap: 16, fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    🕒 {item.time}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={12} /> {item.zone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Detail) */}
        <div className="task-detail" style={{ backgroundColor: "#fff", overflowY: "auto" }}>
          {activeItem && (
            <div style={{ maxWidth: 840, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
                <span style={{ backgroundColor: "#111", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "4px 8px", borderRadius: 2, letterSpacing: 1 }}>CASE {activeItem.id.split("-")[1]}</span>
                <span style={{ color: "#6b7280", fontSize: "0.75rem", fontWeight: 600, letterSpacing: 1 }}>VERIFIED BY AI V2.4</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
                <div style={{ flex: 1, paddingRight: 40 }}>
                  <h1 style={{ fontFamily: "Georgia, serif", fontSize: "3rem", margin: "0 0 16px", lineHeight: 1.1, color: "#111" }}>{activeItem.title}</h1>
                  <p style={{ fontSize: "1.1rem", color: "#4b5563", lineHeight: 1.5, margin: 0 }}>{activeItem.aiText || "Identification details pending."}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 4 }}>PRIORITY SCORE</div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "3rem", fontWeight: 700, color: "#dc2626", lineHeight: 1 }}>{activeItem.score || 75}<span style={{ fontSize: "1.5rem", color: "#dc2626" }}>/100</span></div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 32 }}>
                {/* AI Image */}
                <div style={{ position: "relative", borderRadius: 4, overflow: "hidden", height: 280, backgroundColor: "#f3f4f6" }}>
                  <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80" alt="Pothole" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: 20, left: 20, backgroundColor: "#fff", padding: "10px 16px", borderLeft: "4px solid #111", fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.4 }}>
                    OBJECT:<br />POTHOLE<br /><span style={{ color: "#6b7280", fontWeight: 600 }}>(98.4%)</span>
                  </div>
                  {/* Bounding box mock */}
                  <div style={{ position: "absolute", top: 90, left: 100, width: 140, height: 80, border: "2px dashed #dc2626", backgroundColor: "rgba(220, 38, 38, 0.15)" }}></div>
                  <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 8 }}>
                    <span style={{ backgroundColor: "rgba(0,0,0,0.8)", color: "#fff", padding: "8px 12px", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, borderRadius: 2 }}><Thermometer size={14} /> 12°C</span>
                    <span style={{ backgroundColor: "rgba(0,0,0,0.8)", color: "#fff", padding: "8px 12px", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, borderRadius: 2 }}><Eye size={14} /> Lidar Enabled</span>
                  </div>
                </div>
                {/* Map */}
                <div style={{ borderRadius: 4, overflow: "hidden", height: 280, backgroundColor: "#f3f4f6", position: "relative" }}>
                  <MapPanel compact coords={[51.5074, -0.1278]} />
                  <div style={{ position: "absolute", bottom: 16, right: 16, backgroundColor: "#fff", padding: "8px 12px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid #e5e7eb", borderRadius: 2, color: "#111", zIndex: 1000 }}>
                    LAT: 51.5074° N<br />LNG: 0.1278° W
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: 24, marginBottom: 48 }}>

                {/* Metric Analysis */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "24px 20px" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 24 }}>METRIC ANALYSIS</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                    <span style={{ fontSize: "0.95rem", color: "#111", lineHeight: 1.4 }}>Depth<br /><span style={{ color: "#6b7280", fontSize: "0.85rem" }}>(Est.)</span></span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{activeItem.metrics?.depth || "-"} <span style={{ fontSize: "0.85rem" }}>cm</span></span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                    <span style={{ fontSize: "0.95rem", color: "#111", lineHeight: 1.4 }}>Volume<br />Loss</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{activeItem.metrics?.vol || "-"} <span style={{ fontSize: "0.85rem" }}>m³</span></span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "0.95rem", color: "#111", lineHeight: 1.4 }}>Surface<br />Area</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{activeItem.metrics?.area || "-"} <span style={{ fontSize: "0.85rem" }}>m²</span></span>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "24px 20px" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 1, marginBottom: 24 }}>RISK ASSESSMENT</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <span style={{ fontSize: "0.95rem", color: "#111", lineHeight: 1.4 }}>Vehicle<br />Impact</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#dc2626", letterSpacing: 0.5 }}>{activeItem.risks?.vehicle || "HIGH"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <span style={{ fontSize: "0.95rem", color: "#111", lineHeight: 1.4 }}>Pedestrian<br />Risk</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{activeItem.risks?.ped || "LOW"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.95rem", color: "#111", lineHeight: 1.4 }}>Weather<br />Suscept.</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#dc2626", letterSpacing: 0.5 }}>{activeItem.risks?.weather || "CRITICAL"}</span>
                  </div>
                </div>

                {/* Proposed Route */}
                <div style={{ backgroundColor: "#f9fafb", borderRadius: 4, padding: 24, position: "relative", border: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-start" }}>
                    <MapPin size={20} color="#111" />
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", lineHeight: 1.4 }}>Proposed<br />Inspection Route</div>
                  </div>

                  <div style={{ position: "relative", paddingLeft: 24, borderLeft: "2px solid #e5e7eb", marginLeft: 8 }}>
                    <div style={{ position: "relative", marginBottom: 32 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#111", position: "absolute", left: -30, top: 4 }}></div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4 }}>Start</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111", lineHeight: 1.4 }}>District 4<br />Maintenance<br />Depot</div>
                    </div>

                    <div style={{ position: "relative" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#fff", border: "2px solid #111", position: "absolute", left: -30, top: 4 }}></div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 4 }}>Target Location</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111", lineHeight: 1.4 }}>West<br />Corridor,<br />Sector A-12</div>
                    </div>
                  </div>

                  <div style={{ position: "absolute", right: 24, bottom: 24, textAlign: "right" }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", fontWeight: 700, color: "#111", lineHeight: 1, marginBottom: 4 }}>12m</div>
                    <div style={{ fontSize: "0.7rem", color: "#6b7280", lineHeight: 1.2 }}>Est.<br />Travel</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 16 }}>
                <button 
                  onClick={() => {
                    if (activeItem?.raw_report?.id) {
                      updateReportStatus(activeItem.raw_report.id, "Under Review", "AI details verified by engineer");
                    }
                  }}
                  style={{ flex: 1.5, backgroundColor: "#000", color: "#fff", padding: "16px 24px", border: "none", borderRadius: 4, fontSize: "1rem", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  Verify & Schedule Repair <CheckCircle size={20} />
                </button>
                <button style={{ flex: 1, backgroundColor: "#fff", color: "#111", border: "1px solid #e5e7eb", padding: "16px 24px", borderRadius: 4, fontSize: "1rem", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  Escalate ! <AlertTriangle size={20} />
                </button>
                <button 
                  onClick={() => {
                    if (activeItem?.raw_report?.id) {
                      updateReportStatus(activeItem.raw_report.id, "Rejected", "Rejected during AI verification");
                    }
                  }}
                  style={{ flex: 1, backgroundColor: "#fff", color: "#dc2626", border: "1px solid #fca5a5", padding: "16px 24px", borderRadius: 4, fontSize: "1rem", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  Reject <XCircle size={20} />
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
