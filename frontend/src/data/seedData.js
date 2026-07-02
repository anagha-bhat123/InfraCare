export const reportsSeed = [
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

export const assignments = [
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
