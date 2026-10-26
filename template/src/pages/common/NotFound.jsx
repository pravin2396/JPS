import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-3">
        404 • Not Found
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-600 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-6">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Safety (Home)
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
