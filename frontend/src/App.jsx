import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

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

  // Load session from localStorage on initial mount
  useEffect(() => {
    const savedUser = localStorage.getItem("infracare_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Direct them to their role home page on initial mount
        if (parsed.role === "citizen") setPage("track");
        else if (parsed.role === "engineer") setPage("tasks");
        else if (parsed.role === "admin") setPage("map");
      } catch (err) {
        localStorage.removeItem("infracare_user");
      }
    }
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
    setUser(u);
    if (!u) {
      localStorage.removeItem("infracare_user");
      setPage("home");
    }
  };

  const view = useMemo(() => {
    if (page === "login") return <Login setUser={handleSetUser} setPage={setPage} />;
    if (page === "register") return <Register setPage={setPage} />;
    if (page === "report") return <Report addReport={(r) => setReports([r, ...reports])} setPage={setPage} />;
    if (page === "track") return <Track reports={reports} />;
    if (page === "map") return <LiveMap />;
    if (page === "analysis") return <AdminAnalysis />;
    if (page === "tasks") return <Tasks />;
    if (page === "profile") return <Profile user={user} />;
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
