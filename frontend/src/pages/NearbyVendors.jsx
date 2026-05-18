import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPanel, { mapsDirectionsUrl } from '../components/MapPanel';
import api from '../services/api';

export default function NearbyVendors() {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [manualCoords, setManualCoords] = useState({ latitude: '12.9716', longitude: '77.5946' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (coords) loadNearby();
  }, [coords, radiusKm]);

  const requestLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Your browser does not support location access.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setError('Allow location access to see vendors around you.'),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const loadNearby = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/services/nearby', {
        params: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          radiusKm,
        },
      });
      setServices(res.data);
    } catch {
      setError('Unable to load nearby vendors right now.');
    } finally {
      setLoading(false);
    }
  };

  const applyManualCoords = () => {
    const latitude = Number(manualCoords.latitude);
    const longitude = Number(manualCoords.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError('Enter valid latitude and longitude values.');
      return;
    }
    setError('');
    setCoords({ latitude, longitude });
  };

  const closestService = useMemo(() => services[0], [services]);

  return (
    <div className="nearby-page animate-fade-in">
      <div className="workspace-hero">
        <div>
          <p className="eyebrow">Location intelligence</p>
          <h1>Nearby Vendors</h1>
          <p>Discover newly listed services within your preferred radius and inspect vendor location before booking.</p>
        </div>
        <div className="radius-control">
          <label htmlFor="radius">Radius</label>
          <select
            id="radius"
            className="input-field"
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
          <button className="btn btn-secondary" onClick={requestLocation}>Refresh Location</button>
        </div>
      </div>

      <div className="manual-location-bar">
        <div className="input-group">
          <label>Latitude</label>
          <input
            className="input-field"
            value={manualCoords.latitude}
            onChange={(event) => setManualCoords((current) => ({ ...current, latitude: event.target.value }))}
          />
        </div>
        <div className="input-group">
          <label>Longitude</label>
          <input
            className="input-field"
            value={manualCoords.longitude}
            onChange={(event) => setManualCoords((current) => ({ ...current, longitude: event.target.value }))}
          />
        </div>
        <button className="btn btn-primary" onClick={applyManualCoords}>Use Coordinates</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="nearby-layout">
        <section className="panel-block">
          <div className="panel-heading">
            <div>
              <h2>Your search area</h2>
              <p>{coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : 'Waiting for location permission'}</p>
            </div>
            {closestService && <span className="status-chip">Closest: {closestService.distanceKm} km</span>}
          </div>
          <MapPanel
            latitude={coords?.latitude}
            longitude={coords?.longitude}
            label="Your location"
            height={360}
          />
        </section>

        <section className="panel-block">
          <div className="panel-heading">
            <div>
              <h2>Available nearby</h2>
              <p>{loading ? 'Scanning vendors...' : `${services.length} service${services.length === 1 ? '' : 's'} found`}</p>
            </div>
          </div>

          <div className="nearby-list">
            {services.map((service) => (
              <button key={service.id} className="nearby-row" onClick={() => setSelected(service)}>
                <span className="nearby-row-main">
                  <strong>{service.title}</strong>
                  <small>{service.vendorName} - {service.category}</small>
                </span>
                <span className="nearby-row-meta">
                  <strong>{service.distanceKm} km</strong>
                  <small>Rs {service.pricePerUnit}/{service.unit?.toLowerCase()}</small>
                </span>
              </button>
            ))}

            {!loading && services.length === 0 && (
              <div className="empty-state">
                <strong>No vendors in this radius</strong>
                <p>Increase the radius or check back when vendors publish new location-enabled listings.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-panel service-popup" onClick={(event) => event.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{selected.category}</p>
                <h2>{selected.title}</h2>
                <p>{selected.vendorName} - {selected.distanceKm} km away</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
            <p className="modal-copy">{selected.description || 'No description provided.'}</p>
            <MapPanel latitude={selected.latitude} longitude={selected.longitude} label={selected.location || selected.title} />
            <div className="modal-actions">
              <a
                className="btn btn-secondary"
                href={mapsDirectionsUrl(coords?.latitude, coords?.longitude, selected.latitude, selected.longitude)}
                target="_blank"
                rel="noreferrer"
              >
                Directions
              </a>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard/services')}>Book from Marketplace</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
