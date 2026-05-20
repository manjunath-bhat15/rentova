import { NavLink } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Icon } from './Icon';

export default function AdminSidebar() {
  const { t } = useThemeLanguage();

  const items = [
    { path: '/dashboard', iconName: 'hq', labelKey: 'commandCenter' },
    { path: '/dashboard/admin/users', iconName: 'users', labelKey: 'users' },
    { path: '/dashboard/services', iconName: 'listings', labelKey: 'allListings' },
    { path: '/dashboard/bookings', iconName: 'bookings', labelKey: 'allBookings' },
    { path: '/dashboard/chat', iconName: 'chat', labelKey: 'messages' },
    { path: '/dashboard/notifications', iconName: 'bell', labelKey: 'notifications' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Icon name="logo" style={{ width: '20px', height: '20px' }} />
        </div>
        <div>
          <div className="logo-text">Rentova</div>
          <div className="sidebar-role">{t('adminWorkspace')}</div>
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
            <span className="nav-icon" aria-hidden="true">
              <Icon name={item.iconName} />
            </span>
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
