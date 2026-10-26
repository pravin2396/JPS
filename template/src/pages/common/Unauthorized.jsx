import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Briefcase, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  const location = useLocation();
  const attemptedPath = location.state?.attemptedPath || 'a restricted page';

  return (
    <div className="min-h-screen w-full bg-[#070913] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30 mb-3">
        403 • Access Restricted
      </span>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">
        Unauthorized Portal Access
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        You attempted to access <code className="bg-white/10 px-1.5 py-0.5 rounded text-white">{attemptedPath}</code>, which requires permissions not granted to your current role (<strong>{user?.role || 'Guest'}</strong>).
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 border border-white/20"
        >
          {user?.role === 'recruiter' ? <Briefcase className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          Return to {user?.role === 'recruiter' ? 'Recruiter' : 'Candidate'} Dashboard
        </Link>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
