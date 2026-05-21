import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MapPanel, { mapsDirectionsUrl } from '../components/MapPanel';
import api from '../services/api';

const statusFlow = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

const statusConfig = {
  PENDING:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   emoji: '⏳', label: 'Pending' },
  CONFIRMED:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   emoji: '✅', label: 'Confirmed' },
  IN_PROGRESS: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',   emoji: '🔄', label: 'In Progress' },
  COMPLETED:   { color: '#10b981', bg: 'rgba(16,185,129,0.1)',   emoji: '🎉', label: 'Completed' },
  CANCELLED:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    emoji: '❌', label: 'Cancelled' },
};

/* ── 6-box OTP Input Component ── */
function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (i, char) => {
    const raw = char.replace(/\D/g, '');
    if (!raw) return;
    const next = [...digits];
    next[i] = raw[raw.length - 1];
    onChange(next.join('').slice(0, 6));
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[i]) {
        next[i] = '';
        onChange(next.join(''));
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
        next[i - 1] = '';
        onChange(next.join(''));
      }
    }
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6).trimEnd());
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: '48px', height: '56px',
            textAlign: 'center', fontSize: '22px', fontWeight: 800,
            border: `2px solid ${d ? '#fc8019' : '#e8e8e8'}`,
            borderRadius: '12px', outline: 'none',
            background: d ? 'rgba(252,128,25,0.06)' : '#fafafa',
            color: '#1c1c1c', fontFamily: 'monospace',
            transition: 'all 0.15s ease',
            boxSizing: 'border-box',
          }}
          onFocusCapture={(e) => {
            e.target.style.borderColor = '#fc8019';
            e.target.style.boxShadow = '0 0 0 3px rgba(252,128,25,0.15)';
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = e.target.value ? '#fc8019' : '#e8e8e8';
            e.target.style.boxShadow = 'none';
          }}
        />
      ))}
    </div>
  );
}

