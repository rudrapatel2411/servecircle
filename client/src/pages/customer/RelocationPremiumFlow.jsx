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
      let baseRate = 2999;
      if (petTravelMode === 'dedicated-cab') baseRate = 4499;
      else if (petTravelMode === 'air-cargo') baseRate = 8499;
      else if (petTravelMode === 'local-cab') baseRate = 1899;

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
      let baseFee = scrapCrewSize === 'mini-crew' ? 499 : 999;
      let stairsSurcharge = propertyType === 'apartment-stairs' ? 250 : 0;
      const grandTotal = baseFee + stairsSurcharge;

      return {
        baseFee,
        stairsSurcharge,
        grandTotal
      };
    }

    return { grandTotal: 999 };
  };

  const pricing = calculatePricing();

  const handleNext = () => {
    setErrorMsg('');

    if (flowType === 'vehicle-relocation') {
      if (step === 1 && (!vehicleName || !vehicleRegNo)) return setErrorMsg('Please enter vehicle model name and registration number.');
      if (step === 2 && (!originCity || !destinationCity)) return setErrorMsg('Please enter both pickup and destination cities.');
      if (step === 3 && !preInspectionAgreed) return setErrorMsg('Please check the digital inspection consent.');
    }
    if (flowType === 'pet-relocation') {
      if (step === 1 && (!petName || !petBreed)) return setErrorMsg('Please provide your pet name and breed.');
      if (step === 2 && (!originCity || !destinationCity)) return setErrorMsg('Please provide origin and destination.');
      if (step === 3 && !customerPhone) return setErrorMsg('Please provide a contact phone number.');
    }
    if (flowType === 'scrap-removal') {
      if (step === 1 && scrapItems.length === 0) return setErrorMsg('Please select at least one item category to declutter.');
      if (step === 2 && !pickupAddress) return setErrorMsg('Please provide your pickup address.');
      if (step === 3 && !pickupDate) return setErrorMsg('Please select a pickup date.');
    }

    if (step < 4) {
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
    }, 1000);
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
        shadowActive: '0 6px 20px rgba(30, 64, 175, 0.25)',
        badge: '🚗 Enclosed Carrier Pods • Zero Damage Guarantee'
      };
      case 'pet-relocation': return { 
        title: 'VIP Pet Relocation & Travel', 
        subtitle: 'AC sanitized cabs, certified pet handler, scheduled hydration stops, and stress-free transit.',
        icon: <HiOutlineHeart size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #a21caf 0%, #86198f 100%)', 
        color: '#a21caf', 
        bgSoft: '#fdf4ff', 
        borderActive: '#a21caf', 
        shadowActive: '0 6px 20px rgba(162, 28, 175, 0.25)',
        badge: '🐾 Climate-Controlled • Certified Pet Buddy'
      };
      case 'scrap-removal': return { 
        title: 'Pre-Move Scrap & Heavy Junk Removal', 
        subtitle: 'Declutter old mattresses, scrap metal, broken furniture & e-waste. Salvage cash credited back.',
        icon: <HiOutlineTrash size={36} color="white" />,
        gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', 
        color: '#16a34a', 
        bgSoft: '#f0fdf4', 
        borderActive: '#16a34a', 
        shadowActive: '0 6px 20px rgba(22, 163, 74, 0.25)',
        badge: '♻️ Heavy Lifters • Broom-Clean Promise'
      };
      default: return { title: 'Specialized Relocation', subtitle: '', icon: null, gradient: '', color: '#1e40af', bgSoft: '#eff6ff', borderActive: '#1e40af', shadowActive: '', badge: '' };
    }
  };

  const theme = getThemeInfo();
  const totalSteps = 4;

  const renderStepTracker = () => {
    let stepLabels = [];
    if (flowType === 'vehicle-relocation') {
      stepLabels = ['Vehicle Category & Specs', 'Route & Carrier Pod', 'Inspection & Safety Add-ons', 'Fleet Captain & Checkout'];
    } else if (flowType === 'pet-relocation') {
      stepLabels = ['Pet Profile & Needs', 'Travel Mode & Route', 'Hydration & Comfort Protocol', 'Travel Specialist & Checkout'];
    } else if (flowType === 'scrap-removal') {
      stepLabels = ['Declutter Inventory', 'Property & Crew Sizing', 'Dismantling & Valuation', 'Eco Lead & Confirmation'];
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
     1. VEHICLE RELOCATION STEPS
     ========================================================================= */
  const renderVehicleStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Select Vehicle Category & Specifications
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        We transport everything from commuter two-wheelers and family SUVs to imported sports cars.
      </p>

      {/* Vehicle Category Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { id: 'bike', icon: '🏍️', title: 'Two-Wheeler / Bike', desc: 'Scooters, Enfields, Superbikes', price: '₹4,999 onwards' },
          { id: 'hatchback-sedan', icon: '🚗', title: 'Hatchback / Sedan', desc: 'Swift, Baleno, City, Verna', price: '₹8,999 onwards' },
          { id: 'suv', icon: '🚙', title: 'Compact & Full SUV', desc: 'Creta, Fortuner, Innova Crysta', price: '₹12,499 onwards' },
          { id: 'luxury-pod', icon: '🏎️', title: 'Luxury / Vintage Pod', desc: 'BMW, Mercedes, Porsche, Classics', price: '₹19,999 onwards' }
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
              <div style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 8px 0' }}>
                {cat.desc}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.color }}>
                {cat.price}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vehicle Model & Registration Input */}
      <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Vehicle Information & Plate
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
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
    </div>
  );

  const renderVehicleStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Route Logistics & Carrier Pod Selection
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Select your relocation route and carrier safety specifications.
      </p>

      {/* City Route Inputs */}
      <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Transit Corridor & Dates
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Origin City</label>
            <input
              type="text"
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              placeholder="e.g. Ahmedabad"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Destination City</label>
            <input
              type="text"
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              placeholder="e.g. Bengaluru"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#475569', background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span>🛣️ Estimated Highway Corridor: <strong>~{routeDistanceKm} km</strong></span>
          <span style={{ color: '#059669', fontWeight: 700 }}>Est. Transit Time: 3-5 Days</span>
        </div>
      </div>

      {/* Carrier Pod Selection */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Select Carrier Truck Type
      </label>
      <div style={{ display: 'grid', gap: '12px' }}>
        {[
          {
            id: 'enclosed',
            icon: '📦',
            title: 'Dedicated Enclosed Container Carrier (Recommended)',
            desc: '100% dust, rain & stone-chip proof. Specialized tire chocks & 4-point ratchet wheel straps.',
            price: '+₹1,800',
            badge: 'Maximum Protection'
          },
          {
            id: 'open-hydraulic',
            icon: '🚛',
            title: 'Open Multi-Car Hydraulic Trailer',
            desc: 'Standard commercial car carrier with upper and lower hydraulic deck. Budget-friendly.',
            price: 'Standard Included',
            badge: 'Economy'
          },
          {
            id: 'single-car-pod',
            icon: '🛡️',
            title: 'Private Single-Vehicle VIP Pod',
            desc: 'Non-stop solo carrier truck carrying only your car. Door-to-door direct delivery without stopovers.',
            price: '+₹4,500',
            badge: 'Luxury Priority'
          }
        ].map((carrier) => {
          const isSelected = carrierType === carrier.id;
          return (
            <div
              key={carrier.id}
              onClick={() => setCarrierType(carrier.id)}
              style={{
                padding: '16px 20px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '1.8rem' }}>{carrier.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.95rem' }}>
                      {carrier.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: isSelected ? 'white' : '#f1f5f9', color: isSelected ? theme.color : '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {carrier.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                    {carrier.desc}
                  </div>
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: theme.color }}>
                {carrier.price}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderVehicleStep3 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Pre-Dispatch Inspection & Safety Protocol
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Every vehicle undergoes digital walkaround inspection before loading onto the hydraulic ramp.
      </p>

      {/* Inspection Checklist Box */}
      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiOutlineClipboardDocumentCheck style={{ color: theme.color, fontSize: '1.3rem' }} />
          Digital Pre-Loading Walkaround & Odometer Audit
        </h4>
        <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
          <div>✓ <strong>360-Degree Timestamped Photos:</strong> HD pictures taken of all 4 sides, bumpers, and windshield before mounting.</div>
          <div>✓ <strong>Odometer & Fuel Freeze:</strong> Starting km reading recorded to guarantee zero unauthorized joyrides.</div>
          <div>✓ <strong>Battery Disconnect Safety:</strong> Terminals isolated to ensure 100% battery charge on arrival.</div>
          <div>✓ <strong>Loose Accessories Seal:</strong> Antennas, toll tags & mirrors padded and documented.</div>
        </div>
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={preInspectionAgreed}
              onChange={(e) => setPreInspectionAgreed(e.target.checked)}
              style={{ accentColor: theme.color, width: '16px', height: '16px' }}
            />
            I agree to digital photo walkaround and joint signoff at loading time.
          </label>
        </div>
      </div>

      {/* Safety & Transit Upgrades */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Optional Transit Protection Upgrades
      </label>
      <div style={{ display: 'grid', gap: '10px' }}>
        <div 
          onClick={() => setAddOnZeroDepInsurance(!addOnZeroDepInsurance)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnZeroDepInsurance ? theme.color : '#e2e8f0'}`,
            background: addOnZeroDepInsurance ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Zero-Depreciation Comprehensive Transit Cover (+₹999)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Full coverage against highway incidents, overturning, denting & transit mishaps up to ₹25 Lakhs.
            </span>
          </div>
          <input type="checkbox" checked={addOnZeroDepInsurance} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>

        <div 
          onClick={() => setAddOnFoamWrap(!addOnFoamWrap)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnFoamWrap ? theme.color : '#e2e8f0'}`,
            background: addOnFoamWrap ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Bubble & High-Density Foam Bumper Wrap (+₹499)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Protective multi-layer padding for rear-view mirrors, alloy rims, and front/rear bumpers.
            </span>
          </div>
          <input type="checkbox" checked={addOnFoamWrap} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>

        <div 
          onClick={() => setAddOnExpressTransit(!addOnExpressTransit)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnExpressTransit ? theme.color : '#e2e8f0'}`,
            background: addOnExpressTransit ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Express Non-Stop Twin-Driver Transit (+₹1,999)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Dual rotating commercial drivers ensure zero layover delays, delivering 48 hours faster!
            </span>
          </div>
          <input type="checkbox" checked={addOnExpressTransit} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>
      </div>
    </div>
  );

  const renderVehicleStep4 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Review Quotation & Assigned Fleet Captain
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Your vehicle carrier slot is held. Review logistics specifications before dispatch confirmation.
      </p>

      {/* Fleet Captain Profile Card */}
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
          🚛
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Captain Harpreet Singh
            </h4>
            <span style={{ background: '#eff6ff', color: theme.color, fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
              SafeCarrier Master Logistics #VL-8902
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            14+ years commercial transport • 1,200+ luxury cars delivered with 0 claims • Live GPS Container Telemetry
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem', color: '#475569' }}>
            <span>⭐ 4.97 (450+ verified vehicle runs)</span>
            <span>📍 Corridors: Pan-India Golden Quadrilateral</span>
            <span>🛡️ Zero Damage Guarantee</span>
          </div>
        </div>
      </div>

      {/* Itemized Cost Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Itemized Transit Quotation
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>{vehicleName} Base Transport ({vehicleCategory.toUpperCase()})</span>
          <span>₹{pricing.baseRate}</span>
        </div>
        {pricing.carrierSurge > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
            <span>{carrierType === 'enclosed' ? 'Enclosed Container Pod' : 'Single-Car VIP Pod'}</span>
            <span>+₹{pricing.carrierSurge}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Doorstep Hydraulic Ramp Loading & Unloading</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹0)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Live GPS Satellite Tracking Link</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹0)</span>
        </div>
        {pricing.addOnsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
            <span>Insurance & Foam Padding Add-ons</span>
            <span>+₹{pricing.addOnsTotal}</span>
          </div>
        )}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--navy-900)' }}>Total Vehicle Relocation:</span>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>All highway tolls, GST, and doorstep delivery included</div>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: theme.color }}>
            ₹{pricing.grandTotal}
          </span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     2. PET RELOCATION STEPS
     ========================================================================= */
  const renderPetStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Pet Profile & Travel Comfort Needs
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Every pet is family. We calibrate cabin temperature, bedding, and breaks based on your pet's needs.
      </p>

      {/* Pet Species Selector */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Pet Category
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: 'dog', icon: '🐕', label: 'Dog / Canine' },
          { id: 'cat', icon: '🐈', label: 'Cat / Feline' },
          { id: 'bird-small', icon: '🦜', label: 'Birds / Small Pets' }
        ].map((type) => (
          <div
            key={type.id}
            onClick={() => setPetType(type.id)}
            style={{
              padding: '12px 14px', borderRadius: '12px',
              border: `2px solid ${petType === type.id ? theme.color : '#e2e8f0'}`,
              background: petType === type.id ? theme.bgSoft : 'white',
              fontWeight: 700, fontSize: '0.9rem',
              color: petType === type.id ? theme.color : 'var(--navy-900)',
              cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </div>
        ))}
      </div>

      {/* Pet Details Inputs */}
      <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Pet Specifications
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pet Name</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Bruno"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Breed</label>
            <input
              type="text"
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value)}
              placeholder="e.g. Golden Retriever"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Approx Weight</label>
            <input
              type="text"
              value={petWeight}
              onChange={(e) => setPetWeight(e.target.value)}
              placeholder="e.g. 28 kg"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Travel Temperament Check */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Pet Travel Temperament
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {[
          { id: 'calm', title: '🐾 Calm & Vehicle-Friendly', desc: 'Enjoys car rides and sleeps comfortably' },
          { id: 'nervous-anxious', title: '😰 Nervous / Easily Anxious', desc: 'Needs calming pheromones and frequent stops' },
          { id: 'motion-sick', title: '🤢 Prone to Motion Sickness', desc: 'Requires anti-nausea protocol and gentle driving' }
        ].map((temp) => {
          const isSelected = petTemperament === temp.id;
          return (
            <div
              key={temp.id}
              onClick={() => setPetTemperament(temp.id)}
              style={{
                padding: '14px', borderRadius: '12px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.9rem' }}>
                {temp.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                {temp.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPetStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Transit Mode & Route Details
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Choose between dedicated intercity climate-controlled cab or air travel pet cargo assistance.
      </p>

      {/* Travel Mode Cards */}
      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {[
          {
            id: 'dedicated-cab',
            icon: '🚖',
            title: 'Dedicated AC Pet Cab (Intercity Road Travel)',
            desc: 'Sanitized SUV (Innova/Ertiga) with rear seats folded and orthopedic waterproof bedding. You can ride along or pet travels with our handler.',
            price: '₹4,499 onwards',
            badge: 'Most Popular'
          },
          {
            id: 'air-cargo',
            icon: '✈️',
            title: 'Domestic Air Travel Pet Cargo Assistance',
            desc: 'Complete flight logistics: IATA approved travel crate, airline booking, DGCA microchip verification, and vet fit-to-fly certificate.',
            price: '₹8,499 onwards',
            badge: 'Fast Long-Distance'
          },
          {
            id: 'local-cab',
            icon: '🚗',
            title: 'Local Intra-City Sanitized Relocation Cab',
            desc: 'Point-to-point same-city relocation with climate control and secured pet safety harness.',
            price: '₹1,899 onwards',
            badge: 'Within City'
          }
        ].map((mode) => {
          const isSelected = petTravelMode === mode.id;
          return (
            <div
              key={mode.id}
              onClick={() => setPetTravelMode(mode.id)}
              style={{
                padding: '16px 20px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '1.8rem' }}>{mode.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.95rem' }}>
                      {mode.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: isSelected ? 'white' : '#f1f5f9', color: isSelected ? theme.color : '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {mode.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                    {mode.desc}
                  </div>
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: theme.color }}>
                {mode.price}
              </span>
            </div>
          );
        })}
      </div>

      {/* Traveling Along Toggle */}
      {petTravelMode === 'dedicated-cab' && (
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Are you traveling along in the cab with {petName}?
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Front passenger seats can accommodate up to 2 pet parents with luggage at zero extra cost!
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setParentTravelingAlong(true)}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem',
                border: 'none', background: parentTravelingAlong ? theme.color : '#e2e8f0', color: parentTravelingAlong ? 'white' : '#475569', cursor: 'pointer'
              }}
            >
              Yes, with me
            </button>
            <button
              type="button"
              onClick={() => setParentTravelingAlong(false)}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem',
                border: 'none', background: !parentTravelingAlong ? theme.color : '#e2e8f0', color: !parentTravelingAlong ? 'white' : '#475569', cursor: 'pointer'
              }}
            >
              Handler solo
            </button>
          </div>
        </div>
      )}

      {/* Route Cities */}
      <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Origin & Destination Locations
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pickup City / Address</label>
            <input
              type="text"
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              placeholder="e.g. Mumbai, Bandra West"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Destination City / Address</label>
            <input
              type="text"
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              placeholder="e.g. Pune, Koregaon Park"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPetStep3 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Hydration, Comfort & Travel Add-ons
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Our canine & feline care protocols ensure stress-free transit without dehydration or fatigue.
      </p>

      {/* Safety Reassurance Protocol */}
      <div style={{ background: '#fdf4ff', border: '1.5px solid #f0abfc', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#86198f', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiOutlineCheckCircle style={{ fontSize: '1.3rem' }} />
          ServeCircle Pet Transit Comfort Protocol (Included FREE)
        </h4>
        <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem', color: '#701a75', lineHeight: 1.5 }}>
          <div>✓ <strong>Scheduled 2.5-Hour Rest Stops:</strong> Mandatory outdoor stretch, leash walk, and fresh filtered water break.</div>
          <div>✓ <strong>Hourly WhatsApp Media Updates:</strong> Live photos and video clips sent directly to your phone.</div>
          <div>✓ <strong>In-Cab Pet First Aid Kit:</strong> Canine CPR trained handler on board with emergency vet hotline backup.</div>
        </div>
      </div>

      {/* Add-ons */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Optional Pet Comfort Upgrades
      </label>
      <div style={{ display: 'grid', gap: '10px' }}>
        <div 
          onClick={() => setAddOnCalmingTreats(!addOnCalmingTreats)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnCalmingTreats ? theme.color : '#e2e8f0'}`,
            background: addOnCalmingTreats ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Organic Calming Pheromone Spray & Lavender Treats (+₹299)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Vet-formulated natural chamomile and hemp chews to soothe travel jitters and highway anxiety.
            </span>
          </div>
          <input type="checkbox" checked={addOnCalmingTreats} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>

        <div 
          onClick={() => setAddOnMemoryBed(!addOnMemoryBed)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnMemoryBed ? theme.color : '#e2e8f0'}`,
            background: addOnMemoryBed ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Orthopedic Memory Foam Travel Bed & Seat Hammock (+₹499)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Extra joint cushioning bed that absorbs road bumps, keeping {petName} plush and cozy.
            </span>
          </div>
          <input type="checkbox" checked={addOnMemoryBed} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>

        <div 
          onClick={() => setAddOnAntiNauseaKit(!addOnAntiNauseaKit)}
          style={{
            padding: '14px 18px', borderRadius: '12px',
            border: `1.5px solid ${addOnAntiNauseaKit ? theme.color : '#e2e8f0'}`,
            background: addOnAntiNauseaKit ? theme.bgSoft : 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
              Anti-Nausea Motion Sickness Electrolyte Kit (+₹199)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Includes oral rehydration electrolyte powder, vomit bags, and vet-approved ginger drops.
            </span>
          </div>
          <input type="checkbox" checked={addOnAntiNauseaKit} onChange={() => {}} style={{ accentColor: theme.color, width: '18px', height: '18px' }} />
        </div>
      </div>
    </div>
  );

  const renderPetStep4 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Review Pet Journey & Assigned Travel Specialist
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        A certified pet care buddy will arrive with sterilized travel crate and harness.
      </p>

      {/* Specialist Profile Card */}
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
          🐾
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Pooja Nair
            </h4>
            <span style={{ background: '#fdf4ff', color: theme.color, fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
              Canine Behaviorist & Pet Travel Lead
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            8+ years specialized pet relocation • 800+ safe intercity pet journeys • Red Cross Animal CPR Certified
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem', color: '#475569' }}>
            <span>⭐ 4.98 (380+ Pet Parents)</span>
            <span>📱 Hourly WhatsApp Photo Updates</span>
            <span>🐾 Traveling with: {petName}</span>
          </div>
        </div>
      </div>

      {/* Itemized Cost Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Itemized Pet Travel Quotation
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>{petTravelMode.replace('-', ' ').toUpperCase()} ({originCity} → {destinationCity})</span>
          <span>₹{pricing.baseRate}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Parent Travel in Cab (Front Seats)</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹0)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Hydration Breaks & Certified Handler Oversight</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹0)</span>
        </div>
        {pricing.addOnsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
            <span>Comfort Bedding & Treats</span>
            <span>+₹{pricing.addOnsTotal}</span>
          </div>
        )}
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--navy-900)' }}>Total Pet Relocation Fare:</span>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Includes sanitized vehicle, AC, toll tags & highway tax</div>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: theme.color }}>
            ₹{pricing.grandTotal}
          </span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     3. SCRAP & JUNK REMOVAL STEPS
     ========================================================================= */
  const renderScrapStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Pre-Move Declutter Inventory Checklist
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Select unwanted household items to purge. Don't pay packers to move broken junk to your new home!
      </p>

      {/* Multi-select items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { id: 'mattress', icon: '🛏️', title: 'Old Spring Mattresses', desc: 'Sagging foam, coir & double beds' },
          { id: 'wooden-furniture', icon: '🚪', title: 'Broken Furniture', desc: 'Damaged wardrobes, beds, study desks' },
          { id: 'sofa-cushions', icon: '🛋️', title: 'Old Sofas & Recliners', desc: 'Torn fabric, sinking foam armchairs' },
          { id: 'appliances-ewaste', icon: '📺', title: 'E-Waste & Appliances', desc: 'Old TVs, microwaves, fridges, CPUs' },
          { id: 'scrap-metal', icon: '⚙️', title: 'Metal & Iron Scrap', desc: 'Rusted bikes, brass fittings, grills' },
          { id: 'paper-cardboard', icon: '📦', title: 'Paper & Old Cartons', desc: 'Bundles of old newspapers & books' },
          { id: 'plywood-debris', icon: '🪵', title: 'Renovation Debris', desc: 'Discarded plywood & broken laminates' }
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
                padding: '16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px',
                    border: `2px solid ${isSelected ? theme.color : '#cbd5e1'}`,
                    background: isSelected ? theme.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    {isSelected && <HiOutlineCheck size={16} />}
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.92rem' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderScrapStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Property Logistics & Removal Crew Sizing
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Ensure our lifters bring the right size truck and tools for your society floor.
      </p>

      {/* Crew & Truck Sizing */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Select Removal Truck & Crew Capacity
      </label>
      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {[
          {
            id: 'mini-crew',
            icon: '🚛',
            title: 'Tata Ace Mini-Truck + 2 Heavy Loaders (Standard)',
            desc: 'Ideal for 1-2 rooms declutter, 1 mattress, and 2-3 bulky items. Flat ₹499 base evaluation fee.',
            price: '₹499 Evaluation Fee'
          },
          {
            id: 'maxi-crew',
            icon: '🚚',
            title: 'Bolero / 14-ft Truck + 4 Heavy Loaders & Power Tools',
            desc: 'For full 2-3 BHK complete home purge. Handles multiple mattresses, heavy wooden wardrobes & appliances.',
            price: '₹999 Full Purge'
          }
        ].map((crew) => {
          const isSelected = scrapCrewSize === crew.id;
          return (
            <div
              key={crew.id}
              onClick={() => setScrapCrewSize(crew.id)}
              style={{
                padding: '16px 20px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '1.8rem' }}>{crew.icon}</span>
                <div>
                  <span style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.95rem' }}>
                    {crew.title}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                    {crew.desc}
                  </div>
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: theme.color }}>
                {crew.price}
              </span>
            </div>
          );
        })}
      </div>

      {/* Property Type / Elevator Access */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Building & Floor Access
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {[
          { id: 'apartment-lift', title: 'Apartment with Elevator', desc: 'Easy freight or passenger lift' },
          { id: 'apartment-stairs', title: 'Stairs Only (1st-4th Floor)', desc: 'Manual stair carry (+₹250)' },
          { id: 'independent-house', title: 'Independent Villa / Ground', desc: 'Direct ground floor truck loading' }
        ].map((prop) => {
          const isSelected = propertyType === prop.id;
          return (
            <div
              key={prop.id}
              onClick={() => setPropertyType(prop.id)}
              style={{
                padding: '14px', borderRadius: '12px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 800, color: isSelected ? theme.color : 'var(--navy-900)', fontSize: '0.9rem' }}>
                {prop.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                {prop.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Address & Slot */}
      <div style={{ background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Pickup Location & Date
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Full Pickup Address</label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. Flat 802, Greenwood Heights, SG Highway"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderScrapStep3 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Dismantling, Salvage Cash & Broom-Clean Promise
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Our crew brings heavy tools to break down oversized furniture and sweeps the floor clean!
      </p>

      {/* Salvage Cash Guarantee */}
      <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: '18px 20px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiOutlineScale style={{ fontSize: '1.3rem' }} />
          Digital Weighing Scale & Salvage Cash Credit Back
        </h4>
        <div style={{ fontSize: '0.82rem', color: '#15803d', lineHeight: 1.5 }}>
          Our truck carries certified digital hanging scales. Any salvageable brass, copper, iron grills, and working appliances are weighed transparently, and <strong>cash/UPI salvage value is credited back directly to you on the spot</strong>!
        </div>
      </div>

      {/* Dismantling & Broom Clean Guarantees */}
      <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HiOutlineWrenchScrewdriver style={{ color: theme.color, fontSize: '1.6rem', flexShrink: 0 }} />
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--navy-900)' }}>
              Heavy Furniture Dismantling Included (FREE)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Power screwdrivers & Allen keys to unbolt king-size beds, modular wardrobes, and desks that don't fit into society lifts.
            </span>
          </div>
        </div>

        <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HiOutlineSparkles style={{ color: theme.color, fontSize: '1.6rem', flexShrink: 0 }} />
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--navy-900)' }}>
              Post-Removal Broom-Clean Promise (FREE)
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
              Our loaders sweep the room and hallway spotless after lifting, leaving no sawdust or cobwebs for the landlord.
            </span>
          </div>
        </div>
      </div>

      {/* Preferred Time Slots */}
      <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '10px' }}>
        Select Pickup Time Slot
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
        {[
          { id: '08:00 AM - 11:00 AM', title: '08:00 AM - 11:00 AM', desc: 'Morning (Before Packers Arrive)' },
          { id: '11:30 AM - 02:30 PM', title: '11:30 AM - 02:30 PM', desc: 'Midday Slot' },
          { id: '03:00 PM - 06:00 PM', title: '03:00 PM - 06:00 PM', desc: 'Afternoon Final Purge' }
        ].map((slot) => {
          const isSelected = scrapTimeSlot === slot.id;
          return (
            <div
              key={slot.id}
              onClick={() => setScrapTimeSlot(slot.id)}
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
    </div>
  );

  const renderScrapStep4 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        Review Declutter Booking & Assigned Eco Lead
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '20px' }}>
        Your heavy removal truck and loading crew are scheduled. Confirm pickup details.
      </p>

      {/* Crew Lead Card */}
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
          ♻️
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Ramesh Gujjar
            </h4>
            <span style={{ background: '#f0fdf4', color: theme.color, fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
              Eco-Declutter Team Lead #SCRAP-410
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            600+ residential home declutter pickups • 100% Authorized Green Recycling Partners • Verified Crew
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem', color: '#475569' }}>
            <span>⭐ 4.96 (520+ Reviews)</span>
            <span>⏱️ Slot: {scrapTimeSlot}</span>
            <span>⚖️ Digital Scale on Truck</span>
          </div>
        </div>
      </div>

      {/* Itemized Cost Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Pickup & Evaluation Fee Summary
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Truck Dispatch & Heavy Loader Crew ({scrapCrewSize === 'mini-crew' ? 'Tata Ace 2-Loaders' : 'Bolero 4-Loaders'})</span>
          <span>₹{pricing.baseFee}</span>
        </div>
        {pricing.stairsSurcharge > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
            <span>Staircase Manual Heavy Carry Surcharge</span>
            <span>+₹{pricing.stairsSurcharge}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Power Tool Dismantling & Unbolting</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹0)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
          <span>Post-Removal Floor Broom Sweeping</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>FREE (₹0)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#059669', fontWeight: 700, marginBottom: '8px', padding: '6px 10px', background: '#ecfdf5', borderRadius: '8px' }}>
          <span>⚖️ Scrap Metal & Appliance Salvage Cash</span>
          <span>Credited Back Instantly on Scale!</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--navy-900)' }}>Pickup Booking Deposit:</span>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Deducted from final scrap salvage settlement</div>
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
          onClick={() => navigate('/customer/relocation')} 
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
          <HiOutlineArrowLeft /> Back to Relocation Hub
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
          {renderStepTracker()}

          {/* Wizard Content Body */}
          <div style={{ padding: '30px' }}>
            {flowType === 'vehicle-relocation' && (
              <>
                {step === 1 && renderVehicleStep1()}
                {step === 2 && renderVehicleStep2()}
                {step === 3 && renderVehicleStep3()}
                {step === 4 && renderVehicleStep4()}
              </>
            )}

            {flowType === 'pet-relocation' && (
              <>
                {step === 1 && renderPetStep1()}
                {step === 2 && renderPetStep2()}
                {step === 3 && renderPetStep3()}
                {step === 4 && renderPetStep4()}
              </>
            )}

            {flowType === 'scrap-removal' && (
              <>
                {step === 1 && renderScrapStep1()}
                {step === 2 && renderScrapStep2()}
                {step === 3 && renderScrapStep3()}
                {step === 4 && renderScrapStep4()}
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

export default RelocationPremiumFlow;
