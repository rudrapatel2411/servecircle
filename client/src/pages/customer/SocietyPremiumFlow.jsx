import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineBolt, 
  HiOutlineSparkles, HiOutlineUserGroup, HiOutlineShieldCheck,
  HiOutlineDocumentText, HiOutlineGift, HiOutlineClock,
  HiOutlineMapPin, HiOutlineStar, HiOutlineShare, HiOutlineClipboardDocumentCheck,
  HiOutlinePhone, HiOutlineInformationCircle, HiOutlineCheck
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const SocietyPremiumFlow = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowType = searchParams.get('type') || 'community-fitness';
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Common Society / Flat inputs
  const [societyName, setSocietyName] = useState('Greenwood Heights');
  const [towerBlock, setTowerBlock] = useState('Tower B');
  const [flatNumber, setFlatNumber] = useState('B-704');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // 1. Community Yoga & Zumba States
  const [fitnessDiscipline, setFitnessDiscipline] = useState('hatha-yoga');
  const [fitnessVenue, setFitnessVenue] = useState('clubhouse');
  const [batchFormat, setBatchFormat] = useState('open-group');
  const [estimatedParticipants, setEstimatedParticipants] = useState(8);
  const [fitnessTimeSlot, setFitnessTimeSlot] = useState('06:15 AM - 07:15 AM');
  const [fitnessFrequency, setFitnessFrequency] = useState('weekday-pass');
  const [addOnMats, setAddOnMats] = useState(true);
  const [addOnSoundSystem, setAddOnSoundSystem] = useState(true);

  // 2. EV Charger Installation States
  const [vehicleCategory, setVehicleCategory] = useState('4-wheeler');
  const [chargerModel, setChargerModel] = useState('wallbox-7kw');
  const [parkingLevel, setParkingLevel] = useState('basement-2');
  const [meterDistance, setMeterDistance] = useState('medium');
  const [parkingBayNo, setParkingBayNo] = useState('B2-114');
  const [includeRwaNoc, setIncludeRwaNoc] = useState(true);
  const [addOnShockMcb, setAddOnShockMcb] = useState(true);
  const [addOnWeatherproofBox, setAddOnWeatherproofBox] = useState(true);

  // 3. Waterless Car Wash States
  const [carType, setCarType] = useState('sedan');
  const [carRegistration, setCarRegistration] = useState('MH-02-CB-4521');
  const [carColor, setCarColor] = useState('Pearl White');
  const [washPlanTier, setWashPlanTier] = useState('daily-eco');
  const [washTimeSlot, setWashTimeSlot] = useState('07:00 AM - 08:30 AM');
  const [washParkingSlot, setWashParkingSlot] = useState('Slot B1-42');
  const [addOnCarnaubaWax, setAddOnCarnaubaWax] = useState(true);

  const validFlows = [
    'community-fitness', 'ev-charger', 'waterless-wash', 
    'cleanups', 'guards', 'contracts', 'packages'
  ];

  useEffect(() => {
    if (!validFlows.includes(flowType)) {
      navigate('/customer/society-management');
    }
  }, [flowType, navigate]);

  const handleDirectBooking = (serviceName, priceString, serviceId) => {
    setLoadingId(serviceId);
    setTimeout(() => {
      const price = parseInt(priceString.replace(/[^\d]/g, ''), 10);
      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&category=society-management&price=${price}`);
    }, 800);
  };

  // Pricing Calculation Engine
  const calculatePricing = () => {
    if (flowType === 'community-fitness') {
      let basePerPerson = 299;
      if (fitnessFrequency === 'weekend-workshop') basePerPerson = 499;
      else if (fitnessFrequency === 'monthly-pass') basePerPerson = 1499;

      let organizerFee = 0;
      if (batchFormat === 'private-exclusive') organizerFee = 1499;

      const grandTotal = batchFormat === 'private-exclusive' 
        ? organizerFee 
        : basePerPerson;

      return {
        basePerPerson,
        organizerFee,
        grandTotal
      };
    }

    if (flowType === 'ev-charger') {
      let hardwareBase = 9999;
      if (chargerModel === 'socket-3kw') hardwareBase = 4999;
      else if (chargerModel === 'wallbox-7kw') hardwareBase = 9999;
      else if (chargerModel === 'fast-11kw') hardwareBase = 18999;
      else if (chargerModel === 'byo-install') hardwareBase = 3499;

      let cableSurge = 0;
      if (meterDistance === 'medium') cableSurge = 1200;
      else if (meterDistance === 'long') cableSurge = 2800;

      let addOnsTotal = 0;
      if (addOnShockMcb) addOnsTotal += 599;
      if (addOnWeatherproofBox) addOnsTotal += 899;

      const grandTotal = hardwareBase + cableSurge + addOnsTotal;

      return {
        hardwareBase,
        cableSurge,
        addOnsTotal,
        grandTotal
      };
    }

    if (flowType === 'waterless-wash') {
      const isSuv = ['compact-suv', 'full-suv'].includes(carType);
      let planBase = 799;
      if (washPlanTier === 'daily-eco') {
        planBase = isSuv ? 999 : 799;
      } else if (washPlanTier === 'pro-glaze') {
        planBase = isSuv ? 1499 : 1199;
      } else if (washPlanTier === 'trial-single') {
        planBase = isSuv ? 399 : 299;
      }

      let addOnsTotal = 0;
      if (addOnCarnaubaWax) addOnsTotal += 349;

      const grandTotal = planBase + addOnsTotal;

      return {
        planBase,
        addOnsTotal,
        grandTotal
      };
    }

    return { grandTotal: 999 };
  };

  const pricing = calculatePricing();
  const totalSteps = 2;

  const handleCopyInviteLink = () => {
    const inviteText = `Hey Neighbors! 👋 I am scheduling a Community ${fitnessDiscipline === 'zumba-dance' ? 'Zumba Dance' : 'Yoga'} batch at ${societyName} clubhouse via ServeCircle. Let's do it together and split costs! Join here: https://servecircle.com/society-invite/${encodeURIComponent(societyName)}`;
    navigator.clipboard?.writeText?.(inviteText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleNext = () => {
    setErrorMsg('');

    if (step === 1) {
      if (flowType === 'community-fitness' && !fitnessDiscipline) {
        return setErrorMsg('Please choose a fitness discipline.');
      }
      if (flowType === 'ev-charger' && !chargerModel) {
        return setErrorMsg('Please select a charger model.');
      }
      if (flowType === 'waterless-wash' && !carRegistration) {
        return setErrorMsg('Please enter your car registration plate number.');
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (!societyName || !towerBlock) {
        return setErrorMsg('Please provide your society and tower/block details.');
      }
      finalizeBooking();
    }
  };

  const finalizeBooking = () => {
    setLoading(true);
    setTimeout(() => {
      let serviceName = '';
      let price = 0;
      let notes = '';

      if (flowType === 'community-fitness') {
        serviceName = `Community ${fitnessDiscipline.toUpperCase()} (${batchFormat.toUpperCase()})`;
        price = pricing.grandTotal;
        notes = `Society: ${societyName}, ${towerBlock}. Venue: ${fitnessVenue}. Slot: ${fitnessTimeSlot}. Pass: ${fitnessFrequency}.`;
      } else if (flowType === 'ev-charger') {
        serviceName = `EV Charger Installation (${chargerModel.toUpperCase()})`;
        price = pricing.grandTotal;
        notes = `Society: ${societyName}, Bay ${parkingBayNo}. Level: ${parkingLevel}. Distance: ${meterDistance}. RWA Drawings Included.`;
      } else if (flowType === 'waterless-wash') {
        serviceName = `Waterless Car Wash Subscription (${washPlanTier.toUpperCase()})`;
        price = pricing.grandTotal;
        notes = `Car: ${carType} (${carRegistration}, ${carColor}). Society: ${societyName}, Bay: ${washParkingSlot}. Slot: ${washTimeSlot}.`;
      }

      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&category=society-management&price=${price}&notes=${encodeURIComponent(notes)}`);
    }, 800);
  };

  const getThemeInfo = () => {
    switch (flowType) {
      case 'community-fitness': return {
        title: 'Community Yoga & Zumba Sessions',
        subtitle: 'Hire verified 500-HR certified fitness instructors for your society park or clubhouse.',
        icon: <HiOutlineUserGroup size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
        color: '#7c3aed',
        bgSoft: '#f5f3ff',
        borderActive: '#7c3aed',
        shadowActive: '0 8px 24px -4px rgba(124, 58, 237, 0.25)',
        badge: 'Split with Neighbors'
      };
      case 'ev-charger': return {
        title: 'EV Charger Setup & RWA Clearance',
        subtitle: 'End-to-end electrical load clearance, RWA drawings, shock protection & certified installation.',
        icon: <HiOutlineBolt size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: '#2563eb',
        bgSoft: '#eff6ff',
        borderActive: '#2563eb',
        shadowActive: '0 8px 24px -4px rgba(37, 99, 235, 0.25)',
        badge: 'RWA Architectural Clearance'
      };
      case 'waterless-wash': return {
        title: 'Waterless Car Wash Subscription',
        subtitle: 'Daily eco-friendly car cleaning directly in your society basement or open parking bay.',
        icon: <HiOutlineSparkles size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: '#0284c7',
        bgSoft: '#f0f9ff',
        borderActive: '#0284c7',
        shadowActive: '0 8px 24px -4px rgba(2, 132, 199, 0.25)',
        badge: 'Zero Spillage • Scratch-Free'
      };
      default: return { title: 'Society Services', subtitle: '', icon: null, gradient: '', color: '#1e293b', bgSoft: '', borderActive: '', shadowActive: '', badge: '' };
    }
  };

  const theme = getThemeInfo();
  const isCoreFlow = ['cleanups', 'guards', 'contracts', 'packages'].includes(flowType);

  const coreServicesData = {
    cleanups: [
      { id: 'c1', title: 'Park & Garden Deep Clean', price: '₹1,999', desc: 'Thorough cleaning of common parks, kids play area, and benches.' },
      { id: 'c2', title: 'Lift Lobbies Pressure Washing', price: '₹1,499', desc: 'High-pressure wash for ground floor and basement lift lobbies.' },
      { id: 'c3', title: 'Boundary Wall Touch-ups', price: '₹2,999', desc: 'Scraping and painting of society exterior boundary walls.' }
    ],
    guards: [
      { id: 'g1', title: 'Standard Security Guard', price: '₹21,999/mo', desc: '12-hour shift, trained for gate management and visitor entry.' },
      { id: 'g2', title: 'Military Veteran Guard', price: '₹28,999/mo', desc: 'Highly disciplined ex-military personnel for strict security.' },
      { id: 'g3', title: 'Fire Safety Certified Guard', price: '₹24,999/mo', desc: 'Trained in emergency evacuation and fire extinguisher usage.' }
    ],
    contracts: [
      { id: 'co1', title: 'Society Pest Control', price: '₹4,999/mo', desc: 'Monthly fogging and pest control for all common areas.' },
      { id: 'co2', title: 'Garden Maintenance', price: '₹8,999/mo', desc: 'Weekly lawn mowing, trimming, and plant care by professionals.' },
      { id: 'co3', title: 'Lobby & Corridors Cleaning', price: '₹12,999/mo', desc: 'Daily sweeping and mopping of all floor corridors.' }
    ],
    packages: [
      { id: 'p1', title: 'Small Society (5-20 Homes)', price: '₹14,999/mo', desc: 'Basic cleaning and 1 guard for small independent floors.' },
      { id: 'p2', title: 'Medium Society (21-50 Homes)', price: '₹29,999/mo', desc: '2 guards, daily cleaning, and weekly garden maintenance.' },
      { id: 'p3', title: 'Mega Society (50+ Homes)', price: '₹49,999/mo', desc: '24/7 security, daily deep clean, pest control, and manager.' }
    ]
  };

  if (isCoreFlow) {
    const subServices = coreServicesData[flowType] || [];
    return (
      <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '80px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '850px', alignSelf: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate('/customer/society-management')} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'var(--navy-600)', fontWeight: 800, fontSize: '0.9rem',
            background: 'white', border: '1px solid var(--gray-200)', cursor: 'pointer', marginBottom: '20px',
            padding: '8px 16px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <HiOutlineArrowLeft /> Back to Society Hub
          </button>

          <div style={{
            background: theme.gradient,
            padding: '30px 28px',
            borderRadius: '20px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '14px', borderRadius: '16px' }}>
              {theme.icon}
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>{theme.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Select a service plan to continue</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            {subServices.map((service) => (
              <div key={service.id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid var(--gray-200)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                      {service.title}
                    </h3>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: theme.color, background: 'var(--gray-50)', padding: '4px 8px', borderRadius: '6px' }}>
                      {service.price}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', lineHeight: '1.5', margin: 0 }}>
                    {service.desc}
                  </p>
                </div>
                <button 
                  onClick={() => handleDirectBooking(service.title, service.price, service.id)}
                  style={{
                    marginTop: '20px', width: '100%', padding: '12px',
                    background: theme.color, color: 'white', border: 'none', borderRadius: '12px',
                    fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer'
                  }}
                  disabled={loadingId === service.id}
                >
                  {loadingId === service.id ? 'Processing...' : 'Book Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderStepTracker = () => {
    let stepLabels = [];
    if (flowType === 'community-fitness') {
      stepLabels = ['Discipline & Pass Options', 'Society Schedule & Confirm'];
    } else if (flowType === 'ev-charger') {
      stepLabels = ['Vehicle & Hardware Setup', 'Parking Bay & Confirm'];
    } else if (flowType === 'waterless-wash') {
      stepLabels = ['Car Plan & Specifications', 'Schedule Slot & Confirm'];
    }

    return (
      <div style={{ padding: '20px 28px 10px 28px', background: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Step {step} of {totalSteps}
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {stepLabels[step - 1]}
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
            {Math.round((step / totalSteps) * 100)}% Completed
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalSteps}, 1fr)`, gap: '8px' }}>
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div 
              key={idx} 
              style={{
                height: '6px',
                borderRadius: '8px',
                background: idx + 1 <= step ? theme.color : '#e2e8f0',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  /* =========================================================================
     1. COMMUNITY FITNESS (2-STEP STREAMLINED)
     ========================================================================= */
  const renderFitnessStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        1. Select Fitness Discipline & Pass
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Choose workout style and community format for your society.
      </p>

      {/* Disciplines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { id: 'hatha-yoga', icon: '🧘', title: 'Hatha Yoga & Pranayama', desc: 'Stretching, breathwork, posture alignment & meditation' },
          { id: 'zumba-dance', icon: '💃', title: 'Power Zumba Dance', desc: 'High-energy cardio dance set to Latin beats' },
          { id: 'pilates-core', icon: '🤸', title: 'Mat Pilates Core', desc: 'Abdominal tightening, spine health & pelvic floor' }
        ].map((d) => {
          const isSelected = fitnessDiscipline === d.id;
          return (
            <div
              key={d.id}
              onClick={() => setFitnessDiscipline(d.id)}
              style={{
                padding: '16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{d.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>{d.title}</div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0' }}>{d.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Pass / Frequency */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Batch Frequency & Pricing
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { id: 'weekday-pass', title: 'Single Session Pass', price: '₹299/person', desc: 'Try one trial session with neighbors' },
          { id: 'weekend-workshop', title: 'Weekend Workshop (2 Days)', price: '₹499/person', desc: 'Sat & Sun 75-min intensive masterclass' },
          { id: 'monthly-pass', title: 'Monthly Society Pass', price: '₹1,499/person', desc: '12 Sessions/Month (3x Weekly)' }
        ].map((f) => {
          const isSelected = fitnessFrequency === f.id;
          return (
            <div
              key={f.id}
              onClick={() => setFitnessFrequency(f.id)}
              style={{
                padding: '14px 16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>{f.title}</div>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: theme.color, display: 'block', margin: '4px 0' }}>{f.price}</span>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Included Equipments */}
      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Included Equipment & Venue
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.82rem', color: '#065f46', fontWeight: 700 }}>
          <div>✓ Certified 500-HR Instructor</div>
          <div>✓ High-Bass Bluetooth Sound System</div>
          <div>✓ Sanitized Workout Foam Mats</div>
          <div>✓ Central Lawn or Clubhouse Venue</div>
        </div>
      </div>
    </div>
  );

  const renderFitnessStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        2. Society Location, Schedule & Confirm
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Set batch schedule and confirm your community session.
      </p>

      {/* Society Details */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Society Campus Name</label>
            <input type="text" value={societyName} onChange={(e) => setSocietyName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tower & Flat</label>
            <input type="text" value={`${towerBlock}, ${flatNumber}`} onChange={(e) => setFlatNumber(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Preferred Morning Slot</label>
            <select value={fitnessTimeSlot} onChange={(e) => setFitnessTimeSlot(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}>
              <option value="06:15 AM - 07:15 AM">Early Morning (06:15 AM - 07:15 AM)</option>
              <option value="07:30 AM - 08:30 AM">Regular Morning (07:30 AM - 08:30 AM)</option>
              <option value="06:00 PM - 07:00 PM">Sunset Evening (06:00 PM - 07:00 PM)</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.82rem', color: '#475569' }}>Want to split with neighbors? Copy invite link:</span>
          <button onClick={handleCopyInviteLink} style={{ background: theme.bgSoft, border: `1px solid ${theme.color}`, color: theme.color, borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}>
            {copiedLink ? '✓ Copied!' : 'Copy WhatsApp Invite'}
          </button>
        </div>
      </div>

      {/* Instructor Card */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          🧘
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)' }}>Priya Sharma</h4>
            <span style={{ background: '#f5f3ff', color: theme.color, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>500-HR Yoga Alliance Certified</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            8+ years instructing in premium gated societies • Tailored for all age groups
          </p>
        </div>
      </div>

      {/* Pricing Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '6px' }}>
          <span>{fitnessDiscipline.toUpperCase()} ({fitnessFrequency.replace('-', ' ').toUpperCase()})</span>
          <span>₹{pricing.grandTotal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
          <span>Sound System & Workout Mats Deployment</span>
          <span>FREE (₹0)</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Total Fee:</strong>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{pricing.grandTotal}</span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     2. EV CHARGER INSTALLATION (2-STEP STREAMLINED)
     ========================================================================= */
  const renderEvStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        1. Select EV Charger Hardware & Setup
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Certified EV wallbox chargers with included RWA electrical drawing clearances.
      </p>

      {/* Vehicle Category */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {['4-wheeler', '2-wheeler'].map((cat) => (
          <button
            key={cat}
            onClick={() => setVehicleCategory(cat)}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              border: `2px solid ${vehicleCategory === cat ? theme.color : '#e2e8f0'}`,
              background: vehicleCategory === cat ? theme.bgSoft : 'white',
              fontWeight: 800, fontSize: '0.88rem', color: vehicleCategory === cat ? theme.color : '#475569',
              cursor: 'pointer'
            }}
          >
            {cat === '4-wheeler' ? '⚡ 4-Wheeler Electric Car' : '🛵 2-Wheeler Electric Scooter'}
          </button>
        ))}
      </div>

      {/* Charger Hardware */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        {[
          { id: 'wallbox-7kw', icon: '🔋', title: '7.4 kW Fast AC Wallbox', desc: 'Type-2 connector with RFID smart lock. Fastest residential charging.', price: '₹9,999' },
          { id: 'socket-3kw', icon: '🔌', title: '3.3 kW 16A Smart Socket', desc: 'Weatherproof industrial socket with Wi-Fi timer control.', price: '₹4,999' },
          { id: 'byo-install', icon: '🛠️', title: 'Bring Your Own Charger', desc: 'Installation & cabling only for charger supplied with your EV.', price: '₹3,499' }
        ].map((c) => {
          const isSelected = chargerModel === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setChargerModel(c.id)}
              style={{
                padding: '16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>{c.title}</div>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: theme.color, display: 'block', margin: '4px 0' }}>{c.price}</span>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{c.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Included Protection */}
      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Included Hardware & RWA Approvals
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.82rem', color: '#065f46', fontWeight: 700 }}>
          <div>✓ RWA Load Calculation Drawings</div>
          <div>✓ 30mA Dedicated Shock RCCB Box</div>
          <div>✓ Lockable Weatherproof Cover</div>
          <div>✓ 1-Year Comprehensive Warranty</div>
        </div>
      </div>
    </div>
  );

  const renderEvStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        2. Parking Bay, Cabling & Confirmation
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Specify your parking bay location and review total setup costs.
      </p>

      {/* Location inputs */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Society Name</label>
            <input type="text" value={societyName} onChange={(e) => setSocietyName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Parking Bay / Slot No.</label>
            <input type="text" value={parkingBayNo} onChange={(e) => setParkingBayNo(e.target.value)} placeholder="e.g. B2-114" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Distance from Meter Room</label>
            <select value={meterDistance} onChange={(e) => setMeterDistance(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}>
              <option value="short">Standard (&lt; 15 meters) - ₹0</option>
              <option value="medium">Medium (15 - 35 meters) - +₹1,200</option>
              <option value="long">Extended (35 - 60+ meters) - +₹2,800</option>
            </select>
          </div>
        </div>
      </div>

      {/* Engineer Card */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          ⚡
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)' }}>Er. Rakesh Trivedi</h4>
            <span style={{ background: '#eff6ff', color: theme.color, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>Grade-A Electrical Supervisor #GJ-4921</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            500+ society EVSE installations • Discom load sanction & RWA documentation guarantee
          </p>
        </div>
      </div>

      {/* Pricing Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '6px' }}>
          <span>Charger Hardware ({chargerModel.toUpperCase()})</span>
          <span>₹{pricing.hardwareBase}</span>
        </div>
        {pricing.cableSurge > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
            <span>Conduit & Armored Cabling</span>
            <span>+₹{pricing.cableSurge}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
          <span>RWA Architectural Drawing Clearance</span>
          <span>FREE (₹0)</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Total Installation Cost:</strong>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{pricing.grandTotal}</span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     3. WATERLESS CAR WASH (2-STEP STREAMLINED)
     ========================================================================= */
  const renderWashStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        1. Car Specifications & Subscription Tier
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Choose your car category and daily waterless cleaning plan.
      </p>

      {/* Car Type */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {[
          { id: 'hatchback', title: 'Hatchback', icon: '🚗' },
          { id: 'sedan', title: 'Sedan', icon: '🚘' },
          { id: 'compact-suv', title: 'Compact SUV', icon: '🚙' },
          { id: 'full-suv', title: 'Full SUV / MUV', icon: '🚐' }
        ].map((c) => (
          <div
            key={c.id}
            onClick={() => setCarType(c.id)}
            style={{
              padding: '12px 14px', borderRadius: '12px',
              border: `2px solid ${carType === c.id ? theme.color : '#e2e8f0'}`,
              background: carType === c.id ? theme.bgSoft : 'white',
              cursor: 'pointer', textAlign: 'center', fontWeight: 700, fontSize: '0.88rem',
              color: carType === c.id ? theme.color : 'var(--navy-900)'
            }}
          >
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '2px' }}>{c.icon}</span>
            {c.title}
          </div>
        ))}
      </div>

      {/* Car Details */}
      <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>License Plate No.</label>
            <input type="text" value={carRegistration} onChange={(e) => setCarRegistration(e.target.value.toUpperCase())} placeholder="e.g. MH-02-CB-4521" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Car Color</label>
            <input type="text" value={carColor} onChange={(e) => setCarColor(e.target.value)} placeholder="e.g. Pearl White" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Plan Tiers */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Select Cleaning Plan
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {[
          { id: 'daily-eco', title: 'Daily Eco Shine (6 Days/Wk)', price: '₹799/month', desc: 'Daily exterior waterless foam + glass polish' },
          { id: 'pro-glaze', title: 'Pro Glaze + Interior', price: '₹1,199/month', desc: 'Daily exterior + weekly interior vacuuming' },
          { id: 'trial-single', title: 'Single Trial Deep Clean', price: '₹299 one-time', desc: 'One-off full exterior & tire gloss trial' }
        ].map((p) => {
          const isSelected = washPlanTier === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setWashPlanTier(p.id)}
              style={{
                padding: '14px 16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>{p.title}</div>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: theme.color, display: 'block', margin: '4px 0' }}>{p.price}</span>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{p.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWashStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        2. Parking Bay, Morning Slot & Confirm
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Specify where your vehicle is parked in the society campus.
      </p>

      {/* Society Details */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Society Campus Name</label>
            <input type="text" value={societyName} onChange={(e) => setSocietyName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tower & Parking Bay</label>
            <input type="text" value={washParkingSlot} onChange={(e) => setWashParkingSlot(e.target.value)} placeholder="e.g. Basement B1, Slot 42" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Early Morning Slot</label>
            <select value={washTimeSlot} onChange={(e) => setWashTimeSlot(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}>
              <option value="05:30 AM - 07:00 AM">Early Bird (05:30 AM - 07:00 AM)</option>
              <option value="07:00 AM - 08:30 AM">Regular Morning (07:00 AM - 08:30 AM)</option>
              <option value="08:30 AM - 10:00 AM">Flexible (08:30 AM - 10:00 AM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailer Card */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          ✨
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)' }}>Deepak Verma</h4>
            <span style={{ background: '#f0f9ff', color: theme.color, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>Master Detailer</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Scratch-free ultra-soft microfiber cloths • Zero water spillage (100% RWA compliant)
          </p>
        </div>
      </div>

      {/* Pricing Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '6px' }}>
          <span>{carRegistration} ({washPlanTier.toUpperCase()})</span>
          <span>₹{pricing.planBase}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
          <span>1-Click Pause & Resume Subscription when traveling</span>
          <span>FREE (₹0)</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Total Subscription:</strong>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{pricing.grandTotal}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-content" style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/customer/society-management')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            color: 'var(--navy-800)', fontSize: '0.95rem', fontWeight: 700, padding: 0
          }}
        >
          <HiOutlineArrowLeft size={18} />
          Back to Society Hub
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          <HiOutlineShieldCheck color="#059669" size={18} />
          <span>RWA Certified & Approved</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="b2b-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        
        {/* Banner */}
        <div style={{
          background: theme.gradient,
          padding: '28px 32px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              {theme.badge}
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '8px 0 0 0' }}>
              {theme.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.88rem', margin: '4px 0 0 0', fontWeight: 600 }}>
              {theme.subtitle}
            </p>
          </div>
          <div>{theme.icon}</div>
        </div>

        {/* Progress Tracker */}
        {renderStepTracker()}

        {/* Wizard Body */}
        <div style={{ padding: '28px 32px' }}>
          {flowType === 'community-fitness' && (
            <>
              {step === 1 && renderFitnessStep1()}
              {step === 2 && renderFitnessStep2()}
            </>
          )}

          {flowType === 'ev-charger' && (
            <>
              {step === 1 && renderEvStep1()}
              {step === 2 && renderEvStep2()}
            </>
          )}

          {flowType === 'waterless-wash' && (
            <>
              {step === 1 && renderWashStep1()}
              {step === 2 && renderWashStep2()}
            </>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="animate-fade-in-up" style={{ color: '#ef4444', background: '#fef2f2', padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, marginTop: '18px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' }}>
              <HiOutlineInformationCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Navigation Footer */}
          <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
            {step > 1 && (
              <button 
                onClick={() => {
                  setStep(step - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  padding: '14px 22px', fontSize: '1rem', fontWeight: 800,
                  background: 'white', color: 'var(--navy-800)', border: '2px solid var(--gray-200)',
                  borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Previous Step
              </button>
            )}
            
            <button 
              onClick={handleNext}
              disabled={loading}
              style={{ 
                flex: 1, padding: '14px', fontSize: '1.05rem', fontWeight: 800,
                background: theme.color, color: 'white', border: 'none',
                borderRadius: '14px', cursor: 'pointer',
                boxShadow: `0 6px 18px -4px ${theme.color}`,
                transition: 'transform 0.1s, box-shadow 0.2s',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : step === totalSteps ? `Confirm Booking (₹${pricing.grandTotal})` : 'Continue to Schedule & Address →'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SocietyPremiumFlow;
