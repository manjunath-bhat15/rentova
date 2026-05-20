import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { lang, theme, toggleTheme, toggleLanguage, t } = useThemeLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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
    <div className="auth-page">
      {/* Dynamic top action switcher bar - optimized with top/right styling for all devices */}
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

      <div className="glass-card auth-card">
        <h1>{t('loginTitle')}</h1>
        <p>{t('loginSubtitle')}</p>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">{t('emailLabel')}</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">{t('passwordLabel')}</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('loading') : t('loginBtn')}
          </button>
        </form>

        <div className="auth-footer">
          {t('noAccount')} <Link to="/register">{t('registerLink')}</Link>
        </div>
      </div>
    </div>
  );
}
