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
      <div className="workspace-hero">
        <div>
          <p className="eyebrow">{isVendor ? t('vendorOps') : t('custDashboard')}</p>
          <h1>{t('welcome')}, {user?.name?.split(' ')[0]}</h1>
          <p>
            {isVendor
              ? t('vendorHeroDesc')
              : t('custHeroDesc')}
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => navigate(isVendor ? '/dashboard/services/create' : '/dashboard/nearby')}>
            {isVendor ? t('addListing') : t('findNearby')}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard/bookings')}>{t('viewBookings')}</button>
        </div>
      </div>

      <div className="metric-grid">
        {metricCards.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </div>
        ))}
      </div>

      <div className="split-panels">
        <section className="panel-block">
          <div className="panel-heading">
            <div>
              <h2>{t('recentBookings')}</h2>
              <p>{t('latestActivity')}</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/bookings')}>{t('openAll')}</button>
          </div>
          <div className="recent-list">
            {recentBookings.map((booking) => (
              <button key={booking.id} onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}>
                <span>
                  <strong>{booking.serviceTitle}</strong>
                  <small>{isVendor ? booking.customerName : booking.vendorName}</small>
                </span>
                <span>{booking.status}</span>
              </button>
            ))}
            {recentBookings.length === 0 && (
              <div className="empty-state">
                <strong>{t('noBookings')}</strong>
                <p>{isVendor ? t('vendorEmptyDesc') : t('custEmptyDesc')}</p>
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
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/nearby')}>{t('mapView')}</button>
            </div>
            <div className="recent-list">
              {nearby.slice(0, 5).map((service) => (
                <button key={service.id} onClick={() => navigate('/dashboard/nearby')}>
                  <span>
                    <strong>{service.title}</strong>
                    <small>{service.vendorName}</small>
                  </span>
                  <span>{service.distanceKm} km</span>
                </button>
              ))}
              {nearby.length === 0 && (
                <div className="empty-state">
                  <strong>{t('noNearbyListings')}</strong>
                  <p>{t('allowLocationDesc')}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {nearbyPopup && (
        <div className="nearby-toast">
          <div>
            <strong>{t('newNearbyListing')}</strong>
            <p>{nearbyPopup.title} by {nearbyPopup.vendorName}, {nearbyPopup.distanceKm} km away.</p>
          </div>
          <div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/nearby')}>{t('view')}</button>
            <button className="btn btn-ghost btn-sm" onClick={dismissNearby}>{t('dismiss')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
