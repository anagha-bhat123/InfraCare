import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapPanel({ coords, setCoords, compact = false, heat = false, reports = [] }) {
  const node = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const layerGroup = useRef(null);

  useEffect(() => {
    if (!node.current || map.current) return;
    map.current = L.map(node.current, { zoomControl: false }).setView(coords, compact ? 13 : 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
      attribution: "© OpenStreetMap" 
    }).addTo(map.current);
    
    marker.current = L.marker(coords, { draggable: true }).addTo(map.current);
    layerGroup.current = L.layerGroup().addTo(map.current);
    
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

  useEffect(() => {
    if (!map.current || !layerGroup.current) return;
    layerGroup.current.clearLayers();
    
    if (reports && reports.length > 0) {
      reports.forEach(r => {
        if (r.latitude && r.longitude) {
          if (heat) {
            // Fake heat map effect using circles
            L.circle([r.latitude, r.longitude], {
              color: 'transparent',
              fillColor: r.priority === 'High' ? '#dc2626' : '#f97316',
              fillOpacity: 0.4,
              radius: 350
            }).addTo(layerGroup.current);
          } else {
            L.marker([r.latitude, r.longitude]).addTo(layerGroup.current);
          }
        }
      });
    }
  }, [reports, heat]);

  return <div className={compact ? "map compact" : "map"} ref={node} />;
}
