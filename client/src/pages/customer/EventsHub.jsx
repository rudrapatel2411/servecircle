import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineSparkles, HiOutlineCalculator, HiOutlineCheckCircle, HiOutlineCurrencyRupee,
  HiOutlineEye, HiOutlineStar, HiOutlineUserGroup
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const EventsHub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Occasion Themes list translated dynamically on render
  const themesData = [
    {
      id: 'birthday',
      name: t('eventsHub.themes.birthday.name', 'Theme Birthday Bash 🎉'),
      description: t('eventsHub.themes.birthday.desc', 'Balloons, cartoon backdrops, neon signboards, cake table layouts.'),
      baseDecorPrice: 2999,
      icon: '🎈'
    },
    {
      id: 'grihapravesh',
      name: t('eventsHub.themes.grihapravesh.name', 'Traditional Griha Pravesh 🌸'),
      description: t('eventsHub.themes.grihapravesh.desc', 'Traditional fresh marigold garlands, entrance rangoli, puja mandap decor.'),
      baseDecorPrice: 3999,
      icon: '🌸'
    },
    {
      id: 'seasonal',
      name: t('eventsHub.themes.seasonal.name', 'Festive Lights & Diwali 🪔'),
      description: t('eventsHub.themes.seasonal.desc', 'High-altitude fairy light cascading, door latkan hangings, and brass pots set.'),
      baseDecorPrice: 3000,
      icon: '🪔'
    },
    {
      id: 'corporate',
      name: t('eventsHub.themes.corporate.name', 'Corporate Farewell / Party 💼'),
      description: t('eventsHub.themes.corporate.desc', 'Professional pull-up banners, balloon bouquets, awards podium setups.'),
      baseDecorPrice: 4999,
      icon: '💼'
    },
    {
      id: 'wedding',
      name: t('eventsHub.themes.wedding.name', 'Wedding & Ring Ceremony 💍'),
      description: t('eventsHub.themes.wedding.desc', 'Luxury floral arch backdrop, premium stage lighting, red carpet pathway.'),
      baseDecorPrice: 8999,
      icon: '💍'
    },
    {
      id: 'babyshower',
      name: t('eventsHub.themes.babyshower.name', 'Baby Shower / Godh Bharai 🍼'),
      description: t('eventsHub.themes.babyshower.desc', 'Pastel blue & pink backdrops, baby blocks decor, customized photo booth.'),
      baseDecorPrice: 3499,
      icon: '🍼'
    },
    {
      id: 'kittyparty',
      name: t('eventsHub.themes.kittyparty.name', 'Get-Together & Kitty Party 🍹'),
      description: t('eventsHub.themes.kittyparty.desc', 'Elegant table centerpieces, photo props, floral hangings, and ambient fairy lights.'),
      baseDecorPrice: 2499,
      icon: '🍹'
    },
    {
      id: 'anniversary',
      name: t('eventsHub.themes.anniversary.name', 'Milestone Anniversary 💑'),
      description: t('eventsHub.themes.anniversary.desc', 'Romantic red rose arches, LED numbers backdrop, heart-shaped balloon accents.'),
      baseDecorPrice: 4500,
      icon: '💑'
    }
  ];

  // Vendor profiles translated dynamically on render
  const vendorDetailsData = {
    catering: {
      title: t('eventsHub.cateringTitle', 'Catering Food Services 🍽️'),
      rating: '4.8 ★ (120+ Events)',
      expert: 'Chef Ramesh & Royal Caterers',
      experience: t('eventsHub.cateringProfileExp', '12+ years in large-scale wedding and party catering.'),
      portfolio: t('eventsHub.cateringPortfolioSpotlight', 'Delivered premium menus for corporate functions and high-end wedding receptions.'),
      included: [] 
    },
    dj: {
      title: t('eventsHub.djTitle', 'Live Sound & Professional DJ Setup 🎧'),
      rating: '4.9 ★ (95+ Events)',
      expert: 'DJ Nitish & SoundStorm Beats',
      experience: t('eventsHub.djProfileExp', '8+ years performing at major club parties, sangeet, and corporate galas.'),
      portfolio: t('eventsHub.djPortfolioSpotlight', 'Renowned for high-energy dance floors and flawless sound acoustics.'),
      included: []
    },
    livemusic: {
      title: t('eventsHub.liveMusicTitle', 'Live Music & Acoustic Band Setup 🎸'),
      rating: '4.8 ★ (40+ Events)',
      expert: 'The Harmony Trio Band',
      experience: t('eventsHub.liveMusicProfileExp', '5+ years performing in premium lounges, cafes, and intimate private parties.'),
      portfolio: t('eventsHub.liveMusicPortfolioSpotlight', 'Specializes in unplugged Bollywood melodies, Sufi, and classic soft rock.'),
      included: []
    },
    photography: {
      title: t('eventsHub.photographyTitle', 'High-res Photographer & Videographer 📸'),
      rating: '4.9 ★ (150+ Events)',
      expert: 'LensCraft Studio (Lead: Amit & Team)',
      experience: t('eventsHub.photographyProfileExp', '10+ years covering weddings, birthdays, and national corporate events.'),
      portfolio: t('eventsHub.photographyPortfolioSpotlight', 'Stunning candid portfolio with beautiful color grading and framing.'),
      included: []
    },
    drone: {
      title: t('eventsHub.droneTitle', 'Aerial Drone Videography Coverage 🛸'),
      rating: '4.7 ★ (30+ Events)',
      expert: 'SkyEye Cinematic Pilots',
      experience: t('eventsHub.droneProfileExp', '4+ years in cinematic drone shoots for outdoor properties and festivals.'),
      portfolio: t('eventsHub.dronePortfolioSpotlight', 'Breathtaking 4K aerial reels of large outdoor venues and outdoor events.'),
      included: []
    },
    emcee: {
      title: t('eventsHub.emceeTitle', 'Professional Anchor / Emcee Host 🎤'),
      rating: '4.9 ★ (70+ Events)',
      expert: 'Anchor Priya Sharma',
      experience: t('eventsHub.emceeProfileExp', '6+ years hosting corporate sangeets, baby showers, and grand wedding events.'),
      portfolio: t('eventsHub.emceePortfolioSpotlight', 'Extremely charismatic, funny, and skilled at keeping crowds engaged.'),
      included: []
    },
    magicshow: {
      title: t('eventsHub.magicShowTitle', 'Magic Show & Kids Activities Coordinator 🪄'),
      rating: '4.8 ★ (85+ Events)',
      expert: 'Jadugar Samrat & PlayZone Team',
      experience: t('eventsHub.magicShowProfileExp', '7+ years conducting kids birthdays and carnival-themed society functions.'),
      portfolio: t('eventsHub.magicShowPortfolioSpotlight', 'A crowd favorite for kids with humorous, safe, and clean family entertainment.'),
      included: []
    },
    cleanup: {
      title: t('eventsHub.cleanupTitle', 'Post-Event Site Clean-up Crew 🧹'),
      rating: '4.9 ★ (300+ Cleanups)',
      expert: 'ServeCircle Clean-Force Premium',
      experience: t('eventsHub.cleanupProfileExp', 'Specialized corporate and private post-event cleaning crews.'),
      portfolio: t('eventsHub.cleanupPortfolioSpotlight', 'Trusted partner for restoring venues to pristine state overnight.'),
      included: []
    },
    photobooth: {
      title: t('eventsHub.photoboothTitle', '360° Spin Video Photo Booth 🎥'),
      rating: '4.9 ★ (200+ Events)',
      expert: 'SpinCam Pro Experiences',
      experience: t('eventsHub.photoboothProfileExp', 'Pioneers in 360-degree slow-motion cinematic video booths.'),
      portfolio: t('eventsHub.photoboothPortfolioSpotlight', 'Creates instant viral-worthy slow-motion reels for all guests.'),
      included: []
    },
    einvite: {
      title: t('eventsHub.einviteTitle', 'Custom Digital E-Invite 💌'),
      rating: '4.8 ★ (500+ Designs)',
      expert: 'ServeCircle Studio Designers',
      experience: t('eventsHub.einviteProfileExp', 'Creative digital designers for premium WhatsApp video & image invites.'),
      portfolio: t('eventsHub.einvitePortfolioSpotlight', 'Beautiful, elegant templates crafted specifically for your theme.'),
      included: []
    }
  };

  // State handles Theme ID rather than object to ensure dynamic translations update on language switch
  const [selectedThemeId, setSelectedThemeId] = useState('birthday');
  const selectedTheme = themesData.find(theme => theme.id === selectedThemeId) || themesData[0];

  // Navigation tab states to avoid long scroll
  const [activeTab, setActiveTab] = useState('theme'); // 'theme' | 'checklist'
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const [guestsCount, setGuestsCount] = useState(25);
  
  // Custom theme description & budget states
  const [customThemeDesc, setCustomThemeDesc] = useState('');
  const [customThemePrice, setCustomThemePrice] = useState('0');

  // Custom inclusions check states
  const [includeCatering, setIncludeCatering] = useState(true);
  const [cateringType, setCateringType] = useState('veg'); // 'veg' = 250, 'nonveg' = 450
  const [includeDJ, setIncludeDJ] = useState(false);
  const [includePhotography, setIncludePhotography] = useState(true);
  const [includeCleanup, setIncludeCleanup] = useState(true);

  // New checklist options
  const [includeLiveMusic, setIncludeLiveMusic] = useState(false);
  const [includeEmcee, setIncludeEmcee] = useState(false);
  const [includeMagicShow, setIncludeMagicShow] = useState(false);
  const [includeDrone, setIncludeDrone] = useState(false);
  const [includePhotoBooth, setIncludePhotoBooth] = useState(false);
  const [includeEInvite, setIncludeEInvite] = useState(false);
  
  // Event details
  const [venueType, setVenueType] = useState('home'); // 'home', 'banquet', 'lawn'
  const [eventDate, setEventDate] = useState('');

  // Custom user-defined needs states
  const [customNeeds, setCustomNeeds] = useState([]);
  const [newNeedText, setNewNeedText] = useState('');
  const [newNeedPrice, setNewNeedPrice] = useState('1000');

  // Active vendor key for Modal
  const [activeVendorKey, setActiveVendorKey] = useState(null);

  // Calculate pricing dynamics
  const decorPrice = selectedTheme.baseDecorPrice;
  const customStylingCost = parseInt(customThemePrice) || 0;
  const cateringCost = includeCatering ? guestsCount * (cateringType === 'veg' ? 250 : 450) : 0;
  const djCost = includeDJ ? 4000 : 0;
  const photoCost = includePhotography ? 3000 : 0;
  const cleanCost = includeCleanup ? (venueType === 'home' ? 999 : venueType === 'banquet' ? 2499 : 3499) : 0;

  // New items cost
  const liveMusicCost = includeLiveMusic ? 6000 : 0;
  const emceeCost = includeEmcee ? 3500 : 0;
  const magicShowCost = includeMagicShow ? 2500 : 0;
  const droneCost = includeDrone ? 4500 : 0;
  const boothCost = includePhotoBooth ? 4500 : 0;
  const inviteCost = includeEInvite ? 999 : 0;

  // Custom user needs cost
  const customNeedsCost = customNeeds
    .filter(need => need.checked)
    .reduce((sum, need) => sum + need.price, 0);

  const totalEstimate = decorPrice + customStylingCost + cateringCost + djCost + photoCost + cleanCost + 
                        liveMusicCost + emceeCost + magicShowCost + droneCost + boothCost + inviteCost + customNeedsCost;

  // Dynamically calculate what the vendor is bringing based on selected states
  const getDynamicVendorDetails = (key) => {
    const base = vendorDetailsData[key];
    if (!base) return null;

    const dynamicDetails = { ...base };

    if (key === 'catering') {
      const menuType = cateringType === 'veg' ? t('eventsHub.cateringOptionVeg', 'Pure Veg') : t('eventsHub.cateringOptionNonVeg', 'Veg + Non-Veg');
      const chefCount = Math.max(1, Math.ceil(guestsCount / 50));
      const serverCount = Math.max(2, Math.ceil(guestsCount / 20));
      dynamicDetails.included = [
        t('eventsHub.cateringInc1', `Freshly prepared ${menuType} dinner buffet, customized exactly for ${guestsCount} expected guests`),
        t('eventsHub.cateringInc2', `Premium ${cateringType === 'veg' ? 'Paneer, Sabzi & Dal starters' : 'Chicken, Fish & Paneer mixed starters'} with hot entrees`),
        t('eventsHub.cateringInc3', `Kitchen Crew: Dispatched ${chefCount} Master Chef(s) + ${serverCount} professional catering service servers`),
        t('eventsHub.cateringInc4', `Premium counter set-up: Silk tablecloths, buffet decoration, and professional warmer chafing dishes`),
        t('eventsHub.cateringInc5', `Full dining utilities: Clean biodegradable plates, elegant copper/steel cutlery, and fresh glassware`)
      ];
    } else if (key === 'dj') {
      const subwoofers = guestsCount > 100 ? '4x Double JBL SRX Heavy subwoofers (Large Venue Sound)' : '2x JBL EON Professional active subwoofers (Compact Sound)';
      const lights = guestsCount > 100 ? '8x LED Par cans, 2x Spot Moving Heads, Fog-Smoke machines & Laser dome' : '4x LED Par cans and 1x sound-active party light dome';
      dynamicDetails.included = [
        t('eventsHub.djInc1', `Sound Rig: ${subwoofers} - scaled dynamically for your ${guestsCount} guests`),
        t('eventsHub.djInc2', `DJ Station: Pioneer DDJ Professional mixer console, high-grade audio amplifiers & laptop deck`),
        t('eventsHub.djInc3', `Visuals: Truss-mounted light setup: ${lights}`),
        t('eventsHub.djInc4', `Props & Mics: 2x Cordless stage microphones + auxiliary stands for host speech & games`)
      ];
    } else if (key === 'livemusic') {
      dynamicDetails.included = [
        t('eventsHub.liveMusicInc1', `Acoustic Band: 2-piece professional unplugged musicians (Vocals + Acoustic Guitar/Keyboard player)`),
        t('eventsHub.liveMusicInc2', `Audio Gear: 2x Active vocal monitors, instrument pickup inputs, and a compact 8-channel sound mixer`),
        t('eventsHub.liveMusicInc3', `Dedicated Microphones: 2x Shure vocal mics with adjustable tripod boom stands`),
        t('eventsHub.liveMusicInc4', `Audience Engagement: Scaled request segment so all ${guestsCount} guests can request special songs`)
      ];
    } else if (key === 'photography') {
      const crew = guestsCount > 120 ? '3 Professionals (2 Candid Photographers + 1 Cinematic Videographer)' : '2 Professionals (1 Candid Photographer + 1 HD Videographer)';
      const deliverablePhotos = guestsCount > 120 ? '120+ HD edited & color-graded digital photographs' : '80+ HD edited & color-graded digital photographs';
      dynamicDetails.included = [
        t('eventsHub.photoInc1', `Photography Crew: Dispatched ${crew} carrying professional full-frame DSLR/Mirrorless cameras`),
        t('eventsHub.photoInc2', `Deliverables: ${deliverablePhotos} + 1 Cinematic 3-4 minute HD highlight film`),
        t('eventsHub.photoInc3', `Physical Gear: Professional studio portrait flash lights, tripods, stabilizers, and outdoor lenses`),
        t('eventsHub.photoInc4', `Digital Vault: Secure online cloud link delivered within 7 days with raw photo access`)
      ];
    } else if (key === 'drone') {
      dynamicDetails.included = [
        t('eventsHub.droneInc1', `Aviation Gear: Premium DJI 4K Cinematic Drone brought to the venue by a licensed drone pilot`),
        t('eventsHub.droneInc2', `Group Coverage: Sweeping aerial group shots of all ${guestsCount} guests at the venue layout`),
        t('eventsHub.droneInc3', `Decorator Shots: 20+ ultra-high-resolution aerial raw photographs of the decorator stage set`),
        t('eventsHub.droneInc4', `Footage: 4K aerial panning clips integrated directly into your final highlight video reel`)
      ];
    } else if (key === 'emcee') {
      const props = guestsCount > 80 ? 'Heavy crowd interactive game props & prize distributions' : 'Intimate icebreaker game materials';
      dynamicDetails.included = [
        t('eventsHub.emceeInc1', `Show Host: Charismatic bilingual Emcee host to coordinate stage flow for ${guestsCount} guests`),
        t('eventsHub.emceeInc2', `Stage Gear: Personalized game props, cue cards, and schedule boards brought by host`),
        t('eventsHub.emceeInc3', `Activities: Professional game coordination including: ${props}`),
        t('eventsHub.emceeInc4', `Bilingual Delivery: Fluent hosting in English, Hindi, and regional Gujarati dialects`)
      ];
    } else if (key === 'magicshow') {
      dynamicDetails.included = [
        t('eventsHub.magicShowInc1', `Stage Props: Professional magic show table, illusion props, and comedy magic items`),
        t('eventsHub.magicShowInc2', `Balloon Twisting: Dynamic shapes (dog, heart, sword) using ${guestsCount} balloons for all children present`),
        t('eventsHub.magicShowInc3', `Kids Play Area: Fun party accessories (ring-toss boards, customized target game props)`),
        t('eventsHub.magicShowInc4', `Prizes: 10+ small participation gift toys and badges provided directly to the winning kids`)
      ];
    } else if (key === 'cleanup') {
      const sweepers = Math.max(2, Math.ceil(guestsCount / 40));
      dynamicDetails.included = [
        t('eventsHub.cleanupInc1', `Sanitation Crew: Dispatched team of ${sweepers} professional garbage sweepers`),
        t('eventsHub.cleanupInc2', `Supplies: Commercial-grade heavy duty vacuum cleaner, floor mops, scrubbers, and bin bags`),
        t('eventsHub.cleanupInc3', `Sanitization Spray: High-grade antibacterial surface sanitizers for all dining tables and scrap stations`),
        t('eventsHub.cleanupInc4', `Waste Management: Collection of wet/dry waste, segregation, and complete municipal disposal`)
      ];
    } else if (key === 'photobooth') {
      dynamicDetails.included = [
        t('eventsHub.boothInc1', 'Setup: Fully automated 360-degree motorized spin camera platform'),
        t('eventsHub.boothInc2', 'Lighting: Professional RGB ring lights and dynamic spot beams'),
        t('eventsHub.boothInc3', 'Props: Trendy party props (glasses, signboards, money guns)'),
        t('eventsHub.boothInc4', 'Deliverables: Instant QR-code sharing for guests to download their edited slow-mo reels')
      ];
    } else if (key === 'einvite') {
      dynamicDetails.included = [
        t('eventsHub.inviteInc1', 'Design: 1 Custom premium digital image & video invite matching your theme'),
        t('eventsHub.inviteInc2', 'Format: WhatsApp & Instagram-ready vertical format'),
        t('eventsHub.inviteInc3', 'Revisions: Up to 2 free text/color revisions before final delivery'),
        t('eventsHub.inviteInc4', 'Turnaround: Delivered within 24-48 hours directly to your WhatsApp')
      ];
    }

    return dynamicDetails;
  };

  const handleAddCustomNeed = () => {
    if (!newNeedText.trim()) return;
    const price = parseInt(newNeedPrice) || 0;
    const newItem = {
      id: Date.now(),
      text: newNeedText.trim(),
      price: price,
      checked: true
    };
    setCustomNeeds(prev => [...prev, newItem]);
    setNewNeedText('');
    setNewNeedPrice('1000');
  };

  const handleBookEvent = (e) => {
    e.preventDefault();
    const eventName = selectedTheme.name;
    const eventDesc = `Base Theme: ${selectedTheme.description}.${customThemeDesc ? ` Custom Details: ${customThemeDesc}` : ''}`;
    
    // Compile checked items to pass as notes
    const inclusions = [];
    if (includeCatering) inclusions.push(`Catering (${cateringType})`);
    if (includeDJ) inclusions.push('DJ Setup');
    if (includePhotography) inclusions.push('Photography');
    if (includeCleanup) inclusions.push('Site Cleanup');
    if (includeLiveMusic) inclusions.push('Live Acoustic Band');
    if (includeEmcee) inclusions.push('Anchor Host');
    if (includeMagicShow) inclusions.push('Magic Show & Kid Games');
    if (includeDrone) inclusions.push('Drone Video');
    if (includePhotoBooth) inclusions.push('360 Photo Booth');
    if (includeEInvite) inclusions.push('Digital E-Invite');
    if (customStylingCost > 0) inclusions.push(`Custom Decor Styling (+₹${customStylingCost})`);
    customNeeds.filter(n => n.checked).forEach(n => inclusions.push(`Custom: ${n.text} (₹${n.price})`));

    const notes = `Date: ${eventDate || 'Not specified'}. Venue: ${venueType}. Guests: ${guestsCount}. Inclusions: ${inclusions.join(', ')}. Details: ${eventDesc}`;
    
    navigate(`/customer/book?service=${encodeURIComponent(eventName)}&price=${totalEstimate}&guests=${guestsCount}&notes=${encodeURIComponent(notes)}`);
  };

  // Live computed dynamic vendor details for active key
  const activeVendorDetail = activeVendorKey ? getDynamicVendorDetails(activeVendorKey) : null;

  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '100px' }}>
      
      {/* Dynamic responsive layout injected styles */}
      <style>{`
        @media (max-width: 768px) {
          .events-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .cost-summary-desktop {
            display: none !important;
          }
          .mobile-sticky-footer {
            display: flex !important;
          }
          .page-header {
            padding: 20px 16px !important;
            margin-bottom: 16px !important;
          }
          .page-title {
            font-size: 1.6rem !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-sticky-footer {
            display: none !important;
          }
          .cost-summary-desktop {
            display: block !important;
          }
        }
        @media print {
          /* Hide navigation, headers, and the left configurator panel */
          .page-header, .tabs-container, .left-panel, .mobile-sticky-footer, .print-hide {
            display: none !important;
          }
          /* Make the cost summary span the full width of the printed page */
          .events-grid {
            display: block !important;
            margin: 0 !important;
          }
          .cost-summary-desktop {
            display: block !important;
            width: 100% !important;
            position: static !important;
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
          /* Ensure backgrounds print correctly */
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

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
            <HiOutlineSparkles style={{ color: '#f59e0b' }} /> {t('eventsHub.title', 'ServeCircle Events Hub')}
          </h1>
          <p style={{ color: '#d8b4fe', fontSize: '0.95rem', marginTop: '6px', maxWidth: '600px' }}>
            {t('eventsHub.subtitle', 'Coordinate catering, customized LED/balloon styling decors, live sound setups, and pro event photographers in a single checkout.')}
          </p>
        </div>
      </div>

      {/* Navigation tabs to save vertical scrolling space */}
      <div className="tabs-container" style={{
        display: 'flex',
        background: 'var(--gray-100)',
        padding: '4px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '24px',
        border: '1px solid var(--gray-200)',
        maxWidth: '500px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeTab === 'theme' ? 'white' : 'transparent',
            color: activeTab === 'theme' ? 'var(--primary-700)' : 'var(--gray-500)',
            fontWeight: activeTab === 'theme' ? '800' : '650',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'theme' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {t('eventsHub.tabTheme', '🎨 1. Theme & Decor')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeTab === 'checklist' ? 'white' : 'transparent',
            color: activeTab === 'checklist' ? 'var(--primary-700)' : 'var(--gray-500)',
            fontWeight: activeTab === 'checklist' ? '800' : '650',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'checklist' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {t('eventsHub.tabChecklist', '📋 2. Vendor Services')}
        </button>
      </div>

      <div className="dashboard-grid events-grid" style={{ gridTemplateColumns: '1.25fr 0.95fr', gap: '28px' }}>
        
        {/* LEFT PANEL: Theme Selectors & Configuration Checklists */}
        <div className="left-panel">
          {activeTab === 'theme' ? (
            <div className="animate-fade-in-up">
              {/* Theme Selector */}
              <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'white', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px' }}>
                  {t('eventsHub.step1Title', 'Step 1: Venue & Occasion Theme')}
                </h3>
                
                {/* Event Date & Venue Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px', background: 'var(--gray-50)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>
                      Event Date 🗓️
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g., 25th Dec 2026"
                      value={eventDate} 
                      onChange={(e) => setEventDate(e.target.value)} 
                      style={{ padding: '10px 12px', fontSize: '0.85rem' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>
                      Venue Type 📍
                    </label>
                    <select 
                      className="input-field" 
                      value={venueType} 
                      onChange={(e) => setVenueType(e.target.value)}
                      style={{ padding: '10px 12px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <option value="home">Home / Private Property</option>
                      <option value="banquet">Indoor Banquet / Hall</option>
                      <option value="lawn">Open Lawn / Ground</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {themesData.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: selectedThemeId === theme.id ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                        background: selectedThemeId === theme.id ? 'var(--primary-50)' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.6rem' }}>{theme.icon}</span>
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>{theme.name}</h4>
                          <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '2px', lineHeight: 1.3 }}>{theme.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Permanent Theme Styling & Customization Form */}
                <div className="card animate-fade-in-up" style={{ marginTop: '20px', padding: '20px', background: 'var(--gray-5)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {t('eventsHub.customizeThemeTitle', '✍️ Customize Selected Theme & Decor Styling')}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '14px', lineHeight: 1.4 }}>
                    {t('eventsHub.customizeThemeDesc', 'Want specific themes or extra decorations? Write your choice below (e.g. "Spider-Man theme for birthday", "Add blue & silver balloons").')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>{t('eventsHub.customThemeLabel', 'Your Custom Theme / Styling Details')}</label>
                      <textarea 
                        className="input-field" 
                        placeholder={t('eventsHub.customThemePlaceholder', 'e.g., Spider-Man theme backdrop, pastel balloons, specific flower garlands at the entrance...')} 
                        value={customThemeDesc}
                        onChange={(e) => setCustomThemeDesc(e.target.value)}
                        style={{ padding: '10px 14px', fontSize: '0.85rem', minHeight: '68px', resize: 'vertical' }}
                      />
                    </div>
                    
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-800)' }}>{t('eventsHub.customBudgetLabel', 'Additional Customization Budget (Optional, ₹)')}</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        placeholder="0" 
                        value={customThemePrice}
                        onChange={(e) => setCustomThemePrice(e.target.value)}
                        style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              {/* Configuration Checklists */}
              <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'white' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '18px' }}>
                  {t('eventsHub.step2Title', 'Step 2: Customize Vendor Checklist')}
                </h3>

                {/* Guests Count slider */}
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('eventsHub.guestsCount', '👥 Expected Guests Count')}</span>
                    <span style={{ color: 'var(--primary-600)', fontWeight: 800 }}>{guestsCount} {t('eventsHub.guestsCountSuffix', 'Guests')}</span>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includeCatering} onChange={(e) => setIncludeCatering(e.target.checked)} />
                        {t('eventsHub.cateringTitle', 'Catering Food Services 🍽️')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('catering')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View Catering Partner Details"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.cateringDesc', 'Professional chef catering menu per-plate model.')}
                      </p>
                      
                      {includeCatering && (
                        <div style={{ display: 'flex', gap: '10px', marginLeft: '20px', marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setCateringType('veg')}
                            className={`btn btn-sm ${cateringType === 'veg' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                          >
                            {t('eventsHub.cateringOptionVeg', 'Pure Veg (₹250/plate)')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCateringType('nonveg')}
                            className={`btn btn-sm ${cateringType === 'nonveg' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                          >
                            {t('eventsHub.cateringOptionNonVeg', 'Veg + Non-Veg (₹450/plate)')}
                          </button>
                        </div>
                      )}
                    </div>
                    {includeCatering && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>+ ₹{cateringCost}</span>
                    )}
                  </div>

                  {/* DJ */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includeDJ} onChange={(e) => setIncludeDJ(e.target.checked)} />
                        {t('eventsHub.djTitle', 'Live Sound & Professional DJ Setup 🎧')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('dj')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View DJ Partner Details"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.djDesc', 'High-density JBL sub-woofers, DJ console, and dynamic stage light controllers.')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                      {includeDJ ? `+ ₹${djCost}` : '—'}
                    </span>
                  </div>

                  {/* Live Acoustic Band */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includeLiveMusic} onChange={(e) => setIncludeLiveMusic(e.target.checked)} />
                        {t('eventsHub.liveMusicTitle', 'Live Music & Acoustic Band Setup 🎸')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('livemusic')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View Live Acoustic Band Members"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.liveMusicDesc', '2-piece live acoustic musicians with vocals, keyboard, and light percussion.')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                      {includeLiveMusic ? `+ ₹${liveMusicCost}` : '—'}
                    </span>
                  </div>

                  {/* Photography */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includePhotography} onChange={(e) => setIncludePhotography(e.target.checked)} />
                        {t('eventsHub.photographyTitle', 'High-res Photographer & Videographer 📸')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('photography')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View Photography Team Details"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.photographyDesc', 'Deliverable: 80+ edited high-resolution color-graded photos + full-frame HD highlights reel.')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                      {includePhotography ? `+ ₹${photoCost}` : '—'}
                    </span>
                  </div>

                  {/* Drone Videography */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includeDrone} onChange={(e) => setIncludeDrone(e.target.checked)} />
                        {t('eventsHub.droneTitle', 'Aerial Drone Videography Coverage 🛸')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('drone')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View Drone Quality Details"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.droneDesc', 'Vetted licensed drone pilot with cinematic 4K video capturing for outdoor events.')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                      {includeDrone ? `+ ₹${droneCost}` : '—'}
                    </span>
                  </div>

                  {/* Emcee Host */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includeEmcee} onChange={(e) => setIncludeEmcee(e.target.checked)} />
                        {t('eventsHub.emceeTitle', 'Professional Anchor / Emcee Host 🎤')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('emcee')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View Anchor Profile"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.emceeDesc', 'Lively host to coordinate crowd interactions, fun games, and stage scheduling.')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                      {includeEmcee ? `+ ₹${emceeCost}` : '—'}
                    </span>
                  </div>

                  {/* Magic Show & Kid Games */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includeMagicShow} onChange={(e) => setIncludeMagicShow(e.target.checked)} />
                        {t('eventsHub.magicShowTitle', 'Magic Show & Kids Activities Coordinator 🪄')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('magicshow')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View Magician Profile"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.magicShowDesc', '30-minute interactive magic show + balloon twisting and target game setups for kids.')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                      {includeMagicShow ? `+ ₹${magicShowCost}` : '—'}
                    </span>
                  </div>

                  {/* 360 Photo Booth */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includePhotoBooth} onChange={(e) => setIncludePhotoBooth(e.target.checked)} />
                        {t('eventsHub.photoboothTitle', '360° Spin Video Photo Booth 🎥')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('photobooth')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View 360 Booth Details"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.photoboothDesc', 'Viral slow-mo spinning camera setup with props and instant QR video sharing.')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                      {includePhotoBooth ? `+ ₹${boothCost}` : '—'}
                    </span>
                  </div>

                  {/* Digital E-Invite */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includeEInvite} onChange={(e) => setIncludeEInvite(e.target.checked)} />
                        {t('eventsHub.einviteTitle', 'Custom Digital E-Invite 💌')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('einvite')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View E-Invite Details"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.einviteDesc', 'Premium customized video/image invite tailored to your theme for WhatsApp sharing.')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                      {includeEInvite ? `+ ₹${inviteCost}` : '—'}
                    </span>
                  </div>

                  {/* Post-event cleaning */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: customNeeds.length > 0 ? '1px solid var(--gray-100)' : 'none', paddingBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={includeCleanup} onChange={(e) => setIncludeCleanup(e.target.checked)} />
                        {t('eventsHub.cleanupTitle', 'Post-Event Site Clean-up Crew 🧹')}
                        <button 
                          type="button" 
                          onClick={() => setActiveVendorKey('cleanup')}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', fontSize: '1.1rem' }}
                          title="View Post-Event Cleaning Service Protocols"
                        >
                          <HiOutlineEye />
                        </button>
                      </label>
                      <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginLeft: '20px', marginTop: '2px' }}>
                        {t('eventsHub.cleanupDesc', 'Vetted crew dispatches right at event completion to restore clean spaces.')}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                      {includeCleanup ? `+ ₹${cleanCost}` : '—'}
                    </span>
                  </div>

                  {/* Render Custom Needs dynamically added by user */}
                  {customNeeds.map((need) => (
                    <div key={need.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px', paddingTop: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <input 
                          type="checkbox" 
                          checked={need.checked} 
                          onChange={() => {
                            setCustomNeeds(prev => prev.map(item => item.id === need.id ? { ...item, checked: !item.checked } : item));
                          }} 
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {need.text}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 700 }}>
                            {t('eventsHub.customRequirementText', 'Custom Requirement')}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                          {need.checked ? `+ ₹${need.price}` : '—'}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setCustomNeeds(prev => prev.filter(item => item.id !== need.id))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.95rem', padding: '4px' }}
                          title={t('eventsHub.removeCustomRequirement', 'Remove custom requirement')}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}

                </div>

                {/* Add Custom Need Panel */}
                <div style={{ marginTop: '20px', padding: '16px', background: 'var(--gray-55)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--gray-300)' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {t('eventsHub.customRequirementTitle', '➕ Add Your Custom Requirement / Vendor Need')}
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder={t('eventsHub.customRequirementPlaceholder', 'e.g., Live Flute Player, Custom Florist, Helium Arch')} 
                      className="input-field" 
                      value={newNeedText}
                      onChange={(e) => setNewNeedText(e.target.value)}
                      style={{ flex: 2, minWidth: '180px', padding: '8px 12px', fontSize: '0.8rem', marginBottom: 0 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-md)', padding: '0 8px', flex: 1, minWidth: '90px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>₹</span>
                      <input 
                        type="number" 
                        placeholder="1000" 
                        className="input-field" 
                        value={newNeedPrice}
                        onChange={(e) => setNewNeedPrice(e.target.value)}
                        style={{ width: '100%', border: 'none', padding: '8px 4px', fontSize: '0.8rem', marginBottom: 0, outline: 'none', boxShadow: 'none' }}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddCustomNeed}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem', minHeight: '36px' }}
                    >
                      {t('eventsHub.addNeedBtn', 'Add Need')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Budget calculations & submit (Desktop Only) */}
        <div className="cost-summary-desktop">
          <div className="card" style={{ padding: '28px', border: '1.5px solid var(--primary-200)', background: 'white', position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 850, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlineCalculator style={{ color: 'var(--primary-600)' }} /> {t('eventsHub.costSummaryTitle', 'Event Cost Summary')}
            </h3>
            
            {/* Breakdowns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.75rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.occasionThemeDecor', 'Occasion Theme Decor')} ({selectedTheme.icon})</span>
                <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>
                  {selectedTheme.name} (₹{decorPrice})
                </span>
              </div>

              {customStylingCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.customStylingAddition', 'Theme Customization Addition')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>+ ₹{customStylingCost}</span>
                </div>
              )}
              
              {includeCatering && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.cateringSummary', 'Catering')} ({guestsCount} Plates - {cateringType === 'veg' ? 'Veg' : 'Non-Veg'})</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{cateringCost}</span>
                </div>
              )}

              {includeDJ && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.djSummary', 'DJ Sound System Console')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{djCost}</span>
                </div>
              )}

              {includeLiveMusic && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.liveMusicSummary', 'Live Acoustic Band Setup')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{liveMusicCost}</span>
                </div>
              )}

              {includePhotography && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.photographySummary', 'Pro DSLR Photography Team')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{photoCost}</span>
                </div>
              )}

              {includeDrone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.droneSummary', 'Aerial Drone 4K Coverage')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{droneCost}</span>
                </div>
              )}

              {includeEmcee && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.emceeSummary', 'Professional Emcee Host')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{emceeCost}</span>
                </div>
              )}

              {includeMagicShow && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.magicShowSummary', 'Magic Show & Kid Activities')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{magicShowCost}</span>
                </div>
              )}

              {includeCleanup && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.cleanupSummary', 'Post-Event Spot Cleanup Crew')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{cleanCost}</span>
                </div>
              )}

              {includePhotoBooth && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.photoboothSummary', '360° Spin Video Booth')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{boothCost}</span>
                </div>
              )}

              {includeEInvite && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.einviteSummary', 'Custom Digital E-Invite')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{inviteCost}</span>
                </div>
              )}

              {customNeeds.filter(need => need.checked).map(need => (
                <div key={need.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{need.text} ({t('eventsHub.customRequirementText', 'Custom')})</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>+ ₹{need.price}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 800 }}>{t('eventsHub.estimatedPackageTotal', 'Estimated Package Total')}</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy-800)', display: 'flex', alignItems: 'center' }}>
                  <HiOutlineCurrencyRupee style={{ fontSize: '1.6rem' }} /> {totalEstimate}
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '4px' }}>
                {t('eventsHub.societyDiscount', 'Society: up to 20% off')}
              </span>
            </div>

            <form onSubmit={handleBookEvent} className="print-hide">
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}
              >
                <HiOutlineCheckCircle /> {t('eventsHub.bookCompleteEvent', 'Book Complete Event Package')}
              </button>
            </form>

            {/* Print and Share Actions */}
            <div className="print-hide" style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '6px' }}
              >
                📥 PDF Quote
              </button>
              <button
                type="button"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Hey, check out my event quote from ServeCircle!\n\nTheme: ${selectedTheme.name}\nTotal Estimate: ₹${totalEstimate}`)}`, '_blank')}
                style={{ flex: 1, padding: '10px', fontSize: '0.8rem', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                Share on WhatsApp
              </button>
            </div>

            <div style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--gray-400)', display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
              <span>{t('eventsHub.secureTransaction', '🔒 100% Secure Transaction')}</span>
              <span>•</span>
              <span>{t('eventsHub.freeRevisions', '💰 Free post-event revisions')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Pinned Mobile Sticky Footer */}
      <div className="mobile-sticky-footer" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        borderTop: '1.5px solid var(--primary-100)',
        padding: '12px 20px 24px 20px',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 999,
        boxShadow: '0 -8px 20px rgba(0,0,0,0.08)',
        display: 'none' 
      }}>
        <div>
          <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 800 }}>{t('eventsHub.estTotal', 'Est. Total')}</span>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--navy-800)', display: 'flex', alignItems: 'center' }}>
            <HiOutlineCurrencyRupee style={{ fontSize: '1.1rem' }} /> {totalEstimate}
          </div>
        </div>
        
        {activeTab === 'theme' ? (
          <button
            type="button"
            onClick={() => {
              setActiveTab('checklist');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {t('eventsHub.nextServices', 'Next: Services →')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowMobileSummary(true)}
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--gradient-primary, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%))' }}
          >
            {t('eventsHub.reviewAndBook', 'Review & Book ⚡')}
          </button>
        )}
      </div>

      {/* Mobile Drawer Overlay Summary (Drawer from Bottom) */}
      {showMobileSummary && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {/* Click backdrop to close */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setShowMobileSummary(false)} />
          
          <div className="animate-slide-up" style={{
            width: '100%',
            background: 'white',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '24px 20px 36px 20px',
            position: 'relative',
            zIndex: 10000,
            boxShadow: '0 -15px 30px rgba(0,0,0,0.15)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            {/* Handle bar */}
            <div style={{ width: '40px', height: '4px', background: 'var(--gray-300)', borderRadius: '2px', margin: '0 auto 16px auto' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 900 }}>
                {t('eventsHub.costSummaryTitle', 'Event Cost Summary')}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowMobileSummary(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--gray-400)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Breakdowns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.occasionThemeDecor', 'Theme Decor')} ({selectedTheme.icon})</span>
                <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>{selectedTheme.name} (₹{decorPrice})</span>
              </div>

              {customStylingCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.customStylingAddition', 'Theme Customization Addition')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>+ ₹{customStylingCost}</span>
                </div>
              )}
              
              {includeCatering && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.cateringSummary', 'Catering')} ({guestsCount} Guests)</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{cateringCost}</span>
                </div>
              )}

              {includeDJ && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.djSummary', 'DJ Sound System Console')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{djCost}</span>
                </div>
              )}

              {includeLiveMusic && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.liveMusicSummary', 'Live Acoustic Band Setup')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{liveMusicCost}</span>
                </div>
              )}

              {includePhotography && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.photographySummary', 'Pro DSLR Photography Team')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{photoCost}</span>
                </div>
              )}

              {includeDrone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.droneSummary', 'Aerial Drone 4K Coverage')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{droneCost}</span>
                </div>
              )}

              {includeEmcee && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.emceeSummary', 'Professional Emcee Host')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{emceeCost}</span>
                </div>
              )}

              {includeMagicShow && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.magicShowSummary', 'Magic Show & Kid Activities')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{magicShowCost}</span>
                </div>
              )}

              {includeCleanup && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{t('eventsHub.cleanupSummary', 'Post-Event Spot Cleanup Crew')}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>₹{cleanCost}</span>
                </div>
              )}

              {customNeeds.filter(need => need.checked).map(need => (
                <div key={need.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)' }}>{need.text} ({t('eventsHub.customRequirementText', 'Custom')})</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>+ ₹{need.price}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 800 }}>{t('eventsHub.totalPackageCost', 'Total Package Cost')}</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy-800)', display: 'flex', alignItems: 'center' }}>
                  <HiOutlineCurrencyRupee style={{ fontSize: '1.4rem' }} /> {totalEstimate}
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: '4px' }}>
                {t('eventsHub.societyDiscountApplied', 'Up to 20% Society Discount Applied')}
              </span>
            </div>

            <form onSubmit={handleBookEvent}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--gradient-primary, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%))' }}
              >
                <HiOutlineCheckCircle /> {t('eventsHub.bookCompleteEvent', 'Book Complete Event Package')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Vendor Preview Modal */}
      {activeVendorDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card animate-scale-in" style={{
            width: '100%',
            maxWidth: '540px',
            background: 'white',
            border: '1.5px solid var(--primary-200)',
            borderRadius: 'var(--radius-xl)',
            padding: '30px',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            {/* Close button */}
            <button 
              type="button" 
              onClick={() => setActiveVendorKey(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'var(--gray-100)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--gray-600)',
                transition: 'all 0.15s'
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{
                background: 'var(--primary-100)',
                color: 'var(--primary-700)',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {t('eventsHub.verifiedVendorPartner', 'Verified Vendor Partner')}
              </span>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--navy-800)', fontWeight: 900, marginTop: '8px', marginBottom: '4px' }}>
                {activeVendorDetail.title}
              </h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
                <span style={{ color: '#eab308', fontWeight: 800 }}>{activeVendorDetail.rating}</span>
                <span>•</span>
                <span>Partner: <strong>{activeVendorDetail.expert}</strong></span>
              </div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Dynamic Action / Scale Indicator */}
              <div style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)', fontSize: '0.75rem', color: 'var(--primary-800)', fontWeight: 700 }}>
                {t('eventsHub.autoScaledConfig', '⚡ Auto-Scaled to your Configuration')}: <strong>{guestsCount} {t('eventsHub.expectedGuests', 'Expected Guests')}</strong>
              </div>

              {/* Experience description */}
              <div style={{ background: 'var(--gray-50)', padding: '12px 16px', borderRadius: 'var(--radius-md)', borderLeft: '3.5px solid var(--primary-500)' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-800)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  {t('eventsHub.vendorProfileExp', 'Vendor Profile & Experience')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                  {activeVendorDetail.experience}
                </p>
              </div>

              {/* What the vendor is bringing (Dynamic Equipment & Crew Checklist) */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>
                  {t('eventsHub.equipmentVendorBringing', '📋 Equipment & Services Vendor is Bringing:')}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeVendorDetail.included.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.8rem', color: 'var(--gray-650)', lineHeight: 1.35 }}>
                      <span style={{ color: 'var(--primary-600)', fontWeight: 900, marginTop: '1px' }}>✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Portfolio Showcase */}
              <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '14px' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '4px' }}>
                  {t('eventsHub.portfolioSpotlight', '🌟 Portfolio Spotlight:')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', lineHeight: 1.4 }}>
                  {activeVendorDetail.portfolio}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => setActiveVendorKey(null)}
                style={{ padding: '8px 24px', fontSize: '0.85rem' }}
              >
                {t('eventsHub.gotItThanks', 'Got It, Thanks!')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventsHub;
