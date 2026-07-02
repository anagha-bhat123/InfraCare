import React, { useState, useRef } from "react";
import {
  Eye, EyeOff, ArrowRight, AlertCircle,
  UserCircle, ShieldCheck, HardHat, ArrowLeft,
} from "lucide-react";
import Brand from "../components/Brand";
import { apiUrl } from "../services/api";
import { supabase } from "../services/supabase";

/* ─── Role detection from identifier ─────────────────────────────── */
const ENG_ID_RE = /^M-\d{3}-[A-Z0-9]{4}$/i;
const GOV_RE    = /^[^\s@]+@[^\s@]+\.gov\.[^\s@]+$/i;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

function detectRole(value) {
  const v = value.trim();
  if (!v) return null;
  if (ENG_ID_RE.test(v)) return "engineer";
  if (GOV_RE.test(v))    return "admin";
  if (EMAIL_RE.test(v) || MOBILE_RE.test(v)) return "citizen";
  return null;
}

/* ─── Role badge ──────────────────────────────────────────────────── */
const ROLE_META = {
  citizen:  { label: "Citizen",  icon: UserCircle,  color: "#2563eb", bg: "#eff6ff" },
  engineer: { label: "Engineer", icon: HardHat,     color: "#d97706", bg: "#fffbeb" },
  admin:    { label: "Admin",    icon: ShieldCheck, color: "#16a34a", bg: "#f0fdf4" },
};

function RoleBadge({ role }) {
  if (!role) return null;
  const { label, icon: Icon, color, bg } = ROLE_META[role];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: bg, color, border: `1px solid ${color}33`,
        borderRadius: 20, padding: "4px 12px",
        fontSize: ".82rem", fontWeight: 600, marginTop: 6,
        transition: "all .2s ease",
      }}
    >
      <Icon size={14} />
      {label} account detected
    </span>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <span
      style={{
        display: "flex", alignItems: "center", gap: 6,
        color: "#c0152a", fontSize: ".82rem",
        fontWeight: 500, marginTop: 4,
      }}
    >
      <AlertCircle size={14} />
      {msg}
    </span>
  );
}

/* ─── Demo credentials (backend only) ────────────────────────────── */
const DEMO_IDS = new Set([
  "citizen@demo.com",
  "m-001-ab12",
  "admin@infracare.gov.in",
]);

