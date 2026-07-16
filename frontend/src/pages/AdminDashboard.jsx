import React from "react";
import { 
  Building2, LayoutDashboard, BarChart3, AlertTriangle, 
  Wrench, Users, FileText, LogOut, Search, Bell, Download, 
  ArrowRight, ArrowUpRight, CheckCircle2, TrendingUp, AlertCircle,
  Plus, Minus, Target
} from "lucide-react";
import MapPanel from "../components/MapPanel";

export default function AdminDashboard({ setPage }) {
  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "20px 40px" }}>
      <div style={{ width: "100%" }}>

      {/* MAIN CONTENT */}
      
        

        {/* PAGE CONTENT */}
        <div className="admin-scroll-content">
          <div className="admin-page-header">
            <div className="admin-header-text">
              <h2>Central Command Center</h2>
              <p>Real-time infrastructure oversight for the City of New York. Monitoring 5 boroughs<br/>with live citizen reporting integration.</p>
            </div>
            <div className="admin-header-actions">
              <button className="admin-btn-outline"><Download size={16} /> Export<br/>PDF</button>
              <button className="admin-btn-black" onClick={() => setPage("admin-maintenance")}>Deploy<br/>Crew <ArrowRight size={16} /></button>
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
                <div className="kpi-value">4,821</div>
                <div className="kpi-desc">Reports received in Q3</div>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-box"><CheckCircle2 size={18} /></div>
                <div className="kpi-badge black">VERIFIED</div>
              </div>
              <div className="kpi-card-body">
                <span className="kpi-label">RESOLVED ISSUES</span>
                <div className="kpi-value">3,104</div>
                <div className="kpi-desc">64.3% efficiency rate</div>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-card-header">
                <div className="kpi-icon-box danger"><AlertTriangle size={18} /></div>
                <div className="kpi-badge danger">42 Critical</div>
              </div>
              <div className="kpi-card-body">
                <span className="kpi-label">PENDING REVIEW</span>
                <div className="kpi-value">1,717</div>
                <div className="kpi-desc">Requires immediate dispatch</div>
              </div>
            </div>
          </div>

          <div className="admin-middle-row">
            <div className="admin-chart-card">
              <div className="chart-card-top">
                <div>
                  <h3>Damage Trends</h3>
                  <p>Aggregated reporting frequency<br/>(Quarterly Analysis)</p>
                </div>
                <div className="chart-toggles">
                  <button>Monthly</button>
                  <button className="active">Quarterly</button>
                  <button>Yearly</button>
                </div>
              </div>
              <div className="chart-visual-area">
                <div className="chart-line-svg-placeholder">
                  {/* Pseudo SVG line for visualization */}
                  <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={{width: '100%', height: '100%'}}>
                    <path d="M0,130 L50,125 L100,135 L150,110 L200,120 L250,70 L300,90 L350,110 L400,75 L450,60 L500,50" fill="none" stroke="#111" strokeWidth="2" />
                  </svg>
                  <div className="chart-tooltip" style={{ left: '50%', top: '70px', transform: 'translate(-50%, -100%)' }}>
                    <strong>AUG 15</strong>
                    <span>1,248</span>
                  </div>
                </div>
                <div className="chart-x-axis">
                  <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span>
                </div>
              </div>
            </div>

            <div className="admin-team-card">
              <h3>Team Efficiency</h3>
              <div className="team-list">
                <div className="team-item">
                  <div className="team-item-header"><span>Structural Crew Alpha</span> <strong>88%</strong></div>
                  <div className="team-progress"><div className="fill black" style={{width: '88%'}}></div></div>
                </div>
                <div className="team-item">
                  <div className="team-item-header"><span>Pothole Response B</span> <strong>62%</strong></div>
                  <div className="team-progress"><div className="fill black" style={{width: '62%'}}></div></div>
                </div>
                <div className="team-item">
                  <div className="team-item-header"><span>Lighting Tech Unit</span> <strong>94%</strong></div>
                  <div className="team-progress"><div className="fill black" style={{width: '94%'}}></div></div>
                </div>
                <div className="team-item">
                  <div className="team-item-header"><span>Sanitation & Clear</span> <strong>45%</strong></div>
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
              <button><Plus size={16} /></button>
              <button><Minus size={16} /></button>
              <button className="crosshair"><Target size={16} /></button>
            </div>

            <div className="map-bottom-tags">
              <div className="map-tag critical"><span className="dot red"></span> CRITICAL PRIORITY</div>
              <div className="map-tag">ZOOM: MANHATTAN</div>
            </div>

            <div className="admin-map-container">
              <MapPanel coords={[40.7128, -74.006]} zoom={12} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

