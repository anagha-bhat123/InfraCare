import React from "react";
import { Plus, Filter, MapPin, MoreVertical } from "lucide-react";

export default function TeamAllocation({ setPage }) {
  return (
    <main className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1>Fleet Management</h1>
          <p className="lead" style={{ margin: 0 }}>Operational Overview & Labor Allocation for Cycle Q4</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ backgroundColor: "#e5e7eb", padding: "8px 12px", borderRadius: 4, display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", fontWeight: 700, color: "#111", letterSpacing: 0.5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16a34a" }}></div>
            14 UNITS ONLINE
          </div>
          <div style={{ backgroundColor: "#e5e7eb", padding: "8px 12px", borderRadius: 4, display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", fontWeight: 700, color: "#111", letterSpacing: 0.5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f97316" }}></div>
            2 PENDING DISPATCH
          </div>
        </div>
      </div>

      <section className="metrics" style={{ marginBottom: 40 }}>
        {[
          ["94.2%", "Efficiency Rate"], 
          ["4.2 hr", "MTTR (Average)"], 
          ["128/140", "Resources Utilized"], 
          ["72%", "Budget Allocation"]
        ].map(([n, l]) => (
          <div key={l}><strong>{n}</strong><span>{l}</span></div>
        ))}
      </section>

      <div style={{ display: "flex", gap: 32 }}>
        
        {/* Unit Rosters (Left Col) */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <section className="panel" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#111", textTransform: "uppercase", letterSpacing: 1 }}>Unit Rosters</h2>
              <Filter size={18} color="#4b5563" cursor="pointer" />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <UnitCard 
                title="UNIT 01 — Structural" lead="MAROON, J." status="ACTIVE" statusColor="#16a34a" statusBg="#dcfce7"
                load={88} loadColor="#111" avatars={2} extra={3} 
              />
              <UnitCard 
                title="UNIT 02 — Electrical" lead="CHEN, L." status="AT CAPACITY" statusColor="#b45309" statusBg="#fef3c7"
                load={100} loadColor="#dc2626" avatars={2} 
              />
              <UnitCard 
                title="UNIT 03 — Paving" lead="SANCHEZ, R." status="STANDBY" statusColor="#4b5563" statusBg="#e5e7eb"
                load={12} loadColor="#6b7280" avatars={1} 
              />
              <button style={{ width: "100%", padding: "16px", backgroundColor: "transparent", color: "#9ca3af", border: "2px dashed #d1d5db", borderRadius: 4, fontSize: "0.85rem", fontWeight: 700, letterSpacing: 1, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor="#9ca3af"} onMouseLeave={e => e.currentTarget.style.borderColor="#d1d5db"}>
                + CREATE NEW UNIT
              </button>
            </div>
          </section>
        </div>

        {/* Right Col: Timeline & Repairs */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Timeline */}
          <section className="panel" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#111", textTransform: "uppercase", letterSpacing: 1 }}>Scheduling Timeline</h2>
              <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                <button style={{ backgroundColor: "#111", color: "#fff", border: "none", padding: "6px 16px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>DAY</button>
                <button style={{ backgroundColor: "#f3f4f6", color: "#6b7280", border: "none", borderLeft: "1px solid #e5e7eb", padding: "6px 16px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>WEEK</button>
                <button style={{ backgroundColor: "#f3f4f6", color: "#6b7280", border: "none", borderLeft: "1px solid #e5e7eb", padding: "6px 16px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>MONTH</button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr>
                    <th style={{ width: 140, textAlign: "left", padding: "12px 0", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: "0.8rem", fontWeight: 500 }}>TASK<br/>/<br/>UNIT</th>
                    <TimeHeader text="08:00" />
                    <TimeHeader text="09:00" />
                    <TimeHeader text="10:00" />
                    <TimeHeader text="11:00" />
                    <TimeHeader text="12:00" />
                    <TimeHeader text="NOON" color="#dc2626" />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "16px 0", fontSize: "0.8rem", borderBottom: "1px solid #e5e7eb" }}>Site A-41 Repair</td>
                    <td colSpan={3} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>
                       <div style={{ backgroundColor: "#111", color: "#fff", padding: "8px 12px", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" }}>UNIT 01 - PROGRESS 75%</div>
                    </td>
                    <td colSpan={3} style={{ borderBottom: "1px solid #e5e7eb" }}></td>
                  </tr>
                  <tr>
                    <td style={{ padding: "16px 0", fontSize: "0.8rem", borderBottom: "1px solid #e5e7eb" }}>Hwy 101 Patching</td>
                    <td colSpan={2} style={{ borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}></td>
                    <td colSpan={4} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
                       <div style={{ backgroundColor: "#d1d5db", color: "#111", padding: "8px 12px", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" }}>UNIT 03 - PENDING START</div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "16px 0", fontSize: "0.8rem", borderBottom: "1px solid #e5e7eb" }}>Signal Calibration</td>
                    <td colSpan={1} style={{ borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}></td>
                    <td colSpan={2} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>
                       <div style={{ backgroundColor: "#111", color: "#fff", padding: "8px 12px", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" }}>UNIT 02 - FINISHED</div>
                    </td>
                    <td colSpan={3} style={{ padding: "12px 12px 12px 0", borderBottom: "1px solid #e5e7eb" }}>
                       <div style={{ border: "2px solid #111", color: "#111", padding: "6px 12px", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" }}>UNIT 02 - NEXT TASK</div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "16px 0", fontSize: "0.8rem" }}>Substation Audit</td>
                    <td colSpan={5} style={{ borderRight: "1px solid #e5e7eb" }}></td>
                    <td style={{ padding: "12px 0" }}>
                      <div style={{ backgroundColor: "#dc2626", width: 8, height: 32 }}></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Verified Repairs Cards */}
          <div style={{ position: "relative" }}>
            <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 0 }}>
              <RepairCard 
                id="#9021" title="Bridge Joint Expansion" 
                desc="Thermal drift detected in Sector 7. Immediate structural stabilization required within 24 hours."
                loc="West Side Crossing"
              />
              <RepairCard 
                id="#8845" title="Grid Inverter Replacement" 
                desc="Phase imbalance reported at Substation E4. Requires Grade-A Electrical certification for handling."
                loc="Eastern Industrial Hub"
              />
            </div>
            
            {/* Floating Action Button */}
            <div style={{ position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, backgroundColor: "#111", color: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
              <Plus size={24} />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

// Subcomponents

function UnitCard({ title, lead, status, statusColor, statusBg, load, loadColor, avatars, extra }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: "20px", backgroundColor: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111", marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: "0.75rem", color: "#6b7280", letterSpacing: 0.5 }}>LEAD: {lead}</div>
        </div>
        <div style={{ backgroundColor: statusBg, color: statusColor, fontSize: "0.65rem", fontWeight: 700, padding: "4px 8px", borderRadius: 2, letterSpacing: 0.5 }}>
          {status}
        </div>
      </div>
      
      <div style={{ display: "flex", marginBottom: 20 }}>
        {Array.from({ length: avatars }).map((_, i) => (
          <img key={i} src={`https://i.pravatar.cc/100?img=${i+12}`} alt="Avatar" style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #fff", marginLeft: i === 0 ? 0 : -8 }} />
        ))}
        {extra && (
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #fff", backgroundColor: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, marginLeft: -8, zIndex: 10 }}>
            +{extra}
          </div>
        )}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>CURRENT LOAD</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111" }}>{load}%</span>
        </div>
        <div style={{ height: 4, backgroundColor: "#f3f4f6", borderRadius: 2 }}>
          <div style={{ width: `${load}%`, height: "100%", backgroundColor: loadColor, borderRadius: 2 }}></div>
        </div>
      </div>
    </div>
  );
}

function TimeHeader({ text, color }) {
  return (
    <th style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb", borderRight: "1px solid #f3f4f6", color: color || "#111", fontSize: "0.7rem", fontWeight: 700, textAlign: "center" }}>
      {text}
    </th>
  );
}

function RepairCard({ id, title, desc, loc }) {
  return (
    <section className="panel" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ backgroundColor: "#e5e7eb", color: "#111", fontSize: "0.65rem", fontWeight: 700, padding: "4px 8px", borderRadius: 2, letterSpacing: 1 }}>VERIFIED REPAIR {id}</div>
        <MoreVertical size={16} color="#6b7280" cursor="pointer" />
      </div>
      
      <h3 style={{ fontSize: "1.2rem", margin: "0 0 12px", color: "#111" }}>{title}</h3>
      <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.5, margin: "0 0 24px", flex: 1 }}>{desc}</p>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, color: "#111", fontSize: "0.75rem", maxWidth: 120 }}>
          <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{loc}</span>
        </div>
        <button style={{ backgroundColor: "#000", color: "#fff", padding: "10px 16px", border: "none", borderRadius: 4, fontSize: "0.75rem", fontWeight: 700, letterSpacing: 0.5, cursor: "pointer" }}>
          ASSIGN TEAM
        </button>
      </div>
    </section>
  );
}
