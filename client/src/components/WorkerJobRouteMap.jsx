import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HiOutlineMapPin, HiOutlineArrowTopRightOnSquare, HiOutlineTruck } from 'react-icons/hi2';

export default function WorkerJobRouteMap({ job }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [showMap, setShowMap] = useState(true);

  const customerAddress = job?.address || 'Satellite, Ahmedabad';
  const customerName = job?.customer?.name || 'Customer';
  const distance = job?.distanceKm || '3.2 km';

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    // Clean up any previous map instance cleanly BEFORE reinitializing
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Worker map remove notice:', e);
      }
      mapInstanceRef.current = null;
    }
    if (mapContainerRef.current) {
      if (mapContainerRef.current._leaflet_id) {
        try {
          delete mapContainerRef.current._leaflet_id;
        } catch (e) {
          mapContainerRef.current._leaflet_id = null;
        }
      }
      mapContainerRef.current.innerHTML = '';
    }

    // Default Ahmedabad base coordinates: Satellite area
    const customerLat = 23.0275;
    const customerLng = 72.5284;
    // Worker start position (~1.8km offset)
    const workerLat = customerLat + 0.012;
    const workerLng = customerLng + 0.014;

    try {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([customerLat, customerLng], 14);

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Customer Destination Icon
      const customerIcon = L.divIcon({
        className: 'custom-customer-pin',
        html: `
          <div style="
            width: 38px; height: 38px; border-radius: 50%;
            background: linear-gradient(135deg, #ef4444, #991b1b);
            border: 3px solid white; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
            color: white; font-size: 18px;
          ">
            🏠
          </div>
          <span style="
            position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
            background: rgba(255,255,255,0.95); font-size: 0.7rem; font-weight: 800;
            padding: 2px 8px; border-radius: 12px; border: 1px solid #cbd5e1;
            white-space: nowrap; color: #0f172a; margin-top: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          ">${customerName}'s House</span>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      // Worker Location Icon
      const workerIcon = L.divIcon({
        className: 'custom-worker-pin',
        html: `
          <div style="
            width: 38px; height: 38px; border-radius: 50%;
            background: linear-gradient(135deg, #2563eb, #1e40af);
            border: 3px solid white; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
            color: white; font-size: 18px;
          ">
            🛠️
          </div>
          <span style="
            position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
            background: rgba(255,255,255,0.95); font-size: 0.7rem; font-weight: 800;
            padding: 2px 8px; border-radius: 12px; border: 1px solid #cbd5e1;
            white-space: nowrap; color: #2563eb; margin-top: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          ">Your Location</span>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      // Place Markers
      L.marker([customerLat, customerLng], { icon: customerIcon }).addTo(map);
      L.marker([workerLat, workerLng], { icon: workerIcon }).addTo(map);

      // Route polyline with slight curved waypoint
      const midLat = (customerLat + workerLat) / 2 + 0.003;
      const midLng = (customerLng + workerLng) / 2 - 0.004;
      const routePoints = [
        [workerLat, workerLng],
        [midLat, midLng],
        [customerLat, customerLng],
      ];

      L.polyline(routePoints, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      // Fit bounds with padding so both markers and polyline fit neatly
      map.fitBounds(L.latLngBounds(routePoints), { padding: [40, 40] });
    } catch (err) {
      console.warn('Worker map init note:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
        try {
          delete mapContainerRef.current._leaflet_id;
        } catch (e) {}
      }
    };
  }, [showMap, customerAddress, customerName]);

  const navUrl = job?.navigationUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(customerAddress + ', Ahmedabad')}`;
  const mapElementId = `worker-route-map-${String(job?.id || job?._id || 'map').replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <div style={{ marginTop: '12px', borderRadius: '14px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#f8fafc' }}>
      {/* Map Header Strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
          <HiOutlineTruck style={{ color: '#2563eb', fontSize: '1.1rem' }} />
          <span>Route to Customer: <strong>{customerAddress}</strong></span>
          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '100px', fontSize: '0.72rem', border: '1px solid #bfdbfe' }}>
            {distance} • ~10-12 min
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.75rem', fontWeight: 800, color: '#ffffff',
              backgroundColor: '#16a34a', padding: '5px 12px', borderRadius: '6px',
              textDecoration: 'none', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
            }}
          >
            Open in Google Maps <HiOutlineArrowTopRightOnSquare style={{ fontSize: '0.85rem' }} />
          </a>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            style={{
              background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px',
              padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, color: '#475569', cursor: 'pointer'
            }}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      {showMap && (
        <div
          id={mapElementId}
          key={mapElementId}
          ref={mapContainerRef}
          style={{ width: '100%', height: '190px', background: '#e2e8f0', position: 'relative' }}
        />
      )}
    </div>
  );
}
