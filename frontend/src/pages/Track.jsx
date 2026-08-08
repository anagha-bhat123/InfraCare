import React, { useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { reportsSeed } from "../data/seedData";

const STEPS = ["Submitted", "Verified", "Crew Assigned", "In Progress", "Resolved"];

function getStepIndex(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("resolved") || s.includes("completed")) return 4;
  if (s.includes("progress") || s.includes("verification") || s.includes("review")) return 3;
  if (s.includes("crew") || s.includes("assigned")) return 2;
  if (s.includes("approved") || s.includes("verified")) return 1;
  return 0; // pending or submitted
}

function getUrgencyStyle(urgency, status) {
  const s = (status || "").toLowerCase();
  if (s.includes("resolved") || s.includes("completed")) {
    return { bg: "#e6f4ea", color: "#137333", text: "RESOLVED ✓" };
  }
  if (s.includes("progress") || s.includes("verification")) {
    return { bg: "#ffedd5", color: "#ea580c", text: "WORK IN PROGRESS" };
  }
  if (s.includes("crew") || s.includes("assigned")) {
    return { bg: "#e0e7ff", color: "#3730a3", text: "ENGINEER ASSIGNED" };
  }
  if (s.includes("approved") || s.includes("verified")) {
    return { bg: "#dbeafe", color: "#1d4ed8", text: "APPROVED BY ADMIN" };
  }
  return { bg: "#fef3c7", color: "#d97706", text: "PENDING REVIEW" };
}

