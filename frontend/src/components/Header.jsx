import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, ArrowRight, LogOut, User, Menu, X, ArrowLeft } from "lucide-react";
import Brand from "./Brand";

export default function Header({ page, setPage, user, setUser, simple = false }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  let nav = ["home", "report", "track", "profile"];
  if (user?.role === "engineer") {
    nav = ["maintenance", "tasks", "ai-verification", "team-allocation", "profile"];
  } else if (user?.role === "inspector") {
    nav = ["inspections", "profile"];
  } else if (user?.role === "admin") {
    nav = ["dashboard", "analysis", "admin-reports", "admin-maintenance", "admin-users", "admin-logs"];
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
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
            <button className="icon-button" onClick={() => alert("No new notifications")}>
              <Bell />
            </button>
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
