import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { supabase } from "./services/supabase";
import Swal from "sweetalert2";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
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
import ApprovalAuthority from "./pages/ApprovalAuthority";
import EngineerBudgetProposal from "./pages/EngineerBudgetProposal";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HelpCenter from "./pages/HelpCenter";

import { apiUrl } from "./services/api";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [isRecovering, setIsRecovering] = useState(false);
  const isRecoveringRef = React.useRef(false);

  useEffect(() => {
    const handler = () => {
      setIsRecovering(false);
      isRecoveringRef.current = false;
    };
    window.addEventListener("passwordResetDone", handler);
    return () => window.removeEventListener("passwordResetDone", handler);
  }, []);

  // Handle expired/invalid links
  useEffect(() => {
    if (window.location.hash.includes("error_code=otp_expired") || window.location.hash.includes("error_description=Email+link+is+invalid+or+has+expired")) {
      Swal.fire({
        icon: "error",
        title: "Link Expired",
        text: "This password reset link is invalid, has expired, or has already been used. Please request a new link from the Login page."
      });
      window.location.hash = "";
      setPage("login");
    }
  }, []);

  // Supabase Auth State Listener for Password Recovery
  useEffect(() => {
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsRecovering(true);
          isRecoveringRef.current = true;
          setPage("reset-password");
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  // Load session on initial mount — check Supabase session first, then localStorage
  useEffect(() => {
    const restoreFromParsed = (parsed) => {
      setUser(parsed);
      // Supabase clears the hash instantly on success, so we must check our synchronous ref
      if (isRecoveringRef.current || window.location.hash.includes("type=recovery")) {
        return;
      }
      if (parsed.role === "citizen") setPage("home");
      else if (parsed.role === "engineer") setPage("maintenance");
      else if (parsed.role === "inspector") setPage("inspections");
      else if (parsed.role === "approver") setPage("approval-authority");
      else if (parsed.role === "admin") setPage("dashboard");
    };

    const init = async () => {
      // 1️⃣ Try Supabase active session (for real registered users)
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch full profile for role + saved fields
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name, phone, ward_zone, zone")
            .eq("id", session.user.id)
            .single();
          // Priority: profiles table → user_metadata (set at signup) → email
          const meta = session.user.user_metadata || {};
          const userData = {
            id: session.user.id,
            role: profile?.role || meta.role || "citizen",
            name: profile?.full_name || meta.full_name || session.user.email,
            email: session.user.email,
            phone: profile?.phone || "",
            ward: profile?.ward_zone || "",
            zone: profile?.zone || "",
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

    if (page === "reset-password") return;

    if (!user) {
      // Unauthenticated users can only access public pages
      if (!["home", "login", "register"].includes(page)) {
        setPage("login");
      }
    } else {
      // Authenticated users are restricted to their role's pages
      if (user.role === "citizen") {
        if (!["home", "report", "track", "profile", "map"].includes(page)) {
          setPage("home");
        }
      } else if (user.role === "engineer") {
        if (!["tasks", "maintenance", "profile", "ai-verification", "team-allocation", "approval-authority"].includes(page)) {
          setPage("maintenance");
        }
      } else if (user.role === "inspector") {
        if (!["inspections", "profile"].includes(page)) {
          setPage("inspections");
        }
      } else if (user.role === "approver") {
        if (!["approval-authority", "dashboard", "admin-reports", "profile"].includes(page)) {
          setPage("approval-authority");
        }
      } else if (user.role === "admin") {
        if (!["dashboard", "admin-reports", "tasks", "profile", "analysis", "admin-maintenance", "admin-users", "admin-logs", "admin-profile", "approval-authority"].includes(page)) {
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
      setUser((prev) => {
        const merged = { ...prev, ...u };
        // Always persist to localStorage so profile changes survive page refresh
        try {
          localStorage.setItem("infracare_user", JSON.stringify(merged));
        } catch { /* ignore quota errors */ }
        return merged;
      });
    }
  };


  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("infracare_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch(`${apiUrl}/reports`, { headers });
      let serverReports = [];
      if (res.ok) {
        const data = await res.json();
        if (data.reports) serverReports = data.reports;
      }
      
      let localSaved = [];
      try {
        const saved = localStorage.getItem("infracare_local_reports");
        if (saved) localSaved = JSON.parse(saved);
      } catch (e) {}

      setReports((prev) => {
        const map = new Map();
        serverReports.forEach((r) => map.set(r.id, r));
        localSaved.forEach((r) => { if (!map.has(r.id)) map.set(r.id, r); });
        prev.forEach((r) => { if (!map.has(r.id)) map.set(r.id, r); });
        const merged = Array.from(map.values());
        return merged.sort((a, b) => {
          const getTime = (r) => {
            if (r.created_at) { const t = new Date(r.created_at).getTime(); if (!isNaN(t) && t > 0) return t; }
            if (r.date) { const t = new Date(r.date).getTime(); if (!isNaN(t) && t > 0) return t; }
            return 0;
          };
          return getTime(b) - getTime(a);
        });
      });
    } catch (e) {
      console.error("Failed to fetch reports:", e);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 4000);
    const handler = () => fetchReports();
    window.addEventListener("refreshReports", handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("refreshReports", handler);
    };
  }, []);

  const addReport = async (reportData) => {
    const tempId = `RD-${Math.floor(10000 + Math.random() * 90000)}`;
    const tempTracking = `CMP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLocalReport = {
      id: tempId,
      tracking_id: tempTracking,
      created_at: new Date().toISOString(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      ...reportData
    };

    try {
      const saved = localStorage.getItem("infracare_local_reports");
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem("infracare_local_reports", JSON.stringify([newLocalReport, ...list]));
    } catch (e) {}

    setReports((prev) => [newLocalReport, ...prev]);

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
        const data = await res.json();
        const serverReport = data.report;
        if (serverReport) {
          setReports((prev) => prev.map((r) => (r.id === tempId ? { ...r, ...serverReport } : r)));
          
          if (reportData.evidenceFile && serverReport.id) {
            const formData = new FormData();
            formData.append("photo", reportData.evidenceFile);
            formData.append("latitude", reportData.latitude);
            formData.append("longitude", reportData.longitude);
            formData.append("captured_at", reportData.capturedAt || new Date().toLocaleString());
            
            const photoRes = await fetch(`${apiUrl}/reports/${serverReport.id}/photo`, {
              method: "POST",
              body: formData,
              ...(token ? { headers: { "Authorization": `Bearer ${token}` } } : {})
            });
            if (photoRes.ok) {
              const photoData = await photoRes.json();
              if (photoData.photo?.photo_url) {
                setReports((prev) => prev.map((r) => (r.id === serverReport.id ? { ...r, evidence: photoData.photo.photo_url } : r)));
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to add report to backend:", e);
    }
  };

  const updateReportStatus = async (reportId, status, note = "", assignedEngineer = "", engineerNotes = "", estimatedBudget = null) => {
    const cleanId = String(reportId || "").replace("#", "").trim().toLowerCase();

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: `Status: ${status}`,
      text: assignedEngineer ? `Assigned to ${assignedEngineer}` : (note || "Report updated"),
      showConfirmButton: false,
      timer: 3000
    });

    setReports((prev) => {
      const updatedList = prev.map((r) => {
        const rId = String(r.id || "").replace("#", "").trim().toLowerCase();
        const rTrack = String(r.tracking_id || "").replace("#", "").trim().toLowerCase();
        const isMatch = rId === cleanId || rTrack === cleanId || (rId && cleanId && (rId.includes(cleanId) || cleanId.includes(rId.substring(0, 8))));
        
        if (isMatch) {
          const updatedHistory = [
            [status, note || (assignedEngineer ? `Assigned to ${assignedEngineer}` : "Status updated by Admin"), new Date().toLocaleTimeString()],
            ...(r.history || [])
          ];
          return {
            ...r,
            status,
            assigned_engineer: assignedEngineer || r.assigned_engineer,
            engineer_notes: engineerNotes || r.engineer_notes,
            estimated_budget: estimatedBudget !== null && estimatedBudget !== undefined ? Number(estimatedBudget) : r.estimated_budget,
            crew: assignedEngineer || r.crew,
            history: updatedHistory
          };
        }
        return r;
      });

      try {
        localStorage.setItem("infracare_local_reports", JSON.stringify(updatedList));
      } catch (e) {}

      return updatedList;
    });

    try {
      const token = localStorage.getItem("infracare_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const queryParams = new URLSearchParams({
        status,
        note,
        ...(assignedEngineer ? { assigned_engineer: assignedEngineer } : {}),
        ...(engineerNotes ? { engineer_notes: engineerNotes } : {}),
        ...(estimatedBudget !== null && estimatedBudget !== undefined ? { estimated_budget: estimatedBudget.toString() } : {})
      });
      await fetch(`${apiUrl}/reports/${reportId}/status?${queryParams.toString()}`, {
        method: "PATCH",
        headers
      });
    } catch (e) {
      console.error("Failed to update status on backend:", e);
    }
  };

  const [selectedReportId, setSelectedReportId] = useState(null);

  const view = useMemo(() => {
    if (page === "reset-password") return <ResetPassword setPage={setPage} />;
    if (page === "login") return <Login setUser={handleSetUser} setPage={setPage} />;
    if (page === "register") return <Register setPage={setPage} />;
    if (page === "report") return <Report addReport={addReport} setPage={setPage} />;
    if (page === "track" || page === "resolved" || page === "Resolved") {
      if (user?.role === "admin") {
        return <AdminReports reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} />;
      }
      return <Track reports={reports} setPage={setPage} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} />;
    }
    if (page === "dashboard" || page === "admin-dashboard") return <AdminDashboard reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} user={user} />;
    if (page === "admin-reports" || page === "resolved-reports" || page === "reports") return <AdminReports reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} user={user} />;
    if (page === "admin-maintenance" || page === "maintenance-dispatch") return <AdminMaintenance setPage={setPage} reports={reports} updateReportStatus={updateReportStatus} user={user} />;
    if (page === "admin-users" || page === "users") return <AdminUsers setPage={setPage} user={user} reports={reports} />;
    if (page === "admin-logs" || page === "logs") return <AdminLogs setPage={setPage} user={user} reports={reports} />;
    if (page === "admin-profile") return <AdminProfile user={user} setPage={setPage} setUser={handleSetUser} />;
    if (page === "map" || page === "live-map") return <LiveMap reports={reports} setPage={setPage} user={user} />;
    if (page === "analysis" || page === "admin-analysis" || page === "analytics") return <AdminAnalysis setPage={setPage} reports={reports} user={user} />;
    if (page === "tasks") return <Tasks reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} user={user} />;
    if (page === "maintenance") return <Maintenance reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} user={user} />;
    if (page === "team-allocation") return <TeamAllocation reports={reports} setPage={setPage} setSelectedReportId={setSelectedReportId} user={user} />;
    if (page === "approval-authority" || page === "budget-approvals") {
      if (user?.role === "engineer") {
        return <EngineerBudgetProposal user={user} reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} />;
      }
      return <ApprovalAuthority user={user} reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} />;
    }
    if (page === "ai-verification") return <AIVerification reports={reports} updateReportStatus={updateReportStatus} setPage={setPage} />;
    if (page === "inspections") return <Inspections setPage={setPage} />;
    if (page === "profile") return <Profile user={user} setPage={setPage} setUser={handleSetUser} />;
    if (page === "privacy-policy") return <PrivacyPolicy setPage={setPage} />;
    if (page === "terms-of-service") return <TermsOfService setPage={setPage} />;
    if (page === "help-center") return <HelpCenter setPage={setPage} />;
    return <Home setPage={setPage} />;
  }, [page, user, reports, selectedReportId]);

  const hideChrome = ["login", "register", "reset-password"].includes(page);
  return (
    <>
      {!hideChrome && <Header page={page} setPage={setPage} user={user} setUser={handleSetUser} reports={reports} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} />}
      {view}
      {!hideChrome && <Footer setPage={setPage} />}
    </>
  );
}
