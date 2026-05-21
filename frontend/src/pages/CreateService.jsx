import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AddressSearchField from '../components/AddressSearchField';

const categories = ['Equipment', 'Vehicles', 'Spaces', 'Tools', 'Electronics', 'Other'];
const units = [
  { value: 'HOUR', label: 'Per Hour' },
  { value: 'DAY', label: 'Per Day' },
  { value: 'PIECE', label: 'Per Piece' },
  { value: 'SESSION', label: 'Per Session' },
];

// Removed stock images array

export default function CreateService() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Equipment',
    pricePerUnit: '',
    securityDeposit: '0',
    allowPickup: true,
    allowDelivery: false,
    unit: 'HOUR',
    location: '',
    latitude: null,
    longitude: null,
    serviceRadiusKm: 10,
    images: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Camera settings
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const getImagesArray = () => {
    try {
      if (!form.images) return [];
      const parsed = JSON.parse(form.images);
      if (Array.isArray(parsed)) return parsed;
      return [form.images];
    } catch {
      return form.images ? [form.images] : [];
    }
  };

  const removeImage = (indexToRemove) => {
    const images = getImagesArray();
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    updateField('images', JSON.stringify(updated));
  };

  const addImageString = (url) => {
    const images = getImagesArray();
    const updated = [...images, url];
    updateField('images', JSON.stringify(updated));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const images = getImagesArray();
        const updated = [...images, reader.result];
        updateField('images', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    });
  };

  const startCamera = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      }, 150);
    } catch (err) {
      console.error(err);
      setError('Could not access camera. Please check camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      const images = getImagesArray();
      const updated = [...images, dataUrl];
      updateField('images', JSON.stringify(updated));
      stopCamera();
    }
  };

  const updateField = (field, value) => {
    setForm(f => {
      const updated = { ...f, [field]: value };
      // Auto-calculate security deposit when price changes
      if (field === 'pricePerUnit') {
        const parsedPrice = parseFloat(value);
        if (!isNaN(parsedPrice)) {
          // Setting it to 1.5x price
          updated.securityDeposit = (parsedPrice * 1.5).toFixed(2).toString();
        } else {
          updated.securityDeposit = '';
        }
      }
      return updated;
    });
  };

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
    
    if (!form.allowPickup && !form.allowDelivery) {
      setError('Please select at least one delivery option (Pickup or Home Delivery)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/services', {
        ...form,
        pricePerUnit: parseFloat(form.pricePerUnit),
        securityDeposit: parseFloat(form.securityDeposit) || 0,
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label>Price (INR)</label>
              <input
                type="number"
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.pricePerUnit}
                onChange={(e) => updateField('pricePerUnit', e.target.value)}
                onWheel={(e) => e.target.blur()}
                required
              />
            </div>

            <div className="input-group">
              <label>Security Deposit (INR) <span className="text-xs text-brand font-medium">(Auto-calculated at 1.5x price)</span></label>
              <input
                type="number"
                className="input-field opacity-60 bg-gray-50 cursor-not-allowed"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.securityDeposit}
                disabled
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ marginBottom: 'var(--space-xs)', display: 'block' }}>Fulfillment Options</label>
            <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-sm)' }}>
                <input
                  type="checkbox"
                  checked={form.allowPickup}
                  onChange={(e) => updateField('allowPickup', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                />
                Pickup Available
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-sm)' }}>
                <input
                  type="checkbox"
                  checked={form.allowDelivery}
                  onChange={(e) => updateField('allowDelivery', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                />
                Home Delivery Available
              </label>
            </div>
            {(!form.allowPickup && !form.allowDelivery) && (
              <span style={{ color: 'var(--accent)', fontSize: 'var(--font-xs)', marginTop: '4px' }}>
                * At least one option must be selected.
              </span>
            )}
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

          {/* Photo Management Section */}
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Item Photos ({getImagesArray().length})</label>
            
            {/* Image Grid Preview with Delete capability */}
            {getImagesArray().length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-md)'
              }}>
                {getImagesArray().map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      height: '80px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--glass-border)'
                    }}
                  >
                    <img src={img} alt={`Item thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 'bold'
                      }}
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                📁 Upload Files
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {!cameraActive ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={startCamera}
                >
                  📷 Live Camera Capture
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm btn-ghost"
                  onClick={stopCamera}
                  style={{ borderColor: 'var(--accent)' }}
                >
                  Close Camera Feed
                </button>
              )}
            </div>

            {/* Live Camera View Component */}
            {cameraActive && (
              <div style={{
                position: 'relative',
                background: 'black',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '320px',
                height: '240px',
                margin: '12px 0',
                border: '2px solid var(--accent-primary)'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={capturePhoto}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2
                  }}
                >
                  Capture Picture
                </button>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}

            {/* Stock Image Suggestions Removed */}
          </div>

          <div className="input-group">
            <label>Service Radius (km)</label>
            <input
              type="number"
              className="input-field"
              min="1"
              max="500"
              value={form.serviceRadiusKm}
              onChange={(e) => updateField('serviceRadiusKm', Number(e.target.value) || 10)}
              onWheel={(e) => e.target.blur()}
              required
            />
          </div>

          {/* Preview */}
          {form.title && (
            <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
              <h4 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                Preview
              </h4>
              {getImagesArray().length > 0 && (
                <div style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  marginBottom: 'var(--space-sm)'
                }}>
                  <img src={getImagesArray()[0]} alt={form.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
