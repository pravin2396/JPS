import { NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  LayoutDashboard,
  Building2,
  LogOut,
  X,
  Shield,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigate('/login');
  };

  const isRecruiter = user?.role === 'recruiter';

  // Navigation Links for Sidebar: Dashboard & Companies
  const links = [
    {
      name: 'Dashboard',
      path: isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Companies',
      path: '/companies',
      icon: Building2,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Edge-to-Edge Height Sidebar in Login Theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0d1a]/95 backdrop-blur-2xl text-slate-200 flex flex-col transition-transform duration-300 ease-in-out border-r border-white/10 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/[0.02]">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-blue-400 group-hover:border-blue-400/50 transition-colors shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-0.5">
                JobPortal<span className="text-blue-400">Hub</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                CAREER PLATFORM
              </span>
            </div>
          </NavLink>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card (Glassmorphic) */}
        <div className="px-5 py-4">
          <div
            className={`p-3.5 rounded-2xl border backdrop-blur-md flex items-center gap-3 transition-all ${
              isRecruiter
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-950/20'
                : 'bg-blue-950/40 border-blue-500/30 text-blue-300 shadow-lg shadow-blue-950/20'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                isRecruiter
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
              }`}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isRecruiter ? 'Recruiter' : 'Candidate'}
                </span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </div>
              <span className="text-xs text-white font-medium truncate">
                {user?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu (Dashboard & Companies) */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation Menu
          </p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? isRecruiter
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-white/20'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 border border-white/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.07]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Footer User Profile & Sign Out */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20"
            />
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-600/20 rounded-xl transition-all border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
