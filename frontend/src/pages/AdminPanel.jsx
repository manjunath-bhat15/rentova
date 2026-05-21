import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { Icon } from '../components/Icon';
import api from '../services/api';

const roles = ['CUSTOMER', 'VENDOR', 'ADMIN'];
const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function AdminPanel({ defaultTab = 'overview' }) {
  const activeTab = defaultTab;
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

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All their bookings, wallet records, and listings will be deleted.')) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      loadStatsOnly();
      loadAdminData();
    } catch (err) {
      console.error('Failed to delete user', err);
      toast.error('Failed to delete user.');
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await api.delete(`/api/admin/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      loadStatsOnly();
    } catch (err) {
      console.error('Failed to delete booking', err);
      toast.error('Failed to delete booking.');
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this listing? All associated bookings will be deleted.')) return;
    try {
      await api.delete(`/api/admin/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      loadStatsOnly();
      loadAdminData();
    } catch (err) {
      console.error('Failed to delete listing', err);
      toast.error('Failed to delete listing.');
    }
  };

  const adjustWallet = async (userId, currentBalance) => {
    const amountStr = prompt('Enter amount to add (positive) or deduct (negative) for user ' + userId + ':');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      toast.error('Please enter a valid number.');
      return;
    }
    try {
      const res = await api.patch(`/api/admin/users/${userId}/wallet`, { amount });
      setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, walletBalance: res.data.walletBalance } : user));
      toast.success(`Adjusted balance by ₹${amount}.`);
      loadAdminData();
    } catch (err) {
      console.error('Failed to adjust wallet balance', err);
      toast.error('Failed to adjust wallet balance.');
    }
  };

  const loadStatsOnly = async () => {
    const res = await api.get('/api/admin/stats');
    setStats(res.data);
  };

  const revenue = useMemo(() => Number(stats?.totalRevenue || 0), [stats]);

  const verifyGovtId = async (userId, approve) => {
    try {
      const res = await api.patch(`/api/admin/users/${userId}/verify-id`, { approve });
      setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
    } catch (err) {
      console.error(err);
    }
  };

  const verifyGst = async (userId, approve) => {
    try {
      const res = await api.patch(`/api/admin/users/${userId}/verify-gst`, { approve });
      setUsers(prev => prev.map(u => u.id === userId ? res.data : u));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col gap-3">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest m-0 mb-1">
            Admin command center
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-white m-0 mb-2 tracking-tight">
            Platform Control
          </h1>
          <p className="text-gray-300 m-0 text-sm max-w-xl leading-relaxed">
            Operate users, bookings, listings, revenue, and marketplace controls from one dedicated workspace.
          </p>
        </div>
        
        <button 
          className="relative z-10 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-colors focus:outline-none" 
          onClick={loadAdminData}
        >
          Refresh Data
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric label="Users" value={stats?.totalUsers || 0} detail={`${stats?.vendors || 0} vendors`} />
            <Metric label="Bookings" value={stats?.totalBookings || 0} detail={`${stats?.pendingBookings || 0} pending`} />
            <Metric label="Revenue" value={`Rs ${revenue.toFixed(2)}`} detail={`${stats?.completedBookings || 0} completed`} />
            <Metric label="Active Listings" value={stats?.activeServices || 0} detail={`${stats?.totalServices || 0} total`} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <RecentList title="Recent bookings" items={bookings.slice(0, 6).map((b) => `${b.serviceTitle} - ${b.status}`)} />
            <RecentList title="Newest users" items={users.slice(0, 6).map((u) => `${u.name} - ${u.role}`)} />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">User</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Role</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Wallet</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Created</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <select 
                        className="px-2 py-1 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-brand"
                        value={user.role} 
                        onChange={(event) => updateRole(user.id, event.target.value)}
                      >
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>
                    <td className="p-4 font-semibold text-sm text-gray-900 whitespace-nowrap">
                      Rs {Number(user.walletBalance || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => adjustWallet(user.id, user.walletBalance)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors focus:outline-none border-none cursor-pointer"
                          title="Adjust Wallet Balance"
                        >
                          <Icon name="wallet" className="w-4 h-4" />
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors focus:outline-none border-none cursor-pointer"
                            title="Delete User"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Booking</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Parties</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 min-w-[200px]">
                      <div className="font-bold text-sm text-gray-900 truncate">{booking.serviceTitle}</div>
                      <div className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 min-w-[150px]">
                      <div className="font-bold text-sm text-gray-900">{booking.customerName}</div>
                      <div className="text-[11px] font-medium text-gray-500">V: {booking.vendorName}</div>
                    </td>
                    <td className="p-4 min-w-[160px]">
                      <div className="flex flex-col gap-2 items-start">
                        <StatusBadge status={booking.status} />
                        <select 
                          className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:outline-none focus:border-brand w-full max-w-[130px]"
                          value={booking.status} 
                          onChange={(event) => updateBookingStatus(booking.id, event.target.value)}
                        >
                          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-sm text-gray-900 whitespace-nowrap">
                      Rs {Number(booking.amount || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => deleteBooking(booking.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors focus:outline-none border-none cursor-pointer"
                        title="Delete Booking"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Listing</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Vendor</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Location</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Control</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 min-w-[200px]">
                      <div className="font-bold text-sm text-gray-900 truncate">{service.title}</div>
                      <div className="text-xs text-gray-500 truncate">{service.category} - Rs {service.pricePerUnit}/{service.unit?.toLowerCase()}</div>
                    </td>
                    <td className="p-4 font-medium text-sm text-gray-900 min-w-[130px]">{service.vendorName}</td>
                    <td className="p-4 text-sm text-gray-500 min-w-[130px]">{service.location || 'No location'}</td>
                    <td className="p-4">
                      <button 
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border-none cursor-pointer focus:outline-none transition-colors ${
                          service.active 
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                        onClick={() => toggleService(service.id)}
                      >
                        {service.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => deleteService(service.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors focus:outline-none border-none cursor-pointer"
                        title="Delete Listing"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'verifications' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">User</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Govt ID Status</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">GST Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.filter(u => u.govtIdNumber || u.gstNumber).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 min-w-[200px]">
                      <div className="font-bold text-sm text-gray-900 truncate">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">Score: {user.trustScore}</span>
                    </td>
                    <td className="p-4 min-w-[200px]">
                      {user.govtIdNumber ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{user.govtIdNumber}</span>
                          {user.govtIdVerified ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Verified</span>
                          ) : (
                            <button onClick={() => verifyGovtId(user.id, true)} className="px-3 py-1 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-light transition-colors">Approve ID</button>
                          )}
                        </div>
                      ) : <span className="text-gray-400 text-xs">Not provided</span>}
                    </td>
                    <td className="p-4 min-w-[200px]">
                      {user.gstNumber ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{user.gstNumber}</span>
                          {user.gstVerified ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Verified</span>
                          ) : (
                            <button onClick={() => verifyGst(user.id, true)} className="px-3 py-1 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-light transition-colors">Approve GST</button>
                          )}
                        </div>
                      ) : <span className="text-gray-400 text-xs">Not provided</span>}
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.govtIdNumber || u.gstNumber).length === 0 && (
                  <tr><td colSpan="3" className="p-6 text-center text-gray-500 text-sm">No pending KYC documents.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-1">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <strong className="text-2xl font-black text-gray-900 tracking-tight">{value}</strong>
      <small className="text-xs font-medium text-gray-500">{detail}</small>
    </div>
  );
}

function RecentList({ title, items }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest m-0">{title}</h2>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="text-sm text-gray-400 italic">No items found</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="text-sm font-medium text-gray-700 p-2.5 bg-gray-50 rounded-xl truncate">
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
