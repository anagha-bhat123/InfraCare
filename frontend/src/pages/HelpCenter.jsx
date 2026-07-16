import React from "react";
import { LifeBuoy, MessageSquare, BookOpen, Settings, ArrowRight } from "lucide-react";

export default function HelpCenter() {
  return (
    <main style={{ backgroundColor: "#fafafa", minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: 80 }}>
      {/* Black Header */}
      <div style={{ backgroundColor: "#000", color: "#fff", padding: "64px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "inline-block", backgroundColor: "#27272a", color: "#d4d4d8", padding: "6px 12px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, marginBottom: 24, borderRadius: 2 }}>
            SUPPORT
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "3.2rem", margin: "0 0 16px", lineHeight: 1.1 }}>
            Help Center
          </h1>
          <p style={{ color: "#a1a1aa", fontSize: "1.05rem", lineHeight: 1.5, margin: 0 }}>
            Support and Resources for InfraCare Users
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px", display: "flex", gap: 64, alignItems: "flex-start" }}>
        
        {/* Left Sidebar */}
        <div style={{ width: 240, flexShrink: 0, position: "sticky", top: 40 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, color: "#a1a1aa", marginBottom: 24 }}>TABLE OF CONTENTS</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: "0.9rem", color: "#71717a", marginBottom: 40 }}>
            <a href="#reporting" style={{ color: "inherit", textDecoration: "none" }}>1. Reporting Issues</a>
            <a href="#knowledge" style={{ color: "inherit", textDecoration: "none" }}>2. Knowledge Base</a>
            <a href="#account" style={{ color: "inherit", textDecoration: "none" }}>3. Account Management</a>
            <a href="#contact" style={{ color: "inherit", textDecoration: "none" }}>4. Contact Support</a>
          </nav>

          <div style={{ backgroundColor: "#f4f4f5", border: "1px solid #e4e4e7", padding: 24, borderRadius: 2 }}>
            <LifeBuoy size={20} color="#111" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", marginBottom: 8 }}>Need Help?</div>
            <div style={{ fontSize: "0.8rem", color: "#71717a", lineHeight: 1.5 }}>
              Our support team is available 24/7 to assist you with any technical difficulties.
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 64 }}>
          
          <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, margin: 0 }}>
            Welcome to the InfraCare Help Center. We're here to help you get the most out of our platform, whether you're a citizen reporting an issue or an engineer managing civic infrastructure.
          </p>

          <section id="reporting">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#a1a1aa" }}>01</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                <MessageSquare size={24} color="#111" /> Reporting Issues
              </h2>
            </div>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 24 }}>
              Learn how to effectively report infrastructure damage:
            </p>
            <div style={{ backgroundColor: "#fff", border: "1px solid #e4e4e7", padding: 24, borderRadius: 2 }}>
              <ul style={{ paddingLeft: 20, margin: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: "0.95rem", color: "#52525b" }}>
                <li>Navigate to the "Report Damage" screen from your dashboard.</li>
                <li>Take a clear, well-lit photo of the issue to ensure our AI models can classify it correctly.</li>
                <li>Use the interactive map to pin the exact location if your GPS is disabled.</li>
                <li>Track your submitted reports under the "Track Reports" section.</li>
              </ul>
            </div>
            <div style={{ height: 1, backgroundColor: "#e4e4e7", marginTop: 48 }}></div>
          </section>

          <section id="knowledge">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#a1a1aa" }}>02</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                <BookOpen size={24} color="#111" /> Knowledge Base
              </h2>
            </div>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 24 }}>
              Understand how our platform processes your reports:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ borderLeft: "4px solid #111", paddingLeft: 16 }}>
                <div style={{ fontWeight: 700, color: "#111", marginBottom: 4, fontSize: "0.95rem" }}>AI Verification</div>
                <div style={{ fontSize: "0.9rem", color: "#52525b" }}>Reports are pre-screened to detect urgency and filter out duplicates.</div>
              </div>
              <div style={{ borderLeft: "4px solid #111", paddingLeft: 16 }}>
                <div style={{ fontWeight: 700, color: "#111", marginBottom: 4, fontSize: "0.95rem" }}>Prioritization</div>
                <div style={{ fontSize: "0.9rem", color: "#52525b" }}>High-risk issues (e.g., deep potholes) are escalated automatically.</div>
              </div>
              <div style={{ borderLeft: "4px solid #111", paddingLeft: 16 }}>
                <div style={{ fontWeight: 700, color: "#111", marginBottom: 4, fontSize: "0.95rem" }}>Dispatching</div>
                <div style={{ fontSize: "0.9rem", color: "#52525b" }}>City maintenance crews are assigned based on location and workload.</div>
              </div>
            </div>
            <div style={{ height: 1, backgroundColor: "#e4e4e7", marginTop: 48 }}></div>
          </section>

          <section id="account">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#a1a1aa" }}>03</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                <Settings size={24} color="#111" /> Account Management
              </h2>
            </div>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 0 }}>
              You can update your personal information, notification preferences, or reset your password directly from your Profile settings. For role-based access requests (e.g., upgrading to an Engineer account), please contact your department administrator.
            </p>
            <div style={{ height: 1, backgroundColor: "#e4e4e7", marginTop: 48 }}></div>
          </section>

          <section id="contact">
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#a1a1aa" }}>04</span>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", color: "#111", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                <LifeBuoy size={24} color="#111" /> Contact Support
              </h2>
            </div>
            <p style={{ fontSize: "0.95rem", color: "#52525b", lineHeight: 1.6, marginBottom: 24 }}>
              Experiencing technical difficulties with the app or website? Our support team is available 24/7. Use the email below or the chat widget in the bottom right corner (coming soon) to get in touch.
            </p>
          </section>

          <section style={{ backgroundColor: "#e4e4e7", padding: "32px 40px", borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 0 }}>
            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: "1.4rem", color: "#111", fontFamily: "Georgia, serif" }}>Need further assistance?</h3>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#52525b" }}>Email us directly at support@infracare.gov.</p>
            </div>
            <button 
              onClick={() => window.location.href="mailto:support@infracare.gov"}
              style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "12px 24px", fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderRadius: 4 }}
            >
              Contact Support <ArrowRight size={16} />
            </button>
          </section>

        </div>
      </div>
    </main>
  );
}
