import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import landingHero from '../assets/landing_hero.png';

/* ── Rental category data ── */
const CATEGORIES = [
  { emoji: '🛵', label: 'Scooters' },
  { emoji: '📷', label: 'Cameras' },
  { emoji: '🚲', label: 'Bicycles' },
  { emoji: '⛺', label: 'Camping' },
  { emoji: '🔧', label: 'Tools' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '💻', label: 'Laptops' },
  { emoji: '🚗', label: 'Vehicles' },
  { emoji: '🪚', label: 'Equipment' },
  { emoji: '🏠', label: 'Spaces' },
  { emoji: '🎸', label: 'Music' },
  { emoji: '📦', label: 'Other' },
];

/* ── Featured services (static showcase) ── */
const FEATURED = [
  {
    emoji: '🛵',
    title: 'Honda Activa 6G',
    vendor: 'SpeedRide Rentals',
    category: 'Vehicles',
    price: 299,
    unit: 'day',
    distance: '1.2 km',
    discount: 'Upto 20% off with wallet',
    rating: 4.8,
    bg: '#fff8f3',
  },
  {
    emoji: '📷',
    title: 'Sony A7III Camera Kit',
    vendor: 'LensHub Pro',
    category: 'Electronics',
    price: 799,
    unit: 'day',
    distance: '2.4 km',
    discount: 'Flat 15% off first booking',
    rating: 4.9,
    bg: '#f0f8ff',
  },
  {
    emoji: '⛺',
    title: 'Camping Tent — 4 Person',
    vendor: 'WildGear Rentals',
    category: 'Camping',
    price: 199,
    unit: 'day',
    distance: '3.1 km',
    discount: 'Upto 10% off',
    rating: 4.6,
    bg: '#f0fff4',
  },
  {
    emoji: '💻',
    title: 'MacBook Pro M3',
    vendor: 'TechLease',
    category: 'Electronics',
    price: 699,
    unit: 'day',
    distance: '0.8 km',
    discount: 'Flat 10% off with coupon',
    rating: 4.7,
    bg: '#fdf0ff',
  },
];

/* ── How it works ── */
const STEPS = [
  { num: '01', icon: '📍', title: 'Enter Your Location', desc: 'Allow location access to see rental items near you in real-time.' },
  { num: '02', icon: '🔍', title: 'Browse & Compare', desc: 'Filter by category, price, distance — find the perfect rental.' },
  { num: '03', icon: '📅', title: 'Book in Seconds', desc: 'Choose pickup or delivery. Pay via Rentova wallet securely.' },
  { num: '04', icon: '✅', title: 'Vendor OTP Handoff', desc: 'Vendor confirms handover with OTP. Full lifecycle tracked.' },
];

