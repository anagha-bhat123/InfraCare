import React, { useState } from "react";
import { User, Bell, History, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "../services/supabase";

function getDisplayName(user) {
  const n = (user?.name || "").trim();
  if (!n || n === user?.email) return user?.email?.split("@")[0] || "User";
  return n;
}

function InputField({ label, value, onChange, readOnly, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#333", letterSpacing: 0.5 }}>{label}</label>
      <input
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{
          padding: "14px 16px", borderRadius: 2, border: "1px solid #e0e0e0",
          background: readOnly ? "#f5f5f5" : "#f9f9f9",
          fontSize: "0.95rem", color: "#333", outline: "none",
          width: "100%", boxSizing: "border-box"
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#333", letterSpacing: 0.5 }}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        style={{
          padding: "14px 16px", borderRadius: 2, border: "1px solid #e0e0e0",
          background: "#f9f9f9", fontSize: "0.95rem", color: "#333", outline: "none",
          width: "100%", boxSizing: "border-box"
        }}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function InfoBox({ icon, label, value, isBadge }) {
  return (
    <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: 4, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ color: "#333" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111", marginBottom: 6, letterSpacing: 0.5 }}>{label}</div>
        {isBadge ? (
          <div style={{ display: "inline-block", background: "#000", color: "#fff", padding: "4px 8px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, borderRadius: 2 }}>
            {value}
          </div>
        ) : (
          <div style={{ fontSize: "0.95rem", color: "#444" }}>{value}</div>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 46, height: 24, borderRadius: 12,
        background: checked ? "#000" : "#d1d5db",
        position: "relative", cursor: "pointer", transition: "all 0.2s",
        flexShrink: 0
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 2, left: checked ? 24 : 2,
        transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
      }} />
    </div>
  );
}

function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <div>
        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: "0.85rem", color: "#666" }}>{desc}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function Profile({ user, setPage, setUser }) {
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [ward, setWard] = useState(user?.ward || "");
  const [zone, setZone] = useState(user?.zone || "");

  const [emailAlerts, setEmailAlerts] = useState(user?.emailAlerts ?? true);
  const [smsNotifs, setSmsNotifs] = useState(user?.smsNotifs ?? false);
  const [hazardAlerts, setHazardAlerts] = useState(user?.hazardAlerts ?? true);
  const [repairCompletion, setRepairCompletion] = useState(user?.repairCompletion ?? true);

  const roleName = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Citizen";
  const avatarUrl = user?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80";

  const discardChanges = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setWard(user?.ward || "");
    setZone(user?.zone || "");
    setEmailAlerts(user?.emailAlerts ?? true);
    setSmsNotifs(user?.smsNotifs ?? false);
    setHazardAlerts(user?.hazardAlerts ?? true);
    setRepairCompletion(user?.repairCompletion ?? true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      if (supabase) {
        await supabase.auth.updateUser({
          data: { full_name: fullName.trim(), phone: phone.trim(), ward_zone: ward },
        });
        await supabase.from("profiles").upsert({
          id: user.id, full_name: fullName.trim(),
          phone: phone.trim() || null, ward_zone: ward || null, role: user.role,
        });
      }
      setUser({ 
        ...user, 
        name: fullName.trim(), 
        email: email.trim(),
        phone: phone.trim(), 
        ward,
        zone,
        emailAlerts,
        smsNotifs,
        hazardAlerts,
        repairCompletion
      });
      alert("Changes saved successfully!");
    } catch (err) {
      alert(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ width: "100%" }}>

        {/* Banner */}
        <div style={{
          background: "#000", color: "#fff", borderRadius: 4,
          padding: "48px 40px", display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 24
        }}>
          <div>
            <h1 style={{ fontFamily: "serif", fontSize: "2.4rem", marginBottom: 12 }}>{roleName} Profile</h1>
            <p style={{ color: "#aaa", fontSize: "0.95rem" }}>Manage your municipal identity and alert preferences.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={avatarUrl} alt="Avatar" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: "0.75rem", color: "#aaa", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>
                Verified {roleName}
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, fontFamily: "serif" }}>
                {getDisplayName(user)}
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>

          {/* Column 1: Personal Information */}
          <div style={{ border: "1px solid #e0e0e0", borderRadius: 4, padding: "32px", background: "#fff" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 600, fontFamily: "serif", display: "flex", alignItems: "center", gap: 12, marginBottom: 32, color: "#111" }}>
              <User size={22} /> Personal Information
            </h2>

            <div style={{ display: "grid", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your name" />
                <InputField label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your phone number" />
              </div>

              <InputField label="Email Address" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <SelectField
                  label="Ward / District"
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  options={["Ward 04 - Central Business", "Ward 05 - North District", "Ward 02 - East Side"]}
                  placeholder="Select Ward / District"
                />
                <InputField label="Zone Designation" value={zone} onChange={e => setZone(e.target.value)} placeholder="e.g. Zone B-R2" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32 }}>
              <InfoBox icon={<History size={20} />} label="Last Update" value="October 24, 2024" />
              <InfoBox icon={<ShieldCheck size={20} />} label="Identity Status" value="VERIFIED" isBadge />
            </div>
          </div>

          {/* Column 2: Notifications */}
          <div style={{ border: "1px solid #e0e0e0", borderRadius: 4, padding: "32px", background: "#fff" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 600, fontFamily: "serif", display: "flex", alignItems: "center", gap: 12, marginBottom: 16, color: "#111" }}>
              <Bell size={22} /> Notification Settings
            </h2>
            <p style={{ color: "#555", fontSize: "0.95rem", marginBottom: 40, lineHeight: 1.6 }}>
              Manage how and when you receive updates regarding municipal services and infrastructure status.
            </p>

            <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1, color: "#555", marginBottom: 16 }}>STATUS UPDATES</div>
            <ToggleRow
              title="Email Alerts"
              desc="Receive deep-dive report progress"
              checked={emailAlerts} onChange={setEmailAlerts}
            />
            <ToggleRow
              title="SMS Notifications"
              desc="Instant updates on your mobile"
              checked={smsNotifs} onChange={setSmsNotifs}
            />

            <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "32px 0" }} />

            <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: 1, color: "#555", marginBottom: 16 }}>EMERGENCY & REPAIRS</div>
            <ToggleRow
              title="Hazard Alerts"
              desc="Immediate notice for public risks"
              checked={hazardAlerts} onChange={setHazardAlerts}
            />
            <ToggleRow
              title="Repair Completion"
              desc="Notified when work in your zone is finished"
              checked={repairCompletion} onChange={setRepairCompletion}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <button
            onClick={() => window.confirm("Are you sure you want to sign out?") && setUser(null)}
            style={{ color: "#d32f2f", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: "0.95rem" }}
          >
            Sign Out
          </button>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <button 
              onClick={discardChanges}
              style={{ background: "none", border: "none", fontWeight: 600, color: "#555", cursor: "pointer", fontSize: "0.95rem" }}
            >
              Discard Changes
            </button>
            <button
              onClick={saveProfile}
              disabled={saving}
              style={{
                background: "#000", color: "#fff", padding: "12px 24px", borderRadius: 4,
                fontWeight: 600, display: "flex", gap: 10, alignItems: "center", cursor: "pointer",
                border: "none", fontSize: "0.95rem"
              }}
            >
              {saving ? "Saving..." : "Save Changes"} <ArrowRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
