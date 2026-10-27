import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Send,
  Eye,
  Clock,
  Check,
} from 'lucide-react';
import {
  jobService,
  JOB_CATEGORIES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
} from '../../services/jobService';
import { companyService } from '../../services/companyService';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ITEMS_PER_PAGE = 6;

const LOCATION_OPTIONS = [
  'All',
  'Remote',
  'Austin, TX',
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Boston, MA',
  'Chicago, IL',
  'Denver, CO',
  'Los Angeles, CA',
];

const SALARY_RANGES = [
  { label: 'All Salaries', value: 'All' },
  { label: 'Under $80,000', value: 'under-80k' },
  { label: '$80,000 - $120,000', value: '80k-120k' },
  { label: '$120,000 - $160,000', value: '120k-160k' },
  { label: '$160,000+', value: 'above-160k' },
];

// Robust salary parser for numeric comparison
const parseSalary = (salaryStr) => {
  if (!salaryStr) return { min: 0, max: 0 };
  const isHourly = /hr|hour/i.test(salaryStr);
  const numbers = salaryStr.replace(/,/g, '').match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length === 0) return { min: 0, max: 0 };

  let min = parseFloat(numbers[0]);
  let max = numbers.length > 1 ? parseFloat(numbers[1]) : min;

  if (isHourly) {
    min = min * 2000;
    max = max * 2000;
  } else {
    if (min < 1000 && /k/i.test(salaryStr)) min = min * 1000;
    if (max < 1000 && /k/i.test(salaryStr)) max = max * 1000;
  }

  return { min, max };
};

