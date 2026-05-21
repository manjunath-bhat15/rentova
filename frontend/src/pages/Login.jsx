import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login, logout } = useAuth();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      if (isAdminMode && userData?.role !== 'ADMIN') {
        logout();
        setError('Access Denied: Only Administrator accounts can log in through the Admin Portal.');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message === 'UNVERIFIED' || err.response?.data === 'UNVERIFIED') {
        setError('Your account is not verified. Please register again to receive a new OTP.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white overflow-hidden">
      {/* Left panel — Orange brand (Hidden on mobile) */}
      <div className="hidden lg:flex w-[45%] bg-brand flex-col justify-center px-14 py-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] rounded-full bg-white/5 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-lg text-brand">R</div>
          <span className="font-extrabold text-2xl text-white tracking-tight">Rentova</span>
        </div>

        <h1 className="text-[clamp(1.8rem,3vw,2.6rem)] font-black text-white leading-[1.1] tracking-tight mb-4">
          Rent anything.<br />Anytime. Anywhere.
        </h1>
        <p className="text-white/80 text-[15px] leading-relaxed mb-10 max-w-[340px]">
          Join 1.8k+ vendors and customers on India's fastest-growing peer-to-peer rental platform.
        </p>

        {/* Feature bullets */}
        {[
          { icon: '🔐', text: 'OTP-secured handoffs' },
          { icon: '💰', text: 'Instant wallet payouts' },
          { icon: '📍', text: 'Real-time tracking' },
        ].map((f) => (
          <div key={f.text} className="flex items-center gap-3 mb-3.5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-sm shrink-0">{f.icon}</div>
            <span className="text-white/90 text-sm font-medium">{f.text}</span>
          </div>
        ))}
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-10 bg-white">
        
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center font-black text-lg text-white shadow-lg">R</div>
          <span className="font-extrabold text-2xl text-gray-900 tracking-tight">Rentova</span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Tab switcher */}
          <div className="flex bg-gray-50 rounded-2xl p-1 mb-8">
            {[{ label: 'Member Login', admin: false }, { label: '⚡ Admin Portal', admin: true }].map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => { setIsAdminMode(tab.admin); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl border-none text-[13px] transition-all duration-200 cursor-pointer focus:outline-none ${
                  isAdminMode === tab.admin 
                    ? 'bg-white text-gray-900 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                    : 'bg-transparent text-gray-500 font-medium hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h2 className="text-[1.8rem] font-black text-gray-900 tracking-tight mb-1.5">
            {isAdminMode ? 'Admin Access' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 text-sm mb-7">
            {isAdminMode ? 'Authorized personnel only. Audit logs active.' : 'Sign in to your Rentova account.'}
          </p>

          {isAdminMode && (
            <div className="bg-brand/10 border border-brand/20 text-brand px-3.5 py-2.5 rounded-xl text-xs font-bold mb-5 text-center">
              ⚠️ SECURE ADMINISTRATOR ACCESS ONLY
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 px-3.5 py-2.5 rounded-xl text-[13px] font-medium mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[13px] font-semibold text-gray-900 block mb-1.5" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-1.5 border-gray-200 text-sm text-gray-900 outline-none transition-colors bg-gray-50 focus:bg-white focus:border-brand placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-[13px] font-semibold text-gray-900 block mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-11 py-3 rounded-xl border-1.5 border-gray-200 text-sm text-gray-900 outline-none transition-colors bg-gray-50 focus:bg-white focus:border-brand placeholder-gray-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(v => !v)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-base text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl border-none text-white text-[15px] font-bold tracking-tight transition-all duration-200 shadow-[0_4px_14px_rgba(252,128,25,0.35)] focus:outline-none ${
                loading ? 'bg-brand-light cursor-not-allowed' : 'bg-brand hover:bg-brand-dark hover:-translate-y-[1px]'
              }`}
            >
              {loading ? '⏳ Signing in...' : (isAdminMode ? 'Authenticate & Enter →' : 'Sign In →')}
            </button>
          </form>

          {!isAdminMode && (
            <p className="text-center mt-6 text-sm text-gray-500">
              New to Rentova?{' '}
              <Link to="/register" className="text-brand font-bold no-underline hover:underline">
                Create account →
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
