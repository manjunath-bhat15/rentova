import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MapPanel, { mapsDirectionsUrl } from '../components/MapPanel';
import api from '../services/api';
import toast from 'react-hot-toast';

const statusFlow = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

const statusConfig = {
  PENDING:     { colorClass: 'text-amber-500', bgClass: 'bg-amber-50', borderClass: 'border-amber-200',  emoji: '⏳', label: 'Pending' },
  CONFIRMED:   { colorClass: 'text-blue-500', bgClass: 'bg-blue-50', borderClass: 'border-blue-200',  emoji: '✅', label: 'Confirmed' },
  IN_PROGRESS: { colorClass: 'text-purple-500', bgClass: 'bg-purple-50', borderClass: 'border-purple-200',  emoji: '🔄', label: 'In Progress' },
  COMPLETED:   { colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200',  emoji: '🎉', label: 'Completed' },
  CANCELLED:   { colorClass: 'text-red-500', bgClass: 'bg-red-50', borderClass: 'border-red-200',   emoji: '❌', label: 'Cancelled' },
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
    <div className="flex gap-2 justify-center flex-wrap sm:flex-nowrap">
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
          className={`w-11 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-black border-2 rounded-xl outline-none font-mono transition-all duration-150 focus:border-brand focus:ring-4 focus:ring-brand/15 ${
            d ? 'border-brand bg-brand/5 text-gray-900' : 'border-gray-200 bg-gray-50 text-gray-900'
          }`}
        />
      ))}
    </div>
  );
}

/* ── OTP Display Card (for the party that HAS the code) ── */
function OtpDisplay({ code, label, hint, colorTheme = 'brand' }) {
  const [copied, setCopied] = useState(false);
  const digits = String(code || '------').split('');

  const themeClasses = colorTheme === 'brand' 
    ? { text: 'text-brand', bg: 'bg-brand/10', border: 'border-brand', btnBg: 'bg-brand', hover: 'hover:bg-brand-dark' }
    : { text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-500', btnBg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' };

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`bg-white rounded-2xl p-5 md:p-6 text-center shadow-sm border ${colorTheme === 'brand' ? 'border-brand/20 shadow-brand/10' : 'border-emerald-500/20 shadow-emerald-500/10'} mb-4`}>
      <div className={`w-12 h-12 rounded-xl ${themeClasses.bg} mx-auto mb-3 flex items-center justify-center text-2xl`}>
        🔑
      </div>
      <h3 className="text-[15px] font-extrabold text-gray-900 m-0 mb-1 tracking-tight">
        {label}
      </h3>
      <p className="text-[13px] text-gray-500 mb-5 leading-relaxed max-w-sm mx-auto">{hint}</p>

      {/* Digit boxes */}
      <div className="flex gap-2 justify-center mb-5 flex-wrap sm:flex-nowrap">
        {digits.map((d, i) => (
          <div key={i} className={`w-11 h-12 md:w-12 md:h-14 rounded-xl border-2 ${themeClasses.border} ${themeClasses.bg} flex items-center justify-center text-xl md:text-2xl font-black ${themeClasses.text} font-mono`}>
            {d}
          </div>
        ))}
      </div>

      <button
        onClick={handleCopy}
        className={`px-6 py-2.5 rounded-full border-1.5 ${themeClasses.border} font-bold text-sm cursor-pointer transition-colors focus:outline-none ${
          copied ? `${themeClasses.btnBg} text-white` : `bg-transparent ${themeClasses.text} hover:${themeClasses.bg}`
        }`}
      >
        {copied ? '✓ Copied!' : '📋 Copy Code'}
      </button>
    </div>
  );
}

