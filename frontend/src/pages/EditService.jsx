import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import AddressSearchField from '../components/AddressSearchField';

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

export default function EditService() {
  const { id } = useParams();
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
  const [fetching, setFetching] = useState(true);

  // Camera settings
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/api/services/${id}`);
        const data = res.data;
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'Equipment',
          pricePerUnit: (data.pricePerUnit || 0).toString(),
          securityDeposit: (data.securityDeposit || 0).toString(),
          allowPickup: data.allowPickup ?? true,
          allowDelivery: data.allowDelivery ?? false,
          unit: data.unit || 'HOUR',
          location: data.location || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          serviceRadiusKm: data.serviceRadiusKm || 10,
          images: data.images || '',
        });
      } catch (err) {
        setError('Failed to fetch service details.');
      } finally {
        setFetching(false);
      }
    };
    fetchService();
  }, [id]);

  const updateField = (field, value) => setForm(f => ({ ...f, [field]: value }));

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
      await api.put(`/api/services/${id}`, {
        ...form,
        pricePerUnit: parseFloat(form.pricePerUnit),
        securityDeposit: parseFloat(form.securityDeposit) || 0,
      });
      navigate('/dashboard/services');
    } catch (err) {
      setError('Failed to update service. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const currentImages = getImagesArray();

  return (
    <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: '4px' }}>
          Edit Service Listing
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', fontSize: 'var(--font-sm)' }}>
          Update listing details, pricing, fulfillment options, and multiple photos.
        </p>

        {error && <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="input-group">
            <label>Service/Tool Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Tesla Model 3 / DSLR Camera Rental"
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
              placeholder="Describe the tool/service, specifications, pickup instructions..."
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
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>Item Photos ({currentImages.length})</label>
            
            {/* Image Grid Preview with Delete capability */}
            {currentImages.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-md)'
              }}>
                {currentImages.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      height: '80px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--glass-border)',
                      group: 'true'
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

            {/* Stock Image Suggestions */}
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                Quick Add High-Quality Stock Photo:
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
                    onClick={() => addImageString(img.url)}
                    style={{
                      padding: 0,
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      height: '50px',
                      cursor: 'pointer',
                      background: 'none',
                      transition: 'transform 0.1s ease'
                    }}
                    title={img.name}
                  >
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
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

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => navigate('/dashboard/services')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
