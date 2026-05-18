import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const { connected, subscribe } = useSocket();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadUnreadCount();
    const sub = subscribe('/user/queue/notifications', () => {
      setUnreadCount(prev => prev + 1);
    });
    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [user, subscribe]);

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      // Silently fail
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2>{title || 'Dashboard'}</h2>
        {connected && (
          <span className="badge badge-green" style={{ fontSize: '10px', gap: '4px', display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00b894', display: 'inline-block' }}></span>
            Live
          </span>
        )}
      </div>
      <div className="header-right">
        <button
          className="notification-bell"
          onClick={() => navigate('/dashboard/notifications')}
          style={{ position: 'relative' }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: 'var(--accent-danger)', color: 'white',
              borderRadius: '50%', width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 800,
              boxShadow: '0 0 8px rgba(255,107,107,0.5)',
              animation: 'pulse 2s infinite',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
          <div className="header-avatar">{initials}</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
