import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookingCard from '../components/BookingCard';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const statusFilters = ['All', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const statusConfig = {
  All:         { label: 'All',         emoji: '📋', color: '#1c1c1c', bg: '#f5f5f5', activeBg: '#1c1c1c', activeColor: '#fff' },
  PENDING:     { label: 'Pending',     emoji: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', activeBg: '#f59e0b', activeColor: '#fff' },
  CONFIRMED:   { label: 'Confirmed',   emoji: '✅', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', activeBg: '#3b82f6', activeColor: '#fff' },
  IN_PROGRESS: { label: 'In Progress', emoji: '🔄', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', activeBg: '#8b5cf6', activeColor: '#fff' },
  COMPLETED:   { label: 'Completed',   emoji: '🎉', color: '#10b981', bg: 'rgba(16,185,129,0.1)', activeBg: '#10b981', activeColor: '#fff' },
  CANCELLED:   { label: 'Cancelled',   emoji: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', activeBg: '#ef4444', activeColor: '#fff' },
};

export default function Bookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    loadBookings();
    const interval = setInterval(() => {
      api.get('/api/bookings')
        .then(res => setBookings(res.data))
        .catch(err => console.error('Failed to auto-refresh bookings', err));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = activeFilter === 'All'
    ? bookings
    : bookings.filter(b => b.status === activeFilter);

  const statusCounts = {};
  bookings.forEach(b => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Page hero */}
      <div style={{
        background: 'linear-gradient(135deg, #fc8019 0%, #ff9f43 100%)',
        borderRadius: '20px',
        padding: '28px 32px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            📋 My Bookings
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '14px' }}>
            {user?.role === 'CUSTOMER' ? 'Track all your service bookings' : 'Manage incoming booking requests'}
            {' — '}<strong style={{ color: '#fff' }}>{bookings.length}</strong> total
          </p>
        </div>
        {user?.role === 'CUSTOMER' && (
          <button
            onClick={() => navigate('/dashboard/services')}
            style={{
              background: '#fff', color: '#fc8019',
              border: 'none', padding: '10px 22px', borderRadius: '999px',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            + Book New Service
          </button>
        )}
      </div>

      {/* Status summary chips */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {statusFilters.filter(f => f !== 'All').map(status => {
          const cfg = statusConfig[status];
          const count = statusCounts[status] || 0;
          if (count === 0) return null;
          return (
            <div key={status} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '999px',
              background: cfg.bg, color: cfg.color,
              fontSize: '12px', fontWeight: 700,
            }}>
              {cfg.emoji} {cfg.label}
              <span style={{
                background: cfg.activeBg, color: cfg.activeColor,
                width: 18, height: 18, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 800, marginLeft: '2px',
              }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Filter pill strip */}
      <div style={{
        display: 'flex', gap: '8px',
        marginBottom: '24px',
        overflowX: 'auto', scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '4px',
      }}>
        {statusFilters.map((filter) => {
          const cfg = statusConfig[filter];
          const count = filter === 'All' ? bookings.length : (statusCounts[filter] || 0);
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: '999px',
                border: 'none', cursor: 'pointer', flexShrink: 0,
                fontWeight: isActive ? 700 : 500, fontSize: '13px',
                background: isActive ? cfg.activeBg : '#f5f5f5',
                color: isActive ? cfg.activeColor : '#686b78',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              {count > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#e8e8e8',
                  color: isActive ? '#fff' : '#686b78',
                  padding: '1px 7px', borderRadius: '999px',
                  fontSize: '11px', fontWeight: 700,
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#fc8019', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#93959f', fontSize: '14px' }}>Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: '#fafafa', borderRadius: '20px',
          border: '2px dashed #e8e8e8',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1c1c', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {activeFilter === 'All' ? 'No bookings yet' : `No ${statusConfig[activeFilter]?.label.toLowerCase()} bookings`}
          </h3>
          <p style={{ color: '#686b78', fontSize: '14px', marginBottom: '20px' }}>
            {user?.role === 'CUSTOMER'
              ? 'Browse services and create your first booking.'
              : 'Bookings will appear here when customers book your services.'}
          </p>
          {user?.role === 'CUSTOMER' && (
            <button
              onClick={() => navigate('/dashboard/services')}
              style={{ background: '#fc8019', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '999px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(252,128,25,0.3)' }}
            >
              Browse Services →
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredBookings.map((b) => (
            <BookingCard key={b.id} booking={b} userRole={user?.role} />
          ))}
        </div>
      )}
    </div>
  );
}
