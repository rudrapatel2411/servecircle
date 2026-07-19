import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowLeft, HiOutlineArchiveBox, HiOutlineCalculator, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi2';
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

  // New Shifting details
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
  const weightCharge = totalWeight * 5; // e.g. ₹5 per kg
  const packingCharge = packingType === 'premium' ? (transitType === 'full' ? 1500 : 300) : 0;
  const liftCharge = !hasLift ? 800 : 0;
  const insuranceCharge = addInsurance ? 499 : 0;
  
  let dynamicPrice = baseRate + weightCharge + packingCharge + liftCharge + insuranceCharge;
  if (pickupCity && dropCity && pickupCity.toLowerCase().trim() !== dropCity.toLowerCase().trim()) {
      dynamicPrice += 5000; // Intercity flat charge
  }

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
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px', color: 'white' }}>✨ {t('relocationExt.expPackers')}</h3>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('relocationExt.pickupCity')}</label>
              <input type="text" className="input-field" placeholder="e.g. Mumbai" value={pickupCity} onChange={(e) => setPickupCity(e.target.value)} style={{ padding: '10px', fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('relocationExt.dropCity')}</label>
              <input type="text" className="input-field" placeholder="e.g. Pune" value={dropCity} onChange={(e) => setDropCity(e.target.value)} style={{ padding: '10px', fontSize: '0.85rem' }} />
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
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--navy-800)', display: 'block', marginBottom: '12px' }}>{t('relocationExt.autoFill')}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3].map(bhk => (
                  <button
                    key={bhk}
                    onClick={() => handleBhkSelect(bhk)}
                    style={{ flex: 1, padding: '8px', background: 'white', border: '1px solid var(--gray-300)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-700)', cursor: 'pointer' }}
                  >
                    {bhk} BHK
                  </button>
                ))}
                <button
                  onClick={() => setInventory({ sofa: 0, doubleBed: 0, refrigerator: 0, wardrobe: 0, box: 0 })}
                  style={{ padding: '8px 12px', background: 'white', border: '1px dashed var(--gray-400)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 650, color: 'var(--gray-500)', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'sofa', name: 'Luxury Sofa / Couch 🛋️' },
              { id: 'doubleBed', name: 'Double Bed Set 🛏️' },
              { id: 'refrigerator', name: 'Smart Refrigerator ❄️' },
              { id: 'wardrobe', name: 'Modular Wardrobe 🚪' },
              { id: 'box', name: 'Heavy Carton Box 📦' }
            ].map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--navy-700)', fontWeight: 650 }}>{t('relocation.' + item.id)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => handleInventoryChange(item.id, -1)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--gray-300)', background: 'white', fontWeight: 800, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 900 }}>{inventory[item.id]}</span>
                  <button
                    onClick={() => handleInventoryChange(item.id, 1)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--gray-300)', background: 'white', fontWeight: 800, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add-ons and Adjustments */}
          <div style={{ background: 'var(--gray-5)', padding: '16px', borderRadius: '12px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--navy-800)' }}>Elevator / Lift available? 🏢</span>
               <select value={hasLift ? 'yes' : 'no'} onChange={(e) => setHasLift(e.target.value === 'yes')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8rem', outline: 'none' }}>
                 <option value="yes">{t('relocationExt.yesLift')}</option>
                 <option value="no">No, Stairs Only (+₹800)</option>
               </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--navy-800)' }}>{t('relocationExt.packingService')}</span>
               <select value={packingType} onChange={(e) => setPackingType(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.8rem', outline: 'none' }}>
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
                to={`/customer/book?service=${encodeURIComponent(transitType === 'full' ? 'Full Home Shifting service' : 'Single Heavy Item Transport')}&price=${dynamicPrice}`}
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
              to={`/customer/book?service=${encodeURIComponent('Digital Secure Storage Vault')}&price=${vaultSpace * vaultPricePerSqFt}`}
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
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚗🏍️</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>{t('relocationExt.vehicleRelocation')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{t('relocationExt.vehicleRelocationDesc')}</p>
          <Link to="/customer/vehicle-demo" className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: '#1d4ed8', borderColor: '#1d4ed8', textAlign: 'center', borderRadius: '10px', textDecoration: 'none', background: '#dbeafe' }}>
            Book VIP Transport
          </Link>
        </div>

        {/* Pet Relocation */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐶✈️</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>{t('relocationExt.petRelocation')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{t('relocationExt.petRelocationDesc')}</p>
          <Link to="/customer/pet-demo" className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: '#c026d3', borderColor: '#c026d3', textAlign: 'center', borderRadius: '10px', textDecoration: 'none', background: '#fae8ff' }}>
            Book VIP Travel
          </Link>
        </div>

        {/* Junk Removal */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>♻️🛋️</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>{t('relocationExt.scrapRemoval')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{t('relocationExt.scrapRemovalDesc')}</p>
          <Link to="/customer/book?service=Junk Removal Evaluation&price=0" className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: 'var(--navy-700)', borderColor: 'var(--gray-300)', textAlign: 'center', borderRadius: '10px', textDecoration: 'none' }}>
            Schedule Pickup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RelocationHub;
