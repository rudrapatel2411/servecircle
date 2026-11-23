import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
 HiOutlineHome, HiOutlineShieldCheck, HiOutlineSparkles,
 HiOutlinePlusCircle, HiOutlineClock, HiOutlineTrash,
 HiOutlineCheckCircle, HiOutlineWrench, HiOutlineCalendarDays,
 HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineArrowUpOnSquare, HiOutlineArrowPath,
 HiOutlineTruck, HiOutlineMapPin, HiOutlineBolt, HiOutlineChartBar,
 HiOutlineCloud, HiOutlineDocumentText, HiOutlineCamera,
 HiOutlineMagnifyingGlass, HiOutlineXMark, HiOutlineTv,
 HiOutlineCube, HiOutlineExclamationTriangle, HiOutlineStar,
 HiOutlinePhone, HiOutlineCheck, HiOutlineLightBulb,
 HiOutlineHeart, HiOutlineTrophy, HiOutlineMicrophone,
 HiOutlineSpeakerWave, HiOutlineArrowDownTray, HiOutlineCreditCard,
 HiOutlineClipboardDocumentCheck
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

// Default Maintenance Timeline Items
const DEFAULT_TIMELINE = [
 {
 id: 1,
 title: 'AC Deep Cleaning & Filter Servicing',
 category: 'home-repairs',
 serviceId: 'ac-repair',
 dueDate: 'Due in 30 days',
 urgency: 'warning',
 points: 10,
 completed: false,
 completedDate: null,
 costEstimate: '₹499',
 targetPath: '/customer/book?service=AC%20Deep%20Cleaning%20%26%20Servicing&serviceId=ac-repair&category=home-repairs'
 },
 {
 id: 2,
 title: 'Water Tank Sanitization & UV Purify',
 category: 'cleaning',
 serviceId: 'water-tank-clean',
 dueDate: 'Due in 90 days',
 urgency: 'normal',
 points: 8,
 completed: false,
 completedDate: null,
 costEstimate: '₹799',
 targetPath: '/customer/book?service=Water%20Tank%20Sanitization&serviceId=water-tank-clean&category=cleaning'
 },
 {
 id: 3,
 title: 'Electrical Safety Inspection & Earthing',
 category: 'home-repairs',
 serviceId: 'electrician-visit',
 dueDate: 'Completed recently',
 urgency: 'completed',
 points: 8,
 completed: true,
 completedDate: '2026-05-05',
 costEstimate: '₹299',
 targetPath: '/customer/book?service=Electrical%20Safety%20Inspection&serviceId=electrician-visit&category=home-repairs'
 },
 {
 id: 4,
 title: 'Kitchen & Bathroom Pest Control Treatment',
 category: 'cleaning',
 serviceId: 'pest-control',
 dueDate: 'Due in 120 days',
 urgency: 'normal',
 points: 6,
 completed: false,
 completedDate: null,
 costEstimate: '₹899',
 targetPath: '/customer/book?service=Pest%20Control%20Treatment&serviceId=pest-control&category=cleaning'
 },
 {
 id: 5,
 title: 'Monsoon Roof & External Leak Proofing',
 category: 'home-repairs',
 serviceId: 'waterproofing',
 dueDate: 'Seasonal Advisory',
 urgency: 'warning',
 points: 8,
 completed: false,
 completedDate: null,
 costEstimate: '₹1,299',
 targetPath: '/customer/book?service=Monsoon%20Leak%20Proofing&serviceId=waterproofing&category=home-repairs'
 }
];

// Default Appliances
const DEFAULT_APPLIANCES = [
 {
 id: 1,
 name: 'Master Bedroom AC',
 brand: 'Daikin',
 model: 'FTKF50TV16U Inverter 1.5T',
 serialNumber: 'SN-DKN-88294021',
 purchaseDate: '2025-06-12',
 warrantyYears: 5,
 type: 'AC',
 coverage: 'Comprehensive + 10Y Compressor Warranty',
 fileName: 'daikin_ac_invoice.pdf',
 room: 'Master Bedroom'
 },
 {
 id: 2,
 name: 'Living Room Smart TV',
 brand: 'Sony',
 model: 'Bravia XR 55A80K OLED',
 serialNumber: 'SN-SNY-33104928',
 purchaseDate: '2024-10-18',
 warrantyYears: 2,
 type: 'TV',
 coverage: 'Panel & Circuit Board Replacement Guarantee',
 fileName: 'sony_bravia_receipt.pdf',
 room: 'Living Room'
 },
 {
 id: 3,
 name: 'Double-Door Refrigerator',
 brand: 'LG',
 model: 'GL-T382VESX 340L Smart Inverter',
 serialNumber: 'SN-LG-99214739',
 purchaseDate: '2023-01-05',
 warrantyYears: 10,
 type: 'Refrigerator',
 coverage: '10-Year Smart Inverter Compressor Protection',
 fileName: 'lg_fridge_bill.pdf',
 room: 'Kitchen'
 },
 {
 id: 4,
 name: 'EcoSilence Washing Machine',
 brand: 'Bosch',
 model: 'Series 6 Front Load 8kg',
 serialNumber: 'SN-BSH-55201490',
 purchaseDate: '2024-03-20',
 warrantyYears: 3,
 type: 'Washing Machine',
 coverage: 'Complete Motor & Drum Warranty',
 fileName: 'bosch_wm_invoice.pdf',
 room: 'Utility Area'
 },
 {
 id: 5,
 name: 'Mineral RO Water Purifier',
 brand: 'Kent',
 model: 'Grand Plus 9L UV+UF',
 serialNumber: 'SN-KNT-11048821',
 purchaseDate: '2025-11-01',
 warrantyYears: 1,
 type: 'Water Purifier',
 coverage: 'RO Membrane & Filter Replacement Support',
 fileName: 'kent_ro_guarantee.pdf',
 room: 'Kitchen'
 }
];

