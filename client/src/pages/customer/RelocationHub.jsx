import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowLeft,
  HiOutlineCalculator,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineCheckBadge,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const RelocationHub = () => {
  const { t } = useTranslation();
  const [transitType, setTransitType] = useState('full'); // 'full' or 'single'

  // Inventory state
  const [inventory, setInventory] = useState({
    sofa: 1,
    doubleBed: 1,
    refrigerator: 1,
    wardrobe: 1,
    box: 8,
  });

  // Shifting route & options
  const [pickupCity, setPickupCity] = useState('');
  const [dropCity, setDropCity] = useState('');
  const [hasLift, setHasLift] = useState(true);
  const [packingType, setPackingType] = useState('basic');
  const [addInsurance, setAddInsurance] = useState(true);

  const handleInventoryChange = (item, diff) => {
    setInventory((prev) => ({
      ...prev,
      [item]: Math.max(0, prev[item] + diff),
    }));
  };

  const handleBhkSelect = (bhk) => {
    if (bhk === 1) setInventory({ sofa: 1, doubleBed: 1, refrigerator: 1, wardrobe: 1, box: 8 });
    else if (bhk === 2) setInventory({ sofa: 2, doubleBed: 2, refrigerator: 1, wardrobe: 2, box: 18 });
    else if (bhk === 3) setInventory({ sofa: 3, doubleBed: 3, refrigerator: 2, wardrobe: 4, box: 30 });
  };

  const calculateTotalVolume = () => {
    const weights = { sofa: 80, doubleBed: 120, refrigerator: 90, wardrobe: 100, box: 15 };
    let totalWeight = 0;
    Object.keys(inventory).forEach((key) => {
      totalWeight += (inventory[key] || 0) * weights[key];
    });
    return totalWeight;
  };

  const totalWeight = calculateTotalVolume();
  const estimatedTrucks =
    totalWeight > 800
      ? '17ft Closed Container'
      : totalWeight > 450
      ? '14ft Eicher / Canter'
      : totalWeight > 0
      ? 'Tata Ace / 8ft Pickup'
      : 'Select items below';

  // Dynamic pricing calculation
  const baseRate = transitType === 'full' ? 2999 : 699;
  const weightCharge = Math.round(totalWeight * 4.5);
  const packingCharge = packingType === 'premium' ? (transitType === 'full' ? 1499 : 399) : 0;
  const liftCharge = !hasLift ? 800 : 0;
  const insuranceCharge = addInsurance ? 499 : 0;
  const isIntercity =
    pickupCity && dropCity && pickupCity.toLowerCase().trim() !== dropCity.toLowerCase().trim();
  const intercityCharge = isIntercity ? 4500 : 0;

  const dynamicPrice = baseRate + weightCharge + packingCharge + liftCharge + insuranceCharge + intercityCharge;

  const formatInventorySpecs = () => {
    const items = [];
    if (inventory.sofa > 0) items.push(`${inventory.sofa}x Sofa`);
    if (inventory.doubleBed > 0) items.push(`${inventory.doubleBed}x Double Bed`);
    if (inventory.refrigerator > 0) items.push(`${inventory.refrigerator}x Refrigerator`);
    if (inventory.wardrobe > 0) items.push(`${inventory.wardrobe}x Wardrobe`);
    if (inventory.box > 0) items.push(`${inventory.box}x Carton Boxes`);
    return items.length > 0 ? items.join(', ') : 'Standard Household Items';
  };

  const bookingUrl = `/customer/book?service=${encodeURIComponent(
    transitType === 'full' ? 'Full Home Shifting service' : 'Single Heavy Item Transport'
  )}&serviceId=${transitType === 'full' ? 'full-home-shifting' : 'single-item-transport'}&category=relocation&price=${dynamicPrice}&hasLift=${hasLift}&packingType=${packingType}&originCity=${encodeURIComponent(
    pickupCity || 'Local City'
  )}&destCity=${encodeURIComponent(dropCity || 'Local City')}&inventorySpecs=${encodeURIComponent(
    formatInventorySpecs()
  )}&totalWeightKg=${totalWeight}`;

  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px' }}>
      {/* Top Breadcrumb Back Link */}
      <Link
        to="/customer/general-services"
        className="sidebar-link"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6B665C',
          fontWeight: 700,
          fontSize: '0.86rem',
          textDecoration: 'none',
          marginBottom: '20px',
          width: 'fit-content',
        }}
      >
        <HiOutlineArrowLeft /> Back to General Services
      </Link>

      {/* Hero Banner: Warm Organic Luxury Aesthetic with High-Contrast Button */}
      <div
        style={{
          marginBottom: '32px',
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
          borderRadius: '20px',
          color: '#FAF9F6',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          border: '1px solid rgba(226, 232, 240, 0.25)',
          boxShadow: '0 10px 30px -5px rgba(30, 64, 175, 0.3)',
        }}
      >
        <div style={{ flex: '1 1 340px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(83, 109, 87, 0.35)',
              color: '#FAF9F6',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '10px',
              border: '1px solid rgba(226, 232, 240, 0.2)',
            }}
          >
            <HiOutlineTruck /> ServeCircle Relocation &amp; Logistics
          </div>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 900,
              margin: '0 0 6px 0',
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
            }}
          >
            Smart Packers &amp; Movers 2.0
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#E2E8F0', margin: 0, lineHeight: 1.5 }}>
            Calculate accurate vehicle sizes, customize your inventory, and enjoy guaranteed safe handling with zero hidden charges.
          </p>
        </div>

        <Link
          to="/customer/packers-demo"
          style={{
            background: '#FAF9F6',
            color: '#0F172A',
            fontWeight: 800,
            fontSize: '0.9rem',
            padding: '12px 24px',
            borderRadius: '12px',
            border: '1.5px solid #E2E8F0',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
          }}
        >
          <HiOutlineSparkles style={{ color: '#536D57', fontSize: '1.1rem' }} /> Try AI Room Scanner Demo
        </Link>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '28px',
          marginBottom: '40px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Shifting Planner & Inventory Calculator */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(30, 64, 175, 0.05)',
          }}
        >
          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(83, 109, 87, 0.12)',
                color: '#2D5A3C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              <HiOutlineCalculator />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E40AF' }}>
                {t('relocation.volumeEstimator', 'Interactive Shifting Planner')}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#6B665C' }}>
                Select your route, transit type, and items to compute real-time quotes.
              </p>
            </div>
          </div>

          {/* Route Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '6px',
                }}
              >
                <HiOutlineMapPin style={{ color: '#536D57' }} /> {t('relocationExt.pickupCity', 'Pickup City / Area')}
              </label>
              <input
                type="text"
                placeholder="e.g. Bandra West, Mumbai"
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FAF9F6',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#1E40AF',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '6px',
                }}
              >
                <HiOutlineMapPin style={{ color: '#536D57' }} /> {t('relocationExt.dropCity', 'Drop City / Area')}
              </label>
              <input
                type="text"
                placeholder="e.g. Kothrud, Pune"
                value={dropCity}
                onChange={(e) => setDropCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FAF9F6',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#1E40AF',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Transit Mode Switcher */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
            <button
              type="button"
              onClick={() => setTransitType('full')}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '12px',
                border: transitType === 'full' ? '1.5px solid #1E40AF' : '1.5px solid #E2E8F0',
                background: transitType === 'full' ? '#1E40AF' : '#FAF9F6',
                color: transitType === 'full' ? '#FFFFFF' : '#6B665C',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: transitType === 'full' ? '0 3px 10px rgba(30, 64, 175, 0.25)' : 'none',
              }}
            >
              {t('relocation.fullShifting', 'Full House Shifting')}
            </button>
            <button
              type="button"
              onClick={() => setTransitType('single')}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '12px',
                border: transitType === 'single' ? '1.5px solid #1E40AF' : '1.5px solid #E2E8F0',
                background: transitType === 'single' ? '#1E40AF' : '#FAF9F6',
                color: transitType === 'single' ? '#FFFFFF' : '#6B665C',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: transitType === 'single' ? '0 3px 10px rgba(30, 64, 175, 0.25)' : 'none',
              }}
            >
              {t('relocation.singleLogistics', 'Single-Item Logistics')}
            </button>
          </div>

          {/* Quick Auto-Fill Presets (Full Shifting Mode) */}
          {transitType === 'full' && (
            <div
              style={{
                marginBottom: '22px',
                padding: '14px 18px',
                background: '#FAF9F6',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E40AF' }}>
                  {t('relocationExt.autoFill', 'Quick Presets by House Size:')}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#536D57', fontWeight: 700 }}>
                  1-Click Fill
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3].map((bhk) => (
                  <button
                    key={bhk}
                    type="button"
                    onClick={() => handleBhkSelect(bhk)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#1E40AF',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {bhk} BHK
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setInventory({ sofa: 0, doubleBed: 0, refrigerator: 0, wardrobe: 0, box: 0 })}
                  style={{
                    padding: '8px 14px',
                    background: '#FFFFFF',
                    border: '1px dashed #C5BCAC',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#8C8272',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Inventory Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'sofa', name: 'Luxury Sofa / Couch', weight: 80 },
              { id: 'doubleBed', name: 'Double Bed & Mattress', weight: 120 },
              { id: 'refrigerator', name: 'Refrigerator / Fridge', weight: 90 },
              { id: 'wardrobe', name: 'Modular Wardrobe / Almirah', weight: 100 },
              { id: 'box', name: 'Heavy Carton Boxes', weight: 15 },
            ].map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: '#FAF9F6',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.88rem', color: '#1E40AF', fontWeight: 700, display: 'block' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#6B665C' }}>
                    ~{item.weight} kg per unit
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleInventoryChange(item.id, -1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: '#1E40AF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 900, color: '#0F172A', fontSize: '0.92rem' }}>
                    {inventory[item.id] || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInventoryChange(item.id, 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: '#1E40AF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add-ons and Floor Adjustments */}
          <div
            style={{
              background: '#FAF9F6',
              padding: '16px',
              borderRadius: '14px',
              marginTop: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E40AF' }}>
                Elevator / Lift Available?
              </span>
              <select
                value={hasLift ? 'yes' : 'no'}
                onChange={(e) => setHasLift(e.target.value === 'yes')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#1E40AF',
                  background: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="yes">Yes, Service Lift Present</option>
                <option value="no">No, Stairs Only (+₹800)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                Packing Material Tier
              </span>
              <select
                value={packingType}
                onChange={(e) => setPackingType(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#1E40AF',
                  background: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="basic">Standard Blankets &amp; Ropes (Included)</option>
                <option value="premium">3-Layer Bubble Wrap + Foam (+₹{transitType === 'full' ? '1,499' : '399'})</option>
              </select>
            </div>

            <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={addInsurance}
                  onChange={(e) => setAddInsurance(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#1E40AF' }}
                />
                Include Transit Insurance (Goods protected up to ₹1,00,000) (+₹499)
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Live Quote & Fleet Summary */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 8px 30px rgba(30, 64, 175, 0.08)',
            position: 'sticky',
            top: '84px',
          }}
        >
          {/* Header & Fleet Recommendation Badge */}
          <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#536D57', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Instant Moving Quote
              </span>
              <span
                style={{
                  background: 'rgba(83, 109, 87, 0.12)',
                  color: '#2D5A3C',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                ● Live Price
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#FAF9F6',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1E40AF',
                  fontSize: '1.4rem',
                }}
              >
                <HiOutlineTruck />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6B665C', display: 'block' }}>Recommended Fleet:</span>
                <strong style={{ fontSize: '1.05rem', color: '#1E40AF' }}>{estimatedTrucks}</strong>
              </div>
            </div>
          </div>

          {/* Weight & Specs Summary */}
          <div
            style={{
              background: '#FAF9F6',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span style={{ color: '#6B665C' }}>Estimated Volume &amp; Load:</span>
              <strong style={{ color: '#0F172A' }}>{totalWeight} kg</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#6B665C' }}>Inventory Count:</span>
              <strong style={{ color: '#0F172A' }}>
                {Object.values(inventory).reduce((a, b) => a + b, 0)} Items
              </strong>
            </div>
          </div>

          {/* Itemized Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B665C' }}>
              <span>Base Vehicle &amp; Crew Fare:</span>
              <span>₹{baseRate.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B665C' }}>
              <span>Weight Load Handling:</span>
              <span>₹{weightCharge.toLocaleString()}</span>
            </div>
            {packingCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B665C' }}>
                <span>3-Layer Bubble Wrap Packing:</span>
                <span>₹{packingCharge.toLocaleString()}</span>
              </div>
            )}
            {liftCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B665C' }}>
                <span>Staircase Carry Charge:</span>
                <span>₹{liftCharge.toLocaleString()}</span>
              </div>
            )}
            {insuranceCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B665C' }}>
                <span>Transit Protection Insurance:</span>
                <span>₹{insuranceCharge.toLocaleString()}</span>
              </div>
            )}
            {intercityCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B665C' }}>
                <span>Intercity Transit &amp; Toll Surcharge:</span>
                <span>₹{intercityCharge.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Total Price Banner */}
          <div
            style={{
              borderTop: '1.5px solid #E2E8F0',
              paddingTop: '16px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: '#6B665C', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Total Estimated Fare
              </span>
              <span style={{ fontSize: '0.75rem', color: '#536D57', fontWeight: 600 }}>
                Includes GST &amp; Toll Pass-Throughs
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A' }}>
                ₹{dynamicPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <Link
            to={bookingUrl}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 800,
              textAlign: 'center',
              background: '#1E40AF',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(30, 64, 175, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            {t('relocation.bookShifting', 'Proceed to Book Shifting')} <HiOutlineArrowRight />
          </Link>

          {/* Trust Guarantees */}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#536D57', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <HiOutlineCheckBadge /> 100% Background-Verified Moving Crews
            </span>
            <span style={{ fontSize: '0.76rem', color: '#6B665C', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlineShieldCheck /> Zero Hidden Charges Guarantee at Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Specialized Moving Services Section */}
      <div style={{ marginTop: '48px' }}>
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1E40AF', margin: '0 0 4px 0' }}>
            Specialized Relocation Solutions
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#6B665C', margin: 0 }}>
            Dedicated transport services calibrated for vehicles, pets, and scrap removal.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {/* 1. Vehicle Relocation */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(30, 64, 175, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(83, 109, 87, 0.12)',
                  color: '#2D5A3C',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                }}
              >
                Safe Car &amp; Bike Carrier
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                {t('relocationExt.vehicleRelocation', 'Vehicle Relocation')}
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#6B665C', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                Enclosed container trucks with wheel stoppers &amp; ramp loading for your car or two-wheeler.
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6B665C' }}>Starting from:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>₹4,999</span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent(
                  'Intercity Vehicle Transport (Car / Bike)'
                )}&serviceId=vehicle-relocation&category=relocation&price=4999`}
                style={{
                  width: '100%',
                  padding: '11px',
                  fontSize: '0.88rem',
                  color: '#FFFFFF',
                  background: '#1E40AF',
                  textAlign: 'center',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  display: 'block',
                  boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)',
                }}
              >
                Book VIP Vehicle Transport
              </Link>
            </div>
          </div>

          {/* 2. Pet Relocation */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(30, 64, 175, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(83, 109, 87, 0.12)',
                  color: '#2D5A3C',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                }}
              >
                Climate-Controlled Travel
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E40AF', margin: '0 0 8px 0' }}>
                {t('relocationExt.petRelocation', 'Pet Relocation & Cab')}
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#6B665C', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                AC sanitized cab, certified handler, hydration breaks, and stress-free transit for your furry friends.
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6B665C' }}>Starting from:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>₹2,999</span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent(
                  'AC Pet Relocation Cab & Handler'
                )}&serviceId=pet-relocation&category=relocation&price=2999`}
                style={{
                  width: '100%',
                  padding: '11px',
                  fontSize: '0.88rem',
                  color: '#FFFFFF',
                  background: '#1E40AF',
                  textAlign: 'center',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  display: 'block',
                  boxShadow: '0 2px 8px rgba(30, 64, 175, 0.2)',
                }}
              >
                Book VIP Pet Travel
              </Link>
            </div>
          </div>

          {/* 3. Junk & Scrap Removal */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(30, 64, 175, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(83, 109, 87, 0.12)',
                  color: '#2D5A3C',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                }}
              >
                Pre-Move Declutter
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E40AF', margin: '0 0 8px 0' }}>
                {t('relocationExt.scrapRemoval', 'Scrap & Junk Removal')}
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#6B665C', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                Declutter old mattresses, scrap metal, and broken furniture. Evaluation fee with salvage value credited back.
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6B665C' }}>Evaluation Fee:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>₹499</span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent(
                  'Scrap & Junk Removal Pickup'
                )}&serviceId=junk-removal&category=relocation&price=499`}
                style={{
                  width: '100%',
                  padding: '11px',
                  fontSize: '0.88rem',
                  color: '#0F172A',
                  background: '#FAF9F6',
                  border: '1.5px solid #E2E8F0',
                  textAlign: 'center',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 800,
                  display: 'block',
                  transition: 'all 0.2s',
                }}
              >
                Schedule Pickup (₹499)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelocationHub;
