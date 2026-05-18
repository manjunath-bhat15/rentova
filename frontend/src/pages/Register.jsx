import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card" style={{ transition: 'all 0.3s ease' }}>
        <h1>{step === 1 ? 'Create account' : 'Verify Email'}</h1>
        <p>{step === 1 ? 'Join Rentova and start managing rentals' : `We sent an OTP to ${email}`}</p>

        {error && <div className="error-message">{error}</div>}

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="input-field"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="input-group">
              <label htmlFor="role">I am a</label>
              <select
                id="role"
                className="input-field"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CUSTOMER">Customer — I want to book services</option>
                <option value="VENDOR">Vendor — I offer services</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleOtpSubmit}>
            <div className="input-group">
              <label htmlFor="otp">Enter 6-digit OTP</label>
              <input
                id="otp"
                type="text"
                className="input-field"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                minLength={6}
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
