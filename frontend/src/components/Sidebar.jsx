import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = {
  common: [
    { path: '/dashboard', icon: '🏠', label: 'Overview' },
    { path: '/dashboard/services', icon: '🛒', label: 'Services' },
    { path: '/dashboard/bookings', icon: '📋', label: 'Bookings' },
    { path: '/dashboard/wallet', icon: '💰', label: 'Wallet' },
    { path: '/dashboard/chat', icon: '💬', label: 'Chat' },
    { path: '/dashboard/notifications', icon: '🔔', label: 'Notifications' },
  ],
  admin: [
    { path: '/dashboard/admin', icon: '📊', label: 'Admin Panel' },
    { path: '/dashboard/admin/users', icon: '👥', label: 'Users' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">R</div>
        <div className="logo-text">Rentova</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Main</div>
        {navItems.common.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="sidebar-section-title">Administration</div>
            {navItems.admin.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
