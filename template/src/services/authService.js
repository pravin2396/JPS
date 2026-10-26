import { storageService } from './storageService';

// Helper to simulate network latency for authentic API feel
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  // Login with email and password
  async login({ email, password, role }) {
    await delay(600);

    const user = storageService.findUserByEmail(email);

    if (!user) {
      throw new Error('No account found with this email address. Please register.');
    }

    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again or use Forgot Password.');
    }

    // Role verification (if a specific role was selected on login)
    if (role && user.role !== role) {
      throw new Error(
        `This account is registered as a ${user.role}. Please select the ${user.role} role to login.`
      );
    }

    // Generate mock token and save active session
    storageService.setActiveUser(user);

    return {
      success: true,
      user,
      token: storageService.getToken(),
      message: `Welcome back, ${user.name}!`
    };
  },

  // Register a new user
  async register(registrationData) {
    await delay(700);

    const { name, email, password, role, company, designation, title } = registrationData;

    // Check for existing user
    const existing = storageService.findUserByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    // Default avatars based on role
    const defaultCandidateAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
    const defaultRecruiterAvatar = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250';

    const newUser = storageService.addUser({
      name,
      email: email.trim().toLowerCase(),
      password,
      role,
      company: role === 'recruiter' ? company || 'Undisclosed Company' : null,
      designation: role === 'recruiter' ? designation || 'Talent Specialist' : null,
      title: role === 'candidate' ? title || 'Job Seeker' : null,
      avatar: role === 'recruiter' ? defaultRecruiterAvatar : defaultCandidateAvatar,
      location: 'Remote / Hybrid',
      phone: '+1 (555) 000-0000',
      bio: role === 'candidate'
        ? `Hi, I'm ${name}, seeking new challenges in tech.`
        : `Talent specialist at ${company || 'our company'}. Let's connect!`,
    });

    // Auto set active user
    storageService.setActiveUser(newUser);

    return {
      success: true,
      user: newUser,
      token: storageService.getToken(),
      message: 'Account created successfully! Welcome to JobPortal.'
    };
  },

  // Forgot password request - send OTP
  async requestPasswordReset(email) {
    await delay(600);

    const user = storageService.findUserByEmail(email);
    if (!user) {
      throw new Error('No account registered with this email address.');
    }

    // Simulated 6-digit OTP
    const resetOtp = '849201';

    return {
      success: true,
      otp: resetOtp,
      email: user.email,
      message: `Verification code sent to ${email}. (Demo OTP: ${resetOtp})`
    };
  },

  // Verify OTP
  async verifyResetOtp(email, otp) {
    await delay(400);

    if (otp !== '849201') {
      throw new Error('Invalid verification code. Please check your OTP and try again.');
    }

    return {
      success: true,
      message: 'Code verified successfully. You may now set a new password.'
    };
  },

  // Reset password
  async resetPassword({ email, newPassword }) {
    await delay(600);

    const success = storageService.updateUserPassword(email, newPassword);
    if (!success) {
      throw new Error('Could not update password. User account not found.');
    }

    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    };
  },

  // Logout
  async logout() {
    await delay(200);
    storageService.clearSession();
    return {
      success: true,
      message: 'Logged out successfully.'
    };
  },

  // Get current session
  getCurrentUser() {
    return storageService.getActiveUser();
  }
};
