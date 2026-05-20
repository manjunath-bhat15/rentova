import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AddressSearchField from '../components/AddressSearchField';
import { useLocationContext } from '../contexts/LocationContext';

const categories = ['Equipment', 'Vehicles', 'Spaces', 'Tools', 'Electronics', 'Other'];
const units = [
  { value: 'HOUR', label: 'Per Hour' },
  { value: 'DAY', label: 'Per Day' },
  { value: 'PIECE', label: 'Per Piece' },
  { value: 'SESSION', label: 'Per Session' },
];

const stockImages = [
  { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60', name: 'Car/Tesla (Vehicles)' },
  { url: 'https://images.unsplash.com/photo-1516576882236-1634b8c6a6f6?w=500&auto=format&fit=crop&q=60', name: 'Cargo Van (Vehicles)' },
  { url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60', name: 'Scooter (Vehicles)' },
  { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60', name: 'DSLR Camera (Equipment)' },
  { url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500&auto=format&fit=crop&q=60', name: 'Drone (Equipment)' },
  { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=60', name: 'Office Room (Spaces)' },
  { url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60', name: 'Power Drill (Tools)' },
  { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=60', name: 'Garden Tools (Tools)' },
];

export default function CreateService() {
  const navigate = useNavigate();
  const { coords, selectedAddress } = useLocationContext();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Equipment',
    pricePerUnit: '',
    unit: 'HOUR',
    location: selectedAddress || '',
    latitude: coords?.latitude || null,
    longitude: coords?.longitude || null,
    serviceRadiusKm: 10,
    images: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          location: `${position.coords.latitude}, ${position.coords.longitude}`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      () => {
        setError('Unable to retrieve your location');
      }
    );
  };

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
            <label>Price (INR)</label>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <AddressSearchField
              label="Location (Search or enter manually)"
              placeholder="Search city, address or landmark..."
              initialAddress={form.location}
              onSelectLocation={(address, lat, lon) => {
                setForm(current => ({
                  ...current,
                  location: address,
                  latitude: lat !== null ? lat : current.latitude,
                  longitude: lon !== null ? lon : current.longitude
                }));
              }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchLocation}
              style={{ alignSelf: 'flex-start' }}
            >
              📍 Use Current GPS Location
            </button>
          </div>

          <div className="input-group">
            <label>Item Image (URL suggestion or custom link)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Paste custom image URL here..."
              value={form.images}
              onChange={(e) => updateField('images', e.target.value)}
            />
            
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                Or select a high-quality stock photo suggestion:
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                gap: '8px',
                marginTop: '6px'
              }}>
                {stockImages.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => updateField('images', img.url)}
                    style={{
                      padding: 0,
                      border: form.images === img.url ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      height: '50px',
                      cursor: 'pointer',
                      background: 'none',
                      transition: 'border var(--transition-fast)'
                    }}
                    title={img.name}
                  >
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            {form.images && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Image Preview:</span>
                <div style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginTop: '4px',
                  border: '1px solid var(--glass-border)'
                }}>
                  <img
                    src={form.images}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Service Radius (km)</label>
            <input
              type="number"
              className="input-field"
              min="1"
              max="100"
              value={form.serviceRadiusKm}
              onChange={(e) => updateField('serviceRadiusKm', Number(e.target.value) || 10)}
            />
          </div>

          {/* Preview */}
          {form.title && (
            <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
              <h4 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                Preview
              </h4>
              {form.images && (
                <div style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  marginBottom: 'var(--space-sm)'
                }}>
                  <img src={form.images} alt={form.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>{form.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>
                {form.description || 'No description'}
              </p>
              {form.location && (
                <p style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-xs)', marginTop: '4px', fontWeight: 600 }}>
                  📍 {form.location}
                </p>
              )}
              <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)', alignItems: 'baseline' }}>
                <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                  ₹{form.pricePerUnit || '0.00'}
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
