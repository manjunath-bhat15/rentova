import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import api from '../services/api';

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const { connected, subscribe } = useSocket();
  const { lang, theme, toggleTheme, toggleLanguage, t } = useThemeLanguage();
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

  const initials = user?.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getWorkspaceKicker = () => {
    if (user?.role === 'ADMIN') return t('adminWorkspace');
    if (user?.role === 'VENDOR') return t('vendorWorkspace');
    return t('customerWorkspace');
  };

  const getTranslatedTitle = (originalTitle) => {
    if (originalTitle === 'Overview') return t('overview');
    if (originalTitle === 'Services' || originalTitle === 'Listings' || originalTitle === 'My Listings') return t('myListings');
    if (originalTitle === 'Create Service' || originalTitle === 'Add Listing') return t('addListing');
    if (originalTitle === 'Bookings' || originalTitle === 'My Bookings' || originalTitle === 'Orders') return t('myBookings');
    if (originalTitle === 'Wallet' || originalTitle === 'Payouts') return t('wallet');
    if (originalTitle === 'Chat' || originalTitle === 'Messages') return t('messages');
    if (originalTitle === 'Nearby Vendors') return t('nearbyVendors');
    if (originalTitle === 'Notifications') return t('notifications');
    if (originalTitle === 'Admin Command Center' || originalTitle === 'Command Center') return t('commandCenter');
    if (originalTitle === 'User Management' || originalTitle === 'Users') return t('users');
    return originalTitle;
  };

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <p className="header-kicker">{getWorkspaceKicker()}</p>
          <h2>{getTranslatedTitle(title || 'Dashboard')}</h2>
        </div>
        <span className={`live-pill ${connected ? 'online' : ''}`}>
          {connected ? t('online') : t('offline')}
        </span>
      </div>

      <div className="header-right">
        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="theme-switcher-btn-class"
          title="Switch Language"
        >
          🌐 {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </button>
        
        {/* Theme Switcher */}
        <button 
          onClick={toggleTheme}
          className="theme-switcher-btn-class"
          title="Toggle Theme"
          style={{ minWidth: '40px', justifyContent: 'center' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button
          className="notification-bell"
          onClick={() => navigate('/dashboard/notifications')}
          aria-label="Open notifications"
        >
          NT
          {unreadCount > 0 && <span className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        
        <div className="user-chip">
          <div className="header-avatar">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" /> : initials}
          </div>
          <div className="user-chip-text">
            <div className="user-chip-name">{user?.name}</div>
            <div className="user-chip-role">{user?.email}</div>
          </div>
        </div>
        
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          {t('logout')}
        </button>
      </div>
    </header>
  );
}
