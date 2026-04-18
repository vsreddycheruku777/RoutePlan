import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for Depot vs Stop
const depotIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map bounds when addresses change
function MapBoundsComponent({ addresses }) {
  const map = useMap();

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const validAddresses = addresses.filter(a => a.lat && a.lng);
      if (validAddresses.length > 0) {
        const bounds = L.latLngBounds(validAddresses.map(a => [a.lat, a.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [addresses, map]);

  return null;
}

const MapView = ({ addresses, routes }) => {
  const mapRef = useRef(null);

  // Default center (US)
  const defaultCenter = [39.8283, -98.5795];
  const validAddresses = addresses?.filter(a => a.lat && a.lng) || [];

  return (
    <MapContainer 
      center={validAddresses.length > 0 ? [validAddresses[0].lat, validAddresses[0].lng] : defaultCenter} 
      zoom={4} 
      ref={mapRef}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapBoundsComponent addresses={validAddresses} />

      {validAddresses.map((address, index) => (
        <Marker 
          key={address.id} 
          position={[address.lat, address.lng]}
          icon={index === 0 ? depotIcon : defaultIcon}
        >
          <Popup>
            <div>
              <strong>{index === 0 ? 'Start (Depot)' : `Stop ${index}`}</strong>
              <br/>
              {address.rawText || address.address}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Render Routes */}
      {routes && routes.length > 0 && routes.map((route, routeIndex) => {
        // Generate a distinct color for each route
        const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        const color = colors[routeIndex % colors.length];
        
        // Ensure route.coordinates exists
        if (!route.coordinates || route.coordinates.length < 2) return null;

        return (
          <Polyline 
            key={`route-${routeIndex}`}
            positions={route.coordinates} 
            color={color} 
            weight={4}
            opacity={0.8}
          />
        );
      })}
    </MapContainer>
  );
};

export default MapView;
