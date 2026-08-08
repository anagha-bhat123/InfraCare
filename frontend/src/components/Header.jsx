import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, ArrowRight, LogOut, User, Menu, X, ArrowLeft } from "lucide-react";
import Brand from "./Brand";

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Header({ page, setPage, user, setUser, reports = [], simple = false, selectedReportId, setSelectedReportId }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fetchedNotifs, setFetchedNotifs] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return;
      try {
        const query = new URLSearchParams();
        if (user.role === "engineer") {
          query.set("role", "engineer");
          if (user.name) query.set("engineer_name", user.name);
        } else if (user.role === "admin") {
          query.set("role", "admin");
        } else {
          query.set("role", "citizen");
          if (user.id) query.set("user_id", user.id);
        }
        const res = await fetch(`${apiUrl}/reports/notifications?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.notifications) {
            setFetchedNotifs(data.notifications);
          }
        }
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const markRead = async (notifId) => {
    try {
      await fetch(`${apiUrl}/reports/notifications/${notifId}/read`, { method: "PATCH" });
      setFetchedNotifs(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const notifications = React.useMemo(() => {
    const list = reports || [];
    let items = [];

    if (fetchedNotifs.length > 0) {
      items = fetchedNotifs.map(n => ({
        id: n.id,
        report_id: n.report_id,
        tracking_id: n.report_id ? n.report_id.substring(0, 8).toUpperCase() : "ALERT",
        title: n.title,
        description: n.message,
        category: n.title,
        status: n.type,
        read: n.read,
        created_at: n.created_at
      }));
    } else {
      if (user?.role === "engineer") {
        const engName = (user?.name || "").toLowerCase();
        items = list.filter(r => {
          const assigned = (r.assigned_engineer || r.crew || "").toLowerCase();
          return (engName && (assigned.includes(engName) || engName.includes(assigned))) ||
                 ["Crew Assigned", "In Progress", "Approved", "Pending Final Verification"].includes(r.status);
        });
      } else if (user?.role === "admin") {
        items = list.filter(r => r.status === "Pending" || r.status === "Submitted" || !r.status || r.status === "Pending Final Verification");
      } else {
        items = list.filter(r => r.assigned_engineer || r.status !== "Resolved");
      }
    }

    return items;
  }, [reports, user, fetchedNotifs]);

  const notifHeaderTitle = 
    user?.role === "engineer" ? "Assigned Task Alerts" :
    user?.role === "admin" ? "Citizen Report Alerts" : "Incident Updates";

  const notifBadgeText = 
    user?.role === "engineer" ? "ASSIGNED" :
    user?.role === "admin" ? "PENDING" : "UPDATES";

  const notifItemTag = 
    user?.role === "engineer" ? "TASK ASSIGNED" :
    user?.role === "admin" ? "NEW REPORT" : "RESOLVED";

  const notifTargetPage = 
    user?.role === "engineer" ? "tasks" :
    user?.role === "admin" ? "admin-reports" : "track";

  let nav = ["home", "report", "track", "profile"];
  if (user?.role === "engineer") {
    nav = ["maintenance", "tasks", "ai-verification", "team-allocation", "profile"];
  } else if (user?.role === "inspector") {
    nav = ["inspections", "profile"];
  } else if (user?.role === "admin") {
    nav = ["dashboard", "analysis", "admin-reports", "admin-maintenance", "admin-users", "admin-logs"];
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NAV_LABELS = {
    home: "Home",
    report: "Report",
    track: "Track",
    profile: "Profile",
    maintenance: "Dashboard",
    tasks: "Scheduling",
    "ai-verification": "Verification",
    "team-allocation": "Team Allocation",
    inspections: "Inspections",
    dashboard: "Dashboard",
    "admin-reports": "Reports",
    map: "Reports",
    analysis: "Analytics",
    "admin-maintenance": "Maintenance",
    "admin-users": "Users",
    "admin-logs": "Logs",
  };
  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!["home", "login", "register", "maintenance", "inspections", "dashboard"].includes(page) && (
          <button 
            className="icon-button" 
            onClick={() => {
              if (!user) setPage("home");
              else if (user.role === "engineer") setPage("maintenance");
              else if (user.role === "inspector") setPage("inspections");
              else if (user.role === "admin") setPage("dashboard");
              else setPage("home");
            }}
            title="Go Back"
            style={{ marginLeft: -8 }}
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <Brand />
      </div>
      <button className="mobile-toggle icon-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X /> : <Menu />}
      </button>
      <div className={`nav-container ${mobileMenuOpen ? "open" : ""}`}>
        {simple ? <em>Official Government Portal</em> : (
          <nav>
            {nav.map((item) => (
              <button
                key={item}
                className={page === item ? "active" : ""}
                onClick={() => { setPage(item); setMobileMenuOpen(false); }}
              >
                {NAV_LABELS[item] || item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </nav>
        )}
        <div className="top-actions">
          {!simple && (
            <button className="icon-button" onClick={() => alert("Search panel opened")}>
              <Search />
            </button>
          )}
          {!simple && (
            <div ref={notifRef} style={{ position: "relative" }}>
              <button 
                className="icon-button" 
                onClick={() => setNotifOpen(!notifOpen)}
                style={{ position: "relative" }}
                title="Notifications"
              >
                <Bell />
                {notifications.length > 0 && (
                  <span style={{
                    position: "absolute",
                    top: 2, right: 2,
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 16, height: 16,
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,.15)",
                    width: 320,
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#111" }}>{notifHeaderTitle}</span>
                    <span style={{ fontSize: "0.7rem", backgroundColor: user?.role === "engineer" ? "#dbeafe" : "#fee2e2", color: user?.role === "engineer" ? "#1d4ed8" : "#dc2626", fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                      {notifications.filter(n => !n.read).length} UNREAD
                    </span>
                  </div>

                  <div style={{ maxHeight: 280, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "24px", textAlign: "center", color: "#888", fontSize: "0.85rem" }}>
                        No notifications.
                      </div>
                    ) : (
                      notifications.map(r => (
                        <div
                          key={r.id}
                          onClick={() => {
                            const targetId = r.report_id || r.tracking_id || r.id;
                            if (setSelectedReportId && targetId) {
                              setSelectedReportId(targetId);
                            }
                            if (r.id) markRead(r.id);
                            window.dispatchEvent(new CustomEvent("refreshReports"));
                            setNotifOpen(false);
                            let target = notifTargetPage;
                            if (user?.role === "admin") target = "admin-reports";
                            else if (user?.role === "engineer") target = "tasks";
                            else if (user?.role === "citizen") target = "track";
                            setPage(target);
                          }}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f0f0f0",
                            cursor: "pointer",
                            transition: "background 0.15s",
                            backgroundColor: r.read ? "#fafafa" : "#eff6ff"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = r.read ? "#fafafa" : "#eff6ff")}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: user?.role === "engineer" ? "#2563eb" : "#dc2626" }}>
                              {!r.read && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#2563eb", marginRight: 6 }}></span>}
                              {notifItemTag}
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>#{r.tracking_id || (r.id ? String(r.id).substring(0, 8) : "REF")}</span>
                          </div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111", marginBottom: 2 }}>{r.title || r.category}</div>
                          <div style={{ fontSize: "0.75rem", color: "#4b5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {r.description || (user?.role === "engineer" ? "Assigned to your crew by Admin." : "Submitted by citizen.")}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ padding: "10px 16px", background: "#f8fafc", borderTop: "1px solid #eee", textAlign: "center" }}>
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        setPage(notifTargetPage);
                      }}
                      style={{ background: "none", border: "none", color: "#111", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
                    >
                      View All in {user?.role === "engineer" ? "Scheduling" : user?.role === "admin" ? "Admin Panel" : "Track Portal"} &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {user ? (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                className="avatar"
                title="Account menu"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((o) => !o)}
              >
                {user.role.slice(0, 2).toUpperCase()}
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                    minWidth: 200,
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  {/* User info */}
                  <div
                    style={{
                      padding: "14px 18px",
                      borderBottom: "1px solid #f0f0f0",
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: ".92rem", marginBottom: 2 }}>
                      {user.name || user.email || "User"}
                    </div>
                    <div
                      style={{
                        fontSize: ".78rem",
                        color: "#777",
                        textTransform: "capitalize",
                      }}
                    >
                      {user.role} account
                    </div>
                  </div>

                  {/* View Profile */}
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "12px 18px",
                      fontSize: ".9rem",
                      fontWeight: 500,
                      borderBottom: "1px solid #f0f0f0",
                      textAlign: "left",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => {
                      setDropdownOpen(false);
                      setMobileMenuOpen(false);
                      setPage("profile");
                    }}
                  >
                    <User size={16} /> View Profile
                  </button>

                  {/* Sign Out */}
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "12px 18px",
                      fontSize: ".9rem",
                      fontWeight: 500,
                      color: "#c0152a",
                      textAlign: "left",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff0f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => {
                      setDropdownOpen(false);
                      setMobileMenuOpen(false);
                      setUser(null);
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="black small" onClick={() => { setPage("login"); setMobileMenuOpen(false); }}>
              Login <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
