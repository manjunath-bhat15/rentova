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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#ffffff',
    }}>
      {/* Left panel — Orange brand */}
      <div style={{
        flex: '0 0 45%',
        background: '#fc8019',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fc8019' }}>R</div>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff', letterSpacing: '-0.04em' }}>Rentova</span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '16px' }}>
          Rent anything.<br />Anytime. Anywhere.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px', maxWidth: '340px' }}>
          Join 1.8k+ vendors and customers on India's fastest-growing peer-to-peer rental platform.
        </p>

        {/* Feature bullets */}
        {[
          { icon: '🔐', text: 'OTP-secured handoffs' },
          { icon: '💰', text: 'Instant wallet payouts' },
          { icon: '📍', text: 'Real-time tracking' },
        ].map((f) => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{f.icon}</div>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Right panel — Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 48px',
        background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '14px', padding: '4px', marginBottom: '32px' }}>
            {[{ label: 'Member Login', admin: false }, { label: '⚡ Admin Portal', admin: true }].map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => { setIsAdminMode(tab.admin); setError(''); }}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '11px',
                  border: 'none',
                  background: isAdminMode === tab.admin ? '#ffffff' : 'transparent',
                  color: isAdminMode === tab.admin ? '#1c1c1c' : '#686b78',
                  fontWeight: isAdminMode === tab.admin ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isAdminMode === tab.admin ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1c1c1c', letterSpacing: '-0.04em', marginBottom: '6px' }}>
            {isAdminMode ? 'Admin Access' : 'Welcome back'}
          </h2>
          <p style={{ color: '#686b78', fontSize: '14px', marginBottom: '28px' }}>
            {isAdminMode ? 'Authorized personnel only. Audit logs active.' : 'Sign in to your Rentova account.'}
          </p>

          {isAdminMode && (
            <div style={{
              background: 'rgba(252,128,25,0.08)',
              border: '1px solid rgba(252,128,25,0.2)',
              color: '#fc8019',
              padding: '10px 14px', borderRadius: '12px',
              fontSize: '12px', fontWeight: 700,
              marginBottom: '20px', textAlign: 'center',
            }}>
              ⚠️ SECURE ADMINISTRATOR ACCESS ONLY
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444',
              padding: '10px 14px', borderRadius: '12px',
              fontSize: '13px', fontWeight: 500,
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', display: 'block', marginBottom: '6px' }}>Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #e8e8e8',
                  fontSize: '14px',
                  color: '#1c1c1c',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  background: '#fafafa',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#fc8019'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e8e8e8'; e.target.style.background = '#fafafa'; }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', display: 'block', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '13px 44px 13px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #e8e8e8',
                    fontSize: '14px',
                    color: '#1c1c1c',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box',
                    background: '#fafafa',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#fc8019'; e.target.style.background = '#fff'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e8e8e8'; e.target.style.background = '#fafafa'; }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#93959f',
                }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: loading ? '#ffc895' : '#fc8019',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(252,128,25,0.35)',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? '⏳ Signing in...' : (isAdminMode ? 'Authenticate & Enter →' : 'Sign In →')}
            </button>
          </form>

          {!isAdminMode && (
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#686b78' }}>
              New to Rentova?{' '}
              <Link to="/register" style={{ color: '#fc8019', fontWeight: 700, textDecoration: 'none' }}>
                Create account →
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
