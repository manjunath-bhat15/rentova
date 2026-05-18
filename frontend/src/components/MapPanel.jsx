function hasCoordinates(lat, lng) {
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

function osmEmbedUrl(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  const delta = 0.035;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
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
  if (!hasCoordinates(latitude, longitude)) {
    return (
      <div className="map-empty" style={{ minHeight: height }}>
        <span className="map-empty-mark">LOC</span>
        <div>
          <strong>No map coordinates yet</strong>
          <p>Add GPS coordinates to show this location on the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-panel" style={{ height }}>
      <iframe
        title={label}
        src={osmEmbedUrl(latitude, longitude)}
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
