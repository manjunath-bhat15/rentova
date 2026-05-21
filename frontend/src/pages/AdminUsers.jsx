import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyId = async (userId, approve) => {
    try {
      await api.patch(`/api/admin/users/${userId}/verify-id`, { approve });
      loadUsers();
    } catch (err) {
      console.error('Failed to update govt id status', err);
    }
  };

  const handleVerifyGst = async (userId, approve) => {
    try {
      await api.patch(`/api/admin/users/${userId}/verify-gst`, { approve });
      loadUsers();
    } catch (err) {
      console.error('Failed to update gst status', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col gap-3">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading users...</p>
      </div>
    );
  }

  // Filter users with pending verifications
  const pendingIdUsers = users.filter(u => u.govtIdNumber && !u.govtIdVerified);
  const pendingGstUsers = users.filter(u => u.gstNumber && !u.gstVerified);

  return (
    <div className="animate-in fade-in duration-300 pb-10 flex flex-col gap-6">
      <div>
        <button 
          className="bg-transparent border-none text-gray-500 font-semibold cursor-pointer mb-2 hover:text-gray-900 transition-colors focus:outline-none flex items-center gap-1.5 text-sm" 
          onClick={() => navigate('/dashboard/admin')}
        >
          ← Back to Overview
        </button>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 m-0 mb-1 tracking-tight">
          User Management & KYC Queue
        </h1>
        <p className="text-gray-500 m-0 text-sm">Approve government identity documents and view user trust scores.</p>
      </div>

      {/* KYC identity approval queue */}
      {(pendingIdUsers.length > 0 || pendingGstUsers.length > 0) && (
        <div className="bg-orange-50 border border-brand/20 rounded-2xl p-5 md:p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-lg font-bold text-brand mb-4 flex items-center gap-2 m-0 tracking-tight">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand" />
            KYC Pending Verification Queue ({pendingIdUsers.length + pendingGstUsers.length})
          </h2>

          <div className="flex flex-col gap-4">
            {/* Govt ID Queue */}
            {pendingIdUsers.map(u => (
              <div key={u.id} className="bg-white border border-orange-100 rounded-xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                <div>
                  <div className="font-bold text-gray-900 mb-1">{u.name} ({u.email})</div>
                  <div className="text-sm text-gray-500">
                    Govt ID Card (Aadhaar/PAN): <span className="font-mono font-bold text-gray-900">{u.govtIdNumber}</span>
                  </div>
                  {u.govtIdUrl && (
                    <a href={u.govtIdUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand underline mt-2 inline-block hover:text-brand-dark transition-colors">
                      View Uploaded Document Image ↗
                    </a>
                  )}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg border-none cursor-pointer hover:bg-emerald-600 transition-colors focus:outline-none" 
                    onClick={() => handleVerifyId(u.id, true)}
                  >
                    Approve ID
                  </button>
                  <button 
                    className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-500 font-bold rounded-lg border-none cursor-pointer hover:bg-red-100 transition-colors focus:outline-none" 
                    onClick={() => handleVerifyId(u.id, false)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {/* GST Queue */}
            {pendingGstUsers.map(u => (
              <div key={u.id} className="bg-white border border-orange-100 rounded-xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                <div>
                  <div className="font-bold text-gray-900 mb-1">{u.name} ({u.email})</div>
                  <div className="text-sm text-gray-500">
                    Business Tax Registry ID (GSTIN): <span className="font-mono font-bold text-gray-900">{u.gstNumber}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg border-none cursor-pointer hover:bg-emerald-600 transition-colors focus:outline-none" 
                    onClick={() => handleVerifyGst(u.id, true)}
                  >
                    Approve GST
                  </button>
                  <button 
                    className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-500 font-bold rounded-lg border-none cursor-pointer hover:bg-red-100 transition-colors focus:outline-none" 
                    onClick={() => handleVerifyGst(u.id, false)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Name</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Email</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Role</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap text-center">Trust Score</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Verification Flags</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-sm text-gray-900 whitespace-nowrap">{u.name}</td>
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{u.email}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-red-50 text-red-500' :
                      u.role === 'VENDOR' ? 'bg-orange-50 text-brand' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className={`p-4 text-center font-bold text-sm whitespace-nowrap ${u.trustScore >= 60 ? 'text-emerald-500' : 'text-gray-900'}`}>
                    {u.trustScore || 10} / 100
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        u.isVerified ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-400'
                      }`}>
                        Email
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        u.phoneVerified ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-400'
                      }`}>
                        Phone
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        u.govtIdVerified ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-400'
                      }`}>
                        Govt ID
                      </span>
                      {u.role === 'VENDOR' && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          u.gstVerified ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-400'
                        }`}>
                          GST
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
