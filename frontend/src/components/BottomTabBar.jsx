import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const roleBottomNav = {
  CUSTOMER: [
    { path: '/dashboard', label: 'Home',     emoji: '🏠', exact: true },
    { path: '/dashboard/services', label: 'Browse',   emoji: '🛒' },
    { path: '/dashboard/bookings', label: 'Bookings', emoji: '📋' },
    { path: '/dashboard/wallet',   label: 'Wallet',   emoji: '💰' },
    { path: '/dashboard/chat',     label: 'Messages', emoji: '💬' },
  ],
  VENDOR: [
    { path: '/dashboard',                    label: 'Console',  emoji: '🏠', exact: true },
    { path: '/dashboard/services',           label: 'Listings', emoji: '🏪' },
    { path: '/dashboard/services/create',    label: 'Add',      emoji: '➕' },
    { path: '/dashboard/bookings',           label: 'Bookings', emoji: '📋' },
    { path: '/dashboard/wallet',             label: 'Wallet',   emoji: '💰' },
  ],
  ADMIN: [
    { path: '/dashboard',                    label: 'HQ',       emoji: '⚡', exact: true },
    { path: '/dashboard/admin/users',        label: 'Users',    emoji: '👥' },
    { path: '/dashboard/bookings',           label: 'Bookings', emoji: '📋' },
    { path: '/dashboard/services',           label: 'Listings', emoji: '🏪' },
    { path: '/dashboard/notifications',      label: 'Alerts',   emoji: '🔔' },
  ],
};

export default function BottomTabBar() {
  const { user } = useAuth();
  const role = user?.role || 'CUSTOMER';
  const items = roleBottomNav[role] || roleBottomNav.CUSTOMER;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: '64px',
      background: 'rgba(255,255,255,0.98)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid #f0f0f0',
      alignItems: 'stretch',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }} className="bottom-tab-bar">
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '2px', padding: '6px 4px',
              borderRadius: '12px',
              background: isActive ? 'rgba(252,128,25,0.08)' : 'transparent',
              transition: 'all 0.15s ease',
              minWidth: '44px', minHeight: '44px',
              position: 'relative',
            }}>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: '20px', height: '3px', borderRadius: '0 0 3px 3px',
                  background: '#fc8019',
                }} />
              )}
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.emoji}</span>
              <span style={{
                fontSize: '10px', fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fc8019' : '#93959f',
                letterSpacing: '0.01em',
              }}>
                {item.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
