import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import api from '../services/api';

const typeConfig = {
  TOP_UP:          { emoji: '💰', label: 'Top Up',          colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', sign: '+' },
  BOOKING_PAYMENT: { emoji: '💳', label: 'Booking Payment', colorClass: 'text-red-500', bgClass: 'bg-red-50', sign: '-' },
  BOOKING_PAYOUT:  { emoji: '💸', label: 'Booking Payout',  colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50', sign: '+' },
  REFUND:          { emoji: '↩️', label: 'Refund',           colorClass: 'text-amber-500', bgClass: 'bg-amber-50', sign: '+' },
  TRANSFER:        { emoji: '🔁', label: 'Transfer',         colorClass: 'text-blue-500', bgClass: 'bg-blue-50', sign: '' },
};

const quickAmounts = [10, 25, 50, 100, 250, 500];

export default function WalletPage() {
  const { user } = useAuth();
  const { t } = useThemeLanguage();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [error, setError] = useState('');

  const loadWallet = useCallback(async () => {
    try {
      const res = await api.get('/api/wallet');
      setWallet(res.data);
    } catch (err) {
      console.error('Failed to load wallet', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount < 1) { setError('Minimum top-up amount is ₹1'); return; }
    setError('');
    setTopUpLoading(true);
    try {
      const res = await api.post('/api/wallet/topup', { amount });
      setWallet(res.data);
      setTopUpAmount('');
      setShowTopUp(false);
    } catch {
      setError('Top-up failed. Please try again.');
    } finally {
      setTopUpLoading(false);
    }
  };

  const transactions = wallet?.recentTransactions || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col gap-3">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">

      {/* Balance hero card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand/15 pointer-events-none blur-2xl" />
        <div className="absolute -bottom-8 left-1/4 w-32 h-32 rounded-full bg-white/5 pointer-events-none blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest m-0">
                Rentova Wallet
              </p>
              <p className="text-xs text-white/60 m-0">
                {user?.name}
              </p>
            </div>
          </div>

          <p className="text-[13px] text-white/50 mb-1 m-0">Available Balance</p>
          <div className="flex items-baseline gap-1.5 mb-7">
            <span className="text-base text-white/60 font-medium">₹</span>
            <span className="text-[clamp(2.5rem,6vw,4rem)] font-black text-brand leading-none tracking-tight">
              {wallet?.balance?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <button
              onClick={() => setShowTopUp(true)}
              className="bg-brand hover:bg-brand-dark text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-[0_4px_14px_rgba(252,128,25,0.4)] flex items-center justify-center sm:justify-start gap-2 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none w-full sm:w-auto"
            >
              💳 Add Money
            </button>

            {/* Mini stats */}
            <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
              {[
                { label: 'Earned', val: `₹${(transactions.filter(t => parseFloat(t.amount) > 0).reduce((s, t) => s + parseFloat(t.amount), 0)).toFixed(0)}` },
                { label: 'Spent', val: `₹${Math.abs(transactions.filter(t => parseFloat(t.amount) < 0).reduce((s, t) => s + parseFloat(t.amount), 0)).toFixed(0)}` },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 rounded-xl px-4 py-2.5 text-center flex-1 sm:min-w-[80px]">
                  <div className="text-base font-black text-white">{stat.val}</div>
                  <div className="text-[11px] text-white/50 mt-0.5 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top-Up Modal */}
      {showTopUp && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => { setShowTopUp(false); setError(''); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[20px] p-6 sm:p-7 w-full max-w-[420px] shadow-2xl animate-in slide-in-from-bottom-8 duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900 m-0 mb-1 tracking-tight">
                  💳 Add Money
                </h2>
                <p className="text-[13px] text-gray-500 m-0">
                  Top up your Rentova wallet
                </p>
              </div>
              <button
                onClick={() => { setShowTopUp(false); setError(''); }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors focus:outline-none shrink-0"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold mb-4">
                {error}
              </div>
            )}

            {/* Quick amounts */}
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
              Quick Select
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(String(amt))}
                  className={`py-3 px-2 rounded-xl border-2 text-sm transition-all duration-200 focus:outline-none ${
                    parseFloat(topUpAmount) === amt 
                      ? 'border-brand bg-brand/5 text-brand font-bold' 
                      : 'border-gray-200 bg-gray-50 text-gray-900 font-medium hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="relative mb-5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[15px]">₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                min="1"
                step="1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3.5 rounded-xl border-1.5 border-gray-200 text-[15px] font-semibold text-gray-900 outline-none bg-gray-50 focus:bg-white focus:border-brand transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowTopUp(false); setError(''); }}
                className="flex-1 py-3.5 rounded-xl border-1.5 border-gray-200 bg-white text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                disabled={topUpLoading || !topUpAmount}
                className={`flex-[2] py-3.5 rounded-xl border-none text-white font-bold text-sm transition-all duration-200 focus:outline-none ${
                  topUpLoading || !topUpAmount 
                    ? 'bg-brand-light/70 cursor-not-allowed' 
                    : 'bg-brand shadow-[0_4px_14px_rgba(252,128,25,0.35)] hover:-translate-y-0.5'
                }`}
              >
                {topUpLoading ? '⏳ Processing...' : `Add ₹${topUpAmount || '0'} →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[1.1rem] font-extrabold text-gray-900 m-0 tracking-tight">
            Transaction History
          </h2>
          <span className="text-xs font-medium text-gray-500">{transactions.length} transactions</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-16 px-5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-3">💳</div>
            <h3 className="text-base font-bold text-gray-900 m-0 mb-1.5">No transactions yet</h3>
            <p className="text-[13px] text-gray-500 m-0">Add money or make a booking to see your transaction history.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {transactions.map((txn, i) => {
              const cfg = typeConfig[txn.type] || { emoji: '💱', label: txn.type, colorClass: 'text-gray-500', bgClass: 'bg-gray-50', sign: '' };
              const amount = parseFloat(txn.amount);
              const isPositive = amount > 0;
              return (
                <div
                  key={txn.id}
                  className={`flex items-center gap-3.5 p-4 md:p-5 transition-colors hover:bg-gray-50 ${i < transactions.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-xl ${cfg.bgClass}`}>
                    {cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-gray-900 m-0 mb-0.5 truncate">
                      {cfg.label}
                    </p>
                    <p className="text-xs text-gray-500 m-0 truncate">
                      {txn.counterpartyName
                        ? `${isPositive ? 'From' : 'To'}: ${txn.counterpartyName}`
                        : txn.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-[15px] m-0 mb-0.5 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : '-'}₹{Math.abs(amount).toFixed(2)}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400 m-0">
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
