import React, { useState, useRef } from "react";
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
  Copy,
  Check,
} from "lucide-react";
import { supabase } from "../services/supabase";
import { apiUrl } from "../services/api";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MOBILE_RE = /^[6-9]\d{9}$/;
const NAME_RE = /^[a-zA-Z\s]+$/;

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

export default function Register({ setPage }) {
  const [type, setType] = useState("Citizen");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [generatedEngineerId, setGeneratedEngineerId] = useState("");
  const [department, setDepartment] = useState("PWD - Road & Drainage");
  const [copiedId, setCopiedId] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [ward, setWard] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Touched state
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    mobile: false,
    password: false,
    confirmPassword: false,
    terms: false,
  });

  // Errors state
  const [errors, setErrors] = useState({});

  // Input refs for focus on error
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const mobileRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const termsRef = useRef(null);

  // Field validation rules
  const validateField = (field, value, extra = {}) => {
    switch (field) {
      case "fullName": {
        const val = (value ?? fullName).trim();
        if (!val) return "Full name is required.";
        if (val.length < 2) return "Full name must be at least 2 characters.";
        if (!NAME_RE.test(val)) return "Name can only contain letters and spaces (no numbers or special characters).";
        return "";
      }
      case "email": {
        const val = (value ?? email).trim();
        if (!val) return "Email address is required.";
        if (!EMAIL_RE.test(val)) return "Enter a valid email address (e.g. name@example.com).";
        return "";
      }
      case "mobile": {
        const val = (value ?? mobile).trim();
        if (!val) return "Mobile number is required.";
        if (!MOBILE_RE.test(val)) return "Enter a valid 10-digit Indian mobile number (starts with 6-9).";
        return "";
      }
      case "password": {
        const val = value ?? password;
        if (!val) return "Password is required.";
        if (val.length < 8) return "Password must be at least 8 characters long.";
        if (!/[A-Z]/.test(val)) return "Password must include at least one uppercase letter (A-Z).";
        if (!/[a-z]/.test(val)) return "Password must include at least one lowercase letter (a-z).";
        if (!/\d/.test(val)) return "Password must include at least one number (0-9).";
        if (!SPECIAL_CHAR_RE.test(val)) return "Password must include at least one special character (!@#$%^&* etc.).";
        return "";
      }
      case "confirmPassword": {
        const val = value ?? confirmPassword;
        const pwd = extra.password ?? password;
        if (!val) return "Please confirm your password.";
        if (val !== pwd) return "Passwords do not match.";
        return "";
      }
      case "terms": {
        const val = value ?? terms;
        if (!val) return "You must agree to the Terms of Service & Privacy Policy.";
        return "";
      }
      default:
        return "";
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleFullNameChange = (e) => {
    // Strictly disallow numbers and special characters in real time (letters and spaces only)
    const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setFullName(sanitized);
    setServerError("");
    if (touched.fullName) {
      setErrors((prev) => ({ ...prev, fullName: validateField("fullName", sanitized) }));
    }
  };

  const handleMobileChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    // Auto-strip country code if pasted with +91 or leading 0
    if (raw.length === 12 && raw.startsWith("91")) raw = raw.slice(2);
    if (raw.length === 11 && raw.startsWith("0")) raw = raw.slice(1);
    raw = raw.slice(0, 10);

    setMobile(raw);
    setServerError("");
    if (touched.mobile) {
      setErrors((prev) => ({ ...prev, mobile: validateField("mobile", raw) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setServerError("");
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validateField("password", val) }));
    }
    if (touched.confirmPassword && confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateField("confirmPassword", confirmPassword, { password: val }) }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setServerError("");
    if (touched.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateField("confirmPassword", val) }));
    }
  };

  const validateAll = () => {
    const newErrors = {
      fullName: validateField("fullName", fullName),
      email: validateField("email", email),
      mobile: validateField("mobile", mobile),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
      terms: validateField("terms", terms),
    };

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      mobile: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = validateAll();
    const hasError = Object.values(errs).some((err) => Boolean(err));

    if (hasError) {
      // Focus first error field
      if (errs.fullName) nameRef.current?.focus();
      else if (errs.email) emailRef.current?.focus();
      else if (errs.mobile) mobileRef.current?.focus();
      else if (errs.password) passwordRef.current?.focus();
      else if (errs.confirmPassword) confirmRef.current?.focus();
      else if (errs.terms) termsRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const role = type === "Engineer" ? "engineer" : "citizen";

      if (role === "engineer") {
        const res = await fetch(`${apiUrl}/auth/register-engineer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile.trim(),
            ward_zone: ward || "",
            password: password,
            department: department,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || "Registration failed. Please check your information and try again.");
        }

        const data = await res.json();
        setGeneratedEngineerId(data.engineer_id);
      } else {
        if (!supabase) {
          throw new Error("Authentication service is unavailable. Please check your connection.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role,
              phone: mobile.trim(),
              ward_zone: ward || null,
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("already registered")) {
            throw new Error("An account with this email already exists. Please log in instead.");
          }
          throw error;
        }
      }

      setSuccess(true);
    } catch (err) {
      setServerError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  if (success) {
    return (
      <main className="split-auth register-split">
        <section className="auth-visual road">
          <h1>Road Damage<br />Detection &amp;<br />Reporting</h1>
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
                {" "}Your official <strong>Employee ID</strong> and login details have been generated.
              </>
            ) : " You can now log in using your registered email and password."}
          </p>

          {type === "Engineer" && (
            <>
              {generatedEngineerId && (
                <div style={{
                  background: "#1e293b",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "16px 20px",
                  maxWidth: 360,
                  width: "100%",
                  textAlign: "center",
                  marginTop: 6,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  position: "relative",
                }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
                    YOUR PERMANENT EMPLOYEE ID
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#38bdf8", fontFamily: "monospace", letterSpacing: 2, margin: "6px 0" }}>
                    {generatedEngineerId}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedEngineerId)}
                    style={{
                      background: copiedId ? "#16a34a" : "#334155",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 14px",
                      fontSize: ".8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                      transition: "all .2s ease",
                    }}
                  >
                    {copiedId ? <><Check size={14} /> Copied to Clipboard!</> : <><Copy size={14} /> Copy Employee ID</>}
                  </button>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 8 }}>
                    Use this Employee ID or your Mobile Number to Log In
                  </div>
                </div>
              )}

              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                background: "#eff6ff", border: "1px solid #bfdbfe",
                borderRadius: 10, padding: "14px 18px", maxWidth: 360,
                textAlign: "left", marginTop: 4,
              }}>
                <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>📧</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#1e40af", fontSize: ".88rem", marginBottom: 3 }}>Credentials Confirmation</div>
                  <div style={{ color: "#3b5bdb", fontSize: ".82rem", lineHeight: 1.5 }}>
                    Your Employee ID <strong>({generatedEngineerId || "M-001-XXXX"})</strong> and department details have been recorded for <strong>{email.trim()}</strong>.
                  </div>
                </div>
              </div>
            </>
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
        <h1>Road Damage<br />Detection &amp;<br />Reporting</h1>
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
            id="register-server-error"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fff0f2",
              border: "1px solid #f5c2c7",
              color: "#c0152a",
              padding: "12px 16px",
              fontSize: ".9rem",
              fontWeight: 500,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        <label>Register as:</label>
        <div className="segmented">
          {["Citizen", "Engineer"].map((v) => (
            <button
              type="button"
              className={type === v ? "selected" : ""}
              onClick={() => {
                setType(v);
                setServerError("");
              }}
              key={v}
            >
              {v}
            </button>
          ))}
        </div>
        <em style={{ fontSize: ".8rem", color: "#64748b" }}>
          {type === "Engineer"
            ? "Engineer accounts receive a permanent departmental Employee ID."
            : "Note: Admin and Authority accounts are provisioned by Department Heads."}
        </em>

        {type === "Engineer" && (
          <label style={{ marginTop: 12 }}>
            Department
            <span className="input-icon">
              <ClipboardCheck />
              <select
                id="select-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="PWD - Road & Drainage">PWD (Road &amp; Drainage)</option>
                <option value="MESCOM - Streetlight & Grid">MESCOM (Streetlight &amp; Grid)</option>
              </select>
            </span>
          </label>
        )}

        {/* Full Name */}
        <label>
          Full Name
          <span
            className="input-icon"
            style={touched.fullName && errors.fullName ? { borderColor: "#c0152a" } : {}}
          >
            <CircleUserRound />
            <input
              id="input-fullname"
              ref={nameRef}
              required
              placeholder="e.g. Anagha Bhat"
              value={fullName}
              autoComplete="name"
              onChange={handleFullNameChange}
              onBlur={() => handleBlur("fullName")}
              aria-invalid={Boolean(touched.fullName && errors.fullName)}
            />
          </span>
          {touched.fullName && <FieldError msg={errors.fullName} />}
        </label>

        {/* Email */}
        <label>
          Email Address
          <span
            className="input-icon"
            style={touched.email && errors.email ? { borderColor: "#c0152a" } : {}}
          >
            <Mail />
            <input
              id="input-email"
              ref={emailRef}
              required
              type="email"
              placeholder="name@example.com"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setServerError("");
                if (touched.email) {
                  setErrors((prev) => ({ ...prev, email: validateField("email", e.target.value) }));
                }
              }}
              onBlur={() => handleBlur("email")}
              aria-invalid={Boolean(touched.email && errors.email)}
            />
          </span>
          {touched.email && <FieldError msg={errors.email} />}
        </label>

        {/* Mobile */}
        <label>
          Mobile Number
          <span
            className="input-icon"
            style={touched.mobile && errors.mobile ? { borderColor: "#c0152a" } : {}}
          >
            <ClipboardCheck />
            <input
              id="input-mobile"
              ref={mobileRef}
              required
              placeholder="10-digit mobile number (e.g. 9876543210)"
              value={mobile}
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              onChange={handleMobileChange}
              onBlur={() => handleBlur("mobile")}
              aria-invalid={Boolean(touched.mobile && errors.mobile)}
            />
          </span>
          {touched.mobile && <FieldError msg={errors.mobile} />}
        </label>

        {/* Ward / Zone */}
        <label>
          Ward / Zone (Optional)
          <span className="input-icon">
            <MapPin />
            <select
              id="select-ward"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
            >
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

        {/* Password */}
        <label>
          Create Password
          <span
            className="input-icon"
            style={touched.password && errors.password ? { borderColor: "#c0152a" } : {}}
          >
            <Lock />
            <input
              id="input-register-password"
              ref={passwordRef}
              required
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters (Upper, Lower, Number, Special)"
              value={password}
              autoComplete="new-password"
              onChange={handlePasswordChange}
              onBlur={() => handleBlur("password")}
              aria-invalid={Boolean(touched.password && errors.password)}
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
          <PasswordStrengthBar password={password} />
          <PasswordRequirements password={password} />
          {touched.password && <FieldError msg={errors.password} />}
        </label>

        {/* Confirm Password */}
        <label>
          Confirm Password
          <span
            className="input-icon"
            style={touched.confirmPassword && errors.confirmPassword ? { borderColor: "#c0152a" } : {}}
          >
            <Lock />
            <input
              id="input-register-confirm-password"
              ref={confirmRef}
              required
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={handleConfirmPasswordChange}
              onBlur={() => handleBlur("confirmPassword")}
              aria-invalid={Boolean(touched.confirmPassword && errors.confirmPassword)}
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
          {touched.confirmPassword && <FieldError msg={errors.confirmPassword} />}
        </label>

        {/* Terms checkbox */}
        <label className="checkline" style={{ marginTop: 4 }}>
          <input
            id="checkbox-terms"
            ref={termsRef}
            type="checkbox"
            checked={terms}
            onChange={(e) => {
              const checked = e.target.checked;
              setTerms(checked);
              setTouched((prev) => ({ ...prev, terms: true }));
              setErrors((prev) => ({ ...prev, terms: checked ? "" : "You must agree to the Terms of Service & Privacy Policy." }));
            }}
          />
          <span>
            I agree to the <button type="button" className="text-link inline" style={{ padding: 0, textDecoration: "underline" }} onClick={() => setPage("terms-of-service")}>Terms of Service</button> and <button type="button" className="text-link inline" style={{ padding: 0, textDecoration: "underline" }} onClick={() => setPage("privacy-policy")}>Privacy Policy</button> of the InfraCare Portal.
          </span>
        </label>
        {touched.terms && <FieldError msg={errors.terms} />}

        {/* Submit button */}
        <button
          id="btn-register-submit"
          className="black wide"
          disabled={loading}
          style={{ marginTop: 12, ...(loading ? { opacity: 0.7, cursor: "not-allowed" } : {}) }}
        >
          {loading ? "Creating Account…" : <>{type === "Engineer" ? "Register as Engineer" : "Create Citizen Account"} <ArrowRight size={18} /></>}
        </button>

        <p className="center">
          Already have an account?{" "}
          <button type="button" id="btn-login-link" className="text-link strong" onClick={() => setPage("login")}>
            Login here
          </button>
        </p>
      </form>
    </main>
  );
}
