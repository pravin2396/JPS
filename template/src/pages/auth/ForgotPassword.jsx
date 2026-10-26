import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { VALIDATION_RULES, calculatePasswordStrength } from '../../utils/validation';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [targetEmail, setTargetEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm({ defaultValues: { email: '' } });
  const otpForm = useForm({ defaultValues: { otp: '' } });
  const resetForm = useForm({ defaultValues: { newPassword: '', confirmNewPassword: '' } });

  const watchedNewPassword = resetForm.watch('newPassword', '');
  const strength = calculatePasswordStrength(watchedNewPassword);

  const onEmailSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(data.email);
      setTargetEmail(data.email);
      setGeneratedOtp(res.otp);
      setStep(2);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Could not find that email.');
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.verifyResetOtp(targetEmail, data.otp);
      setStep(3);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email: targetEmail,
        newPassword: data.newPassword,
      });
      setStep(4);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
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

      <div className="relative z-10 max-w-4xl w-full rounded-[28px] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[560px] bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
        
        {/* LEFT COLUMN: Hero Panel */}
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
                Security & Account Recovery
              </span>
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
              Reset your password safely and quickly.
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-slate-200/90 leading-relaxed">
              Verify your registered account email and set up a new password with encrypted credential updates.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <div className="w-4 h-4 rounded-full bg-blue-500/25 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span>End-to-end credential verification</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recovery Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-slate-900/45 backdrop-blur-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {step === 1 && 'Enter your verified email to receive a recovery code'}
              {step === 2 && `Enter the 6-digit verification code sent to ${targetEmail}`}
              {step === 3 && 'Create a strong, new password for your account'}
              {step === 4 && 'Your password has been successfully updated!'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="mt-5 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s
                      ? 'bg-blue-600 text-white shadow-xs'
                      : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/20 text-slate-300'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className={`w-8 h-1 mx-1 rounded ${step > s ? 'bg-emerald-500' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="mt-5 space-y-4" noValidate>
              <div>
                <label htmlFor="f-email" className="block text-xs font-medium text-slate-200 mb-1">
                  Registered Account Email<span className="text-rose-400">*</span>
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="f-email"
                    type="email"
                    placeholder="e.g. candidate@jobportal.dev"
                    {...emailForm.register('email', VALIDATION_RULES.email)}
                    className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder-slate-400 outline-none focus:border-blue-400"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-[11px] text-rose-300 font-medium">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Quick autofill helper */}
              <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-slate-300 flex items-center justify-between">
                <span>Demo accounts:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => emailForm.setValue('email', 'candidate@jobportal.dev', { shouldValidate: true })}
                    className="text-blue-300 font-semibold hover:underline"
                  >
                    Candidate
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => emailForm.setValue('email', 'recruiter@jobportal.dev', { shouldValidate: true })}
                    className="text-emerald-300 font-semibold hover:underline"
                  >
                    Recruiter
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 border border-white/20"
              >
                {loading ? 'Sending Code...' : 'Send Recovery Code'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="mt-5 space-y-4" noValidate>
              <div className="bg-blue-900/30 border border-blue-400/30 p-3 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-white block font-semibold">Simulated OTP Delivery</span>
                  <span className="text-blue-200">Demo Code: <strong className="font-mono text-sm text-blue-300">{generatedOtp || '849201'}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => otpForm.setValue('otp', generatedOtp || '849201', { shouldValidate: true })}
                  className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto Fill
                </button>
              </div>

              <div>
                <label htmlFor="f-otp" className="block text-xs font-medium text-slate-200 mb-1">
                  6-Digit Verification Code<span className="text-rose-400">*</span>
                </label>
                <input
                  id="f-otp"
                  type="text"
                  maxLength={6}
                  placeholder="849201"
                  {...otpForm.register('otp', { required: 'Code is required' })}
                  className="block w-full text-center text-xl tracking-widest font-mono py-2 rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white outline-none focus:border-blue-400"
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-[11px] text-rose-300 text-center font-medium">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md transition-all border border-white/20"
              >
                {loading ? 'Verifying...' : 'Verify Code & Continue'}
              </button>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="mt-5 space-y-4" noValidate>
              <div>
                <label htmlFor="new-pass" className="block text-xs font-medium text-slate-200 mb-1">
                  New Password<span className="text-rose-400">*</span>
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="new-pass"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    {...resetForm.register('newPassword', VALIDATION_RULES.password)}
                    className="block w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white placeholder-slate-400 outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="mt-1 text-[11px] text-rose-300 font-medium">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {watchedNewPassword && (
                <div className="bg-white/[0.05] p-2 rounded-lg border border-white/10 text-[11px] space-y-1">
                  <span className="text-slate-300">Strength: <strong>{strength.label}</strong></span>
                  <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color}`} style={{ width: strength.width }}></div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="confirm-pass" className="block text-xs font-medium text-slate-200 mb-1">
                  Confirm Password<span className="text-rose-400">*</span>
                </label>
                <input
                  id="confirm-pass"
                  type="password"
                  placeholder="••••••••••••"
                  {...resetForm.register('confirmNewPassword', {
                    required: 'Please confirm password',
                    validate: (v) => v === watchedNewPassword || 'Passwords do not match',
                  })}
                  className="block w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur-md text-white outline-none focus:border-blue-400"
                />
                {resetForm.formState.errors.confirmNewPassword && (
                  <p className="mt-1 text-[11px] text-rose-300 font-medium">
                    {resetForm.formState.errors.confirmNewPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all border border-white/20"
              >
                {loading ? 'Saving...' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="mt-5 text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Password Updated!</h3>
              <p className="text-xs text-slate-300">
                Your password for <strong>{targetEmail}</strong> has been saved.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md border border-white/20"
              >
                Proceed to Sign In
              </button>
            </div>
          )}

          {step !== 4 && (
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Login
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
