import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Send,
  ShieldCheck,
  XCircle,
  Bookmark,
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { companyService } from '../../services/companyService';
import { applicationService } from '../../services/applicationService';
import { toast } from 'react-toastify';

const JobDetails = () => {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const found = await jobService.getJobById(id);
        if (!found) {
          setError('Job posting not found or has been removed.');
        } else {
          setJob(found);
          setHasApplied(applicationService.isJobApplied(found.id, found.title));
          setHasSaved(applicationService.isJobSaved(found.id));

          // Find associated company details if available
          const companies = companyService.getLocalCompanies();
          const matched = companies.find(
            (c) => c.name.toLowerCase() === found.company.toLowerCase()
          );
          if (matched) {
            setCompany(matched);
          }
        }
      } catch (err) {
        setError('Error fetching job details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // Handle Candidate Apply (Axios POST + LocalStorage + Dashboard Status +1)
  const handleApply = async () => {
    if (!job) return;
    if (job.status !== 'Open') {
      toast.warning('This position is closed and is no longer accepting applications.');
      return;
    }

    try {
      await applicationService.applyForJob({
        jobId: job.id,
        title: job.title,
        company: job.company,
        companyLogo: job.companyLogo,
        location: job.location,
        salary: job.salaryRange,
        category: job.category,
      });

      setHasApplied(true);
      toast.success(
        `Application submitted for "${job.title}"! Replicated in Dashboard Status Cards (+1).`
      );
    } catch (e) {
      toast.info(e.message || `Application registered for "${job.title}"!`);
      setHasApplied(true);
    }
  };

  // Handle Toggle Save (Axios POST/DELETE + LocalStorage + Dashboard Status)
  const handleToggleSave = async () => {
    if (!job) return;
    try {
      if (hasSaved) {
        await applicationService.removeSavedJob(job.id);
        setHasSaved(false);
        toast.info(`Removed "${job.title}" from saved jobs (-1 Saved Jobs card).`);
      } else {
        await applicationService.saveJob({
          id: job.id,
          title: job.title,
          company: job.company,
          companyLogo: job.companyLogo,
          category: job.category,
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          salaryRange: job.salaryRange,
          location: job.location,
          deadline: job.deadline,
        });
        setHasSaved(true);
        toast.success(`Saved "${job.title}" to bookmarks (+1 Saved Jobs card).`);
      }
    } catch (err) {
      toast.error('Error updating saved state: ' + err.message);
    }
  };

  // Toggle Job Status
  const handleToggleStatus = async () => {
    if (!job) return;
    try {
      const updated = await jobService.toggleJobStatus(job.id);
      if (updated) {
        setJob(updated);
        toast.info(`Position status changed to "${updated.status}". Status cards updated.`);
      }
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  // Share Position
  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Job posting URL copied to clipboard!');
    } else {
      toast.info('Job URL ready to share!');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading job specifications...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-xl space-y-3">
        <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Job Posting Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {error || 'The requested job opening does not exist or has been removed.'}
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 mt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Job Postings
        </Link>
      </div>
    );
  }

  const isOpen = job.status === 'Open';

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb Nav */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Job Postings
        </Link>
      </div>

      {/* Main Job Profile Card */}
      <div className="w-full rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Banner with Gradient */}
        <div className="h-44 bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 relative border-b border-white/10 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Employer Opportunity
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all"
                title="Share Job Opportunity"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleStatus}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md transition-all flex items-center gap-1.5 ${
                  isOpen
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                }`}
                title="Toggle Open or Closed"
              >
                {isOpen ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {isOpen ? 'Mark as Closed' : 'Reopen Position'}
              </button>
            </div>
          </div>
        </div>

        {/* Job Identity Header */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <img
                src={
                  job.companyLogo ||
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200'
                }
                alt={job.company}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-4 ring-[#070913] shadow-2xl object-cover bg-slate-900"
              />
              <div className="pt-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {job.title}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase border backdrop-blur-md ${
                      isOpen
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                      }`}
                    ></span>
                    {job.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-semibold mt-1">
                  <span className="text-blue-400">{job.company}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{job.category}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-purple-300">{job.employmentType}</span>
                </div>
              </div>
            </div>

            {/* Apply & Save Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSave}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 border ${
                  hasSaved
                    ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/15'
                }`}
                title={hasSaved ? 'Remove from Saved Jobs' : 'Save Job'}
              >
                <Bookmark className={`w-4 h-4 ${hasSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{hasSaved ? 'Saved' : 'Save Job'}</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={!isOpen || hasApplied}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${
                  hasApplied
                    ? 'bg-emerald-600 text-white cursor-default opacity-90'
                    : isOpen
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 border border-white/20'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {hasApplied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Application Submitted
                  </>
                ) : isOpen ? (
                  <>
                    <Send className="w-4 h-4" />
                    Apply for this Position
                  </>
                ) : (
                  'Position Closed'
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Badges Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Location
                </span>
                <span className="text-white font-medium">{job.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Compensation
                </span>
                <span className="text-white font-medium">{job.salaryRange}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Experience
                </span>
                <span className="text-white font-medium">{job.experienceLevel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Deadline
                </span>
                <span className="text-cyan-300 font-mono font-medium">{job.deadline}</span>
              </div>
            </div>
          </div>

          {/* Required Skills Section */}
          <div className="mt-6 space-y-2.5">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Required Technologies & Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(job.skills) &&
                job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/[0.06] text-blue-300 border border-white/10 shadow-xs"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-8 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Role Overview
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities Section */}
          {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
            <div className="mt-8 space-y-3">
              <h2 className="text-base font-bold text-white">Key Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements Section */}
          {Array.isArray(job.requirements) && job.requirements.length > 0 && (
            <div className="mt-8 space-y-3">
              <h2 className="text-base font-bold text-white">Qualifications & Requirements</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Employer Card Footer */}
          {company && (
            <div className="mt-10 p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/10 bg-slate-900"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{company.name}</h3>
                  <p className="text-xs text-slate-400">
                    {company.industry} • {company.employees} employees
                  </p>
                </div>
              </div>

              <Link
                to={`/companies/${company.id}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                View Company Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
