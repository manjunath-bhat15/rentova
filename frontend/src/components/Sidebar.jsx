import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const roleNav = {
  CUSTOMER: [
    { path: '/dashboard', icon: 'OV', labelKey: 'overview' },
    { path: '/dashboard/nearby', icon: 'NB', labelKey: 'nearbyVendors' },
    { path: '/dashboard/services', icon: 'SV', labelKey: 'myListings' },
    { path: '/dashboard/bookings', icon: 'BK', labelKey: 'myBookings' },
    { path: '/dashboard/wallet', icon: 'WA', labelKey: 'wallet' },
    { path: '/dashboard/chat', icon: 'CH', labelKey: 'messages' },
    { path: '/dashboard/notifications', icon: 'NT', labelKey: 'notifications' },
  ],
  VENDOR: [
    { path: '/dashboard', icon: 'OV', labelKey: 'overview' },
    { path: '/dashboard/services', icon: 'SV', labelKey: 'myListings' },
    { path: '/dashboard/services/create', icon: 'AD', labelKey: 'addListing' },
    { path: '/dashboard/bookings', icon: 'BK', labelKey: 'myBookings' },
    { path: '/dashboard/wallet', icon: 'WA', labelKey: 'wallet' },
    { path: '/dashboard/chat', icon: 'CH', labelKey: 'messages' },
    { path: '/dashboard/notifications', icon: 'NT', labelKey: 'notifications' },
  ],
  ADMIN: [
    { path: '/dashboard', icon: 'HQ', labelKey: 'commandCenter' },
    { path: '/dashboard/admin/users', icon: 'US', labelKey: 'users' },
    { path: '/dashboard/bookings', icon: 'BK', labelKey: 'myBookings' },
    { path: '/dashboard/services', icon: 'SV', labelKey: 'myListings' },
    { path: '/dashboard/chat', icon: 'CH', labelKey: 'messages' },
    { path: '/dashboard/notifications', icon: 'NT', labelKey: 'notifications' },
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
        <div className="logo-icon">R</div>
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
            <span className="nav-icon">{item.icon}</span>
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
