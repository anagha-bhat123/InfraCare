import React from "react";
import { 
  LayoutDashboard, BarChart3, AlertTriangle, 
  Wrench, Users, FileText, Search, Bell, Settings,
  ArrowRight, ShieldAlert, Cpu, Activity, Clock, ShieldCheck,
  ToggleLeft, ToggleRight, ListFilter, ArrowDownToLine
} from "lucide-react";

export default function AdminLogs({ setPage }) {
  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h1>InfraCare</h1>
          <span>MUNICIPAL ADMIN</span>
        </div>

        <nav className="admin-nav-links" style={{flex: 1}}>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("dashboard"); }}>
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("analysis"); }}>
            <BarChart3 size={18} /> Analytics
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("admin-reports"); }}>
            <AlertTriangle size={18} /> Complaints
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("admin-maintenance"); }}>
            <Wrench size={18} /> Maintenance
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setPage("admin-users"); }}>
            <Users size={18} /> User Management
          </a>
          <a href="#" className="active" onClick={(e) => { e.preventDefault(); setPage("admin-logs"); }}>
            <FileText size={18} /> System Logs
          </a>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user-profile bg-gray-50 p-4" onClick={(e) => { e.preventDefault(); setPage("admin-profile"); }} style={{cursor: "pointer"}}>
            <div className="admin-avatar-small-wrap text-avatar bg-black text-white border-none">
              AD
            </div>
            <div className="admin-user-info">
              <strong>Admin Root</strong>
              <span className="text-gray-500">ID: 458293</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-area bg-gray-50">
        
        {/* TOPBAR */}
        <header className="admin-top-nav bg-white border-bottom no-border px-8">
          <div className="admin-top-left flex items-center">
            <h2 className="serif-title mb-0 mr-6 font-bold" style={{fontSize: '1.25rem'}}>System Logs</h2>
            <button className="text-gray-500 border-b-2 border-black pb-4 -mb-[18px] text-sm hover:text-black">Dashboard</button>
          </div>
          <div className="admin-top-right flex gap-6 items-center">
            <div className="admin-search-box bg-gray-50 border-all" style={{width: 300}}>
              <Search size={16} className="search-icon text-gray-400" />
              <input type="text" placeholder="Search parameters..." className="bg-transparent" />
            </div>
            <button className="admin-icon-btn border-none"><Bell size={18} /><span className="notification-dot border-white"></span></button>
            <div className="admin-avatar-top-wrap" onClick={(e) => { e.preventDefault(); setPage("admin-profile"); }} style={{cursor: "pointer"}}><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=32&h=32&q=80" alt="Admin" className="admin-avatar-small rounded-full border-2 border-white" style={{width: 32, height: 32}} /></div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="admin-scroll-content p-8 max-w-6xl mx-auto">
          
          {/* HEADER BANNER */}
          <div className="logs-banner bg-black text-white relative overflow-hidden mb-8">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)'}}></div>
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-black to-transparent z-10 flex flex-col justify-center items-end pr-8">
              <span className="text-xs text-gray-400 font-bold tracking-wider block mb-1">SYSTEM HEALTH</span>
              <span className="text-2xl font-serif text-white">99.98% UPTIME</span>
            </div>
            
            <div className="relative z-10 p-8">
              <span className="text-xs text-gray-400 font-bold tracking-wider block mb-2 uppercase">INTERNAL ADMINISTRATION</span>
              <h3 className="serif-title text-3xl text-white mb-6">Technical Oversight</h3>
              
              <div className="flex gap-4 items-center">
                <span className="bg-white text-black text-[10px] font-bold px-3 py-1 uppercase tracking-wider">LIVE MONITORING</span>
                <span className="border border-white/40 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">v2.4.8 STABLE</span>
                
                <button className="bg-white text-black font-bold text-xs px-6 py-3 tracking-wider flex items-center hover:bg-gray-200 transition-colors ml-auto mr-48 z-20">
                  DOWNLOAD REPORT <ArrowRight size={14} className="ml-2"/>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8 mb-8">
            {/* NOTIFICATION PROTOCOLS */}
            <div className="bg-white border-all p-6 flex-1 relative">
              <div className="flex items-center text-xs font-bold text-gray-500 mb-6 tracking-wider">
                <Bell size={14} className="mr-2"/> NOTIFICATION PROTOCOLS
              </div>

              <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-sm text-gray-900 mb-1">SMS Gateway</h5>
                    <p className="text-xs text-gray-500">High-priority hardware failures</p>
                  </div>
                  <ToggleRight size={32} className="text-black" />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-sm text-gray-900 mb-1">Email SMTP</h5>
                    <p className="text-xs text-gray-500">Daily summaries and audit logs</p>
                  </div>
                  <ToggleRight size={32} className="text-black" />
                </div>

                <div className="flex justify-between items-center opacity-60">
                  <div>
                    <h5 className="font-bold text-sm text-gray-900 mb-1">Mobile Push</h5>
                    <p className="text-xs text-gray-500">Admin authorization requests</p>
                  </div>
                  <ToggleLeft size={32} className="text-gray-300" />
                </div>
              </div>

              <div className="border-top pt-4 mt-auto">
                <p className="text-xs text-gray-400 italic">* Last updated by Root Admin at 09:42:11 GMT+0</p>
              </div>
            </div>

            {/* SYSTEM PARAMETERS */}
            <div className="bg-white border-all p-6 flex-2 relative overflow-visible" style={{flex: 1.5}}>
              <div className="flex items-center text-xs font-bold text-gray-500 mb-6 tracking-wider">
                <Settings size={14} className="mr-2"/> SYSTEM PARAMETERS
              </div>

              <div className="flex gap-8 mb-6">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-700 tracking-wider block mb-2">ARCHIVE THRESHOLD (DAYS)</label>
                  <input type="text" defaultValue="90" className="w-full border-all p-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-black transition-colors mb-2" />
                  <p className="text-[10px] text-gray-500 line-height-normal">Logs older than this will be moved to cold storage.</p>
                </div>
                
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-700 tracking-wider block mb-2">MAX CONCURRENT SESSIONS</label>
                  <select className="w-full border-all p-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-black transition-colors mb-2 appearance-none bg-white">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <p className="text-[10px] text-gray-500 line-height-normal">Prevents brute force by limiting active admin tokens.</p>
                </div>
              </div>

              <div className="w-1/2 pr-4">
                <label className="text-xs font-bold text-gray-700 tracking-wider block mb-2">EMERGENCY RADIUS (METERS)</label>
                <input type="text" defaultValue="500" className="w-full border-all p-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-black transition-colors mb-2" />
                <p className="text-[10px] text-gray-500 line-height-normal">Geographic boundary for critical incident broadcast.</p>
              </div>
              
              {/* Decorative block overlapping the bottom */}
              <div className="absolute bg-black h-2 right-8 bottom-0 transform translate-y-full" style={{width: 150}}></div>
            </div>
          </div>

          {/* REAL-TIME AUDIT TRAIL */}
          <div className="bg-white border-all mb-8">
            <div className="p-6 border-bottom flex justify-between items-center">
              <div className="flex items-center text-xs font-bold text-gray-500 tracking-wider">
                <Activity size={14} className="mr-2"/> REAL-TIME AUDIT TRAIL
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-gray-600 tracking-wider uppercase flex items-center">
                  <span className="dot solid green bg-green-500 mr-2"></span> STREAMING ACTIVE
                </span>
                <button className="border-all p-2 text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"><ListFilter size={16}/></button>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-white text-[10px] font-bold text-gray-500 uppercase tracking-wider border-bottom">
                <tr>
                  <th className="p-4 pl-6 font-bold">TIMESTAMP</th>
                  <th className="p-4 font-bold">SUBJECT</th>
                  <th className="p-4 font-bold">ACTION</th>
                  <th className="p-4 font-bold">ORIGIN IP</th>
                  <th className="p-4 font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-600">
                
                <tr className="border-bottom hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6">Oct 24, 14:22:01</td>
                  <td className="p-4 font-bold text-black">ROOT_ADMIN</td>
                  <td className="p-4">Modified Email SMTP credentials</td>
                  <td className="p-4 font-mono text-gray-500">192.168.1.44</td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">SUCCESS</span>
                  </td>
                </tr>

                <tr className="border-bottom hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6">Oct 24, 14:18:55</td>
                  <td className="p-4 font-bold text-black">GUEST_USER_02</td>
                  <td className="p-4">Attempted access to /admin/config</td>
                  <td className="p-4 font-mono text-gray-500">45.22.189.12</td>
                  <td className="p-4">
                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 uppercase tracking-wider" style={{background: '#fef08a', color: '#854d0e'}}>UNAUTHORIZED</span>
                  </td>
                </tr>

                <tr className="border-bottom hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6">Oct 24, 14:05:12</td>
                  <td className="p-4 font-bold text-black">SYSTEM_CORE</td>
                  <td className="p-4">Disk space below 5% on Cluster-A</td>
                  <td className="p-4 font-mono text-gray-500">INTERNAL</td>
                  <td className="p-4">
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 uppercase tracking-wider" style={{background: '#fecaca', color: '#991b1b'}}>CRITICAL</span>
                  </td>
                </tr>

                <tr className="border-bottom hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6">Oct 24, 13:58:33</td>
                  <td className="p-4 font-bold text-black">API_GATEWAY</td>
                  <td className="p-4">Rate limit exceeded for client #998</td>
                  <td className="p-4 font-mono text-gray-500">203.0.113.10</td>
                  <td className="p-4">
                    <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">BLOCKED</span>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6">Oct 24, 13:42:10</td>
                  <td className="p-4 font-bold text-black">MAINT_COORD_4</td>
                  <td className="p-4">Uploaded site inspection report PDF</td>
                  <td className="p-4 font-mono text-gray-500">192.168.5.122</td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">SUCCESS</span>
                  </td>
                </tr>

              </tbody>
            </table>

            <div className="p-4 flex justify-center border-top">
              <button className="text-xs font-bold text-black tracking-wider flex items-center hover:underline">
                LOAD PREVIOUS LOGS <ArrowDownToLine size={14} className="ml-2"/>
              </button>
            </div>
          </div>

          {/* BOTTOM METRICS */}
          <div className="flex gap-6 mb-12">
            
            <div className="bg-white border-all p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 tracking-wider mb-6">
                API RESPONSE TIME <Clock size={16} className="text-gray-400 opacity-50"/>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-serif font-bold leading-none">124ms</span>
                <span className="text-xs font-bold text-green-600 mb-1" style={{color: '#16a34a'}}>(-12ms)</span>
              </div>
              
              <div className="flex items-end gap-1 h-12 mt-auto">
                <div className="w-1/6 bg-gray-200 h-[40%]"></div>
                <div className="w-1/6 bg-gray-300 h-[60%]"></div>
                <div className="w-1/6 bg-gray-400 h-[80%]"></div>
                <div className="w-1/6 bg-gray-500 h-[100%]"></div>
                <div className="w-1/6 bg-gray-600 h-[70%]"></div>
                <div className="w-1/6 bg-black h-[50%]"></div>
              </div>
            </div>

            <div className="bg-white border-all p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 tracking-wider mb-6">
                SERVER LOAD <Cpu size={16} className="text-gray-400 opacity-50"/>
              </div>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-serif font-bold leading-none">42%</span>
                <span className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">STABLE</span>
              </div>
              
              <div className="mt-auto">
                <div className="progress-bar-thin bg-gray-200 h-2 w-full mb-2"><div className="fill bg-black h-full" style={{width: '42%'}}></div></div>
                <p className="text-[10px] text-gray-500 line-height-normal">Node-4 current load profile</p>
              </div>
            </div>

            <div className="bg-white border-all p-6 flex-2 relative overflow-hidden" style={{flex: 2}}>
              <div className="absolute right-0 top-0 bottom-0 w-48 opacity-40 mix-blend-multiply" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)'}}></div>
              
              <div className="relative z-10 flex gap-6 items-center">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h4 className="serif-title text-lg mb-2">Secure Kernel Operations</h4>
                  <p className="text-xs text-gray-600 line-height-normal mb-4 w-4/5">System integrity is currently verified by the regional oversight module. No manual intervention required.</p>
                  
                  <div className="flex gap-2">
                    <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">ENCRYPTED</span>
                    <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">NON-REPUDIATION</span>
                    <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">TLS 1.3</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <footer className="border-top pt-8 pb-4 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span>© 2024 INFRA-CARE SYSTEMS LTD. ALL RIGHTS RESERVED.</span>
            <div className="flex gap-6 text-black">
              <a href="#" className="hover:underline">PRIVACY PROTOCOL</a>
              <a href="#" className="hover:underline">SECURITY ADVISORY</a>
              <a href="#" className="hover:underline">SYSTEM STATUS</a>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
}
