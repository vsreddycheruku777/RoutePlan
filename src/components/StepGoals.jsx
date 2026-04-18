import React, { useState } from 'react';
import { Settings, Users, Clock, Map, Route as RouteIcon } from 'lucide-react';
import { optimizeRoutes } from '../utils/routing';

const StepGoals = ({ goals, setGoals, onBack, onNext, addresses, startPoint, endPoint, setRoutes }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    
    // Filter only valid addresses
    const validAddresses = addresses.filter(a => a.lat && a.lng);
    
    // Call our routing utility
    const computedRoutes = await optimizeRoutes(validAddresses, goals, startPoint, endPoint);
    
    setRoutes(computedRoutes);
    setIsOptimizing(false);
    onNext();
  };

  return (
    <div className="step-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Optimization Goals</h2>
        <p className="text-muted text-sm">Set constraints to get the best possible routes.</p>
      </div>

      <div className="settings-card">
        <h3 className="settings-title"><Users size={18} /> Fleet Settings</h3>
        <div className="input-group">
          <label className="input-label">Number of Vehicles</label>
          <input 
            type="number" 
            className="input-field" 
            min="1" 
            max="10"
            value={goals.maxVehicles}
            onChange={(e) => setGoals({...goals, maxVehicles: parseInt(e.target.value) || 1})}
          />
        </div>
        <div className="input-group mt-4">
          <label className="input-label">Max Stops per Vehicle</label>
          <input 
            type="number" 
            className="input-field" 
            min="1"
            value={goals.maxStopsPerVehicle}
            onChange={(e) => setGoals({...goals, maxStopsPerVehicle: parseInt(e.target.value) || 1})}
          />
        </div>
      </div>

      <div className="settings-card">
        <h3 className="settings-title"><Settings size={18} /> Optimization Goal</h3>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <label 
            style={{ 
              flex: 1, 
              border: `2px solid ${goals.optimizeFor === 'time' ? 'var(--primary-color)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: goals.optimizeFor === 'time' ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <input 
              type="radio" 
              name="optimizeFor" 
              value="time"
              checked={goals.optimizeFor === 'time'}
              onChange={() => setGoals({...goals, optimizeFor: 'time'})}
              style={{ display: 'none' }}
            />
            <Clock size={24} color={goals.optimizeFor === 'time' ? 'var(--primary-color)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 500, color: goals.optimizeFor === 'time' ? 'var(--primary-color)' : 'var(--text-main)' }}>Fastest Time</span>
          </label>

          <label 
            style={{ 
              flex: 1, 
              border: `2px solid ${goals.optimizeFor === 'distance' ? 'var(--primary-color)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: goals.optimizeFor === 'distance' ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <input 
              type="radio" 
              name="optimizeFor" 
              value="distance"
              checked={goals.optimizeFor === 'distance'}
              onChange={() => setGoals({...goals, optimizeFor: 'distance'})}
              style={{ display: 'none' }}
            />
            <Map size={24} color={goals.optimizeFor === 'distance' ? 'var(--primary-color)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 500, color: goals.optimizeFor === 'distance' ? 'var(--primary-color)' : 'var(--text-main)' }}>Shortest Distance</span>
          </label>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
        <button 
          className="btn btn-outline" 
          onClick={onBack}
          style={{ flex: 1 }}
        >
          Back
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleOptimize}
          disabled={isOptimizing}
          style={{ flex: 2 }}
        >
          {isOptimizing ? 'Optimizing...' : 'Calculate Routes'}
        </button>
      </div>

    </div>
  );
};

export default StepGoals;
