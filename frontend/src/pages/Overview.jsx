import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/services'),
      ]);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const roleGreeting = {
    CUSTOMER: 'Ready to book your next service?',
    VENDOR: 'Manage your services and bookings',
    ADMIN: 'Platform overview and management',
  };

  const activeBookings = bookings.filter(b => !['COMPLETED', 'CANCELLED'].includes(b.status)).length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

  const stats = user?.role === 'VENDOR' ? [
    { label: 'Active Bookings', value: activeBookings, icon: '📋', color: 'var(--accent-primary)' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: '💰', color: 'var(--accent-secondary)' },
    { label: 'My Services', value: services.length, icon: '🛒', color: 'var(--accent-warning)' },
    { label: 'Completed', value: completedBookings, icon: '🎉', color: 'var(--accent-success)' },
  ] : [
    { label: 'Active Bookings', value: activeBookings, icon: '📋', color: 'var(--accent-primary)' },
    { label: 'Wallet Balance', value: `$${user?.walletBalance || '0.00'}`, icon: '💰', color: 'var(--accent-secondary)' },
    { label: 'Pending', value: pendingBookings, icon: '⏳', color: 'var(--accent-warning)' },
    { label: 'Completed', value: completedBookings, icon: '🎉', color: 'var(--accent-success)' },
  ];

  // Recent bookings for activity feed
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
          Welcome, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>{roleGreeting[user?.role] || 'Welcome to Rentova'}</p>
      </div>

      {/* Stats Grid */}
      <div className="bento-grid stagger" style={{ marginBottom: 'var(--space-2xl)' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="bento-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-value" style={{ color: stat.color }}>{loading ? '—' : stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
              <span style={{ fontSize: '32px' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          {user?.role === 'CUSTOMER' && (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/services')}>
              🛒 Browse Services
            </button>
          )}
          {user?.role === 'VENDOR' && (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/services/create')}>
              ➕ Create Service
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard/bookings')}>
            📋 View Bookings
          </button>
          {user?.role === 'VENDOR' && (
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard/services')}>
              🛒 My Services
            </button>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Recent Activity</h2>
        {recentBookings.length === 0 ? (
          <div className="glass-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              No activity yet. {user?.role === 'CUSTOMER' ? 'Browse services to create your first booking!' : 'Create a service to start receiving bookings.'}
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {recentBookings.map((b, i) => (
              <div
                key={b.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-md) var(--space-lg)',
                  borderBottom: i < recentBookings.length - 1 ? '1px solid var(--glass-border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onClick={() => navigate(`/dashboard/bookings/${b.id}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--glass-bg)', fontSize: '18px',
                  }}>
                    {b.status === 'PENDING' ? '⏳' : b.status === 'CONFIRMED' ? '✅' : b.status === 'IN_PROGRESS' ? '🔄' : b.status === 'COMPLETED' ? '🎉' : '❌'}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{b.serviceTitle}</p>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                      {user?.role === 'CUSTOMER' ? `Vendor: ${b.vendorName}` : `Customer: ${b.customerName}`}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, color: 'var(--accent-secondary)', fontSize: 'var(--font-sm)' }}>${b.amount}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
