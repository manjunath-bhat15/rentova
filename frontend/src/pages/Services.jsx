import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ServiceCard from '../components/ServiceCard';
import AddressSearchField from '../components/AddressSearchField';
import api from '../services/api';

const categories = ['All', 'Equipment', 'Vehicles', 'Spaces', 'Tools', 'Electronics', 'Other'];

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingForm, setBookingForm] = useState({ quantity: 1, scheduledAt: '', notes: '', location: '', latitude: null, longitude: null });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');  
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    loadServices();
  }, [search, activeCategory]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeCategory !== 'All') params.category = activeCategory;
      
      const endpoint = user?.role === 'VENDOR'
        ? '/api/vendor/services'
        : user?.role === 'ADMIN'
          ? '/api/admin/services'
          : '/api/services';
      const res = await api.get(endpoint, { params });
      
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (service) => {
    setSelectedService(service);
    const defaultModel = service.allowDelivery && !service.allowPickup ? 'DELIVERY' : 'PICKUP';
    setBookingForm({
      quantity: 1,
      scheduledAt: '',
      notes: '',
      location: '',
      latitude: null,
      longitude: null,
      fulfillmentModel: defaultModel
    });
    setBookingError('');
    setShowBookingModal(true);
    // Fetch wallet balance
    try {
      const res = await api.get('/api/wallet');
      setWalletBalance(res.data.balance);
    } catch (e) {
      setWalletBalance(0);
    }
  };

  const submitBooking = async () => {
    if (!selectedService) return;
    setBookingLoading(true);
    try {
      await api.post('/api/bookings', {
        serviceId: selectedService.id,
        quantity: bookingForm.quantity,
        scheduledAt: bookingForm.scheduledAt || null,
        notes: bookingForm.notes || null,
        location: bookingForm.location || null,
        latitude: bookingForm.latitude,
        longitude: bookingForm.longitude,
        fulfillmentModel: bookingForm.fulfillmentModel,
      });
      setShowBookingModal(false);
      navigate('/dashboard/bookings');
    } catch (err) {
      const msg = err.response?.status === 400
        ? 'Insufficient wallet balance. Please top up your wallet first.'
        : 'Booking failed. Please try again.';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const isVendor = user?.role === 'VENDOR';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>
            {isVendor ? 'My Services' : 'Browse Services'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isVendor ? 'Manage your service offerings' : 'Find and book services from top vendors'}
          </p>
        </div>
        {isVendor && (
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/services/create')}>
            + Create Service
          </button>
        )}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loading-spinner" />
        </div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '8px' }}>
            {isVendor ? 'No services yet' : 'No services found'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            {isVendor ? 'Create your first service to start receiving bookings.' : 'Try adjusting your search or category filter.'}
          </p>
          {isVendor && (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/services/create')}>
              + Create Service
            </button>
          )}
        </div>
      ) : (
        <div className="bento-grid stagger">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              onBook={!isVendor && !isAdmin ? handleBook : null}
              isVendor={isVendor}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 'var(--space-lg)',
        }}
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '480px', padding: 'var(--space-2xl)', animation: 'slideUp 0.3s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
              Book Service
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', fontSize: 'var(--font-sm)' }}>
              {selectedService.title} — ₹{selectedService.pricePerUnit}/{selectedService.unit.toLowerCase()}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="input-group">
                <label>Quantity</label>
                <input
                  type="number"
                  className="input-field"
                  min="1"
                  value={bookingForm.quantity}
                  onChange={(e) => setBookingForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>

              {(selectedService.allowPickup && selectedService.allowDelivery) ? (
                <div className="input-group">
                  <label>Fulfillment Option</label>
                  <select
                    className="input-field"
                    value={bookingForm.fulfillmentModel}
                    onChange={(e) => setBookingForm(f => ({ ...f, fulfillmentModel: e.target.value }))}
                  >
                    <option value="PICKUP">🏪 Store Pickup (Self)</option>
                    <option value="DELIVERY">🚚 Home Delivery</option>
                  </select>
                </div>
              ) : (
                <div className="input-group">
                  <label>Fulfillment Option</label>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '10px 14px', 
                    fontSize: 'var(--font-sm)',
                    border: '1px dashed var(--glass-border)',
                    color: 'var(--text-secondary)'
                  }}>
                    {selectedService.allowDelivery ? '🚚 Home Delivery Only' : '🏪 Vendor Pickup Only'}
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Schedule (optional)</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={bookingForm.scheduledAt}
                  onChange={(e) => setBookingForm(f => ({ ...f, scheduledAt: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Notes (optional)</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Any special requirements..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <AddressSearchField
                  label={bookingForm.fulfillmentModel === 'DELIVERY' ? 'Home Delivery Address' : 'Fulfillment / Service Location'}
                  placeholder="Search address or enter manually..."
                  initialAddress={bookingForm.location}
                  onSelectLocation={(address, lat, lon) => {
                    setBookingForm(f => ({
                      ...f,
                      location: address,
                      latitude: lat !== null ? lat : f.latitude,
                      longitude: lon !== null ? lon : f.longitude
                    }));
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (!navigator.geolocation) {
                      setBookingError('Geolocation not supported by browser.');
                      return;
                    }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => setBookingForm(f => ({
                        ...f,
                        location: `${pos.coords.latitude}, ${pos.coords.longitude}`,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                      })),
                      () => setBookingError('Unable to fetch location.')
                    );
                  }}
                  style={{ alignSelf: 'flex-start' }}
                >
                  📍 Use Current GPS Location
                </button>
              </div>

              {bookingError && (
                <div className="error-message" style={{ marginBottom: 'var(--space-sm)' }}>
                  {bookingError}{' '}
                  {bookingError.includes('wallet') && (
                    <a href="/dashboard/wallet" style={{ fontWeight: 600 }}>Go to Wallet</a>
                  )}
                </div>
              )}

              <div style={{
                padding: 'var(--space-md)', 
                background: 'rgba(255, 255, 255, 0.04)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                  <span>Rental Fee (₹{selectedService.pricePerUnit} × {bookingForm.quantity})</span>
                  <span>₹{(selectedService.pricePerUnit * bookingForm.quantity).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                  <span>Security Deposit (Refundable)</span>
                  <span>₹{((selectedService.securityDeposit || 0) * bookingForm.quantity).toFixed(2)}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>Total Lockin Amount</span>
                    {walletBalance !== null && (
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Wallet Balance: ₹{parseFloat(walletBalance).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--accent-secondary)' }}>
                    ₹{((selectedService.pricePerUnit + (selectedService.securityDeposit || 0)) * bookingForm.quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={bookingLoading}
                  onClick={submitBooking}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
