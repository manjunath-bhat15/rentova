import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(() => {
    const saved = localStorage.getItem('rentova_coords');
    return saved ? JSON.parse(saved) : { latitude: 12.9716, longitude: 77.5946 }; // Default: Bangalore
  });

  const [selectedAddress, setSelectedAddress] = useState(() => {
    return localStorage.getItem('rentova_address') || 'Indiranagar, Bangalore, Karnataka, India';
  });

  useEffect(() => {
    localStorage.setItem('rentova_coords', JSON.stringify(coords));
  }, [coords]);

  useEffect(() => {
    localStorage.setItem('rentova_address', selectedAddress);
  }, [selectedAddress]);

  const updateLocation = (address, lat, lon) => {
    if (address) setSelectedAddress(address);
    if (lat !== null && lon !== null) {
      setCoords({ latitude: Number(lat), longitude: Number(lon) });
    }
  };

  const resetToGPS = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation not supported');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCoords({ latitude: lat, longitude: lon });
          
          // Reverse geocode to get a nice display address name
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
            .then(res => res.json())
            .then(data => {
              const name = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
              setSelectedAddress(name);
              resolve({ address: name, latitude: lat, longitude: lon });
            })
            .catch(() => {
              const fallbackName = `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
              setSelectedAddress(fallbackName);
              resolve({ address: fallbackName, latitude: lat, longitude: lon });
            });
        },
        (err) => {
          reject(err);
        }
      );
    });
  };

  return (
    <LocationContext.Provider value={{ coords, selectedAddress, updateLocation, resetToGPS }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  return useContext(LocationContext);
}
