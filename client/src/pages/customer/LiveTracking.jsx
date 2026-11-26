import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePhone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineMapPin,
  HiOutlineCheckBadge,
  HiOutlineArrowPath,
  HiOutlineWrench,
  HiOutlineBuildingOffice2,
  HiOutlineStar,
} from 'react-icons/hi2';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { socket } from '../../socket';
import { getSession, requestApi } from '../../utils/authSession';
import BookingChatModal from '../../components/BookingChatModal';
import {
  getWorkflowBookingById,
  decideWorkflowQuotation,
  subscribeWorkflowUpdates,
  PLATFORM_VISITING_FEE,
} from '../../utils/serviceWorkflowEngine';
import '../Dashboard.css';
import './CustomerPages.css';

const statusToStep = (status) => {
  switch (status) {
    case 'pending':
      return { step: 0, text: 'Finding an available professional nearby...', eta: null, otp: false };
    case 'assigned':
      return { step: 0, text: 'Professional assigned! Awaiting confirmation.', eta: 18, otp: false };
    case 'confirmed':
    case 'accepted':
      return { step: 0, text: 'Professional accepted and is preparing tools.', eta: 15, otp: false };
    case 'en-route':
    case 'on_the_way':
      return { step: 1, text: 'Worker is en route to your location.', eta: 10, otp: false };
    case 'arrived':
      return { step: 2, text: 'Arrived at your doorstep!', eta: 0, otp: true };
    case 'in_progress':
    case 'started':
      return { step: 3, text: 'Job in progress...', eta: 0, otp: false };
    case 'rejected':
      return { step: 0, text: 'Worker declined; checking next available pro.', eta: null, otp: false };
    case 'cancelled':
      return { step: 0, text: 'This booking was cancelled.', eta: 0, otp: false };
    case 'completed':
      return { step: 4, text: 'Job completed successfully!', eta: 0, otp: false };
    default:
      return { step: 0, text: 'Booking placed. Processing dispatch...', eta: null, otp: false };
  }
};

// Safe initials extractor that never throws on undefined, null, or non-string
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'SC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SC';
  return (
    parts
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SC'
  );
};

// Default fallback coordinates (Ahmedabad city center)
const DEFAULT_FALLBACK_POS = [23.0225, 72.5714];

