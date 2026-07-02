import React from "react";
import { CheckCircle2, ArrowRight, Eye, Users, Gauge, ShieldCheck, Clock3 } from "lucide-react";

export default function Home({ setPage }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Ensuring safe, smooth, and sustainable urban infrastructure</h1>
          <p>Real-time road damage detection powered by AI vision. Join thousands of citizens in building a more resilient city through rapid reporting and transparent maintenance.</p>
          <div className="button-row">
            <button className="black" onClick={() => setPage("report")}>
              Report Damage Now <CheckCircle2 size={18} />
            </button>
            <button className="outline" onClick={() => setPage("map")}>
              View Live Map
            </button>
          </div>
        </div>
      </section>
      <section className="metrics">
        {[
          ["12,482", "Total Repairs Logged"], 
          ["843", "Active Reports"], 
          ["2.4 Days", "Avg. Repair Time"], 
          ["96%", "Citizen Satisfaction"]
        ].map(([n, l]) => (
          <div key={l}><strong>{n}</strong><span>{l}</span></div>
        ))}
      </section>
      <section className="capabilities">
        <small>Capabilities</small>
        <h2>Next-Gen Municipal Governance</h2>
        <div className="card-grid five">
          {[
            [Eye, "AI Vision Detection", "Automated identification of potholes and cracks using edge computing and camera feeds."],
            [Users, "Community Reporting", "Mobile-first interface for citizens to upload photos and GPS-tagged damage locations."],
            [Gauge, "Insightful Dashboards", "Real-time data visualization for municipal engineers to prioritize critical repairs."],
            [ShieldCheck, "Automated Verification", "Reduces administrative overhead by validating report authenticity using data triangulation."],
            [Clock3, "Maintenance History", "Full audit trail of road maintenance, ensuring long-term accountability and planning."]
          ].map(([Icon, title, text]) => (
            <article className="thin-card" key={title}>
              <Icon className="accent" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="process">
        <h2>Capture. Report. Repair.</h2>
        <p>The standard protocol for ensuring rapid response and urban safety.</p>
        <div className="steps">
          {["Identify Issue", "Submit Report", "Monitor Progress"].map((step, i) => (
            <article key={step}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              <h3>{step}</h3>
              <p>
                {i === 0 
                  ? "Capture high-resolution photos of road damage via the secure mobile portal." 
                  : i === 1 
                  ? "Geolocated metadata is automatically appended for precise engineer dispatching." 
                  : "Receive real-time updates as the maintenance team verifies and resolves the issue."}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="cta-band">
        <div>
          <h2>Start your civic report today</h2>
          <p>Contribute to the safety of our roads. Every report helps municipal authorities prioritize maintenance where it's needed most.</p>
        </div>
        <button onClick={() => setPage("report")}>Launch Reporting Portal <ArrowRight /></button>
      </section>
    </>
  );
}
