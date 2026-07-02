import React, { useState } from "react";
import { MapPin, Printer, Mail, ArrowLeft } from "lucide-react";
import MapPanel from "../components/MapPanel";
import { reportsSeed } from "../data/seedData";

export default function Track({ reports, setPage }) {
  const [activeId, setActiveId] = useState(reports[0]?.id || "");
  const [tab, setTab] = useState("Active");
  
  const report = reports.find((r) => r.id === activeId) || reports[0];

  return (
    <main className="track-layout">
      <aside className="complaint-list">
        <button
          type="button"
          className="text-link"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12, fontWeight: 600 }}
          onClick={() => setPage("home")}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        <h1>My Complaints</h1>
        <div className="tabs">
          <button className={tab === "Active" ? "active" : ""} onClick={() => setTab("Active")}>
            Active ({reports.length})
          </button>
          <button className={tab === "Archived" ? "active" : ""} onClick={() => setTab("Archived")}>
            Archived (12)
          </button>
        </div>
        {reports.map((r) => (
          <button 
            key={r.id} 
            className={r.id === activeId ? "complaint selected" : "complaint"} 
            onClick={() => setActiveId(r.id)}
          >
            <span>#{r.id}</span>
            <em>{r.status}</em>
            <b>{r.title}</b>
            <small><MapPin size={14} />{r.area}</small>
            <small>Reported: {r.date}</small>
          </button>
        ))}
      </aside>
      
      {report && (
        <section className="complaint-detail">
          <div className="detail-head">
            <div>
              <p>Complaint ID: {report.id} <b className="pill">{report.urgency}</b></p>
              <h1>{report.detailTitle}</h1>
            </div>
            <div>
              <button className="outline" onClick={() => window.print()}><Printer />Print PDF</button>
              <button className="black" onClick={() => alert("Office contacted. A response note was added.")}>
                <Mail />Contact Office
              </button>
            </div>
          </div>
          <div className="evidence-grid">
            <article>
              <h3>Reported Evidence</h3>
              <img src={report.evidence || reportsSeed[0].evidence} alt="Reported damage" />
            </article>
            <article>
              <h3>Exact Location <a href={`https://www.google.com/maps?q=${report.coords[0]},${report.coords[1]}`} target="_blank" rel="noreferrer">Google Maps</a></h3>
              <MapPanel compact coords={report.coords} />
            </article>
          </div>
          <h3>Tracking History</h3>
          <div className="timeline">
            {report.history.map(([title, text, time], i) => (
              <article key={title} className={i === 0 ? "current" : ""}>
                <i />
                <div>
                  <b>{title}</b>
                  <p>{text}</p>
                </div>
                <time>{time}</time>
              </article>
            ))}
          </div>
          <div className="detail-meta">
            {[
              ["Category", report.category], 
              ["Urgency", report.urgency], 
              ["Department", report.department || "Pending Assignment"], 
              ["Assigned Officer", report.officer || "Unassigned"]
            ].map(([k, v]) => (
              <div key={k}>
                <small>{k}</small>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
