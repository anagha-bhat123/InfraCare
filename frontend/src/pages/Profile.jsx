import React, { useState } from "react";
import {
  ArrowLeft, LogOut, Mail, ShieldCheck,
  Pencil, Check, X, Phone, MapPin, User, IdCard,
} from "lucide-react";
import { supabase } from "../services/supabase";

const ROLE_COLOR = { citizen: "#2563eb", engineer: "#d97706", admin: "#16a34a" };
const ROLE_BG    = { citizen: "#dbeafe", engineer: "#fef3c7", admin: "#dcfce7" };
const ROLE_LABEL = { citizen: "Citizen", engineer: "Engineer", admin: "Admin" };

/* ── Helpers ────────────────────────────────────────────────────── */
function getAvatarText(user) {
  const n = (user?.name || "").trim();
  if (!n || n.includes("@")) return (user?.email || "U").slice(0, 2).toUpperCase();
  const parts = n.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function getDisplayName(user) {
  const n = (user?.name || "").trim();
  if (!n || n === user?.email) return user?.email?.split("@")[0] || "User";
  return n;
}

/* ── Sub-components ─────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      padding: "14px 0", borderBottom: "1px solid #f0f2f4",
    }}>
      <Icon size={16} style={{ color: "#9ca3af", marginTop: 3, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: ".72rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontWeight: 600, fontSize: ".97rem", color: "#111", wordBreak: "break-all" }}>
          {value || <span style={{ color: "#c4c4c4", fontWeight: 400 }}>Not set</span>}
        </div>
      </div>
    </div>
  );
}

function FieldInput({ label, icon: Icon, value, onChange, type = "text", as: As, children, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: ".07em", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={13} /> {label}
      </label>
      {As === "select" ? (
        <select
          value={value}
          onChange={onChange}
          style={{
            border: "1.5px solid #d1d5db", borderRadius: 8,
            padding: "10px 14px", fontSize: ".95rem",
            background: "#fff", outline: "none", width: "100%",
            transition: "border-color .2s",
          }}
          onFocus={e => e.target.style.borderColor = "#000"}
          onBlur={e => e.target.style.borderColor = "#d1d5db"}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            border: "1.5px solid #d1d5db", borderRadius: 8,
            padding: "10px 14px", fontSize: ".95rem",
            background: "#fff", outline: "none", width: "100%",
            transition: "border-color .2s",
          }}
          onFocus={e => e.target.style.borderColor = "#000"}
          onBlur={e => e.target.style.borderColor = "#d1d5db"}
        />
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function Profile({ user, setPage, setUser }) {
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk]       = useState(false);

  const [fullName, setFullName] = useState(getDisplayName(user));
  const [phone, setPhone]       = useState(user?.phone || "");
  const [ward, setWard]         = useState(user?.ward  || "");

  const roleColor = ROLE_COLOR[user?.role] || "#555";
  const roleBg    = ROLE_BG[user?.role]    || "#f3f4f6";

  const cancelEdit = () => {
    setFullName(getDisplayName(user));
    setPhone(user?.phone || "");
    setWard(user?.ward  || "");
    setSaveError("");
    setSaveOk(false);
    setEditing(false);
  };

  const saveProfile = async () => {
    if (!fullName.trim()) { setSaveError("Full name cannot be empty."); return; }
    setSaving(true);
    setSaveError("");
    setSaveOk(false);
    try {
      if (supabase) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: fullName.trim(), phone: phone.trim(), ward_zone: ward },
        });
        if (error) throw new Error(error.message);
        // Also try profiles table (silent if RLS blocks)
        await supabase.from("profiles").upsert({
          id: user.id, full_name: fullName.trim(),
          phone: phone.trim() || null, ward_zone: ward || null, role: user.role,
        });
      }
      setUser({ ...user, name: fullName.trim(), phone: phone.trim(), ward });
      setSaveOk(true);
      setEditing(false);
    } catch (err) {
      setSaveError(err.message || "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const backPage = user?.role === "engineer" ? "tasks" : user?.role === "admin" ? "map" : "track";

  return (
    <div style={{ background: "#f4f5f7", minHeight: "calc(100vh - 78px)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* ── Back link ── */}
        <button
          type="button"
          onClick={() => setPage(backPage)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            color: "#555", fontSize: ".9rem", fontWeight: 600,
            background: "none", border: "none", cursor: "pointer",
            marginBottom: 28, padding: 0,
            transition: "color .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#000"}
          onMouseLeave={e => e.currentTarget.style.color = "#555"}
        >
          <ArrowLeft size={17} /> Back
        </button>

        <h1 style={{ fontSize: "2rem", marginBottom: 28, fontFamily: "Georgia, serif" }}>My Profile</h1>

        {/* ── Card ── */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          boxShadow: "0 2px 16px rgba(0,0,0,.06)",
          overflow: "hidden",
        }}>

          {/* ── Top hero banner ── */}
          <div style={{
            background: "linear-gradient(135deg, #0f0f0f 0%, #2d2d2d 100%)",
            padding: "36px 36px 28px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {/* Avatar */}
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: roleBg, color: roleColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", fontWeight: 800, flexShrink: 0,
                  boxShadow: "0 0 0 4px rgba(255,255,255,.15)",
                }}>
                  {getAvatarText(user)}
                </div>
                {/* Name + email */}
                <div>
                  <div style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, marginBottom: 4 }}>
                    {getDisplayName(user)}
                  </div>
                  <div style={{ color: "#a1a1aa", fontSize: ".88rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <Mail size={13} /> {user?.email}
                  </div>
                  {/* Role badge */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    marginTop: 10, background: roleBg, color: roleColor,
                    borderRadius: 20, padding: "3px 12px",
                    fontSize: ".75rem", fontWeight: 700,
                  }}>
                    <ShieldCheck size={12} /> {ROLE_LABEL[user?.role] || "Citizen"} Account
                  </span>
                </div>
              </div>

              {/* Edit / Save / Cancel buttons — always top-right */}
              <div>
                {!editing ? (
                  <button
                    onClick={() => { setSaveOk(false); setSaveError(""); setEditing(true); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "rgba(255,255,255,.12)", color: "#fff",
                      border: "1.5px solid rgba(255,255,255,.3)", borderRadius: 8,
                      padding: "9px 18px", fontWeight: 600, fontSize: ".9rem",
                      cursor: "pointer", transition: "background .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.22)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}
                  >
                    <Pencil size={15} /> Edit Profile
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: "#fff", color: "#000",
                        border: "none", borderRadius: 8,
                        padding: "9px 20px", fontWeight: 700, fontSize: ".9rem",
                        cursor: saving ? "not-allowed" : "pointer",
                        opacity: saving ? .7 : 1,
                      }}
                    >
                      <Check size={15} /> {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: "transparent", color: "#d4d4d8",
                        border: "1.5px solid rgba(255,255,255,.25)", borderRadius: 8,
                        padding: "9px 16px", fontWeight: 600, fontSize: ".9rem",
                        cursor: "pointer",
                      }}
                    >
                      <X size={15} /> Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "28px 36px" }}>

            {/* Feedback banners */}
            {saveOk && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                color: "#15803d", borderRadius: 10,
                padding: "12px 18px", marginBottom: 24, fontSize: ".9rem", fontWeight: 500,
              }}>
                <Check size={16} /> Profile saved successfully!
              </div>
            )}
            {saveError && (
              <div style={{
                background: "#fff0f2", border: "1px solid #fecdd3",
                color: "#be123c", borderRadius: 10,
                padding: "12px 18px", marginBottom: 24, fontSize: ".9rem",
              }}>
                {saveError}
              </div>
            )}

            {!editing ? (
              /* ── VIEW MODE ── */
              <div>
                <InfoRow icon={User}    label="Full Name" value={getDisplayName(user)} />
                <InfoRow icon={Mail}    label="Email"     value={user?.email} />
                <InfoRow icon={Phone}   label="Mobile"    value={user?.phone || phone} />
                <InfoRow icon={MapPin}  label="Ward / Zone" value={user?.ward || ward} />
                <InfoRow icon={IdCard}  label="Account ID"  value={user?.id ? `${user.id}`.slice(0, 24) + "…" : "—"} />
                <div style={{ paddingTop: 6 }}>
                  <InfoRow icon={ShieldCheck} label="Role" value={ROLE_LABEL[user?.role] || "Citizen"} />
                </div>
              </div>
            ) : (
              /* ── EDIT MODE ── */
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <FieldInput
                    label="Full Name" icon={User}
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Your full legal name"
                  />
                </div>
                <FieldInput
                  label="Mobile Number" icon={Phone}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile"
                  type="tel"
                />
                <FieldInput label="Ward / Zone" icon={MapPin} value={ward} onChange={e => setWard(e.target.value)} as="select">
                  <option value="">Select your Ward/Zone</option>
                  <option>North District</option>
                  <option>East Side</option>
                  <option>South Zone</option>
                  <option>West Ward</option>
                  <option>Central District</option>
                </FieldInput>

                {/* Read-only fields shown for context */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".07em" }}>Email (cannot change)</label>
                  <div style={{ border: "1.5px solid #f0f0f0", borderRadius: 8, padding: "10px 14px", background: "#fafafa", color: "#6b7280", fontSize: ".95rem" }}>
                    {user?.email}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: ".78rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".07em" }}>Role (cannot change)</label>
                  <div style={{ border: "1.5px solid #f0f0f0", borderRadius: 8, padding: "10px 14px", background: "#fafafa", color: "#6b7280", fontSize: ".95rem", textTransform: "capitalize" }}>
                    {ROLE_LABEL[user?.role] || "Citizen"}
                  </div>
                </div>
              </div>
            )}

            {/* ── Sign out ── */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #f0f2f4" }}>
              <button
                onClick={() => window.confirm("Are you sure you want to sign out?") && setUser(null)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 9,
                  background: "#fff5f5", color: "#c0152a",
                  border: "1.5px solid #fecaca", borderRadius: 8,
                  padding: "10px 20px", fontWeight: 600, fontSize: ".9rem",
                  cursor: "pointer", transition: "background .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffe4e6"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff5f5"}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
