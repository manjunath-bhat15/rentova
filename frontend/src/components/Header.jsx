import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useLocationContext } from '../contexts/LocationContext';
import AddressSearchField from './AddressSearchField';
import { Icon } from './Icon';
import api from '../services/api';

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const { connected, subscribe } = useSocket();
  const { lang, theme, toggleTheme, toggleLanguage, t } = useThemeLanguage();
  const { coords, selectedAddress, updateLocation, resetToGPS } = useLocationContext();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const getShortAddress = (fullAddress) => {
    if (!fullAddress) return 'Select Location...';
    const parts = fullAddress.split(',');
    return parts[0].trim();
  };

  const getSubAddress = (fullAddress) => {
    if (!fullAddress) return '';
    const parts = fullAddress.split(',');
    if (parts.length <= 1) return '';
    return parts.slice(1).join(',').trim();
  };

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

      {/* Location Selector (Swiggy/Zomato style) */}
      {(user?.role === 'CUSTOMER' || user?.role === 'VENDOR') && (
        <div 
          className="header-location"
          onClick={() => setShowLocationModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            maxWidth: '300px',
            height: '42px',
            marginLeft: 'var(--space-md)',
            marginRight: 'auto',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-secondary)';
            e.currentTarget.style.background = 'var(--glass-bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.background = 'var(--glass-bg)';
          }}
        >
          <span style={{ fontSize: '18px' }}>📍</span>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {getShortAddress(selectedAddress)} <span style={{ fontSize: '8px', opacity: 0.8 }}>▼</span>
            </span>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getSubAddress(selectedAddress) || 'Set your location'}
            </span>
          </div>
        </div>
      )}

      <div className="header-right">
        {/* Language Switcher - Temporarily commented out
        <button 
          onClick={toggleLanguage}
          className="theme-switcher-btn-class"
          title="Switch Language"
        >
          🌐 {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </button>
        */}
        
        {/* Theme Switcher - Temporarily commented out
        <button 
          onClick={toggleTheme}
          className="theme-switcher-btn-class"
          title="Toggle Theme"
          style={{ minWidth: '40px', justifyContent: 'center' }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        */}

        <button
          className="notification-bell"
          onClick={() => navigate('/dashboard/notifications')}
          aria-label="Open notifications"
        >
          <Icon name="bell" style={{ width: '18px', height: '18px' }} />
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
        
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="logout" style={{ width: '14px', height: '14px' }} />
          <span>{t('logout')}</span>
        </button>
      </div>

      {showLocationModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowLocationModal(false)}
        >
          <div 
            className="glass-card" 
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: 'var(--space-2xl)',
              animation: 'slideUp 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-lg)', fontWeight: 700 }}>Select Location</h3>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setShowLocationModal(false)}
                style={{ padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-xs)', margin: 0 }}>
              Specify your manual address or coordinates below to find local services around you, just like Swiggy or Zomato.
            </p>

            <AddressSearchField
              label="Search manual address (Google/OSM)"
              placeholder="e.g. Indiranagar, Bangalore"
              initialAddress={selectedAddress}
              onSelectLocation={(address, lat, lon) => {
                if (lat !== null && lon !== null) {
                  updateLocation(address, lat, lon);
                  setShowLocationModal(false);
                }
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
              <hr style={{ flex: 1, border: '0', borderTop: '1px solid var(--glass-border)' }} />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>OR</span>
              <hr style={{ flex: 1, border: '0', borderTop: '1px solid var(--glass-border)' }} />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={gpsLoading}
              onClick={async () => {
                setGpsLoading(true);
                setLocationError('');
                try {
                  await resetToGPS();
                  setShowLocationModal(false);
                } catch (err) {
                  setLocationError('GPS permission denied or timeout.');
                } finally {
                  setGpsLoading(false);
                }
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              📍 {gpsLoading ? 'Locating...' : 'Use Current GPS Location'}
            </button>

            {locationError && (
              <div style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-xs)', textAlign: 'center' }}>
                {locationError}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
