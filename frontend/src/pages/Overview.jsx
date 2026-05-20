import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import api from '../services/api';

export default function Overview() {
  const { user } = useAuth();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [nearbyPopup, setNearbyPopup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === 'CUSTOMER') loadNearbyListings();
  }, [user?.role]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'VENDOR' ? '/api/vendor/dashboard' : '/api/customer/dashboard';
      const bookingsEndpoint = user?.role === 'VENDOR' ? '/api/vendor/bookings' : '/api/customer/bookings';
      const [statsRes, bookingsRes] = await Promise.all([
        api.get(endpoint),
        api.get(bookingsEndpoint),
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
    } catch {
      try {
        const res = await api.get('/api/bookings');
        setBookings(res.data);
      } finally {
        setStats({});
      }
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyListings = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const res = await api.get('/api/customer/services/nearby', {
          params: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radiusKm: 10,
          },
        });
        setNearby(res.data);
        const seen = JSON.parse(localStorage.getItem('rentova_seen_nearby') || '[]');
        const newest = res.data.find((service) => !seen.includes(service.id));
        if (newest) setNearbyPopup(newest);
      } catch {
        setNearby([]);
      }
    });
  };

  const dismissNearby = () => {
    if (nearbyPopup) {
      const seen = JSON.parse(localStorage.getItem('rentova_seen_nearby') || '[]');
      localStorage.setItem('rentova_seen_nearby', JSON.stringify([...new Set([...seen, nearbyPopup.id])]));
    }
    setNearbyPopup(null);
  };

  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings]);
  const isVendor = user?.role === 'VENDOR';

  const metricCards = isVendor ? [
    { label: t('activeBookings'), value: stats?.activeBookings || 0, detail: `${stats?.pendingBookings || 0} ${t('statusPending').toLowerCase()}` },
    { label: t('myListings'), value: stats?.totalServices || 0, detail: `${stats?.activeServices || 0} ${t('online').toLowerCase()}` },
    { label: t('revenue'), value: `Rs ${Number(stats?.totalRevenue || 0).toFixed(2)}`, detail: t('statusCompleted') },
  ] : [
    { label: t('activeBookings'), value: stats?.activeBookings || 0, detail: `${stats?.pendingBookings || 0} ${t('statusPending').toLowerCase()}` },
    { label: t('walletBalance'), value: `Rs ${Number(stats?.walletBalance || 0).toFixed(2)}`, detail: t('wallet') },
    { label: t('nearbyVendors'), value: nearby.length, detail: 'Within 10 km' },
  ];

  if (loading) {
    return (
      <div className="center-loader">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Hero */}
      <div className="workspace-hero stagger">
        <div>
          <p className="eyebrow" style={{ marginBottom: '6px' }}>
            {isVendor ? t('vendorOps') : t('custDashboard')}
          </p>
          <h1>
            {t('welcome')},{' '}
            <span>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ marginTop: '8px' }}>
            {isVendor ? t('vendorHeroDesc') : t('custHeroDesc')}
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate(isVendor ? '/dashboard/services/create' : '/dashboard/nearby')}
            style={{ borderRadius: '12px', padding: '12px 24px' }}
          >
            {isVendor ? t('addListing') : t('findNearby')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard/bookings')}
            style={{ borderRadius: '12px', padding: '12px 24px' }}
          >
            {t('viewBookings')}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metric-grid stagger">
        {metricCards.map((metric, i) => (
          <div className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </div>
        ))}
      </div>

      {/* Two-column panels */}
      <div className="split-panels">
        {/* Recent Bookings */}
        <section className="panel-block">
          <div className="panel-heading">
            <div>
              <h2>{t('recentBookings')}</h2>
              <p>{t('latestActivity')}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/bookings')}
              style={{ borderRadius: '999px', fontSize: '12px' }}
            >
              {t('openAll')} →
            </button>
          </div>
          <div className="recent-list">
            {recentBookings.map((booking) => (
              <button key={booking.id} onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}>
                <span>
                  <strong>{booking.serviceTitle}</strong>
                  <small>{isVendor ? booking.customerName : booking.vendorName}</small>
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: booking.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)'
                    : booking.status === 'PENDING' ? 'rgba(252,128,25,0.1)'
                    : booking.status === 'IN_PROGRESS' ? 'rgba(0,188,212,0.1)'
                    : 'rgba(239,68,68,0.1)',
                  color: booking.status === 'COMPLETED' ? '#10b981'
                    : booking.status === 'PENDING' ? '#fc8019'
                    : booking.status === 'IN_PROGRESS' ? '#00bcd4'
                    : '#ef4444',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {booking.status}
                </span>
              </button>
            ))}
            {recentBookings.length === 0 && (
              <div className="empty-state">
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
                <strong>{t('noBookings')}</strong>
                <p style={{ marginTop: '6px', fontSize: 'var(--font-sm)' }}>{isVendor ? t('vendorEmptyDesc') : t('custEmptyDesc')}</p>
              </div>
            )}
          </div>
        </section>

        {!isVendor && (
          <section className="panel-block">
            <div className="panel-heading">
              <div>
                <h2>{t('nearbyInventory')}</h2>
                <p>{t('freshServices')}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/nearby')}
                style={{ borderRadius: '999px', fontSize: '12px' }}
              >
                {t('mapView')} →
              </button>
            </div>
            <div className="recent-list">
              {nearby.slice(0, 5).map((service) => (
                <button key={service.id} onClick={() => navigate('/dashboard/nearby')}>
                  <span>
                    <strong>{service.title}</strong>
                    <small>{service.vendorName}</small>
                  </span>
                  <span style={{ color: 'var(--accent-success)', fontWeight: 700, fontSize: 'var(--font-xs)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    📍 {service.distanceKm} km
                  </span>
                </button>
              ))}
              {nearby.length === 0 && (
                <div className="empty-state">
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗺️</div>
                  <strong>{t('noNearbyListings')}</strong>
                  <p style={{ marginTop: '6px', fontSize: 'var(--font-sm)' }}>{t('allowLocationDesc')}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Nearby Service Toast */}
      {nearbyPopup && (
        <div className="nearby-toast">
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }}>{t('newNearbyListing')}</strong>
            <p>{nearbyPopup.title} by {nearbyPopup.vendorName}, {nearbyPopup.distanceKm} km away.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/nearby')}
              style={{ borderRadius: '999px' }}
            >
              {t('view')}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={dismissNearby}
              style={{ borderRadius: '999px' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
