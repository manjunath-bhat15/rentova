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
    <div className="animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand mb-1.5">
              {isVendor ? 'Manage' : 'Discover'}
            </p>
            <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-tight text-gray-900 m-0">
              {isVendor ? 'My Listings' : 'Browse Services'}
            </h1>
            <p className="text-gray-500 mt-1.5 text-sm">
              {isVendor ? 'Manage your service offerings' : `${services.length} services available near you`}
            </p>
          </div>
          {isVendor && (
            <button className="bg-brand hover:bg-brand-dark text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(252,128,25,0.35)] shrink-0" onClick={() => navigate('/dashboard/services/create')}>
              + Add Listing
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none">🔍</span>
          <input
            className="w-full pl-11 pr-4 h-12 rounded-xl text-sm bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:bg-white focus:border-brand transition-colors placeholder-gray-400"
            placeholder="Search services, vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Swiggy-style horizontal scrollable category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full border-1.5 text-[13px] transition-all whitespace-nowrap focus:outline-none ${
                activeCategory === cat 
                  ? 'border-brand bg-brand text-white font-bold' 
                  : 'border-gray-200 bg-gray-50 text-gray-500 font-medium hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 px-5 flex flex-col items-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold tracking-tight mb-2 text-gray-900">
            {isVendor ? 'No listings yet' : 'No services found'}
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            {isVendor ? 'Create your first listing to start receiving bookings.' : 'Try adjusting your search or category filter.'}
          </p>
          {isVendor && (
            <button className="bg-brand hover:bg-brand-dark text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(252,128,25,0.35)]" onClick={() => navigate('/dashboard/services/create')}>
              + Create Listing
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 pb-6">
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
