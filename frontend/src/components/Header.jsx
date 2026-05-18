import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const { connected, subscribe } = useSocket();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return undefined;
    loadUnreadCount();
    const sub = subscribe('/user/queue/notifications', () => {
      setUnreadCount((prev) => prev + 1);
    });

    const handleSync = () => loadUnreadCount();
    window.addEventListener('notificationSync', handleSync);

    return () => {
      if (sub) sub.unsubscribe();
      window.removeEventListener('notificationSync', handleSync);
    };
  }, [user, subscribe]);

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((name) => name[0])
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
        <div>
          <p className="header-kicker">{user?.role || 'Workspace'}</p>
          <h2>{title || 'Dashboard'}</h2>
        </div>
        <span className={`live-pill ${connected ? 'online' : ''}`}>
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>

      <div className="header-right">
        <button
          className="notification-bell"
          onClick={() => navigate('/dashboard/notifications')}
          aria-label="Open notifications"
        >
          NT
          {unreadCount > 0 && <span className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <div className="user-chip">
          <div className="header-avatar">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" /> : initials}
          </div>
          <div>
            <div className="user-chip-name">{user?.name}</div>
            <div className="user-chip-role">{user?.email}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
