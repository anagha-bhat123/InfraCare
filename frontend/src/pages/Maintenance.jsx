import React from "react";
import { AlertTriangle } from "lucide-react";

export default function Maintenance({ setPage }) {
  return (
    <main className="page">
      <h1>Operational Dashboard</h1>
      <p className="lead">CENTRAL HUB / MONITORING - Overview of live hazards, active repairs, and field operations.</p>

      <section className="metrics">
        {[
          ["1,248", "Total Scan Sites"], 
          ["14", "Critical Flaws"], 
          ["8", "Active Repairs"], 
          ["3", "Teams Deployed"]
        ].map(([n, l]) => (
          <div key={l}><strong>{n}</strong><span>{l}</span></div>
        ))}
      </section>

      <div className="report-grid" style={{ marginTop: 40 }}>
        <section className="panel" style={{ padding: 0, overflow: "hidden", minHeight: 420, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "24px", background: "#f8f9fa", borderBottom: "1px solid #bfc2c4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Live Hazard Map</h2>
             <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", fontWeight: 700 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#dc2626" }}></div>
                LIVE FEED
             </div>
          </div>
          <div style={{ 
            flex: 1, 
            backgroundColor: "#e2e8f0", 
            backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=52.5200,13.4050&zoom=13&size=800x600&style=feature:all|element:labels|visibility:on&sensor=false')", 
            backgroundSize: "cover", 
            backgroundPosition: "center",
            position: "relative"
          }}>
             <div style={{ position: "absolute", bottom: 16, right: 16, backgroundColor: "#fff", padding: "16px", borderRadius: 4, border: "1px solid #111", minWidth: 160 }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, color: "#6b7280", marginBottom: 12 }}>SEVERITY SCALE</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 8, background: "linear-gradient(to right, #fbbf24, #f97316, #dc2626)" }}></div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#111" }}>Low - Critical</div>
                </div>
              </div>
          </div>
        </section>

        <section className="panel" style={{ backgroundColor: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", height: 420 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h3 style={{ margin: 0, fontSize: "1.2rem", letterSpacing: 1, color: "#fff" }}>HAZARD LOG</h3>
            <AlertTriangle size={20} color="#dc2626" />
          </div>
          
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24, paddingRight: 8 }}>
            <HazardItem 
              time="12:44:02" sector="SECTOR 08" 
              text="Critical pothole formation detected at A10 junction. Emergency team dispatched." 
              color="#dc2626" 
            />
            <HazardItem 
              time="12:38:15" sector="SECTOR 02" 
              text="Structural degradation verified via AI scan on Bridge 12-B. Level: Moderate." 
              color="#f97316" 
            />
            <HazardItem 
              time="12:15:30" sector="SECTOR 14" 
              text="Routine scheduled survey completed for drainage systems." 
              color="#6b7280" 
            />
          </div>

          <button style={{ width: "100%", padding: "14px", backgroundColor: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1, cursor: "pointer", marginTop: 24, transition: "border 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.6)"} onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"}>
            VIEW ALL INCIDENTS
          </button>
        </section>
      </div>

      <div className="card-grid three" style={{ marginTop: 40 }}>
        <section className="panel">
          <h2 style={{ fontSize: "1.1rem", marginBottom: 32, textTransform: "uppercase", letterSpacing: 1 }}>Damage Distribution</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <DistributionRow label="CENTRAL SECTOR" percent={42} />
            <DistributionRow label="NORTH DISTRICT" percent={28} />
            <DistributionRow label="SOUTH COASTAL" percent={15} />
            <DistributionRow label="WESTERN INDUSTRIAL" percent={15} />
          </div>
        </section>

        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Active Repairs</h2>
            <div style={{ backgroundColor: "#fef3c7", color: "#b45309", fontSize: "0.7rem", fontWeight: 700, padding: "4px 8px", borderRadius: 4, letterSpacing: 1 }}>8 ONGOING</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <RepairItem 
              title="A10 Pavement Resurfacing" 
              img="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=100&q=80"
              progress={85} due="Due Today" color="#16a34a"
            />
            <RepairItem 
              title="Bridge 12-B Structural Reinforcement" 
              img="https://images.unsplash.com/photo-1541888087541-d326f2db194f?auto=format&fit=crop&w=100&q=80"
              progress={32} due="Due 08/24" color="#111"
            />
            <RepairItem 
              title="Sector 14 Drainage Overhaul" 
              img="https://images.unsplash.com/photo-1621516246875-9c5950e181ee?auto=format&fit=crop&w=100&q=80"
              progress={12} due="Due 09/12" color="#111"
            />
          </div>
        </section>

        <section className="panel">
          <h2 style={{ fontSize: "1.1rem", marginBottom: 32, textTransform: "uppercase", letterSpacing: 1 }}>Team Allocation</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TeamItem 
              name="TEAM ALPHA" status="ACTIVE DEPLOYMENT" statusColor="#16a34a"
              avatars={3}
            />
            <TeamItem 
              name="TEAM BETA" status="SCHEDULED TRANSIT" statusColor="#2563eb"
              avatars={2}
            />
            <TeamItem 
              name="TEAM GAMMA" status="STANDBY / BASE" statusColor="#4b5563"
              avatars={4}
            />
          </div>
          <button className="outline wide" style={{ marginTop: 24 }} onClick={() => setPage("team-allocation")}>
            Manage Teams
          </button>
        </section>
      </div>
    </main>
  );
}

// Subcomponents

function HazardItem({ time, sector, text, color }) {
  return (
    <div style={{ position: "relative", paddingLeft: 16, borderLeft: `2px solid ${color}` }}>
      <div style={{ fontSize: "0.7rem", color: "#9ca3af", letterSpacing: 0.5, marginBottom: 6 }}>
        {time} • {sector}
      </div>
      <div style={{ fontSize: "0.9rem", color: "#f9fafb", lineHeight: 1.4 }}>
        {text}
      </div>
    </div>
  );
}

function DistributionRow({ label, percent }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#111", letterSpacing: 0.5 }}>{label}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>{percent}%</span>
      </div>
      <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${percent}%`, height: "100%", background: "#111", borderRadius: 3 }}></div>
      </div>
    </div>
  );
}

function RepairItem({ title, img, progress, due, color }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <img src={img} alt={title} style={{ width: 48, height: 48, borderRadius: 4, objectFit: "cover" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", lineHeight: 1.3, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 8 }}>{progress}% Complete · {due}</div>
        <div style={{ height: 4, background: "#f3f4f6", borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: color, borderRadius: 2 }}></div>
        </div>
      </div>
    </div>
  );
}

function TeamItem({ name, status, statusColor, avatars }) {
  return (
    <div style={{ border: "1px solid #bfc2c4", borderRadius: 4, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
      <div>
        <div style={{ fontSize: "0.8rem", color: "#6b7280", letterSpacing: 0.5, marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: statusColor, letterSpacing: 0.5 }}>{status}</div>
      </div>
      <div style={{ display: "flex" }}>
        {Array.from({ length: avatars }).map((_, i) => (
          <div key={i} style={{ width: 24, height: 24, borderRadius: "50%", background: "#d1d5db", border: "2px solid #fff", marginLeft: i === 0 ? 0 : -8 }}></div>
        ))}
      </div>
    </div>
  );
}
