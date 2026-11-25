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
  HiOutlineHeart,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { IconTile, StatusPill } from '../../components/ui';
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
          color: 'var(--ink-2)',
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
          background: 'linear-gradient(135deg, var(--blue-deep) 0%, var(--ink) 100%)',
          borderRadius: '26px',
          color: 'var(--bg-page)',
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
              color: 'var(--bg-page)',
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
          <p style={{ fontSize: '0.88rem', color: 'var(--glass-edge)', margin: 0, lineHeight: 1.5 }}>
            Calculate accurate vehicle sizes, customize your inventory, and enjoy guaranteed safe handling with zero hidden charges.
          </p>
        </div>

        <Link
          to="/customer/packers-demo"
          style={{
            background: 'var(--bg-page)',
            color: 'var(--ink)',
            fontWeight: 800,
            fontSize: '0.9rem',
            padding: '12px 24px',
            borderRadius: '12px',
            border: '1.5px solid var(--glass-edge)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
          }}
        >
          <HiOutlineSparkles style={{ color: 'var(--blue)', fontSize: '1.1rem' }} /> Try AI Room Scanner Demo
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
          className="glass"
          style={{
            borderRadius: '26px',
            padding: '28px',
            boxShadow: 'var(--sh-card)',
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
                color: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              <HiOutlineCalculator />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--blue)' }}>
                {t('relocation.volumeEstimator', 'Interactive Shifting Planner')}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--ink-2)' }}>
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
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '6px',
                }}
              >
                <HiOutlineMapPin style={{ color: 'var(--blue)' }} /> {t('relocationExt.pickupCity', 'Pickup City / Area')}
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
                  border: '1.5px solid var(--glass-edge)',
                  background: 'var(--bg-page)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--blue)',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '6px',
                }}
              >
                <HiOutlineMapPin style={{ color: 'var(--blue)' }} /> {t('relocationExt.dropCity', 'Drop City / Area')}
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
                  border: '1.5px solid var(--glass-edge)',
                  background: 'var(--bg-page)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--blue)',
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
                border: transitType === 'full' ? '1.5px solid var(--blue)' : '1.5px solid var(--glass-edge)',
                background: transitType === 'full' ? 'var(--blue)' : 'var(--bg-page)',
                color: transitType === 'full' ? '#FFFFFF' : 'var(--ink-2)',
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
                border: transitType === 'single' ? '1.5px solid var(--blue)' : '1.5px solid var(--glass-edge)',
                background: transitType === 'single' ? 'var(--blue)' : 'var(--bg-page)',
                color: transitType === 'single' ? '#FFFFFF' : 'var(--ink-2)',
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
                background: 'var(--bg-page)',
                borderRadius: '14px',
                border: '1px solid var(--glass-edge)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--blue)' }}>
                  {t('relocationExt.autoFill', 'Quick Presets by House Size:')}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--blue)', fontWeight: 700 }}>
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
                      background: 'var(--glass)',
                      border: '1px solid var(--glass-edge)',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--blue)',
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
                    background: 'var(--glass)',
                    border: '1px dashed var(--ink-3)',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--ink-3)',
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
                  background: 'var(--bg-page)',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-edge)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.88rem', color: 'var(--blue)', fontWeight: 700, display: 'block' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-2)' }}>
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
                      border: '1px solid var(--glass-edge)',
                      background: 'var(--glass)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: 'var(--blue)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 900, color: 'var(--ink)', fontSize: '0.92rem' }}>
                    {inventory[item.id] || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInventoryChange(item.id, 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-edge)',
                      background: 'var(--glass)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: 'var(--blue)',
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
              background: 'var(--bg-page)',
              padding: '16px',
              borderRadius: '14px',
              marginTop: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              border: '1px solid var(--glass-edge)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--blue)' }}>
                Elevator / Lift Available?
              </span>
              <select
                value={hasLift ? 'yes' : 'no'}
                onChange={(e) => setHasLift(e.target.value === 'yes')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-edge)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--blue)',
                  background: 'var(--glass)',
                  outline: 'none',
                }}
              >
                <option value="yes">Yes, Service Lift Present</option>
                <option value="no">No, Stairs Only (+₹800)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                Packing Material Tier
              </span>
              <select
                value={packingType}
                onChange={(e) => setPackingType(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-edge)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--blue)',
                  background: 'var(--glass)',
                  outline: 'none',
                }}
              >
                <option value="basic">Standard Blankets &amp; Ropes (Included)</option>
                <option value="premium">3-Layer Bubble Wrap + Foam (+₹{transitType === 'full' ? '1,499' : '399'})</option>
              </select>
            </div>

            <div style={{ borderTop: '1px dashed var(--glass-edge)', paddingTop: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={addInsurance}
                  onChange={(e) => setAddInsurance(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--blue)' }}
                />
                Include Transit Insurance (Goods protected up to ₹1,00,000) (+₹499)
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Live Quote & Fleet Summary */}
        <div
          className="glass"
          style={{
            borderRadius: '26px',
            padding: '28px',
            boxShadow: 'var(--sh-card)',
            position: 'sticky',
            top: '84px',
          }}
        >
          {/* Header & Fleet Recommendation Badge */}
          <div style={{ borderBottom: '1px solid var(--glass-edge)', paddingBottom: '18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Instant Moving Quote
              </span>
              <span
                style={{
                  background: 'rgba(83, 109, 87, 0.12)',
                  color: 'var(--ink)',
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
                  background: 'var(--bg-page)',
                  border: '1px solid var(--glass-edge)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--blue)',
                  fontSize: '1.4rem',
                }}
              >
                <HiOutlineTruck />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--ink-2)', display: 'block' }}>Recommended Fleet:</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--blue)' }}>{estimatedTrucks}</strong>
              </div>
            </div>
          </div>

          {/* Weight & Specs Summary */}
          <div
            style={{
              background: 'var(--bg-page)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              border: '1px solid var(--glass-edge)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span style={{ color: 'var(--ink-2)' }}>Estimated Volume &amp; Load:</span>
              <strong style={{ color: 'var(--ink)' }}>{totalWeight} kg</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--ink-2)' }}>Inventory Count:</span>
              <strong style={{ color: 'var(--ink)' }}>
                {Object.values(inventory).reduce((a, b) => a + b, 0)} Items
              </strong>
            </div>
          </div>

          {/* Itemized Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}>
              <span>Base Vehicle &amp; Crew Fare:</span>
              <span>₹{baseRate.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}>
              <span>Weight Load Handling:</span>
              <span>₹{weightCharge.toLocaleString()}</span>
            </div>
            {packingCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}>
                <span>3-Layer Bubble Wrap Packing:</span>
                <span>₹{packingCharge.toLocaleString()}</span>
              </div>
            )}
            {liftCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}>
                <span>Staircase Carry Charge:</span>
                <span>₹{liftCharge.toLocaleString()}</span>
              </div>
            )}
            {insuranceCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}>
                <span>Transit Protection Insurance:</span>
                <span>₹{insuranceCharge.toLocaleString()}</span>
              </div>
            )}
            {intercityCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-2)' }}>
                <span>Intercity Transit &amp; Toll Surcharge:</span>
                <span>₹{intercityCharge.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Total Price Banner */}
          <div
            style={{
              borderTop: '1.5px solid var(--glass-edge)',
              paddingTop: '16px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Total Estimated Fare
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--blue)', fontWeight: 600 }}>
                Includes GST &amp; Toll Pass-Throughs
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--ink)' }}>
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
              background: 'var(--blue)',
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
            <span style={{ fontSize: '0.76rem', color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <HiOutlineCheckBadge /> 100% Background-Verified Moving Crews
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlineShieldCheck /> Zero Hidden Charges Guarantee at Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Specialized Moving Services Section */}
      <div style={{ marginTop: '48px', marginBottom: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--blue)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Specialized Relocation Solutions</span>
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink-3)', margin: 0 }}>
            Dedicated transport services calibrated for vehicles, pets, and scrap removal with verified safety standards.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {/* 1. Vehicle Relocation */}
          <div
            className="glass is-clickable"
            style={{
              borderRadius: '26px',
              padding: '28px 24px',
              boxShadow: 'var(--sh-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <IconTile icon={HiOutlineTruck} tone="blue" size={48} />
                <StatusPill status="Assigned" label="Safe Car & Bike Carrier" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px 0' }}>
                {t('relocationExt.vehicleRelocation', 'Vehicle Relocation')}
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Enclosed container trucks with wheel stoppers, hydraulic ramp loading, and zero-dep insurance for your car or two-wheeler.
              </p>
              <div className="sunken" style={{ padding: '14px 16px', borderRadius: '18px', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginBottom: '4px' }}>Starting from:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--blue)' }}>
                  ₹4,999 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-3)' }}>(Bike & Car Carrier)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--status-success-text)', fontWeight: 700, marginTop: '6px' }}>
                  Hydraulic Ramp Loading • Live GPS Container Track
                </div>
              </div>
            </div>
            <div>
              <Link
                to="/customer/relocation-flow?type=vehicle-relocation"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxSizing: 'border-box'
                }}
              >
                Book VIP Vehicle Transport
              </Link>
            </div>
          </div>

          {/* 2. Pet Relocation */}
          <div
            className="glass is-clickable"
            style={{
              borderRadius: '26px',
              padding: '28px 24px',
              boxShadow: 'var(--sh-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <IconTile icon={HiOutlineHeart} tone="purple" size={48} />
                <StatusPill status="In progress" label="Climate-Controlled Travel" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px 0' }}>
                {t('relocationExt.petRelocation', 'Pet Relocation & Cab')}
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Dedicated AC sanitized cab, certified pet handler, scheduled hydration stops, and stress-free transit for your furry friends.
              </p>
              <div className="sunken" style={{ padding: '14px 16px', borderRadius: '18px', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginBottom: '4px' }}>Starting from:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--purple, #7c3aed)' }}>
                  ₹2,999 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-3)' }}>(Dedicated Pet Cab / Flight)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--status-success-text)', fontWeight: 700, marginTop: '6px' }}>
                  Certified Pet Handler • Regular Hydration Breaks
                </div>
              </div>
            </div>
            <div>
              <Link
                to="/customer/relocation-flow?type=pet-relocation"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxSizing: 'border-box'
                }}
              >
                Book VIP Pet Travel
              </Link>
            </div>
          </div>

          {/* 3. Junk & Scrap Removal */}
          <div
            className="glass is-clickable"
            style={{
              borderRadius: '26px',
              padding: '28px 24px',
              boxShadow: 'var(--sh-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <IconTile icon={HiOutlineTrash} tone="green" size={48} />
                <StatusPill status="Completed" label="Pre-Move Declutter" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px 0' }}>
                {t('relocationExt.scrapRemoval', 'Scrap & Junk Removal')}
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Declutter old mattresses, scrap metal, broken furniture & e-waste. Evaluation fee with salvage cash/UPI credited back.
              </p>
              <div className="sunken" style={{ padding: '14px 16px', borderRadius: '18px', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', marginBottom: '4px' }}>Evaluation Fee:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--status-success-text)' }}>
                  ₹499 <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-3)' }}>(Salvage cash credited back)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--status-success-text)', fontWeight: 700, marginTop: '6px' }}>
                  Heavy Furniture Dismantling • Broom-Clean Promise
                </div>
              </div>
            </div>
            <div>
              <Link
                to="/customer/relocation-flow?type=scrap-removal"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxSizing: 'border-box'
                }}
              >
                Schedule Declutter Pickup (₹499)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelocationHub;
