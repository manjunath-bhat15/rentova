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

  const unitLabels = {
    HOUR: t('unitHr'),
    DAY: t('unitDay'),
    PIECE: t('unitPc'),
    SESSION: t('unitSession'),
  };

  return (
    <div
      className="bento-card"
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      onClick={() => !onBook && navigate('/dashboard/services')}
    >
      {/* Category Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            background: getCategoryColor(service.category) + '18',
            color: getCategoryColor(service.category),
          }}
        >
          {service.category}
        </span>
        {!service.active && (
          <span className="badge badge-red">{t('inactive')}</span>
        )}
      </div>

      {/* Service Image */}
      {service.images && (
        <div style={{
          width: '100%',
          height: '140px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--glass-border)',
          marginTop: '-4px',
          marginBottom: '-4px'
        }}>
          <img
            src={service.images}
            alt={service.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
      )}

      {/* Title & Description */}
      <div>
        <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: '4px' }}>
          {service.title}
        </h3>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-sm)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {service.description || t('noDesc')}
        </p>
      </div>

      {/* Vendor */}
      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          width: 20, height: 20, borderRadius: '50%',
          background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'white',
        }}>
          {service.vendorName?.[0]?.toUpperCase()}
        </span>
        {service.vendorName}
        {service.distanceKm != null && (
          <span style={{ marginLeft: 'auto', color: 'var(--accent-success)', fontWeight: 700 }}>
            {service.distanceKm} km
          </span>
        )}
        {service.distanceKm == null && service.location && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📍 {service.location}
          </span>
        )}
      </div>

      {/* Price & Action */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 'auto', paddingTop: 'var(--space-sm)',
        borderTop: '1px solid var(--glass-border)',
      }}>
        <div>
          <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--accent-secondary)' }}>
            ₹{service.pricePerUnit}
          </span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            {unitLabels[service.unit] || ''}
          </span>
        </div>
        {onBook && (
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.stopPropagation(); onBook(service); }}
          >
            {t('bookNow')}
          </button>
        )}
        {isVendor && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate('/dashboard/services/create'); }}
          >
            {t('edit')}
          </button>
        )}
      </div>
    </div>
  );
}
