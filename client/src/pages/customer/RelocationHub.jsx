import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowLeft, HiOutlineArchiveBox, HiOutlineCalculator,
  HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineBuildingOffice2,
  HiOutlineArrowPath, HiOutlineTruck,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const RelocationHub = () => {
  const { t } = useTranslation();
  const [transitType, setTransitType] = useState('full'); // 'full' or 'single'
  
  // Inventory state
  const [inventory, setInventory] = useState({
    sofa: 0,
    doubleBed: 0,
    refrigerator: 0,
    wardrobe: 0,
    box: 0
  });

  // Storage Vault state
  const [vaultSpace, setVaultSpace] = useState(50); // Sq Ft
  const vaultPricePerSqFt = 20;

  // Shifting details & dynamic distance
  const [distanceKm, setDistanceKm] = useState(25);
  const [pickupCity, setPickupCity] = useState('');
  const [dropCity, setDropCity] = useState('');
  const [hasLift, setHasLift] = useState(true);
  const [packingType, setPackingType] = useState('basic');
  const [addInsurance, setAddInsurance] = useState(false);

  const handleInventoryChange = (item, diff) => {
    setInventory(prev => ({
      ...prev,
      [item]: Math.max(0, prev[item] + diff)
    }));
  };

  const handleBhkSelect = (bhk) => {
    if (bhk === 1) setInventory({ sofa: 1, doubleBed: 1, refrigerator: 1, wardrobe: 1, box: 10 });
    else if (bhk === 2) setInventory({ sofa: 2, doubleBed: 2, refrigerator: 1, wardrobe: 2, box: 20 });
    else if (bhk === 3) setInventory({ sofa: 3, doubleBed: 3, refrigerator: 2, wardrobe: 4, box: 35 });
  };

  const calculateTotalVolume = () => {
    const weights = { sofa: 80, doubleBed: 120, refrigerator: 90, wardrobe: 100, box: 15 };
    let totalWeight = 0;
    Object.keys(inventory).forEach(key => {
      totalWeight += inventory[key] * weights[key];
    });
    return totalWeight;
  };

  const totalWeight = calculateTotalVolume();
  const estimatedTrucks = totalWeight > 400 ? t('relocation.container17ft') : totalWeight > 0 ? t('relocation.tataAce') : t('relocation.selectItems');

  // Dynamic pricing calculation
  const baseRate = transitType === 'full' ? 2999 : 499;
  const weightCharge = totalWeight * 5; // ₹5 per kg
  const perKmRate = transitType === 'full' ? 16 : 10;
  const distanceCharge = Math.round(distanceKm * perKmRate);
  const packingCharge = packingType === 'premium' ? (transitType === 'full' ? 1500 : 300) : 0;
  const liftCharge = !hasLift ? 800 : 0;
  const insuranceCharge = addInsurance ? 499 : 0;
  
  let dynamicPrice = baseRate + weightCharge + distanceCharge + packingCharge + liftCharge + insuranceCharge;

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* Back Button */}
      <Link to="/customer/general-services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to General Services
      </Link>

      {/* Premium Features Demo Banner */}
      <div style={{ marginBottom: '32px', padding: '24px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineSparkles /> {t('relocationExt.expPackers')}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#e0f2fe', margin: 0 }}>{t('relocationExt.tryAiScanner')}</p>
        </div>
        <Link to="/customer/packers-demo" className="btn btn-primary" style={{ background: 'white', color: '#2563eb', fontWeight: 800, padding: '12px 24px', borderRadius: '12px', border: 'none', textDecoration: 'none' }}>
          Try Demo Now
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>
        {/* Shifting Planner & Inventory Calculator */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineCalculator style={{ color: '#8b5cf6' }} /> {t('relocation.volumeEstimator')}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('relocationExt.pickupCity')}</label>
              <input type="text" className="input-field" placeholder="e.g. Mumbai" value={pickupCity} onChange={(e) => setPickupCity(e.target.value)} style={{ padding: '10px', fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('relocationExt.dropCity')}</label>
              <input type="text" className="input-field" placeholder="e.g. Pune" value={dropCity} onChange={(e) => setDropCity(e.target.value)} style={{ padding: '10px', fontSize: '0.85rem' }} />
            </div>
          </div>

          {/* Dynamic Transit Distance Slider */}
          <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 750, color: 'var(--navy-800)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineTruck style={{ color: '#8b5cf6' }} /> Transit Distance (km):
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#8b5cf6' }}>
                {distanceKm} km
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              <span>5 km (Local)</span>
              <span>100 km</span>
              <span>250 km</span>
              <span>500 km (Intercity)</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {[15, 35, 75, 150, 300].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setDistanceKm(km)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    border: `1px solid ${distanceKm === km ? '#8b5cf6' : '#cbd5e1'}`,
                    background: distanceKm === km ? '#8b5cf6' : 'white',
                    color: distanceKm === km ? 'white' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button
              onClick={() => setTransitType('full')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: transitType === 'full' ? '#8b5cf6' : 'var(--gray-200)',
                background: transitType === 'full' ? 'rgba(139, 92, 246, 0.05)' : 'white',
                color: transitType === 'full' ? '#8b5cf6' : 'var(--gray-700)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {t('relocation.fullShifting')}
            </button>
            <button
              onClick={() => setTransitType('single')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: transitType === 'single' ? '#8b5cf6' : 'var(--gray-200)',
                background: transitType === 'single' ? 'rgba(139, 92, 246, 0.05)' : 'white',
                color: transitType === 'single' ? '#8b5cf6' : 'var(--gray-700)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {t('relocation.singleLogistics')}
            </button>
          </div>

          {transitType === 'full' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '8px' }}>
                Quick BHK Presets:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3].map((bhk) => (
                  <button
                    key={bhk}
                    type="button"
                    onClick={() => handleBhkSelect(bhk)}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, borderColor: '#8b5cf6', color: '#8b5cf6', fontWeight: 700 }}
                  >
                    {bhk} BHK Pack
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {[
              { id: 'sofa', name: t('relocation.itemSofa'), weight: '80kg' },
              { id: 'doubleBed', name: t('relocation.itemBed'), weight: '120kg' },
              { id: 'refrigerator', name: t('relocation.itemFridge'), weight: '90kg' },
              { id: 'wardrobe', name: t('relocation.itemWardrobe'), weight: '100kg' },
              { id: 'box', name: t('relocation.itemBox'), weight: '15kg' },
            ].map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-800)' }}>{item.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', display: 'block' }}>~{item.weight}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleInventoryChange(item.id, -1)}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--gray-300)', background: 'white', cursor: 'pointer', fontWeight: 800 }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{inventory[item.id]}</span>
                  <button
                    type="button"
                    onClick={() => handleInventoryChange(item.id, 1)}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--gray-300)', background: 'white', cursor: 'pointer', fontWeight: 800 }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Addons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-800)' }}>Building Has Elevator / Lift:</span>
              <input type="checkbox" checked={hasLift} onChange={(e) => setHasLift(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#8b5cf6' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-800)' }}>Packaging Material:</span>
              <select value={packingType} onChange={(e) => setPackingType(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8rem' }}>
                <option value="basic">{t('relocationExt.basicLoading')}</option>
                <option value="premium">{t('relocationExt.premiumBubble')}</option>
              </select>
            </div>
            <div style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 750, color: 'var(--navy-800)', cursor: 'pointer' }}>
                <input type="checkbox" checked={addInsurance} onChange={(e) => setAddInsurance(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#8b5cf6' }} />
                Add Transit Insurance (Secure Goods) (+₹499)
              </label>
            </div>
          </div>

          {/* Results Summary Box */}
          <div style={{
            background: 'var(--gray-50)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '24px',
            border: '1px solid var(--gray-200)',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--gray-500)' }}>{t('relocation.estLoadWeight')}:</span>
              <span style={{ fontWeight: 800, color: 'var(--navy-800)' }}>{totalWeight} kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--gray-500)' }}>Transit Distance ({distanceKm} km @ ₹{perKmRate}/km):</span>
              <span style={{ fontWeight: 800, color: '#8b5cf6' }}>₹{distanceCharge.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--gray-500)' }}>{t('relocation.recFleet')}:</span>
              <span style={{ fontWeight: 800, color: '#8b5cf6' }}>{estimatedTrucks}</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('relocationExt.estPrice')}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                  ₹{dynamicPrice.toLocaleString()}
                </span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent(transitType === 'full' ? 'Full Home Shifting service' : 'Single Heavy Item Transport')}&serviceId=${transitType === 'full' ? 'full-home-shifting' : 'single-item-transport'}&category=relocation&price=${dynamicPrice}&distance=${distanceKm}`}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', background: '#8b5cf6', borderColor: '#8b5cf6' }}
              >
                {t('relocation.bookShifting')}
              </Link>
            </div>
          </div>
        </div>

        {/* Secure Storage Vault Reservation */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineArchiveBox style={{ color: '#8b5cf6' }} /> {t('relocation.storageVaults')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', lineHeight: 1.4, marginBottom: '20px' }}>
              {t('relocation.storageDesc')}
            </p>

            {/* Space Slider */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--navy-800)', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>{t('relocation.vaultAreaSize')}:</span>
                <span style={{ color: '#8b5cf6' }}>{vaultSpace} {t('relocation.sqFt')}</span>
              </label>
              <input
                type="range"
                min="20"
                max="300"
                step="10"
                value={vaultSpace}
                onChange={(e) => setVaultSpace(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '4px' }}>
                <span>{t('relocation.vaultSmall')}</span>
                <span>{t('relocation.vaultLarge')}</span>
              </div>
            </div>

            {/* Trust List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineShieldCheck style={{ color: '#3b7dc1' }} /> {t('relocation.insuredCover')}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineSparkles style={{ color: '#3b7dc1' }} /> {t('relocation.treatedVault')}
              </span>
            </div>
          </div>

          <div style={{
            background: 'rgba(139, 92, 246, 0.03)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('relocation.monthlyRent')}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{(vaultSpace * vaultPricePerSqFt).toLocaleString()}{t('pricing.month')}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Digital Secure Storage Vault')}&serviceId=storage-vault&category=relocation&price=${vaultSpace * vaultPricePerSqFt}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              {t('relocation.reserveVault')}
            </Link>
          </div>
        </div>
      </div>

      {/* Specialized Moving Services */}
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '20px' }}>{t('relocationExt.specializedAddons')}</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Vehicle Relocation */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>{t('relocationExt.vehicleRelocation')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{t('relocationExt.vehicleRelocationDesc')}</p>
          <Link to="/customer/vehicle-demo" className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: '#1d4ed8', borderColor: '#1d4ed8', textAlign: 'center', borderRadius: '10px', textDecoration: 'none', background: '#dbeafe' }}>
            Book VIP Transport
          </Link>
        </div>

        {/* Pet Relocation */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>{t('relocationExt.petRelocation')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{t('relocationExt.petRelocationDesc')}</p>
          <Link to="/customer/pet-demo" className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: '#c026d3', borderColor: '#c026d3', textAlign: 'center', borderRadius: '10px', textDecoration: 'none', background: '#fae8ff' }}>
            Book VIP Travel
          </Link>
        </div>

        {/* Junk Removal */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '12px', color: '#16a34a' }}>
            <HiOutlineArrowPath />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>{t('relocationExt.scrapRemoval')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{t('relocationExt.scrapRemovalDesc')}</p>
          <Link to={`/customer/book?service=${encodeURIComponent('Junk Removal Evaluation')}&category=relocation&price=0`} className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: 'var(--navy-700)', borderColor: 'var(--gray-300)', textAlign: 'center', borderRadius: '10px', textDecoration: 'none' }}>
            Schedule Pickup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RelocationHub;
