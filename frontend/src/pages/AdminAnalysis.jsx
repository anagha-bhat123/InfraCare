import React, { useState } from "react";
import { 
  BarChart3, FileText, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight,
  FileSpreadsheet, Edit3, Filter, Calendar, Plus, X, ToggleLeft
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminAnalysis({ setPage }) {
  // Timeframe for Maintenance Velocity chart
  const [timeframe, setTimeframe] = useState("30D"); // "7D" | "30D" | "90D"

  // Dynamic bar data per district based on timeframe
  const velocityData = {
    "7D": [
      { code: "DIST-01", name: "Udupi Central", days: 2.1, pct: 42, color: "#16a34a" },
      { code: "DIST-02", name: "Manipal Hub", days: 3.5, pct: 70, color: "#f59e0b" },
      { code: "DIST-03", name: "Surathkal", days: 1.8, pct: 36, color: "#16a34a" },
      { code: "DIST-04", name: "Hampankatta", days: 4.2, pct: 84, color: "#dc2626" },
      { code: "DIST-05", name: "Lalbagh", days: 2.9, pct: 58, color: "#f59e0b" },
      { code: "DIST-06", name: "Malpe Port", days: 1.4, pct: 28, color: "#16a34a" },
      { code: "DIST-07", name: "Kadri Park", days: 3.1, pct: 62, color: "#f59e0b" }
    ],
    "30D": [
      { code: "DIST-01", name: "Udupi Central", days: 3.2, pct: 64, color: "#16a34a" },
      { code: "DIST-02", name: "Manipal Hub", days: 4.8, pct: 96, color: "#dc2626" },
      { code: "DIST-03", name: "Surathkal", days: 2.1, pct: 42, color: "#16a34a" },
      { code: "DIST-04", name: "Hampankatta", days: 5.5, pct: 100, color: "#dc2626" },
      { code: "DIST-05", name: "Lalbagh", days: 3.9, pct: 78, color: "#f59e0b" },
      { code: "DIST-06", name: "Malpe Port", days: 1.8, pct: 36, color: "#16a34a" },
      { code: "DIST-07", name: "Kadri Park", days: 4.2, pct: 84, color: "#f59e0b" }
    ],
    "90D": [
      { code: "DIST-01", name: "Udupi Central", days: 4.1, pct: 82, color: "#f59e0b" },
      { code: "DIST-02", name: "Manipal Hub", days: 5.2, pct: 98, color: "#dc2626" },
      { code: "DIST-03", name: "Surathkal", days: 3.0, pct: 60, color: "#16a34a" },
      { code: "DIST-04", name: "Hampankatta", days: 6.1, pct: 100, color: "#dc2626" },
      { code: "DIST-05", name: "Lalbagh", days: 4.5, pct: 90, color: "#dc2626" },
      { code: "DIST-06", name: "Malpe Port", days: 2.2, pct: 44, color: "#16a34a" },
      { code: "DIST-07", name: "Kadri Park", days: 4.9, pct: 94, color: "#dc2626" }
    ]
  };

  // Distribution Automation Triggers state
  const [triggers, setTriggers] = useState([
    { id: 1, name: "Planning Committee", schedule: "WEEKLY • MONDAY 08:00 AM", active: true },
    { id: 2, name: "Fiscal Oversight Board", schedule: "MONTHLY • 1ST DAY", active: true },
    { id: 3, name: "District PWD Inspectorate", schedule: "BI-WEEKLY • FRIDAY 05:00 PM", active: false }
  ]);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [newTriggerName, setNewTriggerName] = useState("");
  const [newTriggerFreq, setNewTriggerFreq] = useState("WEEKLY");
  const [newTriggerTime, setNewTriggerTime] = useState("09:00 AM");

  // Generated Reports Archive state
  const [archiveReports, setArchiveReports] = useState([
    { id: "REP-2026-001", title: "Q3 Coastal Infrastructure Durability Audit", date: "Oct 12, 2026 • 14:30", status: "VERIFIED", department: "Udupi Municipal PWD", completionRate: "94%" },
    { id: "REP-2026-002", title: "Annual Maintenance Velocity & Pothole Metrics", date: "Oct 05, 2026 • 09:15", status: "DRAFT", department: "Mangalore Urban Cell", completionRate: "78%" },
    { id: "REP-2026-003", title: "Monsoon Flood Prevention Readiness Assessment", date: "Sep 28, 2026 • 16:45", status: "VERIFIED", department: "Coastal Karnataka Infra Authority", completionRate: "91%" },
    { id: "REP-2026-004", title: "National Highway NH-66 Maintenance Report", date: "Sep 20, 2026 • 11:20", status: "VERIFIED", department: "National Highways Authority", completionRate: "88%" }
  ]);
  const [archiveFilter, setArchiveFilter] = useState("ALL"); // "ALL" | "VERIFIED" | "DRAFT"
  const [dateRangeFilter, setDateRangeFilter] = useState("ALL");
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState("");
  const [newReportDept, setNewReportDept] = useState("Udupi PWD");

  // Edit Report Modal state
  const [editingReport, setEditingReport] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filtered reports calculation
  const filteredArchive = archiveReports.filter(r => {
    if (archiveFilter !== "ALL" && r.status !== archiveFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredArchive.length / itemsPerPage) || 1;
  const paginatedArchive = filteredArchive.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Toggle trigger active status
  const toggleTrigger = (id) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  // Add new trigger
  const handleAddTrigger = (e) => {
    e.preventDefault();
    if (!newTriggerName.trim()) return;
    const newT = {
      id: Date.now(),
      name: newTriggerName.trim(),
      schedule: `${newTriggerFreq} • ${newTriggerTime}`,
      active: true
    };
    setTriggers(prev => [...prev, newT]);
    setNewTriggerName("");
    setIsTriggerModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "Automated Trigger Configured",
      text: `Report distribution trigger created for "${newT.name}".`,
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  };

  // Export PDF functionality
  const handleExportPDF = (report) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${report.title} - InfraCare Official Audit</title>
          <style>
            body { font-family: 'Segoe UI', serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .header { border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 24px; font-weight: 800; font-family: Georgia, serif; letter-spacing: -0.5px; }
            .badge { font-size: 12px; font-weight: 700; background: #111; color: #fff; padding: 4px 8px; text-transform: uppercase; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .meta-item b { display: block; font-size: 11px; color: #666; text-transform: uppercase; }
            .meta-item span { font-size: 14px; font-weight: 600; }
            .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            .table th, .table td { padding: 10px; border: 1px solid #e5e7eb; text-align: left; font-size: 13px; }
            .table th { background: #fafafa; font-weight: 700; font-size: 11px; text-transform: uppercase; }
            .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 11px; color: #666; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">INFRACARE MUNICIPAL SYSTEMS</div>
              <div style="font-size: 13px; color: #555;">Udupi & Mangalore District Infrastructure Audit</div>
            </div>
            <div class="badge">${report.status}</div>
          </div>

          <div class="section">
            <h1 style="font-family: Georgia, serif; font-size: 22px; margin: 0 0 12px;">${report.title}</h1>
            <div class="meta-grid">
              <div class="meta-item"><b>Report Identifier</b><span>#${report.id}</span></div>
              <div class="meta-item"><b>Generation Timestamp</b><span>${report.date}</span></div>
              <div class="meta-item"><b>Issuing Authority</b><span>${report.department}</span></div>
              <div class="meta-item"><b>Overall Resolution Rate</b><span>${report.completionRate}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Audit Overview</div>
            <p>This report documents the structural integrity, pothole remediation speed, and operational readiness metrics for municipal road networks across Udupi and Mangalore districts. All field records have been verified against citizen GPS reports and AI damage assessment models.</p>
          </div>

          <div class="section">
            <div class="section-title">District Performance Metrics</div>
            <table class="table">
              <thead>
                <tr>
                  <th>District Zone</th>
                  <th>Total Incidents</th>
                  <th>Avg Response Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Udupi Central (DIST-01)</td><td>42</td><td>3.2 Days</td><td>Optimal</td></tr>
                <tr><td>Manipal Hub (DIST-02)</td><td>68</td><td>4.8 Days</td><td>Action Required</td></tr>
                <tr><td>Surathkal Highway (DIST-03)</td><td>29</td><td>2.1 Days</td><td>Optimal</td></tr>
                <tr><td>Hampankatta (DIST-04)</td><td>84</td><td>5.5 Days</td><td>Critical Priority</td></tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <span>OFFICIAL MUNICIPAL DOCUMENT • CONFIDENTIAL</span>
            <span>SECURED VIA INFRACARE AES-256</span>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export CSV functionality
  const handleExportCSV = (report) => {
    const csvContent = [
      ["Report ID", "Document Title", "Issuing Department", "Generation Date", "Status", "Completion Rate"],
      [report.id, `"${report.title}"`, `"${report.department}"`, `"${report.date}"`, report.status, report.completionRate],
      ["DIST-01 Udupi Central", "Road Infrastructure Audit", "PWD Div 1", "2026-10-12", "VERIFIED", "92%"],
      ["DIST-02 Manipal Hub", "Pothole Remediation", "PWD Div 2", "2026-10-12", "IN PROGRESS", "74%"],
      ["DIST-03 Surathkal", "Drainage Inspection", "Stormwater Cell", "2026-10-10", "VERIFIED", "95%"],
      ["DIST-04 Hampankatta", "Pavement Stabilization", "MCC Div 4", "2026-10-08", "CRITICAL", "61%"]
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${report.id}_Audit_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.fire({
      icon: "success",
      title: "Data Exported",
      text: `CSV file for "${report.title}" has been downloaded.`,
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  };

  // Add new report
  const handleCreateNewReport = (e) => {
    e.preventDefault();
    if (!newReportTitle.trim()) return;
    const newRep = {
      id: `REP-2026-0${archiveReports.length + 1}`,
      title: newReportTitle.trim(),
      date: `${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      status: "DRAFT",
      department: newReportDept,
      completionRate: "100%"
    };
    setArchiveReports(prev => [newRep, ...prev]);
    setNewReportTitle("");
    setIsNewReportModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "New Report Generated",
      text: `Draft created for "${newRep.title}".`,
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  };

  // Update existing report
  const handleSaveEditReport = (e) => {
    e.preventDefault();
    if (!editingReport) return;
    setArchiveReports(prev => prev.map(r => r.id === editingReport.id ? editingReport : r));
    setEditingReport(null);
    Swal.fire({
      icon: "success",
      title: "Report Updated",
      text: "Changes saved to official audit records.",
      toast: true,
      position: "top-end",
      timer: 2500,
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
              <h2 className="serif-title large">Documentation Engine</h2>
              <p>High-fidelity municipal reporting for fiscal oversight and infrastructural assessment. All<br/>data is synchronized with real-time field reporting units across Udupi & Mangalore.</p>
            </div>
            <div className="admin-header-actions">
              <button className="admin-btn-black" onClick={() => setIsNewReportModalOpen(true)}>
                GENERATE NEW<br/>REPORT <ArrowRight size={16} className="ml-2 inline" />
              </button>
            </div>
          </div>

          <div className="analytics-top-widgets">
            
            {/* Maintenance Velocity Chart */}
            <div className="widget-card white-bg">
              <div className="widget-header">
                <div>
                  <h3 className="serif-title">Maintenance Velocity</h3>
                  <span className="sub-label">AVERAGE COMPLETION TIME BY DISTRICT (DAYS)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="timeline-toggles flex border-all" style={{ borderRadius: 4, overflow: "hidden", display: "inline-flex" }}>
                    {["7D", "30D", "90D"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setTimeframe(t);
                          Swal.fire({
                            toast: true,
                            position: "top-end",
                            icon: "info",
                            title: `Velocity View: ${t === '7D' ? 'Last 7 Days' : t === '30D' ? 'Last 30 Days' : 'Last 90 Days'}`,
                            showConfirmButton: false,
                            timer: 1500
                          });
                        }}
                        style={{
                          padding: "6px 14px",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: timeframe === t ? "#111" : "#fff",
                          color: timeframe === t ? "#fff" : "#333",
                          transition: "all 0.2s"
                        }}
                      >
                        {t === "7D" ? "7 Days" : t === "30D" ? "30 Days" : "90 Days"}
                      </button>
                    ))}
                  </div>
                  <div className="badge-light-green">LIVE SYNC</div>
                </div>
              </div>

              {/* Functional Bar Chart */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", border: "1px solid #e5e5e5", padding: "20px 16px 12px", background: "#fff", borderRadius: 4, minHeight: 190 }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 140, marginBottom: 12, padding: "0 10px" }}>
                  {velocityData[timeframe].map((item) => (
                    <div key={item.code} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: `${100 / velocityData[timeframe].length - 2}%`, height: "100%", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: item.color, marginBottom: 6 }}>
                        {item.days}d
                      </span>
                      <div style={{ width: "100%", height: "105px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                        <div 
                          title={`${item.name} (${item.code}): Avg ${item.days} days completion time`}
                          style={{ 
                            width: "100%", 
                            maxWidth: 32, 
                            height: `${Math.max(item.pct, 12)}%`, 
                            backgroundColor: item.color, 
                            borderRadius: "4px 4px 0 0",
                            transition: "all 0.4s ease-in-out",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
                            cursor: "pointer"
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="x-axis-labels" style={{ borderTop: "1px solid #f0f0f0", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                  {velocityData[timeframe].map((item) => (
                    <span key={item.code} style={{ fontSize: "0.65rem", fontWeight: 700, color: "#555" }}>{item.code}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Distribution Automation / Triggers */}
            <div className="widget-card dark-bg">
              <div className="widget-header">
                <h3 className="serif-title" style={{ color: "#fff" }}>
                  <BarChart3 size={16} className="mr-2 inline" /> Distribution Automation
                </h3>
              </div>
              <p className="dark-desc">
                Schedule recurring automated reporting<br/>to designated municipal committee<br/>stakeholders.
              </p>
              
              <div className="schedule-list">
                {triggers.map((trig) => (
                  <div className="schedule-item" key={trig.id}>
                    <div>
                      <strong>{trig.name}</strong>
                      <span>{trig.schedule}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => toggleTrigger(trig.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      title={trig.active ? "Deactivate Trigger" : "Activate Trigger"}
                    >
                      {trig.active ? <CheckCircle2 size={20} style={{ color: "#22c55e" }} /> : <ToggleLeft size={22} style={{ color: "#666" }} />}
                    </button>
                  </div>
                ))}
              </div>

              <button className="admin-btn-outline dark-mode full-width" style={{ marginTop: 16 }} onClick={() => setIsTriggerModalOpen(true)}>
                <Plus size={14} className="mr-2 inline" /> CONFIGURE NEW TRIGGER
              </button>
            </div>
          </div>

          {/* Area-Wise Road Conditions */}
          <div className="road-conditions-panel" style={{ marginTop: 24 }}>
            <div className="panel-header">
              <h3 className="serif-title">Area-Wise Road Conditions (Udupi & Mangalore)</h3>
              <div className="legend">
                <span className="legend-item"><span className="dot red"></span> CRITICAL</span>
                <span className="legend-item"><span className="dot orange"></span> WARNING</span>
                <span className="legend-item"><span className="dot green"></span> OPTIMAL</span>
              </div>
            </div>
            <div className="conditions-grid">
              {[
                { name: "Manipal", value: 88, color: "green" },
                { name: "Kalsanka", value: 64, color: "orange" },
                { name: "Surathkal", value: 92, color: "green" },
                { name: "Hampankatta", value: 58, color: "red" },
                { name: "Lalbagh", value: 79, color: "orange" },
                { name: "Malpe Rd", value: 89, color: "green" },
                { name: "Kadri Park", value: 85, color: "green" },
                { name: "Pumpwell", value: 72, color: "orange" },
              ].map((area, i) => (
                <div 
                  className="condition-card" 
                  key={i}
                  style={{ cursor: "pointer" }}
                  onClick={() => Swal.fire({
                    title: `${area.name} Zone Analysis`,
                    html: `<b>Structural Condition Score:</b> ${area.value}%<br/><b>Active Maintenance Squads:</b> 2 Teams Dispatched<br/><b>Status:</b> ${area.value >= 85 ? 'Optimal Maintenance' : area.value >= 65 ? 'Moderate Surface Wear' : 'Priority Repair Required'}`,
                    icon: area.value >= 85 ? 'success' : area.value >= 65 ? 'warning' : 'error'
                  })}
                >
                  <span className="area-name">{area.name}</span>
                  <div className="area-value">{area.value}%</div>
                  <div className="progress-bar">
                    <div 
                      className="fill" 
                      style={{
                        width: `${area.value}%`, 
                        backgroundColor: area.color === 'green' ? '#16a34a' : area.color === 'orange' ? '#f59e0b' : '#dc2626'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="floating-chart-btn" title="View Full Regional Map" onClick={() => setPage("map")} style={{ cursor: "pointer" }}>
              <BarChart3 size={20} />
            </div>
          </div>

          {/* Generated Reports Archive */}
          <div className="reports-archive-panel" style={{ marginTop: 24 }}>
            <div className="archive-header">
              <div>
                <h3 className="serif-title">Generated Reports Archive</h3>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Official municipal logs and audit exports</span>
              </div>
              <div className="archive-actions">
                <button 
                  className={`admin-btn-outline small ${archiveFilter !== 'ALL' ? 'selected-control' : ''}`}
                  onClick={() => setArchiveFilter(archiveFilter === 'ALL' ? 'VERIFIED' : archiveFilter === 'VERIFIED' ? 'DRAFT' : 'ALL')}
                >
                  <Filter size={14} className="mr-1 inline" /> FILTER: {archiveFilter}
                </button>
                <button 
                  className="admin-btn-outline small"
                  onClick={() => {
                    setDateRangeFilter(dateRangeFilter === "ALL" ? "Q3 2026" : "ALL");
                    Swal.fire({
                      toast: true,
                      position: 'top-end',
                      icon: 'info',
                      title: `Date Filter: ${dateRangeFilter === "ALL" ? "Q3 2026 Applied" : "Showing All Dates"}`,
                      showConfirmButton: false,
                      timer: 2000
                    });
                  }}
                >
                  <Calendar size={14} className="mr-1 inline" /> {dateRangeFilter === "ALL" ? "DATE RANGE" : dateRangeFilter}
                </button>
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
                {paginatedArchive.map((rep) => (
                  <tr key={rep.id}>
                    <td className="id-col">#{rep.id}</td>
                    <td className="title-col serif-title">
                      {rep.title}
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 400, marginTop: 2 }}>{rep.department}</div>
                    </td>
                    <td className="date-col">{rep.date}</td>
                    <td>
                      <span className={rep.status === 'VERIFIED' ? 'badge-light-green' : 'badge-light-orange'}>
                        {rep.status}
                      </span>
                    </td>
                    <td className="actions-col">
                      <button onClick={() => handleExportPDF(rep)} title="Generate PDF Document">
                        <FileText size={14} /> PDF
                      </button>
                      <button onClick={() => handleExportCSV(rep)} title="Export CSV Data">
                        <FileSpreadsheet size={14} /> EXCEL
                      </button>
                      <button onClick={() => setEditingReport(rep)} title="Edit Report Record">
                        <Edit3 size={14} /> EDIT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="archive-footer" style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e5e5" }}>
              <span>Showing {paginatedArchive.length} of {filteredArchive.length} records</span>
              <div className="pagination" style={{ display: "flex", gap: 8 }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, alignSelf: "center", padding: "0 8px" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  style={{ opacity: currentPage >= totalPages ? 0.5 : 1, cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="admin-page-footer" style={{ marginTop: 40, padding: "20px 0", borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280" }}>
            <div className="footer-brand">
              <h4 className="serif-title text-gray" style={{ fontSize: "0.85rem", color: "#4b5563" }}>INFRACARE MUNICIPAL SYSTEMS</h4>
              <span>DATA INTEGRITY SECURED VIA AES-256 PROTOCOL</span>
            </div>
            <div className="footer-stats" style={{ display: "flex", gap: 16 }}>
              <span>SYSTEM LOAD: NOMINAL</span>
              <span>LATENCY: 38MS</span>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL: Configure New Trigger */}
      {isTriggerModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyCenter: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: 480, margin: "0 auto", padding: 32, borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", margin: 0 }}>Configure Automated Trigger</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setIsTriggerModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTrigger} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                Target Committee / Body Name
                <input 
                  type="text" 
                  placeholder="e.g. Udupi Municipal Works Committee" 
                  value={newTriggerName}
                  onChange={(e) => setNewTriggerName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem" }}
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                  Frequency
                  <select 
                    value={newTriggerFreq} 
                    onChange={(e) => setNewTriggerFreq(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem", background: "#fff" }}
                  >
                    <option value="DAILY">DAILY</option>
                    <option value="WEEKLY">WEEKLY</option>
                    <option value="BI-WEEKLY">BI-WEEKLY</option>
                    <option value="MONTHLY">MONTHLY</option>
                  </select>
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                  Dispatch Time
                  <input 
                    type="text" 
                    placeholder="e.g. 08:00 AM" 
                    value={newTriggerTime}
                    onChange={(e) => setNewTriggerTime(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem" }}
                  />
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setIsTriggerModalOpen(false)} style={{ padding: "10px 16px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Save Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Generate New Report */}
      {isNewReportModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyCenter: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: 500, margin: "0 auto", padding: 32, borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", margin: 0 }}>Generate Municipal Audit Report</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setIsNewReportModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateNewReport} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                Document Title
                <input 
                  type="text" 
                  placeholder="e.g. Q4 Surathkal Highway Damage Assessment" 
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem" }}
                />
              </label>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                Issuing Department / Cell
                <input 
                  type="text" 
                  placeholder="e.g. Udupi PWD / Mangalore MCC" 
                  value={newReportDept}
                  onChange={(e) => setNewReportDept(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setIsNewReportModalOpen(false)} style={{ padding: "10px 16px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Generate & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Report */}
      {editingReport && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyCenter: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: 500, margin: "0 auto", padding: 32, borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", margin: 0 }}>Edit Report #{editingReport.id}</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setEditingReport(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEditReport} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                Document Title
                <input 
                  type="text" 
                  value={editingReport.title}
                  onChange={(e) => setEditingReport({ ...editingReport, title: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem" }}
                />
              </label>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                Status
                <select 
                  value={editingReport.status}
                  onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem", background: "#fff" }}
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setEditingReport(null)} style={{ padding: "10px 16px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
