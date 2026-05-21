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
    { label: t('revenue'), value: `₹ ${Number(stats?.totalRevenue || 0).toFixed(2)}`, detail: t('statusCompleted') },
  ] : [
    { label: t('activeBookings'), value: stats?.activeBookings || 0, detail: `${stats?.pendingBookings || 0} ${t('statusPending').toLowerCase()}` },
    { label: t('walletBalance'), value: `₹ ${Number(stats?.walletBalance || 0).toFixed(2)}`, detail: t('wallet') },
    { label: t('nearbyVendors'), value: nearby.length, detail: 'Within 10 km' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-br from-brand/10 to-brand-light/5 rounded-3xl p-6 md:p-10 mb-8 border border-brand/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10">
          <p className="text-brand font-black text-[11px] uppercase tracking-widest mb-1.5">
            {isVendor ? t('vendorOps') : t('custDashboard')}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {t('welcome')},{' '}
            <span className="text-brand">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2 font-medium max-w-lg">
            {isVendor ? t('vendorHeroDesc') : t('custHeroDesc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <button
            className="bg-brand hover:bg-brand-dark text-white font-bold text-[13px] px-6 py-3.5 rounded-xl shadow-[0_4px_14px_rgba(252,128,25,0.35)] transition-all duration-200 hover:-translate-y-0.5 focus:outline-none"
            onClick={() => navigate(isVendor ? '/dashboard/services/create' : '/dashboard/nearby')}
          >
            {isVendor ? t('addListing') : t('findNearby')}
          </button>
          <button
            className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-bold text-[13px] px-6 py-3.5 rounded-xl shadow-sm transition-all duration-200 hover:-translate-y-0.5 focus:outline-none"
            onClick={() => navigate('/dashboard/bookings')}
          >
            {t('viewBookings')}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {metricCards.map((metric, i) => (
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow" key={metric.label}>
            <span className="text-[13px] font-bold text-gray-500 mb-1">{metric.label}</span>
            <strong className="text-3xl font-black text-gray-900 tracking-tight">{metric.value}</strong>
            <small className="text-[11px] font-semibold text-gray-400 mt-1 uppercase tracking-wider">{metric.detail}</small>
          </div>
        ))}
      </div>

      {/* Two-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* Recent Bookings */}
        <section className="bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('recentBookings')}</h2>
              <p className="text-xs font-medium text-gray-500">{t('latestActivity')}</p>
            </div>
            <button className="text-xs font-bold text-brand hover:text-brand-dark bg-brand/5 hover:bg-brand/10 px-4 py-2 rounded-full transition-colors focus:outline-none" onClick={() => navigate('/dashboard/bookings')}>
              {t('openAll')} &rarr;
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recentBookings.map((booking) => (
              <button key={booking.id} onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors w-full text-left focus:outline-none"
              >
                <span className="flex flex-col overflow-hidden mr-4">
                  <strong className="text-[14px] font-bold text-gray-900 truncate">{booking.serviceTitle}</strong>
                  <small className="text-[12px] font-medium text-gray-500 truncate">{isVendor ? booking.customerName : booking.vendorName}</small>
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                  booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                  booking.status === 'PENDING' ? 'bg-brand/10 text-brand' :
                  booking.status === 'IN_PROGRESS' ? 'bg-cyan-50 text-cyan-600' :
                  'bg-red-50 text-red-500'
                }`}>
                  {booking.status}
                </span>
              </button>
            ))}
            {recentBookings.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="text-4xl mb-3">📋</div>
                <strong className="text-sm font-bold text-gray-900">{t('noBookings')}</strong>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{isVendor ? t('vendorEmptyDesc') : t('custEmptyDesc')}</p>
              </div>
            )}
          </div>
        </section>

        {!isVendor && (
          <section className="bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('nearbyInventory')}</h2>
                <p className="text-xs font-medium text-gray-500">{t('freshServices')}</p>
              </div>
              <button className="text-xs font-bold text-brand hover:text-brand-dark bg-brand/5 hover:bg-brand/10 px-4 py-2 rounded-full transition-colors focus:outline-none" onClick={() => navigate('/dashboard/nearby')}>
                {t('mapView')} &rarr;
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {nearby.slice(0, 5).map((service) => (
                <button key={service.id} onClick={() => navigate('/dashboard/nearby')}
                  className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors w-full text-left focus:outline-none"
                >
                  <span className="flex flex-col overflow-hidden mr-4">
                    <strong className="text-[14px] font-bold text-gray-900 truncate">{service.title}</strong>
                    <small className="text-[12px] font-medium text-gray-500 truncate">{service.vendorName}</small>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                    📍 {service.distanceKm} km
                  </span>
                </button>
              ))}
              {nearby.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="text-4xl mb-3">🗺️</div>
                  <strong className="text-sm font-bold text-gray-900">{t('noNearbyListings')}</strong>
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{t('allowLocationDesc')}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Nearby Service Toast */}
      {nearbyPopup && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 bg-gray-900 text-white p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.2)] flex items-center gap-4 z-50 animate-in slide-in-from-bottom-8 duration-300 max-w-sm">
          <div className="flex-1 min-w-0">
            <strong className="text-[13px] font-bold block mb-1 text-emerald-400">{t('newNearbyListing')}</strong>
            <p className="text-xs text-gray-300 m-0 truncate">
              {nearbyPopup.title} by {nearbyPopup.vendorName}, {nearbyPopup.distanceKm} km away.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="bg-brand hover:bg-brand-light text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors focus:outline-none" onClick={() => navigate('/dashboard/nearby')}>
              {t('view')}
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold w-8 h-8 rounded-xl flex items-center justify-center transition-colors focus:outline-none" onClick={dismissNearby}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
