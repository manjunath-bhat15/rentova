import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Icon } from '../components/Icon';
import api from '../services/api';

const typeConfig = {
  TOP_UP: { labelKey: 'topUp', iconName: 'TOP_UP', color: 'var(--accent-success)', sign: '+' },
  BOOKING_PAYMENT: { labelKey: 'bookingPayment', iconName: 'BOOKING_PAYMENT', color: 'var(--accent-danger)', sign: '' },
  BOOKING_PAYOUT: { labelKey: 'bookingPayout', iconName: 'BOOKING_PAYOUT', color: 'var(--accent-success)', sign: '+' },
  REFUND: { labelKey: 'refund', iconName: 'REFUND', color: 'var(--accent-warning)', sign: '+' },
  TRANSFER: { labelKey: 'transfer', iconName: 'TRANSFER', color: 'var(--accent-primary)', sign: '' },
};

export default function WalletPage() {
  const { user } = useAuth();
  const { t, lang } = useThemeLanguage();
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

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount < 1) {
      setError(t('minTopUp'));
      return;
    }
    setError('');
    setTopUpLoading(true);
    try {
      const res = await api.post('/api/wallet/topup', { amount });
      setWallet(res.data);
      setTopUpAmount('');
      setShowTopUp(false);
    } catch (err) {
      setError(t('topUpFailed'));
    } finally {
      setTopUpLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const getTxnLabel = (type) => {
    if (lang === 'kn') {
      if (type === 'TOP_UP') return 'ಹಣ ಸೇರ್ಪಡೆ';
      if (type === 'BOOKING_PAYMENT') return 'ಬುಕಿಂಗ್ ಪಾವತಿ';
      if (type === 'BOOKING_PAYOUT') return 'ಬುಕಿಂಗ್ ಜಮೆ';
      if (type === 'REFUND') return 'ಮರುಪಾವತಿ';
      if (type === 'TRANSFER') return 'ವರ್ಗಾವಣೆ';
    }
    const config = typeConfig[type];
    return config ? (config.labelKey === 'topUp' ? t('topUp') : type.replace('_', ' ')) : type;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const transactions = wallet?.recentTransactions || [];

  return (
    <div className="animate-fade-in">
      {/* Balance Card */}
      <div
        className="glass-card"
        style={{
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-xl)',
          background: 'linear-gradient(135deg, rgba(255,122,0,0.08), rgba(0,206,201,0.06)), var(--glass-bg)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,122,0,0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, right: 80, width: 100, height: 100,
          borderRadius: '50%', background: 'rgba(0,206,201,0.05)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
            {t('availableBalance')}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: 'var(--space-lg)' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>₹</span>
            <span style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800,
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
            }}>
              {wallet?.balance?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <button className="btn btn-primary" onClick={() => setShowTopUp(true)}>
              💳 {t('topUp')}
            </button>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div
          className="scrollable-modal-overlay"
          onClick={() => setShowTopUp(false)}
        >
          <div
            className="scrollable-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>
                  💳 {t('topUp')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginTop: '4px' }}>
                  {t('addFunds')}
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowTopUp(false); setError(''); }}
                style={{ borderRadius: '999px', fontSize: '18px', padding: '6px 12px' }}
              >
                ✕
              </button>
            </div>

            {error && <div className="error-message" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

            {/* Quick Amounts */}
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>Quick Select</p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-sm)', marginBottom: 'var(--space-md)',
            }}>
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(String(amt))}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: parseFloat(topUpAmount) === amt ? '2px solid var(--accent-primary)' : '1.5px solid var(--glass-border)',
                    background: parseFloat(topUpAmount) === amt ? 'rgba(252,128,25,0.08)' : 'var(--glass-bg)',
                    color: parseFloat(topUpAmount) === amt ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontWeight: parseFloat(topUpAmount) === amt ? 700 : 500,
                    fontSize: 'var(--font-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
              <label>{t('quickAmount')}</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', fontWeight: 600,
                }}>₹</span>
                <input
                  type="number"
                  className="input-field"
                  style={{ paddingLeft: '30px', borderRadius: '12px' }}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button className="btn btn-secondary" style={{ flex: 1, borderRadius: '12px' }} onClick={() => { setShowTopUp(false); setError(''); }}>
                {t('dismiss')}
              </button>
              <button className="btn btn-primary" style={{ flex: 2, borderRadius: '12px' }} disabled={topUpLoading} onClick={handleTopUp}>
                {topUpLoading ? t('loading') : `Add ₹${topUpAmount || '0'} to Wallet`}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Transaction History */}
      <div>
        <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
          {t('recentTransactions')}
        </h2>

        {transactions.length === 0 ? (
          <div className="glass-card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
            <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: '8px' }}>{t('noTransactions')}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('custEmptyDesc')}
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {transactions.map((txn, i) => {
              const config = typeConfig[txn.type] || { iconName: 'wallet', color: 'var(--text-secondary)' };
              const isPositive = parseFloat(txn.amount) > 0;

              return (
                <div
                  key={txn.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md) var(--space-lg)',
                    borderBottom: i < transactions.length - 1 ? '1px solid var(--glass-border)' : 'none',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: config.color + '15',
                      color: config.color,
                      flexShrink: 0,
                    }}>
                      <Icon name={config.iconName} style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{getTxnLabel(txn.type)}</p>
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                        {txn.counterpartyName
                          ? `${txn.type === 'BOOKING_PAYMENT' ? (lang === 'kn' ? 'ಗೆ' : 'To') : (lang === 'kn' ? 'ಇಂದ' : 'From')}: ${txn.counterpartyName}`
                          : txn.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 700, fontSize: 'var(--font-sm)',
                      color: isPositive ? 'var(--accent-success)' : 'var(--accent-danger)',
                    }}>
                      {isPositive ? '+' : ''}₹{Math.abs(parseFloat(txn.amount)).toFixed(2)}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Bal: ₹{parseFloat(txn.balanceAfter).toFixed(2)}
                    </p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {new Date(txn.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
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
