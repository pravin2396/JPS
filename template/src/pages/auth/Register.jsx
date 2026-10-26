import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  UserCheck,
  Mail,
  User,
  Building,
  Lock,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VALIDATION_RULES, calculatePasswordStrength } from '../../utils/validation';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('candidate');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
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

  const watchedPassword = watch('password', '');
  const strength = calculatePasswordStrength(watchedPassword);

  const onSubmit = async (data) => {
    setSubmitting(true);
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
      // Toast error handled in AuthContext
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
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[6px]"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/30 blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/30 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl w-full rounded-[28px] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[620px] bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
        
        {/* LEFT COLUMN: Frosted Glass Hero Panel */}
        <div className="bg-gradient-to-b from-blue-950/60 via-slate-900/60 to-slate-950/70 p-8 sm:p-10 flex flex-col justify-between text-white border-b md:border-b-0 md:border-r border-white/15">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 text-blue-300">
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

            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white/95 border border-white/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                New Member Registration
              </span>
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
              Launch your career or hire top industry talent.
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-slate-200/90 leading-relaxed">
              Join thousands of professionals applying for jobs and leading companies discovering high-caliber candidates.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <div className="w-4 h-4 rounded-full bg-blue-500/25 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span>Connecting candidates with verified companies</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <div className="w-4 h-4 rounded-full bg-blue-500/25 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span>Private and secure data handling</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Frosted Form Panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-slate-900/45 backdrop-blur-2xl overflow-y-auto max-h-[90vh]">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Create an Account
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Select your role and enter your details to get started.
            </p>
          </div>

          {/* Role Selection */}
          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  role === 'candidate'
                    ? 'border-blue-400 bg-blue-600/30 text-white shadow-md ring-1 ring-blue-400/40'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <UserCheck className={`w-3.5 h-3.5 ${role === 'candidate' ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Candidate</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-0.5">Looking for jobs</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  role === 'recruiter'
                    ? 'border-emerald-400 bg-emerald-600/30 text-white shadow-md ring-1 ring-emerald-400/40'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Building className={`w-3.5 h-3.5 ${role === 'recruiter' ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Recruiter</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-0.5">Hiring talent</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-medium text-slate-200 mb-1">
                Full Name<span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  {...register('name', VALIDATION_RULES.name)}
                  className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder-slate-400 outline-none focus:border-blue-400"
                />
              </div>
              {errors.name && <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-slate-200 mb-1">
                Email Address<span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="e.g. eleanor@example.com"
                  {...register('email', VALIDATION_RULES.email)}
                  className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder-slate-400 outline-none focus:border-blue-400"
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.email.message}</p>}
            </div>

            {/* Role Specific Field */}
            {role === 'recruiter' ? (
              <div>
                <label htmlFor="reg-company" className="block text-xs font-medium text-slate-200 mb-1">
                  Company Name<span className="text-rose-400">*</span>
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-company"
                    type="text"
                    placeholder="e.g. Acme Tech"
                    {...register('company', VALIDATION_RULES.company)}
                    className="block w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder-slate-400 outline-none focus:border-emerald-400"
                  />
                </div>
                {errors.company && <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.company.message}</p>}
              </div>
            ) : (
              <div>
                <label htmlFor="reg-title" className="block text-xs font-medium text-slate-200 mb-1">
                  Desired Job Title (Optional)
                </label>
                <input
                  id="reg-title"
                  type="text"
                  placeholder="e.g. Frontend Engineer"
                  {...register('title')}
                  className="block w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder-slate-400 outline-none focus:border-blue-400"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-slate-200 mb-1">
                Password<span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  {...register('password', VALIDATION_RULES.password)}
                  className="block w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder-slate-400 outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.password.message}</p>}
            </div>

            {/* Strength meter */}
            {watchedPassword && (
              <div className="space-y-1 bg-white/[0.05] p-2 rounded-lg border border-white/10">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Strength: <strong>{strength.label}</strong></span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color}`} style={{ width: strength.width }}></div>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-medium text-slate-200 mb-1">
                Confirm Password<span className="text-rose-400">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (v) => v === watchedPassword || 'Passwords do not match',
                  })}
                  className="block w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder-slate-400 outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('terms', VALIDATION_RULES.terms)}
                  className="mt-0.5 w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400"
                />
                <span className="text-[11px] text-slate-300">
                  I agree to the Terms of Service & Privacy Policy
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-[11px] text-rose-300 font-medium">{errors.terms.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-white/20 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 ${
                submitting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'
              }`}
            >
              {submitting ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Sign In link */}
            <div className="pt-2 text-center text-xs text-slate-300">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-300 hover:text-blue-200 transition-colors">
                Sign In
              </Link>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Register;
