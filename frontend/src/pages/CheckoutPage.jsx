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

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in duration-300">
      {/* Back */}
      <button
        onClick={() => step === 2 ? setStep(1) : navigate(-1)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border-1.5 border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors focus:outline-none mb-6 w-fit"
      >
        ← {step === 2 ? 'Edit Details' : 'Back'}
      </button>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Booking Details', 'Review & Pay'].map((label, i) => {
          const active = step === i + 1;
          const done   = step > i + 1;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-brand text-white shadow-sm' : 'bg-gray-100 text-gray-400'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={`text-sm md:text-base ${active ? 'font-bold text-gray-900' : 'font-medium text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i === 0 && <div className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${step > 1 ? 'bg-brand' : 'bg-gray-100'}`} />}
            </div>
          );
        })}
      </div>

      {/* Service summary card (always visible) */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 mb-5 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl shrink-0 bg-brand/10 flex items-center justify-center text-2xl md:text-3xl">
          {service.category === 'Vehicles' ? '🚗' : service.category === 'Electronics' ? '📱' : service.category === 'Tools' ? '🔧' : '📦'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm md:text-base text-gray-900 m-0 mb-0.5 truncate">{service.title}</p>
          <p className="text-xs text-gray-500 m-0 truncate">by {service.vendorName}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-black text-base md:text-lg text-brand m-0 mb-0.5 tracking-tight">
            ₹{service.pricePerUnit}
          </p>
          <p className="text-[11px] text-gray-500 m-0">per {service.unit?.toLowerCase() || 'unit'}</p>
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300">
          {/* Fulfillment Model */}
          {service.allowPickup !== false && service.allowDelivery !== false && (
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
              <p className="text-sm font-bold text-gray-900 m-0 mb-4">How do you want it?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fulfillmentOptions.map(opt => {
                  const isAvailable = opt.value === 'PICKUP' ? service.allowPickup !== false : service.allowDelivery !== false;
                  if (!isAvailable) return null;
                  const selected = form.fulfillmentModel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => set('fulfillmentModel')(opt.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 focus:outline-none ${
                        selected ? 'border-brand bg-brand/5' : 'border-gray-200 bg-gray-50 hover:border-brand/30 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-2xl mb-2">{opt.emoji}</div>
                      <div className={`text-sm font-bold ${selected ? 'text-brand' : 'text-gray-900'}`}>{opt.label}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {form.fulfillmentModel === 'DELIVERY' && (
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm animate-in zoom-in-95 duration-200">
              <p className="text-sm font-bold text-gray-900 m-0 mb-4">🚚 Delivery Address</p>
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
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col gap-5">
            <p className="text-sm font-bold text-gray-900 m-0">Rental Details</p>

            {/* Quantity */}
            <div>
              <label className="text-xs font-bold text-gray-900 block mb-3 uppercase tracking-wider">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => set('quantity')(Math.max(1, form.quantity - 1))}
                  className={`w-10 h-10 rounded-xl border-1.5 flex items-center justify-center text-xl font-bold focus:outline-none transition-colors ${
                    form.quantity <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-900 hover:bg-gray-50 cursor-pointer'
                  }`}
                >−</button>
                <span className="text-[22px] font-black text-gray-900 min-w-[32px] text-center">
                  {form.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => set('quantity')(form.quantity + 1)}
                  className="w-10 h-10 rounded-xl border-1.5 border-brand bg-brand/10 text-brand flex items-center justify-center text-xl font-bold cursor-pointer hover:bg-brand/20 transition-colors focus:outline-none"
                >+</button>
                <span className="text-xs font-medium text-gray-500 ml-2">× ₹{service.pricePerUnit} = ₹{rent.toFixed(2)}</span>
              </div>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="text-xs font-bold text-gray-900 block mb-2 uppercase tracking-wider">
                Preferred Date & Time <span className="text-gray-400 normal-case text-[11px] font-medium ml-1">• Optional</span>
              </label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={set('scheduledAt')}
                className="w-full px-4 py-3 rounded-xl border-1.5 border-gray-200 text-sm font-semibold text-gray-900 outline-none bg-gray-50 focus:bg-white focus:border-brand transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-gray-900 block mb-2 uppercase tracking-wider">
                Special Instructions <span className="text-gray-400 normal-case text-[11px] font-medium ml-1">• Optional</span>
              </label>
              <textarea
                value={form.notes}
                onChange={set('notes')}
                placeholder="Any notes for the vendor..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-1.5 border-gray-200 text-sm font-medium text-gray-900 outline-none bg-gray-50 focus:bg-white focus:border-brand transition-colors resize-y leading-relaxed"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-xl border-none bg-brand text-white font-extrabold text-base cursor-pointer shadow-[0_4px_16px_rgba(252,128,25,0.35)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none mt-2"
          >
            Review Order →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300">
          {/* Order summary */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="text-[15px] font-extrabold text-gray-900 m-0 mb-5 tracking-tight">
              📋 Order Summary
            </h3>

            <div className="flex flex-col">
              {[
                { label: 'Fulfillment',    value: form.fulfillmentModel === 'DELIVERY' ? '🚚 Home Delivery' : '🏪 Store Pickup' },
                form.deliveryAddress && { label: 'Delivery To',  value: `📍 ${form.deliveryAddress}` },
                { label: 'Quantity',       value: `${form.quantity} × ${service.unit?.toLowerCase() || 'unit'}` },
                form.scheduledAt && { label: 'Scheduled',    value: new Date(form.scheduledAt).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                form.notes && { label: 'Notes',         value: form.notes },
              ].filter(Boolean).map((row, idx, arr) => (
                <div key={row.label} className={`flex justify-between gap-3 py-3 ${idx < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className="text-[13px] text-gray-500 shrink-0">{row.label}</span>
                  <span className="text-[13px] font-semibold text-gray-900 text-right">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="mt-5 p-4 md:p-5 bg-gray-50 rounded-xl">
              <div className="flex flex-col gap-2.5 mb-3">
                {[
                  { label: `Rental (₹${service.pricePerUnit} × ${form.quantity})`, value: `₹${rent.toFixed(2)}`, colorClass: 'text-gray-900' },
                  deposit > 0 && { label: 'Security Deposit (Refundable)', value: `₹${deposit.toFixed(2)}`, colorClass: 'text-emerald-500' },
                ].filter(Boolean).map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-[13px] font-medium text-gray-500">{row.label}</span>
                    <span className={`text-[13px] font-bold ${row.colorClass}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3.5 border-t border-gray-200">
                <span className="text-[15px] font-black text-gray-900">Total</span>
                <span className="text-xl font-black text-brand tracking-tight">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Wallet balance */}
          <div className={`rounded-[14px] p-4 md:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 ${
            canAfford 
              ? 'bg-emerald-50/50 border border-emerald-100' 
              : 'bg-red-50/50 border border-red-100'
          }`}>
            <div>
              <p className="text-[11px] font-bold text-gray-500 m-0 mb-1 uppercase tracking-widest">
                💰 Wallet Balance
              </p>
              <p className={`text-xl font-black m-0 tracking-tight ${canAfford ? 'text-emerald-500' : 'text-red-500'}`}>
                ₹{walletBalance?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            {!canAfford && (
              <button
                onClick={() => navigate('/dashboard/wallet')}
                className="px-4 py-2.5 rounded-xl border-none bg-red-500 text-white font-bold text-sm cursor-pointer shadow-sm hover:bg-red-600 transition-colors w-full sm:w-auto focus:outline-none"
              >
                Top Up Wallet →
              </button>
            )}
            {canAfford && (
              <span className="text-[13px] font-bold text-emerald-500 bg-emerald-100 px-3 py-1 rounded-full w-fit">
                ✓ Sufficient
              </span>
            )}
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm font-semibold shadow-sm">
              ❌ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !canAfford}
            className={`w-full p-4 rounded-xl border-none font-black text-[15px] transition-all duration-200 focus:outline-none mt-2 ${
              loading || !canAfford 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-brand text-white cursor-pointer shadow-[0_6px_20px_rgba(252,128,25,0.35)] hover:-translate-y-0.5'
            }`}
          >
            {loading ? '⏳ Placing Order...' : `🔒 Confirm & Pay ₹${total.toFixed(2)}`}
          </button>

          <p className="text-center text-[11px] font-medium text-gray-400 m-0 mt-1">
            🔒 Amount locked in escrow · Released after service completion
          </p>
        </div>
      )}
    </div>
  );
}
