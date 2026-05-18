import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="logo-icon">R</div>
          <span>Rentova</span>
        </div>
        <div className="landing-nav-links">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <h1 className="animate-slide-up">
          Manage Rentals<br />
          <span className="gradient-text">Smarter & Faster</span>
        </h1>
        <p>
          Rentova is the all-in-one platform for booking management, real-time communication,
          secure transactions, and automated workflows. Built for scale.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg animate-glow">
            Start Free →
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>
      </section>

      <section className="features-grid stagger">
        <div className="glass-card feature-card">
          <div className="feature-icon" style={{ background: 'rgba(108,92,231,0.12)' }}>📋</div>
          <h3>Booking Engine</h3>
          <p>Create, track, and manage bookings with real-time status updates. Complete lifecycle from reservation to completion.</p>
        </div>
        <div className="glass-card feature-card">
          <div className="feature-icon" style={{ background: 'rgba(0,206,201,0.12)' }}>💰</div>
          <h3>Secure Wallet</h3>
          <p>Built-in wallet system with credits, debits, refunds, and full transaction history. Secure internal financial operations.</p>
        </div>
        <div className="glass-card feature-card">
          <div className="feature-icon" style={{ background: 'rgba(253,203,110,0.12)' }}>💬</div>
          <h3>Live Chat</h3>
          <p>Real-time messaging between customers and vendors. Instant communication powered by WebSocket technology.</p>
        </div>
        <div className="glass-card feature-card">
          <div className="feature-icon" style={{ background: 'rgba(255,107,107,0.12)' }}>🔔</div>
          <h3>Smart Notifications</h3>
          <p>Instant alerts for bookings, payments, and messages. Never miss an update with our event-driven notification engine.</p>
        </div>
        <div className="glass-card feature-card">
          <div className="feature-icon" style={{ background: 'rgba(0,184,148,0.12)' }}>⚡</div>
          <h3>Automation</h3>
          <p>Automate confirmations, reminders, cancellations, and status updates. Reduce manual operations significantly.</p>
        </div>
        <div className="glass-card feature-card">
          <div className="feature-icon" style={{ background: 'rgba(162,155,254,0.12)' }}>📊</div>
          <h3>Admin Dashboard</h3>
          <p>Full oversight with analytics, user management, and platform statistics. Monitor your ecosystem in real-time.</p>
        </div>
      </section>
    </div>
  );
}
