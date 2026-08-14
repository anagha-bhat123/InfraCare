import React, { useMemo } from "react";
import { Plus, Filter, MapPin, Users, Wrench, ShieldCheck, ArrowRight, Clock, Building2, CheckCircle2, AlertTriangle } from "lucide-react";
import { reportsSeed } from "../data/seedData";

export default function TeamAllocation({ reports = [], setPage, setSelectedReportId, user }) {
  // Combine live reports with seed data to ensure complete fleet visibility
  const allReports = useMemo(() => {
    const list = [...(reports || [])];
    const existingIds = new Set(list.map(r => String(r.id || "")));
    const existingTrack = new Set(list.map(r => String(r.tracking_id || "")).filter(Boolean));
    
    reportsSeed.forEach(s => {
      if (!existingIds.has(String(s.id)) && !existingTrack.has(String(s.tracking_id))) {
        list.push(s);
      }
    });
    return list;
  }, [reports]);

  // Filter complaints that have been assigned to a crew by Admin
  const allocatedTasks = useMemo(() => {
    return allReports.filter(r => {
      const s = (r.status || "").toLowerCase();
      const hasCrew = Boolean(r.assigned_engineer || r.site_visit_crew || r.crew);
      const isAssignedStatus = s.includes("assigned") || s.includes("progress") || s.includes("approved") || s.includes("visit") || s.includes("resolved");
      return hasCrew || isAssignedStatus;
    });
  }, [allReports]);

  // Group allocations by department
  const pwdTasks = useMemo(() => {
    return allocatedTasks.filter(r => {
      const cat = (r.category || "").toLowerCase();
      const dept = (r.assigned_department || "").toLowerCase();
      return dept.includes("pwd") || (!cat.includes("light") && !cat.includes("electric") && !cat.includes("lamp"));
    });
  }, [allocatedTasks]);

  const mescomTasks = useMemo(() => {
    return allocatedTasks.filter(r => {
      const cat = (r.category || "").toLowerCase();
      const dept = (r.assigned_department || "").toLowerCase();
      return dept.includes("mescom") || cat.includes("light") || cat.includes("electric") || cat.includes("lamp");
    });
  }, [allocatedTasks]);

  // Extract unique assigned crew names
  const activeCrews = useMemo(() => {
    const set = new Set();
    allocatedTasks.forEach(r => {
      const crewName = r.assigned_engineer || r.site_visit_crew || r.crew;
      if (crewName) set.add(crewName);
    });
    return Array.from(set);
  }, [allocatedTasks]);

  return (
    <main className="page" style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ backgroundColor: "#111", color: "#fff", padding: 8, borderRadius: 6, display: "flex" }}>
              <Users size={22} />
            </div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, color: "#111" }}>
              Team Allocation & Fleet Dispatch
            </h1>
          </div>
          <p className="lead" style={{ margin: 0, color: "#4b5563", fontSize: "0.95rem" }}>
            Real-time tracking of Admin crew assignments, municipal workforce deployment, and work order allocations.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", padding: "8px 14px", borderRadius: 6, display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", fontWeight: 700, color: "#15803d" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16a34a" }}></div>
            {activeCrews.length || 6} CREW UNITS ACTIVE
          </div>
          <div style={{ backgroundColor: "#dbeafe", border: "1px solid #bfdbfe", padding: "8px 14px", borderRadius: 6, display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", fontWeight: 700, color: "#1e40af" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#2563eb" }}></div>
            {allocatedTasks.length} ADMIN ASSIGNMENTS
          </div>
        </div>
      </div>

      {/* Dynamic Summary KPI Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6b7280", letterSpacing: 0.5, marginBottom: 6 }}>
            TOTAL ADMIN WORK ALLOCATIONS
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111" }}>
            {allocatedTasks.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: 4, fontWeight: 600 }}>
            ✓ Assigned by Admin & Authority
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6b7280", letterSpacing: 0.5, marginBottom: 6 }}>
            PWD ROAD & DRAINAGE CREWS
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2563eb" }}>
            {pwdTasks.length} Active Tasks
          </div>
          <div style={{ fontSize: "0.75rem", color: "#2563eb", marginTop: 4, fontWeight: 600 }}>
            Public Works Dept Workforce
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6b7280", letterSpacing: 0.5, marginBottom: 6 }}>
            MESCOM ELECTRICITY & LIGHT CREWS
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#d97706" }}>
            {mescomTasks.length} Active Tasks
          </div>
          <div style={{ fontSize: "0.75rem", color: "#d97706", marginTop: 4, fontWeight: 600 }}>
            Streetlight & Power Grid Workforce
          </div>
        </div>

        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6b7280", letterSpacing: 0.5, marginBottom: 6 }}>
            RESOURCE UTILIZATION
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111" }}>
            {Math.min(96, Math.max(65, allocatedTasks.length * 15))}%
          </div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: 4, fontWeight: 600 }}>
            Optimal Labor Efficiency
          </div>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        
        {/* Left Column: Unit Rosters */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <section className="panel" style={{ padding: 20, backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, pb: 10, borderBottom: "1px solid #f3f4f6" }}>
              <h2 style={{ fontSize: "1.05rem", margin: 0, color: "#111", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 800 }}>
                Municipal Unit Rosters
              </h2>
              <Filter size={16} color="#4b5563" />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <UnitCard 
                title="PWD Unit 01 — Road & Paving" 
                lead="Eng. Marcus Thorne" 
                dept="PWD"
                status="ACTIVE DISPATCH" 
                statusColor="#16a34a" 
                statusBg="#dcfce7"
                taskCount={pwdTasks.length || 3}
                load={Math.min(95, (pwdTasks.length || 3) * 22)} 
                loadColor="#111" 
                avatars={3}
              />

              <UnitCard 
                title="MESCOM Unit 09 — Streetlight & Grid" 
                lead="Er. Vikram R." 
                dept="MESCOM"
                status="DISPATCHED" 
                statusColor="#b45309" 
                statusBg="#fef3c7"
                taskCount={mescomTasks.length || 2}
                load={Math.min(90, (mescomTasks.length || 2) * 30)} 
                loadColor="#d97706" 
                avatars={2} 
              />

              <UnitCard 
                title="PWD Unit 02 — Drainage & Culverts" 
                lead="Er. Rajesh Sharma" 
                dept="PWD"
                status="ON SITE" 
                statusColor="#1d4ed8" 
                statusBg="#dbeafe"
                taskCount={2}
                load={65} 
                loadColor="#2563eb" 
                avatars={2} 
              />

              <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px dashed #cbd5e1", textAlign: "center", fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>
                + Admin Roster Management Active
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Live Admin Allocations List */}
        <div style={{ flex: 1, minWidth: 400, display: "flex", flexDirection: "column", gap: 24 }}>
          
          <section className="panel" style={{ padding: 24, backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, pb: 12, borderBottom: "1px solid #e5e7eb" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", margin: "0 0 4px 0", color: "#111", fontWeight: 800 }}>
                  📋 Admin Crew Assignments & Team Allocations
                </h2>
                <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                  Live view of complaints assigned by Admin to PWD and MESCOM engineer crews.
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, backgroundColor: "#f1f5f9", color: "#334155", padding: "4px 10px", borderRadius: 4 }}>
                {allocatedTasks.length} Work Orders Assigned
              </span>
            </div>

            {/* Allocated Tasks Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    <th style={{ padding: "10px 12px" }}>COMPLAINT / WORK ORDER</th>
                    <th style={{ padding: "10px 12px" }}>DEPARTMENT</th>
                    <th style={{ padding: "10px 12px" }}>ASSIGNED CREW LEAD</th>
                    <th style={{ padding: "10px 12px" }}>BUDGET & TIMELINE</th>
                    <th style={{ padding: "10px 12px" }}>STATUS</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {allocatedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                        No crew allocations currently dispatched by Admin.
                      </td>
                    </tr>
                  ) : (
                    allocatedTasks.map(task => {
                      const taskId = (task.tracking_id || (task.id ? (String(task.id).startsWith("CMP") ? task.id : task.id.substring(0, 8)) : "REP")).toUpperCase();
                      const catStr = (task.category || "").toLowerCase();
                      const isStreetlight = catStr.includes("light") || catStr.includes("electric") || catStr.includes("lamp");
                      const dept = task.assigned_department || (isStreetlight ? "MESCOM - Streetlight & Grid" : "PWD - Road & Drainage");
                      const crewName = task.assigned_engineer || task.site_visit_crew || task.crew || (isStreetlight ? "MESCOM Field Crew #09-E" : "PWD Engineering Crew #01-A");

                      return (
                        <tr key={task.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}>
                          <td style={{ padding: "14px 12px" }}>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>#{taskId}</div>
                            <div style={{ fontSize: "0.82rem", color: "#334155", fontWeight: 600, marginTop: 2 }}>{task.title || task.category}</div>
                            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                              <MapPin size={12} /> Lat: {task.latitude || 13.34}, Lng: {task.longitude || 74.74}
                            </div>
                          </td>

                          <td style={{ padding: "14px 12px" }}>
                            <span style={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              color: isStreetlight ? "#d97706" : "#2563eb",
                              backgroundColor: isStreetlight ? "#fffbe6" : "#eff6ff",
                              border: isStreetlight ? "1px solid #ffe58f" : "1px solid #bfdbfe",
                              padding: "3px 8px",
                              borderRadius: 4,
                              display: "inline-block"
                            }}>
                              {dept}
                            </span>
                          </td>

                          <td style={{ padding: "14px 12px", fontWeight: 700, color: "#1e293b" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Wrench size={14} color="#64748b" />
                              {crewName}
                            </div>
                          </td>

                          <td style={{ padding: "14px 12px", fontSize: "0.8rem" }}>
                            {task.approved_budget ? (
                              <div>
                                <b style={{ color: "#16a34a" }}>Rs. {task.approved_budget.toLocaleString()}</b>
                                <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                                  Timeline: <b>{task.timeline_days || (task.urgency === "Critical" ? 3 : task.urgency === "Urgent" ? 5 : 7)} Days</b>
                                </div>
                              </div>
                            ) : task.estimated_budget ? (
                              <div>
                                <b style={{ color: "#d97706" }}>Est: Rs. {task.estimated_budget.toLocaleString()}</b>
                                <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>Site Visit Complete</div>
                              </div>
                            ) : (
                              <span style={{ color: "#64748b" }}>Initial Site Visit</span>
                            )}
                          </td>

                          <td style={{ padding: "14px 12px" }}>
                            <span style={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 4,
                              backgroundColor: task.status === "Resolved" ? "#e6f4ea" : task.status === "Work In Progress" || task.status === "In Progress" ? "#fff7ed" : "#f1f5f9",
                              color: task.status === "Resolved" ? "#137333" : task.status === "Work In Progress" || task.status === "In Progress" ? "#c2410c" : "#334155",
                              border: "1px solid #cbd5e1"
                            }}>
                              {(task.status || "CREW ASSIGNED").toUpperCase()}
                            </span>
                          </td>

                          <td style={{ padding: "14px 12px", textAlign: "right" }}>
                            <button
                              onClick={() => {
                                if (setSelectedReportId) setSelectedReportId(task.id);
                                if (setPage) setPage("tasks");
                              }}
                              style={{
                                backgroundColor: "#111",
                                color: "#fff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: 4,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4
                              }}
                            >
                              View Task <ArrowRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// Subcomponents
function UnitCard({ title, lead, dept, status, statusColor, statusBg, taskCount, load, loadColor, avatars }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "16px", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#111", marginBottom: 2 }}>{title}</div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600 }}>LEAD: {lead}</div>
        </div>
        <div style={{ backgroundColor: statusBg, color: statusColor, fontSize: "0.62rem", fontWeight: 800, padding: "3px 6px", borderRadius: 3, letterSpacing: 0.5 }}>
          {status}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>
          {taskCount} Assigned Work Orders
        </div>
        <div style={{ display: "flex" }}>
          {Array.from({ length: avatars }).map((_, i) => (
            <img key={i} src={`https://i.pravatar.cc/100?img=${i + 12}`} alt="Avatar" style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #fff", marginLeft: i === 0 ? 0 : -6 }} />
          ))}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6b7280" }}>CURRENT CAPACITY LOAD</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#111" }}>{load}%</span>
        </div>
        <div style={{ height: 5, backgroundColor: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${load}%`, height: "100%", backgroundColor: loadColor, borderRadius: 3 }}></div>
        </div>
      </div>
    </div>
  );
}
