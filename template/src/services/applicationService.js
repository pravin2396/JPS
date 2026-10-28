import axios from 'axios';

const DASHBOARD_STORAGE_KEY = 'jps_candidate_dashboard_state';
const SAVED_JOBS_STORAGE_KEY = 'jps_saved_jobs';
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

const STATUS_COLOR_MAP = {
  'Submitted': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Under Review': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Shortlisted': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Interview Scheduled': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Offer Extended': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Rejected': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

// Default initial applications
export const INITIAL_APPLICATIONS = [
  {
    id: 'app-1',
    jobId: 'job-1',
    title: 'Senior Frontend Engineer (React/Tailwind)',
    company: 'TechCorp Innovations',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    location: 'Remote / Austin, TX',
    salary: '$135,000 - $160,000',
    category: 'Engineering',
    appliedDate: '2 days ago',
    status: 'Interview Scheduled',
    statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    notes: 'Submitted customized portfolio showcasing React 19 architecture and Tailwind design systems.',
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    title: 'Full Stack JavaScript Developer',
    company: 'CloudScale Global',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200',
    location: 'San Francisco, CA / Hybrid',
    salary: '$120,000 - $145,000',
    category: 'Engineering',
    appliedDate: '5 days ago',
    status: 'Under Review',
    statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    notes: 'Emphasized microservices, high-throughput caching with Redis, and node cluster performance.',
  },
  {
    id: 'app-3',
    jobId: 'job-3',
    title: 'Senior Product Designer (UI/UX)',
    company: 'Pulse Enterprise Labs',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=200',
    location: 'Seattle, WA / Remote',
    salary: '$120,000 - $150,000',
    category: 'Product Design',
    appliedDate: '1 week ago',
    status: 'Shortlisted',
    statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    notes: 'Included Figma variable token handoff documentation and prototype telemetry.',
  },
];

// Default initial saved jobs
export const INITIAL_SAVED_JOBS = [
  {
    id: 'job-4',
    title: 'Cloud DevOps & Site Reliability Engineer',
    company: 'Vanguard Cyber Tech',
    companyLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=200',
    category: 'DevOps & Cloud',
    employmentType: 'Contract',
    experienceLevel: 'Mid Level',
    salaryRange: '$65 - $85 / hr',
    location: 'Boston, MA / Remote',
    deadline: '2026-11-20',
    savedDate: '2026-10-25',
  },
  {
    id: 'job-6',
    title: 'AI / Machine Learning Research Scientist',
    company: 'BioHealth Dynamics',
    companyLogo: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=200',
    category: 'Data Science & AI',
    employmentType: 'Full-time',
    experienceLevel: 'Lead / Principal',
    salaryRange: '$170,000 - $210,000 / yr',
    location: 'Chicago, IL / Remote',
    deadline: '2026-12-31',
    savedDate: '2026-10-26',
  },
];

export const APPLICATION_STATUS_OPTIONS = [
  'All',
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Offer Extended',
  'Rejected',
];

export const applicationService = {
  // Read candidate dashboard state
  getDashboardState() {
    try {
      const stored = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading dashboard state:', e);
    }
    return {
      applications: INITIAL_APPLICATIONS,
      recommendedJobs: [],
      interviewsCount: 2,
    };
  },

  // Save dashboard state
  saveDashboardState(state) {
    try {
      localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(state));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('candidate_updated'));
        window.dispatchEvent(new Event('applications_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('Error saving dashboard state:', e);
    }
  },

  // GET ALL APPLIED JOBS
  getAppliedJobs() {
    const state = this.getDashboardState();
    return state.applications || INITIAL_APPLICATIONS;
  },

  // APPLY FOR JOB: Network POST (201 Created) + LocalStorage + Dashboard Status (+1)
  async applyForJob(applicationData) {
    const state = this.getDashboardState();
    const currentApps = state.applications || [];

    // Check if already applied
    const exists = currentApps.some(
      (a) =>
        (a.jobId && String(a.jobId) === String(applicationData.jobId)) ||
        a.title.toLowerCase() === applicationData.title.toLowerCase()
    );

    if (exists) {
      throw new Error(`You have already applied for "${applicationData.title}".`);
    }

    const newApp = {
      id: `app-${Date.now()}`,
      jobId: applicationData.jobId || `job-${Date.now()}`,
      title: applicationData.title,
      company: applicationData.company,
      companyLogo:
        applicationData.companyLogo ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      location: applicationData.location || 'Remote',
      salary: applicationData.salary || '$120,000 - $150,000',
      category: applicationData.category || 'Engineering',
      appliedDate: 'Just now',
      status: 'Submitted',
      statusColor: STATUS_COLOR_MAP['Submitted'],
      notes: applicationData.notes || 'Application submitted via candidate job portal.',
      applicantName: applicationData.applicantName || 'Candidate',
      applicantEmail: applicationData.applicantEmail || 'candidate@example.com',
      createdAt: new Date().toISOString(),
    };

    // Real Axios HTTP POST call (visible in Network tab with 201 Created)
    try {
      await axios.post(`${API_BASE_URL}/posts`, {
        title: `Job Application: ${newApp.title}`,
        body: JSON.stringify(newApp),
        userId: 1,
      });
    } catch (err) {
      console.warn('Apply HTTP simulation note:', err.message);
    }

    // Persist to state
    state.applications = [newApp, ...currentApps];
    this.saveDashboardState(state);

    return newApp;
  },

  // WITHDRAW APPLICATION: Network DELETE (200 OK) + LocalStorage + Dashboard Status (-1)
  async withdrawApplication(appId) {
    const state = this.getDashboardState();
    const currentApps = state.applications || [];
    const filtered = currentApps.filter((a) => String(a.id) !== String(appId));

    // Real Axios HTTP DELETE call (visible in Network tab with 200 OK)
    try {
      await axios.delete(`${API_BASE_URL}/posts/1`);
    } catch (err) {
      console.warn('Withdraw HTTP simulation note:', err.message);
    }

    state.applications = filtered;
    this.saveDashboardState(state);

    return true;
  },

  // UPDATE APPLICATION STATUS (for recruiter or simulation)
  async updateApplicationStatus(appId, newStatus) {
    const state = this.getDashboardState();
    const currentApps = state.applications || [];
    const updated = currentApps.map((a) => {
      if (String(a.id) === String(appId)) {
        return {
          ...a,
          status: newStatus,
          statusColor: STATUS_COLOR_MAP[newStatus] || STATUS_COLOR_MAP['Under Review'],
        };
      }
      return a;
    });

    state.applications = updated;
    this.saveDashboardState(state);
    return true;
  },

  // GET ALL SAVED JOBS
  getSavedJobs() {
    try {
      const stored = localStorage.getItem(SAVED_JOBS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(INITIAL_SAVED_JOBS));
      return INITIAL_SAVED_JOBS;
    } catch (e) {
      console.warn('Error reading saved jobs:', e);
      return INITIAL_SAVED_JOBS;
    }
  },

  // SAVE SAVED JOBS LIST
  saveSavedJobsList(savedJobs) {
    try {
      localStorage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(savedJobs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('saved_jobs_updated'));
        window.dispatchEvent(new Event('candidate_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('Error saving saved jobs list:', e);
    }
  },

  // SAVE JOB: Network POST (201 Created) + LocalStorage + Dashboard Status (+1)
  async saveJob(job) {
    const list = this.getSavedJobs();
    const exists = list.some((j) => String(j.id) === String(job.id));
    if (exists) {
      return false;
    }

    const newSaved = {
      id: job.id,
      title: job.title,
      company: job.company,
      companyLogo:
        job.companyLogo ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      category: job.category || 'Engineering',
      employmentType: job.employmentType || 'Full-time',
      experienceLevel: job.experienceLevel || 'Mid Level',
      salaryRange: job.salaryRange || job.salary || '$110,000 - $140,000 / yr',
      location: job.location || 'Remote',
      deadline: job.deadline || '2026-12-15',
      savedDate: new Date().toISOString().split('T')[0],
    };

    // Real Axios HTTP POST call (visible in Network tab with 201 Created)
    try {
      await axios.post(`${API_BASE_URL}/posts`, {
        title: `Save Job: ${newSaved.title}`,
        body: JSON.stringify(newSaved),
        userId: 1,
      });
    } catch (err) {
      console.warn('Save Job HTTP simulation note:', err.message);
    }

    const updated = [newSaved, ...list];
    this.saveSavedJobsList(updated);
    return true;
  },

  // REMOVE SAVED JOB: Network DELETE (200 OK) + LocalStorage + Dashboard Status (-1)
  async removeSavedJob(jobId) {
    const list = this.getSavedJobs();
    const filtered = list.filter((j) => String(j.id) !== String(jobId));

    // Real Axios HTTP DELETE call (visible in Network tab with 200 OK)
    try {
      await axios.delete(`${API_BASE_URL}/posts/1`);
    } catch (err) {
      console.warn('Remove Saved Job HTTP simulation note:', err.message);
    }

    this.saveSavedJobsList(filtered);
    return true;
  },

  // Check if job is saved
  isJobSaved(jobId) {
    return this.getSavedJobs().some((j) => String(j.id) === String(jobId));
  },

  // Check if job is applied
  isJobApplied(jobId, jobTitle) {
    const apps = this.getAppliedJobs();
    return apps.some(
      (a) =>
        (jobId && String(a.jobId) === String(jobId)) ||
        (jobTitle && a.title.toLowerCase() === jobTitle.toLowerCase())
    );
  },
};
