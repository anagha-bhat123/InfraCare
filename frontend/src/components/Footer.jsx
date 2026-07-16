import React from "react";

export default function Footer({ setPage }) {
  return (
    <footer className="footer">
      <span>© 2024 InfraCare Road Damage Detection & Reporting System.</span>
      <div>
        <button onClick={() => setPage && setPage("privacy-policy")}>Privacy Policy</button>
        <button onClick={() => setPage && setPage("terms-of-service")}>Terms of Service</button>
        <button onClick={() => setPage && setPage("help-center")}>Help Center</button>
      </div>
    </footer>
  );
}
