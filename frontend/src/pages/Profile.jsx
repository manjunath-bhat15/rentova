import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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
  CUSTOMER: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Customer' },
  VENDOR:   { color: '#fc8019', bg: 'rgba(252,128,25,0.1)',  label: 'Vendor' },
  ADMIN:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Admin' },
};

function Chip({ text, color, bg }) {
  return (
    <span style={{ padding: '3px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: bg, color }}>{text}</span>
  );
}

/* ═══════════════════════════════════════════════════ */
export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState('edit');
  const [form, setForm] = useState({ name: '', avatar: '', phone: '', bio: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [focused, setFocused] = useState(null);
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

  const set = field => e => setForm(f => ({ ...f, [field]: typeof e === 'string' ? e : e.target.value }));

  // ── Camera ──────────────────────────────────────────
  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(s);
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch {
      alert('Camera access denied. Please allow camera permission or upload a photo instead.');
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
      await api.post('/api/auth/verify-id', { idNumber: govtForm.idNumber, idUrl: govtForm.idUrl });
      setGovtMsg({ type: 'success', text: 'ID submitted for verification! Admin will review shortly.' });
    } catch {
      setGovtMsg({ type: 'error', text: 'Submission failed. Please try again.' });
    } finally {
      setGovtLoading(false);
    }
  };

  const { checks, pct } = getCompletion(user, form);
  const orders = user?.totalOrders || 0;
  const rating = user?.rating || 0;
  const league = getLeague(orders, rating);
  const nextLeague = getNextLeague(league);
  const roleStyle = roleColors[user?.role] || roleColors.CUSTOMER;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const trustScore = user?.trustScore || 10;

  const inputStyle = active => ({
    width: '100%', padding: '13px 16px', borderRadius: '12px',
    border: `1.5px solid ${active ? '#fc8019' : '#e8e8e8'}`,
    fontSize: '14px', color: '#1c1c1c', outline: 'none',
    background: active ? '#fff' : '#fafafa',
    transition: 'all 0.2s ease', boxSizing: 'border-box',
  });

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", maxWidth: '680px' }}>

      {/* ── Hero Card ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 100%)',
        borderRadius: '20px', padding: '24px 28px', marginBottom: '20px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(252,128,25,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', position: 'relative' }}>
          {/* Avatar with camera overlay */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #fc8019, #ff9f43)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', fontWeight: 900, color: '#fff', overflow: 'hidden',
              border: '3px solid rgba(255,255,255,0.2)',
            }}>
              {(form.avatar || user?.avatar)
                ? <img src={form.avatar || user?.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <button
              onClick={() => setTab('edit')}
              style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 24, height: 24, borderRadius: '50%',
                background: '#fc8019', border: '2px solid #1c1c1c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '11px',
              }}
            >✏️</button>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
              {user?.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 10px' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip text={roleStyle.label} color={roleStyle.color} bg={roleStyle.bg} />
              <Chip text={`${league.emoji} ${league.label}`} color={league.color} bg={league.bg} />
              <Chip text={`⭐ ${trustScore} pts`} color="#fc8019" bg="rgba(252,128,25,0.15)" />
            </div>
          </div>

          {/* Profile completion ring */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 56, height: 56 }}>
              <svg viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)', width: 56, height: 56 }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle cx="28" cy="28" r="22" fill="none" stroke="#fc8019" strokeWidth="4"
                  strokeDasharray={`${(pct / 100) * 138} 138`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff' }}>
                {pct}%
              </div>
            </div>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Profile
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '14px', padding: '4px', marginBottom: '20px', gap: '2px', overflowX: 'auto' }}>
        {[
          { id: 'edit',   label: '✏️ Edit Profile' },
          { id: 'league', label: `${league.emoji} League` },
          { id: 'verify', label: '🆔 Verification' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 14px', borderRadius: '11px', border: 'none',
            background: tab === t.id ? '#fff' : 'transparent',
            color: tab === t.id ? '#1c1c1c' : '#686b78',
            fontWeight: tab === t.id ? 700 : 500, fontSize: '13px', cursor: 'pointer',
            transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══ TAB: Edit Profile ═══════════════════════════ */}
      {tab === 'edit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {msg.text && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600,
              background: msg.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              color: msg.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}
            </div>
          )}

          {/* Profile completion checklist */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '18px 22px', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>Profile Completion</h3>
              <span style={{ fontSize: '20px', fontWeight: 900, color: pct === 100 ? '#10b981' : '#fc8019' }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: '#f0f0f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#fc8019', borderRadius: '999px', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {checks.map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: c.done ? '#10b981' : '#93959f' }}>
                  <span>{c.done ? '✅' : '⬜'}</span> {c.label}
                </div>
              ))}
            </div>
          </div>

          {/* Camera/Photo picker */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 14px' }}>📸 Profile Photo</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                background: '#f5f5f5', border: '2px solid #f0f0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 700, color: '#93959f', flexShrink: 0,
              }}>
                {(form.avatar || user?.avatar)
                  ? <img src={form.avatar || user?.avatar} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
              <div style={{ flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={openCamera} style={{
                  padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #fc8019',
                  background: 'rgba(252,128,25,0.08)', color: '#fc8019',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                }}>📷 Take Photo</button>
                <button onClick={() => fileRef.current?.click()} style={{
                  padding: '10px 16px', borderRadius: '12px', border: '1.5px solid #e8e8e8',
                  background: '#fafafa', color: '#686b78',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                }}>📁 Upload</button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              </div>
            </div>
            {/* URL fallback */}
            <div style={{ marginTop: '12px' }}>
              <input
                type="url" value={form.avatar} onChange={set('avatar')}
                placeholder="Or paste image URL…"
                onFocus={() => setFocused('avatar')} onBlur={() => setFocused(null)}
                style={inputStyle(focused === 'avatar')}
              />
            </div>
          </div>

          {/* Camera modal */}
          {cameraOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '380px', borderRadius: '16px', border: '3px solid #fc8019' }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={capturePhoto} style={{
                  width: 72, height: 72, borderRadius: '50%', border: '4px solid #fff',
                  background: '#fc8019', fontSize: '28px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(252,128,25,0.5)',
                }}>📸</button>
                <button onClick={closeCamera} style={{
                  padding: '16px 28px', borderRadius: '14px', border: 'none',
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                }}>✕ Cancel</button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Basic info */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>Basic Info</h3>
              {[
                { field: 'name',    label: 'Full Name',          type: 'text',  placeholder: 'Your full name' },
                { field: 'phone',   label: 'Phone',              type: 'tel',   placeholder: '+91 98765 43210', hint: '• Optional' },
              ].map(({ field, label, type, placeholder, hint }) => (
                <div key={field}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label} {hint && <span style={{ color: '#93959f', textTransform: 'none', fontSize: '11px', fontWeight: 400 }}>{hint}</span>}
                  </label>
                  <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder}
                    onFocus={() => setFocused(field)} onBlur={() => setFocused(null)}
                    style={inputStyle(focused === field)} />
                </div>
              ))}

              {/* Email read-only */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email <span style={{ color: '#93959f', textTransform: 'none', fontSize: '11px', fontWeight: 400 }}>• Read-only</span>
                </label>
                <input value={user?.email || ''} disabled style={{ ...inputStyle(false), opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>

            {/* About */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: 0 }}>About You</h3>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Bio <span style={{ color: '#93959f', textTransform: 'none', fontSize: '11px', fontWeight: 400 }}>• Shown to others</span>
                </label>
                <textarea value={form.bio} onChange={set('bio')} placeholder="Tell others about yourself…" rows={3}
                  onFocus={() => setFocused('bio')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle(focused === 'bio'), resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  City / Address <span style={{ color: '#93959f', textTransform: 'none', fontSize: '11px', fontWeight: 400 }}>• Optional</span>
                </label>
                <input value={form.address} onChange={set('address')} placeholder="e.g. Indiranagar, Bengaluru"
                  onFocus={() => setFocused('address')} onBlur={() => setFocused(null)}
                  style={inputStyle(focused === 'address')} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
              background: loading ? '#ffc895' : '#fc8019', color: '#fff',
              fontWeight: 800, fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(252,128,25,0.35)', transition: 'all 0.2s ease',
            }}>
              {loading ? '⏳ Saving…' : '✓ Save Profile'}
            </button>
          </form>
        </div>
      )}

      {/* ══ TAB: League ═════════════════════════════════ */}
      {tab === 'league' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Current league */}
          <div style={{
            background: `linear-gradient(135deg, ${league.color}15, ${league.color}05)`,
            border: `2px solid ${league.color}30`,
            borderRadius: '20px', padding: '28px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '8px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>{league.emoji}</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: league.color, margin: '0 0 6px', letterSpacing: '-0.03em' }}>
              {league.label} League
            </h2>
            <p style={{ color: '#686b78', fontSize: '14px', margin: '0 0 20px' }}>{league.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Orders', value: orders, icon: '📦' },
                { label: 'Rating', value: rating > 0 ? rating.toFixed(1) : '—', icon: '⭐' },
                { label: 'Trust Score', value: trustScore, icon: '🛡️' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '14px', padding: '14px 10px' }}>
                  <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#1c1c1c', letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#93959f', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Next league */}
          {nextLeague && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 14px' }}>
                Next up: {nextLeague.emoji} {nextLeague.label}
              </h3>
              {[
                { label: 'Orders needed', current: orders, need: nextLeague.minOrders, unit: 'orders' },
                { label: 'Rating needed', current: rating, need: nextLeague.minRating, unit: '★', decimal: true },
              ].map(r => {
                const pct = Math.min(100, r.decimal ? (r.current / r.need) * 100 : (r.current / r.need) * 100);
                return (
                  <div key={r.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#686b78' }}>{r.label}</span>
                      <span style={{ fontWeight: 700, color: '#1c1c1c' }}>
                        {r.decimal ? r.current.toFixed(1) : r.current} / {r.need} {r.unit}
                      </span>
                    </div>
                    <div style={{ height: 8, background: '#f0f0f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: nextLeague.color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {nextLeague === null && (
            <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(156,39,176,0.06)', borderRadius: '16px', border: '1px solid rgba(156,39,176,0.2)' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>👑</div>
              <p style={{ fontWeight: 800, color: '#9c27b0', fontSize: '15px', margin: 0 }}>You've reached the highest league!</p>
            </div>
          )}

          {/* All leagues */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 14px' }}>All Leagues</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {LEAGUES.map(l => {
                const reached = orders >= l.minOrders && rating >= l.minRating;
                const isCurrent = l.id === league.id;
                return (
                  <div key={l.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px',
                    borderRadius: '12px',
                    background: isCurrent ? `${l.color}10` : '#fafafa',
                    border: `1.5px solid ${isCurrent ? l.color + '40' : '#f0f0f0'}`,
                    opacity: reached ? 1 : 0.5,
                  }}>
                    <span style={{ fontSize: '26px', lineHeight: 1 }}>{l.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: l.color }}>{l.label}</div>
                      <div style={{ fontSize: '11px', color: '#93959f' }}>{l.minOrders} orders · {l.minRating}★ rating</div>
                    </div>
                    {isCurrent && <span style={{ fontSize: '11px', fontWeight: 700, color: l.color, background: `${l.color}15`, padding: '3px 10px', borderRadius: '999px' }}>Current</span>}
                    {reached && !isCurrent && <span style={{ fontSize: '14px' }}>✅</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: Verification ═══════════════════════════ */}
      {tab === 'verify' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Status overview */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 14px' }}>Verification Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Email Verified',  done: user?.isVerified,      icon: '📧', points: '+10 pts' },
                { label: 'Phone Verified',  done: user?.phoneVerified,    icon: '📱', points: '+10 pts' },
                { label: 'Govt ID Verified',done: user?.govtIdVerified,   icon: '🆔', points: '+40 pts' },
                { label: 'GST Verified',    done: user?.gstVerified,      icon: '🏢', points: '+20 pts' },
              ].map(v => (
                <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: v.done ? 'rgba(16,185,129,0.06)' : '#fafafa', border: `1px solid ${v.done ? 'rgba(16,185,129,0.15)' : '#f0f0f0'}` }}>
                  <span style={{ fontSize: '20px' }}>{v.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#1c1c1c' }}>{v.label}</div>
                    <div style={{ fontSize: '11px', color: '#93959f' }}>Rewards {v.points}</div>
                  </div>
                  <span style={{ fontSize: '18px' }}>{v.done ? '✅' : '⏳'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Govt ID submission */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1c1c1c', margin: '0 0 6px' }}>
              🆔 Government ID Verification
            </h3>
            <p style={{ fontSize: '12px', color: '#686b78', margin: '0 0 16px' }}>
              Submit Aadhaar, PAN, Passport, or Driving License. +40 Trust Points on approval.
            </p>
            {user?.govtIdVerified ? (
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>✅</div>
                <p style={{ fontWeight: 700, color: '#10b981', margin: 0 }}>ID Verified! (ID: {user?.govtIdNumber})</p>
              </div>
            ) : (
              <form onSubmit={handleGovtSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {govtMsg.text && (
                  <div style={{
                    padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                    background: govtMsg.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    color: govtMsg.type === 'success' ? '#10b981' : '#ef4444',
                  }}>{govtMsg.type === 'success' ? '✅ ' : '❌ '}{govtMsg.text}</div>
                )}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ID Number (Aadhaar / PAN / Passport)
                  </label>
                  <input value={govtForm.idNumber} onChange={e => setGovtForm(f => ({ ...f, idNumber: e.target.value }))}
                    placeholder="XXXX XXXX XXXX or ABCDE1234F"
                    onFocus={() => setFocused('govtId')} onBlur={() => setFocused(null)}
                    style={inputStyle(focused === 'govtId')} />
                </div>

                {/* ID Photo upload */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#1c1c1c', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Upload ID Photo
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => govtFileRef.current?.click()} style={{
                      padding: '11px 18px', borderRadius: '12px', border: '1.5px dashed #e8e8e8',
                      background: '#fafafa', color: '#686b78', fontWeight: 600, fontSize: '13px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      📎 Choose File
                    </button>
                    <input ref={govtFileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleGovtFileUpload} />
                    {govtForm.idUrl && <span style={{ fontSize: '12px', color: '#10b981', alignSelf: 'center', fontWeight: 600 }}>✅ File ready</span>}
                  </div>
                  {govtForm.idUrl && govtForm.idUrl.startsWith('data:image') && (
                    <img src={govtForm.idUrl} alt="ID preview" style={{ marginTop: '10px', maxWidth: '100%', maxHeight: '120px', borderRadius: '10px', objectFit: 'contain', border: '1px solid #f0f0f0' }} />
                  )}
                </div>

                <button type="submit" disabled={govtLoading} style={{
                  width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                  background: govtLoading ? '#ffc895' : '#fc8019', color: '#fff',
                  fontWeight: 800, fontSize: '15px', cursor: govtLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(252,128,25,0.3)',
                }}>
                  {govtLoading ? '⏳ Submitting…' : '🆔 Submit for Verification'}
                </button>
                <p style={{ fontSize: '11px', color: '#93959f', textAlign: 'center', margin: 0 }}>
                  Admin will review your ID within 24 hours.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
