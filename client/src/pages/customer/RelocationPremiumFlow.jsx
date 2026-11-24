import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineTruck, 
  HiOutlineSparkles, HiOutlineHeart, HiOutlineShieldCheck,
  HiOutlineDocumentText, HiOutlineGift, HiOutlineClock,
  HiOutlineMapPin, HiOutlineStar, HiOutlineShare, HiOutlineClipboardDocumentCheck,
  HiOutlinePhone, HiOutlineInformationCircle, HiOutlineCheck,
  HiOutlineTrash, HiOutlineWrenchScrewdriver, HiOutlineScale
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const RelocationPremiumFlow = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowType = searchParams.get('type') || 'vehicle-relocation';
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Common Address / Contact
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [originCity, setOriginCity] = useState('Ahmedabad');
  const [destinationCity, setDestinationCity] = useState('Bengaluru');
  const [pickupAddress, setPickupAddress] = useState('Flat 802, Greenwood Heights, SG Highway');
  const [dropAddress, setDropAddress] = useState('Villa 14, Prestige Palm Woods, Whitefield');
  const [pickupDate, setPickupDate] = useState('2026-11-28');
  const [specialNotes, setSpecialNotes] = useState('');

  // 1. Vehicle Relocation States
  const [vehicleCategory, setVehicleCategory] = useState('suv');
  const [vehicleName, setVehicleName] = useState('Hyundai Creta 2023');
  const [vehicleRegNo, setVehicleRegNo] = useState('GJ-01-AB-1234');
  const [carrierType, setCarrierType] = useState('enclosed');
  const [routeDistanceKm, setRouteDistanceKm] = useState(1450);
  const [preInspectionAgreed, setPreInspectionAgreed] = useState(true);
  const [addOnZeroDepInsurance, setAddOnZeroDepInsurance] = useState(true);
  const [addOnFoamWrap, setAddOnFoamWrap] = useState(true);
  const [addOnExpressTransit, setAddOnExpressTransit] = useState(false);

  // 2. Pet Relocation States
  const [petType, setPetType] = useState('dog');
  const [petName, setPetName] = useState('Bruno');
  const [petBreed, setPetBreed] = useState('Golden Retriever');
  const [petAge, setPetAge] = useState('3.5 Years');
  const [petWeight, setPetWeight] = useState('28 kg');
  const [petTemperament, setPetTemperament] = useState('calm');
  const [petTravelMode, setPetTravelMode] = useState('dedicated-cab');
  const [parentTravelingAlong, setParentTravelingAlong] = useState(true);
  const [addOnCalmingTreats, setAddOnCalmingTreats] = useState(true);
  const [addOnMemoryBed, setAddOnMemoryBed] = useState(true);
  const [addOnAntiNauseaKit, setAddOnAntiNauseaKit] = useState(false);

  // 3. Scrap & Junk Removal States
  const [scrapItems, setScrapItems] = useState(['mattress', 'wooden-furniture', 'appliances-ewaste']);
  const [propertyType, setPropertyType] = useState('apartment-lift');
  const [scrapCrewSize, setScrapCrewSize] = useState('mini-crew');
  const [scrapTimeSlot, setScrapTimeSlot] = useState('08:00 AM - 11:00 AM');
  const [dismantlingNeeded, setDismantlingNeeded] = useState(true);
  const [broomCleanGuaranteed, setBroomCleanGuaranteed] = useState(true);

  const validFlows = ['vehicle-relocation', 'pet-relocation', 'scrap-removal'];

  useEffect(() => {
    if (!validFlows.includes(flowType)) {
      navigate('/customer/relocation');
    }
  }, [flowType, navigate]);

  // Pricing Calculation Engine
  const calculatePricing = () => {
    if (flowType === 'vehicle-relocation') {
      let baseRate = 8999;
      if (vehicleCategory === 'bike') baseRate = 4999;
      else if (vehicleCategory === 'hatchback-sedan') baseRate = 8999;
      else if (vehicleCategory === 'suv') baseRate = 12499;
      else if (vehicleCategory === 'luxury-pod') baseRate = 19999;

      let carrierSurge = 0;
      if (carrierType === 'enclosed') carrierSurge = 1800;
      else if (carrierType === 'single-car-pod') carrierSurge = 4500;

      let addOnsTotal = 0;
      if (addOnZeroDepInsurance) addOnsTotal += 999;
      if (addOnFoamWrap) addOnsTotal += 499;
      if (addOnExpressTransit) addOnsTotal += 1999;

      const grandTotal = baseRate + carrierSurge + addOnsTotal;

      return {
        baseRate,
        carrierSurge,
        addOnsTotal,
        grandTotal
      };
    }

    if (flowType === 'pet-relocation') {
      let baseRate = 4499;
      if (petTravelMode === 'local-cab') baseRate = 1899;
      else if (petTravelMode === 'dedicated-cab') baseRate = 4499;
      else if (petTravelMode === 'flight-cargo') baseRate = 8499;

      let addOnsTotal = 0;
      if (addOnCalmingTreats) addOnsTotal += 299;
      if (addOnMemoryBed) addOnsTotal += 499;
      if (addOnAntiNauseaKit) addOnsTotal += 199;

      const grandTotal = baseRate + addOnsTotal;

      return {
        baseRate,
        addOnsTotal,
        grandTotal
      };
    }

    if (flowType === 'scrap-removal') {
      let baseRate = 499;
      if (scrapCrewSize === 'heavy-crew') baseRate = 999;

      let addOnsTotal = 0;
      if (dismantlingNeeded) addOnsTotal += 299;

      const estimatedSalvageCredit = 750;
      const grandTotal = Math.max(0, baseRate + addOnsTotal);

      return {
        baseRate,
        addOnsTotal,
        estimatedSalvageCredit,
        grandTotal
      };
    }

    return { grandTotal: 999 };
  };

  const pricing = calculatePricing();
  const totalSteps = 2;

  const handleNext = () => {
    setErrorMsg('');

    if (step === 1) {
      if (flowType === 'vehicle-relocation' && (!vehicleName || !vehicleRegNo)) {
        return setErrorMsg('Please enter vehicle model name and registration number.');
      }
      if (flowType === 'pet-relocation' && (!petName || !petBreed)) {
        return setErrorMsg('Please provide your pet name and breed.');
      }
      if (flowType === 'scrap-removal' && scrapItems.length === 0) {
        return setErrorMsg('Please select at least one item category to declutter.');
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (flowType === 'vehicle-relocation' && (!originCity || !destinationCity || !pickupAddress)) {
        return setErrorMsg('Please provide origin, destination, and pickup address.');
      }
      if (flowType === 'pet-relocation' && (!originCity || !destinationCity || !pickupAddress)) {
        return setErrorMsg('Please provide origin, destination, and pickup address.');
      }
      if (flowType === 'scrap-removal' && (!pickupAddress || !pickupDate)) {
        return setErrorMsg('Please provide pickup address and date.');
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

      if (flowType === 'vehicle-relocation') {
        serviceName = `Vehicle Relocation (${vehicleName} - ${carrierType.toUpperCase()})`;
        price = pricing.grandTotal;
        notes = `Vehicle: ${vehicleName} (${vehicleRegNo}). Route: ${originCity} -> ${destinationCity} (~ ${routeDistanceKm} km). Carrier: ${carrierType}. Insurance: ${addOnZeroDepInsurance ? 'Zero-Dep Included' : 'Basic'}.`;
      } else if (flowType === 'pet-relocation') {
        serviceName = `Pet Relocation (${petName} - ${petTravelMode.toUpperCase()})`;
        price = pricing.grandTotal;
        notes = `Pet: ${petName} (${petBreed}, ${petWeight}). Mode: ${petTravelMode}. Traveling: ${originCity} -> ${destinationCity}. Parent traveling along: ${parentTravelingAlong ? 'Yes' : 'No'}.`;
      } else if (flowType === 'scrap-removal') {
        serviceName = `Scrap & Junk Removal Pickup (${scrapCrewSize.toUpperCase()})`;
        price = pricing.grandTotal;
        notes = `Items: ${scrapItems.join(', ')}. Property: ${propertyType}. Slot: ${scrapTimeSlot}. Dismantling: ${dismantlingNeeded ? 'Yes' : 'No'}. Salvage credit on scale.`;
      }

      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&category=relocation&price=${price}&notes=${encodeURIComponent(notes)}`);
    }, 800);
  };

  const getThemeInfo = () => {
    switch (flowType) {
      case 'vehicle-relocation': return { 
        title: 'VIP Vehicle Relocation', 
        subtitle: 'Enclosed container pods, hydraulic ramp loading, and zero-dep transit insurance.',
        icon: <HiOutlineTruck size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', 
        color: '#1e40af', 
        bgSoft: '#eff6ff', 
        borderActive: '#1e40af', 
        shadowActive: '0 8px 24px -4px rgba(30, 64, 175, 0.25)',
        badge: 'Enclosed Container Pod' 
      };
      case 'pet-relocation': return { 
        title: 'VIP Pet Relocation & Travel', 
        subtitle: 'Climate-controlled travel, certified pet handlers, and hydration stretch breaks.',
        icon: <HiOutlineHeart size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', 
        color: '#7c3aed', 
        bgSoft: '#f5f3ff', 
        borderActive: '#7c3aed', 
        shadowActive: '0 8px 24px -4px rgba(124, 58, 237, 0.25)',
        badge: 'Climate-Controlled Cabin' 
      };
      case 'scrap-removal': return { 
        title: 'Pre-Move Scrap & Junk Removal', 
        subtitle: 'Declutter old furniture, appliances & scrap. Instant salvage credit on scale.',
        icon: <HiOutlineTrash size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
        color: '#059669', 
        bgSoft: '#ecfdf5', 
        borderActive: '#059669', 
        shadowActive: '0 8px 24px -4px rgba(5, 150, 105, 0.25)',
        badge: 'Salvage Cash Credit' 
      };
      default: return { title: 'Specialized Relocation', subtitle: '', icon: null, gradient: '', color: '#1e40af', bgSoft: '#eff6ff', borderActive: '#1e40af', shadowActive: '', badge: '' };
    }
  };

  const theme = getThemeInfo();

  const renderStepTracker = () => {
    let stepLabels = [];
    if (flowType === 'vehicle-relocation') {
      stepLabels = ['Vehicle & Carrier Setup', 'Route, Schedule & Confirm'];
    } else if (flowType === 'pet-relocation') {
      stepLabels = ['Pet Profile & Mode', 'Schedule & Confirm Travel'];
    } else if (flowType === 'scrap-removal') {
      stepLabels = ['Declutter Inventory & Crew', 'Pickup Schedule & Confirm'];
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

        {/* 2-Segment Progress Bar */}
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
     1. VEHICLE RELOCATION STEPS (2-STEP STREAMLINED)
     ========================================================================= */
  const renderVehicleStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        1. Select Vehicle Category & Specifications
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Choose your vehicle category and preferred carrier safety pod.
      </p>

      {/* Vehicle Category Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { id: 'bike', icon: '🏍️', title: 'Two-Wheeler / Bike', desc: 'Scooters, Enfields, Superbikes', price: '₹4,999' },
          { id: 'hatchback-sedan', icon: '🚗', title: 'Hatchback / Sedan', desc: 'Swift, Baleno, City, Verna', price: '₹8,999' },
          { id: 'suv', icon: '🚙', title: 'Compact & Full SUV', desc: 'Creta, Fortuner, Innova Crysta', price: '₹12,499' },
          { id: 'luxury-pod', icon: '🏎️', title: 'Luxury / Vintage Pod', desc: 'BMW, Mercedes, Porsche, Classics', price: '₹19,999' }
        ].map((cat) => {
          const isSelected = vehicleCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setVehicleCategory(cat.id)}
              style={{
                padding: '16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: isSelected ? theme.shadowActive : 'none'
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{cat.icon}</div>
              <div style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.95rem' }}>
                {cat.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 8px 0' }}>{cat.desc}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.color }}>{cat.price}</div>
            </div>
          );
        })}
      </div>

      {/* Vehicle Model & Registration Input */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Vehicle Information & Plate
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Vehicle Make & Model
            </label>
            <input
              type="text"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              placeholder="e.g. Hyundai Creta 1.5 SX"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Registration Number (RC)
            </label>
            <input
              type="text"
              value={vehicleRegNo}
              onChange={(e) => setVehicleRegNo(e.target.value.toUpperCase())}
              placeholder="e.g. GJ-01-AB-1234"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Carrier Pod Selection */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Carrier Truck Pod Type
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          {
            id: 'enclosed',
            icon: '📦',
            title: 'Dedicated Enclosed Container (Recommended)',
            desc: '100% weather, dust & stone-chip proof. 4-point wheel ratchet straps.',
            price: '+₹1,800',
            badge: 'Maximum Safety'
          },
          {
            id: 'open-hydraulic',
            icon: '🚛',
            title: 'Open Multi-Car Hydraulic Trailer',
            desc: 'Commercial 2-deck car carrier trailer. Economical option.',
            price: '+₹0',
            badge: 'Value Choice'
          }
        ].map((c) => {
          const isSelected = carrierType === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setCarrierType(c.id)}
              style={{
                padding: '14px 16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, background: isSelected ? theme.color : '#f1f5f9', color: isSelected ? 'white' : '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                  {c.badge}
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)', marginTop: '8px' }}>
                {c.title}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 8px 0' }}>{c.desc}</p>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: theme.color }}>{c.price}</span>
            </div>
          );
        })}
      </div>

      {/* Safety Upgrades */}
      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Included Protections & Add-ons
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}>
            <input type="checkbox" checked={addOnZeroDepInsurance} onChange={(e) => setAddOnZeroDepInsurance(e.target.checked)} style={{ accentColor: theme.color, width: '16px', height: '16px' }} />
            Zero-Dep Transit Cover up to ₹25 Lakhs (+₹999)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}>
            <input type="checkbox" checked={addOnFoamWrap} onChange={(e) => setAddOnFoamWrap(e.target.checked)} style={{ accentColor: theme.color, width: '16px', height: '16px' }} />
            High-Density Foam Bumper & Mirror Wrap (+₹499)
          </label>
        </div>
      </div>
    </div>
  );

  const renderVehicleStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        2. Route Corridor, Schedule & Review
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Review transit corridor, set schedule, and confirm your vehicle transport.
      </p>

      {/* Corridor & Schedule */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Origin City</label>
            <input type="text" value={originCity} onChange={(e) => setOriginCity(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Destination City</label>
            <input type="text" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pickup Date</label>
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pickup Doorstep Address</label>
            <input type="text" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Drop Destination Address</label>
            <input type="text" value={dropAddress} onChange={(e) => setDropAddress(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Fleet Captain Assurance Card */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          🚛
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)' }}>Captain Harpreet Singh</h4>
            <span style={{ background: '#eff6ff', color: theme.color, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>SafeCarrier #VL-8902</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            1,200+ vehicles delivered with 0 claims • Live GPS Container Satellite Tracking
          </p>
        </div>
      </div>

      {/* Itemized Price Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)' }}>Transit Quotation Breakdown</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
          <span>{vehicleName} Base Transport ({vehicleCategory.toUpperCase()})</span>
          <span>₹{pricing.baseRate}</span>
        </div>
        {pricing.carrierSurge > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
            <span>Carrier Pod: {carrierType === 'enclosed' ? 'Enclosed Pod' : 'Hydraulic'}</span>
            <span>+₹{pricing.carrierSurge}</span>
          </div>
        )}
        {pricing.addOnsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
            <span>Zero-Dep Insurance & Protection Add-ons</span>
            <span>+₹{pricing.addOnsTotal}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', marginBottom: '6px', fontWeight: 700 }}>
          <span>Doorstep Hydraulic Ramp Loading & GPS Link</span>
          <span>FREE (₹0)</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Total Vehicle Relocation:</strong>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Includes all highway tolls, GST & doorstep delivery</div>
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{pricing.grandTotal}</span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     2. PET RELOCATION STEPS (2-STEP STREAMLINED)
     ========================================================================= */
  const renderPetStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        1. Pet Details & Travel Mode
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Select your pet category and climate-controlled travel mode.
      </p>

      {/* Pet Basic Info */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pet Name</label>
            <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="e.g. Bruno" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Breed / Species</label>
            <input type="text" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} placeholder="e.g. Golden Retriever" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Weight (kg)</label>
            <input type="text" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} placeholder="e.g. 25 kg" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Travel Mode Cards */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Travel Mode
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { id: 'dedicated-cab', icon: '🚙', title: 'Dedicated AC Pet Cab (Intercity)', desc: 'Rear seat folded with orthopedic pet mattress. Parent can travel along.', price: '₹4,499' },
          { id: 'flight-cargo', icon: '✈️', title: 'Domestic Air Travel Assistance', desc: 'IATA compliant crate, DGCA microchip verification & fit-to-fly vet pass.', price: '₹8,499' },
          { id: 'local-cab', icon: '🚖', title: 'Intra-City Sanitized Pet Cab', desc: 'Local doorstep pet transit within city limits with sanitized crate.', price: '₹1,899' }
        ].map((m) => {
          const isSelected = petTravelMode === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setPetTravelMode(m.id)}
              style={{
                padding: '16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{m.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>{m.title}</div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 8px 0' }}>{m.desc}</p>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: theme.color }}>{m.price}</span>
            </div>
          );
        })}
      </div>

      {/* Comfort Add-ons */}
      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Pet Travel Comfort & Protocols
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}>
            <input type="checkbox" checked={parentTravelingAlong} onChange={(e) => setParentTravelingAlong(e.target.checked)} style={{ accentColor: theme.color, width: '16px', height: '16px' }} />
            Parent traveling along in front seat (FREE)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}>
            <input type="checkbox" checked={addOnCalmingTreats} onChange={(e) => setAddOnCalmingTreats(e.target.checked)} style={{ accentColor: theme.color, width: '16px', height: '16px' }} />
            Vet-Approved Calming Treats & Pheromones (+₹299)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}>
            <input type="checkbox" checked={addOnMemoryBed} onChange={(e) => setAddOnMemoryBed(e.target.checked)} style={{ accentColor: theme.color, width: '16px', height: '16px' }} />
            Orthopedic Memory Foam Travel Bed (+₹499)
          </label>
        </div>
      </div>
    </div>
  );

  const renderPetStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        2. Travel Route, Schedule & Confirm
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Review your pet's travel journey and confirm booking.
      </p>

      {/* Route & Contact */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Departure City</label>
            <input type="text" value={originCity} onChange={(e) => setOriginCity(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Destination City</label>
            <input type="text" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Travel Date</label>
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Doorstep Pickup Address</label>
            <input type="text" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Contact Phone</label>
            <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Specialist Card */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          🐾
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)' }}>Pooja Nair</h4>
            <span style={{ background: '#f5f3ff', color: theme.color, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>Certified Canine Specialist</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            800+ safe pet journeys • Mandatory 2.5-hour hydration breaks • Hourly WhatsApp photo updates
          </p>
        </div>
      </div>

      {/* Price Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)' }}>Pet Relocation Fare Summary</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
          <span>{petName} ({petBreed}) Transit ({petTravelMode.toUpperCase()})</span>
          <span>₹{pricing.baseRate}</span>
        </div>
        {pricing.addOnsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
            <span>Comfort & Calming Add-ons</span>
            <span>+₹{pricing.addOnsTotal}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', marginBottom: '6px', fontWeight: 700 }}>
          <span>Hydration Stretch Breaks & Hourly WhatsApp Photo Updates</span>
          <span>FREE (₹0)</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Total Pet Fare:</strong>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Includes sanitized cabin, toll taxes & certified handler</div>
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{pricing.grandTotal}</span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     3. SCRAP & JUNK REMOVAL STEPS (2-STEP STREAMLINED)
     ========================================================================= */
  const renderScrapStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        1. Select Declutter Items & Crew
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Select categories to declutter. Crew brings heavy lifting equipment and digital scale.
      </p>

      {/* Scrap Category Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: 'mattress', icon: '🛏️', title: 'Mattresses & Bed Frames', desc: 'Spring mattresses, wooden cots' },
          { id: 'wooden-furniture', icon: '🪑', title: 'Heavy Furniture', desc: 'Broken wardrobes, sofas, tables' },
          { id: 'appliances-ewaste', icon: '📺', title: 'E-Waste & Appliances', desc: 'Old TVs, fridges, washing machines' },
          { id: 'metal-scrap', icon: '🔩', title: 'Metal & Paper Scrap', desc: 'Iron grills, pipes, newspapers' }
        ].map((item) => {
          const isSelected = scrapItems.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => {
                if (isSelected) setScrapItems(scrapItems.filter(i => i !== item.id));
                else setScrapItems([...scrapItems, item.id]);
              }}
              style={{
                padding: '14px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{item.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>{item.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Crew & Truck Sizing */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Crew & Vehicle Sizing
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { id: 'mini-crew', icon: '🚚', title: 'Tata Ace Mini-Truck (2 Lifters)', desc: 'Standard declutter for 1-2 rooms or bulky e-waste.', price: '₹499 flat fee' },
          { id: 'heavy-crew', icon: '🚛', title: 'Bolero 14ft Truck (4 Lifters + Tools)', desc: 'Full apartment overhaul with power tools to dismantle wardrobes.', price: '₹999 flat fee' }
        ].map((c) => {
          const isSelected = scrapCrewSize === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setScrapCrewSize(c.id)}
              style={{
                padding: '14px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{c.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? theme.color : 'var(--navy-900)' }}>{c.title}</div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 8px 0' }}>{c.desc}</p>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: theme.color }}>{c.price}</span>
            </div>
          );
        })}
      </div>

      {/* Dismantling Toggle */}
      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}>
          <input type="checkbox" checked={dismantlingNeeded} onChange={(e) => setDismantlingNeeded(e.target.checked)} style={{ accentColor: theme.color, width: '16px', height: '16px' }} />
          Include Professional Heavy Furniture Dismantling (+₹299)
        </label>
      </div>
    </div>
  );

  const renderScrapStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        2. Pickup Schedule & Confirmation
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Set pickup timing and review salvage credit evaluation guarantee.
      </p>

      {/* Pickup Slot & Address */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pickup Date</label>
            <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Preferred Time Slot</label>
            <select value={scrapTimeSlot} onChange={(e) => setScrapTimeSlot(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}>
              <option value="08:00 AM - 11:00 AM">Morning (08:00 AM - 11:00 AM)</option>
              <option value="11:00 AM - 02:00 PM">Noon (11:00 AM - 02:00 PM)</option>
              <option value="02:00 PM - 05:00 PM">Afternoon (02:00 PM - 05:00 PM)</option>
              <option value="05:00 PM - 08:00 PM">Evening (05:00 PM - 08:00 PM)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Contact Phone</label>
            <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Doorstep Pickup Address</label>
          <input type="text" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Eco Lead Card */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          ♻️
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)' }}>Ramesh Gujjar</h4>
            <span style={{ background: '#ecfdf5', color: theme.color, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>Certified Eco-Declutter Lead</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            600+ pickups completed • 100% Green Certified E-Waste Recycler • Digital truck scale
          </p>
        </div>
      </div>

      {/* Pricing Summary with Salvage Promise */}
      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)' }}>Service Fee & Salvage Credit</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
          <span>Truck Dispatch & Heavy Loading Fee</span>
          <span>₹{pricing.baseRate}</span>
        </div>
        {pricing.addOnsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
            <span>Heavy Wardrobe Dismantling Fee</span>
            <span>+₹{pricing.addOnsTotal}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', marginBottom: '6px', fontWeight: 700 }}>
          <span>Broom-Clean Sweep After Loading Bulky Items</span>
          <span>FREE (₹0)</span>
        </div>
        <div style={{ background: '#ecfdf5', border: '1px dashed #059669', borderRadius: '10px', padding: '10px 12px', margin: '8px 0', fontSize: '0.82rem', color: '#065f46' }}>
          💰 <strong>Instant Salvage Cash Credit:</strong> Metals, scrap and working electronics are weighed digitally on truck. Salvage cash/UPI value (avg. ₹500 - ₹1,500) will be credited directly to you on the spot!
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Dispatch Booking Fee:</strong>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Fully adjustable against salvage value</div>
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{pricing.grandTotal}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-content" style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Top Navigation Back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/customer/relocation')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            color: 'var(--navy-800)', fontSize: '0.95rem', fontWeight: 700, padding: 0
          }}
        >
          <HiOutlineArrowLeft size={18} />
          Back to Relocation Hub
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          <HiOutlineShieldCheck color="#059669" size={18} />
          <span>ServeCircle Verified Logistics Fleet</span>
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="b2b-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        
        {/* Banner Header */}
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
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {theme.badge}
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '8px 0 0 0', letterSpacing: '-0.5px' }}>
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

        {/* Wizard Content Body */}
        <div style={{ padding: '28px 32px' }}>
          {flowType === 'vehicle-relocation' && (
            <>
              {step === 1 && renderVehicleStep1()}
              {step === 2 && renderVehicleStep2()}
            </>
          )}

          {flowType === 'pet-relocation' && (
            <>
              {step === 1 && renderPetStep1()}
              {step === 2 && renderPetStep2()}
            </>
          )}

          {flowType === 'scrap-removal' && (
            <>
              {step === 1 && renderScrapStep1()}
              {step === 2 && renderScrapStep2()}
            </>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="animate-fade-in-up" style={{ color: '#ef4444', background: '#fef2f2', padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, marginTop: '18px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' }}>
              <HiOutlineInformationCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Wizard Navigation Footer */}
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
              {loading ? 'Processing...' : step === totalSteps ? `Confirm & Book Now (₹${pricing.grandTotal})` : 'Continue to Schedule & Address →'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RelocationPremiumFlow;
