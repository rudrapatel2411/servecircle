import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineCalendarDays, HiOutlineClock, HiOutlineMapPin,
  HiOutlineWrench, HiOutlineArrowLeft,
  HiOutlineCreditCard, HiOutlineWallet, HiOutlineBanknotes,
  HiOutlineDevicePhoneMobile, HiCheckCircle, HiOutlineShieldCheck,
  HiOutlineLockClosed, HiOutlinePrinter, HiOutlineCheck,
  HiOutlineDocumentText, HiOutlineArrowPath, HiOutlinePhone,
  HiOutlineChatBubbleLeftRight, HiOutlineClipboardDocumentCheck,
  HiOutlineStar, HiOutlineSparkles, HiOutlineCheckBadge
} from 'react-icons/hi2';
import { mockWorkersForService } from './WorkerComparison';
import { getSession, saveSession, requestApi } from '../../utils/authSession.js';
import { servicesRegistry } from '../../data/servicesRegistry';
import { socket } from '../../socket';
import { broadcastNotificationToTabs } from '../../utils/notificationSync';
import '../Dashboard.css';
import './CustomerPages.css';

const AVAILABLE_COUPONS = [
  { code: 'WELCOME50', discount: 50, type: 'FLAT', minAmount: 299, desc: 'Flat ₹50 off on your first booking' },
  { code: 'SUMMER20', discount: 20, type: 'PERCENT', maxDiscount: 150, minAmount: 499, desc: '20% off up to ₹150 for summer services' },
  { code: 'SERVE100', discount: 100, type: 'FLAT', minAmount: 999, desc: 'Flat ₹100 off on premium services' },
  { code: 'SAVE10', discount: 10, type: 'PERCENT', maxDiscount: 100, minAmount: 199, desc: '10% off up to ₹100' }
];

export const CATEGORY_DISPLAY_MAP = {
  'home-repairs': 'Home Repairs',
  'vehicle-services': 'Vehicle Services',
  'cleaning': 'Cleaning & Hygiene',
  'events': 'Events & Celebrations',
  'home-it': 'Home IT & Tech Support',
  'care-family': 'Care & Family',
  'utility-daily': 'Utility & Daily Services',
  'learning-support': 'Learning & Support',
  'property-services': 'Property Services',
  'festive-seasonal': 'Festive & Seasonal',
  'furniture-decor': 'Furniture & Decor',
  'garden-outdoor': 'Garden & Outdoor',
  'relocation': 'Relocation & Packers',
  'health-wellness': 'Health & Wellness',
  'kids-elderly': 'Kids & Elderly Care',
  'pet-services': 'Pet Services',
  'food-kitchen': 'Food & Kitchen',
  'travel-commute': 'Travel & Commute',
  'society-management': 'Society Management',
  'emergency': 'Emergency Services',
};

export function inferCategoryFromService(serviceName = '', serviceId = '', rawCategory = '') {
  if (rawCategory && CATEGORY_DISPLAY_MAP[rawCategory.toLowerCase()]) {
    return CATEGORY_DISPLAY_MAP[rawCategory.toLowerCase()];
  }
  if (rawCategory && Object.values(CATEGORY_DISPLAY_MAP).includes(rawCategory)) {
    return rawCategory;
  }

  const match = servicesRegistry.find(s => s.id === serviceId);
  if (match && CATEGORY_DISPLAY_MAP[match.category]) {
    return CATEGORY_DISPLAY_MAP[match.category];
  }

  const s = `${serviceName} ${serviceId}`.toLowerCase();
  if (s.includes('pet') || s.includes('dog') || s.includes('cat') || s.includes('vet') || s.includes('grooming')) return 'Pet Services';
  if (s.includes('food') || s.includes('chef') || s.includes('tiffin') || s.includes('meal') || s.includes('cake') || s.includes('kitchen')) return 'Food & Kitchen';
  if (s.includes('travel') || s.includes('cab') || s.includes('driver') || s.includes('airport') || s.includes('chauffeur')) return 'Travel & Commute';
  if (s.includes('society') || s.includes('rwa') || s.includes('gate') || s.includes('security')) return 'Society Management';
  if (s.includes('shift') || s.includes('pack') || s.includes('transit') || s.includes('relocation') || s.includes('storage') || s.includes('vault')) return 'Relocation & Packers';
  if (s.includes('health') || s.includes('wellness') || s.includes('doctor') || s.includes('physio') || s.includes('nurse') || s.includes('lab') || s.includes('consultation')) return 'Health & Wellness';
  if (s.includes('event') || s.includes('party') || s.includes('wedding') || s.includes('celebration') || s.includes('birthday') || s.includes('decor') || s.includes('catering') || s.includes('dj')) return 'Events & Celebrations';
  if (s.includes('clean') || s.includes('hygiene') || s.includes('pest') || s.includes('sofa') || s.includes('carpet')) return 'Cleaning & Hygiene';
  if (s.includes('car') || s.includes('bike') || s.includes('vehicle') || s.includes('puncture') || s.includes('battery')) return 'Vehicle Services';
  if (s.includes('furniture') || s.includes('decor') || s.includes('wallpaper') || s.includes('curtain')) return 'Furniture & Decor';
  if (s.includes('garden') || s.includes('lawn') || s.includes('plant') || s.includes('outdoor')) return 'Garden & Outdoor';
  if (s.includes('child') || s.includes('kid') || s.includes('elder') || s.includes('nanny') || s.includes('babysitting')) return 'Kids & Elderly Care';
  if (s.includes('it') || s.includes('wifi') || s.includes('cctv') || s.includes('computer') || s.includes('tv') || s.includes('printer')) return 'Home IT & Tech Support';

  return rawCategory ? (CATEGORY_DISPLAY_MAP[rawCategory] || rawCategory) : 'Home Repairs';
}

