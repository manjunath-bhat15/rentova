import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

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
      <div className="flex justify-center items-center py-20 flex-col gap-3">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 m-0 mb-1 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 m-0 text-sm">Overview of platform metrics.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="bg-white border-1.5 border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none" 
            onClick={() => navigate('/dashboard/admin/users')}
          >
            Manage Users
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col gap-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Total Users
          </div>
          <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{stats?.totalUsers || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col gap-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Total Bookings
          </div>
          <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{stats?.totalBookings || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col gap-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Completed Revenue
          </div>
          <div className="text-3xl md:text-4xl font-black text-emerald-500 tracking-tight">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <h2 className="text-lg md:text-xl font-extrabold text-gray-900 mb-5 tracking-tight">Recent Bookings</h2>
      {recentBookings.length === 0 ? (
        <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-xl border border-gray-100">No bookings found.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">ID</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Service</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Customer</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Vendor</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                      {booking.id.substring(0, 8)}
                    </td>
                    <td className="p-4 font-bold text-sm text-gray-900 truncate max-w-[200px]">{booking.serviceTitle}</td>
                    <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{booking.customerName}</td>
                    <td className="p-4 text-sm text-gray-700 whitespace-nowrap">{booking.vendorName}</td>
                    <td className="p-4 font-bold text-sm text-gray-900 whitespace-nowrap">₹{booking.amount * booking.quantity}</td>
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
