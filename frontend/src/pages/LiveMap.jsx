import React, { useState } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft, Search, LocateFixed, X } from "lucide-react";
import MapPanel from "../components/MapPanel";
import { reportsSeed } from "../data/seedData";

export default function LiveMap({ reports = [], setPage }) {
  const [coords, setCoords] = useState([13.3409, 74.7421]);
  const [popup, setPopup] = useState(true);
  const [heat, setHeat] = useState(true);

  return (
    <main className="map-screen">
      <aside className="map-controls">
        <button
          type="button"
          className="text-link"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12, fontWeight: 600 }}
          onClick={() => setPage("home")}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
        <h2>Map Controls</h2>
        <p>Filter infrastructure data by region and type.</p>
        <label>
          Jurisdiction
          <select onChange={(e) => {
            if (e.target.value === "udupi") setCoords([13.3409, 74.7421]);
            else if (e.target.value === "mangalore") setCoords([12.9141, 74.8560]);
            else if (e.target.value === "manipal") setCoords([13.3525, 74.7865]);
            else if (e.target.value === "surathkal") setCoords([13.0108, 74.7943]);
          }}>
            <option value="udupi">Udupi Region (Central)</option>
            <option value="mangalore">Mangalore City Corporation</option>
            <option value="manipal">Manipal, Udupi</option>
            <option value="surathkal">Surathkal, Mangalore</option>
          </select>
        </label>
        <label>Report Period<input type="date" defaultValue="2023-10-01" /></label>
        <label><input type="date" defaultValue="2023-12-31" /></label>
        <label>Damage Severity</label>
        {["Critical (Immediate Repair)", "Moderate (Scheduled)", "Minor (Monitoring)"].map((t, i) => (
          <label className="checkline" key={t}>
            <input type="checkbox" defaultChecked={i < 2} />
            {t}
          </label>
        ))}
        <label>Visualization</label>
        <button className={heat ? "black selected-control" : "outline"} onClick={() => setHeat(true)}>
          Heatmap View <CheckCircle2 />
        </button>
        <button className={!heat ? "black selected-control" : "outline"} onClick={() => setHeat(false)}>
          Clustered Markers
        </button>
        <div className="scale">
          <h3>Intensity Scale</h3>
          <span />
          <small>Low <b>High</b></small>
          <p><i /> Structural Failure</p>
          <p><i className="orange" /> Severe Pothole</p>
        </div>
        <button className="black wide" onClick={() => alert("Map report generated and queued for download.")}>
          Generate Map Report <ArrowRight />
        </button>
      </aside>
      <section className="live-map-area">
        <MapPanel coords={coords} setCoords={setCoords} heat={heat} reports={reports} />
        <div className="map-search">
          <input 
            placeholder="Search GPS coordinates..." 
            onChange={(e) => { 
              if (e.target.value.includes(",")) { 
                const [lat, lng] = e.target.value.split(",").map(Number); 
                if (!Number.isNaN(lat) && !Number.isNaN(lng)) setCoords([lat, lng]); 
              } 
            }} 
          />
          <button><Search /></button>
          <button onClick={() => navigator.geolocation?.getCurrentPosition((p) => setCoords([p.coords.latitude, p.coords.longitude]))}>
            <LocateFixed />
          </button>
        </div>
        {popup && (
          <article className="map-popup">
            <header>
              <span>Report #8842-X</span>
              <b>Major Pothole Detected</b>
              <button onClick={() => setPopup(false)}><X /></button>
            </header>
            <div>
              <img src={reportsSeed[0].evidence} alt="Evidence preview" />
              <p><b>Location</b> {coords[0].toFixed(4)}° N, {coords[1] >= 0 ? coords[1].toFixed(4) + "° E" : Math.abs(coords[1]).toFixed(4) + "° W"}<br />Manipal Main Rd, Udupi</p>
            </div>
            <footer>
              <span><small>Priority</small><b className="red">High Severity</b></span>
              <span><small>Reported On</small>Dec 14, 2023</span>
              <button className="black" onClick={() => alert("Team dispatched")}>Dispatch Team</button>
              <button onClick={() => alert("CSV downloaded for demo")}>Download Data</button>
            </footer>
          </article>
        )}
      </section>
    </main>
  );
}
