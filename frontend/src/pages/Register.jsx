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
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../services/supabase";
import { apiUrl } from "../services/api";

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "#c0152a",
        fontSize: ".82rem",
        fontWeight: 500,
        marginTop: 4,
      }}
    >
      <AlertCircle size={14} />
      {msg}
    </span>
  );
}

export default function Register({ setPage }) {
  const [type, setType] = useState("Citizen");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [generatedEngineerId, setGeneratedEngineerId] = useState("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [ward, setWard] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!mobile.trim()) errs.mobile = "Mobile number is required.";
    else if (!/^[6-9]\d{9}$/.test(mobile.trim())) errs.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    if (!terms) errs.terms = "You must agree to the Terms of Service.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const role = type === "Engineer" ? "engineer" : "citizen";

      if (role === "engineer") {
        const res = await fetch(`${apiUrl}/auth/register-engineer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            ward_zone: ward || "",
            password: password
          })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Registration failed.");
        }
        
        const data = await res.json();
        setGeneratedEngineerId(data.engineer_id);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role,
              phone: mobile.trim(),
              ward_zone: ward || null
            }
          }
        });

        if (error) throw error;
      }

      setSuccess(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
        <div className="auth-panel register" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <CheckCircle2 size={40} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: "1.6rem", marginBottom: 4 }}>Registration Successful!</h1>
          <p style={{ color: "#555", maxWidth: 340, lineHeight: 1.6 }}>
            Your account has been created successfully.
            {type === "Engineer" ? (
              <>
                {" "}Your <strong>Employee ID</strong> and default password have been sent to your registered email address.
              </>
            ) : " You can now log in using your email and password."}
          </p>

          {type === "Engineer" && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: 10, padding: "14px 18px", maxWidth: 340,
              textAlign: "left", marginTop: 4,
            }}>
              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>📧</span>
              <div>
                <div style={{ fontWeight: 700, color: "#1e40af", fontSize: ".88rem", marginBottom: 3 }}>Check your inbox</div>
                <div style={{ color: "#3b5bdb", fontSize: ".82rem", lineHeight: 1.5 }}>
                  Your Employee ID and login instructions have been emailed to <strong>{email.trim()}</strong>. 
                  Check your <strong>Spam</strong> folder if you don't see it within a minute.
                </div>
              </div>
            </div>
          )}

          <button
            className="black wide"
            style={{ marginTop: 12 }}
            onClick={() => setPage("login")}
          >
            Go to Login <ArrowRight size={18} />
          </button>
        </div>
      </main>
    );
  }

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
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Back button */}
        <button
          type="button"
          className="text-link"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8, fontWeight: 600 }}
          onClick={() => setPage("login")}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <h1>Create Account</h1>
        <p>Join the civic movement for better infrastructure.</p>

        {/* Server error */}
        {serverError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fff0f2",
              border: "1px solid #f5c2c7",
              color: "#c0152a",
              padding: "14px 18px",
              fontSize: ".9rem",
              fontWeight: 500,
              borderRadius: 8,
            }}
          >
            <AlertCircle size={18} />
            {serverError}
          </div>
        )}

        <label>Register as:</label>
        <div className="segmented">
          {["Citizen", "Engineer"].map((v) => (
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
        <em>Note: Admin accounts are managed by Department Heads.</em>

        {/* Full Name */}
        <label>
          Full Name
          <span className="input-icon">
            <CircleUserRound />
            <input
              required
              placeholder="Enter your full legal name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
              style={errors.fullName ? { borderColor: "#c0152a" } : {}}
            />
          </span>
          <FieldError msg={errors.fullName} />
        </label>

        {/* Email */}
        <label>
          Email Address
          <span className="input-icon">
            <Mail />
            <input
              required
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
              style={errors.email ? { borderColor: "#c0152a" } : {}}
            />
          </span>
          <FieldError msg={errors.email} />
        </label>

        {/* Mobile */}
        <label>
          Mobile Number
          <span className="input-icon">
            <ClipboardCheck />
            <input
              required
              placeholder="+91 00000 00000"
              value={mobile}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "")); setErrors((p) => ({ ...p, mobile: "" })); }}
              style={errors.mobile ? { borderColor: "#c0152a" } : {}}
            />
          </span>
          <FieldError msg={errors.mobile} />
        </label>



        {/* Ward / Zone */}
        <label>
          Ward / Zone (Optional)
          <span className="input-icon">
            <MapPin />
            <select value={ward} onChange={(e) => setWard(e.target.value)}>
              <option value="">Select your Ward/Zone</option>
              <option>North District</option>
              <option>East Side</option>
              <option>South Zone</option>
              <option>West Ward</option>
              <option>Central District</option>
            </select>
            <ChevronDown />
          </span>
        </label>

        {/* Password — shown for both Citizen and Engineer */}
        <label>
          Create Password
          <span className="input-icon" style={errors.password ? { borderColor: "#c0152a" } : {}}>
            <Lock />
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
            />
            <button
              type="button"
              id="toggle-register-password"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((s) => !s)}
              style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: "0 4px", color: "#666" }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
          <FieldError msg={errors.password} />
        </label>

        {/* Confirm Password */}
        <label>
          Confirm Password
          <span className="input-icon" style={errors.confirmPassword ? { borderColor: "#c0152a" } : {}}>
            <Lock />
            <input
              required
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
            />
            <button
              type="button"
              id="toggle-register-confirm-password"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              onClick={() => setShowConfirm((s) => !s)}
              style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: "0 4px", color: "#666" }}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
          <FieldError msg={errors.confirmPassword} />
        </label>

        <label className="checkline">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => { setTerms(e.target.checked); setErrors((p) => ({ ...p, terms: "" })); }}
          />
          I agree to the Terms of Service and Privacy Policy of the Government Infrastructure Portal.
        </label>
        <FieldError msg={errors.terms} />

        <button
          className="black wide"
          disabled={loading}
          style={loading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        >
          {loading ? "Creating Account…" : <>{type === "Engineer" ? "Register as Engineer" : "Register Account"} <ArrowRight /></>}
        </button>

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
