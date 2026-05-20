import { useState, useEffect, useRef } from 'react';

let googleScriptLoading = false;

function loadGoogleMapsScript(apiKey, callback) {
  if (window.google && window.google.maps && window.google.maps.places) {
    callback();
    return;
  }
  if (!apiKey) {
    return;
  }
  if (googleScriptLoading) {
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(interval);
        callback();
      }
    }, 100);
    return;
  }
  googleScriptLoading = true;
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    callback();
  };
  document.head.appendChild(script);
}

export default function AddressSearchField({ label, placeholder, initialAddress, onSelectLocation }) {
  const [query, setQuery] = useState(initialAddress || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleActive, setIsGoogleActive] = useState(false);
  
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || window.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (initialAddress !== undefined) {
      setQuery(initialAddress || '');
    }
  }, [initialAddress]);

  useEffect(() => {
    if (apiKey) {
      loadGoogleMapsScript(apiKey, () => {
        setIsGoogleActive(true);
        if (inputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['geocode', 'establishment']
          });
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (place && place.geometry) {
              const lat = place.geometry.location.lat();
              const lon = place.geometry.location.lng();
              const address = place.formatted_address || place.name;
              setQuery(address);
              onSelectLocation(address, lat, lon);
            }
          });
        }
      });
    }
  }, [apiKey]);

  const handleOSMSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    setError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
      if (data.length === 0) {
        setError('No locations found. Try a different query.');
      } else {
        setShowDropdown(true);
      }
    } catch (err) {
      console.error('Error fetching address:', err);
      setError('Failed to reach address service. Try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (item) => {
    const displayName = item.display_name;
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    
    setQuery(displayName);
    setShowDropdown(false);
    onSelectLocation(displayName, lat, lon);
  };

  return (
    <div className="input-group" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        {label && <label style={{ margin: 0 }}>{label}</label>}
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--glass-bg)', padding: '2px 6px', borderRadius: '4px' }}>
          {isGoogleActive ? '⚡ Google Maps' : 'Nominatim'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          ref={inputRef}
          type="text"
          className="input-field"
          placeholder={placeholder || "Search address..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSelectLocation(e.target.value, null, null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!isGoogleActive) {
                handleOSMSearch();
              }
            }
          }}
          style={{ flex: 1 }}
        />
        {!isGoogleActive && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleOSMSearch}
            disabled={searching}
            style={{ minWidth: '90px' }}
          >
            {searching ? 'Searching...' : '🔍 Search'}
          </button>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-xs)', marginTop: '4px' }}>
          {error}
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
            onClick={() => setShowDropdown(false)} 
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            zIndex: 999,
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            {results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                style={{
                  padding: '10px 12px',
                  borderBottom: idx === results.length - 1 ? 'none' : '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-xs)',
                  color: 'var(--text-primary)',
                  transition: 'background 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {item.display_name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
