import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineTruck, HiOutlineArchiveBox, HiOutlineCalculator, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const RelocationHub = () => {
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

  const handleInventoryChange = (item, diff) => {
    setInventory(prev => ({
      ...prev,
      [item]: Math.max(0, prev[item] + diff)
    }));
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
  const estimatedTrucks = totalWeight > 400 ? 'Closed Container 17ft' : totalWeight > 0 ? 'Tata Ace Mini' : 'Select items';

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* Back Button */}
      <Link to="/customer/services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to Directory
      </Link>

      {/* Header */}
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        borderLeft: '5px solid #8b5cf6',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem' }}>📦</span>
          <div>
            <h1 className="page-title" style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>
              ServeCircle Relocation & Vaults 🚚
            </h1>
            <p className="page-subtitle" style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
              Full home shifting, single-item logistics, and secure climate-controlled micro-warehousing.
            </p>
          </div>
        </div>
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
            <HiOutlineCalculator style={{ color: '#8b5cf6' }} /> Interactive Volume Estimator
          </h3>

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
              Full House Shifting
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
              Single-Item Logistics
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'sofa', name: 'Luxury Sofa / Couch 🛋️' },
              { id: 'doubleBed', name: 'Double Bed Set 🛏️' },
              { id: 'refrigerator', name: 'Smart Refrigerator ❄️' },
              { id: 'wardrobe', name: 'Modular Wardrobe 🚪' },
              { id: 'box', name: 'Heavy Carton Box 📦' }
            ].map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--navy-700)', fontWeight: 650 }}>{item.name}</span>
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
              <span style={{ color: 'var(--gray-500)' }}>Estimated Load Weight:</span>
              <span style={{ fontWeight: 800, color: 'var(--navy-800)' }}>{totalWeight} kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--gray-500)' }}>Recommended Fleet:</span>
              <span style={{ fontWeight: 800, color: '#8b5cf6' }}>{estimatedTrucks}</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Base Price (Starts at)</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                  ₹{transitType === 'full' ? '4,999' : '799'}
                </span>
              </div>
              <Link
                to={`/customer/book?service=${encodeURIComponent(transitType === 'full' ? 'Full Home Shifting service' : 'Single Heavy Item Transport')}&price=${transitType === 'full' ? 4999 : 799}`}
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 16px', background: '#8b5cf6', borderColor: '#8b5cf6' }}
              >
                Book Shifting
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
              <HiOutlineArchiveBox style={{ color: '#8b5cf6' }} /> Virtual Storage Vaults 🔐
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', lineHeight: 1.4, marginBottom: '20px' }}>
              Keep your heavy goods safely stored in our moisture-sealed, climate-controlled warehouses with 24/7 biometric guard patrols and instant digital inventory logging.
            </p>

            {/* Space Slider */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--navy-800)', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Vault Area Size:</span>
                <span style={{ color: '#8b5cf6' }}>{vaultSpace} Sq. Ft.</span>
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
                <span>20 Sq. Ft. (Bags/Boxes)</span>
                <span>300 Sq. Ft. (3 BHK Furniture)</span>
              </div>
            </div>

            {/* Trust List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineShieldCheck style={{ color: '#10b981' }} /> Fire & Flood Insured Cover
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineSparkles style={{ color: '#10b981' }} /> Dehumidifier and pest control treated
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
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Monthly Rent Fee</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{(vaultSpace * vaultPricePerSqFt).toLocaleString()}/mo
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Digital Secure Storage Vault')}&price=${vaultSpace * vaultPricePerSqFt}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#8b5cf6', borderColor: '#8b5cf6' }}
            >
              Reserve Vault
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelocationHub;
