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
  const { login, logout } = useAuth();
  const { lang, theme, toggleTheme, toggleLanguage, t } = useThemeLanguage();
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

      <div className="glass-card auth-card">
        <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: 'var(--space-md)' }}>
          <button
            type="button"
            onClick={() => { setIsAdminMode(false); setError(''); }}
            style={{
              flex: 1,
              padding: 'var(--space-sm) var(--space-md)',
              background: 'transparent',
              border: 'none',
              borderBottom: !isAdminMode ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: !isAdminMode ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: !isAdminMode ? 700 : 500,
              cursor: 'pointer',
              fontSize: 'var(--font-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Member Login
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminMode(true); setError(''); }}
            style={{
              flex: 1,
              padding: 'var(--space-sm) var(--space-md)',
              background: 'transparent',
              border: 'none',
              borderBottom: isAdminMode ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: isAdminMode ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isAdminMode ? 700 : 500,
              cursor: 'pointer',
              fontSize: 'var(--font-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Admin Portal
          </button>
        </div>

        <h1>{isAdminMode ? 'Admin Command Center' : t('loginTitle')}</h1>
        <p>{isAdminMode ? 'Authorized personnel access only. Audit logs are active.' : t('loginSubtitle')}</p>

        {isAdminMode && (
          <div style={{
            background: 'rgba(255,122,0,0.1)',
            border: '1px solid var(--accent-primary)',
            color: 'var(--accent-primary)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-xs)',
            marginBottom: 'var(--space-md)',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            ⚠️ SECURE ADMINISTRATOR ACCESS ONLY
          </div>
        )}

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
            {loading ? t('loading') : (isAdminMode ? 'Authenticate & Enter' : t('loginBtn'))}
          </button>
        </form>

        {!isAdminMode && (
          <div className="auth-footer">
            {t('noAccount')} <Link to="/register">{t('registerLink')}</Link>
          </div>
        )}
      </div>
    </div>
  );
}
