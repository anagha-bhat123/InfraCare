import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import Brand from "../components/Brand";
import { supabase } from "../services/supabase";
import Swal from "sweetalert2";

export default function ResetPassword({ setPage }) {
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverError, setServerError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setServerError("");
    
    if (newPassword.length < 6) {
      setServerError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setServerError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been successfully reset!"
      });
      
      // Clean up the URL hash so it doesn't trigger recovery again
      window.location.hash = "";
      
      // Let App.jsx know we are done recovering
      window.dispatchEvent(new CustomEvent("passwordResetDone"));
      
      // Navigate home (user is already logged in via the recovery link)
      setPage("home");
    } catch (err) {
      setServerError(err.message || "An unexpected error occurred.");
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
        {/* Back to Login (in case they want to cancel) */}
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
          <ArrowLeft size={16} /> Cancel & Back to Login
        </button>

        <h1>Reset Password</h1>
        <p>Create a new password for your account.</p>

        {/* Server-level error */}
        {serverError && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#fff0f2", border: "1px solid #f5c2c7",
              color: "#c0152a", padding: "14px 18px",
              fontSize: ".9rem", fontWeight: 500, borderRadius: 8,
              marginBottom: 16
            }}
          >
            <AlertCircle size={18} />
            {serverError}
          </div>
        )}

        {/* New Password */}
        <label style={{ position: "relative" }}>
          <span>New Password</span>
          <span className="input-icon">
            <input
              required
              type={show ? "text" : "password"}
              placeholder="Enter new password (min 6 characters)"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setServerError(""); }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              style={{ flexShrink: 0, background: "transparent", border: "none" }}
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
        </label>

        {/* Confirm Password */}
        <label style={{ position: "relative" }}>
          <span>Confirm Password</span>
          <span className="input-icon">
            <input
              required
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setServerError(""); }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              style={{ flexShrink: 0, background: "transparent", border: "none" }}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </span>
        </label>

        <button
          className="black wide"
          disabled={loading}
          style={loading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        >
          {loading ? "Resetting…" : <>Confirm Reset <ArrowRight /></>}
        </button>
      </form>
    </main>
  );
}
