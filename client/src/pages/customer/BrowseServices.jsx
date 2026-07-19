import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineCpuChip, HiOutlineShieldCheck, HiOutlineVideoCamera,
  HiOutlineUserGroup, HiOutlineArrowRight, HiOutlineSparkles,
  HiOutlineWrench, HiOutlineTruck, HiOutlineAcademicCap,
  HiOutlineBuildingOffice, HiOutlineHeart, HiOutlineClock,
  HiOutlineMicrophone
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const categoriesList = [
  { id: 'home-repairs', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineWrench />, labelKey: 'categories.homeRepairs', descKey: 'categories.homeRepairsDesc', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
  { id: 'vehicle-services', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineTruck />, labelKey: 'categories.vehicleServices', descKey: 'categories.vehicleServicesDesc', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
  { id: 'cleaning', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.cleaning', descKey: 'categories.cleaningDesc', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' },
  { id: 'home-it', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineCpuChip />, labelKey: 'categories.homeIT', descKey: 'categories.homeITDesc', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
  { id: 'care-family', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineHeart />, labelKey: 'categories.careFamily', descKey: 'categories.careFamilyDesc', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.08)' },
  { id: 'utility-daily', image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineClock />, labelKey: 'categories.utilityDaily', descKey: 'categories.utilityDailyDesc', color: '#3b7dc1', bg: 'rgba(59, 125, 193, 0.08)' },
  { id: 'learning-support', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineAcademicCap />, labelKey: 'categories.learningSupport', descKey: 'categories.learningSupportDesc', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.08)' },
  { id: 'property-services', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineBuildingOffice />, labelKey: 'categories.propertyServices', descKey: 'categories.propertyServicesDesc', color: '#4b5563', bg: 'rgba(75, 85, 99, 0.08)' },
  { id: 'festive-seasonal', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.festiveSeasonal', descKey: 'categories.festiveSeasonalDesc', color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)' },
  { id: 'furniture-decor', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineWrench />, labelKey: 'categories.furnitureDecor', descKey: 'categories.furnitureDecorDesc', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.08)' },
  { id: 'garden-outdoor', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.gardenOutdoor', descKey: 'categories.gardenOutdoorDesc', color: '#3b7dc1', bg: 'rgba(59, 125, 193, 0.08)' },
  { id: 'relocation', image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineTruck />, labelKey: 'categories.relocation', descKey: 'categories.relocationDesc', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)', isBespoke: true, bespokePath: '/customer/relocation' },
  { id: 'health-wellness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineHeart />, labelKey: 'categories.healthWellness', descKey: 'categories.healthWellnessDesc', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.08)', isBespoke: true, bespokePath: '/customer/health-wellness' },
  { id: 'kids-elderly', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineUserGroup />, labelKey: 'categories.kidsElderly', descKey: 'categories.kidsElderlyDesc', color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)' },
  { id: 'pet-services', image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.petServices', descKey: 'categories.petServicesDesc', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', isBespoke: true, bespokePath: '/customer/pet-services' },
  { id: 'food-kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineBuildingOffice />, labelKey: 'categories.foodKitchen', descKey: 'categories.foodKitchenDesc', color: '#3b7dc1', bg: 'rgba(59, 125, 193, 0.08)', isBespoke: true, bespokePath: '/customer/food-kitchen' },
  { id: 'travel-commute', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineTruck />, labelKey: 'categories.travelCommute', descKey: 'categories.travelCommuteDesc', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)', isBespoke: true, bespokePath: '/customer/travel-commute' },
  { id: 'society-management', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineUserGroup />, labelKey: 'categories.societyManagement', descKey: 'categories.societyManagementDesc', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.08)', isBespoke: true, bespokePath: '/customer/society-management' }
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
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const recognitionRef = useRef(null);

  const handleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('browseServices.voiceSearchUnsupported', "Voice search is not supported in this browser. Please try Google Chrome!"));
      return;
    }

    const recognition = new SpeechRecognition();
    // Detect active lang and configure recognition language dynamically (Hinglish/Indian English support)
    const currentLang = i18n.language;
    recognition.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'gu' ? 'gu-IN' : 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error', e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setSearchQuery(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Sort matched categories to the top, set isMatch tags
  const getSortedCategories = () => {
    if (!searchQuery) {
      return categoriesList.map(cat => ({ ...cat, isMatch: false }));
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return categoriesList.map(cat => ({ ...cat, isMatch: false }));
    }

    const matching = [];
    const nonMatching = [];

    categoriesList.forEach((cat) => {
      const label = t(cat.labelKey).toLowerCase();
      const desc = t(cat.descKey).toLowerCase();
      if (label.includes(q) || desc.includes(q)) {
        matching.push({ ...cat, isMatch: true });
      } else {
        nonMatching.push({ ...cat, isMatch: false });
      }
    });

    return [...matching, ...nonMatching];
  };

  const sortedCategories = getSortedCategories();
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      


      {/* ===== SEARCH BANNER ===== */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--gray-400)' }}>🤖</span>
          <input
            type="text"
            placeholder={t('browseServices.conciergePlaceholder', "Tell our AI Concierge what you need (e.g. My AC is not cooling)...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            style={{
              flex: 1,
              border: 'none',
              fontSize: '0.95rem',
              outline: 'none',
              color: 'var(--navy-800)'
            }}
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            style={{
              background: isListening ? '#ef4444' : 'var(--gray-100)',
              color: isListening ? 'white' : 'var(--navy-600)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'all 0.2s',
              animation: isListening ? 'pulse 1s infinite' : 'none'
            }}
            title={t('browseServices.speakToSearchTitle', 'Search by speaking')}
          >
            <HiOutlineMicrophone />
          </button>
        </div>

        {/* Smart Concierge Suggestions Pane */}
        {isSearchFocused && (
          <div className="animate-fade-in-up" style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'white',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-100)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--navy-900)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: '50%', fontSize: '0.8rem' }}>✨</span>
                AI Concierge Suggestions
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Auto-Routing</span>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '12px', fontStyle: 'italic' }}>Try asking for...</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[
                { icon: '❄️', label: 'My AC is making a weird noise' },
                { icon: '💧', label: 'Bathroom tap is leaking' },
                { icon: '🧹', label: 'I need a deep clean before the festival' },
                { icon: '🔌', label: 'Power went out in one room' },
                { icon: '💅', label: 'Book a relaxing spa at home' }
              ].map((tag, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag.label);
                    setIsSearchFocused(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'var(--primary-50)', color: 'var(--navy-800)',
                    border: '1px solid var(--primary-100)', borderRadius: '20px',
                    padding: '6px 12px', fontSize: '0.9rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-100)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary-50)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <span>{tag.icon}</span> {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== UNIQUE PREMIUM DIFFERENTIATION WIDGETS ===== */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🌟</span> {t('browseServices.smartFeatures', 'Custom Diagnostic & Smart Features')}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px'
        }}>
          {/* AI Scan */}
          <Link to="/customer/ai-diagnosis" className="card hover-lift" style={{ padding: '20px', border: '1px solid var(--primary-100)', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(59, 125, 193, 0.02)' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary-600)', fontSize: '1.4rem' }}>
              <HiOutlineCpuChip />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {t('customer.aiDiagnosis', 'AI Smart Diagnosis')} <span style={{ fontSize: '0.7rem', color: 'white', background: 'var(--primary-500)', padding: '2px 6px', borderRadius: '4px' }}>Scanner</span>
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>{t('browseServices.aiDiagnosisDesc', 'Upload a photo or video to instantly scan, identify faults, and calculate prices.')}</p>
            </div>
          </Link>

          {/* HomeFixr */}
          <Link to="/customer/my-home" className="card hover-lift" style={{ padding: '20px', border: '1px solid var(--primary-100)', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(59, 125, 193, 0.02)' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary-600)', fontSize: '1.4rem' }}>
              <HiOutlineShieldCheck />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)' }}>{t('customer.myHome', 'My HomeFixr Cockpit')}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>{t('browseServices.myHomeDesc', 'Track your Home Health score, maintenance timelines, and register warranties.')}</p>
            </div>
          </Link>

          {/* Video Consult */}
          <Link to="/customer/video-consultation" className="card hover-lift" style={{ padding: '20px', border: '1px solid var(--primary-100)', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(59, 125, 193, 0.02)' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary-600)', fontSize: '1.4rem' }}>
              <HiOutlineVideoCamera />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)' }}>{t('customer.videoConsultation', 'Video Pre-Inspection')}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>{t('browseServices.videoConsultationDesc', 'Book ₹149 virtual video calls with expert inspectors to pre-diagnose major work.')}</p>
            </div>
          </Link>

          {/* Group Booking */}
          <Link to="/customer/group-booking" className="card hover-lift" style={{ padding: '20px', border: '1px solid var(--primary-100)', display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'rgba(59, 125, 193, 0.02)' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--primary-600)', fontSize: '1.4rem' }}>
              <HiOutlineUserGroup />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)' }}>{t('customer.groupBooking', 'Society Group Savings')}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px' }}>{t('browseServices.groupBookingDesc', 'Coordinate with neighborhood societies to book together and save up to 20%.')}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ===== CATEGORIES DIRECTORY ===== */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '18px' }}>
          📂 {t('browseServices.categoryDirectories', 'Category Directories')}
        </h3>
        <div className="category-directories-grid">
          {sortedCategories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.isBespoke ? cat.bespokePath : `/customer/services/${cat.id}`}
              className="category-directory-card"
              style={{
                opacity: hasQuery ? (cat.isMatch ? 1 : 0.35) : 1,
                transform: hasQuery && cat.isMatch ? 'scale(1.025)' : 'none',
                borderColor: hasQuery && cat.isMatch ? cat.color : 'var(--gray-200)',
                boxShadow: hasQuery && cat.isMatch ? `0 12px 24px -6px ${cat.color}33` : 'var(--shadow-sm)',
                transition: 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
                borderWidth: hasQuery && cat.isMatch ? '2px' : '1px'
              }}
            >
              <div className="category-directory-img-wrapper">
                <img 
                  className="category-directory-img" 
                  src={cat.image} 
                  alt={t(cat.labelKey)} 
                  loading="lazy"
                />
                <div 
                  className="category-directory-icon-badge"
                  style={{ 
                    background: cat.bg || 'rgba(255, 255, 255, 0.9)', 
                    color: cat.color || 'var(--primary-600)' 
                  }}
                >
                  {cat.icon}
                </div>
              </div>
              <div className="category-directory-content">
                <div>
                  <h4 className="category-directory-title">
                    {t(cat.labelKey)}
                  </h4>
                  <p className="category-directory-desc">
                    {t(cat.descKey)}
                  </p>
                </div>
                <div className="category-directory-footer">
                  <span 
                    className="category-directory-link-text"
                    style={{ color: cat.color || 'var(--primary-600)' }}
                  >
                    Open Directory <HiOutlineArrowRight className="category-directory-arrow" />
                  </span>
                </div>
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
