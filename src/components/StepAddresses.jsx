import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, MapPin, X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { geocodeAddress } from '../utils/geocoding';

const StepAddresses = ({ addresses, setAddresses, onNext }) => {
  const [manualInput, setManualInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const fileInputRef = useRef(null);

  const handleManualAdd = async () => {
    if (!manualInput.trim()) return;
    
    const newAddress = {
      id: Date.now().toString(),
      rawText: manualInput,
      status: 'pending', // pending, valid, invalid
    };
    
    // Add to list immediately as pending
    setAddresses(prev => [...prev, newAddress]);
    setManualInput('');
    
    // Geocode
    setIsGeocoding(true);
    const result = await geocodeAddress(newAddress.rawText);
    
    setAddresses(prev => prev.map(a => 
      a.id === newAddress.id ? { ...a, ...result, status: result.lat ? 'valid' : 'invalid' } : a
    ));
    setIsGeocoding(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        const parsedAddresses = [];
        // Assuming first column or 'address' column
        results.data.forEach((row, index) => {
          let addrText = '';
          if (typeof row === 'object' && row !== null) {
            // Try to find an address column
            addrText = row.address || row.Address || row[0] || Object.values(row)[0];
          } else {
            addrText = row;
          }
          
          if (addrText && typeof addrText === 'string' && addrText.trim()) {
            parsedAddresses.push({
              id: Date.now().toString() + index,
              rawText: addrText.trim(),
              status: 'pending'
            });
          }
        });

        // Add pending addresses
        setAddresses(prev => [...prev, ...parsedAddresses]);
        
        // Geocode all (with simple delay to avoid rate limiting from free OSM api)
        setIsGeocoding(true);
        for (const [i, addr] of parsedAddresses.entries()) {
          // Add small delay to respect Nominatim API limits (1 req/sec)
          if (i > 0) await new Promise(r => setTimeout(r, 1000));
          
          const result = await geocodeAddress(addr.rawText);
          setAddresses(prev => prev.map(a => 
            a.id === addr.id ? { ...a, ...result, status: result.lat ? 'valid' : 'invalid' } : a
          ));
        }
        setIsGeocoding(false);
      },
      header: true,
      skipEmptyLines: true
    });
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const validCount = addresses.filter(a => a.status === 'valid').length;
  const isReady = validCount >= 2; // Need at least a start and 1 stop

  return (
    <div className="step-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Import Addresses</h2>
        <p className="text-muted text-sm">Add your delivery stops. The first address will be your Start/End Depot.</p>
      </div>

      <div 
        className="upload-area" 
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">
          <Upload size={24} />
        </div>
        <div>
          <p style={{ fontWeight: 500 }}>Click to upload file</p>
          <p className="text-muted text-sm">CSV or Excel files supported</p>
        </div>
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        <span className="text-muted text-sm">OR</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
      </div>

      <div className="input-group">
        <label className="input-label">Type Address Manually</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            className="input-field" 
            style={{ flex: 1 }} 
            placeholder="123 Main St, City, Country" 
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualAdd()}
          />
          <button className="btn btn-outline" onClick={handleManualAdd}>Add</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="input-label">Address List ({addresses.length})</span>
          {isGeocoding && <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Geocoding...</span>}
        </div>
        
        {addresses.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: '2rem 0', fontStyle: 'italic', fontSize: '0.875rem' }}>
            No addresses added yet.
          </div>
        ) : (
          <div className="address-list">
            {addresses.map((addr, index) => (
              <div key={addr.id} className="address-item">
                <div className="address-icon">
                  <MapPin size={20} />
                </div>
                <div className="address-details">
                  <div className="address-text">
                    {index === 0 && <span style={{ fontWeight: 600, color: 'var(--primary-color)', marginRight: '0.5rem' }}>Start</span>}
                    {addr.rawText}
                  </div>
                  <div className="address-status">
                    {addr.status === 'valid' && <><CheckCircle2 size={12} className="status-valid"/> <span className="status-valid">Found</span></>}
                    {addr.status === 'invalid' && <><AlertCircle size={12} className="status-invalid"/> <span className="status-invalid">Not Found</span></>}
                    {addr.status === 'pending' && <><Clock size={12} className="status-pending"/> <span className="status-pending">Locating...</span></>}
                  </div>
                </div>
                <button className="remove-btn" onClick={() => removeAddress(addr.id)}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="btn btn-primary btn-full" 
          disabled={!isReady || isGeocoding}
          onClick={onNext}
        >
          {isReady ? 'Next: Set Goals' : 'Add at least 2 valid addresses'}
        </button>
      </div>

    </div>
  );
};

export default StepAddresses;
