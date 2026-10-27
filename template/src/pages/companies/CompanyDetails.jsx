import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Users,
  Briefcase,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { companyService } from '../../services/companyService';

const CompanyDetails = () => {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const found = await companyService.getCompanyById(id);
        if (!found) {
          setError('Company not found.');
        } else {
          setCompany(found);
        }
      } catch (err) {
        setError('Error fetching company: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading company profile...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-xl space-y-3">
        <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Company Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {error || 'The requested company record does not exist or has been removed.'}
        </p>
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 mt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back button link */}
      <div>
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Companies Directory
        </Link>
      </div>

      {/* Main Company Profile Card (Glassmorphic) */}
      <div className="w-full rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Banner with Gradient */}
        <div className="h-44 bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 relative border-b border-white/10">
          <div className="absolute right-6 top-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Employer
            </span>
          </div>
        </div>

        {/* Company Identity Header */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <img
                src={company.logo}
                alt={company.name}
                className="w-28 h-28 rounded-2xl ring-4 ring-[#070913] shadow-2xl object-cover bg-slate-900"
              />
              <div className="pt-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {company.name}
                  </h1>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <p className="text-xs text-blue-400 font-semibold mt-0.5">
                  {company.industry} • Founded {company.founded || 2018}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {company.website && (
                <div className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-300 border border-white/10 flex items-center gap-2 cursor-default select-none pointer-events-none">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>{company.website}</span>
                </div>
              )}
              {company.email && (
                <div className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 text-slate-300 border border-white/10 flex items-center gap-2 cursor-default select-none pointer-events-none">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Badges Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Headquarters</span>
                <span className="text-white font-medium">{company.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Company Size</span>
                <span className="text-white font-medium">{company.employees} employees</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Domain</span>
                <span className="text-white font-medium">{company.industry}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Active Openings</span>
                <span className="text-emerald-300 font-medium font-mono">{company.openingsCount || 4} Open Positions</span>
              </div>
            </div>
          </div>

          {/* Company Description Body */}
          <div className="mt-6 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              About {company.name}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {company.description}
            </p>
          </div>

          {/* Company Culture & Benefits */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Remote & Hybrid First
              </div>
              <p className="text-xs text-slate-400">
                Flexible asynchronous working hours with competitive home office allowances.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Comprehensive Benefits
              </div>
              <p className="text-xs text-slate-400">
                Top tier health insurance, 401k matching, and dedicated annual learning budgets.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Modern Tech Stack
              </div>
              <p className="text-xs text-slate-400">
                Building on React 19, Node.js, distributed microservices, and automated CI/CD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
