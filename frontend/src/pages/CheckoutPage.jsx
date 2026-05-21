import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddressSearchField from '../components/AddressSearchField';
import api from '../services/api';

const fulfillmentOptions = [
  { value: 'PICKUP',   emoji: '🏪', label: 'Store Pickup',   desc: 'Collect from vendor location' },
  { value: 'DELIVERY', emoji: '🚚', label: 'Home Delivery',  desc: 'Delivered to your address' },
];

export default function CheckoutPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const service   = location.state?.service;

  const [form, setForm] = useState({
    quantity:         1,
    scheduledAt:      '',
    notes:            '',
    deliveryAddress:  '',
    latitude:         null,
    longitude:        null,
    fulfillmentModel: 'PICKUP',
  });
  const [walletBalance, setWalletBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [step, setStep]       = useState(1); // 1 = details, 2 = review

  useEffect(() => {
    if (!service) { navigate('/dashboard/services'); return; }
    // Prefill fulfillment based on service capabilities
    const defaultModel =
      service.allowDelivery && !service.allowPickup ? 'DELIVERY' : 'PICKUP';
    setForm(f => ({ ...f, fulfillmentModel: defaultModel }));
    // Load wallet
    api.get('/api/wallet').then(r => setWalletBalance(r.data.balance)).catch(() => setWalletBalance(0));
  }, [service, navigate]);

  if (!service) return null;

  const total   = (parseFloat(service.pricePerUnit) * form.quantity) + parseFloat(service.securityDeposit || 0);
  const rent    = parseFloat(service.pricePerUnit) * form.quantity;
  const deposit = parseFloat(service.securityDeposit || 0);
  const canAfford = walletBalance !== null && walletBalance >= total;

  const handleSubmit = async () => {
    setError('');
    if (form.fulfillmentModel === 'DELIVERY' && !form.deliveryAddress) {
      setError('Please enter a delivery address.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/bookings', {
        serviceId:       service.id,
        quantity:        form.quantity,
        scheduledAt:     form.scheduledAt || null,
        notes:           form.notes       || null,
        location:        form.fulfillmentModel === 'DELIVERY' ? form.deliveryAddress : null,
        latitude:        form.latitude,
        longitude:       form.longitude,
        fulfillmentModel: form.fulfillmentModel,
      });
      navigate('/dashboard/booking-confirmation', { state: { booking: res.data, service } });
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Insufficient wallet balance. Please top up your wallet first.');
      } else {
        setError(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (val) =>
    setForm(f => ({ ...f, [field]: typeof val === 'object' && val.target ? val.target.value : val }));

  const inputStyle = (active) => ({
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: `1.5px solid ${active ? '#fc8019' : '#e8e8e8'}`,
    fontSize: '14px', color: '#1c1c1c', outline: 'none',
    background: active ? '#fff' : '#fafafa',
    transition: 'all 0.2s ease', boxSizing: 'border-box',
  });

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: '640px', margin: '0 auto' }}>

      {/* Back */}
      <button
        onClick={() => step === 2 ? setStep(1) : navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '999px',
          border: '1.5px solid #e8e8e8', background: '#fff',
          color: '#686b78', fontWeight: 600, fontSize: '13px',
          cursor: 'pointer', marginBottom: '20px',
        }}
      >
        ← {step === 2 ? 'Edit Details' : 'Back'}
      </button>

      {/* Steps indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        {['Booking Details', 'Review & Pay'].map((label, i) => {
          const active = step === i + 1;
          const done   = step > i + 1;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: done ? '#10b981' : active ? '#fc8019' : '#f0f0f0',
                  color: (done || active) ? '#fff' : '#93959f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 800, transition: 'all 0.2s ease',
                }}>
                  {done ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '13px', fontWeight: active ? 700 : 500, color: active ? '#1c1c1c' : '#93959f' }}>
                  {label}
                </span>
              </div>
              {i === 0 && <div style={{ flex: 1, height: 2, background: step > 1 ? '#fc8019' : '#f0f0f0', borderRadius: 2, transition: 'all 0.3s ease' }} />}
            </div>
          );
        })}
      </div>

      {/* Service summary card (always visible) */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '16px 20px',
        border: '1px solid #f0f0f0', marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '12px', flexShrink: 0,
          background: 'rgba(252,128,25,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
        }}>
          {service.category === 'Vehicles' ? '🚗' : service.category === 'Electronics' ? '📱' : service.category === 'Tools' ? '🔧' : '📦'}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: '#1c1c1c', margin: '0 0 2px' }}>{service.title}</p>
          <p style={{ fontSize: '12px', color: '#93959f', margin: 0 }}>by {service.vendorName}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 900, fontSize: '16px', color: '#fc8019', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
            ₹{service.pricePerUnit}
          </p>
          <p style={{ fontSize: '11px', color: '#93959f', margin: 0 }}>per {service.unit?.toLowerCase() || 'unit'}</p>
        </div>
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Fulfillment Model */}
          {service.allowPickup !== false && service.allowDelivery !== false && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 14px' }}>How do you want it?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {fulfillmentOptions.map(opt => {
                  const isAvailable = opt.value === 'PICKUP' ? service.allowPickup !== false : service.allowDelivery !== false;
                  if (!isAvailable) return null;
                  const selected = form.fulfillmentModel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => set('fulfillmentModel')(opt.value)}
                      style={{
                        padding: '14px 12px', borderRadius: '14px', cursor: 'pointer',
                        border: `2px solid ${selected ? '#fc8019' : '#e8e8e8'}`,
                        background: selected ? 'rgba(252,128,25,0.06)' : '#fafafa',
                        textAlign: 'left', transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{opt.emoji}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: selected ? '#fc8019' : '#1c1c1c' }}>{opt.label}</div>
                      <div style={{ fontSize: '11px', color: '#93959f', marginTop: '2px' }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {form.fulfillmentModel === 'DELIVERY' && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 12px' }}>🚚 Delivery Address</p>
              <AddressSearchField
                value={form.deliveryAddress}
                onChange={(val) => set('deliveryAddress')(val)}
                onLocationSelect={({ address, latitude, longitude }) => {
                  setForm(f => ({ ...f, deliveryAddress: address, latitude, longitude }));
                }}
                placeholder="Search your delivery address..."
              />
            </div>
          )}

          {/* Quantity + Schedule */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>Rental Details</p>

            {/* Quantity */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => set('quantity')(Math.max(1, form.quantity - 1))}
                  style={{
                    width: 40, height: 40, borderRadius: '10px',
                    border: '1.5px solid #e8e8e8', background: '#fff',
                    fontSize: '20px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: form.quantity <= 1 ? '#d0d0d0' : '#1c1c1c',
                  }}
                >−</button>
                <span style={{ fontSize: '22px', fontWeight: 900, color: '#1c1c1c', minWidth: '32px', textAlign: 'center' }}>
                  {form.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => set('quantity')(form.quantity + 1)}
                  style={{
                    width: 40, height: 40, borderRadius: '10px',
                    border: '1.5px solid #fc8019', background: 'rgba(252,128,25,0.08)',
                    fontSize: '20px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fc8019',
                  }}
                >+</button>
                <span style={{ fontSize: '12px', color: '#93959f', marginLeft: '4px' }}>× ₹{service.pricePerUnit} = ₹{rent.toFixed(2)}</span>
              </div>
            </div>

            {/* Scheduled Date */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Preferred Date & Time <span style={{ color: '#93959f', textTransform: 'none', fontSize: '11px', fontWeight: 400 }}>• Optional</span>
              </label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={set('scheduledAt')}
                style={inputStyle(false)}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Special Instructions <span style={{ color: '#93959f', textTransform: 'none', fontSize: '11px', fontWeight: 400 }}>• Optional</span>
              </label>
              <textarea
                value={form.notes}
                onChange={set('notes')}
                placeholder="Any notes for the vendor..."
                rows={3}
                style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            style={{
              width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
              background: '#fc8019', color: '#fff', fontWeight: 800, fontSize: '15px',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(252,128,25,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Review Order →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Order summary */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              📋 Order Summary
            </h3>

            {[
              { label: 'Fulfillment',    value: form.fulfillmentModel === 'DELIVERY' ? '🚚 Home Delivery' : '🏪 Store Pickup' },
              form.deliveryAddress && { label: 'Delivery To',  value: `📍 ${form.deliveryAddress}` },
              { label: 'Quantity',       value: `${form.quantity} × ${service.unit?.toLowerCase() || 'unit'}` },
              form.scheduledAt && { label: 'Scheduled',    value: new Date(form.scheduledAt).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              form.notes && { label: 'Notes',         value: form.notes },
            ].filter(Boolean).map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#686b78' }}>{row.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
              </div>
            ))}

            {/* Pricing breakdown */}
            <div style={{ marginTop: '16px', padding: '16px', background: '#fafafa', borderRadius: '12px' }}>
              {[
                { label: `Rental (₹${service.pricePerUnit} × ${form.quantity})`, value: `₹${rent.toFixed(2)}`, color: '#1c1c1c' },
                deposit > 0 && { label: 'Security Deposit (Refundable)', value: `₹${deposit.toFixed(2)}`, color: '#10b981' },
              ].filter(Boolean).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#686b78' }}>{row.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: row.color }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #e8e8e8' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#1c1c1c' }}>Total</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#fc8019', letterSpacing: '-0.03em' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Wallet balance */}
          <div style={{
            background: canAfford ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${canAfford ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: '14px', padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#686b78', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                💰 Wallet Balance
              </p>
              <p style={{ fontSize: '20px', fontWeight: 900, color: canAfford ? '#10b981' : '#ef4444', margin: 0, letterSpacing: '-0.02em' }}>
                ₹{walletBalance?.toFixed(2) || '0.00'}
              </p>
            </div>
            {!canAfford && (
              <button
                onClick={() => navigate('/dashboard/wallet')}
                style={{
                  padding: '8px 16px', borderRadius: '10px', border: 'none',
                  background: '#ef4444', color: '#fff',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                }}
              >
                Top Up →
              </button>
            )}
            {canAfford && (
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                ✓ Sufficient
              </span>
            )}
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: '13px', fontWeight: 500,
            }}>
              ❌ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !canAfford}
            style={{
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
              background: loading || !canAfford ? '#f0f0f0' : '#fc8019',
              color: loading || !canAfford ? '#93959f' : '#fff',
              fontWeight: 800, fontSize: '16px',
              cursor: loading || !canAfford ? 'not-allowed' : 'pointer',
              boxShadow: !loading && canAfford ? '0 6px 20px rgba(252,128,25,0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? '⏳ Placing Order...' : `🔒 Confirm & Pay ₹${total.toFixed(2)}`}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#93959f', margin: '4px 0 0' }}>
            🔒 Amount locked in escrow · Released after service completion
          </p>
        </div>
      )}
    </div>
  );
}
