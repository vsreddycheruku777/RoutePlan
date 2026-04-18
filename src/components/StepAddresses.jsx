import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, MapPin, X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { geocodeAddress } from '../utils/geocoding';

const StepAddresses = ({ startPoint, setStartPoint, endPoint, setEndPoint, addresses, setAddresses, onNext }) => {
  const [manualInput, setManualInput] = useState('');
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const fileInputRef = useRef(null);

  const handleStartSet = async () => {
    if (!startInput.trim()) return;
    setIsGeocoding(true);
    const newPoint = { id: 'start', rawText: startInput, status: 'pending' };
    setStartPoint(newPoint);
    const result = await geocodeAddress(startInput);
    setStartPoint({ ...newPoint, ...result, status: result.lat ? 'valid' : 'invalid' });
    setIsGeocoding(false);
  };

  const handleEndSet = async () => {
    if (!endInput.trim()) return;
    setIsGeocoding(true);
    const newPoint = { id: 'end', rawText: endInput, status: 'pending' };
    setEndPoint(newPoint);
    const result = await geocodeAddress(endInput);
    setEndPoint({ ...newPoint, ...result, status: result.lat ? 'valid' : 'invalid' });
    setIsGeocoding(false);
  };

  const handleManualAdd = async () => {
    if (!manualInput.trim()) return;
    const newAddress = { id: Date.now().toString(), rawText: manualInput, status: 'pending' };
    setAddresses(prev => [...prev, newAddress]);
    setManualInput('');
    setIsGeocoding(true);
    const result = await geocodeAddress(newAddress.rawText);
    setAddresses(prev => prev.map(a => a.id === newAddress.id ? { ...a, ...result, status: result.lat ? 'valid' : 'invalid' } : a));
    setIsGeocoding(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        const parsedAddresses = [];
        results.data.forEach((row, index) => {
          let addrText = '';
          if (typeof row === 'object' && row !== null) {
            addrText = row.address || row.Address || row[0] || Object.values(row)[0];
          } else {
            addrText = row;
          }
          if (addrText && typeof addrText === 'string' && addrText.trim()) {
            parsedAddresses.push({ id: Date.now().toString() + index, rawText: addrText.trim(), status: 'pending' });
          }
        });

        setAddresses(prev => [...prev, ...parsedAddresses]);
        setIsGeocoding(true);
        for (const [i, addr] of parsedAddresses.entries()) {
          if (i > 0) await new Promise(r => setTimeout(r, 1000));
          const result = await geocodeAddress(addr.rawText);
          setAddresses(prev => prev.map(a => a.id === addr.id ? { ...a, ...result, status: result.lat ? 'valid' : 'invalid' } : a));
        }
        setIsGeocoding(false);
      },
      header: true,
      skipEmptyLines: true
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = addresses.filter(a => a.status === 'valid').length;
  const isStartValid = startPoint && startPoint.status === 'valid';
  const isReady = isStartValid && validCount >= 1; 

  const renderStatus = (status) => {
    if (status === 'valid') return <><CheckCircle2 size={12} className="status-valid"/> <span className="status-valid">Found</span></>;
    if (status === 'invalid') return <><AlertCircle size={12} className="status-invalid"/> <span className="status-invalid">Not Found</span></>;
    if (status === 'pending') return <><Clock size={12} className="status-pending"/> <span className="status-pending">Locating...</span></>;
    return null;
  };

  return (
    <div className="step-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Set Addresses</h2>
        <p className="text-muted text-sm">First set your depot location(s), then add your stops.</p>
      </div>

      <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#fafafa' }}>
        <div className="input-group">
          <label className="input-label">Start Point (Required)</label>
          {startPoint ? (
            <div className="address-item" style={{ borderColor: 'var(--primary-color)' }}>
              <MapPin size={20} className="address-icon" />
              <div className="address-details">
                <div className="address-text">{startPoint.rawText}</div>
                <div className="address-status">{renderStatus(startPoint.status)}</div>
              </div>
              <button className="remove-btn" onClick={() => setStartPoint(null)}><X size={16} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" className="input-field" style={{ flex: 1 }} placeholder="Warehouse Address" value={startInput} onChange={(e) => setStartInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleStartSet()}/>
              <button className="btn btn-outline" onClick={handleStartSet}>Set</button>
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">End Point (Optional)</label>
          {endPoint ? (
            <div className="address-item">
              <MapPin size={20} className="text-muted" />
              <div className="address-details">
                <div className="address-text">{endPoint.rawText}</div>
                <div className="address-status">{renderStatus(endPoint.status)}</div>
              </div>
              <button className="remove-btn" onClick={() => setEndPoint(null)}><X size={16} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" className="input-field" style={{ flex: 1 }} placeholder="End Location (Leave empty for round trip)" value={endInput} onChange={(e) => setEndInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleEndSet()}/>
              <button className="btn btn-outline" onClick={handleEndSet}>Set</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        <span className="text-muted text-sm">Import Stops</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
      </div>

      <div className="upload-area" onClick={() => fileInputRef.current?.click()} style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Upload size={20} className="upload-icon" style={{ padding: '0.5rem' }}/>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontWeight: 500, margin: 0 }}>Upload CSV/Excel Stops</p>
          </div>
        </div>
        <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload}/>
      </div>

      <div className="input-group">
        <label className="input-label">Type Stop Manually</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="text" className="input-field" style={{ flex: 1 }} placeholder="Stop Address" value={manualInput} onChange={(e) => setManualInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleManualAdd()}/>
          <button className="btn btn-outline" onClick={handleManualAdd}>Add</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="input-label">Stops ({addresses.length})</span>
          {isGeocoding && <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Geocoding...</span>}
        </div>
        
        {addresses.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: '1rem 0', fontStyle: 'italic', fontSize: '0.875rem' }}>No stops added.</div>
        ) : (
          <div className="address-list">
            {addresses.map((addr) => (
              <div key={addr.id} className="address-item">
                <MapPin size={20} className="address-icon" />
                <div className="address-details">
                  <div className="address-text">{addr.rawText}</div>
                  <div className="address-status">{renderStatus(addr.status)}</div>
                </div>
                <button className="remove-btn" onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))}><X size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button className="btn btn-primary btn-full" disabled={!isReady || isGeocoding} onClick={onNext}>
          {isReady ? 'Next: Set Goals' : 'Add Start Point and at least 1 Stop'}
        </button>
      </div>
    </div>
  );
};

export default StepAddresses;
