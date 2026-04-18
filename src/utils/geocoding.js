// Simple geocoding using OpenStreetMap Nominatim API
// Note: In a production app, use a proper geocoding service like Google Maps, Mapbox, or a paid OSM service to avoid rate limits.

export const geocodeAddress = async (addressText) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText)}&limit=1`,
      {
        headers: {
          // Nominatim requires a user agent
          'User-Agent': 'RoutePlanner-Demo-App'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name
      };
    }
    
    return { lat: null, lng: null };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { lat: null, lng: null };
  }
};
