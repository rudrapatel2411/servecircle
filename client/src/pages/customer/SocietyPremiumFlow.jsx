import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineBolt, 
  HiOutlineSparkles, HiOutlineUserGroup, HiOutlineShieldCheck,
  HiOutlineDocumentText, HiOutlineGift
} from 'react-icons/hi2';

const SocietyPremiumFlow = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowType = searchParams.get('type');
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Existing States
  const [fitnessClass, setFitnessClass] = useState('');
  const [fitnessFormat, setFitnessFormat] = useState('');
  const [chargerType, setChargerType] = useState('');
  const [parkingLevel, setParkingLevel] = useState('');
  const [washCarType, setWashCarType] = useState('');
  const [washTimeSlot, setWashTimeSlot] = useState('');
  
  // New States
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
      const price = parseInt(priceString.replace(/[^\\d]/g, ''), 10);
      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&price=${price}`);
    }, 800);
  };

  const handleNext = () => {
    setErrorMsg('');
    
    if (flowType === 'community-fitness') {
      if (step === 1 && !fitnessClass) return setErrorMsg("Please select a class type.");
      if (step === 2 && !fitnessFormat) return setErrorMsg("Please select a session format.");
    }
    if (flowType === 'ev-charger') {
      if (step === 1 && !chargerType) return setErrorMsg("Please select a charger type.");
      if (step === 2 && !parkingLevel) return setErrorMsg("Please select your parking level.");
    }
    if (flowType === 'waterless-wash') {
      if (step === 1 && !washCarType) return setErrorMsg("Please select your car type.");
      if (step === 2 && !washTimeSlot) return setErrorMsg("Please select a time slot.");
    }
    if (flowType === 'cleanups') {
      if (step === 1 && !cleanupArea) return setErrorMsg("Please select a cleanup area.");
      if (step === 2 && !cleanupType) return setErrorMsg("Please select a booking type.");
    }
    if (flowType === 'guards') {
      if (step === 1 && !guardType) return setErrorMsg("Please select a guard type.");
      if (step === 2 && !guardDuration) return setErrorMsg("Please select a deployment duration.");
    }
    if (flowType === 'contracts') {
      if (step === 1 && !contractType) return setErrorMsg("Please select a maintenance type.");
      if (step === 2 && !contractDuration) return setErrorMsg("Please select a contract duration.");
    }
    if (flowType === 'packages') {
      if (step === 1 && !packageSize) return setErrorMsg("Please select a society size.");
      if (step === 2 && !packageLevel) return setErrorMsg("Please select a service level.");
    }

    if (step < 2) {
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
      
      if (flowType === 'community-fitness') {
        serviceName = `Fitness (${fitnessClass} - ${fitnessFormat})`;
        price = fitnessFormat === 'Private Session' ? 1499 : 499;
      } else if (flowType === 'ev-charger') {
        serviceName = `EV Charger (${chargerType})`;
        price = chargerType === 'Standard Charger (3.3 kW)' ? 4999 : 8999;
      } else if (flowType === 'waterless-wash') {
        serviceName = `Waterless Wash (${washCarType} - ${washTimeSlot})`;
        price = washCarType === 'Hatchback / Sedan' ? 799 : 1199;
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
      
      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&price=${price}`);
    }, 1200);
  };

  const getThemeInfo = () => {
    switch (flowType) {
      case 'cleanups': return {
        title: 'RWA Collective Cleanups', icon: <HiOutlineSparkles size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#16a34a', bgSoft: '#f0fdf4', borderActive: '#16a34a', shadowActive: '0 4px 14px rgba(22, 163, 74, 0.15)'
      };
      case 'guards': return {
        title: 'Biometric Guard Roster', icon: <HiOutlineShieldCheck size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#2563eb', bgSoft: '#eff6ff', borderActive: '#2563eb', shadowActive: '0 4px 14px rgba(37, 99, 235, 0.15)'
      };
      case 'contracts': return {
        title: 'Society B2B Contracts', icon: <HiOutlineDocumentText size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: '#dc2626', bgSoft: '#fef2f2', borderActive: '#dc2626', shadowActive: '0 4px 14px rgba(220, 38, 38, 0.15)'
      };
      case 'packages': return {
        title: 'Customized Packages', icon: <HiOutlineGift size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #c026d3 0%, #a21caf 100%)', color: '#c026d3', bgSoft: '#fdf4ff', borderActive: '#c026d3', shadowActive: '0 4px 14px rgba(192, 38, 211, 0.15)'
      };
      case 'community-fitness': return { 
        title: 'Community Fitness', icon: <HiOutlineUserGroup size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)', color: '#8b5cf6', bgSoft: '#f5f3ff', borderActive: '#8b5cf6', shadowActive: '0 4px 14px rgba(139, 92, 246, 0.15)'
      };
      case 'ev-charger': return { 
        title: 'EV Charger Setup', icon: <HiOutlineBolt size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #3b7dc1 0%, #224c82 100%)', color: '#3b7dc1', bgSoft: '#f0f5fa', borderActive: '#3b7dc1', shadowActive: '0 4px 14px rgba(59, 125, 193, 0.15)'
      };
      case 'waterless-wash': return { 
        title: 'Waterless Car Wash', icon: <HiOutlineSparkles size={40} color="white" />,
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', color: '#0ea5e9', bgSoft: '#f0f9ff', borderActive: '#0ea5e9', shadowActive: '0 4px 14px rgba(14, 165, 233, 0.15)'
      };
      default: return { title: 'Society Services', icon: null, gradient: '', color: '', bgSoft: '', borderActive: '', shadowActive: '' };
    }
  };

  const theme = getThemeInfo();

  const OptionCard = ({ label, isSelected, onClick, subtext }) => (
    <div 
      onClick={onClick}
      style={{
        padding: '20px', 
        borderRadius: '16px', 
        border: `2px solid ${isSelected ? theme.borderActive : 'var(--gray-200)'}`,
        background: isSelected ? theme.bgSoft : 'white', 
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: isSelected ? theme.shadowActive : '0 2px 5px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease-in-out', transform: isSelected ? 'translateY(-2px)' : 'none'
      }}
    >
      <div>
        <span style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-800)', fontSize: '1.05rem', display: 'block' }}>{label}</span>
        {subtext && <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '4px', display: 'block' }}>{subtext}</span>}
      </div>
      <div style={{ 
        width: '28px', height: '28px', borderRadius: '50%', 
        border: `2px solid ${isSelected ? theme.color : 'var(--gray-300)'}`, 
        background: isSelected ? theme.color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
      }}>
        {isSelected && <HiOutlineCheckCircle size={20} />}
      </div>
    </div>
  );

  const renderCleanupsFlow = () => step === 1 ? (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Select Cleanup Area</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Park & Garden" subtext="Deep cleaning of society green areas" isSelected={cleanupArea === 'Park & Garden'} onClick={() => setCleanupArea('Park & Garden')} />
        <OptionCard label="Lift Lobbies & Stairs" subtext="Pressure washing and sanitization" isSelected={cleanupArea === 'Lift Lobbies'} onClick={() => setCleanupArea('Lift Lobbies')} />
        <OptionCard label="Boundary Wall" subtext="Paint touch-ups and stain removal" isSelected={cleanupArea === 'Boundary Wall'} onClick={() => setCleanupArea('Boundary Wall')} />
      </div>
    </div>
  ) : (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Booking Type</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Single Home Booking" subtext="Standard pricing (5% Off applied)" isSelected={cleanupType === 'Single Home'} onClick={() => setCleanupType('Single Home')} />
        <OptionCard label="Group Booking (Cost Split)" subtext="Join with neighbors for up to 20% Off!" isSelected={cleanupType === 'Group Booking'} onClick={() => setCleanupType('Group Booking')} />
      </div>
    </div>
  );

  const renderGuardsFlow = () => step === 1 ? (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Select Guard Profile</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Standard Security Guard" subtext="Fully verified, biometric-logged personnel" isSelected={guardType === 'Standard'} onClick={() => setGuardType('Standard')} />
        <OptionCard label="Ex-Military Veteran" subtext="Highly trained, disciplined veteran guard" isSelected={guardType === 'Ex-Military'} onClick={() => setGuardType('Ex-Military')} />
        <OptionCard label="Fire Safety Certified" subtext="Specialized in emergency fire drills" isSelected={guardType === 'Fire Safety'} onClick={() => setGuardType('Fire Safety')} />
      </div>
    </div>
  ) : (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Deployment Duration</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="12-hour Daily Shift" subtext="Day or night shift deployment" isSelected={guardDuration === '12-hour Daily'} onClick={() => setGuardDuration('12-hour Daily')} />
        <OptionCard label="24/7 Full Monthly Roster" subtext="Complete coverage with rotating shifts" isSelected={guardDuration === 'Monthly Roster'} onClick={() => setGuardDuration('Monthly Roster')} />
      </div>
    </div>
  );

  const renderContractsFlow = () => step === 1 ? (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Maintenance Service</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Campus Pest Control" subtext="Comprehensive termite and mosquito fogging" isSelected={contractType === 'Pest Control'} onClick={() => setContractType('Pest Control')} />
        <OptionCard label="Garden Maintenance" subtext="Lawn mowing, pruning, and fertilization" isSelected={contractType === 'Garden Maintenance'} onClick={() => setContractType('Garden Maintenance')} />
        <OptionCard label="Lobby & Common Area Cleaning" subtext="Daily sweeping and mopping services" isSelected={contractType === 'Lobby Cleaning'} onClick={() => setContractType('Lobby Cleaning')} />
      </div>
    </div>
  ) : (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Contract Duration</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Quarterly (3 Months)" subtext="Ideal for short-term maintenance needs" isSelected={contractDuration === 'Quarterly'} onClick={() => setContractDuration('Quarterly')} />
        <OptionCard label="Annually (12 Months)" subtext="Best value with dedicated account manager" isSelected={contractDuration === 'Annually'} onClick={() => setContractDuration('Annually')} />
      </div>
    </div>
  );

  const renderPackagesFlow = () => step === 1 ? (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Society Size</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Small Group (5+ Homes)" subtext="Basic shared services and discounts" isSelected={packageSize === 'Small'} onClick={() => setPackageSize('Small')} />
        <OptionCard label="Medium Group (10+ Homes)" subtext="Enhanced benefits and lower per-home cost" isSelected={packageSize === 'Medium'} onClick={() => setPackageSize('Medium')} />
        <OptionCard label="Mega Group (15+ Homes)" subtext="Maximum 20% discount and priority booking" isSelected={packageSize === 'Mega'} onClick={() => setPackageSize('Mega')} />
      </div>
    </div>
  ) : (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Service Level</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Standard" subtext="Regular service SLAs and standard support" isSelected={packageLevel === 'Standard'} onClick={() => setPackageLevel('Standard')} />
        <OptionCard label="Premium Priority" subtext="24/7 dedicated support and faster response" isSelected={packageLevel === 'Premium'} onClick={() => setPackageLevel('Premium')} />
      </div>
    </div>
  );

  const renderFitnessFlow = () => step === 1 ? (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Select Class Type</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Morning Ashtanga Yoga" subtext="Focus on flexibility and meditation" isSelected={fitnessClass === 'Yoga'} onClick={() => setFitnessClass('Yoga')} />
        <OptionCard label="High-Energy Zumba" subtext="Dance fitness to burn calories" isSelected={fitnessClass === 'Zumba'} onClick={() => setFitnessClass('Zumba')} />
        <OptionCard label="Functional Training / HIIT" subtext="Intense outdoor park workout" isSelected={fitnessClass === 'HIIT'} onClick={() => setFitnessClass('HIIT')} />
      </div>
    </div>
  ) : (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Session Format</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Private Session" subtext="1-on-1 personalized attention" isSelected={fitnessFormat === 'Private Session'} onClick={() => setFitnessFormat('Private Session')} />
        <OptionCard label="Open Group (Cost Split)" subtext="We will notify neighbors to join and split the cost!" isSelected={fitnessFormat === 'Open Group'} onClick={() => setFitnessFormat('Open Group')} />
      </div>
    </div>
  );

  const renderEvChargerFlow = () => step === 1 ? (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Charger Speed</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Standard Charger (3.3 kW)" subtext="Overnight slow charging (Safe for older wiring)" isSelected={chargerType === 'Standard Charger (3.3 kW)'} onClick={() => setChargerType('Standard Charger (3.3 kW)')} />
        <OptionCard label="Fast Wallbox (7.2 kW+)" subtext="Requires heavy duty RWA electricity approval" isSelected={chargerType === 'Fast Wallbox (7.2 kW+)'} onClick={() => setChargerType('Fast Wallbox (7.2 kW+)')} />
      </div>
    </div>
  ) : (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Parking Location</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Ground Level Parking" subtext="Easier wiring access from main meter" isSelected={parkingLevel === 'Ground Level'} onClick={() => setParkingLevel('Ground Level')} />
        <OptionCard label="Basement Parking (B1/B2)" subtext="May require extra conduit piping" isSelected={parkingLevel === 'Basement'} onClick={() => setParkingLevel('Basement')} />
        <OptionCard label="Open Stilt Parking" subtext="Requires weather-proof casing for charger" isSelected={parkingLevel === 'Open Stilt'} onClick={() => setParkingLevel('Open Stilt')} />
      </div>
    </div>
  );

  const renderWashFlow = () => step === 1 ? (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Select Car Type</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Hatchback / Sedan" subtext="Swift, Baleno, City, Verna, etc." isSelected={washCarType === 'Hatchback / Sedan'} onClick={() => setWashCarType('Hatchback / Sedan')} />
        <OptionCard label="SUV / MUV / Luxury" subtext="Creta, Fortuner, Innova, BMW, etc." isSelected={washCarType === 'SUV / Luxury'} onClick={() => setWashCarType('SUV / Luxury')} />
      </div>
    </div>
  ) : (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '20px' }}>Daily Cleaning Slot</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        <OptionCard label="Before 7:00 AM" subtext="Perfect for early office commuters" isSelected={washTimeSlot === 'Before 7 AM'} onClick={() => setWashTimeSlot('Before 7 AM')} />
        <OptionCard label="7:00 AM - 9:00 AM" subtext="Standard morning slot" isSelected={washTimeSlot === '7 AM - 9 AM'} onClick={() => setWashTimeSlot('7 AM - 9 AM')} />
        <OptionCard label="Flexible (Anytime Morning)" subtext="Staff cleans whenever they reach your floor" isSelected={washTimeSlot === 'Flexible'} onClick={() => setWashTimeSlot('Flexible')} />
      </div>
    </div>
  );

  
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
      <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px', background: '#f8fafc' }}>
        <button onClick={() => navigate('/customer/society-management')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--navy-600)', fontWeight: 800, fontSize: '0.9rem',
          background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '24px',
          padding: '8px 0'
        }}>
          <HiOutlineArrowLeft /> {t('societyFlow.back', 'Back to Hub')}
        </button>

        <div style={{
          background: theme.gradient,
          padding: '40px 30px',
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
          
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '16px', borderRadius: '20px', display: 'flex',
            backdropFilter: 'blur(10px)'
          }}>
            {theme.icon}
          </div>
          <div style={{ zIndex: 1 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{theme.title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: '6px 0 0 0', fontWeight: 600 }}>Select a service plan to continue</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
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
    );
  }

