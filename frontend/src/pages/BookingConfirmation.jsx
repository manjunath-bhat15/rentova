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
      el.classList.remove('animate-in', 'zoom-in-50', 'duration-500');
      void el.offsetHeight;
      el.classList.add('animate-in', 'zoom-in-50', 'duration-500');
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const total = (parseFloat(booking.amount || 0) + parseFloat(booking.securityDeposit || 0)).toFixed(2);

  return (
    <div className="max-w-[520px] mx-auto text-center pt-4 md:pt-8 px-4 animate-in fade-in duration-500 pb-10">

      {/* Success animation */}
      <div className="mb-8">
        <div 
          ref={confettiRef}
          className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-[44px] shadow-[0_8px_32px_rgba(16,185,129,0.4)]"
        >
          🎉
        </div>
        <h1 className="text-3xl font-black text-gray-900 m-0 mb-2 tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 text-[15px] m-0 leading-relaxed max-w-sm mx-auto">
          Your rental request has been placed successfully. The vendor will confirm shortly.
        </p>
      </div>

      {/* Booking ID card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 mb-5 relative overflow-hidden text-left shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand/20 blur-2xl pointer-events-none" />
        
        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest m-0 mb-1.5">
          Booking ID
        </p>
        <p className="text-2xl font-black text-brand m-0 mb-6 tracking-wide font-mono">
          #{booking.id}
        </p>
        
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          {[
            { label: 'Service',    value: booking.serviceTitle || service?.title },
            { label: 'Vendor',     value: booking.vendorName },
            { label: 'Fulfillment', value: booking.fulfillmentModel === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup' },
            { label: 'Status',     value: '⏳ Pending Confirmation' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest m-0 mb-1">
                {item.label}
              </p>
              <p className="text-[13px] font-semibold text-white m-0 truncate pr-2">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment locked card */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 mb-5 text-left shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[15px] font-extrabold text-gray-900 m-0">💳 Payment</h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full shadow-sm">
            🔒 In Escrow
          </span>
        </div>
        <div className="flex flex-col gap-2.5 mb-4">
          {[
            { label: `Rental (qty: ${booking.quantity || 1})`, value: `₹${parseFloat(booking.amount).toFixed(2)}` },
            parseFloat(booking.securityDeposit || 0) > 0 && {
              label: 'Security Deposit (Refundable)',
              value: `₹${parseFloat(booking.securityDeposit).toFixed(2)}`,
            },
          ].filter(Boolean).map(row => (
            <div key={row.label} className="flex justify-between items-center">
              <span className="text-[13px] text-gray-500 font-medium">{row.label}</span>
              <span className="text-[13px] font-bold text-gray-900">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="font-extrabold text-[15px] text-gray-900">Total Locked</span>
          <span className="text-xl font-black text-brand tracking-tight">₹{total}</span>
        </div>
      </div>

      {/* What's next */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 mb-6 text-left shadow-sm">
        <h3 className="text-[15px] font-extrabold text-gray-900 m-0 mb-5">What happens next?</h3>
        <div className="flex flex-col gap-4">
          {[
            { emoji: '1️⃣', title: 'Vendor confirms',    desc: 'The vendor will review and accept your booking.' },
            { emoji: '2️⃣', title: 'Share Start Code',   desc: 'You\'ll receive a 6-digit code. Share it with the vendor to begin.' },
            { emoji: '3️⃣', title: 'Service in progress', desc: 'Rental runs. Funds stay locked in escrow.' },
            { emoji: '4️⃣', title: 'Vendor ends service', desc: 'Vendor shares End Code. Enter it to release deposit refund.' },
          ].map((step, idx, arr) => (
            <div key={step.title} className={`flex gap-3.5 items-start ${idx < arr.length - 1 ? 'pb-4 border-b border-gray-50' : ''}`}>
              <span className="text-xl leading-none mt-0.5 shrink-0">{step.emoji}</span>
              <div>
                <p className="font-bold text-[14px] text-gray-900 m-0 mb-1">{step.title}</p>
                <p className="text-[13px] text-gray-500 m-0 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
          className="w-full py-4 rounded-xl border-none bg-brand text-white font-extrabold text-base cursor-pointer shadow-[0_4px_16px_rgba(252,128,25,0.35)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
        >
          View Booking Details →
        </button>
        <button
          onClick={() => navigate('/dashboard/services')}
          className="w-full py-4 rounded-xl border-1.5 border-gray-200 bg-white text-gray-600 font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none"
        >
          Browse More Services
        </button>
      </div>
    </div>
  );
}
