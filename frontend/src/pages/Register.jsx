import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import api from '../services/api';

const inputStyle = (focused) => ({
  width: '100%',
  padding: '13px 16px',
  borderRadius: '12px',
  border: `1.5px solid ${focused ? '#fc8019' : '#e8e8e8'}`,
  fontSize: '14px',
  color: '#1c1c1c',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  background: focused ? '#fff' : '#fafafa',
});

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
  const [focusedField, setFocusedField] = useState(null);
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#ffffff',
    }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 42%',
        background: '#fc8019',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fc8019' }}>R</div>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.04em' }}>Rentova</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '16px' }}>
          {step === 1 ? 'Start renting\ntoday. Free.' : 'Almost there! 🎉'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px', maxWidth: '340px', whiteSpace: 'pre-line' }}>
          {step === 1
            ? 'Join thousands of vendors and customers on India\'s fastest rental platform.'
            : `We sent a 6-digit code to\n${email}\n\nEnter it to activate your account.`}
        </p>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2].map((s) => (
            <div key={s} style={{
              height: 4, borderRadius: 999,
              flex: s === step ? 2 : 1,
              background: s <= step ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '8px' }}>Step {step} of 2</p>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1c1c1c', letterSpacing: '-0.04em', marginBottom: '6px' }}>
            {step === 1 ? 'Create account' : 'Verify your email'}
          </h2>
          <p style={{ color: '#686b78', fontSize: '14px', marginBottom: '28px' }}>
            {step === 1 ? 'Fill in your details to get started.' : `Enter the 6-digit code sent to ${email}`}
          </p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 500, marginBottom: '20px' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 500, marginBottom: '20px' }}>
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', value: name, onChange: (e) => setName(e.target.value) },
                { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', value: email, onChange: (e) => setEmail(e.target.value) },
                { id: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters', value: password, onChange: (e) => setPassword(e.target.value), minLength: 6 },
              ].map(({ id, label, ...props }) => (
                <div key={id}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', display: 'block', marginBottom: '6px' }}>{label}</label>
                  <input
                    id={id}
                    {...props}
                    required
                    style={inputStyle(focusedField === id)}
                    onFocus={() => setFocusedField(id)}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', display: 'block', marginBottom: '8px' }}>I want to</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { val: 'CUSTOMER', icon: '🛒', label: 'Rent Items', sub: 'Browse & book rentals' },
                    { val: 'VENDOR', icon: '🏪', label: 'List Items', sub: 'Earn from my assets' },
                  ].map((opt) => (
                    <div
                      key={opt.val}
                      onClick={() => setRole(opt.val)}
                      style={{
                        border: `2px solid ${role === opt.val ? '#fc8019' : '#e8e8e8'}`,
                        borderRadius: '12px', padding: '14px',
                        cursor: 'pointer',
                        background: role === opt.val ? 'rgba(252,128,25,0.06)' : '#fafafa',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{opt.icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1c1c1c' }}>{opt.label}</div>
                      <div style={{ fontSize: '11px', color: '#686b78', marginTop: '2px' }}>{opt.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: loading ? '#ffc895' : '#fc8019',
                color: '#fff', fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(252,128,25,0.35)',
                letterSpacing: '-0.01em',
                transition: 'all 0.2s ease',
              }}>
                {loading ? '⏳ Creating account...' : 'Create Account →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', display: 'block', marginBottom: '6px' }}>Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="0 0 0 0 0 0"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  minLength={6}
                  maxLength={6}
                  style={{
                    ...inputStyle(focusedField === 'otp'),
                    textAlign: 'center',
                    letterSpacing: '0.6rem',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                  }}
                  onFocus={() => setFocusedField('otp')}
                  onBlur={() => setFocusedField(null)}
                />
                {/* OTP digit progress dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < otp.length ? '#fc8019' : '#e8e8e8', transition: 'background 0.15s' }} />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading || otp.length !== 6} style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: otp.length === 6 ? '#fc8019' : '#e8e8e8',
                color: otp.length === 6 ? '#fff' : '#93959f',
                fontSize: '15px', fontWeight: 700,
                cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                boxShadow: otp.length === 6 ? '0 4px 14px rgba(252,128,25,0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                {loading ? '⏳ Verifying...' : 'Verify & Continue →'}
              </button>

              <button type="button" onClick={handleResendOtp} disabled={loading} style={{
                background: 'none', border: 'none', color: '#fc8019',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                textAlign: 'center', padding: '4px',
              }}>
                {loading ? 'Sending...' : "Didn't receive it? Resend code"}
              </button>
            </form>
          )}

          {step === 1 && (
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#686b78' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#fc8019', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
