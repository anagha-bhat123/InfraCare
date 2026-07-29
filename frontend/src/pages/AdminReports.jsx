import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, BarChart3, AlertTriangle, 
  Wrench, Users, FileText, Search, Bell, Settings,
  Calendar, Download, ChevronDown, ChevronLeft, ChevronRight,
  Droplet, Car, Lightbulb, Grid, PenTool
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const CategoryIcon = ({ category }) => {
  const size = 18;
  const className = "text-gray";
  switch (category) {
    case "Road Damage": return <PenTool size={size} className={className} />;
    case "Water Leak": return <Droplet size={size} className={className} />;
    case "Fallen Tree": return <AlertTriangle size={size} className={className} />;
    case "Street Light": return <Lightbulb size={size} className={className} />;
    case "Missing Sign": return <Grid size={size} className={className} />;
    default: return <Car size={size} className={className} />;
  }
};

const UrgencyBadge = ({ urgency }) => {
  const u = (urgency || "").toLowerCase();
  if (u === "critical" || u === "urgent" || u === "high priority") return <span className="badge-critical">CRITICAL</span>;
  if (u === "medium") return <span className="badge-medium">MEDIUM</span>;
  return <span className="badge-low">{urgency ? urgency.toUpperCase() : "LOW"}</span>;
};

const StatusBadge = ({ status }) => {
  const s = (status || "Pending").toLowerCase();
  if (s === "verified") return <><span className="dot solid"></span> Verified</>;
  if (s === "in progress" || s === "assigned") return <><span className="dot gray"></span> In Progress</>;
  if (s === "resolved" || s === "completed") return <><span className="dot solid" style={{background: "#2e7d32"}}></span> Resolved</>;
  return <><span className="dot line"></span> Pending</>;
};

