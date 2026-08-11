export const reportsSeed = [
  {
    id: "RD-98231",
    title: "Severe Pothole on Manipal Main Rd",
    detailTitle: "Severe Pothole near Manipal Main Road Junction",
    area: "Manipal, Udupi",
    date: "Oct 24, 2023",
    status: "Repair in Progress",
    urgency: "High Priority",
    category: "Pothole Repair",
    department: "Udupi PWD (Div 1)",
    officer: "Sgt. Marcus Thorne",
    coords: [13.3525, 74.7865],
    evidence: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80",
    history: [
      ["Repair Crew Dispatched", "Team Alpha has been assigned to the location. Estimated completion: 48 hours.", "Today, 09:15 AM"],
      ["Damage Verified", "On-site inspector confirmed the severity. Escalated to High Priority status.", "Oct 25, 14:30 PM"],
      ["Report Received", "Initial digital report filed by user via InfraCare portal.", "Oct 24, 11:20 AM"]
    ]
  },
  {
    id: "RD-97552",
    title: "Broken Drainage Cover",
    detailTitle: "Broken Drainage Cover on MG Road",
    area: "MG Road, Mangalore",
    date: "Oct 21, 2023",
    status: "Verified",
    urgency: "Medium",
    category: "Drainage",
    department: "Mangalore City Corp Drainage Unit",
    officer: "Eng. Kavya Rao",
    coords: [12.8702, 74.8437],
    evidence: "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=900&q=80",
    history: [
      ["Damage Verified", "Inspection accepted and forwarded to drainage unit.", "Oct 22, 10:20 AM"],
      ["Report Received", "Citizen report filed with GPS metadata.", "Oct 21, 16:10 PM"]
    ]
  },
  {
    id: "RD-97001",
    title: "Sunken Pavement",
    detailTitle: "Sunken Pavement near NH-66 Surathkal",
    area: "Surathkal, Mangalore",
    date: "Oct 19, 2023",
    status: "Pending",
    urgency: "Normal",
    category: "Pavement",
    department: "Karnataka State Highway Authority",
    officer: "Unassigned",
    coords: [13.0108, 74.7943],
    evidence: "https://images.unsplash.com/photo-1605027628030-9bb6f83535e6?auto=format&fit=crop&w=900&q=80",
    history: [["Report Received", "Initial digital report filed by user.", "Oct 19, 09:00 AM"]]
  }
];

export const assignments = [
  {
    id: "RD-4402",
    state: "Dispatched",
    title: "Critical Pothole - Kalsanka Junction",
    place: "Kalsanka Junction, Udupi",
    coords: [13.3409, 74.7421],
    summary: "Significant road surface degradation reported by multiple citizens. Hazard level: High. Obstruction in primary transit lane.",
    type: "Pothole (Grade A)",
    surface: "High-Density Asphalt",
    crew: "Crew #14-B (Miller)",
    photos: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605027628030-9bb6f83535e6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RD-4398",
    state: "In Progress",
    title: "Broken Drainage Grate",
    place: "Hampankatta, Mangalore",
    coords: [12.8697, 74.8423],
    summary: "Metal grate has shifted into vehicle lane. Temporary cones placed.",
    type: "Drainage Cover",
    surface: "Concrete Edge",
    crew: "Crew #12-A (Sharma)",
    photos: [
      "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605027628030-9bb6f83535e6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
    ]
  },
  {
    id: "RD-4405",
    state: "On-Site",
    title: "Cracked Asphalt Shoulder",
    place: "Malpe Beach Road, Udupi",
    coords: [13.3592, 74.7042],
    summary: "Longitudinal cracking on shoulder reported after heavy rain.",
    type: "Cracked Asphalt",
    surface: "Asphalt Shoulder",
    crew: "Crew #08-C (Patel)",
    photos: [
      "https://images.unsplash.com/photo-1605027628030-9bb6f83535e6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584447098522-875fdfab944b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
    ]
  }
];

export const inspections = [
  {
    id: "INSP-1001",
    status: "Scheduled",
    title: "Verify Pothole Severity",
    location: "Kalsanka Junction, Udupi",
    coords: [13.3409, 74.7421],
    dueDate: "Oct 25, 2023",
    notes: "Check if base layer is compromised.",
    originalReportEvidence: "https://images.unsplash.com/photo-1584447098522-875fdfab944b?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "INSP-1002",
    status: "Completed",
    title: "Post-Repair Sign-off",
    location: "Hampankatta, Mangalore",
    coords: [12.8697, 74.8423],
    dueDate: "Oct 22, 2023",
    notes: "Verify drainage cover replacement meets protocol.",
    originalReportEvidence: "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=900&q=80"
  }
];
