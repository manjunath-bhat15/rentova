import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Icon } from './Icon';

const roleNav = {
  CUSTOMER: [
    { path: '/dashboard', iconName: 'overview', labelKey: 'overview', emoji: '🏠' },
    { path: '/dashboard/nearby', iconName: 'nearby', labelKey: 'nearbyVendors', emoji: '📍' },
    { path: '/dashboard/services', iconName: 'listings', labelKey: 'myListings', emoji: '🛒' },
    { path: '/dashboard/bookings', iconName: 'bookings', labelKey: 'myBookings', emoji: '📋' },
    { path: '/dashboard/wallet', iconName: 'wallet', labelKey: 'wallet', emoji: '💰' },
    { path: '/dashboard/chat', iconName: 'chat', labelKey: 'messages', emoji: '💬' },
    { path: '/dashboard/notifications', iconName: 'bell', labelKey: 'notifications', emoji: '🔔' },
  ],
  VENDOR: [
    { path: '/dashboard', iconName: 'overview', labelKey: 'overview', emoji: '🏠' },
    { path: '/dashboard/services', iconName: 'listings', labelKey: 'myListings', emoji: '🏪' },
    { path: '/dashboard/services/create', iconName: 'add', labelKey: 'addListing', emoji: '➕' },
    { path: '/dashboard/bookings', iconName: 'bookings', labelKey: 'myBookings', emoji: '📋' },
    { path: '/dashboard/wallet', iconName: 'wallet', labelKey: 'wallet', emoji: '💰' },
    { path: '/dashboard/chat', iconName: 'chat', labelKey: 'messages', emoji: '💬' },
    { path: '/dashboard/notifications', iconName: 'bell', labelKey: 'notifications', emoji: '🔔' },
  ],
  ADMIN: [
    { path: '/dashboard', iconName: 'hq', labelKey: 'commandCenter', emoji: '⚡' },
    { path: '/dashboard/admin/users', iconName: 'users', labelKey: 'users', emoji: '👥' },
    { path: '/dashboard/bookings', iconName: 'bookings', labelKey: 'myBookings', emoji: '📋' },
    { path: '/dashboard/services', iconName: 'listings', labelKey: 'myListings', emoji: '🏪' },
    { path: '/dashboard/chat', iconName: 'chat', labelKey: 'messages', emoji: '💬' },
    { path: '/dashboard/notifications', iconName: 'bell', labelKey: 'notifications', emoji: '🔔' },
  ],
};

const roleColors = {
  CUSTOMER: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', label: 'Customer' },
  VENDOR: { bg: 'rgba(252,128,25,0.1)', color: '#fc8019', label: 'Vendor' },
  ADMIN: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6', label: 'Admin' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();
  const role = user?.role || 'CUSTOMER';
  const items = roleNav[role] || roleNav.CUSTOMER;
  const roleStyle = roleColors[role] || roleColors.CUSTOMER;

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <aside style={{
      width: '240px',
      minWidth: '240px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: '#ffffff',
      borderRight: '1px solid #f0f0f0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      overflowY: 'auto',
      boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#fc8019',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: '#fff',
            boxShadow: '0 4px 12px rgba(252,128,25,0.35)',
            flexShrink: 0,
          }}>R</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: '#1c1c1c', lineHeight: 1 }}>Rentova</div>
            <div style={{
              fontSize: '10px', fontWeight: 700, marginTop: '2px',
              color: roleStyle.color,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>{roleStyle.label} Workspace</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c0c0c0', padding: '8px 8px 4px', marginBottom: '4px' }}>
          Menu
        </p>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#fc8019' : '#686b78',
              background: isActive ? 'rgba(252,128,25,0.08)' : 'transparent',
              transition: 'all 0.15s ease',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = '#f8f8f8';
                e.currentTarget.style.color = '#1c1c1c';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.getAttribute('aria-current')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#686b78';
              }
            }}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>{item.emoji}</span>
                <span style={{ letterSpacing: '-0.01em' }}>{t(item.labelKey)}</span>
                {isActive && (
                  <span style={{
                    marginLeft: 'auto',
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: '#fc8019',
                    flexShrink: 0,
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card at bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid #f5f5f5' }}>
        <div
          onClick={() => navigate('/dashboard/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '12px',
            cursor: 'pointer', background: '#f8f8f8',
            transition: 'background 0.15s ease',
            marginBottom: '8px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#fff3e8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f8f8f8'}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fc8019, #ff9f43)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0,
            overflow: 'hidden',
          }}>
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1c1c1c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '11px', color: '#93959f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#93959f', flexShrink: 0 }}>›</span>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{
            width: '100%', padding: '9px', borderRadius: '10px',
            border: '1.5px solid #f0f0f0', background: 'transparent',
            color: '#ef4444', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#f0f0f0'; }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
