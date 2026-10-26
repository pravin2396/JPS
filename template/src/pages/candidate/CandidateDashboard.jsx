import { useAuth } from '../../context/AuthContext';
import { UserCheck, Search, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const CandidateDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Candidate Account</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-500">
              {user?.email} • {user?.title || 'Open to Opportunities'}
            </p>
          </div>

          <Link
            to="/profile"
            className="self-start sm:self-auto px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            Manage Profile
          </Link>
        </div>
      </div>

      {/* Clean Dashboard Placeholder */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Your Candidate Workspace is Ready</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1.5">
          Use the sidebar navigation to browse job openings, submit applications, and manage your saved opportunities.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
          >
            <Search className="w-4 h-4" />
            Explore Job Openings
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <FileText className="w-4 h-4" />
            Update Profile & Resume
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
