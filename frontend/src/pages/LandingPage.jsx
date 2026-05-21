import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import landingHero from '../assets/landing_hero.png';

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

const FEATURED = [
  { emoji: '🛵', title: 'Honda Activa 6G', vendor: 'SpeedRide Rentals', category: 'Vehicles', price: 299, unit: 'day', distance: '1.2 km', discount: 'Up to 20% off with wallet', rating: 4.8, bg: 'bg-orange-50' },
  { emoji: '📷', title: 'Sony A7III Camera Kit', vendor: 'LensHub Pro', category: 'Electronics', price: 799, unit: 'day', distance: '2.4 km', discount: 'Flat 15% off first booking', rating: 4.9, bg: 'bg-blue-50' },
  { emoji: '⛺', title: 'Camping Tent — 4 Person', vendor: 'WildGear Rentals', category: 'Camping', price: 199, unit: 'day', distance: '3.1 km', discount: 'Up to 10% off', rating: 4.6, bg: 'bg-green-50' },
  { emoji: '💻', title: 'MacBook Pro M3', vendor: 'TechLease', category: 'Electronics', price: 699, unit: 'day', distance: '0.8 km', discount: 'Flat 10% off with coupon', rating: 4.7, bg: 'bg-purple-50' },
];

const STEPS = [
  { num: '01', icon: '📍', title: 'Enter Your Location', desc: 'Allow location access to see rental items near you in real-time.' },
  { num: '02', icon: '🔍', title: 'Browse & Compare', desc: 'Filter by category, price, distance — find the perfect rental.' },
  { num: '03', icon: '📅', title: 'Book in Seconds', desc: 'Choose pickup or delivery. Pay via Rentova wallet securely.' },
  { num: '04', icon: '✅', title: 'Vendor OTP Handoff', desc: 'Vendor confirms handover with OTP. Full lifecycle tracked.' },
];

