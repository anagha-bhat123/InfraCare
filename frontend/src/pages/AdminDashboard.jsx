import React, { useState } from "react";
import { 
  BarChart3, AlertTriangle, Download, 
  ArrowRight, CheckCircle2, TrendingUp,
  Plus, Minus, Target
} from "lucide-react";
import MapPanel from "../components/MapPanel";
import Swal from "sweetalert2";

export default function AdminDashboard({ reports = [], setPage }) {
  const [trendTimeframe, setTrendTimeframe] = useState("Quarterly"); // "Monthly" | "Quarterly" | "Yearly"

  const total = reports.length || 4821;
  const verified = reports.filter(r => r.status === 'Resolved' || r.status === 'Verified' || r.ai_verified).length || 3104;
  const pending = reports.filter(r => r.status === 'Pending' || r.priority === 'High' || r.urgency === 'Critical').length || 1717;

  // Dynamic trend chart SVG paths based on timeframe
  const trendPaths = {
    Monthly: "M0,130 L50,110 L100,120 L150,90 L200,105 L250,50 L300,70 L350,85 L400,45 L450,30 L500,40",
    Quarterly: "M0,130 L50,125 L100,135 L150,110 L200,120 L250,70 L300,90 L350,110 L400,75 L450,60 L500,50",
    Yearly: "M0,140 L50,130 L100,115 L150,100 L200,85 L250,65 L300,55 L350,45 L400,35 L450,30 L500,25"
  };

  const trendLabels = {
    Monthly: ["WK 1", "WK 2", "WK 3", "WK 4", "WK 5", "WK 6", "WK 7", "WK 8"],
    Quarterly: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP"],
    Yearly: ["2020", "2021", "2022", "2023", "2024", "2025", "2026"]
  };

  const exportCSV = () => {
    if (!reports || reports.length === 0) {
      return Swal.fire({
        icon: "info",
        title: "No Data",
        text: "No reports currently available to export."
      });
    }
    const headers = ["ID", "Category", "Urgency", "Status", "Latitude", "Longitude", "Created At"];
    const rows = reports.map(r => [
      r.id,
      `"${r.category || 'General'}"`,
      r.urgency || "Normal",
      r.status || "Pending",
      r.latitude || 13.3409,
      r.longitude || 74.7421,
      `"${r.created_at || r.date || ''}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `InfraCare_Central_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "Export Complete",
      text: `Exported ${reports.length} report entries to CSV.`,
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  };

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "20px 40px" }}>
      <div style={{ width: "100%" }}>

        {/* PAGE CONTENT */}
        <div className="admin-scroll-content">
          <div className="admin-page-header">
            <div className="admin-header-text">
              <h2>Central Command Center</h2>
              <p>Real-time infrastructure oversight for Udupi & Mangalore Municipal Regions. Live citizen<br/>reporting & emergency field unit integration.</p>
            </div>
            <div className="admin-header-actions">
              <button className="admin-btn-outline" onClick={() => setPage("approval-authority")}>
                Budget<br/>Approvals
              </button>
              <button className="admin-btn-outline" onClick={exportCSV}>
                <Download size={16} className="inline mr-1" /> Export<br/>CSV
              </button>
              <button className="admin-btn-black" onClick={() => setPage("admin-maintenance")}>
                Deploy<br/>Crew <ArrowRight size={16} className="inline ml-1" />
              </button>
            </div>
          </div>

          <div className="admin-kpi-row">
            <div className="admin-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-box"><BarChart3 size={18} /></div>
                <div className="kpi-trend positive">+12.4% <TrendingUp size={14} /></div>
              </div>
              <div className="kpi-card-body">
                <span className="kpi-label">TOTAL SUBMISSIONS</span>
                <div className="kpi-value">{total}</div>
                <div className="kpi-desc">Reports received in Coastal Region</div>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-box"><CheckCircle2 size={18} /></div>
                <div className="kpi-badge black">VERIFIED</div>
              </div>
              <div className="kpi-card-body">
                <span className="kpi-label">RESOLVED / VERIFIED</span>
                <div className="kpi-value">{verified}</div>
                <div className="kpi-desc">64.3% efficiency rate</div>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-box danger"><AlertTriangle size={18} /></div>
                <div className="kpi-badge danger">42 Critical</div>
              </div>
              <div className="kpi-card-body">
                <span className="kpi-label">PENDING / CRITICAL</span>
                <div className="kpi-value">{pending}</div>
                <div className="kpi-desc">Requires immediate dispatch</div>
              </div>
            </div>

            <div className="admin-kpi-card" onClick={() => setPage("approval-authority")} style={{ cursor: "pointer", transition: "transform 0.15s" }}>
              <div className="kpi-card-header">
                <div className="kpi-icon-box" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}><Target size={18} /></div>
                <div className="kpi-badge" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>AUTHORITY</div>
              </div>
              <div className="kpi-card-body">
                <span className="kpi-label">BUDGET APPROVALS</span>
                <div className="kpi-value" style={{ fontSize: "1.4rem" }}>Rs. 4.1L</div>
                <div className="kpi-desc" style={{ color: "#0284c7", fontWeight: 700 }}>Click to Manage & Authorize &rarr;</div>
              </div>
            </div>
          </div>

          <div className="admin-middle-row">
            <div className="admin-chart-card">
              <div className="chart-card-top">
                <div>
                  <h3>Damage Trends</h3>
                  <p>Aggregated reporting frequency<br/>({trendTimeframe} Analysis)</p>
                </div>
                <div className="chart-toggles">
                  {["Monthly", "Quarterly", "Yearly"].map(t => (
                    <button 
                      key={t} 
                      className={trendTimeframe === t ? "active" : ""}
                      onClick={() => setTrendTimeframe(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-visual-area">
                <div className="chart-line-svg-placeholder">
                  {/* Interactive SVG line visualization */}
                  <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{width: '100%', height: '100%'}}>
                    <path d={trendPaths[trendTimeframe]} fill="none" stroke="#111" strokeWidth="2.5" style={{ transition: "all 0.5s ease-in-out" }} />
                  </svg>
                  <div className="chart-tooltip" style={{ left: '50%', top: '70px', transform: 'translate(-50%, -100%)' }}>
                    <strong>ACTIVE PERIOD</strong>
                    <span>1,248 Incidents</span>
                  </div>
                </div>
                <div className="chart-x-axis">
                  {trendLabels[trendTimeframe].map(l => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-team-card">
              <h3>Team Efficiency</h3>
              <div className="team-list">
                <div className="team-item">
                  <div className="team-item-header"><span>Structural Crew Alpha (Udupi)</span> <strong>88%</strong></div>
                  <div className="team-progress"><div className="fill black" style={{width: '88%'}}></div></div>
                </div>
                <div className="team-item">
                  <div className="team-item-header"><span>Pothole Response B (Mangalore)</span> <strong>62%</strong></div>
                  <div className="team-progress"><div className="fill black" style={{width: '62%'}}></div></div>
                </div>
                <div className="team-item">
                  <div className="team-item-header"><span>Lighting Tech Unit (Manipal)</span> <strong>94%</strong></div>
                  <div className="team-progress"><div className="fill black" style={{width: '94%'}}></div></div>
                </div>
                <div className="team-item">
                  <div className="team-item-header"><span>Sanitation & Clear (Surathkal)</span> <strong>45%</strong></div>
                  <div className="team-progress"><div className="fill red" style={{width: '45%'}}></div></div>
                </div>
              </div>
              <button className="admin-btn-outline full-width" onClick={() => setPage("admin-logs")}>VIEW CREW LOGS</button>
            </div>
          </div>

          <div className="admin-map-card">
            <div className="map-hotspot-panel">
              <h4>DAMAGE HOTSPOTS</h4>
              <div className="hotspot-list">
                <label className="hotspot-item">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark black"></span>
                  Structural Integrity
                  <span className="dot red"></span>
                </label>
                <label className="hotspot-item">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark black"></span>
                  Pothole Alerts
                  <span className="dot orange"></span>
                </label>
                <label className="hotspot-item">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Street Lighting
                  <span className="dot blue"></span>
                </label>
              </div>
            </div>
            
            <div className="map-controls-panel">
              <button title="Zoom In"><Plus size={16} /></button>
              <button title="Zoom Out"><Minus size={16} /></button>
              <button className="crosshair" title="Recenter Map"><Target size={16} /></button>
            </div>

            <div className="map-bottom-tags">
              <div className="map-tag critical"><span className="dot red"></span> CRITICAL PRIORITY</div>
              <div className="map-tag">ZOOM: UDUPI / MANGALORE</div>
            </div>

            <div className="admin-map-container">
              <MapPanel coords={[13.3409, 74.7421]} zoom={12} reports={reports} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


