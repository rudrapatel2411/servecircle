import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePhone, HiOutlineChatBubbleLeftRight,
  HiOutlineClock, HiOutlineShieldCheck
} from 'react-icons/hi2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../Dashboard.css';
import './CustomerPages.css';

const LiveTracking = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Dynamic parameters from checkout / bookings
  const bookingId = searchParams.get('bookingId') || 'SC-2839';
  const serviceName = searchParams.get('service') || 'AC Servicing';
  const workerName = searchParams.get('worker') || 'Ramesh Kumar';
  const price = searchParams.get('price') || '499';

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const [eta, setEta] = useState(15);
  const [activeStep, setActiveStep] = useState(0); // 0: Dispatched, 1: Arriving, 2: Arrived, 3: Job Started, 4: Finished

  const [currentStatusText, setCurrentStatusText] = useState('Professional is dispatched and preparing tools.');
  
  // New Expert Features
  const [otpVisible, setOtpVisible] = useState(false);
  const startOTP = '8492';
  
  // Leaflet refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const workerMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Default User location (fallback)
  const defaultUserPos = [12.9226343, 77.6253457]; // [lat, lng]

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const initMap = async (userLat, userLng) => {
      if (mapRef.current) return;
      
      // Initialize map
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([userLat, userLng], 14);
      
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
      
      // Add custom styles to make it premium
      const mapContainer = tileLayer.getContainer();
      if (mapContainer) {
        mapContainer.style.filter = 'grayscale(0.3) sepia(0.1) contrast(1.15) brightness(1.05)';
      }

      // Define Hub somewhat nearby (e.g., offset by 0.03 deg)
      const hubLat = userLat - 0.03;
      const hubLng = userLng - 0.03;

      // Custom DivIcons
      const createPremiumIcon = (emoji, color1, color2, isWorker = false) => L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          width: ${isWorker ? '52px' : '48px'}; 
          height: ${isWorker ? '52px' : '48px'}; 
          border-radius: 50%;
          background: linear-gradient(135deg, ${color1}, ${color2}); 
          border: 3px solid white;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          font-size: ${isWorker ? '1.4rem' : '1.2rem'};
          ${isWorker ? 'animation: pulse 1.5s infinite;' : ''}
        ">
          ${emoji}
        </div>
        ${!isWorker ? `<span style="font-size: 0.75rem; font-weight: 800; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.5); color: var(--navy-900); display: inline-block; margin-top: 6px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: absolute; top: 100%; left: 50%; transform: translateX(-50%);">${emoji === '🏢' ? 'Hub' : 'Your Location'}</span>` : ''}
        `,
        iconSize: isWorker ? [52, 52] : [48, 48],
        iconAnchor: isWorker ? [26, 26] : [24, 24],
      });

      const hubIcon = createPremiumIcon('🏢', '#cbd5e1', '#94a3b8');
      const homeIcon = createPremiumIcon('🏠', 'var(--navy-700)', 'var(--navy-900)');
      const workerIcon = createPremiumIcon('👷', '#60a5fa', '#2563eb', true);

      // Add Hub and Home markers
      L.marker([hubLat, hubLng], { icon: hubIcon }).addTo(mapRef.current);
      L.marker([userLat, userLng], { icon: homeIcon }).addTo(mapRef.current);
      workerMarkerRef.current = L.marker([hubLat, hubLng], { icon: workerIcon, zIndexOffset: 1000 }).addTo(mapRef.current);

      // Fetch OSRM route
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${hubLng},${hubLat};${userLng},${userLat}?geometries=geojson`);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM returns [lng, lat], Leaflet needs [lat, lng]
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          
          polylineRef.current = L.polyline(coordinates, {
            color: '#2563eb',
            weight: 5,
            opacity: 0.8,
            dashArray: '10, 10',
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(mapRef.current);

          mapRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });

          // Start animation
          animateWorker(coordinates);
        }
      } catch (error) {
        console.error("Error fetching OSRM route:", error);
      }
    };

    const animateWorker = (pathCoords) => {
      let startTime = null;
      const duration = 15000; // 15 seconds to travel the whole path
      
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Find current position on path
        const totalPoints = pathCoords.length;
        const exactIdx = progress * (totalPoints - 1);
        const lowerIdx = Math.floor(exactIdx);
        const upperIdx = Math.ceil(exactIdx);
        const weight = exactIdx - lowerIdx;
        
        if (lowerIdx >= totalPoints - 1) {
           workerMarkerRef.current.setLatLng(pathCoords[totalPoints - 1]);
           // Arrived
           setActiveStep(2);
           setEta(0);
           setCurrentStatusText('Arrived at your doorstep! 🚪');
           setOtpVisible(true);
           
           // Simulate job progression after arrival
           setTimeout(() => {
             setActiveStep(3); // Job Started
             setCurrentStatusText('Job in progress... 🛠️');
             setTimeout(() => {
               setActiveStep(4); // Finished
               setCurrentStatusText('Job completed successfully! 🎉');
               setOtpVisible(false);
             }, 4000);
           }, 4000);
           return;
        }
        
        // Interpolate between coords
        const p1 = pathCoords[lowerIdx];
        const p2 = pathCoords[upperIdx];
        const currentLat = p1[0] + (p2[0] - p1[0]) * weight;
        const currentLng = p1[1] + (p2[1] - p1[1]) * weight;
        
        workerMarkerRef.current.setLatLng([currentLat, currentLng]);
        
        // Update ETA and Active Step dynamically based on progress
        const remainingTimeMinutes = Math.max(0, Math.ceil((1 - progress) * 15)); // Mock 15 mins total
        setEta(remainingTimeMinutes);
        
        if (progress > 0 && progress < 0.95) {
           setActiveStep(1); // Arriving
           if (progress < 0.33) setCurrentStatusText('Worker is on the way: Dispatched from Hub');
           else if (progress < 0.66) setCurrentStatusText('Worker is on the way: En route via Main Avenue');
           else setCurrentStatusText('Worker is on the way: Approaching your sector');
        }
        
        animationFrameRef.current = requestAnimationFrame(step);
      };
      
      animationFrameRef.current = requestAnimationFrame(step);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          initMap(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied or failed, using default map.");
          initMap(defaultUserPos[0], defaultUserPos[1]);
        }
      );
    } else {
      initMap(defaultUserPos[0], defaultUserPos[1]);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="page-content" style={{ minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column', paddingBottom: '12px' }}>

      <div className="page-header" style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '2px' }}>{t('liveTracking.title', 'Live Map Tracking')} 📍</h1>
          <p className="page-subtitle" style={{ fontSize: '0.85rem' }}>{t('liveTracking.subtitle', 'Watch your service expert arrive in real-time.')}</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '20px', flex: 1, marginBottom: '10px' }}>
        
        {/* Left Side: Map & Progress (Takes 100% height and scales) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, height: '100%' }}>
          
          {/* Map canvas container - flex-grow to take remaining screen space */}
          <div className="card" style={{
            flex: 1,
            minHeight: '350px',
            border: '2px solid rgba(255,255,255,0.4)',
            position: 'relative',
            background: '#e2e8f0',
            overflow: 'hidden',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)'
          }}>
            
            {/* Real Map Container for Leaflet */}
            <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
            
            {/* Vignette Overlay to make map look premium */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, transparent 30%, rgba(15,23,42,0.15) 120%)', zIndex: 2, pointerEvents: 'none' }} />

            {/* Floating Top Status Panel (Glassmorphism) */}
            <div style={{
              position: 'absolute', top: '20px', left: '20px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 20px', border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '14px', zIndex: 30
            }}>
              <div style={{ background: 'var(--primary-50)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <HiOutlineClock style={{ fontSize: '1.5rem', color: 'var(--primary-600)' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--navy-500)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Live Update</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy-900)', display: 'block', letterSpacing: '-0.02em' }}>
                  {eta === 0 ? 'Arrived at Doorstep' : `Arriving in ${eta} mins`}
                </span>
              </div>
            </div>

          </div>

          {/* Service Progress tracker timeline - compact padding */}
          <div className="card" style={{ padding: '16px 20px', background: 'white', border: '1px solid var(--gray-200)', flexShrink: 0 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>
              Service Status updates
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginBottom: '16px', fontWeight: 600 }}>
              📢 {currentStatusText}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'var(--navy-100)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '15px', left: '10%', width: `${(activeStep / 4) * 80}%`, height: '2px', background: 'var(--primary-500)', zIndex: 1, transition: 'width 1s ease' }} />
              
              {['Dispatched', 'Arriving', 'Arrived', 'Job Started', 'Completed'].map((step, idx) => {
                const isPassed = idx <= activeStep;
                const isActive = idx === activeStep;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: isPassed ? 'var(--primary-500)' : '#e2e8f0',
                      color: isPassed ? 'white' : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.75rem', zIndex: 2,
                      border: isActive ? '3px solid var(--primary-100)' : 'none'
                    }}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--navy-900)' : 'var(--navy-400)', marginTop: '8px' }}>
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <AnimatePresence>
              {activeStep >= 2 && activeStep < 4 && otpVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', border: '1px dashed #ef4444', borderRadius: '8px', textAlign: 'center' }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c' }}>🔐 SHARE SECURE START OTP</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#991b1b', letterSpacing: '8px', margin: '8px 0' }}>{startOTP}</div>
                  <p style={{ fontSize: '0.7rem', color: '#7f1d1d', margin: 0 }}>Do not share this OTP until the professional has arrived and you are ready to begin.</p>
                </motion.div>
              )}
            </AnimatePresence>



            <AnimatePresence>
              {activeStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '16px', textAlign: 'center' }}
                >
                  <Link 
                    to={`/customer/review/${bookingId}?service=${encodeURIComponent(serviceName)}&worker=${encodeURIComponent(workerName)}`} 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 800 }}
                  >
                    🎉 Service Complete — Proceed to Review & Rating
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Side: Professional Details (Tightly scaled, flexbox layout to prevent overflow) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, height: '100%' }}>
          
          <div className="card" style={{ padding: '24px 20px', textAlign: 'center', background: 'white', flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0, border: '1px solid var(--gray-200)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Assigned Team (Verify Faces)
            </span>   
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '16px 0 8px' }}>
              {/* Senior Worker */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'var(--primary-700)', color: 'white', border: '3px solid var(--primary-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 800
                }}>
                  {getInitials(workerName)}
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', margin: '6px 0 2px' }}>{workerName}</h4>
                <div style={{ fontSize: '0.65rem', color: 'var(--primary-700)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Senior Pro
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--navy-600)', marginTop: '4px' }}>💼 1,500+ jobs</div>
              </div>

              {/* Trainee (Mock Data) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: '#dc2626', color: 'white', border: '3px solid #fecaca',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 800
                }}>
                  KP
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', margin: '6px 0 2px' }}>Karan Patel</h4>
                <div style={{ fontSize: '0.65rem', color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Trainee
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--navy-600)', marginTop: '4px' }}>🎓 7 shadow jobs</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem', fontWeight: 800 }}
                onClick={() => {
                  alert(`📞 Masked calling initiated with ${workerName}. Your phone number remains private.`);
                }}
              >
                <HiOutlinePhone /> Call
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem', fontWeight: 800 }}
                onClick={() => alert(`💬 Secure chat session started with ${workerName}.`)}
              >
                <HiOutlineChatBubbleLeftRight /> Chat
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '16px 20px', border: '1px solid var(--gray-200)', background: 'white', flex: 0.8, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <HiOutlineShieldCheck style={{ color: 'var(--primary-500)', fontSize: '1.1rem' }} /> Safety Shield Active
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.7rem', color: 'var(--navy-600)' }}>
              <li><strong style={{ color: 'var(--navy-800)' }}>KYC Verification:</strong> Vetted via national criminal databases.</li>
              <li><strong style={{ color: 'var(--navy-800)' }}>Secure Transit Logs:</strong> Coordinates are tracked live at headquarters.</li>
              <li><strong style={{ color: 'var(--navy-800)' }}>Insurance Assured:</strong> Session covered up to ₹10,000 for damages.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LiveTracking;
