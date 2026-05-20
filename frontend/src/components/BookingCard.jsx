import { useNavigate } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import StatusBadge from './StatusBadge';

const statusConfig = {
  PENDING:     { color: '#fc8019', bg: 'rgba(252,128,25,0.08)', label: 'Pending' },
  CONFIRMED:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', label: 'Confirmed' },
  IN_PROGRESS: { color: '#00bcd4', bg: 'rgba(0,188,212,0.08)', label: 'In Progress' },
  COMPLETED:   { color: '#10b981', bg: 'rgba(16,185,129,0.08)', label: 'Completed' },
  CANCELLED:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: 'Cancelled' },
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
      style={{
        background: 'var(--glass-bg)',
        borderRadius: '20px',
        padding: '20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="glass-card"
      onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Accent left border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px',
        background: cfg.color, borderRadius: '20px 0 0 20px',
      }} />

      {/* Top row — status + date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            background: cfg.bg,
            color: cfg.color,
          }}>
            {cfg.label}
          </span>
          {booking.fulfillmentModel && (
            <span style={{
              fontSize: '11px',
              background: booking.fulfillmentModel === 'DELIVERY' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
              color: booking.fulfillmentModel === 'DELIVERY' ? '#10b981' : '#3b82f6',
              padding: '3px 8px',
              borderRadius: '999px',
              fontWeight: 600,
            }}>
              {booking.fulfillmentModel === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}
            </span>
          )}
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
          {new Date(booking.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Service title + other party */}
      <div style={{ paddingLeft: '8px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 4px',
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
        }}>
          {booking.serviceTitle}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '8px', fontWeight: 800, color: 'white', flexShrink: 0,
          }}>
            {otherParty.name?.[0]?.toUpperCase()}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {otherParty.label}: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{otherParty.name}</span>
          </span>
        </div>
      </div>

      {/* Schedule badge */}
      {booking.scheduledAt && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', color: 'var(--text-secondary)',
          padding: '8px 12px',
          background: 'var(--bg-secondary)',
          borderRadius: '10px',
          marginLeft: '8px',
        }}>
          <span>📅</span>
          {new Date(booking.scheduledAt).toLocaleDateString('en-IN', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}

      {/* Bottom — Price + CTA */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: '12px', paddingLeft: '8px',
        borderTop: '1px solid var(--glass-border)',
        marginTop: 'auto',
      }}>
        <div>
          <div style={{
            fontSize: '18px', fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            ₹{total}
          </div>
          {parseFloat(depositAmt) > 0 && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              incl. ₹{depositAmt} deposit
            </div>
          )}
        </div>
        <span style={{
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--accent-primary)',
          background: 'rgba(252,128,25,0.08)',
          border: '1px solid rgba(252,128,25,0.15)',
        }}>
          {t('details')} →
        </span>
      </div>
    </div>
  );
}