const BookingFlow = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize from URL params if available
  const initialService = searchParams.get('service') || 'AC General Service';
  const initialServiceId = searchParams.get('serviceId') || '';
  const initialCategoryParam = searchParams.get('category') || '';
  const resolvedCategory = inferCategoryFromService(initialService, initialServiceId, initialCategoryParam);
  const matchedService = servicesRegistry.find(s => s.id === initialServiceId || s.id === initialService?.toLowerCase()?.replace(/\s+/g, '-'));
  const resolvedServiceId = initialServiceId || matchedService?.id || undefined;
  const priceParam = searchParams.get('price');
  const initialBasePrice = priceParam !== null && !isNaN(parseInt(priceParam)) ? parseInt(priceParam) : (matchedService?.basePrice || 499);
  const initialDate = searchParams.get('date') || '';
  const initialTime = searchParams.get('slot') || '';
  const initialTier = searchParams.get('tier') || 'standard';
  const isExpressMode = searchParams.get('expressMode') === 'true';

  const isSellingService = initialService.toLowerCase().includes('junk') || initialService.toLowerCase().includes('scrap');

  // Auto-select worker based on tier if service exists
  const workers = mockWorkersForService(initialService, initialBasePrice);
  const defaultWorker = initialTier === 'premium' ? workers[2] : workers[0];

  const [selectedWorker, setSelectedWorker] = useState(defaultWorker);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [toastMessage, setToastMessage] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [editSchedule, setEditSchedule] = useState(false);

  // States for payment processing flows
  const [activePaymentModal, setActivePaymentModal] = useState(null); // 'UPI', 'Card', 'Wallet', or null
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [modalError, setModalError] = useState('');

  // Post-payment success confirmation state
  const [bookingConfirmedData, setBookingConfirmedData] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Real payment interactive states - Pre-filled dummy values for smooth testing
  const [walletBalance, setWalletBalance] = useState(2450);
  const [cardName, setCardName] = useState('Rudra Patel');
  const [cardNumber, setCardNumber] = useState('4321 8765 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  const [upiMethod, setUpiMethod] = useState('APPS'); // 'APPS', 'QR' or 'ID'
  const [upiId, setUpiId] = useState('rudra@okaxis');
  const [upiStep, setUpiStep] = useState(1);
  const [upiCountdown, setUpiCountdown] = useState(15);
  const [selectedApp, setSelectedApp] = useState(null);

  // New Expert Features
  const [useWallet, setUseWallet] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [silentMode, setSilentMode] = useState(false);
  const [voiceNoteRecorded, setVoiceNoteRecorded] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [formData, setFormData] = useState({
    service: initialService,
    category: resolvedCategory,
    price: Math.round(initialBasePrice * (defaultWorker?.rateMultiplier || 1)),
    date: (initialDate && initialDate !== 'Today') ? initialDate : new Date().toISOString().split('T')[0],
    time: initialTime || '11:30',
    address: 'Flat 402, Sunshine Apartments',
    landmark: 'Near SG Highway',
    city: 'Ahmedabad',
    notes: '',
  });

  const [isLocating, setIsLocating] = useState(false);

  const handleAutoGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsLocating(true);
    showToast('Fetching your live location...');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.state_district || addr.county || 'Ahmedabad';
            
            const rawSegments = data.display_name.split(',').map(s => s.trim());
            const cleanSegments = rawSegments.filter((seg, index) => {
              if (rawSegments.indexOf(seg) !== index) return false;
              if (seg.toLowerCase() === city.toLowerCase()) return false;
              if (seg === 'India') return false;
              return true;
            });
            
            setFormData(prev => ({
              ...prev,
              address: cleanSegments.join(', '),
              city: city
            }));
            showToast('Live location auto-filled successfully.');
          } else {
            showToast('Could not determine address from location.');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          showToast('Failed to fetch address details.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        showToast('Failed to get location. Please enable GPS permissions.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isExpressMode) {
      setFormData(prev => ({
        ...prev, 
        date: 'Today', 
        time: 'In 30 mins (Express)',
        address: prev.address || '',
        city: prev.city || ''
      }));
    }
  }, []);

  const getBookingDateLabel = (dateStr) => {
    if (dateStr === 'Today') return t('bookingFlow.today', 'Today');
    if (dateStr === 'Tomorrow') return t('bookingFlow.tomorrow', 'Tomorrow');
    if (dateStr === 'Day after tomorrow') return t('bookingFlow.dayAfterTomorrow', 'Day after tomorrow');
    return dateStr;
  };

  const workerName = selectedWorker ? t('workers.' + selectedWorker.id + '.name', selectedWorker.name) : t('workers.w1.name', 'Rajesh Kumar');
  const tier = initialTier === 'premium' ? t('bookingFlow.tierPremiumPro', 'Premium Pro') : t('bookingFlow.tierStandard', 'Standard');
  const price = formData.price;
  
  // Financial Calculations
  const subtotal = price;
  const gst = Math.round(subtotal * 0.18);
  const trustSafetyFee = price > 0 ? 49 : 0;
  
  let discountAmount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minAmount) {
    if (appliedCoupon.type === 'FLAT') {
      discountAmount = appliedCoupon.discount;
    } else if (appliedCoupon.type === 'PERCENT') {
      discountAmount = Math.round((subtotal * appliedCoupon.discount) / 100);
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    }
  }
  
  const amountBeforeWallet = Math.max(0, subtotal + gst + trustSafetyFee - discountAmount);
  const walletDiscount = useWallet ? Math.min(walletBalance, amountBeforeWallet) : 0;
  const totalAmount = amountBeforeWallet - walletDiscount;

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;
    
    const found = AVAILABLE_COUPONS.find(c => c.code === code);
    if (!found) {
      showToast('Invalid coupon code!');
      return;
    }
    if (price < found.minAmount) {
      showToast(`This coupon requires a minimum booking of ₹${found.minAmount}`);
      return;
    }
    
    setAppliedCoupon(found);
    setCouponCode(found.code);
    setShowCoupons(false);
    showToast(`Coupon ${found.code} applied successfully!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    showToast('Coupon removed.');
  };

  // UPI Request Approval timer loop
  useEffect(() => {
    let timer;
    if (activePaymentModal === 'UPI' && upiStep === 2 && upiCountdown > 0) {
      timer = setTimeout(() => {
        setUpiCountdown(prev => prev - 1);
      }, 1000);
    } else if (activePaymentModal === 'UPI' && upiStep === 2 && upiCountdown === 0) {
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        setActivePaymentModal(null);
        handleBook('UPI');
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [upiStep, upiCountdown, activePaymentModal]);

  const handleCardNumberChange = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    const matches = clean.match(/\d{1,4}/g);
    setCardNumber(matches ? matches.join(' ') : clean);
  };

  const handleExpiryChange = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    if (clean.length > 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  const handleCvvChange = (value) => {
    setCardCvv(value.replace(/\D/g, '').slice(0, 3));
  };

  const handleConfirmBooking = () => {
    if (!formData.service || !selectedWorker) {
      showToast(t('bookingFlow.selectProfessionalAlert', 'Please select a professional to continue.'));
      return;
    }
    if (!formData.date || !formData.time) {
      showToast(t('bookingFlow.selectDateTimeAlert', 'Please select both Date and Time.'));
      return;
    }
    if (!formData.address || formData.address.length < 5 || !formData.city) {
      showToast(t('bookingFlow.provideAddressAlert', 'Please provide a complete Flat/House No. and City to continue.'));
      return;
    }

    if (price === 0 || isSellingService || paymentMethod === 'Cash') {
      showToast('Placing order with Cash on Delivery...');
      handleBook('Cash');
    } else if (paymentMethod === 'UPI') {
      setModalError('');
      setUpiStep(1);
      setUpiCountdown(4);
      setActivePaymentModal('UPI');
    } else {
      setModalError('');
      setActivePaymentModal(paymentMethod);
    }
  };

  const executePayment = () => {
    setModalError('');
    if (activePaymentModal === 'Card') {
      if (!cardName.trim()) {
        setModalError('Please enter cardholder name.');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setModalError('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length !== 5) {
        setModalError('Please enter expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length !== 3) {
        setModalError('Please enter 3-digit CVV.');
        return;
      }

      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        setActivePaymentModal(null);
        handleBook('Card');
      }, 1000);
      return;
    }

    if (activePaymentModal === 'UPI') {
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        setActivePaymentModal(null);
        handleBook('UPI');
      }, 800);
      return;
    }

    if (activePaymentModal === 'Wallet') {
      if (walletBalance < totalAmount) {
        setModalError('Insufficient wallet balance! Please select cash or another method.');
        return;
      }
      setWalletBalance(prev => prev - totalAmount);
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        setActivePaymentModal(null);
        handleBook('Wallet');
      }, 800);
    }
  };

  const handleBook = async (confirmedMethod) => {
    const finalMethod = confirmedMethod || paymentMethod || 'Cash';
    let session = getSession();

    // Auto-fallback guest customer session so user is NEVER booted to /login
    if (!session?.token) {
      session = {
        token: 'demo-token-customer',
        user: {
          id: '6a5f4c90437c4810f45fe0e9',
          _id: '6a5f4c90437c4810f45fe0e9',
          name: 'Rudra Shah',
          email: 'rudra@test.com',
          role: 'customer',
          walletBalance: 2450,
        },
      };
      saveSession(session);
    }

    setIsCreatingBooking(true);

    const finalCategory = CATEGORY_DISPLAY_MAP[formData.category?.toLowerCase()] || formData.category || 'Home Repairs';
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const fallbackBookingId = `SC-${randomSuffix}`;
    const fallbackOtp = String(Math.floor(1000 + Math.random() * 9000));
    const txnId = 'TXN_' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    let serverBooking = null;
    try {
      serverBooking = await requestApi('/bookings', {
        method: 'POST',
        token: session.token,
        body: {
          service: formData.service,
          serviceId: initialServiceId || resolvedServiceId || undefined,
          category: finalCategory,
          description: [formData.landmark, specialInstructions].filter(Boolean).join(' | '),
          scheduledDate: formData.date === 'Today' ? new Date().toISOString() : formData.date,
          scheduledTime: formData.time,
          address: formData.address,
          city: formData.city,
          amount: Math.max(0, totalAmount ?? price ?? 299),
          paymentMethod: finalMethod,
          isEmergency: isExpressMode,
        },
      });
    } catch (bookingError) {
      console.warn('Backend booking API notice:', bookingError.message);
    }

    const confirmedId = serverBooking?.bookingId || serverBooking?._id || fallbackBookingId;
    const finalStartOtp = serverBooking?.startOtp || fallbackOtp;

    const confirmedPayload = {
      id: confirmedId,
      bookingId: confirmedId,
      service: formData.service,
      category: finalCategory,
      date: formData.date,
      time: formData.time,
      address: formData.address,
      landmark: formData.landmark,
      city: formData.city,
      amount: Math.max(0, totalAmount ?? price ?? 299),
      subtotal: subtotal,
      gst: gst,
      trustSafetyFee: trustSafetyFee,
      discountAmount: discountAmount,
      appliedCoupon: appliedCoupon?.code || null,
      paymentMethod: finalMethod,
      paymentStatus: finalMethod === 'Cash' ? 'Pay upon completion' : 'Paid Online (Verified)',
      transactionId: txnId,
      startOtp: finalStartOtp,
      worker: selectedWorker || defaultWorker || { name: 'Rajesh Kumar', rating: 4.9, experience: '8 Years' },
      workerName: selectedWorker?.name || workerName || 'Rajesh Kumar',
      tier: tier,
      isEmergency: isExpressMode,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage for persistence across sessions, My Bookings, and Live Tracking
    try {
      const existing = JSON.parse(localStorage.getItem('servecircle_customer_bookings') || '[]');
      const updated = [confirmedPayload, ...existing.filter(b => b.id !== confirmedPayload.id)];
      localStorage.setItem('servecircle_customer_bookings', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save booking to localStorage:', e);
    }

    // Emit live socket event if connected — server re-broadcasts to admin + workers + customer
    try {
      const session = getSession();
      socket.emit('new_booking_created', {
        ...confirmedPayload,
        customerId: session?.user?._id || session?.user?.id || '6a5f4c90437c4810f45fe0e9',
      });
    } catch {}

    // Broadcast cross-tab for instant alert on Admin and other panels
    try {
      broadcastNotificationToTabs({
        id: `notif_bk_${Date.now()}`,
        title: '📋 New Booking Received',
        message: `Booking ${confirmedPayload.bookingId} for "${confirmedPayload.service}" — ₹${confirmedPayload.amount}. City: ${confirmedPayload.city || ''}`,
        type: 'alert',
        targetAudience: 'admin',
        bookingId: confirmedPayload.bookingId,
        service: confirmedPayload.service,
        amount: confirmedPayload.amount,
      });
    } catch {}

    setIsCreatingBooking(false);
    setActivePaymentModal(null);
    setBookingConfirmedData(confirmedPayload);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyBookingId = () => {
    if (bookingConfirmedData?.id) {
      navigator.clipboard.writeText(bookingConfirmedData.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // ═════════════════════════════════════════════════════════════════════════════════
  // POST-PAYMENT CONFIRMATION DASHBOARD SCREEN
  // ═════════════════════════════════════════════════════════════════════════════════
  if (bookingConfirmedData) {
    return (
      <div className="page-content" style={{ minHeight: '90vh', padding: '24px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Top Celebration Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: '20px',
          padding: '32px 24px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(5, 150, 105, 0.25)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', borderRadius: '50%'
          }}></div>

          <div style={{
            width: '68px', height: '68px', borderRadius: '50%', background: 'white', color: '#059669',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem',
            marginBottom: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          }}>
            <HiOutlineCheckBadge />
          </div>

          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            {bookingConfirmedData.paymentStatus}
          </span>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Booking Confirmed & Payment Received!
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.95, maxWidth: '560px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
            Thank you! Your order has been placed. Your service expert has been dispatched with ServeCircle Safety Guarantee.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '8px 16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>Booking Ref:</span>
            <strong style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>{bookingConfirmedData.id}</strong>
            <button
              onClick={copyBookingId}
              style={{ background: 'white', color: '#047857', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', marginLeft: '6px' }}
            >
              {copiedId ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* 3 Grid Summary Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Card 1: Start OTP Box (Crucial ServeCircle Protocol) */}
          <div className="card" style={{
            background: '#ffffff', borderRadius: '16px', padding: '24px', border: '2px solid #3b82f6',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineLockClosed /> Service Verification OTP
                </span>
                <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  High Security
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Share this 4-digit OTP with your service expert <strong>ONLY after they arrive</strong> at your door to begin work.
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '12px', padding: '16px',
                textAlign: 'center', border: '1px dashed #3b82f6'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700, display: 'block', marginBottom: '4px' }}>START OTP</span>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '8px' }}>
                  {bookingConfirmedData.startOtp}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontWeight: 600 }}>
              <HiOutlineShieldCheck style={{ fontSize: '1.1rem' }} /> Ensures 100% genuine verified worker check-in.
            </div>
          </div>

          {/* Card 2: Assigned Professional Profile */}
          <div className="card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>
              Assigned Professional
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', background: '#1e40af', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 800, flexShrink: 0
              }}>
                {bookingConfirmedData.worker?.avatar ? (
                  <img src={bookingConfirmedData.worker.avatar} alt="Worker" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  (bookingConfirmedData.workerName || 'RK').split(' ').map(n=>n[0]).join('').slice(0,2)
                )}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {bookingConfirmedData.workerName}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <HiOutlineStar /> {bookingConfirmedData.worker?.rating || '4.9'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {bookingConfirmedData.worker?.completedJobs || 1200}+ jobs done
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '0.75rem', color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              Status: <strong>Dispatched & Preparing Tools (ETA: ~25 mins)</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                className="btn btn-outline"
                onClick={() => alert(`Call connected to ${bookingConfirmedData.workerName}. Phone masking keeps your mobile number private.`)}
                style={{ padding: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <HiOutlinePhone /> Call
              </button>
              <button
                className="btn btn-outline"
                onClick={() => alert(`Direct chat initiated with ${bookingConfirmedData.workerName}.`)}
                style={{ padding: '8px', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <HiOutlineChatBubbleLeftRight /> Chat
              </button>
            </div>
          </div>

          {/* Card 3: Appointment & Address */}
          <div className="card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>
              Schedule & Location
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <HiOutlineWrench style={{ color: '#2563eb', fontSize: '1.2rem', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Service</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{bookingConfirmedData.service}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <HiOutlineCalendarDays style={{ color: '#2563eb', fontSize: '1.2rem', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Slot</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                    {getBookingDateLabel(bookingConfirmedData.date)} at {bookingConfirmedData.time}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <HiOutlineMapPin style={{ color: '#2563eb', fontSize: '1.2rem', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Service Address</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: 1.4 }}>
                    {bookingConfirmedData.address}, {bookingConfirmedData.city}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Receipt & Breakdown */}
        <div className="card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '28px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Payment & Billing Summary
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Txn Ref: <strong>{bookingConfirmedData.transactionId}</strong> • Mode: {bookingConfirmedData.paymentMethod}
              </span>
            </div>
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <HiOutlinePrinter /> View & Print Tax Invoice
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Base Service Fee</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>₹{bookingConfirmedData.subtotal}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>GST (18% Included)</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>₹{bookingConfirmedData.gst}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Safety Guarantee & Protection</span>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>₹{bookingConfirmedData.trustSafetyFee}</strong>
            </div>
            {bookingConfirmedData.discountAmount > 0 && (
              <div>
                <span style={{ fontSize: '0.72rem', color: '#059669', display: 'block' }}>Coupon Discount ({bookingConfirmedData.appliedCoupon})</span>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>-₹{bookingConfirmedData.discountAmount}</strong>
              </div>
            )}
            <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: '#1e40af', display: 'block', fontWeight: 700 }}>Total Amount Paid</span>
              <strong style={{ fontSize: '1.2rem', color: '#1e3a8a' }}>₹{bookingConfirmedData.amount}</strong>
            </div>
          </div>
        </div>

        {/* Action Hub - What process to do next */}
        <div style={{
          background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            What would you like to do next?
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px 0' }}>
            Choose an action to monitor your service or explore ServeCircle.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Primary CTA: Track Live */}
            <Link
              to={`/customer/live-tracking?bookingId=${encodeURIComponent(bookingConfirmedData.id)}&service=${encodeURIComponent(bookingConfirmedData.service)}&worker=${encodeURIComponent(bookingConfirmedData.workerName)}&price=${bookingConfirmedData.amount}`}
              className="btn btn-primary btn-lg"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '14px 20px', fontSize: '0.95rem', fontWeight: 800, textDecoration: 'none',
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              <HiOutlineMapPin style={{ fontSize: '1.2rem' }} /> Track Professional Live
            </Link>

            {/* My Bookings */}
            <Link
              to="/customer/bookings"
              className="btn btn-outline btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 20px', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <HiOutlineClipboardDocumentCheck style={{ fontSize: '1.2rem' }} /> View in My Bookings
            </Link>

            {/* Active Orders */}
            <Link
              to="/customer/ordered-services"
              className="btn btn-outline btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 20px', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <HiOutlineWrench style={{ fontSize: '1.2rem' }} /> Active Orders Dashboard
            </Link>

            {/* Back to Customer Home */}
            <Link
              to="/customer"
              className="btn btn-outline btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 20px', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}
            >
              🏠 Return to Home
            </Link>
          </div>
        </div>

        {/* Printable Tax Invoice Modal */}
        {isInvoiceModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div style={{
              background: 'white', borderRadius: '16px', maxWidth: '580px', width: '100%',
              padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#1e40af', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>SC</div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 900 }}>ServeCircle Technologies</h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Tax Invoice & Service Bill</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>GSTIN: 24AAECS9281A1Z8</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>Invoice #{bookingConfirmedData.id}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {new Date(bookingConfirmedData.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div style={{ marginBottom: '20px', fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
                <span style={{ color: '#64748b', display: 'block', fontWeight: 700 }}>BILLED TO:</span>
                <strong>Customer ({bookingConfirmedData.address}, {bookingConfirmedData.city})</strong>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>{bookingConfirmedData.service} ({bookingConfirmedData.tier})</td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>₹{bookingConfirmedData.subtotal}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>Trust & Safety Vetted Cover</td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>₹{bookingConfirmedData.trustSafetyFee}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>CGST (9%) + SGST (9%)</td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>₹{bookingConfirmedData.gst}</td>
                  </tr>
                  {bookingConfirmedData.discountAmount > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#059669' }}>
                      <td style={{ padding: '8px' }}>Coupon Applied ({bookingConfirmedData.appliedCoupon})</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>-₹{bookingConfirmedData.discountAmount}</td>
                    </tr>
                  )}
                  <tr style={{ fontWeight: 800, fontSize: '0.95rem', background: '#eff6ff' }}>
                    <td style={{ padding: '10px 8px', color: '#1e40af' }}>Total Paid</td>
                    <td style={{ textAlign: 'right', padding: '10px 8px', color: '#1e40af' }}>₹{bookingConfirmedData.amount}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem', fontWeight: 800 }}
                >
                  <HiOutlinePrinter /> Print Receipt
                </button>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════════
  // STANDARD CHECKOUT FORM
  // ═════════════════════════════════════════════════════════════════════════════════
  return (
    <div className="page-content" style={{ minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column', paddingBottom: '12px' }}>
      
      {/* Custom Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100000,
          background: 'white', borderLeft: '4px solid var(--danger, #ef4444)',
          padding: '16px 24px', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>!</div>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy-900)' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <button className="back-btn" onClick={() => navigate(-1)} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
            <HiOutlineArrowLeft /> {t('bookingFlow.back', 'Back')}
          </button>
          <h2 className="page-title" style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            {isExpressMode && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '6px', fontSize: '0.8rem' }}>Express</span>}
            {t('bookingFlow.checkout', 'Secure Checkout')}
          </h2>
        </div>
      </div>

      {/* Main Layout: Split Form and Summary */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', flex: 1 }}>
        
        {/* LEFT COLUMN: Simplified Checkout Form */}
        <div className="booking-form-card" style={{ margin: 0, padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {isExpressMode ? (
            <div className="booking-step-content animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-900)', fontWeight: 800, margin: 0 }}>
                Express Booking Details
              </h3>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.8rem', margin: 0 }}>
                We will send the nearest available professional to your address within 30 minutes.
              </p>

              {/* Address Preview */}
              <div style={{ background: 'var(--gray-50)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlineMapPin /> Service Address</h4>
                  <button 
                    className="btn btn-outline" 
                    onClick={handleAutoGPS}
                    disabled={isLocating}
                    style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'white' }}
                  >
                    {isLocating ? 'Locating...' : 'Auto GPS'}
                  </button>
                </div>
                
                <input 
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street Address / Flat No."
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', marginBottom: '8px', outline: 'none' }}
                />
                <input 
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <button 
                className="btn btn-primary animate-pulse" 
                onClick={handleConfirmBooking} 
                disabled={isCreatingBooking}
                style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 800, background: '#ef4444' }}
              >
                {isCreatingBooking ? 'Confirming Express Booking...' : 'Confirm 1-Click Booking'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
              
              {/* Service Header Info */}
              <div style={{ padding: '12px 16px', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', flexShrink: 0 }}>
                {formData.service ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--primary-600)', fontWeight: 700, textTransform: 'uppercase' }}>Booking Details for</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: 'var(--navy-800)', margin: '2px 0 0 0' }}>{t(formData.service)}</h4>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-700)', background: 'var(--primary-100)', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                      {tier}
                    </span>
                  </div>
                ) : (
                  <p style={{ color: 'var(--gray-500)', fontStyle: 'italic', margin: 0, fontSize: '0.8rem' }}>{t('bookingFlow.noServiceSelected', 'No service selected.')}</p>
                )}
              </div>

              {/* Section 1: Schedule */}
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
                  {t('bookingFlow.chooseDateTime', 'Schedule')}
                </h3>
                
                {!editSchedule && formData.date && formData.time ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HiOutlineCalendarDays style={{ color: 'var(--primary-500)', fontSize: '1.1rem' }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--navy-800)' }}>
                        {getBookingDateLabel(formData.date)} at {formData.time}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setEditSchedule(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Date</label>
                      <input 
                        type="date"
                        value={formData.date} 
                        onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--gray-300)', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Time Slot</label>
                      <select 
                        value={formData.time} 
                        onChange={(e) => {
                          setFormData(prev => ({...prev, time: e.target.value}));
                          setEditSchedule(false);
                        }}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--gray-300)', fontSize: '0.8rem' }}
                      >
                        <option value="09:00">09:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="16:30">04:30 PM</option>
                        <option value="18:30">06:30 PM</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Address */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
                    {t('bookingFlow.serviceAddress', 'Service Location')}
                  </h3>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={handleAutoGPS}
                    disabled={isLocating}
                    style={{ padding: '2px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}
                  >
                    <HiOutlineMapPin /> {isLocating ? 'Locating...' : 'Auto GPS'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="House / Flat No., Society, Landmark"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-300)', fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-300)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Section 3: Payment Method Options */}
              <div style={{ flexShrink: 0 }}>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
                  Payment Method
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'UPI', label: 'UPI Instant', icon: <HiOutlineDevicePhoneMobile /> },
                    { id: 'Card', label: 'Debit / Card', icon: <HiOutlineCreditCard /> },
                    { id: 'Wallet', label: 'Wallet (₹2.4k)', icon: <HiOutlineWallet /> },
                    { id: 'Cash', label: 'Cash on Arrival', icon: <HiOutlineBanknotes /> },
                  ].map(m => (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${paymentMethod === m.id ? 'var(--primary-600)' : 'var(--gray-200)'}`,
                        background: paymentMethod === m.id ? 'var(--primary-50)' : 'white',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', color: paymentMethod === m.id ? 'var(--primary-700)' : 'var(--gray-500)', marginBottom: '4px' }}>
                        {m.icon}
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: paymentMethod === m.id ? 'var(--primary-900)' : 'var(--gray-700)', display: 'block' }}>
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Bill Summary & Checkout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '14px' }}>
              Price Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)' }}>
                <span>Item Total</span>
                <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)' }}>
                <span>Taxes & GST (18%)</span>
                <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{gst}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)' }}>
                <span>Trust & Safety Fee</span>
                <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{trustSafetyFee}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed var(--gray-300)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                <span>To Pay</span>
                <span style={{ color: 'var(--primary-700)' }}>₹{totalAmount}</span>
              </div>
            </div>

            {/* Coupons Section */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--gray-100)' }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', padding: '8px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>Coupon '{appliedCoupon.code}' Applied!</span>
                  <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#b91c1c', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. WELCOME50)"
                    style={{ flex: 1, padding: '8px 10px', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid var(--gray-300)', textTransform: 'uppercase' }}
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    className="btn btn-outline"
                    style={{ padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Confirm & Pay CTA */}
            <button
              className="btn btn-primary btn-lg"
              onClick={handleConfirmBooking}
              disabled={isCreatingBooking}
              style={{
                width: '100%', marginTop: '18px', padding: '14px', fontSize: '1rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              {isCreatingBooking ? 'Confirming & Securing Booking...' : `Confirm & Pay ₹${totalAmount}`}
            </button>

            <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <HiOutlineShieldCheck style={{ color: '#059669', fontSize: '1rem' }} /> 100% Satisfaction or Free Re-work Guarantee
            </div>
          </div>

        </div>

      </div>

      {/* Payment Processing Modal Overlays */}
      {activePaymentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="card animate-scale-up" style={{
            width: '100%', maxWidth: '400px', background: 'white', padding: '24px',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-900)', fontWeight: 800, margin: 0 }}>
                {activePaymentModal === 'UPI' && 'UPI Instant Payment'}
                {activePaymentModal === 'Card' && 'Debit / Credit Card Payment'}
                {activePaymentModal === 'Wallet' && 'ServeCircle Wallet Payment'}
              </h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px' }}>
                Secure Payment
              </span>
            </div>

            {modalError && (
              <div style={{ color: 'var(--danger, #ef4444)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', background: '#fee2e2', padding: '8px 12px', borderRadius: '6px' }}>
                {modalError}
              </div>
            )}

            {/* UPI Modal Content */}
            {activePaymentModal === 'UPI' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b21a8', fontWeight: 700 }}>Total Payable</span>
                  <span style={{ fontSize: '1.1rem', color: '#581c87', fontWeight: 900 }}>₹{totalAmount}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', color: '#334155' }}>
                    VPA: <strong>{upiId}</strong>
                  </span>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={() => executePayment()}
                  disabled={isProcessingPayment}
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isProcessingPayment ? 'Processing Payment...' : `Pay ₹${totalAmount} via UPI`}
                </button>
              </div>
            )}

            {/* Card Modal Content */}
            {activePaymentModal === 'Card' && (
              <div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 700 }}>Total Payable</span>
                  <span style={{ fontSize: '1.1rem', color: '#1e3a8a', fontWeight: 900 }}>₹{totalAmount}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>Cardholder Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    />
                  </div>
                  
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>Card Number</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>Expiry Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>CVV</label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="***"
                        value={cardCvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={() => executePayment()}
                  disabled={isProcessingPayment}
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isProcessingPayment ? 'Processing Card...' : `Pay ₹${totalAmount}`}
                </button>
              </div>
            )}

            {/* Wallet Modal Content */}
            {activePaymentModal === 'Wallet' && (
              <div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--gray-200)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--gray-600)' }}>Current Balance:</span>
                    <span style={{ fontWeight: 800, color: 'var(--navy-800)' }}>₹{walletBalance.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--gray-600)' }}>Booking Cost:</span>
                    <span style={{ fontWeight: 800, color: 'var(--danger-700)' }}>- ₹{totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--gray-300)', fontSize: '0.85rem', fontWeight: 800 }}>
                    <span style={{ color: 'var(--navy-800)' }}>Remaining Balance:</span>
                    <span style={{ color: walletBalance >= totalAmount ? 'var(--primary-700)' : 'var(--danger-600)' }}>
                      ₹{(walletBalance - totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={() => executePayment()}
                  disabled={isProcessingPayment || walletBalance < totalAmount}
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isProcessingPayment ? 'Deducting...' : `Deduct & Pay ₹${totalAmount}`}
                </button>
              </div>
            )}

            <div style={{ marginTop: '12px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setActivePaymentModal(null)}
                style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                disabled={isProcessingPayment}
              >
                Close / Choose Different Method
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingFlow;
