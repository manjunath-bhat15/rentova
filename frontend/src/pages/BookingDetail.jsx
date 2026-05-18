import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const statusFlow = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

const statusActions = {
  VENDOR: {
    PENDING: { label: 'Confirm Booking', nextStatus: 'CONFIRMED', style: 'btn-primary' },
    CONFIRMED: { label: 'Start Service', nextStatus: 'IN_PROGRESS', style: 'btn-primary' },
    IN_PROGRESS: { label: 'Mark Complete', nextStatus: 'COMPLETED', style: 'btn-primary' },
  },
  CUSTOMER: {
    PENDING: null, // customer can cancel
  },
};

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/bookings/${id}`);
      setBooking(res.data);
    } catch (err) {
      console.error('Failed to load booking', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', padding: '80px' }}>
        <h2>Booking not found</h2>
        <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => navigate('/dashboard/bookings')}>
          Back to Bookings
        </button>
      </div>
    );
  }

  const isVendor = user?.id === booking.vendorId;
  const isCustomer = user?.id === booking.customerId;
  const roleKey = isVendor ? 'VENDOR' : 'CUSTOMER';
  const action = statusActions[roleKey]?.[booking.status];
  const canCancel = (isCustomer && booking.status === 'PENDING') ||
                    (isVendor && (booking.status === 'PENDING' || booking.status === 'CONFIRMED'));

  const currentStep = statusFlow.indexOf(booking.status);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      {/* Back + Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard/bookings')}>← Back</button>
        <StatusBadge status={booking.status} />
      </div>

      {/* Main Info Card */}
      <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
          {booking.serviceTitle}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
          <div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Customer</p>
            <p style={{ fontWeight: 600 }}>{booking.customerName}</p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Vendor</p>
            <p style={{ fontWeight: 600 }}>{booking.vendorName}</p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Amount</p>
            <p style={{ fontWeight: 800, fontSize: 'var(--font-lg)', color: 'var(--accent-secondary)' }}>
              ${booking.amount}
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>
                × {booking.quantity}
              </span>
            </p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Created</p>
            <p style={{ fontWeight: 500 }}>
              {new Date(booking.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {booking.scheduledAt && (
          <div style={{
            marginTop: 'var(--space-lg)', padding: 'var(--space-md)',
            background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>📅</span>
            <div>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Scheduled for</p>
              <p style={{ fontWeight: 600 }}>
                {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )}

        {booking.notes && (
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '6px' }}>Notes</p>
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{booking.notes}"
            </p>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
          Status Timeline
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', position: 'relative' }}>
          {statusFlow.map((step, i) => {
            const isActive = i <= currentStep && booking.status !== 'CANCELLED';
            const isCurrent = step === booking.status;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < statusFlow.length - 1 ? 1 : 'none' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 700, flexShrink: 0,
                  background: isActive ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  boxShadow: isCurrent ? 'var(--glow-primary)' : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {isActive && i < currentStep ? '✓' : i + 1}
                </div>
                {i < statusFlow.length - 1 && (
                  <div style={{
                    flex: 1, height: 3, margin: '0 6px',
                    background: i < currentStep && booking.status !== 'CANCELLED'
                      ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                  }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          {statusFlow.map((step) => (
            <span key={step} style={{
              fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center',
              width: step === 'IN_PROGRESS' ? '80px' : '64px',
            }}>
              {step.replace('_', ' ')}
            </span>
          ))}
        </div>

        {booking.status === 'CANCELLED' && (
          <div style={{
            marginTop: 'var(--space-md)', padding: 'var(--space-md)',
            background: 'rgba(255, 107, 107, 0.08)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            color: 'var(--accent-danger)', fontSize: 'var(--font-sm)',
          }}>
            ❌ This booking has been cancelled.
          </div>
        )}
      </div>

      {/* Actions */}
      {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
        <div className="glass-card" style={{
          padding: 'var(--space-xl)', display: 'flex', gap: 'var(--space-md)',
          justifyContent: 'flex-end',
        }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard/chat')}
            style={{ marginRight: 'auto' }}
          >
            💬 Message
          </button>
          {canCancel && (
            <button
              className="btn btn-danger"
              disabled={actionLoading}
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this booking?')) {
                  updateStatus('CANCELLED');
                }
              }}
            >
              Cancel Booking
            </button>
          )}
          {action && (
            <button
              className={`btn ${action.style}`}
              disabled={actionLoading}
              onClick={() => updateStatus(action.nextStatus)}
            >
              {actionLoading ? 'Updating...' : action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
