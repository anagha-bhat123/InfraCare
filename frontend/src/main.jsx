import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  FileText,
  Gauge,
  ImageUp,
  KeyRound,
  Languages,
  LocateFixed,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Printer,
  Search,
  Shield,
  ShieldCheck,
  SquarePen,
  Trash2,
  Upload,
  Users,
  X
} from "lucide-react";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const reportsSeed = [
  {
    id: "RD-98231",
    title: "Severe Pothole on Main St.",
    detailTitle: "Severe Pothole on Main Street Intersection",
    area: "North District, Sector 4",
    date: "Oct 24, 2023",
    status: "Repair in Progress",
    urgency: "High Priority",
    category: "Pothole Repair",
    department: "Public Works (Div 4)",
    officer: "Sgt. Marcus Thorne",
    coords: [40.7128, -74.006],
    evidence: "https://images.unsplash.com/photo-1694643148030-5250b2f16543?auto=format&fit=crop&w=900&q=80",
    history: [
      ["Repair Crew Dispatched", "Team Alpha has been assigned to the location. Estimated completion: 48 hours.", "Today, 09:15 AM"],
      ["Damage Verified", "On-site inspector confirmed the severity. Escalated to High Priority status.", "Oct 25, 14:30 PM"],
      ["Report Received", "Initial digital report filed by user via InfraCare portal.", "Oct 24, 11:20 AM"]
    ]
  },
  {
    id: "RD-97552",
    title: "Broken Drainage Cover",
    detailTitle: "Broken Drainage Cover",
    area: "Bridge Way, East Side",
    date: "Oct 21, 2023",
    status: "Verified",
    urgency: "Medium",
    category: "Drainage",
    department: "Stormwater Division",
    officer: "Eng. Kavya Rao",
    coords: [40.7282, -73.9942],
    evidence: "https://images.unsplash.com/photo-1604357209793-fca5dca89f97?auto=format&fit=crop&w=900&q=80",
    history: [
      ["Damage Verified", "Inspection accepted and forwarded to drainage unit.", "Oct 22, 10:20 AM"],
      ["Report Received", "Citizen report filed with GPS metadata.", "Oct 21, 16:10 PM"]
    ]
  },
  {
    id: "RD-97001",
    title: "Sunken Pavement",
    detailTitle: "Sunken Pavement near Industrial Zone Rd 2",
    area: "Industrial Zone Rd 2",
    date: "Oct 19, 2023",
    status: "Pending",
    urgency: "Normal",
    category: "Pavement",
    department: "Road Safety Cell",
    officer: "Unassigned",
    coords: [40.705, -73.982],
    evidence: "https://images.unsplash.com/photo-1605027990121-cbae9d9d397f?auto=format&fit=crop&w=900&q=80",
    history: [["Report Received", "Initial digital report filed by user.", "Oct 19, 09:00 AM"]]
  }
];

const assignments = [
  {
    id: "RD-4402",
    state: "Dispatched",
    title: "Critical Pothole - Main St & 4th",
    place: "Sector 7G - Downtown",
    coords: [40.7128, -74.006],
    summary: "Significant road surface degradation reported by multiple citizens. Hazard level: High. Obstruction in primary transit lane.",
    type: "Pothole (Grade A)",
    surface: "High-Density Asphalt",
    crew: "Crew #14-B (Miller)"
  },
  {
    id: "RD-4398",
    state: "In Progress",
    title: "Broken Drainage Grate",
    place: "East River Industrial",
    coords: [40.7282, -73.9942],
    summary: "Metal grate has shifted into vehicle lane. Temporary cones placed.",
    type: "Drainage Cover",
    surface: "Concrete Edge",
    crew: "Crew #12-A (Sharma)"
  },
  {
    id: "RD-4405",
    state: "On-Site",
    title: "Cracked Asphalt Shoulder",
    place: "North Suburban Loop",
    coords: [40.742, -74.014],
    summary: "Longitudinal cracking on shoulder reported after heavy rain.",
    type: "Cracked Asphalt",
    surface: "Asphalt Shoulder",
    crew: "Crew #08-C (Patel)"
  }
];

function Brand({ compact = false }) {
  return (
    <button className="brand" onClick={() => window.dispatchEvent(new CustomEvent("route", { detail: "home" }))}>
      <Building2 size={compact ? 23 : 30} strokeWidth={2.4} />
      <span>InfraCare</span>
    </button>
  );
}

