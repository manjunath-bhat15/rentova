import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleNav = {
  CUSTOMER: [
    { path: '/dashboard', icon: 'OV', label: 'Overview' },
    { path: '/dashboard/nearby', icon: 'NB', label: 'Nearby Vendors' },
    { path: '/dashboard/services', icon: 'SV', label: 'Marketplace' },
    { path: '/dashboard/bookings', icon: 'BK', label: 'My Bookings' },
    { path: '/dashboard/wallet', icon: 'WA', label: 'Wallet' },
    { path: '/dashboard/chat', icon: 'CH', label: 'Messages' },
    { path: '/dashboard/notifications', icon: 'NT', label: 'Notifications' },
  ],
  VENDOR: [
    { path: '/dashboard', icon: 'OV', label: 'Overview' },
    { path: '/dashboard/services', icon: 'SV', label: 'My Listings' },
    { path: '/dashboard/services/create', icon: 'AD', label: 'Add Listing' },
    { path: '/dashboard/bookings', icon: 'BK', label: 'Orders' },
    { path: '/dashboard/wallet', icon: 'WA', label: 'Payouts' },
    { path: '/dashboard/chat', icon: 'CH', label: 'Messages' },
    { path: '/dashboard/notifications', icon: 'NT', label: 'Notifications' },
  ],
  ADMIN: [
    { path: '/dashboard', icon: 'HQ', label: 'Command Center' },
    { path: '/dashboard/admin/users', icon: 'US', label: 'Users' },
    { path: '/dashboard/bookings', icon: 'BK', label: 'Bookings' },
    { path: '/dashboard/services', icon: 'SV', label: 'Listings' },
    { path: '/dashboard/chat', icon: 'CH', label: 'Messages' },
    { path: '/dashboard/notifications', icon: 'NT', label: 'Notifications' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'CUSTOMER';
  const items = roleNav[role] || roleNav.CUSTOMER;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">R</div>
        <div>
          <div className="logo-text">Rentova</div>
          <div className="sidebar-role">{role.toLowerCase()} workspace</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Workspace</div>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
