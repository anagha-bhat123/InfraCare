import React from "react";
import { 
  LayoutDashboard, BarChart3, AlertTriangle, 
  Wrench, Users, FileText, Search, Bell, Settings,
  ArrowRight, Filter, ChevronRight, UserMinus, KeyRound, UserX, UserPlus,
  ShieldAlert, MapPin
} from "lucide-react";

export default function AdminUsers({ setPage }) {
  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ width: "100%" }}>
        {/* PAGE CONTENT */}
        <div className="admin-scroll-content pt-4 bg-gray-50 p-6">
          
          {/* NOTICE BANNER */}
          <div className="notice-banner bg-black text-white p-6 mb-6 flex justify-between items-center relative overflow-hidden">
             <div className="flex items-center gap-6 z-10 relative">
               <div className="bg-white/20 p-4">
                 <UserMinus size={24} className="text-white"/>
               </div>
               <div>
                 <h4 className="font-serif font-bold text-lg mb-1">Role Compliance Review Required</h4>
                 <p className="text-sm text-gray-300">The quarterly security audit is now due. Please verify permissions for all high-clearance Administrative accounts by Friday.</p>
               </div>
             </div>
             <button className="bg-white text-black font-bold text-sm px-6 py-3 tracking-wider z-10 relative flex items-center hover:bg-gray-200 transition-colors">
               START AUDIT <ArrowRight size={16} className="ml-2"/>
             </button>
          </div>

          <div className="users-layout flex gap-6">
            
            <div className="users-main flex-2" style={{flex: 2}}>
              
              <div className="bg-white border-all">
                <div className="flex justify-between items-center p-4 border-bottom">
                  <div className="tabs flex gap-8 text-sm font-bold text-gray-500">
                    <button className="text-black border-b-2 border-black pb-4 -mb-4">All Users</button>
                    <button className="hover:text-black pb-4 -mb-4">Admins</button>
                    <button className="hover:text-black pb-4 -mb-4">Engineers</button>
                  </div>
                  <button className="bg-black text-white px-4 py-2 text-xs font-bold flex items-center tracking-wider hover:bg-gray-800 transition-colors" onClick={() => setPage("register")}>
                    <UserPlus size={14} className="mr-2"/> ADD NEW USER
                  </button>
                </div>

                <table className="user-table w-full text-left">
                  <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-bottom">
                    <tr>
                      <th className="p-4">User Details</th>
                      <th className="p-4">Access Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Last Active</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    
                    <tr className="border-bottom hover:bg-gray-50 transition-colors">
                      <td className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center font-bold border-all">JD</div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1">Jonathan Doe</h5>
                          <span className="text-xs text-gray-500">j.doe@cityinfra.gov</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="role-stacked-badge inline-flex flex-col border-all">
                          <span className="bg-gray-100 text-black text-[10px] font-bold px-2 py-1 border-bottom uppercase tracking-wider">CHIEF</span>
                          <span className="bg-gray-200 text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider">ENGINEER</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-700 flex items-center pt-8">
                        <span className="dot solid green bg-green-500 mr-2"></span> Verified
                      </td>
                      <td className="p-4 text-gray-600">
                        2m ago<br/><span className="text-xs text-gray-400">(Node 04)</span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-sm text-gray-600 hover:text-black hover:underline">Manage</button>
                      </td>
                    </tr>

                    <tr className="border-bottom hover:bg-gray-50 transition-colors">
                      <td className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center font-bold border-all">SH</div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1">Sarah Henderson</h5>
                          <span className="text-xs text-gray-500">s.henderson@it.gov</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="role-stacked-badge inline-flex flex-col border-all">
                          <span className="bg-black text-white text-[10px] font-bold px-2 py-1 border-bottom border-gray-600 uppercase tracking-wider">SYSTEM</span>
                          <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">ADMIN</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-700 flex items-center pt-8">
                        <span className="dot solid yellow bg-yellow-500 mr-2" style={{background: '#eab308'}}></span> MFA Pending
                      </td>
                      <td className="p-4 text-gray-600">
                        14h ago<br/><span className="text-xs text-gray-400">(Remote)</span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-sm text-gray-600 hover:text-black hover:underline">Manage</button>
                      </td>
                    </tr>

                    <tr className="border-bottom hover:bg-gray-50 transition-colors">
                      <td className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center font-bold border-all">MC</div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1">Marcus Chen</h5>
                          <span className="text-xs text-gray-500">m.chen@citizen.org</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="role-stacked-badge inline-flex flex-col border-all">
                          <span className="bg-gray-100 text-black text-[10px] font-bold px-2 py-1 border-bottom uppercase tracking-wider">CITIZEN</span>
                          <span className="bg-white text-gray-600 text-[10px] font-bold px-2 py-1 uppercase tracking-wider">REP</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-700 flex items-center pt-8">
                        <span className="dot solid green bg-green-500 mr-2"></span> Verified
                      </td>
                      <td className="p-4 text-gray-600">
                        3d ago<br/><span className="text-xs text-gray-400">(Mobile)</span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-sm text-gray-600 hover:text-black hover:underline">Manage</button>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50 transition-colors bg-red-50/30">
                      <td className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-50 text-red-600 flex items-center justify-center font-bold border-all border-red-200" style={{borderColor: '#fca5a5'}}>LW</div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-1">Lisa Wong</h5>
                          <span className="text-xs text-gray-500">l.wong@field.gov</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="role-stacked-badge inline-flex flex-col border-all opacity-70">
                          <span className="bg-gray-100 text-black text-[10px] font-bold px-2 py-1 border-bottom uppercase tracking-wider">FIELD</span>
                          <span className="bg-gray-200 text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider">ENG</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-red-600 flex items-center pt-8 uppercase tracking-wider text-xs">
                        <span className="dot solid red bg-red-600 mr-2"></span> SUSPENDED
                      </td>
                      <td className="p-4 text-gray-600">
                        24d ago<br/><span className="text-xs text-gray-400">(In-Office)</span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-sm text-red-600 font-bold hover:underline">Reactivate</button>
                      </td>
                    </tr>

                  </tbody>
                </table>
                <div className="p-4 border-top bg-gray-50 flex justify-between items-center text-sm text-gray-500">
                  <span>Showing 1-4 of 128 registered portal users</span>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center bg-white border-all hover:bg-gray-100 transition-colors text-gray-400 font-bold">{"<"}</button>
                    <button className="w-8 h-8 flex items-center justify-center bg-white border-all hover:bg-gray-100 transition-colors text-gray-600 font-bold">{">"}</button>
                  </div>
                </div>
              </div>

            </div>

            <div className="users-sidebar flex-1 flex flex-col gap-6" style={{flex: 1}}>
              
              {/* SECURITY SNAPSHOT */}
              <div className="bg-white border-all p-6">
                <div className="flex items-center text-xs font-bold text-gray-500 mb-4 tracking-wider">
                  <ShieldAlert size={14} className="mr-2"/> SECURITY SNAPSHOT
                </div>
                <div className="flex gap-4">
                  <div className="bg-gray-50 p-4 flex-1 border-l-4 border-black">
                    <span className="text-[10px] font-bold text-gray-500 tracking-wider block mb-1">FAILED LOGINS</span>
                    <strong className="text-2xl font-serif">12</strong>
                  </div>
                  <div className="bg-gray-50 p-4 flex-1 border-l-4 border-red-600">
                    <span className="text-[10px] font-bold text-gray-500 tracking-wider block mb-1">NEW ALERTS</span>
                    <strong className="text-2xl font-serif text-red-600">03</strong>
                  </div>
                </div>
              </div>

              {/* ACTIVE ALERTS */}
              <div className="bg-white border-all">
                <div className="p-6 border-bottom">
                  <div className="flex items-center text-xs font-bold text-gray-500 tracking-wider">
                    <Settings size={14} className="mr-2"/> ACTIVE ALERTS
                  </div>
                </div>

                <div className="alert-timeline-list flex flex-col">
                  
                  <div className="alert-item p-6 border-bottom flex gap-4 items-start">
                    <div className="w-8 h-8 bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0" style={{background: '#fee2e2'}}>
                      <MapPin size={16} className="opacity-70" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm mb-1">Unusual Access Location</h5>
                      <p className="text-xs text-gray-500 mb-2 line-height-normal">Attempted login for <strong>s.henderson</strong> from IP 45.12.9.2 (Prague, CZ)</p>
                      <span className="text-[10px] font-bold text-gray-400 block mb-4 uppercase">12:45 PM Today</span>
                      <div className="flex gap-4 items-center">
                        <button className="text-[10px] font-bold border-all border-black px-3 py-1 uppercase tracking-wider hover:bg-black hover:text-white transition-colors">RESOLVE</button>
                        <button className="text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:text-black">DISMISS</button>
                      </div>
                    </div>
                  </div>

                  <div className="alert-item p-6 border-bottom flex gap-4 items-start">
                    <div className="w-8 h-8 bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                      <UserX size={16} />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm mb-1">MFA Exhaustion</h5>
                      <p className="text-xs text-gray-500 mb-2 line-height-normal">5 consecutive MFA push requests denied for user <strong>j.doe</strong>.</p>
                      <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase">11:12 AM Today</span>
                    </div>
                  </div>

                  <div className="alert-item p-6 border-bottom flex gap-4 items-start">
                    <div className="w-8 h-8 bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                      <KeyRound size={16} />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm mb-1">Credential Change</h5>
                      <p className="text-xs text-gray-500 mb-2 line-height-normal">User <strong>m.chen</strong> updated administrative credentials.</p>
                      <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase">09:30 AM Today</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* ACCESS FREQUENCY MAP */}
              <div className="bg-white border-all overflow-hidden relative" style={{height: 200}}>
                <div className="absolute inset-0 bg-gray-100 opacity-60" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%) opacity(0.3)'}}></div>
                <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                  <h4 className="text-xs font-bold text-gray-600 tracking-wider">ACCESS FREQUENCY</h4>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <strong className="text-3xl font-serif text-black block leading-none">98%</strong>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">MFA SUCCESS</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-3xl font-serif text-black block leading-none">0.4s</strong>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">LATENCY</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
            </div>
    </div>
  );
}
