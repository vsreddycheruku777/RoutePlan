import React from 'react';
import { Download, FileText, Share2, Map, Clock, Navigation } from 'lucide-react';
import Papa from 'papaparse';

const StepRoutes = ({ routes, onBack }) => {
  
  const exportToCSV = () => {
    if (!routes || routes.length === 0) return;

    let exportData = [];
    routes.forEach(route => {
      route.stops.forEach((stop, index) => {
        exportData.push({
          'Vehicle ID': route.vehicleId,
          'Stop Number': index === 0 ? 'Start' : index === route.stops.length - 1 ? 'End' : index,
          'Original Input': stop.rawText,
          'Geocoded Location': stop.address,
          'Latitude': stop.lat,
          'Longitude': stop.lng
        });
      });
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "optimized_routes.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!routes) {
    return (
      <div className="step-container text-center" style={{ marginTop: '2rem' }}>
        <p className="text-muted">No routes computed yet.</p>
        <button className="btn btn-primary mt-4" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  // Calculate totals
  const totalDistance = routes.reduce((sum, r) => sum + parseFloat(r.distanceMiles || 0), 0).toFixed(2);
  const totalDuration = routes.reduce((sum, r) => sum + parseInt(r.durationMins || 0), 0);
  const totalStops = routes.reduce((sum, r) => sum + (r.stops.length - 2), 0); // exclude start and end depot

  return (
    <div className="step-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Optimized Routes</h2>
        <p className="text-muted text-sm">Your multi-stop routes have been generated.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="settings-card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
          <Clock size={20} className="text-muted mb-4" style={{ margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalDuration}m</div>
          <div className="text-sm text-muted">Total Time</div>
        </div>
        <div className="settings-card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
          <Navigation size={20} className="text-muted mb-4" style={{ margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalDistance}</div>
          <div className="text-sm text-muted">Total Miles</div>
        </div>
        <div className="settings-card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
          <Map size={20} className="text-muted mb-4" style={{ margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalStops}</div>
          <div className="text-sm text-muted">Total Stops</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <span className="input-label">Vehicle Routes ({routes.length})</span>
        
        {routes.map(route => {
          const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          const color = colors[(route.vehicleId - 1) % colors.length];

          return (
            <div key={route.vehicleId} className="settings-card" style={{ borderLeft: `4px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600 }}>Vehicle {route.vehicleId}</span>
                <span className="text-sm text-muted">{route.distanceMiles} mi • {route.durationMins} min</span>
              </div>
              
              <div className="text-sm text-muted">
                {route.stops.length - 2} deliveries
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button 
          className="btn btn-primary btn-full" 
          onClick={exportToCSV}
        >
          <Download size={18} /> Export Routes (CSV)
        </button>
        <button 
          className="btn btn-outline btn-full" 
          onClick={onBack}
        >
          Adjust Settings
        </button>
      </div>

    </div>
  );
};

export default StepRoutes;
