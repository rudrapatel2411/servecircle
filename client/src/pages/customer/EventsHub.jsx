import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineSparkles, HiOutlineStar, HiOutlineUserGroup,
  HiOutlineCalculator, HiOutlineCheckCircle, HiOutlineCurrencyRupee
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const themesData = [
  {
    id: 'birthday',
    name: 'Theme Birthday Bash 🎉',
    description: 'Balloons, cartoon backdrops, neon signboards, cake table layouts.',
    baseDecorPrice: 2999,
    icon: '🎈'
  },
  {
    id: 'grihapravesh',
    name: 'Traditional Griha Pravesh 🌸',
    description: 'Traditional fresh marigold garlands, entrance rangoli, puja mandap decor.',
    baseDecorPrice: 3999,
    icon: '🕯️'
  },
  {
    id: 'seasonal',
    name: 'Festive Lights & Diwali 🪔',
    description: 'High-altitude fairy light cascading, door latkan hangings, and brass pots set.',
    baseDecorPrice: 3000,
    icon: '✨'
  },
  {
    id: 'corporate',
    name: 'Corporate Farewell / Party 💼',
    description: 'Professional pull-up banners, balloon bouquets, awards podium setups.',
    baseDecorPrice: 4999,
    icon: '👔'
  }
];

const EventsHub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedTheme, setSelectedTheme] = useState(themesData[0]);
  const [guestsCount, setGuestsCount] = useState(25);
  
  // Custom inclusions check states
  const [includeCatering, setIncludeCatering] = useState(true);
  const [cateringType, setCateringType] = useState('veg'); // 'veg' = 250, 'nonveg' = 450
  const [includeDJ, setIncludeDJ] = useState(false);
  const [includePhotography, setIncludePhotography] = useState(true);
  const [includeCleanup, setIncludeCleanup] = useState(true);

  // Calculate pricing dynamics
  const decorPrice = selectedTheme.baseDecorPrice;
  const cateringCost = includeCatering ? guestsCount * (cateringType === 'veg' ? 250 : 450) : 0;
  const djCost = includeDJ ? 4000 : 0;
  const photoCost = includePhotography ? 3000 : 0;
  const cleanCost = includeCleanup ? 999 : 0;

  const totalEstimate = decorPrice + cateringCost + djCost + photoCost + cleanCost;

  const handleBookEvent = (e) => {
    e.preventDefault();
    navigate(`/customer/book?service=${encodeURIComponent(selectedTheme.name)}&price=${totalEstimate}&guests=${guestsCount}&catering=${includeCatering ? cateringType : 'none'}`);
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* Dynamic Header */}
      <div className="page-header animate-fade-in-up" style={{
        background: 'var(--gradient-primary, linear-gradient(135deg, #1e1b4b 0%, #311042 100%))',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        border: '1.5px solid var(--primary-300)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="page-title" style={{ color: 'white', fontSize: '2.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineSparkles style={{ color: '#f59e0b' }} /> ServeCircle Events Hub
          </h1>
          <p style={{ color: '#d8b4fe', fontSize: '0.95rem', marginTop: '6px', maxWidth: '600px' }}>
            Coordinate catering, customized LED/balloon styling decors, live sound setups, and pro event photographers in a single checkout.
          </p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.25fr 0.95fr', gap: '28px' }}>
        
        {/* LEFT PANEL: Theme Selectors & Configuration Checklists */}
        <div>
          {/* Theme Selector */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'white', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px' }}>
              Step 1: Choose Occasion Theme
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {themesData.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTheme(t)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedTheme.id === t.id ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                    background: selectedTheme.id === t.id ? 'var(--primary-50)' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.6rem' }}>{t.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>{t.name}</h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '2px', lineHeight: 1.3 }}>{t.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Checklists */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'white' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '18px' }}>
              Step 2: Customize Vendor Checklist
            </h3>

            {/* Guests Count slider */}
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>👥 Expected Guests Count</span>
                <span style={{ color: 'var(--primary-600)', fontWeight: 850 }}>{guestsCount} Guests</span>
              </label>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={guestsCount}
                onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-500)', marginTop: '8px' }}
              />
            </div>

            {/* Checklist options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Catering */}
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={includeCatering} onChange={(e) => setIncludeCatering(e.target.checked)} />
                    Include Catering Food Services
                  </label>
                  <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>Professional chef catering menu per-plate model.</p>
                  
                  {includeCatering && (
                    <div style={{ display: 'flex', gap: '10px', marginLeft: '20px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setCateringType('veg')}
                        className={`btn btn-sm ${cateringType === 'veg' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                      >
                        Pure Veg (₹250/plate)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCateringType('nonveg')}
                        className={`btn btn-sm ${cateringType === 'nonveg' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                      >
                        Veg + Non-Veg (₹450/plate)
                      </button>
                    </div>
                  )}
                </div>
                {includeCatering && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>+ ₹{cateringCost}</span>
                )}
              </div>

              {/* DJ */}
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={includeDJ} onChange={(e) => setIncludeDJ(e.target.checked)} />
                    Live sound & Professional DJ Setup
                  </label>
                  <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>High-density JBL sub-woofers, DJ console, and dynamic stage light controllers.</p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                  {includeDJ ? `+ ₹${djCost}` : '—'}
                </span>
              </div>

              {/* Photography */}
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={includePhotography} onChange={(e) => setIncludePhotography(e.target.checked)} />
                    High-res Photographer & Videographer
                  </label>
                  <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>Deliverable: 80+ edited high-resolution color-graded photos + full-frame HD highlights reel.</p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                  {includePhotography ? `+ ₹${photoCost}` : '—'}
                </span>
              </div>

              {/* Post-event cleaning */}
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={includeCleanup} onChange={(e) => setIncludeCleanup(e.target.checked)} />
                    Post-Event Site Clean-up & Garbage Disposal
                  </label>
                  <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>Vetted crew dispatches right at event completion to restore clean spaces.</p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                  {includeCleanup ? `+ ₹${cleanCost}` : '—'}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Budget calculations & submit */}
        <div>
          <div className="card" style={{ padding: '28px', border: '1.5px solid var(--primary-200)', background: 'white', position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 850, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlineCalculator style={{ color: 'var(--primary-600)' }} /> Event Cost Summary
            </h3>
            
            {/* Breakdowns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>Occasion Theme Decor ({selectedTheme.icon})</span>
                <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{decorPrice}</span>
              </div>
              
              {includeCatering && (
                <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Catering ({guestsCount} Plates - {cateringType === 'veg' ? 'Veg' : 'Non-Veg'})</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{cateringCost}</span>
                </div>
              )}

              {includeDJ && (
                <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>DJ Sound System Console</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{djCost}</span>
                </div>
              )}

              {includePhotography && (
                <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Pro DSLR Photography Team</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{photoCost}</span>
                </div>
              )}

              {includeCleanup && (
                <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Post-Event Spot Cleanup Crew</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{cleanCost}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 800 }}>Estimated Package Total</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy-800)', display: 'flex', alignItems: 'center' }}>
                  <HiOutlineCurrencyRupee style={{ fontSize: '1.6rem' }} /> {totalEstimate}
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '4px' }}>
                Society: up to 20% off
              </span>
            </div>

            <form onSubmit={handleBookEvent}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <HiOutlineCheckCircle /> Book Complete Event Package
              </button>
            </form>

            <div style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--gray-400)', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
              <span>🔒 100% Secure Transaction</span>
              <span>•</span>
              <span>💰 Free post-event revisions</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default EventsHub;
