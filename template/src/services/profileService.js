import axios from 'axios';

const PROFILE_STORAGE_KEY = 'jps_candidate_profile';
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const INITIAL_CANDIDATE_PROFILE = {
  fullName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  mobileNumber: '+1 (555) 349-8201',
  address: '742 Innovation Way, Austin, TX 78701',
  headline: 'Senior Full Stack & Frontend Engineer',
  bio: 'Passionate software engineer with 5+ years of experience specializing in building high-performance modern web apps with React, TypeScript, and cloud-native architectures.',
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  skills: [
    'React.js',
    'Tailwind CSS',
    'TypeScript',
    'JavaScript (ES6+)',
    'Node.js',
    'Context API',
    'REST APIs',
    'Next.js',
    'Git & GitHub',
    'Responsive Design',
  ],
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Frontend Engineer',
      company: 'TechCorp Innovations',
      location: 'Austin, TX (Remote)',
      startDate: '2023-03',
      endDate: 'Present',
      current: true,
      description:
        'Architecting enterprise component design systems, real-time metrics dashboards, and performance-critical web applications using React 19, Tailwind CSS, and Vite.',
    },
    {
      id: 'exp-2',
      title: 'Frontend Web Developer',
      company: 'CloudScale Global',
      location: 'San Francisco, CA (Hybrid)',
      startDate: '2021-01',
      endDate: '2023-02',
      current: false,
      description:
        'Developed client-facing portal applications, integrated REST and GraphQL endpoints, and established automated end-to-end testing workflows.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Texas at Austin',
      fieldOfStudy: 'Software Engineering & Interactive Computing',
      graduationYear: '2020',
      grade: '3.85 GPA',
    },
    {
      id: 'edu-2',
      degree: 'Associate Degree in Web Technology',
      institution: 'Austin College of Technology',
      fieldOfStudy: 'Computer Information Systems',
      graduationYear: '2018',
      grade: "Dean's Honor List",
    },
  ],
  resume: {
    fileName: 'Alex_Morgan_Senior_Frontend_Resume.pdf',
    fileSize: '1.4 MB',
    uploadDate: '2026-10-26',
    fileType: 'application/pdf',
  },
};

export const profileService = {
  // Read candidate profile from LocalStorage (with fallback to default)
  getProfile() {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(INITIAL_CANDIDATE_PROFILE));
      return INITIAL_CANDIDATE_PROFILE;
    } catch (e) {
      console.warn('Error reading candidate profile from LocalStorage:', e);
      return INITIAL_CANDIDATE_PROFILE;
    }
  },

  // Save profile to LocalStorage + trigger real Axios PUT (visible in Network Tab)
  async saveProfile(profileData) {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profile_updated'));
      }
    } catch (e) {
      console.warn('Error saving profile to LocalStorage:', e);
    }

    // Real Third-Party API HTTP PUT call (visible in Network Tab with status 200 OK)
    try {
      await axios.put(`${API_BASE_URL}/users/1`, {
        name: profileData.fullName,
        email: profileData.email,
        phone: profileData.mobileNumber,
        address: { street: profileData.address },
      });
    } catch (err) {
      console.warn('Profile PUT simulation note:', err.message);
    }

    return profileData;
  },

  // Create new profile (initializes fresh profile + triggers Axios POST)
  async createProfile(profileData) {
    const freshProfile = {
      ...profileData,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(freshProfile));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profile_updated'));
      }
    } catch (e) {
      console.warn('Error creating profile in LocalStorage:', e);
    }

    // Real Third-Party API HTTP POST call (visible in Network Tab with status 201 Created)
    try {
      await axios.post(`${API_BASE_URL}/users`, {
        name: freshProfile.fullName,
        email: freshProfile.email,
        phone: freshProfile.mobileNumber,
      });
    } catch (err) {
      console.warn('Profile POST simulation note:', err.message);
    }

    return freshProfile;
  },

  // Reset / Clear profile
  async resetProfile() {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profile_updated'));
      }
    } catch (e) {
      console.warn('Error resetting profile:', e);
    }
    return INITIAL_CANDIDATE_PROFILE;
  },
};
