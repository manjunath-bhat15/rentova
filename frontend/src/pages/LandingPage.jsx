import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const metrics = [
  { label: 'Verified Vendors', value: '1.8k+', trend: '+12% this week' },
  { label: 'Bookings Routed', value: '42k+', trend: 'Real-time sync' },
  { label: 'Avg. Response Time', value: '8m', trend: 'Ultra-fast latency' },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  // Scroll animations for Hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.9]);

  // Scroll animations for Bento Architecture Section
  const bentoRef = useRef(null);
  const { scrollYProgress: bentoProgress } = useScroll({
    target: bentoRef,
    offset: ["start end", "center center"]
  });
  
  // 3D Transforms mapped to scroll
  const bentoRotateX = useTransform(bentoProgress, [0, 1], [30, 0]);
  const bentoScale = useTransform(bentoProgress, [0, 1], [0.8, 1]);
  const bentoOpacity = useTransform(bentoProgress, [0, 1], [0, 1]);
  const bentoY = useTransform(bentoProgress, [0, 1], [100, 0]);

  return (
    <div className="landing" style={{ 
      background: '#030303', 
      color: '#ffffff', 
      fontFamily: 'var(--font-sans, system-ui, sans-serif)', 
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Premium Ambient Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0, 206, 201, 0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* --- NAVIGATION BAR --- */}
      <nav style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px', 
        background: 'rgba(3, 3, 3, 0.7)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'linear-gradient(135deg, #6c5ce7, #00cec9)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 800, 
            color: '#fff',
            boxShadow: '0 0 20px rgba(108, 92, 231, 0.4)'
          }}>R</div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rentova</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <Link to={`/${user?.role?.toLowerCase() || 'customer'}`} className="btn" style={{ 
              background: 'linear-gradient(135deg, #6c5ce7, #4834d4)', 
              color: '#fff', 
              padding: '10px 24px', 
              borderRadius: '100px', 
              fontWeight: 600, 
              fontSize: '0.9rem', 
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(108, 92, 231, 0.3)',
              transition: 'transform 0.2s'
            }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', padding: '10px 20px' }}>Sign In</Link>
              <Link to="/register" style={{ 
                background: '#ffffff', 
                color: '#030303', 
                padding: '10px 24px', 
                borderRadius: '100px', 
                fontWeight: 600, 
                fontSize: '0.9rem', 
                textDecoration: 'none',
                boxShadow: '0 4px 25px rgba(255,255,255,0.15)',
                transition: 'all 0.2s'
              }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <motion.section 
        style={{ 
          position: 'relative', minHeight: '90vh', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', padding: '0 20px', zIndex: 2,
          y: heroY, opacity: heroOpacity, scale: heroScale
        }}
      >
        
        {/* Decorative subtle ambient pattern token */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '32px', backdropFilter: 'blur(10px)' }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00cec9', boxShadow: '0 0 10px #00cec9' }}></span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a29bfe' }}>RENTOVA 2.0 PROTOCOL IS LIVE</span>
        </motion.div>

        {/* Master Copy */}
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, textAlign: 'center', maxWidth: '1100px', marginBottom: '32px' }}
        >
          The infrastructure for <br />
          <span style={{ background: 'linear-gradient(180deg, #ffffff 30%, #a29bfe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modern Marketplaces.</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)', color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: '640px', marginBottom: '48px', lineHeight: 1.6, fontWeight: 400 }}
        >
          Whether booking elite services or scaling high-volume rental networks, Rentova processes decentralized assets with zero friction.
        </motion.p>

        {/* Interactive Luxury CTAs */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '80px' }}
        >
          <Link to="/register" style={{ background: 'linear-gradient(135deg, #6c5ce7, #4834d4)', color: '#fff', padding: '16px 40px', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 20px 40px rgba(108, 92, 231, 0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Deploy Engine Free
          </Link>
          <Link to="/login" style={{ background: 'rgba(255,255,255,0.02)', color: '#fff', padding: '16px 40px', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
            Explore Sandbox
          </Link>
        </motion.div>

        {/* --- FLOATING DECENTRALIZED UI HUD ELEMENTS --- */}
        {/* Left Floating Component */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: [0, -20, 0],
            rotateY: [15, 25, 15],
            rotateX: [5, -5, 5]
          }}
          transition={{ 
            opacity: { duration: 1, delay: 0.5 },
            x: { duration: 1, delay: 0.5 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 7, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ position: 'absolute', top: '20%', left: '4%', width: '260px', background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(30px)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', transformPerspective: 1000, pointerEvents: 'none', display: 'none', '@media (minWidth: 1024px)': { display: 'block' } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00cec9', boxShadow: '0 0 10px #00cec9' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>LEDGER TRANSACTION</span>
          </div>
          <div style={{ marginTop: '16px', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>+ ₹2,500.00</div>
          <div style={{ fontSize: '0.8rem', color: '#00cec9', marginTop: '4px', fontWeight: 500 }}>Escrow Settled Instantly</div>
        </motion.div>

        {/* Right Floating Component */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: [0, 20, 0],
            rotateY: [-15, -25, -15],
            rotateX: [5, 15, 5]
          }}
          transition={{ 
            opacity: { duration: 1, delay: 0.7 },
            x: { duration: 1, delay: 0.7 },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 9, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ position: 'absolute', bottom: '15%', right: '4%', width: '280px', background: 'rgba(10, 10, 15, 0.6)', backdropFilter: 'blur(30px)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', transformPerspective: 1000, pointerEvents: 'none', display: 'none', '@media (minWidth: 1024px)': { display: 'block' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>CLUSTER NODE</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(108,92,231,0.1)', color: '#a29bfe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>DELHI_09</span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Booking Synced Successfully</div>
          <div style={{ marginTop: '12px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #6c5ce7, #00cec9)' }}></div>
          </div>
        </motion.div>
      </motion.section>

      {/* --- PREMIUM DATA METRICS TICKER --- */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', padding: '40px 20px', gap: '30px' }}>
          {metrics.map((m, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{ textAlign: 'center', borderRight: idx !== metrics.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #ffffff, #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{m.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginTop: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '0.7rem', color: '#00cec9', marginTop: '4px', letterSpacing: '0.02em' }}>{m.trend}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- BENTO CARD ARCHITECTURE SECTION --- */}
      <section ref={bentoRef} style={{ padding: '140px 20px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <motion.div 
          style={{ 
            textAlign: 'center', marginBottom: '80px',
            opacity: bentoOpacity,
            y: bentoY
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>Dual-Engine Architectures</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>Synchronized, segregated execution setups built for distinct end-user flows.</p>
        </motion.div>

        <motion.div 
          style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px',
            rotateX: bentoRotateX,
            scale: bentoScale,
            opacity: bentoOpacity,
            perspective: 1000
          }}
        >
          
          {/* Bento Experience One: Customer Workspace */}
          <div style={{ 
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
            borderRadius: '24px', 
            padding: '48px', 
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transformStyle: 'preserve-3d'
          }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '40px' }}>⚡</div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>For Customers</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '40px' }}>
                Access global inventory endpoints instantly. Rentova delivers highly predictive routing pipelines mapping geolocation metrics directly to secure checkout flows.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Atomic Checkout</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>One-click smart wallet bindings.</div>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Live Topology</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Real-time high fidelity tracking.</div>
              </div>
            </div>
          </div>

          {/* Bento Experience Two: Vendor Terminal */}
          <div style={{ 
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
            borderRadius: '24px', 
            padding: '48px', 
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transformStyle: 'preserve-3d'
          }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 206, 201, 0.1)', border: '1px solid rgba(0, 206, 201, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '40px' }}>🪐</div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>For Vendors</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '40px' }}>
                Turn physical inventory assets into yield generating pipelines. Access a comprehensive dashboard featuring enterprise configurations, programmatic liquidity, and global analytics.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Yield Analytics</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Deep statistical insight frameworks.</div>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Automated Payouts</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Zero fee immediate ledger clearances.</div>
              </div>
            </div>
          </div>
          
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ 
        padding: '80px 40px 40px', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        background: '#010101',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #6c5ce7, #00cec9)', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>R</div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.02em' }}>Rentova</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center', letterSpacing: '0.02em' }}>
          © 2026 Rentova Technologies Inc. Architectural Engine Infrastructure Layer.
        </p>
      </footer>
    </div>
  );
}
