import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import api from '../services/api';

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, verifyOtp } = useAuth();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();

  const handleResendOtp = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.post('/api/auth/resend-otp', { email });
      setSuccess('Verification code resent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally { setLoading(false); }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register(name, email, password, role);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be in use.');
    } finally { setLoading(false); }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border-1.5 border-gray-200 text-sm text-gray-900 outline-none transition-colors bg-gray-50 focus:bg-white focus:border-brand placeholder-gray-400";

  return (
    <div className="min-h-screen flex font-sans bg-white overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex w-[42%] bg-brand flex-col justify-center px-14 py-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-lg text-brand">R</div>
          <span className="font-extrabold text-2xl text-white tracking-tight">Rentova</span>
        </div>

        <h1 className="text-[clamp(1.8rem,3vw,2.4rem)] font-black text-white leading-[1.1] tracking-tight mb-4 whitespace-pre-line">
          {step === 1 ? 'Start renting\ntoday. Free.' : 'Almost there! 🎉'}
        </h1>
        <p className="text-white/80 text-[15px] leading-relaxed mb-10 max-w-[340px] whitespace-pre-line">
          {step === 1
            ? "Join thousands of vendors and customers on India's fastest rental platform."
            : `We sent a 6-digit code to\n${email}\n\nEnter it to activate your account.`}
        </p>

        {/* Step indicators */}
        <div className="flex gap-2 w-full max-w-[200px]">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 rounded-full transition-all duration-400 ${s === step ? 'flex-[2] bg-white' : 'flex-[1] bg-white/30'}`} />
          ))}
        </div>
        <p className="text-white/60 text-xs mt-2">Step {step} of 2</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-10 bg-white">
        
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center font-black text-lg text-white shadow-lg">R</div>
          <span className="font-extrabold text-2xl text-gray-900 tracking-tight">Rentova</span>
        </div>

        <div className="w-full max-w-[400px]">
          <h2 className="text-[1.8rem] font-black text-gray-900 tracking-tight mb-1.5">
            {step === 1 ? 'Create account' : 'Verify your email'}
          </h2>
          <p className="text-gray-500 text-sm mb-7">
            {step === 1 ? 'Fill in your details to get started.' : `Enter the 6-digit code sent to ${email}`}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 px-3.5 py-2.5 rounded-xl text-[13px] font-medium mb-5">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-3.5 py-2.5 rounded-xl text-[13px] font-medium mb-5">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-900 block mb-1.5" htmlFor="name">Full Name</label>
                <input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
              </div>
              
              <div>
                <label className="text-[13px] font-semibold text-gray-900 block mb-1.5" htmlFor="email">Email Address</label>
                <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
              </div>

              <div>
                <label className="text-[13px] font-semibold text-gray-900 block mb-1.5" htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} />
              </div>

              <div className="mt-2">
                <label className="text-[13px] font-semibold text-gray-900 block mb-2">I want to</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { val: 'CUSTOMER', icon: '🛒', label: 'Rent Items', sub: 'Browse & book' },
                    { val: 'VENDOR', icon: '🏪', label: 'List Items', sub: 'Earn from assets' },
                  ].map((opt) => (
                    <div
                      key={opt.val}
                      onClick={() => setRole(opt.val)}
                      className={`border-2 rounded-xl p-3.5 cursor-pointer text-center transition-all duration-200 ${
                        role === opt.val 
                          ? 'border-brand bg-brand/5' 
                          : 'border-gray-200 bg-gray-50 hover:border-brand/50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{opt.icon}</div>
                      <div className="text-[13px] font-bold text-gray-900">{opt.label}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{opt.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-3.5 mt-2 rounded-xl border-none text-white text-[15px] font-bold tracking-tight transition-all duration-200 shadow-[0_4px_14px_rgba(252,128,25,0.35)] focus:outline-none ${
                loading ? 'bg-brand-light cursor-not-allowed' : 'bg-brand hover:bg-brand-dark hover:-translate-y-[1px]'
              }`}>
                {loading ? '⏳ Creating account...' : 'Create Account →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-900 block mb-1.5" htmlFor="otp">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  minLength={6}
                  maxLength={6}
                  className={`${inputClass} text-center tracking-[0.5em] text-2xl font-black font-mono`}
                />
                <div className="flex justify-center gap-1.5 mt-3">
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-150 ${i < otp.length ? 'bg-brand' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} className={`w-full py-3.5 mt-4 rounded-xl border-none text-[15px] font-bold tracking-tight transition-all duration-200 focus:outline-none ${
                otp.length === 6 && !loading
                  ? 'bg-brand text-white shadow-[0_4px_14px_rgba(252,128,25,0.35)] hover:-translate-y-[1px] cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}>
                {loading ? '⏳ Verifying...' : 'Verify & Continue →'}
              </button>

              <button type="button" onClick={handleResendOtp} disabled={loading} className="bg-transparent border-none text-brand text-[13px] font-semibold cursor-pointer text-center p-1 mt-2 hover:underline focus:outline-none">
                {loading ? 'Sending...' : "Didn't receive it? Resend code"}
              </button>
            </form>
          )}

          {step === 1 && (
            <p className="text-center mt-6 text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand font-bold no-underline hover:underline">Sign in →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
