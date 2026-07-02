import React, { useState } from "react";
import { 
  ArrowRight, 
  Camera, 
  Gauge, 
  SquarePen, 
  Trash2, 
  MapPin, 
  Clock3, 
  ShieldCheck 
} from "lucide-react";
import { reportsSeed } from "../data/seedData";

export default function AdminAnalysis() {
  const [severity, setSeverity] = useState("Medium");
  
  return (
    <main className="page analysis">
      <p className="crumb">Reports › Case #RD-92841</p>
      <div className="analysis-head">
        <div>
          <h1>AI Verification Analysis</h1>
          <p className="lead">Confirm automated detection results for pothole reporting on 5th Avenue. Ensure bounding boxes and classification align with municipal standards.</p>
        </div>
        <div>
          <button className="outline" onClick={() => alert("Flagged for manual review")}>Flag for Review</button>
          <button className="black" onClick={() => alert("Report confirmed")}>Confirm Report <ArrowRight /></button>
        </div>
      </div>
      <section className="analysis-grid">
        <article className="panel">
          <h2>Uploaded Evidence <Camera /></h2>
          <img src={reportsSeed[0].evidence} alt="Uploaded site evidence" />
        </article>
        <article className="panel ai-view">
          <h2>AI Analysis View <Gauge /></h2>
          <img src={reportsSeed[0].evidence} alt="AI analysis view" />
          <div className="box-label">POTHOLE: 98%</div>
          <div className="bbox" />
        </article>
        <aside className="panel">
          <h2>Detection Metadata</h2>
          <label>
            AI Classification
            <div className="meta-input"><b>Pothole</b><span>98% Confidence</span></div>
          </label>
          <label>
            Suggested Severity
            <div className="segmented">
              {["Low", "Medium", "High"].map((v) => (
                <button className={severity === v ? "selected" : ""} onClick={() => setSeverity(v)} key={v}>{v}</button>
              ))}
            </div>
          </label>
          <em>Calculated based on estimated depth of 4.2cm and area of 0.85m²</em>
          <label>
            Detection Model
            <input value="rddr_v4.2_resnet50_optimized" readOnly />
          </label>
          <div className="black-panel">
            <h2>Admin Override</h2>
            <p>Manually adjust classification if the AI model has misidentified the damage type or severity.</p>
            <button onClick={() => alert("Classification editor opened")}><SquarePen />Change Classification</button>
            <button onClick={() => alert("Report discarded for demo")}><Trash2 />Discard Report</button>
          </div>
        </aside>
      </section>
      <div className="card-grid three">
        {[
          [MapPin, "Location Data", "38.8951° N, 77.0364° W\n5th Avenue, Sector 4C"], 
          [Clock3, "Report Timeline", "Submitted: 14:22 Oct 24\nProcessed: 14:24 Oct 24"], 
          [ShieldCheck, "Citizen Reporter", "UID: 8219-X\nTrust Rating: 4.8/5.0"]
        ].map(([Icon, h, t]) => (
          <article className="thin-card" key={h}>
            <Icon />
            <h3>{h}</h3>
            <p>{t}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