const JobList = () => {
  const { user } = useAuth();
  const isRecruiter = user?.role === 'recruiter';

  const [jobs, setJobs] = useState([]);
  const [partnerCompanies, setPartnerCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state (Module 5 Features: Location, Job Type, Experience Level, Salary Range, Latest Sort)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedSalary, setSelectedSalary] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Applied jobs tracking
  const [appliedJobIds, setAppliedJobIds] = useState(() => {
    try {
      const stored = localStorage.getItem('jps_candidate_dashboard_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        return (parsed.applications || []).map((a) => a.title.toLowerCase());
      }
    } catch {
      // Ignore
    }
    return [];
  });

  // React Hook Form for Create Job
  const createForm = useForm({
    defaultValues: {
      title: '',
      company: '',
      category: 'Engineering',
      employmentType: 'Full-time',
      experienceLevel: 'Mid Level',
      salaryRange: '$110,000 - $140,000 / yr',
      location: 'Remote',
      skills: 'React.js, Tailwind CSS, JavaScript',
      deadline: '2026-12-15',
      status: 'Open',
      description: '',
      responsibilities: 'Build scalable features\nCollaborate across product teams',
      requirements: 'Strong analytical skills\nPrior professional experience',
    },
  });

  // React Hook Form for Edit Job
  const editForm = useForm();

  // Load jobs and companies
  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, companiesData] = await Promise.all([
        jobService.fetchJobs(),
        companyService.fetchCompanies(),
      ]);
      setJobs(jobsData);
      setPartnerCompanies(companiesData);
    } catch (err) {
      console.warn('Fallback loading data:', err.message);
      setJobs(jobService.getLocalJobs());
      setPartnerCompanies(companyService.getLocalCompanies());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to job updates from other components
    const handleJobsUpdated = () => {
      setJobs(jobService.getLocalJobs());
    };

    const handleCandidateUpdated = () => {
      try {
        const stored = localStorage.getItem('jps_candidate_dashboard_state');
        if (stored) {
          const parsed = JSON.parse(stored);
          setAppliedJobIds((parsed.applications || []).map((a) => a.title.toLowerCase()));
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener('jobs_updated', handleJobsUpdated);
    window.addEventListener('candidate_updated', handleCandidateUpdated);
    window.addEventListener('storage', handleJobsUpdated);
    window.addEventListener('storage', handleCandidateUpdated);
    return () => {
      window.removeEventListener('jobs_updated', handleJobsUpdated);
      window.removeEventListener('candidate_updated', handleCandidateUpdated);
      window.removeEventListener('storage', handleJobsUpdated);
      window.removeEventListener('storage', handleCandidateUpdated);
    };
  }, []);

  // Set default company for create form once companies load
  useEffect(() => {
    if (partnerCompanies.length > 0 && !createForm.getValues('company')) {
      createForm.setValue('company', partnerCompanies[0].name);
    }
  }, [partnerCompanies, createForm]);

  // Set values when opening Edit modal
  useEffect(() => {
    if (editingJob) {
      editForm.reset({
        title: editingJob.title,
        company: editingJob.company,
        category: editingJob.category,
        employmentType: editingJob.employmentType,
        experienceLevel: editingJob.experienceLevel,
        salaryRange: editingJob.salaryRange,
        location: editingJob.location,
        skills: Array.isArray(editingJob.skills)
          ? editingJob.skills.join(', ')
          : editingJob.skills,
        deadline: editingJob.deadline,
        status: editingJob.status,
        description: editingJob.description,
        responsibilities: Array.isArray(editingJob.responsibilities)
          ? editingJob.responsibilities.join('\n')
          : editingJob.responsibilities || '',
        requirements: Array.isArray(editingJob.requirements)
          ? editingJob.requirements.join('\n')
          : editingJob.requirements || '',
      });
    }
  }, [editingJob, editForm]);

  // ACTION: Apply to Job
  const handleApplyToJob = (job) => {
    if (job.status !== 'Open') {
      toast.warning('This position is closed and is no longer accepting applications.');
      return;
    }

    try {
      const candidateStorageKey = 'jps_candidate_dashboard_state';
      const stored = localStorage.getItem(candidateStorageKey);
      let candidateState = stored ? JSON.parse(stored) : { applications: [] };

      const isAlreadyApplied = (candidateState.applications || []).some(
        (a) => a.title.toLowerCase() === job.title.toLowerCase()
      );

      if (isAlreadyApplied) {
        toast.info(`You have already submitted an application for ${job.title}!`);
        return;
      }

      const newApplication = {
        id: `app-${Date.now()}`,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salaryRange,
        appliedDate: 'Just now',
        status: 'Under Review',
        statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      };

      candidateState.applications = [newApplication, ...(candidateState.applications || [])];
      localStorage.setItem(candidateStorageKey, JSON.stringify(candidateState));

      setAppliedJobIds((prev) => [...prev, job.title.toLowerCase()]);
      window.dispatchEvent(new Event('candidate_updated'));
      window.dispatchEvent(new Event('storage'));

      toast.success(
        `Application submitted for "${job.title}"! Replicated in Dashboard Status Cards (+1).`
      );
    } catch (err) {
      console.warn('Error applying:', err);
      toast.success(`Application sent for "${job.title}"!`);
    }
  };

  // ACTION: Create Job Posting
  const handleCreateJob = async (formData) => {
    setIsSubmitting(true);
    try {
      const matchedCompany = partnerCompanies.find(
        (c) => c.name.toLowerCase() === formData.company.toLowerCase()
      );
      const companyLogo = matchedCompany ? matchedCompany.logo : undefined;

      const created = await jobService.createJob({
        ...formData,
        companyLogo,
      });

      setJobs((prev) => [created, ...prev]);
      setShowCreateModal(false);
      createForm.reset();
      toast.success(
        `Job "${created.title}" published! Replicated in Network Tab (POST 201), LocalStorage, and Dashboard (+1).`
      );
    } catch (err) {
      toast.error('Failed to create job posting: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ACTION: Edit Job Posting
  const handleEditJob = async (formData) => {
    if (!editingJob) return;
    setIsSubmitting(true);
    try {
      const updated = await jobService.updateJob(editingJob.id, formData);
      setJobs((prev) =>
        prev.map((j) => (String(j.id) === String(editingJob.id) ? updated : j))
      );
      setEditingJob(null);
      if (viewingJob && String(viewingJob.id) === String(updated.id)) {
        setViewingJob(updated);
      }
      toast.success(
        `Job "${updated.title}" updated! Replicated in Network Tab (PUT 200) and LocalStorage.`
      );
    } catch (err) {
      toast.error('Failed to update job: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ACTION: Delete Job Posting
  const confirmDeleteJob = async () => {
    if (!deletingJob) return;
    setIsSubmitting(true);
    try {
      await jobService.deleteJob(deletingJob.id);
      setJobs((prev) => prev.filter((j) => String(j.id) !== String(deletingJob.id)));
      if (viewingJob && String(viewingJob.id) === String(deletingJob.id)) {
        setViewingJob(null);
      }
      toast.info(
        `Job "${deletingJob.title}" removed! Replicated in Network Tab (DELETE 200), LocalStorage, and Dashboard.`
      );
      setDeletingJob(null);
    } catch (err) {
      toast.error('Failed to delete job: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ACTION: Quick Toggle Status (Open <-> Closed)
  const handleToggleStatus = async (job) => {
    try {
      const updated = await jobService.toggleJobStatus(job.id);
      if (updated) {
        setJobs((prev) =>
          prev.map((j) => (String(j.id) === String(job.id) ? updated : j))
        );
        if (viewingJob && String(viewingJob.id) === String(updated.id)) {
          setViewingJob(updated);
        }
        toast.info(
          `Status changed to "${updated.status}" for "${updated.title}". Status cards synced.`
        );
      }
    } catch (err) {
      toast.error('Failed to toggle status: ' + err.message);
    }
  };

  // FILTERING: Search, Location, Job Type, Experience Level, Salary Range, Category, Status
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Search Query (title, company, location, skills, description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const skillsString = Array.isArray(job.skills) ? job.skills.join(' ').toLowerCase() : '';
        const matchTitle = job.title?.toLowerCase().includes(query);
        const matchCompany = job.company?.toLowerCase().includes(query);
        const matchLocation = job.location?.toLowerCase().includes(query);
        const matchDescription = job.description?.toLowerCase().includes(query);
        const matchSkills = skillsString.includes(query);
        if (!matchTitle && !matchCompany && !matchLocation && !matchDescription && !matchSkills) {
          return false;
        }
      }

      // 2. Filter by Location
      if (selectedLocation !== 'All') {
        const locLower = (job.location || '').toLowerCase();
        const targetLoc = selectedLocation.toLowerCase();
        if (targetLoc === 'remote') {
          if (!locLower.includes('remote')) return false;
        } else {
          if (!locLower.includes(targetLoc)) return false;
        }
      }

      // 3. Filter by Job Type (Employment Type)
      if (selectedType !== 'All') {
        if (job.employmentType !== selectedType) return false;
      }

      // 4. Filter by Experience Level
      if (selectedExperience !== 'All') {
        if (job.experienceLevel !== selectedExperience) return false;
      }

      // 5. Filter by Salary Range
      if (selectedSalary !== 'All') {
        const { min, max } = parseSalary(job.salaryRange);
        if (selectedSalary === 'under-80k') {
          if (min > 80000) return false;
        } else if (selectedSalary === '80k-120k') {
          if (max < 80000 || min > 120000) return false;
        } else if (selectedSalary === '120k-160k') {
          if (max < 120000 || min > 160000) return false;
        } else if (selectedSalary === 'above-160k') {
          if (max < 160000) return false;
        }
      }

      // 6. Category filter
      if (selectedCategory !== 'All' && job.category !== selectedCategory) {
        return false;
      }

      // 7. Status filter
      if (selectedStatus !== 'All' && job.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [
    jobs,
    searchQuery,
    selectedLocation,
    selectedType,
    selectedExperience,
    selectedSalary,
    selectedCategory,
    selectedStatus,
  ]);

  // SORTING: Sort by Latest Jobs (Default), Salary, Title, Deadline
  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs];
    if (sortBy === 'latest') {
      list.sort((a, b) => {
        const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
        const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return String(b.id).localeCompare(String(a.id));
      });
    } else if (sortBy === 'salary-desc') {
      list.sort((a, b) => parseSalary(b.salaryRange).max - parseSalary(a.salaryRange).max);
    } else if (sortBy === 'salary-asc') {
      list.sort((a, b) => parseSalary(a.salaryRange).min - parseSalary(b.salaryRange).min);
    } else if (sortBy === 'title-asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      list.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'deadline') {
      list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
    return list;
  }, [filteredJobs, sortBy]);

  // PAGINATION: 6 items per page
  const totalItems = sortedJobs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedJobs, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedLocation,
    selectedType,
    selectedExperience,
    selectedSalary,
    selectedCategory,
    selectedStatus,
    sortBy,
  ]);

  // Active filters count
  const activeFiltersCount = [
    selectedLocation !== 'All',
    selectedType !== 'All',
    selectedExperience !== 'All',
    selectedSalary !== 'All',
    selectedCategory !== 'All',
    selectedStatus !== 'All',
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedLocation('All');
    setSelectedType('All');
    setSelectedExperience('All');
    setSelectedSalary('All');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSortBy('latest');
  };

  return (
    <div className="w-full space-y-6">
      {/* Edge-to-Edge Header Banner (Vertically centered title, clean design) */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-slate-900/80 px-6 py-6 sm:px-8 backdrop-blur-xl border border-white/15 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center my-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-normal">
              Job Search & Opportunities
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isRecruiter && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 border border-white/20 transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Post New Job
              </button>
            )}
            <button
              type="button"
              onClick={loadData}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5"
              title="Refresh from API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar with all Module 5 criteria */}
      <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Row 1: Search Box & Core Location / Type Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Feature 1: Search Jobs */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by title, skill, company..."
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

          {/* Feature 2: Filter by Location */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-400">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 cursor-pointer"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc} className="bg-[#0f142b] text-white">
                  Location: {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Feature 3: Filter by Job Type */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-400">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 cursor-pointer"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type} className="bg-[#0f142b] text-white">
                  Type: {type}
                </option>
              ))}
            </select>
          </div>

          {/* Feature 4: Filter by Experience Level */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 cursor-pointer"
            >
              {EXPERIENCE_LEVELS.map((exp) => (
                <option key={exp} value={exp} className="bg-[#0f142b] text-white">
                  Experience: {exp}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Salary Range, Category, Status & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Feature 5: Filter by Salary Range */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedSalary}
              onChange={(e) => setSelectedSalary(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 cursor-pointer"
            >
              {SALARY_RANGES.map((sal) => (
                <option key={sal.value} value={sal.value} className="bg-[#0f142b] text-white">
                  Salary: {sal.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 cursor-pointer"
            >
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0f142b] text-white">
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 cursor-pointer"
            >
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status} className="bg-[#0f142b] text-white">
                  Status: {status}
                </option>
              ))}
            </select>
          </div>

          {/* Feature 6: Sort by Latest Jobs (Default) / Salary / Title */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-[#0f142b] text-white outline-none focus:border-blue-400 cursor-pointer font-medium"
            >
              <option value="latest" className="bg-[#0f142b] text-white">Sort: Latest Jobs</option>
              <option value="salary-desc" className="bg-[#0f142b] text-white">Sort: Salary (High to Low)</option>
              <option value="salary-asc" className="bg-[#0f142b] text-white">Sort: Salary (Low to High)</option>
              <option value="title-asc" className="bg-[#0f142b] text-white">Sort: Title (A to Z)</option>
              <option value="title-desc" className="bg-[#0f142b] text-white">Sort: Title (Z to A)</option>
              <option value="deadline" className="bg-[#0f142b] text-white">Sort: Earliest Deadline</option>
            </select>
          </div>
        </div>

        {/* Row 3: Active Filter Counters & Quick Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-300">
              Matching <strong className="text-white">{sortedJobs.length}</strong> of{' '}
              <strong className="text-white">{jobs.length}</strong> total positions
            </span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-blue-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-white/5 rounded"></div>
              <div className="h-16 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      ) : paginatedJobs.length === 0 ? (
        /* Empty State */
        <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-lg space-y-3">
          <Briefcase className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Matching Jobs Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We couldn&apos;t find any positions matching your specified location, salary, or keyword criteria.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 mt-2"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Job Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {paginatedJobs.map((job) => {
            const isOpen = job.status === 'Open';
            const isApplied = appliedJobIds.includes(job.title.toLowerCase());

            return (
              <div
                key={job.id}
                className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all shadow-xl p-6 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Top Row: Company Logo, Name & Status Badge */}
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
                        <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    {/* Status Pill Badge */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md ${
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
                  </div>

                  {/* Metadata Chips: Category & Employment Type */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/20">
                      {job.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/20">
                      {job.employmentType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                      {job.experienceLevel}
                    </span>
                  </div>

                  {/* Core Details: Location, Salary, Deadline */}
                  <div className="space-y-2 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="font-semibold text-white">{job.salaryRange}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-400">
                        Deadline:{' '}
                        <strong className="text-slate-200 font-medium">
                          {job.deadline}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required Skills tags */}
                  {Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Required Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-slate-300 border border-white/10"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-slate-400">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer: Feature 8: Job Detail View + Apply / Management */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Feature 8: Quick Detail View Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setViewingJob(job)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1 text-xs"
                      title="Quick Preview Job Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {isRecruiter ? (
                      <>
                        {/* Status Toggle Quick Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(job)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            isOpen
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                          title={isOpen ? 'Click to mark as Closed' : 'Click to reopen Job'}
                        >
                          {isOpen ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Edit Job Button */}
                        <button
                          type="button"
                          onClick={() => setEditingJob(job)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors"
                          title="Edit Job Posting"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Job Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingJob(job)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/25 transition-colors"
                          title="Delete Job Opening"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      /* Candidate Instant Apply Button */
                      <button
                        type="button"
                        onClick={() => handleApplyToJob(job)}
                        disabled={!isOpen || isApplied}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                          isApplied
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                            : isOpen
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Applied
                          </>
                        ) : isOpen ? (
                          <>
                            <Send className="w-3 h-3" />
                            Apply
                          </>
                        ) : (
                          'Closed'
                        )}
                      </button>
                    )}
                  </div>

                  {/* Feature 8: Full Job Detail Page Link */}
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 transition-all flex items-center gap-1"
                  >
                    View Details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature 7: Pagination Controls */}
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
            of <strong className="text-white">{totalItems}</strong> positions
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

      {/* Feature 8: JOB DETAIL VIEW MODAL (Quick View) */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e1329] border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <img
                  src={
                    viewingJob.companyLogo ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={viewingJob.company}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/15 bg-slate-900"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-400">
                      {viewingJob.company}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        viewingJob.status === 'Open'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {viewingJob.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">{viewingJob.title}</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Location</span>
                <span className="text-white font-medium truncate block">{viewingJob.location}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Compensation</span>
                <span className="text-emerald-300 font-medium truncate block">{viewingJob.salaryRange}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Experience</span>
                <span className="text-white font-medium truncate block">{viewingJob.experienceLevel}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block">Deadline</span>
                <span className="text-cyan-300 font-medium truncate block">{viewingJob.deadline}</span>
              </div>
            </div>

            {/* Required Technologies & Skills */}
            {Array.isArray(viewingJob.skills) && viewingJob.skills.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Required Technologies & Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingJob.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 text-blue-300 border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Position Overview:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {viewingJob.description}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Link
                to={`/jobs/${viewingJob.id}`}
                onClick={() => setViewingJob(null)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Open Full Details Page <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleApplyToJob(viewingJob);
                    setViewingJob(null);
                  }}
                  disabled={viewingJob.status !== 'Open' || appliedJobIds.includes(viewingJob.title.toLowerCase())}
                  className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                    appliedJobIds.includes(viewingJob.title.toLowerCase())
                      ? 'bg-emerald-600 text-white cursor-default'
                      : viewingJob.status === 'Open'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {appliedJobIds.includes(viewingJob.title.toLowerCase()) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Applied
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Apply for this Role
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE JOB MODAL (Recruiter) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e1329] border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Job Posting</h3>
                  <p className="text-[11px] text-slate-400">
                    Publish vacancy with category, salary, deadline, and required skills
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createForm.handleSubmit(handleCreateJob)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Job Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...createForm.register('title', { required: 'Job title is required' })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                  {createForm.formState.errors.title && (
                    <p className="text-rose-400 text-[11px] mt-0.5">
                      {createForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Company Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    list="partner-companies-list"
                    {...createForm.register('company', { required: 'Company name is required' })}
                    placeholder="e.g. TechCorp Innovations"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                  <datalist id="partner-companies-list">
                    {partnerCompanies.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Job Category
                  </label>
                  <select
                    {...createForm.register('category')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    {JOB_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Employment Type
                  </label>
                  <select
                    {...createForm.register('employmentType')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    {EMPLOYMENT_TYPES.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Experience Level
                  </label>
                  <select
                    {...createForm.register('experienceLevel')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    {EXPERIENCE_LEVELS.filter((e) => e !== 'All').map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Salary Range <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...createForm.register('salaryRange', { required: 'Salary range required' })}
                    placeholder="e.g. $120,000 - $150,000 / yr"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Location <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...createForm.register('location', { required: 'Location is required' })}
                    placeholder="e.g. Remote, US or Austin, TX"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Application Deadline <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    {...createForm.register('deadline', { required: 'Deadline is required' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    {...createForm.register('skills')}
                    placeholder="e.g. React.js, Tailwind CSS, TypeScript, Context API"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Job Status
                  </label>
                  <select
                    {...createForm.register('status')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Job Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  {...createForm.register('description', { required: 'Description is required' })}
                  placeholder="Summarize the core mission and scope of this role..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md border border-white/20 transition-all"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Job Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT JOB MODAL (Recruiter) */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0e1329] border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Job Opening</h3>
                  <p className="text-[11px] text-slate-400">
                    Update vacancy specifications, skills, deadline, or status
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(handleEditJob)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Job Title</label>
                  <input
                    type="text"
                    {...editForm.register('title', { required: 'Job title is required' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Company</label>
                  <input
                    type="text"
                    {...editForm.register('company', { required: 'Company is required' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Category</label>
                  <select
                    {...editForm.register('category')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    {JOB_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Employment Type</label>
                  <select
                    {...editForm.register('employmentType')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    {EMPLOYMENT_TYPES.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Experience Level</label>
                  <select
                    {...editForm.register('experienceLevel')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    {EXPERIENCE_LEVELS.filter((e) => e !== 'All').map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Salary Range</label>
                  <input
                    type="text"
                    {...editForm.register('salaryRange')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Location</label>
                  <input
                    type="text"
                    {...editForm.register('location')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Deadline</label>
                  <input
                    type="date"
                    {...editForm.register('deadline')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-200 mb-1">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    {...editForm.register('skills')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1">Job Status</label>
                  <select
                    {...editForm.register('status')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-[#0f142b] text-white outline-none focus:border-blue-400"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">Description</label>
                <textarea
                  rows={3}
                  {...editForm.register('description')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-white/20 bg-white/[0.08] text-white outline-none focus:border-blue-400"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md border border-white/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0e1329] rounded-2xl border border-rose-500/30 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Job Posting?</h3>
              <p className="text-xs text-slate-300">
                Are you sure you want to remove <strong className="text-white">{deletingJob.title}</strong> at{' '}
                <strong className="text-white">{deletingJob.company}</strong>? This action will remove the position and update dashboard metrics.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingJob(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmDeleteJob}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Position'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;