/* ── OTP Entry Card (for the party that must enter the code) ── */
function OtpEntry({ label, hint, colorTheme = 'brand', onVerify, loading, error }) {
  const [otp, setOtp] = useState('');

  const themeClasses = colorTheme === 'brand' 
    ? { text: 'text-brand', bg: 'bg-brand/10', border: 'border-brand/20', shadow: 'shadow-brand/10', btn: 'bg-brand hover:bg-brand-dark focus:ring-brand/30' }
    : { text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/10', btn: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/30' };


  return (
    <div className={`bg-white rounded-2xl p-5 md:p-6 text-center shadow-sm border ${themeClasses.border} ${themeClasses.shadow} mb-4`}>
      <div className="mb-5">
        <div className={`w-12 h-12 rounded-xl ${themeClasses.bg} mx-auto mb-3 flex items-center justify-center text-2xl`}>
          🏪
        </div>
        <h3 className="text-[15px] font-extrabold text-gray-900 m-0 mb-1 tracking-tight">
          {label}
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed max-w-sm mx-auto m-0">{hint}</p>
      </div>

      <OtpInput value={otp} onChange={setOtp} disabled={loading} />

      {error && (
        <div className="mt-3 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-500 text-[13px] text-center font-medium">
          ❌ {error}
        </div>
      )}

      <button
        onClick={() => onVerify(otp)}
        disabled={loading || otp.replace(/\s/g, '').length < 6}
        className={`w-full mt-5 py-3.5 rounded-xl border-none font-bold text-[15px] transition-all duration-200 focus:outline-none focus:ring-4 ${
          loading || otp.length < 6 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : `${themeClasses.btn} text-white cursor-pointer shadow-md hover:-translate-y-0.5`
        }`}
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
  const [rating, setRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
      loadBooking();
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status. ' + (err.response?.data?.message || ''));
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

  const handleRating = async () => {
    if (rating < 1 || rating > 5) return;
    setRatingLoading(true);
    try {
      await api.post(`/api/bookings/${id}/rate`, { rating });
      toast.success('Rating submitted successfully!');
      setRatingSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col gap-3">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
        <p className="text-gray-400 text-sm m-0">Loading booking...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20 px-5">
        <div className="text-5xl mb-3">📋</div>
        <h2 className="text-lg font-extrabold text-gray-900 m-0 mb-2">Booking not found</h2>
        <button
          onClick={() => navigate('/dashboard/bookings')}
          className="mt-2 px-6 py-3 rounded-xl border-1.5 border-gray-200 bg-white text-gray-900 font-semibold cursor-pointer text-sm hover:bg-gray-50 transition-colors focus:outline-none"
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
    <div className="max-w-3xl mx-auto w-full animate-in fade-in duration-300 pb-10">

      {/* Back + status row */}
      <div className="flex justify-between items-center mb-5 gap-4 flex-wrap">
        <button
          onClick={() => navigate('/dashboard/bookings')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border-1.5 border-gray-200 bg-white text-gray-600 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none shrink-0"
        >
          ← Bookings
        </button>
        <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 border ${cfg.bgClass} ${cfg.colorClass} ${cfg.borderClass}`}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* Main info card */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm mb-4">
        <h1 className="text-[1.3rem] font-black text-gray-900 m-0 mb-5 tracking-tight truncate">
          {booking.serviceTitle}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Customer', value: booking.customerName, emoji: '👤' },
            { label: 'Vendor',   value: booking.vendorName,   emoji: '🏪' },
            { label: 'Fulfillment', value: booking.fulfillmentModel === 'DELIVERY' ? '🚚 Home Delivery' : '🏪 Store Pickup', emoji: null },
            { label: 'Booked on', value: new Date(booking.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }), emoji: '📅' },
          ].map(item => (
            <div key={item.label} className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest m-0 mb-1">
                {item.label}
              </p>
              <p className="text-sm font-bold text-gray-900 m-0 truncate">
                {item.value}
              </p>
            </div>
          ))}

          {/* Pricing */}
          <div className="md:col-span-2 p-4 bg-brand/5 rounded-xl border border-brand/10">
            <p className="text-[11px] font-bold text-brand/60 uppercase tracking-widest m-0 mb-2">
              Payment Breakdown
            </p>
            <div className="flex gap-4 flex-wrap">
              <div>
                <span className="text-[11px] font-medium text-gray-500">Rent{booking.quantity > 1 ? ` × ${booking.quantity}` : ''}</span>
                <p className="text-lg font-black text-gray-900 m-0 mt-0.5 tracking-tight">
                  ₹{parseFloat(booking.amount).toFixed(2)}
                </p>
              </div>
              {parseFloat(booking.securityDeposit || 0) > 0 && (
                <div>
                  <span className="text-[11px] font-medium text-gray-500">Security Deposit (Refundable)</span>
                  <p className="text-lg font-black text-emerald-500 m-0 mt-0.5 tracking-tight">
                    ₹{parseFloat(booking.securityDeposit).toFixed(2)}
                  </p>
                </div>
              )}
              <div className="ml-auto text-right">
                <span className="text-[11px] font-bold text-brand uppercase tracking-wider">Total Locked in Escrow</span>
                <p className="text-[22px] font-black text-brand m-0 mt-0.5 tracking-tight">
                  ₹{(parseFloat(booking.amount) + parseFloat(booking.securityDeposit || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled */}
        {booking.scheduledAt && (
          <div className="mt-4 p-3 bg-blue-50/50 rounded-xl flex items-center gap-3">
            <span className="text-xl shrink-0">📅</span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest m-0 mb-0.5">Scheduled For</p>
              <p className="text-[13px] md:text-sm font-bold text-gray-900 m-0 truncate">
                {new Date(booking.scheduledAt).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}

        {/* Location */}
        {booking.location && (
          <div className="mt-3 p-2.5 bg-emerald-50/50 rounded-xl flex items-center gap-2">
            <span className="shrink-0 text-base">📍</span>
            <p className="text-[13px] font-semibold text-emerald-800 m-0 truncate">{booking.location}</p>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest m-0 mb-1">Notes</p>
            <p className="text-[13px] text-gray-600 italic leading-relaxed m-0 break-words">"{booking.notes}"</p>
          </div>
        )}
      </div>

      {/* Map card */}
      {(booking.serviceLatitude || booking.latitude) && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-extrabold text-gray-900 m-0">📍 Service Location</h3>
            {booking.serviceLatitude && (
              <a
                href={mapsDirectionsUrl(booking.latitude, booking.longitude, booking.serviceLatitude, booking.serviceLongitude)}
                target="_blank" rel="noreferrer"
                className="px-4 py-2 rounded-full border-1.5 border-gray-200 bg-white text-gray-900 text-xs font-bold no-underline hover:bg-gray-50 transition-colors"
              >
                🗺 Directions
              </a>
            )}
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <MapPanel
              latitude={booking.serviceLatitude || booking.latitude}
              longitude={booking.serviceLongitude || booking.longitude}
              label={booking.serviceLocation || booking.serviceTitle}
              height={220}
            />
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm mb-4">
        <h3 className="text-[15px] font-extrabold text-gray-900 m-0 mb-5 tracking-tight">
          Journey
        </h3>
        <div className="flex items-center">
          {statusFlow.map((step, i) => {
            const isActive = i <= currentStep && booking.status !== 'CANCELLED';
            const isCurrent = step === booking.status;
            return (
              <div key={step} className={`flex items-center ${i < statusFlow.length - 1 ? 'flex-1' : 'flex-none'}`}>
                <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[13px] font-black transition-all duration-300 ${
                  isActive ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-brand/20' : ''}`}>
                  {isActive && i < currentStep ? '✓' : i + 1}
                </div>
                {i < statusFlow.length - 1 && (
                  <div className={`flex-1 h-1 mx-1.5 rounded-full transition-colors duration-300 ${
                    i < currentStep && booking.status !== 'CANCELLED' ? 'bg-brand' : 'bg-gray-100'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-3 px-1">
          {statusFlow.map(step => (
            <span key={step} className={`text-[10px] text-center flex-1 uppercase tracking-wider ${
              step === booking.status ? 'text-brand font-bold' : 'text-gray-400 font-medium'
            }`}>
              {step.replace('_', ' ')}
            </span>
          ))}
        </div>
        {booking.status === 'CANCELLED' && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 text-red-500 text-[13px] font-semibold text-center">
            ❌ This booking has been cancelled.
          </div>
        )}
      </div>

      {/* ── OTP: Confirmed → Start service ── */}
      {booking.status === 'CONFIRMED' && (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          {isCustomer && (
            <OtpDisplay
              code={booking.startOtp}
              label="Your Start Code"
              hint="Share this 6-digit code with the vendor to begin the service and authorize the rental payment."
              colorTheme="brand"
            />
          )}
          {isVendor && (
            <OtpEntry
              label="Enter Start Code from Customer"
              hint="Ask the customer for their 6-digit Start Code. Entering it will begin the service and lock the rental amount."
              colorTheme="brand"
              onVerify={handleStartService}
              loading={actionLoading}
              error={otpError}
            />
          )}
        </div>
      )}

      {/* ── OTP: In Progress → End service ── */}
      {booking.status === 'IN_PROGRESS' && (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          {isVendor && (
            <OtpDisplay
              code={booking.endOtp}
              label="Your End Code"
              hint="Share this 6-digit code with the customer once they return the item to complete the service and release their deposit."
              colorTheme="emerald"
            />
          )}
          {isCustomer && (
            <OtpEntry
              label="Enter End Code from Vendor"
              hint="Ask the vendor for their 6-digit End Code once you've returned the item. This will release your security deposit refund."
              colorTheme="emerald"
              onVerify={handleEndService}
              loading={actionLoading}
              error={otpError}
            />
          )}
        </div>
      )}

      {/* 🚀 Actions */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm flex flex-col gap-4 no-print">
          
          {/* Rate Vendor UI for Customer */}
          {!isVendor && booking.status === 'COMPLETED' && !ratingSubmitted && (
            <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm font-bold text-gray-900 mb-2">Rate your experience</p>
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRating}
                disabled={rating === 0 || ratingLoading}
                className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ratingLoading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          )}

          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => window.print()}
              className="flex-1 min-w-[120px] p-3 rounded-xl border-1.5 border-gray-200 bg-white text-gray-900 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-50 focus:outline-none"
            >
              🖨️ Print Bill
            </button>

            <button
              onClick={() => navigate(`/dashboard/chat?bookingId=${booking.id}`)}
              className="flex-1 min-w-[120px] p-3 rounded-xl border-1.5 border-brand bg-brand/5 text-brand font-bold text-sm cursor-pointer flex items-center justify-center gap-2 hover:bg-brand/10 focus:outline-none"
            >
              💬 Chat
            </button>

            {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && canCancel && (
              <button
                onClick={() => { if (window.confirm('Cancel this booking?')) updateStatus('CANCELLED'); }}
                disabled={actionLoading}
                className="flex-1 min-w-[120px] p-3 rounded-xl border-none bg-red-50 text-red-500 font-bold text-sm cursor-pointer hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              >
                Cancel Booking
              </button>
            )}

            {isVendor && booking.status === 'PENDING' && (
              <button
                onClick={() => updateStatus('CONFIRMED')}
                disabled={actionLoading}
                className="flex-[2] min-w-[160px] p-3 rounded-xl border-none bg-brand text-white font-extrabold text-sm cursor-pointer shadow-[0_4px_14px_rgba(252,128,25,0.35)] hover:bg-brand-dark focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? '⏳ Updating...' : '✓ Confirm Booking'}
              </button>
            )}
          </div>
        </div>
    </div>
  );
}
