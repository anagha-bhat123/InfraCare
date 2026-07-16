import React from "react";
import { Calendar, Download, CheckCircle, ArrowRight } from "lucide-react";

export default function TermsOfService() {
  return (
    <main style={{ backgroundColor: "#fafafa", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: 80 }}>
      {/* Black Header */}
      <div style={{ backgroundColor: "#000", color: "#fff", padding: "64px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "inline-block", backgroundColor: "#27272a", color: "#d4d4d8", padding: "6px 12px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, marginBottom: 24, borderRadius: 2 }}>
            LEGAL FRAMEWORK
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "3.2rem", margin: "0 0 24px", lineHeight: 1.1 }}>
            Terms of Service
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#a1a1aa", fontSize: "0.9rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={16} /> Last Updated: October 24, 2024
            </span>
            <span>|</span>
            <span>Effective Version 2.4.0</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px", display: "flex", gap: 64, alignItems: "flex-start" }}>
        
        {/* Left Sidebar */}
        <div style={{ width: 240, flexShrink: 0, position: "sticky", top: 40 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, color: "#a1a1aa", marginBottom: 24 }}>TABLE OF CONTENTS</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: "0.9rem", color: "#71717a", marginBottom: 32 }}>
            <a href="#acceptance" style={{ color: "inherit", textDecoration: "none" }}>1. Acceptance of Terms</a>
            <a href="#responsibilities" style={{ color: "inherit", textDecoration: "none" }}>2. User Responsibilities</a>
            <a href="#prohibited" style={{ color: "inherit", textDecoration: "none" }}>3. Prohibited Conduct</a>
            <a href="#ip" style={{ color: "inherit", textDecoration: "none" }}>4. Intellectual Property</a>
            <a href="#liability" style={{ color: "inherit", textDecoration: "none" }}>5. Limitation of Liability</a>
            <a href="#termination" style={{ color: "inherit", textDecoration: "none" }}>6. Termination</a>
          </nav>
          
          <div style={{ height: 1, backgroundColor: "#e4e4e7", marginBottom: 32 }}></div>
          
          <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: 12 }}>Need a physical copy?</div>
          <button style={{ width: "100%", padding: "10px", backgroundColor: "transparent", color: "#111", border: "1px solid #d4d4d8", borderRadius: 4, fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
            <Download size={16} /> Download PDF
          </button>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 64 }}>
          
          <section id="acceptance">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#a1a1aa" }}>01</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: 0 }}>Acceptance of Terms</h2>
            </div>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 16 }}>
              By accessing or using the InfraCare Municipal Systems platform (the "Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6 }}>
              InfraCare provides a civic infrastructure reporting and tracking tool designed for municipal efficiency. These terms constitute a legally binding agreement between you and the Municipal Infrastructure Authority.
            </p>
            <div style={{ height: 1, backgroundColor: "#e4e4e7", marginTop: 48 }}></div>
          </section>

          <section id="responsibilities">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#a1a1aa" }}>02</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: 0 }}>User Responsibilities for Accurate Reporting</h2>
            </div>
            
            <div style={{ backgroundColor: "#f4f4f5", borderLeft: "4px solid #111", padding: "24px", marginBottom: 24 }}>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "#52525b", fontStyle: "italic" }}>
                "Efficiency in civic repair relies entirely on the precision of citizen data."
              </p>
            </div>
            
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 24 }}>
              Users are responsible for ensuring that all reports submitted through the platform are:
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckCircle size={18} color="#111" style={{ marginTop: 2 }} />
                <div style={{ fontSize: "0.95rem", color: "#52525b" }}>
                  <strong style={{ color: "#111" }}>Factually Correct:</strong> Precise descriptions of the infrastructure issue.
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckCircle size={18} color="#111" style={{ marginTop: 2 }} />
                <div style={{ fontSize: "0.95rem", color: "#52525b" }}>
                  <strong style={{ color: "#111" }}>Geographically Precise:</strong> Accurate location tagging via GPS or manual marker.
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckCircle size={18} color="#111" style={{ marginTop: 2 }} />
                <div style={{ fontSize: "0.95rem", color: "#52525b" }}>
                  <strong style={{ color: "#111" }}>Visually Verified:</strong> Providing clear photographic evidence where requested.
                </div>
              </div>
            </div>
            <div style={{ height: 1, backgroundColor: "#e4e4e7", marginTop: 48 }}></div>
          </section>

          <section id="prohibited">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#a1a1aa" }}>03</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: 0 }}>Prohibited Conduct</h2>
            </div>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 24 }}>
              The following actions are strictly prohibited and may result in immediate suspension of access and potential legal action by municipal authorities:
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ border: "1px solid #e4e4e7", padding: 24, backgroundColor: "#fff" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1, color: "#111", marginBottom: 12 }}>FALSE REPORTING</div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#71717a", lineHeight: 1.5 }}>
                  Intentional submission of non-existent issues or fabricated infrastructure damage.
                </p>
              </div>
              <div style={{ border: "1px solid #e4e4e7", padding: 24, backgroundColor: "#fff" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1, color: "#111", marginBottom: 12 }}>SPAMMING</div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#71717a", lineHeight: 1.5 }}>
                  Submitting redundant reports for the same incident to artificially inflate priority.
                </p>
              </div>
              <div style={{ border: "1px solid #e4e4e7", padding: 24, backgroundColor: "#fff" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1, color: "#111", marginBottom: 12 }}>SYSTEM MALICE</div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#71717a", lineHeight: 1.5 }}>
                  Attempting to bypass security protocols or reverse-engineer the reporting API.
                </p>
              </div>
              <div style={{ border: "1px solid #e4e4e7", padding: 24, backgroundColor: "#fff" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1, color: "#111", marginBottom: 12 }}>IMPERSONATION</div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#71717a", lineHeight: 1.5 }}>
                  Falsely claiming to be a municipal employee or licensed contractor.
                </p>
              </div>
            </div>
            <div style={{ height: 1, backgroundColor: "#e4e4e7", marginTop: 48 }}></div>
          </section>

          <section id="ip">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#a1a1aa" }}>04</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: 0 }}>Intellectual Property</h2>
            </div>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 16 }}>
              The Service and its original content, features, and functionality are and will remain the exclusive property of InfraCare Municipal Systems and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of InfraCare.
            </p>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6 }}>
              By submitting a report, including images and descriptions, you grant the Municipality a non-exclusive, royalty-free, perpetual, and irrevocable right to use, reproduce, and display such content for the purpose of infrastructure maintenance and public safety communication.
            </p>
            <div style={{ height: 1, backgroundColor: "#e4e4e7", marginTop: 48 }}></div>
          </section>

          <section id="liability">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#a1a1aa" }}>05</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: 0 }}>Limitation of Liability</h2>
            </div>
            
            <div style={{ backgroundColor: "#f4f4f5", padding: "32px", borderRadius: 2 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: 1, color: "#111", marginBottom: 16 }}>DISCLAIMER OF WARRANTIES</div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#52525b", lineHeight: 1.6, textTransform: "uppercase" }}>
                IN NO EVENT SHALL INFRACARE, NOR ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; OR (III) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
              </p>
            </div>
          </section>

          <section style={{ backgroundColor: "#e4e4e7", padding: "32px 40px", borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: "1.4rem", color: "#111", fontFamily: "Georgia, serif" }}>Questions about these terms?</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#52525b" }}>Our legal team is available for clarification on civic mandates.</p>
            </div>
            <button style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "12px 24px", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderRadius: 4 }}>
              Contact Legal Support <ArrowRight size={16} />
            </button>
          </section>
          
        </div>
      </div>
    </main>
  );
}
