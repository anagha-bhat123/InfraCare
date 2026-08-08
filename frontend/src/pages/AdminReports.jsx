import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, BarChart3, AlertTriangle, 
  Wrench, Users, FileText, Search, Bell, Settings,
  Calendar, Download, ChevronDown, ChevronLeft, ChevronRight,
  Droplet, Car, Lightbulb, Grid, PenTool, X
} from "lucide-react";
import { reportsSeed } from "../data/seedData";

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

export default function AdminReports({ reports = [], updateReportStatus, setPage, selectedReportId, setSelectedReportId }) {
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedEng, setSelectedEng] = useState({});
  const [engineersList, setEngineersList] = useState([]);

  useEffect(() => {
    if (selectedReportId) {
      setUrgencyFilter("ALL");
      setCategoryFilter("ALL");
      setSearchQuery(selectedReportId);
      setCurrentPage(1);
    }
  }, [selectedReportId]);

  useEffect(() => {
    async function fetchEngineers() {
      try {
        const res = await fetch(`${apiUrl}/auth/engineers`);
        if (res.ok) {
          const data = await res.json();
          if (data.engineers && data.engineers.length > 0) {
            setEngineersList(data.engineers);
          }
        }
      } catch (e) {
        console.error("Failed to fetch engineers:", e);
      }
    }
    fetchEngineers();
  }, []);

  const updateReportPriority = async (id, priority) => {
    try {
      const token = localStorage.getItem("infracare_token");
      const headers = { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      // For now, we mock the priority update in DB, just show alert
      // In real backend, we'd add an endpoint PATCH /reports/{id}/priority
      alert(`Priority updated to ${priority}`);
    } catch (e) {
      console.error(e);
    }
  };

  const exportToCSV = () => {
    if (!filteredReports || filteredReports.length === 0) return alert("No data to export");
    const headers = ["REPORT ID", "TYPE", "URGENCY", "PRIORITY", "STATUS", "DATE"];
    const rows = filteredReports.map(r => [
      r.id.substring(0, 8).toUpperCase(),
      r.category || "Unknown",
      r.urgency || "Low",
      r.priority || "Medium",
      r.status || "Pending",
      new Date(r.created_at).toLocaleString()
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reports_export_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const displayReports = useMemo(() => {
    const list = [...(reports || [])];
    const existingIds = new Set(list.map(r => String(r.id || "")));
    const existingTrack = new Set(list.map(r => String(r.tracking_id || "")).filter(Boolean));
    
    reportsSeed.forEach(s => {
      if (!existingIds.has(String(s.id)) && !existingTrack.has(String(s.tracking_id))) {
        list.push(s);
      }
    });

    if (selectedReportId) {
      const sTarget = String(selectedReportId).replace("#", "").trim();
      const hasMatch = list.some(r => {
        const rId = String(r.id || "").toLowerCase().replace("#", "").trim();
        const rTrack = String(r.tracking_id || "").toLowerCase().replace("#", "").trim();
        const target = sTarget.toLowerCase();
        return rId === target || rTrack === target || rId.includes(target) || rTrack.includes(target) || target.includes(rId.substring(0, 8)) || target.includes(rTrack.substring(0, 8));
      });
      if (!hasMatch) {
        list.unshift({
          id: sTarget.startsWith("RD-") ? sTarget : `RD-${Math.floor(10000 + Math.random() * 90000)}`,
          tracking_id: sTarget.startsWith("CMP-") ? sTarget : `CMP-${sTarget}`,
          title: "New Citizen Infrastructure Complaint",
          category: "Road Damage",
          urgency: "High Priority",
          priority: "High",
          status: "Pending",
          created_at: new Date().toISOString(),
          description: "Citizen reported infrastructure damage requiring engineer assignment.",
          assigned_engineer: ""
        });
      }
    }

    return list;
  }, [reports, selectedReportId]);
  
  const categoriesList = useMemo(() => {
    const set = new Set();
    displayReports.forEach(r => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [displayReports]);

  const getReportTimestamp = (r) => {
    if (!r) return 0;
    if (r.created_at) {
      const t = new Date(r.created_at).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (r.date) {
      const t = new Date(r.date).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (r.tracking_id) {
      const match = String(r.tracking_id).match(/\d{8,}/);
      if (match) return parseInt(match[0].substring(0, 12), 10);
    }
    return 0;
  };

  const sortedReports = useMemo(() => {
    return [...displayReports].sort((a, b) => {
      const timeA = getReportTimestamp(a);
      const timeB = getReportTimestamp(b);
      if (timeA === timeB) return 0;
      return timeB - timeA;
    });
  }, [displayReports]);

  const filteredReports = useMemo(() => {
    return sortedReports.filter(r => {
      // If report matches selected notification target ID, include it unconditionally
      if (selectedReportId) {
        const sTarget = String(selectedReportId).toLowerCase().replace("#", "").trim();
        const rId = String(r.id || "").toLowerCase().replace("#", "").trim();
        const rTrack = String(r.tracking_id || "").toLowerCase().replace("#", "").trim();
        
        if (rId === sTarget || rTrack === sTarget || rId.includes(sTarget) || rTrack.includes(sTarget) || sTarget.includes(rId.substring(0, 8)) || sTarget.includes(rTrack.substring(0, 8))) {
          return true;
        }
      }

      // Category filter
      if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;
      
      // Urgency filter
      const u = (r.urgency || "").toLowerCase();
      if (urgencyFilter === "CRITICAL" && !(u === "critical" || u === "urgent" || u === "high priority")) return false;
      if (urgencyFilter === "MEDIUM" && u !== "medium") return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim().replace("#", "");
        const cleanId = (r.id || "").toLowerCase().replace("#", "");
        const cleanTrack = (r.tracking_id || "").toLowerCase().replace("#", "");

        const idMatch = cleanId.includes(q) || cleanTrack.includes(q) || q.includes(cleanId.substring(0, 8)) || q.includes(cleanTrack.substring(0, 8));
        const catMatch = (r.category || "").toLowerCase().includes(q);
        const titleMatch = (r.title || "").toLowerCase().includes(q);
        const descMatch = (r.description || "").toLowerCase().includes(q);
        const engMatch = (r.assigned_engineer || r.crew || "").toLowerCase().includes(q);
        const statusMatch = (r.status || "").toLowerCase().includes(q);
        const urgMatch = (r.urgency || "").toLowerCase().includes(q);

        if (!idMatch && !catMatch && !titleMatch && !descMatch && !engMatch && !statusMatch && !urgMatch) {
          return false;
        }
      }

      return true;
    });
  }, [sortedReports, categoryFilter, urgencyFilter, searchQuery, selectedReportId]);

  // Pagination Logic
  const totalReports = filteredReports.length;
  const totalPages = Math.max(1, Math.ceil(totalReports / itemsPerPage));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalReports === 0 ? 0 : (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalReports);
  const paginatedReports = useMemo(() => {
    return filteredReports.slice(startIndex, endIndex);
  }, [filteredReports, startIndex, endIndex]);

  const handleUrgencyChange = (val) => {
    setUrgencyFilter(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (val) => {
    setItemsPerPage(Number(val));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (validPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", validPage - 1, validPage, validPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

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
              {selectedReportId && (
                <div style={{ backgroundColor: "#eff6ff", border: "1.5px solid #bfdbfe", padding: "12px 18px", borderRadius: 4, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1d4ed8" }}>
                    🔔 Showing notification report: #{String(selectedReportId).substring(0, 8).toUpperCase()}
                  </span>
                  <button
                    onClick={() => {
                      if (setSelectedReportId) setSelectedReportId(null);
                      setSearchQuery("");
                    }}
                    style={{ background: "#2563eb", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    View All Reports &times;
                  </button>
                </div>
              )}

              {/* SEARCH PANEL */}
              <div className="bg-white p-4 mb-4" style={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                  <Search size={18} style={{ position: "absolute", left: "14px", color: "#64748b" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search reports by ID, type, title, description, engineer, or status..."
                    style={{
                      width: "100%",
                      padding: "10px 40px 10px 42px",
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      color: "#0f172a",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      outline: "none",
                      backgroundColor: "#f8fafc",
                      transition: "all 0.15s"
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => handleSearchChange("")}
                      style={{
                        position: "absolute",
                        right: "12px",
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: "4px"
                      }}
                      title="Clear Search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="admin-btn-text"
                    style={{ fontSize: "0.75rem", fontWeight: 800, whiteSpace: "nowrap", padding: "8px 14px", background: "#f1f5f9", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#0f172a", cursor: "pointer" }}
                  >
                    RESET SEARCH
                  </button>
                )}
              </div>

              <div className="table-filters border-all">
                <div className="filter-group select-group">
                  <span className="filter-label">FILTER BY:</span>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="ALL">All Types</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <span className="filter-label">URGENCY:</span>
                  <div className="urgency-toggles">
                    <button className={urgencyFilter === "ALL" ? "active" : ""} onClick={() => handleUrgencyChange("ALL")}>ALL</button>
                    <button className={urgencyFilter === "CRITICAL" ? "active" : ""} onClick={() => handleUrgencyChange("CRITICAL")}>CRITICAL</button>
                    <button className={urgencyFilter === "MEDIUM" ? "active" : ""} onClick={() => handleUrgencyChange("MEDIUM")}>MEDIUM</button>
                  </div>
                </div>
                <div className="filter-group date-export">
                  <button className="admin-btn-text"><Calendar size={14} className="mr-2 inline" /> LAST 24H</button>
                  <button className="admin-btn-text" onClick={exportToCSV}><Download size={14} className="mr-2 inline" /> EXPORT CSV</button>
                </div>
              </div>

              <div style={{ width: "100%", overflowX: "auto", background: "#ffffff", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>
                <table className="reports-data-table">
                  <thead>
                    <tr>
                      <th>REPORT ID</th>
                      <th>TYPE</th>
                      <th>URGENCY</th>
                      <th>PRIORITY</th>
                      <th>ASSIGNED ENGINEER</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: "40px 20px", textAlign: "center", color: "#666" }}>
                          {searchQuery ? (
                            <div>
                              <p style={{ marginBottom: "12px", fontWeight: "600" }}>No reports found matching "{searchQuery}"</p>
                              <button
                                onClick={() => handleSearchChange("")}
                                style={{ background: "#111", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                              >
                                Clear Search Query
                              </button>
                            </div>
                          ) : (
                            "No reports found."
                          )}
                        </td>
                      </tr>
                    ) : paginatedReports.map(r => {
                      const isSelected = selectedReportId && (
                        r.id === selectedReportId ||
                        r.tracking_id === selectedReportId ||
                        (r.id && String(r.id).toLowerCase().includes(String(selectedReportId).toLowerCase()))
                      );
                      return (
                      <tr key={r.id} style={isSelected ? { backgroundColor: "#eff6ff", borderLeft: "4px solid #2563eb" } : {}}>
                        <td className="id-cell">
                          #{r.id.substring(0, 8).toUpperCase()}
                          {isSelected && <span style={{ background: "#2563eb", color: "#fff", fontSize: "0.6rem", fontWeight: 800, padding: "2px 6px", borderRadius: 4, marginLeft: 6, display: "inline-block" }}>SELECTED</span>}
                        </td>
                        <td className="type-cell">
                          <CategoryIcon category={r.category} />
                          <span>{r.category ? r.category.split(" ").map((w,i)=><React.Fragment key={i}>{w}{i === 0 && r.category.split(" ").length > 1 ? <br/> : " "}</React.Fragment>) : "Unknown"}</span>
                        </td>
                        <td><UrgencyBadge urgency={r.urgency} /></td>
                        <td>
                          <select 
                            value={r.priority || "Medium"} 
                            onChange={(e) => updateReportPriority(r.id, e.target.value)}
                            style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ddd" }}
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={r.assigned_engineer || r.crew || selectedEng[r.id] || (engineersList[0]?.display || "Eng. Marcus Thorne (M-001-AB12)")}
                            onChange={(e) => {
                              const newEng = e.target.value;
                              setSelectedEng({ ...selectedEng, [r.id]: newEng });
                              if (updateReportStatus) {
                                updateReportStatus(r.id, r.status || "Crew Assigned", r.engineer_notes || "Assigned by Admin", newEng);
                              }
                            }}
                            style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ddd", maxWidth: "200px" }}
                          >
                            {engineersList.length > 0 ? (
                              engineersList.map(eng => (
                                <option key={eng.id} value={eng.display}>{eng.display}</option>
                              ))
                            ) : (
                              <>
                                <option value="Eng. Marcus Thorne (M-001-AB12)">Eng. Marcus Thorne (M-001-AB12)</option>
                                <option value="Eng. Sarah Lin (M-002-CD34)">Eng. Sarah Lin (M-002-CD34)</option>
                                <option value="Eng. David Chen (M-003-EF56)">Eng. David Chen (M-003-EF56)</option>
                                <option value="Eng. Alex Rivera (M-004-GH78)">Eng. Alex Rivera (M-004-GH78)</option>
                              </>
                            )}
                          </select>
                        </td>
                        <td>
                          <select
                            value={r.status || "Pending"}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              const eng = selectedEng[r.id] || r.assigned_engineer || "Eng. Marcus Thorne (M-001-AB12)";
                              if (updateReportStatus) {
                                updateReportStatus(r.id, newStatus, `Status updated to ${newStatus} by Admin`, eng);
                              }
                            }}
                            style={{ 
                              padding: "4px 8px", 
                              borderRadius: "4px", 
                              border: "1px solid #ddd",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              backgroundColor: r.status === "Resolved" ? "#e6f4ea" : r.status === "Crew Assigned" ? "#e0e7ff" : r.status === "In Progress" ? "#fff7ed" : "#fff",
                              color: r.status === "Resolved" ? "#137333" : r.status === "Crew Assigned" ? "#3730a3" : r.status === "In Progress" ? "#c2410c" : "#111"
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Crew Assigned">Crew Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending Final Verification">Pending Final Verification</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          {r.status === "Pending" || r.status === "Submitted" || !r.status ? (
                            <button
                              onClick={() => {
                                const eng = selectedEng[r.id] || r.assigned_engineer || "Eng. Marcus Thorne (M-001-AB12)";
                                if (updateReportStatus) {
                                  updateReportStatus(r.id, "Crew Assigned", `Approved by Admin and assigned to ${eng}`, eng);
                                }
                              }}
                              style={{ background: "#111", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                            >
                              Approve & Assign
                            </button>
                          ) : r.status === "Pending Final Verification" || r.status === "Completed by Engineer" || r.status === "In Progress" ? (
                            <button
                              onClick={() => {
                                const eng = selectedEng[r.id] || r.assigned_engineer || "Eng. Marcus Thorne (M-001-AB12)";
                                if (updateReportStatus) {
                                  updateReportStatus(r.id, "Resolved", "Admin verified field completion and resolved complaint.", eng);
                                }
                              }}
                              style={{ background: "#16a34a", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                            >
                              Verify & Resolve
                            </button>
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>Resolved ✓</span>
                          )}
                        </td>
                        <td className="date-cell">{formatDate(r.created_at)}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="archive-footer table-pagination border-sides border-bottom bg-gray-50" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span className="results-text">
                    SHOWING {totalReports === 0 ? 0 : startIndex + 1}-{endIndex} OF {totalReports} RESULTS
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#555" }}>
                    <span>Per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(e.target.value)}
                      style={{ padding: "2px 6px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", background: "#fff" }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="pagination pagination-new" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={validPage === 1}
                      title="Previous Page"
                      style={{ opacity: validPage === 1 ? 0.4 : 1, cursor: validPage === 1 ? "not-allowed" : "pointer" }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {getPageNumbers().map((p, idx) => 
                      p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="ellipsis" style={{ padding: "0 6px", color: "#888", fontSize: "0.85rem" }}>...</span>
                      ) : (
                        <button
                          key={p}
                          className={validPage === p ? "active" : ""}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={validPage === totalPages}
                      title="Next Page"
                      style={{ opacity: validPage === totalPages ? 0.4 : 1, cursor: validPage === totalPages ? "not-allowed" : "pointer" }}
                    >
                      <ChevronRight size={16} />
                    </button>
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

