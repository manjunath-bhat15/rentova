import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';

const typeConfig = {
  BOOKING_CREATED:    { emoji: '📋', colorClass: 'text-brand', bgClass: 'bg-brand/10' },
  BOOKING_CONFIRMED:  { emoji: '✅', colorClass: 'text-blue-500', bgClass: 'bg-blue-50' },
  BOOKING_IN_PROGRESS:{ emoji: '🔄', colorClass: 'text-purple-500', bgClass: 'bg-purple-50' },
  BOOKING_COMPLETED:  { emoji: '🎉', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50' },
  BOOKING_CANCELLED:  { emoji: '❌', colorClass: 'text-red-500', bgClass: 'bg-red-50' },
  WALLET_TOPUP:       { emoji: '💰', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50' },
  WALLET_PAYOUT:      { emoji: '💸', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50' },
  WALLET_REFUND:      { emoji: '↩️', colorClass: 'text-amber-500', bgClass: 'bg-amber-50' },
  CHAT_MESSAGE:       { emoji: '💬', colorClass: 'text-brand', bgClass: 'bg-brand/10' },
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
      <div className="flex justify-center items-center py-20 flex-col gap-3">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
        <p className="text-gray-400 text-sm m-0">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Page hero */}
      <div className="bg-gradient-to-br from-brand to-brand-light rounded-3xl p-6 md:p-8 mb-6 flex justify-between items-center flex-wrap gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-[1.6rem] font-black text-white m-0 mb-1 tracking-tight">
            🔔 Notifications
          </h1>
          <p className="text-white/80 m-0 text-sm">
            {unreadCount > 0
              ? <><strong className="text-white">{unreadCount}</strong> unread notification{unreadCount > 1 ? 's' : ''}</>
              : 'All caught up! 🎉'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="relative z-10 bg-white text-brand border-none px-5 py-2.5 rounded-full font-bold text-[13px] cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:bg-gray-50 transition-colors focus:outline-none"
          >
            ✓ Mark all read
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="text-center py-20 px-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">
            No notifications yet
          </h3>
          <p className="text-gray-500 text-sm">
            You'll receive updates here for bookings, payments, and messages.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {notifications.map((notif, i) => {
            const cfg = typeConfig[notif.type] || { emoji: '📌', colorClass: 'text-gray-500', bgClass: 'bg-gray-50' };
            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`flex items-start gap-4 p-4 md:p-5 transition-colors cursor-pointer ${
                  i < notifications.length - 1 ? 'border-b border-gray-50' : ''
                } ${notif.read ? 'bg-transparent hover:bg-gray-50' : 'bg-brand/5 hover:bg-brand/10'}`}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-xl ${cfg.bgClass}`}>
                  {cfg.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-sm text-gray-900 m-0 mb-0.5 ${notif.read ? 'font-medium' : 'font-bold'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed m-0 mb-1.5">
                    {notif.message}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400 m-0">
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
