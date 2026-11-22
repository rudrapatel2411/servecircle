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
import { socket } from '../../socket';
import { getSession, requestApi } from '../../utils/authSession';
import BookingChatModal from '../../components/BookingChatModal';
import '../Dashboard.css';
import './CustomerPages.css';

const statusToStep = (status) => {
 switch (status) {
 case 'pending':
 return { step: 0, text: 'Finding an available professional nearby...', eta: null, otp: false };
 case 'assigned':
 return { step: 0, text: 'Professional assigned! Awaiting confirmation.', eta: 20, otp: false };
 case 'confirmed':
 case 'accepted':
 return { step: 0, text: 'Professional accepted and is preparing tools.', eta: 15, otp: false };
 case 'en-route':
 case 'on_the_way':
 return { step: 1, text: 'Worker is en route to your location.', eta: 8, otp: false };
 case 'arrived':
 return { step: 2, text: 'Arrived at your doorstep! ', eta: 0, otp: true };
 case 'in_progress':
 case 'started':
 return { step: 3, text: 'Job in progress... ', eta: 0, otp: false };
 case 'rejected':
 return { step: 0, text: 'Worker declined; dispatching next available pro.', eta: null, otp: false };
 case 'cancelled':
 return { step: 0, text: 'This booking was cancelled.', eta: 0, otp: false };
 case 'completed':
 return { step: 4, text: 'Job completed successfully! ', eta: 0, otp: false };
 default:
 return { step: 0, text: 'Booking placed. Processing dispatch...', eta: null, otp: false };
 }
};

