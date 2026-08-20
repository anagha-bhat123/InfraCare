import React from "react";
import { Shield, MapPin, Image as ImageIcon, ChevronDown } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main style={{ backgroundColor: "#fafafa", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: 80 }}>
      {/* Black Header */}
      <div style={{ backgroundColor: "#000", color: "#fff", padding: "64px 48px" }}>
        <div style={{ maxWidth: "100%", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: "inline-block", border: "1px solid rgba(255,255,255,0.3)", padding: "6px 12px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, marginBottom: 24, borderRadius: 2 }}>
              CIVIC PROTOCOL V.2.4
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "3.2rem", margin: "0 0 16px", lineHeight: 1.1 }}>
              Privacy Policy & Data Governance
            </h1>
            <p style={{ color: "#a1a1aa", fontSize: "1.05rem", lineHeight: 1.5, margin: 0 }}>
              Ensuring absolute transparency in how infrastructure reporting data is collected, processed, and shared within the municipal ecosystem.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1, color: "#a1a1aa", marginBottom: 8 }}>EFFECTIVE DATE</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", fontWeight: 700 }}>October 24, 2024</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "100%", margin: "0 auto", padding: "64px 48px", display: "flex", gap: 64, alignItems: "flex-start" }}>
        
        {/* Left Sidebar */}
        <div style={{ width: 240, flexShrink: 0, position: "sticky", top: 40 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, color: "#a1a1aa", marginBottom: 24 }}>CONTENTS</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: "0.9rem", color: "#71717a", marginBottom: 40 }}>
            <a href="#intro" style={{ color: "inherit", textDecoration: "none" }}>01. Introduction</a>
            <a href="#data" style={{ color: "inherit", textDecoration: "none" }}>02. Data Collection</a>
            <a href="#use" style={{ color: "inherit", textDecoration: "none" }}>03. Use of Data</a>
            <a href="#sharing" style={{ color: "inherit", textDecoration: "none" }}>04. Municipal Sharing</a>
            <a href="#rights" style={{ color: "inherit", textDecoration: "none" }}>05. User Rights</a>
            <a href="#security" style={{ color: "#111", fontWeight: 700, borderLeft: "2px solid #111", paddingLeft: 12, marginLeft: -14, textDecoration: "none" }}>06. Security Protocols</a>
          </nav>

          <div style={{ backgroundColor: "#f4f4f5", border: "1px solid #e4e4e7", padding: 24, borderRadius: 2 }}>
            <Shield size={20} color="#111" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", marginBottom: 8 }}>Legal Clarity</div>
            <div style={{ fontSize: "0.8rem", color: "#71717a", lineHeight: 1.5 }}>
              This document is drafted in accordance with the Civic Infrastructure Protocol (CIP-2024) to ensure municipal accountability.
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 64 }}>
          
          <section id="intro">
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: "0 0 24px" }}>01. Introduction</h2>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 32 }}>
              InfraCare Municipal Systems ("InfraCare", "we", "us", or "our") provides a robust platform for citizens to report and track infrastructure issues within their community. Transparency is a cornerstone of our civic mission. This Privacy Policy describes how we collect, use, and protect your information when you use our web and mobile applications.
            </p>
            <div style={{ border: "1px solid #e4e4e7", padding: "32px 32px 32px 80px", position: "relative", backgroundColor: "#fff", borderRadius: 2 }}>
              <div style={{ position: "absolute", left: 24, top: 32, width: 32, height: 32, backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                <Shield size={16} />
              </div>
              <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", color: "#111" }}>Our Commitment</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#52525b", lineHeight: 1.6, fontStyle: "italic" }}>
                "We process civic data with the highest degree of integrity, ensuring that individual privacy never compromises communal safety, and communal progress never violates individual rights."
              </p>
              <button style={{ position: "absolute", right: 24, bottom: -20, backgroundColor: "#000", color: "#fff", border: "none", padding: "10px 16px", fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", borderRadius: 4 }}>
                <Shield size={14} /> Legal Help
              </button>
            </div>
          </section>

          <section id="data">
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: "0 0 24px" }}>02. Data Collection</h2>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 32 }}>
              When you interact with the InfraCare platform, we collect specific information necessary to facilitate infrastructure maintenance and civic engagement.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div style={{ border: "1px solid #e4e4e7", padding: 24, backgroundColor: "#fff", borderRadius: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 700, color: "#111", fontSize: "1rem" }}>
                  <MapPin size={18} /> GPS Location
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#71717a", lineHeight: 1.5 }}>
                  Precise geolocation coordinates are collected at the moment of reporting to pin-point infrastructure failures for municipal repair crews.
                </p>
              </div>
              <div style={{ border: "1px solid #e4e4e7", padding: 24, backgroundColor: "#fff", borderRadius: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 700, color: "#111", fontSize: "1rem" }}>
                  <ImageIcon size={18} /> Visual Evidence
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#71717a", lineHeight: 1.5 }}>
                  Photographs and videos uploaded during the report process are stored as primary evidence. Metadata (EXIF) may be stripped for privacy.
                </p>
              </div>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#52525b", lineHeight: 1.5 }}>
              Additionally, we collect account details (name, email, verified civic ID) to maintain accountability and prevent fraudulent reporting that could disrupt city services.
            </p>
          </section>

          <section id="use">
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: "0 0 24px" }}>03. How We Use Your Data</h2>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 32 }}>
              The data collected through the InfraCare interface is used strictly for the following purposes under the Civic Protocol:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { letter: "A", title: "Service Allocation", text: "Using spatial data to prioritize maintenance routes and allocate budget resources to critical infrastructure zones." },
                { letter: "B", title: "Status Notifications", text: "Using your contact information to send real-time updates regarding the progress of your submitted reports." },
                { letter: "C", title: "System Optimization", text: "Anonymized trend analysis to identify recurring structural issues (e.g., chronic pothole patterns)." }
              ].map(item => (
                <div key={item.letter} style={{ backgroundColor: "#f4f4f5", padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start", borderRadius: 2 }}>
                  <div style={{ width: 24, height: 24, backgroundColor: "#111", color: "#fff", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 2 }}>
                    {item.letter}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111", marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "#52525b", lineHeight: 1.5 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sharing">
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: "0 0 24px" }}>04. Data Sharing with Municipalities</h2>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 32 }}>
              InfraCare acts as a secure bridge between citizens and government entities. Data is shared via encrypted tunnels to the following departments:
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#e4e4e7" }}>
                  <th style={{ padding: "12px 16px", color: "#52525b", fontWeight: 700, letterSpacing: 0.5, border: "1px solid #d4d4d8" }}>DEPARTMENT</th>
                  <th style={{ padding: "12px 16px", color: "#52525b", fontWeight: 700, letterSpacing: 0.5, border: "1px solid #d4d4d8" }}>DATA SHARED</th>
                  <th style={{ padding: "12px 16px", color: "#52525b", fontWeight: 700, letterSpacing: 0.5, border: "1px solid #d4d4d8" }}>USAGE RIGHTS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "16px", border: "1px solid #e4e4e7", color: "#111", fontWeight: 500 }}>Public Works</td>
                  <td style={{ padding: "16px", border: "1px solid #e4e4e7", color: "#52525b" }}>GPS, Photos, Description</td>
                  <td style={{ padding: "16px", border: "1px solid #e4e4e7", color: "#52525b" }}>Full Operational Access</td>
                </tr>
                <tr>
                  <td style={{ padding: "16px", border: "1px solid #e4e4e7", color: "#111", fontWeight: 500 }}>City Planning</td>
                  <td style={{ padding: "16px", border: "1px solid #e4e4e7", color: "#52525b" }}>Anonymized Aggregates</td>
                  <td style={{ padding: "16px", border: "1px solid #e4e4e7", color: "#52525b" }}>Strategic Analysis Only</td>
                </tr>
                <tr>
                  <td style={{ padding: "16px", border: "1px solid #e4e4e7", color: "#111", fontWeight: 500 }}>Law Enforcement</td>
                  <td style={{ padding: "16px", border: "1px solid #e4e4e7", color: "#52525b" }}>Verified ID, Metadata</td>
                  <td style={{ padding: "16px", border: "1px solid #e4e4e7", color: "#52525b" }}>Warrant Required</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="rights">
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: "0 0 24px" }}>05. User Rights (Civic Protocol)</h2>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 32 }}>
              Under the <strong>Civic Infrastructure Protocol</strong>, you retain sovereign rights over your reporting data. These include:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["The Right to Anonymity", "The Right to Data Portability", "The Right to Erasure"].map(title => (
                <div key={title} style={{ border: "1px solid #e4e4e7", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderRadius: 2 }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, fontFamily: "Georgia, serif", color: "#111" }}>{title}</div>
                  <ChevronDown size={18} color="#a1a1aa" />
                </div>
              ))}
            </div>
          </section>

          <section id="security" style={{ backgroundColor: "#e4e4e7", padding: "40px 48px", borderLeft: "8px solid #111", borderRadius: "0 2px 2px 0" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", color: "#111", margin: "0 0 16px" }}>Security Protocols</h2>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 24 }}>
              We employ AES-256 encryption for data at rest and TLS 1.3 for data in transit. Our servers are hosted in sovereign municipal data centers to ensure jurisdictional compliance with local civic laws.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.8rem", fontWeight: 700, letterSpacing: 1, color: "#111" }}>
              <Shield size={16} /> SOC2 TYPE II COMPLIANT
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
