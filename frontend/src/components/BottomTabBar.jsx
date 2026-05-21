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
    { path: '/dashboard/services',           label: 'Listings', emoji: '📦' },
    { path: '/dashboard/services/create',    label: 'Add',      emoji: '➕' },
    { path: '/dashboard/bookings',           label: 'Bookings', emoji: '📅' },
    { path: '/dashboard/analytics',          label: 'Stats',    emoji: '📈' },
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
    <nav className="bottom-tab-bar flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/98 backdrop-blur-2xl border-t border-gray-100 z-50 items-stretch pb-[env(safe-area-inset-bottom)]">
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          className="flex-1 flex flex-col items-center justify-center no-underline"
        >
          {({ isActive }) => (
            <div className={`flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl transition-all duration-150 min-w-[44px] min-h-[44px] relative ${isActive ? 'bg-brand/10' : 'bg-transparent'}`}>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-1 rounded-b-[3px] bg-brand" />
              )}
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className={`text-[10px] tracking-wide ${isActive ? 'font-bold text-brand' : 'font-medium text-gray-400'}`}>
                {item.label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
