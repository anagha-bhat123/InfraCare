import React from "react";
import { CircleUserRound } from "lucide-react";

export default function Profile({ user }) {
  return (
    <main className="page">
      <h1>Profile</h1>
      <section className="panel profile">
        <CircleUserRound size={48} />
        <h2>{user?.name || "Guest"}</h2>
        <p>Role: {user?.role || "visitor"}</p>
        <button className="outline" onClick={() => alert("Profile saved")}>Save Profile</button>
      </section>
    </main>
  );
}
