import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { Icon } from '../components/Icon';

const typeIcons = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  BOOKING_IN_PROGRESS: 'BOOKING_IN_PROGRESS',
  BOOKING_COMPLETED: 'BOOKING_COMPLETED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  WALLET_TOPUP: 'WALLET_TOPUP',
  WALLET_PAYOUT: 'WALLET_PAYOUT',
  WALLET_REFUND: 'WALLET_REFUND',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
};

const typeColors = {
  BOOKING_CREATED: 'var(--accent-primary)',
  BOOKING_CONFIRMED: 'var(--accent-primary)',
  BOOKING_IN_PROGRESS: 'var(--accent-secondary)',
  BOOKING_COMPLETED: 'var(--accent-success)',
  BOOKING_CANCELLED: 'var(--accent-danger)',
  WALLET_TOPUP: 'var(--accent-success)',
  WALLET_PAYOUT: 'var(--accent-success)',
  WALLET_REFUND: 'var(--accent-warning)',
  CHAT_MESSAGE: 'var(--accent-primary)',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { subscribe } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const sub = subscribe('/user/queue/notifications', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });
    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [subscribe]);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      window.dispatchEvent(new Event('notificationSync'));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      window.dispatchEvent(new Event('notificationSync'));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.referenceId && notif.type.startsWith('BOOKING')) {
      navigate(`/dashboard/bookings/${notif.referenceId}`);
    } else if (notif.type.startsWith('WALLET')) {
      navigate('/dashboard/wallet');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Icon name="bell" style={{ width: '48px', height: '48px', color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '8px' }}>No notifications</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            You'll receive notifications for bookings, payments, and messages.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {notifications.map((notif, i) => {
            const iconName = typeIcons[notif.type] || 'bell';
            const color = typeColors[notif.type] || 'var(--text-secondary)';

            return (
              <div
                key={notif.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--glass-border)' : 'none',
                  background: notif.read ? 'transparent' : 'rgba(255,122,0,0.04)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onClick={() => handleClick(notif)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(255,122,0,0.04)'}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: color + '15', color: color,
                }}>
                  <Icon name={iconName} style={{ width: '18px', height: '18px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <p style={{
                      fontWeight: notif.read ? 500 : 700,
                      fontSize: 'var(--font-sm)',
                    }}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--accent-primary)', flexShrink: 0,
                      }} />
                    )}
                  </div>
                  <p style={{
                    fontSize: 'var(--font-xs)', color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}>
                    {notif.message}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(notif.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
