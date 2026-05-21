import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Icon } from './Icon';
import api from '../services/api';

export default function Header({ title }) {
  const { user } = useAuth();
  const { connected, subscribe } = useSocket();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return undefined;
    loadUnreadCount();
    const sub = subscribe('/user/queue/notifications', () => {
      setUnreadCount((prev) => prev + 1);
    });
    const handleSync = () => loadUnreadCount();
    window.addEventListener('notificationSync', handleSync);
    return () => {
      if (sub) sub.unsubscribe();
      window.removeEventListener('notificationSync', handleSync);
    };
  }, [user, subscribe]);

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const getTranslatedTitle = (originalTitle) => {
    if (originalTitle === 'Overview') return t('overview');
    if (['Services', 'Listings', 'My Listings'].includes(originalTitle)) return t('myListings');
    if (['Create Service', 'Add Listing'].includes(originalTitle)) return t('addListing');
    if (['Bookings', 'My Bookings', 'Orders'].includes(originalTitle)) return t('myBookings');
    if (['Wallet', 'Payouts'].includes(originalTitle)) return t('wallet');
    if (['Chat', 'Messages'].includes(originalTitle)) return t('messages');
    if (originalTitle === 'Nearby Vendors') return t('nearbyVendors');
    if (originalTitle === 'Notifications') return t('notifications');
    if (['Admin Command Center', 'Command Center'].includes(originalTitle)) return t('commandCenter');
    if (['User Management', 'Users'].includes(originalTitle)) return t('users');
    return originalTitle;
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: '240px',
      right: 0,
      height: '60px',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 40,
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Left: Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1c1c1c', margin: 0, letterSpacing: '-0.02em' }}>
            {getTranslatedTitle(title || 'Dashboard')}
          </h2>
        </div>
        <span style={{
          padding: '3px 10px',
          borderRadius: '999px',
          fontSize: '10px',
          fontWeight: 700,
          background: connected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: connected ? '#10b981' : '#ef4444',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {connected ? '● Live' : '○ Offline'}
        </span>
      </div>

      {/* Right: notification + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Notification bell */}
        <button
          onClick={() => navigate('/dashboard/notifications')}
          aria-label="Open notifications"
          style={{
            position: 'relative',
            width: 38, height: 38,
            borderRadius: '10px',
            border: '1.5px solid #f0f0f0',
            background: '#fff',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fff3e8'; e.currentTarget.style.borderColor = 'rgba(252,128,25,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#f0f0f0'; }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px',
              background: '#fc8019', color: '#fff',
              fontSize: '9px', fontWeight: 800,
              width: 16, height: 16, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #fff',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar chip */}
        <div
          onClick={() => navigate('/dashboard/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 12px 5px 5px',
            borderRadius: '999px',
            border: '1.5px solid #f0f0f0',
            background: '#fff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#fc8019'; e.currentTarget.style.background = '#fff8f3'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#fff'; }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fc8019, #ff9f43)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0,
            overflow: 'hidden',
          }}>
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name?.split(' ')[0]}
          </span>
          <span style={{ fontSize: '11px', color: '#93959f' }}>▾</span>
        </div>
      </div>
    </header>
  );
}
