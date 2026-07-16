import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <span>© 2024 InfraCare Road Damage Detection & Reporting System.</span>
      <div>
        <button onClick={() => alert("Privacy Policy")}>Privacy Policy</button>
        <button onClick={() => alert("Terms of Service")}>Terms of Service</button>
        <button onClick={() => alert("Help Center")}>Help Center</button>
      </div>
    </footer>
  );
}
