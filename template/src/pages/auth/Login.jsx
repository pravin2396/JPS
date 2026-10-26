import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  UserCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VALIDATION_RULES } from '../../utils/validation';
import { storageService } from '../../services/storageService';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('candidate');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: storageService.getRememberedEmail() || 'candidate@jobportal.dev',
      password: 'Password123!',
      rememberMe: Boolean(storageService.getRememberedEmail()),
      role: 'candidate',
    },
  });

  // Keep role in sync with form state
  useEffect(() => {
    setValue('role', selectedRole);
  }, [selectedRole, setValue]);

  // Demo Autofill Handler
  const handleSelectDemoRole = (roleType) => {
    setSelectedRole(roleType);
    if (roleType === 'candidate') {
      setValue('email', 'candidate@jobportal.dev', { shouldValidate: true });
      setValue('password', 'Password123!', { shouldValidate: true });
      setValue('role', 'candidate');
    } else {
      setValue('email', 'recruiter@jobportal.dev', { shouldValidate: true });
      setValue('password', 'Password123!', { shouldValidate: true });
      setValue('role', 'recruiter');
    }
  };

  // Submit Handler
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const loggedInUser = await login({
        email: data.email,
        password: data.password,
        role: selectedRole,
        rememberMe: data.rememberMe,
      });

      // Navigate to destination or role-specific dashboard
      const targetRoute =
        location.state?.from?.pathname ||
        (loggedInUser.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');

      navigate(targetRoute, { replace: true });
    } catch {
      // Toast notification is handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920')`,
      }}
    >
      {/* Dark Ambient Glassmorphism Backdrop Overlay */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[6px]"></div>

      {/* Subtle Glowing Orb Accents behind the glass card */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/30 blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/30 blur-[100px] pointer-events-none"></div>

      {/* Main Glassmorphism Two-Column Card */}
      <div className="relative z-10 max-w-4xl w-full rounded-[28px] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[580px] bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">

        {/* LEFT COLUMN: Frosted Dark Glass Hero Panel */}
        <div className="bg-gradient-to-b from-blue-950/60 via-slate-900/60 to-slate-950/70 p-8 sm:p-10 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-white/15">
          {/* Top Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 text-blue-300 shadow-inner">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                  JobPortal<span className="text-blue-400">Hub</span>
                </h2>
                <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-300">
                  CAREER PLATFORM
                </p>
              </div>
            </div>

            {/* Pill Badge */}
            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white/95 border border-white/20 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Next-Gen Career Portal
              </span>
            </div>

            {/* Large Headline */}
            <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-xs">
              Connecting top talent with leading employers.
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-xs sm:text-sm text-slate-200/90 leading-relaxed font-normal">
              Access curated vacancies, submit seamless job applications, and manage hiring pipelines effortlessly across devices.
            </p>
          </div>

          {/* Bottom Bullet Points */}
          <div className="mt-8 pt-6 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <div className="w-4 h-4 rounded-full bg-blue-500/25 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span>Connecting candidates with verified companies</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <div className="w-4 h-4 rounded-full bg-blue-500/25 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span>Private and secure data handling</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Frosted Form Panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-slate-900/45 backdrop-blur-2xl">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-xs">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Enter your credentials to access your portal account.
            </p>
          </div>

          {/* Quick Demo Access Box (Glass Card) */}
          <div className="mt-5 p-3.5 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/15 shadow-inner">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Quick Demo Access</span>
              </div>
              <span className="text-[11px] text-slate-300">Click to autofill</span>
            </div>

            {/* Role Demo Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Candidate Card */}
              <button
                type="button"
                onClick={() => handleSelectDemoRole('candidate')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  selectedRole === 'candidate'
                    ? 'border-blue-400 bg-blue-600/30 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400/40'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <UserCheck className={`w-3.5 h-3.5 ${selectedRole === 'candidate' ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Candidate</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-0.5">Alex Johnson</span>
              </button>

              {/* Recruiter Card */}
              <button
                type="button"
                onClick={() => handleSelectDemoRole('recruiter')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  selectedRole === 'recruiter'
                    ? 'border-emerald-400 bg-emerald-600/30 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Building className={`w-3.5 h-3.5 ${selectedRole === 'recruiter' ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Recruiter</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-0.5">Sarah Connor</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-200 mb-1">
                Email Address<span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. candidate@jobportal.dev"
                  {...register('email', VALIDATION_RULES.email)}
                  className={`block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border transition-all outline-none text-white placeholder-slate-400 bg-white/[0.08] backdrop-blur-md ${
                    errors.email
                      ? 'border-red-400/80 bg-red-500/10'
                      : 'border-white/20 focus:border-blue-400 focus:bg-white/[0.14] focus:ring-2 focus:ring-blue-400/25'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-300 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-200 mb-1">
                Password<span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  {...register('password', VALIDATION_RULES.loginPassword)}
                  className={`block w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border transition-all outline-none text-white placeholder-slate-400 bg-white/[0.08] backdrop-blur-md ${
                    errors.password
                      ? 'border-red-400/80 bg-red-500/10'
                      : 'border-white/20 focus:border-blue-400 focus:bg-white/[0.14] focus:ring-2 focus:ring-blue-400/25'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-300 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400"
                />
                <span className="text-slate-200 font-medium">Remember my session</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-blue-300 hover:text-blue-200 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-white/20 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 ${
                submitting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="pt-2 text-center text-xs text-slate-300">
              Don&apos;t have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-300 hover:text-blue-200 transition-colors underline-offset-2"
              >
                Register as New Member
              </Link>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
