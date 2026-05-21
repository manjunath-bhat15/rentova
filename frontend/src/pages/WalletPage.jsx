import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import api from '../services/api';

const typeConfig = {
  TOP_UP:          { emoji: '💰', label: 'Top Up',          color: '#10b981', sign: '+' },
  BOOKING_PAYMENT: { emoji: '💳', label: 'Booking Payment', color: '#ef4444', sign: '-' },
  BOOKING_PAYOUT:  { emoji: '💸', label: 'Booking Payout',  color: '#10b981', sign: '+' },
  REFUND:          { emoji: '↩️', label: 'Refund',           color: '#f59e0b', sign: '+' },
  TRANSFER:        { emoji: '🔁', label: 'Transfer',         color: '#3b82f6', sign: '' },
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#fc8019', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Balance hero card */}
      <div style={{
        background: 'linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 100%)',
        borderRadius: '20px', padding: '32px',
        marginBottom: '24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(252,128,25,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '20%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                Rentova Wallet
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                {user?.name}
              </p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Available Balance</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '28px' }}>
            <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>₹</span>
            <span style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900,
              color: '#fc8019', lineHeight: 1, letterSpacing: '-0.03em',
            }}>
              {wallet?.balance?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowTopUp(true)}
              style={{
                padding: '12px 24px', borderRadius: '12px', border: 'none',
                background: '#fc8019', color: '#fff',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(252,128,25,0.4)',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              💳 Add Money
            </button>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              {[
                { label: 'Earned', val: `₹${(transactions.filter(t => parseFloat(t.amount) > 0).reduce((s, t) => s + parseFloat(t.amount), 0)).toFixed(0)}` },
                { label: 'Spent', val: `₹${Math.abs(transactions.filter(t => parseFloat(t.amount) < 0).reduce((s, t) => s + parseFloat(t.amount), 0)).toFixed(0)}` },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.08)', borderRadius: '12px',
                  padding: '10px 16px', textAlign: 'center', minWidth: '80px',
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{stat.val}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top-Up Modal */}
      {showTopUp && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
          onClick={() => { setShowTopUp(false); setError(''); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '20px', padding: '28px',
              width: '100%', maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1c1c1c', margin: '0 0 2px', letterSpacing: '-0.03em' }}>
                  💳 Add Money
                </h2>
                <p style={{ fontSize: '13px', color: '#686b78', margin: 0 }}>
                  Top up your Rentova wallet
                </p>
              </div>
              <button
                onClick={() => { setShowTopUp(false); setError(''); }}
                style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Quick amounts */}
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93959f', marginBottom: '10px' }}>
              Quick Select
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(String(amt))}
                  style={{
                    padding: '12px 8px', borderRadius: '12px',
                    border: `2px solid ${parseFloat(topUpAmount) === amt ? '#fc8019' : '#e8e8e8'}`,
                    background: parseFloat(topUpAmount) === amt ? 'rgba(252,128,25,0.08)' : '#fafafa',
                    color: parseFloat(topUpAmount) === amt ? '#fc8019' : '#1c1c1c',
                    fontWeight: parseFloat(topUpAmount) === amt ? 700 : 500,
                    fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#93959f', fontWeight: 700, fontSize: '15px' }}>₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                min="1"
                step="1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                style={{
                  width: '100%', padding: '13px 16px 13px 30px',
                  borderRadius: '12px', border: '1.5px solid #e8e8e8',
                  fontSize: '15px', fontWeight: 600, color: '#1c1c1c',
                  outline: 'none', boxSizing: 'border-box', background: '#fafafa',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#fc8019'; e.target.style.background = '#fff'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e8e8e8'; e.target.style.background = '#fafafa'; }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setShowTopUp(false); setError(''); }}
                style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid #e8e8e8', background: '#fff', color: '#686b78', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                disabled={topUpLoading || !topUpAmount}
                style={{
                  flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
                  background: topUpLoading ? '#ffc895' : '#fc8019',
                  color: '#fff', fontWeight: 700, fontSize: '14px',
                  cursor: topUpLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(252,128,25,0.35)',
                }}
              >
                {topUpLoading ? '⏳ Processing...' : `Add ₹${topUpAmount || '0'} →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1c1c1c', margin: 0, letterSpacing: '-0.02em' }}>
            Transaction History
          </h2>
          <span style={{ fontSize: '12px', color: '#93959f' }}>{transactions.length} transactions</span>
        </div>

        {transactions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#fafafa', borderRadius: '16px',
            border: '2px dashed #e8e8e8',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 6px' }}>No transactions yet</h3>
            <p style={{ color: '#686b78', fontSize: '13px' }}>Add money or make a booking to see your transaction history.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {transactions.map((txn, i) => {
              const cfg = typeConfig[txn.type] || { emoji: '💱', label: txn.type, color: '#686b78', sign: '' };
              const amount = parseFloat(txn.amount);
              const isPositive = amount > 0;
              return (
                <div
                  key={txn.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px',
                    borderBottom: i < transactions.length - 1 ? '1px solid #f5f5f5' : 'none',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                    background: `${cfg.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                  }}>
                    {cfg.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: '#1c1c1c', margin: '0 0 2px' }}>
                      {cfg.label}
                    </p>
                    <p style={{ fontSize: '12px', color: '#93959f', margin: 0 }}>
                      {txn.counterpartyName
                        ? `${isPositive ? 'From' : 'To'}: ${txn.counterpartyName}`
                        : txn.description}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: '15px', color: isPositive ? '#10b981' : '#ef4444', margin: '0 0 2px' }}>
                      {isPositive ? '+' : '-'}₹{Math.abs(amount).toFixed(2)}
                    </p>
                    <p style={{ fontSize: '11px', color: '#93959f', margin: 0 }}>
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
