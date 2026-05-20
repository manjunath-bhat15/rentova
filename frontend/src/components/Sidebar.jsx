import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Icon } from './Icon';

const roleNav = {
  CUSTOMER: [
    { path: '/dashboard', iconName: 'overview', labelKey: 'overview' },
    { path: '/dashboard/nearby', iconName: 'nearby', labelKey: 'nearbyVendors' },
    { path: '/dashboard/services', iconName: 'listings', labelKey: 'myListings' },
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

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useThemeLanguage();
  const role = user?.role || 'CUSTOMER';
  const items = roleNav[role] || roleNav.CUSTOMER;

  const getWorkspaceTitle = () => {
    if (role === 'ADMIN') return t('adminWorkspace');
    if (role === 'VENDOR') return t('vendorWorkspace');
    return t('customerWorkspace');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Icon name="logo" style={{ width: '20px', height: '20px' }} />
        </div>
        <div>
          <div className="logo-text">Rentova</div>
          <div className="sidebar-role">{getWorkspaceTitle()}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">{t('overview')}</div>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Icon name={item.iconName} />
            </span>
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
