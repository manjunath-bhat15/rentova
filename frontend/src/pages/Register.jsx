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
  const { lang, theme, toggleTheme, toggleLanguage, t } = useThemeLanguage();
  const navigate = useNavigate();

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/auth/resend-otp', { email });
      setSuccess('Verification code resent successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Dynamic top action switcher bar - temporarily commented out
      <div className="auth-top-actions" style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
        <button 
          onClick={toggleLanguage}
          className="theme-switcher-btn-class"
          title="Switch Language"
          style={{ padding: '6px 10px', fontSize: '0.75rem', height: '32px' }}
        >
          🌐 {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </button>
        <button 
          onClick={toggleTheme}
          className="theme-switcher-btn-class"
          title="Toggle Theme"
          style={{ minWidth: '32px', padding: '0 8px', justifyContent: 'center', height: '32px' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      */}

      <div className="glass-card auth-card" style={{ transition: 'all 0.3s ease' }}>
        <h1>{step === 1 ? t('registerTitle') : t('verifyTitle')}</h1>
        <p>{step === 1 ? t('registerSubtitle') : `${t('verifySubtitle')} ${email}`}</p>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div style={{
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '10px 14px',
            fontSize: '0.875rem',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="input-group">
              <label htmlFor="name">{t('fullNameLabel')}</label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="reg-email">{t('regEmailLabel')}</label>
              <input
                id="reg-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="reg-password">{t('regPasswordLabel')}</label>
              <input
                id="reg-password"
                type="password"
                className="input-field"
                placeholder={t('regPasswordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="input-group">
              <label htmlFor="role">{t('roleLabel')}</label>
              <select
                id="role"
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ appearance: 'auto', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
              >
                <option value="CUSTOMER">{t('customerOption')}</option>
                <option value="VENDOR">{t('vendorOption')}</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('loading') : t('createBtn')}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleOtpSubmit}>
            <div className="input-group">
              <label htmlFor="otp">{t('otpLabel')}</label>
              <input
                id="otp"
                type="text"
                className="input-field"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                minLength={6}
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? t('loading') : t('verifyBtn')}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                className="link-btn"
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                {loading ? 'Sending...' : 'Resend Verification Code'}
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="auth-footer">
            {t('haveAccount')} <Link to="/login">{t('loginLink')}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
