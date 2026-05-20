import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const translations = {
  en: {
    badge: "RENTOVA 2.0 PROTOCOL IS LIVE",
    title: "The infrastructure for ",
    titleSpan: "Modern Marketplaces.",
    subtitle: "Whether booking elite services or scaling high-volume rental networks, Rentova processes decentralized assets with zero friction.",
    ctaDeploy: "Deploy Engine Free",
    ctaInstall: "Install Native App",
    installApp: "Install App",
    signIn: "Sign In",
    getStarted: "Get Started",
    goToDashboard: "Go to Dashboard",
    verifiedVendors: "Verified Vendors",
    bookingsRouted: "Bookings Routed",
    avgResponseTime: "Avg. Response Time",
    realtimeSync: "Real-time sync",
    ultrafastLatency: "Ultra-fast latency",
    avgResponseValue: "8m",
    thisWeekTrend: "+12% this week",
    dualEngineTitle: "Dual-Engine Architectures",
    dualEngineSubtitle: "Synchronized, segregated execution setups built for distinct end-user flows.",
    forCustomers: "For Customers",
    customerBody: "Access global inventory endpoints instantly. Rentova delivers highly predictive routing pipelines mapping geolocation metrics directly to secure checkout flows.",
    atomicCheckout: "Atomic Checkout",
    atomicCheckoutDesc: "One-click smart wallet bindings.",
    liveTopology: "Live Topology",
    liveTopologyDesc: "Real-time high fidelity tracking.",
    forVendors: "For Vendors",
    vendorBody: "Turn physical inventory assets into yield generating pipelines. Access a comprehensive dashboard featuring enterprise configurations, programmatic liquidity, and global analytics.",
    yieldAnalytics: "Yield Analytics",
    yieldAnalyticsDesc: "Deep statistical insight frameworks.",
    automatedPayouts: "Automated Payouts",
    automatedPayoutsDesc: "Zero fee immediate ledger clearances.",
    footerText: "© 2026 Rentova Technologies Inc. Architectural Engine Infrastructure Layer.",
    ledgerTx: "LEDGER TRANSACTION",
    escrowSettled: "Escrow Settled Instantly",
    clusterNode: "CLUSTER NODE",
    bookingSynced: "Booking Synced Successfully",
    installRentova: "Install Rentova",
    installDesc: "Add Rentova to your home screen or desktop for a native-app experience, faster load times, and instant notifications.",
    iosStep1: "Tap the Share button in Safari.",
    iosStep2: "Scroll down and select Add to Home Screen.",
    iosStep3: "Tap Add in the top-right corner to confirm.",
    otherStep1: "Click the Install button (➕/🖥️) in the browser address bar.",
    otherStep2: "Or open the browser menu (⋮ / ⋯) and tap Install App or Add to Home Screen.",
    gotIt: "Got it"
  },
  kn: {
    badge: "ರೆಂಟೋವಾ 2.0 ಇದೀಗ ಲೈವ್ ಆಗಿದೆ",
    title: "ಆಧುನಿಕ ಡಿಜಿಟಲ್ ಮಾರುಕಟ್ಟೆಗಳಿಗಾಗಿ ",
    titleSpan: "ವಿಶ್ವಾಸಾರ್ಹ ವೇದಿಕೆ.",
    subtitle: "ಪ್ರಿಮಿಯಂ ಸೇವೆಗಳ ಬುಕ್ಕಿಂಗ್ ಆಗಲಿ ಅಥವಾ ದೊಡ್ಡ ಮಟ್ಟದ ಬಾಡಿಗೆ ವ್ಯವಹಾರಗಳ ನಿರ್ವಹಣೆ ಆಗಲಿ — ರೆಂಟೋವಾ ಎಲ್ಲ ಪ್ರಕ್ರಿಯೆಗಳನ್ನೂ ವೇಗವಾಗಿ, ಸುರಕ್ಷಿತವಾಗಿ ಮತ್ತು ಯಾವುದೇ ತೊಂದರೆಯಿಲ್ಲದೆ ನಿರ್ವಹಿಸುತ್ತದೆ.",
    ctaDeploy: "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ",
    ctaInstall: "ಆಪ್ ಇನ್ಸ್ಟಾಲ್ ಮಾಡಿ",
    installApp: "ಆಪ್ ಇನ್ಸ್ಟಾಲ್ ಮಾಡಿ",
    signIn: "ಲಾಗಿನ್",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",
    goToDashboard: "ಡ್ಯಾಶ್ಬೋರ್ಡ್ಗೆ ಹೋಗಿ",
    verifiedVendors: "ಪರಿಶೀಲಿತ ವ್ಯಾಪಾರಿಗಳು",
    bookingsRouted: "ಯಶಸ್ವಿ ಬುಕ್ಕಿಂಗ್ಗಳು",
    avgResponseTime: "ಸರಾವರಿ ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ",
    realtimeSync: "ರಿಯಲ್-ಟೈಮ್ ಸಿಂಕ್",
    ultrafastLatency: "ಅತ್ಯಂತ ವೇಗದ ಪ್ರತಿಕ್ರಿಯೆ",
    avgResponseValue: "8 ನಿಮಿಷ",
    thisWeekTrend: "ಈ ವಾರ +12% ಬೆಳವಣಿಗೆ",
    dualEngineTitle: "ಎರಡು ಹಂತದ ಸ್ಮಾರ್ಟ್ ವ್ಯವಸ್ಥೆ",
    dualEngineSubtitle: "ಗ್ರಾಹಕರು ಮತ್ತು ವ್ಯಾಪಾರಿಗಳ ವಿಭಿನ್ನ ಅಗತ್ಯಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವಂತೆ ವಿನ್ಯಾಸಗೊಳಿಸಿದ ಆಧುನಿಕ ಡಿಜಿಟಲ್ ವ್ಯವಸ್ಥೆ.",
    forCustomers: "ಗ್ರಾಹಕರಿಗಾಗಿ",
    customerBody: "ನಿಮಗೆ ಬೇಕಾದ ಸೇವೆಗಳು ಮತ್ತು ಉತ್ಪನ್ನಗಳನ್ನು ವೇಗವಾಗಿ ಹುಡುಕಿ ಹಾಗೂ ಸುರಕ್ಷಿತವಾಗಿ ಬುಕ್ ಮಾಡಿ. ರೆಂಟೋವಾ ಉತ್ತಮ ಅನುಭವಕ್ಕಾಗಿ ಸ್ಮಾರ್ಟ್ ಲೊಕೇಶನ್ ಮತ್ತು ವೇಗದ ಚೆಕ್ಔಟ್ ವ್ಯವಸ್ಥೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.",
    atomicCheckout: "ತ್ವರಿತ ಪಾವತಿ",
    atomicCheckoutDesc: "ಒಂದೇ ಕ್ಲಿಕ್ಕಿನಲ್ಲಿ ಸುರಕ್ಷಿತ ಪಾವತಿ ಪೂರ್ಣಗೊಳಿಸಿ.",
    liveTopology: "ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್",
    liveTopologyDesc: "ನೈಜ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಬುಕ್ಕಿಂಗ್ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸಿ.",
    forVendors: "ವ್ಯಾಪಾರಿಗಳಿಗಾಗಿ",
    vendorBody: "ನಿಮ್ಮ ಬಾಡಿಗೆ ವ್ಯವಹಾರವನ್ನು ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ. ರೆಂಟೋವಾ ಮೂಲಕ ಬುಕ್ಕಿಂಗ್ಗಳು, ಆದಾಯ, ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಪಾವತಿಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ನಿಯಂತ್ರಿಸಬಹುದು.",
    yieldAnalytics: "ಆದಾಯ ವಿಶ್ಲೇಷಣೆ",
    yieldAnalyticsDesc: "ವ್ಯವಹಾರದ ಕಾರ್ಯಕ್ಷಮತೆಯ ಸಂಪೂರ್ಣ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.",
    automatedPayouts: "ಸ್ವಯಂ ಪಾವತಿ ವ್ಯವಸ್ಥೆ",
    automatedPayoutsDesc: "ವೇಗವಾದ ಮತ್ತು ಸುರಕ್ಷಿತ ಪಾವತಿ ವರ್ಗಾವಣೆ.",
    footerText: "© 2026 ರೆಂಟೋವಾ ಟೆಕ್ನಾಲಜೀಸ್. ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    ledgerTx: "ವಹಿವಾಟು ದಾಖಲೆ",
    escrowSettled: "ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ",
    clusterNode: "ಸರ್ವರ್ ನೋಡ್",
    bookingSynced: "ಬುಕ್ಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಸಿಂಕ್ ಆಗಿದೆ",
    installRentova: "ರೆಂಟೋವಾ ಆಪ್ ಇನ್ಸ್ಟಾಲ್ ಮಾಡಿ",
    installDesc: "ವೇಗವಾದ ಅನುಭವ, ತ್ವರಿತ ಸೂಚನೆಗಳು ಮತ್ತು ಸುಲಭ ಬಳಕೆಗೆ ರೆಂಟೋವಾ ಆಪ್ ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಅಥವಾ ಡೆಸ್ಕ್ಟಾಪ್ಗೆ ಸೇರಿಸಿ.",
    iosStep1: "Safari ನಲ್ಲಿ Share ಬಟನ್ ಒತ್ತಿರಿ.",
    iosStep2: "ನಂತರ 'Add to Home Screen' ಆಯ್ಕೆಮಾಡಿ.",
    iosStep3: "ಮೇಲಿನ 'Add' ಬಟನ್ ಒತ್ತಿ ದೃಢೀಕರಿಸಿ.",
    otherStep1: "ಬ್ರೌಸರ್ನ ವಿಳಾಸ ಪಟ್ಟಿಯಲ್ಲಿರುವ Install ಬಟನ್ ಒತ್ತಿರಿ.",
    otherStep2: "ಅಥವಾ ಬ್ರೌಸರ್ ಮೆನು ತೆರೆಯಿಸಿ 'Install App' ಅಥವಾ 'Add to Home Screen' ಆಯ್ಕೆಮಾಡಿ.",
    gotIt: "ಸರಿ"
  }
};

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Theme & Language State with LocalStorage cache - locked temporarily
  const [lang] = useState('en');
  const [theme] = useState('dark');

  const t = (key) => translations[lang][key];

  const toggleTheme = () => {
    // Temporarily disabled
  };

  const toggleLanguage = () => {
    // Temporarily disabled
  };

  // Metrics configurations
  const metrics = [
    { label: t('verifiedVendors'), value: '1.8k+', trend: t('thisWeekTrend') },
    { label: t('bookingsRouted'), value: '42k+', trend: t('realtimeSync') },
    { label: t('avgResponseTime'), value: t('avgResponseValue'), trend: t('ultrafastLatency') },
  ];

  // PWA Install Event Handler
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isApple = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isApple);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

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
    <div className={`premium-landing ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* Premium Ambient Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 122, 0, 0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0, 206, 201, 0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* --- NAVIGATION BAR --- */}
      <nav className="premium-landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'var(--accent-gradient)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 800, 
            color: '#fff',
            boxShadow: 'var(--glow-primary)'
          }}>R</div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.03em', background: 'linear-gradient(to right, #fff, var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Rentova</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher - temporarily commented out
          <button 
            onClick={toggleLanguage}
            className="theme-switcher-btn-class"
            title="Switch Language"
          >
            🌐 {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </button>
          */}

          {/* Theme Switcher - temporarily commented out
          <button 
            onClick={toggleTheme}
            className="theme-switcher-btn-class"
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          */}

          {/* Install App Button */}
          <button 
            onClick={handleInstallClick}
            className="premium-landing-nav-install-btn"
          >
            {t('installApp')}
          </button>

          {isAuthenticated ? (
            <Link to={`/${user?.role?.toLowerCase() || 'customer'}`} className="btn" style={{ 
              background: 'var(--accent-gradient)', 
              color: '#fff', 
              padding: '10px 24px', 
              borderRadius: '100px', 
              fontWeight: 600, 
              fontSize: '0.9rem', 
              textDecoration: 'none',
              boxShadow: 'var(--glow-primary)',
              transition: 'transform 0.2s'
            }}>
              {t('goToDashboard')}
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', padding: '10px 20px' }} className="theme-switcher-btn-class">{t('signIn')}</Link>
              <Link to="/register" style={{ 
                background: '#ffffff', 
                color: 'var(--bg-primary)', 
                padding: '10px 24px', 
                borderRadius: '100px', 
                fontWeight: 600, 
                fontSize: '0.9rem', 
                textDecoration: 'none',
                boxShadow: '0 4px 25px rgba(255,255,255,0.15)',
                transition: 'all 0.2s'
              }} className="theme-switcher-btn-class">
                {t('getStarted')}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <motion.section 
        className="premium-landing-hero"
        style={{ 
          y: heroY, 
          opacity: heroOpacity, 
          scale: heroScale
        }}
      >
        {/* Decorative subtle ambient pattern token */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="premium-landing-badge"
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: 'var(--glow-primary)' }}></span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent-primary)' }}>{t('badge')}</span>
        </motion.div>

        {/* Master Copy */}
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="premium-landing-title"
        >
          {t('title')}<br />
          <span style={{ background: 'linear-gradient(180deg, #ffffff 30%, var(--accent-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('titleSpan')}</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="premium-landing-subtitle"
        >
          {t('subtitle')}
        </motion.p>

        {/* Interactive Luxury CTAs */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="premium-landing-ctas"
        >
          <Link to="/register" style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '16px 40px', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', boxShadow: 'var(--glow-primary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {t('ctaDeploy')}
          </Link>
          <button onClick={handleInstallClick} style={{ background: 'rgba(255,255,255,0.02)', color: '#fff', padding: '16px 40px', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', cursor: 'pointer' }}>
            {t('ctaInstall')}
          </button>
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
          className="premium-landing-hud premium-landing-hud-left"
          style={{ transformPerspective: 1000 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00cec9', boxShadow: '0 0 10px #00cec9' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{t('ledgerTx')}</span>
          </div>
          <div style={{ marginTop: '16px', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>+ ₹2,500.00</div>
          <div style={{ fontSize: '0.8rem', color: '#00cec9', marginTop: '4px', fontWeight: 500 }}>{t('escrowSettled')}</div>
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
          className="premium-landing-hud premium-landing-hud-right"
          style={{ transformPerspective: 1000 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{t('clusterNode')}</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255, 122, 0, 0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>DELHI_09</span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('bookingSynced')}</div>
          <div style={{ marginTop: '12px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)' }}></div>
          </div>
        </motion.div>
      </motion.section>

      {/* --- PREMIUM DATA METRICS TICKER --- */}
      <section className="premium-landing-metrics">
        <div className="premium-landing-metrics-grid">
          {metrics.map((m, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="premium-landing-metric-item"
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #ffffff, var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{m.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginTop: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '0.7rem', color: '#00cec9', marginTop: '4px', letterSpacing: '0.02em' }}>{m.trend}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- BENTO CARD ARCHITECTURE SECTION --- */}
      <section ref={bentoRef} className="premium-landing-bento-section">
        <motion.div 
          style={{ 
            textAlign: 'center', marginBottom: '80px',
            opacity: bentoOpacity,
            y: bentoY
          }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>{t('dualEngineTitle')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>{t('dualEngineSubtitle')}</p>
        </motion.div>

        <motion.div 
          className="premium-landing-bento-grid"
          style={{ 
            rotateX: bentoRotateX,
            scale: bentoScale,
            opacity: bentoOpacity
          }}
        >
          {/* Bento Experience One: Customer Workspace */}
          <div className="premium-landing-bento-card">
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 122, 0, 0.1)', border: '1px solid rgba(255, 122, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '40px' }}>⚡</div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>{t('forCustomers')}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '40px' }}>
                {t('customerBody')}
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{t('atomicCheckout')}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{t('atomicCheckoutDesc')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{t('liveTopology')}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{t('liveTopologyDesc')}</div>
              </div>
            </div>
          </div>

          {/* Bento Experience Two: Vendor Terminal */}
          <div className="premium-landing-bento-card">
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 206, 201, 0.1)', border: '1px solid rgba(0, 206, 201, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '40px' }}>🪐</div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>{t('forVendors')}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '40px' }}>
                {t('vendorBody')}
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{t('yieldAnalytics')}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{t('yieldAnalyticsDesc')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{t('automatedPayouts')}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{t('automatedPayoutsDesc')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="premium-landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--accent-gradient)', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>R</div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.02em' }}>Rentova</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center', letterSpacing: '0.02em' }}>
          {t('footerText')}
        </p>
      </footer>

      {/* Install Instruction Modal */}
      {showInstallModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: theme === 'light' ? '#ffffff' : 'rgba(20, 20, 30, 0.9)',
            border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '40px 32px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('installRentova')}</h3>
            <p style={{ color: theme === 'light' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
              {t('installDesc')}
            </p>

            <div style={{ textAlign: 'left', background: theme === 'light' ? 'rgba(15, 23, 42, 0.02)' : 'rgba(255, 255, 255, 0.03)', border: theme === 'light' ? '1px solid rgba(15, 23, 42, 0.05)' : '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
              {isIOS ? (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 122, 0, 0.2)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>1</div>
                    <span style={{ fontSize: '0.9rem', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('iosStep1')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 122, 0, 0.2)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>2</div>
                    <span style={{ fontSize: '0.9rem', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('iosStep2')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 122, 0, 0.2)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>3</div>
                    <span style={{ fontSize: '0.9rem', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('iosStep3')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 122, 0, 0.2)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>1</div>
                    <span style={{ fontSize: '0.9rem', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('otherStep1')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 122, 0, 0.2)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>2</div>
                    <span style={{ fontSize: '0.9rem', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('otherStep2')}</span>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => setShowInstallModal(false)}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 600,
                background: 'var(--accent-gradient)',
                cursor: 'pointer',
                border: 'none',
                color: '#fff'
              }}
            >
              {t('gotIt')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
