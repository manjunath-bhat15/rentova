import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import TrustScoreProfile from '../components/TrustScoreProfile';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'trust'
  const [form, setForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, avatar: user.avatar || '' });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/api/auth/profile', form);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
        Account Settings
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Manage your profile settings, identity verification, and platform trust score
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1px' }}>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'settings' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: 'var(--space-sm) var(--space-md)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 'var(--font-base)',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab('trust')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'trust' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'trust' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: 'var(--space-sm) var(--space-md)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 'var(--font-base)',
            transition: 'all 0.2s ease',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Trust & Verification
          <span style={{
            fontSize: 'var(--font-xs)',
            background: 'var(--accent-primary)',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700
          }}>
            {user?.trustScore || 10} pts
          </span>
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div style={{ maxWidth: '600px' }}>
          {message.text && (
            <div className={message.type === 'error' ? 'error-message' : 'glass-card'} style={{
              background: message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : undefined,
              color: message.type === 'success' ? 'var(--accent-success)' : undefined,
              marginBottom: 'var(--space-lg)', padding: 'var(--space-md)'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--bg-tertiary)', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', fontWeight: 700, color: 'var(--text-muted)'
              }}>
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  form.name?.[0]?.toUpperCase() || '?'
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-group">Avatar Image URL</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://example.com/avatar.jpg"
                  value={form.avatar}
                  onChange={(e) => setForm(f => ({ ...f, avatar: e.target.value }))}
                />
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Paste a direct link to an image.
                </p>
              </div>
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="input-group">
              <label>Email <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>(Read-only)</span></label>
              <input
                type="email"
                className="input-field"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            
            <div className="input-group">
              <label>Role</label>
              <input
                type="text"
                className="input-field"
                value={user?.role || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 'var(--space-md)' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      ) : (
        <TrustScoreProfile />
      )}
    </div>
  );
}
