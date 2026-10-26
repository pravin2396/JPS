import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = 2026;

const Footer = () => {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-800">JobPortal</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-800 transition-colors">
              Home
            </Link>
            <Link to="/login" className="hover:text-slate-800 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-slate-800 transition-colors">
              Register
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {CURRENT_YEAR} JobPortal Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
