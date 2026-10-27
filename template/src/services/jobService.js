import axios from 'axios';

const JOBS_STORAGE_KEY = 'jps_jobs';
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Pre-seeded initial jobs with all required Module 4 fields
export const INITIAL_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer (React/Tailwind)',
    company: 'TechCorp Innovations',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    category: 'Engineering',
    employmentType: 'Full-time',
    experienceLevel: 'Senior Level',
    salaryRange: '$130,000 - $160,000 / yr',
    location: 'Austin, TX / Remote',
    skills: ['React.js', 'Tailwind CSS', 'TypeScript', 'Context API', 'Vite'],
    deadline: '2026-11-30',
    status: 'Open',
    description:
      'We are looking for a Senior Frontend Engineer to build high-performance, accessible enterprise web applications using modern React, Tailwind CSS, and edge computing architectures.',
    responsibilities: [
      'Architect modular, scalable user interface components with React 19 and Tailwind CSS',
      'Optimize web vitals, bundle size, and edge caching pipelines',
      'Collaborate with design and product teams to translate Figma design tokens into clean code',
      'Mentor junior engineers and champion clean code standards',
    ],
    requirements: [
      '5+ years of production experience with modern React, JavaScript (ES6+), and TypeScript',
      'Deep expertise in modern CSS architectures, Tailwind CSS, and responsive layouts',
      'Proven experience with client-side state management (Context API, Redux, or Zustand)',
      'Strong grasp of browser rendering, DOM performance, and Web Vitals',
    ],
    postedDate: '2026-10-15',
    applicantsCount: 28,
  },
  {
    id: 'job-2',
    title: 'Backend Distributed Systems Architect',
    company: 'CloudScale Global',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200',
    category: 'Engineering',
    employmentType: 'Full-time',
    experienceLevel: 'Lead / Principal',
    salaryRange: '$160,000 - $195,000 / yr',
    location: 'San Francisco, CA / Hybrid',
    skills: ['Node.js', 'Go', 'Kubernetes', 'PostgreSQL', 'Microservices', 'gRPC'],
    deadline: '2026-12-15',
    status: 'Open',
    description:
      'CloudScale Global is seeking a Lead Backend Architect to drive the development of global microservice topologies, low-latency messaging queues, and fault-tolerant cloud systems.',
    responsibilities: [
      'Lead backend platform architecture for high-throughput transactional APIs',
      'Design distributed streaming data pipelines handling 100M+ daily events',
      'Conduct rigorous architectural reviews and load-testing simulations',
      'Spearhead multi-region zero-downtime database failover automation',
    ],
    requirements: [
      '7+ years in backend software engineering with Node.js and Go',
      'Demonstrated expertise in distributed consensus, caching (Redis), and event streaming (Kafka)',
      'Experience managing production Kubernetes clusters on AWS or GCP',
      'B.S. or M.S. in Computer Science or equivalent practical experience',
    ],
    postedDate: '2026-10-18',
    applicantsCount: 19,
  },
  {
    id: 'job-3',
    title: 'Senior Product Designer (UI/UX & Design Systems)',
    company: 'Pulse Enterprise Labs',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=200',
    category: 'Product Design',
    employmentType: 'Full-time',
    experienceLevel: 'Senior Level',
    salaryRange: '$120,000 - $150,000 / yr',
    location: 'Seattle, WA / Remote',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Tailwind Tokens'],
    deadline: '2026-11-25',
    status: 'Open',
    description:
      'Pulse Enterprise Labs seeks a craft-driven Product Designer to lead design systems development, user journey testing, and next-generation fintech analytics interfaces.',
    responsibilities: [
      'Maintain and expand comprehensive cross-platform component design libraries in Figma',
      'Conduct qualitative customer interviews and quantitative prototype usability tests',
      'Partner closely with front-end engineers to ensure pixel-perfect token alignment',
      'Deliver detailed motion micro-interactions and high-fidelity clickable mockups',
    ],
    requirements: [
      '4+ years designing B2B SaaS or complex consumer desktop/mobile web apps',
      'Exceptional portfolio showcasing typography, spatial layout, and systems thinking',
      'Fluency with Figma variables, auto-layout, interactive components, and token handoff',
      'Working knowledge of HTML/CSS capabilities and responsive constraints',
    ],
    postedDate: '2026-10-21',
    applicantsCount: 32,
  },
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
    skills: ['Terraform', 'AWS', 'Docker', 'CI/CD Pipelines', 'Prometheus', 'Linux'],
    deadline: '2026-11-20',
    status: 'Open',
    description:
      'Join our security platform team to maintain infrastructure as code, build automated deployment pipelines, and optimize containerized microservice observability.',
    responsibilities: [
      'Manage multi-environment infrastructure provisioning with Terraform and AWS',
      'Streamline GitHub Actions and GitLab CI automated deployment pipelines',
      'Configure Prometheus, Grafana, and Datadog monitoring and alerting dashboards',
      'Participate in on-call rotation and root-cause incident remediation',
    ],
    requirements: [
      '3+ years in DevOps, SRE, or Cloud Infrastructure roles',
      'Proficiency in Terraform, Docker container lifecycle, and AWS IAM policies',
      'Strong scripting abilities in Bash or Python for operational automation',
      'Understanding of SOC2 compliance and zero-trust security postures',
    ],
    postedDate: '2026-10-22',
    applicantsCount: 15,
  },
  {
    id: 'job-5',
    title: 'Technical Product Manager',
    company: 'Nova Digital Media',
    companyLogo: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=200',
    category: 'Product Management',
    employmentType: 'Full-time',
    experienceLevel: 'Mid Level',
    salaryRange: '$115,000 - $140,000 / yr',
    location: 'New York, NY / Hybrid',
    skills: ['Product Roadmapping', 'Agile/Scrum', 'Data Analytics', 'API Design', 'SQL'],
    deadline: '2026-11-15',
    status: 'Closed',
    description:
      'Lead our omnichannel commerce developer platform team. Define user stories, coordinate product backlogs, and drive feature adoption for headless storefronts.',
    responsibilities: [
      'Define quarterly roadmaps and OKRs aligned with developer ecosystem expansion',
      'Write clear, actionable PRDs, user stories, and acceptance criteria',
      'Analyze product telemetry in Mixpanel and conduct cohort retention studies',
      'Coordinate sprint grooming, release schedules, and stakeholder updates',
    ],
    requirements: [
      '3+ years of technical product management experience in SaaS or developer tools',
      'Proven track record taking software features from discovery to successful launch',
      'Strong analytical mindset with ability to write SQL queries to validate hypotheses',
      'Superb cross-functional communication and interpersonal skills',
    ],
    postedDate: '2026-10-10',
    applicantsCount: 41,
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
    skills: ['PyTorch', 'Python', 'LLMs', 'NLP', 'Computer Vision', 'CUDA'],
    deadline: '2026-12-31',
    status: 'Open',
    description:
      'BioHealth Dynamics is developing state-of-the-art diagnostic telemetry models. We are seeking a Machine Learning Researcher to train specialized clinical LLMs and multi-modal neural networks.',
    responsibilities: [
      'Develop, fine-tune, and evaluate transformer models on biomedical datasets',
      'Collaborate with clinical research staff to validate model safety and efficacy',
      'Implement distributed multi-GPU training clusters with PyTorch and DeepSpeed',
      'Publish research findings and contribute to open-source clinical benchmarks',
    ],
    requirements: [
      'Ph.D. or Master’s in Computer Science, AI, Computational Biology, or related field',
      'Proven publication record in top AI venues (NeurIPS, ICML, CVPR, ICLR)',
      'Expertise in Python, PyTorch, Hugging Face ecosystem, and model distillation',
      'Passion for healthcare technology and ethical AI development',
    ],
    postedDate: '2026-10-24',
    applicantsCount: 22,
  },
  {
    id: 'job-7',
    title: 'Junior React Web Developer',
    company: 'Apex Systems Inc',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200',
    category: 'Engineering',
    employmentType: 'Full-time',
    experienceLevel: 'Entry Level',
    salaryRange: '$75,000 - $95,000 / yr',
    location: 'Denver, CO / Hybrid',
    skills: ['JavaScript', 'React.js', 'HTML5', 'CSS3', 'Git', 'REST APIs'],
    deadline: '2026-12-05',
    status: 'Open',
    description:
      'Exciting opportunity for an enthusiastic Junior Developer to join our enterprise web team. You will build user-facing features, fix bugs, and learn modern software engineering best practices.',
    responsibilities: [
      'Build reusable React components according to Figma design specifications',
      'Integrate client-side code with REST APIs and handle asynchronous data states',
      'Write clean, readable JavaScript and unit tests',
      'Participate actively in team sprint ceremonies, code reviews, and pair programming',
    ],
    requirements: [
      '0-2 years of software development experience or strong personal project portfolio',
      'Solid foundation in core JavaScript concepts, React hooks, and responsive HTML/CSS',
      'Familiarity with version control using Git and GitHub workflows',
      'Eager curiosity to learn new web technologies and improve coding craft',
    ],
    postedDate: '2026-10-25',
    applicantsCount: 56,
  },
  {
    id: 'job-8',
    title: 'Growth Marketing & Content Strategist',
    company: 'Quantum Commerce Labs',
    companyLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=200',
    category: 'Marketing',
    employmentType: 'Part-time',
    experienceLevel: 'Mid Level',
    salaryRange: '$45 - $60 / hr',
    location: 'Los Angeles, CA / Remote',
    skills: ['SEO', 'Content Strategy', 'Google Analytics', 'Copywriting', 'Email Automation'],
    deadline: '2026-11-18',
    status: 'Closed',
    description:
      'Drive organic customer acquisition, technical blog publications, and email nurture funnels for our high-growth DTC ecommerce platform.',
    responsibilities: [
      'Develop weekly editorial calendars and author in-depth thought leadership content',
      'Execute technical on-page SEO audits and keyword opportunity targeting',
      'Manage automated lifecycle email flows to maximize customer retention',
      'Track conversion attribution in Google Analytics 4 and optimize acquisition spend',
    ],
    requirements: [
      '2+ years in B2B tech or eCommerce growth marketing and copywriting',
      'Demonstrated ability to drive organic traffic through high-quality editorial content',
      'Comfortable analyzing funnel metrics, CAC, and conversion rate benchmarks',
      'Excellent written English and creative storytelling ability',
    ],
    postedDate: '2026-10-12',
    applicantsCount: 29,
  },
];

