import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Briefcase, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  const location = useLocation();
  const attemptedPath = location.state?.attemptedPath || 'a restricted page';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-3">
        403 • Access Restricted
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
        Unauthorized Portal Access
      </h1>
      <p className="mt-2 text-sm text-slate-600 max-w-md">
        You attempted to access <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{attemptedPath}</code>, which requires permissions not granted to your current role (<strong>{user?.role || 'Guest'}</strong>).
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
        >
          {user?.role === 'recruiter' ? <Briefcase className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          Return to My {user?.role === 'recruiter' ? 'Recruiter' : 'Candidate'} Dashboard
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
