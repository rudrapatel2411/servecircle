import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePhone, HiOutlineChatBubbleLeftRight,
  HiOutlineClock, HiOutlineShieldCheck, HiOutlineMapPin,
  HiOutlineClipboardDocumentList, HiOutlineMegaphone,
  HiOutlineLockClosed, HiOutlineCheckCircle, HiOutlineCheck,
  HiOutlineBriefcase, HiOutlineAcademicCap,
  HiOutlineMicrophone, HiOutlineSpeakerWave, HiOutlinePaperAirplane,
  HiOutlineXMark, HiOutlinePhoneXMark
} from 'react-icons/hi2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { socket } from '../../socket';
import { getSession, requestApi } from '../../utils/authSession';
import { subscribeToCrossTabNotifications, broadcastNotificationToTabs } from '../../utils/notificationSync';
import '../Dashboard.css';
import './CustomerPages.css';

const statusToStep = (status) => {
  switch (status) {
    case 'pending':
    case 'confirmed':
    case 'assigned':
      return { step: 0, text: 'Professional is dispatched and preparing tools.', eta: 15, otp: false };
    case 'on_the_way':
    case 'en-route':
      return { step: 1, text: 'Worker is en route to your location.', eta: 8, otp: false };
    case 'arrived':
      return { step: 2, text: 'Arrived at your doorstep! Please share Start OTP.', eta: 0, otp: true };
    case 'in_progress':
    case 'started':
      return { step: 3, text: 'Job in progress (OTP Verified by Worker) 🛠️', eta: 0, otp: false };
    case 'completed':
      return { step: 4, text: 'Job completed successfully!', eta: 0, otp: false };
    default:
      return { step: 0, text: 'Professional is dispatched and preparing tools.', eta: 15, otp: false };
  }
};

