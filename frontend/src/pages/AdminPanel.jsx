import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'services', label: 'Listings' },
];

const roles = ['CUSTOMER', 'VENDOR', 'ADMIN'];
const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function AdminPanel({ defaultTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, bookingsRes, servicesRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/bookings'),
        api.get('/api/admin/services'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, role) => {
    await api.patch(`/api/admin/users/${userId}/role`, { role });
    setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, role } : user));
  };

  const updateBookingStatus = async (bookingId, status) => {
    const res = await api.patch(`/api/admin/bookings/${bookingId}/status`, { status });
    setBookings((prev) => prev.map((booking) => booking.id === bookingId ? res.data : booking));
    loadStatsOnly();
  };

  const toggleService = async (serviceId) => {
    await api.patch(`/api/admin/services/${serviceId}/toggle`);
    setServices((prev) => prev.map((service) => (
      service.id === serviceId ? { ...service, active: !service.active } : service
    )));
    loadStatsOnly();
  };

  const loadStatsOnly = async () => {
    const res = await api.get('/api/admin/stats');
    setStats(res.data);
  };

  const revenue = useMemo(() => Number(stats?.totalRevenue || 0), [stats]);

  if (loading) {
    return (
      <div className="center-loader">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="admin-page animate-fade-in">
      <div className="workspace-hero">
        <div>
          <p className="eyebrow">Admin command center</p>
          <h1>Platform Control</h1>
          <p>Operate users, bookings, listings, revenue, and marketplace controls from one dedicated workspace.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadAdminData}>Refresh</button>
      </div>

      <div className="tab-strip">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="metric-grid">
            <Metric label="Users" value={stats?.totalUsers || 0} detail={`${stats?.vendors || 0} vendors`} />
            <Metric label="Bookings" value={stats?.totalBookings || 0} detail={`${stats?.pendingBookings || 0} pending`} />
            <Metric label="Revenue" value={`Rs ${revenue.toFixed(2)}`} detail={`${stats?.completedBookings || 0} completed`} />
            <Metric label="Active Listings" value={stats?.activeServices || 0} detail={`${stats?.totalServices || 0} total`} />
          </div>
          <div className="split-panels">
            <RecentList title="Recent bookings" items={bookings.slice(0, 6).map((b) => `${b.serviceTitle} - ${b.status}`)} />
            <RecentList title="Newest users" items={users.slice(0, 6).map((u) => `${u.name} - ${u.role}`)} />
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="data-table">
          <div className="data-row header">
            <span>User</span>
            <span>Role</span>
            <span>Wallet</span>
            <span>Created</span>
          </div>
          {users.map((user) => (
            <div className="data-row" key={user.id}>
              <span>
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </span>
              <span>
                <select className="input-field" value={user.role} onChange={(event) => updateRole(user.id, event.target.value)}>
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </span>
              <span>Rs {Number(user.walletBalance || 0).toFixed(2)}</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="data-table">
          <div className="data-row header booking-grid">
            <span>Booking</span>
            <span>Parties</span>
            <span>Status</span>
            <span>Amount</span>
          </div>
          {bookings.map((booking) => (
            <div className="data-row booking-grid" key={booking.id}>
              <span>
                <strong>{booking.serviceTitle}</strong>
                <small>{new Date(booking.createdAt).toLocaleDateString()}</small>
              </span>
              <span>
                <strong>{booking.customerName}</strong>
                <small>Vendor: {booking.vendorName}</small>
              </span>
              <span>
                <StatusBadge status={booking.status} />
                <select className="input-field" value={booking.status} onChange={(event) => updateBookingStatus(booking.id, event.target.value)}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </span>
              <span>Rs {Number(booking.amount || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="data-table">
          <div className="data-row header service-grid">
            <span>Listing</span>
            <span>Vendor</span>
            <span>Location</span>
            <span>Control</span>
          </div>
          {services.map((service) => (
            <div className="data-row service-grid" key={service.id}>
              <span>
                <strong>{service.title}</strong>
                <small>{service.category} - Rs {service.pricePerUnit}/{service.unit?.toLowerCase()}</small>
              </span>
              <span>{service.vendorName}</span>
              <span>{service.location || 'No location'}</span>
              <span>
                <button className={service.active ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'} onClick={() => toggleService(service.id)}>
                  {service.active ? 'Deactivate' : 'Activate'}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function RecentList({ title, items }) {
  return (
    <div className="panel-block">
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>
      <div className="recent-list">
        {items.map((item) => <div key={item}>{item}</div>)}
      </div>
    </div>
  );
}
