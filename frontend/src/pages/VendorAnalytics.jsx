import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function VendorAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalBookings: 0,
    servicesCount: 0,
    rating: 0
  });
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user?.role !== 'VENDOR') {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [bookingsRes, servicesRes] = await Promise.all([
          api.get('/api/bookings'),
          api.get('/api/services/mine')
        ]);
        
        const b = bookingsRes.data;
        const s = servicesRes.data;
        setBookings(b);
        
        let totalEarnings = 0;
        let completed = 0;
        let active = 0;
        
        b.forEach(booking => {
          if (booking.status === 'COMPLETED') {
            completed++;
            totalEarnings += booking.amount;
          } else if (booking.status === 'CONFIRMED' || booking.status === 'PENDING') {
            active++;
          }
        });

        setStats({
          totalEarnings,
          activeBookings: active,
          completedBookings: completed,
          totalBookings: b.length,
          servicesCount: s.length,
          rating: user.rating || 0
        });

      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const { chartData, statusData } = useMemo(() => {
    if (!bookings.length) return { chartData: [], statusData: [] };

    const grouped = {};
    const statuses = { 'COMPLETED': 0, 'CONFIRMED': 0, 'PENDING': 0, 'CANCELLED': 0, 'REJECTED': 0 };

    bookings.forEach(b => {
      // Bar chart data
      if (statuses[b.status] !== undefined) {
        statuses[b.status]++;
      } else {
        statuses[b.status] = 1;
      }

      // Line chart data
      const date = new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = { date, earnings: 0, bookings: 0, timestamp: new Date(b.createdAt).getTime() };
      }
      grouped[date].bookings += 1;
      if (b.status === 'COMPLETED') {
        grouped[date].earnings += b.amount;
      }
    });

    const cData = Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
    const sData = Object.keys(statuses).map(key => ({ name: key, count: statuses[key] })).filter(item => item.count > 0);

    return { chartData: cData, statusData: sData };
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col gap-3">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
        <p className="text-gray-400 font-medium">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 m-0 tracking-tight">Vendor Analytics</h1>
        <p className="text-gray-500 mt-2 m-0 text-sm md:text-base">Track your performance and earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="text-3xl mb-3">💰</div>
          <div className="text-2xl font-black text-gray-900 mb-1">₹{stats.totalEarnings.toLocaleString()}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Earnings</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="text-3xl mb-3">📦</div>
          <div className="text-2xl font-black text-gray-900 mb-1">{stats.servicesCount}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Services</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="text-3xl mb-3">✅</div>
          <div className="text-2xl font-black text-gray-900 mb-1">{stats.completedBookings}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Completed Bookings</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="text-3xl mb-3">⭐</div>
          <div className="text-2xl font-black text-gray-900 mb-1">{stats.rating.toFixed(1)}</div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Average Rating</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 m-0 mb-6">Revenue Over Time</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fc8019" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fc8019" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                    formatter={(value) => [`₹${value}`, 'Earnings']}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="#fc8019" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 m-0 mb-6">Booking Status</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#374151' }} width={80} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 m-0 mb-4">Recent Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Service</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map(b => {
                  const earnings = b.status === 'COMPLETED' ? b.amount : 0;
                  return (
                    <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/bookings/${b.id}`)}>
                      <td className="py-4">
                        <p className="font-bold text-gray-900 m-0 text-sm">{b.serviceTitle}</p>
                        <p className="text-xs text-gray-500 m-0 mt-0.5">{new Date(b.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="py-4 text-sm font-medium text-gray-900">{b.customerName}</td>
                      <td className="py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                          b.status === 'CANCELLED' ? 'bg-red-50 text-red-500' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-bold text-emerald-600">
                        {earnings > 0 ? `₹${earnings.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
