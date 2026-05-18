import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/bookings')
      ]);
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data.slice(0, 5)); // Just take top 5
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

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
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of platform metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard/admin/users')}>
            Manage Users
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            Total Users
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats?.totalUsers || 0}</div>
        </div>
        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            Total Bookings
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>{stats?.totalBookings || 0}</div>
        </div>
        <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            Completed Revenue
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-success)' }}>
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Recent Bookings</h2>
      {recentBookings.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No bookings found.</p>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Service</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Customer</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Vendor</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Amount</th>
                <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    {booking.id.substring(0, 8)}
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 600 }}>{booking.serviceTitle}</td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>{booking.customerName}</td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>{booking.vendorName}</td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 600 }}>₹{booking.amount * booking.quantity}</td>
                  <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                      background: booking.status === 'COMPLETED' ? 'rgba(0,184,148,0.1)' : 
                                 booking.status === 'CANCELLED' ? 'rgba(255,107,107,0.1)' : 'rgba(108,92,231,0.1)',
                      color: booking.status === 'COMPLETED' ? 'var(--accent-success)' : 
                             booking.status === 'CANCELLED' ? 'var(--accent-danger)' : 'var(--accent-primary)',
                    }}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
