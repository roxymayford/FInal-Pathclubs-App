import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';


const Register = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogleToken } = useAuth();

  const [username, setUsername]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [usernameError, setUsernameError]     = useState('');
  const [emailError, setEmailError]           = useState('');
  const [passwordError, setPasswordError]     = useState('');
  const [error, setError]                     = useState('');
  const [googleLoading, setGoogleLoading]     = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);

  // ─── Email / Password Register ───────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setError('');

    let hasError = false;
    if (username.length < 3) {
      setUsernameError('Username minimal 3 karakter');
      hasError = true;
    }
    if (!email.includes('@')) {
      setEmailError('Format email tidak valid');
      hasError = true;
    }
    if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      hasError = true;
    }
    if (password !== confirmPassword) {
      setPasswordError('Password tidak cocok');
      hasError = true;
    }
    if (hasError) return;

    setIsSubmitting(true);
    const result = await register(username, email, password);
    setIsSubmitting(false);

    if (result && result.success) {
      navigate('/career-onboarding');
    } else {
      setError(result?.error || 'Email sudah terdaftar atau registrasi gagal.');
    }
  };

  // ─── Google Register ──────────────────────────────────────────────────────
  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');

      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!userInfoRes.ok) {
          throw new Error('Gagal mengambil data profil Google');
        }

        const userInfo = await userInfoRes.json();
        const result = await loginWithGoogleToken(tokenResponse.access_token, userInfo);

        if (result && result.success) {
          if (result.is_new_user || !result.has_recommendation) {
            navigate('/career-onboarding');
          } else {
            navigate('/dashboard');
          }
        } else {
          setError(result?.error || 'Pendaftaran dengan Google gagal');
        }
      } catch (err) {
        setError('Gagal daftar dengan Google. Coba lagi.');
        console.error(err);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google register error:', errorResponse);
      setError('Registrasi Google dibatalkan atau gagal.');
      setGoogleLoading(false);
    },
    onNonOAuthError: (nonOAuthError) => {
      console.warn('Google register non-OAuth error:', nonOAuthError);
      setGoogleLoading(false);
    },
    flow: 'implicit',
  });

  return (
    <div className="bg-white rounded-[32px] p-10 md:p-12 shadow-2xl w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sign up</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-dark font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold flex items-center justify-center">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Username */}
        <div>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${usernameError ? 'text-red-500' : 'text-gray-800'}`}>
              <User size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              id="register-username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 bg-gray-100/80 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 outline-none transition-all placeholder-gray-400 ${
                usernameError
                  ? 'border-2 border-red-400 focus:ring-red-200'
                  : 'border border-transparent focus:ring-primary/20'
              }`}
            />
          </div>
          {usernameError && <p className="text-red-500 text-xs font-bold mt-1.5 ml-2">{usernameError}</p>}
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${emailError ? 'text-red-500' : 'text-gray-800'}`}>
              <Mail size={18} strokeWidth={2.5} />
            </div>
            <input
              type="email"
              id="register-email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 bg-gray-100/80 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 outline-none transition-all placeholder-gray-400 ${
                emailError
                  ? 'border-2 border-red-400 focus:ring-red-200'
                  : 'border border-transparent focus:ring-primary/20'
              }`}
            />
          </div>
          {emailError && <p className="text-red-500 text-xs font-bold mt-1.5 ml-2">{emailError}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${passwordError ? 'text-red-500' : 'text-gray-800'}`}>
              <Lock size={18} strokeWidth={2.5} />
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              id="register-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-12 pr-12 py-3.5 bg-gray-100/80 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 outline-none transition-all placeholder-gray-400 ${
                passwordError
                  ? 'border-2 border-red-400 focus:ring-red-200'
                  : 'border border-transparent focus:ring-primary/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
            </button>
          </div>
          {passwordError && <p className="text-red-500 text-xs font-bold mt-1.5 ml-2">{passwordError}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-800">
              <Lock size={18} strokeWidth={2.5} />
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              id="register-confirm-password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-100/80 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 outline-none transition-all placeholder-gray-400 border border-transparent focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          {/* Register Button */}
          <button
            type="submit"
            id="register-submit"
            className="w-full bg-[#4232c2] hover:bg-[#3426a1] text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]"
          >
            Create Account
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Register Button */}
          <button
            type="button"
            id="register-google"
            onClick={() => handleGoogleRegister()}
            disabled={googleLoading}
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? 'Memproses pendaftaran Google...' : 'Sign up with Google'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;