return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      
      <div style={{ width: '100%', maxWidth: '650px', alignSelf: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/customer/society-management')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--navy-600)', fontWeight: 800, fontSize: '0.9rem',
          background: 'white', border: '1px solid var(--gray-200)', cursor: 'pointer', marginBottom: '24px',
          padding: '8px 16px', borderRadius: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        }}>
          <HiOutlineArrowLeft /> Back
        </button>

        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          
          <div style={{
            background: theme.gradient,
            padding: '40px 30px',
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
              padding: '16px', borderRadius: '20px', display: 'flex',
              backdropFilter: 'blur(10px)'
            }}>
              {theme.icon}
            </div>
            <div style={{ zIndex: 1 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{theme.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: '6px 0 0 0', fontWeight: 600 }}>Customize your premium experience</p>
            </div>
          </div>

          <div style={{ padding: '20px 30px 0 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>Step {step} of 2</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.color }}>
                {step === 1 ? '50% Completed' : '100% Completed'}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--gray-100)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', width: step === 1 ? '50%' : '100%', 
                background: theme.color, borderRadius: '10px', transition: 'width 0.3s ease' 
              }}></div>
            </div>
          </div>

          <div style={{ padding: '30px' }}>
            {flowType === 'community-fitness' && renderFitnessFlow()}
            {flowType === 'ev-charger' && renderEvChargerFlow()}
            {flowType === 'waterless-wash' && renderWashFlow()}
            {flowType === 'cleanups' && renderCleanupsFlow()}
            {flowType === 'guards' && renderGuardsFlow()}
            {flowType === 'contracts' && renderContractsFlow()}
            {flowType === 'packages' && renderPackagesFlow()}
            
            {errorMsg && (
              <div className="animate-fade-in-up" style={{ color: '#ef4444', background: '#fef2f2', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' }}>
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              {step === 2 && (
                <button 
                  onClick={() => setStep(1)}
                  style={{
                    padding: '16px 24px', fontSize: '1.05rem', fontWeight: 800,
                    background: 'white', color: 'var(--navy-800)', border: '2px solid var(--gray-200)',
                    borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Back
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
                {loading ? 'Processing...' : step === 2 ? 'Continue to Checkout' : 'Next Step'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SocietyPremiumFlow;
