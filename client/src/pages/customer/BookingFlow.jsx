import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendarDays, HiOutlineClock, HiOutlineMapPin,
  HiOutlineWrench, HiOutlineArrowLeft,
  HiOutlineCreditCard, HiOutlineWallet, HiOutlineBanknotes, HiOutlineDevicePhoneMobile, HiCheckCircle, HiOutlineShieldCheck
} from 'react-icons/hi2';
import { mockWorkersForService } from './WorkerComparison';
import '../Dashboard.css';
import './CustomerPages.css';

const AVAILABLE_COUPONS = [
  { code: 'WELCOME50', discount: 50, type: 'FLAT', minAmount: 299, desc: 'Flat ₹50 off on your first booking' },
  { code: 'SUMMER20', discount: 20, type: 'PERCENT', maxDiscount: 150, minAmount: 499, desc: '20% off up to ₹150 for summer services' },
  { code: 'SERVE100', discount: 100, type: 'FLAT', minAmount: 999, desc: 'Flat ₹100 off on premium services' },
  { code: 'SAVE10', discount: 10, type: 'PERCENT', maxDiscount: 100, minAmount: 199, desc: '10% off up to ₹100' }
];

const BookingFlow = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize from URL params if available - fallbacks to mock service details to prevent validation lockouts
  const initialService = searchParams.get('service') || 'AC General Service';
  const initialCategory = searchParams.get('category') || 'home-repairs';
  const priceParam = searchParams.get('price');
  const initialBasePrice = priceParam !== null && !isNaN(parseInt(priceParam)) ? parseInt(priceParam) : 499;
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
    category: initialCategory,
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

    if (price === 0 || isSellingService || paymentMethod === 'Cash') {
      handleBook();
    } else if (paymentMethod === 'UPI') {
      setModalError('');
      setUpiStep(2);
      setUpiCountdown(5);
      setActivePaymentModal('UPI');
    } else {
      // Reset modes states
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
    }

    if (activePaymentModal === 'UPI' && upiMethod === 'ID') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setModalError('Please enter a valid UPI ID (e.g. name@upi).');
        return;
      }
      setUpiStep(2);
      setUpiCountdown(4);
      return;
    }

    if (activePaymentModal === 'UPI' && upiMethod === 'APPS') {
      if (!selectedApp) {
        setModalError('Please select a UPI app.');
        return;
      }
      // On real mobile devices, we'd fire the deep link here
      const upiUrl = `upi://pay?pa=payments@servecircle&pn=ServeCircle&tr=SC${Math.floor(Math.random()*10000)}&am=${totalAmount}&cu=INR`;
      // window.location.href = upiUrl; // Attempt to open app (Commented out to prevent desktop crash during testing)
      
      setUpiStep(2);
      setUpiCountdown(5); // Simulate waiting for the app to return
      return;
    }
    
    if (activePaymentModal === 'UPI' && upiMethod === 'QR') {
       // Simulate bank processing time for QR
       setUpiStep(2);
       setUpiCountdown(3);
       return;
    }

    if (activePaymentModal === 'Wallet') {
      if (walletBalance < totalAmount) {
        setModalError('Insufficient wallet balance! Please select cash or another method.');
        return;
      }
      setWalletBalance(prev => prev - totalAmount);
    }

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setActivePaymentModal(null);
      handleBook();
    }, 1500);
  };

  const getModalSubmitText = () => {
    if (isProcessingPayment) return '⏳ Processing...';
    if (activePaymentModal === 'UPI') {
      if (upiMethod === 'QR') return 'I Have Paid';
      if (upiMethod === 'APPS') return `Pay with ${selectedApp || 'App'}`;
      return 'Verify & Pay';
    }
    if (activePaymentModal === 'Card') {
      return `Pay ₹${totalAmount}`;
    }
    if (activePaymentModal === 'Wallet') {
      return `Deduct & Pay ₹${totalAmount}`;
    }
    return 'Confirm & Pay';
  };

  const handleBook = () => {
    const bookingId = `SC-${Math.floor(2840 + Math.random() * 100)}`;
    navigate(`/customer/live-tracking?bookingId=${bookingId}&service=${encodeURIComponent(formData.service)}&worker=${encodeURIComponent(workerName)}&price=${price}`);
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
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '14px' }}>
              {activePaymentModal === 'UPI' && 'UPI Payment'}
              {activePaymentModal === 'Card' && 'Debit/Credit Card Details'}
              {activePaymentModal === 'Wallet' && 'Pay using ServeCircle Wallet'}
            </h3>

            {modalError && (
              <div style={{ color: 'var(--danger, #ef4444)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>
                ⚠️ {modalError}
              </div>
            )}

            {/* UPI Modal Content */}
            {activePaymentModal === 'UPI' && (
              <div style={{ textAlign: 'center' }}>
                  <div className="animate-fade-in" style={{ padding: '24px 0', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', margin: '0 auto 16px', position: 'relative' }}>
                       <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '3px solid var(--gray-100)', borderRadius: '50%' }}></div>
                       <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '3px solid var(--primary-500)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                    <h4 style={{ fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                      Opening UPI App
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                      Please complete the payment securely in your UPI app.
                    </p>
                    <div style={{ background: '#f8fafc', padding: '8px 16px', borderRadius: '20px', display: 'inline-block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      00:0{upiCountdown}
                    </div>
                  </div>
              </div>
            )}

            {/* Card Modal Content */}
            {activePaymentModal === 'Card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
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
            )}

            {/* Wallet Modal Content */}
            {activePaymentModal === 'Wallet' && (
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
            )}



            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  if (upiStep !== 2) {
                    setActivePaymentModal(null);
                  }
                }}
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}
                disabled={isProcessingPayment || upiStep === 2}
              >
                Cancel
              </button>
              {upiStep === 1 && (
                <button 
                  className="btn btn-primary" 
                  onClick={executePayment}
                  style={{ flex: 1.5, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}
                  disabled={isProcessingPayment}
                >
                  {getModalSubmitText()}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingFlow;
