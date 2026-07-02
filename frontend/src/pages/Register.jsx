import React, { useState } from "react";
import { 
  ShieldCheck, 
  CircleUserRound, 
  Mail, 
  ClipboardCheck, 
  MapPin, 
  ChevronDown, 
  Lock, 
  Eye, 
  ArrowRight, 
  Languages 
} from "lucide-react";

export default function Register({ setPage }) {
  const [type, setType] = useState("Citizen");
  const [terms, setTerms] = useState(false);
  
  return (
    <main className="split-auth register-split">
      <section className="auth-visual road">
        <h1>Road Damage<br />Detection &<br />Reporting</h1>
        <p>Empowering citizens and municipal teams to build safer urban journeys.</p>
        
        <div className="auth-stats">
          <b>12.4k<span>Reports Resolved</span></b>
          <b>48hr<span>Avg. Response Time</span></b>
        </div>
      </section>
      <form 
        className="auth-panel register" 
        onSubmit={(e) => { 
          e.preventDefault(); 
          alert("Account request saved. You can now login."); 
          setPage("login"); 
        }}
      >
        <h1>Create Account</h1>
        <p>Join the civic movement for better infrastructure.</p>
        <label>Register as:</label>
        <div className="segmented">
          {["Citizen", "Municipal Worker"].map((v) => (
            <button 
              type="button" 
              className={type === v ? "selected" : ""} 
              onClick={() => setType(v)} 
              key={v}
            >
              {v}
            </button>
          ))}
        </div>
        <em>Note: Admin & Engineer accounts are managed by Department Heads.</em>
        <label>
          Full Name
          <span className="input-icon">
            <CircleUserRound />
            <input required placeholder="Enter your full legal name" />
          </span>
        </label>
        <label>
          Email Address
          <span className="input-icon">
            <Mail />
            <input required type="email" placeholder="email@example.gov.in" />
          </span>
        </label>
        <label>
          Mobile Number
          <div className="inline-field">
            <span className="input-icon">
              <ClipboardCheck />
              <input required placeholder="+91 00000 00000" />
            </span>
            <button type="button" onClick={() => alert("OTP sent for demo")}>Get OTP</button>
          </div>
        </label>
        <label>
          Ward / Zone (Optional)
          <span className="input-icon">
            <MapPin />
            <select>
              <option>Select your Ward/Zone</option>
              <option>North District</option>
              <option>East Side</option>
            </select>
            <ChevronDown />
          </span>
        </label>
        <label>
          Create Password
          <span className="input-icon">
            <Lock />
            <input required type="password" defaultValue="password" />
            <Eye />
          </span>
        </label>
        <label className="checkline">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          I agree to the Terms of Service and Privacy Policy of the Government Infrastructure Portal.
        </label>
        <button className="black wide" disabled={!terms}>Register Account <ArrowRight /></button>
        <p className="center">
          Already have an account?{" "}
          <button type="button" className="text-link strong" onClick={() => setPage("login")}>
            Login here
          </button>
        </p>
      </form>
    </main>
  );
}
