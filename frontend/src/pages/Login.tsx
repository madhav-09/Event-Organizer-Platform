import { Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginUser, registerUser } from '../services/auth_api';
import type { RegisterPayload, LoginPayload } from '../services/auth_api';
import type { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Show a session-expired toast if redirected here by the auth interceptor
  useEffect(() => {
    if (searchParams.get('reason') === 'session_expired') {
      toast.error('Your session has expired. Please sign in again.');
    }
  }, []);

  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const payload: RegisterPayload = { name: formData.name, email: formData.email, password: formData.password };
        await registerUser(payload);
        toast.success('Account created! You can now sign in.');
        setIsSignUp(false);
        setFormData({ name: '', email: formData.email, password: '' });
        return;
      }

      const payload: LoginPayload = { email: formData.email, password: formData.password };
      const res = await loginUser(payload);
      login(res.data);
      toast.success('Signed in successfully');

      const role = res.data.user.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'ORGANIZER') navigate('/organizer');
      else navigate('/');
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<any>;
      const detail = axiosErr.response?.data?.detail;
      let msg = 'Something went wrong';
      if (Array.isArray(detail)) msg = detail[0]?.msg || 'Invalid input';
      else if (typeof detail === 'string') msg = detail;
      else msg = axiosErr.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left visual panel — hidden on mobile */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0B0F1A 60%, #1e1040 100%)' }}>

        {/* Blobs */}
        <div className="absolute top-[10%] left-[10%] w-80 h-80 rounded-full animate-blob opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(108,71,236,0.6), transparent 70%)' }} />
        <div className="absolute bottom-[5%] right-[5%] w-64 h-64 rounded-full animate-blob-delay opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6), transparent 70%)' }} />

        {/* Dotted grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/20 mx-auto mb-8 shadow-glow">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>

          <h2 className="font-heading font-black text-4xl xl:text-5xl text-white mb-5 leading-tight">
            Your Events,<br />
            <span className="gradient-text">Your World</span>
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Discover concerts, workshops, and experiences happening near you — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { emoji: '🎵', label: 'Music' },
              { emoji: '💼', label: 'Workshop' },
              { emoji: '🎭', label: 'Comedy' },
              { emoji: '🎨', label: 'Arts' },
              { emoji: '🏆', label: 'Sports' },
              { emoji: '☕', label: 'Food' },
            ].map(({ emoji, label }) => (
              <span key={label} className="px-4 py-2 rounded-full text-sm text-slate-300 flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                {emoji} {label}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/15">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{
                background: 'rgba(108,71,236,0.15)',
                border: '1px solid rgba(108,71,236,0.3)',
                color: '#c4b5fd',
              }}>
              <Sparkles className="w-3 h-3" />
              {isSignUp ? 'Join the community' : 'Welcome back'}
            </div>
            <h1 className="font-heading font-black text-3xl text-white mb-2">
              {isSignUp ? 'Create account' : 'Sign in'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isSignUp ? 'Start discovering amazing events today.' : "Don't have an account? "}
              {!isSignUp && (
                <button onClick={() => { setIsSignUp(true); }}
                  className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  Sign up free
                </button>
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="animate-slide-down">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="input-glass pl-11"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="input-glass pl-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="input-glass pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {isSignUp && (
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button onClick={() => { setIsSignUp(false); }}
                className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
