import { useState, useEffect } from 'react';

export default function AddressSearchField({ label, placeholder, initialAddress, onSelectLocation }) {
  const [query, setQuery] = useState(initialAddress || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');

  // Keep internal query synchronized if initialAddress changes
  useEffect(() => {
    if (initialAddress !== undefined) {
      setQuery(initialAddress || '');
    }
  }, [initialAddress]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
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
      {label && <label>{label}</label>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="input-field"
          placeholder={placeholder || "Search address..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Report string changes immediately, coordinates will resolve on select
            onSelectLocation(e.target.value, null, null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSearch}
          disabled={searching}
          style={{ minWidth: '90px' }}
        >
          {searching ? 'Searching...' : '🔍 Search'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-xs)', marginTop: '4px' }}>
          {error}
        </div>
      )}

      {showDropdown && results.length > 0 && (
        <>
          {/* Backdrop to close dropdown */}
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
