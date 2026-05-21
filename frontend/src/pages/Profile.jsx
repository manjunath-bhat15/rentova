import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ─── League System ───────────────────────────────── */
const LEAGUES = [
  { id: 'bronze',   label: 'Bronze',   emoji: '🥉', minOrders: 0,   minRating: 0,   color: '#cd7f32', bg: 'rgba(205,127,50,0.1)',  description: 'Welcome to Rentova!' },
  { id: 'silver',   label: 'Silver',   emoji: '🥈', minOrders: 5,   minRating: 3.5, color: '#9e9e9e', bg: 'rgba(158,158,158,0.1)', description: 'Trusted renter' },
  { id: 'gold',     label: 'Gold',     emoji: '🥇', minOrders: 20,  minRating: 4.0, color: '#ffc107', bg: 'rgba(255,193,7,0.1)',   description: 'Power user' },
  { id: 'platinum', label: 'Platinum', emoji: '💎', minOrders: 50,  minRating: 4.5, color: '#00bcd4', bg: 'rgba(0,188,212,0.1)',   description: 'Elite renter' },
  { id: 'diamond',  label: 'Diamond',  emoji: '👑', minOrders: 100, minRating: 4.8, color: '#9c27b0', bg: 'rgba(156,39,176,0.1)',  description: 'Legendary status' },
];

function getLeague(orders = 0, rating = 0) {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (orders >= LEAGUES[i].minOrders && rating >= LEAGUES[i].minRating) return LEAGUES[i];
  }
  return LEAGUES[0];
}

function getNextLeague(current) {
  const idx = LEAGUES.findIndex(l => l.id === current.id);
  return idx < LEAGUES.length - 1 ? LEAGUES[idx + 1] : null;
}

/* ─── Profile completion ──────────────────────────── */
function getCompletion(user, form) {
  const checks = [
    { label: 'Name',          done: !!form.name },
    { label: 'Avatar',        done: !!form.avatar || !!user?.avatar },
    { label: 'Phone',         done: !!form.phone || !!user?.phoneNumber },
    { label: 'Phone verified',done: !!user?.phoneVerified },
    { label: 'Govt ID',       done: !!user?.govtIdVerified },
    { label: 'Bio',           done: !!form.bio },
    { label: 'Address',       done: !!form.address },
  ];
  const done = checks.filter(c => c.done).length;
  return { checks, pct: Math.round((done / checks.length) * 100) };
}

