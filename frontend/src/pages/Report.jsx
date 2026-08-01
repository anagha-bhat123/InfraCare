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
  RefreshCw
} from "lucide-react";
import MapPanel from "../components/MapPanel";
import { supabase } from "../services/supabase";
import { apiUrl } from "../services/api";
import Swal from "sweetalert2";

export default function Report({ addReport, setPage }) {
  const [urgency, setUrgency] = useState("Normal");
  const [coords, setCoords] = useState([40.7128, -74.006]);
  const [photo, setPhoto] = useState(null);
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const fileRef = useRef(null);

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
    setDesc("");
    setPhoto(null);
    setUrgency("Normal");
    setLocationVerified(false);
    setCoords([40.7128, -74.006]);
    setSubmitted(false);
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
          <h2> Visual Evidence<Camera /></h2>
          <div 
            className="dropzone" 
            onClick={() => fileRef.current.click()} 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
          >
            {photo ? (
              <img src={photo.url} alt="Captured damage" />
            ) : (
              <>
                <Upload />
                <b>Drag and drop site photos or <u>browse files</u></b>
                <span>High-resolution JPEG/PNG up to 10MB per file.</span>
              </>
            )}
            {photo && <span className="geo-stamp">GPS {photo.lat}, {photo.lng} · {photo.capturedAt}</span>}
          </div>
          <input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files[0])} />

          <div className="form-row">
            <label>
              Damage Type <span style={{ color: "#c0152a" }}>*</span>
              <select required value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select category...</option>
                <option>Pothole</option>
                <option>Cracked Asphalt</option>
                <option>Broken Drainage Cover</option>
                <option>Streetlight Hazard</option>
              </select>
            </label>
            <label>
              Urgency Level <span style={{ color: "#c0152a" }}>*</span>
              <div className="segmented urgency">
                {["Normal", "Urgent", "Critical"].map((v) => (
                  <button type="button" className={urgency === v ? "selected" : ""} onClick={() => setUrgency(v)} key={v}>{v}</button>
                ))}
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
            Current coordinates <b>{coords[0]}° N, {Math.abs(coords[1])}° W</b>
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
