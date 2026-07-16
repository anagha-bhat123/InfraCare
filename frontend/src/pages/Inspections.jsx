import React, { useState } from "react";
import { MapPin, CheckCircle, Navigation, ArrowLeft, PenTool, Camera } from "lucide-react";
import MapPanel from "../components/MapPanel";
import { inspections } from "../data/seedData";

export default function Inspections({ setPage }) {
  const [activeId, setActiveId] = useState(inspections[0]?.id || "");
  const [data, setData] = useState({ severity: "Moderate", notes: "", signature: "" });
  const [submitted, setSubmitted] = useState(false);

  const inspection = inspections.find((i) => i.id === activeId);

  const submitSignOff = (e) => {
    e.preventDefault();
    if (!data.signature.trim()) return alert("Digital signature is required.");
    setSubmitted(true);
    setTimeout(() => {
      alert(`Inspection ${activeId} submitted successfully.`);
      setSubmitted(false);
      setData({ severity: "Moderate", notes: "", signature: "" });
    }, 1000);
  };

  return (
    <main className="task-layout">
      <aside className="assignment-list">
        <h2>Assigned Inspections</h2>
        <p>{inspections.length} pending verification</p>
        {inspections.map((i) => (
          <button 
            className={i.id === activeId ? "selected assignment" : "assignment"} 
            onClick={() => { setActiveId(i.id); setSubmitted(false); }} 
            key={i.id}
          >
            <em>{i.status}</em>
            <span>#{i.id}</span>
            <b>{i.title}</b>
            <small><MapPin size={14} />{i.location}</small>
          </button>
        ))}
      </aside>
      
      {inspection && (
        <section className="task-detail">
          <div className="detail-head">
            <div>
              <p>Inspection / <b>#{inspection.id}</b></p>
              <h1>{inspection.title}</h1>
              <p>{inspection.notes}</p>
            </div>
            <button className="outline" onClick={() => window.open(`https://www.google.com/maps?q=${inspection.coords[0]},${inspection.coords[1]}`, "_blank")}>
              Navigate <Navigation size={18} />
            </button>
          </div>
          
          <div className="task-grid" style={{ marginBottom: 30 }}>
            <article className="panel">
              <h3>Site Coordinates <b>{inspection.coords[0]}° N, {Math.abs(inspection.coords[1])}° W</b></h3>
              <MapPanel compact coords={inspection.coords} />
            </article>
            <article className="panel">
              <h3>Original Evidence</h3>
              <div className="photo-pair" style={{ gridTemplateColumns: "1fr" }}>
                <img src={inspection.originalReportEvidence} alt="Original reported damage" style={{ height: 260 }} />
              </div>
            </article>
          </div>

          <section className="panel">
            <h2>Field Data & Digital Sign-off</h2>
            {submitted ? (
              <div className="success" style={{ marginTop: 0 }}>
                <CheckCircle size={20} style={{ verticalAlign: "middle", marginRight: 8 }} />
                Report verified and submitted by {data.signature}.
              </div>
            ) : (
              <form onSubmit={submitSignOff} style={{ display: "grid", gap: 20, marginTop: 20 }}>
                <div className="form-row" style={{ margin: 0 }}>
                  <label>
                    Verified Severity Level
                    <select value={data.severity} onChange={(e) => setData({ ...data, severity: e.target.value })}>
                      <option>Minor</option>
                      <option>Moderate</option>
                      <option>Severe</option>
                      <option>Critical hazard</option>
                    </select>
                  </label>
                  <label>
                    Upload Verification Photo
                    <div style={{ border: "1px solid #c4c6c8", padding: "16px", background: "#f8f9fa", display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}>
                      <Camera size={20} /> Click or tap to attach
                    </div>
                  </label>
                </div>
                <label>
                  Field Inspector Notes
                  <textarea 
                    style={{ minHeight: 100 }} 
                    placeholder="Enter observations on structural integrity, affected area dimensions, and required materials..."
                    value={data.notes}
                    onChange={(e) => setData({ ...data, notes: e.target.value })}
                  />
                </label>
                <div style={{ borderTop: "1px solid #c4c6c8", paddingTop: 20 }}>
                  <label>
                    Digital Signature (Type Full Name)
                    <div style={{ display: "flex", gap: 16 }}>
                      <input 
                        required 
                        placeholder="e.g. John Doe" 
                        value={data.signature}
                        onChange={(e) => setData({ ...data, signature: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <button type="submit" className="black">
                        Submit Sign-off <PenTool size={16} />
                      </button>
                    </div>
                  </label>
                </div>
              </form>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
