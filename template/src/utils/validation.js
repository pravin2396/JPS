// Email validation regex pattern
export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Password strength calculation helper
export const calculatePasswordStrength = (password = '') => {
  if (!password) return { score: 0, label: 'Empty', color: 'bg-slate-200' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-red-500', width: '25%' };
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500', width: '50%' };
    case 3:
      return { score: 3, label: 'Good', color: 'bg-blue-500', width: '75%' };
    case 4:
      return { score: 4, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
    default:
      return { score: 0, label: 'Too short', color: 'bg-red-400', width: '15%' };
  }
};

// Common React Hook Form validation rules
export const VALIDATION_RULES = {
  name: {
    required: 'Full name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
  },
  email: {
    required: 'Email address is required',
    pattern: {
      value: EMAIL_PATTERN,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters long',
    },
    validate: {
      hasNumber: (value) =>
        /[0-9]/.test(value) || 'Password must contain at least one number',
      hasUppercase: (value) =>
        /[A-Z]/.test(value) || 'Password must contain at least one uppercase letter',
    },
  },
  loginPassword: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters',
    },
  },
  role: {
    required: 'Please select an account role',
  },
  company: {
    required: 'Company name is required for recruiter accounts',
    minLength: { value: 2, message: 'Company name must be at least 2 characters' },
  },
  terms: {
    required: 'You must agree to the Terms of Service & Privacy Policy',
  },
};