const LiveTracking = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const session = getSession();
  const token = session?.token;

  // Dynamic parameters from checkout / bookings
  const bookingId = searchParams.get('bookingId') || 'SC-2839';
  const serviceName = searchParams.get('service') || 'AC Servicing';
  const workerName = searchParams.get('worker') || 'Rajesh Kumar';
  const price = searchParams.get('price') || '499';

  const [bookingData, setBookingData] = useState(null);
  const [isRealTracking, setIsRealTracking] = useState(false);
  const [hasRealGps, setHasRealGps] = useState(false);

  // Unified Single Source of Truth for OTP across all screens
  const urlOtp = searchParams.get('startOtp');
  const storedOtp = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('servecircle_customer_bookings') || '[]');
      const b = stored.find((item) => item.id === bookingId || item.bookingId === bookingId);
      if (b?.startOtp) return b.startOtp;
      const otpMap = JSON.parse(localStorage.getItem('servecircle_booking_otps') || '{}');
      if (otpMap[bookingId]) return otpMap[bookingId];
    } catch {}
    return null;
  }, [bookingId]);

  const currentOtp = urlOtp || bookingData?.startOtp || storedOtp || '4821';

  // Persist this exact OTP to servecircle_booking_otps so worker panel reads identical OTP
  useEffect(() => {
    try {
      const otpMap = JSON.parse(localStorage.getItem('servecircle_booking_otps') || '{}');
      if (!otpMap[bookingId] || otpMap[bookingId] !== currentOtp) {
        otpMap[bookingId] = currentOtp;
        localStorage.setItem('servecircle_booking_otps', JSON.stringify(otpMap));
      }
    } catch {}
  }, [bookingId, currentOtp]);

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
  const [otpVisible, setOtpVisible] = useState(false);

  // Call Modal State
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [callStatus, setCallStatus] = useState('Connecting...');

  // Chat Modal State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'worker',
      text: `Namaste! Main ServeCircle verified expert ${workerName} hoon. Main aapki location ki taraf aa raha hoon. Koi specific landmark ya gate instruction ho toh batayein.`,
      time: 'Just now',
    },
  ]);
  const [inputChat, setInputChat] = useState('');
  const [isWorkerTyping, setIsWorkerTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Call timer effect
  useEffect(() => {
    let timer = null;
    let connectTimeout = null;
    if (isCallOpen) {
      setCallStatus('Connecting via ServeCircle Private Relay...');
      connectTimeout = setTimeout(() => {
        setCallStatus('Connected (Secure Masked Line)');
      }, 1200);

      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
      setCallStatus('Connecting...');
    }
    return () => {
      if (timer) clearInterval(timer);
      if (connectTimeout) clearTimeout(connectTimeout);
    };
  }, [isCallOpen]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Chat send handler
  const sendChatMessage = (textToSend) => {
    const text = (textToSend || inputChat).trim();
    if (!text) return;

    const newMsg = {
      sender: 'customer',
      text,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputChat('');
    setIsWorkerTyping(true);

    setTimeout(() => {
      setIsWorkerTyping(false);
      let reply = `Ji bilkul sir! Main raste me hoon, bas 5-7 minute me aapke ghar pahunch raha hoon.`;
      const lower = text.toLowerCase();
      if (lower.includes('gate') || lower.includes('security') || lower.includes('guard')) {
        reply = `Theek hai sir, main entry gate par security guard ko booking ID dikha kar andar aata hoon.`;
      } else if (lower.includes('otp')) {
        reply = `Haanji sir, main doorstep par aakar aapse 4-digit Start OTP (${currentOtp}) poochhunga, phir service shuru karenge!`;
      } else if (lower.includes('der') || lower.includes('time') || lower.includes('kab')) {
        reply = `Sir GPS route ke hisab se bas 5 se 8 minute lagenge, main almost society ke pass hoon.`;
      } else if (lower.includes('phone') || lower.includes('call')) {
        reply = `Ji sir, main abhi location par pahunchte hi aapko isi masked line se call karta hoon.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'worker',
          text: reply,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1300);
  };

  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isWorkerTyping, isChatOpen]);

  useEffect(() => {
    let isMounted = true;
    const fetchBookingDetails = async () => {
      if (!token) return;
      try {
        const myBookings = await requestApi('/bookings/my', { token });
        if (isMounted && Array.isArray(myBookings)) {
          const match = myBookings.find(
            (b) => b.bookingId === bookingId || b._id === bookingId || String(b.bookingId).includes(bookingId)
          );
          if (match) {
            setBookingData(match);
            setIsRealTracking(true);
            const mapping = statusToStep(match.status);
            setActiveStep(mapping.step);
            setCurrentStatusText(mapping.text);
            setEta(mapping.eta);
            setOtpVisible(mapping.otp);

            if (match.workerArrivalLocation?.coordinates?.length === 2) {
              setHasRealGps(true);
            }
          }
        }
      } catch (err) {
        console.warn('Backend booking lookup failed, preserving demo simulation:', err);
      }
    };

    fetchBookingDetails();
    return () => { isMounted = false; };
  }, [bookingId, token]);

  useEffect(() => {
    const handleStatusUpdate = (data) => {
      if (!data) return;
      if (data.bookingId === bookingId || (bookingData && data.bookingId === bookingData.bookingId)) {
        setIsRealTracking(true);
        const mapping = statusToStep(data.currentStatus || data.status);
        setActiveStep(mapping.step);
        setCurrentStatusText(mapping.text);
        setEta(mapping.eta);
        setOtpVisible(mapping.otp);
      }
    };

    socket.on('booking_status_changed', handleStatusUpdate);

    // Cross-tab broadcast listener (ensures live sync across browser tabs)
    const unsubscribe = subscribeToCrossTabNotifications((notif) => {
      if (notif?.type === 'booking_status' && notif.bookingId === bookingId) {
        handleStatusUpdate(notif);
      }
    });

    return () => {
      socket.off('booking_status_changed', handleStatusUpdate);
      unsubscribe();
    };
  }, [bookingId, bookingData]);

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
      const createPremiumIcon = (iconSvg, color1, color2, isWorker = false, label = '') => L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          width: ${isWorker ? '52px' : '48px'}; 
          height: ${isWorker ? '52px' : '48px'}; 
          border-radius: 50%;
          background: linear-gradient(135deg, ${color1}, ${color2}); 
          border: 3px solid white;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          ${isWorker ? 'animation: pulse 1.5s infinite;' : ''}
        ">
          ${iconSvg}
        </div>
        ${!isWorker ? `<span style="font-size: 0.75rem; font-weight: 800; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.5); color: var(--navy-900); display: inline-block; margin-top: 6px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: absolute; top: 100%; left: 50%; transform: translateX(-50%);">${label}</span>` : ''}
        `,
        iconSize: isWorker ? [52, 52] : [48, 48],
        iconAnchor: isWorker ? [26, 26] : [24, 24],
      });

      const hubSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:white;"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`;
      const homeSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:white;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
      const workerSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:white;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`;

      const hubIcon = createPremiumIcon(hubSvg, '#64748b', '#475569', false, 'Hub');
      const homeIcon = createPremiumIcon(homeSvg, 'var(--navy-700)', 'var(--navy-900)', false, 'Your Location');
      const workerIcon = createPremiumIcon(workerSvg, '#60a5fa', '#2563eb', true);

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
      if (hasRealGps && bookingData?.workerArrivalLocation?.coordinates?.length === 2) {
        const [wLng, wLat] = bookingData.workerArrivalLocation.coordinates;
        if (workerMarkerRef.current) {
          workerMarkerRef.current.setLatLng([wLat, wLng]);
        }
        return;
      }

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
           setCurrentStatusText('Arrived at your doorstep!');
           setOtpVisible(true);
           
           // Simulate job progression after arrival
           setTimeout(() => {
             setActiveStep(3); // Job Started
             setCurrentStatusText('Job in progress...');
             setTimeout(() => {
               setActiveStep(4); // Finished
               setCurrentStatusText('Job completed successfully!');
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

      <div className="page-header" style={{ marginBottom: '16px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {t('liveTracking.title', 'Live Map Tracking')} <HiOutlineMapPin style={{ color: 'var(--primary-600)' }} />
            </h1>
            <span style={{
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '12px',
              fontWeight: 700,
              background: isRealTracking ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
              color: isRealTracking ? '#16a34a' : '#ca8a04',
              border: `1px solid ${isRealTracking ? '#bbf7d0' : '#fef08a'}`
            }}>
              {isRealTracking ? (hasRealGps ? '● Live GPS Tracking' : '● Real-Time Booking Data') : '○ Demo Simulation Mode'}
            </span>
          </div>
          <p className="page-subtitle" style={{ fontSize: '0.85rem' }}>{t('liveTracking.subtitle', 'Watch your service expert arrive in real-time.')}</p>
        </div>
        <Link to="/customer/bookings" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <HiOutlineClipboardDocumentList /> View My Bookings
        </Link>
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
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlineMegaphone style={{ color: 'var(--primary-600)', fontSize: '1rem', flexShrink: 0 }} /> {currentStatusText}
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
                      {isPassed ? <HiOutlineCheck style={{ strokeWidth: 3 }} /> : idx + 1}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--navy-900)' : 'var(--navy-400)', marginTop: '8px' }}>
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STEP 2: ARRIVED — Amazon-Style Delivery Verification OTP Box */}
            <AnimatePresence>
              {activeStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '16px',
                    padding: '18px 16px',
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '2px solid #f59e0b',
                    borderRadius: '14px',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)'
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#d97706', color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    <HiOutlineLockClosed /> Amazon-Style Delivery Verification
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#92400e', margin: '4px 0' }}>
                    🔔 {workerName} has arrived at your doorstep!
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#78350f', margin: '2px 0 10px' }}>
                    Jaise delivery boy parcel dene se pehle OTP maangte hain, waise hi kaam shuru karne ke liye apna <strong>Start OTP</strong> share karein:
                  </p>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#b45309',
                    letterSpacing: '12px',
                    margin: '6px 0',
                    fontFamily: 'monospace',
                    background: 'white',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: '2px solid #fde68a',
                    display: 'inline-block',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}>
                    {currentOtp}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '8px', fontWeight: 700 }}>
                    ⏳ Worker Panel me yeh OTP enter karne ke baad hi kaam officially shuru hoga.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 3: STARTED — Verification Success & In Progress */}
            <AnimatePresence>
              {activeStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '16px',
                    padding: '14px',
                    background: '#f0fdf4',
                    border: '1px solid #22c55e',
                    borderRadius: '10px',
                    textAlign: 'center',
                    color: '#15803d'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800, fontSize: '0.95rem' }}>
                    <HiOutlineCheckCircle style={{ fontSize: '1.4rem' }} /> Start OTP Verified! Work in Progress 🛠️
                  </div>
                  <p style={{ fontSize: '0.75rem', margin: '4px 0 0', color: '#166534' }}>
                    {workerName} ne Start OTP verify kar liya hai. Service safely shuru ho chuki hai.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 0 OR 1: DISPATCHED / EN-ROUTE OTP PREVIEW */}
            {activeStep < 2 && (
              <div style={{ marginTop: '14px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>🔒 Service Start OTP:</span> (Worker ke aane par share karein)
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb', letterSpacing: '3px', background: '#eff6ff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                  {currentOtp}
                </div>
              </div>
            )}

            {/* STEP 4: COMPLETED CTA */}
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
                    style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <HiOutlineCheckCircle style={{ fontSize: '1.2rem' }} /> Service Complete — Proceed to Review & Rating
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Testing Simulation Controls */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>Quick Test Simulation:</span>
              <button
                type="button"
                onClick={() => {
                  setActiveStep(1);
                  setCurrentStatusText('Worker is en route to your location.');
                  setEta(8);
                  setOtpVisible(false);
                }}
                style={{ fontSize: '0.68rem', padding: '3px 8px', background: activeStep === 1 ? '#dbeafe' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                1. En Route
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveStep(2);
                  setCurrentStatusText('Arrived at your doorstep! Please share Start OTP.');
                  setEta(0);
                  setOtpVisible(true);
                }}
                style={{ fontSize: '0.68rem', padding: '3px 8px', background: activeStep === 2 ? '#fef3c7' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, color: '#b45309' }}
              >
                2. Arrived (Ask OTP)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveStep(3);
                  setCurrentStatusText('Job in progress (OTP Verified by Worker) 🛠️');
                  setEta(0);
                  setOtpVisible(false);
                }}
                style={{ fontSize: '0.68rem', padding: '3px 8px', background: activeStep === 3 ? '#dcfce7' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, color: '#15803d' }}
              >
                3. OTP Verified (Work Starts)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveStep(4);
                  setCurrentStatusText('Job completed successfully!');
                  setEta(0);
                  setOtpVisible(false);
                }}
                style={{ fontSize: '0.68rem', padding: '3px 8px', background: activeStep === 4 ? '#e0e7ff' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
              >
                4. Completed
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Professional Details */}
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
                <div style={{ fontSize: '0.7rem', color: 'var(--navy-600)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineBriefcase /> 1,500+ jobs
                </div>
              </div>

              {/* Trainee */}
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
                <div style={{ fontSize: '0.7rem', color: 'var(--navy-600)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineAcademicCap /> 7 shadow jobs
                </div>
              </div>
            </div>

            {/* Working Call & Chat Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => setIsCallOpen(true)}
              >
                <HiOutlinePhone /> Call
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '0.82rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => setIsChatOpen(true)}
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

      {/* ===== INTERACTIVE CALL MODAL ===== */}
      <AnimatePresence>
        {isCallOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '100%', maxWidth: '380px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white', borderRadius: '24px', padding: '28px 24px', textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative'
              }}
            >
              <button
                type="button"
                onClick={() => setIsCallOpen(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                <HiOutlineXMark />
              </button>

              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8', fontWeight: 800, marginBottom: '16px' }}>
                ServeCircle Masked Private Relay
              </div>

              {/* Avatar with pulse ring */}
              <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 16px' }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 900, color: 'white',
                  border: '3px solid #38bdf8', boxShadow: '0 0 24px rgba(56, 189, 248, 0.4)'
                }}>
                  {getInitials(workerName)}
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px', color: 'white' }}>{workerName}</h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 12px' }}>Senior Service Pro · Assigned Expert</p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', color: '#a7f3d0', marginBottom: '16px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                {callStatus}
              </div>

              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '2px', color: '#f8fafc', marginBottom: '24px' }}>
                {formatTimer(callDuration)}
              </div>

              {/* Controls: Mute, Speaker, End */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setIsMuted((p) => !p)}
                  style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.12)',
                    border: 'none', color: 'white', fontSize: '1.3rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <HiOutlineMicrophone />
                </button>

                <button
                  type="button"
                  onClick={() => setIsCallOpen(false)}
                  style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: '#ef4444', border: 'none', color: 'white', fontSize: '1.8rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)'
                  }}
                  title="End Call"
                >
                  <HiOutlinePhoneXMark />
                </button>

                <button
                  type="button"
                  onClick={() => setIsSpeaker((p) => !p)}
                  style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: isSpeaker ? '#2563eb' : 'rgba(255,255,255,0.12)',
                    border: 'none', color: 'white', fontSize: '1.3rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title={isSpeaker ? 'Speaker On' : 'Speaker Off'}
                >
                  <HiOutlineSpeakerWave />
                </button>
              </div>

              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                🔒 100% Privacy Protected. Your real phone number is not revealed.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== INTERACTIVE CHAT MODAL ===== */}
      <AnimatePresence>
        {isChatOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '100%', maxWidth: '440px', height: '560px',
                background: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden'
              }}
            >
              {/* Chat Header */}
              <div style={{
                padding: '16px 20px', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: 'white', color: '#1e3a8a', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: '1rem'
                  }}>
                    {getInitials(workerName)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{workerName}</h4>
                    <span style={{ fontSize: '0.72rem', color: '#bfdbfe', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} /> Online · Senior Pro
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer' }}
                >
                  <HiOutlineXMark />
                </button>
              </div>

              {/* Message List */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ textAlign: 'center', margin: '4px 0' }}>
                  <span style={{ fontSize: '0.65rem', background: '#e2e8f0', color: '#64748b', padding: '2px 10px', borderRadius: '12px', fontWeight: 700 }}>
                    End-to-End Encrypted Service Chat
                  </span>
                </div>

                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.sender === 'customer' ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      padding: '10px 14px',
                      borderRadius: msg.sender === 'customer' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: msg.sender === 'customer' ? '#2563eb' : 'white',
                      color: msg.sender === 'customer' ? 'white' : '#0f172a',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      fontSize: '0.82rem',
                      lineHeight: 1.4
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '0.62rem', opacity: 0.75, textAlign: 'right', marginTop: '4px' }}>{msg.time}</div>
                  </div>
                ))}

                {isWorkerTyping && (
                  <div style={{ alignSelf: 'flex-start', padding: '8px 12px', background: 'white', borderRadius: '14px 14px 14px 2px', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {workerName} is typing...
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Preset Chips */}
              <div style={{ padding: '8px 12px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {['Aap kitni der me aa rahe ho?', 'Main ghar par ready hoon.', 'Gate par security guard ko bol diya hai.', 'Start OTP screen par ready hai.'].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendChatMessage(chip)}
                    style={{
                      background: 'white', border: '1px solid #cbd5e1', borderRadius: '16px',
                      padding: '4px 10px', fontSize: '0.7rem', color: '#334155', cursor: 'pointer',
                      flexShrink: 0, fontWeight: 600
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendChatMessage();
                }}
                style={{ padding: '12px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}
              >
                <input
                  type="text"
                  placeholder="Type a message to Rajesh Kumar..."
                  value={inputChat}
                  onChange={(e) => setInputChat(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
                <button
                  type="submit"
                  style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                  }}
                >
                  <HiOutlinePaperAirplane />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LiveTracking;
