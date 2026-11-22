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
  HiOutlineCamera,
  HiOutlineCheckBadge,
  HiOutlineArrowRight,
  HiOutlineBolt,
  HiOutlineHeart,
  HiOutlineStar
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import '../Dashboard.css';
import './CustomerPages.css';

const TravelPremiumFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const flowType = searchParams.get('type'); // luxury-rental, school-commute, corporate-carpool

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
  const [chauffeurLanguage, setChauffeurLanguage] = useState('Hindi / English');

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
  const [customSchoolName, setCustomSchoolName] = useState('');
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
  const [childMedicalNotes, setChildMedicalNotes] = useState('None / Mild motion sickness on highway');

  // ─────────────────────────────────────────────────────────────
  // 3. CORPORATE CARPOOL STATE
  // ─────────────────────────────────────────────────────────────
  const [corporateOrg, setCorporateOrg] = useState('TCS / Tata Consultancy Services');
  const [customOrgName, setCustomOrgName] = useState('');
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
  const [womenOnlyCohort, setWomenOnlyCohort] = useState(false);

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

  // ─────────────────────────────────────────────────────────────
  // STEP NAVIGATION & FINALIZATION
  // ─────────────────────────────────────────────────────────────
  const maxSteps = 4;

  const handleNext = () => {
    setErrorMsg('');

    // Step validations
    if (flowType === 'luxury-rental') {
      if (step === 1 && !carClass) return setErrorMsg('Please choose a car from the luxury fleet.');
      if (step === 2 && !rentalStartDate) return setErrorMsg('Please select your rental start date.');
      if (step === 2 && deliveryMode === 'doorstep' && !deliveryAddress.trim()) {
        return setErrorMsg('Please enter your doorstep delivery address or hotel name.');
      }
      if (step === 3 && driveType === 'Self-Drive' && !drivingLicense.trim()) {
        return setErrorMsg('Please provide your Driving License number for self-drive verification.');
      }
    } else if (flowType === 'school-commute') {
      if (step === 1 && (!childName.trim() || !schoolName)) {
        return setErrorMsg("Please provide your child's name and school name.");
      }
      if (step === 2 && (!morningPickupTime || !afternoonReturnTime)) {
        return setErrorMsg('Please select your preferred morning pickup and afternoon return times.');
      }
      if (step === 3 && (!parentContact.trim() || !secondaryGuardianPhone.trim())) {
        return setErrorMsg('Both primary and secondary emergency contact numbers are compulsory for student safety.');
      }
    } else if (flowType === 'corporate-carpool') {
      if (step === 1 && (!corporateOrg || !homeCluster || !officePark)) {
        return setErrorMsg('Please select your company, pickup area, and tech park destination.');
      }
      if (step === 1 && !pickupLandmark.trim()) {
        return setErrorMsg('Please provide your specific society gate or pickup landmark.');
      }
      if (step === 2 && (!morningInTime || !eveningOutTime)) {
        return setErrorMsg('Please select your morning in-time and evening out-time.');
      }
    }

    if (step < maxSteps) {
      setStep(step + 1);
    } else {
      finalizeBooking();
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
        serviceName = `Luxury Rental: ${selectedCar.name} (${driveType === 'Chauffeur' ? 'Chauffeur' : 'Self-Drive'} • ${rentalDays}d • ${rentalKm}km)`;
        queryParams = `&fleetType=${encodeURIComponent(selectedCar.name)}&driveType=${encodeURIComponent(driveType)}&days=${rentalDays}&distanceKm=${rentalKm}&deliveryMode=${encodeURIComponent(deliveryMode)}&startDate=${encodeURIComponent(rentalStartDate)}&timeSlot=${encodeURIComponent(deliveryTimeSlot)}&occasion=${encodeURIComponent(rentalOccasion)}&deliveryAddress=${encodeURIComponent(deliveryAddress)}`;
      } else if (flowType === 'school-commute') {
        const { total } = calcSchoolTotal();
        price = total;
        const finalSchool = schoolName === 'Other' ? customSchoolName || 'Partner School' : schoolName;
        serviceName = `School Commute Monthly Pass: ${childName} (${finalSchool} • ${schoolShift})`;
        queryParams = `&studentName=${encodeURIComponent(childName)}&school=${encodeURIComponent(finalSchool)}&shift=${encodeURIComponent(schoolShift)}&pickupTime=${encodeURIComponent(morningPickupTime)}&dropTime=${encodeURIComponent(afternoonReturnTime)}&startDate=${encodeURIComponent(schoolStartDate)}&guardianName=${encodeURIComponent(secondaryGuardianName)}&guardianPhone=${encodeURIComponent(secondaryGuardianPhone)}`;
      } else if (flowType === 'corporate-carpool') {
        const { total } = calcCarpoolTotal();
        price = total;
        const finalOrg = corporateOrg === 'Other' ? customOrgName || 'Corporate Park' : corporateOrg;
        serviceName = `Corporate Carpool Pass: ${homeCluster} → ${officePark} (${finalOrg} • ${carpoolVehicleTier})`;
        queryParams = `&company=${encodeURIComponent(finalOrg)}&origin=${encodeURIComponent(homeCluster)}&destination=${encodeURIComponent(officePark)}&inTime=${encodeURIComponent(morningInTime)}&outTime=${encodeURIComponent(eveningOutTime)}&tier=${encodeURIComponent(carpoolVehicleTier)}&landmark=${encodeURIComponent(pickupLandmark)}&workEmail=${encodeURIComponent(corporateEmail)}&startDate=${encodeURIComponent(carpoolStartDate)}`;
      }

      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&category=Travel%20%26%20Commute&price=${price}${queryParams}`);
    }, 1000);
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
          bgSoft: '#f0fdfa',
          borderActive: '#0f766e',
          shadowActive: '0 8px 24px rgba(15, 118, 110, 0.2)',
        };
      case 'school-commute':
        return {
          title: 'Kids Safe School Commute Pass',
          subtitle: 'Verified Background-Checked Chauffeur, Live Dashcam Stream & Geo-Fence Safety',
          icon: <HiOutlineAcademicCap size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: '#2563eb',
          bgSoft: '#eff6ff',
          borderActive: '#2563eb',
          shadowActive: '0 8px 24px rgba(37, 99, 235, 0.2)',
        };
      case 'corporate-carpool':
        return {
          title: 'Corporate Carpool Match & Pass',
          subtitle: 'Share Premium Daily Rides with Verified Executives on Your Tech-Park Route',
          icon: <HiOutlineBriefcase size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #363027 0%, #1f1b16 100%)',
          color: '#363027',
          bgSoft: '#faf7f2',
          borderActive: '#363027',
          shadowActive: '0 8px 24px rgba(54, 48, 39, 0.25)',
        };
      default:
        return {
          title: 'Premium Travel Commute',
          subtitle: 'ServeCircle Premium Mobility',
          icon: null,
          gradient: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
          color: '#0f766e',
          bgSoft: '#f0fdfa',
          borderActive: '#0f766e',
          shadowActive: 'none',
        };
    }
  };

  const theme = getThemeInfo();

  // ─────────────────────────────────────────────────────────────
  // RENDER FLOW 1: LUXURY & VINTAGE RENTALS
  // ─────────────────────────────────────────────────────────────
  const renderLuxuryFlow = () => {
    const { baseTotal, kmTotal, driverFee, deliveryFee, insuranceFee, gst, total } = calcLuxuryTotal();

    if (step === 1) {
      const filteredCars = luxuryCategory === 'ALL'
        ? LUXURY_FLEET
        : LUXURY_FLEET.filter(c => c.category === luxuryCategory);

      return (
        <div className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, margin: 0 }}>
                Step 1: Choose Your Luxury Fleet
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                All vehicles sanitized, insured, and verified for VIP travel.
              </p>
            </div>
            {/* Category Filter */}
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
                    color: luxuryCategory === cat.id ? 'white' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredCars.map(car => {
              const isSelected = carClass === car.name;
              return (
                <div
                  key={car.id}
                  onClick={() => setCarClass(car.name)}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    border: `2px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`,
                    background: isSelected ? '#f0fdfa' : 'white',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px rgba(15, 118, 110, 0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
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
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                      {car.name}
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                      {car.specs}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: '#475569', marginBottom: '16px' }}>
                      <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{car.fuelType}</span>
                      <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{car.seats}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Base Rate</span>
                      <strong style={{ fontSize: '1.15rem', color: '#0f766e', fontWeight: 900 }}>₹{car.baseDayRate.toLocaleString()}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/day</span>
                    </div>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: isSelected ? '#0f766e' : '#e2e8f0',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSelected ? <HiOutlineCheckCircle size={18} /> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 2: Schedule, Delivery &amp; Trip Scope
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Configuring: <strong>{selectedCar.name}</strong>
          </p>

          <div style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
            {/* Occasion / Purpose & Date */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Rental Start Date
                </label>
                <input
                  type="date"
                  value={rentalStartDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRentalStartDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Handover Time Slot
                </label>
                <select
                  value={deliveryTimeSlot}
                  onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', background: 'white' }}
                >
                  <option value="09:00 AM">09:00 AM (Morning Handover)</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="12:00 PM">12:00 PM (Noon)</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="05:00 PM">05:00 PM (Evening)</option>
                  <option value="08:00 PM">08:00 PM (Night Gala)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Rental Occasion / Purpose
                </label>
                <select
                  value={rentalOccasion}
                  onChange={(e) => setRentalOccasion(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', background: 'white' }}
                >
                  <option value="Wedding / Gala Event">Wedding / Gala Event (Ribbon Grooming Available)</option>
                  <option value="VIP Corporate / Airport Escort">VIP Corporate / Airport Escort</option>
                  <option value="Personal Weekend Joyride">Personal Weekend Joyride</option>
                  <option value="Pre-Wedding / Film Shoot">Pre-Wedding / Film Shoot</option>
                  <option value="Anniversary / Celebration">Anniversary / Celebration</option>
                </select>
              </div>
            </div>

            {/* Drive Mode */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                Driving Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { id: 'Self-Drive', title: 'Self-Drive (No Chauffeur)', sub: 'Drive yourself. Zero driver fee. Requires DL.', badge: 'Popular' },
                  { id: 'Chauffeur', title: 'Chauffeur-Driven (+₹1,200/day)', sub: 'Uniformed verified pro chauffeur. White glove VIP service.', badge: 'VIP Choice' }
                ].map(opt => {
                  const isSel = driveType === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setDriveType(opt.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: `2px solid ${isSel ? '#0f766e' : '#e2e8f0'}`,
                        background: isSel ? '#f0fdfa' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.92rem', color: isSel ? '#0f766e' : '#1e293b' }}>{opt.title}</strong>
                        {isSel && <HiOutlineCheckCircle color="#0f766e" size={20} />}
                      </div>
                      <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{opt.sub}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Mode & Address */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                Handover &amp; Delivery Option
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: deliveryMode === 'doorstep' ? '12px' : 0 }}>
                {[
                  { id: 'doorstep', title: 'Doorstep Delivery (+₹499)', desc: 'Delivered to your home, hotel, or airport terminal.' },
                  { id: 'showroom', title: 'Showroom Pickup (Free)', desc: 'Pick up and return at ServeCircle Luxury Hub, SG Highway.' }
                ].map(del => {
                  const isSel = deliveryMode === del.id;
                  return (
                    <div
                      key={del.id}
                      onClick={() => setDeliveryMode(del.id)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isSel ? '#0f766e' : '#e2e8f0'}`,
                        background: isSel ? '#f0fdfa' : 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem', color: isSel ? '#0f766e' : '#1e293b', display: 'block' }}>{del.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{del.desc}</span>
                    </div>
                  );
                })}
              </div>

              {deliveryMode === 'doorstep' && (
                <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                    Specific Delivery Address / Hotel / Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Taj Skyline Hotel / Flat 402, Sunshine Apts, Bopal"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              )}
            </div>

            {/* Sliders for Days and Distance */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                    Rental Duration:
                  </label>
                  <strong style={{ fontSize: '0.95rem', color: '#0f766e' }}>
                    {rentalDays} {rentalDays === 1 ? 'Day' : 'Days'} (₹{(selectedCar.baseDayRate * rentalDays).toLocaleString()})
                  </strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={rentalDays}
                  onChange={(e) => setRentalDays(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#0f766e' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                  <span>1 Day</span>
                  <span>3 Days (Weekend)</span>
                  <span>7 Days (Week)</span>
                  <span>14 Days (VIP)</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                    Included Trip Distance:
                  </label>
                  <strong style={{ fontSize: '0.95rem', color: '#0f766e' }}>
                    {rentalKm} km (@ ₹{selectedCar.kmRate}/km = ₹{(rentalKm * selectedCar.kmRate).toLocaleString()})
                  </strong>
                </div>
                <input
                  type="range"
                  min="60"
                  max="800"
                  step="20"
                  value={rentalKm}
                  onChange={(e) => setRentalKm(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#0f766e' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                  <span>60 km (City)</span>
                  <span>250 km (Intercity)</span>
                  <span>500 km (Touring)</span>
                  <span>800 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 3: Verification, Security &amp; Customization
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Ensure hassle-free handover with verified documentation and security coverage.
          </p>

          {driveType === 'Self-Drive' ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Indian Driving License Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. GJ-01-2022-0049281"
                  value={drivingLicense}
                  onChange={(e) => setDrivingLicense(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Original DL required at vehicle handover for fast NFC verification.
                </span>
              </div>

              {/* Zero-Dep Insurance Waiver */}
              <div
                onClick={() => setZeroDepInsurance(!zeroDepInsurance)}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `2px solid ${zeroDepInsurance ? '#0f766e' : '#e2e8f0'}`,
                  background: zeroDepInsurance ? '#f0fdfa' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block' }}>
                    Zero-Depreciation Damage Waiver (+₹999/day)
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    100% comprehensive coverage. Zero customer liability for minor road scratches or tyre punctures.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={zeroDepInsurance}
                  readOnly
                  style={{ width: '18px', height: '18px', accentColor: '#0f766e' }}
                />
              </div>

              {/* Security Deposit Hold Card */}
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <HiOutlineShieldCheck size={28} color="#854d0e" />
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#854d0e', display: 'block' }}>
                    Refundable Security Deposit: ₹10,000
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#a16207' }}>
                    Pre-authorized on card or UPI hold. Auto-released within 4 hours post vehicle return inspection.
                  </span>
                </div>
              </div>

              {/* Fuel Policy Badge */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>⛽</span>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#166534', display: 'block' }}>
                    Same-to-Same Fuel Policy
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#15803d' }}>
                    Vehicle delivered with 100% full tank. Please return with full tank for zero fuel charges.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  Chauffeur Language Preference
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['Hindi / English', 'Gujarati / Hindi', 'English Pro'].map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setChauffeurLanguage(lang)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1.5px solid ${chauffeurLanguage === lang ? '#0f766e' : '#cbd5e1'}`,
                        background: chauffeurLanguage === lang ? '#f0fdfa' : 'white',
                        color: chauffeurLanguage === lang ? '#0f766e' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* VIP Chauffeur Inclusions */}
              <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '14px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 800, color: '#0f766e' }}>
                  ✨ Included Chauffeur VIP Amenities
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#134e4a', lineHeight: 1.6 }}>
                  <li>Police-vetted professional chauffeur in formal suit &amp; white gloves</li>
                  <li>Complimentary chilled packaged mineral water &amp; wet wipes</li>
                  <li>In-cabin high-speed Wi-Fi hotspot &amp; iPhone/Type-C fast chargers</li>
                  <li>Sanitization seal &amp; luggage loading/unloading assistance</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 4: Review Quotation &amp; Confirm
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Your transparent, authoritative ServeCircle quote with zero hidden charges.
          </p>

          <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                  {selectedCar.name}
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 700 }}>
                  ● {driveType} • {rentalDays} Days ({rentalStartDate} @ {deliveryTimeSlot})
                </span>
                {deliveryMode === 'doorstep' && (
                  <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                    Delivery: {deliveryAddress}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '2rem' }}>{selectedCar.image}</span>
            </div>

            <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem', color: '#334155', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Vehicle Hire ({rentalDays}d @ ₹{selectedCar.baseDayRate.toLocaleString()}/d):</span>
                <strong>₹{baseTotal.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Distance Allowance ({rentalKm} km @ ₹{selectedCar.kmRate}/km):</span>
                <strong>₹{kmTotal.toLocaleString()}</strong>
              </div>
              {driverFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Chauffeur Allowance ({rentalDays}d @ ₹1,200/d):</span>
                  <strong>₹{driverFee.toLocaleString()}</strong>
                </div>
              )}
              {deliveryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Doorstep Delivery &amp; Pickup:</span>
                  <strong>₹{deliveryFee.toLocaleString()}</strong>
                </div>
              )}
              {insuranceFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Zero-Depreciation Insurance Waiver:</span>
                  <strong>₹{insuranceFee.toLocaleString()}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>GST (18%):</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Total Payable Amount</span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>All Taxes &amp; Insurance Included</span>
              </div>
              <strong style={{ fontSize: '1.6rem', color: '#0f766e', fontWeight: 900 }}>
                ₹{total.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      );
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER FLOW 2: SCHOOL COMMUTE SUBSCRIPTION
  // ─────────────────────────────────────────────────────────────
  const renderSchoolFlow = () => {
    const { base, vehicleAddon, attendantAddon, total } = calcSchoolTotal();

    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 1: Student &amp; School Profile
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Provide basic student and school routing details to establish your dedicated school route.
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Student Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Aarav Patel"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Grade / Age Category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { id: 'Pre-Primary (Nursery - KG)', desc: 'Includes booster seat' },
                  { id: 'Primary (Grade 1 - 5)', desc: 'Doorstep escort assistance' },
                  { id: 'High School (Grade 6 - 12)', desc: 'Direct gate drop' }
                ].map(gr => {
                  const isSel = childGrade === gr.id;
                  return (
                    <div
                      key={gr.id}
                      onClick={() => setChildGrade(gr.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: `1.5px solid ${isSel ? '#2563eb' : '#cbd5e1'}`,
                        background: isSel ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <strong style={{ fontSize: '0.82rem', color: isSel ? '#2563eb' : '#1e293b', display: 'block' }}>{gr.id}</strong>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{gr.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                School Name
              </label>
              <select
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', background: 'white' }}
              >
                <option value="Delhi Public School (DPS)">Delhi Public School (DPS Bopal / East)</option>
                <option value="Podar International School">Podar International School</option>
                <option value="The Riverside School">The Riverside School (Cantonment)</option>
                <option value="St. Xavier's High School">St. Xavier's High School (Loyola Hall)</option>
                <option value="Adani Vidya Mandir">Adani Vidya Mandir (Makarba)</option>
                <option value="Other">Other / Unlisted School</option>
              </select>
            </div>

            {schoolName === 'Other' && (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Enter School Name &amp; Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anand Niketan, Shilaj"
                  value={customSchoolName}
                  onChange={(e) => setCustomSchoolName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Home Pickup Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Sunshine Apts"
                  value={schoolPickupAddress}
                  onChange={(e) => setSchoolPickupAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  School Campus Drop Gate
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gate 1, Primary Section"
                  value={schoolDropGate}
                  onChange={(e) => setSchoolDropGate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 2: Commute Shift &amp; Timings
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Choose whether you require morning drop, afternoon return, or two-way commute.
          </p>

          <div style={{ display: 'grid', gap: '18px' }}>
            {/* Start Date */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Subscription Start Schedule
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {['Immediate / Tomorrow', 'Next Monday', '1st of Next Month'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSchoolStartDate(st)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${schoolStartDate === st ? '#2563eb' : '#cbd5e1'}`,
                      background: schoolStartDate === st ? '#eff6ff' : 'white',
                      color: schoolStartDate === st ? '#2563eb' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Shift Mode */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                Commute Direction
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { id: 'Round-Trip', title: 'Round-Trip (Two-Way)', price: '₹3,499/mo', desc: 'Morning pickup + Afternoon return' },
                  { id: 'Morning-Only', title: 'Morning Drop Only', price: '₹2,199/mo', desc: 'Home to School drop only' },
                  { id: 'Afternoon-Only', title: 'Afternoon Pickup Only', price: '₹2,199/mo', desc: 'School to Home pickup only' }
                ].map(sh => {
                  const isSel = schoolShift === sh.id;
                  return (
                    <div
                      key={sh.id}
                      onClick={() => setSchoolShift(sh.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: `2px solid ${isSel ? '#2563eb' : '#e2e8f0'}`,
                        background: isSel ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <strong style={{ fontSize: '0.88rem', color: isSel ? '#2563eb' : '#1e293b', display: 'block' }}>{sh.title}</strong>
                      <span style={{ fontSize: '0.92rem', color: '#16a34a', fontWeight: 900, display: 'block', margin: '4px 0' }}>{sh.price}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{sh.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timings */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                  Morning Doorstep Pickup Time
                </label>
                <select
                  value={morningPickupTime}
                  onChange={(e) => setMorningPickupTime(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                >
                  <option value="06:30 AM">06:30 AM</option>
                  <option value="07:00 AM">07:00 AM</option>
                  <option value="07:15 AM">07:15 AM</option>
                  <option value="07:30 AM">07:30 AM</option>
                  <option value="08:00 AM">08:00 AM</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                  Afternoon School Gate Return Time
                </label>
                <select
                  value={afternoonReturnTime}
                  onChange={(e) => setAfternoonReturnTime(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                >
                  <option value="01:30 PM">01:30 PM (Pre-Primary)</option>
                  <option value="02:00 PM">02:00 PM (Primary)</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:30 PM">03:30 PM (High School)</option>
                </select>
              </div>
            </div>

            {/* Vehicle Fleet */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                Commute Fleet Class
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { id: 'Dedicated AC Kids Van (Max 4)', desc: 'Spacious seating, certified child locks & individual seatbelts.' },
                  { id: 'Executive Compact Sedan (+₹600/mo)', desc: 'Max 2 students. High executive privacy and direct non-stop transit.' }
                ].map(v => {
                  const isSel = schoolVehicleType.includes(v.id.substring(0, 15));
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSchoolVehicleType(v.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isSel ? '#2563eb' : '#e2e8f0'}`,
                        background: isSel ? '#eff6ff' : 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem', color: isSel ? '#2563eb' : '#1e293b', display: 'block' }}>{v.id}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 3: Child Safety Shield &amp; Parent Emergency Controls
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Industry-leading child safety measures and emergency contacts included with every pass.
          </p>

          <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
            {/* Standard Safety Shield Card */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#2563eb', color: 'white', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                  <HiOutlineShieldCheck size={22} />
                </span>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#1e40af', fontWeight: 800 }}>
                    ServeCircle 4-Point Kids Safety Guarantee (Included Free)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#1e3a8a', lineHeight: 1.6 }}>
                    <li><strong>Police-Verified Chauffeur:</strong> 5+ years verified clean school driving record.</li>
                    <li><strong>In-Cab Live Dashcam Feed:</strong> Live parent video access via app during transit.</li>
                    <li><strong>Geofence Arrival Alerts:</strong> Automatic WhatsApp/SMS ping when entering school &amp; home gate.</li>
                    <li><strong>Emergency SOS Panic Cord:</strong> Direct telemetry connection to ServeCircle Desk.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Vacation Pause Guarantee */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem' }}>🏖️</span>
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#166534', display: 'block' }}>
                  School Term Break Pause Guarantee
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#15803d' }}>
                  Diwali or exam term breaks? Pause your subscription anytime in-app; unused days automatically rollover.
                </span>
              </div>
            </div>

            {/* Optional Female Attendant Addon */}
            <div
              onClick={() => setFemaleAttendant(!femaleAttendant)}
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: `2px solid ${femaleAttendant ? '#2563eb' : '#e2e8f0'}`,
                background: femaleAttendant ? '#f0f5fa' : 'white',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block' }}>
                  Dedicated On-Board Female Attendant (+₹499/month)
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Assists with school bags, seatbelt buckling, hydration, and safe road crossing at gate.
                </span>
              </div>
              <input
                type="checkbox"
                checked={femaleAttendant}
                readOnly
                style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
              />
            </div>

            {/* Dual Parent Contacts */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Primary Parent Mobile (Receives Live Alerts)
                </label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Secondary / Mother Contact &amp; Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pooja Patel • 9876501234"
                  value={`${secondaryGuardianName} • ${secondaryGuardianPhone}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parts = val.split('•');
                    setSecondaryGuardianName(parts[0]?.trim() || '');
                    setSecondaryGuardianPhone(parts[1]?.trim() || '');
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {/* Medical / Allergy Notes */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                Child Medical / Motion Sickness Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Mild motion sickness on highway — prefers front window seat"
                value={childMedicalNotes}
                onChange={(e) => setChildMedicalNotes(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 4: Monthly Pass Summary &amp; Confirmation
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Review your child's monthly commute pass details before activation.
          </p>

          <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#1e293b' }}>
                    Student: {childName}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>
                    {schoolName === 'Other' ? customSchoolName : schoolName} • {childGrade}
                  </span>
                </div>
                <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px' }}>
                  {schoolShift}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '8px 0 0 0' }}>
                Pickup: {schoolPickupAddress} ({morningPickupTime}) ⇄ Drop: {schoolDropGate} ({afternoonReturnTime})
              </p>
              <span style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                Starts: {schoolStartDate} • Guardians: {parentContact} / {secondaryGuardianPhone}
              </span>
            </div>

            <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem', color: '#334155', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Monthly School Commute ({schoolShift}):</span>
                <strong>₹{base.toLocaleString()}</strong>
              </div>
              {vehicleAddon > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Executive Compact Sedan Upgrade:</span>
                  <strong>₹{vehicleAddon.toLocaleString()}</strong>
                </div>
              )}
              {attendantAddon > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Dedicated Female Attendant On-Board:</span>
                  <strong>₹{attendantAddon.toLocaleString()}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                <span>Live Dashcam &amp; Geo-Fence Safety Suite:</span>
                <strong>FREE (Included)</strong>
              </div>
            </div>

            <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Monthly Pass Total</span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Zero surge pricing guarantee</span>
              </div>
              <strong style={{ fontSize: '1.6rem', color: '#2563eb', fontWeight: 900 }}>
                ₹{total.toLocaleString()}<span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>/month</span>
              </strong>
            </div>
          </div>
        </div>
      );
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER FLOW 3: CORPORATE CARPOOL HUB
  // ─────────────────────────────────────────────────────────────
  const renderCarpoolFlow = () => {
    const { base, daysAddon, total, savings } = calcCarpoolTotal();

    if (step === 1) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 1: Corporate Route &amp; Tech Park Cluster
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Enter your workplace and route to match with verified executive co-riders.
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Workplace / Organization
              </label>
              <select
                value={corporateOrg}
                onChange={(e) => setCorporateOrg(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', background: 'white' }}
              >
                <option value="TCS / Tata Consultancy Services">TCS (GIFT City / Gandhinagar)</option>
                <option value="Infosys Technologies">Infosys Technologies</option>
                <option value="Amazon Development Centre">Amazon Development Centre</option>
                <option value="Google Operations">Google Operations</option>
                <option value="GIFT City BFSI Cluster (NSE / BSE / Banks)">GIFT City BFSI Cluster</option>
                <option value="L&T Technology Services">L&T Technology Services</option>
                <option value="Reliance Industries Limited">Reliance Industries / Infocity</option>
                <option value="Other">Other Corporate Campus</option>
              </select>
            </div>

            {corporateOrg === 'Other' && (
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Enter Company / Building Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Adani Shantigram Corporate House"
                  value={customOrgName}
                  onChange={(e) => setCustomOrgName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Official Work Email (Unlocks Corporate Verified Co-Rider Badge)
              </label>
              <input
                type="email"
                placeholder="e.g. rahul.patel@tcs.com"
                value={corporateEmail}
                onChange={(e) => setCorporateEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Home Pickup Cluster
                </label>
                <select
                  value={homeCluster}
                  onChange={(e) => setHomeCluster(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                >
                  <option value="Bopal / South Bopal">Bopal / South Bopal</option>
                  <option value="SG Highway / Gota">SG Highway / Gota</option>
                  <option value="Prahlad Nagar / Satellite">Prahlad Nagar / Satellite</option>
                  <option value="Chandkheda / Motera">Chandkheda / Motera</option>
                  <option value="Science City / Sola">Science City / Sola</option>
                  <option value="Vastrapur / Bodakdev">Vastrapur / Bodakdev</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Corporate Destination
                </label>
                <select
                  value={officePark}
                  onChange={(e) => setOfficePark(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                >
                  <option value="GIFT City FinTech Zone">GIFT City FinTech Zone</option>
                  <option value="Mindspace IT Park">Mindspace IT Park</option>
                  <option value="Infocity Gandhinagar">Infocity Gandhinagar</option>
                  <option value="Prahlad Nagar Corporate Road">Prahlad Nagar Corporate Road</option>
                  <option value="SG Highway Corporate Corridor">SG Highway Corporate Corridor</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Specific Society Gate / Pickup Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Main Gate 1, Gala Aria, South Bopal"
                value={pickupLandmark}
                onChange={(e) => setPickupLandmark(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 2: Commute Timings &amp; Vehicle Tier
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Align your work schedule with fellow verified professionals.
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Commute Start Schedule
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {['Immediate / Tomorrow', 'Next Monday', '1st of Next Month'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCarpoolStartDate(st)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${carpoolStartDate === st ? '#363027' : '#cbd5e1'}`,
                      background: carpoolStartDate === st ? '#faf7f2' : 'white',
                      color: carpoolStartDate === st ? '#363027' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                  Morning In-Time
                </label>
                <select
                  value={morningInTime}
                  onChange={(e) => setMorningInTime(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                >
                  <option value="08:30 AM">08:30 AM</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                  Evening Out-Time
                </label>
                <select
                  value={eveningOutTime}
                  onChange={(e) => setEveningOutTime(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: 'white' }}
                >
                  <option value="05:30 PM">05:30 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                  <option value="06:30 PM">06:30 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                  <option value="07:30 PM">07:30 PM</option>
                </select>
              </div>
            </div>

            {/* Commute Days */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Work Week Schedule
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { days: 5, label: '5 Days / Week (Mon-Fri)', sub: 'Standard IT/Corporate' },
                  { days: 6, label: '6 Days / Week (Mon-Sat)', sub: 'Corporate + Weekend (+₹299)' }
                ].map(d => {
                  const isSel = carpoolDays === d.days;
                  return (
                    <div
                      key={d.days}
                      onClick={() => setCarpoolDays(d.days)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: `1.5px solid ${isSel ? '#363027' : '#e2e8f0'}`,
                        background: isSel ? '#faf7f2' : 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ fontSize: '0.85rem', color: isSel ? '#363027' : '#1e293b', display: 'block' }}>{d.label}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{d.sub}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Tier */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Vehicle Fleet Tier
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { id: 'Sedan', name: 'Executive Sedan (Ciaz / City)', price: '₹1,299/mo', desc: 'Share with max 2 executives. High fuel savings.' },
                  { id: 'SUV', name: 'VIP Executive SUV (Hycross / Safari)', price: '₹2,499/mo', desc: 'Max 3 executives. Captain seats, extra legroom & laptop trays.' }
                ].map(v => {
                  const isSel = carpoolVehicleTier === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setCarpoolVehicleTier(v.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: `2px solid ${isSel ? '#363027' : '#e2e8f0'}`,
                        background: isSel ? '#faf7f2' : 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ fontSize: '0.88rem', color: isSel ? '#363027' : '#1e293b', display: 'block' }}>{v.name}</strong>
                      <span style={{ fontSize: '0.95rem', color: '#0f766e', fontWeight: 900, display: 'block', margin: '4px 0' }}>{v.price}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 3: Co-Rider Preferences &amp; Matched Cohort
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Tailor your commute ambiance and preview verified corporate co-riders on your route.
          </p>

          <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
            {/* Delay Backup SLA Card */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem' }}>🛡️</span>
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#166534', display: 'block' }}>
                  ServeCircle Guaranteed Backup Cab SLA
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#15803d' }}>
                  If your carpool cab is ever delayed by &gt;10 mins, ServeCircle dispatches an instant solo VIP cab at ZERO extra charge!
                </span>
              </div>
            </div>

            {/* Quiet Mode */}
            <div
              onClick={() => setQuietRideMode(!quietRideMode)}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${quietRideMode ? '#363027' : '#e2e8f0'}`,
                background: quietRideMode ? '#faf7f2' : 'white',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#1e293b', display: 'block' }}>
                  🤫 Quiet Commute Mode (No calls on speaker)
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Peaceful cabin environment for work catch-up or relaxation.
                </span>
              </div>
              <input type="checkbox" checked={quietRideMode} readOnly style={{ width: '18px', height: '18px', accentColor: '#363027' }} />
            </div>

            {/* Women-Only Cohort */}
            <div
              onClick={() => setWomenOnlyCohort(!womenOnlyCohort)}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${womenOnlyCohort ? '#ec4899' : '#e2e8f0'}`,
                background: womenOnlyCohort ? '#fdf2f8' : 'white',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.88rem', color: womenOnlyCohort ? '#be185d' : '#1e293b', display: 'block' }}>
                  🌸 Women-Only Carpool Cohort
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Matches exclusively with verified women corporate executives.
                </span>
              </div>
              <input type="checkbox" checked={womenOnlyCohort} readOnly style={{ width: '18px', height: '18px', accentColor: '#ec4899' }} />
            </div>

            {/* Luggage Allowance Badge */}
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>🎒</span>
              <span style={{ fontSize: '0.76rem', color: '#475569' }}>
                <strong>Dedicated Bag Space:</strong> 1 Laptop Backpack + 1 Gym/Office Bag permitted per passenger.
              </span>
            </div>

            {/* Cohort Live Preview */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b' }}>
                  👥 Verified Co-Riders on Your Route ({homeCluster} ⇄ {officePark}):
                </span>
                <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800, background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                  ● 3 Active Seats
                </span>
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {[
                  { name: 'Priya M.', role: 'Senior Tech Lead @ Amazon', time: morningInTime, badge: 'Verified Pro' },
                  { name: 'Kunal S.', role: 'VP Corporate Banking @ GIFT City', time: morningInTime, badge: 'Daily Commuter' },
                  { name: 'Rohan V.', role: 'Enterprise Architect @ TCS', time: morningInTime, badge: 'Verified Pro' }
                ].map((co, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: '#1e293b', display: 'block' }}>{co.name}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{co.role} • Departs {co.time}</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#0f766e', fontWeight: 700, background: '#f0fdfa', padding: '3px 8px', borderRadius: '6px' }}>
                      ✓ {co.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 900, marginBottom: '6px' }}>
            Step 4: Monthly Carpool Pass Summary
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
            Slash monthly commute stress and fuel expenses with ServeCircle verified carpool.
          </p>

          <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1.5px solid #e2e8f0', padding: '24px', marginBottom: '20px' }}>
            {/* Savings Banner */}
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#166534', display: 'block' }}>
                  🎉 Estimated Fuel &amp; Maintenance Savings:
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#15803d' }}>Based on daily solo driving on SG Highway / GIFT City route</span>
              </div>
              <strong style={{ fontSize: '1.2rem', color: '#166534', fontWeight: 900 }}>
                ~₹{savings.toLocaleString()}/mo
              </strong>
            </div>

            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#1e293b' }}>
                Route: {homeCluster} ⇄ {officePark}
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '4px 0 0 0' }}>
                Pickup: {pickupLandmark} • Org: {corporateOrg === 'Other' ? customOrgName : corporateOrg} ({corporateEmail})
              </p>
              <span style={{ fontSize: '0.72rem', color: '#363027', fontWeight: 700, background: '#faf7f2', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '6px' }}>
                Starts: {carpoolStartDate} • Shift: {morningInTime} In ⇄ {eveningOutTime} Out ({carpoolDays} Days/Week)
              </span>
            </div>

            <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem', color: '#334155', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Executive Carpool Monthly Pass ({carpoolVehicleTier}):</span>
                <strong>₹{base.toLocaleString()}</strong>
              </div>
              {daysAddon > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>6-Day Commute Surcharge:</span>
                  <strong>₹{daysAddon.toLocaleString()}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                <span>Fast-Lane Fastag Toll Pass &amp; AC Included:</span>
                <strong>FREE (Included)</strong>
              </div>
            </div>

            <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Monthly Pass Total</span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Zero cancellation penalty</span>
              </div>
              <strong style={{ fontSize: '1.6rem', color: '#363027', fontWeight: 900 }}>
                ₹{total.toLocaleString()}<span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>/month</span>
              </strong>
            </div>
          </div>
        </div>
      );
    }
  };

  // ─────────────────────────────────────────────────────────────
  // MAIN COMPONENT WRAPPER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '780px', alignSelf: 'center', marginTop: '20px' }}>
        <button
          onClick={() => navigate('/customer/travel-commute')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#334155',
            fontWeight: 800,
            fontSize: '0.88rem',
            background: 'white',
            border: '1.5px solid #e2e8f0',
            cursor: 'pointer',
            marginBottom: '20px',
            padding: '8px 18px',
            borderRadius: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease'
          }}
        >
          <HiOutlineArrowLeft /> Back to Travel &amp; Commute Hub
        </button>

        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {/* Header Banner */}
          <div style={{
            background: theme.gradient,
            padding: '36px 30px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.18)',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              flexShrink: 0
            }}>
              {theme.icon}
            </div>
            <div style={{ zIndex: 1 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
                ServeCircle Premium Mobility
              </span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '2px 0 0 0', color: '#ffffff' }}>
                {theme.title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '0.85rem', margin: '4px 0 0 0', fontWeight: 600 }}>
                {theme.subtitle}
              </p>
            </div>
          </div>

          {/* Stepper Progress */}
          <div style={{ padding: '20px 30px 0 30px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b' }}>
                Step {step} of {maxSteps}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.color }}>
                {Math.round((step / maxSteps) * 100)}% Completed
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(step / maxSteps) * 100}%`,
                  background: theme.color,
                  borderRadius: '10px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div style={{ padding: '30px' }}>
            {flowType === 'luxury-rental' && renderLuxuryFlow()}
            {flowType === 'school-commute' && renderSchoolFlow()}
            {flowType === 'corporate-carpool' && renderCarpoolFlow()}

            {errorMsg && (
              <div style={{
                color: '#b91c1c',
                background: '#fef2f2',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #fecaca'
              }}>
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            {/* Stepper Buttons */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  style={{
                    padding: '14px 22px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    background: 'white',
                    color: '#334155',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ← Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  fontSize: '1rem',
                  fontWeight: 900,
                  background: theme.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: `0 6px 18px -4px ${theme.color}`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                {loading
                  ? 'Processing Booking...'
                  : step === maxSteps
                  ? 'Confirm & Proceed to Checkout →'
                  : 'Continue to Next Step →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPremiumFlow;