/* ── Footer links ── */
const FOOTER_LINKS = {
  Company: ['About Us', 'Careers', 'Blog', 'Press'],
  'For Vendors': ['Partner With Us', 'Vendor Dashboard', 'Earnings', 'Support'],
  Legal: ['Terms & Conditions', 'Privacy Policy', 'Cookie Policy'],
  Cities: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'],
};

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const catScrollRef = useRef(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(isAuthenticated ? `/dashboard/services?search=${search}` : '/login');
  };

  const scrollCats = (dir) => {
    if (catScrollRef.current) catScrollRef.current.scrollLeft += dir * 260;
  };

  return (
    <div className="light-theme" style={{ background: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: '#1c1c1c', overflowX: 'hidden' }}>

      {/* ── STICKY NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 max(20px, calc((100vw - 1200px) / 2))',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: '#fc8019',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 12px rgba(252,128,25,0.4)',
          }}>R</div>
          <span style={{ fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.04em', color: '#1c1c1c' }}>Rentova</span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '14px', color: '#686b78', fontWeight: 500 }}>
          <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>How it works</a>
          <a href="#categories" style={{ color: 'inherit', textDecoration: 'none' }}>Browse</a>
          <a href="#partner" style={{ color: 'inherit', textDecoration: 'none' }}>Partner with us</a>
        </div>

        {/* Auth CTAs */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" style={{
              background: '#fc8019', color: '#fff',
              padding: '9px 22px', borderRadius: '999px',
              fontWeight: 700, fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(252,128,25,0.35)',
            }}>Dashboard →</Link>
          ) : (
            <>
              <Link to="/login" style={{
                color: '#1c1c1c', fontWeight: 600, fontSize: '14px',
                textDecoration: 'none', padding: '9px 18px',
                borderRadius: '999px', border: '1.5px solid #e8e8e8',
              }}>Sign in</Link>
              <Link to="/register" style={{
                background: '#1c1c1c', color: '#fff',
                padding: '9px 22px', borderRadius: '999px',
                fontWeight: 700, fontSize: '14px',
                textDecoration: 'none',
              }}>Get Started ↗</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: '#fc8019',
        paddingTop: '80px',
        paddingBottom: '0',
        minHeight: '520px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Subtle orange noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 80% 20%, rgba(255,180,80,0.35) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(200,60,0,0.2) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Hero text */}
        <div style={{ textAlign: 'center', padding: '60px 20px 40px', position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.8rem)',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            marginBottom: '16px',
            maxWidth: '820px',
            margin: '0 auto 16px',
          }}>
            Rent anything. Anytime.<br />Anywhere.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '36px', fontWeight: 400 }}>
            Scooters, cameras, tools &amp; more — from trusted vendors near you.
          </p>

          {/* Swiggy-style dual search bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', gap: '0',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            maxWidth: '680px',
            margin: '0 auto',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '0 20px', flex: '0 0 auto',
              borderRight: '1px solid #f0f0f0',
              cursor: 'pointer',
              minWidth: '180px',
            }}>
              <span style={{ fontSize: '16px' }}>📍</span>
              <span style={{ fontSize: '14px', color: '#93959f', fontWeight: 500 }}>Your location</span>
              <span style={{ fontSize: '12px', color: '#686b78' }}>▾</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for tools, cameras, scooters..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '16px 20px',
                fontSize: '14px', color: '#1c1c1c',
                background: 'transparent',
              }}
            />
            <button type="submit" style={{
              background: '#fc8019', color: '#fff',
              border: 'none', padding: '0 28px',
              cursor: 'pointer', fontSize: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>🔍</button>
          </form>
        </div>

        {/* Service category cards — Swiggy style cards at bottom of hero */}
        <div style={{
          display: 'flex', gap: '16px',
          padding: '0 max(20px, calc((100vw - 1200px) / 2)) 0',
          maxWidth: '100vw',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          position: 'relative', zIndex: 2,
          marginTop: '8px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {[
            { emoji: '🛵', label: 'VEHICLE RENTAL', sub: 'Cars, Bikes & Scooters', off: 'Upto 25% off', bg: '#fff' },
            { emoji: '🔧', label: 'TOOLS & EQUIPMENT', sub: 'Power tools, Drills', off: 'Upto 30% off', bg: '#fff' },
            { emoji: '📷', label: 'ELECTRONICS', sub: 'Cameras, Laptops', off: 'Upto 20% off', bg: '#fff' },
            { emoji: '🏠', label: 'SPACES', sub: 'Studios, Offices', off: 'Upto 15% off', bg: '#fff' },
          ].map((card) => (
            <div key={card.label} onClick={() => navigate(isAuthenticated ? '/dashboard/services' : '/login')} style={{
              background: card.bg,
              borderRadius: '20px 20px 0 0',
              padding: '24px 28px 8px',
              minWidth: '240px',
              flex: '0 0 auto',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              position: 'relative',
              overflow: 'visible',
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', color: '#1c1c1c', marginBottom: '4px' }}>{card.label}</div>
              <div style={{ fontSize: '13px', color: '#686b78', marginBottom: '8px' }}>{card.sub}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fc8019', marginBottom: '16px' }}>{card.off}</div>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#fc8019',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
              }}>→</div>
              <div style={{ fontSize: '42px', marginTop: '8px', lineHeight: 1 }}>{card.emoji}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORY SCROLL SECTION ── */}
      <section id="categories" style={{ padding: '56px max(20px, calc((100vw - 1200px) / 2)) 40px', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#1c1c1c', margin: 0 }}>
            What are you looking to rent?
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => scrollCats(-1)} style={{
              width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #e8e8e8',
              background: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>←</button>
            <button onClick={() => scrollCats(1)} style={{
              width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #e8e8e8',
              background: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>→</button>
          </div>
        </div>

        <div ref={catScrollRef} style={{
          display: 'flex', gap: '28px',
          overflowX: 'auto', scrollbarWidth: 'none',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '8px',
        }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.label}
              onClick={() => { setActiveCategory(cat.label); navigate(isAuthenticated ? `/dashboard/services?category=${cat.label}` : '/login'); }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                cursor: 'pointer', flexShrink: 0, minWidth: '72px',
              }}
            >
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: activeCategory === cat.label ? 'rgba(252,128,25,0.12)' : '#f5f5f5',
                border: activeCategory === cat.label ? '2.5px solid #fc8019' : '2.5px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px',
                transition: 'all 0.2s ease',
                boxShadow: activeCategory === cat.label ? '0 4px 16px rgba(252,128,25,0.2)' : 'none',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {cat.emoji}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#3d3d3d', whiteSpace: 'nowrap' }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section style={{ padding: '16px max(20px, calc((100vw - 1200px) / 2)) 56px', background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#1c1c1c', margin: 0 }}>
            Top rentals near you
          </h2>
          <button onClick={() => navigate(isAuthenticated ? '/dashboard/services' : '/login')}
            style={{ fontSize: '13px', fontWeight: 600, color: '#fc8019', background: 'none', border: 'none', cursor: 'pointer' }}>
            See all →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {FEATURED.map((item) => (
            <div key={item.title}
              onClick={() => navigate(isAuthenticated ? '/dashboard/services' : '/login')}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)'; }}
            >
              {/* Image area */}
              <div style={{
                height: '160px', background: item.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '72px', position: 'relative',
              }}>
                {item.emoji}
                <span style={{
                  position: 'absolute', top: '12px', left: '12px',
                  background: 'rgba(0,0,0,0.5)', color: '#fff',
                  fontSize: '11px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '999px',
                  backdropFilter: 'blur(8px)',
                }}>{item.category}</span>
                <span style={{
                  position: 'absolute', bottom: '12px', right: '12px',
                  background: '#fff', color: '#1c1c1c',
                  fontSize: '11px', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '999px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}>⭐ {item.rating}</span>
              </div>

              {/* Content */}
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: '#686b78', margin: '0 0 6px' }}>{item.vendor}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>📍 {item.distance}</span>
                </div>

                {/* Discount badge */}
                <div style={{
                  background: 'rgba(16,185,129,0.08)',
                  color: '#10b981',
                  fontSize: '11px', fontWeight: 600,
                  padding: '6px 10px', borderRadius: '8px',
                  marginBottom: '12px',
                }}>
                  🎁 {item.discount}
                </div>

                {/* Price + CTA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em' }}>₹{item.price}</span>
                    <span style={{ fontSize: '11px', color: '#93959f', marginLeft: '3px' }}>/{item.unit}</span>
                  </div>
                  <button style={{
                    background: '#fc8019', color: '#fff',
                    border: 'none', padding: '8px 18px', borderRadius: '999px',
                    fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                  }}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '64px max(20px, calc((100vw - 1200px) / 2))', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fc8019', marginBottom: '10px' }}>Simple. Fast. Trusted.</p>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 auto 12px', color: '#1c1c1c' }}>
            How Rentova works
          </h2>
          <p style={{ color: '#686b78', fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
            From search to handoff — fully tracked, OTP-secured, and wallet-powered.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{
              background: i % 2 === 0 ? '#fff8f3' : '#ffffff',
              borderRadius: '20px',
              padding: '32px 28px',
              border: '1px solid #f0f0f0',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#fc8019', letterSpacing: '0.08em', marginBottom: '16px' }}>{step.num}</div>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{step.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>{step.title}</h3>
              <p style={{ fontSize: '13px', color: '#686b78', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VENDOR PARTNER SECTION ── */}
      <section id="partner" style={{
        background: '#1c1c1c',
        padding: '80px max(20px, calc((100vw - 1200px) / 2))',
        display: 'flex', alignItems: 'center', gap: '60px',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fc8019', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 14 }}>R</div>
            <span style={{ color: '#fc8019', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em' }}>Rentova for Vendors</span>
          </div>
          <h2 style={{ color: '#ffffff', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px' }}>
            Turn your idle assets<br />into monthly income.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '440px' }}>
            List your equipment, vehicles, or spaces on Rentova. Get OTP-secured bookings, instant wallet payouts, and a real-time analytics dashboard.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: '#fc8019', color: '#fff',
              padding: '13px 28px', borderRadius: '999px',
              fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(252,128,25,0.4)',
            }}>Start Listing Free →</Link>
            <a href="#how-it-works" style={{
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              padding: '13px 28px', borderRadius: '999px',
              fontWeight: 600, fontSize: '14px', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>Learn More</a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: '0 0 auto' }}>
          {[
            { val: '1.8k+', label: 'Active Vendors' },
            { val: '42k+', label: 'Bookings Completed' },
            { val: '₹0', label: 'Listing Fee' },
            { val: '8 min', label: 'Avg. Response Time' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px 28px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fc8019', letterSpacing: '-0.04em', lineHeight: 1 }}>{stat.val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section style={{ padding: '64px max(20px, calc((100vw - 1200px) / 2))', background: '#fafafa' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#1c1c1c', margin: '0 0 12px' }}>
            Why people choose Rentova
          </h2>
          <p style={{ color: '#686b78', fontSize: '15px' }}>Built on trust, secured by technology.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { icon: '🔐', title: 'OTP-Secured Handoffs', desc: 'Every pickup and return is verified with a unique OTP — zero disputes.' },
            { icon: '💰', title: 'Wallet Payments', desc: 'Top up once, pay instantly. Zero payment failures, instant refunds.' },
            { icon: '📍', title: 'Live Location Tracking', desc: 'Vendors and customers see real-time status of every booking.' },
            { icon: '⭐', title: 'Verified Vendors', desc: 'Every vendor is KYC-verified before their first listing goes live.' },
            { icon: '🛡️', title: 'Security Deposit', desc: 'Optional deposit for high-value items, auto-returned on completion.' },
            { icon: '📞', title: '24/7 Support', desc: 'In-app chat and email support for all booking issues.' },
          ].map((item) => (
            <div key={item.title} style={{
              background: '#ffffff', borderRadius: '16px', padding: '28px 24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#686b78', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── APP DOWNLOAD CTA ── */}
      <section style={{
        background: '#1c1c1c',
        padding: '64px max(20px, calc((100vw - 1200px) / 2))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '40px', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fc8019', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 12 }}>R</div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '13px' }}>Rentova</span>
          </div>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '12px' }}>
            Get the Rentova<br />web app now!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '28px', maxWidth: '380px', lineHeight: 1.7 }}>
            For best experience — fast bookings, real-time updates, wallet top-ups. Add to your home screen.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              background: '#fc8019', color: '#fff',
              padding: '13px 28px', borderRadius: '999px',
              fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}>
              🚀 Start Renting Free
            </Link>
            <Link to="/login" style={{
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              padding: '13px 28px', borderRadius: '999px',
              fontWeight: 600, fontSize: '14px', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>Sign In</Link>
          </div>
        </div>

        {/* Scan to open */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px',
            padding: '24px', display: 'inline-block',
            marginBottom: '12px',
          }}>
            {/* QR-like visual using emoji grid */}
            <div style={{ fontSize: '80px', lineHeight: 1 }}>📱</div>
          </div>
          <p style={{ color: '#fc8019', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Open in browser</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px' }}>rentova.app</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#f5f5f5', padding: '56px max(20px, calc((100vw - 1200px) / 2)) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(4, 1fr)', gap: '40px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fc8019', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 16 }}>R</div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.04em', color: '#1c1c1c' }}>Rentova</span>
            </div>
            <p style={{ fontSize: '12px', color: '#93959f', lineHeight: 1.7 }}>© 2026 Rentova Technologies Inc.<br />All rights reserved.</p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1c1c1c', marginBottom: '16px', letterSpacing: '-0.01em' }}>{section}</h4>
              {links.map((link) => (
                <div key={link} style={{ marginBottom: '10px' }}>
                  <a href="#" style={{ fontSize: '13px', color: '#686b78', textDecoration: 'none', fontWeight: 400 }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fc8019'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#686b78'}
                  >{link}</a>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #e8e8e8', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: '#93959f' }}>For better experience, open Rentova in your browser and add to home screen.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['📘', '📸', '🐦', '💼'].map((icon, i) => (
              <span key={i} style={{ fontSize: '20px', cursor: 'pointer' }}>{icon}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
