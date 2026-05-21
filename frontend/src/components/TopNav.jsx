import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import api from '../services/api';

const roleNav = {
  CUSTOMER: [
    { path: '/dashboard', label: 'Home', emoji: '🏠', exact: true },
    { path: '/dashboard/nearby', label: 'Nearby', emoji: '📍' },
    { path: '/dashboard/services', label: 'Browse', emoji: '🛒' },
    { path: '/dashboard/bookings', label: 'Bookings', emoji: '📋' },
    { path: '/dashboard/wallet', label: 'Wallet', emoji: '💰' },
    { path: '/dashboard/chat', label: 'Messages', emoji: '💬' },
    { path: '/dashboard/notifications', label: 'Alerts', emoji: '🔔' },
  ],
  VENDOR: [
    { path: '/dashboard', label: 'Console', emoji: '🏠', exact: true },
    { path: '/dashboard/services', label: 'Listings', emoji: '📦' },
    { path: '/dashboard/services/create', label: 'Add', emoji: '➕' },
    { path: '/dashboard/bookings', label: 'Bookings', emoji: '📅' },
    { path: '/dashboard/analytics', label: 'Stats', emoji: '📈' },
    { path: '/dashboard/chat', label: 'Messages', emoji: '💬' },
    { path: '/dashboard/notifications', label: 'Alerts', emoji: '🔔' },
  ]
};

const roleMeta = {
  CUSTOMER: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Customer' },
  VENDOR:   { color: '#fc8019', bg: 'rgba(252,128,25,0.1)',  label: 'Vendor' },
};

export default function TopNav() {
  const { user, logout } = useAuth();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();
  const role = user?.role || 'CUSTOMER';
  const items = roleNav[role] || roleNav.CUSTOMER;
  const meta = roleMeta[role] || roleMeta.CUSTOMER;
  const [unread, setUnread] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/notifications');
        setUnread(res.data.filter(n => !n.read).length);
      } catch {}
    };
    load();
    const handler = () => load();
    window.addEventListener('notificationSync', handler);
    return () => window.removeEventListener('notificationSync', handler);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const getNavLinkClass = (isActive) => 
    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] whitespace-nowrap transition-all duration-150 ` +
    (isActive 
      ? `font-bold text-brand bg-brand/10 border border-brand/20` 
      : `font-medium text-gray-500 bg-transparent border border-transparent hover:bg-gray-50 hover:text-gray-900`);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 flex items-center px-4 md:px-6 gap-2 shadow-sm transition-all duration-300 w-full">
      
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        className="flex items-center gap-2 cursor-pointer shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-black text-sm text-white shadow-[0_3px_10px_rgba(252,128,25,0.3)]">R</div>
        <span className="hidden md:block font-extrabold text-[15px] text-gray-900 tracking-tight">Rentova</span>
      </div>

      {/* Role badge — desktop only */}
      <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 mr-1" style={{ background: meta.bg, color: meta.color }}>
        {meta.label}
      </span>

      {/* Nav links — desktop only */}
      <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto no-scrollbar ml-2">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <span className="text-sm">{item.emoji}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer mobile */}
      <div className="flex-1 md:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Bell */}
        <button
          onClick={() => navigate('/dashboard/notifications')}
          className="relative w-9 h-9 rounded-xl border-1.5 border-gray-100 bg-white flex items-center justify-center text-base hover:bg-brand-50 hover:border-brand/30 transition-all duration-150 focus:outline-none"
        >
          🔔
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Avatar + profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(v => !v)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-xs font-black text-white overflow-hidden shrink-0 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2"
          >
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : initials}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-11 bg-white rounded-2xl border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-2 min-w-[220px] z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User info */}
              <div className="px-3 py-2 pb-3 border-b border-gray-50 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-sm font-black text-white shrink-0">
                    {initials}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[13px] font-bold text-gray-900 truncate">{user?.name}</div>
                    <div className="text-[11px] text-gray-500 truncate">{user?.email}</div>
                  </div>
                </div>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ background: meta.bg, color: meta.color }}>
                  {meta.label}
                </span>
              </div>

              {[
                { emoji: '👤', label: 'Profile & Settings', path: '/dashboard/profile' },
                { emoji: '💰', label: 'My Wallet', path: '/dashboard/wallet' },
                { emoji: '📋', label: 'My Bookings', path: '/dashboard/bookings' },
              ].map(item => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setShowProfile(false); }}
                  className="w-full px-3 py-2.5 rounded-xl border-none bg-transparent text-gray-900 text-[13px] font-medium flex items-center gap-2.5 hover:bg-gray-50 transition-colors duration-150 text-left focus:outline-none"
                >
                  <span className="text-[15px]">{item.emoji}</span> {item.label}
                </button>
              ))}

              <div className="border-t border-gray-50 mt-1 pt-1">
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="w-full px-3 py-2.5 rounded-xl border-none bg-transparent text-red-500 text-[13px] font-semibold flex items-center gap-2.5 hover:bg-red-50 transition-colors duration-150 text-left focus:outline-none"
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
