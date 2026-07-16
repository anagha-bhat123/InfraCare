import React from "react";
import { 
  LayoutDashboard, BarChart3, AlertTriangle, 
  Wrench, Users, FileText, Search, Bell, Settings,
  MapPin, CheckCircle2, Clock, Truck, ShieldAlert,
  ArrowRight, Filter, ChevronRight
} from "lucide-react";

export default function AdminMaintenance({ setPage }) {
  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ width: "100%" }}>
        {/* PAGE CONTENT */}
        <div className="admin-scroll-content pt-4 bg-gray-50">
          
          <div className="maintenance-ops-layout">
            
            <div className="ops-left">
              {/* FLEET STATUS */}
              <div className="fleet-status-section bg-white border-all p-6 mb-6">
                <div className="fleet-header flex justify-between mb-6 border-bottom pb-4">
                  <div>
                    <span className="sub-label">FLEET STATUS</span>
                    <h3 className="serif-title large mt-1" style={{fontSize: '1.4rem'}}>Operational Readiness</h3>
                  </div>
                  <div className="flex gap-8 text-right">
                    <div>
                      <span className="sub-label">Units Dispatched</span>
                      <strong className="block text-xl mt-1 text-gray-800">14 / 18</strong>
                    </div>
                    <div>
                      <span className="sub-label">Critical Failures</span>
                      <strong className="block text-xl mt-1 font-bold text-red-600" style={{color: '#dc2626'}}>02</strong>
                    </div>
                  </div>
                </div>

                <div className="fleet-cards flex gap-4">
                  <div className="fleet-card active border-all p-4">
                    <div className="badge-status bg-green-50 text-green-700 border-green mb-4"><Truck size={14} className="mr-1 inline" /> ON-SITE</div>
                    <h5 className="font-bold text-gray-900">UNIT-402</h5>
                    <span className="block text-xs text-gray-500 mb-4">(Excavator)</span>
                    <p className="text-xs text-gray-600 mb-6">Stationed:<br/>North Hub</p>
                    <div className="flex items-center text-xs font-bold"><span className="dot solid green bg-green-500 mr-2"></span> ENGINE<br/>OPTIMAL</div>
                  </div>
                  
                  <div className="fleet-card active border-all p-4">
                    <div className="badge-status bg-blue-50 text-blue-700 border-blue mb-4"><Wrench size={14} className="mr-1 inline" /> DISPATCHED</div>
                    <h5 className="font-bold text-gray-900">UNIT-881</h5>
                    <span className="block text-xs text-gray-500 mb-4">(Mobile Lab)</span>
                    <p className="text-xs text-gray-600 mb-6">Active: 7th Ave<br/>Sewer</p>
                    <div className="flex items-center text-xs font-bold"><span className="dot solid green bg-green-500 mr-2"></span> LIVE REPORTING</div>
                  </div>

                  <div className="fleet-card active border-all p-4">
                    <div className="badge-status bg-blue-50 text-blue-700 border-blue mb-4"><AlertTriangle size={14} className="mr-1 inline" /> DISPATCHED</div>
                    <h5 className="font-bold text-gray-900">UNIT-109</h5>
                    <span className="block text-xs text-gray-500 mb-4">(Response)</span>
                    <p className="text-xs text-gray-600 mb-6">Active: Power<br/>Grid Z</p>
                    <div className="flex items-center text-xs font-bold"><span className="dot solid green bg-green-500 mr-2"></span> ETA 4 MIN</div>
                  </div>

                  <div className="fleet-card inactive border-all p-4 bg-gray-50 opacity-60">
                    <div className="badge-status bg-gray-100 text-gray-500 border-gray mb-4"><ShieldAlert size={14} className="mr-1 inline" /> MAINTENANCE</div>
                    <h5 className="font-bold text-gray-900">UNIT-220</h5>
                    <span className="block text-xs text-gray-500 mb-4">(Crane)</span>
                    <p className="text-xs text-gray-600 mb-6">Scheduled<br/>Service</p>
                    <div className="flex items-center text-xs font-bold text-red-600" style={{color: '#dc2626'}}><span className="dot solid red bg-red-600 mr-2"></span> OFFLINE</div>
                  </div>
                </div>
              </div>

              {/* PROJECT TIMELINE */}
              <div className="project-timeline-section bg-white border-all">
                <div className="timeline-header flex justify-between items-center p-4 border-bottom">
                  <h3 className="serif-title" style={{fontSize: '1.2rem'}}>Project Timeline</h3>
                  <div className="timeline-toggles flex border-all">
                    <button className="bg-black text-white px-4 py-1 text-xs font-bold">DAY</button>
                    <button className="bg-white text-gray-800 px-4 py-1 text-xs font-bold border-left">WEEK</button>
                    <button className="bg-white text-gray-800 px-4 py-1 text-xs font-bold border-left">MONTH</button>
                  </div>
                </div>

                <div className="timeline-grid">
                  <div className="timeline-labels flex border-bottom p-4 text-sm font-bold text-gray-700">
                    <div style={{flex: 1}}>Project Name</div>
                    <div className="flex justify-between" style={{flex: 2, paddingLeft: '20px'}}>
                      <span>08:00</span>
                      <span>10:00</span>
                      <span>12:00</span>
                      <span>14:00</span>
                      <span>16:00</span>
                    </div>
                  </div>

                  <div className="timeline-row flex border-bottom p-4 items-center">
                    <div style={{flex: 1}}>
                      <h5 className="font-bold text-gray-900 text-sm">Main Sewer Relining</h5>
                      <span className="text-xs text-gray-500">#WO-2024-091</span>
                    </div>
                    <div className="timeline-bars" style={{flex: 2, paddingLeft: '20px', position: 'relative', height: '30px'}}>
                      <div className="bar-phase bg-black text-white text-xs font-bold px-2 py-1 flex items-center" style={{position: 'absolute', left: '0%', width: '40%', height: '100%'}}>PHASE 1: CLEANING</div>
                      <div className="bar-phase border-dashed text-gray-400" style={{position: 'absolute', left: '42%', width: '15%', height: '100%', border: '2px dashed #e5e5e5'}}></div>
                    </div>
                  </div>

                  <div className="timeline-row flex border-bottom p-4 items-center">
                    <div style={{flex: 1}}>
                      <h5 className="font-bold text-gray-900 text-sm">Grid 5 transformer</h5>
                      <span className="text-xs text-gray-500">#WO-2024-102</span>
                    </div>
                    <div className="timeline-bars" style={{flex: 2, paddingLeft: '20px', position: 'relative', height: '30px'}}>
                      <div className="bar-phase bg-gray-200 text-gray-800 text-xs font-bold px-2 py-1 flex items-center justify-center" style={{position: 'absolute', left: '35%', width: '35%', height: '100%'}}>PHASE 2: TESTING</div>
                      <div className="bar-phase bg-black text-white text-xs font-bold px-2 py-1 flex items-center justify-center" style={{position: 'absolute', left: '72%', width: '25%', height: '100%'}}>REPLACEMENT</div>
                    </div>
                  </div>

                  <div className="timeline-row flex p-4 items-center">
                    <div style={{flex: 1}}>
                      <h5 className="font-bold text-gray-900 text-sm">Pavement Repair</h5>
                      <span className="text-xs text-gray-500">#WO-2024-088</span>
                    </div>
                    <div className="timeline-bars" style={{flex: 2, paddingLeft: '20px', position: 'relative', height: '30px'}}>
                      <div className="bar-phase bg-green-50 text-green-700 text-xs font-bold px-2 py-1 flex items-center justify-center" style={{position: 'absolute', left: '0%', width: '100%', height: '100%', border: '1px solid #bbf7d0', color: '#16a34a'}}>COMPLETED: POST-INSPECTION</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* PROJECT PROGRESS */}
              <div className="project-progress-section bg-white border-all mt-6 p-6 mb-8">
                <div className="progress-header flex justify-between items-center mb-8">
                  <div>
                    <span className="sub-label">PROJECT PROGRESS</span>
                    <h3 className="serif-title large mt-1" style={{fontSize: '1.2rem'}}>Active Remediation</h3>
                  </div>
                  <button className="admin-btn-text"><Filter size={14} className="mr-2 inline" /> FILTER BY TYPE</button>
                </div>

                <div className="progress-metrics flex justify-between gap-12">
                  <div className="metric-item flex-1">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">Sewer Line Replacement</h5>
                        <span className="text-xs text-gray-500">District 7 • Sector B</span>
                      </div>
                      <span className="font-serif font-bold text-xl">82%</span>
                    </div>
                    <div className="progress-bar-thin bg-gray-200 h-2 w-full mb-2"><div className="fill bg-black h-full" style={{width: '82%'}}></div></div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold" style={{fontSize: '0.6rem'}}>
                      <span>EXCAVATION DONE</span>
                      <span>FINAL SEAL PENDING</span>
                    </div>
                  </div>

                  <div className="metric-item flex-1">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">Bridge Joint Repair</h5>
                        <span className="text-xs text-gray-500">East Crossing</span>
                      </div>
                      <span className="font-serif font-bold text-xl">45%</span>
                    </div>
                    <div className="progress-bar-thin bg-gray-200 h-2 w-full mb-2"><div className="fill bg-black h-full" style={{width: '45%'}}></div></div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold" style={{fontSize: '0.6rem'}}>
                      <span>MATERIAL ARRIVED</span>
                      <span>CURING PHASE</span>
                    </div>
                  </div>

                  <div className="metric-item flex-1">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">Street Light Upgrade</h5>
                        <span className="text-xs text-gray-500">City Wide Phase 2</span>
                      </div>
                      <span className="font-serif font-bold text-xl">12%</span>
                    </div>
                    <div className="progress-bar-thin bg-gray-200 h-2 w-full mb-2"><div className="fill bg-red-600 h-full" style={{width: '12%', background: '#dc2626'}}></div></div>
                    <div className="flex justify-between text-xs font-bold" style={{fontSize: '0.6rem'}}>
                      <span className="text-red-600" style={{color: '#dc2626'}}>DELAYED: SUPPLY CHAIN</span>
                      <span className="text-red-600" style={{color: '#dc2626'}}>LOW PRIORITY</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="ops-right">
              {/* GEOSPATIAL CONTEXT */}
              <div className="geospatial-panel mb-6 bg-black text-white relative overflow-hidden" style={{height: '350px'}}>
                <div className="map-overlay absolute inset-0 opacity-40" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800")', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'luminosity'}}></div>
                <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                  <div>
                    <span className="sub-label text-gray-400 block mb-1">GEOSPATIAL CONTEXT</span>
                    <h3 className="serif-title text-white" style={{fontSize: '1.2rem', color: 'white'}}>Zone A-4 Activity</h3>
                  </div>
                  
                  <div className="map-stats bg-white/10 backdrop-blur-md p-4 border border-white/20">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Active Crew<br/>Proximity</span>
                      <span className="text-green-400 font-bold" style={{color: '#4ade80'}}>0.8km</span>
                    </div>
                    <div className="progress-bar-thin bg-white/20 h-1 w-full"><div className="fill bg-green-400 h-full" style={{width: '70%', background: '#4ade80'}}></div></div>
                  </div>
                </div>
              </div>

              {/* PENDING TASKS */}
              <div className="pending-tasks-section bg-gray-50 border-all p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold text-gray-700 tracking-wider">PENDING TASKS</h4>
                  <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">04</span>
                </div>

                <div className="task-cards flex flex-col gap-4">
                  
                  <div className="task-card bg-white border-all p-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className="badge-urgent bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1">URGENT</span>
                      <button className="text-gray-400 hover:text-black">=</button>
                    </div>
                    <h5 className="font-bold text-gray-900 text-sm mb-2">Damaged Guardrail - Hwy 101 Intersection</h5>
                    <p className="text-xs text-gray-500 mb-4 line-height-normal">Reported by citizen app, visual confirmation pending.</p>
                    <div className="flex justify-between items-center border-top pt-4 mt-4">
                      <div className="flex -space-x-2">
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=32&h=32&q=80" alt="Avatar"/>
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">+2</div>
                      </div>
                      <button className="text-xs font-bold flex items-center hover:underline">ASSIGN <ChevronRight size={14} className="ml-1 inline"/></button>
                    </div>
                  </div>

                  <div className="task-card bg-white border-all p-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className="badge-routine bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1">ROUTINE</span>
                      <button className="text-gray-400 hover:text-black">=</button>
                    </div>
                    <h5 className="font-bold text-gray-900 text-sm mb-2">Graffiti Removal - Central Park Wall</h5>
                    <p className="text-xs text-gray-500 mb-4 line-height-normal">Scheduled for end-of-week cleanup cycle.</p>
                    <div className="flex justify-between items-center border-top pt-4 mt-4">
                      <div className="w-6 h-6 rounded-full bg-blue-100"></div>
                      <button className="text-xs font-bold flex items-center hover:underline">ASSIGN <ChevronRight size={14} className="ml-1 inline"/></button>
                    </div>
                  </div>

                </div>

                <button className="w-full mt-4 border-all border-dashed py-3 text-xs font-bold text-gray-600 hover:bg-gray-100 hover:text-black transition-colors">
                  + ADD TEMPORARY TASK
                </button>
              </div>

            </div>

          </div>

        </div>
            </div>
    </div>
  );
}
