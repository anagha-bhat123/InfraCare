import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  LocateFixed,
  ArrowRight,
  ArrowLeft,
  Search,
  Shield,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Trash2
} from "lucide-react";
import MapPanel from "../components/MapPanel";
import { supabase } from "../services/supabase";
import { apiUrl } from "../services/api";
import Swal from "sweetalert2";
import { ALL_UDUPI_WARDS } from "../utils/wards";

export default function Report({ addReport, setPage }) {
  const [urgency, setUrgency] = useState("Normal");
  const [coords, setCoords] = useState([13.3409, 74.7421]);
  const [photo, setPhoto] = useState(null);
  const [category, setCategory] = useState("");
  const [ward, setWard] = useState("");
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setCoords([Number(pos.coords.latitude.toFixed(5)), Number(pos.coords.longitude.toFixed(5))]);
        setLocationVerified(true);
      },
      () => console.log("Location permission was not granted or failed. Using default coordinates.")
    );
  };

  React.useEffect(() => {
    locate();
  }, []);

  const onFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: 'warning',
        title: 'Image Required',
        text: 'Please select a valid image file (JPEG, PNG, WEBP).'
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setPhoto({
        file,
        name: file.name,
        url: reader.result,
        lat: coords[0],
        lng: coords[1],
        capturedAt: new Date().toLocaleString()
      });
    reader.readAsDataURL(file);
  };

  const clearForm = () => {
    setCategory("");
    setWard("");
    setDesc("");
    setPhoto(null);
    setUrgency("Normal");
    setLocationVerified(false);
    setCoords([13.3409, 74.7421]);
    setSubmitted(false);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!locationVerified) {
      Swal.fire({
        icon: 'warning',
        title: 'Location Required',
        text: 'Please verify your GPS location by clicking the Locate button or adjusting the map pin.'
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Submit Complaint?',
      text: 'Are you sure you want to submit this road damage report?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    const newReport = {
      title: category || "Road Surface Damage",
      category,
      ward_zone: ward,
      urgency,
      description: desc,
      latitude: coords[0],
      longitude: coords[1],
      status: "Pending",
      evidence: photo?.url,
      evidenceFile: photo?.file,
      capturedAt: photo?.capturedAt
    };

    addReport(newReport);

    clearForm();
    await Swal.fire('Submitted!', 'Your complaint has been successfully submitted and sent to the Admin Command Portal.', 'success');
    if (setPage) setPage("track");
  };

  return (
    <main className="page report-page">
      <h1>Report Road Damage</h1>
      <p className="lead">Use this official portal to submit detailed information about infrastructure defects. Your report will be analyzed and prioritized by municipal engineering teams.</p>
      <form className="report-grid" onSubmit={submit}>
        <section className="panel">
          <h2> Visual Evidence <Camera size={20} /></h2>

          {/* Hidden Inputs: 1 for Camera (capture="environment") and 1 for Gallery/File Upload */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFile(e.target.files[0]);
              }
              e.target.value = "";
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onFile(e.target.files[0]);
              }
              e.target.value = "";
            }}
          />

          <div
            className="dropzone evidence-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                onFile(e.dataTransfer.files[0]);
              }
            }}
          >
            {photo ? (
              <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={photo.url} alt="Captured damage" style={{ width: "100%", maxHeight: "320px", objectFit: "cover" }} />
                <span className="geo-stamp">GPS {photo.lat}, {photo.lng} · {photo.capturedAt}</span>
              </div>
            ) : (
              <div className="dropzone-content" style={{ padding: "26px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
                <div style={{ display: "flex", gap: "12px", color: "#64748b", marginBottom: "2px" }}>
                  <div style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "10px", borderRadius: "50%" }}>
                    <Camera size={26} color="#0f172a" />
                  </div>
                  <div style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "10px", borderRadius: "50%" }}>
                    <Upload size={26} color="#0f172a" />
                  </div>
                </div>

                <b style={{ fontSize: "1.05rem", color: "#0f172a" }}>Attach Photographic Proof</b>
                <span style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "380px" }}>
                  Take a live photo on site or choose an existing photo/file from your device.
                </span>

                {/* Prominent Action Buttons for Mobile & Desktop */}
                <div className="evidence-btn-group" style={{ display: "flex", gap: "12px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "420px" }}>
                  <button
                    type="button"
                    className="evidence-btn camera-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
                      flex: "1 1 180px",
                      minHeight: "44px"
                    }}
                  >
                    <Camera size={19} />
                    Take Live Photo
                  </button>

                  <button
                    type="button"
                    className="evidence-btn upload-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      background: "#ffffff",
                      color: "#0f172a",
                      border: "1.5px solid #0f172a",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      flex: "1 1 180px",
                      minHeight: "44px"
                    }}
                  >
                    <Upload size={19} />
                    Upload Files / Gallery
                  </button>
                </div>

                <small style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "4px" }}>
                  Desktop users can also drag & drop photos here · JPEG/PNG up to 10MB
                </small>
              </div>
            )}
          </div>

          {/* Action bar if photo is present */}
          {photo && (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "22px", marginTop: "-10px" }}>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  color: "#0f172a",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <Camera size={16} /> Retake Photo
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  color: "#0f172a",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <Upload size={16} /> Change File / Gallery
              </button>
              <button
                type="button"
                onClick={() => setPhoto(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  color: "#e11d48",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <Trash2 size={16} /> Remove Photo
              </button>
            </div>
          )}

          <div className="form-row">
            <label>
              Complaint Category <span style={{ color: "#c0152a" }}>*</span>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!photo}
                style={{ opacity: !photo ? 0.6 : 1, cursor: !photo ? "not-allowed" : "pointer" }}
              >
                <option value="">Select category...</option>
                <optgroup label="Road & Infrastructure (PWD)">
                  <option value="Road Pothole">Potholes</option>
                  <option value="Road cracks">Road cracks</option>
                  <option value="Damaged roads">Damaged roads</option>
                  <option value="Other road-related issues">Other road-related issues</option>
                </optgroup>
                <optgroup label="Water Supply (PWD)">
                  <option value="Water leakage">Water leakage</option>
                  <option value="Broken pipelines">Broken pipelines</option>
                  <option value="Water supply interruption">Water supply interruption</option>
                  <option value="Damaged water infrastructure">Damaged water infrastructure</option>
                  <option value="Other water-supply complaints">Other water-supply complaints</option>
                </optgroup>
                <optgroup label="Waste Management (PWD)">
                  <option value="Garbage accumulation">Garbage accumulation</option>
                  <option value="Improper waste disposal">Improper waste disposal</option>
                  <option value="Overflowing garbage bins">Overflowing garbage bins</option>
                  <option value="Uncollected waste">Uncollected waste</option>
                  <option value="Other waste-management complaints">Other waste-management complaints</option>
                </optgroup>
                <optgroup label="Electricity (MESCOM)">
                  <option value="Streetlight Hazard & Outage">Streetlight Hazard & Outage</option>
                  <option value="Electrical Grid Pole & Cable">Electrical Grid Pole & Cable</option>
                </optgroup>
              </select>
              {!photo && <small style={{ color: "#c0152a", marginTop: "4px", fontSize: "0.75rem", fontWeight: "600", display: "block" }}>Please upload an image first to select a category.</small>}
              {category && (
                <div style={{ fontSize: "0.78rem", fontWeight: 800, marginTop: 4, color: category.toLowerCase().includes("light") || category.toLowerCase().includes("electric") ? "#d97706" : "#2563eb" }}>
                  📍 Assigned Department: {category.toLowerCase().includes("light") || category.toLowerCase().includes("electric") ? "MESCOM (Electricity Supply Board)" : "PWD (Public Works Department)"}
                </div>
              )}
            </label>
            <label>
              Ward / Zone <span style={{ color: "#c0152a" }}>*</span>
              <select required value={ward} onChange={(e) => setWard(e.target.value)}>
                <option value="">Select your Ward/Zone</option>
                {ALL_UDUPI_WARDS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </label>
            <label>
              Urgency Level <span style={{ color: "#c0152a" }}>*</span>
              <div className="segmented urgency">
                {["Normal", "Urgent", "Critical"].map((v) => (
                  <button type="button" className={urgency === v ? "selected" : ""} onClick={() => setUrgency(v)} key={v}>{v}</button>
                ))}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>
                Timeline: {urgency === "Critical" ? "⚡ 3 Days (Critical)" : urgency === "Urgent" ? "⚡ 5 Days (Urgent)" : "⏱️ 1 Week (7 Days)"}
              </div>
            </label>
          </div>
          <label>
            Detailed Description <span style={{ color: "#c0152a" }}>*</span>
            <textarea
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Provide specific details about dimensions, exact position in the roadway, and any hazardous conditions..."
            />
          </label>
          <aside className="notice">
            <Shield />
            <b>Notice of Responsibility</b>
            <p>By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. Intentional false reporting of infrastructure hazards may result in administrative penalties as per Section 42-C of the Civic Infrastructure Protocol.</p>
          </aside>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <button className="black submit" >SUBMIT COMPLAINT <ArrowRight /></button>
            {submitted && (
              <button
                type="button"
                onClick={clearForm}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  color: "#475569",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  width: "100%",
                  justifyContent: "center",
                  maxWidth: "320px"
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#1e293b"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#475569"; }}
              >
                <RefreshCw size={16} /> Clear Form Fields
              </button>
            )}
          </div>
        </section>

        <aside className="panel map-panel">
          <h2>GPS Location <MapPin /></h2>
          <div className="searchbox">
            <Search />
            <input placeholder="Search address or landmarks..." onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
          </div>
          <MapPanel coords={coords} setCoords={(c) => { setCoords(c); setLocationVerified(true); }} />
          <div className="coordbar">
            Current coordinates <b>{coords[0]}° N, {coords[1] >= 0 ? coords[1] + "° E" : Math.abs(coords[1]) + "° W"}</b>
            <button type="button" onClick={locate}><LocateFixed /></button>
          </div>
          <aside className="info">The system has automatically pinpointed your location using GPS metadata. You can manually adjust the pin for better precision.</aside>
          <section className="panel inner">
            <h2>Reporting Guidelines</h2>
            {["Ensure photos clearly show the damage scale.", "Include surrounding landmarks in wide shots.", "Mention if the damage affects lane visibility."].map((t) => (
              <p key={t}><CheckCircle2 /> {t}</p>
            ))}
          </section>
        </aside>
      </form>
    </main>
  );
}
