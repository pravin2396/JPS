import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full bg-[#070913] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/10 text-slate-400 border border-white/15 flex items-center justify-center mb-4 shadow-lg">
        <HelpCircle className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10 mb-3">
        404 • Not Found
      </span>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-6">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all inline-flex items-center gap-1.5 border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Safety
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