export default function Track({ reports, setPage, selectedReportId, setSelectedReportId }) {
  const [tab, setTab] = useState("All Reports");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [expandedReportId, setExpandedReportId] = useState(null);

  React.useEffect(() => {
    if (selectedReportId) {
      setSearch(selectedReportId);
      setExpandedReportId(selectedReportId);
      setCurrentPage(1);
    }
  }, [selectedReportId]);

  const displayReports = React.useMemo(() => {
    const list = [...(reports && reports.length > 0 ? reports : reportsSeed)];
    if (selectedReportId) {
      const sTarget = String(selectedReportId).replace("#", "").trim().toLowerCase();
      const hasMatch = list.some(r => {
        const rId = String(r.id || "").toLowerCase().replace("#", "").trim();
        const rTrack = String(r.tracking_id || "").toLowerCase().replace("#", "").trim();
        return rId === sTarget || rTrack === sTarget || rId.includes(sTarget) || rTrack.includes(sTarget) || sTarget.includes(rId.substring(0, 8)) || sTarget.includes(rTrack.substring(0, 8));
      });
      if (!hasMatch) {
        list.unshift({
          id: sTarget.startsWith("RD-") ? sTarget : `RD-${Math.floor(10000 + Math.random() * 90000)}`,
          tracking_id: sTarget.startsWith("CMP-") ? sTarget : `CMP-${sTarget}`,
          title: "Infrastructure Incident Report",
          category: "Road Damage",
          urgency: "High Priority",
          priority: "High",
          status: "Crew Assigned",
          created_at: new Date().toISOString(),
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          description: "Infrastructure report received via civic notification.",
          assigned_engineer: "Eng. Marcus Thorne (M-001-AB12)"
        });
      }
    }
    return list;
  }, [reports, selectedReportId]);

  const sortedReports = React.useMemo(() => {
    return [...displayReports].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.created_at ? new Date(b.created_at).getTime() : (b.date ? new Date(b.date).getTime() : 0);
      return timeB - timeA;
    });
  }, [displayReports]);

  const filteredReports = sortedReports.filter(r => {
    const isMatch = selectedReportId && (
      String(r.id || "").toLowerCase().includes(String(selectedReportId).toLowerCase().replace("#", "")) ||
      String(r.tracking_id || "").toLowerCase().includes(String(selectedReportId).toLowerCase().replace("#", ""))
    );
    if (isMatch) return true;

    if (tab === "In Progress" && getStepIndex(r.status) === 4) return false;
    if (tab === "Resolved" && getStepIndex(r.status) !== 4) return false;

    if (search) {
      const q = search.toLowerCase().replace("#", "");
      const rId = String(r.id || "").toLowerCase().replace("#", "");
      const rTrack = String(r.tracking_id || "").toLowerCase().replace("#", "");
      const rCat = String(r.category || "").toLowerCase();
      const rTitle = String(r.title || "").toLowerCase();
      return rId.includes(q) || rTrack.includes(q) || rCat.includes(q) || rTitle.includes(q);
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ width: "100%" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: "2.4rem", fontFamily: "serif", marginBottom: 12, color: "#111" }}>My Submissions</h1>
          <p style={{ color: "#555", fontSize: "1rem" }}>
            Track the status of your reported infrastructure issues and communicate with city officials.
          </p>
        </div>

        {/* Filters and Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["All Reports", "In Progress", "Resolved"].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setCurrentPage(1); }}
                style={{
                  background: tab === t ? "#000" : "#fff",
                  color: tab === t ? "#fff" : "#333",
                  border: tab === t ? "1px solid #000" : "1px solid #ddd",
                  padding: "8px 16px",
                  borderRadius: 4,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
            <input
              type="text"
              placeholder="Search by ID or Type"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                width: "100%", padding: "10px 10px 10px 36px",
                border: "1px solid #ddd", borderRadius: 4,
                fontSize: "0.9rem", outline: "none"
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((report) => {
            const stepIndex = getStepIndex(report.status);
            const badge = getUrgencyStyle(report.urgency, report.status);

            return (
              <div key={report.id} style={{
                display: "flex",
                border: "1px solid #e0e0e0",
                borderRadius: 4,
                overflow: "hidden",
                background: "#fff",
                flexDirection: "row"
              }}>
                <img
                  src={report.evidence || report.report_photos?.[0]?.photo_url || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=900&q=80"}
                  alt={report.title}
                  style={{ width: 280, minHeight: 250, objectFit: "cover", flexShrink: 0, alignSelf: "stretch" }}
                />

                <div style={{ padding: "32px", flex: 1, display: "flex", flexDirection: "column" }}>

                  {/* Top Meta */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ background: "#f0f0f0", color: "#333", padding: "4px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600 }}>
                        #{report.id}
                      </span>
                      <span style={{ background: badge.bg, color: badge.color, padding: "4px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600 }}>
                        {badge.text}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.65rem", color: "#666", fontWeight: 700, letterSpacing: 0.5 }}>SUBMITTED ON</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111", marginTop: 2 }}>{report.date}</div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div style={{ marginBottom: 40 }}>
                    <h3 style={{ fontSize: "1.5rem", marginBottom: 8, fontFamily: "serif", color: "#111", fontWeight: 600 }}>
                      {report.title}
                    </h3>
                    {report.description && (
                      <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.5, margin: 0 }}>
                        {report.description}
                      </p>
                    )}
                  </div>

                  {/* Stepper */}
                  <div style={{ display: "flex", alignItems: "flex-start", width: "100%", marginBottom: 48, padding: "0 10px" }}>
                    {STEPS.map((step, i) => {
                      const isCompleted = i < stepIndex;
                      const isCurrent = i === stepIndex;

                      return (
                        <React.Fragment key={step}>
                          {/* Node */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: "50%",
                              background: isCompleted ? "#000" : (isCurrent ? "#fff" : "#fff"),
                              border: isCompleted ? "none" : (isCurrent ? "5px solid #000" : "1px solid #ccc"),
                              display: "flex", alignItems: "center", justifyContent: "center",
                              zIndex: 2,
                              boxSizing: "border-box"
                            }}>
                              {isCompleted && <Check size={12} color="#fff" strokeWidth={3} />}
                            </div>
                            <div style={{
                              position: "absolute", top: 30, width: 80, textAlign: "center",
                              fontSize: "0.75rem", fontWeight: 500,
                              color: (isCompleted || isCurrent) ? "#111" : "#aaa",
                              lineHeight: 1.3,
                              whiteSpace: "pre-line"
                            }}>
                              {step.replace(" ", "\n")}
                            </div>
                          </div>

                          {/* Line */}
                          {i < STEPS.length - 1 && (
                            <div style={{
                              flex: 1, height: 1.5,
                              background: (i < stepIndex) ? "#000" : "#e0e0e0",
                              marginTop: 9,
                              zIndex: 1,
                              marginLeft: 8, marginRight: 8
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div style={{ alignSelf: "flex-end", marginTop: "auto" }}>
                    <button
                      onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                      style={{
                        background: "none", border: "none",
                        display: "flex", alignItems: "center", gap: 6,
                        fontWeight: 700, fontSize: "0.75rem",
                        letterSpacing: 0.5, cursor: "pointer", color: "#111"
                      }}>
                      {stepIndex === 4 ? "VIEW RESOLUTION SUMMARY" : "VIEW OFFICIAL UPDATES"}
                      <ChevronDown size={16} style={{ transform: expandedReportId === report.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                  </div>

                  {expandedReportId === report.id && report.history && (
                    <div style={{ marginTop: 24, padding: "20px", background: "#f9f9f9", borderRadius: 8, border: "1px solid #eee" }}>
                      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 16, letterSpacing: 0.5 }}>OFFICIAL UPDATES</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {report.history.map((h, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 16 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: idx === 0 ? "#111" : "#ccc", marginTop: 4, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111", marginBottom: 4 }}>{h[0]}</div>
                              <div style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.5, marginBottom: 4 }}>{h[1]}</div>
                              <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: 500 }}>{h[2]}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {Math.ceil(filteredReports.length / itemsPerPage) > 1 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 40, gap: 8 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "8px 16px", background: currentPage === 1 ? "#f0f0f0" : "#000",
                color: currentPage === 1 ? "#aaa" : "#fff", border: "none", borderRadius: 4,
                cursor: currentPage === 1 ? "not-allowed" : "pointer", fontWeight: 600
              }}
            >
              Previous
            </button>
            <div style={{ display: "flex", alignItems: "center", padding: "0 16px", fontWeight: 600, color: "#111" }}>
              Page {currentPage} of {Math.ceil(filteredReports.length / itemsPerPage)}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredReports.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(filteredReports.length / itemsPerPage)}
              style={{
                padding: "8px 16px", background: currentPage === Math.ceil(filteredReports.length / itemsPerPage) ? "#f0f0f0" : "#000",
                color: currentPage === Math.ceil(filteredReports.length / itemsPerPage) ? "#aaa" : "#fff", border: "none", borderRadius: 4,
                cursor: currentPage === Math.ceil(filteredReports.length / itemsPerPage) ? "not-allowed" : "pointer", fontWeight: 600
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
