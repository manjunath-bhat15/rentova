import { useNavigate } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const statusConfig = {
  PENDING:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   emoji: '⏳', label: 'Pending' },
  CONFIRMED:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   emoji: '✅', label: 'Confirmed' },
  IN_PROGRESS: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  emoji: '🔄', label: 'In Progress' },
  COMPLETED:   { color: '#10b981', bg: 'rgba(16,185,129,0.1)',   emoji: '🎉', label: 'Completed' },
  CANCELLED:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    emoji: '❌', label: 'Cancelled' },
};

export default function BookingCard({ booking, userRole }) {
  const navigate = useNavigate();
  const { t } = useThemeLanguage();
  const cfg = statusConfig[booking.status] || statusConfig.PENDING;

  const otherParty = userRole === 'CUSTOMER'
    ? { label: t('vendor'), name: booking.vendorName }
    : { label: t('customer'), name: booking.customerName };

  const total = (parseFloat(booking.amount || 0) + parseFloat(booking.securityDeposit || 0)).toFixed(2);
  const depositAmt = parseFloat(booking.securityDeposit || 0).toFixed(0);

  return (
    <div
      onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '18px 20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = 'rgba(252,128,25,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = '#f0f0f0';
      }}
    >
      {/* Accent left stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
        background: cfg.color, borderRadius: '16px 0 0 16px',
      }} />

      {/* Top row — status + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 10px', borderRadius: '999px',
            fontSize: '11px', fontWeight: 700,
            background: cfg.bg, color: cfg.color,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {cfg.emoji} {cfg.label}
          </span>
          {booking.fulfillmentModel && (
            <span style={{
              fontSize: '11px',
              background: booking.fulfillmentModel === 'DELIVERY' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
              color: booking.fulfillmentModel === 'DELIVERY' ? '#10b981' : '#3b82f6',
              padding: '3px 8px', borderRadius: '999px', fontWeight: 600,
            }}>
              {booking.fulfillmentModel === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}
            </span>
          )}
        </div>
        <span style={{ fontSize: '11px', color: '#93959f', flexShrink: 0 }}>
          {new Date(booking.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Service title + party */}
      <div style={{ paddingLeft: '8px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          {booking.serviceTitle}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fc8019, #ff9f43)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>
            {otherParty.name?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: '12px', color: '#93959f' }}>
            {otherParty.label}: <span style={{ color: '#686b78', fontWeight: 600 }}>{otherParty.name}</span>
          </span>
        </div>
      </div>

      {/* Scheduled time */}
      {booking.scheduledAt && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', color: '#686b78',
          padding: '8px 12px',
          background: '#f8f8f8',
          borderRadius: '10px',
          marginLeft: '8px',
        }}>
          <span>📅</span>
          {new Date(booking.scheduledAt).toLocaleDateString('en-IN', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}

      {/* Bottom — price + CTA */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '12px', paddingLeft: '8px',
        borderTop: '1px solid #f5f5f5',
        marginTop: 'auto',
      }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#1c1c1c', letterSpacing: '-0.03em', lineHeight: 1 }}>
            ₹{total}
          </div>
          {parseFloat(depositAmt) > 0 && (
            <div style={{ fontSize: '11px', color: '#93959f', marginTop: '2px' }}>
              incl. ₹{depositAmt} deposit
            </div>
          )}
        </div>
        <span style={{
          padding: '7px 16px', borderRadius: '999px',
          fontSize: '12px', fontWeight: 700,
          color: '#fc8019', background: 'rgba(252,128,25,0.08)',
          border: '1.5px solid rgba(252,128,25,0.2)',
        }}>
          View →
        </span>
      </div>
    </div>
  );
}
