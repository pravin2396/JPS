import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Bookmark,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Trash2,
  X,
  Send,
  Eye,
  BookmarkCheck,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  applicationService,
  APPLICATION_STATUS_OPTIONS,
} from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 6;

const Applications = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'applied' | 'saved'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => (tabParam === 'saved' ? 'saved' : 'applied'));

  // Sync tab if URL param changes
  useEffect(() => {
    if (tabParam === 'saved' || tabParam === 'applied') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', newTab);
      return next;
    });
  };

  // Data lists
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [withdrawingApp, setWithdrawingApp] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load applications & saved jobs
  const loadData = () => {
    setLoading(true);
    try {
      const apps = applicationService.getAppliedJobs();
      const saved = applicationService.getSavedJobs();
      const jobs = jobService.getLocalJobs();
      setApplications(apps);
      setSavedJobs(saved);
      setAvailableJobs(jobs);
    } catch (e) {
      console.warn('Error loading applications data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Event listeners for cross-component sync
    const handleSync = () => {
      setApplications(applicationService.getAppliedJobs());
      setSavedJobs(applicationService.getSavedJobs());
    };

    window.addEventListener('applications_updated', handleSync);
    window.addEventListener('saved_jobs_updated', handleSync);
    window.addEventListener('candidate_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('applications_updated', handleSync);
      window.removeEventListener('saved_jobs_updated', handleSync);
      window.removeEventListener('candidate_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // ACTION: Withdraw Application (UI Only)
  const handleConfirmWithdraw = async () => {
    if (!withdrawingApp) return;
    setIsSubmitting(true);
    try {
      await applicationService.withdrawApplication(withdrawingApp.id);
      setApplications((prev) => prev.filter((a) => a.id !== withdrawingApp.id));
      toast.info(
        `Application for "${withdrawingApp.title}" withdrawn. Replicated in Network Tab (DELETE 200) & Dashboard cards (-1).`
      );
      setWithdrawingApp(null);
    } catch (err) {
      toast.error('Failed to withdraw application: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ACTION: Remove Saved Job
  const handleRemoveSavedJob = async (jobId, title) => {
    try {
      await applicationService.removeSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((j) => String(j.id) !== String(jobId)));
      toast.info(`Removed "${title}" from saved bookmarks (-1 Saved Jobs card).`);
    } catch (err) {
      toast.error('Failed to remove saved job: ' + err.message);
    }
  };

  // ACTION: Apply for Job from Modal or Saved Jobs
  const handleOpenApplyModal = (job = null) => {
    setSelectedJobToApply(job);
    setCoverNote(
      'I am enthusiastic to bring my experience in building scalable modern web applications to your engineering team.'
    );
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJobToApply) {
      toast.warning('Please select a position to apply for.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdApp = await applicationService.applyForJob({
        jobId: selectedJobToApply.id,
        title: selectedJobToApply.title,
        company: selectedJobToApply.company,
        companyLogo: selectedJobToApply.companyLogo,
        location: selectedJobToApply.location,
        salary: selectedJobToApply.salaryRange || selectedJobToApply.salary,
        category: selectedJobToApply.category,
        notes: coverNote,
        applicantName: user?.name || 'Candidate',
        applicantEmail: user?.email || 'candidate@example.com',
      });

      setApplications((prev) => [createdApp, ...prev]);
      setShowApplyModal(false);
      setSelectedJobToApply(null);
      setCoverNote('');
      toast.success(
        `Application submitted for "${createdApp.title}"! Replicated in Network Tab (POST 201), LocalStorage, and Dashboard cards (+1).`
      );
    } catch (err) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search Applied Jobs
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Search Applications
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = app.title?.toLowerCase().includes(query);
        const matchCompany = app.company?.toLowerCase().includes(query);
        const matchLocation = app.location?.toLowerCase().includes(query);
        const matchNotes = app.notes?.toLowerCase().includes(query);
        if (!matchTitle && !matchCompany && !matchLocation && !matchNotes) {
          return false;
        }
      }

      // Application Status Filter
      if (statusFilter !== 'All' && app.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, statusFilter]);

  // Filter & Search Saved Jobs
  const filteredSavedJobs = useMemo(() => {
    return savedJobs.filter((job) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = job.title?.toLowerCase().includes(query);
        const matchCompany = job.company?.toLowerCase().includes(query);
        const matchLocation = job.location?.toLowerCase().includes(query);
        if (!matchTitle && !matchCompany && !matchLocation) {
          return false;
        }
      }
      return true;
    });
  }, [savedJobs, searchQuery]);

  // Active dataset based on tab
  const activeDataset = activeTab === 'applied' ? filteredApplications : filteredSavedJobs;

  // Pagination
  const totalItems = activeDataset.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeDataset.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [activeDataset, currentPage]);

  // Reset page when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeTab]);

  return (
    <div className="w-full space-y-6">
      {/* Edge-to-Edge Header Banner (Vertically centered title, no star badge) */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 px-6 py-6 sm:px-8 backdrop-blur-xl border border-white/15 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center my-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-normal">
              Applications & Saved Jobs
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenApplyModal()}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Apply for Job
            </button>
            <Link
              to="/jobs"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              Explore Openings
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Switcher & Search / Filter Controls */}
      <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Row 1: Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTabChange('applied')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                activeTab === 'applied'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Applied Jobs</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/30 text-white">
                {applications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('saved')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                activeTab === 'saved'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Jobs</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/30 text-white">
                {savedJobs.length}
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline-block">
            Track stages, withdraw submissions, and manage bookmarked positions
          </span>
        </div>

        {/* Row 2: Search Applications Bar & Status Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Feature: Search Applications */}
          <div className="sm:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={
                activeTab === 'applied'
                  ? 'Search applications by job title, company, location...'
                  : 'Search saved positions by title, company, location...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-white/[0.07] text-white placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white/[0.12] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Feature: Application Status Filter (Applied Tab Only) */}
          {activeTab === 'applied' ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 cursor-pointer"
              >
                {APPLICATION_STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0f142b] text-white">
                    Status: {opt}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center justify-end text-xs text-slate-400 px-2">
              <span>{savedJobs.length} positions bookmarked for review</span>
            </div>
          )}
        </div>

        {/* Status Pills Summary Bar */}
        {activeTab === 'applied' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-[11px]">
            <span className="text-slate-400 font-semibold mr-1">Quick Filter:</span>
            {APPLICATION_STATUS_OPTIONS.filter((s) => s !== 'All').map((status) => {
              const count = applications.filter((a) => a.status === status).length;
              const isSelected = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(isSelected ? 'All' : status)}
                  className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600/30 text-blue-200 border-blue-400'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <span>{status}</span>
                  <span className="font-mono text-[10px] text-slate-400">({count})</span>
                </button>
              );
            })}
            {(searchQuery || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="text-blue-400 hover:text-white underline text-[11px] ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      ) : activeDataset.length === 0 ? (
        /* Empty State */
        <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-lg space-y-3">
          {activeTab === 'applied' ? (
            <FileText className="w-12 h-12 text-slate-500 mx-auto" />
          ) : (
            <Bookmark className="w-12 h-12 text-slate-500 mx-auto" />
          )}
          <h3 className="text-lg font-bold text-white">
            {activeTab === 'applied' ? 'No Job Applications Found' : 'No Saved Jobs Yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'applied'
              ? 'You have not submitted applications matching your active filter criteria. Explore openings and apply.'
              : 'Save interesting vacancies to review later and apply with 1-click.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {activeTab === 'applied' ? (
              <button
                type="button"
                onClick={() => handleOpenApplyModal()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500"
              >
                Submit New Application
              </button>
            ) : (
              <Link
                to="/jobs"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-500"
              >
                Browse Job Postings
              </Link>
            )}
          </div>
        </div>
      ) : activeTab === 'applied' ? (
        /* APPLIED JOBS LIST (Feature 2 & 3) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {paginatedItems.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all shadow-xl p-6 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Header: Company Logo, Title & Application Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        app.companyLogo ||
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={app.company}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/15 bg-slate-900 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-400 block truncate">
                        {app.company}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                        {app.title}
                      </h3>
                    </div>
                  </div>

                  {/* Feature 3: Application Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md flex-shrink-0 ${
                      app.statusColor || 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {app.status}
                  </span>
                </div>

                {/* Metadata: Location, Salary, Applied Date */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span className="truncate">{app.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-white">{app.salary}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>Applied: {app.appliedDate}</span>
                  </div>
                </div>

                {/* Notes preview */}
                {app.notes && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                    &ldquo;{app.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Card Footer: View Details & Withdraw Application (Feature 4) */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setViewingApp(app)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  View Status
                </button>

                {/* Feature 4: Withdraw Application (UI Only) */}
                <button
                  type="button"
                  onClick={() => setWithdrawingApp(app)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/25 transition-all flex items-center gap-1"
                  title="Withdraw application (-1 status card)"
                >
                  <Trash2 className="w-3 h-3" />
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* SAVED JOBS LIST (Feature 7) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {paginatedItems.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-amber-400/30 transition-all shadow-xl p-6 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        job.companyLogo ||
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={job.company}
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/15 bg-slate-900 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-400 block truncate">
                        {job.company}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                        {job.title}
                      </h3>
                    </div>
                  </div>

                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                    <BookmarkCheck className="w-4 h-4" />
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-white">{job.salaryRange}</span>
                  </div>

                  {job.deadline && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>Deadline: {job.deadline}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Feature 6 Remove Saved Job + Apply Now */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                {/* Feature 6: Remove Saved Job */}
                <button
                  type="button"
                  onClick={() => handleRemoveSavedJob(job.id, job.title)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-colors"
                  title="Remove from Saved Jobs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors"
                  >
                    Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenApplyModal(job)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30 border border-white/20 transition-all flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-slate-400">
          <div>
            Showing{' '}
            <strong className="text-white">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-white">
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
            </strong>{' '}
            of <strong className="text-white">{totalItems}</strong> items
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold border transition-all ${
                  currentPage === pg
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/15'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Feature 1: APPLY FOR JOB MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e1329] border border-white/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Apply for Job Position</h3>
                  <p className="text-[11px] text-slate-400">
                    Submit application to employer hiring portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
              {/* Select Job if not preselected */}
              <div>
                <label className="block font-medium text-slate-200 mb-1">
                  Target Job Position <span className="text-rose-400">*</span>
                </label>
                {selectedJobToApply ? (
                  <div className="p-3 rounded-xl bg-white/[0.05] border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <strong className="text-white text-sm block">
                        {selectedJobToApply.title}
                      </strong>
                      <span className="text-blue-400 font-semibold">
                        {selectedJobToApply.company} • {selectedJobToApply.location}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedJobToApply(null)}
                      className="text-slate-400 hover:text-white text-[11px] underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <select
                    onChange={(e) => {
                      const found = availableJobs.find((j) => String(j.id) === e.target.value);
                      if (found) setSelectedJobToApply(found);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select an open position...
                    </option>
                    {availableJobs
                      .filter((j) => j.status === 'Open')
                      .map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} — {j.company} ({j.salaryRange})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Applicant Info (pre-filled from profile) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-200 mb-1">Applicant Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name || 'Candidate'}
                    disabled
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-200 mb-1">Contact Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'candidate@example.com'}
                    disabled
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Cover Note */}
              <div>
                <label className="block font-medium text-slate-200 mb-1">
                  Cover Note / Pitch to Recruiter
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Share a brief message highlighting relevant skills..."
                  className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                ></textarea>
              </div>

              {/* Attached Resume Status */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Resume Attached from Candidate Profile</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Verified PDF
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedJobToApply}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl shadow-md border border-white/20 transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Submitting...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feature 4: WITHDRAW APPLICATION CONFIRMATION DIALOG (UI Only) */}
      {withdrawingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0e1329] rounded-2xl border border-rose-500/30 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Withdraw Job Application?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to withdraw your submission for{' '}
                <strong className="text-white">{withdrawingApp.title}</strong> at{' '}
                <strong className="text-white">{withdrawingApp.company}</strong>?
                This will remove the application and decrement your dashboard counter (-1).
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawingApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/15"
              >
                Keep Application
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmWithdraw}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
              >
                {isSubmitting ? 'Withdrawing...' : 'Yes, Withdraw Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature 3: APPLICATION STATUS DETAIL MODAL */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0e1329] border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Application Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <strong className="text-white text-sm block">{viewingApp.title}</strong>
                <p className="text-blue-400 font-semibold">{viewingApp.company}</p>
                <p className="text-slate-400">
                  {viewingApp.location} • {viewingApp.salary}
                </p>
              </div>

              {/* Status Stepper */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Current Hiring Stage:
                </span>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                      viewingApp.statusColor || 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {viewingApp.status}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Applied: {viewingApp.appliedDate}
                  </span>
                </div>
              </div>

              {viewingApp.notes && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Application Note:
                  </span>
                  <p className="text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 leading-relaxed">
                    {viewingApp.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setViewingApp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
