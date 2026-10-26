import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = ({
  id,
  name,
  label = 'Password',
  placeholder = '••••••••',
  registration = {},
  error,
  helperText,
  disabled = false,
  autoComplete = 'current-password',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={id || name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          {...registration}
          className={`block w-full pl-9 pr-10 py-2.5 sm:text-sm rounded-lg border transition-all duration-150 outline-none ${
            error
              ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-slate-600" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
          <span className="inline-block w-1 h-1 rounded-full bg-red-600"></span>
          {error.message}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default PasswordInput;