function Header({ page, setPage, user, setUser, simple = false }) {
  const nav = user?.role === "engineer" ? ["tasks", "analytics", "profile"] : ["home", "report", "track", "profile"];
  return (
    <header className="topbar">
      <Brand />
      {simple ? <em>Official Government Portal</em> : (
        <nav>
          {nav.map((item) => (
            <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>
      )}
      <div className="top-actions">
        {!simple && <button className="icon-button" onClick={() => alert("Search panel opened")}><Search /></button>}
        {!simple && <button className="icon-button" onClick={() => alert("No new notifications")}><Bell /></button>}
        {user ? (
          <button className="avatar" onClick={() => setUser(null)} title="Sign out">{user.role.slice(0, 2).toUpperCase()}</button>
        ) : (
          <button className="black small" onClick={() => setPage("login")}>Login <ArrowRight size={18} /></button>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>© 2024 InfraCare Road Damage Detection & Reporting System. Official Government Portal.</span>
      <div><button>Privacy Policy</button><button>Terms of Service</button><button>Help Center</button></div>
    </footer>
  );
}

function Home({ setPage }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Ensuring safe, smooth, and sustainable urban infrastructure</h1>
          <p>Real-time road damage detection powered by AI vision. Join thousands of citizens in building a more resilient city through rapid reporting and transparent maintenance.</p>
          <div className="button-row">
            <button className="black" onClick={() => setPage("report")}>Report Damage Now <CheckCircle2 size={18} /></button>
            <button className="outline" onClick={() => setPage("map")}>View Live Map</button>
          </div>
        </div>
      </section>
      <section className="metrics">
        {[["12,482", "Total Repairs Logged"], ["843", "Active Reports"], ["2.4 Days", "Avg. Repair Time"], ["96%", "Citizen Satisfaction"]].map(([n, l]) => (
          <div key={l}><strong>{n}</strong><span>{l}</span></div>
        ))}
      </section>
      <section className="capabilities">
        <small>Capabilities</small>
        <h2>Next-Gen Municipal Governance</h2>
        <div className="card-grid five">
          {[
            [Eye, "AI Vision Detection", "Automated identification of potholes and cracks using edge computing and camera feeds."],
            [Users, "Community Reporting", "Mobile-first interface for citizens to upload photos and GPS-tagged damage locations."],
            [Gauge, "Insightful Dashboards", "Real-time data visualization for municipal engineers to prioritize critical repairs."],
            [ShieldCheck, "Automated Verification", "Reduces administrative overhead by validating report authenticity using data triangulation."],
            [Clock3, "Maintenance History", "Full audit trail of road maintenance, ensuring long-term accountability and planning."]
          ].map(([Icon, title, text]) => (
            <article className="thin-card" key={title}><Icon className="accent" /><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>
      <section className="process">
        <h2>Capture. Report. Repair.</h2>
        <p>The standard protocol for ensuring rapid response and urban safety.</p>
        <div className="steps">
          {["Identify Issue", "Submit Report", "Monitor Progress"].map((step, i) => (
            <article key={step}><b>{String(i + 1).padStart(2, "0")}</b><h3>{step}</h3><p>{i === 0 ? "Capture high-resolution photos of road damage via the secure mobile portal." : i === 1 ? "Geolocated metadata is automatically appended for precise engineer dispatching." : "Receive real-time updates as the maintenance team verifies and resolves the issue."}</p></article>
          ))}
        </div>
      </section>
      <section className="cta-band">
        <div><h2>Start your civic report today</h2><p>Contribute to the safety of our roads. Every report helps municipal authorities prioritize maintenance where it's needed most.</p></div>
        <button onClick={() => setPage("report")}>Launch Reporting Portal <ArrowRight /></button>
      </section>
    </>
  );
}

function Login({ setUser, setPage }) {
  const [role, setRole] = useState("citizen");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setUser({ role, name: role === "admin" ? "Admin Officer" : role === "engineer" ? "Crew Engineer" : "Citizen User" });
    setPage(role === "engineer" ? "tasks" : role === "admin" ? "map" : "track");
  };
  return (
    <main className="split-auth login-split">
      <section className="auth-visual night">
        <Brand compact />
        <h2>Road Damage Detection & Reporting System</h2>
        <p>Ensuring safe, smooth, and sustainable urban infrastructure through advanced detection and community reporting.</p>
        <span className="portal-pill">Official Government Portal</span>
        <small>© 2024 InfraCare Road Damage Detection & Reporting System.</small>
      </section>
      <form className="auth-panel" onSubmit={submit}>
        <h1>Login</h1>
        <p>Access your dashboard to manage road infrastructure.</p>
        <div className="tabs">
          {["citizen", "engineer", "admin"].map((r) => <button type="button" key={r} className={role === r ? "active" : ""} onClick={() => setRole(r)}>{r[0].toUpperCase() + r.slice(1)}</button>)}
        </div>
        <label>Email or Mobile Number<input required placeholder={role === "engineer" ? "M-000-XXXX" : role === "admin" ? "name@gov.region.dept" : "Enter your email or mobile"} /></label>
        <label>Password <button type="button" className="text-link" onClick={() => alert("Password reset link prepared")}>Forgot Password?</button><span className="input-icon"><input required type={show ? "text" : "password"} defaultValue="password" /><Eye onClick={() => setShow(!show)} /></span></label>
        <label className="checkline"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />Remember Me</label>
        <button className="black wide">Login <ArrowRight /></button>
        <hr />
        <p className="center">Don't have an account? <button type="button" className="text-link strong" onClick={() => setPage("register")}>Register here</button></p>
        <div className="lang"><b>English</b><span>ಕನ್ನಡ</span><span>हिन्दी</span></div>
      </form>
    </main>
  );
}

function Register({ setPage }) {
  const [type, setType] = useState("Citizen");
  const [terms, setTerms] = useState(false);
  return (
    <main className="split-auth register-split">
      <section className="auth-visual road">
        <h1>Road Damage<br />Detection &<br />Reporting</h1>
        <p>Empowering citizens and municipal teams to build safer urban journeys.</p>
        <div className="glass"><ShieldCheck /><b>Official Government Portal</b><span>Secure biometric-ready authentication for municipal personnel and public users.</span></div>
        <div className="auth-stats"><b>12.4k<span>Reports Resolved</span></b><b>48hr<span>Avg. Response Time</span></b></div>
      </section>
      <form className="auth-panel register" onSubmit={(e) => { e.preventDefault(); alert("Account request saved. You can now login."); setPage("login"); }}>
        <h1>Create Account</h1><p>Join the civic movement for better infrastructure.</p>
        <label>Register as:</label>
        <div className="segmented">{["Citizen", "Municipal Worker"].map((v) => <button type="button" className={type === v ? "selected" : ""} onClick={() => setType(v)} key={v}>{v}</button>)}</div>
        <em>Note: Admin & Engineer accounts are managed by Department Heads.</em>
        <label>Full Name<span className="input-icon"><CircleUserRound /><input required placeholder="Enter your full legal name" /></span></label>
        <label>Email Address<span className="input-icon"><Mail /><input required type="email" placeholder="email@example.gov.in" /></span></label>
        <label>Mobile Number<div className="inline-field"><span className="input-icon"><ClipboardCheck /><input required placeholder="+91 00000 00000" /></span><button type="button" onClick={() => alert("OTP sent for demo")}>Get OTP</button></div></label>
        <label>Ward / Zone (Optional)<span className="input-icon"><MapPin /><select><option>Select your Ward/Zone</option><option>North District</option><option>East Side</option></select><ChevronDown /></span></label>
        <label>Create Password<span className="input-icon"><Lock /><input required type="password" defaultValue="password" /><Eye /></span></label>
        <label className="checkline"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />I agree to the Terms of Service and Privacy Policy of the Government Infrastructure Portal.</label>
        <button className="black wide" disabled={!terms}>Register Account <ArrowRight /></button>
        <p className="center">Already have an account? <button type="button" className="text-link strong" onClick={() => setPage("login")}>Login here</button></p>
        <small className="center"><Languages size={16} /> Multi-language support active</small>
      </form>
    </main>
  );
}

function MapPanel({ coords, setCoords, compact = false }) {
  const node = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  useEffect(() => {
    if (!node.current || map.current) return;
    map.current = L.map(node.current, { zoomControl: false }).setView(coords, compact ? 13 : 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map.current);
    marker.current = L.marker(coords, { draggable: true }).addTo(map.current);
    marker.current.on("dragend", () => {
      const p = marker.current.getLatLng();
      setCoords?.([Number(p.lat.toFixed(5)), Number(p.lng.toFixed(5))]);
    });
    map.current.on("click", (e) => setCoords?.([Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5))]));
  }, []);
  useEffect(() => {
    if (!map.current || !marker.current) return;
    marker.current.setLatLng(coords);
    map.current.setView(coords, map.current.getZoom());
  }, [coords]);
  return <div className={compact ? "map compact" : "map"} ref={node} />;
}

function Report({ addReport, setPage }) {
  const [urgency, setUrgency] = useState("Normal");
  const [coords, setCoords] = useState([40.7128, -74.006]);
  const [photo, setPhoto] = useState(null);
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCoords([Number(pos.coords.latitude.toFixed(5)), Number(pos.coords.longitude.toFixed(5))]),
      () => alert("Location permission was not granted. The demo keeps the current coordinates.")
    );
  };
  const onFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto({ name: file.name, url: reader.result, lat: coords[0], lng: coords[1], capturedAt: new Date().toLocaleString() });
    reader.readAsDataURL(file);
  };
  const submit = async (e) => {
    e.preventDefault();
    const newReport = {
      id: `RD-${Math.floor(90000 + Math.random() * 9999)}`,
      title: category || "Road Surface Damage",
      detailTitle: category || "Road Surface Damage",
      area: "GPS Captured Location",
      date: new Date().toLocaleDateString(),
      status: "Pending",
      urgency,
      category,
      coords,
      evidence: photo?.url,
      history: [["Report Received", "Citizen report filed with photo and GPS metadata.", new Date().toLocaleString()]]
    };
    addReport(newReport);
    const apiReport = { title: newReport.title, category, urgency, description: desc, latitude: coords[0], longitude: coords[1], status: "Pending", evidence: photo?.url };
    if (supabase) await supabase.from("damage_reports").insert(apiReport);
    fetch(`${apiUrl}/reports`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(apiReport) }).catch(() => {});
    setSubmitted(true);
  };

  return (
    <main className="page report-page">
      <h1>Report Road Damage</h1>
      <p className="lead">Use this official portal to submit detailed information about infrastructure defects. Your report will be analyzed and prioritized by municipal engineering teams.</p>
      <form className="report-grid" onSubmit={submit}>
        <section className="panel">
          <h2><Camera /> Visual Evidence</h2>
          <div className="dropzone" onClick={() => fileRef.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
            {photo ? <img src={photo.url} alt="Captured damage" /> : <><Upload /><b>Drag and drop site photos or <u>browse files</u></b><span>High-resolution JPEG/PNG up to 10MB per file.</span></>}
            {photo && <span className="geo-stamp">GPS {photo.lat}, {photo.lng} · {photo.capturedAt}</span>}
          </div>
          <input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files[0])} />
          <div className="button-row">
            <button type="button" className="outline" onClick={() => fileRef.current.click()}><Camera size={18} /> Click Picture</button>
            <button type="button" className="outline" onClick={locate}><LocateFixed size={18} /> Attach GPS</button>
          </div>
          <div className="form-row">
            <label>Damage Type<select required value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Select category...</option><option>Pothole</option><option>Cracked Asphalt</option><option>Broken Drainage Cover</option><option>Streetlight Hazard</option></select></label>
            <label>Urgency Level<div className="segmented urgency">{["Normal", "Urgent", "Critical"].map((v) => <button type="button" className={urgency === v ? "selected" : ""} onClick={() => setUrgency(v)} key={v}>{v}</button>)}</div></label>
          </div>
          <label>Detailed Description<textarea required value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Provide specific details about dimensions, exact position in the roadway, and any hazardous conditions..." /></label>
          <aside className="notice"><Shield /><b>Notice of Responsibility</b><p>By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. Intentional false reporting may result in administrative penalties.</p></aside>
          <button className="black submit">Submit Complaint <ArrowRight /></button>
          {submitted && <strong className="success">Report submitted with photo and GPS metadata.</strong>}
        </section>
        <aside className="panel map-panel">
          <h2><MapPin /> GPS Location</h2>
          <div className="searchbox"><Search /><input placeholder="Search address or landmarks..." onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} /></div>
          <MapPanel coords={coords} setCoords={setCoords} />
          <div className="coordbar">Current coordinates <b>{coords[0]}° N, {Math.abs(coords[1])}° W</b><button type="button" onClick={locate}><LocateFixed /></button></div>
          <aside className="info">The system has automatically pinpointed your location using GPS metadata. You can manually adjust the pin for better precision.</aside>
          <section className="panel inner"><h2>Reporting Guidelines</h2>{["Ensure photos clearly show the damage scale.", "Include surrounding landmarks in wide shots.", "Mention if the damage affects lane visibility."].map((t) => <p key={t}><CheckCircle2 /> {t}</p>)}</section>
        </aside>
      </form>
    </main>
  );
}

