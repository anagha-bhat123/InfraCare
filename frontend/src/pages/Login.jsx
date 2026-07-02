import React, { useState, useRef } from "react";
import { Eye, EyeOff, ArrowRight, AlertCircle, UserCircle, ShieldCheck, HardHat } from "lucide-react";
import Brand from "../components/Brand";
import { apiUrl } from "../services/api";

/* ─── Role detection from identifier ─────────────────────────────── */
const ENG_ID_RE  = /^M-\d{3}-[A-Z0-9]{4}$/i;
const GOV_RE     = /^[^\s@]+@[^\s@]+\.gov\.[^\s@]+$/i;  // *.gov.* domains → admin
const EMAIL_RE   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE  = /^[6-9]\d{9}$/;

function detectRole(value) {
  const v = value.trim();
  if (!v) return null;
  if (ENG_ID_RE.test(v)) return "engineer";
  if (GOV_RE.test(v))    return "admin";
  if (EMAIL_RE.test(v) || MOBILE_RE.test(v)) return "citizen";
  return null;
}

function validateIdentifier(value) {
  if (!value.trim()) return "This field is required.";
  const role = detectRole(value);
  if (!role)
    return "Enter a valid email, 10-digit mobile, Employee ID (M-001-AB12), or government email.";
  return "";
}

function validatePassword(value) {
  if (!value) return "Password is required.";
  if (!/^\d+$/.test(value)) return "Password must contain numbers only.";
  if (value.length < 6) return "Password must be at least 6 digits.";
  if (value.length > 8) return "Password must be at most 8 digits.";
  return "";
}

/* ─── Role badge ──────────────────────────────────────────────────── */
const ROLE_META = {
  citizen:  { label: "Citizen",  icon: UserCircle,   color: "#2563eb", bg: "#eff6ff" },
  engineer: { label: "Engineer", icon: HardHat,      color: "#d97706", bg: "#fffbeb" },
  admin:    { label: "Admin",    icon: ShieldCheck,  color: "#16a34a", bg: "#f0fdf4" },
};

function RoleBadge({ role }) {
  if (!role) return null;
  const { label, icon: Icon, color, bg } = ROLE_META[role];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: bg,
        color,
        border: `1px solid ${color}33`,
        borderRadius: 20,
        padding: "4px 12px",
        fontSize: ".82rem",
        fontWeight: 600,
        marginTop: 6,
        transition: "all .2s ease",
      }}
    >
      <Icon size={14} />
      {label} account detected
    </span>
  );
}

/* ─── Inline error ────────────────────────────────────────────────── */
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

/* ─── Main component ──────────────────────────────────────────────── */
const DEMO_CREDENTIALS = [
  { role: "citizen",  label: "Citizen",  icon: "👤", identifier: "citizen@demo.com",        password: "123456",   color: "#2563eb", bg: "#eff6ff" },
  { role: "engineer", label: "Engineer", icon: "🪖", identifier: "M-001-AB12",              password: "123456",   color: "#d97706", bg: "#fffbeb" },
  { role: "admin",    label: "Admin",    icon: "🛡️", identifier: "admin@infracare.gov.in",  password: "12345678", color: "#16a34a", bg: "#f0fdf4" },
];

