import React, { useState } from "react";
import { 
  BarChart3, AlertTriangle, 
  Wrench, Users, FileText, Search, Bell, Settings,
  ArrowRight, ShieldAlert, Cpu, Activity, Clock, ShieldCheck,
  ToggleLeft, ToggleRight, ListFilter, ArrowDownToLine, Download, RefreshCw, CheckCircle2, XCircle
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminLogs({ setPage }) {
  // Notification Protocol Toggles
  const [protocols, setProtocols] = useState({
    smsGateway: true,
    emailSmtp: true,
    mobilePush: false
  });

  // System Parameters
  const [systemParams, setSystemParams] = useState({
    archiveThreshold: "90",
    maxSessions: "25",
    emergencyRadius: "500"
  });

  // Audit Logs State
  const initialLogs = [
    { id: 1, timestamp: "Oct 24, 14:22:01", subject: "ROOT_ADMIN", action: "Modified Udupi Municipal Email SMTP credentials", ip: "192.168.1.44", status: "SUCCESS" },
    { id: 2, timestamp: "Oct 24, 14:18:55", subject: "MANGALORE_CELL", action: "Synchronized Mangalore Pothole Remediation DB", ip: "192.168.2.11", status: "SUCCESS" },
    { id: 3, timestamp: "Oct 24, 14:05:12", subject: "SYSTEM_CORE", action: "Storage capacity below 5% on Udupi Server Node-4", ip: "INTERNAL", status: "CRITICAL" },
    { id: 4, timestamp: "Oct 24, 13:58:33", subject: "EXTERNAL_IP", action: "Rate limit exceeded for client #998 (Surathkal Highway Substation)", ip: "203.0.113.10", status: "BLOCKED" },
    { id: 5, timestamp: "Oct 24, 13:42:10", subject: "INSPECTOR_MANIPAL", action: "Uploaded Site Inspection PDF (Manipal Hub)", ip: "192.168.5.122", status: "SUCCESS" },
    { id: 6, timestamp: "Oct 24, 13:10:04", subject: "UNAUTHORIZED_BOT", action: "Attempted unauthorized root login to /admin/config", ip: "45.22.189.12", status: "UNAUTHORIZED" },
    { id: 7, timestamp: "Oct 24, 12:45:19", subject: "PWD_OFFICER_01", action: "Updated Maintenance Work Order #MWO-884 (Kadri Park)", ip: "192.168.1.88", status: "SUCCESS" },
    { id: 8, timestamp: "Oct 24, 12:00:00", subject: "CRON_SCHEDULER", action: "Dispatched automated committee audit report to Udupi PWD", ip: "INTERNAL", status: "SUCCESS" }
  ];

  const historicalLogs = [
    { id: 9, timestamp: "Oct 24, 11:30:45", subject: "SYSTEM_MONITOR", action: "SSL Certificate auto-renewed for api.infracare.gov.in", ip: "INTERNAL", status: "SUCCESS" },
    { id: 10, timestamp: "Oct 24, 10:15:22", subject: "MAINT_SQUAD_02", action: "Closed road resurfacing ticket #REP-4402 (Hampankatta)", ip: "192.168.3.50", status: "SUCCESS" },
    { id: 11, timestamp: "Oct 24, 09:42:11", subject: "ROOT_ADMIN", action: "Updated notification protocols for high-priority incidents", ip: "192.168.1.44", status: "SUCCESS" },
    { id: 12, timestamp: "Oct 24, 08:05:00", subject: "AI_DETECTOR", action: "Flagged 14 high-severity pavement cracks in Malpe Port zone", ip: "10.0.4.12", status: "CRITICAL" }
  ];

  const [logs, setLogs] = useState(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  // Toggle protocol handler
  const handleToggleProtocol = (key, name) => {
    const nextState = !protocols[key];
    setProtocols(prev => ({ ...prev, [key]: nextState }));
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: nextState ? "success" : "info",
      title: `${name} ${nextState ? "Enabled" : "Disabled"}`,
      showConfirmButton: false,
      timer: 2000
    });
  };

  // Save System Parameters handler
  const handleSaveParams = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: "success",
      title: "System Parameters Saved",
      text: "Configuration updated across all district cluster nodes.",
      confirmButtonColor: "#111"
    });
  };

  // Load previous logs handler
  const handleLoadMore = () => {
    if (hasLoadedMore) return;
    setLogs(prev => [...prev, ...historicalLogs]);
    setHasLoadedMore(true);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Loaded 4 Historical Log Entries",
      showConfirmButton: false,
      timer: 2000
    });
  };

  // Download Report handler
  const handleDownloadReport = () => {
    const csvHeader = ["Timestamp", "Subject", "Action", "Origin IP", "Status"];
    const csvRows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.subject}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.ip}"`,
      `"${l.status}"`
    ]);
    const csvContent = [csvHeader.join(","), ...csvRows.map(r => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `InfraCare_System_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "Log Audit Exported",
      text: `Successfully downloaded ${filteredLogs.length} audit trail records as CSV.`,
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    });
  };

  // Filtered Logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "20px 40px" }}>
      <div style={{ width: "100%" }}>
        {/* PAGE CONTENT */}
        <div className="admin-scroll-content">
          
          {/* HEADER BANNER */}
          <div style={{ background: "#111", color: "#fff", padding: 32, borderRadius: 8, position: "relative", overflow: "hidden", marginBottom: 24 }}>
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 280, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", paddingRight: 32, borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>SYSTEM HEALTH</span>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#22c55e" }}>99.98% UPTIME</span>
              <span style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 4 }}>Udupi & Mangalore Clusters</span>
            </div>
            
            <div style={{ position: "relative", zIndex: 10 }}>
              <span style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>INTERNAL ADMINISTRATION</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", margin: "6px 0 16px", color: "#fff" }}>Technical Oversight & Security Logs</h2>
              
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ background: "#fff", color: "#111", fontSize: "0.65rem", fontWeight: 800, padding: "4px 10px", borderRadius: 2 }}>LIVE MONITORING</span>
                <span style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: "0.65rem", fontWeight: 800, padding: "4px 10px", borderRadius: 2 }}>v2.4.8 STABLE</span>
                
                <button 
                  onClick={handleDownloadReport}
                  style={{ background: "#fff", color: "#111", border: "none", padding: "10px 20px", fontWeight: 800, fontSize: "0.75rem", letterSpacing: 0.5, borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
                >
                  <Download size={14} /> DOWNLOAD AUDIT REPORT <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, marginBottom: 24 }}>
            
            {/* NOTIFICATION PROTOCOLS */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", padding: 24, borderRadius: 8, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", fontSize: "0.75rem", fontWeight: 800, color: "#6b7280", marginBottom: 20, letterSpacing: 1 }}>
                <Bell size={14} className="mr-2 inline" /> NOTIFICATION PROTOCOLS
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: "0.9rem", margin: "0 0 2px", color: "#111" }}>SMS Gateway</h4>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>High-priority hardware & road failures</p>
                  </div>
                  <button type="button" onClick={() => handleToggleProtocol("smsGateway", "SMS Gateway")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {protocols.smsGateway ? <ToggleRight size={32} style={{ color: "#111" }} /> : <ToggleLeft size={32} style={{ color: "#d1d5db" }} />}
                  </button>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: "0.9rem", margin: "0 0 2px", color: "#111" }}>Email SMTP Dispatcher</h4>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Daily summaries and committee audit logs</p>
                  </div>
                  <button type="button" onClick={() => handleToggleProtocol("emailSmtp", "Email SMTP")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {protocols.emailSmtp ? <ToggleRight size={32} style={{ color: "#111" }} /> : <ToggleLeft size={32} style={{ color: "#d1d5db" }} />}
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: "0.9rem", margin: "0 0 2px", color: "#111" }}>Mobile Admin Push</h4>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>Admin authorization requests & security alerts</p>
                  </div>
                  <button type="button" onClick={() => handleToggleProtocol("mobilePush", "Mobile Push")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {protocols.mobilePush ? <ToggleRight size={32} style={{ color: "#111" }} /> : <ToggleLeft size={32} style={{ color: "#d1d5db" }} />}
                  </button>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12, marginTop: "auto" }}>
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontStyle: "italic", margin: 0 }}>* Last updated by Root Admin at {new Date().toLocaleTimeString()} GMT+5:30</p>
              </div>
            </div>

            {/* SYSTEM PARAMETERS */}
            <div style={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", padding: 24, borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", fontSize: "0.75rem", fontWeight: 800, color: "#6b7280", marginBottom: 20, letterSpacing: 1 }}>
                <Settings size={14} className="mr-2 inline" /> SYSTEM PARAMETERS & THRESHOLDS
              </div>

              <form onSubmit={handleSaveParams}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>
                      ARCHIVE THRESHOLD (DAYS)
                    </label>
                    <input 
                      type="number" 
                      value={systemParams.archiveThreshold}
                      onChange={(e) => setSystemParams({ ...systemParams, archiveThreshold: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontWeight: 700, fontSize: "0.9rem" }}
                    />
                    <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 4 }}>Logs older than this will be moved to cold storage.</p>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>
                      MAX CONCURRENT SESSIONS
                    </label>
                    <select 
                      value={systemParams.maxSessions}
                      onChange={(e) => setSystemParams({ ...systemParams, maxSessions: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontWeight: 700, fontSize: "0.9rem", background: "#fff" }}
                    >
                      <option value="10">10 Sessions</option>
                      <option value="25">25 Sessions</option>
                      <option value="50">50 Sessions</option>
                      <option value="100">100 Sessions</option>
                    </select>
                    <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 4 }}>Limits active admin tokens to prevent brute force.</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "center" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", display: "block", marginBottom: 6 }}>
                      EMERGENCY RADIUS (METERS)
                    </label>
                    <input 
                      type="number" 
                      value={systemParams.emergencyRadius}
                      onChange={(e) => setSystemParams({ ...systemParams, emergencyRadius: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontWeight: 700, fontSize: "0.9rem" }}
                    />
                    <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 4 }}>Geographic boundary for critical incident broadcast.</p>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", height: "100%", paddingTop: 20 }}>
                    <button type="submit" style={{ padding: "12px 24px", background: "#111", color: "#fff", border: "none", borderRadius: 4, fontWeight: 800, fontSize: "0.8rem", cursor: "pointer" }}>
                      SAVE PARAMETERS
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* REAL-TIME AUDIT TRAIL */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", fontSize: "0.8rem", fontWeight: 800, color: "#374151", letterSpacing: 0.5 }}>
                <Activity size={16} className="mr-2 inline" /> REAL-TIME AUDIT TRAIL ({filteredLogs.length} Records)
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Search Box */}
                <div style={{ position: "relative", width: 240 }}>
                  <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "#9ca3af" }} />
                  <input 
                    type="text" 
                    placeholder="Search logs by keyword..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", padding: "6px 12px 6px 32px", fontSize: "0.8rem", border: "1px solid #d1d5db", borderRadius: 4 }}
                  />
                </div>

                {/* Status Filter Dropdown */}
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: "6px 12px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid #d1d5db", borderRadius: 4, background: "#fff" }}
                >
                  <option value="ALL">STATUS: ALL</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="UNAUTHORIZED">UNAUTHORIZED</option>
                  <option value="BLOCKED">BLOCKED</option>
                </select>

                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.7rem", fontWeight: 800, color: "#16a34a", padding: "4px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#16a34a" }} />
                  STREAMING ACTIVE
                </div>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #e5e5e5", fontSize: "0.7rem", fontWeight: 800, color: "#6b7280", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 20px" }}>TIMESTAMP</th>
                  <th style={{ padding: "12px 16px" }}>SUBJECT</th>
                  <th style={{ padding: "12px 16px" }}>ACTION DESCRIPTION</th>
                  <th style={{ padding: "12px 16px" }}>ORIGIN IP</th>
                  <th style={{ padding: "12px 20px" }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#6b7280", fontSize: "0.85rem" }}>
                      No audit log records match your filter search.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #f0f0f0", fontSize: "0.8rem", color: "#374151" }}>
                      <td style={{ padding: "14px 20px", color: "#6b7280", fontWeight: 600 }}>{log.timestamp}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 800, color: "#111" }}>{log.subject}</td>
                      <td style={{ padding: "14px 16px", fontWeight: 500 }}>{log.action}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "#6b7280" }}>{log.ip}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ 
                          fontSize: "0.65rem", 
                          fontWeight: 800, 
                          padding: "4px 8px", 
                          borderRadius: 3, 
                          letterSpacing: 0.5,
                          backgroundColor: log.status === 'SUCCESS' ? '#dcfce7' : log.status === 'CRITICAL' ? '#fee2e2' : log.status === 'UNAUTHORIZED' ? '#fef3c7' : '#f3f4f6',
                          color: log.status === 'SUCCESS' ? '#15803d' : log.status === 'CRITICAL' ? '#b91c1c' : log.status === 'UNAUTHORIZED' ? '#b45309' : '#374151'
                        }}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div style={{ padding: 16, display: "flex", justifyContent: "center", borderTop: "1px solid #e5e5e5", background: "#fafafa" }}>
              <button 
                onClick={handleLoadMore}
                disabled={hasLoadedMore}
                style={{ 
                  background: "none", 
                  border: "none", 
                  fontSize: "0.75rem", 
                  fontWeight: 800, 
                  color: hasLoadedMore ? "#9ca3af" : "#111", 
                  cursor: hasLoadedMore ? "default" : "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 6 
                }}
              >
                {hasLoadedMore ? "ALL HISTORICAL LOGS LOADED" : "LOAD PREVIOUS LOGS"} <ArrowDownToLine size={14} />
              </button>
            </div>
          </div>

          {/* BOTTOM SYSTEM METRICS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: 20, marginBottom: 32 }}>
            
            <div style={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", padding: 24, borderRadius: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", fontWeight: 800, color: "#6b7280" }}>
                API RESPONSE TIME <Clock size={16} style={{ color: "#9ca3af" }} />
              </div>
              <div style={{ margin: "16px 0" }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "2.2rem", fontWeight: 800, color: "#111" }}>124ms</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#16a34a", marginLeft: 8 }}>(-12ms optimal)</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40 }}>
                <div style={{ flex: 1, backgroundColor: "#e5e7eb", height: "40%" }} />
                <div style={{ flex: 1, backgroundColor: "#d1d5db", height: "60%" }} />
                <div style={{ flex: 1, backgroundColor: "#9ca3af", height: "80%" }} />
                <div style={{ flex: 1, backgroundColor: "#6b7280", height: "100%" }} />
                <div style={{ flex: 1, backgroundColor: "#4b5563", height: "70%" }} />
                <div style={{ flex: 1, backgroundColor: "#111827", height: "50%" }} />
              </div>
            </div>

            <div style={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", padding: 24, borderRadius: 8, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", fontWeight: 800, color: "#6b7280" }}>
                SERVER LOAD <Cpu size={16} style={{ color: "#9ca3af" }} />
              </div>
              <div style={{ margin: "16px 0" }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "2.2rem", fontWeight: 800, color: "#111" }}>42%</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6b7280", marginLeft: 8 }}>STABLE CLUSTER</span>
              </div>
              <div>
                <div style={{ height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "42%", backgroundColor: "#111" }} />
                </div>
                <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 6, margin: 0 }}>Udupi Node-4 active load profile</p>
              </div>
            </div>

            <div style={{ backgroundColor: "#111", color: "#fff", padding: 24, borderRadius: 8, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 54, height: 54, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, flexShrink: 0 }}>
                <ShieldCheck size={28} style={{ color: "#22c55e" }} />
              </div>
              <div>
                <h4 style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", margin: "0 0 6px", color: "#fff" }}>Secure Kernel Operations</h4>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0 0 12px", lineHeight: 1.4 }}>
                  System integrity is verified by the regional municipal oversight module for Coastal Karnataka.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ background: "#222", color: "#fff", fontSize: "0.6rem", fontWeight: 800, padding: "3px 8px", borderRadius: 2 }}>ENCRYPTED</span>
                  <span style={{ background: "#222", color: "#fff", fontSize: "0.6rem", fontWeight: 800, padding: "3px 8px", borderRadius: 2 }}>NON-REPUDIATION</span>
                  <span style={{ background: "#222", color: "#fff", fontSize: "0.6rem", fontWeight: 800, padding: "3px 8px", borderRadius: 2 }}>TLS 1.3</span>
                </div>
              </div>
            </div>

          </div>

          <footer style={{ borderTop: "1px solid #e5e5e5", paddingTop: 20, paddingBottom: 20, display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#6b7280", fontWeight: 700 }}>
            <span>© 2026 INFRACARE MUNICIPAL SYSTEMS. ALL RIGHTS RESERVED.</span>
            <div style={{ display: "flex", gap: 16 }}>
              <span>UDUPI CLUSTER</span>
              <span>MANGALORE CLUSTER</span>
              <span>AES-256 ENCRYPTED</span>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}
