import { useState } from 'react';
import { Menu, Bell, Search, Shield } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const isRecruiter = user?.role === 'recruiter';

  return (
    <div className="min-h-screen w-full bg-[#070913] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Orbs (matching Login page theme) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (Edge-to-Edge Stretched) */}
      <div className="lg:pl-64 flex flex-col flex-1 w-full min-w-0 relative z-10">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 w-full bg-[#0b0e1f]/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 lg:hidden focus:outline-none transition-colors"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {isRecruiter ? 'Employer Portal Workspace' : 'Candidate Career Workspace'}
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isRecruiter
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  }`}
                >
                  LIVE
                </span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Welcome back, {user?.name}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-400 w-64">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={isRecruiter ? 'Search candidate applicants...' : 'Search jobs, skills, companies...'}
                className="bg-transparent border-none outline-none text-white placeholder-slate-400 text-xs w-full"
              />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl relative transition-colors border border-transparent hover:border-white/10"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-2 right-2 ring-2 ring-[#0b0e1f]"></span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {user?.name}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 ${
                    isRecruiter ? 'text-emerald-400' : 'text-blue-400'
                  }`}
                >
                  <Shield className="w-2.5 h-2.5" />
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Edge-to-Edge Main Page Content */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