const FOOTER_LINKS = {
  'Company': ['About Us', 'Careers', 'Blog', 'Press'],
  'For Vendors': ['Partner With Us', 'Vendor Dashboard', 'Earnings', 'Support'],
  'Legal': ['Terms & Conditions', 'Privacy Policy', 'Cookie Policy'],
  'Cities': ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'],
};

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
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
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">

      {/* STICKY NAV */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 h-16 flex items-center justify-between px-4 md:px-8 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center font-black text-white text-lg shadow-[0_4px_12px_rgba(252,128,25,0.4)]">R</div>
          <span className="font-extrabold text-xl tracking-tight hidden sm:block">Rentova</span>
        </div>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
          <a href="#how-it-works" className="hover:text-brand transition-colors">How it works</a>
          <a href="#categories" className="hover:text-brand transition-colors">Browse</a>
          <a href="#partner" className="hover:text-brand transition-colors">Partner with us</a>
        </div>

        <div className="flex items-center gap-3">
          {deferredPrompt && (
            <button onClick={() => {
              deferredPrompt.prompt();
              deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
            }} className="flex items-center gap-1.5 bg-gray-100 text-gray-900 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-200 transition-colors">
              📱 <span className="hidden sm:inline">Get App</span>
            </button>
          )}
          {isAuthenticated ? (
            <Link to="/dashboard" className="bg-brand text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(252,128,25,0.35)] hover:bg-brand-light transition-colors">
              Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex text-gray-900 font-semibold text-sm px-4 py-2 border-1.5 border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="bg-gray-900 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center justify-center">
                <span className="hidden sm:flex items-center gap-1">
                  Get Started
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </span>
                <span className="flex sm:hidden items-center gap-1">
                  Start
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-brand pt-24 md:pt-32 pb-0 min-h-[500px] md:min-h-[600px] relative overflow-hidden flex flex-col items-center">
        {/* Noise overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 80% 20%, rgba(255,180,80,0.35) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(200,60,0,0.2) 0%, transparent 60%)'
        }} />

        <div className="text-center px-4 md:px-8 relative z-10 w-full max-w-4xl mx-auto mb-10">
          <h1 className="text-[clamp(2.2rem,6vw,4rem)] font-black text-white leading-[1.1] tracking-tight mb-4 flex flex-wrap justify-center gap-x-3">
            <span>Rent anything.</span> <span>Anytime.</span> <span>Anywhere.</span>
          </h1>
          <p className="text-white/90 text-base md:text-lg mb-8 max-w-2xl mx-auto font-medium">
            Scooters, cameras, tools &amp; more &mdash; from trusted vendors near you.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] max-w-2xl mx-auto overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-100 cursor-pointer w-full sm:w-auto shrink-0">
              <span className="text-lg">📍</span>
              <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">Your location</span>
              <span className="text-xs text-gray-400">&#9662;</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for tools, cameras, scooters..."
              className="flex-1 bg-transparent border-none outline-none px-5 py-4 text-sm text-gray-900 w-full"
            />
            <button type="submit" className="bg-brand hover:bg-brand-dark transition-colors text-white border-none px-8 py-4 cursor-pointer text-xl flex items-center justify-center w-full sm:w-auto font-bold">
              Search
            </button>
          </form>
        </div>

        {/* Categories sliding cards */}
        <div className="flex gap-4 px-4 md:px-8 w-full max-w-[1400px] overflow-x-auto no-scrollbar relative z-10 mt-auto items-end">
          {[
            { emoji: '🛵', label: 'VEHICLE RENTAL', sub: 'Cars, Bikes & Scooters', off: 'Up to 25% off' },
            { emoji: '🔧', label: 'TOOLS & EQ', sub: 'Power tools, Drills', off: 'Up to 30% off' },
            { emoji: '📷', label: 'ELECTRONICS', sub: 'Cameras, Laptops', off: 'Up to 20% off' },
            { emoji: '🏠', label: 'SPACES', sub: 'Studios, Offices', off: 'Up to 15% off' },
          ].map((card) => (
            <div key={card.label} onClick={() => navigate(isAuthenticated ? '/dashboard/services' : '/login')} 
                 className="bg-white rounded-t-3xl p-5 md:p-7 min-w-[240px] md:min-w-[260px] shrink-0 cursor-pointer transition-transform duration-200 hover:-translate-y-2 group">
              <div className="text-[10px] md:text-xs font-black tracking-widest text-gray-900 mb-1">{card.label}</div>
              <div className="text-xs md:text-sm text-gray-500 mb-2">{card.sub}</div>
              <div className="text-xs font-bold text-brand mb-4">{card.off}</div>
              <div className="flex justify-between items-end">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                  &rarr;
                </div>
                <div className="text-4xl md:text-5xl leading-none">{card.emoji}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section id="categories" className="py-12 md:py-16 px-4 md:px-8 max-w-7xl mx-auto bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">What are you looking to rent?</h2>
          <div className="hidden md:flex gap-2">
            <button onClick={() => scrollCats(-1)} className="w-10 h-10 rounded-full border-2 border-gray-100 bg-white hover:border-gray-200 flex items-center justify-center transition-colors">&larr;</button>
            <button onClick={() => scrollCats(1)} className="w-10 h-10 rounded-full border-2 border-gray-100 bg-white hover:border-gray-200 flex items-center justify-center transition-colors">&rarr;</button>
          </div>
        </div>

        <div ref={catScrollRef} className="flex gap-4 md:gap-7 overflow-x-auto no-scrollbar pb-4 snap-x">
          {CATEGORIES.map((cat) => (
            <div key={cat.label}
                 onClick={() => { setActiveCategory(cat.label); navigate(isAuthenticated ? `/dashboard/services?category=${cat.label}` : '/login'); }}
                 className="flex flex-col items-center gap-3 cursor-pointer shrink-0 min-w-[72px] md:min-w-[88px] snap-start group"
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-all duration-200 group-hover:scale-105 ${
                activeCategory === cat.label 
                  ? 'bg-brand/10 border-2 border-brand shadow-[0_4px_16px_rgba(252,128,25,0.2)]' 
                  : 'bg-gray-50 border-2 border-transparent'
              }`}>
                {cat.emoji}
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Top rentals near you</h2>
            <button onClick={() => navigate(isAuthenticated ? '/dashboard/services' : '/login')} className="text-sm font-bold text-brand hover:text-brand-dark">
              See all &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {FEATURED.map((item) => (
              <div key={item.title} onClick={() => navigate(isAuthenticated ? '/dashboard/services' : '/login')}
                   className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className={`h-40 md:h-48 ${item.bg} flex items-center justify-center text-6xl relative`}>
                  {item.emoji}
                  <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{item.category}</span>
                  <span className="absolute bottom-3 right-3 bg-white text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">⭐ {item.rating}</span>
                </div>
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <h3 className="text-[15px] font-bold tracking-tight mb-1 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{item.vendor}</p>
                  <div className="text-xs text-emerald-500 font-bold mb-3">📍 {item.distance}</div>
                  
                  <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1.5 rounded-lg mb-4 w-fit">
                    🎁 {item.discount}
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                    <div>
                      <span className="text-lg font-extrabold">₹{item.price}</span>
                      <span className="text-[10px] text-gray-400 ml-0.5">/{item.unit}</span>
                    </div>
                    <button className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-4 py-1.5 rounded-full transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs font-black uppercase tracking-widest text-brand mb-3">Simple. Fast. Trusted.</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 mb-4">How Rentova works</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">From search to handoff — fully tracked, OTP-secured, and wallet-powered.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STEPS.map((step, i) => (
            <div key={step.num} className={`rounded-3xl p-6 md:p-8 border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${i % 2 === 0 ? 'bg-orange-50/50' : 'bg-white'}`}>
              <div className="text-xs font-black text-brand tracking-widest mb-4">{step.num}</div>
              <div className="text-4xl md:text-5xl mb-4">{step.icon}</div>
              <h3 className="text-base font-bold tracking-tight mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VENDOR CTA */}
      <section id="partner" className="bg-gray-900 py-16 md:py-24 px-4 md:px-8 text-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-black text-xs">R</div>
              <span className="text-brand font-bold text-sm">Rentova for Vendors</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
              Turn your idle assets<br className="hidden md:block"/> into monthly income.
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              List your equipment, vehicles, or spaces on Rentova. Get OTP-secured bookings, instant wallet payouts, and a real-time analytics dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto bg-brand hover:bg-brand-light text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-[0_4px_20px_rgba(252,128,25,0.4)] transition-all">
                Start Listing Free &rarr;
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-8 py-3.5 rounded-full border border-white/10 transition-all">
                Learn More
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 w-full lg:w-auto flex-shrink-0">
            {[
              { val: '1.8k+', label: 'Active Vendors' },
              { val: '42k+', label: 'Bookings Completed' },
              { val: '₹0', label: 'Listing Fee' },
              { val: '8 min', label: 'Avg. Response' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-7 text-center backdrop-blur-sm">
                <div className="text-2xl md:text-4xl font-black text-brand mb-1">{stat.val}</div>
                <div className="text-[10px] md:text-xs font-semibold text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-gray-900 mb-3">Why people choose Rentova</h2>
            <p className="text-gray-500 text-sm md:text-base">Built on trust, secured by technology.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: '🔐', title: 'OTP-Secured Handoffs', desc: 'Every pickup and return is verified with a unique OTP — zero disputes.' },
              { icon: '💰', title: 'Wallet Payments', desc: 'Top up once, pay instantly. Zero payment failures, instant refunds.' },
              { icon: '📍', title: 'Live Location Tracking', desc: 'Vendors and customers see real-time status of every booking.' },
              { icon: '⭐', title: 'Verified Vendors', desc: 'Every vendor is KYC-verified before their first listing goes live.' },
              { icon: '🛡️', title: 'Security Deposit', desc: 'Optional deposit for high-value items, auto-returned on completion.' },
              { icon: '📞', title: '24/7 Support', desc: 'In-app chat and email support for all booking issues.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-[15px] font-bold tracking-tight mb-2">{item.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed m-0">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APP DOWNLOAD */}
      <section className="bg-gray-900 py-16 md:py-24 px-4 md:px-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] mb-4">
              Get the Rentova<br className="hidden md:block"/> web app now!
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
              For the best experience &mdash; fast bookings, real-time updates, wallet top-ups. Add to your home screen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto bg-brand hover:bg-brand-light text-white font-bold text-sm px-8 py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(252,128,25,0.4)]">
                🚀 Start Renting Free
              </Link>
              <Link to="/login" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-8 py-3.5 rounded-full border border-white/10 transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          <div className="text-center bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
            <div className="bg-white rounded-2xl p-6 inline-block mb-4">
              <div className="text-6xl md:text-7xl leading-none">📱</div>
            </div>
            <p className="text-brand text-xs font-black tracking-widest uppercase mb-1">Open in browser</p>
            <p className="text-white/40 text-[10px]">rentova.app</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 pt-16 md:pt-20 pb-8 px-4 md:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-black text-white text-sm">R</div>
                <span className="font-extrabold text-lg text-gray-900 tracking-tight">Rentova</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                © 2026 Rentova Technologies Inc.<br/>All rights reserved.
              </p>
            </div>
            
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <h4 className="text-sm font-bold text-gray-900 mb-4 tracking-tight">{section}</h4>
                <div className="flex flex-col gap-3">
                  {links.map((link) => (
                    <a key={link} href="#" className="text-xs text-gray-500 hover:text-brand transition-colors">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-gray-400 text-center md:text-left">For the best experience, open Rentova in your browser and add to home screen.</p>
            <div className="flex gap-4">
              {['📘', '📸', '🐦', '💼'].map((icon, i) => (
                <span key={i} className="text-xl grayscale opacity-60 hover:grayscale-0 hover:opacity-100 cursor-pointer transition-all">{icon}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
