// LocalStorage keys for Job Portal System
const STORAGE_KEYS = {
  USERS: 'jps_users',
  ACTIVE_USER: 'jps_auth_user',
  TOKEN: 'jps_auth_token',
  REMEMBERED_EMAIL: 'jps_remembered_email',
};

// Seed initial users for instant testing and evaluation
const DEFAULT_USERS = [
  {
    id: 'user_cand_1',
    name: 'Alex Johnson',
    email: 'candidate@jobportal.dev',
    password: 'Password123!',
    role: 'candidate',
    title: 'Senior Frontend Developer',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    bio: 'Passionate frontend engineer with 5+ years building accessible, responsive web applications with React.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user_rec_1',
    name: 'Sarah Connor',
    email: 'recruiter@jobportal.dev',
    password: 'Password123!',
    role: 'recruiter',
    company: 'TechCorp Innovations',
    designation: 'Lead Talent Acquisition Partner',
    phone: '+1 (555) 876-5432',
    location: 'Austin, TX',
    bio: 'Hiring exceptional engineering & product talent across North America.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    createdAt: '2026-01-10T09:30:00Z',
  },
];

export const storageService = {
  // Clear any data from previous projects and retain only current project data
  cleanLegacyData() {
    try {
      const allowedPrefix = 'jps_';
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith(allowedPrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (err) {
      console.warn('Failed to clean legacy localStorage entries:', err);
    }
  },

  // Initialize storage with sample users if empty and ensure clean state
  init() {
    try {
      this.cleanLegacyData();
      const existing = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!existing) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      }
    } catch (err) {
      console.error('Failed to initialize localStorage users:', err);
    }
  },

  // Get all registered users
  getUsers() {
    try {
      this.init();
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      return raw ? JSON.parse(raw) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  },

  // Find user by email
  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  // Register a new user
  addUser(userData) {
    const users = this.getUsers();
    const newUser = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  // Update an existing user password
  updateUserPassword(email, newPassword) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (idx === -1) return false;

    users[idx].password = newPassword;
    users[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // If currently logged in user is this one, update session too
    const active = this.getActiveUser();
    if (active && active.email.toLowerCase() === email.trim().toLowerCase()) {
      active.password = newPassword;
      this.setActiveUser(active);
    }
    return true;
  },

  // Get current active authenticated user
  getActiveUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Set active authenticated user
  setActiveUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
      // Store mock JWT token
      const mockToken = `mock-jwt-token.${btoa(JSON.stringify({ id: user.id, role: user.role }))}.${Date.now()}`;
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);
    }
  },

  // Get auth token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Clear current session
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Remember email for login convenience
  getRememberedEmail() {
    return localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || '';
  },

  setRememberedEmail(email, remember) {
    if (remember && email) {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    }
  },
};
