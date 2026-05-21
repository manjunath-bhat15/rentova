import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, service } = location.state || {};
  const confettiRef = useRef(null);

  useEffect(() => {
    if (!booking) { navigate('/dashboard/bookings'); return; }
    // Simple confetti burst using CSS animation
    const el = confettiRef.current;
    if (el) {
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const total = (parseFloat(booking.amount || 0) + parseFloat(booking.securityDeposit || 0)).toFixed(2);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: '520px', margin: '0 auto', textAlign: 'center', paddingTop: '16px' }}>

      {/* Success animation */}
      <div ref={confettiRef} style={{ marginBottom: '28px' }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%', margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #10b981, #34d399)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '44px',
          boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
          animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          🎉
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1c1c1c', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: '#686b78', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
          Your rental request has been placed successfully. The vendor will confirm shortly.
        </p>
      </div>

      {/* Booking ID card */}
      <div style={{
        background: 'linear-gradient(135deg, #1c1c1c, #2d2d2d)',
        borderRadius: '20px', padding: '24px 28px',
        marginBottom: '20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(252,128,25,0.1)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
          Booking ID
        </p>
        <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fc8019', margin: '0 0 20px', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
          #{booking.id}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left' }}>
          {[
            { label: 'Service',    value: booking.serviceTitle || service?.title },
            { label: 'Vendor',     value: booking.vendorName },
            { label: 'Fulfillment', value: booking.fulfillmentModel === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup' },
            { label: 'Status',     value: '⏳ Pending Confirmation' },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>
                {item.label}
              </p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment locked card */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '20px 24px',
        border: '1px solid #f0f0f0', marginBottom: '20px', textAlign: 'left',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>💳 Payment</h3>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: '999px' }}>
            🔒 In Escrow
          </span>
        </div>
        {[
          { label: `Rental (qty: ${booking.quantity || 1})`, value: `₹${parseFloat(booking.amount).toFixed(2)}` },
          parseFloat(booking.securityDeposit || 0) > 0 && {
            label: 'Security Deposit (Refundable)',
            value: `₹${parseFloat(booking.securityDeposit).toFixed(2)}`,
          },
        ].filter(Boolean).map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#686b78' }}>{row.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1c1c1c' }}>{row.value}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
          <span style={{ fontWeight: 700, color: '#1c1c1c' }}>Total Locked</span>
          <span style={{ fontSize: '18px', fontWeight: 900, color: '#fc8019', letterSpacing: '-0.02em' }}>₹{total}</span>
        </div>
      </div>

      {/* What's next */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0', marginBottom: '24px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 16px' }}>What happens next?</h3>
        {[
          { emoji: '1️⃣', title: 'Vendor confirms',    desc: 'The vendor will review and accept your booking.' },
          { emoji: '2️⃣', title: 'Share Start Code',   desc: 'You\'ll receive a 6-digit code. Share it with the vendor to begin.' },
          { emoji: '3️⃣', title: 'Service in progress', desc: 'Rental runs. Funds stay locked in escrow.' },
          { emoji: '4️⃣', title: 'Vendor ends service', desc: 'Vendor shares End Code. Enter it to release deposit refund.' },
        ].map(step => (
          <div key={step.title} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>{step.emoji}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#1c1c1c', margin: '0 0 2px' }}>{step.title}</p>
              <p style={{ fontSize: '12px', color: '#686b78', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <button
          onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
          style={{
            width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
            background: '#fc8019', color: '#fff', fontWeight: 800, fontSize: '15px',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(252,128,25,0.35)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          View Booking Details →
        </button>
        <button
          onClick={() => navigate('/dashboard/services')}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            border: '1.5px solid #e8e8e8', background: '#fff',
            color: '#686b78', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
          }}
        >
          Browse More Services
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
