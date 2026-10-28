import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  MapPin,
  DollarSign,
  Building2,
  Sparkles,
  ArrowRight,
  Upload,
  CalendarCheck,
  Trash2,
  BookmarkCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { companyService } from '../../services/companyService';
import { applicationService } from '../../services/applicationService';

const LOCAL_STORAGE_KEY = 'jps_candidate_dashboard_state';

// Initial default dashboard data
const INITIAL_APPLICATIONS = [
  {
    id: 'app-1',
    title: 'Senior Frontend Engineer (React/Tailwind)',
    company: 'TechCorp Innovations',
    location: 'Remote / Austin, TX',
    salary: '$135,000 - $160,000',
    appliedDate: '2 days ago',
    status: 'Interview Scheduled',
    statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'app-2',
    title: 'Full Stack JavaScript Developer',
    company: 'CloudScale Global',
    location: 'San Francisco, CA / Hybrid',
    salary: '$120,000 - $145,000',
    appliedDate: '5 days ago',
    status: 'Under Review',
    statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  {
    id: 'app-3',
    title: 'React Native Mobile Developer',
    company: 'Apex Systems Inc',
    location: 'Remote',
    salary: '$130,000 - $150,000',
    appliedDate: '1 week ago',
    status: 'Shortlisted',
    statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
];

const INITIAL_RECOMMENDED_JOBS = [
  {
    id: 'rec-1',
    title: 'Lead Frontend UI Engineer',
    company: 'Nova Digital Media',
    location: 'Remote / New York, NY',
    salary: '$140k - $170k',
    tags: ['React 19', 'Tailwind CSS', 'TypeScript'],
    applied: false,
    saved: false,
  },
  {
    id: 'rec-2',
    title: 'Senior Web Application Architect',
    company: 'Vanguard Cyber Tech',
    location: 'Remote / Boston, MA',
    salary: '$150k - $185k',
    tags: ['Next.js', 'React', 'Context API'],
    applied: false,
    saved: false,
  },
  {
    id: 'rec-3',
    title: 'Design System Engineer',
    company: 'Pulse Enterprise Labs',
    location: 'Hybrid / Seattle, WA',
    salary: '$130k - $155k',
    tags: ['CSS Architecture', 'Figma', 'React'],
    applied: false,
    saved: false,
  },
];

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  // Load state from LocalStorage or initialize
  const [applications, setApplications] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.applications || INITIAL_APPLICATIONS;
      }
    } catch (e) {
      console.warn('Failed loading candidate dashboard state:', e);
    }
    return INITIAL_APPLICATIONS;
  });

  const [recommendedJobs, setRecommendedJobs] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.recommendedJobs || INITIAL_RECOMMENDED_JOBS;
      }
    } catch (e) {
      console.warn('Failed loading candidate recommended jobs:', e);
    }
    return INITIAL_RECOMMENDED_JOBS;
  });

  const [scheduledInterviewsCount, setScheduledInterviewsCount] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.interviewsCount ?? 2;
      }
    } catch (e) {
      console.warn('Failed loading interviews count:', e);
    }
    return 2;
  });

  const [savedJobsList, setSavedJobsList] = useState(() => {
    return applicationService.getSavedJobs();
  });

  // Calculate live dynamic metrics from applications and saved state
  const totalApplicationsCount = applications.length;
  const shortlistedCount = applications.filter((a) => (a.status || '').toLowerCase().includes('shortlist')).length;
  const totalSavedJobsCount = savedJobsList.length;
  const [companyCount, setCompanyCount] = useState(() => companyService.getCompanyCount());

  // Listen to company, applications, and saved jobs CRUD updates
  useEffect(() => {
    const syncState = () => {
      setCompanyCount(companyService.getCompanyCount());
      setApplications(applicationService.getAppliedJobs());
      setSavedJobsList(applicationService.getSavedJobs());
    };
    window.addEventListener('companies_updated', syncState);
    window.addEventListener('applications_updated', syncState);
    window.addEventListener('saved_jobs_updated', syncState);
    window.addEventListener('candidate_updated', syncState);
    window.addEventListener('storage', syncState);
    return () => {
      window.removeEventListener('companies_updated', syncState);
      window.removeEventListener('applications_updated', syncState);
      window.removeEventListener('saved_jobs_updated', syncState);
      window.removeEventListener('candidate_updated', syncState);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  // Persist to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          applications,
          recommendedJobs,
          interviewsCount: scheduledInterviewsCount,
        })
      );
    } catch (e) {
      console.warn('Failed to persist dashboard state:', e);
    }
  }, [applications, recommendedJobs, scheduledInterviewsCount]);

  // ACTION 1: Apply to a job (from list or quick action)
  const handleApplyToJob = async (job) => {
    if (job.applied) return;

    try {
      await applicationService.applyForJob({
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
      });

      setRecommendedJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, applied: true } : j))
      );

      toast.success(`Applied to ${job.title}! Applications status card updated (+1).`);
    } catch (err) {
      toast.info(err.message || 'Already applied to this position.');
    }
  };

  // ACTION 2: Withdraw an application (replicates in status card -1)
  const handleWithdrawApplication = async (appId, title) => {
    try {
      await applicationService.withdrawApplication(appId);
      setRecommendedJobs((prev) =>
        prev.map((j) => (j.title === title ? { ...j, applied: false } : j))
      );
      toast.info(`Application for "${title}" withdrawn. Applications count decremented (-1).`);
    } catch (err) {
      toast.error('Failed to withdraw application: ' + err.message);
    }
  };

  // ACTION 3: Bookmark / Save Job (replicates in status card)
  const handleToggleSaveJob = async (jobId, title) => {
    const isCurrentlySaved = applicationService.isJobSaved(jobId);
    if (isCurrentlySaved) {
      await applicationService.removeSavedJob(jobId);
      setRecommendedJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, saved: false } : j))
      );
      toast.info(`Removed "${title}" from bookmarks (-1 Saved Jobs card).`);
    } else {
      const rec = recommendedJobs.find((j) => j.id === jobId);
      await applicationService.saveJob({
        id: jobId,
        title: title,
        company: rec?.company || 'Partner Enterprise',
        location: rec?.location || 'Remote',
        salaryRange: rec?.salary || '$120,000 - $150,000',
      });
      setRecommendedJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, saved: true } : j))
      );
      toast.success(`Saved "${title}" to your bookmarks (+1 Saved Jobs card).`);
    }
  };

  // QUICK ACTION: 1-Click Apply to Next Recommended Job
  const handleQuickApplyNext = () => {
    const unapplied = recommendedJobs.find((j) => !j.applied);
    if (!unapplied) {
      toast.info('You have already applied to all recommended positions!');
      return;
    }
    handleApplyToJob(unapplied);
  };

  // QUICK ACTION: Quick Save Opportunity
  const handleQuickSaveOpportunity = () => {
    const unsaved = recommendedJobs.find((j) => !j.saved);
    if (!unsaved) {
      toast.info('All featured opportunities are currently saved!');
      return;
    }
    handleToggleSaveJob(unsaved.id, unsaved.title);
  };

  // QUICK ACTION: Accept / Schedule New Interview
  const handleQuickConfirmInterview = () => {
    setScheduledInterviewsCount((prev) => prev + 1);
    toast.success('Interview slot confirmed! Interviews Scheduled status card updated (+1).');
  };

  // QUICK ACTION: Resume Upload Simulation
  const handleResumeUpload = () => {
    toast.success('Resume profile updated to latest version (2026_Resume.pdf)!');
  };

  // Filtered applications
  const filteredApplications =
    filter === 'all'
      ? applications
      : applications.filter((a) => a.status.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="w-full space-y-6">
      {/* Top Welcome Hero Banner (Edge-to-Edge Glassmorphism) */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 p-6 sm:p-8 backdrop-blur-xl border border-white/15 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md text-xs font-semibold text-blue-300 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Candidate Career Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Candidate'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {user?.title || 'Senior Frontend Developer'} • Monitor your live job application stages, review interview schedules, and take instant actions below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/profile"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              Manage Profile
            </Link>
          </div>
        </div>
      </div>

      {/* TOP 5 STATUS CARDS (Every Action Replicates Here Live!) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
        {/* Status Card 1: Total Applications */}
        <Link
          to="/applications"
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-blue-400/50 hover:bg-white/[0.07] transition-all shadow-lg group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-300 transition-colors">
              Total Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totalApplicationsCount}</p>
          <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> Live updated upon every submission
          </p>
        </Link>

        {/* Status Card 2: Interviews Scheduled */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-emerald-400/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Interviews Scheduled
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{scheduledInterviewsCount}</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Next: Confirmed for this week
          </p>
        </div>

        {/* Status Card 3: Shortlisted */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-purple-400/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Shortlisted
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{shortlistedCount}</p>
          <p className="mt-1 text-[11px] text-purple-300 font-medium">
            Top profile match review
          </p>
        </div>

        {/* Status Card 4: Saved Jobs */}
        <Link
          to="/applications?tab=saved"
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-400/50 hover:bg-white/[0.07] transition-all shadow-lg group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-amber-300 transition-colors">
              Saved Jobs
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totalSavedJobsCount}</p>
          <p className="mt-1 text-[11px] text-amber-300">
            Bookmarks saved for quick apply
          </p>
        </Link>

        {/* Status Card 5: Partner Companies (Replicates Live on Company CRUD!) */}
        <Link
          to="/companies"
          className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-blue-400/50 hover:bg-white/[0.07] transition-all shadow-lg group block cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-blue-300 transition-colors">
              Partner Companies
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{companyCount}</p>
          <p className="mt-1 text-[11px] text-blue-400 font-medium flex items-center gap-1">
            <span>Explore hiring partners</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </p>
        </Link>
      </div>

      {/* QUICK ACTION CARDS (All Directly Replicate in Status Cards) */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Candidate Quick Actions
          </h2>
          <span className="text-xs text-slate-400">Click any card to execute & update status cards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
          {/* Quick Action 1: 1-Click Apply */}
          <button
            type="button"
            onClick={handleQuickApplyNext}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-blue-400/40 text-left transition-all shadow-md group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-blue-500/30">
              <ArrowRight className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
              1-Click Apply
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Apply to next top match position (+1 Applications Card)
            </p>
          </button>

          {/* Quick Action 2: Save Opportunity */}
          <button
            type="button"
            onClick={handleQuickSaveOpportunity}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-amber-400/40 text-left transition-all shadow-md group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-amber-500/30">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
              Save Next Job
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Bookmark featured role for review (+1 Saved Jobs Card)
            </p>
          </button>

          {/* Quick Action 3: Confirm Interview */}
          <button
            type="button"
            onClick={handleQuickConfirmInterview}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 text-left transition-all shadow-md group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-emerald-500/30">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
              Confirm Interview
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Accept recruiter interview slot (+1 Interviews Card)
            </p>
          </button>

          {/* Quick Action 4: Resume Update */}
          <button
            type="button"
            onClick={handleResumeUpload}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 text-left transition-all shadow-md group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-purple-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
              Upload CV / Resume
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Attach latest resume file to active candidate portfolio
            </p>
          </button>

          {/* Quick Action 5: Explore Companies */}
          <Link
            to="/companies"
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-blue-400/40 text-left transition-all shadow-md group block"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-blue-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
              Explore Companies
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Browse top hiring organizations & opportunities
            </p>
          </Link>
        </div>
      </div>

      {/* Main Content Grid: Applications Tracker + Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left: Active Submissions (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Active Job Submissions
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {filteredApplications.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every applied or withdrawn job automatically recalculates your status cards
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white/[0.05] p-1 rounded-xl border border-white/10">
              {['all', 'Interview', 'Under Review', 'Shortlisted'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filter === item
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item === 'all' ? 'All' : item}
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          <div className="divide-y divide-white/5">
            {filteredApplications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No applications found under this filter.
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-white">{app.title}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${app.statusColor}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        {app.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {app.location}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-300">
                        <DollarSign className="w-3.5 h-3.5" />
                        {app.salary}
                      </span>
                      <span className="text-slate-400">Applied {app.appliedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleWithdrawApplication(app.id, app.title)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-600/15 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg transition-all flex items-center gap-1"
                      title="Withdraw application and update status card (-1)"
                    >
                      <Trash2 className="w-3 h-3" />
                      Withdraw
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recommended Opportunities (Apply & Save Update Status Cards) */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Featured Job Matches
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Click Apply or Save to update metrics</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-white">{job.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      {job.company} • {job.location}
                    </p>
                  </div>

                  {/* Bookmark Button (Updates Saved Jobs Status Card) */}
                  <button
                    type="button"
                    onClick={() => handleToggleSaveJob(job.id, job.title)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      job.saved
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                        : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                    }`}
                    title={job.saved ? 'Remove Bookmark' : 'Save Job'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-emerald-400">{job.salary}</span>
                  {/* Apply Button (Updates Applications Status Card) */}
                  <button
                    type="button"
                    disabled={job.applied}
                    onClick={() => handleApplyToJob(job)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      job.applied
                        ? 'bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 border border-white/20'
                    }`}
                  >
                    {job.applied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                      </>
                    ) : (
                      <>
                        Apply Now <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/jobs"
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-blue-300 hover:text-white border border-white/10 transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Explore All Job Opportunities
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
