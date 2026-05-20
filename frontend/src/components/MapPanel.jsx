import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

function hasCoordinates(lat, lng) {
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

function googleMapsEmbedUrl(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
}

export function mapsDirectionsUrl(fromLat, fromLng, toLat, toLng) {
  if (!hasCoordinates(toLat, toLng)) return null;
  const destination = `${toLat},${toLng}`;
  if (!hasCoordinates(fromLat, fromLng)) {
    return `https://www.google.com/maps/search/?api=1&query=${destination}`;
  }
  return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${destination}`;
}

export default function MapPanel({ latitude, longitude, label = 'Location', height = 240 }) {
  const { t } = useThemeLanguage();

  if (!hasCoordinates(latitude, longitude)) {
    return (
      <div className="map-empty" style={{ minHeight: height }}>
        <span className="map-empty-mark">LOC</span>
        <div>
          <strong>{t('noMapCoords')}</strong>
          <p>{t('addGpsCoords')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-panel" style={{ height }}>
      <iframe
        title={label}
        src={googleMapsEmbedUrl(latitude, longitude)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="map-coordinate-badge">
        {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
      </div>
      <div className="map-caption">{label}</div>
    </div>
  );
}