/* ─── Helpers ─────────────────────────────────────── */
const roleColors = {
  CUSTOMER: { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Customer' },
  VENDOR:   { color: 'text-brand', bg: 'bg-brand/10',  label: 'Vendor' },
  ADMIN:    { color: 'text-purple-500', bg: 'bg-purple-50', label: 'Admin' },
};

function Chip({ text, colorClass, bgClass, customColor, customBg }) {
  if (customColor) {
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap" style={{ background: customBg, color: customColor }}>{text}</span>
    );
  }
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${bgClass} ${colorClass}`}>{text}</span>
  );
}

/* ═══════════════════════════════════════════════════ */
export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState(() => localStorage.getItem('profileTab') || 'edit');
  const [form, setForm] = useState({ name: '', avatar: '', phone: '', bio: '', address: '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const govtFileRef = useRef(null);

  // Govt ID state
  const [govtForm, setGovtForm] = useState({ idNumber: '', idUrl: '' });
  const [govtLoading, setGovtLoading] = useState(false);
  const [govtMsg, setGovtMsg] = useState({ type: '', text: '' });

  // Phone Verify State
  const [phoneOtpForm, setPhoneOtpForm] = useState({ phone: '', otp: '', step: 1 });
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    localStorage.setItem('profileTab', tab);
  }, [tab]);

  useEffect(() => {
    if (user) {
      setForm({
        name:    user.name    || '',
        avatar:  user.avatar  || '',
        phone:   user.phoneNumber || '',
        bio:     user.bio     || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handlePwdChange = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    setPwdLoading(true);
    try {
      await api.post('/api/auth/change-password', pwdForm);
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwdForm({ currentPassword: '', newPassword: '' });
      setTimeout(() => setPwdMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPwdLoading(false);
    }
  };

  const set = field => e => setForm(f => ({ ...f, [field]: typeof e === 'string' ? e : e.target.value }));

  // ── Camera ──────────────────────────────────────────
  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(s);
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch (err) {
      console.error(err);
      toast.error('Camera access denied. Please allow camera permission or upload a photo instead.');
    }
  };

  const closeCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setForm(f => ({ ...f, avatar: dataUrl }));
    closeCamera();
  };

  const handleFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleGovtFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setGovtForm(f => ({ ...f, idUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  // ── Save profile ─────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put('/api/auth/profile', form);
      setMsg({ type: 'success', text: 'Profile updated! Refreshing…' });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setMsg({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Submit Govt ID ────────────────────────────────────
  const handleGovtSubmit = async e => {
    e.preventDefault();
    if (!govtForm.idNumber.trim()) { setGovtMsg({ type: 'error', text: 'Enter your ID number' }); return; }
    setGovtLoading(true);
    setGovtMsg({ type: '', text: '' });
    try {
      const res = await api.post('/api/auth/verify-id', { idNumber: govtForm.idNumber, idUrl: govtForm.idUrl });
      updateUser(res.data);
      setGovtMsg({ type: 'success', text: 'ID submitted for verification! Admin will review shortly.' });
    } catch {
      setGovtMsg({ type: 'error', text: 'Submission failed. Please try again.' });
    } finally {
      setGovtLoading(false);
    }
  };

  // ── Submit Phone Verification ────────────────────────────────────
  const handlePhoneRequest = async (e) => {
    e.preventDefault();
    if (!phoneOtpForm.phone.trim()) { setPhoneMsg({ type: 'error', text: 'Enter phone number' }); return; }
    setPhoneLoading(true); setPhoneMsg({ type: '', text: '' });
    try {
      await api.post('/api/auth/request-phone-verify', { phoneNumber: phoneOtpForm.phone });
      setPhoneMsg({ type: 'success', text: 'OTP sent! Please enter it below.' });
      setPhoneOtpForm(f => ({ ...f, step: 2 }));
    } catch {
      setPhoneMsg({ type: 'error', text: 'Failed to send OTP.' });
    } finally { setPhoneLoading(false); }
  };

  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    if (!phoneOtpForm.otp.trim()) { setPhoneMsg({ type: 'error', text: 'Enter OTP' }); return; }
    setPhoneLoading(true); setPhoneMsg({ type: '', text: '' });
    try {
      await api.post('/api/auth/verify-phone', { phoneNumber: phoneOtpForm.phone, otp: phoneOtpForm.otp });
      setPhoneMsg({ type: 'success', text: 'Phone verified successfully! Refreshing...' });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setPhoneMsg({ type: 'error', text: 'Invalid OTP.' });
    } finally { setPhoneLoading(false); }
  };

  const { checks, pct } = getCompletion(user, form);
  const orders = user?.totalOrders || 0;
  const rating = user?.rating || 0;
  const league = getLeague(orders, rating);
  const nextLeague = getNextLeague(league);
  const roleStyle = roleColors[user?.role] || roleColors.CUSTOMER;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const trustScore = user?.trustScore || 10;

  const inputClass = "w-full px-4 py-3 rounded-xl border-1.5 border-gray-200 text-sm text-gray-900 outline-none transition-colors bg-gray-50 focus:bg-white focus:border-brand placeholder-gray-400";

  return (
    <div className="max-w-[680px] w-full font-sans animate-in fade-in duration-300">

      {/* ── Hero Card ─────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-brand/10 blur-xl pointer-events-none" />
        <div className="flex items-center sm:items-start md:items-center gap-5 flex-wrap md:flex-nowrap relative z-10">
          
          {/* Avatar */}
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-2xl font-black text-white overflow-hidden border-[3px] border-white/20">
              {(form.avatar || user?.avatar)
                ? <img src={form.avatar || user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                : initials}
            </div>
            <button
              onClick={() => setTab('edit')}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand border-2 border-gray-900 flex items-center justify-center cursor-pointer text-[10px] focus:outline-none"
            >✏️</button>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h1 className="text-xl font-black text-white m-0 tracking-tight truncate">
              {user?.name}
            </h1>
            <p className="text-white/50 text-xs mt-0.5 mb-2.5 truncate">{user?.email}</p>
            <div className="flex gap-1.5 flex-wrap justify-center sm:justify-start items-center">
              <Chip text={roleStyle.label} colorClass={roleStyle.color} bgClass={roleStyle.bg} />
              <Chip text={`${league.emoji} ${league.label}`} customColor={league.color} customBg={league.bg} />
              <Chip text={`⭐ ${trustScore} pts`} colorClass="text-brand" bgClass="bg-brand/15" />
            </div>
          </div>

          {/* Profile completion ring */}
          <div className="text-center shrink-0 mx-auto sm:mx-0 hidden sm:block">
            <div className="relative w-14 h-14 mx-auto">
              <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle cx="28" cy="28" r="22" fill="none" stroke="#fc8019" strokeWidth="4"
                  strokeDasharray={`${(pct / 100) * 138} 138`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white">
                {pct}%
              </div>
            </div>
            <p className="text-[9px] text-white/40 mt-1 uppercase tracking-widest font-bold">Profile</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div className="flex bg-gray-50 rounded-2xl p-1 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'edit',   label: '✏️ Edit Profile' },
          { id: 'league', label: `${league.emoji} League` },
          { id: 'verify', label: '🆔 Verification' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`
            flex-1 px-4 py-2.5 rounded-xl border-none text-[13px] whitespace-nowrap transition-all duration-200 cursor-pointer focus:outline-none
            ${tab === t.id ? 'bg-white text-gray-900 font-bold shadow-sm' : 'bg-transparent text-gray-500 font-medium hover:text-gray-900'}
          `}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: Edit Profile ═══════════════════════════ */}
      {tab === 'edit' && (
        <div className="flex flex-col gap-4">

          {msg.text && (
            <div className={`px-4 py-3 rounded-xl text-[13px] font-semibold border ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-500'}`}>
              {msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}
            </div>
          )}

          {/* Profile completion checklist */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[13px] font-bold text-gray-900 m-0">Profile Completion</h3>
              <span className={`text-xl font-black ${pct === 100 ? 'text-emerald-500' : 'text-brand'}`}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {checks.map(c => (
                <div key={c.label} className={`flex items-center gap-2 text-xs font-medium ${c.done ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <span>{c.done ? '✅' : '⬜'}</span> {c.label}
                </div>
              ))}
            </div>
          </div>

          {/* Camera/Photo picker */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">📸 Profile Photo</h3>
            <div className="flex items-center flex-col sm:flex-row gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400 shrink-0">
                {(form.avatar || user?.avatar)
                  ? <img src={form.avatar || user?.avatar} alt="preview" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                <button onClick={openCamera} className="px-4 py-2.5 rounded-xl border-1.5 border-brand/50 bg-brand/5 text-brand font-bold text-xs hover:bg-brand/10 transition-colors focus:outline-none">
                  📷 Take Photo
                </button>
                <button onClick={() => fileRef.current?.click()} className="px-4 py-2.5 rounded-xl border-1.5 border-gray-200 bg-gray-50 text-gray-600 font-bold text-xs hover:bg-gray-100 transition-colors focus:outline-none">
                  📁 Upload Image
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>
          </div>

          {/* Camera modal */}
          {cameraOpen && (
            <div className="fixed inset-0 bg-black/90 z-[999] flex flex-col items-center justify-center gap-4 p-4 animate-in fade-in">
              <video ref={videoRef} autoPlay playsInline className="w-full max-w-[380px] rounded-2xl border-4 border-brand shadow-2xl" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-4 items-center">
                <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-4 border-white bg-brand text-2xl shadow-[0_4px_20px_rgba(252,128,25,0.5)] flex items-center justify-center hover:scale-105 transition-transform focus:outline-none">
                  📸
                </button>
                <button onClick={closeCamera} className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors focus:outline-none">
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Basic info */}
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col gap-3.5">
              <h3 className="text-sm font-bold text-gray-900 m-0">Basic Info</h3>
              {[
                { field: 'name',    label: 'Full Name',          type: 'text',  placeholder: 'Your full name' },
                { field: 'phone',   label: 'Phone',              type: 'tel',   placeholder: '+91 98765 43210', hint: '• Optional' },
              ].map(({ field, label, type, placeholder, hint }) => (
                <div key={field}>
                  <label className="text-[11px] font-bold text-gray-900 block mb-1.5 uppercase tracking-widest">
                    {label} {hint && <span className="text-gray-400 normal-case font-normal">{hint}</span>}
                  </label>
                  <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder} className={inputClass} />
                </div>
              ))}

              {/* Email read-only */}
              <div>
                <label className="text-[11px] font-bold text-gray-900 block mb-1.5 uppercase tracking-widest">
                  Email <span className="text-gray-400 normal-case font-normal">• Read-only</span>
                </label>
                <input value={user?.email || ''} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col gap-3.5">
              <h3 className="text-sm font-bold text-gray-900 m-0">About You</h3>
              <div>
                <label className="text-[11px] font-bold text-gray-900 block mb-1.5 uppercase tracking-widest">
                  Bio <span className="text-gray-400 normal-case font-normal">• Shown to others</span>
                </label>
                <textarea value={form.bio} onChange={set('bio')} placeholder="Tell others about yourself…" rows={3} className={`${inputClass} resize-y leading-relaxed font-inherit`} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-900 block mb-1.5 uppercase tracking-widest">
                  City / Address <span className="text-gray-400 normal-case font-normal">• Optional</span>
                </label>
                <input value={form.address} onChange={set('address')} placeholder="e.g. Indiranagar, Bengaluru" className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl border-none text-white font-bold text-base shadow-[0_4px_14px_rgba(252,128,25,0.35)] transition-all duration-200 focus:outline-none ${loading ? 'bg-brand-light cursor-not-allowed' : 'bg-brand hover:bg-brand-dark hover:-translate-y-0.5'}`}>
              {loading ? '⏳ Saving…' : '✓ Save Profile'}
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handlePwdChange} className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col gap-4 mt-6">
            <h3 className="text-sm font-bold text-gray-900 m-0">Change Password</h3>
            {pwdMsg.text && (
              <div className={`p-3 rounded-lg text-sm font-medium ${pwdMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {pwdMsg.text}
              </div>
            )}
            <div>
              <label className="text-[11px] font-bold text-gray-900 block mb-1.5 uppercase tracking-widest">Current Password</label>
              <input type="password" required value={pwdForm.currentPassword} onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-900 block mb-1.5 uppercase tracking-widest">New Password</label>
              <input type="password" required value={pwdForm.newPassword} onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))} className={inputClass} />
            </div>
            <button type="submit" disabled={pwdLoading} className={`w-full py-3 rounded-xl border-2 font-bold text-sm transition-all focus:outline-none ${pwdLoading ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}>
              {pwdLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* ══ TAB: League ═════════════════════════════════ */}
      {tab === 'league' && (
        <div className="flex flex-col gap-4">
          {/* Current league */}
          <div className="rounded-3xl p-6 md:p-8 text-center" style={{ background: `linear-gradient(135deg, ${league.color}15, ${league.color}05)`, border: `2px solid ${league.color}30` }}>
            <div className="text-6xl mb-3 drop-shadow-sm">{league.emoji}</div>
            <h2 className="text-[1.6rem] font-black tracking-tight m-0 mb-1.5" style={{ color: league.color }}>
              {league.label} League
            </h2>
            <p className="text-gray-500 text-sm m-0 mb-6">{league.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Orders', value: orders, icon: '📦' },
                { label: 'Rating', value: rating > 0 ? rating.toFixed(1) : '—', icon: '⭐' },
                { label: 'Trust Score', value: trustScore, icon: '🛡️' },
              ].map(s => (
                <div key={s.label} className="bg-white/60 rounded-xl p-3 shadow-sm backdrop-blur-sm">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-xl font-black text-gray-900 tracking-tight">{s.value}</div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Next league */}
          {nextLeague && (
            <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 m-0 mb-4">
                Next up: {nextLeague.emoji} {nextLeague.label}
              </h3>
              {[
                { label: 'Orders needed', current: orders, need: nextLeague.minOrders, unit: 'orders' },
                { label: 'Rating needed', current: rating, need: nextLeague.minRating, unit: '★', decimal: true },
              ].map(r => {
                const pct = Math.min(100, r.decimal ? (r.current / r.need) * 100 : (r.current / r.need) * 100);
                return (
                  <div key={r.label} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-semibold text-gray-500">{r.label}</span>
                      <span className="font-bold text-gray-900">
                        {r.decimal ? r.current.toFixed(1) : r.current} / {r.need} {r.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: nextLeague.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {nextLeague === null && (
            <div className="text-center p-6 bg-purple-50 rounded-3xl border border-purple-200">
              <div className="text-5xl mb-2 drop-shadow-sm">👑</div>
              <p className="font-black text-purple-600 text-sm m-0">You've reached the highest league!</p>
            </div>
          )}

          {/* All leagues */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 m-0 mb-4">All Leagues</h3>
            <div className="flex flex-col gap-2.5">
              {LEAGUES.map(l => {
                const reached = orders >= l.minOrders && rating >= l.minRating;
                const isCurrent = l.id === league.id;
                return (
                  <div key={l.id} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-1.5 transition-opacity ${isCurrent ? 'bg-opacity-10 border-opacity-40' : 'bg-gray-50 border-gray-100'} ${reached ? 'opacity-100' : 'opacity-50'}`} style={{ backgroundColor: isCurrent ? `${l.color}15` : '', borderColor: isCurrent ? `${l.color}40` : '' }}>
                    <span className="text-2xl md:text-3xl leading-none">{l.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold text-[13px]" style={{ color: l.color }}>{l.label}</div>
                      <div className="text-[11px] text-gray-500 font-medium">{l.minOrders} orders &middot; {l.minRating}★ rating</div>
                    </div>
                    {isCurrent && <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ color: l.color, background: `${l.color}20` }}>Current</span>}
                    {reached && !isCurrent && <span className="text-lg">✅</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: Verification ═══════════════════════════ */}
      {tab === 'verify' && (
        <div className="flex flex-col gap-4">

          {/* Status overview */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 m-0 mb-4">Verification Status</h3>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Phone Verified',  done: user?.phoneVerified,    icon: '📱', points: '+10 pts' },
                { label: 'Govt ID Verified',done: user?.govtIdVerified,   icon: '🪪', points: '+40 pts' },
              ].map(v => (
                <div key={v.label} className={`flex items-center gap-3 p-3 rounded-xl border ${v.done ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                  <span className="text-xl shrink-0">{v.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-[13px] text-gray-900">{v.label}</div>
                    <div className="text-[11px] font-medium text-gray-500">Rewards {v.points}</div>
                  </div>
                  <span className="text-lg shrink-0">{v.done ? '✅' : '⏳'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Govt ID submission */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 m-0 mb-1.5">
              🆔 Government ID Verification
            </h3>
            <p className="text-xs text-gray-500 m-0 mb-5 leading-relaxed">
              Submit Aadhaar, PAN, Passport, or Driving License. +40 Trust Points on approval.
            </p>
            {user?.govtIdVerified ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
                <div className="text-2xl mb-1">✅</div>
                <p className="font-bold text-emerald-600 m-0 text-sm">ID Verified! (ID: {user?.govtIdNumber})</p>
              </div>
            ) : user?.govtIdNumber ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
                <div className="text-2xl mb-1">⏳</div>
                <p className="font-bold text-amber-600 m-0 text-sm">Verification Pending</p>
                <p className="text-[11px] font-medium text-amber-500 mt-1 mb-0">Admin is reviewing your details.</p>
              </div>
            ) : (
              <form onSubmit={handleGovtSubmit} className="flex flex-col gap-3.5">
                {govtMsg.text && (
                  <div className={`px-3.5 py-2.5 rounded-xl text-[12px] font-semibold ${govtMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {govtMsg.type === 'success' ? '✅ ' : '❌ '}{govtMsg.text}
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-bold text-gray-900 block mb-1.5 uppercase tracking-widest">
                    ID Number (Aadhaar / PAN / Passport)
                  </label>
                  <input value={govtForm.idNumber} onChange={e => setGovtForm(f => ({ ...f, idNumber: e.target.value }))}
                    placeholder="XXXX XXXX XXXX or ABCDE1234F"
                    className={inputClass} />
                </div>

                {/* ID Photo upload */}
                <div>
                  <label className="text-[11px] font-bold text-gray-900 block mb-2 uppercase tracking-widest">
                    Upload ID Photo
                  </label>
                  <div className="flex gap-2.5 items-center flex-wrap">
                    <button type="button" onClick={() => govtFileRef.current?.click()} className="px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-600 font-bold text-[13px] hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none">
                      📎 Choose File
                    </button>
                    <input ref={govtFileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleGovtFileUpload} />
                    {govtForm.idUrl && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">✅ File ready</span>}
                  </div>
                  {govtForm.idUrl && govtForm.idUrl.startsWith('data:image') && (
                    <img src={govtForm.idUrl} alt="ID preview" className="mt-3 max-w-full max-h-[120px] rounded-xl object-contain border border-gray-100" />
                  )}
                </div>

                <button type="submit" disabled={govtLoading} className={`w-full py-3.5 rounded-xl border-none text-white font-bold text-sm shadow-[0_4px_14px_rgba(252,128,25,0.3)] transition-all duration-200 mt-2 focus:outline-none ${govtLoading ? 'bg-brand-light cursor-not-allowed' : 'bg-brand hover:bg-brand-dark hover:-translate-y-0.5'}`}>
                  {govtLoading ? '⏳ Submitting…' : '🆔 Submit for Verification'}
                </button>
                <p className="text-[11px] font-medium text-gray-400 text-center m-0 mt-1">
                  Admin will review your ID within 24 hours.
                </p>
              </form>
            )}
          </div>

          {/* Phone Verification */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 m-0 mb-1.5">📱 Phone Verification</h3>
            <p className="text-xs text-gray-500 m-0 mb-5 leading-relaxed">Verify your phone number. +10 Trust Points.</p>
            {user?.phoneVerified ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
                <div className="text-2xl mb-1">✅</div>
                <p className="font-bold text-emerald-600 m-0 text-sm">Phone Verified! ({user?.phoneNumber})</p>
              </div>
            ) : (
              <form onSubmit={phoneOtpForm.step === 1 ? handlePhoneRequest : handlePhoneVerify} className="flex flex-col gap-3.5">
                {phoneMsg.text && (
                  <div className={`px-3.5 py-2.5 rounded-xl text-[12px] font-semibold ${phoneMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {phoneMsg.type === 'success' ? '✅ ' : '❌ '}{phoneMsg.text}
                  </div>
                )}
                {phoneOtpForm.step === 1 ? (
                  <div>
                    <label className="text-[11px] font-bold text-gray-900 block mb-1.5 uppercase tracking-widest">Phone Number</label>
                    <input value={phoneOtpForm.phone} onChange={e => setPhoneOtpForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className={inputClass} />
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-bold text-gray-900 block mb-1.5 uppercase tracking-widest">Enter OTP</label>
                    <input value={phoneOtpForm.otp} onChange={e => setPhoneOtpForm(f => ({ ...f, otp: e.target.value }))} placeholder="123456" className={inputClass} />
                  </div>
                )}
                <button type="submit" disabled={phoneLoading} className={`w-full py-3.5 rounded-xl border-none text-white font-bold text-sm shadow-[0_4px_14px_rgba(252,128,25,0.3)] transition-all duration-200 mt-2 focus:outline-none ${phoneLoading ? 'bg-brand-light cursor-not-allowed' : 'bg-brand hover:bg-brand-dark hover:-translate-y-0.5'}`}>
                  {phoneLoading ? '⏳ Wait...' : phoneOtpForm.step === 1 ? 'Send OTP' : 'Verify OTP'}
                </button>
              </form>
            )}
          </div>
        </div>
        )}
      </div>
    );
  }
