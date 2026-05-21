import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';

const typeConfig = {
  BOOKING_CREATED:    { emoji: '📋', color: '#fc8019', bg: 'rgba(252,128,25,0.08)' },
  BOOKING_CONFIRMED:  { emoji: '✅', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  BOOKING_IN_PROGRESS:{ emoji: '🔄', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  BOOKING_COMPLETED:  { emoji: '🎉', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  BOOKING_CANCELLED:  { emoji: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  WALLET_TOPUP:       { emoji: '💰', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  WALLET_PAYOUT:      { emoji: '💸', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  WALLET_REFUND:      { emoji: '↩️', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  CHAT_MESSAGE:       { emoji: '💬', color: '#fc8019', bg: 'rgba(252,128,25,0.08)' },
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
    return () => { if (sub) sub.unsubscribe(); };
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
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      window.dispatchEvent(new Event('notificationSync'));
    } catch {}
  };

  const handleClick = (notif) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.referenceId && notif.type.startsWith('BOOKING')) {
      navigate(`/dashboard/bookings/${notif.referenceId}`);
    } else if (notif.type.startsWith('WALLET')) {
      navigate('/dashboard/wallet');
    } else if (notif.type === 'CHAT_MESSAGE') {
      navigate('/dashboard/chat');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#fc8019', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ color: '#93959f', fontSize: '14px' }}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Page hero */}
      <div style={{
        background: 'linear-gradient(135deg, #fc8019 0%, #ff9f43 100%)',
        borderRadius: '20px', padding: '28px 32px',
        marginBottom: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            🔔 Notifications
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '14px' }}>
            {unreadCount > 0
              ? <><strong style={{ color: '#fff' }}>{unreadCount}</strong> unread notification{unreadCount > 1 ? 's' : ''}</>
              : 'All caught up! 🎉'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              background: '#fff', color: '#fc8019', border: 'none',
              padding: '10px 22px', borderRadius: '999px',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            ✓ Mark all read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: '#fafafa', borderRadius: '20px',
          border: '2px dashed #e8e8e8',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔔</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1c1c', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            No notifications yet
          </h3>
          <p style={{ color: '#686b78', fontSize: '14px' }}>
            You'll receive updates here for bookings, payments, and messages.
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {notifications.map((notif, i) => {
            const cfg = typeConfig[notif.type] || { emoji: '📌', color: '#686b78', bg: '#f5f5f5' };
            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '16px 20px',
                  borderBottom: i < notifications.length - 1 ? '1px solid #f5f5f5' : 'none',
                  background: notif.read ? 'transparent' : 'rgba(252,128,25,0.03)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(252,128,25,0.03)'}
              >
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: cfg.bg, fontSize: '20px',
                }}>
                  {cfg.emoji}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <p style={{
                      fontWeight: notif.read ? 500 : 700,
                      fontSize: '14px',
                      color: '#1c1c1c',
                      margin: '0 0 2px',
                    }}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#fc8019', flexShrink: 0, marginTop: '5px',
                      }} />
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#686b78', lineHeight: 1.5, margin: '0 0 4px' }}>
                    {notif.message}
                  </p>
                  <p style={{ fontSize: '11px', color: '#93959f' }}>
                    {new Date(notif.createdAt).toLocaleDateString('en-IN', {
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
