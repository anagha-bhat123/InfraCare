import React from "react";
import { Search, Bell, ArrowRight } from "lucide-react";
import Brand from "./Brand";

export default function Header({ page, setPage, user, setUser, simple = false }) {
  let nav = ["home", "report", "track", "profile"];
  if (user?.role === "engineer") {
    nav = ["tasks", "profile"];
  } else if (user?.role === "admin") {
    nav = ["map", "analysis", "profile"];
  }
  return (
    <header className="topbar">
      <Brand />
      {simple ? <em>Official Government Portal</em> : (
        <nav>
          {nav.map((item) => (
            <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>
      )}
      <div className="top-actions">
        {!simple && <button className="icon-button" onClick={() => alert("Search panel opened")}><Search /></button>}
        {!simple && <button className="icon-button" onClick={() => alert("No new notifications")}><Bell /></button>}
        {user ? (
          <button className="avatar" onClick={() => setUser(null)} title="Sign out">{user.role.slice(0, 2).toUpperCase()}</button>
        ) : (
          <button className="black small" onClick={() => setPage("login")}>Login <ArrowRight size={18} /></button>
        )}
      </div>
    </header>
  );
}
