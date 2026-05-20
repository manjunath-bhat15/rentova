import { useNavigate } from 'react-router-dom';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

const categoryColors = {
  'Equipment': 'var(--accent-primary)',
  'Vehicles': 'var(--accent-secondary)',
  'Spaces': 'var(--accent-warning)',
  'Tools': 'var(--accent-success)',
  'Electronics': 'var(--accent-primary)',
  'Other': 'var(--text-muted)',
};

export default function ServiceCard({ service, onBook, isVendor }) {
  const navigate = useNavigate();
  const { t } = useThemeLanguage();

  const getCategoryColor = (cat) => categoryColors[cat] || 'var(--accent-primary)';

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

  const unitLabels = {
    HOUR: t('unitHr'),
    DAY: t('unitDay'),
    PIECE: t('unitPc'),
    SESSION: t('unitSession'),
  };

  const firstImg = getFirstImage();

  return (
    <div
      className="modern-service-card"
      onClick={() => !onBook && navigate('/dashboard/services')}
    >
      {/* Service Image Container */}
      <div className="modern-service-card-image">
        {/* Category Tag Overlay */}
        <span
          className="modern-service-card-badge"
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '10px',
            fontWeight: 700,
            background: getCategoryColor(service.category) + '30',
            color: getCategoryColor(service.category),
          }}
        >
          {service.category}
        </span>
        
        {!service.active && (
          <span className="badge badge-red" style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
            {t('inactive')}
          </span>
        )}

        {firstImg ? (
          <img
            src={firstImg}
            alt={service.title}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', 
            background: 'var(--accent-gradient)', opacity: 0.15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px'
          }}>
            📦
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {service.title}
        </h3>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-sm)',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: 0
        }}>
          {service.description || t('noDesc')}
        </p>
      </div>

      {/* Vendor & Distance info */}
      <div style={{ 
        fontSize: 'var(--font-xs)', 
        color: 'var(--text-muted)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginTop: 'auto'
      }}>
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
          {service.vendorName?.[0]?.toUpperCase()}
        </span>
        <span style={{ fontWeight: 550 }}>{service.vendorName}</span>
        
        {service.distanceKm != null && (
          <span style={{ marginLeft: 'auto', color: 'var(--accent-success)', fontWeight: 700 }}>
            {service.distanceKm} km
          </span>
        )}
        {service.distanceKm == null && service.location && (
          <span style={{ 
            marginLeft: 'auto', 
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: '120px'
          }} title={service.location}>
            📍 {service.location}
          </span>
        )}
      </div>

      {/* Price & Action */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 'var(--space-sm)',
        borderTop: '1px solid var(--glass-border)',
      }}>
        <div>
          <span style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--accent-secondary)' }}>
            ₹{service.pricePerUnit}
          </span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginLeft: '2px' }}>
            /{service.unit?.toLowerCase() || ''}
          </span>
        </div>
        {onBook && (
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.stopPropagation(); onBook(service); }}
            style={{ borderRadius: '10px', padding: '6px 14px', fontSize: '12px' }}
          >
            {t('bookNow')}
          </button>
        )}
        {isVendor && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/services/edit/${service.id}`); }}
            style={{ borderRadius: '10px', padding: '6px 14px', fontSize: '12px' }}
          >
            {t('edit')}
          </button>
        )}
      </div>
    </div>
  );
}