export default function Login({ setUser, setPage }) {
  const [show, setShow]       = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [touched, setTouched]       = useState({ identifier: false, password: false });
  const [serverError, setServerError] = useState("");

  const idRef  = useRef(null);
  const pwdRef = useRef(null);

  const detectedRole = detectRole(identifier);
  const idError  = touched.identifier ? validateIdentifier(identifier) : "";
  const pwdError = touched.password   ? validatePassword(password)     : "";

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    setTouched({ identifier: true, password: true });

    const idErr  = validateIdentifier(identifier);
    const pwdErr = validatePassword(password);
    if (idErr)  { idRef.current?.focus();  return; }
    if (pwdErr) { pwdRef.current?.focus(); return; }

    const role = detectedRole;
    if (!role) {
      setServerError("Could not detect account type. Please check your ID or email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/demo-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid credentials. Please try again.");
      }

      const data = await res.json();
      if (remember) {
        localStorage.setItem("infracare_user", JSON.stringify(data.user));
      }
      setUser(data.user);
      setPage(data.redirect);
    } catch (err) {
      let msg;
      if (typeof err === "string") {
        msg = err;
      } else if (err instanceof Error) {
        if (err.name === "TypeError" || err.message.toLowerCase().includes("fetch")) {
          msg = "Cannot reach the server. Please ensure the backend is running.";
        } else {
          msg = err.message;
        }
      } else if (err && typeof err === "object") {
        msg = err.detail || err.message || JSON.stringify(err);
      } else {
        msg = "An unexpected error occurred. Please try again.";
      }
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const placeholder = detectedRole === "engineer"
    ? "Employee ID (e.g. M-001-AB12)"
    : detectedRole === "admin"
    ? "Government email (e.g. admin@infracare.gov.in)"
    : "Email, 10-digit mobile, or Employee ID";

  return (
    <main className="split-auth login-split">
      {/* ── Left visual panel ── */}
      <section className="auth-visual night">
        <Brand compact />
        <h2>Road Damage Detection &amp; Reporting System</h2>
        <p>
          Ensuring safe, smooth, and sustainable urban infrastructure through
          advanced detection and community reporting.
        </p>

        <small>© 2024 InfraCare Road Damage Detection &amp; Reporting System.</small>
      </section>

      {/* ── Right form panel ── */}
      <form className="auth-panel" onSubmit={submit} noValidate>
        <h1>Welcome Back</h1>
        <p>Enter your credentials — we'll detect your role automatically.</p>

        {/* Server-level error */}
        {serverError && (
          <div
            id="server-error-banner"
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

        {/* Identifier field */}
        <label id="label-identifier" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>ID / Email / Mobile</span>
          <input
            id="input-identifier"
            ref={idRef}
            type="text"
            placeholder={placeholder}
            value={identifier}
            autoComplete="username"
            autoFocus
            onChange={(e) => {
              setIdentifier(e.target.value);
              setServerError("");
            }}
            onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
            style={idError ? { borderColor: "#c0152a" } : {}}
          />
          <RoleBadge role={detectedRole} />
          <FieldError msg={idError} />
        </label>

        {/* Password field */}
        <label id="label-password" style={{ position: "relative" }}>
          <span>Password</span>
          <button
            type="button"
            className="text-link"
            style={{ position: "absolute", right: 0, top: 0 }}
            onClick={() => alert("Password reset link will be sent to your registered contact.")}
          >
            Forgot Password?
          </button>
          <span
            className="input-icon"
            style={pwdError ? { borderColor: "#c0152a" } : {}}
          >
            <input
              id="input-password"
              ref={pwdRef}
              type={show ? "text" : "password"}
              placeholder="Numeric password (6–8 digits)"
              value={password}
              autoComplete="current-password"
              inputMode="numeric"
              onKeyDown={(e) => {
                const allowed = ["Backspace","Delete","Tab","Escape","Enter",
                  "ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"];
                if (allowed.includes(e.key)) return;
                if (!/^\d$/.test(e.key)) e.preventDefault();
              }}
              onChange={(e) => {
                setPassword(e.target.value.replace(/\D/g, ""));
                setServerError("");
              }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            />
            <button
              type="button"
              id="toggle-password-visibility"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((s) => !s)}
              style={{ flexShrink: 0 }}
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
          <FieldError msg={pwdError} />
        </label>

        {/* Remember me */}
        <label className="checkline" id="label-remember-me">
          <input
            id="checkbox-remember-me"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember Me
        </label>

        {/* Submit */}
        <button
          id="btn-login"
          className="black wide"
          disabled={loading}
          style={loading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        >
          {loading ? "Logging in…" : <>Login <ArrowRight /></>}
        </button>

        <hr />
        <p className="center">
          Don&apos;t have an account?{" "}
          <button
            id="btn-register-link"
            type="button"
            className="text-link strong"
            onClick={() => setPage("register")}
          >
            Register here
          </button>
        </p>
      </form>
    </main>
  );
}
