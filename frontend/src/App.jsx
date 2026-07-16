import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { supabase } from "./services/supabase";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Report from "./pages/Report";
import Track from "./pages/Track";
import LiveMap from "./pages/LiveMap";
import AdminAnalysis from "./pages/AdminAnalysis";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Inspections from "./pages/Inspections";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AIVerification from "./pages/AIVerification";
import Maintenance from "./pages/Maintenance";
import AdminMaintenance from "./pages/AdminMaintenance";
import AdminUsers from "./pages/AdminUsers";
import AdminLogs from "./pages/AdminLogs";
import AdminProfile from "./pages/AdminProfile";
import TeamAllocation from "./pages/TeamAllocation";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HelpCenter from "./pages/HelpCenter";

import { apiUrl } from "./services/api";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);

  // Load session on initial mount — check Supabase session first, then localStorage
  useEffect(() => {
    const restoreFromParsed = (parsed) => {
      setUser(parsed);
      if (parsed.role === "citizen") setPage("home");
      else if (parsed.role === "engineer") setPage("maintenance");
      else if (parsed.role === "inspector") setPage("inspections");
      else if (parsed.role === "admin") setPage("dashboard");
    };

    const init = async () => {
      // 1️⃣ Try Supabase active session (for real registered users)
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch profile for role info
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", session.user.id)
            .single();
          // Priority: profiles table → user_metadata (set at signup) → email
          const meta = session.user.user_metadata || {};
          const userData = {
            id: session.user.id,
            role: profile?.role || meta.role || "citizen",
            name: profile?.full_name || meta.full_name || session.user.email,
            email: session.user.email,
          };
          restoreFromParsed(userData);
          return;
        }

      }

      // 2️⃣ Fall back to localStorage (demo users with "Remember Me")
      const savedUser = localStorage.getItem("infracare_user");
      if (savedUser) {
        try {
          restoreFromParsed(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("infracare_user");
        }
      }
    };

    init();
  }, []);

  useEffect(() => {
    const handler = (event) => setPage(event.detail);
    window.addEventListener("route", handler);
    return () => window.removeEventListener("route", handler);
  }, []);

  // Enforce role-based access control (route guards)
  useEffect(() => {
    if (page === "privacy-policy" || page === "terms-of-service" || page === "help-center") return;

    if (!user) {
      // Unauthenticated users can only access public pages
      if (!["home", "login", "register"].includes(page)) {
        setPage("login");
      }
    } else {
      // Authenticated users are restricted to their role's pages
      if (user.role === "citizen") {
        if (!["home", "report", "track", "profile"].includes(page)) {
          setPage("home");
        }
      } else if (user.role === "engineer") {
        if (!["tasks", "maintenance", "profile", "ai-verification", "team-allocation"].includes(page)) {
          setPage("maintenance");
        }
      } else if (user.role === "inspector") {
        if (!["inspections", "profile"].includes(page)) {
          setPage("inspections");
        }
      } else if (user.role === "admin") {
        if (!["dashboard", "admin-reports", "tasks", "profile", "analysis", "admin-maintenance", "admin-users", "admin-logs", "admin-profile"].includes(page)) {
          setPage("dashboard");
        }
      }
    }
  }, [page, user]);

  const handleSetUser = (u) => {
    if (!u) {
      // Logout
      setUser(null);
      localStorage.removeItem("infracare_user");
      if (supabase) supabase.auth.signOut().catch(() => {});
      setPage("home");
    } else {
      // Merge update — profile edits pass partial objects like { ...user, name: "New Name" }
      setUser((prev) => ({ ...prev, ...u }));
      // Keep localStorage in sync for demo/remembered users
      const saved = localStorage.getItem("infracare_user");
      if (saved) {
        try {
          localStorage.setItem("infracare_user", JSON.stringify({ ...JSON.parse(saved), ...u }));
        } catch { /* ignore */ }
      }
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("infracare_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${apiUrl}/reports`, { headers });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const addReport = async (reportData) => {
    try {
      const token = localStorage.getItem("infracare_token");
      const headers = { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      const res = await fetch(`${apiUrl}/reports`, {
        method: "POST",
        headers,
        body: JSON.stringify(reportData)
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (e) {
      console.error("Failed to add report", e);
    }
  };

  const updateReportStatus = async (reportId, status, note = "") => {
    try {
      const token = localStorage.getItem("infracare_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${apiUrl}/reports/${reportId}/status?status=${encodeURIComponent(status)}&note=${encodeURIComponent(note)}`, {
        method: "PATCH",
        headers
      });
      if (res.ok) {
        fetchReports();
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const view = useMemo(() => {
    if (page === "login") return <Login setUser={handleSetUser} setPage={setPage} />;
    if (page === "register") return <Register setPage={setPage} />;
    if (page === "report") return <Report addReport={addReport} setPage={setPage} />;
    if (page === "track") return <Track reports={reports} setPage={setPage} />;
    if (page === "dashboard") return <AdminDashboard reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} />;
    if (page === "admin-reports") return <AdminReports reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} />;
    if (page === "admin-maintenance") return <AdminMaintenance setPage={setPage} />;
    if (page === "admin-users") return <AdminUsers setPage={setPage} />;
    if (page === "admin-logs") return <AdminLogs setPage={setPage} />;
    if (page === "admin-profile") return <AdminProfile user={user} setPage={setPage} setUser={handleSetUser} />;
    if (page === "map") return <LiveMap reports={reports} setPage={setPage} />;
    if (page === "analysis") return <AdminAnalysis setPage={setPage} />;
    if (page === "tasks") return <Tasks reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} />;
    if (page === "maintenance") return <Maintenance reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} />;
    if (page === "team-allocation") return <TeamAllocation reports={reports} setPage={setPage} />;
    if (page === "ai-verification") return <AIVerification reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} />;
    if (page === "inspections") return <Inspections setPage={setPage} />;
    if (page === "profile") return <Profile user={user} setPage={setPage} setUser={handleSetUser} />;
    if (page === "privacy-policy") return <PrivacyPolicy setPage={setPage} />;
    if (page === "terms-of-service") return <TermsOfService setPage={setPage} />;
    if (page === "help-center") return <HelpCenter setPage={setPage} />;
    return <Home setPage={setPage} />;
  }, [page, user, reports]);

  const hideChrome = ["login", "register", "dashboard", "analysis", "admin-reports", "admin-maintenance", "admin-users", "admin-logs", "admin-profile"].includes(page);
  return (
    <>
      {!hideChrome && <Header page={page} setPage={setPage} user={user} setUser={handleSetUser} />}
      {view}
      {!hideChrome && <Footer setPage={setPage} />}

    </>
  );
}
