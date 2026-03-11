import { useState, useEffect } from 'react';
import { MapPin, Loader, CheckCircle, AlertTriangle, RefreshCw, Navigation } from 'lucide-react';
import './GpsCapture.css';

/**
 * GpsCapture — reusable GPS location widget.
 * Props:
 *   onLocation(locationObj) — called when GPS captured successfully
 *   autoCapture (bool)      — auto-start capture on mount
 *   label (string)          — heading label
 */
const GpsCapture = ({ onLocation, autoCapture = true, label = 'Capture GPS Location' }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | denied
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (autoCapture) captureLocation();
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      // Use OpenStreetMap Nominatim (free, no API key required)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) return '';
      const data = await res.json();
      return data.display_name || '';
    } catch {
      return '';
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('GPS not supported by this browser.');
      return;
    }

    setStatus('loading');
    setError('');
    setLocation(null);
    setAddress('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const capturedAt = new Date().toISOString();

        // Reverse geocode in background
        const addr = await reverseGeocode(latitude, longitude);

        const locationObj = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          address: addr,
          capturedAt,
        };

        setLocation(locationObj);
        setAddress(addr);
        setStatus('success');
        onLocation && onLocation(locationObj);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location permission denied. Please allow GPS access in browser settings.');
        } else if (err.code === err.TIMEOUT) {
          setStatus('error');
          setError('GPS timed out. Try again in an open area.');
        } else {
          setStatus('error');
          setError('Unable to get location. Check device GPS settings.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const openInMaps = () => {
    if (!location) return;
    window.open(
      `https://www.google.com/maps?q=${location.lat},${location.lng}&z=17`,
      '_blank'
    );
  };

  return (
    <div className="gps-capture">
      <div className="gps-header">
        <div className="gps-icon-wrap">
          <Navigation size={16} className="gps-nav-icon" />
        </div>
        <span className="gps-label">{label}</span>
      </div>

      {/* Status display */}
      <div className={`gps-status-box gps-status-${status}`}>
        {status === 'idle' && (
          <div className="gps-idle">
            <MapPin size={20} className="opacity-50" />
            <span>GPS not yet captured</span>
          </div>
        )}

        {status === 'loading' && (
          <div className="gps-loading">
            <Loader size={18} className="gps-spin" />
            <span>Acquiring GPS signal...</span>
            <span className="gps-subtext">Please allow location access if prompted</span>
          </div>
        )}

        {status === 'success' && location && (
          <div className="gps-success-content">
            <div className="gps-success-row">
              <CheckCircle size={16} className="text-green-400" />
              <span className="gps-confirmed">Location Recorded ✓</span>
            </div>
            <div className="gps-coords">
              <span>📍 {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
              <span className="gps-accuracy">± {location.accuracy}m accuracy</span>
            </div>
            {address && (
              <div className="gps-address">{address}</div>
            )}
            <div className="gps-timestamp">
              🕐 Captured: {new Date(location.capturedAt).toLocaleString()}
            </div>
            <div className="gps-actions-row">
              <button type="button" className="gps-btn-map" onClick={openInMaps}>
                <MapPin size={13} /> View on Map
              </button>
              <button type="button" className="gps-btn-refresh" onClick={captureLocation}>
                <RefreshCw size={13} /> Recapture
              </button>
            </div>
          </div>
        )}

        {(status === 'error' || status === 'denied') && (
          <div className="gps-error-content">
            <AlertTriangle size={18} className="text-yellow-400" />
            <span className="gps-error-text">{error}</span>
            <button type="button" className="gps-btn-retry" onClick={captureLocation}>
              <RefreshCw size={13} /> Try Again
            </button>
          </div>
        )}
      </div>

      {/* Manual trigger if not auto */}
      {status === 'idle' && !autoCapture && (
        <button type="button" className="gps-btn-capture" onClick={captureLocation}>
          <Navigation size={15} /> Capture GPS Now
        </button>
      )}
    </div>
  );
};

export default GpsCapture;