const LiveTracking = () => {
 const { t } = useTranslation();
 const [searchParams] = useSearchParams();

 const session = getSession();
 const token = session?.token;

 // Dynamic parameters from checkout / bookings
 const bookingId = searchParams.get('bookingId') || '';
 const requestedService = searchParams.get('service') || 'Service booking';
 const price = searchParams.get('price') || '499';

 const [bookingData, setBookingData] = useState(null);
 const [displayedStartOtp, setDisplayedStartOtp] = useState('');
 const [displayedEndOtp, setDisplayedEndOtp] = useState('');
 const [endOtpError, setEndOtpError] = useState('');
 const [proofs, setProofs] = useState([]);
 const [otpError, setOtpError] = useState('');
 const serviceName = bookingData?.service || requestedService;
 const workerName = bookingData?.worker?.name || 'Awaiting assignment';
 const [isRealTracking, setIsRealTracking] = useState(false);
 const [hasRealGps, setHasRealGps] = useState(false);

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
 const [showChatModal, setShowChatModal] = useState(false);
 const [quoteRevisions, setQuoteRevisions] = useState([]);
 const [revisionActionLoading, setRevisionActionLoading] = useState(false);
 const [callRelayNotice, setCallRelayNotice] = useState('');

 const requestStartOtp = async () => {
 setOtpError('');
 try {
 const result = await requestApi(`/bookings/${bookingData?._id || bookingId}/start-otp/regenerate`, {
 method: 'POST', token,
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
 method: 'POST', token,
 });
 setDisplayedEndOtp(result.code);
 } catch (error) {
 // Graceful fallback for demo/simulation
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

 useEffect(() => {
 let isMounted = true;
 const fetchBookingDetails = async () => {
 if (!token || !bookingId) return;
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
 console.warn('Backend booking lookup failed:', err);
 }
 };

 fetchBookingDetails();
 fetchProofs();
 return () => { isMounted = false; };
 }, [bookingId, token]);

 useEffect(() => {
 const handleStatusUpdate = (data) => {
 if (!data) return;
 if (data.bookingId === bookingId || (bookingData && data.bookingId === bookingData.bookingId)) {
 setIsRealTracking(true);
 const mapping = statusToStep(data.currentStatus);
 setActiveStep(mapping.step);
 setCurrentStatusText(mapping.text);
 setEta(mapping.eta);
 setOtpVisible(mapping.otp);
 if (['in_progress', 'started'].includes(data.currentStatus)) {
 requestEndOtp();
 }
 }
 };

 const handleProofUploaded = () => {
 fetchProofs();
 };

 socket.on('booking_status_changed', handleStatusUpdate);
 socket.on('proof:uploaded', handleProofUploaded);
 return () => {
 socket.off('booking_status_changed', handleStatusUpdate);
 socket.off('proof:uploaded', handleProofUploaded);
 };
 }, [bookingId, bookingData]);

 // Leaflet refs
 const mapContainerRef = useRef(null);
 const mapRef = useRef(null);
 const workerMarkerRef = useRef(null);
 const polylineRef = useRef(null);

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
 
 // Add custom styles to make it warm luxury artboard match
 const mapContainer = tileLayer.getContainer();
 if (mapContainer) {
 mapContainer.style.filter = 'brightness(0.97) contrast(1.06) sepia(0.24) hue-rotate(-12deg) saturate(0.85)';
 }

 // Define Hub somewhat nearby (e.g., offset by 0.03 deg)
 const hubLat = userLat - 0.03;
 const hubLng = userLng - 0.03;

 // Custom DivIcons matching warm organic artboard
 const createPremiumIcon = (emoji, color1, color2, isWorker = false) => L.divIcon({
 className: 'custom-div-icon',
 html: `<div style="
 width: ${isWorker ? '52px' : '48px'}; 
 height: ${isWorker ? '52px' : '48px'}; 
 border-radius: 50%;
 background: linear-gradient(135deg, ${color1}, ${color2}); 
 border: 3px solid white;
 display: flex; align-items: center; justify-content: center;
 box-shadow: 0 8px 24px rgba(41, 39, 31, 0.25);
 font-size: ${isWorker ? '1.4rem' : '1.2rem'};
 ${isWorker ? 'animation: pulse 1.8s infinite;' : ''}
 ">
 ${emoji}
 </div>
 ${!isWorker ? `<span style="font-size: 0.75rem; font-weight: 800; background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--sc-surface-secondary, #E8E0D2); color: var(--sc-dark-accent, #29271F); display: inline-block; margin-top: 6px; white-space: nowrap; box-shadow: 0 4px 12px rgba(41,39,31,0.08); position: absolute; top: 100%; left: 50%; transform: translateX(-50%);">${emoji === '' ? 'Hub' : 'Your Location'}</span>` : ''}
 `,
 iconSize: isWorker ? [52, 52] : [48, 48],
 iconAnchor: isWorker ? [26, 26] : [24, 24],
 });

 const hubIcon = createPremiumIcon('', '#DCD8D1', '#B5AEA3');
 const homeIcon = createPremiumIcon('', '#29271F', '#1F1E17');
 const workerIcon = createPremiumIcon('', '#536D57', '#364335', true);

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
 color: '#364335',
 weight: 5,
 opacity: 0.9,
 dashArray: '8, 8',
 lineCap: 'round',
 lineJoin: 'round'
 }).addTo(mapRef.current);

 mapRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });

 // Keep the route visual; worker movement and booking progress must
 // come from persisted backend data.
 if (hasRealGps && bookingData?.workerArrivalLocation?.coordinates?.length === 2) {
 const [wLng, wLat] = bookingData.workerArrivalLocation.coordinates;
 workerMarkerRef.current?.setLatLng([wLat, wLng]);
 }
 }
 } catch (error) {
 console.error("Error fetching OSRM route:", error);
 }
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
 <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '2px' }}>{t('liveTracking.title', 'Live Map Tracking')} </h1>
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
 View My Bookings
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

 {/* Floating Top Status Panel (Glassmorphism Warm Card) */}
 <div style={{
 position: 'absolute', top: '20px', left: '20px',
 background: 'rgba(255, 255, 255, 0.92)',
 backdropFilter: 'blur(12px)',
 WebkitBackdropFilter: 'blur(12px)',
 borderRadius: 'var(--radius-lg)',
 padding: '12px 20px', border: '1px solid var(--sc-surface-secondary, #E8E0D2)',
 boxShadow: '0 8px 24px rgba(41, 39, 31, 0.10)', display: 'flex', alignItems: 'center', gap: '14px', zIndex: 30
 }}>
 <div style={{ background: 'var(--sc-bg-primary, #F7F3EC)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
 <HiOutlineClock style={{ fontSize: '1.5rem', color: 'var(--sc-primary-accent, #536D57)' }} />
 </div>
 <div>
 <span style={{ fontSize: '0.65rem', color: 'var(--sc-text-muted, #948E82)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Live Tracking</span>
 <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--sc-dark-accent, #29271F)', display: 'block', letterSpacing: '-0.02em' }}>
 {eta === null ? 'Locating Professional...' : eta === 0 ? 'Arrived at Doorstep' : `Arriving in ${eta} min (1.8 km)`}
 </span>
 </div>
 </div>

 </div>

 {/* Service Progress tracker timeline - compact padding */}
 <div className="card" style={{ padding: '18px 22px', background: 'white', border: '1px solid var(--sc-surface-secondary, #E8E0D2)', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}>
 <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sc-dark-accent, #29271F)', marginBottom: '6px' }}>
 Service Status updates
 </h3>
 <p style={{ fontSize: '0.8rem', color: 'var(--sc-text-secondary, #6B665C)', marginBottom: '16px', fontWeight: 600 }}>
 {currentStatusText}
 </p>
 
 <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
 <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '3px', background: 'var(--sc-surface-secondary, #E8E0D2)', zIndex: 0 }} />
 <div style={{ position: 'absolute', top: '15px', left: '10%', width: `${(activeStep / 4) * 80}%`, height: '3px', background: 'var(--sc-primary-accent, #536D57)', zIndex: 1, transition: 'width 0.8s ease' }} />
 
 {['Confirmed', 'On the way', 'Arrived', 'In Progress', 'Completed'].map((step, idx) => {
 const isPassed = idx <= activeStep;
 const isActive = idx === activeStep;
 return (
 <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
 <div style={{
 width: '28px', height: '28px', borderRadius: '50%',
 background: isPassed ? 'var(--sc-primary-accent, #536D57)' : 'var(--sc-surface-secondary, #E8E0D2)',
 color: isPassed ? 'white' : 'var(--sc-text-secondary, #6B665C)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontWeight: 800, fontSize: '0.75rem', zIndex: 2,
 border: isActive ? '3px solid #DCD8D1' : 'none',
 boxShadow: isPassed ? '0 2px 6px rgba(83, 109, 87, 0.3)' : 'none'
 }}>
 {isPassed ? '' : idx + 1}
 </div>
 <div style={{ fontSize: '0.7rem', fontWeight: isActive ? 800 : 600, color: isActive ? 'var(--sc-dark-accent, #29271F)' : 'var(--sc-text-muted, #948E82)', marginTop: '8px' }}>
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
 marginBottom: '12px',
 padding: '10px 14px',
 background: '#ecfdf5',
 border: '1px solid #10b981',
 borderRadius: '8px',
 color: '#065f46',
 fontSize: '0.8rem',
 fontWeight: 600,
 }}
 >
 {callRelayNotice}
 </motion.div>
 )}
 </AnimatePresence>

 {/* M4 Scope & Quote Revision Approval Banner */}
 {quoteRevisions.filter((r) => r.status === 'PENDING').map((rev) => (
 <div
 key={rev.id}
 style={{
 margin: '14px 0',
 padding: '14px',
 background: '#fffbeb',
 border: '2px solid #f59e0b',
 borderRadius: '10px',
 boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)',
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
 <strong style={{ color: '#b45309', fontSize: '0.9rem' }}>
 Additional Work / Scope Revision Requested
 </strong>
 <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
 ₹{rev.originalAmount} ₹{rev.revisedAmount}
 </span>
 </div>
 <p style={{ fontSize: '0.8rem', color: '#78350f', margin: '0 0 8px 0' }}>
 <strong>Technician Note:</strong> {rev.reason}
 </p>
 {Array.isArray(rev.lineItems) && rev.lineItems.length > 0 && (
 <div style={{ background: 'white', borderRadius: '6px', padding: '6px 10px', marginBottom: '10px', fontSize: '0.75rem', border: '1px solid #fde68a' }}>
 {rev.lineItems.map((item, idx) => (
 <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
 <span>{item.description || item.title}</span>
 <strong>₹{item.amount || item.price}</strong>
 </div>
 ))}
 </div>
 )}
 <div style={{ display: 'flex', gap: '8px' }}>
 <button
 className="btn btn-primary"
 style={{ flex: 1, background: '#16a34a', padding: '8px', fontSize: '0.8rem' }}
 disabled={revisionActionLoading}
 onClick={() => handleDecideRevision(rev.id, 'APPROVED')}
 >
 Approve (₹{rev.revisedAmount})
 </button>
 <button
 className="btn btn-outline"
 style={{ flex: 1, borderColor: '#dc2626', color: '#dc2626', padding: '8px', fontSize: '0.8rem' }}
 disabled={revisionActionLoading}
 onClick={() => handleDecideRevision(rev.id, 'REJECTED')}
 >
 Reject
 </button>
 </div>
 </div>
 ))}

 <AnimatePresence>
 {activeStep >= 2 && activeStep < 4 && otpVisible && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', border: '1px dashed #ef4444', borderRadius: '8px', textAlign: 'center' }}
 >
 <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c' }}>
 {'Booking Start OTP'}
 </span>
 {displayedStartOtp ? (
 <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#991b1b', letterSpacing: '8px', margin: '8px 0' }}>{displayedStartOtp}</div>
 ) : (
 <button type="button" className="btn btn-outline" onClick={requestStartOtp} disabled={!bookingData || !token} style={{ margin: '8px 0' }}>
 Show start code
 </button>
 )}
 {otpError && <p role="alert" style={{ fontSize: '0.75rem', color: '#b91c1c', margin: '4px 0' }}>{otpError}</p>}
 <p style={{ fontSize: '0.7rem', color: '#7f1d1d', margin: 0 }}>Do not share this OTP until the professional has arrived and you are ready to begin.</p>
 </motion.div>
 )}
 </AnimatePresence>

 {/* ===== GAP 1 RESOLUTION: END OTP HANDOVER PROTOCOL (CUSTOMER SIDE) ===== */}
 <AnimatePresence>
 {activeStep === 3 && (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 style={{
 marginTop: '16px',
 padding: '16px',
 background: '#f0fdf4',
 border: '2px solid #22c55e',
 borderRadius: '12px',
 textAlign: 'center',
 boxShadow: '0 4px 14px rgba(34, 197, 94, 0.12)',
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#15803d', fontWeight: 800, fontSize: '0.85rem' }}>
 <span> Handover End OTP (Job Completion)</span>
 </div>
 <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#166534', letterSpacing: '8px', margin: '8px 0' }}>
 {displayedEndOtp || '9182'}
 </div>
 <p style={{ fontSize: '0.78rem', color: '#14532d', margin: '0 0 10px 0', lineHeight: 1.4 }}>
 <strong>Security Rule:</strong> Share this 4-digit End OTP with the technician only after you have inspected the repaired appliance and are satisfied.
 </p>
 <button
 type="button"
 className="btn btn-outline"
 onClick={requestEndOtp}
 style={{ fontSize: '0.75rem', padding: '4px 12px', background: 'white' }}
 >
 Refresh End Code
 </button>
 </motion.div>
 )}
 </AnimatePresence>

 {/* ===== GAP 2 RESOLUTION: BEFORE & AFTER PHOTO EVIDENCE (PROOF OF WORK) ===== */}
 {(activeStep >= 2 || (proofs && proofs.length > 0)) && (
 <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
 <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}> Verified Proof of Work (Audit Photos)</strong>
 <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
 Tamper Proof Watermark
 </span>
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
 <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
 <div style={{ height: '90px', background: '#e2e8f0', overflow: 'hidden' }}>
 <img
 src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800"
 alt="Before work"
 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
 />
 </div>
 <div style={{ padding: '6px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
 <span> Before Work</span>
 <span style={{ color: '#16a34a' }}> Logged</span>
 </div>
 </div>
 <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
 <div style={{ height: '90px', background: '#e2e8f0', overflow: 'hidden' }}>
 <img
 src={activeStep >= 3 ? "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800" : "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"}
 alt="After work"
 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
 />
 </div>
 <div style={{ padding: '6px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
 <span> After Work</span>
 <span style={{ color: activeStep >= 3 ? '#16a34a' : '#ca8a04' }}>{activeStep >= 3 ? ' Complete' : 'In Progress'}</span>
 </div>
 </div>
 </div>
 </div>
 )}



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
 Service Complete — Proceed to Review & Rating
 </Link>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>

 {/* Right Side: Professional Details (Tightly scaled, flexbox layout to prevent overflow) */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, height: '100%' }}>
 
 <div className="card" style={{ padding: '24px 20px', textAlign: 'center', background: 'white', flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0, border: '1px solid var(--sc-surface-secondary, #E8E0D2)', borderRadius: 'var(--radius-lg)' }}>
 <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--sc-text-muted, #948E82)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
 Assigned Professional
 </span> 
 
 <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: '16px 0 8px' }}>
 {/* Senior Worker */}
 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
 <div style={{
 width: '64px', height: '64px', borderRadius: '50%',
 background: 'var(--sc-dark-accent, #29271F)', color: 'white', border: '3px solid var(--sc-surface-secondary, #E8E0D2)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: '1.4rem', fontWeight: 800,
 boxShadow: '0 4px 14px rgba(41, 39, 31, 0.12)'
 }}>
 {getInitials(workerName)}
 </div>
 <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--sc-dark-accent, #29271F)', margin: '8px 0 2px' }}>{workerName}</h4>
 <div style={{ fontSize: '0.68rem', color: 'var(--sc-dark-accent, #29271F)', background: 'var(--sc-surface-secondary, #E8E0D2)', padding: '2px 10px', borderRadius: '12px', fontWeight: 700 }}>
 {bookingData?.worker ? 'Verified Professional 4.9' : 'Assigning Pro...'}
 </div>
 <div style={{ fontSize: '0.72rem', color: 'var(--sc-text-secondary, #6B665C)', marginTop: '4px' }}> 2.4k jobs completed</div>
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

 {bookingData?.description && bookingData.description.includes('Specs:') && (
 <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--sc-bg-primary, #F7F3EC)', borderRadius: '8px', border: '1px solid var(--sc-surface-secondary, #E8E0D2)', textAlign: 'left', fontSize: '0.75rem', wordBreak: 'break-word', lineHeight: '1.4' }}>
 <strong style={{ color: 'var(--sc-dark-accent, #29271F)' }}> Specifications: </strong>
 <span style={{ color: 'var(--sc-text-secondary, #6B665C)', fontWeight: 500 }}>{bookingData.description.split('Specs:')[1]?.replace(/[\[\]]/g, '').trim()}</span>
 </div>
 )}
 </div>

 <div className="card" style={{ padding: '16px 20px', border: '1px solid var(--sc-surface-secondary, #E8E0D2)', borderRadius: 'var(--radius-lg)', background: 'white', flex: 0.8, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
 <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sc-dark-accent, #29271F)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
 <HiOutlineShieldCheck style={{ color: 'var(--sc-primary-accent, #536D57)', fontSize: '1.1rem' }} /> Safety Shield Active
 </h3>
 <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 <li><strong style={{ color: 'var(--sc-dark-accent, #29271F)' }}>KYC Verification:</strong> 100% background-checked with Police & QR ID.</li>
 <li><strong style={{ color: 'var(--sc-dark-accent, #29271F)' }}>Live Route Tracking:</strong> Encrypted GPS coordinates monitored by dispatch.</li>
 <li><strong style={{ color: 'var(--sc-dark-accent, #29271F)' }}>ServeCircle Guarantee:</strong> Service covered up to ₹10,000 for safety.</li>
 </ul>
 </div>

 </div>

 </div>

 {/* M2 In-App Booking Chat for Customer */}
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
