import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookingCard from '../components/BookingCard';
import api from '../services/api';

const statusFilters = ['All', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const statusLabels = {
  All: 'All',
  PENDING: '⏳ Pending',
  CONFIRMED: '✅ Confirmed',
  IN_PROGRESS: '🔄 In Progress',
  COMPLETED: '🎉 Completed',
  CANCELLED: '❌ Cancelled',
};

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    loadBookings();
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
  bookings.forEach(b => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
          Bookings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {user?.role === 'CUSTOMER' ? 'Track all your service bookings' : 'Manage incoming booking requests'}
        </p>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {statusFilters.map((filter) => {
          const count = filter === 'All' ? bookings.length : (statusCounts[filter] || 0);
          return (
            <button
              key={filter}
              className={`btn btn-sm ${activeFilter === filter ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter(filter)}
              style={{ position: 'relative' }}
            >
              {statusLabels[filter]}
              {count > 0 && (
                <span style={{
                  marginLeft: '6px',
                  background: activeFilter === filter ? 'rgba(255,255,255,0.2)' : 'var(--glass-bg)',
                  padding: '1px 7px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bookings Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loading-spinner" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '8px' }}>
            {activeFilter === 'All' ? 'No bookings yet' : `No ${activeFilter.toLowerCase().replace('_', ' ')} bookings`}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {user?.role === 'CUSTOMER'
              ? 'Browse services and create your first booking.'
              : 'Bookings will appear here when customers book your services.'}
          </p>
        </div>
      ) : (
        <div className="bento-grid stagger">
          {filteredBookings.map((b) => (
            <BookingCard key={b.id} booking={b} userRole={user?.role} />
          ))}
        </div>
      )}
    </div>
  );
}
