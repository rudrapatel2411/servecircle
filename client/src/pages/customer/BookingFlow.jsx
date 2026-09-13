import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendarDays, HiOutlineClock, HiOutlineMapPin,
  HiOutlineWrench, HiOutlineArrowLeft,
  HiOutlineCreditCard, HiOutlineWallet, HiOutlineBanknotes, HiOutlineDevicePhoneMobile, HiCheckCircle, HiOutlineShieldCheck
} from 'react-icons/hi2';
import { mockWorkersForService } from './WorkerComparison';
import { getSession, requestApi } from '../../utils/authSession.js';
import { servicesRegistry } from '../../data/servicesRegistry';
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

  // Initialize from URL params if available - fallbacks to mock service details to prevent validation lockouts
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
  const defaultWorker = initialTier === 'premium' ? workers[2] : workers[0]; // Assuming w3 is premium

  const [selectedWorker, setSelectedWorker] = useState(defaultWorker);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [toastMessage, setToastMessage] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  
  // Default to collapsed schedule card for a scroll-free layout
  const [editSchedule, setEditSchedule] = useState(false);

  // States for payment processing flows
  const [activePaymentModal, setActivePaymentModal] = useState(null); // 'UPI', 'Card', 'Wallet', or null
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [modalError, setModalError] = useState('');

  // Real payment interactive states - Pre-filled with realistic dummy values for smooth validation and testing
  const [walletBalance, setWalletBalance] = useState(2450);
  
  const [cardName, setCardName] = useState('Rudra Patel');
  const [cardNumber, setCardNumber] = useState('4321 8765 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  const [upiMethod, setUpiMethod] = useState('APPS'); // 'APPS', 'QR' or 'ID'
  const [upiId, setUpiId] = useState('rudra@okaxis');
  const [upiStep, setUpiStep] = useState(1); // 1: Input/QR, 2: Waiting Approval
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

  // Pre-fill all fields with default dummy values for smooth, zero-friction testing
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
      alert("Geolocation is not supported by your browser.");
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
            
            // Clean up the address by removing duplicates, the country, and the redundant city name
            const rawSegments = data.display_name.split(',').map(s => s.trim());
            const cleanSegments = rawSegments.filter((seg, index) => {
              // 1. Remove exact duplicates
              if (rawSegments.indexOf(seg) !== index) return false;
              // 2. Remove the city name from the street address (it goes in the City field)
              if (seg.toLowerCase() === city.toLowerCase()) return false;
              // 3. Remove country as it's redundant for a local app
              if (seg === 'India') return false;
              return true;
            });
            
            setFormData(prev => ({
              ...prev,
              address: cleanSegments.join(', '),
              city: city
            }));
            showToast('🗺️ Live location auto-filled successfully!');
          } else {
            showToast('Could not determine address from location.');
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          showToast('Failed to fetch address details.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
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
        handleBook();
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

    // Cash on Delivery — instant order placement!
    if (price === 0 || isSellingService || paymentMethod === 'Cash') {
      showToast('⚡ Placing order with Cash on Delivery...');
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

  const getModalSubmitText = () => {
    if (isProcessingPayment) return '⏳ Processing...';
    if (activePaymentModal === 'UPI') {
      return '⚡ Instant Test Payment (Approve & Book)';
    }
    if (activePaymentModal === 'Card') {
      return `⚡ Pay ₹${totalAmount} (Demo Card)`;
    }
    if (activePaymentModal === 'Wallet') {
      return `Deduct & Pay ₹${totalAmount}`;
    }
    return 'Confirm & Pay';
  };

  const handleBook = async (confirmedMethod) => {
    const finalMethod = confirmedMethod || paymentMethod || 'Cash';
    const session = getSession();
    if (!session?.token) {
      navigate('/login', { replace: true, state: { from: '/customer/book' } });
      return;
    }

    setIsCreatingBooking(true);
    try {
      const finalCategory = CATEGORY_DISPLAY_MAP[formData.category?.toLowerCase()] || formData.category || 'Home Repairs';
      const booking = await requestApi('/bookings', {
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

      const bookingId = booking?._id || booking?.id;
      if (!bookingId) throw new Error('Booking was created without an ID');
      showToast('🎉 Booking confirmed successfully!');
      navigate(`/customer/live-tracking?bookingId=${encodeURIComponent(bookingId)}&service=${encodeURIComponent(formData.service)}&worker=${encodeURIComponent(workerName)}&price=${totalAmount || price}`);
    } catch (bookingError) {
      showToast(bookingError.message || 'Unable to create booking. Please try again.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <div className="page-content" style={{ minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column', paddingBottom: '12px' }}>
      
      {/* Custom Toast Notification - higher zIndex to overlap modals */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100000,
          background: 'white', borderLeft: '4px solid var(--danger, #ef4444)',
          padding: '16px 24px', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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
            {isExpressMode && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '6px', fontSize: '0.8rem' }}>⚡ Express</span>}
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
                We will send the nearest available professional to your default address within 30 minutes.
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
                    {isLocating ? '⏳' : '📍 Auto GPS'}
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
                style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 800, background: '#ef4444' }}
              >
                ⚡ Confirm 1-Click Booking
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

              {/* Section 1: Schedule (Collapsed by default to save space) */}
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
                      <input 
                        type="time"
                        value={formData.time} 
                        onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--gray-300)', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                      <button 
                        type="button" 
                        onClick={() => setEditSchedule(false)}
                        style={{ background: 'var(--primary-600)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Address (Single card format to prevent scroll) */}
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
                    {t('bookingFlow.serviceAddress', 'Address')}
                  </h3>
                  
                  <button
                    type="button"
                    onClick={handleAutoGPS}
                    disabled={isLocating}
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)', color: '#2563eb', border: 'none',
                      borderRadius: '4px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 800,
                      cursor: isLocating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLocating ? '⏳ Locating...' : '📍 Auto GPS'}
                  </button>
                </div>

                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--gray-200)', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <input 
                      type="text"
                      value={formData.address || ''} 
                      onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))} 
                      placeholder={t('bookingFlow.addressPlaceholder', 'Flat / House No. & Building Name')}
                      style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--gray-200)', outline: 'none', fontSize: '0.85rem', color: 'var(--navy-900)', fontWeight: 600, padding: '4px 0' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input 
                      type="text"
                      value={formData.landmark || ''} 
                      onChange={(e) => setFormData(prev => ({...prev, landmark: e.target.value}))} 
                      placeholder="Landmark (Optional)"
                      style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--gray-200)', outline: 'none', fontSize: '0.8rem', color: 'var(--navy-800)', padding: '4px 0' }}
                    />
                    <input 
                      type="text"
                      value={formData.city || ''} 
                      onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))} 
                      placeholder="City"
                      style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--gray-200)', outline: 'none', fontSize: '0.8rem', color: 'var(--navy-800)', padding: '4px 0' }}
                    />
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', marginTop: '4px', display: 'flex', gap: '10px', alignItems: 'flex-start', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>📝</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.75rem', color: '#166534', display: 'block', marginBottom: '4px' }}>Special Instructions (Optional)</strong>
                      <textarea 
                        value={specialInstructions} 
                        onChange={(e) => setSpecialInstructions(e.target.value)} 
                        placeholder="e.g., Call before reaching, ring the doorbell twice..."
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', color: 'var(--navy-800)', resize: 'none', height: '36px', fontWeight: 600 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Premium Payment Method Selector */}
              {price > 0 && !isSellingService && (
                <div style={{ flexShrink: 0, marginTop: '10px' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
                    {t('bookingFlow.paymentMethod', 'Select Payment Method')}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'UPI', label: 'UPI', subtext: 'GPay, PhonePe, Paytm', icon: <HiOutlineDevicePhoneMobile />, color: '#8b5cf6' },
                    { id: 'Card', label: 'Card', subtext: 'Credit or Debit', icon: <HiOutlineCreditCard />, color: '#3b82f6' },
                    { id: 'Wallet', label: 'Wallet', subtext: 'ServeCircle Pay', icon: <HiOutlineWallet />, color: '#3b7dc1' },
                    { id: 'Cash', label: 'Cash', subtext: 'Pay after service', icon: <HiOutlineBanknotes />, color: '#f59e0b' }
                  ].map(method => {
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div 
                        key={method.id} 
                        onClick={() => setPaymentMethod(method.id)} 
                        style={{ 
                          display: 'flex', flexDirection: 'column', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: isSelected ? `2px solid ${method.color}` : '1px solid var(--gray-200)',
                          background: isSelected ? `${method.color}0A` : 'white',
                          boxShadow: isSelected ? `0 4px 12px ${method.color}20` : '0 2px 4px rgba(0,0,0,0.02)',
                          position: 'relative', overflow: 'hidden'
                        }}
                      >
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '8px', right: '8px', color: method.color }}>
                            <HiCheckCircle size={20} />
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <div style={{ 
                            width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isSelected ? method.color : 'var(--gray-100)',
                            color: isSelected ? 'white' : 'var(--gray-500)', fontSize: '1.3rem',
                            transition: 'all 0.2s'
                          }}>
                            {method.icon}
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isSelected ? 'var(--navy-900)' : 'var(--gray-700)' }}>
                            {method.label}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginLeft: '46px', fontWeight: 600 }}>
                          {method.subtext}
                        </span>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div>
          <div className="card" style={{ padding: '20px', border: '1.5px solid var(--primary-200)', background: 'white', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', fontWeight: 800, margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--gray-100)' }}>
                {t('bookingFlow.orderSummary', 'Order Summary')}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Service:</span>
                  <span style={{ fontWeight: 800, color: 'var(--navy-800)' }}>{t(formData.service || 'AC Service')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Expert:</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>{workerName}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Schedule:</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>{formData.date} at {formData.time}</span>
                </div>
              </div>

              {isSellingService ? (
                 <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px dashed #22c55e', textAlign: 'center' }}>
                   <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💰</div>
                   <h4 style={{ color: '#166534', fontWeight: 800, margin: '0 0 8px 0' }}>Get Paid for Junk!</h4>
                   <p style={{ color: '#15803d', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>Our expert will evaluate your items during the visit and pay you instantly via UPI or Cash before pickup.</p>
                 </div>
              ) : (
                <div style={{ background: 'var(--gray-50)', padding: '10px 14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                    <span>Charge</span>
                    <span style={{ fontWeight: 600 }}>₹{subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                    <span>GST (18%)</span>
                    <span style={{ fontWeight: 600 }}>₹{gst}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.78rem', color: 'var(--gray-600)' }}>
                    <span>Trust & Safety Fee</span>
                    <span style={{ fontWeight: 600 }}>₹{trustSafetyFee}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.78rem', color: '#3b7dc1', fontWeight: 700 }}>
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}
                  
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--gray-300)', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    <span>Total Amount</span>
                    <span style={{ color: 'var(--primary-700)' }}>₹{totalAmount}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              
              {!isExpressMode && !isSellingService && (
                <div style={{ background: 'var(--gray-50)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--gray-300)' }}>
                {appliedCoupon ? (
                  <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#3b7dc1', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {appliedCoupon.code}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-700)', fontWeight: 700 }}>Applied!</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: 'var(--danger-500)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Enter Coupon Code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{ padding: '8px', fontSize: '0.8rem', flex: 1, textTransform: 'uppercase' }} 
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={() => handleApplyCoupon()}
                        style={{ padding: '6px 12px', fontWeight: 800, fontSize: '0.8rem' }}
                      >
                        Apply
                      </button>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => setShowCoupons(!showCoupons)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.75rem', fontWeight: 800, textAlign: 'left', cursor: 'pointer', padding: 0 }}
                    >
                      {showCoupons ? 'Hide Offers' : 'View all available offers →'}
                    </button>
                    
                    {showCoupons && (
                      <div className="animate-fade-in-up" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                        {AVAILABLE_COUPONS.map(coupon => {
                          const isEligible = price >= coupon.minAmount;
                          return (
                            <div key={coupon.code} style={{ background: 'white', border: `1px solid ${isEligible ? 'var(--primary-200)' : 'var(--gray-200)'}`, borderRadius: '6px', padding: '10px', position: 'relative', opacity: isEligible ? 1 : 0.6 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 800, color: 'var(--navy-800)', fontSize: '0.85rem' }}>{coupon.code}</span>
                                {isEligible ? (
                                  <button onClick={() => handleApplyCoupon(coupon.code)} style={{ color: 'var(--primary-600)', background: 'none', border: 'none', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>Apply</button>
                                ) : (
                                  <span style={{ fontSize: '0.65rem', color: 'var(--danger-500)', fontWeight: 700 }}>Add ₹{coupon.minAmount - price} more</span>
                                )}
                              </div>
                              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--gray-600)' }}>{coupon.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}

              {!isExpressMode && (
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (price === 0 || isSellingService) setPaymentMethod('Cash');
                  handleConfirmBooking();
                }} 
                style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 800, boxShadow: 'var(--shadow-md)', background: isSellingService ? '#3b7dc1' : undefined, borderColor: isSellingService ? '#3b7dc1' : undefined }}
              >
                {isSellingService ? 'Schedule Evaluation Visit →' : (price === 0 ? 'Schedule Free Visit →' : 'Pay & Confirm Booking →')}
              </button>
            )}

              <div 
                onClick={() => navigate('/customer/trust-safety')}
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', marginTop: '4px' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <HiOutlineShieldCheck style={{ color: '#16a34a', fontSize: '1.5rem', flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.75rem', color: '#166534', fontWeight: 800 }}>ServeCircle Trust & Safety Guarantee</h4>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#15803d' }}>Verified professionals, call masking & ₹10k insurance.</p>
                </div>
              </div>

              <p style={{ fontSize: '0.68rem', color: 'var(--gray-400)', textAlign: 'center', margin: 0 }}>
                Secure SSL Encrypted Checkout
              </p>
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
                {activePaymentModal === 'UPI' && '⚡ Demo UPI Payment Simulator'}
                {activePaymentModal === 'Card' && '⚡ Demo Card Payment Simulator'}
                {activePaymentModal === 'Wallet' && '⚡ ServeCircle Wallet (Demo)'}
              </h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px' }}>
                Testing Mode
              </span>
            </div>

            {modalError && (
              <div style={{ color: 'var(--danger, #ef4444)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', background: '#fee2e2', padding: '8px 12px', borderRadius: '6px' }}>
                ⚠️ {modalError}
              </div>
            )}

            {/* UPI Modal Content */}
            {activePaymentModal === 'UPI' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b21a8', fontWeight: 700 }}>Total Payable</span>
                  <span style={{ fontSize: '1.1rem', color: '#581c87', fontWeight: 900 }}>₹{totalAmount}</span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Simulated UPI transaction. You can click <strong>Instant Approve</strong> to book immediately or watch the automatic simulator.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', color: '#334155' }}>
                    Demo VPA: <strong>{upiId}</strong>
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '16px' }}>
                  <span style={{ width: '12px', height: '12px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                  Auto-approving in 00:0{upiCountdown}
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={() => executePayment()}
                  disabled={isProcessingPayment}
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isProcessingPayment ? '⏳ Completing Demo Booking...' : '⚡ Instant Approve Demo Payment'}
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
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>Card Number (Pre-filled Test)</label>
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
                  {isProcessingPayment ? '⏳ Processing Demo Card...' : `⚡ Pay ₹${totalAmount} (Demo Card)`}
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
                  {walletBalance < totalAmount && (
                    <div style={{ color: 'var(--danger-600)', fontSize: '0.72rem', fontWeight: 700, marginTop: '8px', textAlign: 'center' }}>
                      ⚠️ Insufficient balance in wallet!
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={() => executePayment()}
                  disabled={isProcessingPayment || walletBalance < totalAmount}
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {isProcessingPayment ? '⏳ Deducting...' : `⚡ Deduct & Pay ₹${totalAmount}`}
                </button>
              </div>
            )}

            {/* Modal Cancel Button */}
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
