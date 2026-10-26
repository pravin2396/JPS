import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Briefcase,
  UserCheck,
  Mail,
  User,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/common/PasswordInput';
import { VALIDATION_RULES, calculatePasswordStrength } from '../../utils/validation';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

const Auth = ({ initialMode = 'login' }) => {
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState(() => {
    if (location.pathname === '/register') return 'register';
    if (location.pathname === '/forgot-password') return 'forgot';
    return initialMode;
  });

  // Selected role: 'candidate' | 'recruiter'
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);

  // Forgot password sub-steps: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Forms
  const loginForm = useForm({
    defaultValues: {
      email: storageService.getRememberedEmail() || '',
      password: '',
      rememberMe: Boolean(storageService.getRememberedEmail()),
    },
  });

  const registerForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: '',
      designation: '',
      title: '',
      terms: false,
    },
  });

  const forgotEmailForm = useForm({ defaultValues: { email: '' } });
  const forgotOtpForm = useForm({ defaultValues: { otp: '' } });
  const forgotPasswordForm = useForm({ defaultValues: { newPassword: '', confirmNewPassword: '' } });

  const watchedRegisterPassword = registerForm.watch('password', '');
  const registerStrength = calculatePasswordStrength(watchedRegisterPassword);

  const watchedNewPassword = forgotPasswordForm.watch('newPassword', '');
  const resetStrength = calculatePasswordStrength(watchedNewPassword);

  // Update mode when path changes
  useEffect(() => {
    if (location.pathname === '/register') setMode('register');
    else if (location.pathname === '/forgot-password') setMode('forgot');
    else if (location.pathname === '/login' || location.pathname === '/auth') setMode('login');
  }, [location.pathname]);

  // LOGIN SUBMIT
  const handleLoginSubmit = async (data) => {
    setLoading(true);
    try {
      const loggedUser = await login({
        email: data.email,
        password: data.password,
        role: role,
        rememberMe: data.rememberMe,
      });

      const destination =
        location.state?.from?.pathname ||
        (loggedUser.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
      navigate(destination, { replace: true });
    } catch {
      // Toast notification is fired by AuthContext
    } finally {
      setLoading(false);
    }
  };

  // REGISTER SUBMIT
  const handleRegisterSubmit = async (data) => {
    setLoading(true);
    try {
      const newUser = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: role,
        company: data.company,
        designation: data.designation,
        title: data.title,
      });

      const destination = newUser.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';
      navigate(destination, { replace: true });
    } catch {
      // Handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD FLOW
  const handleForgotEmail = async (data) => {
    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(data.email);
      setResetEmail(data.email);
      setGeneratedOtp(res.otp);
      setForgotStep(2);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Email not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOtp = async (data) => {
    setLoading(true);
    try {
      const res = await authService.verifyResetOtp(resetEmail, data.otp);
      setForgotStep(3);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotReset = async (data) => {
    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email: resetEmail,
        newPassword: data.newPassword,
      });
      setForgotStep(4);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill Demo Credentials
  const fillDemo = (targetRole) => {
    setRole(targetRole);
    if (targetRole === 'candidate') {
      loginForm.setValue('email', 'candidate@jobportal.dev', { shouldValidate: true });
      loginForm.setValue('password', 'Password123!', { shouldValidate: true });
    } else {
      loginForm.setValue('email', 'recruiter@jobportal.dev', { shouldValidate: true });
      loginForm.setValue('password', 'Password123!', { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl"></div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Job<span className="text-blue-500">Portal</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Sign In to Your Account'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Welcome back! Select your role and sign in below.'}
            {mode === 'register' && 'Join thousands of professionals and hiring managers.'}
            {mode === 'forgot' && 'Follow the steps to recover and reset your credentials.'}
          </p>
        </div>

        {/* Auth Mode Tabs (Sign In / Register) */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-800/80 p-1 rounded-xl mb-4 border border-slate-700/60 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          {/* Quick Demo Credentials Bar (on Login) */}
          {mode === 'login' && (
            <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Instant Demo Fill:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('candidate')}
                  className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-white text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 transition-all flex items-center justify-center gap-1 shadow-2xs"
                >
                  <UserCheck className="w-3 h-3" />
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('recruiter')}
                  className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Briefcase className="w-3 h-3" />
                  Recruiter
                </button>
              </div>
            </div>
          )}

          {/* Role Selection Tabs (For Login & Register) */}
          {mode !== 'forgot' && (
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Portal Role
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    role === 'candidate'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    role === 'recruiter'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Recruiter
                </button>
              </div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="login-email" className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="e.g. you@example.com"
                    {...loginForm.register('email', VALIDATION_RULES.email)}
                    className="block w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <PasswordInput
                id="login-password"
                name="password"
                label="Password"
                placeholder="Enter password"
                registration={loginForm.register('password', VALIDATION_RULES.loginPassword)}
                error={loginForm.formState.errors.password}
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...loginForm.register('rememberMe')}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600 font-medium">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  role === 'recruiter'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                } ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {role === 'recruiter' ? 'Recruiter' : 'Candidate'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="reg-name" className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="e.g. John Doe"
                    {...registerForm.register('name', VALIDATION_RULES.name)}
                    className="block w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="e.g. you@example.com"
                    {...registerForm.register('email', VALIDATION_RULES.email)}
                    className="block w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Role specific input */}
              {role === 'recruiter' ? (
                <div>
                  <label htmlFor="reg-company" className="block text-xs font-medium text-slate-700 mb-1">
                    Company Name
                  </label>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-company"
                      type="text"
                      placeholder="e.g. Tech Innovations"
                      {...registerForm.register('company', VALIDATION_RULES.company)}
                      className="block w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>
                  {registerForm.formState.errors.company && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {registerForm.formState.errors.company.message}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="reg-title" className="block text-xs font-medium text-slate-700 mb-1">
                    Target Job Title (Optional)
                  </label>
                  <input
                    id="reg-title"
                    type="text"
                    placeholder="e.g. Frontend Developer"
                    {...registerForm.register('title')}
                    className="block w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              )}

              <PasswordInput
                id="reg-password"
                name="password"
                label="Create Password"
                placeholder="At least 8 chars, 1 uppercase, 1 number"
                registration={registerForm.register('password', VALIDATION_RULES.password)}
                error={registerForm.formState.errors.password}
              />

              {watchedRegisterPassword && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Password Strength: <strong>{registerStrength.label}</strong></span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${registerStrength.color}`} style={{ width: registerStrength.width }}></div>
                  </div>
                </div>
              )}

              <PasswordInput
                id="reg-confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter password"
                registration={registerForm.register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (val) => val === watchedRegisterPassword || 'Passwords do not match',
                })}
                error={registerForm.formState.errors.confirmPassword}
              />

              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...registerForm.register('terms', VALIDATION_RULES.terms)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600">
                    I agree to the Terms of Service & Privacy Policy
                  </span>
                </label>
                {registerForm.formState.errors.terms && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {registerForm.formState.errors.terms.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  role === 'recruiter'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                } ${loading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {loading ? 'Creating Account...' : `Register as ${role === 'recruiter' ? 'Recruiter' : 'Candidate'}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FLOW */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 pb-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        forgotStep === s
                          ? 'bg-blue-600 text-white'
                          : forgotStep > s
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {forgotStep > s ? '✓' : s}
                    </div>
                    {s < 3 && <div className={`w-8 h-1 mx-1 rounded ${forgotStep > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>

              {/* Step 1: Email */}
              {forgotStep === 1 && (
                <form onSubmit={forgotEmailForm.handleSubmit(handleForgotEmail)} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="f-email" className="block text-xs font-medium text-slate-700 mb-1">
                      Account Email
                    </label>
                    <input
                      id="f-email"
                      type="email"
                      placeholder="e.g. candidate@jobportal.dev"
                      {...forgotEmailForm.register('email', VALIDATION_RULES.email)}
                      className="block w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-600 outline-none"
                    />
                    {forgotEmailForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {forgotEmailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Sending Code...' : 'Send Recovery Code'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step 2: OTP */}
              {forgotStep === 2 && (
                <form onSubmit={forgotOtpForm.handleSubmit(handleForgotOtp)} className="space-y-4" noValidate>
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-blue-800">Demo Code: <strong className="font-mono">{generatedOtp || '849201'}</strong></span>
                    <button
                      type="button"
                      onClick={() => forgotOtpForm.setValue('otp', generatedOtp || '849201', { shouldValidate: true })}
                      className="px-2 py-0.5 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    >
                      Auto Fill
                    </button>
                  </div>

                  <div>
                    <label htmlFor="f-otp" className="block text-xs font-medium text-slate-700 mb-1">
                      Enter 6-digit Code
                    </label>
                    <input
                      id="f-otp"
                      type="text"
                      maxLength={6}
                      placeholder="849201"
                      {...forgotOtpForm.register('otp', { required: 'Code is required' })}
                      className="block w-full text-center text-xl tracking-widest font-mono py-2 rounded-lg border border-slate-300 focus:border-blue-600 outline-none"
                    />
                    {forgotOtpForm.formState.errors.otp && (
                      <p className="mt-1 text-xs text-red-600 text-center font-medium">
                        {forgotOtpForm.formState.errors.otp.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 3 && (
                <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotReset)} className="space-y-4" noValidate>
                  <PasswordInput
                    id="f-newPass"
                    name="newPassword"
                    label="New Password"
                    placeholder="Enter new password"
                    registration={forgotPasswordForm.register('newPassword', VALIDATION_RULES.password)}
                    error={forgotPasswordForm.formState.errors.newPassword}
                  />

                  {watchedNewPassword && (
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-[11px] text-slate-600">
                        Strength: <strong>{resetStrength.label}</strong>
                      </div>
                      <div className="w-full bg-slate-200 h-1 rounded mt-1 overflow-hidden">
                        <div className={`h-full ${resetStrength.color}`} style={{ width: resetStrength.width }}></div>
                      </div>
                    </div>
                  )}

                  <PasswordInput
                    id="f-confirmPass"
                    name="confirmNewPassword"
                    label="Confirm New Password"
                    placeholder="Re-enter new password"
                    registration={forgotPasswordForm.register('confirmNewPassword', {
                      required: 'Please confirm password',
                      validate: (v) => v === watchedNewPassword || 'Passwords do not match',
                    })}
                    error={forgotPasswordForm.formState.errors.confirmNewPassword}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    {loading ? 'Updating...' : 'Save New Password'}
                  </button>
                </form>
              )}

              {/* Step 4: Success */}
              {forgotStep === 4 && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Password Updated!</h3>
                  <p className="text-xs text-slate-600">
                    Your password has been saved. You can now sign in with your new credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotStep(1);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* Return to Sign in button */}
              {forgotStep !== 4 && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setForgotStep(1);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
