import React, { useState, useRef } from "react";
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
const GOV_RE    = /^[^\s@]+@[^\s@]*gov(\.[^\s@]+)?$/i;
const EMAIL_RE  = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

function detectRole(value) {
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (v.includes("approver") || v.startsWith("fin-")) return "approver";
  if (ENG_ID_RE.test(v)) return "engineer";
  if (GOV_RE.test(v) || v.includes("admin")) return "admin";
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
  if (!meta) return null;

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
      id="role-detected-badge"
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
      role="alert"
      style={{
        display: "flex", alignItems: "center", gap: 6,
        color: "#c0152a", fontSize: ".82rem",
        fontWeight: 500, marginTop: 4,
      }}
    >
      <AlertCircle size={14} style={{ flexShrink: 0 }} />
      {msg}
    </span>
  );
}

/* ─── Demo credentials list (synced with backend DEMO_USERS) ──────── */
const DEMO_IDS = new Set([
  "citizen@demo.com",
  "anaghabhat920@gmail.com",
  "9876543210",
  "m-001-pwd1",
  "m-002-mes1",
  "m-001-ab12",
  "m-002-8lun",
  "admin@infracare.gov.in",
  "approver@demo.com",
  "approver@infracare.gov.in",
  "fin-001-app",
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
  const [errors, setErrors]         = useState({ identifier: "", password: "" });
  const [serverError, setServerError] = useState("");

  const idRef  = useRef(null);
  const pwdRef = useRef(null);

  const detectedRole = detectRole(identifier);

const SPECIAL_CHAR_RE = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/;

  /* ─── Field-level validation ──────────────────────────────────── */
  const validateField = (field, value) => {
    if (field === "identifier") {
      const val = (value ?? identifier).trim();
      if (!val) return "Email, Mobile, or Employee ID is required.";
      const role = detectRole(val);
      if (!role) {
        return "Enter a valid email address, 10-digit mobile number, or Employee ID (e.g. M-001-AB12).";
      }
      return "";
    }
    if (field === "password") {
      const val = value ?? password;
      if (!val) return "Password is required.";
      if (val.length < 8) return "Password must be at least 8 characters long.";
      if (!/[A-Z]/.test(val)) return "Password must include at least one uppercase letter (A-Z).";
      if (!/[a-z]/.test(val)) return "Password must include at least one lowercase letter (a-z).";
      if (!/\d/.test(val)) return "Password must include at least one number (0-9).";
      if (!SPECIAL_CHAR_RE.test(val)) return "Password must include at least one special character (!@#$%^&* etc.).";
      return "";
    }
    return "";
  };

  const handleIdentifierBlur = () => {
    setIdTouched(true);
    const err = validateField("identifier", identifier);
    setErrors((prev) => ({ ...prev, identifier: err }));
  };

  const handlePasswordBlur = () => {
    setPwdTouched(true);
    const err = validateField("password", password);
    setErrors((prev) => ({ ...prev, password: err }));
  };

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    setIdentifier(val);
    setServerError("");
    if (idTouched) {
      setErrors((prev) => ({ ...prev, identifier: validateField("identifier", val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setServerError("");
    if (pwdTouched) {
      setErrors((prev) => ({ ...prev, password: validateField("password", val) }));
    }
  };

  /* ─── Login via Backend API & Supabase ─────────────────────────────────────── */
  const login = async (id, pwd, role) => {
    const cleanId = id.trim();
    // Route to backend API if it's a demo credential, an employee ID, an approver ID, or a mobile number
    if (isDemoCredential(cleanId) || ENG_ID_RE.test(cleanId) || MOBILE_RE.test(cleanId) || role !== "citizen") {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanId, password: pwd, role: role || "citizen" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid credentials. Please verify your credentials and try again.");
      }

      return res.json();
    }

    if (!supabase) {
      throw new Error("Authentication service is unavailable. Please check your connection.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanId.toLowerCase(),
      password: pwd,
    });

    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        throw new Error("Invalid email or password. Please check your credentials and try again.");
      }
      throw new Error(error.message);
    }

    if (data?.session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, phone, ward_zone, zone")
        .eq("id", data.session.user.id)
        .maybeSingle();
        
      const metadata = data.session.user?.user_metadata || {};
      const userRole = profile?.role || metadata.role || "citizen";
      const userName = profile?.full_name || metadata.full_name || data.session.user.email;
      const role_home = {
        citizen: "home",
        engineer: "maintenance",
        inspector: "inspections",
        admin: "dashboard",
        approver: "approval-authority"
      };
      
      return {
        user: {
          id: data.session.user.id,
          role: userRole,
          name: userName,
          email: data.session.user.email,
          phone: profile?.phone || metadata.phone || "",
          ward: profile?.ward_zone || metadata.ward_zone || "",
          zone: profile?.zone || metadata.zone || "",
        },
        access_token: data.session.access_token,
        redirect: role_home[userRole] || "home"
      };
    }

    throw new Error("Failed to establish user session.");
  };

  /* ─── Submit ──────────────────────────────────────────────────── */
  const submit = async (e) => {
    e.preventDefault();
    setServerError("");

    const idErr = validateField("identifier", identifier);
    const pwdErr = validateField("password", password);

    setIdTouched(true);
    setPwdTouched(true);
    setErrors({ identifier: idErr, password: pwdErr });

    if (idErr) {
      idRef.current?.focus();
      return;
    }
    if (pwdErr) {
      pwdRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const result = await login(identifier.trim(), password, detectedRole);

      if (remember) {
        localStorage.setItem("infracare_user", JSON.stringify(result.user));
      }
      if (result.access_token) {
        localStorage.setItem("infracare_token", result.access_token);
      }
      
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
    let targetId = identifier.trim();

    if (!targetId) {
      const { value: promptedId } = await Swal.fire({
        title: "Reset Password",
        text: "Enter your registered Email, Employee ID (e.g. M-002-VC96), or 10-digit Mobile number:",
        input: "text",
        inputPlaceholder: "Email / Employee ID / Mobile",
        showCancelButton: true,
        confirmButtonText: "Send Reset Link",
        confirmButtonColor: "#111827",
        cancelButtonColor: "#64748b",
        inputValidator: (val) => {
          if (!val || !val.trim()) return "Please enter your identifier to proceed.";
        }
      });

      if (!promptedId) return;
      targetId = promptedId.trim();
    }

    setLoading(true);
    try {
      // 1. Call Backend Password Recovery (supports Employee IDs, Mobile numbers, and Emails)
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: targetId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Account not found with this identifier.");
      }

      // 2. If it's a citizen with a valid email and Supabase is configured, also trigger Supabase Auth reset
      if (EMAIL_RE.test(targetId) && supabase) {
        try {
          await supabase.auth.resetPasswordForEmail(targetId.toLowerCase(), {
            redirectTo: `${window.location.origin}/`,
          });
        } catch {
          // Backend email was already dispatched
        }
      }

      Swal.fire({
        icon: "success",
        title: "Check Your Email",
        html: `<p style="font-size:.95rem; color:#334155; line-height:1.5;">${data.message || "Password reset instructions have been sent to your registered email address."}</p>`,
        confirmButtonColor: "#111827",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Password Reset Failed",
        text: err.message || "Could not process password reset request. Please check your credentials.",
        confirmButtonColor: "#111827",
      });
    } finally {
      setLoading(false);
    }
  };

  const placeholder =
    detectedRole === "admin"
      ? "Government email (e.g. admin@infracare.gov.in)"
      : detectedRole === "engineer"
      ? "Employee ID (e.g. M-001-AB12) or mobile"
      : "Email, 10-digit mobile, or Employee ID";

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
              marginBottom: 8,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
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
            onChange={handleIdentifierChange}
            onBlur={handleIdentifierBlur}
            aria-invalid={Boolean(idTouched && errors.identifier)}
            style={idTouched && errors.identifier ? { borderColor: "#c0152a" } : {}}
          />
          <RoleBadge role={detectedRole} identifier={identifier} />
          {idTouched && <FieldError msg={errors.identifier} />}
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
            style={pwdTouched && errors.password ? { borderColor: "#c0152a" } : {}}
          >
            <input
              id="input-password"
              ref={pwdRef}
              type={show ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              autoComplete="current-password"
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              aria-invalid={Boolean(pwdTouched && errors.password)}
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
          {pwdTouched && <FieldError msg={errors.password} />}
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
