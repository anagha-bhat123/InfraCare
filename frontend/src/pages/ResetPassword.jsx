import React, { useState, useRef } from "react";
import { Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import Brand from "../components/Brand";
import { supabase } from "../services/supabase";
import Swal from "sweetalert2";

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <span
      role="alert"
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
      <AlertCircle size={14} style={{ flexShrink: 0 }} />
      {msg}
    </span>
  );
}

const SPECIAL_CHAR_RE = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/;

function PasswordStrengthBar({ password }) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (SPECIAL_CHAR_RE.test(password)) score += 1;

  let label = "Weak";
  let color = "#ef4444";
  let pct = 20;

  if (score === 5) {
    label = "Strong & Compliant";
    color = "#16a34a";
    pct = 100;
  } else if (score >= 3) {
    label = "Moderate (Missing criteria)";
    color = "#f59e0b";
    pct = 60;
  } else {
    pct = Math.max(20, score * 20);
  }

  return (
    <div style={{ marginTop: 6, marginBottom: 2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: ".75rem", color: "#64748b" }}>Password security:</span>
        <span style={{ fontSize: ".75rem", fontWeight: 700, color }}>{label}</span>
      </div>
      <div style={{ height: 4, width: "100%", background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 4,
            transition: "all 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function PasswordRequirements({ password }) {
  if (!password) return null;
  const hasLength  = password.length >= 8;
  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasNumber  = /\d/.test(password);
  const hasSpecial = SPECIAL_CHAR_RE.test(password);

  const items = [
    { label: "8+ characters", met: hasLength },
    { label: "Uppercase letter (A-Z)", met: hasUpper },
    { label: "Lowercase letter (a-z)", met: hasLower },
    { label: "Number (0-9)", met: hasNumber },
    { label: "Special character (!@#$...)", met: hasSpecial },
  ];

  return (
    <div style={{
      marginTop: 8, marginBottom: 4,
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px",
      background: "#f8fafc", padding: "8px 12px", borderRadius: 6,
      border: "1px solid #e2e8f0"
    }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: ".75rem",
            color: item.met ? "#16a34a" : "#64748b",
            fontWeight: item.met ? 600 : 400
          }}
        >
          {item.met ? (
            <CheckCircle2 size={13} color="#16a34a" style={{ flexShrink: 0 }} />
          ) : (
            <div style={{ width: 13, height: 13, borderRadius: "50%", border: "1.5px solid #94a3b8", flexShrink: 0 }} />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ResetPassword({ setPage }) {
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdTouched, setPwdTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const [serverError, setServerError] = useState("");

  const pwdRef = useRef(null);
  const confirmRef = useRef(null);

  const validateField = (field, value, extra = {}) => {
    if (field === "newPassword") {
      const val = value ?? newPassword;
      if (!val) return "Password is required.";
      if (val.length < 8) return "Password must be at least 8 characters long.";
      if (!/[A-Z]/.test(val)) return "Password must include at least one uppercase letter (A-Z).";
      if (!/[a-z]/.test(val)) return "Password must include at least one lowercase letter (a-z).";
      if (!/\d/.test(val)) return "Password must include at least one number (0-9).";
      if (!SPECIAL_CHAR_RE.test(val)) return "Password must include at least one special character (!@#$%^&* etc.).";
      return "";
    }
    if (field === "confirmPassword") {
      const val = value ?? confirmPassword;
      const pwd = extra.password ?? newPassword;
      if (!val) return "Please confirm your password.";
      if (val !== pwd) return "Passwords do not match.";
      return "";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    setServerError("");
    if (pwdTouched) {
      setErrors((prev) => ({ ...prev, newPassword: validateField("newPassword", val) }));
    }
    if (confirmTouched && confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateField("confirmPassword", confirmPassword, { password: val }) }));
    }
  };

  const handleConfirmChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setServerError("");
    if (confirmTouched) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateField("confirmPassword", val) }));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setServerError("");

    const pwdErr = validateField("newPassword", newPassword);
    const confirmErr = validateField("confirmPassword", confirmPassword);

    setPwdTouched(true);
    setConfirmTouched(true);
    setErrors({ newPassword: pwdErr, confirmPassword: confirmErr });

    if (pwdErr) {
      pwdRef.current?.focus();
      return;
    }
    if (confirmErr) {
      confirmRef.current?.focus();
      return;
    }
    
    if (!supabase) {
      setServerError("Authentication service is unavailable. Please check your connection.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been successfully reset! You are now logged in.",
        confirmButtonColor: "#1e293b",
      });
      
      // Clean up the URL hash so it doesn't trigger recovery again
      window.location.hash = "";
      
      // Let App.jsx know we are done recovering
      window.dispatchEvent(new CustomEvent("passwordResetDone"));
      
      // Navigate home (user is already logged in via the recovery link)
      setPage("home");
    } catch (err) {
      setServerError(err.message || "An unexpected error occurred while resetting password.");
    } finally {
      setLoading(false);
    }
  };

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
      <form className="auth-panel" onSubmit={handleResetPassword} noValidate>
        {/* Back to Login */}
        <button
          type="button"
          className="text-link"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8, fontWeight: 600 }}
          onClick={() => {
            window.location.hash = "";
            window.dispatchEvent(new CustomEvent("passwordResetDone"));
            setPage("login");
          }}
        >
          <ArrowLeft size={16} /> Cancel &amp; Back to Login
        </button>

        <h1>Reset Password</h1>
        <p>Create a secure new password for your account.</p>

        {/* Server-level error */}
        {serverError && (
          <div
            id="reset-server-error"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#fff0f2", border: "1px solid #f5c2c7",
              color: "#c0152a", padding: "14px 18px",
              fontSize: ".9rem", fontWeight: 500, borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        {/* New Password */}
        <label style={{ position: "relative" }}>
          <span>New Password</span>
          <span
            className="input-icon"
            style={pwdTouched && errors.newPassword ? { borderColor: "#c0152a" } : {}}
          >
            <input
              id="input-new-password"
              ref={pwdRef}
              required
              type={show ? "text" : "password"}
              placeholder="Min. 8 characters (Upper, Lower, Number, Special)"
              value={newPassword}
              autoComplete="new-password"
              onChange={handlePasswordChange}
              onBlur={() => {
                setPwdTouched(true);
                setErrors((p) => ({ ...p, newPassword: validateField("newPassword", newPassword) }));
              }}
              aria-invalid={Boolean(pwdTouched && errors.newPassword)}
            />
            <button
              type="button"
              id="toggle-new-password"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((s) => !s)}
              style={{ flexShrink: 0, background: "transparent", border: "none", cursor: "pointer", color: "#666" }}
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
          <PasswordStrengthBar password={newPassword} />
          <PasswordRequirements password={newPassword} />
          {pwdTouched && <FieldError msg={errors.newPassword} />}
        </label>

        {/* Confirm Password */}
        <label style={{ position: "relative" }}>
          <span>Confirm Password</span>
          <span
            className="input-icon"
            style={confirmTouched && errors.confirmPassword ? { borderColor: "#c0152a" } : {}}
          >
            <input
              id="input-confirm-new-password"
              ref={confirmRef}
              required
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={handleConfirmChange}
              onBlur={() => {
                setConfirmTouched(true);
                setErrors((p) => ({ ...p, confirmPassword: validateField("confirmPassword", confirmPassword) }));
              }}
              aria-invalid={Boolean(confirmTouched && errors.confirmPassword)}
            />
            <button
              type="button"
              id="toggle-confirm-new-password"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              onClick={() => setShowConfirm((s) => !s)}
              style={{ flexShrink: 0, background: "transparent", border: "none", cursor: "pointer", color: "#666" }}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
          {confirmTouched && <FieldError msg={errors.confirmPassword} />}
        </label>

        <button
          id="btn-confirm-reset"
          className="black wide"
          disabled={loading}
          style={{ marginTop: 12, ...(loading ? { opacity: 0.7, cursor: "not-allowed" } : {}) }}
        >
          {loading ? "Resetting Password…" : <>Update Password <ArrowRight size={18} /></>}
        </button>
      </form>
    </main>
  );
}
