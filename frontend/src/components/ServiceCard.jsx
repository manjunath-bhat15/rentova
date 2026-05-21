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
  'Equipment': 'bg-brand/10 text-brand',
  'Vehicles': 'bg-cyan-50 text-cyan-500',
  'Spaces': 'bg-purple-50 text-purple-500',
  'Tools': 'bg-emerald-50 text-emerald-500',
  'Electronics': 'bg-blue-50 text-blue-500',
  'Other': 'bg-gray-100 text-gray-500',
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
      onClick={() => !onBook && navigate('/dashboard/services')}
      className="bg-white rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300 flex flex-col relative border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-xl group"
    >
      {/* Image Area */}
      <div className={`relative h-[200px] overflow-hidden shrink-0 ${firstImg ? 'bg-gray-100' : catStyle.split(' ')[0]}`}>
        {firstImg ? (
          <img
            src={firstImg}
            alt={service.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {catEmoji}
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-black/50 text-white backdrop-blur-md">
          {catEmoji} {service.category}
        </span>

        {/* Inactive badge */}
        {!service.active && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/90 text-white backdrop-blur-md shadow-sm">
            {t('inactive')}
          </span>
        )}

        {/* Distance badge */}
        {service.distanceKm != null && (
          <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
            📍 {service.distanceKm} km
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1 bg-white">
        {/* Vendor chip */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-[10px] font-black text-white shrink-0">
            {service.vendorName?.[0]?.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 font-medium truncate">
            {service.vendorName}
          </span>
          {service.location && service.distanceKm == null && (
            <span className="ml-auto text-[11px] text-gray-400 truncate max-w-[100px]" title={service.location}>
              📍 {service.location}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-gray-900 m-0 leading-snug tracking-tight line-clamp-2">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 m-0 flex-1">
          {service.description || t('noDesc')}
        </p>

        {/* Price + Action Row */}
        <div className="flex justify-between items-center pt-3 mt-auto border-t border-gray-100">
          <div>
            <div className="text-[18px] font-black text-gray-900 tracking-tight leading-none">
              ₹{service.pricePerUnit}
            </div>
            <div className="text-[11px] text-gray-400 mt-1 font-medium">
              per {service.unit?.toLowerCase() || 'unit'}
              {service.securityDeposit > 0 && (
                <> &middot; ₹{service.securityDeposit} deposit</>
              )}
            </div>
          </div>

          {onBook && (
            <button
              className="bg-brand hover:bg-brand-dark text-white rounded-full px-5 py-2 text-xs font-bold transition-all shadow-[0_2px_8px_rgba(252,128,25,0.3)] hover:-translate-y-0.5 focus:outline-none"
              onClick={(e) => { e.stopPropagation(); onBook(service); }}
            >
              {t('bookNow')}
            </button>
          )}
          {isVendor && (
            <button
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-full px-4 py-2 text-xs font-bold transition-all focus:outline-none"
              onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/services/edit/${service.id}`); }}
            >
              {t('edit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