const MyHomeDashboard = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();

 // 1. Toast Notification State
 const [toast, setToast] = useState(null);
 const showToast = (message, type = 'success', actionLabel = null, onAction = null) => {
 setToast({ message, type, actionLabel, onAction, id: Date.now() });
 };
 useEffect(() => {
 if (!toast) return;
 const timer = setTimeout(() => setToast(null), 4500);
 return () => clearTimeout(timer);
 }, [toast]);

 // 2. Persistent Timeline State
 const [timelineItems, setTimelineItems] = useState(() => {
 try {
 const saved = localStorage.getItem('servecircle_myhome_timeline');
 if (saved) return JSON.parse(saved);
 } catch {
 // Fallback
 }
 return DEFAULT_TIMELINE;
 });

 useEffect(() => {
 try {
 localStorage.setItem('servecircle_myhome_timeline', JSON.stringify(timelineItems));
 } catch {
 // Storage safe
 }
 }, [timelineItems]);

 // 3. Persistent Appliances State
 const [appliances, setAppliances] = useState(() => {
 try {
 const saved = localStorage.getItem('servecircle_myhome_appliances');
 if (saved) return JSON.parse(saved);
 } catch {
 // Fallback
 }
 return DEFAULT_APPLIANCES;
 });

 useEffect(() => {
 try {
 localStorage.setItem('servecircle_myhome_appliances', JSON.stringify(appliances));
 } catch {
 // Storage safe
 }
 }, [appliances]);

 // 4. Prime AMC Membership State
 const [primeInfo, setPrimeInfo] = useState(() => {
 try {
 const saved = localStorage.getItem('servecircle_prime_member');
 if (saved) return JSON.parse(saved);
 } catch {
 // Fallback
 }
 return { active: false, plan: null, expiry: null };
 });

 // 5. Active Live Booking State
 const [activeBooking, setActiveBooking] = useState(null);

 const syncActiveBooking = () => {
 try {
 const stored = localStorage.getItem('servecircle_active_booking');
 if (stored) {
 setActiveBooking(JSON.parse(stored));
 } else {
 // Fallback default demo booking
 setActiveBooking({
 id: 'SC-89241',
 displayId: '#SC-89241',
 serviceName: 'AC Deep Cleaning & Servicing',
 workerName: 'Rajesh Kumar',
 workerPhone: '+91 98765 43210',
 workerRating: '4.9',
 startOtp: '4821',
 status: 'In Progress',
 timeSlot: 'Today, 02:00 PM - 04:00 PM'
 });
 }
 } catch {
 // Storage error
 }
 };

 useEffect(() => {
 syncActiveBooking();
 const handleStorage = (e) => {
 if (e.key === 'servecircle_active_booking' || e.key === 'servecircle_booking_otps') {
 syncActiveBooking();
 }
 };
 window.addEventListener('storage', handleStorage);
 return () => window.removeEventListener('storage', handleStorage);
 }, []);

 // 6. Home Health Score Calculation
 const currentScore = useMemo(() => {
 let score = 45; // baseline score
 // points from completed maintenance
 timelineItems.forEach(item => {
 if (item.completed) {
 score += item.points || 5;
 }
 });
 // points from registered appliances (up to 20 pts)
 const applianceBonus = Math.min(20, appliances.length * 4);
 score += applianceBonus;
 // Prime bonus
 if (primeInfo?.active) {
 score += 10;
 }
 return Math.max(0, Math.min(100, score));
 }, [timelineItems, appliances, primeInfo]);

 // 7. Filters and UI controls
 const [timelineFilter, setTimelineFilter] = useState('ALL');
 const [applianceCategory, setApplianceCategory] = useState('ALL');
 const [applianceViewMode, setApplianceViewMode] = useState('LIST'); // 'LIST' or 'ROOM'
 const [searchQuery, setSearchQuery] = useState('');
 const [bookingItem, setBookingItem] = useState(null);
 const [bookingDate, setBookingDate] = useState('');
 const [bookingTime, setBookingTime] = useState('09:00 AM - 11:00 AM');

 // 8. Modals
 const [showHealthModal, setShowHealthModal] = useState(false);
 const [showTrackingMap, setShowTrackingMap] = useState(false);
 const [showPrimeModal, setShowPrimeModal] = useState(false);
 const [selectedWarrantyAppliance, setSelectedWarrantyAppliance] = useState(null);
 const [deleteCandidate, setDeleteCandidate] = useState(null);
 const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
 const [isCallingPartner, setIsCallingPartner] = useState(false);
 const [callTimer, setCallTimer] = useState(0);
 const [isMuted, setIsMuted] = useState(false);
 const [isSpeaker, setIsSpeaker] = useState(true);

 // Call timer effect
 useEffect(() => {
 let interval;
 if (isCallingPartner) {
 interval = setInterval(() => setCallTimer(prev => prev + 1), 1000);
 } else {
 setCallTimer(0);
 }
 return () => clearInterval(interval);
 }, [isCallingPartner]);

 // 9. New Appliance Form & AI Scanner State
 const [showAddForm, setShowAddForm] = useState(false);
 const [showManualFields, setShowManualFields] = useState(false);
 const [uploadedFile, setUploadedFile] = useState(null);
 const [isScanning, setIsScanning] = useState(false);
 const [scanStage, setScanStage] = useState('');
 const [uploadProgress, setUploadProgress] = useState(0);
 const [formError, setFormError] = useState('');
 const [formData, setFormData] = useState({
 name: '',
 brand: '',
 model: '',
 serialNumber: '',
 purchaseDate: '',
 warrantyYears: 2,
 type: 'AC',
 room: 'Master Bedroom'
 });

 // Calculate Warranty Status for an appliance
 const getWarrantyStatus = (app) => {
 const purchase = new Date(app.purchaseDate);
 const expire = new Date(purchase.getFullYear() + (parseInt(app.warrantyYears) || 2), purchase.getMonth(), purchase.getDate());
 const now = new Date();
 const diffTime = expire - now;
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

 if (diffDays < 0) {
 return { label: 'Warranty Expired', color: '#ef4444', isExpiring: false, daysRemaining: 0, expired: true, expireDate: expire.toLocaleDateString('en-IN') };
 } else if (diffDays <= 90) {
 return { label: `Expiring Soon (${diffDays}d)`, color: '#f59e0b', isExpiring: true, daysRemaining: diffDays, expired: false, expireDate: expire.toLocaleDateString('en-IN') };
 } else {
 return { label: `Active (${Math.round(diffDays / 30)} mos)`, color: '#16a34a', isExpiring: false, daysRemaining: diffDays, expired: false, expireDate: expire.toLocaleDateString('en-IN') };
 }
 };

 const getWarrantyProgress = (app) => {
 const purchase = new Date(app.purchaseDate);
 const expire = new Date(purchase.getFullYear() + (parseInt(app.warrantyYears) || 2), purchase.getMonth(), purchase.getDate());
 const now = new Date();
 const totalDuration = expire - purchase;
 const remaining = expire - now;
 if (totalDuration <= 0) return 0;
 return Math.max(0, Math.min(100, Math.round((remaining / totalDuration) * 100)));
 };

 // Toggle Maintenance Timeline Task
 const toggleTimelineItem = (id) => {
 setTimelineItems(prev => prev.map(item => {
 if (item.id === id) {
 const nextState = !item.completed;
 if (nextState) {
 showToast(`Marked "${item.title}" complete! +${item.points} points added to Home Health.`, 'success');
 } else {
 showToast(`"${item.title}" marked pending.`, 'info');
 }
 return {
 ...item,
 completed: nextState,
 completedDate: nextState ? new Date().toISOString().split('T')[0] : null
 };
 }
 return item;
 }));
 };

 // Confirm Quick Inline Booking
 const handleConfirmInlineBooking = (item) => {
 if (!bookingDate) {
 showToast('Please select a valid date for the booking.', 'warning');
 return;
 }

 const bookingId = `SC-${Math.floor(10000 + Math.random() * 90000)}`;
 const startOtp = '4821';

 const newBookingObj = {
 id: bookingId,
 displayId: `#${bookingId}`,
 serviceName: item.title,
 category: item.category || 'home-repairs',
 workerName: 'Rajesh Kumar',
 workerPhone: '+91 98765 43210',
 workerRating: '4.9',
 startOtp: startOtp,
 endOtp: '9152',
 status: 'Confirmed',
 progressStep: 1,
 date: bookingDate,
 timeSlot: bookingTime,
 price: item.costEstimate || '₹499',
 address: 'Flat 402, Green Glen Heights, Bellandur, Bangalore',
 createdAt: new Date().toISOString()
 };

 // Save to localStorage
 try {
 localStorage.setItem('servecircle_active_booking', JSON.stringify(newBookingObj));
 const otps = JSON.parse(localStorage.getItem('servecircle_booking_otps') || '{}');
 otps[bookingId] = startOtp;
 localStorage.setItem('servecircle_booking_otps', JSON.stringify(otps));

 // Append to general booking history
 const history = JSON.parse(localStorage.getItem('servecircle_customer_bookings') || '[]');
 history.unshift(newBookingObj);
 localStorage.setItem('servecircle_customer_bookings', JSON.stringify(history));
 } catch {
 // Storage error
 }

 // Mark timeline complete
 setTimelineItems(prev => prev.map(t => t.id === item.id ? { ...t, completed: true, completedDate: bookingDate } : t));
 setActiveBooking(newBookingObj);
 setBookingItem(null);

 showToast(
 `Slot booked for ${bookingDate} (${bookingTime})! Order ID ${newBookingObj.displayId}. Start OTP is ${startOtp}.`,
 'success',
 'Track Live',
 () => navigate(`/customer/live-tracking?bookingId=${encodeURIComponent(bookingId)}&startOtp=${startOtp}`)
 );
 };

 // Reset Maintenance Timeline
 const handleResetTimeline = () => {
 setTimelineItems(DEFAULT_TIMELINE);
 setShowResetConfirmModal(false);
 showToast('Maintenance timeline reset to default factory compliance schedule.', 'info');
 };

 // AI Invoice Scanner Simulator
 const triggerAIScan = (fileName) => {
 setIsScanning(true);
 setScanStage('Analyzing invoice document & OCR layers...');

 setTimeout(() => {
 setScanStage('Detecting appliance model & manufacturer warranty terms...');
 }, 1000);

 setTimeout(() => {
 setScanStage('Matching certified coverage period & serial data...');
 }, 2000);

 setTimeout(() => {
 setIsScanning(false);

 const lower = fileName.toLowerCase();
 let matchedData = {
 name: 'Smart Air Conditioner',
 brand: 'Daikin',
 model: 'FTKF Series 1.5 Ton Split AC',
 serialNumber: 'SN-DKN-' + Math.floor(10000000 + Math.random() * 90000000),
 purchaseDate: '2025-04-10',
 warrantyYears: 5,
 type: 'AC',
 room: 'Living Room'
 };

 if (lower.includes('sony') || lower.includes('tv') || lower.includes('bravia')) {
 matchedData = {
 name: '4K Ultra HD Smart OLED TV',
 brand: 'Sony',
 model: 'Bravia XR 65 Inch Master Series',
 serialNumber: 'SN-SNY-' + Math.floor(10000000 + Math.random() * 90000000),
 purchaseDate: '2024-11-20',
 warrantyYears: 3,
 type: 'TV',
 room: 'Living Room'
 };
 } else if (lower.includes('lg') || lower.includes('fridge') || lower.includes('refrigerator')) {
 matchedData = {
 name: 'Double Door Inverter Refrigerator',
 brand: 'LG',
 model: 'GL-T402 Smart Inverter 390L',
 serialNumber: 'SN-LG-' + Math.floor(10000000 + Math.random() * 90000000),
 purchaseDate: '2023-08-15',
 warrantyYears: 10,
 type: 'Refrigerator',
 room: 'Kitchen'
 };
 } else if (lower.includes('wash') || lower.includes('bosch')) {
 matchedData = {
 name: 'Front Load Eco Washing Machine',
 brand: 'Bosch',
 model: 'Series 6 Front Load 8kg',
 serialNumber: 'SN-BSH-' + Math.floor(10000000 + Math.random() * 90000000),
 purchaseDate: '2024-05-12',
 warrantyYears: 3,
 type: 'Washing Machine',
 room: 'Utility Area'
 };
 } else if (lower.includes('water') || lower.includes('kent') || lower.includes('ro')) {
 matchedData = {
 name: 'Mineral RO Water Purifier',
 brand: 'Kent',
 model: 'Grand Plus UV+UF 9L',
 serialNumber: 'SN-KNT-' + Math.floor(10000000 + Math.random() * 90000000),
 purchaseDate: '2025-01-10',
 warrantyYears: 1,
 type: 'Water Purifier',
 room: 'Kitchen'
 };
 }

 setFormData(matchedData);
 setShowManualFields(true);
 showToast(`AI Scan Complete: Extracted ${matchedData.name} (${matchedData.brand}) from invoice.`, 'success');
 }, 2800);
 };

 // File Upload Simulator
 const handleFileUpload = (e) => {
 const file = e.target.files[0];
 if (!file) return;

 setUploadedFile(file.name);
 setUploadProgress(0);

 const interval = setInterval(() => {
 setUploadProgress(prev => {
 if (prev >= 100) {
 clearInterval(interval);
 triggerAIScan(file.name);
 return 100;
 }
 return prev + 25;
 });
 }, 120);
 };

 // Register New Appliance
 const handleRegisterAppliance = (e) => {
 e.preventDefault();
 if (!formData.name || !formData.brand || !formData.purchaseDate) {
 setFormError('Please fill in Appliance Name, Brand, and Purchase Date.');
 return;
 }

 const newApp = {
 id: Date.now(),
 name: formData.name,
 brand: formData.brand,
 model: formData.model || `${formData.brand} Standard Model`,
 serialNumber: formData.serialNumber || `SN-${formData.brand.slice(0, 3).toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
 purchaseDate: formData.purchaseDate,
 warrantyYears: parseInt(formData.warrantyYears) || 2,
 type: formData.type || 'AC',
 coverage: `${formData.warrantyYears}-Year Manufacturer Comprehensive Warranty`,
 fileName: uploadedFile || 'scanned_invoice.pdf',
 room: formData.room || 'Living Room'
 };

 setAppliances(prev => [newApp, ...prev]);
 setFormData({
 name: '',
 brand: '',
 model: '',
 serialNumber: '',
 purchaseDate: '',
 warrantyYears: 2,
 type: 'AC',
 room: 'Master Bedroom'
 });
 setUploadedFile(null);
 setUploadProgress(0);
 setShowAddForm(false);
 setShowManualFields(false);
 setFormError('');

 showToast(`"${newApp.name}" registered in Digital Warranty Vault! +4 points added to Home Health.`, 'success');
 };

 // Confirm Delete Appliance
 const handleConfirmDelete = () => {
 if (!deleteCandidate) return;
 setAppliances(prev => prev.filter(a => a.id !== deleteCandidate.id));
 showToast(`Removed "${deleteCandidate.name}" from warranty vault.`, 'info');
 setDeleteCandidate(null);
 };

 // Activate Prime AMC
 const handleActivatePrime = (planName, price) => {
 const newPrime = {
 active: true,
 plan: planName,
 price: price,
 activatedOn: new Date().toISOString().split('T')[0],
 expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
 };
 try {
 localStorage.setItem('servecircle_prime_member', JSON.stringify(newPrime));
 } catch {
 // Storage error
 }
 setPrimeInfo(newPrime);
 setShowPrimeModal(false);
 showToast(`Welcome to ServeCircle Prime! ${planName} is now active. +10 points added to Home Health!`, 'success');
 };

 // Download Home Health Summary Certificate
 const handleDownloadHealthReport = () => {
 const reportText = `=====================================================
SERVECIRCLE™ HOME HEALTH & COMPLIANCE CERTIFICATE
Report Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
Property: Flat 402, Green Glen Heights, Bellandur, Bangalore
=====================================================

OVERALL HOME HEALTH SCORE: ${currentScore} / 100
Status: ${currentScore >= 85 ? 'EXCELLENT' : currentScore >= 70 ? 'GOOD & COMPLIANT' : 'ATTENTION REQUIRED'}
Prime AMC Protection: ${primeInfo?.active ? 'ACTIVE (' + primeInfo.plan + ')' : 'NOT ENROLLED'}

1. SCHEDULED MAINTENANCE STATUS:
-----------------------------------------------------
${timelineItems.map(item => `[${item.completed ? 'COMPLETED' : 'PENDING'}] ${item.title} - ${item.dueDate} (${item.costEstimate})`).join('\n')}

2. REGISTERED APPLIANCES & DIGITAL WARRANTIES:
-----------------------------------------------------
${appliances.map(app => {
 const st = getWarrantyStatus(app);
 return `• ${app.name} (${app.brand}) | SN: ${app.serialNumber}
 Purchase Date: ${app.purchaseDate} | Valid Till: ${st.expireDate}
 Status: ${st.label} | File: ${app.fileName}`;
}).join('\n\n')}

3. SERVECIRCLE SAFETY SEAL:
-----------------------------------------------------
This document confirms verified inspection compliance and digital
warranty registration powered by ServeCircle Smart Systems.
Support Helpline: 1800-SERVE-CIRCLE (1800-737-832)
=====================================================`;

 const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `ServeCircle_Home_Health_Report_${Date.now()}.txt`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);

 showToast('Home Health Compliance Report downloaded successfully.', 'success');
 };

 // Download Warranty Slip
 const handleDownloadWarrantySlip = (app) => {
 const slipText = `=====================================================
SERVECIRCLE™ OFFICIAL DIGITAL WARRANTY SLIP
Verified Appliance Guarantee Card
=====================================================
Appliance: ${app.name}
Brand: ${app.brand}
Model: ${app.model || 'Standard'}
Serial Number: ${app.serialNumber}
Room / Place: ${app.room || 'Home'}
Purchase Date: ${app.purchaseDate}
Warranty Term: ${app.warrantyYears} Years
Coverage: ${app.coverage}
Invoice Slip: ${app.fileName}
Status: ${getWarrantyStatus(app).label}
Valid Until: ${getWarrantyStatus(app).expireDate}
=====================================================
Doorstep Claim Helpline: 1800-SERVE-CIRCLE
=====================================================`;

 const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `Warranty_Slip_${app.brand}_${app.id}.txt`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);

 showToast(`Warranty slip for ${app.name} downloaded successfully.`, 'success');
 };

 // Filtered Appliances
 const filteredAppliances = useMemo(() => {
 return appliances.filter(app => {
 const matchesCat = applianceCategory === 'ALL' || app.type === applianceCategory;
 const matchesSearch = !searchQuery || 
 app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 app.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (app.serialNumber && app.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
 return matchesCat && matchesSearch;
 });
 }, [appliances, applianceCategory, searchQuery]);

 // Group appliances by room
 const roomGroups = useMemo(() => {
 const groups = {};
 filteredAppliances.forEach(app => {
 const room = app.room || 'Living Room';
 if (!groups[room]) groups[room] = [];
 groups[room].push(app);
 });
 return groups;
 }, [filteredAppliances]);

 // Render individual appliance card component
 const renderApplianceCard = (app) => {
 const wStatus = getWarrantyStatus(app);
 const progress = getWarrantyProgress(app);

 return (
 <div
 key={app.id}
 style={{
 padding: '16px 20px',
 background: 'white',
 border: '1px solid var(--gray-200)',
 borderRadius: '14px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 flexWrap: 'wrap',
 gap: '14px',
 transition: 'all 0.2s ease'
 }}
 >
 {/* Left: Icon & Appliance Details */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
 <div style={{
 width: '46px',
 height: '46px',
 borderRadius: '12px',
 background: '#f1f5f9',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 fontSize: '1.4rem',
 color: '#2563eb'
 }}>
 {app.type === 'AC' ? <HiOutlineBolt /> : 
 app.type === 'TV' ? <HiOutlineTv /> : 
 app.type === 'Refrigerator' ? <HiOutlineCube /> : 
 app.type === 'Washing Machine' ? <HiOutlineWrench /> : 
 <HiOutlineSparkles />}
 </div>

 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)', margin: 0 }}>
 {app.name}
 </h4>
 {wStatus.isExpiring && (
 <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
 <HiOutlineExclamationTriangle /> Expiring Soon
 </span>
 )}
 </div>
 
 <p style={{ fontSize: '0.775rem', color: 'var(--gray-500)', margin: '3px 0 0 0' }}>
 {app.brand} • {app.model || app.type} • {app.room || 'General Area'}
 </p>

 <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
 <span style={{ fontSize: '0.7rem', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
 <HiOutlineDocumentText /> {app.fileName || 'invoice.pdf'}
 </span>
 <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
 SN: {app.serialNumber}
 </span>
 </div>
 </div>
 </div>

 {/* Middle: Warranty Progress */}
 <div style={{ minWidth: '150px', flex: 1, maxWidth: '200px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
 <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Warranty Term</span>
 <span style={{ fontWeight: 800, color: wStatus.color }}>{wStatus.daysRemaining} days left</span>
 </div>
 <div style={{ width: '100%', height: '6px', background: 'var(--gray-200)', borderRadius: '3px', overflow: 'hidden' }}>
 <div style={{ width: `${progress}%`, height: '100%', background: wStatus.color, transition: 'width 0.3s ease' }} />
 </div>
 </div>

 {/* Right: Actions */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <button
 className="btn btn-outline"
 style={{ padding: '6px 14px', fontSize: '0.775rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
 onClick={() => setSelectedWarrantyAppliance(app)}
 >
 <HiOutlineDocumentText /> View Warranty
 </button>

 <button
 style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.15rem', padding: '4px' }}
 onClick={() => setDeleteCandidate(app)}
 title="Remove Appliance"
 >
 <HiOutlineTrash />
 </button>
 </div>

 </div>
 );
 };

 return (
 <div className="page-content" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
 
 {/* Floating In-App Toast Notification */}
 {toast && (
 <div style={{
 position: 'fixed',
 bottom: '24px',
 right: '24px',
 background: toast.type === 'success' ? '#064e3b' : toast.type === 'warning' ? '#78350f' : '#1e293b',
 color: 'white',
 padding: '14px 20px',
 borderRadius: '12px',
 boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
 zIndex: 99999,
 display: 'flex',
 alignItems: 'center',
 gap: '12px',
 border: `1px solid ${toast.type === 'success' ? '#059669' : toast.type === 'warning' ? '#d97706' : '#475569'}`,
 maxWidth: '460px',
 fontSize: '0.9rem',
 animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
 }}>
 <div style={{ fontSize: '1.2rem', display: 'flex' }}>
 {toast.type === 'success' ? <HiOutlineCheckCircle style={{ color: '#34d399' }} /> : 
 toast.type === 'warning' ? <HiOutlineExclamationTriangle style={{ color: '#fbbf24' }} /> : 
 <HiOutlineSparkles style={{ color: '#60a5fa' }} />}
 </div>
 <div style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</div>
 {toast.actionLabel && toast.onAction && (
 <button
 onClick={() => { toast.onAction(); setToast(null); }}
 style={{
 background: 'white',
 color: '#0f172a',
 border: 'none',
 padding: '4px 10px',
 borderRadius: '6px',
 fontSize: '0.8rem',
 fontWeight: 800,
 cursor: 'pointer'
 }}
 >
 {toast.actionLabel}
 </button>
 )}
 <button
 onClick={() => setToast(null)}
 style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', display: 'flex' }}
 >
 <HiOutlineXMark />
 </button>
 </div>
 )}

 {/* Back to General Services Navigation */}
 <div style={{ marginBottom: '14px' }}>
 <button 
 type="button" 
 onClick={() => navigate(-1)} 
 className="back-btn" 
 style={{ 
 display: 'inline-flex', 
 alignItems: 'center', 
 gap: '8px', 
 color: 'var(--sc-dark-accent, #1E40AF)', 
 fontWeight: 700, 
 fontSize: '0.85rem', 
 background: 'rgba(226, 232, 240, 0.45)', 
 border: '1px solid var(--sc-surface-secondary, #E2E8F0)', 
 borderRadius: '20px', 
 padding: '6px 14px', 
 cursor: 'pointer', 
 transition: 'all 0.2s ease'
 }}
 >
 <HiOutlineArrowLeft /> Back to Previous
 </button>
 </div>

 {/* Page Title & Action Bar */}
 <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
 <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
 SMART HOME COCKPIT
 </span>
 {primeInfo?.active && (
 <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
 <HiOutlineTrophy /> PRIME MEMBER
 </span>
 )}
 </div>
 <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.75rem', fontWeight: 900 }}>
 {t('customer.myHome', 'My Home Dashboard')} <HiOutlineHome style={{ color: 'var(--primary-600)' }} />
 </h1>
 <p className="page-subtitle" style={{ margin: '4px 0 0 0', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
 Unified home health index, automated appliance warranty vault, and scheduled safety maintenance.
 </p>
 </div>

 <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
 <button 
 className="btn btn-outline" 
 onClick={handleDownloadHealthReport}
 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}
 >
 <HiOutlineArrowDownTray /> Export Health Audit
 </button>
 <button 
 className="btn btn-outline" 
 onClick={() => setShowResetConfirmModal(true)}
 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
 >
 <HiOutlineArrowPath /> Reset Timeline
 </button>
 </div>
 </div>

 {/* Onboarding Guide Card */}
 <div className="card" style={{
 background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.07) 0%, rgba(59, 130, 246, 0.04) 100%)',
 border: '1.5px solid #c7d2fe',
 borderRadius: '16px',
 padding: '18px 24px',
 marginBottom: '24px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 flexWrap: 'wrap',
 gap: '16px'
 }}>
 <div style={{ flex: 1, minWidth: '280px' }}>
 <h4 style={{ fontSize: '0.95rem', color: '#3730a3', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
 <HiOutlineSparkles style={{ color: '#4f46e5' }} /> How Your Smart Home Cockpit Works
 </h4>
 <p style={{ fontSize: '0.825rem', color: '#4338ca', margin: 0, lineHeight: 1.4 }}>
 Keep your household protected and boost your Home Health Index in 3 simple steps:
 </p>
 <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
 <div style={{ fontSize: '0.8rem', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '6px' }}>
 <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>1</span>
 Complete routine safety items
 </div>
 <div style={{ fontSize: '0.8rem', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '6px' }}>
 <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>2</span>
 Upload bills to auto-scan warranties
 </div>
 <div style={{ fontSize: '0.8rem', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '6px' }}>
 <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>3</span>
 1-click claim repairs & verified doorstep visits
 </div>
 </div>
 </div>
 </div>

 {/* Active Live Booking Doorstep Banner */}
 {activeBooking && (
 <div className="card animate-fade-in-up" style={{
 background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
 border: '1px solid #334155',
 borderRadius: '16px',
 padding: '20px 24px',
 marginBottom: '24px',
 display: 'flex',
 alignItems: 'center',
 gap: '20px',
 justifyContent: 'space-between',
 flexWrap: 'wrap',
 boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
 <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #3b82f6', color: '#60a5fa', fontSize: '1.6rem' }}>
 <HiOutlineTruck />
 </div>
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
 <span style={{ background: '#3b82f6', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Live Doorstep Order
 </span>
 <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{activeBooking.displayId || `#${activeBooking.id}`}</span>
 <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
 <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} /> {activeBooking.status || 'In Progress'}
 </span>
 </div>
 <h4 style={{ color: 'white', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{activeBooking.serviceName}</h4>
 <p style={{ color: '#cbd5e1', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
 Assigned Expert: <strong style={{ color: 'white' }}>{activeBooking.workerName || 'Rajesh Kumar'}</strong> • Doorstep Start OTP: <strong style={{ color: '#38bdf8', letterSpacing: '2px', fontSize: '1.15rem', fontWeight: 900, background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>{activeBooking.startOtp || '4821'}</strong>
 </p>
 </div>
 </div>

 <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
 <button
 onClick={() => setShowTrackingMap(true)}
 className="btn"
 style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
 >
 <HiOutlineMapPin /> Mini-Map View
 </button>
 <Link 
 to="/customer/ordered-services" 
 className="btn" 
 style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
 >
 View in Orders
 </Link>
 <Link 
 to={`/customer/live-tracking?bookingId=${encodeURIComponent(activeBooking.id)}&startOtp=${encodeURIComponent(activeBooking.startOtp || '4821')}`}
 className="btn btn-primary" 
 style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}
 >
 Track Partner Live 
 </Link>
 </div>
 </div>
 )}

 {/* ServeCircle Prime AMC Subscription Banner */}
 <div className="card" style={{
 background: primeInfo?.active 
 ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' 
 : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
 border: `1.5px solid ${primeInfo?.active ? '#a7f3d0' : '#fde68a'}`,
 borderRadius: '16px',
 padding: '18px 24px',
 marginBottom: '24px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 flexWrap: 'wrap',
 gap: '16px'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
 <div style={{ fontSize: '2.2rem', color: primeInfo?.active ? '#059669' : '#d97706', display: 'flex', alignItems: 'center' }}>
 <HiOutlineTrophy />
 </div>
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <h4 style={{ color: primeInfo?.active ? '#065f46' : '#92400e', margin: 0, fontSize: '1.05rem', fontWeight: 900 }}>
 {primeInfo?.active ? 'ServeCircle Prime™ AMC Active' : 'ServeCircle Prime™ Home AMC Pass'}
 </h4>
 <span style={{ fontSize: '0.7rem', background: primeInfo?.active ? '#059669' : '#d97706', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
 {primeInfo?.active ? 'COVERED' : 'RECOMMENDED'}
 </span>
 </div>
 <p style={{ color: primeInfo?.active ? '#047857' : '#78350f', margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
 {primeInfo?.active 
 ? `Plan: ${primeInfo.plan} • Valid until ${primeInfo.expiry} • 2 Free servicing visits & 0% convenience fees.`
 : 'Get 2 Free Appliance Servicing Visits, ₹0 Platform Fees & Priority 30-min Emergency Response for 1 Year.'}
 </p>
 </div>
 </div>

 <button 
 className="btn" 
 onClick={() => setShowPrimeModal(true)}
 style={{ 
 background: primeInfo?.active ? '#059669' : '#f59e0b', 
 color: 'white', 
 border: 'none', 
 padding: '10px 22px', 
 fontSize: '0.875rem', 
 fontWeight: 800, 
 borderRadius: '10px', 
 boxShadow: primeInfo?.active ? '0 4px 12px rgba(5, 150, 105, 0.3)' : '0 4px 12px rgba(245, 158, 11, 0.35)', 
 cursor: 'pointer' 
 }}
 >
 {primeInfo?.active ? 'View AMC Benefits' : 'Join Prime @ ₹999/yr'}
 </button>
 </div>

 {/* Main Two-Column Layout */}
 <div className="dashboard-grid animate-fade-in-up" style={{ gridTemplateColumns: '1.15fr 1.85fr', gap: '24px' }}>
 
 {/* ========================================================= */}
 {/* LEFT COLUMN: HOME HEALTH INDEX & SEASONAL RECOMMENDATIONS */}
 {/* ========================================================= */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
 
 {/* Home Health Score Card */}
 <div 
 className="card hover-lift" 
 onClick={() => setShowHealthModal(true)}
 style={{ 
 padding: '28px', 
 borderRadius: '20px',
 border: '1px solid rgba(255,255,255,0.1)', 
 textAlign: 'center', 
 background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
 color: 'white', 
 position: 'relative', 
 overflow: 'hidden', 
 cursor: 'pointer',
 boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
 }}
 >
 <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '50%' }} />
 
 <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
 <HiOutlineHeart style={{ color: '#f43f5e' }} /> Home Health Index
 </div>
 
 {/* Circular Gauge */}
 <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 18px' }}>
 <div style={{
 width: '100%', height: '100%', borderRadius: '50%',
 border: '14px solid rgba(255, 255, 255, 0.1)',
 borderTopColor: currentScore >= 80 ? '#22c55e' : currentScore >= 65 ? '#f59e0b' : '#ef4444',
 borderRightColor: currentScore >= 80 ? '#22c55e' : currentScore >= 65 ? '#f59e0b' : 'rgba(255,255,255,0.1)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
 position: 'relative', transition: 'all 0.6s ease'
 }}>
 <span style={{ fontSize: '3.4rem', fontWeight: 950, lineHeight: 1, fontFamily: 'var(--font-heading)' }}>{currentScore}</span>
 <span style={{ fontSize: '0.8rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: '4px' }}>Out of 100</span>
 </div>
 </div>

 <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800, color: currentScore >= 80 ? '#4ade80' : currentScore >= 65 ? '#fbbf24' : '#f87171' }}>
 {currentScore >= 80 ? 'Excellent Protection' : currentScore >= 65 ? 'Good & Stable' : 'Maintenance Overdue'}
 </h4>

 <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85, margin: '0 auto 18px', maxWidth: '320px' }}>
 {currentScore >= 80 
 ? 'Your property complies with certified electrical, HVAC, and hydraulic safety guidelines.' 
 : 'Tackle upcoming timeline maintenance tasks to achieve 100% safety certification.'}
 </p>

 <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', fontSize: '0.8rem', textAlign: 'left', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '16px' }}>
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#fbbf24' }}>
 <HiOutlineLightBulb /> Quick Score Boosts:
 </span>
 <div style={{ marginTop: '4px', opacity: 0.9, lineHeight: 1.4 }}>
 Complete AC Servicing (+10 pts) or register new appliances in your digital vault (+4 pts each).
 </div>
 </div>
 
 <button 
 className="btn btn-outline btn-sm" 
 onClick={(e) => { e.stopPropagation(); setShowHealthModal(true); }}
 style={{ width: '100%', padding: '10px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, borderRadius: '10px' }}
 >
 View Detailed Health Audit
 </button>
 </div>

 {/* Predictive Seasonal Maintenance Alerts */}
 <div className="card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--gray-200)' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
 <HiOutlineCloud style={{ color: '#2563eb', fontSize: '1.25rem' }} />
 <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, margin: 0 }}>Predictive Seasonal Advisories</h3>
 </div>
 <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '0 0 16px 0' }}>Proactive maintenance recommended based on local climate and monsoon cycles.</p>

 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 
 {/* Seasonal Card 1: Monsoon Waterproofing */}
 <div style={{ padding: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <div>
 <span style={{ fontSize: '0.65rem', background: '#0284c7', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Monsoon Alert</span>
 <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0369a1', margin: '4px 0 0 0' }}>Monsoon Roof & External Leak Proofing</h4>
 </div>
 <span style={{ fontSize: '1.4rem', color: '#0284c7' }}><HiOutlineCloud /></span>
 </div>
 <p style={{ fontSize: '0.775rem', color: '#075985', margin: 0, lineHeight: 1.4 }}>
 Prevent AC water dripping and wall dampness. Includes structural check of external compressor bracket and balcony drain seals.
 </p>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
 <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369a1' }}>Starting @ ₹1,299</span>
 <Link 
 to="/customer/book?service=Monsoon%20Leak%20Proofing&serviceId=waterproofing&category=home-repairs" 
 className="btn btn-sm" 
 style={{ background: '#0284c7', color: 'white', textDecoration: 'none', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
 >
 Book Monsoon Prep
 </Link>
 </div>
 </div>

 {/* Seasonal Card 2: Water Tank Sanitization */}
 <div style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <div>
 <span style={{ fontSize: '0.65rem', background: '#d97706', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Hydraulic Hygiene</span>
 <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400e', margin: '4px 0 0 0' }}>Overhead Water Tank Sanitization</h4>
 </div>
 <span style={{ fontSize: '1.4rem', color: '#d97706' }}><HiOutlineSparkles /></span>
 </div>
 <p style={{ fontSize: '0.775rem', color: '#78350f', margin: 0, lineHeight: 1.4 }}>
 Regular tank cleaning every 6 months prevents algae build-up and bacterial growth. 4-step UV sterilize process.
 </p>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
 <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e' }}>Starting @ ₹799</span>
 <Link 
 to="/customer/book?service=Water%20Tank%20Sanitization&serviceId=water-tank-clean&category=cleaning" 
 className="btn btn-sm" 
 style={{ background: '#d97706', color: 'white', textDecoration: 'none', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
 >
 Schedule Cleaning
 </Link>
 </div>
 </div>

 </div>
 </div>

 {/* Smart Utility & Energy Health Monitor */}
 <div className="card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--gray-200)' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <HiOutlineBolt style={{ color: '#eab308', fontSize: '1.3rem' }} />
 <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, margin: 0 }}>Smart Energy & Power Draw</h3>
 </div>
 <span style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
 ECO STABLE
 </span>
 </div>
 <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '0 0 16px 0' }}>Estimated real-time power consumption of your registered smart appliances.</p>

 <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
 <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)', fontWeight: 600 }}>Estimated Power Draw</span>
 <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>~8.4 kWh / day</strong>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)', fontWeight: 600 }}>Est. Monthly Cost</span>
 <strong style={{ fontSize: '0.95rem', color: '#059669' }}>₹1,640 / month</strong>
 </div>
 </div>

 <div style={{ fontSize: '0.775rem', color: 'var(--gray-600)', background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 12px', borderRadius: '10px', marginBottom: '14px', lineHeight: 1.4 }}>
 <strong>Eco Tip:</strong> Servicing your Daikin AC filter this month reduces compressor load by ~18% and saves ~₹320 on electricity.
 </div>

 <Link
 to="/customer/book?service=Complete%20Home%20Safety%20Audit&serviceId=electrical-safety&category=home-repairs"
 className="btn btn-outline btn-sm"
 style={{ width: '100%', padding: '8px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
 >
 <HiOutlineWrench /> Schedule Certified Energy & Wiring Audit
 </Link>
 </div>

 </div>

 {/* ========================================================================= */}
 {/* RIGHT COLUMN: INTERACTIVE MAINTENANCE TIMELINE & DIGITAL WARRANTY VAULT */}
 {/* ========================================================================= */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
 
 {/* Card 1: Interactive Maintenance Timeline */}
 <div className="card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid var(--gray-200)' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
 <div>
 <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800, margin: 0 }}>Interactive Maintenance Timeline</h3>
 <p style={{ fontSize: '0.825rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
 Track routine safety events. Mark items complete or schedule doorstep technicians with 1-click.
 </p>
 </div>

 {/* Status Filter Badges */}
 <div style={{ display: 'flex', gap: '6px' }}>
 {['ALL', 'PENDING', 'COMPLETED'].map((filter) => (
 <button
 key={filter}
 onClick={() => { setTimelineFilter(filter); setBookingItem(null); }}
 style={{
 padding: '5px 14px',
 borderRadius: '20px',
 border: 'none',
 fontSize: '0.725rem',
 fontWeight: 800,
 cursor: 'pointer',
 background: timelineFilter === filter ? 'var(--primary-600)' : 'var(--gray-100)',
 color: timelineFilter === filter ? 'white' : 'var(--navy-600)',
 transition: 'all 0.2s ease'
 }}
 >
 {filter}
 </button>
 ))}
 </div>
 </div>

 {/* Timeline Stream */}
 <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '24px', borderLeft: '2.5px dashed var(--gray-200)', gap: '20px', marginTop: '16px' }}>
 
 {timelineItems
 .filter(item => {
 if (timelineFilter === 'PENDING') return !item.completed;
 if (timelineFilter === 'COMPLETED') return item.completed;
 return true;
 })
 .map((item) => {
 let badgeColor = 'var(--gray-500)';
 let badgeBg = 'var(--gray-100)';
 let circleColor = 'var(--gray-300)';

 if (item.completed) {
 badgeColor = '#16a34a';
 badgeBg = '#dcfce7';
 circleColor = '#22c55e';
 } else if (item.urgency === 'warning') {
 badgeColor = '#d97706';
 badgeBg = '#fef3c7';
 circleColor = '#fbbf24';
 } else {
 badgeColor = 'var(--primary-700)';
 badgeBg = '#e0f2fe';
 circleColor = 'var(--primary-400)';
 }

 return (
 <div key={item.id} style={{ position: 'relative' }}>
 
 {/* Interactive Circle Checkbox Node */}
 <div 
 onClick={() => toggleTimelineItem(item.id)}
 title="Click to toggle safety completion"
 style={{
 position: 'absolute',
 left: '-34px',
 top: '2px',
 width: '20px',
 height: '20px',
 borderRadius: '50%',
 background: item.completed ? '#22c55e' : 'white',
 border: `3px solid ${item.completed ? '#22c55e' : circleColor}`,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 zIndex: 2,
 cursor: 'pointer',
 boxShadow: '0 0 0 4px white',
 transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
 }}
 >
 {item.completed && (
 <HiOutlineCheck style={{ fontSize: '0.75rem', color: 'white', strokeWidth: 3 }} />
 )}
 </div>

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
 <div>
 <h4 
 onClick={() => toggleTimelineItem(item.id)}
 style={{ 
 fontSize: '0.975rem', 
 fontWeight: 800, 
 color: 'var(--navy-800)', 
 textDecoration: item.completed ? 'line-through' : 'none', 
 opacity: item.completed ? 0.55 : 1,
 cursor: 'pointer',
 margin: 0,
 transition: 'all 0.2s ease'
 }}
 >
 {item.title}
 </h4>
 <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
 <span style={{ fontSize: '0.75rem', fontWeight: 700, color: badgeColor, background: badgeBg, padding: '2px 8px', borderRadius: '12px' }}>
 {item.dueDate}
 </span>
 <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
 Est. {item.costEstimate} • Health Boost: <strong style={{ color: '#059669' }}>+{item.points} pts</strong>
 </span>
 </div>
 </div>

 {!item.completed ? (
 <div style={{ display: 'flex', gap: '8px' }}>
 <button 
 className="btn btn-outline btn-sm"
 style={{ padding: '6px 12px', fontSize: '0.775rem', fontWeight: 700 }}
 onClick={() => toggleTimelineItem(item.id)}
 >
 Mark Done
 </button>
 <button 
 className="btn btn-primary btn-sm"
 style={{ padding: '6px 14px', fontSize: '0.775rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
 onClick={() => {
 setBookingItem(item);
 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 setBookingDate(tomorrow.toISOString().split('T')[0]);
 }}
 >
 Schedule Slot <HiOutlineArrowRight />
 </button>
 </div>
 ) : (
 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.825rem', fontWeight: 800 }}>
 <HiOutlineCheckCircle style={{ fontSize: '1.1rem' }} /> Verified Safe ({item.completedDate || 'Recent'})
 </div>
 )}
 </div>

 {/* Inline Quick Schedule Module */}
 {bookingItem?.id === item.id && (
 <div style={{
 background: '#f8fafc',
 border: '1.5px solid #93c5fd',
 borderRadius: '14px',
 padding: '16px',
 marginTop: '12px',
 boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
 animation: 'fadeInUp 0.3s ease'
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
 <h5 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--navy-800)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
 <HiOutlineCalendarDays style={{ color: 'var(--primary-600)' }} /> Schedule Doorstep Visit: {item.title}
 </h5>
 <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 800 }}>Fee: {item.costEstimate}</span>
 </div>

 <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
 <div style={{ flex: 1, minWidth: '160px' }}>
 <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gray-600)', display: 'block', marginBottom: '4px' }}>Date *</label>
 <input 
 type="date" 
 className="input-field" 
 value={bookingDate} 
 onChange={(e) => setBookingDate(e.target.value)}
 style={{ padding: '6px 12px', fontSize: '0.825rem', width: '100%', height: '38px', borderRadius: '8px' }} 
 />
 </div>
 <div style={{ flex: 1, minWidth: '160px' }}>
 <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gray-600)', display: 'block', marginBottom: '4px' }}>Time Slot *</label>
 <select 
 className="input-field" 
 value={bookingTime} 
 onChange={(e) => setBookingTime(e.target.value)}
 style={{ padding: '6px 12px', fontSize: '0.825rem', width: '100%', height: '38px', borderRadius: '8px' }}
 >
 <option>09:00 AM - 11:00 AM</option>
 <option>11:00 AM - 01:00 PM</option>
 <option>02:00 PM - 04:00 PM</option>
 <option>04:00 PM - 06:00 PM</option>
 </select>
 </div>
 </div>

 <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
 <Link 
 to={item.targetPath} 
 style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, textDecoration: 'underline', marginRight: 'auto' }}
 >
 Or open full customization flow →
 </Link>
 <button className="btn btn-outline btn-sm" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => setBookingItem(null)}>
 Cancel
 </button>
 <button 
 className="btn btn-primary btn-sm" 
 style={{ padding: '6px 16px', fontSize: '0.75rem', fontWeight: 800, background: '#2563eb' }} 
 onClick={() => handleConfirmInlineBooking(item)}
 >
 Confirm Booking
 </button>
 </div>
 </div>
 )}
 </div>
 );
 })}

 </div>
 </div>

 {/* Card 2: Digital Appliance Warranty Vault */}
 <div className="card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid var(--gray-200)' }}>
 
 {/* Header & Controls */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800, margin: 0 }}>Digital Appliance Warranty Vault</h3>
 <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
 {appliances.length} Devices
 </span>
 </div>
 <p style={{ fontSize: '0.825rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
 AI-scanned invoices, manufacturer warranty tracking, and 1-click doorstep repair claims.
 </p>
 </div>

 <button
 className="btn btn-primary"
 onClick={() => { setShowAddForm(!showAddForm); setFormError(''); }}
 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, padding: '8px 18px', borderRadius: '10px' }}
 >
 <HiOutlinePlusCircle /> {showAddForm ? 'Close Form' : 'Register Appliance'}
 </button>
 </div>

 {/* Registration Form / AI OCR Scanner */}
 {showAddForm && (
 <form
 onSubmit={handleRegisterAppliance}
 style={{
 background: '#f8fafc',
 padding: '24px',
 borderRadius: '16px',
 marginBottom: '24px',
 border: '1.5px solid #cbd5e1',
 transition: 'all 0.3s ease'
 }}
 >
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
 <h4 style={{ fontWeight: 800, margin: 0, color: 'var(--navy-800)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
 <HiOutlineSparkles style={{ color: 'var(--primary-600)' }} /> Register New Appliance via AI Invoice Scan
 </h4>
 <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>PDF, PNG, JPG accepted</span>
 </div>
 
 {formError && (
 <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 600 }}>
 {formError}
 </div>
 )}

 {/* Animated AI Scanning Stage */}
 {isScanning ? (
 <div style={{
 background: 'rgba(99, 102, 241, 0.06)',
 border: '2px dashed #818cf8',
 borderRadius: '14px',
 padding: '32px 20px',
 textAlign: 'center',
 marginBottom: '18px',
 position: 'relative',
 overflow: 'hidden'
 }}>
 <HiOutlineSparkles style={{ fontSize: '2.5rem', color: '#4f46e5', margin: '0 auto', display: 'block' }} />
 <h5 style={{ fontWeight: 800, color: '#3730a3', fontSize: '1rem', marginTop: '12px', marginBottom: '4px' }}>
 AI Smart Receipt Scan Active
 </h5>
 <p style={{ fontSize: '0.85rem', color: '#4338ca', margin: 0, fontWeight: 700 }}>{scanStage}</p>
 <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', marginTop: '10px' }}>Extracting metadata, serial number, and warranty terms...</span>
 </div>
 ) : (
 <>
 {/* Invoice Upload Box */}
 <div style={{ background: 'white', padding: '24px', borderRadius: '14px', border: '2px dashed #93c5fd', textAlign: 'center', marginBottom: '16px' }}>
 <input type="file" id="invoice-upload" style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} />
 <label htmlFor="invoice-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
 <HiOutlineArrowUpOnSquare style={{ fontSize: '2.4rem', color: '#2563eb' }} />
 <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
 {uploadedFile ? `Attached: ${uploadedFile}` : <><HiOutlineCamera style={{ color: '#2563eb' }} /> Scan Invoice Bill / Guarantee Card</>}
 </span>
 <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', maxWidth: '320px', lineHeight: 1.4 }}>
 Upload your bill. Our AI will automatically parse the brand, serial number, and warranty terms instantly!
 </span>
 </label>

 {uploadProgress > 0 && uploadProgress < 100 && (
 <div style={{ marginTop: '14px', maxWidth: '300px', margin: '14px auto 0' }}>
 <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
 <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#2563eb', transition: 'width 0.15s ease' }} />
 </div>
 <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px', display: 'inline-block' }}>Uploading: {uploadProgress}%</span>
 </div>
 )}
 </div>

 {/* Manual toggle */}
 <div style={{ textAlign: 'center', marginBottom: '14px' }}>
 <button
 type="button"
 onClick={() => setShowManualFields(!showManualFields)}
 style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
 >
 {showManualFields ? 'Hide manual details form' : 'Or fill appliance details manually'}
 </button>
 </div>

 {/* Collapsible Fields */}
 {showManualFields && (
 <div className="animate-fade-in" style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
 <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
 <div className="input-group" style={{ marginBottom: 0 }}>
 <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)' }}>Appliance Name *</label>
 <input type="text" name="name" className="input-field" placeholder="e.g. Master Bedroom AC" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
 </div>
 <div className="input-group" style={{ marginBottom: 0 }}>
 <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)' }}>Manufacturer / Brand *</label>
 <input type="text" name="brand" className="input-field" placeholder="e.g. Daikin, LG, Sony" value={formData.brand} onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
 </div>
 <div className="input-group" style={{ marginBottom: 0 }}>
 <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)' }}>Model / Specs</label>
 <input type="text" name="model" className="input-field" placeholder="e.g. Inverter 1.5 Ton Split" value={formData.model} onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
 </div>
 <div className="input-group" style={{ marginBottom: 0 }}>
 <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)' }}>Serial Number</label>
 <input type="text" name="serialNumber" className="input-field" placeholder="e.g. SN-DKN-88294" value={formData.serialNumber} onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
 </div>
 <div className="input-group" style={{ marginBottom: 0 }}>
 <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)' }}>Purchase Date *</label>
 <input type="date" name="purchaseDate" className="input-field" value={formData.purchaseDate} onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
 </div>
 <div className="input-group" style={{ marginBottom: 0 }}>
 <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)' }}>Warranty Period (Years)</label>
 <select name="warrantyYears" className="input-field" value={formData.warrantyYears} onChange={(e) => setFormData(prev => ({ ...prev, warrantyYears: e.target.value }))} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
 <option value="1">1 Year Comprehensive</option>
 <option value="2">2 Years Protection</option>
 <option value="3">3 Years Extended</option>
 <option value="5">5 Years Protection</option>
 <option value="10">10 Years Compressor/Motor</option>
 </select>
 </div>
 <div className="input-group" style={{ marginBottom: 0 }}>
 <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)' }}>Category / Type</label>
 <select name="type" className="input-field" value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
 <option value="AC">Air Conditioner (AC)</option>
 <option value="TV">Television (Smart TV)</option>
 <option value="Refrigerator">Refrigerator</option>
 <option value="Washing Machine">Washing Machine</option>
 <option value="Water Purifier">RO Water Purifier</option>
 </select>
 </div>
 <div className="input-group" style={{ marginBottom: 0 }}>
 <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)' }}>Room / Placement</label>
 <select name="room" className="input-field" value={formData.room} onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
 <option value="Living Room">Living Room</option>
 <option value="Master Bedroom">Master Bedroom</option>
 <option value="Kitchen">Kitchen</option>
 <option value="Utility Area">Utility Area</option>
 <option value="Guest Bedroom">Guest Bedroom</option>
 </select>
 </div>
 </div>

 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
 <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddForm(false)}>
 Cancel
 </button>
 <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 20px', fontWeight: 800, background: '#2563eb' }}>
 Save to Digital Vault
 </button>
 </div>
 </div>
 )}
 </>
 )}
 </form>
 )}

 {/* Search & Filter Toolbar */}
 <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
 
 {/* Category Filter Pills & View Switcher */}
 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
 <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
 {['ALL', 'AC', 'TV', 'Refrigerator', 'Washing Machine', 'Water Purifier'].map(cat => (
 <button
 key={cat}
 onClick={() => setApplianceCategory(cat)}
 style={{
 padding: '5px 12px',
 borderRadius: '20px',
 border: 'none',
 fontSize: '0.75rem',
 fontWeight: 700,
 cursor: 'pointer',
 background: applianceCategory === cat ? 'var(--navy-800)' : 'var(--gray-100)',
 color: applianceCategory === cat ? 'white' : 'var(--navy-600)',
 transition: 'all 0.2s ease'
 }}
 >
 {cat}
 </button>
 ))}
 </div>

 {/* View Mode Toggle */}
 <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
 <button
 onClick={() => setApplianceViewMode('LIST')}
 style={{
 padding: '4px 10px',
 borderRadius: '6px',
 border: 'none',
 fontSize: '0.725rem',
 fontWeight: 800,
 cursor: 'pointer',
 background: applianceViewMode === 'LIST' ? 'white' : 'transparent',
 color: applianceViewMode === 'LIST' ? '#0f172a' : '#64748b',
 boxShadow: applianceViewMode === 'LIST' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
 }}
 >
 List
 </button>
 <button
 onClick={() => setApplianceViewMode('ROOM')}
 style={{
 padding: '4px 10px',
 borderRadius: '6px',
 border: 'none',
 fontSize: '0.725rem',
 fontWeight: 800,
 cursor: 'pointer',
 background: applianceViewMode === 'ROOM' ? 'white' : 'transparent',
 color: applianceViewMode === 'ROOM' ? '#0f172a' : '#64748b',
 boxShadow: applianceViewMode === 'ROOM' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
 }}
 >
 By Room
 </button>
 </div>
 </div>

 {/* Search Box */}
 <div style={{ position: 'relative', width: '220px' }}>
 <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', fontSize: '0.9rem' }} />
 <input
 type="text"
 placeholder="Search appliance / brand..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 style={{ width: '100%', padding: '6px 12px 6px 32px', borderRadius: '20px', border: '1px solid var(--gray-300)', fontSize: '0.8rem', outline: 'none' }}
 />
 </div>

 </div>

 {/* Appliance Cards Grid / List / By Room */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
 {filteredAppliances.length === 0 ? (
 <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--gray-500)', background: 'var(--gray-50)', borderRadius: '14px', border: '1px dashed var(--gray-300)' }}>
 <HiOutlineCube style={{ fontSize: '2.5rem', color: 'var(--gray-400)', margin: '0 auto 8px', display: 'block' }} />
 <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>No appliances found in this category.</p>
 <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>Click &quot;Register Appliance&quot; above to scan a new bill.</p>
 </div>
 ) : applianceViewMode === 'ROOM' ? (
 Object.entries(roomGroups).map(([roomName, roomApps]) => (
 <div key={roomName} style={{ marginBottom: '14px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '6px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
 <HiOutlineHome style={{ color: '#2563eb' }} />
 <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--navy-900)' }}>{roomName}</span>
 <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)', background: 'white', padding: '1px 8px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
 {roomApps.length} {roomApps.length === 1 ? 'Device' : 'Devices'}
 </span>
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px' }}>
 {roomApps.map(renderApplianceCard)}
 </div>
 </div>
 ))
 ) : (
 filteredAppliances.map(renderApplianceCard)
 )}
 </div>

 </div>

 </div>

 </div>

 {/* ========================================================= */}
 {/* MODAL 1: DETAILED HOME HEALTH AUDIT MODAL */}
 {/* ========================================================= */}
 {showHealthModal && (
 <div style={{
 position: 'fixed',
 top: 0, left: 0, width: '100vw', height: '100vh',
 background: 'rgba(15, 23, 42, 0.6)',
 backdropFilter: 'blur(8px)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 zIndex: 99999, padding: '20px'
 }} onClick={() => setShowHealthModal(false)}>
 <div style={{
 background: 'white',
 borderRadius: '20px',
 width: '100%', maxWidth: '620px',
 padding: '32px',
 position: 'relative',
 maxHeight: '90vh', overflowY: 'auto',
 boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)'
 }} onClick={(e) => e.stopPropagation()}>
 
 <button 
 onClick={() => setShowHealthModal(false)}
 style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
 >
 
 </button>

 <div style={{ textAlign: 'center', marginBottom: '24px' }}>
 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '1.8rem' }}>
 <HiOutlineHeart />
 </div>
 <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy-900)', margin: 0 }}>
 HomeFixr™ Safety & Health Audit
 </h2>
 <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
 Real-time breakdown of structural, appliance, and preventive household standards.
 </p>
 </div>

 {/* Score Bar */}
 <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
 <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)' }}>Overall Safety Compliance</span>
 <span style={{ fontSize: '1.25rem', fontWeight: 950, color: currentScore >= 80 ? '#16a34a' : currentScore >= 65 ? '#d97706' : '#dc2626' }}>
 {currentScore} %
 </span>
 </div>
 <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
 <div style={{ width: `${currentScore}%`, height: '100%', background: currentScore >= 80 ? '#16a34a' : currentScore >= 65 ? '#d97706' : '#dc2626', transition: 'width 0.5s ease' }} />
 </div>
 </div>

 {/* Category Pillars */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
 <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-600)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
 Safety Pillars Breakdown
 </h4>

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
 <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-800)', fontWeight: 600 }}>
 <HiOutlineBolt style={{ color: '#2563eb' }} /> HVAC & Air Filtration
 </span>
 <strong style={{ color: timelineItems.find(i => i.id === 1)?.completed ? '#16a34a' : '#d97706' }}>
 {timelineItems.find(i => i.id === 1)?.completed ? ' Safe & Clean' : 'Servicing Due'}
 </strong>
 </div>

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
 <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-800)', fontWeight: 600 }}>
 <HiOutlineSparkles style={{ color: '#0ea5e9' }} /> Water Hydraulics & Tanks
 </span>
 <strong style={{ color: timelineItems.find(i => i.id === 2)?.completed ? '#16a34a' : '#d97706' }}>
 {timelineItems.find(i => i.id === 2)?.completed ? ' Sanitized' : 'Cleaning Overdue'}
 </strong>
 </div>

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
 <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-800)', fontWeight: 600 }}>
 <HiOutlineBolt style={{ color: '#f59e0b' }} /> Electrical & Earthing Safety
 </span>
 <strong style={{ color: timelineItems.find(i => i.id === 3)?.completed ? '#16a34a' : '#d97706' }}>
 {timelineItems.find(i => i.id === 3)?.completed ? ' Certified Inspected' : 'Inspection Required'}
 </strong>
 </div>

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
 <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-800)', fontWeight: 600 }}>
 <HiOutlineShieldCheck style={{ color: '#10b981' }} /> Pest & Hygiene Barrier
 </span>
 <strong style={{ color: timelineItems.find(i => i.id === 4)?.completed ? '#16a34a' : '#d97706' }}>
 {timelineItems.find(i => i.id === 4)?.completed ? ' Shield Active' : 'Treatment Due'}
 </strong>
 </div>

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
 <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy-800)', fontWeight: 600 }}>
 <HiOutlineCube style={{ color: '#8b5cf6' }} /> Digital Warranty Protection
 </span>
 <strong style={{ color: appliances.length >= 3 ? '#16a34a' : '#d97706' }}>
 {appliances.length} Registered Devices
 </strong>
 </div>
 </div>

 {/* Actions */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 <button
 className="btn btn-primary"
 style={{ width: '100%', padding: '12px', fontWeight: 800, background: '#2563eb' }}
 onClick={() => {
 setShowHealthModal(false);
 navigate('/customer/book?service=Complete%20Home%20Safety%20Audit&serviceId=electrical-safety&category=home-repairs');
 }}
 >
 Schedule Comprehensive 360° Home Inspection
 </button>
 
 <button
 className="btn btn-outline"
 style={{ width: '100%', padding: '10px', fontWeight: 700 }}
 onClick={handleDownloadHealthReport}
 >
 <HiOutlineArrowDownTray /> Download Printable Compliance Certificate
 </button>
 </div>

 </div>
 </div>
 )}

 {/* ========================================================= */}
 {/* MODAL 2: DIGITAL WARRANTY CARD & INVOICE VIEWER */}
 {/* ========================================================= */}
 {selectedWarrantyAppliance && (
 <div style={{
 position: 'fixed',
 top: 0, left: 0, width: '100vw', height: '100vh',
 background: 'rgba(15, 23, 42, 0.6)',
 backdropFilter: 'blur(8px)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 zIndex: 99999, padding: '20px'
 }} onClick={() => setSelectedWarrantyAppliance(null)}>
 <div style={{
 background: 'white',
 borderRadius: '20px',
 width: '100%', maxWidth: '540px',
 padding: '28px',
 position: 'relative',
 boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)'
 }} onClick={(e) => e.stopPropagation()}>
 
 <button 
 onClick={() => setSelectedWarrantyAppliance(null)}
 style={{ position: 'absolute', top: '18px', right: '18px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
 >
 <HiOutlineXMark />
 </button>

 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
 <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
 <HiOutlineShieldCheck />
 </div>
 <div>
 <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
 SERVECIRCLE VERIFIED WARRANTY
 </span>
 <h3 style={{ margin: '2px 0 0 0', fontSize: '1.2rem', fontWeight: 900, color: 'var(--navy-900)' }}>
 {selectedWarrantyAppliance.name}
 </h3>
 </div>
 </div>

 {/* Spec Sheet */}
 <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: 'var(--gray-500)' }}>Brand & Manufacturer:</span>
 <strong style={{ color: 'var(--navy-800)' }}>{selectedWarrantyAppliance.brand}</strong>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: 'var(--gray-500)' }}>Model Specifications:</span>
 <strong style={{ color: 'var(--navy-800)' }}>{selectedWarrantyAppliance.model || 'Standard Edition'}</strong>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: 'var(--gray-500)' }}>Serial Number:</span>
 <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
 {selectedWarrantyAppliance.serialNumber}
 </code>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: 'var(--gray-500)' }}>Purchase Date:</span>
 <strong style={{ color: 'var(--navy-800)' }}>{selectedWarrantyAppliance.purchaseDate}</strong>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: 'var(--gray-500)' }}>Warranty Expiry:</span>
 <strong style={{ color: '#16a34a' }}>{getWarrantyStatus(selectedWarrantyAppliance).expireDate}</strong>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: 'var(--gray-500)' }}>Attached Invoice:</span>
 <span style={{ color: '#2563eb', fontWeight: 700 }}>{selectedWarrantyAppliance.fileName}</span>
 </div>
 </div>

 <div style={{ display: 'flex', gap: '10px' }}>
 <button
 className="btn btn-outline"
 style={{ flex: 1, padding: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
 onClick={() => handleDownloadWarrantySlip(selectedWarrantyAppliance)}
 >
 <HiOutlineArrowDownTray /> Download Slip
 </button>
 <button
 className="btn btn-primary"
 style={{ flex: 1, padding: '10px', fontWeight: 800, fontSize: '0.85rem', background: '#2563eb' }}
 onClick={() => {
 setSelectedWarrantyAppliance(null);
 navigate(`/customer/book?service=${encodeURIComponent(selectedWarrantyAppliance.name + ' Servicing')}&appliance=${encodeURIComponent(selectedWarrantyAppliance.name)}&warrantyClaim=true`);
 }}
 >
 Claim Warranty Repair
 </button>
 </div>

 </div>
 </div>
 )}

 {/* ========================================================= */}
 {/* MODAL 3: PRIME AMC MEMBERSHIP MODAL */}
 {/* ========================================================= */}
 {showPrimeModal && (
 <div style={{
 position: 'fixed',
 top: 0, left: 0, width: '100vw', height: '100vh',
 background: 'rgba(15, 23, 42, 0.65)',
 backdropFilter: 'blur(8px)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 zIndex: 99999, padding: '20px'
 }} onClick={() => setShowPrimeModal(false)}>
 <div style={{
 background: 'white',
 borderRadius: '24px',
 width: '100%', maxWidth: '580px',
 padding: '32px',
 position: 'relative',
 boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)'
 }} onClick={(e) => e.stopPropagation()}>
 
 <button 
 onClick={() => setShowPrimeModal(false)}
 style={{ position: 'absolute', top: '18px', right: '18px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
 >
 <HiOutlineXMark />
 </button>

 <div style={{ textAlign: 'center', marginBottom: '20px' }}>
 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '2rem' }}>
 <HiOutlineTrophy />
 </div>
 <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy-900)', margin: 0 }}>
 ServeCircle Prime™ AMC Pass
 </h2>
 <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
 Unconditional annual home maintenance, zero convenience fees, and guaranteed dispatch.
 </p>
 </div>

 {/* Perks List */}
 <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '18px', marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#78350f' }}>
 <HiOutlineCheckCircle style={{ color: '#d97706', fontSize: '1.25rem', flexShrink: 0 }} />
 <span><strong>2 Free Routine Servicing Visits</strong> every year for AC, Fridge, or Washing Machine.</span>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#78350f' }}>
 <HiOutlineCheckCircle style={{ color: '#d97706', fontSize: '1.25rem', flexShrink: 0 }} />
 <span><strong>₹0 Platform & Convenience Fees</strong> on all emergency, electrical, and plumbing repairs.</span>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#78350f' }}>
 <HiOutlineCheckCircle style={{ color: '#d97706', fontSize: '1.25rem', flexShrink: 0 }} />
 <span><strong>Priority 30-Minute Dispatch Guarantee</strong> with top-rated verified master technicians.</span>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#78350f' }}>
 <HiOutlineCheckCircle style={{ color: '#d97706', fontSize: '1.25rem', flexShrink: 0 }} />
 <span><strong>Flat 15% Savings</strong> on genuine spare parts, capacitors, and refrigerant refills.</span>
 </div>
 </div>

 {/* Plan Options */}
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
 <div 
 onClick={() => handleActivatePrime('1-Year Prime Pass', 999)}
 style={{
 border: '2px solid #f59e0b',
 borderRadius: '14px',
 padding: '16px',
 textAlign: 'center',
 cursor: 'pointer',
 background: '#fffdf5',
 transition: 'all 0.2s ease'
 }}
 >
 <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>1-Year Unlimited</div>
 <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--navy-900)', margin: '4px 0' }}>₹999</div>
 <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Billed annually • Save ₹1,800+</div>
 <button className="btn btn-sm" style={{ background: '#f59e0b', color: 'white', width: '100%', marginTop: '10px', fontWeight: 800 }}>
 Select 1-Year
 </button>
 </div>

 <div 
 onClick={() => handleActivatePrime('2-Year VIP Prime Pass', 1799)}
 style={{
 border: '2px solid #2563eb',
 borderRadius: '14px',
 padding: '16px',
 textAlign: 'center',
 cursor: 'pointer',
 background: '#f8fafc',
 transition: 'all 0.2s ease',
 position: 'relative'
 }}
 >
 <span style={{ position: 'absolute', top: '-10px', right: '12px', background: '#2563eb', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
 BEST VALUE
 </span>
 <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>2-Year VIP Pass</div>
 <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--navy-900)', margin: '4px 0' }}>₹1,799</div>
 <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>₹899/yr equivalent • Save ₹4,200+</div>
 <button className="btn btn-sm" style={{ background: '#2563eb', color: 'white', width: '100%', marginTop: '10px', fontWeight: 800 }}>
 Select 2-Year
 </button>
 </div>
 </div>

 <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-400)', margin: 0 }}>
 Cancel anytime. 100% money-back guarantee within 30 days if unused.
 </p>

 </div>
 </div>
 )}

 {/* ========================================================= */}
 {/* MODAL 4: IN-PAGE LIVE TRACKING MINI-MAP & CALL MODAL */}
 {/* ========================================================= */}
 {showTrackingMap && (
 <div style={{
 position: 'fixed',
 top: 0, left: 0, right: 0, bottom: 0,
 background: 'rgba(15, 23, 42, 0.75)',
 backdropFilter: 'blur(8px)',
 zIndex: 99999,
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 padding: '20px'
 }} onClick={() => setShowTrackingMap(false)}>
 <div style={{
 background: 'white',
 width: '100%', maxWidth: '780px',
 borderRadius: '20px',
 overflow: 'hidden',
 position: 'relative',
 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
 }} onClick={(e) => e.stopPropagation()}>
 
 <div style={{ background: 'var(--navy-900)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <h3 style={{ color: 'white', margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <HiOutlineMapPin style={{ color: '#60a5fa' }} /> Live Partner Doorstep Tracking
 </h3>
 <p style={{ color: 'var(--gray-400)', margin: '2px 0 0 0', fontSize: '0.8rem' }}>
 Order {activeBooking?.displayId || '#SC-89241'} • Doorstep Start OTP: <strong style={{ color: '#38bdf8' }}>{activeBooking?.startOtp || '4821'}</strong>
 </p>
 </div>
 <button 
 onClick={() => setShowTrackingMap(false)}
 style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
 >
 <HiOutlineXMark />
 </button>
 </div>

 {/* Simulated Live Map */}
 <div style={{ width: '100%', height: '380px', background: '#e2e8f0', position: 'relative' }}>
 <iframe
 src="https://maps.google.com/maps?q=Koramangala,Bangalore&t=&z=14&ie=UTF8&iwloc=&output=embed"
 width="100%"
 height="100%"
 style={{ border: 0 }}
 allowFullScreen=""
 loading="lazy"
 title="Live Partner Map"
 />

 {/* Overlay Card */}
 <div style={{
 position: 'absolute',
 bottom: '16px',
 left: '16px',
 right: '16px',
 background: 'white',
 padding: '16px 20px',
 borderRadius: '14px',
 boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
 display: 'flex',
 alignItems: 'center',
 gap: '14px',
 flexWrap: 'wrap'
 }}>
 <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
 RK
 </div>
 <div style={{ flex: 1, minWidth: '180px' }}>
 <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
 {activeBooking?.workerName || 'Rajesh Kumar'} <HiOutlineCheckCircle style={{ color: '#2563eb' }} />
 </h4>
 <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
 Certified Specialist • 4.9 <HiOutlineStar style={{ color: '#eab308' }} /> (180+ Jobs)
 </p>
 <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
 Current Distance: 1.2 km away (Reaching in 6 mins)
 </p>
 </div>
 <button 
 className="btn btn-primary" 
 style={{ background: '#2563eb', padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
 onClick={() => setIsCallingPartner(true)}
 >
 <HiOutlinePhone /> Call Partner
 </button>
 </div>
 </div>

 </div>
 </div>
 )}

 {/* ========================================================= */}
 {/* MODAL 5: MASKED VOICE CALL MODAL */}
 {/* ========================================================= */}
 {isCallingPartner && (
 <div style={{
 position: 'fixed',
 top: 0, left: 0, right: 0, bottom: 0,
 background: 'rgba(15, 23, 42, 0.85)',
 backdropFilter: 'blur(12px)',
 zIndex: 100000,
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 padding: '20px'
 }}>
 <div style={{
 background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
 border: '1px solid #334155',
 borderRadius: '24px',
 width: '100%', maxWidth: '380px',
 padding: '36px 28px',
 textAlign: 'center',
 color: 'white',
 boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)'
 }}>
 <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.2)', border: '2px solid #3b82f6', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2.4rem' }}>
 <HiOutlinePhone />
 </div>

 <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#94a3b8', padding: '3px 10px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Encrypted Voice Call
 </span>

 <h3 style={{ margin: '12px 0 4px 0', fontSize: '1.4rem', fontWeight: 900 }}>
 {activeBooking?.workerName || 'Rajesh Kumar'}
 </h3>
 <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
 Masked Number: +91 ••••• 43210
 </p>

 <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace', marginBottom: '28px' }}>
 {Math.floor(callTimer / 60).toString().padStart(2, '0')}:{(callTimer % 60).toString().padStart(2, '0')}
 </div>

 {/* Call Controls */}
 <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '28px' }}>
 <button
 onClick={() => setIsMuted(!isMuted)}
 style={{
 width: '50px', height: '50px', borderRadius: '50%',
 background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.1)',
 border: 'none', color: 'white', fontSize: '1.2rem',
 cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
 }}
 title={isMuted ? 'Unmute' : 'Mute'}
 >
 <HiOutlineMicrophone />
 </button>
 <button
 onClick={() => setIsSpeaker(!isSpeaker)}
 style={{
 width: '50px', height: '50px', borderRadius: '50%',
 background: isSpeaker ? '#2563eb' : 'rgba(255,255,255,0.1)',
 border: 'none', color: 'white', fontSize: '1.2rem',
 cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
 }}
 title={isSpeaker ? 'Speaker On' : 'Speaker Off'}
 >
 <HiOutlineSpeakerWave />
 </button>
 </div>

 <button
 onClick={() => setIsCallingPartner(false)}
 style={{
 background: '#dc2626', color: 'white', border: 'none',
 padding: '12px 32px', borderRadius: '30px', fontSize: '0.95rem',
 fontWeight: 800, cursor: 'pointer', width: '100%',
 boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
 }}
 >
 End Call
 </button>
 </div>
 </div>
 )}

 {/* ========================================================= */}
 {/* MODAL 6: DELETE APPLIANCE CONFIRMATION MODAL */}
 {/* ========================================================= */}
 {deleteCandidate && (
 <div style={{
 position: 'fixed',
 top: 0, left: 0, width: '100vw', height: '100vh',
 background: 'rgba(15, 23, 42, 0.6)',
 backdropFilter: 'blur(8px)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 zIndex: 99999, padding: '20px'
 }} onClick={() => setDeleteCandidate(null)}>
 <div style={{
 background: 'white',
 borderRadius: '20px',
 width: '100%', maxWidth: '420px',
 padding: '28px',
 textAlign: 'center',
 boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)'
 }} onClick={(e) => e.stopPropagation()}>
 <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.8rem' }}>
 <HiOutlineTrash />
 </div>
 <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 900, color: 'var(--navy-900)' }}>
 Remove Appliance?
 </h3>
 <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
 Are you sure you want to remove <strong>{deleteCandidate.name}</strong> from your Digital Warranty Vault? This will recalculate your Home Health score.
 </p>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button className="btn btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => setDeleteCandidate(null)}>
 Cancel
 </button>
 <button className="btn btn-danger" style={{ flex: 1, padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 800 }} onClick={handleConfirmDelete}>
 Yes, Remove
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================= */}
 {/* MODAL 7: RESET TIMELINE CONFIRMATION MODAL */}
 {/* ========================================================= */}
 {showResetConfirmModal && (
 <div style={{
 position: 'fixed',
 top: 0, left: 0, width: '100vw', height: '100vh',
 background: 'rgba(15, 23, 42, 0.6)',
 backdropFilter: 'blur(8px)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 zIndex: 99999, padding: '20px'
 }} onClick={() => setShowResetConfirmModal(false)}>
 <div style={{
 background: 'white',
 borderRadius: '20px',
 width: '100%', maxWidth: '420px',
 padding: '28px',
 textAlign: 'center',
 boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)'
 }} onClick={(e) => e.stopPropagation()}>
 <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.8rem' }}>
 <HiOutlineArrowPath />
 </div>
 <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 900, color: 'var(--navy-900)' }}>
 Reset Maintenance Timeline?
 </h3>
 <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
 This will restore all default maintenance schedules and compliance checklist tasks.
 </p>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button className="btn btn-outline" style={{ flex: 1, padding: '10px' }} onClick={() => setShowResetConfirmModal(false)}>
 Cancel
 </button>
 <button className="btn btn-primary" style={{ flex: 1, padding: '10px', fontWeight: 800 }} onClick={handleResetTimeline}>
 Confirm Reset
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
};

export default MyHomeDashboard;
