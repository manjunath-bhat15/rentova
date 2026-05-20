import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Icon } from './Icon';

const roleNav = {
  CUSTOMER: [
    { path: '/dashboard', iconName: 'overview', labelKey: 'overview' },
    { path: '/dashboard/nearby', iconName: 'nearby', labelKey: 'nearbyVendors' },
    { path: '/dashboard/services', iconName: 'listings', labelKey: 'browseListings' },
    { path: '/dashboard/bookings', iconName: 'bookings', labelKey: 'myBookings' },
    { path: '/dashboard/wallet', iconName: 'wallet', labelKey: 'wallet' },
    { path: '/dashboard/chat', iconName: 'chat', labelKey: 'messages' },
    { path: '/dashboard/notifications', iconName: 'bell', labelKey: 'notifications' },
  ],
  VENDOR: [
    { path: '/dashboard', iconName: 'overview', labelKey: 'overview' },
    { path: '/dashboard/services', iconName: 'listings', labelKey: 'myListings' },
    { path: '/dashboard/services/create', iconName: 'add', labelKey: 'addListing' },
    { path: '/dashboard/bookings', iconName: 'bookings', labelKey: 'myBookings' },
    { path: '/dashboard/wallet', iconName: 'wallet', labelKey: 'wallet' },
    { path: '/dashboard/chat', iconName: 'chat', labelKey: 'messages' },
    { path: '/dashboard/notifications', iconName: 'bell', labelKey: 'notifications' },
  ],
  ADMIN: [
    { path: '/dashboard', iconName: 'hq', labelKey: 'commandCenter' },
    { path: '/dashboard/admin/users', iconName: 'users', labelKey: 'users' },
    { path: '/dashboard/bookings', iconName: 'bookings', labelKey: 'myBookings' },
    { path: '/dashboard/services', iconName: 'listings', labelKey: 'myListings' },
    { path: '/dashboard/chat', iconName: 'chat', labelKey: 'messages' },
    { path: '/dashboard/notifications', iconName: 'bell', labelKey: 'notifications' },
  ],
};

export default function NavigationDock() {
  const { user, logout } = useAuth();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();
  const role = user?.role || 'CUSTOMER';
  const items = roleNav[role] || roleNav.CUSTOMER;

  const getWorkspaceTitle = () => {
    if (role === 'ADMIN') return t('adminWorkspace');
    if (role === 'VENDOR') return t('vendorWorkspace');
    return t('customerWorkspace');
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

  return (
    <aside className="navigation-dock">
      {/* Logo Area */}
      <div className="dock-logo">
        <div className="logo-icon">
          <Icon name="logo" style={{ width: '22px', height: '22px' }} />
        </div>
        <div className="logo-text-wrapper">
          <span className="logo-text">Rentova</span>
          <span className="logo-subtitle">{getWorkspaceTitle()}</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="dock-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
            title={t(item.labelKey)}
          >
            <span className="dock-icon">
              <Icon name={item.iconName} />
            </span>
            <span className="dock-label">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile & Quick Actions */}
      <div className="dock-bottom">
        <div className="dock-profile" onClick={() => navigate('/dashboard')} title={user?.name || 'Profile'}>
          <div className="dock-profile-avatar">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" /> : initials}
          </div>
          <div className="dock-profile-info">
            <span className="dock-profile-name">{user?.name}</span>
            <span className="dock-profile-role">{user?.email}</span>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="dock-item" 
          style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }}
          title={t('logout')}
        >
          <span className="dock-icon" style={{ color: 'var(--accent-danger)' }}>
            <Icon name="logout" />
          </span>
          <span className="dock-label" style={{ color: 'var(--accent-danger)' }}>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