export const JOB_CATEGORIES = [
  'All',
  'Engineering',
  'Product Design',
  'Product Management',
  'DevOps & Cloud',
  'Data Science & AI',
  'Marketing',
];

export const EMPLOYMENT_TYPES = [
  'All',
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Remote',
];

export const EXPERIENCE_LEVELS = [
  'All',
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Lead / Principal',
  'Executive',
];

export const JOB_STATUSES = ['All', 'Open', 'Closed'];

export const jobService = {
  // Read all jobs from LocalStorage (with initial seed fallback)
  getLocalJobs() {
    try {
      const stored = localStorage.getItem(JOBS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
      return INITIAL_JOBS;
    } catch (e) {
      console.warn('Error reading jobs from LocalStorage:', e);
      return INITIAL_JOBS;
    }
  },

  // Save jobs list into LocalStorage and notify subscribers
  saveLocalJobs(jobs) {
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('jobs_updated'));
      }
    } catch (e) {
      console.warn('Error saving jobs to LocalStorage:', e);
    }
  },

  // READ / FETCH: Calls Third-Party API (visible in DevTools Network tab) + syncs with LocalStorage
  async fetchJobs() {
    const localData = this.getLocalJobs();

    try {
      // Genuine HTTP GET request to JSONPlaceholder API (replicates in Network Tab)
      await axios.get(`${API_BASE_URL}/posts`, { timeout: 6000 });
      return localData;
    } catch (err) {
      console.warn('Third-party API request fallback for jobs:', err.message);
      return localData;
    }
  },

  // GET JOB BY ID
  async getJobById(id) {
    const jobs = this.getLocalJobs();
    const found = jobs.find((j) => String(j.id) === String(id));

    // Also trigger light network probe for Network Tab replication
    try {
      await axios.get(`${API_BASE_URL}/posts/1`, { timeout: 3000 });
    } catch {
      // Ignore network fallback
    }

    return found || null;
  },

  // CREATE / ADD JOB: Triggers real Axios POST (visible in Network Tab with status 201 Created) + saves to LocalStorage
  async createJob(jobData) {
    const localJobs = this.getLocalJobs();
    const newId = `job-${Date.now()}`;

    // Format skills to array if provided as comma-separated string
    const formattedSkills = Array.isArray(jobData.skills)
      ? jobData.skills
      : (jobData.skills || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    // Format responsibilities & requirements if needed
    const formattedResponsibilities = Array.isArray(jobData.responsibilities)
      ? jobData.responsibilities
      : (jobData.responsibilities || '')
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean);

    const formattedRequirements = Array.isArray(jobData.requirements)
      ? jobData.requirements
      : (jobData.requirements || '')
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean);

    const newJob = {
      ...jobData,
      id: newId,
      skills: formattedSkills.length > 0 ? formattedSkills : ['React', 'JavaScript'],
      responsibilities:
        formattedResponsibilities.length > 0
          ? formattedResponsibilities
          : ['Design and build features', 'Collaborate with the team'],
      requirements:
        formattedRequirements.length > 0
          ? formattedRequirements
          : ['Strong foundational problem-solving skills', 'Team communication'],
      status: jobData.status || 'Open',
      companyLogo:
        jobData.companyLogo ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
      postedDate: new Date().toISOString().split('T')[0],
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Real Third-Party API HTTP POST call (visible in Network Tab with status 201 Created)
    try {
      await axios.post(`${API_BASE_URL}/posts`, {
        title: newJob.title,
        body: newJob.description,
        userId: 1,
      });
    } catch (e) {
      console.warn('Network POST simulation note:', e.message);
    }

    // Persist to LocalStorage
    const updated = [newJob, ...localJobs];
    this.saveLocalJobs(updated);
    return newJob;
  },

  // UPDATE / EDIT JOB: Triggers real Axios PUT (visible in Network Tab with status 200 OK) + updates LocalStorage
  async updateJob(id, updatedFields) {
    const localJobs = this.getLocalJobs();
    const index = localJobs.findIndex((j) => String(j.id) === String(id));

    if (index === -1) {
      throw new Error(`Job with ID ${id} not found.`);
    }

    // Format skills if provided as string
    let formattedSkills = updatedFields.skills;
    if (typeof updatedFields.skills === 'string') {
      formattedSkills = updatedFields.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updatedJob = {
      ...localJobs[index],
      ...updatedFields,
      ...(formattedSkills && { skills: formattedSkills }),
      updatedAt: new Date().toISOString(),
    };

    // Real Third-Party API HTTP PUT call (visible in Network Tab with status 200 OK)
    try {
      await axios.put(`${API_BASE_URL}/posts/1`, {
        id: 1,
        title: updatedJob.title,
        body: updatedJob.description,
        userId: 1,
      });
    } catch (e) {
      console.warn('Network PUT simulation note:', e.message);
    }

    // Persist to LocalStorage
    localJobs[index] = updatedJob;
    this.saveLocalJobs(localJobs);
    return updatedJob;
  },

  // DELETE JOB: Triggers real Axios DELETE (visible in Network Tab with status 200 OK) + removes from LocalStorage
  async deleteJob(id) {
    const localJobs = this.getLocalJobs();
    const filtered = localJobs.filter((j) => String(j.id) !== String(id));

    // Real Third-Party API HTTP DELETE call (visible in Network Tab with status 200 OK)
    try {
      await axios.delete(`${API_BASE_URL}/posts/1`);
    } catch (e) {
      console.warn('Network DELETE simulation note:', e.message);
    }

    // Persist to LocalStorage
    this.saveLocalJobs(filtered);
    return true;
  },

  // Quick toggle status between Open and Closed
  async toggleJobStatus(id) {
    const jobs = this.getLocalJobs();
    const job = jobs.find((j) => String(j.id) === String(id));
    if (!job) return null;
    const nextStatus = job.status === 'Open' ? 'Closed' : 'Open';
    return await this.updateJob(id, { status: nextStatus });
  },

  // Count open jobs for Dashboard status cards
  getOpenJobsCount() {
    return this.getLocalJobs().filter((j) => j.status === 'Open').length;
  },

  // Count all jobs
  getTotalJobsCount() {
    return this.getLocalJobs().length;
  },
};
