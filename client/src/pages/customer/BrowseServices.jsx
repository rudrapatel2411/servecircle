import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineCpuChip, HiOutlineShieldCheck, HiOutlineVideoCamera,
  HiOutlineUserGroup, HiOutlineArrowRight, HiOutlineSparkles,
  HiOutlineWrench, HiOutlineTruck, HiOutlineAcademicCap,
  HiOutlineBuildingOffice, HiOutlineHeart, HiOutlineClock
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const categoriesList = [
  { id: 'home-repairs', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineWrench />, labelKey: 'categories.homeRepairs', descKey: 'categories.homeRepairsDesc', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
  { id: 'vehicle-services', image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineTruck />, labelKey: 'categories.vehicleServices', descKey: 'categories.vehicleServicesDesc', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
  { id: 'cleaning', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.cleaning', descKey: 'categories.cleaningDesc', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' },
  { id: 'home-it', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineCpuChip />, labelKey: 'categories.homeIT', descKey: 'categories.homeITDesc', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
  { id: 'care-family', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineHeart />, labelKey: 'categories.careFamily', descKey: 'categories.careFamilyDesc', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.08)' },
  { id: 'utility-daily', image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineClock />, labelKey: 'categories.utilityDaily', descKey: 'categories.utilityDailyDesc', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
  { id: 'learning-support', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineAcademicCap />, labelKey: 'categories.learningSupport', descKey: 'categories.learningSupportDesc', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.08)' },
  { id: 'property-services', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineBuildingOffice />, labelKey: 'categories.propertyServices', descKey: 'categories.propertyServicesDesc', color: '#4b5563', bg: 'rgba(75, 85, 99, 0.08)' },
  { id: 'festive-seasonal', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.festiveSeasonal', descKey: 'categories.festiveSeasonalDesc', color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)' },
  { id: 'furniture-decor', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineWrench />, labelKey: 'categories.furnitureDecor', descKey: 'categories.furnitureDecorDesc', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.08)' },
  { id: 'garden-outdoor', image: 'https://images.unsplash.com/photo-1416879598555-33f6a27e1b76?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.gardenOutdoor', descKey: 'categories.gardenOutdoorDesc', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
  { id: 'relocation', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineTruck />, labelKey: 'categories.relocation', descKey: 'categories.relocationDesc', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)', isBespoke: true, bespokePath: '/customer/relocation' },
  { id: 'health-wellness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineHeart />, labelKey: 'categories.healthWellness', descKey: 'categories.healthWellnessDesc', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.08)', isBespoke: true, bespokePath: '/customer/health-wellness' },
  { id: 'kids-elderly', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineUserGroup />, labelKey: 'categories.kidsElderly', descKey: 'categories.kidsElderlyDesc', color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)' },
  { id: 'pet-services', image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.petServices', descKey: 'categories.petServicesDesc', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', isBespoke: true, bespokePath: '/customer/pet-services' },
  { id: 'food-kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineBuildingOffice />, labelKey: 'categories.foodKitchen', descKey: 'categories.foodKitchenDesc', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', isBespoke: true, bespokePath: '/customer/food-kitchen' },
  { id: 'travel-commute', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineTruck />, labelKey: 'categories.travelCommute', descKey: 'categories.travelCommuteDesc', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)', isBespoke: true, bespokePath: '/customer/travel-commute' },
  { id: 'society-management', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineUserGroup />, labelKey: 'categories.societyManagement', descKey: 'categories.societyManagementDesc', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.08)', isBespoke: true, bespokePath: '/customer/society-management' }
];

const bundlesData = [
  {
    id: 'new-home-setup',
    title: 'New Home Setup Combo 🏡',
    description: 'Wi-Fi mesh setup, smart doorbell install, and deep cleaning for move-in readiness.',
    price: 3299,
    originalPrice: 3999,
    savings: '17% OFF',
    servicesList: ['Smart Wi-Fi Setup', 'Smart Doorbell Setup', 'Full Home Deep Clean'],
    badge: 'Popular'
  },
  {
    id: 'monsoon-prep',
    title: 'Monsoon Waterproofing Prep 🌧️',
    description: 'Balcony/roof elastomeric compound waterproofing, drainage check, and monsoon AC tuning.',
    price: 2999,
    originalPrice: 3499,
    savings: '14% OFF',
    servicesList: ['Roof Waterproofing', 'Drainage Fix', 'AC Service & Tune-up'],
    badge: 'Seasonal'
  },
  {
    id: 'senior-care-pack',
    title: 'Senior Citizen Support Combo 👵🏼',
    description: 'Weekly elder care attendant visits + interactive senior smartphone/computer support coaching.',
    price: 1199,
    originalPrice: 1398,
    savings: '₹199 Off',
    servicesList: ['Senior Citizen Attendant', 'Smartphone Coaching'],
    badge: 'Care Pack'
  }
];

const BrowseServices = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categoriesList.filter((cat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t(cat.labelKey).toLowerCase().includes(q) ||
      t(cat.descKey).toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* ===== HERO STRATEGIC DISPLAY ===== */}
      <div className="page-header" style={{
        background: 'var(--gradient-primary, linear-gradient(135deg, #0f172a 0%, #1e293b 100%))',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="page-title" style={{ color: 'white', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Choose Your Funnel & Services 🚀
          </h1>
          <p className="page-subtitle" style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '6px', maxWidth: '600px' }}>
            Access top-tier verified professionals, emergency instant dispatches, seasonal maintenance bundles, and our unique AI smart diagnostic tools.
          </p>
        </div>
        <div style={{
          position: 'absolute', right: '-50px', bottom: '-50px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.08)', filter: 'blur(30px)'
        }} />
      </div>

      {/* ===== SEARCH BANNER ===== */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <span style={{ fontSize: '1.2rem', color: 'var(--gray-400)' }}>🔍</span>
        <input
          type="text"
          placeholder="Search categories (e.g. IT, Clean, Repair, Care)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            fontSize: '0.95rem',
            outline: 'none',
            color: 'var(--navy-800)'
          }}
        />
      </div>

      {/* ===== UNIQUE PREMIUM DIFFERENTIATION WIDGETS ===== */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🌟</span> Custom Diagnostic & Smart Features
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px'
        }}>
          {/* AI Scan */}
          <Link to="/customer/ai-diagnosis" className="card hover-lift" style={{ padding: '20px', border: '1px solid var(--primary-100)', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(16, 185, 129, 0.02)' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary-600)', fontSize: '1.4rem' }}>
              <HiOutlineCpuChip />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                AI Smart Diagnosis <span style={{ fontSize: '0.7rem', color: 'white', background: 'var(--primary-500)', padding: '2px 6px', borderRadius: '4px' }}>Scanner</span>
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>Upload a photo or video to instantly scan, identify faults, and calculate prices.</p>
            </div>
          </Link>

          {/* HomeFixr */}
          <Link to="/customer/my-home" className="card hover-lift" style={{ padding: '20px', border: '1px solid var(--primary-100)', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(16, 185, 129, 0.02)' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary-600)', fontSize: '1.4rem' }}>
              <HiOutlineShieldCheck />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)' }}>My HomeFixr Cockpit</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>Track your Home Health score, maintenance timelines, and register warranties.</p>
            </div>
          </Link>

          {/* Video Consult */}
          <Link to="/customer/video-consultation" className="card hover-lift" style={{ padding: '20px', border: '1px solid var(--primary-100)', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(16, 185, 129, 0.02)' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary-600)', fontSize: '1.4rem' }}>
              <HiOutlineVideoCamera />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)' }}>Video Pre-Inspection</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>Book ₹149 virtual video calls with expert inspectors to pre-diagnose major work.</p>
            </div>
          </Link>

          {/* Group Booking */}
          <Link to="/customer/group-booking" className="card hover-lift" style={{ padding: '20px', border: '1px solid var(--primary-100)', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(16, 185, 129, 0.02)' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary-600)', fontSize: '1.4rem' }}>
              <HiOutlineUserGroup />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)' }}>Society Group Savings</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>Coordinate with neighborhood societies to book together and save up to 20%.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ===== CATEGORIES DIRECTORY ===== */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '18px' }}>
          📂 Category Directories
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '20px'
        }}>
          {filteredCategories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.isBespoke ? cat.bespokePath : `/customer/services/${cat.id}`}
              className="card hover-lift"
              style={{
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: `linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.2) 100%), url(${cat.image}) center/cover no-repeat`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '220px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.35rem',
                  marginBottom: '16px'
                }}>
                  {cat.icon}
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 850, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {t(cat.labelKey)}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: '6px', lineHeight: 1.4, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {t(cat.descKey)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'white', fontWeight: 700, marginTop: '12px' }}>
                Open Directory <HiOutlineArrowRight />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== HIGH IMPACT SERVICE BUNDLES ===== */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800 }}>
            📦 Super Saver Combo Bundles
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 700 }}>Flat discounts applied</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '20px'
        }}>
          {bundlesData.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{
                padding: '24px',
                border: '1px solid var(--gray-200)',
                background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {b.badge}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--danger-600)', background: 'var(--danger-50)', padding: '3px 8px', borderRadius: '4px' }}>
                    {b.savings}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: 'var(--navy-800)' }}>
                  {b.title}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '6px', lineHeight: 1.4 }}>
                  {b.description}
                </p>

                {/* Bundle Inclusions */}
                <div style={{ marginTop: '16px', borderTop: '1px dashed var(--gray-200)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Combo Includes:</span>
                  <ul style={{ listStyle: 'none', margin: '4px 0 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {b.servicesList.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.75rem', color: 'var(--navy-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--primary-500)' }}>✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid var(--gray-100)', paddingTop: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--gray-400)' }}>₹{b.originalPrice}</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>₹{b.price}</div>
                </div>
                <Link
                  to={`/customer/book?service=${encodeURIComponent(b.title)}&price=${b.price}`}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '8px 16px' }}
                >
                  Book Combo Bundle
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default BrowseServices;
