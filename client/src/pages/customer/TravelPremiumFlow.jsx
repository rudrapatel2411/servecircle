import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineArrowRight,
  HiOutlineCurrencyRupee
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import '../Dashboard.css';
import './CustomerPages.css';

const TravelPremiumFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const flowType = searchParams.get('type') || 'luxury-rental'; // luxury-rental, school-commute, corporate-carpool

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ─────────────────────────────────────────────────────────────
  // 1. LUXURY RENTAL STATE
  // ─────────────────────────────────────────────────────────────
  const [luxuryCategory, setLuxuryCategory] = useState('ALL'); // ALL, SUPERCARS, SUV, VINTAGE
  const [carClass, setCarClass] = useState('Ford Mustang GT Convertible');
  const [driveType, setDriveType] = useState('Chauffeur'); // Self-Drive or Chauffeur
  const [deliveryMode, setDeliveryMode] = useState('doorstep'); // doorstep or showroom
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Sunshine Apartments, Bopal');
  const [rentalStartDate, setRentalStartDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('10:00 AM');
  const [rentalDays, setRentalDays] = useState(2);
  const [rentalKm, setRentalKm] = useState(160);
  const [rentalOccasion, setRentalOccasion] = useState('Wedding / Gala Event');
  const [drivingLicense, setDrivingLicense] = useState('GJ-01-2022-0049281');
  const [zeroDepInsurance, setZeroDepInsurance] = useState(true);

  const LUXURY_FLEET = [
    {
      id: 'mustang',
      name: 'Ford Mustang GT Convertible',
      category: 'SUPERCARS',
      specs: '5.0L V8 • 450 HP • 2-Door Sports • Triple Yellow / Race Red',
      baseDayRate: 7999,
      kmRate: 35,
      fuelType: 'Premium Petrol',
      seats: '2+2 Seats',
      badge: 'Popular for Gala Events',
      image: '🏎️'
    },
    {
      id: 'gwagon',
      name: 'Mercedes-Benz G-Wagon G63 AMG',
      category: 'SUV',
      specs: 'Twin-Turbo V8 • 577 HP • 4x4 Luxury Beast • Matte Black',
      baseDayRate: 14999,
      kmRate: 55,
      fuelType: 'High Octane Petrol',
      seats: '5 VIP Seats',
      badge: 'Executive VIP Escort',
      image: '🚙'
    },
    {
      id: 'rolls-royce',
      name: 'Rolls-Royce Ghost Series II (Vintage)',
      category: 'VINTAGE',
      specs: '6.75L V12 • Starlight Headliner • Chauffeur-Exclusive • Royal White',
      baseDayRate: 24999,
      kmRate: 75,
      fuelType: 'Super Petrol',
      seats: '4 Ultra-Luxury Seats',
      badge: 'Royal Weddings & VIPs',
      image: '👑'
    },
    {
      id: 'porsche-911',
      name: 'Porsche 911 Carrera Cabriolet',
      category: 'SUPERCARS',
      specs: '385 HP Twin-Turbo Boxer-6 • Miami Blue • Convertible Sunroof',
      baseDayRate: 18999,
      kmRate: 65,
      fuelType: 'Premium Petrol',
      seats: '2 Seats',
      badge: 'German Track Precision',
      image: '⚡'
    },
    {
      id: 'jaguar-e-type',
      name: 'Vintage 1965 Jaguar E-Type Classic',
      category: 'VINTAGE',
      specs: 'British Heritage Roadster • Wire Spoke Wheels • Burgundy Metallic',
      baseDayRate: 12999,
      kmRate: 50,
      fuelType: 'Vintage Classic',
      seats: '2 Classic Seats',
      badge: 'Heritage Rally Elegance',
      image: '🏛️'
    },
    {
      id: 'bmw-7-series',
      name: 'BMW 7-Series M-Sport Limo',
      category: 'SUV',
      specs: 'Sky Lounge Panoramic Glass • Rear Massage Seats • Gesture Control',
      baseDayRate: 9999,
      kmRate: 40,
      fuelType: 'TwinPower Turbo',
      seats: '4 Executive Seats',
      badge: 'Corporate Statecraft',
      image: '💼'
    }
  ];

  // ─────────────────────────────────────────────────────────────
  // 2. SCHOOL COMMUTE STATE
  // ─────────────────────────────────────────────────────────────
  const [childName, setChildName] = useState('Aarav Patel');
  const [childGrade, setChildGrade] = useState('Primary (Grade 1 - 5)');
  const [schoolName, setSchoolName] = useState('Delhi Public School (DPS)');
  const [schoolPickupAddress, setSchoolPickupAddress] = useState('Flat 402, Sunshine Apartments, Bopal');
  const [schoolDropGate, setSchoolDropGate] = useState('Main Campus Gate 1, DPS Bopal');
  const [schoolStartDate, setSchoolStartDate] = useState('Next Monday');
  const [schoolShift, setSchoolShift] = useState('Round-Trip'); // Round-Trip, Morning-Only, Afternoon-Only
  const [morningPickupTime, setMorningPickupTime] = useState('07:15 AM');
  const [afternoonReturnTime, setAfternoonReturnTime] = useState('02:00 PM');
  const [schoolVehicleType, setSchoolVehicleType] = useState('Dedicated AC Kids Van (Max 4)');
  const [femaleAttendant, setFemaleAttendant] = useState(true);
  const [parentContact, setParentContact] = useState('9876543210');
  const [secondaryGuardianName, setSecondaryGuardianName] = useState('Pooja Patel (Mother)');
  const [secondaryGuardianPhone, setSecondaryGuardianPhone] = useState('9876501234');

  // ─────────────────────────────────────────────────────────────
  // 3. CORPORATE CARPOOL STATE
  // ─────────────────────────────────────────────────────────────
  const [corporateOrg, setCorporateOrg] = useState('TCS / Tata Consultancy Services');
  const [corporateEmail, setCorporateEmail] = useState('rahul.patel@tcs.com');
  const [homeCluster, setHomeCluster] = useState('Bopal / South Bopal');
  const [pickupLandmark, setPickupLandmark] = useState('Main Gate 1, Gala Aria, South Bopal');
  const [officePark, setOfficePark] = useState('GIFT City FinTech Zone');
  const [carpoolStartDate, setCarpoolStartDate] = useState('Next Monday');
  const [morningInTime, setMorningInTime] = useState('09:00 AM');
  const [eveningOutTime, setEveningOutTime] = useState('06:00 PM');
  const [carpoolDays, setCarpoolDays] = useState(5); // 5 or 6 days/wk
  const [carpoolVehicleTier, setCarpoolVehicleTier] = useState('Sedan'); // Sedan or SUV
  const [quietRideMode, setQuietRideMode] = useState(true);

  // Validate flow type
  useEffect(() => {
    if (!['luxury-rental', 'school-commute', 'corporate-carpool'].includes(flowType)) {
      navigate('/customer/travel-commute');
    }
  }, [flowType, navigate]);

  // ─────────────────────────────────────────────────────────────
  // PRICING CALCULATIONS
  // ─────────────────────────────────────────────────────────────
  const selectedCar = LUXURY_FLEET.find(c => c.name === carClass) || LUXURY_FLEET[0];

  const calcLuxuryTotal = () => {
    const isChauffeur = driveType === 'Chauffeur';
    const baseDayRate = selectedCar.baseDayRate;
    const baseTotal = baseDayRate * rentalDays;
    const kmTotal = rentalKm * selectedCar.kmRate;
    const driverFee = isChauffeur ? 1200 * rentalDays : 0;
    const deliveryFee = deliveryMode === 'doorstep' ? 499 : 0;
    const insuranceFee = (!isChauffeur && zeroDepInsurance) ? 999 * rentalDays : 0;
    const subtotal = baseTotal + kmTotal + driverFee + deliveryFee + insuranceFee;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    return { baseTotal, kmTotal, driverFee, deliveryFee, insuranceFee, subtotal, gst, total };
  };

  const calcSchoolTotal = () => {
    const base = schoolShift === 'Round-Trip' ? 3499 : 2199;
    const vehicleAddon = schoolVehicleType.includes('Sedan') ? 600 : 0;
    const attendantAddon = femaleAttendant ? 499 : 0;
    const total = base + vehicleAddon + attendantAddon;
    return { base, vehicleAddon, attendantAddon, total };
  };

  const calcCarpoolTotal = () => {
    const base = carpoolVehicleTier === 'SUV' ? 2499 : 1299;
    const daysAddon = carpoolDays === 6 ? 299 : 0;
    const total = base + daysAddon;
    const estimatedSoloCost = carpoolVehicleTier === 'SUV' ? 9800 : 7200;
    const savings = estimatedSoloCost - total;
    return { base, daysAddon, total, savings };
  };

  const currentTotal = () => {
    if (flowType === 'luxury-rental') return calcLuxuryTotal().total;
    if (flowType === 'school-commute') return calcSchoolTotal().total;
    return calcCarpoolTotal().total;
  };

  // ─────────────────────────────────────────────────────────────
  // 2-STEP NAVIGATION & CHECKOUT
  // ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    setErrorMsg('');

    if (step === 1) {
      if (flowType === 'luxury-rental' && !carClass) {
        return setErrorMsg('Please choose a car from the luxury fleet.');
      }
      if (flowType === 'school-commute' && (!childName.trim() || !schoolName)) {
        return setErrorMsg("Please provide your child's name and school name.");
      }
      if (flowType === 'corporate-carpool' && (!corporateOrg || !homeCluster || !officePark)) {
        return setErrorMsg('Please select your company, pickup area, and destination.');
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 2 validations
      if (flowType === 'luxury-rental') {
        if (!rentalStartDate) return setErrorMsg('Please select your rental start date.');
        if (deliveryMode === 'doorstep' && !deliveryAddress.trim()) {
          return setErrorMsg('Please enter your doorstep delivery address or hotel name.');
        }
        if (driveType === 'Self-Drive' && !drivingLicense.trim()) {
          return setErrorMsg('Please provide your Driving License number for self-drive verification.');
        }
      } else if (flowType === 'school-commute') {
        if (!schoolPickupAddress.trim()) return setErrorMsg('Please provide your home pickup address.');
        if (!parentContact.trim() || !secondaryGuardianPhone.trim()) {
          return setErrorMsg('Both primary and secondary emergency contact numbers are required.');
        }
      } else if (flowType === 'corporate-carpool') {
        if (!pickupLandmark.trim()) return setErrorMsg('Please provide your society gate or pickup landmark.');
        if (!corporateEmail.trim()) return setErrorMsg('Please provide your corporate email for verification.');
      }
      finalizeBooking();
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step === 2) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/customer/travel-commute');
    }
  };

  const finalizeBooking = () => {
    setLoading(true);
    setTimeout(() => {
      let serviceName = '';
      let price = 0;
      let queryParams = '';

      if (flowType === 'luxury-rental') {
        const { total } = calcLuxuryTotal();
        price = total;
        serviceName = `Luxury Rental: ${selectedCar.name} (${driveType} • ${rentalDays}d • ${rentalKm}km)`;
        queryParams = `&fleetType=${encodeURIComponent(selectedCar.name)}&driveType=${encodeURIComponent(driveType)}&days=${rentalDays}&distanceKm=${rentalKm}&deliveryMode=${encodeURIComponent(deliveryMode)}&startDate=${encodeURIComponent(rentalStartDate)}&timeSlot=${encodeURIComponent(deliveryTimeSlot)}&occasion=${encodeURIComponent(rentalOccasion)}&deliveryAddress=${encodeURIComponent(deliveryAddress)}`;
      } else if (flowType === 'school-commute') {
        const { total } = calcSchoolTotal();
        price = total;
        serviceName = `School Commute Monthly Pass: ${childName} (${schoolName} • ${schoolShift})`;
        queryParams = `&studentName=${encodeURIComponent(childName)}&school=${encodeURIComponent(schoolName)}&shift=${encodeURIComponent(schoolShift)}&pickupTime=${encodeURIComponent(morningPickupTime)}&dropTime=${encodeURIComponent(afternoonReturnTime)}&startDate=${encodeURIComponent(schoolStartDate)}&guardianName=${encodeURIComponent(secondaryGuardianName)}&guardianPhone=${encodeURIComponent(secondaryGuardianPhone)}`;
      } else if (flowType === 'corporate-carpool') {
        const { total } = calcCarpoolTotal();
        price = total;
        serviceName = `Corporate Carpool Pass: ${homeCluster} → ${officePark} (${corporateOrg} • ${carpoolVehicleTier})`;
        queryParams = `&company=${encodeURIComponent(corporateOrg)}&origin=${encodeURIComponent(homeCluster)}&destination=${encodeURIComponent(officePark)}&inTime=${encodeURIComponent(morningInTime)}&outTime=${encodeURIComponent(eveningOutTime)}&tier=${encodeURIComponent(carpoolVehicleTier)}&landmark=${encodeURIComponent(pickupLandmark)}&workEmail=${encodeURIComponent(corporateEmail)}&startDate=${encodeURIComponent(carpoolStartDate)}`;
      }

      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&category=Travel%20%26%20Commute&price=${price}${queryParams}`);
    }, 700);
  };

  // ─────────────────────────────────────────────────────────────
  // THEME CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  const getThemeInfo = () => {
    switch (flowType) {
      case 'luxury-rental':
        return {
          title: 'Luxury & Vintage Car Fleet',
          subtitle: 'Exotic Supercars, VIP Escort SUVs & Vintage Classics with Doorstep Delivery',
          icon: <HiOutlineKey size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
          color: '#0f766e',
          bgSoft: '#f0fdfa'
        };
      case 'school-commute':
        return {
          title: 'Kids Safe School Commute Pass',
          subtitle: 'Verified Background-Checked Chauffeur, Live Dashcam Stream & Geo-Fence Safety',
          icon: <HiOutlineAcademicCap size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#2563eb',
          bgSoft: '#eff6ff'
        };
      case 'corporate-carpool':
      default:
        return {
          title: 'Corporate Carpool Match & Pass',
          subtitle: 'Share Premium Daily Rides with Verified Executives on Your Tech-Park Route',
          icon: <HiOutlineBriefcase size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #1E40AF 0%, #0F172A 100%)',
          color: '#1E40AF',
          bgSoft: '#FAF9F6'
        };
    }
  };

  const theme = getThemeInfo();

  return (
    <div className="page-content" style={{ minHeight: '92vh', padding: '20px 16px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '920px', marginTop: '12px' }}>
        
        {/* Top Back Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={handleBack}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'white',
              border: '1px solid #e2e8f0',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 700,
              color: 'var(--navy-800)',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}
          >
            <HiOutlineArrowLeft size={18} />
            {step === 1 ? 'Back to Commute Hub' : 'Previous Step'}
          </button>
        </div>

        {/* Hero Card */}
        <div style={{
          background: theme.gradient,
          borderRadius: '24px',
          padding: '28px 24px',
          color: 'white',
          marginBottom: '24px',
          boxShadow: '0 12px 30px -8px rgba(0,0,0,0.18)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              <HiOutlineSparkles size={14} /> VIP Fleet & Safe Mobility Pass
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 8px 0', lineHeight: 1.2 }}>
              {theme.title}
            </h1>
            <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95, lineHeight: 1.5, maxWidth: '640px' }}>
              {theme.subtitle}
            </p>
          </div>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)'
          }}>
            {theme.icon}
          </div>
        </div>

        {/* 2-Step Progress Indicator */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '16px 24px',
          marginBottom: '28px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', position: 'relative' }}>
            {[
              { num: 1, label: '1. Select Plan & Key Options', desc: 'Choose vehicle, route or pass tier' },
              { num: 2, label: '2. Schedule & Confirm', desc: 'Set timing, home address & driver match' }
            ].map((s) => {
              const isDone = step > s.num;
              const isActive = step === s.num;
              return (
                <div key={s.num} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isDone ? '#10b981' : isActive ? theme.color : '#f1f5f9',
                    color: isDone || isActive ? 'white' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    margin: '0 auto 6px',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? `0 4px 12px ${theme.color}44` : 'none'
                  }}>
                    {isDone ? <HiOutlineCheckCircle size={22} /> : s.num}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? 'var(--navy-900)' : '#64748b'
                  }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    {s.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ERROR ALERT */}
        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '14px 20px',
            borderRadius: '14px',
            marginBottom: '24px',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: SELECT PLAN & OPTIONS */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* 1.1 LUXURY RENTAL SETUP */}
            {flowType === 'luxury-rental' && (
              <>
                {/* Fleet Category Filter & Cards */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                      1. Choose Your Luxury Fleet
                    </h3>
                    <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                      {[
                        { id: 'ALL', label: 'All Fleet' },
                        { id: 'SUPERCARS', label: 'Supercars' },
                        { id: 'SUV', label: 'VIP SUVs' },
                        { id: 'VINTAGE', label: 'Vintage Classics' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setLuxuryCategory(cat.id)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            background: luxuryCategory === cat.id ? '#0f766e' : 'transparent',
                            color: luxuryCategory === cat.id ? 'white' : '#475569'
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '16px' }}>
                    {(luxuryCategory === 'ALL' ? LUXURY_FLEET : LUXURY_FLEET.filter(c => c.category === luxuryCategory)).map(car => {
                      const selected = carClass === car.name;
                      return (
                        <div
                          key={car.id}
                          onClick={() => setCarClass(car.name)}
                          style={{
                            border: `2px solid ${selected ? '#0f766e' : '#e2e8f0'}`,
                            background: selected ? '#f0fdfa' : '#ffffff',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <span style={{ fontSize: '2rem' }}>{car.image}</span>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0f766e', background: '#ccfbf1', padding: '3px 8px', borderRadius: '6px' }}>
                                {car.badge}
                              </span>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '4px' }}>
                              {car.name}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4, marginBottom: '10px' }}>
                              {car.specs}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#475569', marginBottom: '12px' }}>
                              <span style={{ background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{car.fuelType}</span>
                              <span style={{ background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{car.seats}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                            <div>
                              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f766e' }}>₹{car.baseDayRate.toLocaleString()}</span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}> / day</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: selected ? '#0f766e' : '#94a3b8' }}>
                              {selected ? '✓ Selected' : 'Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rental Options & Pilot */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    2. Driving Mode & Rental Duration
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🎩 Pilot Mode
                      </label>
                      <select
                        value={driveType}
                        onChange={e => setDriveType(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="Chauffeur">VIP Chauffeur-Driven (Uniformed & Verified)</option>
                        <option value="Self-Drive">Self-Drive Experience (Requires Valid DL)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        📅 Rental Duration ({rentalDays} Days)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={7}
                        value={rentalDays}
                        onChange={e => setRentalDays(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#0f766e' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>1 Day</span>
                        <span>3 Days</span>
                        <span>7 Days</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🚗 Handover Mode
                      </label>
                      <select
                        value={deliveryMode}
                        onChange={e => setDeliveryMode(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="doorstep">Doorstep Flatbed Delivery (+₹499)</option>
                        <option value="showroom">VIP Hub Showroom Handover (₹0)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 1.2 SCHOOL COMMUTE SETUP */}
            {flowType === 'school-commute' && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    1. Student Profile & Campus Route
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🧒 Student Full Name
                      </label>
                      <input
                        type="text"
                        value={childName}
                        onChange={e => setChildName(e.target.value)}
                        placeholder="e.g. Aarav Patel"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🏫 School Name
                      </label>
                      <select
                        value={schoolName}
                        onChange={e => setSchoolName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="Delhi Public School (DPS)">Delhi Public School (DPS, Bopal)</option>
                        <option value="Udgam School for Children">Udgam School for Children</option>
                        <option value="Anand Niketan School">Anand Niketan School</option>
                        <option value="St. Kabir School">St. Kabir School</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🎒 Student Class / Grade
                      </label>
                      <select
                        value={childGrade}
                        onChange={e => setChildGrade(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="Pre-Primary (Nursery - KG)">Pre-Primary (Nursery - KG)</option>
                        <option value="Primary (Grade 1 - 5)">Primary (Grade 1 - 5)</option>
                        <option value="Middle School (Grade 6 - 8)">Middle School (Grade 6 - 8)</option>
                        <option value="High School (Grade 9 - 12)">High School (Grade 9 - 12)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    2. Pass Shift & Safety Features
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                    {[
                      { id: 'Round-Trip', name: 'Round-Trip Monthly Pass', price: 3499, desc: 'Both morning pickup and afternoon return drop' },
                      { id: 'Morning-Only', name: 'Morning Pickup Only', price: 2199, desc: 'Home to school campus gate morning ride' },
                      { id: 'Afternoon-Only', name: 'Afternoon Return Only', price: 2199, desc: 'School gate to home afternoon ride' }
                    ].map(p => {
                      const selected = schoolShift === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSchoolShift(p.id)}
                          style={{
                            border: `2px solid ${selected ? '#2563eb' : '#e2e8f0'}`,
                            background: selected ? '#eff6ff' : '#ffffff',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '4px' }}>{p.name}</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#2563eb', marginBottom: '6px' }}>₹{p.price}<span style={{ fontSize: '0.75rem', color: '#64748b' }}>/mo</span></div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.desc}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>Female Attendant on Board</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Dedicated trained lady escort helps child across school gates & straps seatbelt</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFemaleAttendant(!femaleAttendant)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: femaleAttendant ? '#2563eb' : '#e2e8f0',
                        color: femaleAttendant ? 'white' : '#64748b',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {femaleAttendant ? '✓ Included (+₹499)' : '+ Add Escort'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 1.3 CORPORATE CARPOOL SETUP */}
            {flowType === 'corporate-carpool' && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    1. Corporate Corridor & Company Match
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🏢 Corporate Organization
                      </label>
                      <select
                        value={corporateOrg}
                        onChange={e => setCorporateOrg(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="TCS / Tata Consultancy Services">TCS (GIFT City / Gandhinagar)</option>
                        <option value="Infosys / Tech Mahindra">Infosys / Tech Mahindra</option>
                        <option value="Cognizant / Accenture">Cognizant / Accenture</option>
                        <option value="Adani Shantigram Tech Park">Adani Shantigram Tech Park</option>
                        <option value="Prahlad Nagar Corporate Road">Prahlad Nagar Corporate Road</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        📍 Residential Cluster
                      </label>
                      <select
                        value={homeCluster}
                        onChange={e => setHomeCluster(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="Bopal / South Bopal">Bopal / South Bopal Corridor</option>
                        <option value="Prahlad Nagar / Satellite">Prahlad Nagar / Satellite Hub</option>
                        <option value="Vastrapur / Bodakdev">Vastrapur / Bodakdev</option>
                        <option value="Chandkheda / Motera">Chandkheda / Motera</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🎯 Tech Park Destination
                      </label>
                      <select
                        value={officePark}
                        onChange={e => setOfficePark(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="GIFT City FinTech Zone">GIFT City FinTech Zone</option>
                        <option value="Infocity Gandhinagar">Infocity Gandhinagar</option>
                        <option value="SG Highway Corporate Corridor">SG Highway Corporate Corridor</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    2. Monthly Pass Tier
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {[
                      { id: 'Sedan', name: 'Executive Sedan Pass (Honda City / Ciaz)', price: 1299, desc: 'Quiet, premium sedan shared with max 2 other verified professionals on your exact route.' },
                      { id: 'SUV', name: 'Luxury Executive SUV Pass (Creta / Innova)', price: 2499, desc: 'Spacious captain seats, reclining leg room, charging hubs & fast-track corridor transit.' }
                    ].map(t => {
                      const selected = carpoolVehicleTier === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setCarpoolVehicleTier(t.id)}
                          style={{
                            border: `2px solid ${selected ? '#1E40AF' : '#e2e8f0'}`,
                            background: selected ? '#eff6ff' : '#ffffff',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '4px' }}>{t.name}</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E40AF', marginBottom: '6px' }}>₹{t.price}<span style={{ fontSize: '0.75rem', color: '#64748b' }}>/month</span></div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{t.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SCHEDULE, ADDRESS & CONFIRM */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Schedule & Address Form */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                Schedule & Doorstep Details
              </h3>

              {flowType === 'luxury-rental' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📅 Rental Start Date
                    </label>
                    <input
                      type="date"
                      value={rentalStartDate}
                      onChange={e => setRentalStartDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Delivery Time
                    </label>
                    <select
                      value={deliveryTimeSlot}
                      onChange={e => setDeliveryTimeSlot(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="10:00 AM">10:00 AM (Morning Handover)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon Handover)</option>
                      <option value="06:00 PM">06:00 PM (Evening Handover)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📍 Doorstep Delivery Address / Hotel
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Apartments, Bopal"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  {driveType === 'Self-Drive' && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        📄 Driving License Number (Compulsory for Self-Drive)
                      </label>
                      <input
                        type="text"
                        value={drivingLicense}
                        onChange={e => setDrivingLicense(e.target.value)}
                        placeholder="e.g. GJ-01-2022-0049281"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      />
                    </div>
                  )}
                </div>
              )}

              {flowType === 'school-commute' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Morning Pickup Time
                    </label>
                    <select
                      value={morningPickupTime}
                      onChange={e => setMorningPickupTime(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="07:00 AM">07:00 AM</option>
                      <option value="07:15 AM">07:15 AM</option>
                      <option value="07:30 AM">07:30 AM</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Afternoon Return Time
                    </label>
                    <select
                      value={afternoonReturnTime}
                      onChange={e => setAfternoonReturnTime(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="01:30 PM">01:30 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      🏠 Home Pickup Address
                    </label>
                    <input
                      type="text"
                      value={schoolPickupAddress}
                      onChange={e => setSchoolPickupAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Apartments, Bopal"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📞 Primary Parent Contact
                    </label>
                    <input
                      type="text"
                      value={parentContact}
                      onChange={e => setParentContact(e.target.value)}
                      placeholder="e.g. 9876543210"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📞 Secondary Guardian Contact
                    </label>
                    <input
                      type="text"
                      value={secondaryGuardianPhone}
                      onChange={e => setSecondaryGuardianPhone(e.target.value)}
                      placeholder="e.g. 9876501234"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}

              {flowType === 'corporate-carpool' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Morning In-Time (At Office)
                    </label>
                    <select
                      value={morningInTime}
                      onChange={e => setMorningInTime(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Evening Out-Time (Return Departure)
                    </label>
                    <select
                      value={eveningOutTime}
                      onChange={e => setEveningOutTime(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="06:30 PM">06:30 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📍 Society Gate / Pickup Landmark
                    </label>
                    <input
                      type="text"
                      value={pickupLandmark}
                      onChange={e => setPickupLandmark(e.target.value)}
                      placeholder="e.g. Main Gate 1, Gala Aria, South Bopal"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      💼 Work Email (For Corporate Verification)
                    </label>
                    <input
                      type="email"
                      value={corporateEmail}
                      onChange={e => setCorporateEmail(e.target.value)}
                      placeholder="e.g. rahul.patel@tcs.com"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Specialist & Safety Assurance Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: 'white',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem'
                }}>
                  {flowType === 'luxury-rental' ? '👑' : flowType === 'school-commute' ? '🛡️' : '💼'}
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#38bdf8', fontWeight: 800 }}>
                    ServeCircle Mobility Guarantee
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '2px 0' }}>
                    {flowType === 'luxury-rental' ? 'VIP White-Glove Fleet Chauffeur & Zero-Dep Transit Coverage' :
                     flowType === 'school-commute' ? 'Police-Verified School Van Pilot & Live In-Cabin CCTV Stream' :
                     'Verified Corporate Executives Only • Geo-Fenced Fast Transit'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    100% on-time dispatch guarantee • Instant cancellation / trip pause • Real-time GPS sharing
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                Booking Summary & Breakdown
              </h3>

              {flowType === 'luxury-rental' && (() => {
                const l = calcLuxuryTotal();
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>{selectedCar.name} ({rentalDays} Days)</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{l.baseTotal.toLocaleString()}</strong>
                    </div>
                    {l.driverFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>Chauffeur Pilot Fee</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{l.driverFee.toLocaleString()}</strong>
                      </div>
                    )}
                    {l.deliveryFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>Doorstep Flatbed Delivery</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{l.deliveryFee}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>Applicable GST (18%)</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{l.gst.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                      <span>Total Payable</span>
                      <span style={{ color: theme.color }}>₹{l.total.toLocaleString()}</span>
                    </div>
                  </>
                );
              })()}

              {flowType === 'school-commute' && (() => {
                const s = calcSchoolTotal();
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>School Commute Pass ({schoolShift})</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{s.base}</strong>
                    </div>
                    {s.attendantAddon > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>Female Attendant Escort</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{s.attendantAddon}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                      <span>Monthly Fee</span>
                      <span style={{ color: theme.color }}>₹{s.total} / month</span>
                    </div>
                  </>
                );
              })()}

              {flowType === 'corporate-carpool' && (() => {
                const cp = calcCarpoolTotal();
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>Corporate Carpool Pass ({carpoolVehicleTier})</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{cp.base}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem', color: '#16a34a' }}>
                      <span>Estimated Monthly Cab Savings</span>
                      <strong>Save ~₹{cp.savings.toLocaleString()} / month</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                      <span>Monthly Shared Pass</span>
                      <span style={{ color: theme.color }}>₹{cp.total} / month</span>
                    </div>
                  </>
                );
              })()}
            </div>

          </div>
        )}

        {/* BOTTOM FLOATING ACTION BAR */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'center',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
          zIndex: 100
        }}>
          <div style={{ width: '100%', maxWidth: '920px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Payable</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{currentTotal().toLocaleString()}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleBack}
                className="btn"
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              <button
                onClick={handleNext}
                disabled={loading}
                className="btn"
                style={{
                  background: theme.gradient,
                  color: 'white',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 14px ${theme.color}44`
                }}
              >
                {loading ? 'Processing...' : step === 1 ? (
                  <>Continue to Schedule <HiOutlineArrowRight size={18} /></>
                ) : (
                  <>Confirm & Match <HiOutlineCheckCircle size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TravelPremiumFlow;
