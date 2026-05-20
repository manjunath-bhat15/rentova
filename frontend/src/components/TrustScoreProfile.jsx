import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function TrustScoreProfile() {
  const { user, updateUser } = useAuth();
  
  // States
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  const [govtIdNumber, setGovtIdNumber] = useState('');
  const [govtIdUrl, setGovtIdUrl] = useState('');
  
  const [gstNumber, setGstNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Get Trust Tier
  const getTrustTier = (score) => {
    if (score >= 90) return { name: 'Platinum', color: '#a29bfe', bg: 'rgba(162, 155, 254, 0.15)' };
    if (score >= 60) return { name: 'Gold', color: '#fdcb6e', bg: 'rgba(253, 203, 110, 0.15)' };
    if (score >= 30) return { name: 'Silver', color: '#dfe6e9', bg: 'rgba(223, 230, 233, 0.15)' };
    return { name: 'Bronze', color: '#e17055', bg: 'rgba(225, 112, 85, 0.15)' };
  };

  const tier = getTrustTier(user?.trustScore || 10);

  // Handlers
  const handleRequestPhoneOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/api/auth/request-phone-verify', { phoneNumber });
      setIsOtpSent(true);
      setMessage({ type: 'success', text: 'Verification code sent to your registered email address!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send verification code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (!phoneOtp) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/api/auth/verify-phone', { otp: phoneOtp });
      updateUser(res.data);
      setMessage({ type: 'success', text: 'Phone number verified successfully!' });
      setIsOtpSent(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Invalid verification code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGovtId = async (e) => {
    e.preventDefault();
    if (!govtIdNumber) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/api/auth/verify-id', { idNumber: govtIdNumber, idUrl: govtIdUrl || 'https://placehold.co/600x400/png?text=Verified+ID+Document' });
      updateUser(res.data);
      setMessage({ type: 'success', text: 'Aadhaar/PAN submitted successfully for admin review!' });
      setGovtIdNumber('');
      setGovtIdUrl('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit document.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGst = async (e) => {
    e.preventDefault();
    if (!gstNumber) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/api/auth/verify-gst', { gstNumber });
      updateUser(res.data);
      setMessage({ type: 'success', text: 'GST details submitted successfully for admin review!' });
      setGstNumber('');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit GST details.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Trust Score Header Card */}
      <div className="glass-card" style={{ padding: 'var(--space-xl)', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform Trust Rating</h3>
            <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {user?.trustScore || 10} <span style={{ fontSize: 'var(--font-md)', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>
          <div style={{
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: tier.bg,
            color: tier.color,
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            border: `1px solid ${tier.color}30`
          }}>
            {tier.name} Tier
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 'var(--space-md)' }}>
          <div style={{
            width: `${user?.trustScore || 10}%`,
            height: '100%',
            background: `linear-gradient(90deg, var(--accent-primary), ${tier.color})`,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>

        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
          Increase your Trust Score by completing verifications. High Trust Scores unlock lower security deposits, higher listing limits, and premium seller badges.
        </p>
      </div>

      {message.text && (
        <div style={{
          padding: 'var(--space-md)',
          borderRadius: 'var(--radius-md)',
          background: message.type === 'success' ? 'rgba(0, 184, 148, 0.1)' : 'rgba(255, 107, 107, 0.1)',
          color: message.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)',
          border: `1px solid ${message.type === 'success' ? 'var(--accent-success)20' : 'var(--accent-danger)20'}`,
          fontSize: 'var(--font-sm)'
        }}>
          {message.text}
        </div>
      )}

      {/* Verification Action Stack */}
      <div className="glass-card" style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-sm)' }}>
          Verification Status
        </h3>

        {/* 1. Email Verification */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'rgba(0, 184, 148, 0.15)', color: 'var(--accent-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Email Verification (+10 pts)</div>
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
        </div>

        {/* 2. Phone Verification */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-lg)' }}>
          {user?.phoneVerified ? (
            <>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'rgba(0, 184, 148, 0.15)', color: 'var(--accent-success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                ✓
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Phone Number Linked (+10 pts)</div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>{user?.phoneNumber}</div>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'rgba(255, 122, 0, 0.1)', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'var(--font-sm)'
              }}>
                !
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
                  Phone Number Verification (+10 pts)
                </div>
                
                {!isOtpSent ? (
                  <form onSubmit={handleRequestPhoneOtp} style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="e.g. +91 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      style={{ maxWidth: '240px' }}
                    />
                    <button type="submit" className="btn btn-secondary" disabled={loading} style={{ padding: '0 var(--space-md)', fontSize: 'var(--font-sm)' }}>
                      Send OTP
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhone} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                      Enter the 6-digit OTP code sent to your registered email:
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter 6-digit OTP"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        required
                        maxLength={6}
                        style={{ maxWidth: '160px' }}
                      />
                      <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0 var(--space-md)', fontSize: 'var(--font-sm)' }}>
                        Verify OTP
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsOtpSent(false)} style={{ padding: '0 var(--space-md)', fontSize: 'var(--font-sm)' }}>
                        Back
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        {/* 3. Govt ID Verification */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-lg)' }}>
          {user?.govtIdVerified ? (
            <>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'rgba(0, 184, 148, 0.15)', color: 'var(--accent-success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                ✓
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Government ID Verified (+40 pts)</div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  ID Number: {user?.govtIdNumber?.replace(/.(?=.{4})/g, '*')}
                </div>
              </div>
            </>
          ) : user?.govtIdNumber ? (
            <>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'rgba(253, 203, 110, 0.15)', color: 'var(--accent-warning)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'var(--font-sm)'
              }}>
                ⟳
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Government ID - Review Pending</div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  Aadhaar/PAN ({user?.govtIdNumber?.replace(/.(?=.{4})/g, '*')}) is being reviewed by Rentova moderators.
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'rgba(255, 122, 0, 0.1)', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'var(--font-sm)'
              }}>
                !
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
                  Aadhaar / PAN Card ID Verification (+40 pts)
                </div>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                  Enter your Government ID details and document link to activate complete booking permissions.
                </p>

                <form onSubmit={handleSubmitGovtId} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxWidth: '400px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Document Number (e.g. 12-digit Aadhaar)"
                    value={govtIdNumber}
                    onChange={(e) => setGovtIdNumber(e.target.value)}
                    required
                  />
                  <input
                    type="url"
                    className="input-field"
                    placeholder="ID Copy Image URL (optional)"
                    value={govtIdUrl}
                    onChange={(e) => setGovtIdUrl(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary" disabled={loading} style={{ alignSelf: 'flex-start', fontSize: 'var(--font-sm)' }}>
                    Submit for Verification
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* 4. GSTIN Verification (Only for Vendors) */}
        {user?.role === 'VENDOR' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', borderTop: '1px solid var(--glass-border)', paddingTop: 'var(--space-lg)' }}>
            {user?.gstVerified ? (
              <>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'rgba(0, 184, 148, 0.15)', color: 'var(--accent-success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>GST Business Tax ID Verified (+20 pts)</div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>GSTIN: {user?.gstNumber}</div>
                </div>
              </>
            ) : user?.gstNumber ? (
              <>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'rgba(253, 203, 110, 0.15)', color: 'var(--accent-warning)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'var(--font-sm)'
                }}>
                  ⟳
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>GST Verification - Review Pending</div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                    GSTIN ({user?.gstNumber}) is currently being reviewed by administrators.
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: 'rgba(255, 122, 0, 0.1)', color: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'var(--font-sm)'
                }}>
                  !
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
                    GSTIN Business Verification (+20 pts)
                  </div>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                    Verify your business tax identification number to unlock zero transaction limit holds.
                  </p>

                  <form onSubmit={handleSubmitGst} style={{ display: 'flex', gap: 'var(--space-sm)', maxWidth: '400px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 22AAAAA1111A1Z1"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-secondary" disabled={loading} style={{ padding: '0 var(--space-md)', fontSize: 'var(--font-sm)', whiteSpace: 'nowrap' }}>
                      Submit GST
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
