import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import TrustScoreProfile from '../components/TrustScoreProfile';

const roleColors = {
  CUSTOMER: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Customer' },
  VENDOR:   { color: '#fc8019', bg: 'rgba(252,128,25,0.1)',  label: 'Vendor' },
  ADMIN:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Admin' },
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
        {hint && <span style={{ color: '#93959f', textTransform: 'none', fontSize: '11px', fontWeight: 400, marginLeft: '6px' }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder, disabled, focused, onFocus, onBlur }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        border: `1.5px solid ${focused ? '#fc8019' : '#e8e8e8'}`,
        fontSize: '14px', color: '#1c1c1c', outline: 'none',
        background: disabled ? '#f5f5f5' : focused ? '#fff' : '#fafafa',
        transition: 'all 0.2s ease', boxSizing: 'border-box',
        opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text',
      }}
    />
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');
  const [form, setForm] = useState({
    name: '', avatar: '', phone: '', bio: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name:    user.name    || '',
        avatar:  user.avatar  || '',
        phone:   user.phone   || '',
        bio:     user.bio     || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/api/auth/profile', form);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const roleStyle = roleColors[user?.role] || roleColors.CUSTOMER;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const trustScore = user?.trustScore || 10;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: '720px' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 100%)',
        borderRadius: '20px', padding: '28px 32px',
        marginBottom: '24px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(252,128,25,0.1)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', position: 'relative' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fc8019, #ff9f43)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 900, color: '#fff',
            flexShrink: 0, overflow: 'hidden',
            border: '3px solid rgba(255,255,255,0.15)',
          }}>
            {form.avatar ? <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
              {user?.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: '0 0 12px' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: roleStyle.bg, color: roleStyle.color, padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                {roleStyle.label}
              </span>
              <span style={{ background: 'rgba(252,128,25,0.15)', color: '#fc8019', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                ⭐ {trustScore} Trust Points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Pills */}
      <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '14px', padding: '4px', marginBottom: '20px', width: 'fit-content', gap: '2px' }}>
        {[
          { id: 'settings', label: '👤 Edit Profile' },
          { id: 'trust',    label: '🛡️ Trust & Badges' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '9px 20px', borderRadius: '11px', border: 'none',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#1c1c1c' : '#686b78',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label}
            {tab.id === 'trust' && (
              <span style={{ background: '#fc8019', color: '#fff', padding: '1px 7px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, marginLeft: '6px' }}>
                {trustScore}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'settings' ? (
        <div>
          {/* Status message */}
          {message.text && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
              fontSize: '13px', fontWeight: 600,
              background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Avatar */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 16px' }}>Profile Picture</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#f5f5f5', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 700, color: '#93959f', flexShrink: 0,
                  border: '2px solid #f0f0f0',
                }}>
                  {form.avatar ? <img src={form.avatar} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <Input
                    type="url"
                    value={form.avatar}
                    onChange={set('avatar')}
                    placeholder="https://example.com/your-photo.jpg"
                    focused={focused === 'avatar'}
                    onFocus={() => setFocused('avatar')}
                    onBlur={() => setFocused(null)}
                  />
                  <p style={{ fontSize: '11px', color: '#93959f', marginTop: '4px', marginBottom: 0 }}>Paste a direct image URL</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>Basic Info</h3>

              <Field label="Full Name">
                <Input value={form.name} onChange={set('name')} placeholder="Your full name"
                  focused={focused === 'name'} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
              </Field>

              <Field label="Email" hint="• Read-only">
                <Input value={user?.email || ''} disabled focused={false} />
              </Field>

              <Field label="Phone Number" hint="• Optional">
                <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210"
                  focused={focused === 'phone'} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
              </Field>

              <Field label="Role">
                <div style={{
                  padding: '12px 16px', borderRadius: '12px',
                  border: '1.5px solid #f0f0f0', background: roleStyle.bg,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ color: roleStyle.color, fontWeight: 700, fontSize: '14px' }}>{roleStyle.label}</span>
                </div>
              </Field>
            </div>

            {/* About */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>About You</h3>

              <Field label="Bio" hint="• Shown to vendors/customers">
                <textarea
                  value={form.bio}
                  onChange={set('bio')}
                  placeholder="Tell others a bit about yourself..."
                  rows={3}
                  onFocus={() => setFocused('bio')}
                  onBlur={() => setFocused(null)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    border: `1.5px solid ${focused === 'bio' ? '#fc8019' : '#e8e8e8'}`,
                    fontSize: '14px', color: '#1c1c1c', outline: 'none',
                    background: focused === 'bio' ? '#fff' : '#fafafa',
                    transition: 'all 0.2s ease', boxSizing: 'border-box',
                    resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
                  }}
                />
              </Field>

              <Field label="Address / Location" hint="• Optional">
                <Input value={form.address} onChange={set('address')} placeholder="Your city or area (e.g. Indiranagar, Bengaluru)"
                  focused={focused === 'address'} onFocus={() => setFocused('address')} onBlur={() => setFocused(null)} />
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                background: loading ? '#ffc895' : '#fc8019',
                color: '#fff', fontSize: '15px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(252,128,25,0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? '⏳ Saving...' : '✓ Save Changes'}
            </button>
          </form>
        </div>
      ) : (
        <TrustScoreProfile />
      )}
    </div>
  );
}
