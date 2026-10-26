import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  CalendarCheck,
  PlusCircle,
  Building,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  X,
  UserCheck,
  Trash2,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const LOCAL_STORAGE_KEY = 'jps_recruiter_dashboard_state';

// Initial default jobs
const INITIAL_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer (React/Tailwind)',
    dept: 'Engineering',
    location: 'Remote, US',
    applicantsCount: 34,
    status: 'Active',
    postedDate: '3 days ago',
  },
  {
    id: 'job-2',
    title: 'Backend Node.js & Go Developer',
    dept: 'Platform',
    location: 'Austin, TX / Hybrid',
    applicantsCount: 19,
    status: 'Active',
    postedDate: '1 week ago',
  },
  {
    id: 'job-3',
    title: 'Lead Product Designer',
    dept: 'Product Design',
    location: 'Remote',
    applicantsCount: 27,
    status: 'Active',
    postedDate: '2 weeks ago',
  },
];

// Initial default applicants
const INITIAL_APPLICANTS = [
  {
    id: 'app-1',
    name: 'Alex Johnson',
    roleApplied: 'Senior Frontend Engineer',
    experience: '5+ years',
    matchScore: '96%',
    status: 'Reviewing',
  },
  {
    id: 'app-2',
    name: 'Michael Chen',
    roleApplied: 'Backend Node.js & Go Developer',
    experience: '4 years',
    matchScore: '92%',
    status: 'Shortlisted',
  },
  {
    id: 'app-3',
    name: 'Sophia Williams',
    roleApplied: 'Lead Product Designer',
    experience: '6 years',
    matchScore: '89%',
    status: 'Reviewing',
  },
];

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [showPostModal, setShowPostModal] = useState(false);

  // Form states for new job
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('Remote');
  const [jobDept, setJobDept] = useState('Engineering');
  const [jobSalary, setJobSalary] = useState('$130k - $160k');

  // Load state from LocalStorage or initialize
  const [jobs, setJobs] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.jobs || INITIAL_JOBS;
      }
    } catch (e) {
      console.warn('Failed loading recruiter jobs state:', e);
    }
    return INITIAL_JOBS;
  });

  const [applicants, setApplicants] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.applicants || INITIAL_APPLICANTS;
      }
    } catch (e) {
      console.warn('Failed loading recruiter applicants state:', e);
    }
    return INITIAL_APPLICANTS;
  });

  const [hiresCount, setHiresCount] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.hiresCount ?? 6;
      }
    } catch (e) {
      console.warn('Failed loading recruiter hires count:', e);
    }
    return 6;
  });

  // Calculate live dynamic metrics directly from data!
  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const totalApplicantsCount = jobs.reduce((acc, j) => acc + j.applicantsCount, 0);
  const interviewsCount = applicants.filter((a) => a.status === 'Interview Scheduled').length + 9;
  const shortlistedCandidatesCount = applicants.filter((a) => a.status === 'Shortlisted').length + 15;

  // Persist to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          jobs,
          applicants,
          hiresCount,
        })
      );
    } catch (e) {
      console.warn('Failed to persist recruiter dashboard state:', e);
    }
  }, [jobs, applicants, hiresCount]);

  // ACTION 1: Publish New Position (replicates in status cards: Active Jobs +1)
  const handleCreateJob = (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      toast.warning('Please enter a job position title');
      return;
    }

    const newJob = {
      id: `job-${Date.now()}`,
      title: jobTitle,
      dept: jobDept,
      location: jobLocation,
      applicantsCount: 0,
      status: 'Active',
      postedDate: 'Just now',
    };

    setJobs((prev) => [newJob, ...prev]);
    setJobTitle('');
    setShowPostModal(false);
    toast.success(`Published "${jobTitle}"! Active Job Postings status card updated (+1).`);
  };

  // ACTION 2: Close an Active Vacancy (replicates in status cards: Active Jobs -1, Hires +1)
  const handleCloseJob = (jobId, title) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const nextStatus = j.status === 'Active' ? 'Closed' : 'Active';
          if (nextStatus === 'Closed') {
            setHiresCount((h) => h + 1);
            toast.info(`Position "${title}" marked as Closed. Active Openings decremented (-1).`);
          } else {
            toast.success(`Position "${title}" reopened. Active Openings incremented (+1).`);
          }
          return { ...j, status: nextStatus };
        }
        return j;
      })
    );
  };

  // ACTION 3: Delete a Job (replicates in status cards)
  const handleDeleteJob = (jobId, title) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    toast.info(`Position "${title}" removed from listings. Status card updated.`);
  };

  // ACTION 4: Update Applicant Status (replicates in Interviews / Shortlisted cards!)
  const updateApplicantStatus = (applicantId, newStatus) => {
    setApplicants((prev) =>
      prev.map((a) => {
        if (a.id === applicantId) {
          if (newStatus === 'Interview Scheduled') {
            toast.success(`Scheduled interview with ${a.name}! Interviews status card updated (+1).`);
          } else if (newStatus === 'Shortlisted') {
            toast.success(`${a.name} shortlisted! Shortlisted Candidates status card updated (+1).`);
          } else if (newStatus === 'Rejected') {
            toast.info(`Candidate ${a.name} marked as Rejected.`);
          }
          return { ...a, status: newStatus };
        }
        return a;
      })
    );
  };

  // QUICK ACTION: Quick Schedule Top Interview
  const handleQuickScheduleTopInterview = () => {
    const candidateToInterview = applicants.find((a) => a.status !== 'Interview Scheduled');
    if (!candidateToInterview) {
      toast.info('All current pipeline applicants already have scheduled interviews!');
      return;
    }
    updateApplicantStatus(candidateToInterview.id, 'Interview Scheduled');
  };

  // QUICK ACTION: Quick Shortlist Top Match
  const handleQuickShortlistTopCandidate = () => {
    const candidateToShortlist = applicants.find((a) => a.status !== 'Shortlisted');
    if (!candidateToShortlist) {
      toast.info('All top pipeline candidates are already shortlisted!');
      return;
    }
    updateApplicantStatus(candidateToShortlist.id, 'Shortlisted');
  };

  // QUICK ACTION: Quick Close First Position
  const handleQuickClosePosition = () => {
    const activeJob = jobs.find((j) => j.status === 'Active');
    if (!activeJob) {
      toast.info('No active job vacancies to close!');
      return;
    }
    handleCloseJob(activeJob.id, activeJob.title);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Welcome Hero Banner (Edge-to-Edge Glassmorphism) */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-slate-900/80 p-6 sm:p-8 backdrop-blur-xl border border-white/15 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Employer Hiring Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name || 'Recruiter'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {user?.designation || 'Lead Talent Acquisition Partner'} at{' '}
              <strong className="text-white underline decoration-emerald-400">
                {user?.company || 'TechCorp Innovations'}
              </strong>{' '}
              • Manage published positions, evaluate talent applications, and trigger hiring actions that update your metrics in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/profile"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              Company Profile
            </Link>
          </div>
        </div>
      </div>

      {/* TOP 4 STATUS CARDS (Every Action Replicates Here Live!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Status Card 1: Active Jobs */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-emerald-400/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Job Openings
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{activeJobsCount}</p>
          <p className="mt-1 text-[11px] text-emerald-400 font-medium">
            Live tracked openings accepting CVs
          </p>
        </div>

        {/* Status Card 2: Total Applicants */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-blue-400/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Applicants
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{totalApplicantsCount}</p>
          <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> Across all active openings
          </p>
        </div>

        {/* Status Card 3: Interviews Scheduled */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-purple-400/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Interviews Scheduled
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{interviewsCount}</p>
          <p className="mt-1 text-[11px] text-purple-300 font-medium">
            Live updated upon scheduling
          </p>
        </div>

        {/* Status Card 4: Shortlisted Candidates */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-400/30 transition-all shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Shortlisted Candidates
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-white">{shortlistedCandidatesCount}</p>
          <p className="mt-1 text-[11px] text-amber-300">
            {hiresCount} successful hires completed
          </p>
        </div>
      </div>

      {/* QUICK ACTION CARDS (All Directly Replicate in Status Cards) */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Recruiter Quick Actions
          </h2>
          <span className="text-xs text-slate-400">Click any card to execute & update status cards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Quick Action 1: Post New Opening */}
          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-emerald-400/40 text-left transition-all shadow-md group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-emerald-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
              Post New Opening
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Publish job opening (+1 Active Openings Card)
            </p>
          </button>

          {/* Quick Action 2: Schedule Interview */}
          <button
            type="button"
            onClick={handleQuickScheduleTopInterview}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-purple-400/40 text-left transition-all shadow-md group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-purple-500/30">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
              Schedule Next Interview
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Book slot for top candidate (+1 Interviews Card)
            </p>
          </button>

          {/* Quick Action 3: Shortlist Candidate */}
          <button
            type="button"
            onClick={handleQuickShortlistTopCandidate}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-blue-400/40 text-left transition-all shadow-md group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-blue-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
              Shortlist Top Match
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Move top applicant forward (+1 Shortlisted Card)
            </p>
          </button>

          {/* Quick Action 4: Close Filled Opening */}
          <button
            type="button"
            onClick={handleQuickClosePosition}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-amber-400/40 text-left transition-all shadow-md group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
              Close Filled Vacancy
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Mark position closed & hire recorded (-1 Active Opening)
            </p>
          </button>
        </div>
      </div>

      {/* Main Recruiter Content: Job Openings Table & Candidate Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left: Job Openings Table (2 columns) */}
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Published Job Vacancies
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {jobs.length} Positions
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Closing or deleting any position immediately updates your status cards
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPostModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/25 border border-white/10"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Post Job
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{job.title}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        job.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-emerald-400" />
                      {job.dept}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Posted {job.postedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-300 bg-white/[0.05] border border-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    {job.applicantsCount} Applicants
                  </span>

                  {/* Toggle Active / Closed (Updates Status Card) */}
                  <button
                    type="button"
                    onClick={() => handleCloseJob(job.id, job.title)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg transition-all"
                    title="Toggle vacancy status"
                  >
                    {job.status === 'Active' ? 'Close' : 'Reopen'}
                  </button>

                  {/* Delete Job */}
                  <button
                    type="button"
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded-lg transition-all border border-rose-500/20"
                    title="Delete position"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Candidate Applicants Pipeline (Shortlist / Interview Action Updates Metrics) */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Applicants Pipeline
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Click actions to update status cards</p>
            </div>
          </div>

          <div className="space-y-3">
            {applicants.map((cand) => (
              <div
                key={cand.id}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs sm:text-sm text-white">{cand.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Match {cand.matchScore}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Applied for: <span className="text-slate-200">{cand.roleApplied}</span>
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Exp: {cand.experience}</span>
                  <span className="font-semibold text-emerald-300 text-[11px]">{cand.status}</span>
                </div>

                {/* Actions that directly update status cards */}
                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => updateApplicantStatus(cand.id, 'Shortlisted')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/30 transition-all"
                  >
                    Shortlist (+1)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateApplicantStatus(cand.id, 'Interview Scheduled')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 border border-purple-500/30 transition-all"
                  >
                    Interview (+1)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateApplicantStatus(cand.id, 'Rejected')}
                    className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 border border-rose-500/20 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Post Job Glass Modal Dialog */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0e1329] rounded-2xl border border-white/20 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Publish New Job Position
              </h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Position Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Department
                  </label>
                  <select
                    value={jobDept}
                    onChange={(e) => setJobDept(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-slate-900 text-white outline-none focus:border-emerald-400"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Product Design</option>
                    <option value="Product">Product Management</option>
                    <option value="Data">Data & AI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Workplace Type
                  </label>
                  <select
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-slate-900 text-white outline-none focus:border-emerald-400"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  placeholder="e.g. $130k - $160k"
                  value={jobSalary}
                  onChange={(e) => setJobSalary(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md border border-white/20"
                >
                  Publish Job Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
