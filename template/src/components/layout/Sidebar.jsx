import { NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  User,
  PlusCircle,
  Users,
  Building2,
  LogOut,
  X,
  Shield,
  ChevronRight,
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

  // Navigation Links based on role
  const candidateLinks = [
    { name: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { name: 'Browse Jobs', path: '/jobs', icon: Search },
    { name: 'My Applications', path: '/candidate/applications', icon: FileText },
    { name: 'Saved Jobs', path: '/candidate/saved', icon: Bookmark },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const recruiterLinks = [
    { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Post a Job', path: '/recruiter/post-job', icon: PlusCircle },
    { name: 'Manage Jobs', path: '/recruiter/manage-jobs', icon: Briefcase },
    { name: 'Applicants', path: '/recruiter/applicants', icon: Users },
    { name: 'Company Profile', path: '/profile', icon: Building2 },
  ];

  const links = isRecruiter ? recruiterLinks : candidateLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white">
                Job<span className="text-blue-500">Portal</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Career Platform</span>
            </div>
          </NavLink>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Badge */}
        <div className="px-6 py-4">
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              isRecruiter
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-blue-950/40 border-blue-800/60 text-blue-300'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isRecruiter ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isRecruiter ? 'Recruiter' : 'Candidate'}
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                {user?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Navigation
          </p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? isRecruiter
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>
            );
          })}
        </nav>

        {/* Footer User Info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-3 px-2">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-700"
            />
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20"
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
