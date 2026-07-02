import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapPanel({ coords, setCoords, compact = false }) {
  const node = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (!node.current || map.current) return;
    map.current = L.map(node.current, { zoomControl: false }).setView(coords, compact ? 13 : 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
      attribution: "© OpenStreetMap" 
    }).addTo(map.current);
    
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