function isDemoCredential(identifier) {
  return DEMO_IDS.has(identifier.trim().toLowerCase());
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function Login({ setUser, setPage }) {
  const [show, setShow]         = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [idTouched, setIdTouched]   = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);
  const [serverError, setServerError] = useState("");

  const idRef  = useRef(null);
  const pwdRef = useRef(null);

  const detectedRole = detectRole(identifier);

  /* ─── Field-level validation ──────────────────────────────────── */
  const idError = (() => {
    if (!idTouched) return "";
    if (!identifier.trim()) return "This field is required.";
    if (!detectedRole) return "Enter a valid email, 10-digit mobile, or Employee ID (M-001-AB12).";
    return "";
  })();

  const pwdError = (() => {
    if (!pwdTouched) return "";
    if (!password) return "Password is required.";
    // Only enforce numeric-only for demo engineer IDs
    if (ENG_ID_RE.test(identifier.trim()) && isDemoCredential(identifier)) {
      if (!/^\d+$/.test(password)) return "Demo password must be numeric.";
    }
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  })();

  /* ─── Login via Supabase (for registered users) ───────────────── */
  const loginWithSupabase = async (email, pwd) => {
    if (!supabase) throw new Error("Auth service not available.");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pwd,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error(
          "Your email is not confirmed yet. Please check your inbox and click the confirmation link."
        );
      }
      throw new Error(error.message);
    }

    // Fetch profile to get role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", data.user.id)
      .single();

    // Priority: profiles table → user_metadata (set during signup) → email
    const meta = data.user.user_metadata || {};
    const role = profile?.role || meta.role || "citizen";
    const name = profile?.full_name || meta.full_name || data.user.email;

    const roleHome = { citizen: "track", engineer: "tasks", admin: "map" };
    return {
      user: { id: data.user.id, role, name, email: data.user.email },
      redirect: roleHome[role] || "track",
    };
  };

  /* ─── Login via demo backend ──────────────────────────────────── */
  const loginWithDemo = async (id, pwd, role) => {
    const res = await fetch(`${apiUrl}/auth/demo-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: id, password: pwd, role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid credentials. Please try again.");
    }

    return res.json();
  };

  /* ─── Submit ──────────────────────────────────────────────────── */
  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    setIdTouched(true);
    setPwdTouched(true);

    if (!identifier.trim()) { idRef.current?.focus(); return; }
    if (!detectedRole)       { idRef.current?.focus(); return; }
    if (!password)           { pwdRef.current?.focus(); return; }
    if (password.length < 6) { pwdRef.current?.focus(); return; }

    setLoading(true);
    try {
      let result;
      const isEmail = EMAIL_RE.test(identifier.trim());
      const isDemo  = isDemoCredential(identifier);

      if (isEmail && !isDemo && supabase) {
        // Real registered user → Supabase auth
        result = await loginWithSupabase(identifier, password);
      } else {
        // Demo credential or employee ID → backend demo-login
        result = await loginWithDemo(identifier, password, detectedRole);
      }

      if (remember) {
        localStorage.setItem("infracare_user", JSON.stringify(result.user));
      }
      setUser(result.user);
      setPage(result.redirect);
    } catch (err) {
      let msg;
      if (err instanceof Error) {
        if (err.name === "TypeError" || err.message.toLowerCase().includes("failed to fetch")) {
          msg = "Cannot reach the server. Please ensure the backend is running.";
        } else {
          msg = err.message;
        }
      } else {
        msg = "An unexpected error occurred. Please try again.";
      }
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Forgot password ─────────────────────────────────────────── */
  const handleForgotPassword = async () => {
    const email = identifier.trim();
    if (!EMAIL_RE.test(email)) {
      alert("Please enter your email address in the field above first.");
      idRef.current?.focus();
      return;
    }
    if (!supabase) {
      alert("Password reset is not available in demo mode.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    if (error) {
      alert(`Could not send reset email: ${error.message}`);
    } else {
      alert(`Password reset link sent to ${email}. Please check your inbox.`);
    }
  };

  const placeholder =
    detectedRole === "engineer" ? "Employee ID (e.g. M-001-AB12)"
    : detectedRole === "admin"  ? "Government email (e.g. admin@infracare.gov.in)"
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

        {/* Back to Home */}
        <button
          type="button"
          className="text-link"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8, fontWeight: 600 }}
          onClick={() => setPage("home")}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <h1>Welcome Back</h1>
        <p>Enter your credentials — we'll detect your role automatically.</p>

        {/* Server-level error */}
        {serverError && (
          <div
            id="server-error-banner"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#fff0f2", border: "1px solid #f5c2c7",
              color: "#c0152a", padding: "14px 18px",
              fontSize: ".9rem", fontWeight: 500, borderRadius: 8,
            }}
          >
            <AlertCircle size={18} />
            {serverError}
          </div>
        )}

        {/* Identifier field */}
        <label id="label-identifier" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>Email / Mobile / Employee ID</span>
          <input
            id="input-identifier"
            ref={idRef}
            type="text"
            placeholder={placeholder}
            value={identifier}
            autoComplete="username"
            autoFocus
            onChange={(e) => { setIdentifier(e.target.value); setServerError(""); }}
            onBlur={() => setIdTouched(true)}
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
            onClick={handleForgotPassword}
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
              placeholder="Enter your password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => { setPassword(e.target.value); setServerError(""); }}
              onBlur={() => setPwdTouched(true)}
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