/* ── OTP Display Card (for the party that HAS the code) ── */
function OtpDisplay({ code, label, hint, color = '#fc8019' }) {
  const [copied, setCopied] = useState(false);
  const digits = String(code || '------').split('');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      background: '#fff', borderRadius: '20px', padding: '24px',
      border: `2px solid ${color}20`,
      boxShadow: `0 4px 20px ${color}15`,
      textAlign: 'center',
      marginBottom: '16px',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '14px',
        background: `${color}15`, margin: '0 auto 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px',
      }}>🔑</div>
      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
        {label}
      </h3>
      <p style={{ fontSize: '13px', color: '#686b78', marginBottom: '20px', lineHeight: 1.5 }}>{hint}</p>

      {/* Digit boxes */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
        {digits.map((d, i) => (
          <div key={i} style={{
            width: '48px', height: '56px', borderRadius: '12px',
            border: `2px solid ${color}`,
            background: `${color}08`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: 900, color,
            fontFamily: 'monospace', letterSpacing: 0,
          }}>{d}</div>
        ))}
      </div>

      <button
        onClick={handleCopy}
        style={{
          padding: '10px 24px', borderRadius: '999px',
          border: `1.5px solid ${color}`,
          background: copied ? color : 'transparent',
          color: copied ? '#fff' : color,
          fontWeight: 700, fontSize: '13px', cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {copied ? '✓ Copied!' : '📋 Copy Code'}
      </button>
    </div>
  );
}

/* ── OTP Entry Card (for the party that must enter the code) ── */
function OtpEntry({ label, hint, color = '#fc8019', onVerify, loading, error }) {
  const [otp, setOtp] = useState('');

  return (
    <div style={{
      background: '#fff', borderRadius: '20px', padding: '24px',
      border: `2px solid ${color}20`,
      boxShadow: `0 4px 20px ${color}15`,
      marginBottom: '16px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '14px',
          background: `${color}15`, margin: '0 auto 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
        }}>🏪</div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          {label}
        </h3>
        <p style={{ fontSize: '13px', color: '#686b78', lineHeight: 1.5 }}>{hint}</p>
      </div>

      <OtpInput value={otp} onChange={setOtp} disabled={loading} />

      {error && (
        <div style={{
          marginTop: '12px', padding: '10px 14px',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px', color: '#ef4444',
          fontSize: '13px', textAlign: 'center', fontWeight: 500,
        }}>
          ❌ {error}
        </div>
      )}

      <button
        onClick={() => onVerify(otp)}
        disabled={loading || otp.replace(/\s/g, '').length < 6}
        style={{
          width: '100%', marginTop: '16px',
          padding: '14px', borderRadius: '14px', border: 'none',
          background: (loading || otp.length < 6) ? '#f0f0f0' : color,
          color: (loading || otp.length < 6) ? '#93959f' : '#fff',
          fontWeight: 700, fontSize: '15px',
          cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: otp.length === 6 && !loading ? `0 4px 16px ${color}40` : 'none',
        }}
      >
        {loading ? '⏳ Verifying...' : '✓ Verify & Confirm'}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Booking Detail Component
══════════════════════════════════════════════ */
export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const loadBooking = useCallback(async () => {
    try {
      const res = await api.get(`/api/bookings/${id}`);
      setBooking(res.data);
    } catch (err) {
      console.error('Failed to load booking', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
    const interval = setInterval(() => {
      api.get(`/api/bookings/${id}`)
        .then(res => setBooking(res.data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [id, loadBooking]);

  const updateStatus = async (status) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/api/bookings/${id}/status`, { status });
      setBooking(res.data);
    } catch (err) {
      alert('Failed to update status. ' + (err.response?.data?.message || ''));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async (otp) => {
    if (!otp || otp.replace(/\s/g,'').length < 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    setActionLoading(true);
    setOtpError('');
    try {
      const res = await api.post(`/api/bookings/${id}/start`, { otp: otp.trim() });
      setBooking(res.data);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Verification failed. Check the code and try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndService = async (otp) => {
    if (!otp || otp.replace(/\s/g,'').length < 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    setActionLoading(true);
    setOtpError('');
    try {
      const res = await api.post(`/api/bookings/${id}/end`, { otp: otp.trim() });
      setBooking(res.data);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Verification failed. Check the code and try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#fc8019', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p style={{ color: '#93959f', fontSize: '14px' }}>Loading booking...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1c1c', marginBottom: '8px' }}>Booking not found</h2>
        <button
          onClick={() => navigate('/dashboard/bookings')}
          style={{ padding: '12px 24px', borderRadius: '12px', border: '1.5px solid #e8e8e8', background: '#fff', color: '#1c1c1c', fontWeight: 600, cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}
        >
          ← Back to Bookings
        </button>
      </div>
    );
  }

  const isVendor = user?.id === booking.vendorId;
  const isCustomer = user?.id === booking.customerId;
  const canCancel = (isCustomer && booking.status === 'PENDING') ||
                    (isVendor && (booking.status === 'PENDING' || booking.status === 'CONFIRMED'));
  const currentStep = statusFlow.indexOf(booking.status);
  const cfg = statusConfig[booking.status] || statusConfig.PENDING;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Back + status row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/dashboard/bookings')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '999px',
            border: '1.5px solid #e8e8e8', background: '#fff',
            color: '#686b78', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
          }}
        >
          ← Bookings
        </button>
        <span style={{
          padding: '6px 14px', borderRadius: '999px',
          fontSize: '12px', fontWeight: 700,
          background: cfg.bg, color: cfg.color,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Main info card */}
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '24px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        marginBottom: '16px',
      }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1c1c1c', margin: '0 0 20px', letterSpacing: '-0.03em' }}>
          {booking.serviceTitle}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Customer', value: booking.customerName, emoji: '👤' },
            { label: 'Vendor',   value: booking.vendorName,   emoji: '🏪' },
            { label: 'Fulfillment', value: booking.fulfillmentModel === 'DELIVERY' ? '🚚 Home Delivery' : '🏪 Store Pickup', emoji: null },
            { label: 'Booked on', value: new Date(booking.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }), emoji: '📅' },
          ].map(item => (
            <div key={item.label} style={{ padding: '12px 14px', background: '#fafafa', borderRadius: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#93959f', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                {item.label}
              </p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1c1c1c', margin: 0 }}>
                {item.value}
              </p>
            </div>
          ))}

          {/* Pricing */}
          <div style={{ gridColumn: '1 / -1', padding: '14px 16px', background: 'rgba(252,128,25,0.05)', borderRadius: '12px', border: '1px solid rgba(252,128,25,0.1)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#93959f', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
              Payment Breakdown
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#686b78' }}>Rent{booking.quantity > 1 ? ` × ${booking.quantity}` : ''}</span>
                <p style={{ fontSize: '18px', fontWeight: 900, color: '#1c1c1c', margin: '2px 0 0', letterSpacing: '-0.03em' }}>
                  ₹{parseFloat(booking.amount).toFixed(2)}
                </p>
              </div>
              {parseFloat(booking.securityDeposit || 0) > 0 && (
                <div>
                  <span style={{ fontSize: '11px', color: '#686b78' }}>Security Deposit (Refundable)</span>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#10b981', margin: '2px 0 0', letterSpacing: '-0.03em' }}>
                    ₹{parseFloat(booking.securityDeposit).toFixed(2)}
                  </p>
                </div>
              )}
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#686b78' }}>Total Locked in Escrow</span>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fc8019', margin: '2px 0 0', letterSpacing: '-0.03em' }}>
                  ₹{(parseFloat(booking.amount) + parseFloat(booking.securityDeposit || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled */}
        {booking.scheduledAt && (
          <div style={{ marginTop: '12px', padding: '12px 14px', background: '#f0f9ff', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📅</span>
            <div>
              <p style={{ fontSize: '11px', color: '#0369a1', fontWeight: 700, margin: 0 }}>SCHEDULED FOR</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1c1c1c', margin: '2px 0 0' }}>
                {new Date(booking.scheduledAt).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}

        {/* Location */}
        {booking.location && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📍</span>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#166534', margin: 0 }}>{booking.location}</p>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fafafa', borderRadius: '10px' }}>
            <p style={{ fontSize: '11px', color: '#93959f', fontWeight: 700, margin: '0 0 4px' }}>NOTES</p>
            <p style={{ fontSize: '13px', color: '#686b78', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>"{booking.notes}"</p>
          </div>
        )}
      </div>

      {/* Map card */}
      {(booking.serviceLatitude || booking.latitude) && (
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #f0f0f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1c1c1c', margin: 0 }}>📍 Service Location</h3>
            {booking.serviceLatitude && (
              <a
                href={mapsDirectionsUrl(booking.latitude, booking.longitude, booking.serviceLatitude, booking.serviceLongitude)}
                target="_blank" rel="noreferrer"
                style={{ padding: '8px 16px', borderRadius: '999px', border: '1.5px solid #e8e8e8', background: '#fff', color: '#1c1c1c', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
              >
                🗺 Directions
              </a>
            )}
          </div>
          <MapPanel
            latitude={booking.serviceLatitude || booking.latitude}
            longitude={booking.serviceLongitude || booking.longitude}
            label={booking.serviceLocation || booking.serviceTitle}
            height={220}
          />
        </div>
      )}

      {/* Status Timeline */}
      <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '1px solid #f0f0f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1c1c1c', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Journey
        </h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {statusFlow.map((step, i) => {
            const isActive = i <= currentStep && booking.status !== 'CANCELLED';
            const isCurrent = step === booking.status;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < statusFlow.length - 1 ? 1 : 'none' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 800,
                  background: isActive ? '#fc8019' : '#f0f0f0',
                  color: isActive ? '#fff' : '#93959f',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(252,128,25,0.2)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {isActive && i < currentStep ? '✓' : i + 1}
                </div>
                {i < statusFlow.length - 1 && (
                  <div style={{
                    flex: 1, height: 3, margin: '0 4px',
                    background: i < currentStep && booking.status !== 'CANCELLED' ? '#fc8019' : '#f0f0f0',
                    borderRadius: 2, transition: 'all 0.3s ease',
                  }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          {statusFlow.map(step => (
            <span key={step} style={{
              fontSize: '10px', color: step === booking.status ? '#fc8019' : '#93959f',
              fontWeight: step === booking.status ? 700 : 400,
              textAlign: 'center', flex: 1,
            }}>
              {step.replace('_', ' ')}
            </span>
          ))}
        </div>
        {booking.status === 'CANCELLED' && (
          <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(239,68,68,0.06)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>
            ❌ This booking has been cancelled.
          </div>
        )}
      </div>

      {/* ── OTP: Confirmed → Start service ── */}
      {booking.status === 'CONFIRMED' && (
        <>
          {isCustomer && (
            <OtpDisplay
              code={booking.startOtp}
              label="Your Start Code"
              hint="Share this 6-digit code with the vendor to begin the service and authorize the rental payment."
              color="#fc8019"
            />
          )}
          {isVendor && (
            <OtpEntry
              label="Enter Start Code from Customer"
              hint="Ask the customer for their 6-digit Start Code. Entering it will begin the service and lock the rental amount."
              color="#fc8019"
              onVerify={handleStartService}
              loading={actionLoading}
              error={otpError}
            />
          )}
        </>
      )}

      {/* ── OTP: In Progress → End service ── */}
      {booking.status === 'IN_PROGRESS' && (
        <>
          {isVendor && (
            <OtpDisplay
              code={booking.endOtp}
              label="Your End Code"
              hint="Share this 6-digit code with the customer once they return the item to complete the service and release their deposit."
              color="#10b981"
            />
          )}
          {isCustomer && (
            <OtpEntry
              label="Enter End Code from Vendor"
              hint="Ask the vendor for their 6-digit End Code once you've returned the item. This will release your security deposit refund."
              color="#10b981"
              onVerify={handleEndService}
              loading={actionLoading}
              error={otpError}
            />
          )}
        </>
      )}

      {/* ── Actions ── */}
      {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '16px 20px',
          border: '1px solid #f0f0f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          display: 'flex', gap: '10px', flexWrap: 'wrap',
        }}>
          <button
            onClick={() => navigate(`/dashboard/chat?bookingId=${booking.id}`)}
            style={{
              flex: 1, minWidth: '120px', padding: '12px',
              borderRadius: '12px', border: '1.5px solid #e8e8e8',
              background: '#fff', color: '#1c1c1c',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            💬 Message
          </button>

          {canCancel && (
            <button
              onClick={() => { if (window.confirm('Cancel this booking?')) updateStatus('CANCELLED'); }}
              disabled={actionLoading}
              style={{
                flex: 1, minWidth: '120px', padding: '12px',
                borderRadius: '12px', border: 'none',
                background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              }}
            >
              Cancel Booking
            </button>
          )}

          {isVendor && booking.status === 'PENDING' && (
            <button
              onClick={() => updateStatus('CONFIRMED')}
              disabled={actionLoading}
              style={{
                flex: 2, minWidth: '160px', padding: '12px',
                borderRadius: '12px', border: 'none',
                background: '#fc8019', color: '#fff',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(252,128,25,0.35)',
              }}
            >
              {actionLoading ? '⏳ Updating...' : '✅ Confirm Booking'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
