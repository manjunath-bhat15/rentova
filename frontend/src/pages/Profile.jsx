import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import TrustScoreProfile from '../components/TrustScoreProfile';

const roleColors = {
  CUSTOMER: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Customer' },
  VENDOR: { color: '#fc8019', bg: 'rgba(252,128,25,0.1)', label: 'Vendor' },
  ADMIN: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Admin' },
};

const inputFocusStyle = (focused) => ({
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  border: `1.5px solid ${focused ? '#fc8019' : '#e8e8e8'}`,
  fontSize: '14px',
  color: '#1c1c1c',
  outline: 'none',
  background: focused ? '#fff' : '#fafafa',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
});

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (user) setForm({ name: user.name, avatar: user.avatar || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/api/auth/profile', form);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const roleStyle = roleColors[user?.role] || roleColors.CUSTOMER;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const trustScore = user?.trustScore || 10;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: '760px' }}>

      {/* Profile Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #fc8019 0%, #ff9f43 100%)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '3px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 900, color: '#fff',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
              {user?.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', margin: '0 0 10px' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                {roleStyle.label}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                ⭐ {trustScore} Trust Points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Pills */}
      <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '14px', padding: '4px', marginBottom: '24px', width: 'fit-content' }}>
        {[
          { id: 'settings', label: '👤 Basic Info' },
          { id: 'trust', label: `🛡️ Trust & Verification` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '9px 20px',
              borderRadius: '11px',
              border: 'none',
              background: activeTab === tab.id ? '#ffffff' : 'transparent',
              color: activeTab === tab.id ? '#1c1c1c' : '#686b78',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            {tab.label}
            {tab.id === 'trust' && (
              <span style={{ background: '#fc8019', color: '#fff', padding: '1px 7px', borderRadius: '999px', fontSize: '10px', fontWeight: 700 }}>
                {trustScore} pts
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'settings' ? (
        <div>
          {message.text && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: 600,
              background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Avatar URL + preview */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f0f0f0', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', marginBottom: '16px' }}>Profile Picture</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#f5f5f5', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 700, color: '#93959f', flexShrink: 0,
                  border: '2px solid #f0f0f0',
                }}>
                  {form.avatar ? (
                    <img src={form.avatar} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : initials}
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <input
                    type="url"
                    placeholder="https://example.com/your-photo.jpg"
                    value={form.avatar}
                    onChange={(e) => setForm(f => ({ ...f, avatar: e.target.value }))}
                    style={inputFocusStyle(focusedField === 'avatar')}
                    onFocus={() => setFocusedField('avatar')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <p style={{ fontSize: '11px', color: '#93959f', marginTop: '4px' }}>Paste a direct image URL</p>
                </div>
              </div>
            </div>

            {/* Info fields */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f0f0f0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', marginBottom: '4px' }}>Account Info</h3>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  style={inputFocusStyle(focusedField === 'name')}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email <span style={{ color: '#93959f', textTransform: 'none', fontSize: '11px', fontWeight: 400 }}>• Read-only</span>
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{ ...inputFocusStyle(false), opacity: 0.5, cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</label>
                <div style={{
                  padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #f0f0f0',
                  background: roleStyle.bg,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ color: roleStyle.color, fontWeight: 700, fontSize: '14px' }}>{roleStyle.label}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: loading ? '#ffc895' : '#fc8019',
                color: '#fff', fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(252,128,25,0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? '⏳ Saving...' : 'Save Changes →'}
            </button>
          </form>
        </div>
      ) : (
        <TrustScoreProfile />
      )}
    </div>
  );
}
