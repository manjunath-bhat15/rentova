import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function BookingCard({ booking, userRole }) {
  const navigate = useNavigate();

  const otherParty = userRole === 'CUSTOMER'
    ? { label: 'Vendor', name: booking.vendorName }
    : { label: 'Customer', name: booking.customerName };

  return (
    <div
      className="bento-card"
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <StatusBadge status={booking.status} />
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
          {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Service title */}
      <div>
        <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: '4px' }}>
          {booking.serviceTitle}
        </h3>
        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
          {otherParty.label}: <span style={{ color: 'var(--text-secondary)' }}>{otherParty.name}</span>
        </p>
      </div>

      {/* Schedule */}
      {booking.scheduledAt && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: 'var(--font-xs)', color: 'var(--text-secondary)',
          padding: '8px 12px', background: 'var(--glass-bg)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <span>📅</span>
          {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}

      {/* Notes */}
      {booking.notes && (
        <p style={{
          fontSize: 'var(--font-xs)', color: 'var(--text-muted)',
          fontStyle: 'italic',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          "{booking.notes}"
        </p>
      )}

      {/* Bottom */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 'auto', paddingTop: 'var(--space-sm)',
        borderTop: '1px solid var(--glass-border)',
      }}>
        <div>
          <span style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--accent-secondary)' }}>
            ₹{booking.amount}
          </span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginLeft: '4px' }}>
            × {booking.quantity}
          </span>
        </div>
        <span
          className="btn btn-ghost btn-sm"
          style={{ fontSize: 'var(--font-xs)' }}
        >
          Details →
        </span>
      </div>
    </div>
  );
}
