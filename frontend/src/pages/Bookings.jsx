import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BookingCard from '../components/BookingCard';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const statusFilters = ['All', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const statusConfig = {
  All:         { label: 'All',         emoji: '📋', colorClass: 'text-gray-900', bgClass: 'bg-gray-100', activeBg: 'bg-gray-900', activeColor: 'text-white' },
  PENDING:     { label: 'Pending',     emoji: '⏳', colorClass: 'text-amber-500', bgClass: 'bg-amber-50', activeBg: 'bg-amber-500', activeColor: 'text-white' },
  CONFIRMED:   { label: 'Confirmed',   emoji: '✅', colorClass: 'text-blue-500', bgClass: 'bg-blue-50', activeBg: 'bg-blue-500', activeColor: 'text-white' },
  IN_PROGRESS: { label: 'In Progress', emoji: '🔄', colorClass: 'text-purple-500', bgClass: 'bg-purple-50', activeBg: 'bg-purple-500', activeColor: 'text-white' },
  COMPLETED:   { label: 'Completed',   emoji: '🎉', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', activeBg: 'bg-emerald-500', activeColor: 'text-white' },
  CANCELLED:   { label: 'Cancelled',   emoji: '❌', colorClass: 'text-red-500', bgClass: 'bg-red-50', activeBg: 'bg-red-500', activeColor: 'text-white' },
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
    <div className="animate-in fade-in duration-300">
      {/* Page hero */}
      <div className="bg-gradient-to-br from-brand to-brand-light rounded-3xl p-6 md:p-8 mb-6 flex justify-between items-center flex-wrap gap-4 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10">
          <h1 className="text-[1.6rem] font-black text-white m-0 mb-1 tracking-tight">
            📋 My Bookings
          </h1>
          <p className="text-white/80 m-0 text-sm">
            {user?.role === 'CUSTOMER' ? 'Track all your service bookings' : 'Manage incoming booking requests'}
            {' — '}<strong className="text-white">{bookings.length}</strong> total
          </p>
        </div>
        
        {user?.role === 'CUSTOMER' && (
          <button
            onClick={() => navigate('/dashboard/services')}
            className="relative z-10 bg-white text-brand border-none px-5 py-2.5 rounded-full font-bold text-[13px] cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:bg-gray-50 transition-colors focus:outline-none"
          >
            + Book New Service
          </button>
        )}
      </div>

      {/* Status summary chips */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        {statusFilters.filter(f => f !== 'All').map(status => {
          const cfg = statusConfig[status];
          const count = statusCounts[status] || 0;
          if (count === 0) return null;
          return (
            <div key={status} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${cfg.bgClass} ${cfg.colorClass}`}>
              {cfg.emoji} {cfg.label}
              <span className={`w-[18px] h-[18px] rounded-full inline-flex items-center justify-center text-[10px] font-extrabold ml-0.5 ${cfg.activeBg} ${cfg.activeColor}`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filter pill strip */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {statusFilters.map((filter) => {
          const cfg = statusConfig[filter];
          const count = filter === 'All' ? bookings.length : (statusCounts[filter] || 0);
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-none cursor-pointer shrink-0 text-[13px] transition-all duration-200 focus:outline-none ${
                isActive 
                  ? `${cfg.activeBg} ${cfg.activeColor} shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-bold` 
                  : 'bg-gray-100 text-gray-500 font-medium hover:bg-gray-200'
              }`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center flex-col items-center gap-3 py-20">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
          <p className="text-gray-400 text-sm m-0">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 px-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-extrabold text-gray-900 m-0 mb-2 tracking-tight">
            {activeFilter === 'All' ? 'No bookings yet' : `No ${statusConfig[activeFilter]?.label.toLowerCase()} bookings`}
          </h3>
          <p className="text-gray-500 text-sm m-0 mb-5">
            {user?.role === 'CUSTOMER'
              ? 'Browse services and create your first booking.'
              : 'Bookings will appear here when customers book your services.'}
          </p>
          {user?.role === 'CUSTOMER' && (
            <button
              onClick={() => navigate('/dashboard/services')}
              className="bg-brand text-white border-none px-6 py-3 rounded-full font-bold text-sm cursor-pointer shadow-[0_4px_14px_rgba(252,128,25,0.3)] hover:bg-brand-dark transition-colors focus:outline-none"
            >
              Browse Services →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredBookings.map((b) => (
            <BookingCard key={b.id} booking={b} userRole={user?.role} />
          ))}
        </div>
      )}
    </div>
  );
}
