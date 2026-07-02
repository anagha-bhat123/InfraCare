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

import { reportsSeed } from "./data/seedData";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState(reportsSeed);

  // Load session on initial mount — check Supabase session first, then localStorage
  useEffect(() => {
    const restoreFromParsed = (parsed) => {
      setUser(parsed);
      if (parsed.role === "citizen") setPage("track");
      else if (parsed.role === "engineer") setPage("tasks");
      else if (parsed.role === "admin") setPage("map");
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
    if (!user) {
      // Unauthenticated users can only access public pages
      if (!["home", "login", "register"].includes(page)) {
        setPage("login");
      }
    } else {
      // Authenticated users are restricted to their role's pages
      if (user.role === "citizen") {
        if (!["home", "report", "track", "profile"].includes(page)) {
          setPage("track");
        }
      } else if (user.role === "engineer") {
        if (!["tasks", "profile"].includes(page)) {
          setPage("tasks");
        }
      } else if (user.role === "admin") {
        if (!["map", "analysis", "profile"].includes(page)) {
          setPage("map");
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


  const view = useMemo(() => {
    if (page === "login") return <Login setUser={handleSetUser} setPage={setPage} />;
    if (page === "register") return <Register setPage={setPage} />;
    if (page === "report") return <Report addReport={(r) => setReports([r, ...reports])} setPage={setPage} />;
    if (page === "track") return <Track reports={reports} setPage={setPage} />;
    if (page === "map") return <LiveMap setPage={setPage} />;
    if (page === "analysis") return <AdminAnalysis setPage={setPage} />;
    if (page === "tasks") return <Tasks setPage={setPage} />;
    if (page === "profile") return <Profile user={user} setPage={setPage} setUser={handleSetUser} />;
    return <Home setPage={setPage} />;
  }, [page, user, reports]);

  const hideChrome = ["login", "register"].includes(page);

  return (
    <>
      {!hideChrome && <Header page={page} setPage={setPage} user={user} setUser={handleSetUser} />}
      {view}
      {!hideChrome && <Footer />}

    </>
  );
}
