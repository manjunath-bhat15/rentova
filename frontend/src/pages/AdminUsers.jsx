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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  // Filter users with pending verifications
  const pendingIdUsers = users.filter(u => u.govtIdNumber && !u.govtIdVerified);
  const pendingGstUsers = users.filter(u => u.gstNumber && !u.gstVerified);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/admin')} style={{ marginBottom: '8px' }}>
          ← Back to Overview
        </button>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
          User Management & KYC Queue
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Approve government identity documents and view user trust scores.</p>
      </div>

      {/* KYC identity approval queue */}
      {(pendingIdUsers.length > 0 || pendingGstUsers.length > 0) && (
        <div className="glass-card animate-fade-in" style={{ padding: 'var(--space-lg)', border: '1px solid var(--accent-primary)20' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
            KYC Pending Verification Queue ({pendingIdUsers.length + pendingGstUsers.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Govt ID Queue */}
            {pendingIdUsers.map(u => (
              <div key={u.id} style={{ padding: 'var(--space-md)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-base)' }}>{u.name} ({u.email})</div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Govt ID Card (Aadhaar/PAN): <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text-primary)' }}>{u.govtIdNumber}</span>
                  </div>
                  {u.govtIdUrl && (
                    <a href={u.govtIdUrl} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--font-xs)', color: 'var(--accent-secondary)', textDecoration: 'underline', marginTop: '6px', display: 'inline-block' }}>
                      View Uploaded Document Image ↗
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleVerifyId(u.id, true)} style={{ background: 'var(--accent-success)', border: 'none' }}>
                    Approve ID
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleVerifyId(u.id, false)} style={{ color: 'var(--accent-danger)' }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {/* GST Queue */}
            {pendingGstUsers.map(u => (
              <div key={u.id} style={{ padding: 'var(--space-md)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-base)' }}>{u.name} ({u.email})</div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Business Tax Registry ID (GSTIN): <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text-primary)' }}>{u.gstNumber}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleVerifyGst(u.id, true)} style={{ background: 'var(--accent-success)', border: 'none' }}>
                    Approve GST
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleVerifyGst(u.id, false)} style={{ color: 'var(--accent-danger)' }}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Users Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Email</th>
              <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>Trust Score</th>
              <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Verification Flags</th>
              <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: 'var(--space-md) var(--space-lg)', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                    background: u.role === 'ADMIN' ? 'rgba(255,107,107,0.1)' :
                               u.role === 'VENDOR' ? 'rgba(255,122,0,0.1)' : 'rgba(0,184,148,0.1)',
                    color: u.role === 'ADMIN' ? 'var(--accent-danger)' :
                           u.role === 'VENDOR' ? 'var(--accent-primary)' : 'var(--accent-success)',
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-md) var(--space-lg)', textAlign: 'center', fontWeight: 'bold', color: u.trustScore >= 60 ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                  {u.trustScore || 10} / 100
                </td>
                <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
                      background: u.isVerified ? 'rgba(0, 184, 148, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: u.isVerified ? 'var(--accent-success)' : 'var(--text-muted)'
                    }}>
                      Email
                    </span>
                    <span style={{
                      fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
                      background: u.phoneVerified ? 'rgba(0, 184, 148, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: u.phoneVerified ? 'var(--accent-success)' : 'var(--text-muted)'
                    }}>
                      Phone
                    </span>
                    <span style={{
                      fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
                      background: u.govtIdVerified ? 'rgba(0, 184, 148, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: u.govtIdVerified ? 'var(--accent-success)' : 'var(--text-muted)'
                    }}>
                      Govt ID
                    </span>
                    {u.role === 'VENDOR' && (
                      <span style={{
                        fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
                        background: u.gstVerified ? 'rgba(0, 184, 148, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: u.gstVerified ? 'var(--accent-success)' : 'var(--text-muted)'
                      }}>
                        GST
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
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
  );
}
