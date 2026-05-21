import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ServiceCard from '../components/ServiceCard';
import api from '../services/api';

const categories = ['All', 'Equipment', 'Vehicles', 'Spaces', 'Tools', 'Electronics', 'Other'];

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    loadServices();
  }, [search, activeCategory]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeCategory !== 'All') params.category = activeCategory;
      
      const endpoint = user?.role === 'VENDOR'
        ? '/api/vendor/services'
        : user?.role === 'ADMIN'
          ? '/api/admin/services'
          : '/api/services';
      const res = await api.get(endpoint, { params });
      
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to dedicated checkout page with service data
  const handleBook = (service) => {
    navigate('/dashboard/checkout', { state: { service } });
  };

  const isVendor = user?.role === 'VENDOR';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-primary)', marginBottom: '6px' }}>
              {isVendor ? 'Manage' : 'Discover'}
            </p>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0 }}>
              {isVendor ? 'My Listings' : 'Browse Services'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: 'var(--font-sm)' }}>
              {isVendor ? 'Manage your service offerings' : `${services.length} services available near you`}
            </p>
          </div>
          {isVendor && (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/services/create')} style={{ borderRadius: '12px', padding: '11px 22px' }}>
              + Add Listing
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
          <input
            className="input-field"
            placeholder="Search services, vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              paddingLeft: '44px',
              borderRadius: '14px',
              height: '48px',
              fontSize: 'var(--font-sm)',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
            }}
          />
        </div>

        {/* Swiggy-style horizontal scrollable category pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '8px 18px',
                borderRadius: '999px',
                border: activeCategory === cat ? '2px solid var(--accent-primary)' : '1.5px solid var(--glass-border)',
                background: activeCategory === cat ? 'var(--accent-primary)' : 'var(--glass-bg)',
                color: activeCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeCategory === cat ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <div className="loading-spinner" />
        </div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {isVendor ? 'No listings yet' : 'No services found'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: 'var(--font-sm)', maxWidth: '360px', margin: '0 auto 24px' }}>
            {isVendor ? 'Create your first listing to start receiving bookings.' : 'Try adjusting your search or category filter.'}
          </p>
          {isVendor && (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/services/create')} style={{ borderRadius: '12px' }}>
              + Create Listing
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }} className="stagger">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              onBook={!isVendor && !isAdmin ? handleBook : null}
              isVendor={isVendor}
            />
          ))}
        </div>
      )}

    </div>
  );
}