export default function AdminReports({ reports = [], setPage }) {
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  const today = new Date().toISOString().split('T')[0];
  const reportsToday = reports.filter(r => r.created_at && r.created_at.startsWith(today)).length;
  
  const criticalReports = reports.filter(r => {
    const u = (r.urgency || "").toLowerCase();
    return u === "critical" || u === "urgent" || u === "high priority";
  }).slice(0, 3); // top 3 for queue

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return <>{datePart},<br/>{timePart}</>;
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000); // mins
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ${diff % 60}m ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const filteredReports = reports.filter(r => {
    if (urgencyFilter === "ALL") return true;
    const u = (r.urgency || "").toLowerCase();
    if (urgencyFilter === "CRITICAL") return u === "critical" || u === "urgent" || u === "high priority";
    if (urgencyFilter === "MEDIUM") return u === "medium";
    return true;
  });

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "20px 40px" }}>
      <div style={{ width: "100%" }}>
        <div className="admin-scroll-content pt-4">
          <div className="admin-page-header border-bottom pb-4 mb-8">
            <div className="admin-header-text">
              <h2 className="serif-title large mb-2">Citizen Reports</h2>
              <p>Manage and audit infrastructure damage reports submitted via the civic portal. High-priority<br/>items require immediate dispatch.</p>
            </div>
            <div className="admin-header-actions">
              <button className="admin-btn-black" onClick={() => setPage("report")}>NEW REPORT <span>+</span></button>
            </div>
          </div>

          <div className="complaints-layout">
            <div className="complaints-left">
              {/* QUICK STATS */}
              <div className="quick-stats-card">
                <h4 className="stats-header">QUICK STATS</h4>
                <div className="stat-group">
                  <span className="stat-label">Reports Today</span>
                  <div className="stat-value">
                    <span className="number serif-title">{reportsToday}</span>
                    <span className="trend text-red">+12%<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 inline"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span>
                  </div>
                </div>
                <div className="stat-group">
                  <span className="stat-label">Avg. Resolution Time</span>
                  <div className="stat-value">
                    <span className="number serif-title">4.2</span>
                    <span className="unit">hrs</span>
                  </div>
                </div>
                <div className="stat-progress">
                  <div className="progress-bar"><div className="fill black" style={{width: '65%'}}></div></div>
                  <span className="progress-label">65% OF WEEKLY QUOTA MET</span>
                </div>
              </div>

              {/* ESCALATION QUEUE */}
              <div className="escalation-queue">
                <div className="queue-header">
                  <h4>ESCALATION QUEUE</h4>
                  <span className="queue-badge">{criticalReports.length} PRIORITY</span>
                </div>
                <div className="queue-list">
                  {criticalReports.length > 0 ? criticalReports.map(r => (
                    <div className="queue-item" key={r.id}>
                      <div className="queue-item-top">
                        <span className="queue-critical">CRITICAL</span>
                        <span className="queue-time">{getTimeAgo(r.created_at)}</span>
                      </div>
                      <h5>{r.title || r.category || "Untitled Report"}</h5>
                      <span className="queue-id">ID: #{r.id.substring(0, 8)}</span>
                    </div>
                  )) : (
                    <div style={{padding: "20px 0", color: "#666", fontSize: "0.85rem"}}>No critical escalations at this time.</div>
                  )}
                </div>
                {criticalReports.length > 0 && <button className="view-all-btn">VIEW ALL ESCALATIONS</button>}
              </div>
            </div>

            <div className="complaints-main">
              <div className="table-filters border-all">
                <div className="filter-group select-group">
                  <span className="filter-label">FILTER BY:</span>
                  <select>
                    <option>All Types</option>
                  </select>
                </div>
                <div className="filter-group">
                  <span className="filter-label">URGENCY:</span>
                  <div className="urgency-toggles">
                    <button className={urgencyFilter === "ALL" ? "active" : ""} onClick={() => setUrgencyFilter("ALL")}>ALL</button>
                    <button className={urgencyFilter === "CRITICAL" ? "active" : ""} onClick={() => setUrgencyFilter("CRITICAL")}>CRITICAL</button>
                    <button className={urgencyFilter === "MEDIUM" ? "active" : ""} onClick={() => setUrgencyFilter("MEDIUM")}>MEDIUM</button>
                  </div>
                </div>
                <div className="filter-group date-export">
                  <button className="admin-btn-text"><Calendar size={14} className="mr-2 inline" /> LAST 24H</button>
                  <button className="admin-btn-text"><Download size={14} className="mr-2 inline" /> EXPORT</button>
                </div>
              </div>

              <table className="reports-data-table border-sides border-bottom">
                <thead>
                  <tr>
                    <th>REPORT ID</th>
                    <th>TYPE</th>
                    <th>URGENCY</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign: "center", padding: "40px"}}>No reports found.</td></tr>
                  ) : filteredReports.map(r => (
                    <tr key={r.id}>
                      <td className="id-cell">#{r.id.substring(0, 8).toUpperCase()}</td>
                      <td className="type-cell">
                        <CategoryIcon category={r.category} />
                        <span>{r.category ? r.category.split(" ").map((w,i)=><React.Fragment key={i}>{w}{i === 0 && r.category.split(" ").length > 1 ? <br/> : " "}</React.Fragment>) : "Unknown"}</span>
                      </td>
                      <td><UrgencyBadge urgency={r.urgency} /></td>
                      <td className="status-cell"><StatusBadge status={r.status} /></td>
                      <td className="date-cell">{formatDate(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="archive-footer table-pagination border-sides border-bottom bg-gray-50">
                <span className="results-text">SHOWING 1-{Math.min(filteredReports.length, 15)} OF {filteredReports.length} RESULTS</span>
                {filteredReports.length > 15 && (
                  <div className="pagination pagination-new">
                    <button><ChevronLeft size={16} /></button>
                    <button className="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <span className="ellipsis">...</span>
                    <button>{Math.ceil(filteredReports.length / 15)}</button>
                    <button><ChevronRight size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
