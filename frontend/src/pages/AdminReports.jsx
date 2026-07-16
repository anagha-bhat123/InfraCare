import React from "react";
import { 
  LayoutDashboard, BarChart3, AlertTriangle, 
  Wrench, Users, FileText, Search, Bell, Settings,
  Calendar, Download, ChevronDown, ChevronLeft, ChevronRight,
  Droplet, Car, Lightbulb, Grid, PenTool
} from "lucide-react";

export default function AdminReports({ setPage }) {
  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h1>InfraCare</h1>
          <span>MUNICIPAL ADMIN</span>
        </div>

        <nav className="admin-nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("dashboard"); }}>
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("analysis"); }}>
            <BarChart3 size={18} /> Analytics
          </a>
          <a href="#" className="active" onClick={(e) => { e.preventDefault(); setPage("admin-reports"); }}>
            <AlertTriangle size={18} /> Complaints
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("admin-maintenance"); }}>
            <Wrench size={18} /> Maintenance
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("admin-users"); }}>
            <Users size={18} /> User Management
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("admin-logs"); }}>
            <FileText size={18} /> System Logs
          </a>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user-profile bg-gray-50 p-4" onClick={(e) => { e.preventDefault(); setPage("admin-profile"); }} style={{cursor: "pointer"}}>
            <div className="admin-avatar-small-wrap text-avatar">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=32&h=32&q=80" alt="Admin" className="admin-avatar-small" />
            </div>
            <div className="admin-user-info">
              <strong>Admin Root</strong>
              <span>ID: 458293</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-area bg-white">
        {/* TOPBAR */}
        <header className="admin-top-nav no-border">
          <div className="admin-search-box full">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search report ID or citizen name..." />
          </div>
          <div className="admin-top-right">
            <button className="admin-icon-btn"><Bell size={18} /></button>
            <button className="admin-icon-btn"><Settings size={18} /></button>
            <div className="system-status">
              <span className="status-label-top">SYSTEM STATUS</span>
              <strong className="status-value-top">OPERATIONAL</strong>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="admin-scroll-content pt-4">
          <div className="admin-page-header border-bottom pb-4 mb-8">
            <div className="admin-header-text">
              <h2 className="serif-title large mb-2">Citizen Reports</h2>
              <p>Manage and audit infrastructure damage reports submitted via the civic portal. High-priority<br/>items require immediate dispatch.</p>
            </div>
            <div className="admin-header-actions">
              <button className="admin-btn-black">NEW REPORT <span>+</span></button>
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
                    <span className="number serif-title">142</span>
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
                  <span className="queue-badge">4 PRIORITY</span>
                </div>
                <div className="queue-list">
                  <div className="queue-item">
                    <div className="queue-item-top">
                      <span className="queue-critical">CRITICAL</span>
                      <span className="queue-time">12m ago</span>
                    </div>
                    <h5>Main St. Water Main Burst</h5>
                    <span className="queue-id">ID: #INF-9042</span>
                  </div>
                  <div className="queue-item">
                    <div className="queue-item-top">
                      <span className="queue-critical">CRITICAL</span>
                      <span className="queue-time">45m ago</span>
                    </div>
                    <h5>Hazardous Pothole Lane 4</h5>
                    <span className="queue-id">ID: #INF-8921</span>
                  </div>
                  <div className="queue-item">
                    <div className="queue-item-top">
                      <span className="queue-critical">CRITICAL</span>
                      <span className="queue-time">1h 10m ago</span>
                    </div>
                    <h5>Downed Power Line (West)</h5>
                    <span className="queue-id">ID: #INF-8810</span>
                  </div>
                </div>
                <button className="view-all-btn">VIEW ALL ESCALATIONS</button>
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
                    <button className="active">ALL</button>
                    <button>CRITICAL</button>
                    <button>MEDIUM</button>
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
                  <tr>
                    <td className="id-cell">#INF-<br/>9042</td>
                    <td className="type-cell">
                      <Droplet size={18} className="text-gray" />
                      <span>Water<br/>Main</span>
                    </td>
                    <td><span className="badge-critical">CRITICAL</span></td>
                    <td className="status-cell"><span className="dot line"></span> Pending</td>
                    <td className="date-cell">Oct 24,<br/>08:42</td>
                  </tr>
                  <tr>
                    <td className="id-cell">#INF-<br/>9038</td>
                    <td className="type-cell">
                      <Car size={18} className="text-gray" />
                      <span>Pothole</span>
                    </td>
                    <td><span className="badge-medium">MEDIUM</span></td>
                    <td className="status-cell"><span className="dot solid"></span> Verified</td>
                    <td className="date-cell">Oct 24,<br/>07:15</td>
                  </tr>
                  <tr>
                    <td className="id-cell">#INF-<br/>9011</td>
                    <td className="type-cell">
                      <Lightbulb size={18} className="text-gray" />
                      <span>Street<br/>Light</span>
                    </td>
                    <td><span className="badge-low">LOW</span></td>
                    <td className="status-cell"><span className="dot gray"></span> In<br/>Progress</td>
                    <td className="date-cell">Oct 23,<br/>22:30</td>
                  </tr>
                  <tr>
                    <td className="id-cell">#INF-<br/>8995</td>
                    <td className="type-cell">
                      <Grid size={18} className="text-gray" />
                      <span>Missing<br/>Sign</span>
                    </td>
                    <td><span className="badge-medium">MEDIUM</span></td>
                    <td className="status-cell"><span className="dot line"></span> Pending</td>
                    <td className="date-cell">Oct 23,<br/>19:12</td>
                  </tr>
                  <tr>
                    <td className="id-cell">#INF-<br/>8921</td>
                    <td className="type-cell">
                      <PenTool size={18} className="text-gray" />
                      <span>Road<br/>Damage</span>
                    </td>
                    <td><span className="badge-critical">CRITICAL</span></td>
                    <td className="status-cell"><span className="dot line"></span> Pending</td>
                    <td className="date-cell">Oct 23,<br/>16:45</td>
                  </tr>
                </tbody>
              </table>

              <div className="archive-footer table-pagination border-sides border-bottom bg-gray-50">
                <span className="results-text">SHOWING 1-15 OF 2,412 RESULTS</span>
                <div className="pagination pagination-new">
                  <button><ChevronLeft size={16} /></button>
                  <button className="active">1</button>
                  <button>2</button>
                  <button>3</button>
                  <span className="ellipsis">...</span>
                  <button>161</button>
                  <button><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
