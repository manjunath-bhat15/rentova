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
    badge: "ರೆಂಟೋವಾ ೨.೦ ಪ್ರೋಟೋಕಾಲ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    title: "ಆಧುನಿಕ ಮಾರುಕಟ್ಟೆಗಳಿಗಾಗಿ ",
    titleSpan: "ಮೂಲಸೌಕರ್ಯ.",
    subtitle: "ಎಲೈಟ್ ಸೇವೆಗಳನ್ನು ಕಾಯ್ದಿರಿಸುತ್ತಿರಲಿ ಅಥವಾ ಹೆಚ್ಚಿನ ಪ್ರಮಾಣದ ಬಾಡಿಗೆ ನೆಟ್‌ವರ್ಕ್‌ಗಳನ್ನು ಅಳೆಯುತ್ತಿರಲಿ, ರೆಂಟೋವಾ ವಿಕೇಂದ್ರೀಕೃತ ಸ್ವತ್ತುಗಳನ್ನು ಶೂನ್ಯ ಘರ್ಷಣೆಯೊಂದಿಗೆ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತದೆ.",
    ctaDeploy: "ಉಚಿತವಾಗಿ ಎಂಜಿನ್ ನಿಯೋಜಿಸಿ",
    ctaInstall: "ನೇಟಿವ್ ಆಪ್ ಸ್ಥಾಪಿಸಿ",
    installApp: "ಆಪ್ ಸ್ಥಾಪಿಸಿ",
    signIn: "ಸೈನ್ ಇನ್",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",
    goToDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ",
    verifiedVendors: "ಪರಿಶೀಲಿಸಿದ ಮಾರಾಟಗಾರರು",
    bookingsRouted: "ಬುಕಿಂಗ್ಸ್ ರೂಟ್ ಮಾಡಲಾಗಿದೆ",
    avgResponseTime: "ಸರಾಸರಿ ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ",
    realtimeSync: "ನೈಜ-ಸಮಯದ ಸಿಂಕ್",
    ultrafastLatency: "ಅಲ್ಟ್ರಾ-ಫಾಸ್ಟ್ ಲೇಟೆನ್ಸಿ",
    avgResponseValue: "೮ನಿ",
    thisWeekTrend: "ಈ ವಾರ +೧೨%",
    dualEngineTitle: "ಡ್ಯುಯಲ್-ಎಂಜಿನ್ ಆರ್ಕಿಟೆಕ್ಚರ್ಸ್",
    dualEngineSubtitle: "ವಿಭಿನ್ನ ಅಂತಿಮ ಬಳಕೆದಾರರ ಹರಿವುಗಳಿಗಾಗಿ ನಿರ್ಮಿಸಲಾದ ಸಿಂಕ್ರೊನೈಸ್ ಮಾಡಿದ, ಪ್ರತ್ಯೇಕಿಸಲಾದ ಮರಣದಂಡನೆ ಸೆಟಪ್‌ಗಳು.",
    forCustomers: "ಗ್ರಾಹಕರಿಗಾಗಿ",
    customerBody: "ಜಾಗತಿಕ ದಾಸ್ತಾನು ಅಂತಿಮ ಬಿಂದುಗಳನ್ನು ತಕ್ಷಣವೇ ಪ್ರವೇಶಿಸಿ. ಜಿಯೋಲೋಕಲೈಸೇಶನ್ ಮೆಟ್ರಿಕ್ಸ್‌ಗಳನ್ನು ನೇರವಾಗಿ ಸುರಕ್ಷಿತ ಚೆಕ್‌ಔಟ್ ಹರಿವುಗಳಿಗೆ ಮ್ಯಾಪಿಂಗ್ ಮಾಡುವ ಹೆಚ್ಚಿನ ಭವಿಷ್ಯಸೂಚಕ ರೂಟಿಂಗ್ ಪೈಪ್‌ಲೈನ್‌ಗಳನ್ನು ರೆಂಟೋವಾ ನೀಡುತ್ತದೆ.",
    atomicCheckout: "ಅಟಾಮಿಕ್ ಚೆಕ್‌ಔಟ್",
    atomicCheckoutDesc: "ಒಂದು ಕ್ಲಿಕ್ ಸ್ಮಾರ್ಟ್ ವಾಲೆಟ್ ಬೈಂಡಿಂಗ್ಸ್.",
    liveTopology: "ಲೈವ್ ಟೋಪೋಲಜಿ",
    liveTopologyDesc: "ನೈಜ-ಸಮಯದ ಹೈ ಫಿಡೆಲಿಟಿ ಟ್ರ್ಯಾಕಿಂಗ್.",
    forVendors: "ಮಾರಾಟಗಾರರಿಗಾಗಿ",
    vendorBody: "ಭೌತಿಕ ದಾಸ್ತಾನು ಸ್ವತ್ತುಗಳನ್ನು ಆದಾಯ ಗಳಿಸುವ ಪೈಪ್‌ಲೈನ್‌ಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ. ಉದ್ಯಮ ಕಾನ್ಫಿಗರೇಶನ್‌ಗಳು, ಪ್ರೋಗ್ರಾಮ್ಯಾಟಿಕ್ ದ್ರವ್ಯತೆ ಮತ್ತು ಜಾಗತಿಕ ಅನಾಲಿಟಿಕ್ಸ್ ಒಳಗೊಂಡ ಸಮಗ್ರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅನ್ನು ಪ್ರವೇಶಿಸಿ.",
    yieldAnalytics: "ಆದಾಯ ಅನಾಲಿಟಿಕ್ಸ್",
    yieldAnalyticsDesc: "ಆಳವಾದ ಅಂಕಿಅಂಶಗಳ ಒಳನೋಟ ಚೌಕಟ್ಟುಗಳು.",
    automatedPayouts: "ಸ್ವಯಂಚಾಲಿತ ಪಾವತಿಗಳು",
    automatedPayoutsDesc: "ಶೂನ್ಯ ಶುಲ್ಕದ ತಕ್ಷಣದ ಲೆಡ್ಜರ್ ಕ್ಲಿಯರೆನ್ಸ್‌ಗಳು.",
    footerText: "© ೨೦೨೬ ರೆಂಟೋವಾ ಟೆಕ್ನಾಲಜೀಸ್ ಇಂಕ್. ಆರ್ಕಿಟೆಕ್ಚರಲ್ ಎಂಜಿನ್ ಇನ್ಫ್ರಾಸ್ಟ್ರಕ್ಚರ್ ಲೇಯರ್.",
    ledgerTx: "ಲೆಡ್ಜರ್ ವಹಿವಾಟು",
    escrowSettled: "ಎಸ್ಕ್ರೊ ತಕ್ಷಣ ಇತ್ಯರ್ಥವಾಯಿತು",
    clusterNode: "ಕ್ಲಸ್ಟರ್ ನೋಡ್",
    bookingSynced: "ಬುಕಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಸಿಂಕ್ ಆಗಿದೆ",
    installRentova: "ರೆಂಟೋವಾವನ್ನು ಸ್ಥಾಪಿಸಿ",
    installDesc: "ನೇಟಿವ್-ಆಪ್ ಅನುಭವ, ವೇಗದ ಲೋಡ್ ಸಮಯ ಮತ್ತು ತ್ವರಿತ ಅಧಿಸೂಚನೆಗಳಿಗಾಗಿ ನಿಮ್ಮ ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಅಥವಾ ಡೆಸ್ಕ್‌ಟಾಪ್‌ಗೆ ರೆಂಟೋವಾವನ್ನು ಸೇರಿಸಿ.",
    iosStep1: "ಸಫಾರಿಯಲ್ಲಿ ಶೇರ್ ಬಟನ್ ಟ್ಯಾಪ್ ಮಾಡಿ.",
    iosStep2: "ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ ಮತ್ತು ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ ಆಯ್ಕೆಮಾಡಿ.",
    iosStep3: "ದೃಢೀಕರಿಸಲು ಮೇಲಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿ ಸೇರಿಸಿ ಟ್ಯಾಪ್ ಮಾಡಿ.",
    otherStep1: "ಬ್ರೌಸರ್ ವಿಳಾಸ ಪಟ್ಟಿಯಲ್ಲಿ ಸ್ಥಾಪಿಸು ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    otherStep2: "ಅಥವಾ ಬ್ರೌಸರ್ ಮೆನುವನ್ನು ತೆರೆದು ಆಪ್ ಸ್ಥಾಪಿಸಿ ಅಥವಾ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ ಟ್ಯಾಪ್ ಮಾಡಿ.",
    gotIt: "ತಿಳಿಯಿತು"
  }
};

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Theme & Language State with LocalStorage cache
  const [lang, setLang] = useState(() => localStorage.getItem('rentova_lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('rentova_theme') || 'dark');

  const t = (key) => translations[lang][key];

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('rentova_theme', nextTheme);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'kn' : 'en';
    setLang(nextLang);
    localStorage.setItem('rentova_lang', nextLang);
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
      <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0, 206, 201, 0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* --- NAVIGATION BAR --- */}
      <nav className="premium-landing-nav">
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher */}
          <button 
            onClick={toggleLanguage}
            className="theme-switcher-btn-class"
            title="Switch Language"
          >
            🌐 {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </button>

          {/* Theme Switcher */}
          <button 
            onClick={toggleTheme}
            className="theme-switcher-btn-class"
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Install App Button */}
          <button 
            onClick={handleInstallClick}
            className="premium-landing-nav-install-btn"
          >
            {t('installApp')}
          </button>

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
              {t('goToDashboard')}
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', padding: '10px 20px' }} className="theme-switcher-btn-class">{t('signIn')}</Link>
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
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00cec9', boxShadow: '0 0 10px #00cec9' }}></span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a29bfe' }}>{t('badge')}</span>
        </motion.div>

        {/* Master Copy */}
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="premium-landing-title"
        >
          {t('title')}<br />
          <span style={{ background: 'linear-gradient(180deg, #ffffff 30%, #a29bfe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('titleSpan')}</span>
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
          <Link to="/register" style={{ background: 'linear-gradient(135deg, #6c5ce7, #4834d4)', color: '#fff', padding: '16px 40px', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 20px 40px rgba(108, 92, 231, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
            <span style={{ fontSize: '0.75rem', background: 'rgba(108,92,231,0.1)', color: '#a29bfe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>DELHI_09</span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('bookingSynced')}</div>
          <div style={{ marginTop: '12px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #6c5ce7, #00cec9)' }}></div>
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
              <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #ffffff, #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{m.value}</div>
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
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '40px' }}>⚡</div>
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
          <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #6c5ce7, #00cec9)', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>R</div>
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
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(108, 92, 231, 0.2)', color: '#a29bfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>1</div>
                    <span style={{ fontSize: '0.9rem', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('iosStep1')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(108, 92, 231, 0.2)', color: '#a29bfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>2</div>
                    <span style={{ fontSize: '0.9rem', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('iosStep2')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(108, 92, 231, 0.2)', color: '#a29bfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>3</div>
                    <span style={{ fontSize: '0.9rem', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('iosStep3')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(108, 92, 231, 0.2)', color: '#a29bfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>1</div>
                    <span style={{ fontSize: '0.9rem', color: theme === 'light' ? '#0f172a' : '#fff' }}>{t('otherStep1')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(108, 92, 231, 0.2)', color: '#a29bfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>2</div>
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
                background: 'linear-gradient(135deg, #6c5ce7, #4834d4)',
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
