import { useNavigate } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const categoryEmoji = {
  'Equipment': '🔧',
  'Vehicles': '🚗',
  'Spaces': '🏠',
  'Tools': '⚙️',
  'Electronics': '📱',
  'Other': '📦',
};

const categoryColors = {
  'Equipment': { bg: 'rgba(252,128,25,0.1)', text: '#fc8019' },
  'Vehicles': { bg: 'rgba(0,188,212,0.1)', text: '#00bcd4' },
  'Spaces': { bg: 'rgba(139,92,246,0.1)', text: '#8b5cf6' },
  'Tools': { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
  'Electronics': { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
  'Other': { bg: 'rgba(156,163,175,0.1)', text: '#6b7280' },
};

export default function ServiceCard({ service, onBook, isVendor }) {
  const navigate = useNavigate();
  const { t } = useThemeLanguage();

  const catStyle = categoryColors[service.category] || categoryColors['Other'];
  const catEmoji = categoryEmoji[service.category] || '📦';

  const getFirstImage = () => {
    if (!service.images) return null;
    try {
      const parsed = JSON.parse(service.images);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      return service.images;
    } catch {
      return service.images;
    }
  };

  const firstImg = getFirstImage();

  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      className="glass-card"
      onClick={() => !onBook && navigate('/dashboard/services')}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Image Area */}
      <div style={{
        position: 'relative',
        height: '200px',
        overflow: 'hidden',
        background: firstImg ? '#f0f0f0' : catStyle.bg,
        flexShrink: 0,
      }}>
        {firstImg ? (
          <img
            src={firstImg}
            alt={service.title}
            loading="lazy"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '56px',
          }}>
            {catEmoji}
          </div>
        )}

        {/* Category Badge */}
        <span style={{
          position: 'absolute', top: '12px', left: '12px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          background: 'rgba(0,0,0,0.5)',
          color: '#ffffff',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          {catEmoji} {service.category}
        </span>

        {/* Inactive badge */}
        {!service.active && (
          <span style={{
            position: 'absolute', top: '12px', right: '12px',
            padding: '4px 10px', borderRadius: '999px',
            fontSize: '11px', fontWeight: 700,
            background: 'rgba(239,68,68,0.85)', color: '#fff',
            backdropFilter: 'blur(8px)',
          }}>
            {t('inactive')}
          </span>
        )}

        {/* Distance badge */}
        {service.distanceKm != null && (
          <span style={{
            position: 'absolute', bottom: '12px', right: '12px',
            padding: '4px 10px', borderRadius: '999px',
            fontSize: '11px', fontWeight: 700,
            background: 'rgba(16,185,129,0.9)', color: '#fff',
            backdropFilter: 'blur(8px)',
          }}>
            📍 {service.distanceKm} km
          </span>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {/* Vendor chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: 800, color: 'white',
            flexShrink: 0,
          }}>
            {service.vendorName?.[0]?.toUpperCase()}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {service.vendorName}
          </span>
          {service.location && service.distanceKm == null && (
            <span style={{
              marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px',
            }} title={service.location}>
              📍 {service.location}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {service.title}
        </h3>

        {/* Description */}
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '12px',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: 0,
          flex: 1,
        }}>
          {service.description || t('noDesc')}
        </p>

        {/* Price + Action Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '10px',
          borderTop: '1px solid var(--glass-border)',
          marginTop: 'auto',
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              ₹{service.pricePerUnit}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              per {service.unit?.toLowerCase() || 'unit'}
              {service.securityDeposit > 0 && (
                <> · ₹{service.securityDeposit} deposit</>
              )}
            </div>
          </div>

          {onBook && (
            <button
              className="btn btn-primary"
              onClick={(e) => { e.stopPropagation(); onBook(service); }}
              style={{
                borderRadius: '999px',
                padding: '8px 18px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {t('bookNow')}
            </button>
          )}
          {isVendor && (
            <button
              className="btn btn-secondary"
              onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/services/edit/${service.id}`); }}
              style={{
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '12px',
              }}
            >
              {t('edit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
