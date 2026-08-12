import React, { useState, useRef, useEffect } from "react";
import {
  Eye, EyeOff, ArrowRight, AlertCircle,
  UserCircle, ShieldCheck, HardHat, ArrowLeft,
} from "lucide-react";
import Brand from "../components/Brand";
import { apiUrl } from "../services/api";
import { supabase } from "../services/supabase";
import Swal from "sweetalert2";

/* ─── Role detection from identifier ─────────────────────────────── */
const ENG_ID_RE = /^M-\d{3}-[A-Z0-9]{4}$/i;
const GOV_RE    = /^[^\s@]+@[^\s@]+\.gov\.[^\s@]+$/i;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

function detectRole(value) {
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (v.includes("approver") || v.startsWith("fin-")) return "approver";
  if (ENG_ID_RE.test(v)) return "engineer";
  if (GOV_RE.test(v))    return "admin";
  if (EMAIL_RE.test(v) || MOBILE_RE.test(v)) return "citizen";
  return null;
}

/* ─── Role badge ──────────────────────────────────────────────────── */
const ROLE_META = {
  citizen:  { label: "Citizen",  icon: UserCircle,  color: "#2563eb", bg: "#eff6ff" },
  engineer: { label: "Engineer", icon: HardHat,     color: "#d97706", bg: "#fffbeb" },
  approver: { label: "Approval Authority", icon: ShieldCheck, color: "#7c3aed", bg: "#f3e8ff" },
  admin:    { label: "Admin",    icon: ShieldCheck, color: "#16a34a", bg: "#f0fdf4" },
};

function RoleBadge({ role, identifier }) {
  if (!role) return null;
  const meta = ROLE_META[role];
  let label = meta.label;
  if (role === "engineer" && identifier) {
    const cleanId = identifier.trim().toUpperCase();
    if (cleanId.startsWith("M-002") || cleanId.includes("MES")) {
      label = "MESCOM (Streetlight) Engineer";
    } else if (cleanId.startsWith("M-001") || cleanId.includes("PWD")) {
      label = "PWD (Road & Drainage) Engineer";
    }
  }
  const { icon: Icon, color, bg } = meta;
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
  "anaghabhat920@gmail.com",
  "m-001-pwd1",
  "m-002-mes1",
  "m-001-ab12",
  "admin@infracare.gov.in",
  "approver@demo.com",
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

  /* ─── Login via Backend API & Supabase ─────────────────────────────────────── */
  const login = async (id, pwd, role) => {
    if (isDemoCredential(id) || !EMAIL_RE.test(id)) {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, password: pwd, role }),
      });
  
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid credentials. Please try again.");
      }
  
      return res.json();
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: id,
      password: pwd,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", data.session.user.id)
        .single();
        
      const meta = data.session.user.user_metadata || {};
      const userRole = profile?.role || meta.role || "citizen";
      const role_home = { citizen: "home", engineer: "maintenance", inspector: "inspections", admin: "dashboard" };
      
      return {
        user: {
          id: data.session.user.id,
          role: userRole,
          name: profile?.full_name || meta.full_name || data.session.user.email,
          email: data.session.user.email,
        },
        access_token: data.session.access_token,
        redirect: role_home[userRole] || "home"
      };
    }
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
      const result = await login(identifier, password, detectedRole);

      if (remember) {
        localStorage.setItem("infracare_user", JSON.stringify(result.user));
      }
      localStorage.setItem("infracare_token", result.access_token);
      
      setUser(result.user);
      setPage(result.redirect || "home");
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
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter your email address in the field above first."
      });
      idRef.current?.focus();
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      Swal.fire({
        icon: "info",
        title: "Check your email",
        text: "If an account exists, a password reset link has been sent to your email."
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || JSON.stringify(err) });
    } finally {
      setLoading(false);
    }
  };

  const placeholder =
    detectedRole === "admin"  ? "Government email (e.g. admin@infracare.gov.in)"
    : "Email or 10-digit mobile";

  return (
    <main className="split-auth login-split">
      {/* ── Left visual panel ── */}
      <section className="auth-visual night" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
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
              <RoleBadge role={detectedRole} identifier={identifier} />
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
