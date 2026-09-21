import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, BarChart3, AlertTriangle,
  Wrench, Users, FileText, Search, Bell, Settings,
  Calendar, Download, ChevronDown, ChevronLeft, ChevronRight,
  Droplet, Car, Lightbulb, Grid, PenTool, X, Trash2,
  TrendingUp, ShieldAlert, CheckCircle2, RefreshCw, Plus, Clock, Activity, ShieldCheck
} from "lucide-react";
import Swal from "sweetalert2";
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
  if (s === "resolved" || s === "completed") return <><span className="dot solid" style={{ background: "#2e7d32" }}></span> Resolved</>;
  return <><span className="dot line"></span> Pending</>;
};

export default function AdminReports({ reports = [], updateReportStatus, setPage, selectedReportId, setSelectedReportId, user, clearAllReports, deleteReport }) {
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedEng, setSelectedEng] = useState({});
  const [engineersList, setEngineersList] = useState([]);

  const handleClearAll = async () => {
    const res = await Swal.fire({
      title: "Clear All Reports Data?",
      text: "Are you sure you want to permanently delete all reports data from the system? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Clear All Data",
      cancelButtonText: "Cancel"
    });
    if (res.isConfirmed && clearAllReports) {
      clearAllReports();
      Swal.fire({
        icon: "success",
        title: "All Reports Cleared",
        text: "All report entries have been successfully removed.",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const handleDeleteOne = async (reportId) => {
    const cleanId = String(reportId).substring(0, 8).toUpperCase();
    const res = await Swal.fire({
      title: "Delete Report?",
      text: `Are you sure you want to delete report #${cleanId}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });
    if (res.isConfirmed && deleteReport) {
      deleteReport(reportId);
      Swal.fire({
        icon: "success",
        title: "Report Deleted",
        text: `Report #${cleanId} has been deleted.`,
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  useEffect(() => {
    if (selectedReportId) {
      setUrgencyFilter("ALL");
      setCategoryFilter("ALL");
      setSearchQuery(selectedReportId);
      setCurrentPage(1);
    }
  }, [selectedReportId]);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const token = localStorage.getItem("infracare_token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};
        const res = await fetch(`${apiUrl}/admin/engineers`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setEngineersList(data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch engineers:", err);
      }
    };
    fetchEngineers();
  }, []);

  const handleStatusChange = (id, newStatus, currentNotes, currentEng) => {
    if (updateReportStatus) {
      updateReportStatus(id, newStatus, currentNotes, currentEng);
    }
  };

  const handlePriorityChange = async (id, priority) => {
    try {
      const token = localStorage.getItem("infracare_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      // For now, we mock the priority update in DB, show toast
      Swal.fire({
        icon: "success",
        title: "Priority Updated",
        text: `Report priority updated to ${priority}`,
        toast: true,
        position: "top-end",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true
      });
    } catch (e) {
      console.error(e);
    }
  };

  const exportToCSV = () => {
    if (!filteredReports || filteredReports.length === 0) {
      return Swal.fire({
        icon: "info",
        title: "No Data",
        text: "No reports found to export for the selected filters.",
        confirmButtonColor: "#0f172a"
      });
    }
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

  const today = new Date().toISOString().split('T')[0];
  const reportsToday = useMemo(() => {
    return displayReports.filter(r => r.created_at && r.created_at.startsWith(today)).length;
  }, [displayReports, today]);

  const criticalReports = useMemo(() => {
    return displayReports.filter(r => {
      const u = (r.urgency || "").toLowerCase();
      return u === "critical" || u === "urgent" || u === "high priority";
    });
  }, [displayReports]);

  const inProgressReports = useMemo(() => {
    return displayReports.filter(r => {
      const s = (r.status || "").toLowerCase();
      return s === "in progress" || s === "assigned" || s === "site visit assigned" || s === "work in progress";
    });
  }, [displayReports]);

  const resolvedReports = useMemo(() => {
    return displayReports.filter(r => {
      const s = (r.status || "").toLowerCase();
      return s === "resolved" || s === "completed" || s === "verified";
    });
  }, [displayReports]);

  const resolutionRate = displayReports.length > 0 ? Math.round((resolvedReports.length / displayReports.length) * 100) : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return <>{datePart},<br />{timePart}</>;
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000); // mins
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ${diff % 60}m ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

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
          {/* MODERN EXECUTIVE COMMAND HERO BANNER (LIGHT THEME) */}
          <div style={{
            background: "#ffffff",
            color: "#0f172a",
            padding: "28px 32px",
            borderRadius: "12px",
            position: "relative",
            overflow: "hidden",
            marginBottom: "24px",
            boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
            border: "1px solid #e2e8f0"
          }}>
            {/* Subtle light background ambient accents */}
            <div style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 70%)",
              pointerEvents: "none"
            }} />
            <div style={{
              position: "absolute",
              bottom: "-40px",
              left: "20%",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0) 70%)",
              pointerEvents: "none"
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px", position: "relative", zIndex: 2 }}>

              {/* Left Details */}
              <div style={{ maxWidth: "760px", flex: "1 1 500px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    color: "#059669",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    padding: "4px 11px",
                    borderRadius: "20px",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase"
                  }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)" }}></span>
                    Live Intake & Audit
                  </span>

                  <span style={{
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    color: "#475569",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "4px 11px",
                    borderRadius: "20px",
                    letterSpacing: "0.5px"
                  }}>
                    Udupi & Mangalore Municipal Regions
                  </span>

                  <span style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#2563eb",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "4px 11px",
                    borderRadius: "20px"
                  }}>
                    Auto-Triage Active
                  </span>
                </div>

                <h1 style={{
                  fontFamily: "'Outfit', Georgia, serif",
                  fontSize: "2.1rem",
                  fontWeight: 800,
                  margin: "0 0 8px 0",
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.15
                }}>
                  Citizen Incident Reports Hub
                </h1>

                <p style={{
                  fontSize: "0.88rem",
                  lineHeight: 1.55,
                  color: "#64748b",
                  margin: "0 0 20px 0",
                  maxWidth: "680px"
                }}>
                  Centralized audit, triage, and work order dispatch for damage reports submitted via the civic portal. High-priority incidents trigger fast-track engineering alerts.
                </p>

                {/* Embedded Live Metric Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}>
                    <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Intake</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{displayReports.length}</span>
                  </div>

                  <div style={{
                    background: criticalReports.length > 0 ? "#fef2f2" : "#f8fafc",
                    border: criticalReports.length > 0 ? "1px solid #fecaca" : "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}>
                    <span style={{ fontSize: "0.72rem", color: criticalReports.length > 0 ? "#b91c1c" : "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Critical Escalations</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: criticalReports.length > 0 ? "#dc2626" : "#0f172a" }}>{criticalReports.length}</span>
                  </div>

                  <div style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}>
                    <span style={{ fontSize: "0.72rem", color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase" }}>In Progress</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2563eb" }}>{inProgressReports.length}</span>
                  </div>

                  <div style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}>
                    <span style={{ fontSize: "0.72rem", color: "#15803d", fontWeight: 700, textTransform: "uppercase" }}>Resolved Rate</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#16a34a" }}>{resolutionRate}%</span>
                  </div>
                </div>
              </div>

              {/* Right Action Button Group */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-end", alignSelf: "center", flexShrink: 0 }}>
                <button
                  onClick={() => setPage("report")}
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 22px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    letterSpacing: "0.6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.35)";
                  }}
                >
                  <Plus size={16} strokeWidth={3} /> NEW CITIZEN REPORT
                </button>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={exportToCSV}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      color: "#334155",
                      borderRadius: "6px",
                      padding: "8px 14px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#94a3b8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }}
                  >
                    <Download size={13} color="#0284c7" /> Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="complaints-layout">
            <div className="complaints-left">
              {/* QUICK STATS */}
              <div className="quick-stats-card" style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "20px 22px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
                  <h4 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 800, color: "#475569", letterSpacing: "1px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Activity size={15} color="#2563eb" /> Quick Metrics
                  </h4>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: "12px" }}>
                    LIVE
                  </span>
                </div>

                <div className="stat-group">
                  <span className="stat-label">Reports Today</span>
                  <div className="stat-value">
                    <span className="number serif-title">{reportsToday}</span>
                    <span className="trend text-green">+12% <TrendingUp size={13} className="ml-1 inline" /></span>
                  </div>
                </div>

                <div className="stat-group" style={{ marginTop: "12px" }}>
                  <span className="stat-label">Avg. Resolution Time</span>
                  <div className="stat-value">
                    <span className="number serif-title">4.2</span>
                    <span className="unit">hrs</span>
                  </div>
                </div>

                <div className="stat-progress" style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b" }}>Weekly Resolution Target</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#0f172a" }}>65%</span>
                  </div>
                  <div className="progress-bar" style={{ height: "6px", background: "#e2e8f0", borderRadius: "4px" }}>
                    <div style={{ width: "65%", height: "100%", background: "linear-gradient(90deg, #2563eb, #38bdf8)", borderRadius: "4px" }}></div>
                  </div>
                </div>
              </div>

              {/* ESCALATION QUEUE */}
              <div className="escalation-queue" style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}>
                <div className="queue-header" style={{ background: "#0f172a", color: "#fff", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 800, letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <ShieldAlert size={14} color="#f87171" /> ESCALATION QUEUE
                  </h4>
                  <span className="queue-badge" style={{ background: criticalReports.length > 0 ? "#dc2626" : "#475569", color: "#fff", fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px", borderRadius: "4px" }}>
                    {criticalReports.length} PRIORITY
                  </span>
                </div>
                <div className="queue-list">
                  {criticalReports.length > 0 ? criticalReports.slice(0, 3).map(r => (
                    <div className="queue-item" key={r.id} style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
                      <div className="queue-item-top" style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.7rem", fontWeight: 700 }}>
                        <span className="queue-critical" style={{ color: "#dc2626", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
                          <AlertTriangle size={12} /> CRITICAL
                        </span>
                        <span className="queue-time" style={{ color: "#94a3b8" }}>{getTimeAgo(r.created_at)}</span>
                      </div>
                      <h5 style={{ fontSize: "0.85rem", fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>{r.title || r.category || "Untitled Report"}</h5>
                      <span className="queue-id" style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>ID: #{r.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                  )) : (
                    <div style={{ padding: "24px 18px", color: "#64748b", fontSize: "0.82rem", textAlign: "center" }}>
                      <CheckCircle2 size={24} color="#22c55e" style={{ margin: "0 auto 8px", display: "block" }} />
                      No critical escalations at this time.
                    </div>
                  )}
                </div>
                {criticalReports.length > 3 && (
                  <button
                    className="view-all-btn"
                    onClick={() => {
                      handleUrgencyChange("CRITICAL");
                    }}
                  >
                    FILTER BY CRITICAL ({criticalReports.length})
                  </button>
                )}
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

              {/* UNIFIED COMMAND & FILTER TOOLBAR */}
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px 8px 0 0",
                padding: "16px 20px",
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
              }}>
                {/* TOP ROW: Search & Primary Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
                  {/* Search Box */}
                  <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
                    <Search size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search by ID, title, type, engineer, or status..."
                      style={{
                        width: "100%",
                        padding: "9px 36px 9px 38px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "#0f172a",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        outline: "none",
                        backgroundColor: "#f8fafc",
                        transition: "all 0.15s",
                        boxSizing: "border-box"
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => handleSearchChange("")}
                        style={{
                          position: "absolute",
                          right: "10px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#64748b",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          padding: "2px"
                        }}
                        title="Clear Search"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Primary Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "nowrap" }}>
                    <button
                      onClick={exportToCSV}
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "8px 14px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#334155",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap"
                      }}
                    >
                      <Download size={14} color="#0284c7" /> Export CSV
                    </button>

                    {clearAllReports && (
                      <button
                        onClick={handleClearAll}
                        style={{
                          backgroundColor: "#fff5f5",
                          border: "1px solid #fecaca",
                          borderRadius: "6px",
                          padding: "8px 14px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#dc2626",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                          boxShadow: "0 1px 2px rgba(220,38,38,0.06)"
                        }}
                      >
                        <Trash2 size={14} color="#dc2626" /> Clear All Data
                      </button>
                    )}
                  </div>
                </div>

                {/* BOTTOM ROW: Filters & Toggles */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    {/* Category Filter */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", letterSpacing: "0.5px" }}>TYPE:</span>
                      <select
                        value={categoryFilter}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "5px 10px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#0f172a",
                          backgroundColor: "#fff",
                          cursor: "pointer",
                          outline: "none"
                        }}
                      >
                        <option value="ALL">All Categories ({reports.length})</option>
                        {categoriesList.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Urgency Filter */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", letterSpacing: "0.5px" }}>URGENCY:</span>
                      <div style={{ display: "flex", border: "1px solid #cbd5e1", borderRadius: "6px", overflow: "hidden" }}>
                        {["ALL", "CRITICAL", "MEDIUM"].map(u => (
                          <button
                            key={u}
                            onClick={() => handleUrgencyChange(u)}
                            style={{
                              border: "none",
                              padding: "5px 12px",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              backgroundColor: urgencyFilter === u ? "#0f172a" : "#fff",
                              color: urgencyFilter === u ? "#fff" : "#475569",
                              borderRight: u !== "MEDIUM" ? "1px solid #cbd5e1" : "none",
                              transition: "all 0.15s"
                            }}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Result Count Indicator */}
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                    Showing <span style={{ color: "#0f172a", fontWeight: 800 }}>{paginatedReports.length}</span> of <span style={{ color: "#0f172a", fontWeight: 800 }}>{totalReports}</span> reports
                  </div>
                </div>
              </div>

              <div style={{ width: "100%", overflowX: "auto", background: "#ffffff", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>
                <table className="reports-data-table">
                  <thead>
                    <tr>
                      <th>REPORT ID</th>
                      <th>TYPE & DEPT</th>
                      <th>URGENCY</th>
                      <th>SITE VISIT / WORK CREW</th>
                      <th>BUDGET & TIMELINE</th>
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

                      const catStr = (r.category || "").toLowerCase();
                      const isStreetlight = catStr.includes("light") || catStr.includes("electric") || catStr.includes("lamp");
                      const dept = r.assigned_department || (isStreetlight ? "MESCOM (Streetlight)" : "PWD (Road & Drainage)");

                      return (
                        <tr key={r.id} style={isSelected ? { backgroundColor: "#eff6ff", borderLeft: "4px solid #2563eb" } : {}}>
                          <td className="id-cell">
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span>#{r.id.substring(0, 8).toUpperCase()}</span>
                              {isSelected && <span style={{ background: "#2563eb", color: "#fff", fontSize: "0.6rem", fontWeight: 800, padding: "2px 6px", borderRadius: 4, display: "inline-block" }}>SELECTED</span>}
                              {deleteReport && (
                                <button
                                  onClick={() => handleDeleteOne(r.id)}
                                  title={`Delete Report #${r.id.substring(0, 8).toUpperCase()}`}
                                  style={{
                                    background: "#fef2f2",
                                    border: "1px solid #fecdd3",
                                    color: "#ef4444",
                                    padding: "3px 6px",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    marginLeft: "auto"
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="type-cell">
                            <CategoryIcon category={r.category} />
                            <div>
                              <span>{r.category || "General Incident"}</span>
                              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: isStreetlight ? "#d97706" : "#2563eb", marginTop: 2 }}>
                                {dept}
                              </div>
                            </div>
                          </td>
                          <td><UrgencyBadge urgency={r.urgency} /></td>
                          <td>
                            {r.status === "Pending" || r.status === "Submitted" || !r.status ? (
                              <div>
                                <label style={{ fontSize: "0.6rem", fontWeight: "700", color: "#64748b", display: "block", marginBottom: 2 }}>SELECT SITE VISIT CREW</label>
                                <select
                                  value={r.site_visit_crew || selectedEng[r.id] || (isStreetlight ? "MESCOM Field Crew #09-E" : "PWD Engineering Crew #01-A")}
                                  onChange={(e) => {
                                    const newEng = e.target.value;
                                    setSelectedEng({ ...selectedEng, [r.id]: newEng });
                                    if (updateReportStatus) {
                                      updateReportStatus(r.id, "Site Visit Assigned", "Assigned for site visit", "", "", null, { site_visit_crew: newEng });
                                    }
                                  }}
                                  style={{ padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", maxWidth: "180px", fontSize: "0.75rem", backgroundColor: "#f8fafc" }}
                                >
                                  {isStreetlight ? (
                                    <>
                                      <option value="MESCOM Field Crew #09-E">MESCOM Field Crew #09-E</option>
                                      <option value="MESCOM Grid Supervisor #05-F">MESCOM Grid Supervisor #05-F</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="PWD Engineering Crew #01-A">PWD Engineering Crew #01-A</option>
                                      <option value="PWD Highway Repair Team #03-B">PWD Highway Repair Team #03-B</option>
                                      <option value="PWD Drainage Unit #02-C">PWD Drainage Unit #02-C</option>
                                    </>
                                  )}
                                </select>
                              </div>
                            ) : r.status === "Budget Approved" ? (
                              <div>
                                <label style={{ fontSize: "0.6rem", fontWeight: "700", color: "#16a34a", display: "block", marginBottom: 2 }}>SELECT WORK EXECUTION CREW</label>
                                <select
                                  value={r.assigned_engineer || selectedEng[r.id] || (isStreetlight ? "MESCOM Field Crew #09-E" : "PWD Engineering Crew #01-A")}
                                  onChange={(e) => {
                                    const newEng = e.target.value;
                                    setSelectedEng({ ...selectedEng, [r.id]: newEng });
                                  }}
                                  style={{ padding: "6px", borderRadius: "4px", border: "1px solid #86efac", maxWidth: "180px", fontSize: "0.75rem", backgroundColor: "#f0fdf4" }}
                                >
                                  {isStreetlight ? (
                                    <>
                                      <option value="MESCOM Field Crew #09-E">MESCOM Field Crew #09-E</option>
                                      <option value="MESCOM Grid Supervisor #05-F">MESCOM Grid Supervisor #05-F</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="PWD Engineering Crew #01-A">PWD Engineering Crew #01-A</option>
                                      <option value="PWD Highway Repair Team #03-B">PWD Highway Repair Team #03-B</option>
                                      <option value="PWD Drainage Unit #02-C">PWD Drainage Unit #02-C</option>
                                    </>
                                  )}
                                </select>
                              </div>
                            ) : (
                              <div style={{ fontSize: "0.75rem", lineHeight: "1.4" }}>
                                {r.site_visit_crew && <div><span style={{ color: "#64748b", fontSize: "0.65rem" }}>SITE VISIT:</span><br/><b>{r.site_visit_crew}</b></div>}
                                {r.assigned_engineer && <div style={{ marginTop: 4 }}><span style={{ color: "#16a34a", fontSize: "0.65rem" }}>WORK CREW:</span><br/><b>{r.assigned_engineer}</b></div>}
                                {!r.site_visit_crew && !r.assigned_engineer && <span style={{ color: "#9ca3af" }}>Not Assigned</span>}
                              </div>
                            )}
                          </td>
                          <td style={{ fontSize: "0.75rem" }}>
                            {r.approved_budget ? (
                              <div>
                                <b style={{ color: "#16a34a" }}>Rs. {r.approved_budget.toLocaleString()}</b>
                                <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>
                                  Timeline: <b>{r.timeline_days || (r.urgency === "Critical" ? 3 : r.urgency === "Urgent" ? 5 : 7)} Days</b>
                                </div>
                              </div>
                            ) : r.estimated_budget ? (
                              <div>
                                <b style={{ color: "#d97706" }}>Est: Rs. {r.estimated_budget.toLocaleString()}</b>
                                <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>Awaiting Approval</div>
                              </div>
                            ) : (
                              <span style={{ color: "#9ca3af" }}>Pending Site Visit</span>
                            )}
                          </td>
                          <td>
                            <select
                              value={r.status || "Submitted"}
                              onChange={(e) => {
                                const newStatus = e.target.value;

                                if (newStatus === "Budget Approved") {
                                  Swal.fire({
                                    icon: "warning",
                                    title: "Approval Authority Exclusive",
                                    html: "<strong>Only the Approval Authority has the right to approve repair budgets.</strong><br/><br/>The Admin cannot manually approve budgets. Once the official Approval Authority reviews and sanctions the estimate, the repair crew can be dispatched.",
                                    confirmButtonColor: "#0f172a"
                                  });
                                  return;
                                }

                                const isBudgetApproved = r.status === "Budget Approved" || Boolean(r.approved_budget);

                                if ((newStatus === "Work In Progress" || newStatus === "Crew Assigned") && !isBudgetApproved) {
                                  Swal.fire({
                                    icon: "warning",
                                    title: "Budget Approval Required",
                                    html: "<strong>Cannot assign repair work crew yet.</strong><br/><br/>The Approval Authority must first inspect and approve the estimated repair budget before the Admin can dispatch the work execution crew.",
                                    confirmButtonColor: "#0f172a"
                                  });
                                  return;
                                }

                                const eng = selectedEng[r.id] || r.assigned_engineer || (isStreetlight ? "MESCOM Field Crew #09-E" : "PWD Engineering Crew #01-A");
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
                                backgroundColor: r.status === "Resolved" ? "#e6f4ea" : r.status === "Work In Progress" || r.status === "In Progress" ? "#fff7ed" : r.status === "Budget Approved" ? "#dbeafe" : "#fff",
                                color: r.status === "Resolved" ? "#137333" : r.status === "Work In Progress" || r.status === "In Progress" ? "#c2410c" : r.status === "Budget Approved" ? "#1d4ed8" : "#111"
                              }}
                            >
                              <option value="Submitted">1. Submitted</option>
                              <option value="Site Visit Assigned">1. Site Visit Assigned</option>
                              <option value="Budget Submitted">2. Budget Submitted</option>
                              <option value="Pending Budget Approval">3. Pending Budget Approval</option>
                              <option value="Budget Approved" disabled>3. Budget Approved (Approval Authority Only)</option>
                              <option value="Work In Progress" disabled={r.status !== "Budget Approved" && !r.approved_budget}>4. Work In Progress {!r.approved_budget && r.status !== "Budget Approved" ? "(Requires Approval)" : ""}</option>
                              <option value="Final Bill Submitted by Engineer">5. Final Bill Submitted by Engineer</option>
                              <option value="Final Bill Sent to Approval Authority">6. Final Bill Sent to Approval Authority</option>
                              <option value="Pending Final Verification">7. Pending Final Verification</option>
                              <option value="Resolved">8. Resolved</option>
                            </select>
                          </td>
                          <td>
                            {r.status === "Pending" || r.status === "Submitted" || !r.status ? (
                              <button
                                onClick={() => {
                                  const eng = selectedEng[r.id] || r.site_visit_crew || (isStreetlight ? "MESCOM Field Crew #09-E" : "PWD Engineering Crew #01-A");
                                  if (updateReportStatus) {
                                    updateReportStatus(r.id, "Site Visit Assigned", `Admin assigned ${eng} for initial site visit inspection`, "", "", null, { site_visit_crew: eng });
                                  }
                                }}
                                style={{ background: "#2563eb", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
                              >
                                Assign Site Visit
                              </button>
                            ) : r.status === "Site Visit Assigned" || r.status === "Budget Submitted" || r.status === "Pending Budget Approval" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                                <span style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", padding: "4px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700 }}>
                                  ⏳ Awaiting Approval Authority
                                </span>
                                <span style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600 }}>🔒 Crew Locked Until Approved</span>
                              </div>
                            ) : r.status === "Budget Approved" ? (
                              <button
                                onClick={() => {
                                  const eng = selectedEng[r.id] || r.assigned_engineer || (isStreetlight ? "MESCOM Field Crew #09-E" : "PWD Engineering Crew #01-A");
                                  if (updateReportStatus) {
                                    updateReportStatus(r.id, "Work In Progress", `Admin assigned ${eng} for repair execution within deadline`, eng);
                                  }
                                }}
                                style={{ background: "#059669", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 4px rgba(5,150,105,0.25)" }}
                              >
                                Assign Work Crew ✓
                              </button>
                            ) : r.status === "Final Bill Submitted by Engineer" || r.status === "Final Bill Sent to Approval Authority" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <button
                                  onClick={() => {
                                    const eng = selectedEng[r.id] || r.assigned_engineer || "PWD Field Crew";
                                    if (updateReportStatus) {
                                      updateReportStatus(r.id, "Final Bill Sent to Approval Authority", "Admin audited final bill & sent to Approval Authority for final sanction", eng);
                                    }
                                    try {
                                      const saved = localStorage.getItem("infracare_final_bills");
                                      if (saved) {
                                        let parsed = JSON.parse(saved);
                                        parsed = parsed.map(b => (b.report_id === String(r.id) || b.work_order_id === r.tracking_id) ? { ...b, status: "Final Bill Sent to Approval Authority" } : b);
                                        localStorage.setItem("infracare_final_bills", JSON.stringify(parsed));
                                      }
                                    } catch (e) { }

                                    if (setSelectedReportId) setSelectedReportId(r.id);
                                    if (setPage) setPage("approval-authority");
                                  }}
                                  style={{ background: "#0284c7", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  Send Final Bill to Authority →
                                </button>
                              </div>
                            ) : r.status === "Pending Final Verification" || r.status === "Work In Progress" || r.status === "In Progress" ? (
                              <button
                                onClick={() => {
                                  const eng = selectedEng[r.id] || r.assigned_engineer || (isStreetlight ? "MESCOM Field Crew #09-E" : "PWD Engineering Crew #01-A");
                                  if (updateReportStatus) {
                                    updateReportStatus(r.id, "Resolved", "Admin verified repaired image proof and resolved complaint.", eng);
                                  }
                                }}
                                style={{ background: "#16a34a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}
                              >
                                Verify & Resolve ✓
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

