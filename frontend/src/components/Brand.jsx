import React from "react";
import { Building2 } from "lucide-react";

export default function Brand({ compact = false }) {
  return (
    <button className="brand" onClick={() => window.dispatchEvent(new CustomEvent("route", { detail: "home" }))}>
      <Building2 size={compact ? 23 : 30} strokeWidth={2.4} />
      <span>InfraCare</span>
    </button>
  );
}
