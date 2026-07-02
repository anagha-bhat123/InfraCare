import React, { useState } from "react";
import { MapPin, Navigation, ArrowLeft } from "lucide-react";
import MapPanel from "../components/MapPanel";
import { reportsSeed, assignments } from "../data/seedData";

export default function Tasks({ setPage }) {
  const [activeId, setActiveId] = useState(assignments[0]?.id || "");
  const [logs, setLogs] = useState(["Crew assigned. Awaiting first field update."]);
  
  const task = assignments.find((a) => a.id === activeId);

  return (
    <main className="task-layout">
      <aside className="assignment-list">
        <button
          type="button"
          className="text-link"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12, fontWeight: 600 }}
          onClick={() => setPage("home")}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        <h2>Active Assignments</h2>
        <p>3 Tasks Currently Dispatched</p>
        {assignments.map((a) => (
          <button 
            className={a.id === activeId ? "selected assignment" : "assignment"} 
            onClick={() => setActiveId(a.id)} 
            key={a.id}
          >
            <em>{a.state}</em>
            <span>#{a.id}</span>
            <b>{a.title}</b>
            <small><MapPin />{a.place}</small>
          </button>
        ))}
      </aside>
      
      {task && (
        <section className="task-detail">
          <div className="detail-head">
            <div>
              <p>Task Details / <b>#{task.id}</b></p>
              <h1>{task.title.replace("Critical Pothole - ", "")}</h1>
              <p>{task.summary}</p>
            </div>
            <button className="black" onClick={() => window.open(`https://www.google.com/maps?q=${task.coords[0]},${task.coords[1]}`, "_blank")}>
              Navigate <Navigation />
            </button>
          </div>
          <div className="task-grid">
            <article className="panel">
              <h3>GPS Coordinates <b>{task.coords[0]}° N, {Math.abs(task.coords[1])}° W</b></h3>
              <MapPanel compact coords={task.coords} />
            </article>
            <article className="panel">
              <h3>Reported Visual Evidence</h3>
              <div className="photo-pair">
                <img src={reportsSeed[0].evidence} alt="Evidence 1" />
                <img src="https://images.unsplash.com/photo-1617195920950-1145bf9a9c20?auto=format&fit=crop&w=700&q=80" alt="Evidence 2" />
              </div>
              <button className="outline wide" onClick={() => alert("Photo gallery opened")}>View All 4 Photos</button>
            </article>
          </div>
          <div className="detail-meta">
            {[
              ["Type", task.type], 
              ["Surface", task.surface], 
              ["Assigned To", task.crew]
            ].map(([k, v]) => (
              <div key={k}>
                <small>{k}</small>
                <b>{v}</b>
              </div>
            ))}
          </div>
          <section className="panel log">
            <h2>Activity Log & Updates</h2>
            <button className="black" onClick={() => setLogs([`Update logged at ${new Date().toLocaleTimeString()}`, ...logs])}>
              Log Activity +
            </button>
            {logs.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </section>
        </section>
      )}
    </main>
  );
}
