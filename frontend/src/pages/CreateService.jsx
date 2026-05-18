import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const categories = ['Equipment', 'Vehicles', 'Spaces', 'Tools', 'Electronics', 'Other'];
const units = [
  { value: 'HOUR', label: 'Per Hour' },
  { value: 'DAY', label: 'Per Day' },
  { value: 'PIECE', label: 'Per Piece' },
  { value: 'SESSION', label: 'Per Session' },
];

export default function CreateService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Equipment',
    pricePerUnit: '',
    unit: 'HOUR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/services', {
        ...form,
        pricePerUnit: parseFloat(form.pricePerUnit),
      });
      navigate('/dashboard/services');
    } catch (err) {
      setError('Failed to create service. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ maxWidth: '640px' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
          Create Service
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
          Add a new service for customers to book
        </p>

        {error && <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="input-group">
            <label>Service Title</label>
            <input
              className="input-field"
              placeholder="e.g., Professional Camera Kit"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              className="input-field"
              rows="4"
              placeholder="Describe your service, what's included, conditions, etc."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Pricing Unit</label>
              <select
                className="input-field"
                value={form.unit}
                onChange={(e) => updateField('unit', e.target.value)}
              >
                {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Price (USD)</label>
            <input
              type="number"
              className="input-field"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={form.pricePerUnit}
              onChange={(e) => updateField('pricePerUnit', e.target.value)}
              required
            />
          </div>

          {/* Preview */}
          {form.title && (
            <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
              <h4 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                Preview
              </h4>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>{form.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>
                {form.description || 'No description'}
              </p>
              <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)', alignItems: 'baseline' }}>
                <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                  ${form.pricePerUnit || '0.00'}
                </span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                  /{form.unit.toLowerCase()}
                </span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard/services')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Publish Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
