import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import api from '../services/api';

const roleNav = {
  CUSTOMER: [
    { path: '/dashboard', label: 'Home', emoji: '🏠', exact: true },
    { path: '/dashboard/nearby', label: 'Nearby', emoji: '📍' },
    { path: '/dashboard/services', label: 'Browse', emoji: '🛒' },
    { path: '/dashboard/bookings', label: 'Bookings', emoji: '📋' },
    { path: '/dashboard/wallet', label: 'Wallet', emoji: '💰' },
    { path: '/dashboard/chat', label: 'Messages', emoji: '💬' },
    { path: '/dashboard/notifications', label: 'Alerts', emoji: '🔔' },
  ],
  VENDOR: [
    { path: '/dashboard', label: 'Console', emoji: '🏠', exact: true },
    { path: '/dashboard/services', label: 'Listings', emoji: '🏪' },
    { path: '/dashboard/services/create', label: 'Add', emoji: '➕' },
    { path: '/dashboard/bookings', label: 'Bookings', emoji: '📋' },
    { path: '/dashboard/wallet', label: 'Wallet', emoji: '💰' },
    { path: '/dashboard/chat', label: 'Messages', emoji: '💬' },
    { path: '/dashboard/notifications', label: 'Alerts', emoji: '🔔' },
  ],
  ADMIN: [
    { path: '/dashboard', label: 'HQ', emoji: '⚡', exact: true },
    { path: '/dashboard/admin/users', label: 'Users', emoji: '👥' },
    { path: '/dashboard/bookings', label: 'Bookings', emoji: '📋' },
    { path: '/dashboard/services', label: 'Listings', emoji: '🏪' },
    { path: '/dashboard/chat', label: 'Chat', emoji: '💬' },
    { path: '/dashboard/notifications', label: 'Alerts', emoji: '🔔' },
  ],
};

const roleMeta = {
  CUSTOMER: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Customer' },
  VENDOR:   { color: '#fc8019', bg: 'rgba(252,128,25,0.1)',  label: 'Vendor' },
  ADMIN:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  label: 'Admin' },
};

export default function TopNav() {
  const { user, logout } = useAuth();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();
  const role = user?.role || 'CUSTOMER';
  const items = roleNav[role] || roleNav.CUSTOMER;
  const meta = roleMeta[role] || roleMeta.CUSTOMER;
  const [unread, setUnread] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/notifications');
        setUnread(res.data.filter(n => !n.read).length);
      } catch {}
    };
    load();
    const handler = () => load();
    window.addEventListener('notificationSync', handler);
    return () => window.removeEventListener('notificationSync', handler);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navLinkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 14px', borderRadius: '999px',
    textDecoration: 'none', fontSize: '13px', fontWeight: isActive ? 700 : 500,
    color: isActive ? '#fc8019' : '#686b78',
    background: isActive ? 'rgba(252,128,25,0.1)' : 'transparent',
    transition: 'all 0.15s ease', whiteSpace: 'nowrap',
    border: isActive ? '1px solid rgba(252,128,25,0.2)' : '1px solid transparent',
  });

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #f0f0f0', zIndex: 100,
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: '8px',
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: '#fc8019',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 14, color: '#fff',
          boxShadow: '0 3px 10px rgba(252,128,25,0.3)',
        }}>R</div>
        <span style={{ fontWeight: 800, fontSize: '15px', color: '#1c1c1c', letterSpacing: '-0.03em', display: 'none' }} className="nav-brand-text">
          Rentova
        </span>
      </div>

      {/* Role badge — desktop only */}
      <span className="nav-desktop" style={{
        padding: '3px 10px', borderRadius: '999px', fontSize: '11px',
        fontWeight: 700, background: meta.bg, color: meta.color,
        marginRight: '4px', flexShrink: 0,
      }}>
        {meta.label}
      </span>

      {/* Nav links — desktop */}
      <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, overflowX: 'auto' }}>
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: '14px' }}>{item.emoji}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer mobile */}
      <div style={{ flex: 1 }} className="nav-mobile" />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

        {/* Bell */}
        <button
          onClick={() => navigate('/dashboard/notifications')}
          style={{
            position: 'relative', width: 36, height: 36, borderRadius: '10px',
            border: '1.5px solid #f0f0f0', background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fff3e8'; e.currentTarget.style.borderColor = 'rgba(252,128,25,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#f0f0f0'; }}
        >
          🔔
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#fc8019', color: '#fff',
              fontSize: '9px', fontWeight: 800,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>{unread > 9 ? '9+' : unread}</span>
          )}
        </button>

        {/* Avatar + profile dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfile(v => !v)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #fc8019, #ff9f43)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, color: '#fff',
              overflow: 'hidden', flexShrink: 0,
            }}
          >
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </button>

          {showProfile && (
            <div style={{
              position: 'absolute', right: 0, top: '44px',
              background: '#fff', borderRadius: '16px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              padding: '8px', minWidth: '220px', zIndex: 200,
              animation: 'slideUp 0.2s ease',
            }}>
              {/* User info */}
              <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #f5f5f5', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fc8019, #ff9f43)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>{initials}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1c1c1c' }}>{user?.name}</div>
                    <div style={{ fontSize: '11px', color: '#93959f' }}>{user?.email}</div>
                  </div>
                </div>
                <span style={{
                  display: 'inline-block', marginTop: '8px',
                  padding: '2px 10px', borderRadius: '999px',
                  fontSize: '11px', fontWeight: 700,
                  background: meta.bg, color: meta.color,
                }}>{meta.label}</span>
              </div>

              {[
                { emoji: '👤', label: 'Profile & Settings', path: '/dashboard/profile' },
                { emoji: '💰', label: 'My Wallet', path: '/dashboard/wallet' },
                { emoji: '📋', label: 'My Bookings', path: '/dashboard/bookings' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setShowProfile(false); }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: 'none', background: 'transparent',
                    color: '#1c1c1c', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'background 0.15s ease', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8f8'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '15px' }}>{item.emoji}</span> {item.label}
                </button>
              ))}

              <div style={{ borderTop: '1px solid #f5f5f5', marginTop: '4px', paddingTop: '4px' }}>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: 'none', background: 'transparent',
                    color: '#ef4444', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'background 0.15s ease', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