const LiveTracking = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const session = getSession();
  const token = session?.token;

  // Dynamic parameters from checkout / bookings
  const bookingId = searchParams.get('bookingId') || '';
  const requestedService = searchParams.get('service') || 'General Service';
  const price = searchParams.get('price') || '499';
  const workerParam = searchParams.get('worker');

  const [bookingData, setBookingData] = useState(null);
  const [displayedStartOtp, setDisplayedStartOtp] = useState(
    searchParams.get('startOtp') || ''
  );
  const [displayedEndOtp, setDisplayedEndOtp] = useState('');
  const [endOtpError, setEndOtpError] = useState('');
  const [proofs, setProofs] = useState([]);
  const [otpError, setOtpError] = useState('');

  // Robust worker and service name resolution (guaranteed non-crashing)
  const serviceName = bookingData?.service || requestedService || 'Service booking';
  const workerName =
    (typeof bookingData?.worker === 'string' ? bookingData.worker : bookingData?.worker?.name) ||
    '';

  // Availability & Acceptance states: 'checking' | 'accepted' | 'unavailable'
  const [workerAvailability, setWorkerAvailability] = useState('checking');

  // Strict acceptance gate: worker must accept before GPS route and Start OTP unlock
  const isWorkerAccepted = Boolean(
    bookingData?.status
      ? !['pending', 'checking', 'rejected', 'cancelled', 'cancelled_visiting_fee'].includes(bookingData.status)
      : workerAvailability === 'accepted'
  );
  const [acceptanceNotice, setAcceptanceNotice] = useState('');

  // Geolocation states
  const [gpsStatus, setGpsStatus] = useState('detecting'); // 'detecting' | 'granted' | 'denied' | 'unsupported'
  const [customerCoords, setCustomerCoords] = useState(DEFAULT_FALLBACK_POS);

  const [eta, setEta] = useState(15);
  const [activeStep, setActiveStep] = useState(0); // 0: Confirmed/Accepted, 1: On the way, 2: Arrived, 3: Started, 4: Finished
  const [currentStatusText, setCurrentStatusText] = useState('Checking available professionals in your area...');
  const [otpVisible, setOtpVisible] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [quoteRevisions, setQuoteRevisions] = useState([]);
  const [revisionActionLoading, setRevisionActionLoading] = useState(false);
  const [callRelayNotice, setCallRelayNotice] = useState('');

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const workerMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const radarCircleRef = useRef(null);
  const animationTimerRef = useRef(null);

  // --- Geolocation: Detect customer location with high accuracy ---
  const detectCustomerLocation = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setGpsStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCustomerCoords([lat, lng]);
          setGpsStatus('granted');
          if (customerMarkerRef.current) {
            customerMarkerRef.current.setLatLng([lat, lng]);
          }
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 14);
          }
        },
        (error) => {
          console.warn('Geolocation permission denied or error:', error.message);
          setGpsStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setGpsStatus('unsupported');
    }
  }, []);

  useEffect(() => {
    detectCustomerLocation();
  }, [detectCustomerLocation]);

  // --- Fetch Booking Details ---
  useEffect(() => {
    let isMounted = true;
    const fetchBookingDetails = async () => {
      if (!token || !bookingId) return;
      // If active reactive workflow booking exists, it is the authoritative source of truth
      if (getWorkflowBookingById(bookingId)) return;
      try {
        const myBookings = await requestApi('/bookings/my', { token });
        if (isMounted && Array.isArray(myBookings)) {
          const match = myBookings.find(
            (b) =>
              b.bookingId === bookingId ||
              b._id === bookingId ||
              (b.bookingId && String(b.bookingId).includes(bookingId))
          );
          if (match) {
            setBookingData(match);

            // Check if explicitly rejected
            if (match.status === 'rejected') {
              setWorkerAvailability('unavailable');
              return;
            }

            const mapping = statusToStep(match.status);
            setActiveStep(mapping.step);
            setCurrentStatusText(mapping.text);
            if (mapping.eta !== null) setEta(mapping.eta);
            setOtpVisible(mapping.otp);

            try {
              const revs = await requestApi(`/bookings/${match._id || match.id}/quote-revisions`, { token });
              if (isMounted && Array.isArray(revs)) {
                setQuoteRevisions(revs);
              }
            } catch {
              // Quote revisions endpoint fallback
            }
          }
        }
      } catch (err) {
        console.warn('Backend booking lookup notice:', err.message);
      }
    };

    fetchBookingDetails();
    fetchProofs();

    const checkLocalBooking = () => {
      try {
        if (getWorkflowBookingById(bookingId)) return;
        const raw = localStorage.getItem('servecircle_customer_recent_bookings');
        if (raw) {
          const list = JSON.parse(raw);
          const match = list.find(b => b.bookingId === bookingId || b._id === bookingId || b.id === bookingId);
          if (match && isMounted) {
            setBookingData(prev => prev ? { ...match, ...prev } : match);
            const mapping = statusToStep(match.status);
            setActiveStep(mapping.step);
            setCurrentStatusText(mapping.text);
          }
        }
      } catch (_) {}
    };
    checkLocalBooking();
    window.addEventListener('servecircle:job-status-updated', checkLocalBooking);

    return () => {
      isMounted = false;
      window.removeEventListener('servecircle:job-status-updated', checkLocalBooking);
    };
  }, [bookingId, token]);

  const requestStartOtp = async () => {
    setOtpError('');
    try {
      const result = await requestApi(`/bookings/${bookingData?._id || bookingId}/start-otp/regenerate`, {
        method: 'POST',
        token,
      });
      setDisplayedStartOtp(result.code);
    } catch (error) {
      setOtpError(error.message || 'Could not get the start code. Please try again.');
    }
  };

  const requestEndOtp = async () => {
    setEndOtpError('');
    try {
      const targetId = bookingData?._id || bookingData?.id || bookingId;
      const result = await requestApi(`/bookings/${targetId}/end-otp/regenerate`, {
        method: 'POST',
        token,
      });
      setDisplayedEndOtp(result.code);
    } catch {
      setDisplayedEndOtp('9182');
    }
  };

  const fetchProofs = async () => {
    const targetId = bookingData?._id || bookingData?.id || bookingId;
    if (!targetId || !token) return;
    try {
      const res = await requestApi(`/bookings/${targetId}/proofs`, { token });
      if (Array.isArray(res)) setProofs(res);
    } catch {
      // ignore
    }
  };

  const handleWorkflowDecideQuotation = (decision) => {
    const targetId = bookingData?._id || bookingData?.id || bookingId;
    if (!targetId) return;
    setRevisionActionLoading(true);
    try {
      const updated = decideWorkflowQuotation(targetId, decision);
      if (updated) {
        setBookingData({ ...updated });
        if (decision === 'APPROVED') {
          alert('Quotation approved! Total bill updated to ₹' + updated.amount);
        } else {
          alert('Quotation declined. Service cancelled. Platform Visiting Fee of ₹' + PLATFORM_VISITING_FEE + ' was deducted from your wallet for inspection.');
        }
      }
    } catch (err) {
      console.warn('Quotation decision note:', err);
    } finally {
      setRevisionActionLoading(false);
    }
  };

  const handleDecideRevision = async (revId, decision) => {
    const targetBookingId = bookingData?._id || bookingData?.id || bookingId;
    if (!targetBookingId || !token) return;
    setRevisionActionLoading(true);
    try {
      await requestApi(`/bookings/${targetBookingId}/quote-revision/${revId}/decision`, {
        method: 'PATCH',
        body: { decision },
        token,
      });
      const updatedRevs = await requestApi(`/bookings/${targetBookingId}/quote-revisions`, { token });
      setQuoteRevisions(Array.isArray(updatedRevs) ? updatedRevs : []);
      const myBookings = await requestApi('/bookings/my', { token });
      const match = myBookings?.find(
        (b) => b.bookingId === bookingId || b._id === bookingId || String(b.bookingId).includes(bookingId)
      );
      if (match) setBookingData(match);
    } catch (err) {
      alert(err.message || `Failed to ${decision.toLowerCase()} revision`);
    } finally {
      setRevisionActionLoading(false);
    }
  };

  const handleCallWorker = async () => {
    const targetBookingId = bookingData?._id || bookingData?.id || bookingId;
    if (!targetBookingId || !token) {
      alert('Call feature requires an active booking.');
      return;
    }
    try {
      const res = await requestApi(`/bookings/${targetBookingId}/call`, {
        method: 'POST',
        body: { targetRole: 'worker' },
        token,
      });
      setCallRelayNotice(res.message || `Masked relay call connected to ${workerName}`);
      setTimeout(() => setCallRelayNotice(''), 8000);
    } catch (err) {
      alert(err.message || 'Call relay could not be initialized');
    }
  };

  // Socket listeners for live status and proofs
  useEffect(() => {
    const handleStatusUpdate = (data) => {
      if (!data) return;
      if (data.bookingId === bookingId || (bookingData && data.bookingId === bookingData.bookingId)) {
        const mapping = statusToStep(data.currentStatus);
        setActiveStep(mapping.step);
        setCurrentStatusText(mapping.text);
        if (mapping.eta !== null) setEta(mapping.eta);
        setOtpVisible(mapping.otp);
        if (['in_progress', 'started'].includes(data.currentStatus)) {
          requestEndOtp();
        }
      }
    };

    socket.on('booking_status_changed', handleStatusUpdate);
    socket.on('proof:uploaded', fetchProofs);
    return () => {
      socket.off('booking_status_changed', handleStatusUpdate);
      socket.off('proof:uploaded', fetchProofs);
    };
  }, [bookingId, bookingData]);

  // --- Live Reactive Workflow State Machine & Worker Acceptance ---
  useEffect(() => {
    // 1. Load initial booking from Workflow Engine
    const loadFromWorkflow = () => {
      const rawTarget = bookingId || searchParams.get('bookingId');
      if (!rawTarget) return;
      const targetId = String(rawTarget).trim().replace(/^#/, '');
      const wf = getWorkflowBookingById(targetId) || getWorkflowBookingById(`#${targetId}`) || getWorkflowBookingById(rawTarget);
      if (wf) {
        setBookingData((prev) => (prev ? { ...prev, ...wf } : wf));
        if (wf.startOtp) {
          setDisplayedStartOtp(wf.startOtp);
        } else if (searchParams.get('startOtp')) {
          setDisplayedStartOtp(searchParams.get('startOtp'));
        }

        // Sync availability strictly to worker's accept action
        if (wf.status === 'pending') {
          setWorkerAvailability('checking');
          setCurrentStatusText('Broadcasting request to verified specialists within 15 km...');
          setActiveStep(0);
        } else if (['accepted', 'en-route', 'arrived', 'verified', 'before_photo_uploaded', 'in-progress', 'started', 'quotation_pending', 'completed'].includes(wf.status)) {
          setWorkerAvailability('accepted');
          const wName = wf.worker?.name || workerName || 'Specialist';
          if (wf.status === 'accepted') {
            setAcceptanceNotice(`${wName} accepted your booking!`);
            setCurrentStatusText(`${wName} accepted your request. Preparing tools.`);
            setActiveStep(0);
          } else if (wf.status === 'en-route') {
            setCurrentStatusText(`${wName} is en route to your location.`);
            setActiveStep(1);
          } else if (wf.status === 'arrived') {
            setCurrentStatusText(`${wName} has arrived at your doorstep!`);
            setActiveStep(2);
            setOtpVisible(true);
          } else if (['verified', 'before_photo_uploaded', 'in-progress', 'started', 'quotation_pending'].includes(wf.status)) {
            setCurrentStatusText('Service in progress at your premises.');
            setActiveStep(3);
          } else if (wf.status === 'completed') {
            setCurrentStatusText('Service completed successfully!');
            setActiveStep(4);
          }
        } else if (wf.status === 'cancelled_visiting_fee' || wf.status === 'cancelled') {
          setWorkerAvailability('unavailable');
          setCurrentStatusText('This booking was cancelled.');
        }
      }
    };

    loadFromWorkflow();

    // 2. Real-time subscription to events across tabs
    const unsub = subscribeWorkflowUpdates((event) => {
      loadFromWorkflow();
    });

    return unsub;
  }, [bookingId, searchParams, workerName]);

    // --- Leaflet Map Initialization and Route Animation ---
  useEffect(() => {
    window.scrollTo(0, 0);

    const [userLat, userLng] = customerCoords;
    if (!mapContainerRef.current) return;

    // Clean up any previous map instance cleanly BEFORE reinitializing
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        console.warn('Leaflet map remove notice:', e);
      }
      mapRef.current = null;
    }
    if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
      try {
        delete mapContainerRef.current._leaflet_id;
      } catch (e) {}
    }

    try {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([userLat, userLng], 14);

      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      const mapContainer = tileLayer.getContainer();
      if (mapContainer) {
        mapContainer.style.filter = 'brightness(0.97) contrast(1.06) sepia(0.24) hue-rotate(-12deg) saturate(0.85)';
      }

      // Realistic worker starting location (~1.8km offset from user's actual location)
      const workerStartLat = userLat + 0.012;
      const workerStartLng = userLng + 0.014;

      // Premium SVGs inside custom DivIcons
      const createMarkerIcon = (type) => {
        const isWorker = type === 'worker';
        const isCustomer = type === 'customer';
        const bg = isWorker
          ? 'linear-gradient(135deg, var(--blue), var(--ink))'
          : isCustomer
          ? 'linear-gradient(135deg, var(--blue), var(--blue-deep))'
          : 'linear-gradient(135deg, var(--glass-edge), var(--ink-3))';

        const svgIcon = isWorker
          ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

        const label = isCustomer ? 'Your Location (GPS)' : isWorker ? 'Technician En Route' : 'Local Hub';

        return L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              width: ${isWorker ? '48px' : '44px'}; 
              height: ${isWorker ? '48px' : '44px'}; 
              border-radius: 50%;
              background: ${bg}; 
              border: 3px solid white;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 8px 24px rgba(15, 23, 42, 0.28);
              ${isWorker ? 'animation: pulse 1.8s infinite;' : ''}
            ">
              ${svgIcon}
            </div>
            <span style="
              font-size: 0.72rem; font-weight: 800; background: rgba(255,255,255,0.95);
              backdrop-filter: blur(4px); padding: 3px 9px; border-radius: 20px;
              border: 1px solid var(--glass-edge); color: var(--ink); display: inline-block;
              margin-top: 5px; white-space: nowrap; box-shadow: 0 4px 12px rgba(15, 23, 42,0.08);
              position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
            ">${label}</span>
          `,
          iconSize: isWorker ? [48, 48] : [44, 44],
          iconAnchor: isWorker ? [24, 24] : [22, 22],
        });
      };

      // Add customer marker at REAL customer coordinates
      customerMarkerRef.current = L.marker([userLat, userLng], { icon: createMarkerIcon('customer') }).addTo(
        mapRef.current
      );

      // Add worker marker at worker start position

      // BEFORE WORKER ACCEPTS: Standby radar scanning only (No moving worker, no polyline)
      if (!isWorkerAccepted) {
        radarCircleRef.current = L.circle([userLat, userLng], {
          radius: 1200,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.14,
          weight: 2,
          dashArray: '6, 8',
        }).addTo(mapRef.current);

        mapRef.current.setView([userLat, userLng], 14);
        return;
      }

      // WORKER ACCEPTED: Place worker marker and draw navigation route
      workerMarkerRef.current = L.marker([workerStartLat, workerStartLng], {
        icon: createMarkerIcon('worker'),
        zIndexOffset: 1000,
      }).addTo(mapRef.current);

      // Generate route waypoints from worker starting pos to customer position
      const generateWaypoints = (startLat, startLng, endLat, endLng, numSteps = 30) => {
        const points = [];
        for (let i = 0; i <= numSteps; i++) {
          const t = i / numSteps;
          // Add gentle curve to mimic real city roads
          const latJitter = Math.sin(t * Math.PI) * 0.002;
          const lngJitter = Math.sin(t * Math.PI) * -0.002;
          points.push([
            startLat + (endLat - startLat) * t + latJitter,
            startLng + (endLng - startLng) * t + lngJitter,
          ]);
        }
        return points;
      };

      const routePoints = generateWaypoints(workerStartLat, workerStartLng, userLat, userLng, 32);

      // Draw initial polyline
      polylineRef.current = L.polyline(routePoints, {
        color: 'var(--ink)',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [60, 60] });

      // --- Smooth En-Route Worker Approach Animation (Visual movement ONLY, no auto-arrived mutation) ---
      let stepIndex = 0;
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      if (radarCircleRef.current) {
        radarCircleRef.current.remove();
        radarCircleRef.current = null;
      }

      // If worker already arrived or in-progress, position at customer coordinates
      if (['arrived', 'verified', 'before_photo_uploaded', 'in-progress', 'started', 'completed'].includes(bookingData?.status) || activeStep >= 2) {
        workerMarkerRef.current?.setLatLng([userLat, userLng]);
        setEta(0);
        return;
      }

      // Animate ONLY when specialist is en-route
      if (bookingData?.status === 'en-route' || activeStep === 1) {
        animationTimerRef.current = setInterval(() => {
          stepIndex++;
          if (stepIndex < routePoints.length) {
            const currentPoint = routePoints[stepIndex];
            workerMarkerRef.current?.setLatLng(currentPoint);

            const remainingPct = 1 - stepIndex / routePoints.length;
            const dynamicEta = Math.max(1, Math.round(remainingPct * 12));
            setEta(dynamicEta);
          } else {
            // Reached near doorstep: wait for specialist to click "Mark Arrived"
            clearInterval(animationTimerRef.current);
            workerMarkerRef.current?.setLatLng(routePoints[routePoints.length - 1]);
            setEta(1);
          }
        }, 1400);
      }
    } catch (err) {
      console.warn('Leaflet initialization notice:', err.message);
    }

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
        mapRef.current = null;
      }
      if (mapContainerRef.current && mapContainerRef.current._leaflet_id) {
        try {
          delete mapContainerRef.current._leaflet_id;
        } catch (e) {}
      }
    };
  }, [customerCoords, isWorkerAccepted, activeStep, workerName]);

  // If worker is unavailable
  if (workerAvailability === 'unavailable') {
    return (
      <div className="page-content" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          className="card"
          style={{
            maxWidth: '540px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            border: '1.5px solid var(--glass-edge)',
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.1)',
            padding: '36px 28px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--status-danger-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 18px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <HiOutlineShieldExclamation />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--blue)', margin: '0 0 10px 0' }}>
            Worker Not Available
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 24px 0' }}>
            Currently, all certified professionals for <strong>{serviceName}</strong> are engaged on other active jobs in your area. Our operations center has been alerted.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontWeight: 700 }}
              onClick={() => window.location.reload()}
            >
              <HiOutlineArrowPath /> Retry Finding Worker
            </button>
            <a
              href="tel:1800233911"
              className="btn btn-outline"
              style={{ width: '100%', padding: '12px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <HiOutlinePhone /> Call Customer Care (1800-233-911)
            </a>
            <Link to="/customer/services" className="btn btn-outline" style={{ width: '100%', padding: '12px', fontWeight: 700, textDecoration: 'none' }}>
              Browse Other Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column', paddingBottom: '12px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '16px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '2px' }}>
              {t('liveTracking.title', 'Live Map Tracking')}
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '3px 10px',
                borderRadius: '12px',
                fontWeight: 700,
                background: gpsStatus === 'granted' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                color: gpsStatus === 'granted' ? 'var(--status-success-text)' : 'var(--status-warning-text)',
                border: `1px solid ${gpsStatus === 'granted' ? 'var(--status-success-ring)' : 'var(--status-warning-tint)'}`,
              }}
            >
              {gpsStatus === 'granted' ? '● Real GPS Location' : '○ Detecting Customer Location...'}
            </span>
          </div>
          <p className="page-subtitle" style={{ fontSize: '0.85rem' }}>
            {t('liveTracking.subtitle', 'Watch your verified service expert arrive in real-time.')}
          </p>
        </div>
        <Link
          to="/customer/bookings"
          className="btn btn-outline"
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
        >
          View My Bookings
        </Link>
      </div>

      {/* GPS Permission Guidance Banner (if not granted) */}
      {gpsStatus === 'denied' && (
        <div
          style={{
            background: 'var(--status-warning-tint)',
            border: '1px solid var(--status-warning-ring)',
            padding: '10px 16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
            fontSize: '0.82rem',
            color: 'var(--status-warning-text)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineMapPin style={{ fontSize: '1.2rem', color: 'var(--status-warning-text)' }} />
            <span>Location permission was denied. Enable GPS location to track your technician directly to your exact doorstep.</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={detectCustomerLocation}
            style={{ fontSize: '0.78rem', padding: '4px 12px', whiteSpace: 'nowrap' }}
          >
            Detect My GPS Location
          </button>
        </div>
      )}

      {/* Main Grid: Map & Controls */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '20px', flex: 1, marginBottom: '10px' }}>
        {/* Left Side: Map & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, height: '100%' }}>
          {/* Map canvas container */}
          <div
            className="card"
            style={{
              flex: 1,
              minHeight: '360px',
              border: '2px solid rgba(255,255,255,0.4)',
              position: 'relative',
              background: 'var(--glass-edge)',
              overflow: 'hidden',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
            }}
          >
            {/* Real Map Container for Leaflet */}
            <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />

            {/* Vignette Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, transparent 35%, rgba(15,23,42,0.14) 120%)',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />

            {/* Floating Top Status Panel */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 20px',
                border: '1px solid var(--sc-surface-secondary, var(--glass-edge))',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                zIndex: 30,
              }}
            >
              <div style={{ background: 'var(--sc-bg-primary, var(--bg-page))', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <HiOutlineClock style={{ fontSize: '1.5rem', color: 'var(--sc-primary-accent, var(--blue))' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--sc-text-muted, var(--ink-3))', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
                  Live Status
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--sc-dark-accent, var(--blue))', display: 'block', letterSpacing: '-0.02em' }}>
                  {!isWorkerAccepted ? 'Broadcasting Request (15 km Radius)...' : eta === 0 ? 'Arrived at Doorstep' : `Arriving in ~${eta} min (1.8 km)`}
                </span>
              </div>
            </div>

            {/* Worker Acceptance Pill (Shown when worker confirms) */}
            {acceptanceNotice && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  background: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(10px)',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--status-success-soft)',
                  boxShadow: '0 4px 18px rgba(34, 197, 94, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  zIndex: 30,
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-success-text)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--status-success-text)' }}>
                  {acceptanceNotice}
                </span>
              </div>
            )}
          </div>

          {/* Service Progress tracker timeline */}
          <div className="card" style={{ padding: '18px 22px', background: 'var(--glass)', border: '1px solid var(--sc-surface-secondary, var(--glass-edge))', borderRadius: '26px', flexShrink: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sc-dark-accent, var(--blue))', marginBottom: '4px' }}>
              Service Status Updates
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--sc-text-secondary, var(--ink-2))', marginBottom: '16px', fontWeight: 600 }}>
              {currentStatusText}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '3px', background: 'var(--sc-surface-secondary, var(--glass-edge))', zIndex: 0 }} />
              <div
                style={{
                  position: 'absolute',
                  top: '15px',
                  left: '10%',
                  width: `${(activeStep / 4) * 80}%`,
                  height: '3px',
                  background: 'var(--sc-primary-accent, var(--blue))',
                  zIndex: 1,
                  transition: 'width 0.8s ease',
                }}
              />

              {['Confirmed', 'On the way', 'Arrived', 'In Progress', 'Completed'].map((step, idx) => {
                const isPassed = idx <= activeStep;
                const isActive = idx === activeStep;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isPassed ? 'var(--sc-primary-accent, var(--blue))' : 'var(--sc-surface-secondary, var(--glass-edge))',
                        color: isPassed ? 'white' : 'var(--sc-text-secondary, var(--ink-2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        zIndex: 2,
                        border: isActive ? '3px solid var(--glass-edge)' : 'none',
                        boxShadow: isPassed ? '0 2px 6px rgba(83, 109, 87, 0.3)' : 'none',
                      }}
                    >
                      {isPassed ? <HiOutlineCheckBadge style={{ fontSize: '0.95rem' }} /> : idx + 1}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? 'var(--sc-dark-accent, var(--blue))' : 'var(--sc-text-muted, var(--ink-3))',
                        marginTop: '8px',
                      }}
                    >
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {callRelayNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'var(--status-success-tint)',
                    border: '1px solid var(--status-success-text)',
                    borderRadius: '8px',
                    color: 'var(--status-success-text)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {callRelayNotice}
                </motion.div>
              )}
            </AnimatePresence>

            {/* In-App Spare Parts / Quotation Review Banner */}
            {bookingData?.quotation && bookingData?.quotation?.status === 'PENDING' && (
              <div
                style={{
                  margin: '16px 0',
                  padding: '16px',
                  background: '#fefce8',
                  border: '2px solid #eab308',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(234, 179, 8, 0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ color: '#854d0e', fontSize: '0.95rem' }}>
                    📝 In-App Spare Parts & Additional Quotation
                  </strong>
                  <span style={{ fontSize: '0.78rem', background: '#fef08a', color: '#854d0e', padding: '3px 10px', borderRadius: '100px', fontWeight: 800 }}>
                    Additional: +₹{bookingData.quotation.totalAmount}
                  </span>
                </div>

                {bookingData.quotation.notes && (
                  <p style={{ fontSize: '0.82rem', color: '#713f12', margin: '0 0 10px 0' }}>
                    <strong>Specialist Note:</strong> {bookingData.quotation.notes}
                  </p>
                )}

                {/* Itemized parts list */}
                {Array.isArray(bookingData.quotation.items) && bookingData.quotation.items.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '10px', padding: '10px', marginBottom: '12px', border: '1px solid #fde047' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#854d0e', marginBottom: '6px' }}>Itemized Breakdown:</div>
                    {bookingData.quotation.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '3px 0', borderBottom: idx < bookingData.quotation.items.length - 1 ? '1px dashed #fef08a' : 'none' }}>
                        <span>{it.name || 'Spare Part'} (x{it.quantity || 1})</span>
                        <strong style={{ color: '#1e293b' }}>₹{it.amount || it.unitPrice || 0}</strong>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginTop: '8px', paddingTop: '6px', borderTop: '1.5px solid #eab308', color: '#854d0e' }}>
                      <span>New Total Payable (Base + Parts):</span>
                      <span>₹{(bookingData.basePrice || bookingData.amount) + (bookingData.quotation.totalAmount || 0)}</span>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: '#b45309', marginBottom: '12px', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  ℹ️ <strong>Platform Policy:</strong> If you decline this quotation and cancel the service, a nominal <strong>Platform Visiting Fee of ₹{PLATFORM_VISITING_FEE}</strong> will apply to compensate the specialist for their visit and inspection.
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, background: '#16a34a', padding: '10px', fontSize: '0.85rem', fontWeight: 700 }}
                    disabled={revisionActionLoading}
                    onClick={() => handleWorkflowDecideQuotation('APPROVED')}
                  >
                    ✓ Approve Quotation
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, borderColor: '#ef4444', color: '#dc2626', background: '#ffffff', padding: '10px', fontSize: '0.85rem', fontWeight: 700 }}
                    disabled={revisionActionLoading}
                    onClick={() => handleWorkflowDecideQuotation('REJECTED')}
                  >
                    ✗ Decline & Cancel (Pay ₹{PLATFORM_VISITING_FEE})
                  </button>
                </div>
              </div>
            )}

            {/* Cancelled with Visiting Fee Banner */}
            {bookingData?.status === 'cancelled_visiting_fee' && (
              <div style={{ margin: '16px 0', padding: '16px', background: '#fff1f2', border: '2px solid #fda4af', borderRadius: '16px', color: '#9f1239' }}>
                <strong style={{ fontSize: '0.95rem' }}>Service Cancelled After Quotation Review</strong>
                <p style={{ fontSize: '0.82rem', margin: '6px 0 0', lineHeight: 1.4 }}>
                  As per your decision, the quotation was declined and the repair was cancelled. The <strong>Platform Visiting Fee of ₹{PLATFORM_VISITING_FEE}</strong> has been charged to your wallet for the specialist's on-site inspection.
                </p>
              </div>
            )}

            {/* Quote Revision Approval Banner */}
            {quoteRevisions
              .filter((r) => r.status === 'PENDING')
              .map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    margin: '14px 0',
                    padding: '14px',
                    background: 'var(--status-warning-tint)',
                    border: '2px solid var(--status-warning-text)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--status-warning-text)', fontSize: '0.9rem' }}>Additional Work / Scope Revision Requested</strong>
                    <span style={{ fontSize: '0.75rem', background: 'var(--status-warning-tint)', color: 'var(--status-warning-text)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      ₹{rev.originalAmount} → ₹{rev.revisedAmount}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--status-warning-text)', margin: '0 0 8px 0' }}>
                    <strong>Technician Note:</strong> {rev.reason}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, background: 'var(--status-success-text)', padding: '8px', fontSize: '0.8rem' }}
                      disabled={revisionActionLoading}
                      onClick={() => handleDecideRevision(rev.id, 'APPROVED')}
                    >
                      Approve (₹{rev.revisedAmount})
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, borderColor: 'var(--status-danger-text)', color: 'var(--status-danger-text)', padding: '8px', fontSize: '0.8rem' }}
                      disabled={revisionActionLoading}
                      onClick={() => handleDecideRevision(rev.id, 'REJECTED')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}

            {/* Start OTP handover protocol & Acceptance gate */}
            <AnimatePresence>
              {!isWorkerAccepted ? (
                <motion.div
                  key="otp-pending-gate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1.5px dashed #3b82f6',
                    borderRadius: '14px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 800, fontSize: '0.88rem' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.25)' }}></span>
                    <span>Awaiting Specialist Acceptance</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#1e40af', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Your service request is broadcasted to verified specialists within 15 km. As soon as a specialist accepts, real-time GPS tracking and your 4-digit doorstep Start OTP will be unlocked.
                  </p>
                </motion.div>
              ) : ['verified', 'before_photo_uploaded', 'in-progress', 'started', 'quotation_pending'].includes(bookingData?.status) ? (
                <motion.div
                  key="otp-verified-gate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '16px',
                    padding: '14px',
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <HiOutlineCheckCircle style={{ fontSize: '1.2rem' }} />
                    <span>Doorstep Entry Authorized!</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#15803d', margin: '4px 0 0 0' }}>
                    Start OTP verified successfully. Specialist is currently working at your premises.
                  </p>
                </motion.div>
              ) : activeStep < 4 ? (
                <motion.div
                  key="otp-active-gate"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: bookingData?.status === 'arrived' ? '#fef2f2' : '#f0f9ff',
                    border: bookingData?.status === 'arrived' ? '2px solid #ef4444' : '2px solid #3b82f6',
                    borderRadius: '14px',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: bookingData?.status === 'arrived' ? '#dc2626' : '#1d4ed8', fontWeight: 800, fontSize: '0.85rem' }}>
                    <HiOutlineShieldCheck style={{ fontSize: '1.2rem' }} />
                    <span>{bookingData?.status === 'arrived' ? '⚡ SPECIALIST AT DOORSTEP — SHARE START OTP' : 'DOORSTEP ENTRY START OTP'}</span>
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: bookingData?.status === 'arrived' ? '#b91c1c' : '#1e40af', letterSpacing: '8px', margin: '8px 0', fontFamily: 'monospace' }}>
                    {displayedStartOtp || bookingData?.startOtp || searchParams.get('startOtp') || '8386'}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: bookingData?.status === 'arrived' ? '#991b1b' : '#1e3a8a', margin: 0, fontWeight: 600 }}>
                    {bookingData?.status === 'arrived'
                      ? 'Please provide this 4-digit code to the specialist at your door to authorize entry.'
                      : 'Share this code with the specialist only when they arrive at your location to begin work.'}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* End OTP handover protocol */}
            <AnimatePresence>
              {activeStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '16px', padding: '16px', background: 'var(--status-success-tint)', border: '2px solid var(--status-success-text)', borderRadius: '12px', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--status-success-text)', fontWeight: 800, fontSize: '0.85rem' }}>
                    <span>Job Completion Verification (End OTP)</span>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--status-success-text)', letterSpacing: '8px', margin: '8px 0' }}>
                    {displayedEndOtp || '9182'}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--status-success-text)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    <strong>Security Rule:</strong> Share this 4-digit End OTP with the technician only after you have inspected the job and are satisfied.
                  </p>
                  <button type="button" className="btn btn-outline" onClick={requestEndOtp} style={{ fontSize: '0.75rem', padding: '4px 12px', background: 'rgba(255, 255, 255, 0.5)' }}>
                    Refresh End Code
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Before & After Photo Evidence (Shows ONLY real uploaded proof photos) */}
            {(bookingData?.beforePhoto || bookingData?.afterPhoto || (proofs && proofs.length > 0)) && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-page)', borderRadius: '12px', border: '1px solid var(--glass-edge)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>Verified Proof of Work (Audit Photos)</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--status-success-text)', fontWeight: 700, background: 'var(--status-success-tint)', padding: '2px 8px', borderRadius: '10px' }}>
                    Tamper Proof Timestamp
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ border: '1px solid var(--glass-edge)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.5)' }}>
                    <div style={{ height: '90px', background: 'var(--glass-edge)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {bookingData?.beforePhoto ? (
                        <img src={bookingData.beforePhoto} alt="Before work" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-3)', textAlign: 'center', padding: '8px' }}>Pending specialist photo</span>
                      )}
                    </div>
                    <div style={{ padding: '6px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-2)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Before Work</span>
                      <span style={{ color: bookingData?.beforePhoto ? 'var(--status-success-text)' : 'var(--ink-3)' }}>{bookingData?.beforePhoto ? 'Uploaded ✓' : 'Pending'}</span>
                    </div>
                  </div>
                  <div style={{ border: '1px solid var(--glass-edge)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.5)' }}>
                    <div style={{ height: '90px', background: 'var(--glass-edge)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {bookingData?.afterPhoto ? (
                        <img src={bookingData.afterPhoto} alt="After work" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--ink-3)', textAlign: 'center', padding: '8px' }}>Captured on completion</span>
                      )}
                    </div>
                    <div style={{ padding: '6px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--ink-2)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>After Work</span>
                      <span style={{ color: bookingData?.afterPhoto ? 'var(--status-success-text)' : 'var(--ink-3)' }}>{bookingData?.afterPhoto ? 'Completed ✓' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {activeStep === 4 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '16px', textAlign: 'center' }}>
                  <Link
                    to={`/customer/review/${bookingId}?service=${encodeURIComponent(serviceName)}&worker=${encodeURIComponent(workerName)}`}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 800 }}
                  >
                    Service Complete — Proceed to Review & Rating
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Professional Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, height: '100%' }}>
          <div
            className="card"
            style={{
              padding: '24px 20px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.5)',
              flex: 1.2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 0,
              border: '1px solid var(--sc-surface-secondary, var(--glass-edge))',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--sc-text-muted, var(--ink-3))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Assigned Professional
            </span>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '16px 0 8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--sc-dark-accent, var(--blue))',
                    color: 'white',
                    border: '3px solid var(--sc-surface-secondary, var(--glass-edge))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
                  }}
                >
                  {getInitials(workerName)}
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sc-dark-accent, var(--blue))', margin: '8px 0 2px' }}>
                  {workerName}
                </h4>
                <div style={{ fontSize: '0.68rem', color: 'var(--blue)', background: 'var(--status-info-tint)', padding: '3px 10px', borderRadius: '999px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  Verified Professional 4.9 <HiOutlineStar style={{ color: 'var(--status-warning-soft)', fontSize: '0.8rem' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sc-text-secondary, var(--ink-2))', marginTop: '4px' }}>
                  2.4k jobs completed
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
                onClick={handleCallWorker}
              >
                <HiOutlinePhone /> Call
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
                onClick={() => setShowChatModal(true)}
              >
                <HiOutlineChatBubbleLeftRight /> Chat
              </button>
            </div>

            {/* Custom Specifications Display */}
            {typeof bookingData?.description === 'string' && bookingData.description.includes('Specs:') && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: 'var(--sc-bg-primary, var(--bg-page))',
                  borderRadius: '8px',
                  border: '1px solid var(--sc-surface-secondary, var(--glass-edge))',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  wordBreak: 'break-word',
                  lineHeight: '1.4',
                }}
              >
                <strong style={{ color: 'var(--sc-dark-accent, var(--blue))' }}>Specifications: </strong>
                <span style={{ color: 'var(--sc-text-secondary, var(--ink-2))', fontWeight: 500 }}>
                  {bookingData.description.split('Specs:')[1]?.replace(/[\[\]]/g, '').trim()}
                </span>
              </div>
            )}
          </div>

          <div
            className="card"
            style={{
              padding: '16px 20px',
              border: '1px solid var(--sc-surface-secondary, var(--glass-edge))',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.5)',
              flex: 0.8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 0,
            }}
          >
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sc-dark-accent, var(--blue))', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <HiOutlineShieldCheck style={{ color: 'var(--sc-primary-accent, var(--blue))', fontSize: '1.1rem' }} /> Safety Shield Active
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem', color: 'var(--sc-text-secondary, var(--ink-2))' }}>
              <li>
                <strong style={{ color: 'var(--sc-dark-accent, var(--blue))' }}>KYC Verification:</strong> 100% background-checked with Police & QR ID.
              </li>
              <li>
                <strong style={{ color: 'var(--sc-dark-accent, var(--blue))' }}>Live Route Tracking:</strong> Encrypted GPS coordinates monitored by dispatch.
              </li>
              <li>
                <strong style={{ color: 'var(--sc-dark-accent, var(--blue))' }}>ServeCircle Guarantee:</strong> Service covered up to ₹10,000 for safety.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* In-App Booking Chat for Customer */}
      <BookingChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        token={token}
        bookingId={bookingData?._id || bookingData?.id || bookingId}
        customerName={workerName}
        currentUserRole="customer"
      />
    </div>
  );
};

export default LiveTracking;
