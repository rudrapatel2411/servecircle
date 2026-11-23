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
  const [addOnDetoxJuice, setAddOnDetoxJuice] = useState(false);

  // 2. EV Charger Installation States
  const [vehicleCategory, setVehicleCategory] = useState('4-wheeler');
  const [chargerModel, setChargerModel] = useState('wallbox-7kw');
  const [parkingLevel, setParkingLevel] = useState('basement-2');
  const [meterDistance, setMeterDistance] = useState('medium');
  const [parkingBayNo, setParkingBayNo] = useState('B2-114');
  const [includeRwaNoc, setIncludeRwaNoc] = useState(true);
  const [addOnRfidCard, setAddOnRfidCard] = useState(true);
  const [addOnShockMcb, setAddOnShockMcb] = useState(true);
  const [addOnWeatherproofBox, setAddOnWeatherproofBox] = useState(true);
  const [addOnSmartSubMeter, setAddOnSmartSubMeter] = useState(false);
  const [addOnAmcWarranty, setAddOnAmcWarranty] = useState(false);

  // 3. Waterless Car Wash States
  const [carType, setCarType] = useState('sedan');
  const [carRegistration, setCarRegistration] = useState('MH-02-CB-4521');
  const [carColor, setCarColor] = useState('Pearl White');
  const [washPlanTier, setWashPlanTier] = useState('daily-eco');
  const [washTimeSlot, setWashTimeSlot] = useState('07:00 AM - 08:30 AM');
  const [washParkingSlot, setWashParkingSlot] = useState('Slot B1-42');
  const [addOnCarnaubaWax, setAddOnCarnaubaWax] = useState(true);
  const [addOnPerfumeDiffuser, setAddOnPerfumeDiffuser] = useState(false);
  const [addOnWiperFluid, setAddOnWiperFluid] = useState(false);

  // Core Services Legacy States
  const [cleanupArea, setCleanupArea] = useState('');
  const [cleanupType, setCleanupType] = useState('');
  const [guardType, setGuardType] = useState('');
  const [guardDuration, setGuardDuration] = useState('');
  const [contractType, setContractType] = useState('');
  const [contractDuration, setContractDuration] = useState('');
  const [packageSize, setPackageSize] = useState('');
  const [packageLevel, setPackageLevel] = useState('');

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
      let totalBatchFee = 2499;

      if (fitnessDiscipline === 'hatha-yoga') totalBatchFee = 2499;
      else if (fitnessDiscipline === 'zumba-dance') totalBatchFee = 2499;
      else if (fitnessDiscipline === 'functional-hiit') totalBatchFee = 2899;
      else if (fitnessDiscipline === 'senior-gentle') totalBatchFee = 1999;

      if (batchFormat === 'private') {
        totalBatchFee = 1499;
        basePerPerson = 1499;
      } else if (batchFormat === 'open-group') {
        basePerPerson = Math.round(totalBatchFee / Math.max(1, estimatedParticipants));
      } else if (batchFormat === 'mega-community') {
        totalBatchFee = 3999;
        basePerPerson = Math.round(3999 / Math.max(1, estimatedParticipants));
      }

      // Frequency multiplier
      let monthlyTotal = totalBatchFee;
      if (fitnessFrequency === 'weekday-pass') {
        monthlyTotal = Math.round(totalBatchFee * 10 * 0.80); // 12 sessions with 20% bundle discount
      } else if (fitnessFrequency === 'weekend-camp') {
        monthlyTotal = Math.round(totalBatchFee * 7 * 0.85); // 8 sessions with 15% discount
      }

      let addOnsTotal = 0;
      if (addOnMats) addOnsTotal += 299;
      if (addOnDetoxJuice) addOnsTotal += 499;

      const finalResidentShare = batchFormat === 'private' ? totalBatchFee + addOnsTotal : (fitnessFrequency === 'single' ? basePerPerson : Math.round(monthlyTotal / Math.max(1, estimatedParticipants)));

      return {
        totalBatchFee,
        monthlyTotal,
        basePerPerson,
        addOnsTotal,
        finalResidentShare
      };
    }

    if (flowType === 'ev-charger') {
      let chargerBase = 9999;
      if (chargerModel === 'socket-3kw') chargerBase = 4999;
      else if (chargerModel === 'wallbox-7kw') chargerBase = 9999;
      else if (chargerModel === 'ultra-11kw') chargerBase = 18999;
      else if (chargerModel === 'byo-charger') chargerBase = 3499;

      let cablingCost = 0;
      if (meterDistance === 'medium') cablingCost = 1200;
      else if (meterDistance === 'long') cablingCost = 2400;

      let addOnsTotal = 0;
      if (addOnWeatherproofBox) addOnsTotal += 899;
      if (addOnSmartSubMeter) addOnsTotal += 1499;
      if (addOnAmcWarranty) addOnsTotal += 699;

      const grandTotal = chargerBase + cablingCost + addOnsTotal;

      return {
        chargerBase,
        cablingCost,
        addOnsTotal,
        grandTotal
      };
    }

    if (flowType === 'waterless-wash') {
      const isSuv = ['mid-suv', 'luxury-suv'].includes(carType);
      let planBase = 799;

      if (washPlanTier === 'daily-eco') {
        planBase = isSuv ? 999 : 799;
      } else if (washPlanTier === 'pro-glaze') {
        planBase = isSuv ? 1399 : 1199;
      } else if (washPlanTier === 'elite-showroom') {
        planBase = isSuv ? 1899 : 1599;
      } else if (washPlanTier === 'trial-single') {
        planBase = isSuv ? 399 : 299;
      }

      let addOnsTotal = 0;
      if (addOnCarnaubaWax) addOnsTotal += 349;
      if (addOnPerfumeDiffuser) addOnsTotal += 199;
      if (addOnWiperFluid) addOnsTotal += 149;

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

  const handleCopyInviteLink = () => {
    const inviteText = `Hey Neighbors! 👋 I am scheduling a Community ${fitnessDiscipline === 'zumba-dance' ? 'Zumba Dance Party' : 'Yoga & Fitness'} batch at ${societyName} clubhouse via ServeCircle. Let's do it together and split the cost (approx ₹${pricing.basePerPerson}/person). Join here: https://servecircle.com/society-invite/${encodeURIComponent(societyName)}`;
    navigator.clipboard?.writeText?.(inviteText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleNext = () => {
    setErrorMsg('');

    if (flowType === 'community-fitness') {
      if (step === 1 && !fitnessDiscipline) return setErrorMsg('Please choose a fitness discipline.');
      if (step === 2 && !fitnessVenue) return setErrorMsg('Please choose a venue in your society.');
      if (step === 3 && !societyName) return setErrorMsg('Please provide your society name and flat details.');
    }
    if (flowType === 'ev-charger') {
      if (step === 1 && !chargerModel) return setErrorMsg('Please select a charger model or bring your own.');
      if (step === 2 && !parkingBayNo) return setErrorMsg('Please specify your parking bay / slot number.');
      if (step === 3 && !societyName) return setErrorMsg('Please specify society and contact information.');
    }
    if (flowType === 'waterless-wash') {
      if (step === 1 && !carRegistration) return setErrorMsg('Please enter your car registration number.');
      if (step === 2 && !washPlanTier) return setErrorMsg('Please choose a subscription plan tier.');
      if (step === 3 && !washParkingSlot) return setErrorMsg('Please specify your parking bay number.');
    }

    // Core Flows Step 1 to 2
    if (flowType === 'cleanups') {
      if (step === 1 && !cleanupArea) return setErrorMsg('Please select a cleanup area.');
      if (step === 2 && !cleanupType) return setErrorMsg('Please select a booking type.');
    }
    if (flowType === 'guards') {
      if (step === 1 && !guardType) return setErrorMsg('Please select a guard type.');
      if (step === 2 && !guardDuration) return setErrorMsg('Please select a deployment duration.');
    }
    if (flowType === 'contracts') {
      if (step === 1 && !contractType) return setErrorMsg('Please select a maintenance type.');
      if (step === 2 && !contractDuration) return setErrorMsg('Please select a contract duration.');
    }
    if (flowType === 'packages') {
      if (step === 1 && !packageSize) return setErrorMsg('Please select a society size.');
      if (step === 2 && !packageLevel) return setErrorMsg('Please select a service level.');
    }

    const maxSteps = ['community-fitness', 'ev-charger', 'waterless-wash'].includes(flowType) ? 4 : 2;

    if (step < maxSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
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
        serviceName = `Community Fitness (${fitnessDiscipline === 'zumba-dance' ? 'Zumba' : fitnessDiscipline === 'hatha-yoga' ? 'Hatha Yoga' : fitnessDiscipline === 'functional-hiit' ? 'HIIT' : 'Senior Yoga'} - ${batchFormat})`;
        price = pricing.finalResidentShare;
        notes = `Society: ${societyName}, ${towerBlock} ${flatNumber}. Venue: ${fitnessVenue}. Slot: ${fitnessTimeSlot}. Frequency: ${fitnessFrequency}. Expected: ${estimatedParticipants} neighbors.`;
      } else if (flowType === 'ev-charger') {
        serviceName = `EV Charger Setup (${chargerModel === 'wallbox-7kw' ? '7.4kW Fast Wallbox' : chargerModel === 'socket-3kw' ? '3.3kW Smart Socket' : chargerModel === 'ultra-11kw' ? '11kW Fast' : 'Installation Only'})`;
        price = pricing.grandTotal;
        notes = `Society: ${societyName}, Slot: ${parkingBayNo} (${parkingLevel}). Cabling run: ${meterDistance}. RWA NOC: Included. Safety MCB/RFID: Yes.`;
      } else if (flowType === 'waterless-wash') {
        serviceName = `Waterless Wash Sub (${carType.toUpperCase()} - ${washPlanTier})`;
        price = pricing.grandTotal;
        notes = `Car: ${carRegistration} (${carColor}). Slot: ${washParkingSlot} (${towerBlock}). Time: ${washTimeSlot}. Microfiber waterless daily clean.`;
      } else if (flowType === 'cleanups') {
        serviceName = `RWA Cleanup (${cleanupArea})`;
        price = cleanupType === 'Single Home' ? 2499 : 1999;
      } else if (flowType === 'guards') {
        serviceName = `Biometric Guard (${guardType})`;
        price = guardDuration === '12-hour Daily' ? 899 : 24999;
      } else if (flowType === 'contracts') {
        serviceName = `B2B Contract (${contractType})`;
        price = contractDuration === 'Quarterly' ? 14999 : 49999;
      } else if (flowType === 'packages') {
        serviceName = `Society Package (${packageSize})`;
        price = packageLevel === 'Standard' ? 9999 : 19999;
      }

      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&category=society-management&price=${price}&notes=${encodeURIComponent(notes)}`);
    }, 1000);
  };

  const getThemeInfo = () => {
    switch (flowType) {
      case 'community-fitness': return { 
        title: 'Community Yoga & Zumba', 
        subtitle: 'Hire a certified fitness coach for your society lawn or clubhouse. Split costs with neighbors.',
        icon: <HiOutlineUserGroup size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', 
        color: '#7c3aed', 
        bgSoft: '#f5f3ff', 
        borderActive: '#7c3aed', 
        shadowActive: '0 6px 20px rgba(124, 58, 237, 0.25)',
        badge: '🧘‍♀️ Resident Wellness & Neighbor Cost-Split'
      };
      case 'ev-charger': return { 
        title: 'EV Charger Installation', 
        subtitle: 'Dedicated EV charging in your basement bay with RWA NOC facilitation & fire-safe wiring.',
        icon: <HiOutlineBolt size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', 
        color: '#1d4ed8', 
        bgSoft: '#eff6ff', 
        borderActive: '#1d4ed8', 
        shadowActive: '0 6px 20px rgba(29, 78, 216, 0.25)',
        badge: '⚡ RWA NOC Included • Zero Power Theft'
      };
      case 'waterless-wash': return { 
        title: 'Waterless Car Wash Subscription', 
        subtitle: '100% Eco-friendly, RWA-approved daily morning clean in your parking spot. Zero water spillage.',
        icon: <HiOutlineSparkles size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
        color: '#0284c7', 
        bgSoft: '#f0f9ff', 
        borderActive: '#0284c7', 
        shadowActive: '0 6px 20px rgba(2, 132, 199, 0.25)',
        badge: '🌿 100% Scratch-Free • Saves 150L Water/Wash'
      };
      case 'cleanups': return {
        title: 'RWA Collective Cleanups', icon: <HiOutlineSparkles size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#16a34a', bgSoft: '#f0fdf4', borderActive: '#16a34a', shadowActive: '0 4px 14px rgba(22, 163, 74, 0.15)',
        badge: '🧹 Common Area Sanitization'
      };
      case 'guards': return {
        title: 'Biometric Guard Roster', icon: <HiOutlineShieldCheck size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#2563eb', bgSoft: '#eff6ff', borderActive: '#2563eb', shadowActive: '0 4px 14px rgba(37, 99, 235, 0.15)',
        badge: '🛡️ Verified Gate Personnel'
      };
      case 'contracts': return {
        title: 'Society B2B Contracts', icon: <HiOutlineDocumentText size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: '#dc2626', bgSoft: '#fef2f2', borderActive: '#dc2626', shadowActive: '0 4px 14px rgba(220, 38, 38, 0.15)',
        badge: '📄 Society AMC & Maintenance'
      };
      case 'packages': return {
        title: 'Customized Packages', icon: <HiOutlineGift size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #c026d3 0%, #a21caf 100%)', color: '#c026d3', bgSoft: '#fdf4ff', borderActive: '#c026d3', shadowActive: '0 4px 14px rgba(192, 38, 211, 0.15)',
        badge: '🎁 Society Bundled Passes'
      };
      default: return { title: 'Society Services', subtitle: '', icon: null, gradient: '', color: '#1e293b', bgSoft: '', borderActive: '', shadowActive: '', badge: '' };
    }
  };

  const theme = getThemeInfo();
  const isPremiumFlow = ['community-fitness', 'ev-charger', 'waterless-wash'].includes(flowType);
  const totalSteps = isPremiumFlow ? 4 : 2;

  const coreServicesData = {
    cleanups: [
      { id: 'c1', title: t('coreServices.cleanups.c1.title', 'Park & Garden Deep Clean'), price: '₹1,999', desc: t('coreServices.cleanups.c1.desc', 'Thorough cleaning of common parks, kids play area, and benches.') },
      { id: 'c2', title: t('coreServices.cleanups.c2.title', 'Lift Lobbies Pressure Washing'), price: '₹1,499', desc: t('coreServices.cleanups.c2.desc', 'High-pressure wash for ground floor and basement lift lobbies.') },
      { id: 'c3', title: t('coreServices.cleanups.c3.title', 'Boundary Wall Touch-ups'), price: '₹2,999', desc: t('coreServices.cleanups.c3.desc', 'Scraping and painting of society exterior boundary walls.') }
    ],
    guards: [
      { id: 'g1', title: t('coreServices.guards.g1.title', 'Standard Security Guard'), price: '₹21,999/mo', desc: t('coreServices.guards.g1.desc', '12-hour shift, trained for gate management and visitor entry.') },
      { id: 'g2', title: t('coreServices.guards.g2.title', 'Military Veteran Guard'), price: '₹28,999/mo', desc: t('coreServices.guards.g2.desc', 'Highly disciplined ex-military personnel for strict security.') },
      { id: 'g3', title: t('coreServices.guards.g3.title', 'Fire Safety Certified Guard'), price: '₹24,999/mo', desc: t('coreServices.guards.g3.desc', 'Trained in emergency evacuation and fire extinguisher usage.') }
    ],
    contracts: [
      { id: 'co1', title: t('coreServices.contracts.co1.title', 'Society Pest Control'), price: '₹4,999/mo', desc: t('coreServices.contracts.co1.desc', 'Monthly fogging and pest control for all common areas.') },
      { id: 'co2', title: t('coreServices.contracts.co2.title', 'Garden Maintenance'), price: '₹8,999/mo', desc: t('coreServices.contracts.co2.desc', 'Weekly lawn mowing, trimming, and plant care by professionals.') },
      { id: 'co3', title: t('coreServices.contracts.co3.title', 'Lobby & Corridors Cleaning'), price: '₹12,999/mo', desc: t('coreServices.contracts.co3.desc', 'Daily sweeping and mopping of all floor corridors.') }
    ],
    packages: [
      { id: 'p1', title: t('coreServices.packages.p1.title', 'Small Society (5-20 Homes)'), price: '₹14,999/mo', desc: t('coreServices.packages.p1.desc', 'Basic cleaning and 1 guard for small independent floors.') },
      { id: 'p2', title: t('coreServices.packages.p2.title', 'Medium Society (21-50 Homes)'), price: '₹29,999/mo', desc: t('coreServices.packages.p2.desc', '2 guards, daily cleaning, and weekly garden maintenance.') },
      { id: 'p3', title: t('coreServices.packages.p3.title', 'Mega Society (50+ Homes)'), price: '₹49,999/mo', desc: t('coreServices.packages.p3.desc', '24/7 security, daily deep clean, pest control, and manager.') }
    ]
  };

  const isCoreFlow = ['cleanups', 'guards', 'contracts', 'packages'].includes(flowType);

  if (isCoreFlow) {
    const subServices = coreServicesData[flowType] || [];
    return (
      <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '120px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '850px', alignSelf: 'center', marginTop: '20px' }}>
          <button onClick={() => navigate('/customer/society-management')} style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'var(--navy-600)', fontWeight: 800, fontSize: '0.9rem',
            background: 'white', border: '1px solid var(--gray-200)', cursor: 'pointer', marginBottom: '24px',
            padding: '8px 16px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}>
            <HiOutlineArrowLeft /> {t('societyFlow.back', 'Back to Society Hub')}
          </button>

          <div style={{
            background: theme.gradient,
            padding: '36px 30px',
            borderRadius: '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '32px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '20px', display: 'flex' }}>
              {theme.icon}
            </div>
            <div style={{ zIndex: 1 }}>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.25)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px' }}>
                {theme.badge}
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{theme.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: '6px 0 0 0', fontWeight: 600 }}>Select a service plan to continue</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {subServices.map((service) => (
              <div key={service.id} className="service-card-hover" style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid var(--gray-200)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0, paddingRight: '12px' }}>
                      {service.title}
                    </h3>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: theme.color, background: 'var(--gray-50)', padding: '4px 10px', borderRadius: '8px' }}>
                      {service.price}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: '1.6', margin: 0 }}>
                    {service.desc}
                  </p>
                </div>
                <button 
                  onClick={() => handleDirectBooking(service.title, service.price, service.id)}
                  style={{
                    marginTop: '24px',
                    width: '100%',
                    padding: '12px',
                    background: theme.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: `0 4px 12px -4px ${theme.color}`,
                    transition: 'transform 0.1s',
                    opacity: loadingId === service.id ? 0.7 : 1
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                  disabled={loadingId === service.id}
                >
                  {loadingId === service.id ? t('societyFlow.processing', 'Processing...') : 'Book Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Multi-Step Progress Tracker Bar
  const renderStepTracker = () => {
    let stepLabels = [];
    if (flowType === 'community-fitness') {
      stepLabels = ['Discipline & Goal', 'Venue & Neighbor Split', 'Schedule & Logistics', 'Instructor & Checkout'];
    } else if (flowType === 'ev-charger') {
      stepLabels = ['Vehicle & Charger', 'Parking Bay & Cabling', 'RWA NOC & Safety Box', 'EV Engineer & Checkout'];
    } else if (flowType === 'waterless-wash') {
      stepLabels = ['Vehicle Category', 'Subscription Plan', 'Slot & Morning Time', 'Assigned Detailer & Checkout'];
    }

    return (
      <div style={{ padding: '24px 32px 10px 32px', background: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Step {step} of {totalSteps}
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {stepLabels[step - 1]}
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
            {Math.round((step / totalSteps) * 100)}% Completed
          </div>
        </div>

        {/* 4-Segment Progress Bar */}
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
     1. COMMUNITY YOGA & ZUMBA STEPS
     ========================================================================= */
  const renderFitnessStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Choose Fitness Discipline & Format
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Certified instructors bring portable sound systems and equipment directly to your society.
      </p>

      <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
        {[
          {
            id: 'hatha-yoga',
            icon: '🧘‍♀️',
            title: 'Sunrise Hatha & Ashtanga Yoga',
            desc: 'Breathwork pranayama, spinal flexibility, core balance, and guided mindfulness meditation.',
            basePrice: '₹1,499 per batch / ₹299 per neighbor',
            badge: 'Most Popular for Mornings'
          },
          {
            id: 'zumba-dance',
            icon: '💃',
            title: 'High-Energy Zumba & Bollywood Dance',
            desc: 'Calorie-burning cardio party with licensed ZIN instructor, dance tracks & fun choreography.',
            basePrice: '₹1,499 per batch / ₹299 per neighbor',
            badge: 'High Calorie Burn'
          },
          {
            id: 'functional-hiit',
            icon: '⚡',
            title: 'Functional HIIT & Outdoor Bootcamp',
            desc: 'Agility ladders, resistance bands, core sculpting & athletic conditioning on society grass.',
            basePrice: '₹1,799 per batch / ₹349 per neighbor',
            badge: 'Strength & Stamina'
          },
          {
            id: 'senior-gentle',
            icon: '🌱',
            title: 'Senior Citizen Gentle Mobility & Chair Yoga',
            desc: 'Low-impact joint mobility, arthritis relief, posture strengthening, and fall prevention.',
            basePrice: '₹1,299 per batch / ₹199 per neighbor',
            badge: 'Senior & Beginner Friendly'
          }
        ].map((item) => {
          const isSelected = fitnessDiscipline === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setFitnessDiscipline(item.id)}
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? theme.shadowActive : '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: isSelected ? 'white' : '#f1f5f9', color: isSelected ? theme.color : '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {item.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.color, marginTop: '6px' }}>
                    {item.basePrice}
                  </div>
                </div>
              </div>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: `2px solid ${isSelected ? theme.color : '#cbd5e1'}`,
                background: isSelected ? theme.color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                {isSelected && <HiOutlineCheck size={16} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFitnessStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Society Venue & Neighbor Cost-Split Setup
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Organize in your society's shared amenities and share costs with friends in the building.
      </p>

      {/* Society Venue Selection */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Select Society Venue
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { id: 'clubhouse', title: 'Clubhouse Hall', desc: 'Air-conditioned indoor vitrified/wooden floor' },
          { id: 'central-lawn', title: 'Central Lawn / Park', desc: 'Fresh morning air on open society green grass' },
          { id: 'amphitheatre', title: 'Amphitheatre / Terrace', desc: 'Open sky stepped seating or panoramic terrace' }
        ].map((venue) => {
          const isSelected = fitnessVenue === venue.id;
          return (
            <div
              key={venue.id}
              onClick={() => setFitnessVenue(venue.id)}
              style={{
                padding: '16px',
                borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.95rem', marginBottom: '4px' }}>
                {venue.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {venue.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Batch Format & Neighbor Split */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Session Format & Cost Splitting
      </label>
      <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
        {[
          {
            id: 'open-group',
            title: '👥 Group Batch (Cost Split with Neighbors)',
            desc: 'Trainer fee is split equally among joined residents. Maximum savings and high community energy!',
            rate: `Approx ₹${pricing.basePerPerson} per person (${estimatedParticipants} neighbors)`
          },
          {
            id: 'private',
            title: '🏡 Private Family Session (1 to 4 Members)',
            desc: 'Personalized private coaching session for you and your family in your clubhouse/terrace.',
            rate: '₹1,499 flat fee (no neighbor split)'
          },
          {
            id: 'mega-community',
            title: '🌟 Society Mega Camp (15+ Residents)',
            desc: 'Special full society wellness morning with dual instructors & sound setup.',
            rate: '₹199 per resident (₹3,999 total society pool)'
          }
        ].map((format) => {
          const isSelected = batchFormat === format.id;
          return (
            <div
              key={format.id}
              onClick={() => setBatchFormat(format.id)}
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.95rem' }}>
                  {format.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  {format.desc}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.color }}>
                  {format.rate}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Neighbor Split Slider if Open Group */}
      {batchFormat === 'open-group' && (
        <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Expected Participating Neighbors: <span style={{ color: theme.color }}>{estimatedParticipants} residents</span>
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>
              Your Cost: ₹{pricing.basePerPerson} / person
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="25"
            value={estimatedParticipants}
            onChange={(e) => setEstimatedParticipants(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: theme.color }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            <span>4 Neighbors (₹625/ea)</span>
            <span>10 Neighbors (₹250/ea)</span>
            <span>20+ Neighbors (₹125/ea)</span>
          </div>

          {/* WhatsApp Invite Share Generator */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
              <HiOutlineShare style={{ color: '#25D366', fontSize: '1.2rem' }} />
              <span>Share WhatsApp link on society group to fill batch & split cost</span>
            </div>
            <button
              onClick={handleCopyInviteLink}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                background: copiedLink ? '#059669' : '#25D366',
                color: 'white', border: 'none', fontWeight: 700, fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {copiedLink ? <HiOutlineClipboardDocumentCheck size={16} /> : <HiOutlineShare size={16} />}
              {copiedLink ? 'Link Copied!' : 'Copy WhatsApp Invite'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderFitnessStep3 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Schedule, Society Details & Add-ons
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Specify session timings, tower address for gate entry pass, and gear add-ons.
      </p>

      {/* Preferred Timing Slots */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Preferred Time Slot
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: '06:15 AM - 07:15 AM', label: '🌅 Sunrise Early Bird (06:15 - 07:15 AM)' },
          { id: '07:30 AM - 08:30 AM', label: '☕ Morning Refresh (07:30 - 08:30 AM)' },
          { id: '06:00 PM - 07:00 PM', label: '🌇 Sunset De-Stress (06:00 - 07:00 PM)' },
          { id: '07:15 PM - 08:15 PM', label: '🌙 Post-Work Dance (07:15 - 08:15 PM)' }
        ].map((slot) => {
          const isSelected = fitnessTimeSlot === slot.id;
          return (
            <div
              key={slot.id}
              onClick={() => setFitnessTimeSlot(slot.id)}
              style={{
                padding: '12px 14px', borderRadius: '12px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                fontWeight: 700, fontSize: '0.82rem',
                color: isSelected ? theme.color : 'var(--navy-900)',
                cursor: 'pointer', textAlign: 'center'
              }}
            >
              {slot.label}
            </div>
          );
        })}
      </div>

      {/* Frequency / Commitment */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Session Frequency
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {[
          { id: 'single', title: 'Single Trial Session', desc: '1-time event to test the waters' },
          { id: 'weekday-pass', title: 'Weekday Pass (12 Sessions)', desc: 'Mon-Wed-Fri routine • 20% OFF' },
          { id: 'weekend-camp', title: 'Weekend Camp (8 Sessions)', desc: 'Sat-Sun intensive • 15% OFF' }
        ].map((freq) => {
          const isSelected = fitnessFrequency === freq.id;
          return (
            <div
              key={freq.id}
              onClick={() => setFitnessFrequency(freq.id)}
              style={{
                padding: '14px', borderRadius: '12px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.9rem' }}>
                {freq.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                {freq.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Society Location Inputs */}
      <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Society & Contact Details (For Security Gate Pass)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Society Name</label>
            <input
              type="text"
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              placeholder="e.g. Greenwood Heights"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tower / Wing</label>
            <input
              type="text"
              value={towerBlock}
              onChange={(e) => setTowerBlock(e.target.value)}
              placeholder="e.g. Tower B"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Flat / Unit No</label>
            <input
              type="text"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              placeholder="e.g. B-704"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Equipment Add-ons */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Optional Community Add-ons
      </label>
      <div style={{ display: 'grid', gap: '10px' }}>
        <div 
          onClick={() => setAddOnMats(!addOnMats)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnMats ? theme.color : '#e2e8f0'}`,
            background: addOnMats ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Loaner Yoga Mats & Cork Blocks (+₹299)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Instructor brings 10 sanitized high-density mats for neighbors who don't have their own.
            </span>
          </div>
          <input type="checkbox" checked={addOnMats} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>

        <div 
          onClick={() => setAddOnDetoxJuice(!addOnDetoxJuice)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnDetoxJuice ? theme.color : '#e2e8f0'}`,
            background: addOnDetoxJuice ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Post-Workout Fresh Tender Coconut / Detox Green Juice (+₹499)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Catered refreshing chilled coconut water or organic green booster for all participants.
            </span>
          </div>
          <input type="checkbox" checked={addOnDetoxJuice} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>
      </div>
    </div>
  );

  const renderFitnessStep4 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Review, Assigned Instructor & Confirmation
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Your certified coach has been reserved. Review society booking specifications before checkout.
      </p>

      {/* Instructor Profile Card */}
      <div style={{
        background: 'white', borderRadius: '18px', padding: '20px',
        border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px'
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: theme.gradient, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontWeight: 900
        }}>
          🧘
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Coach Aditi Sharma
            </h4>
            <span style={{ background: '#f5f3ff', color: theme.color, fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
              Yoga Alliance 500-HR / ZIN
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            7+ years of gated society coaching • BLS / First-Aid Certified • Police-verified ID
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem', color: '#475569' }}>
            <span>⭐ 4.96 (180+ sessions)</span>
            <span>📍 Serving {societyName} area</span>
            <span>🔊 Sound system included</span>
          </div>
        </div>
      </div>

      {/* Society Quiet Hours & Weather Reassurance */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 16px', borderRadius: '14px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <HiOutlineCheckCircle style={{ color: '#16a34a', fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.5 }}>
          <strong>Society Resident Peace Guarantee:</strong> Music volume strictly regulated below 65 dB in compliance with RWA quiet hours bylaws. Free zero-penalty rescheduling if it rains during outdoor lawn sessions!
        </div>
      </div>

      {/* Itemized Cost Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Itemized Cost Breakdown
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Session Batch Base ({fitnessDiscipline.replace('-', ' ').toUpperCase()})</span>
          <span>₹{pricing.totalBatchFee}</span>
        </div>
        {fitnessFrequency !== 'single' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
            <span>Monthly Pass Bundle ({fitnessFrequency === 'weekday-pass' ? '12 Sessions' : '8 Sessions'})</span>
            <span>₹{pricing.monthlyTotal}</span>
          </div>
        )}
        {pricing.addOnsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
            <span>Loaner Mats & Nutrition Add-ons</span>
            <span>+₹{pricing.addOnsTotal}</span>
          </div>
        )}
        {batchFormat === 'open-group' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', fontWeight: 700, marginBottom: '8px', padding: '6px 10px', background: '#ecfdf5', borderRadius: '8px' }}>
            <span>👥 Cost Split Among {estimatedParticipants} Joined Neighbors</span>
            <span>~₹{pricing.basePerPerson} / resident</span>
          </div>
        )}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--navy-900)' }}>Your Payment:</span>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {batchFormat === 'open-group' ? 'Individual resident share' : 'Total booking fee'}
            </div>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: theme.color }}>
            ₹{pricing.finalResidentShare}
          </span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     2. EV CHARGER INSTALLATION STEPS
     ========================================================================= */
  const renderEvStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Select EV Charger Hardware & Capacity
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Compliant with Indian discom standards (Tata Power, Adani, BESCOM, MSEDCL, etc.) with dedicated earthing.
      </p>

      {/* Vehicle Type Toggle */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Vehicle Category
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: '2-wheeler', label: '🛵 2-Wheeler (Ather, Ola, Chetak)' },
          { id: '4-wheeler', label: '🚗 4-Wheeler (Nexon, MG, BYD, Tesla)' },
          { id: 'commercial', label: '🚚 Dual-Gun / Commercial Fleet' }
        ].map((veh) => (
          <div
            key={veh.id}
            onClick={() => {
              setVehicleCategory(veh.id);
              if (veh.id === '2-wheeler') setChargerModel('socket-3kw');
              else if (veh.id === '4-wheeler') setChargerModel('wallbox-7kw');
            }}
            style={{
              padding: '12px 14px', borderRadius: '12px',
              border: `2px solid ${vehicleCategory === veh.id ? theme.color : '#e2e8f0'}`,
              background: vehicleCategory === veh.id ? theme.bgSoft : 'white',
              fontWeight: 700, fontSize: '0.85rem',
              color: vehicleCategory === veh.id ? theme.color : 'var(--navy-900)',
              cursor: 'pointer', textAlign: 'center'
            }}
          >
            {veh.label}
          </div>
        ))}
      </div>

      {/* Charger Model Tiers */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Charger Model & Installation Tier
      </label>
      <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
        {[
          {
            id: 'wallbox-7kw',
            icon: '⚡',
            title: '7.4 kW Type-2 AC Fast Wallbox (Recommended)',
            desc: 'Overnight 0-100% in 6-8 hours. Includes RFID anti-theft smart tap, LED status ring, IP65 weatherproof casing.',
            price: '₹9,999 (Complete Setup + Wallbox)',
            badge: 'Best for Electric Cars'
          },
          {
            id: 'socket-3kw',
            icon: '🔌',
            title: '3.3 kW 16A Heavy-Duty Weatherproof Socket',
            desc: 'Safe slow overnight charging. Minimal load on society meter, high-durability industrial metal socket.',
            price: '₹4,999 (Full Setup + Hardware)',
            badge: 'Ideal for 2-Wheelers & Plug-in'
          },
          {
            id: 'ultra-11kw',
            icon: '🚀',
            title: '11 kW / 22 kW Three-Phase AC Fast Charger',
            desc: 'Ultra-fast destination charging for high-capacity EV batteries (BYD, Ioniq 5, German Luxury EVs).',
            price: '₹18,999 (Commercial Grade)',
            badge: 'Max Speed'
          },
          {
            id: 'byo-charger',
            icon: '🛠️',
            title: 'Bring-Your-Own-Charger (Installation Only)',
            desc: 'Already got a charger from Tata/MG? Our licensed electrical engineers will do the cabling, MCB box & RWA certification.',
            price: '₹3,499 (Labor & Wiring)',
            badge: 'Installation Only'
          }
        ].map((item) => {
          const isSelected = chargerModel === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setChargerModel(item.id)}
              style={{
                padding: '18px 20px', borderRadius: '16px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s', boxShadow: isSelected ? theme.shadowActive : '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.02rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: isSelected ? 'white' : '#f1f5f9', color: isSelected ? theme.color : '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {item.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.color, marginTop: '6px' }}>
                    {item.price}
                  </div>
                </div>
              </div>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: `2px solid ${isSelected ? theme.color : '#cbd5e1'}`,
                background: isSelected ? theme.color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                {isSelected && <HiOutlineCheck size={16} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderEvStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Parking Bay Location & Meter Cabling Run
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Tell us where your designated parking bay is and its estimated distance from the society meter room.
      </p>

      {/* Parking Bay Floor Level */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Parking Location Level
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: 'basement-1', title: 'Basement 1 (B1)', desc: 'Standard ceiling conduit access' },
          { id: 'basement-2', title: 'Basement 2 (B2)', desc: 'Lower level with cable tray run' },
          { id: 'ground-stilt', title: 'Ground / Stilt Bay', desc: 'Direct access near meter room shaft' },
          { id: 'open-covered', title: 'Open Covered Parking', desc: 'Requires weatherproof UV conduit' }
        ].map((lvl) => {
          const isSelected = parkingLevel === lvl.id;
          return (
            <div
              key={lvl.id}
              onClick={() => setParkingLevel(lvl.id)}
              style={{
                padding: '14px', borderRadius: '12px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.9rem' }}>
                {lvl.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                {lvl.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Distance from Society Meter Room */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Distance from Society Meter Room to Parking Bay
      </label>
      <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
        {[
          { id: 'short', title: 'Short Distance (< 15 Meters)', desc: 'Standard run included in package with fire-retardant 4 sq mm copper wiring.', cost: 'Included Free' },
          { id: 'medium', title: 'Medium Run (15 to 35 Meters)', desc: 'Includes extra heavy-gauge 6 sq mm copper conduit piping and ceiling clamps.', cost: '+₹1,200' },
          { id: 'long', title: 'Long Run (35 to 60+ Meters)', desc: 'Industrial steel-armored cabling with cable trays across parking bays.', cost: '+₹2,400' }
        ].map((dist) => {
          const isSelected = meterDistance === dist.id;
          return (
            <div
              key={dist.id}
              onClick={() => setMeterDistance(dist.id)}
              style={{
                padding: '14px 18px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>
                  {dist.title}
                </span>
                <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  {dist.desc}
                </span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? theme.color : '#475569' }}>
                {dist.cost}
              </span>
            </div>
          );
        })}
      </div>

      {/* Parking Slot Identification */}
      <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Assigned Parking Bay & Society Details
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Allocated Parking Bay No.</label>
            <input
              type="text"
              value={parkingBayNo}
              onChange={(e) => setParkingBayNo(e.target.value)}
              placeholder="e.g. Bay B2-114"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Society Name</label>
            <input
              type="text"
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              placeholder="e.g. Greenwood Heights"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Resident Tower & Flat</label>
            <input
              type="text"
              value={`${towerBlock} - ${flatNumber}`}
              onChange={(e) => {
                const parts = e.target.value.split('-');
                if (parts[0]) setTowerBlock(parts[0].trim());
                if (parts[1]) setFlatNumber(parts[1].trim());
              }}
              placeholder="e.g. Tower B - 704"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvStep3 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        RWA NOC Facilitation & Safety Protection Hardware
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Everything required to get instant RWA approvals and prevent unauthorized electricity theft.
      </p>

      {/* RWA NOC Facilitation Box */}
      <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <HiOutlineDocumentText style={{ color: theme.color, fontSize: '1.5rem' }} />
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e3a8a' }}>
            RWA NOC Documentation Kit (Included FREE)
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: '#1e40af', margin: '0 0 10px 0', lineHeight: 1.5 }}>
          We provide standardized technical application drawings (SLD Single-Line Diagram) and electrical load safety certifications signed by a licensed Chartered Electrical Engineer for your society managing committee.
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700 }}>
          <span>✓ Discom Load Sanction Guidance</span>
          <span>✓ Zero Structure Pillar Damage</span>
          <span>✓ Fire Safety Compliant</span>
        </div>
      </div>

      {/* Standard Included Safety Features */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Included Electrical Safety Hardware
        </h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
            <HiOutlineCheckCircle style={{ color: '#059669', fontSize: '1.2rem' }} />
            <span><strong>Dedicated 32A MCB & 30mA RCCB:</strong> Independent circuit prevents tripping your home electricity.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
            <HiOutlineCheckCircle style={{ color: '#059669', fontSize: '1.2rem' }} />
            <span><strong>RFID Smart Anti-Theft Lock:</strong> Only powers up when you tap your personal RFID keycard. No unauthorized neighbor charging!</span>
          </div>
        </div>
      </div>

      {/* Add-on Protection Options */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Optional Hardware Upgrades
      </label>
      <div style={{ display: 'grid', gap: '10px' }}>
        <div 
          onClick={() => setAddOnWeatherproofBox(!addOnWeatherproofBox)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnWeatherproofBox ? theme.color : '#e2e8f0'}`,
            background: addOnWeatherproofBox ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Weatherproof Heavy-Duty Lockable Metal Box (+₹899)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Protects socket and charging cable against basement dust, moisture, and vehicle bumps.
            </span>
          </div>
          <input type="checkbox" checked={addOnWeatherproofBox} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>

        <div 
          onClick={() => setAddOnSmartSubMeter(!addOnSmartSubMeter)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnSmartSubMeter ? theme.color : '#e2e8f0'}`,
            background: addOnSmartSubMeter ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Smart Wi-Fi Energy Sub-Meter with App Sync (+₹1,499)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Calculates exact monthly kWh units consumed for seamless RWA maintenance bill reconciliation.
            </span>
          </div>
          <input type="checkbox" checked={addOnSmartSubMeter} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>

        <div 
          onClick={() => setAddOnAmcWarranty(!addOnAmcWarranty)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnAmcWarranty ? theme.color : '#e2e8f0'}`,
            background: addOnAmcWarranty ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              1-Year AMC & Free Onsite Breakdown Support (+₹699)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              2 periodic quarterly health checks of wiring & earthing, plus 4-hour priority breakdown support.
            </span>
          </div>
          <input type="checkbox" checked={addOnAmcWarranty} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>
      </div>
    </div>
  );

  const renderEvStep4 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Review Installation & Electrical Engineer Handoff
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        A certified EV infrastructure technician will arrive for site inspection and complete installation.
      </p>

      {/* Engineer Profile Card */}
      <div style={{
        background: 'white', borderRadius: '18px', padding: '20px',
        border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px'
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: theme.gradient, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontWeight: 900
        }}>
          ⚡
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Er. Rakesh Trivedi
            </h4>
            <span style={{ background: '#eff6ff', color: theme.color, fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
              Licensed Electrical Contractor #EL-49102
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            Certified EVSE Infrastructure Specialist • 350+ Gated Society Setups • 1-Year Comprehensive Warranty
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem', color: '#475569' }}>
            <span>⭐ 4.98 (310+ Reviews)</span>
            <span>📍 Bay: {parkingBayNo} ({parkingLevel})</span>
            <span>🛡️ 100% Shock Protection Guaranteed</span>
          </div>
        </div>
      </div>

      {/* Itemized Cost Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Transparent Cost Quotation
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Charger Hardware & Base Setup ({chargerModel.toUpperCase()})</span>
          <span>₹{pricing.chargerBase}</span>
        </div>
        {pricing.cablingCost > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
            <span>Conduit & Armored Cabling ({meterDistance.toUpperCase()})</span>
            <span>+₹{pricing.cablingCost}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>RWA Technical NOC Pack & SLD Signoff</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹0)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>RFID Anti-Theft Card & Shock Protection MCB</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹0)</span>
        </div>
        {pricing.addOnsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
            <span>Enclosure Box & Smart Sub-Meter Add-ons</span>
            <span>+₹{pricing.addOnsTotal}</span>
          </div>
        )}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--navy-900)' }}>Total Installation Quotation:</span>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>All taxes, copper wiring, and testing included</div>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: theme.color }}>
            ₹{pricing.grandTotal}
          </span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     3. WATERLESS CAR WASH STEPS
     ========================================================================= */
  const renderWashStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Vehicle Category & Details
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Our assigned society detailer identifies your vehicle in the parking bay every morning.
      </p>

      {/* Vehicle Category */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Select Car Body Type
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { id: 'hatchback', title: 'Hatchback', models: 'Swift, i20, Tiago, Polo, Baleno', price: '₹799/mo' },
          { id: 'sedan', title: 'Sedan', models: 'City, Verna, Dzire, Slavia, Virtus', price: '₹799/mo' },
          { id: 'mid-suv', title: 'Compact / Mid SUV', models: 'Creta, Seltos, Nexon, Brezza', price: '₹999/mo' },
          { id: 'luxury-suv', title: 'Full SUV / Luxury', models: 'Fortuner, Innova, BMW, Audi, Mercedes', price: '₹999/mo' }
        ].map((car) => {
          const isSelected = carType === car.id;
          return (
            <div
              key={car.id}
              onClick={() => setCarType(car.id)}
              style={{
                padding: '16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.95rem' }}>
                  {car.title}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.color }}>
                  {car.price}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {car.models}
              </div>
            </div>
          );
        })}
      </div>

      {/* Car Plate & Color Inputs */}
      <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Vehicle Identification
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Vehicle Registration Number
            </label>
            <input
              type="text"
              value={carRegistration}
              onChange={(e) => setCarRegistration(e.target.value.toUpperCase())}
              placeholder="e.g. MH-02-CB-4521"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Car Color
            </label>
            <input
              type="text"
              value={carColor}
              onChange={(e) => setCarColor(e.target.value)}
              placeholder="e.g. Pearl White / Metallic Grey"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderWashStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Select Waterless Cleaning Subscription Plan
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        RWA-approved high-lubricity polymer spray lifts dirt without scratching. 100% spill-free in basements.
      </p>

      <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
        {[
          {
            id: 'daily-eco',
            icon: '✨',
            title: 'Daily Eco Shine (6 Days / Week)',
            desc: 'Daily morning exterior wipe with separate 450 GSM microfibers for glass, paint & wheels. Weekly tire dressing.',
            price: `₹${['mid-suv', 'luxury-suv'].includes(carType) ? '999' : '799'} / month`,
            badge: 'Most Popular'
          },
          {
            id: 'pro-glaze',
            icon: '💎',
            title: 'Pro Glaze Daily + Rain-Repellent Glass Coating',
            desc: 'Everything in Daily Eco + alternate-day hydrophobic windshield coating, door-edge cleaning & alloy brake dust removal.',
            price: `₹${['mid-suv', 'luxury-suv'].includes(carType) ? '1,399' : '1,199'} / month`,
            badge: 'All-Weather Protection'
          },
          {
            id: 'elite-showroom',
            icon: '👑',
            title: 'Elite Showroom Pass (Daily Clean + 2x Monthly Interior)',
            desc: 'Everything in Pro Glaze + twice-a-month interior vacuuming of floor mats, seats, dashboard UV polish & AC vent dusting.',
            price: `₹${['mid-suv', 'luxury-suv'].includes(carType) ? '1,899' : '1,599'} / month`,
            badge: 'Exterior + Interior'
          },
          {
            id: 'trial-single',
            icon: '🌟',
            title: 'Single Trial Deep Waterless Clean',
            desc: 'One-time trial to experience our swirl-free waterless clean before committing to monthly pass.',
            price: `₹${['mid-suv', 'luxury-suv'].includes(carType) ? '399' : '299'} flat`,
            badge: 'One-Time Trial'
          }
        ].map((plan) => {
          const isSelected = washPlanTier === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setWashPlanTier(plan.id)}
              style={{
                padding: '18px 20px', borderRadius: '16px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s', boxShadow: isSelected ? theme.shadowActive : '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '2rem' }}>{plan.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.02rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>
                      {plan.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: isSelected ? 'white' : '#f1f5f9', color: isSelected ? theme.color : '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {plan.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {plan.desc}
                  </p>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.color, marginTop: '6px' }}>
                    {plan.price}
                  </div>
                </div>
              </div>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: `2px solid ${isSelected ? theme.color : '#cbd5e1'}`,
                background: isSelected ? theme.color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                {isSelected && <HiOutlineCheck size={16} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWashStep3 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Parking Slot, Morning Timing & Add-ons
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        We clean your car while you sleep. Ready and sparkling before your morning office departure!
      </p>

      {/* Morning Time Slots */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Preferred Morning Clean Slot
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: '05:30 AM - 07:00 AM', title: '05:30 AM - 07:00 AM', desc: 'Early Bird (For early commuters)' },
          { id: '07:00 AM - 08:30 AM', title: '07:00 AM - 08:30 AM', desc: 'Standard Office Slot (Most popular)' },
          { id: '08:30 AM - 10:00 AM', title: '08:30 AM - 10:00 AM', desc: 'Flexible Morning' }
        ].map((slot) => {
          const isSelected = washTimeSlot === slot.id;
          return (
            <div
              key={slot.id}
              onClick={() => setWashTimeSlot(slot.id)}
              style={{
                padding: '14px', borderRadius: '12px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.9rem' }}>
                {slot.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                {slot.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Parking Slot & Society Details */}
      <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Parking Spot & Contact Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Parking Slot No.</label>
            <input
              type="text"
              value={washParkingSlot}
              onChange={(e) => setWashParkingSlot(e.target.value)}
              placeholder="e.g. Slot B1-42"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tower & Flat No.</label>
            <input
              type="text"
              value={`${towerBlock} - ${flatNumber}`}
              onChange={(e) => {
                const parts = e.target.value.split('-');
                if (parts[0]) setTowerBlock(parts[0].trim());
                if (parts[1]) setFlatNumber(parts[1].trim());
              }}
              placeholder="e.g. Tower B - 704"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Resident Phone</label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Optional Care Add-ons
      </label>
      <div style={{ display: 'grid', gap: '10px' }}>
        <div 
          onClick={() => setAddOnCarnaubaWax(!addOnCarnaubaWax)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnCarnaubaWax ? theme.color : '#e2e8f0'}`,
            background: addOnCarnaubaWax ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Carnauba Wax Hand Buff (+₹349)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Deep mirror gloss coat with 30-day hydrophobic protective shield against sun & acid rain.
            </span>
          </div>
          <input type="checkbox" checked={addOnCarnaubaWax} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>

        <div 
          onClick={() => setAddOnPerfumeDiffuser(!addOnPerfumeDiffuser)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnPerfumeDiffuser ? theme.color : '#e2e8f0'}`,
            background: addOnPerfumeDiffuser ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Organic Long-Lasting Citrus Car Perfume Diffuser (+₹199)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Subtle aromatherapy car fragrance clip-on for fresh odor-free cabin air.
            </span>
          </div>
          <input type="checkbox" checked={addOnPerfumeDiffuser} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>

        <div 
          onClick={() => setAddOnWiperFluid(!addOnWiperFluid)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnWiperFluid ? theme.color : '#e2e8f0'}`,
            background: addOnWiperFluid ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Anti-Smear Windshield Wiper Concentrate Refill (+₹149)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Full top-up of premium bug-remover wiper fluid for streak-free rain driving.
            </span>
          </div>
          <input type="checkbox" checked={addOnWiperFluid} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>
      </div>
    </div>
  );

  const renderWashStep4 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Review Subscription & Assigned Society Detailer
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Confirm your daily morning car cleaning subscription. 1-click pause anytime when traveling!
      </p>

      {/* Detailer Profile Card */}
      <div style={{
        background: 'white', borderRadius: '18px', padding: '20px',
        border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px'
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: theme.gradient, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontWeight: 900
        }}>
          ✨
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Deepak Verma
            </h4>
            <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
              EcoShine Master Detailer
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            4+ years servicing {societyName} • 400+ cars cleaned daily • Police & RWA background verified
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem', color: '#475569' }}>
            <span>⭐ 4.95 (500+ society ratings)</span>
            <span>📍 Spot: {washParkingSlot}</span>
            <span>🚗 Car: {carRegistration}</span>
          </div>
        </div>
      </div>

      {/* RWA & Environmental Guarantees */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 16px', borderRadius: '14px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <HiOutlineCheckCircle style={{ color: '#16a34a', fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.5 }}>
          <strong>100% RWA & Water-Ban Compliant:</strong> Zero hose water used, leaving zero slippery puddles in the basement. 100% scratch-free microfiber promise. Pause your pass whenever you are out of station — unused days rollover automatically!
        </div>
      </div>

      {/* Itemized Cost Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Monthly Subscription Summary
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>{carType.toUpperCase()} Monthly Pass ({washPlanTier.replace('-', ' ').toUpperCase()})</span>
          <span>₹{pricing.planBase}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Keyless Exterior Cleaning (No Keys Needed)</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹0)</span>
        </div>
        {pricing.addOnsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
            <span>Wax Buff & Interior Add-ons</span>
            <span>+₹{pricing.addOnsTotal}</span>
          </div>
        )}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--navy-900)' }}>Monthly Pass Total:</span>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Includes 6-days a week daily morning clean</div>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: theme.color }}>
            ₹{pricing.grandTotal}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '120px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      
      <div style={{ width: '100%', maxWidth: '780px', alignSelf: 'center', marginTop: '20px' }}>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/customer/society-management')} 
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'var(--navy-600)', fontWeight: 800, fontSize: '0.9rem',
            background: 'white', border: '1px solid var(--gray-200)', cursor: 'pointer', marginBottom: '20px',
            padding: '8px 16px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
        >
          <HiOutlineArrowLeft /> Back to Society Hub
        </button>

        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.06)'
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
            <div style={{ position: 'absolute', right: '-20px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '16px', borderRadius: '20px', display: 'flex'
            }}>
              {theme.icon}
            </div>
            <div style={{ zIndex: 1 }}>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.25)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '6px' }}>
                {theme.badge}
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {theme.title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.92rem', margin: '6px 0 0 0', fontWeight: 600 }}>
                {theme.subtitle}
              </p>
            </div>
          </div>

          {/* Progress Tracker */}
          {isPremiumFlow && renderStepTracker()}

          {/* Wizard Content Body */}
          <div style={{ padding: '30px' }}>
            {flowType === 'community-fitness' && (
              <>
                {step === 1 && renderFitnessStep1()}
                {step === 2 && renderFitnessStep2()}
                {step === 3 && renderFitnessStep3()}
                {step === 4 && renderFitnessStep4()}
              </>
            )}

            {flowType === 'ev-charger' && (
              <>
                {step === 1 && renderEvStep1()}
                {step === 2 && renderEvStep2()}
                {step === 3 && renderEvStep3()}
                {step === 4 && renderEvStep4()}
              </>
            )}

            {flowType === 'waterless-wash' && (
              <>
                {step === 1 && renderWashStep1()}
                {step === 2 && renderWashStep2()}
                {step === 3 && renderWashStep3()}
                {step === 4 && renderWashStep4()}
              </>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="animate-fade-in-up" style={{ color: '#ef4444', background: '#fef2f2', padding: '14px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' }}>
                <HiOutlineInformationCircle size={20} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              {step > 1 && (
                <button 
                  onClick={() => {
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '16px 24px', fontSize: '1.05rem', fontWeight: 800,
                    background: 'white', color: 'var(--navy-800)', border: '2px solid var(--gray-200)',
                    borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Previous
                </button>
              )}
              
              <button 
                onClick={handleNext}
                disabled={loading}
                style={{ 
                  flex: 1, padding: '16px', fontSize: '1.1rem', fontWeight: 800,
                  background: theme.color, color: 'white', border: 'none',
                  borderRadius: '16px', cursor: 'pointer',
                  boxShadow: `0 8px 20px -6px ${theme.color}`,
                  transition: 'transform 0.1s, box-shadow 0.2s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none' }}
              >
                {loading ? 'Processing...' : step === totalSteps ? 'Proceed to Confirmation' : 'Continue to Next Step'}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default SocietyPremiumFlow;
