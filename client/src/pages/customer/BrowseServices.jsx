import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  HiOutlineCpuChip, HiOutlineShieldCheck, HiOutlineVideoCamera,
  HiOutlineUserGroup, HiOutlineArrowRight, HiOutlineSparkles,
  HiOutlineWrench, HiOutlineTruck, HiOutlineAcademicCap,
  HiOutlineBuildingOffice, HiOutlineHeart, HiOutlineClock,
  HiOutlineMicrophone, HiOutlineCheckCircle
} from 'react-icons/hi2';
import {
  GlassCard,
  PrimaryButton,
  StatusPill,
  IconTile,
  GlassButton,
} from '../../components/ui';
import '../Dashboard.css';
import './CustomerPages.css';

const categoriesList = [
  { id: 'home-repairs', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineWrench />, labelKey: 'categories.homeRepairs', descKey: 'categories.homeRepairsDesc', color: 'var(--blue)', bg: 'rgba(59, 130, 246, 0.08)' },
  { id: 'vehicle-services', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineTruck />, labelKey: 'categories.vehicleServices', descKey: 'categories.vehicleServicesDesc', color: 'var(--accent-violet-text)', bg: 'rgba(139, 92, 246, 0.08)' },
  { id: 'cleaning', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.cleaning', descKey: 'categories.cleaningDesc', color: 'var(--accent-teal-text)', bg: 'rgba(6, 182, 212, 0.08)' },
  { id: 'home-it', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineCpuChip />, labelKey: 'categories.homeIT', descKey: 'categories.homeITDesc', color: 'var(--status-warning-text)', bg: 'rgba(245, 158, 11, 0.08)' },
  { id: 'care-family', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineHeart />, labelKey: 'categories.careFamily', descKey: 'categories.careFamilyDesc', color: 'var(--accent-rose-text)', bg: 'rgba(236, 72, 153, 0.08)' },
  { id: 'utility-daily', image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineClock />, labelKey: 'categories.utilityDaily', descKey: 'categories.utilityDailyDesc', color: 'var(--blue)', bg: 'rgba(59, 125, 193, 0.08)' },
  { id: 'learning-support', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineAcademicCap />, labelKey: 'categories.learningSupport', descKey: 'categories.learningSupportDesc', color: 'var(--status-success-text)', bg: 'rgba(132, 204, 22, 0.08)' },
  { id: 'property-services', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineBuildingOffice />, labelKey: 'categories.propertyServices', descKey: 'categories.propertyServicesDesc', color: 'var(--accent-slate-text)', bg: 'rgba(75, 85, 99, 0.08)' },
  { id: 'festive-seasonal', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.festiveSeasonal', descKey: 'categories.festiveSeasonalDesc', color: 'var(--status-warning-text)', bg: 'rgba(249, 115, 22, 0.08)' },
  { id: 'furniture-decor', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineWrench />, labelKey: 'categories.furnitureDecor', descKey: 'categories.furnitureDecorDesc', color: 'var(--accent-rose-text)', bg: 'rgba(236, 72, 153, 0.08)' },
  { id: 'garden-outdoor', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.gardenOutdoor', descKey: 'categories.gardenOutdoorDesc', color: 'var(--blue)', bg: 'rgba(59, 125, 193, 0.08)' },
  { id: 'relocation', image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineTruck />, labelKey: 'categories.relocation', descKey: 'categories.relocationDesc', color: 'var(--accent-violet-text)', bg: 'rgba(168, 85, 247, 0.08)', isBespoke: true, bespokePath: '/customer/relocation' },
  { id: 'health-wellness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineHeart />, labelKey: 'categories.healthWellness', descKey: 'categories.healthWellnessDesc', color: 'var(--status-danger-text)', bg: 'rgba(244, 63, 94, 0.08)', isBespoke: true, bespokePath: '/customer/health-wellness' },
  { id: 'kids-elderly', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineUserGroup />, labelKey: 'categories.kidsElderly', descKey: 'categories.kidsElderlyDesc', color: 'var(--status-warning-soft)', bg: 'rgba(234, 179, 8, 0.08)' },
  { id: 'pet-services', image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineSparkles />, labelKey: 'categories.petServices', descKey: 'categories.petServicesDesc', color: 'var(--blue)', bg: 'rgba(59, 130, 246, 0.08)', isBespoke: true, bespokePath: '/customer/pet-services' },
  { id: 'food-kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineBuildingOffice />, labelKey: 'categories.foodKitchen', descKey: 'categories.foodKitchenDesc', color: 'var(--blue)', bg: 'rgba(59, 125, 193, 0.08)', isBespoke: true, bespokePath: '/customer/food-kitchen' },
  { id: 'travel-commute', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineTruck />, labelKey: 'categories.travelCommute', descKey: 'categories.travelCommuteDesc', color: 'var(--accent-teal-text)', bg: 'rgba(6, 182, 212, 0.08)', isBespoke: true, bespokePath: '/customer/travel-commute' },
  { id: 'society-management', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80', icon: <HiOutlineUserGroup />, labelKey: 'categories.societyManagement', descKey: 'categories.societyManagementDesc', color: 'var(--status-success-text)', bg: 'rgba(132, 204, 22, 0.08)', isBespoke: true, bespokePath: '/customer/society-management' }
];

const bundlesData = [
  {
    id: 'new-home-setup',
    title: 'New Home Setup Combo',
    description: 'Wi-Fi mesh setup, smart doorbell install, and deep cleaning for move-in readiness.',
    price: 3299,
    originalPrice: 3999,
    savings: '17% OFF',
    servicesList: ['Smart Wi-Fi Setup', 'Smart Doorbell Setup', 'Full Home Deep Clean'],
    badge: 'Popular'
  },
  {
    id: 'monsoon-prep',
    title: 'Monsoon Waterproofing Prep',
    description: 'Balcony/roof elastomeric compound waterproofing, drainage check, and monsoon AC tuning.',
    price: 2999,
    originalPrice: 3499,
    savings: '14% OFF',
    servicesList: ['Roof Waterproofing', 'Drainage Fix', 'AC Service & Tune-up'],
    badge: 'Seasonal'
  },
  {
    id: 'senior-care-pack',
    title: 'Senior Citizen Support Combo',
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
    <div className="page-content" style={{ minHeight: '92vh', maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '8px 4px 32px' }}>

      {/* ===== SEARCH BANNER ===== */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <div className="sunken" style={{
          padding: '8px 18px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '1.25rem', color: 'var(--blue)', display: 'flex', alignItems: 'center' }}><HiOutlineCpuChip /></span>
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
              background: 'transparent',
              fontSize: '0.95rem',
              outline: 'none',
              color: 'var(--ink)'
            }}
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            className="glass-sm"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              color: isListening ? '#B64D47' : 'var(--blue)'
            }}
            title={t('browseServices.speakToSearchTitle', 'Search by speaking')}
          >
            <HiOutlineMicrophone />
          </button>
        </div>

        {/* Smart Concierge Suggestions Pane — Solid White Elevated */}
        {isSearchFocused && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            left: 0,
            right: 0,
            padding: '22px',
            zIndex: 100,
            borderRadius: '24px',
            background: '#FFFFFF',
            border: '1px solid rgba(22, 70, 214, 0.14)',
            boxShadow: '0 20px 48px rgba(11, 30, 79, 0.18), 0 4px 12px rgba(11, 30, 79, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--ink)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconTile icon={HiOutlineCpuChip} tone="info" />
                AI Concierge Suggestions
              </h4>
              <StatusPill status="confirmed">Auto-Routing</StatusPill>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--ink2)', marginBottom: '12px' }}>Try asking for...</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[
                'My AC is making a weird noise',
                'Bathroom tap is leaking',
                'I need a deep clean before the festival',
                'Power went out in one room',
                'Book a relaxing spa at home'
              ].map((text, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery(text);
                    setIsSearchFocused(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: 'rgba(22, 70, 214, 0.06)',
                    border: '1px solid rgba(22, 70, 214, 0.14)',
                    color: 'var(--ink)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== UNIQUE PREMIUM DIFFERENTIATION WIDGETS ===== */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--ink)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {t('browseServices.smartFeatures', 'Custom Diagnostic & Smart Features')}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px'
        }}>
          {/* AI Scan */}
          <Link to="/customer/ai-diagnosis" className="glass is-clickable" style={{ padding: '22px', display: 'flex', gap: '14px', alignItems: 'flex-start', textDecoration: 'none', borderRadius: '26px' }}>
            <IconTile icon={HiOutlineCpuChip} tone="info" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                  {t('customer.aiDiagnosis', 'AI Smart Diagnosis')}
                </h4>
                <StatusPill status="confirmed">Scanner</StatusPill>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink2)', margin: '6px 0 0 0', lineHeight: 1.45 }}>{t('browseServices.aiDiagnosisDesc', 'Upload a photo or video to instantly scan, identify faults, and calculate prices.')}</p>
            </div>
          </Link>

          {/* HomeFixr */}
          <Link to="/customer/my-home" className="glass is-clickable" style={{ padding: '22px', display: 'flex', gap: '14px', alignItems: 'flex-start', textDecoration: 'none', borderRadius: '26px' }}>
            <IconTile icon={HiOutlineShieldCheck} tone="teal" />
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>{t('customer.myHome', 'My HomeFixr Cockpit')}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink2)', margin: '6px 0 0 0', lineHeight: 1.45 }}>{t('browseServices.myHomeDesc', 'Track your Home Health score, maintenance timelines, and register warranties.')}</p>
            </div>
          </Link>

          {/* Video Consult */}
          <Link to="/customer/video-consultation" className="glass is-clickable" style={{ padding: '22px', display: 'flex', gap: '14px', alignItems: 'flex-start', textDecoration: 'none', borderRadius: '26px' }}>
            <IconTile icon={HiOutlineVideoCamera} tone="violet" />
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>{t('customer.videoConsultation', 'Video Pre-Inspection')}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink2)', margin: '6px 0 0 0', lineHeight: 1.45 }}>{t('browseServices.videoConsultationDesc', 'Book ₹149 virtual video calls with expert inspectors to pre-diagnose major work.')}</p>
            </div>
          </Link>

          {/* Group Booking */}
          <Link to="/customer/group-booking" className="glass is-clickable" style={{ padding: '22px', display: 'flex', gap: '14px', alignItems: 'flex-start', textDecoration: 'none', borderRadius: '26px' }}>
            <IconTile icon={HiOutlineUserGroup} tone="ok" />
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>{t('customer.groupBooking', 'Society Group Savings')}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink2)', margin: '6px 0 0 0', lineHeight: 1.45 }}>{t('browseServices.groupBookingDesc', 'Coordinate with neighborhood societies to book together and save up to 20%.')}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ===== CATEGORIES DIRECTORY ===== */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--ink)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: '18px' }}>
          {t('browseServices.categoryDirectories', 'Category Directories')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
          {sortedCategories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.isBespoke ? cat.bespokePath : `/customer/services/${cat.id}`}
              className="glass is-clickable"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: '26px',
                opacity: hasQuery ? (cat.isMatch ? 1 : 0.45) : 1,
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', height: '170px', width: '100%' }}>
                <img 
                  src={cat.image} 
                  alt={t(cat.labelKey)} 
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                  <span className="tile s-info">
                    {cat.icon}
                  </span>
                </div>
                <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                  <StatusPill status="confirmed">Live</StatusPill>
                </div>
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                    {t(cat.labelKey)}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                    {t(cat.descKey)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', borderTop: '1px solid rgba(22, 70, 214, 0.08)', paddingTop: '12px' }}>
                  <span style={{ color: 'var(--blue)', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Open Directory <HiOutlineArrowRight size={14} />
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
          <h3 style={{ fontSize: '1.25rem', color: 'var(--ink)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', margin: 0 }}>
            Super Saver Combo Bundles
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 600 }}>Flat discounts applied</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '20px'
        }}>
          {bundlesData.map((b) => (
            <GlassCard
              key={b.id}
              clickable={true}
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '26px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <StatusPill status="in progress">{b.badge}</StatusPill>
                  <StatusPill status="completed">{b.savings}</StatusPill>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: '4px 0' }}>
                  {b.title}
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', margin: '6px 0 0 0', lineHeight: 1.45 }}>
                  {b.description}
                </p>

                {/* Bundle Inclusions */}
                <div style={{ marginTop: '16px', borderTop: '1px solid rgba(22, 70, 214, 0.08)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Combo Includes:</span>
                  <ul style={{ listStyle: 'none', margin: '8px 0 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {b.servicesList.map((s, i) => (
                      <li key={i} style={{ fontSize: '0.82rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--blue)' }}>•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid rgba(22, 70, 214, 0.08)', paddingTop: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--ink3)' }}>₹{b.originalPrice}</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>₹{b.price}</div>
                </div>
                <Link
                  to={`/customer/book?service=${encodeURIComponent(b.title)}&category=home-repairs&price=${b.price}`}
                  className="btn-primary"
                  style={{ textDecoration: 'none', padding: '10px 22px', fontSize: '0.88rem' }}
                >
                  Book Combo Bundle
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
};

export default BrowseServices;
