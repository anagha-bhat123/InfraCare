import React from "react";
import { 
  LayoutDashboard, BarChart3, AlertTriangle, 
  Wrench, Users, FileText, Search, Bell, 
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight,
  Download, FileSpreadsheet, Edit3
} from "lucide-react";

export default function AdminAnalysis({ setPage }) {
  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "20px 40px" }}>
      <div style={{ width: "100%" }}>

      {/* MAIN CONTENT */}
      
        

        {/* PAGE CONTENT */}
        <div className="admin-scroll-content">
          <div className="admin-page-header">
            <div className="admin-header-text">
              <h2 className="serif-title large">Documentation Engine</h2>
              <p>High-fidelity municipal reporting for fiscal oversight and infrastructural assessment. All<br/>data is synchronized with real-time field reporting units.</p>
            </div>
            <div className="admin-header-actions">
              <button className="admin-btn-black" onClick={() => setPage("admin-reports")}>GENERATE NEW<br/>REPORT <ArrowRight size={16} className="ml-2" /></button>
            </div>
          </div>

          <div className="analytics-top-widgets">
            <div className="widget-card white-bg">
              <div className="widget-header">
                <div>
                  <h3 className="serif-title">Maintenance Velocity</h3>
                  <span className="sub-label">AVERAGE COMPLETION TIME BY DISTRICT (DAYS)</span>
                </div>
                <div className="badge-light-green">LIVE SYNC</div>
              </div>
              <div className="chart-placeholder">
                <div className="x-axis-labels">
                  <span>DIST-01</span><span>DIST-02</span><span>DIST-03</span><span>DIST-04</span><span>DIST-05</span><span>DIST-06</span><span>DIST-07</span>
                </div>
              </div>
            </div>

            <div className="widget-card dark-bg">
              <div className="widget-header">
                <h3 className="serif-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 inline"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> Distribution Automation</h3>
              </div>
              <p className="dark-desc">Schedule recurring automated reporting<br/>to designated municipal committee<br/>stakeholders.</p>
              
              <div className="schedule-list">
                <div className="schedule-item">
                  <div>
                    <strong>Planning Committee</strong>
                    <span>WEEKLY • MONDAY 08:00 AM</span>
                  </div>
                  <CheckCircle2 size={20} className="text-green" />
                </div>
                <div className="schedule-item">
                  <div>
                    <strong>Fiscal Oversight Board</strong>
                    <span>MONTHLY • 1ST DAY</span>
                  </div>
                  <div className="toggle-switch active"></div>
                </div>
              </div>

              <button className="admin-btn-outline dark-mode full-width">CONFIGURE NEW TRIGGER</button>
            </div>
          </div>

          <div className="road-conditions-panel">
            <div className="panel-header">
              <h3 className="serif-title">Area-Wise Road Conditions</h3>
              <div className="legend">
                <span className="legend-item"><span className="dot red"></span> CRITICAL</span>
                <span className="legend-item"><span className="dot orange"></span> WARNING</span>
                <span className="legend-item"><span className="dot green"></span> OPTIMAL</span>
              </div>
            </div>
            <div className="conditions-grid">
              {[
                { name: "North Gate", value: 81, color: "black" },
                { name: "Riverside", value: 89, color: "black" },
                { name: "Old Town", value: 66, color: "black" },
                { name: "Financial", value: 95, color: "black" },
                { name: "Market St", value: 68, color: "black" },
                { name: "East Quay", value: 89, color: "black" },
                { name: "Industrial", value: 88, color: "black" },
                { name: "Park View", value: 75, color: "black" },
              ].map((area, i) => (
                <div className="condition-card" key={i}>
                  <span className="area-name">{area.name}</span>
                  <div className="area-value">{area.value}%</div>
                  <div className="progress-bar"><div className="fill black" style={{width: `${area.value}%`}}></div></div>
                </div>
              ))}
            </div>
            <div className="floating-chart-btn">
              <BarChart3 size={20} />
            </div>
          </div>

          <div className="reports-archive-panel">
            <div className="archive-header">
              <h3 className="serif-title">Generated Reports Archive</h3>
              <div className="archive-actions">
                <button className="admin-btn-outline small"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> FILTER</button>
                <button className="admin-btn-outline small"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> DATE RANGE</button>
              </div>
            </div>
            
            <table className="reports-table">
              <thead>
                <tr>
                  <th>REPORT ID</th>
                  <th>DOCUMENT TITLE</th>
                  <th>GENERATION DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="id-col">#REP-2023-<br/>001</td>
                  <td className="title-col serif-title">Q3 Infrastructure Durability Audit</td>
                  <td className="date-col">Oct 12, 2023 •<br/>14:30</td>
                  <td><span className="badge-light-green">VERIFIED</span></td>
                  <td className="actions-col">
                    <button><FileText size={14} /> PDF</button>
                    <button><FileSpreadsheet size={14} /> EXCEL</button>
                  </td>
                </tr>
                <tr>
                  <td className="id-col">#REP-2023-<br/>002</td>
                  <td className="title-col serif-title">Annual Maintenance Velocity<br/>Metrics</td>
                  <td className="date-col">Oct 05, 2023 •<br/>09:15</td>
                  <td><span className="badge-light-orange">DRAFT</span></td>
                  <td className="actions-col">
                    <button><Edit3 size={14} /> EDIT</button>
                    <button><FileText size={14} /> PDF</button>
                  </td>
                </tr>
                <tr>
                  <td className="id-col">#REP-2023-<br/>003</td>
                  <td className="title-col serif-title">Flood Prevention Readiness<br/>Assessment</td>
                  <td className="date-col">Sep 28, 2023 •<br/>16:45</td>
                  <td><span className="badge-light-green">VERIFIED</span></td>
                  <td className="actions-col">
                    <button><FileText size={14} /> PDF</button>
                    <button><FileSpreadsheet size={14} /> EXCEL</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="archive-footer">
              <span>Showing 3 of 142 records</span>
              <div className="pagination">
                <button><ChevronLeft size={16} /></button>
                <button><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>

          <div className="admin-page-footer">
            <div className="footer-brand">
              <h4 className="serif-title text-gray">INFRACARE MUNICIPAL SYSTEMS</h4>
              <span>DATA INTEGRITY SECURED VIA AES-256 PROTOCOL</span>
            </div>
            <div className="footer-stats">
              <span>SYSTEM LOAD: NOMINAL</span>
              <span>LATENCY: 42MS</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
