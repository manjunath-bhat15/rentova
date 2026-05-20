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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard/admin')} style={{ marginBottom: '8px' }}>
            ← Back to Overview
          </button>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
            User Management
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>View all registered users on the platform.</p>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Name</th>
              <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Email</th>
              <th style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Role</th>
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