function Track({ reports }) {
  const [activeId, setActiveId] = useState(reports[0].id);
  const [tab, setTab] = useState("Active");
  const report = reports.find((r) => r.id === activeId) || reports[0];
  return (
    <main className="track-layout">
      <aside className="complaint-list">
        <h1>My Complaints</h1>
        <div className="tabs"><button className={tab === "Active" ? "active" : ""} onClick={() => setTab("Active")}>Active ({reports.length})</button><button className={tab === "Archived" ? "active" : ""} onClick={() => setTab("Archived")}>Archived (12)</button></div>
        {reports.map((r) => <button key={r.id} className={r.id === activeId ? "complaint selected" : "complaint"} onClick={() => setActiveId(r.id)}><span>#{r.id}</span><em>{r.status}</em><b>{r.title}</b><small><MapPin size={14} />{r.area}</small><small>Reported: {r.date}</small></button>)}
      </aside>
      <section className="complaint-detail">
        <div className="detail-head"><div><p>Complaint ID: {report.id} <b className="pill">{report.urgency}</b></p><h1>{report.detailTitle}</h1></div><div><button className="outline" onClick={() => window.print()}><Printer />Print PDF</button><button className="black" onClick={() => alert("Office contacted. A response note was added.")}><Mail />Contact Office</button></div></div>
        <div className="evidence-grid">
          <article><h3>Reported Evidence</h3><img src={report.evidence || reportsSeed[0].evidence} alt="Reported damage" /></article>
          <article><h3>Exact Location <a href={`https://www.google.com/maps?q=${report.coords[0]},${report.coords[1]}`} target="_blank">Google Maps</a></h3><MapPanel compact coords={report.coords} /></article>
        </div>
        <h3>Tracking History</h3>
        <div className="timeline">{report.history.map(([title, text, time], i) => <article key={title} className={i === 0 ? "current" : ""}><i /><div><b>{title}</b><p>{text}</p></div><time>{time}</time></article>)}</div>
        <div className="detail-meta">{[["Category", report.category], ["Urgency", report.urgency], ["Department", report.department || "Pending Assignment"], ["Assigned Officer", report.officer || "Unassigned"]].map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</div>
      </section>
    </main>
  );
}

function LiveMap() {
  const [coords, setCoords] = useState([40.7128, -74.006]);
  const [popup, setPopup] = useState(true);
  const [heat, setHeat] = useState(true);
  return (
    <main className="map-screen">
      <aside className="map-controls">
        <h2>Map Controls</h2><p>Filter infrastructure data by region and type.</p>
        <label>Jurisdiction<select><option>Metropolitan Area - Sector A</option></select></label>
        <label>Report Period<input type="date" defaultValue="2023-10-01" /></label>
        <label><input type="date" defaultValue="2023-12-31" /></label>
        <label>Damage Severity</label>
        {["Critical (Immediate Repair)", "Moderate (Scheduled)", "Minor (Monitoring)"].map((t, i) => <label className="checkline" key={t}><input type="checkbox" defaultChecked={i < 2} />{t}</label>)}
        <label>Visualization</label>
        <button className={heat ? "black selected-control" : "outline"} onClick={() => setHeat(true)}>Heatmap View <CheckCircle2 /></button>
        <button className={!heat ? "black selected-control" : "outline"} onClick={() => setHeat(false)}>Clustered Markers</button>
        <div className="scale"><h3>Intensity Scale</h3><span /><small>Low <b>High</b></small><p><i /> Structural Failure</p><p><i className="orange" /> Severe Pothole</p></div>
        <button className="black wide" onClick={() => alert("Map report generated and queued for download.")}>Generate Map Report <ArrowRight /></button>
      </aside>
      <section className="live-map-area">
        <MapPanel coords={coords} setCoords={setCoords} />
        <div className="map-search"><input placeholder="Search GPS coordinates..." onChange={(e) => { if (e.target.value.includes(",")) { const [lat, lng] = e.target.value.split(",").map(Number); if (!Number.isNaN(lat) && !Number.isNaN(lng)) setCoords([lat, lng]); } }} /><button><Search /></button><button onClick={() => navigator.geolocation?.getCurrentPosition((p) => setCoords([p.coords.latitude, p.coords.longitude]))}><LocateFixed /></button></div>
        {popup && <article className="map-popup"><header><span>Report #8842-X</span><b>Major Pothole Detected</b><button onClick={() => setPopup(false)}><X /></button></header><div><img src={reportsSeed[0].evidence} /><p><b>Location</b>{coords[0].toFixed(4)}° N, {Math.abs(coords[1]).toFixed(4)}° W<br />Lincoln Blvd & 5th Ave</p></div><footer><span><small>Priority</small><b className="red">High Severity</b></span><span><small>Reported On</small>Dec 14, 2023</span><button className="black" onClick={() => alert("Team dispatched")}>Dispatch Team</button><button onClick={() => alert("CSV downloaded for demo")}>Download Data</button></footer></article>}
      </section>
    </main>
  );
}

function AdminAnalysis() {
  const [severity, setSeverity] = useState("Medium");
  return (
    <main className="page analysis">
      <p className="crumb">Reports › Case #RD-92841</p><div className="analysis-head"><div><h1>AI Verification Analysis</h1><p className="lead">Confirm automated detection results for pothole reporting on 5th Avenue. Ensure bounding boxes and classification align with municipal standards.</p></div><div><button className="outline" onClick={() => alert("Flagged for manual review")}>Flag for Review</button><button className="black" onClick={() => alert("Report confirmed")}>Confirm Report <ArrowRight /></button></div></div>
      <section className="analysis-grid">
        <article className="panel"><h2>Uploaded Evidence <Camera /></h2><img src={reportsSeed[0].evidence} /></article>
        <article className="panel ai-view"><h2>AI Analysis View <Gauge /></h2><img src={reportsSeed[0].evidence} /><div className="box-label">POTHOLE: 98%</div><div className="bbox" /></article>
        <aside className="panel"><h2>Detection Metadata</h2><label>AI Classification<div className="meta-input"><b>Pothole</b><span>98% Confidence</span></div></label><label>Suggested Severity<div className="segmented">{["Low", "Medium", "High"].map((v) => <button className={severity === v ? "selected" : ""} onClick={() => setSeverity(v)} key={v}>{v}</button>)}</div></label><em>Calculated based on estimated depth of 4.2cm and area of 0.85m²</em><label>Detection Model<input value="rddr_v4.2_resnet50_optimized" readOnly /></label><div className="black-panel"><h2>Admin Override</h2><p>Manually adjust classification if the AI model has misidentified the damage type or severity.</p><button onClick={() => alert("Classification editor opened")}><SquarePen />Change Classification</button><button onClick={() => alert("Report discarded for demo")}><Trash2 />Discard Report</button></div></aside>
      </section>
      <div className="card-grid three">{[[MapPin, "Location Data", "38.8951° N, 77.0364° W\n5th Avenue, Sector 4C"], [Clock3, "Report Timeline", "Submitted: 14:22 Oct 24\nProcessed: 14:24 Oct 24"], [ShieldCheck, "Citizen Reporter", "UID: 8219-X\nTrust Rating: 4.8/5.0"]].map(([Icon, h, t]) => <article className="thin-card" key={h}><Icon /><h3>{h}</h3><p>{t}</p></article>)}</div>
    </main>
  );
}

function EngineerLogin({ setUser, setPage }) {
  const [shift, setShift] = useState(false);
  return (
    <main className="maintenance-login">
      <Header simple />
      <section className="maintenance-wrap">
        <div><article className="maintenance-hero"><h1>Civic Infrastructure<br />Protocol</h1><p>Ensuring operational excellence through rigorous road maintenance and rapid response protocols.</p></article><div className="card-grid three mini">{[[Shield, "Authorized", "Personnel Only"], [Clock3, "Real-time", "Data Syncing"], [Users, "Priority", "Maintenance Tracking"]].map(([Icon, h, t]) => <article className="thin-card" key={h}><Icon /><h3>{h}</h3><p>{t}</p></article>)}</div></div>
        <form className="panel maintenance-card" onSubmit={(e) => { e.preventDefault(); setUser({ role: "engineer", name: "Crew Engineer" }); setPage("tasks"); }}><h1>Maintenance Login</h1><p>Access the InfraCare secure reporting and task management dashboard.</p><label>Crew ID<span className="input-icon"><BriefcaseBusiness /><input required placeholder="M-000-XXXX" /></span></label><label>Password <button type="button" className="text-link">Forgot Access?</button><span className="input-icon"><KeyRound /><input required type="password" defaultValue="password" /></span></label><label className="switchline"><span><b>Shift Start</b>Mark as active on login.</span><input type="checkbox" checked={shift} onChange={(e) => setShift(e.target.checked)} /></label><button className="black wide">Authenticate System Access <ArrowRight /></button><small><i /> System Status: Operational / Secure Connection</small></form>
      </section>
    </main>
  );
}

function Tasks() {
  const [activeId, setActiveId] = useState(assignments[0].id);
  const [logs, setLogs] = useState(["Crew assigned. Awaiting first field update."]);
  const task = assignments.find((a) => a.id === activeId);
  return (
    <main className="task-layout">
      <aside className="assignment-list"><h2>Active Assignments</h2><p>3 Tasks Currently Dispatched</p>{assignments.map((a) => <button className={a.id === activeId ? "selected assignment" : "assignment"} onClick={() => setActiveId(a.id)} key={a.id}><em>{a.state}</em><span>#{a.id}</span><b>{a.title}</b><small><MapPin />{a.place}</small></button>)}</aside>
      <section className="task-detail"><div className="detail-head"><div><p>Task Details / <b>#{task.id}</b></p><h1>{task.title.replace("Critical Pothole - ", "")}</h1><p>{task.summary}</p></div><button className="black" onClick={() => window.open(`https://www.google.com/maps?q=${task.coords[0]},${task.coords[1]}`, "_blank")}>Navigate <Navigation /></button></div><div className="task-grid"><article className="panel"><h3>GPS Coordinates <b>{task.coords[0]}° N, {Math.abs(task.coords[1])}° W</b></h3><MapPanel compact coords={task.coords} /></article><article className="panel"><h3>Reported Visual Evidence</h3><div className="photo-pair"><img src={reportsSeed[0].evidence} /><img src="https://images.unsplash.com/photo-1617195920950-1145bf9a9c20?auto=format&fit=crop&w=700&q=80" /></div><button className="outline wide" onClick={() => alert("Photo gallery opened")}>View All 4 Photos</button></article></div><div className="detail-meta">{[["Type", task.type], ["Surface", task.surface], ["Assigned To", task.crew]].map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</div><section className="panel log"><h2>Activity Log & Updates</h2><button className="black" onClick={() => setLogs([`Update logged at ${new Date().toLocaleTimeString()}`, ...logs])}>Log Activity +</button>{logs.map((l) => <p key={l}>{l}</p>)}</section></section>
    </main>
  );
}

function Profile({ user }) {
  return <main className="page"><h1>Profile</h1><section className="panel profile"><CircleUserRound size={48} /><h2>{user?.name || "Guest"}</h2><p>Role: {user?.role || "visitor"}</p><button className="outline" onClick={() => alert("Profile saved")}>Save Profile</button></section></main>;
}

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState(reportsSeed);
  useEffect(() => {
    const handler = (event) => setPage(event.detail);
    window.addEventListener("route", handler);
    return () => window.removeEventListener("route", handler);
  }, []);
  const view = useMemo(() => {
    if (page === "login") return <Login setUser={setUser} setPage={setPage} />;
    if (page === "register") return <Register setPage={setPage} />;
    if (page === "engineer-login") return <EngineerLogin setUser={setUser} setPage={setPage} />;
    if (page === "report") return <Report addReport={(r) => setReports([r, ...reports])} setPage={setPage} />;
    if (page === "track") return <Track reports={reports} />;
    if (page === "map") return <LiveMap />;
    if (page === "analysis") return <AdminAnalysis />;
    if (page === "tasks") return <Tasks />;
    if (page === "profile") return <Profile user={user} />;
    return <Home setPage={setPage} />;
  }, [page, user, reports]);
  const hideChrome = ["login", "register", "engineer-login"].includes(page);
  return (
    <>
      {!hideChrome && <Header page={page} setPage={setPage} user={user} setUser={setUser} />}
      {view}
      {!hideChrome && <Footer />}
      <div className="quick-links"><button onClick={() => setPage("analysis")}>Admin AI</button><button onClick={() => setPage("engineer-login")}>Engineer Login</button></div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
