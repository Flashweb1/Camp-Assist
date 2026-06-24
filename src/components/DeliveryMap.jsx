import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DeliveryMap.css';

const DEFAULT_CENTER = [9.0765, 7.3986]; // Nigeria center

export default function DeliveryMap({ orderId }) {
  const { currentUser, role } = useAuth();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [location, setLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [hasLocation, setHasLocation] = useState(false);

  const isVendor = role === 'vendor';

  // Vendor: share live location
  const startSharing = () => {
    if (!navigator.geolocation) return;
    setSharing(true);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        setHasLocation(true);
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            location: { lat, lng },
            locationUpdatedAt: serverTimestamp(),
          });
        } catch { /* silent */ }
      },
      () => setSharing(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    setWatchId(id);
  };

  const stopSharing = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setSharing(false);
  };

  // Cleanup watch on unmount
  useEffect(() => () => { if (watchId) navigator.geolocation.clearWatch(watchId); }, [watchId]);

  // Corps member: listen to vendor location
  useEffect(() => {
    if (isVendor) return;
    const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      if (snap.exists()) {
        const loc = snap.data().location;
        if (loc?.lat && loc?.lng) {
          setLocation(loc);
          setHasLocation(true);
        }
      }
    });
    return unsub;
  }, [orderId, isVendor]);

  // Init map
  useEffect(() => {
    if (mapInstance.current || !hasLocation) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      location ? [location.lat, location.lng] : DEFAULT_CENTER,
      15
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, [hasLocation]);

  // Update marker
  useEffect(() => {
    if (!mapInstance.current || !location) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng]);
    } else {
      markerRef.current = L.marker([location.lat, location.lng]).addTo(mapInstance.current);
    }
    mapInstance.current.setView([location.lat, location.lng], mapInstance.current.getZoom());
  }, [location]);

  if (!orderId) return null;

  return (
    <div className="dm-wrap">
      <div className="dm-header">
        <span>📍 Live Location</span>
        {isVendor && (
          <button
            className={`btn btn--sm ${sharing ? 'btn--danger' : 'btn--primary'}`}
            onClick={sharing ? stopSharing : startSharing}
          >
            {sharing ? 'Stop Sharing' : 'Share Location'}
          </button>
        )}
      </div>
      {hasLocation ? (
        <div ref={mapRef} className="dm-map" />
      ) : (
        <div className="dm-placeholder">
          {isVendor
            ? 'Click "Share Location" to share your live location with the customer.'
            : 'Waiting for the vendor to share their location...'}
        </div>
      )}
    </div>
  );
}
