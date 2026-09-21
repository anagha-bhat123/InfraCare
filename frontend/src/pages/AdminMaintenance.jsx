import React, { useState } from "react";
import { 
  BarChart3, AlertTriangle, Wrench, Users, FileText, Search, Bell, Settings,
  MapPin, CheckCircle2, Clock, Truck, ShieldAlert, ArrowRight, Filter, ChevronRight, Plus, X, Check
} from "lucide-react";
import Swal from "sweetalert2";
import MapPanel from "../components/MapPanel";

export default function AdminMaintenance({ setPage, reports = [] }) {
  // Timeline state
  const [timelineMode, setTimelineMode] = useState("DAY"); // "DAY" | "WEEK" | "MONTH"

  // Fleet units state (Mock data for live tracking)
  const [fleetUnits, setFleetUnits] = useState([
    { id: "UNIT-402", type: "Excavator", location: "Udupi Central Hub", status: "ON-SITE", statusBg: "#dcfce7", statusText: "#15803d", active: true },
    { id: "UNIT-881", type: "Mobile Lab", location: "Manipal Sector 4", status: "DISPATCHED", statusBg: "#dbeafe", statusText: "#1d4ed8", active: true },
    { id: "UNIT-109", type: "Emergency Repair Squad", location: "Surathkal Highway", status: "DISPATCHED", statusBg: "#dbeafe", statusText: "#1d4ed8", active: true },
    { id: "UNIT-220", type: "Heavy Crane", location: "Udupi Coastal Base", status: "MAINTENANCE", statusBg: "#f3f4f6", statusText: "#4b5563", active: false }
  ]);

  // Local assignments state to simulate assignment UI feedback
  const [localAssignments, setLocalAssignments] = useState({});

  // Dynamic Pending Tasks calculation
  const dynamicPendingTasks = React.useMemo(() => {
    return reports
      .filter(r => {
        const s = (r.status || "").toLowerCase();
        // Show reports that are not resolved and don't have an assigned crew (either in DB or locally)
        const isResolved = s === "resolved" || s === "completed" || s === "verified";
        const hasAssignment = r.assigned_engineer || localAssignments[r.id];
        return !isResolved && !hasAssignment;
      })
      .map(r => ({
        id: r.tracking_id || r.id,
        priority: (r.urgency || "ROUTINE").toUpperCase(),
        title: r.title,
        desc: r.description || "Reported by citizen. Visual confirmation pending.",
        assignedTeam: null,
        area: r.ward_zone || r.ward || "Udupi District",
        originalReport: r
      }))
      .slice(0, 10); // Limit to top 10 for UI
  }, [reports, localAssignments]);

  // Dynamic Active Remediation Works calculation
  const dynamicActiveRemediation = React.useMemo(() => {
    return reports
      .filter(r => {
        const s = (r.status || "").toLowerCase();
        const hasAssignment = r.assigned_engineer || localAssignments[r.id];
        const isResolved = s === "resolved" || s === "completed" || s === "verified";
        return !isResolved && hasAssignment;
      })
      .map(r => {
        // Calculate a dummy progress based on date for UI demonstration purposes
        const created = new Date(r.created_at || r.date || Date.now());
        const daysActive = Math.max(0.5, (new Date() - created) / (1000 * 60 * 60 * 24));
        const progressPct = Math.min(95, Math.floor(daysActive * 12));
        
        let barColor = "#111";
        let barBg = "#e5e7eb";
        let colorText = "#111";
        let stage1 = "CREW ASSIGNED";
        let stage2 = "WORK IN PROGRESS";
        
        if (progressPct < 20) {
          barColor = "#dc2626"; // red for just started / low progress
          barBg = "#fee2e2";
          colorText = "#dc2626";
          stage1 = "MOBILIZING";
          stage2 = "MATERIALS PENDING";
        } else if (progressPct > 70) {
          barColor = "#16a34a"; // green for nearing completion
          barBg = "#dcfce7";
          colorText = "#16a34a";
          stage1 = "REPAIR COMPLETE";
          stage2 = "FINAL SEAL PENDING";
        }
        
        return {
          id: r.tracking_id || r.id,
          title: r.title,
          area: r.ward_zone || r.ward || "Udupi",
          progress: progressPct,
          barColor,
          barBg,
          colorText,
          stage1,
          stage2
        };
      });
  }, [reports, localAssignments]);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskArea, setNewTaskArea] = useState("Udupi Central");
  const [newTaskPriority, setNewTaskPriority] = useState("URGENT");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const [assigningTask, setAssigningTask] = useState(null);
  const [selectedCrew, setSelectedCrew] = useState("Team Alpha (Udupi)");

  // Filter state for Active Remediation
  const [typeFilter, setTypeFilter] = useState("ALL"); // "ALL" | "SEWER" | "BRIDGE" | "ROAD"

  // Toggle fleet unit active state
  const toggleFleetStatus = (unitId) => {
    setFleetUnits(prev => prev.map(u => {
      if (u.id === unitId) {
        const nextActive = !u.active;
        return {
          ...u,
          active: nextActive,
          status: nextActive ? "ON-SITE" : "MAINTENANCE",
          statusBg: nextActive ? "#dcfce7" : "#f3f4f6",
          statusText: nextActive ? "#15803d" : "#4b5563"
        };
      }
      return u;
    }));

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: `Fleet ${unitId} Status Updated`,
      showConfirmButton: false,
      timer: 2000
    });
  };

  // Add new task handler
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newT = {
      id: `TASK-00${pendingTasks.length + 1}`,
      priority: newTaskPriority,
      title: newTaskTitle.trim(),
      desc: newTaskDesc.trim() || "Generated by Admin Maintenance Command.",
      assignedTeam: null,
      area: newTaskArea
    };

    // Normally this would POST to backend
    // setPendingTasks(prev => [newT, ...prev]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setIsTaskModalOpen(false);

    Swal.fire({
      icon: "success",
      title: "Work Order Created",
      text: `Task "${newT.title}" added to queue for ${newT.area}.`,
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  };

  // Assign task handler
  const handleConfirmAssignment = (e) => {
    e.preventDefault();
    if (!assigningTask) return;

    setLocalAssignments(prev => ({ ...prev, [assigningTask.id]: selectedCrew }));
    setAssigningTask(null);

    Swal.fire({
      icon: "success",
      title: "Crew Assigned",
      text: `${selectedCrew} assigned to "${assigningTask.title}".`,
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  };

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "20px 40px" }}>
      <div style={{ width: "100%" }}>
        {/* PAGE CONTENT */}
        <div className="admin-scroll-content">
          
          {/* HEADER */}
          <div className="admin-page-header" style={{ marginBottom: 24 }}>
            <div className="admin-header-text">
              <h2 className="serif-title large">Maintenance Operations Command</h2>
              <p>Real-time fleet tracking, crew dispatch, and work order lifecycle management across Udupi district.</p>
            </div>
            <div className="admin-header-actions">
              <button className="admin-btn-black" onClick={() => setIsTaskModalOpen(true)}>
                <Plus size={16} className="mr-2 inline" /> CREATE WORK ORDER
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            
            {/* LEFT COLUMN */}
            <div>
              {/* FLEET STATUS */}
              <div style={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", padding: 24, borderRadius: 8, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: 16, marginBottom: 20 }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6b7280", letterSpacing: 1 }}>FLEET STATUS</span>
                    <h3 className="serif-title" style={{ fontSize: "1.3rem", margin: "4px 0 0" }}>Operational Readiness</h3>
                  </div>
                  <div style={{ display: "flex", gap: 24, textAlign: "right" }}>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 700 }}>Units Dispatched</span>
                      <strong style={{ display: "block", fontSize: "1.2rem", color: "#111", marginTop: 2 }}>
                        {fleetUnits.filter(u => u.active).length} / {fleetUnits.length}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 700 }}>Standby / Service</span>
                      <strong style={{ display: "block", fontSize: "1.2rem", color: "#dc2626", marginTop: 2 }}>
                        {fleetUnits.filter(u => !u.active).length}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  {fleetUnits.map((unit) => (
                    <div 
                      key={unit.id}
                      onClick={() => toggleFleetStatus(unit.id)}
                      style={{ 
                        border: "1px solid #e5e5e5", 
                        padding: 16, 
                        borderRadius: 6, 
                        backgroundColor: unit.active ? "#fff" : "#fafafa",
                        opacity: unit.active ? 1 : 0.7,
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      title="Click to toggle maintenance/active status"
                    >
                      <span style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: 4, 
                        fontSize: "0.65rem", 
                        fontWeight: 800, 
                        padding: "3px 8px", 
                        borderRadius: 4,
                        backgroundColor: unit.statusBg, 
                        color: unit.statusText,
                        marginBottom: 12 
                      }}>
                        {unit.active ? <Truck size={12} /> : <ShieldAlert size={12} />} {unit.status}
                      </span>
                      <h4 style={{ fontWeight: 800, fontSize: "0.95rem", margin: "0 0 2px", color: "#111" }}>{unit.id}</h4>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: 12 }}>({unit.type})</span>
                      <p style={{ fontSize: "0.75rem", color: "#374151", margin: "0 0 12px", lineHeight: 1.3 }}>{unit.location}</p>
                      <div style={{ display: "flex", alignItems: "center", fontSize: "0.7rem", fontWeight: 800, color: unit.active ? "#16a34a" : "#dc2626" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: unit.active ? "#16a34a" : "#dc2626", marginRight: 6 }} />
                        {unit.active ? "LIVE MONITORING" : "SERVICE QUEUE"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROJECT TIMELINE */}
              <div style={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, marginBottom: 24, overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="serif-title" style={{ fontSize: "1.2rem", margin: 0 }}>Project Timeline & Work Orders</h3>
                  <div style={{ border: "1px solid #e5e5e5", borderRadius: 4, overflow: "hidden", display: "flex" }}>
                    {["DAY", "WEEK", "MONTH"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setTimelineMode(m);
                          Swal.fire({
                            toast: true,
                            position: "top-end",
                            icon: "info",
                            title: `Timeline View: ${m}`,
                            showConfirmButton: false,
                            timer: 1500
                          });
                        }}
                        style={{
                          padding: "6px 14px",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: timelineMode === m ? "#111" : "#fff",
                          color: timelineMode === m ? "#fff" : "#333"
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", padding: "12px 24px", borderBottom: "1px solid #f0f0f0", background: "#fafafa", fontSize: "0.75rem", fontWeight: 800, color: "#6b7280" }}>
                    <div style={{ flex: 1 }}>PROJECT NAME / LOCATION</div>
                    <div style={{ flex: 2, display: "flex", justifyContent: "space-between", paddingLeft: 20 }}>
                      <span>{timelineMode === "DAY" ? "08:00 AM" : timelineMode === "WEEK" ? "MON" : "WEEK 1"}</span>
                      <span>{timelineMode === "DAY" ? "11:00 AM" : timelineMode === "WEEK" ? "WED" : "WEEK 2"}</span>
                      <span>{timelineMode === "DAY" ? "02:00 PM" : timelineMode === "WEEK" ? "FRI" : "WEEK 3"}</span>
                      <span>{timelineMode === "DAY" ? "05:00 PM" : timelineMode === "WEEK" ? "SUN" : "WEEK 4"}</span>
                    </div>
                  </div>

                  {dynamicActiveRemediation.slice(0, 3).map((work, idx) => (
                    <div key={work.id} style={{ display: "flex", padding: "16px 24px", borderBottom: idx < 2 ? "1px solid #f0f0f0" : "none", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 800, fontSize: "0.85rem", margin: "0 0 2px", color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "250px" }} title={work.title}>
                          {work.title}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>#{work.id.slice(-6)} • {work.area}</span>
                      </div>
                      <div style={{ flex: 2, paddingLeft: 20, position: "relative", height: 32 }}>
                        {work.progress >= 95 ? (
                          <div style={{ position: "absolute", left: "0%", width: "100%", height: "100%", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: "0.7rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                            COMPLETED: POST-REPAIR INSPECTION VERIFIED
                          </div>
                        ) : (
                          <div style={{ position: "absolute", left: "0%", width: `${Math.max(10, work.progress)}%`, height: "100%", backgroundColor: "#111", color: "#fff", fontSize: "0.7rem", fontWeight: 800, display: "flex", alignItems: "center", paddingLeft: 10, borderRadius: 4, overflow: "hidden", whiteSpace: "nowrap" }}>
                            {work.stage1}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {dynamicActiveRemediation.length === 0 && (
                    <div style={{ padding: "30px", textAlign: "center", color: "#6b7280", fontSize: "0.85rem" }}>
                      No active projects in the timeline.
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIVE REMEDIATION PROGRESS */}
              <div style={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", padding: 24, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6b7280", letterSpacing: 1 }}>PROJECT PROGRESS</span>
                    <h3 className="serif-title" style={{ fontSize: "1.2rem", margin: "4px 0 0" }}>Active Remediation Works</h3>
                  </div>
                  <button 
                    onClick={() => setTypeFilter(typeFilter === "ALL" ? "ROAD" : typeFilter === "ROAD" ? "SEWER" : "ALL")}
                    style={{ background: "none", border: "1px solid #e5e5e5", padding: "6px 12px", borderRadius: 4, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Filter size={14} /> FILTER: {typeFilter}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                  {dynamicActiveRemediation.length === 0 && (
                    <div style={{ padding: "20px", color: "#6b7280", fontSize: "0.85rem", gridColumn: "span 3", textAlign: "center" }}>
                      No active remediation projects at this time.
                    </div>
                  )}
                  {dynamicActiveRemediation.map((work) => (
                    <div key={work.id} style={{ padding: 16, border: "1px solid #f0f0f0", borderRadius: 6, background: "#fafafa" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                        <div>
                          <h4 style={{ fontWeight: 800, fontSize: "0.85rem", margin: "0 0 2px", color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }} title={work.title}>
                            {work.title}
                          </h4>
                          <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{work.area} • #{work.id.slice(-6)}</span>
                        </div>
                        <span style={{ fontFamily: "Georgia, serif", fontWeight: 800, fontSize: "1.2rem", color: work.colorText }}>{work.progress}%</span>
                      </div>
                      <div style={{ height: 6, backgroundColor: work.barBg, borderRadius: 3, marginBottom: 8, overflow: "hidden" }}>
                        <div style={{ width: `${work.progress}%`, height: "100%", backgroundColor: work.barColor, transition: "width 0.5s ease" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontWeight: 800, color: work.colorText }}>
                        <span>{work.stage1}</span>
                        <span>{work.stage2}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div>
              {/* GEOSPATIAL MAP PANEL */}
              <div style={{ backgroundColor: "#111", color: "#fff", borderRadius: 8, overflow: "hidden", marginBottom: 24, height: 320, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0 }}>
                  <MapPanel coords={[13.3409, 74.7421]} reports={reports} />
                </div>
                <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.8)", padding: "6px 12px", borderRadius: 4, backdropFilter: "blur(4px)" }}>
                  <span style={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 800, display: "block" }}>GEOSPATIAL COMMAND</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>Udupi District Active Squads</span>
                </div>
              </div>

              {/* PENDING TASKS / WORK ORDERS */}
              <div style={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", padding: 20, borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h4 style={{ fontSize: "0.8rem", fontWeight: 800, color: "#374151", margin: 0, letterSpacing: 0.5 }}>PENDING WORK ORDERS</h4>
                  <span style={{ backgroundColor: "#111", color: "#fff", fontSize: "0.75rem", fontWeight: 800, padding: "2px 8px", borderRadius: 12 }}>
                    {dynamicPendingTasks.length}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {dynamicPendingTasks.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px", color: "#6b7280", fontSize: "0.8rem" }}>
                      No pending work orders require assignment.
                    </div>
                  )}
                  {dynamicPendingTasks.map((task) => (
                    <div key={task.id} style={{ border: "1px solid #e5e5e5", padding: 16, borderRadius: 6, backgroundColor: "#fafafa" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ 
                          fontSize: "0.65rem", 
                          fontWeight: 800, 
                          padding: "2px 6px", 
                          borderRadius: 3,
                          backgroundColor: task.priority === 'CRITICAL' ? '#fee2e2' : task.priority === 'URGENT' ? '#fef3c7' : '#f3f4f6',
                          color: task.priority === 'CRITICAL' ? '#b91c1c' : task.priority === 'URGENT' ? '#b45309' : '#374151'
                        }}>
                          {task.priority}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 700 }}>#{task.id}</span>
                      </div>
                      <h5 style={{ fontWeight: 800, fontSize: "0.85rem", margin: "0 0 4px", color: "#111" }}>{task.title}</h5>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0 0 12px", lineHeight: 1.3 }}>{task.desc}</p>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: task.assignedTeam ? "#16a34a" : "#dc2626" }}>
                          {task.assignedTeam ? `✓ Assigned: ${task.assignedTeam}` : "Unassigned"}
                        </span>
                        <button 
                          onClick={() => setAssigningTask(task)}
                          style={{ background: "none", border: "none", fontSize: "0.75rem", fontWeight: 800, color: "#111", cursor: "pointer", display: "flex", alignItems: "center" }}
                        >
                          ASSIGN <ChevronRight size={14} className="ml-1 inline" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  style={{ width: "100%", marginTop: 16, border: "1px dashed #d1d5db", padding: "10px", fontSize: "0.75rem", fontWeight: 800, color: "#374151", background: "#fff", borderRadius: 4, cursor: "pointer" }}
                >
                  + CREATE NEW WORK ORDER
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* MODAL: Create New Work Order */}
      {isTaskModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyCenter: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: 480, margin: "0 auto", padding: 32, borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", margin: 0 }}>Create Maintenance Work Order</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setIsTaskModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                Task Title / Description
                <input 
                  type="text" 
                  placeholder="e.g. Repair Damaged Storm Drain" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem" }}
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                  Location Sector
                  <select 
                    value={newTaskArea} 
                    onChange={(e) => setNewTaskArea(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem", background: "#fff" }}
                  >
                    <option value="Udupi Central">Udupi Central</option>
                    <option value="Manipal Hub">Manipal Hub</option>
                    <option value="Malpe Port">Malpe Port</option>
                    <option value="Kaup Region">Kaup Region</option>
                    <option value="Brahmavar Zone">Brahmavar Zone</option>
                  </select>
                </label>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                  Priority Level
                  <select 
                    value={newTaskPriority} 
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem", background: "#fff" }}
                  >
                    <option value="ROUTINE">ROUTINE</option>
                    <option value="URGENT">URGENT</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </label>
              </div>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                Field Notes & Instructions
                <textarea 
                  rows={3}
                  placeholder="Provide technical instructions for engineering crew..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setIsTaskModalOpen(false)} style={{ padding: "10px 16px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assign Task Crew */}
      {assigningTask && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyCenter: "center", padding: 20 }}>
          <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: 450, margin: "0 auto", padding: 32, borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", margin: 0 }}>Assign Crew to Task #{assigningTask.id}</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setAssigningTask(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleConfirmAssignment} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: "0.85rem", color: "#374151", margin: 0 }}>
                Assigning crew to work order: <b>{assigningTask.title}</b>
              </p>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151" }}>
                Select Field Squad / Engineering Team
                <select 
                  value={selectedCrew} 
                  onChange={(e) => setSelectedCrew(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, marginTop: 6, fontSize: "0.9rem", background: "#fff" }}
                >
                  <option value="Team Alpha (Udupi Central)">Team Alpha (Udupi Central)</option>
                  <option value="Team Beta (Manipal Hub)">Team Beta (Manipal Hub)</option>
                  <option value="Team Gamma (Malpe Port)">Team Gamma (Malpe Port)</option>
                  <option value="Team Delta (Kaup Region)">Team Delta (Kaup Region)</option>
                </select>
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setAssigningTask(null)} style={{ padding: "10px 16px", border: "1px solid #d1d5db", background: "#fff", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: "10px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
