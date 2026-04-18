// Haversine distance in miles
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in miles
}

// Simple greedy algorithm for vehicle routing (CVRP/TSP)
export const optimizeRoutes = async (addresses, goals, startPoint, endPoint) => {
  if (!startPoint || addresses.length === 0) return [];

  const depot = startPoint;
  const finalDestination = endPoint || startPoint; // Use endPoint if provided, otherwise round trip
  let unassignedStops = [...addresses];
  const routes = [];
  
  // Create up to maxVehicles routes
  for (let v = 0; v < goals.maxVehicles; v++) {
    if (unassignedStops.length === 0) break;
    
    let currentRouteStops = [depot];
    let currentLocation = depot;
    
    // Greedily pick the closest stop until maxStopsPerVehicle is reached
    while (unassignedStops.length > 0 && (currentRouteStops.length - 1) < goals.maxStopsPerVehicle) {
      // Find nearest unassigned
      let nearestIdx = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < unassignedStops.length; i++) {
        const stop = unassignedStops[i];
        const dist = getDistance(currentLocation.lat, currentLocation.lng, stop.lat, stop.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }
      
      // Add to route
      const nextStop = unassignedStops[nearestIdx];
      currentRouteStops.push(nextStop);
      currentLocation = nextStop;
      
      // Remove from unassigned
      unassignedStops.splice(nearestIdx, 1);
    }
    
    // Add final destination at the end
    currentRouteStops.push(finalDestination);
    
    routes.push({
      vehicleId: v + 1,
      stops: currentRouteStops
    });
  }
  
  // For each route, fetch real road geometry from OSRM
  for (const route of routes) {
    try {
      // OSRM coordinates format: lon,lat;lon,lat...
      const coordsString = route.stops.map(s => `${s.lng},${s.lat}`).join(';');
      
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const osrmRoute = data.routes[0];
          
          // OSRM returns GeoJSON coordinates as [lon, lat], Leaflet expects [lat, lon]
          route.coordinates = osrmRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          route.distanceMiles = (osrmRoute.distance / 1609.34).toFixed(2); // meters to miles
          route.durationMins = Math.round(osrmRoute.duration / 60); // seconds to mins
        }
      }
    } catch (error) {
      console.error("OSRM Routing Error:", error);
      // Fallback to straight lines
      route.coordinates = route.stops.map(s => [s.lat, s.lng]);
      route.distanceMiles = "Unknown";
      route.durationMins = "Unknown";
    }
  }

  return routes;
};
