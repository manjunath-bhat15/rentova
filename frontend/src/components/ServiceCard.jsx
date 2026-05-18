import { useNavigate } from 'react-router-dom';

const unitLabels = {
  HOUR: '/hr',
  DAY: '/day',
  PIECE: '/pc',
  SESSION: '/session',
};

const categoryColors = {
  'Equipment': 'var(--accent-primary)',
  'Vehicles': 'var(--accent-secondary)',
  'Spaces': 'var(--accent-warning)',
  'Tools': 'var(--accent-success)',
  'Electronics': '#a29bfe',
  'Other': 'var(--text-muted)',
};

export default function ServiceCard({ service, onBook, isVendor }) {
  const navigate = useNavigate();

  const getCategoryColor = (cat) => categoryColors[cat] || 'var(--accent-primary)';

  return (
    <div
      className="bento-card"
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
      onClick={() => !onBook && navigate(`/dashboard/services/${service.id}`)}
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
          <span className="badge badge-red">Inactive</span>
        )}
      </div>

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
          {service.description || 'No description provided.'}
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
      </div>

      {/* Price & Action */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 'auto', paddingTop: 'var(--space-sm)',
        borderTop: '1px solid var(--glass-border)',
      }}>
        <div>
          <span style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--accent-secondary)' }}>
            ${service.pricePerUnit}
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
            Book Now
          </button>
        )}
        {isVendor && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/services/edit/${service.id}`); }}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
