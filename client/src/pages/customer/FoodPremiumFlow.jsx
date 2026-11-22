import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineFire,
  HiOutlineCake,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineCheckBadge,
  HiOutlineArrowRight,
  HiOutlineHeart,
  HiOutlineStar,
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineBolt,
  HiOutlineCurrencyRupee
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import '../Dashboard.css';
import './CustomerPages.css';

const FoodPremiumFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const flowType = searchParams.get('type'); // bbq, baking, kitchen-clean

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ─────────────────────────────────────────────────────────────
  // 1. BBQ STATE
  // ─────────────────────────────────────────────────────────────
  const [bbqGuests, setBbqGuests] = useState(8);
  const [bbqEventType, setBbqEventType] = useState('Evening Sundowner (05:00 PM - 09:00 PM)');
  const [bbqEventDate, setBbqEventDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [bbqVenueType, setBbqVenueType] = useState('Private Backyard Lawn');
  const [bbqAddress, setBbqAddress] = useState('Bunglow 14, Orchid Greens, South Bopal');
  const [bbqDietType, setBbqDietType] = useState('Mixed'); // Veg, Non-Veg, Mixed
  const [bbqSpiceLevel, setBbqSpiceLevel] = useState('Medium Tandoori Tangy');
  const [bbqSelectedItems, setBbqSelectedItems] = useState([
    'p-paneer', 'm-mush', 'c-tikka', 'm-seekh', 'c-corn'
  ]);
  const [bbqAddons, setBbqAddons] = useState(['mocktail-bar']);
  const [bbqSpecialNotes, setBbqSpecialNotes] = useState('');

  const BBQ_SKEWER_MENU = [
    // Veg items
    { id: 'p-paneer', category: 'veg', name: 'Peri-Peri Malai Paneer Tikka', desc: 'Fresh malai paneer cubes with bell peppers & spicy citrus glaze', badge: 'Crowd Favorite' },
    { id: 'm-mush', category: 'veg', name: 'Smoked Herb Mushrooms & Tomatoes', desc: 'Plump button mushrooms marinated in olive oil, garlic & fresh herbs', badge: 'Gourmet' },
    { id: 'c-corn', category: 'veg', name: 'Charred Honey-Butter Pineapple & Corn', desc: 'Sweet pineapple spears with butter-charred sweet corn cobs', badge: 'Sweet & Smoky' },
    { id: 'a-capsicum', category: 'veg', name: 'Achari Stuffed Baby Capsicum', desc: 'Zesty pickling spice filling inside flame-blistered baby bell peppers', badge: 'Tangy' },
    { id: 's-chaap', category: 'veg', name: 'Tandoori Soya Chaap Skewers', desc: 'Juicy layered soya chaap in rich tandoori smoked yogurt masala', badge: 'High Protein' },
    { id: 'b-potato', category: 'veg', name: 'Crispy Rosemary Flame-Roasted Potatoes', desc: 'Herb-crusted baby potatoes flame-roasted over glowing charcoal', badge: 'Crispy' },
    // Non-Veg items
    { id: 'c-tikka', category: 'nonveg', name: 'Hickory-Smoked Chicken Tikka', desc: 'Tender boneless thigh morsels smoked over organic hickory wood', badge: 'Chef Special' },
    { id: 'm-seekh', category: 'nonveg', name: 'Awadhi Mutton Seekh Kebabs', desc: 'Spiced minced lamb infused with saffron, mint & royal aromatic spices', badge: 'Signature' },
    { id: 'f-tikka', category: 'nonveg', name: 'Amritsari River Sole Fish Skewers', desc: 'Delicate river sole fillet in ajwain & mustard spiced yogurt batter', badge: 'Seafood' },
    { id: 'c-wings', category: 'nonveg', name: 'Peri-Peri Charred Chicken Wings', desc: 'Crispy skin wings tossed in house smoky African birds eye glaze', badge: 'Fiery' },
    { id: 'p-prawns', category: 'nonveg', name: 'Garlic Herb Jumbo Prawn Skewers', desc: 'Butterflied tiger prawns basted with herb butter and charred lemon', badge: 'Premium' }
  ];

  const BBQ_ADDONS_LIST = [
    { id: 'mocktail-bar', name: 'Live Mocktail & Beverage Counter', price: 1499, desc: 'Trained bartender serving Fresh Mojitos, Smoked Ice Tea & Shakers' },
    { id: 'fairy-lights', name: 'Terrace Fairy Lights & Bluetooth Audio', price: 999, desc: 'Ambient warm fairy lighting & portable party sound setup' },
    { id: 'table-server', name: 'Dedicated Table Butler / Running Server', price: 899, desc: 'Professional server to pass hot skewers directly to seated guests' },
    { id: 'extra-chef', name: 'Second Master Pitmaster Chef', price: 1199, desc: 'Recommended for fast continuous grilling for gatherings above 15 guests' }
  ];

  // ─────────────────────────────────────────────────────────────
  // 2. BAKING STATE
  // ─────────────────────────────────────────────────────────────
  const [bakingCourse, setBakingCourse] = useState('Classic French Macarons & Choux Pastry');
  const [bakingFormat, setBakingFormat] = useState('Duo / Couple Baking Date (2 Persons)');
  const [bakingOvenType, setBakingOvenType] = useState('OTG (Oven Toaster Griller)');
  const [bakingDietConstraint, setBakingDietConstraint] = useState('100% Eggless (Strict)');
  const [bakingDate, setBakingDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [bakingTimeSlot, setBakingTimeSlot] = useState('Morning Masterclass (10:30 AM - 01:30 PM)');
  const [bakingStudentNames, setBakingStudentNames] = useState('Pooja & Rahul');
  const [bakingAddress, setBakingAddress] = useState('Flat 402, Sunshine Apartments, Bopal');
  const [bakingSkillLevel, setBakingSkillLevel] = useState('Beginner / Enthusiast');
  const [bakingAddons, setBakingAddons] = useState(['toolkit-keep']);

  const BAKING_COURSES = [
    {
      id: 'macarons',
      name: 'Classic French Macarons & Choux Pastry',
      duration: '3.5 Hours',
      basePrice: 3499,
      badge: 'Bestseller',
      desc: 'Master the delicate macaronage technique, smooth shells with ruffled feet, Belgian ganache, and golden cream puffs.'
    },
    {
      id: 'sourdough',
      name: 'Artisan Sourdough & Crusty Focaccia',
      duration: '3.0 Hours',
      basePrice: 2999,
      badge: 'Heritage',
      desc: 'Learn wild starter culture maintenance, high-hydration dough stretch & folds, and stunning floral focaccia scoring.'
    },
    {
      id: 'layer-cakes',
      name: 'Celebration Layer Cakes & Sharp Edges',
      duration: '3.0 Hours',
      basePrice: 3299,
      badge: 'Decorating Master',
      desc: 'Bake tall moist sponge cakes, learn structural crumb coating, silky Swiss meringue buttercream, and razor-sharp edges.'
    },
    {
      id: 'kids-fun',
      name: 'Kids & Family Cupcake & Cookie Fun',
      duration: '2.0 Hours',
      basePrice: 2499,
      badge: 'Family Fun',
      desc: 'Child-safe hands-on baking with fun fondant animal modeling, rainbow swirl piping, and gourmet sprinkles.'
    },
    {
      id: 'eggless-vegan',
      name: 'Gourmet Eggless & Vegan Desserts',
      duration: '2.5 Hours',
      basePrice: 2799,
      badge: 'Pure Plant-Based',
      desc: '100% egg-free and dairy-free masterclass: dark chocolate truffle tarts, aquafaba mousse, and fudgy vegan brownies.'
    }
  ];

  const BAKING_ADDONS_LIST = [
    { id: 'toolkit-keep', name: "Professional 12-Piece Baker's Tool Kit to Keep", price: 1299, desc: 'Alloy turntable, offset spatulas, stainless steel piping nozzles, silicone mat & bench scraper' },
    { id: 'chef-apron', name: "Custom Embroidered Baker's Apron with Your Name", price: 599, desc: 'Heavy canvas chef apron with custom name embroidery and adjustable brass buckles' },
    { id: 'treat-hamper', name: 'Luxury Belgian Couverture Gift Hamper', price: 799, desc: 'Gift tin with Callebaut chocolate blocks, Madagascar vanilla beans & baking pearls' }
  ];

  // ─────────────────────────────────────────────────────────────
  // 3. KITCHEN CLEAN STATE
  // ─────────────────────────────────────────────────────────────
  const [cleanKitchenSize, setCleanKitchenSize] = useState('Standard Modular Kitchen (90 - 180 sq ft)');
  const [cleanCurrentCondition, setCleanCurrentCondition] = useState('Moderate Cooking Grease & Dust');
  const [cleanApplianceAddons, setCleanApplianceAddons] = useState(['chimney', 'fridge']);
  const [cleanPantryTier, setCleanPantryTier] = useState('Aesthetic Pantry Makeover & Decanting');
  const [cleanDate, setCleanDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [cleanTimeSlot, setCleanTimeSlot] = useState('Morning Fresh (08:30 AM - 12:30 PM)');
  const [cleanAddress, setCleanAddress] = useState('Flat 402, Sunshine Apartments, Bopal');
  const [cleanSpecialNotes, setCleanSpecialNotes] = useState('Modular acrylic cabinets; please use non-scratch pads.');

  const KITCHEN_SIZES = [
    {
      id: 'small',
      name: 'Compact Apartment Kitchen (< 90 sq ft)',
      desc: 'Ideal for 1 BHK or studio apartments. Includes 2 hygiene specialists for ~2.5 hours.',
      basePrice: 1999
    },
    {
      id: 'medium',
      name: 'Standard Modular Kitchen (90 - 180 sq ft)',
      desc: 'Standard 2-3 BHK home kitchen with overhead cabinets, sink area & exhaust zone. 2 specialists for ~3.5 hours.',
      basePrice: 2999
    },
    {
      id: 'large',
      name: 'Large Luxury Villa / Open Kitchen (180 - 300+ sq ft)',
      desc: 'Extensive kitchen with kitchen island, pantry room & heavy utility balcony. 3 specialists for ~4.5 hours.',
      basePrice: 4499
    }
  ];

  const CLEAN_APPLIANCE_LIST = [
    { id: 'chimney', name: 'Chimney Deep Degreasing & Baffle Ultrasonic Soak', price: 599, desc: 'Internal blower wheel degreasing, carbon oil tray flush & baffle filter power steam wash' },
    { id: 'fridge', name: 'Inside Refrigerator Defrost & Sanitization', price: 499, desc: 'Complete shelf removal, anti-microbial wipe, gasket mold eradication & deodorizing spray' },
    { id: 'microwave', name: 'Microwave & OTG Baked-Grease Steam Scrub', price: 399, desc: 'High-temp steam softening of baked grease splatters and turntable descaling' },
    { id: 'dishwasher', name: 'Dishwasher Deep Descaling & Sump Filter Flush', price: 349, desc: 'Hard water limescale removal, internal spray arm cleaning & drainage filter clearing' },
    { id: 'exhaust-window', name: 'Exhaust Fan & Window Mesh Degreasing', price: 299, desc: 'Removal of sticky oil grime from exhaust blades and wire mosquito mesh' }
  ];

  // ─────────────────────────────────────────────────────────────
  // FLOW VALIDATION
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!['bbq', 'baking', 'kitchen-clean'].includes(flowType)) {
      navigate('/customer/food-kitchen');
    }
  }, [flowType, navigate]);

  // ─────────────────────────────────────────────────────────────
  // PRICING CALCULATIONS
  // ─────────────────────────────────────────────────────────────
  const calcBbqTotal = () => {
    // Base covers up to 6 guests
    const baseRate = 3499;
    const extraGuests = Math.max(0, bbqGuests - 6);
    const guestAddon = extraGuests * 350;
    const addonsTotal = bbqAddons.reduce((sum, id) => {
      const match = BBQ_ADDONS_LIST.find(a => a.id === id);
      return sum + (match ? match.price : 0);
    }, 0);
    const subtotal = baseRate + guestAddon + addonsTotal;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    return { baseRate, guestAddon, addonsTotal, subtotal, gst, total };
  };

  const calcBakingTotal = () => {
    const selectedCourseObj = BAKING_COURSES.find(c => c.name === bakingCourse) || BAKING_COURSES[0];
    const basePrice = selectedCourseObj.basePrice;
    let formatFee = 0;
    if (bakingFormat.includes('Couple') || bakingFormat.includes('Duo')) formatFee = 600;
    if (bakingFormat.includes('Family') || bakingFormat.includes('Squad')) formatFee = 1400;

    let ovenFee = 0;
    if (bakingOvenType.includes('Portable')) ovenFee = 499;

    const addonsTotal = bakingAddons.reduce((sum, id) => {
      const match = BAKING_ADDONS_LIST.find(a => a.id === id);
      return sum + (match ? match.price : 0);
    }, 0);

    const subtotal = basePrice + formatFee + ovenFee + addonsTotal;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    return { basePrice, formatFee, ovenFee, addonsTotal, subtotal, gst, total };
  };

  const calcCleanTotal = () => {
    const sizeObj = KITCHEN_SIZES.find(s => s.name === cleanKitchenSize) || KITCHEN_SIZES[1];
    const basePrice = sizeObj.basePrice;

    const applianceTotal = cleanApplianceAddons.reduce((sum, id) => {
      const match = CLEAN_APPLIANCE_LIST.find(a => a.id === id);
      return sum + (match ? match.price : 0);
    }, 0);

    const pantryFee = cleanPantryTier.includes('Aesthetic') ? 999 : 0;
    const subtotal = basePrice + applianceTotal + pantryFee;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    return { basePrice, applianceTotal, pantryFee, subtotal, gst, total };
  };

  // ─────────────────────────────────────────────────────────────
  // STEP HANDLING & FINAL CHECKOUT
  // ─────────────────────────────────────────────────────────────
  const maxSteps = 4;

  const handleNext = () => {
    setErrorMsg('');

    if (flowType === 'bbq') {
      if (step === 1) {
        if (!bbqAddress.trim()) return setErrorMsg('Please enter your venue address or society name.');
        if (!bbqEventDate) return setErrorMsg('Please choose your event date.');
      }
      if (step === 2) {
        if (bbqSelectedItems.length === 0) return setErrorMsg('Please select at least 2 skewered BBQ items for the live grill.');
      }
    } else if (flowType === 'baking') {
      if (step === 1) {
        if (!bakingCourse) return setErrorMsg('Please select a masterclass course.');
      }
      if (step === 2) {
        if (!bakingAddress.trim()) return setErrorMsg('Please enter your home address where the class will be conducted.');
        if (!bakingDate) return setErrorMsg('Please select the date for the class.');
      }
      if (step === 3) {
        if (!bakingStudentNames.trim()) return setErrorMsg('Please enter student name(s) for the signed masterclass certificate.');
      }
    } else if (flowType === 'kitchen-clean') {
      if (step === 1) {
        if (!cleanAddress.trim()) return setErrorMsg('Please enter your home address or apartment number.');
      }
      if (step === 3) {
        if (!cleanDate) return setErrorMsg('Please choose your preferred deep cleaning date.');
      }
    }

    if (step < maxSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      finalizeBooking();
    }
  };

  const finalizeBooking = () => {
    setLoading(true);
    setTimeout(() => {
      let serviceName = '';
      let price = 0;
      let queryParams = '';

      if (flowType === 'bbq') {
        const { total } = calcBbqTotal();
        price = total;
        serviceName = `Backyard BBQ Live Grill: ${bbqGuests} Guests (${bbqDietType} • ${bbqVenueType})`;
        queryParams = `&guests=${bbqGuests}&diet=${encodeURIComponent(bbqDietType)}&venue=${encodeURIComponent(bbqVenueType)}&eventDate=${encodeURIComponent(bbqEventDate)}&slot=${encodeURIComponent(bbqEventType)}&address=${encodeURIComponent(bbqAddress)}&spiceLevel=${encodeURIComponent(bbqSpiceLevel)}`;
      } else if (flowType === 'baking') {
        const { total } = calcBakingTotal();
        price = total;
        serviceName = `In-Home Baking Class: ${bakingCourse} (${bakingFormat})`;
        queryParams = `&course=${encodeURIComponent(bakingCourse)}&format=${encodeURIComponent(bakingFormat)}&diet=${encodeURIComponent(bakingDietConstraint)}&oven=${encodeURIComponent(bakingOvenType)}&classDate=${encodeURIComponent(bakingDate)}&slot=${encodeURIComponent(bakingTimeSlot)}&studentNames=${encodeURIComponent(bakingStudentNames)}&address=${encodeURIComponent(bakingAddress)}`;
      } else if (flowType === 'kitchen-clean') {
        const { total } = calcCleanTotal();
        price = total;
        serviceName = `Kitchen & Pantry Deep Clean: ${cleanKitchenSize}`;
        queryParams = `&size=${encodeURIComponent(cleanKitchenSize)}&appliances=${encodeURIComponent(cleanApplianceAddons.join(','))}&pantryTier=${encodeURIComponent(cleanPantryTier)}&cleanDate=${encodeURIComponent(cleanDate)}&slot=${encodeURIComponent(cleanTimeSlot)}&address=${encodeURIComponent(cleanAddress)}`;
      }

      navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&category=Food%20%26%20Kitchen&price=${price}${queryParams}`);
    }, 1000);
  };

  // ─────────────────────────────────────────────────────────────
  // THEME CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  const getThemeInfo = () => {
    switch (flowType) {
      case 'bbq':
        return {
          title: 'Backyard BBQ Live Grill Setup',
          subtitle: 'Live Pitmaster, Fresh Organic Lump Coal & Zero-Mess Clean-Up',
          icon: <HiOutlineFire size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          color: '#ea580c',
          bgSoft: '#fff7ed',
          borderActive: '#ea580c',
          shadowActive: '0 8px 24px rgba(234, 88, 12, 0.2)'
        };
      case 'baking':
        return {
          title: 'In-Home Baking Masterclass',
          subtitle: 'Private 5-Star Pastry Chef, Premium Ingredients & Certified Coaching',
          icon: <HiOutlineCake size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
          color: '#db2777',
          bgSoft: '#fdf2f8',
          borderActive: '#db2777',
          shadowActive: '0 8px 24px rgba(219, 39, 119, 0.2)'
        };
      case 'kitchen-clean':
        return {
          title: 'Kitchen & Pantry Deep Sanitization',
          subtitle: '140°C High-Pressure Steam Degreasing & Food-Safe Bio-Enzymatic Clean',
          icon: <HiOutlineSparkles size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
          color: '#0ea5e9',
          bgSoft: '#f0f9ff',
          borderActive: '#0ea5e9',
          shadowActive: '0 8px 24px rgba(14, 165, 233, 0.2)'
        };
      default:
        return { title: 'Service', subtitle: '', icon: null, gradient: '', color: '#ea580c', bgSoft: '#fff7ed', borderActive: '#ea580c', shadowActive: '' };
    }
  };

  const theme = getThemeInfo();

  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '850px', alignSelf: 'center', marginTop: '20px' }}>
        
        {/* Navigation & Header */}
        <button
          onClick={() => navigate('/customer/food-kitchen')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'var(--navy-700)', fontWeight: 800, fontSize: '0.85rem',
            background: 'white', border: '1px solid var(--gray-200)', cursor: 'pointer', marginBottom: '20px',
            padding: '8px 18px', borderRadius: '30px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}
        >
          <HiOutlineArrowLeft /> Back to Food & Kitchen Hub
        </button>

        {/* Hero Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 45px -12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.06)',
          marginBottom: '24px'
        }}>
          <div style={{
            background: theme.gradient,
            padding: '36px 30px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '16px', borderRadius: '20px', display: 'flex',
              backdropFilter: 'blur(6px)'
            }}>
              {theme.icon}
            </div>
            <div style={{ zIndex: 1 }}>
              <div style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 800, background: 'rgba(255,255,255,0.25)', padding: '3px 10px', borderRadius: '12px', marginBottom: '6px', letterSpacing: '0.5px' }}>
                SERVE CIRCLE PREMIUM CULINARY
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>{theme.title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '0.9rem', margin: '6px 0 0 0', fontWeight: 500 }}>
                {theme.subtitle}
              </p>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div style={{ padding: '22px 30px 16px 30px', borderBottom: '1px solid var(--gray-100)', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: theme.color, background: theme.bgSoft, padding: '3px 10px', borderRadius: '12px', border: `1px solid ${theme.color}33` }}>
                  Step {step} of {maxSteps}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                  {flowType === 'bbq' && (
                    step === 1 ? 'Gathering Scale & Venue' :
                    step === 2 ? 'Curate Marinades & Skewers' :
                    step === 3 ? 'Hardware, Crew & Add-ons' : 'Booking Review & Pricing'
                  )}
                  {flowType === 'baking' && (
                    step === 1 ? 'Masterclass Course & Format' :
                    step === 2 ? 'Kitchen Oven & Schedule' :
                    step === 3 ? 'Chef Kit & Keepsakes' : 'Review & Certificate Details'
                  )}
                  {flowType === 'kitchen-clean' && (
                    step === 1 ? 'Kitchen Size & Condition' :
                    step === 2 ? 'Appliance Degreasing Add-ons' :
                    step === 3 ? 'Pantry & Food-Safe Steam' : 'Inspection Checklist & Review'
                  )}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-500)' }}>
                {Math.round((step / maxSteps) * 100)}% Completed
              </span>
            </div>
            <div style={{ width: '100%', height: '7px', background: 'var(--gray-200)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(step / maxSteps) * 100}%`,
                background: theme.gradient,
                borderRadius: '10px',
                transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
              }}></div>
            </div>
          </div>

          {/* Step Body */}
          <div style={{ padding: '30px' }}>

            {/* ══════════════════════════════════════════════════════
                FLOW 1: BBQ & LIVE GRILL SETUP
            ══════════════════════════════════════════════════════ */}
            {flowType === 'bbq' && (
              <>
                {step === 1 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Event Scale, Venue & Date
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '24px' }}>
                      Configure your party size and outdoor venue. We supply dedicated pitmaster chefs and portable charcoal stations.
                    </p>

                    {/* Guest Count Slider */}
                    <div style={{ background: '#f8fafc', padding: '22px', borderRadius: '18px', border: '1px solid var(--gray-200)', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block' }}>Estimated Guest Count</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Base price covers up to 6 guests; ₹350/extra guest thereafter</span>
                        </div>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: theme.color, background: 'white', padding: '4px 14px', borderRadius: '12px', border: `1px solid ${theme.color}44` }}>
                          {bbqGuests} Guests
                        </span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="35"
                        value={bbqGuests}
                        onChange={(e) => setBbqGuests(Number(e.target.value))}
                        style={{ width: '100%', accentColor: theme.color, height: '8px', cursor: 'pointer' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '8px', fontWeight: 600 }}>
                        <span>4 Guests (Intimate)</span>
                        <span>15 Guests (House Party)</span>
                        <span>35 Guests (Grand Lawn)</span>
                      </div>

                      {/* Crew sizing indication */}
                      <div style={{ marginTop: '16px', padding: '12px 16px', background: 'white', borderRadius: '12px', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>👨‍🍳</span>
                        <div style={{ fontSize: '0.82rem', color: 'var(--navy-800)' }}>
                          <strong>Included Crew: </strong>
                          {bbqGuests <= 8 && '1 Master Pitmaster + 1 Portable Cast-Iron Charcoal Station'}
                          {bbqGuests > 8 && bbqGuests <= 18 && '2 Chefs (1 Master Pitmaster + 1 Assistant) + 2 Grilling Stations'}
                          {bbqGuests > 18 && '3 Chefs + Commercial Charcoal Smoker & Live Buffet Warming Trays'}
                        </div>
                      </div>
                    </div>

                    {/* Venue Type Selection */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '10px' }}>
                        Outdoor Venue Setting
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        {[
                          { id: 'Private Backyard Lawn', icon: '🏡', sub: 'Natural grass / garden' },
                          { id: 'Open Terrace / Rooftop', icon: '🌇', sub: 'High breeze open roof' },
                          { id: 'Open Balcony (Ventilated)', icon: '🏢', sub: 'Apartment high-rise deck' },
                          { id: 'Farmhouse / Poolside Deck', icon: '🏊‍♂️', sub: 'Waterfront / luxury villa' }
                        ].map((v) => (
                          <div
                            key={v.id}
                            onClick={() => setBbqVenueType(v.id)}
                            style={{
                              padding: '14px', borderRadius: '14px',
                              border: `2px solid ${bbqVenueType === v.id ? theme.color : 'var(--gray-200)'}`,
                              background: bbqVenueType === v.id ? theme.bgSoft : 'white',
                              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                            }}
                          >
                            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '4px' }}>{v.icon}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: bbqVenueType === v.id ? theme.color : 'var(--navy-800)', display: 'block' }}>{v.id}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{v.sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Event Slot & Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                          Event Date
                        </label>
                        <input
                          type="date"
                          value={bbqEventDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setBbqEventDate(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 700, fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                          Preferred Live Grill Slot
                        </label>
                        <select
                          value={bbqEventType}
                          onChange={(e) => setBbqEventType(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 700, fontSize: '0.85rem' }}
                        >
                          <option value="Evening Sundowner (05:00 PM - 09:00 PM)">Evening Sundowner (05:00 PM - 09:00 PM)</option>
                          <option value="Lunch Sizzle (12:00 PM - 04:00 PM)">Lunch Sizzle (12:00 PM - 04:00 PM)</option>
                          <option value="Late-Night Party (08:30 PM - 12:30 AM)">Late-Night Party (08:30 PM - 12:30 AM)</option>
                        </select>
                      </div>
                    </div>

                    {/* Venue Address */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                        Venue Address / Bungalow Details
                      </label>
                      <input
                        type="text"
                        value={bbqAddress}
                        placeholder="e.g. Bungalow 14, Orchid Greens, South Bopal"
                        onChange={(e) => setBbqAddress(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 600, fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Curate Signature Skewers & Marinades
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
                      Select items for live charcoal grilling. Freshly pre-marinated in house spices and chilled for peak flavor.
                    </p>

                    {/* Diet Toggle */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'Pure Veg (Jain available)', label: '🌱 Pure Veg Platter' },
                        { id: 'Non-Veg Classic', label: '🍗 Non-Veg Feast' },
                        { id: 'Mixed', label: '✨ Mixed (Veg + Non-Veg)' }
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setBbqDietType(d.id)}
                          style={{
                            padding: '10px 18px', borderRadius: '30px', fontWeight: 800, fontSize: '0.85rem',
                            border: `2px solid ${bbqDietType === d.id ? theme.color : 'var(--gray-200)'}`,
                            background: bbqDietType === d.id ? theme.bgSoft : 'white',
                            color: bbqDietType === d.id ? theme.color : 'var(--navy-700)',
                            cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    {/* Spice Profile */}
                    <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--gray-200)', marginBottom: '22px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '8px' }}>
                        🌶️ Spice & Herb Profile
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        {[
                          { id: 'Mild European Herb', desc: 'Garlic butter, oregano & crushed rosemary' },
                          { id: 'Medium Tandoori Tangy', desc: 'Balanced roasted cumin, lemon & smoked paprika' },
                          { id: 'Fiery Desi Angaar', desc: 'Extra spicy crushed Guntur chilli & black pepper' }
                        ].map((sp) => (
                          <div
                            key={sp.id}
                            onClick={() => setBbqSpiceLevel(sp.id)}
                            style={{
                              padding: '10px 14px', borderRadius: '12px',
                              border: `1.5px solid ${bbqSpiceLevel === sp.id ? theme.color : 'var(--gray-300)'}`,
                              background: bbqSpiceLevel === sp.id ? theme.bgSoft : 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: bbqSpiceLevel === sp.id ? theme.color : 'var(--navy-800)', display: 'block' }}>{sp.id}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{sp.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skewer Selection Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '22px' }}>
                      {BBQ_SKEWER_MENU
                        .filter(item => {
                          if (bbqDietType.includes('Pure Veg')) return item.category === 'veg';
                          if (bbqDietType === 'Non-Veg Classic') return item.category === 'nonveg';
                          return true;
                        })
                        .map((item) => {
                          const isSelected = bbqSelectedItems.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isSelected) {
                                  setBbqSelectedItems(bbqSelectedItems.filter(i => i !== item.id));
                                } else {
                                  setBbqSelectedItems([...bbqSelectedItems, item.id]);
                                }
                              }}
                              style={{
                                padding: '16px', borderRadius: '14px',
                                border: `2px solid ${isSelected ? theme.color : 'var(--gray-200)'}`,
                                background: isSelected ? theme.bgSoft : 'white',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <span style={{
                                    fontSize: '0.7rem', fontWeight: 800,
                                    color: item.category === 'veg' ? '#16a34a' : '#ea580c',
                                    background: item.category === 'veg' ? '#dcfce7' : '#ffedd5',
                                    padding: '2px 8px', borderRadius: '10px'
                                  }}>
                                    {item.category === 'veg' ? '🌱 VEG' : '🍗 NON-VEG'} • {item.badge}
                                  </span>
                                  <div style={{
                                    width: '22px', height: '22px', borderRadius: '50%',
                                    border: `2px solid ${isSelected ? theme.color : 'var(--gray-300)'}`,
                                    background: isSelected ? theme.color : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                  }}>
                                    {isSelected && <HiOutlineCheckCircle size={16} />}
                                  </div>
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block', marginBottom: '4px' }}>
                                  {item.name}
                                </span>
                                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', margin: 0, lineHeight: 1.4 }}>
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Included Accompaniments Note */}
                    <div style={{ padding: '14px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>🥗</span>
                      <div style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.4 }}>
                        <strong>Complimentary Accompaniments Included Free:</strong> Fresh Mint Coriander Chutney, Smoked Garlic Toum, Fiery Peri-Peri Dip, Charred Lemon Wedges & Toasted Butter Pav basket.
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Hardware, Clean-Up & Party Add-ons
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
                      ServeCircle arrives fully equipped with commercial-grade portable grills and eco-friendly tableware.
                    </p>

                    {/* Hardware Guarantee Box */}
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <HiOutlineCheckBadge size={22} color="#ea580c" />
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#9a3412' }}>
                          What ServeCircle Pitmasters Bring (100% Included)
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.8rem', color: '#7c2d12' }}>
                        <div>🔥 Heavy-duty Cast Iron Charcoal Grill</div>
                        <div>🪵 Low-smoke Organic Coconut Lump Coal</div>
                        <div>🍢 Stainless Steel Skewers & Chef Knives</div>
                        <div>🍽️ Biodegradable Palm-Leaf Plates & Cutlery</div>
                        <div>🧯 Safety Fire Blanket & Water Spray</div>
                        <div>✨ <strong>100% Post-Party Ash Cleanup Guarantee</strong></div>
                      </div>
                    </div>

                    {/* Party Addons */}
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '12px' }}>
                      Optional Party Upgrades & Add-ons
                    </label>
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                      {BBQ_ADDONS_LIST.map((addon) => {
                        const isChecked = bbqAddons.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => {
                              if (isChecked) {
                                setBbqAddons(bbqAddons.filter(a => a !== addon.id));
                              } else {
                                setBbqAddons([...bbqAddons, addon.id]);
                              }
                            }}
                            style={{
                              padding: '16px', borderRadius: '14px',
                              border: `2px solid ${isChecked ? theme.color : 'var(--gray-200)'}`,
                              background: isChecked ? theme.bgSoft : 'white',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{
                                width: '24px', height: '24px', borderRadius: '6px',
                                border: `2px solid ${isChecked ? theme.color : 'var(--gray-300)'}`,
                                background: isChecked ? theme.color : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                              }}>
                                {isChecked && <HiOutlineCheckCircle size={18} />}
                              </div>
                              <div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>
                                  {addon.name}
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                                  {addon.desc}
                                </span>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.color, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                              +₹{addon.price}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                        Special Dietary / Host Notes (Optional)
                      </label>
                      <textarea
                        rows="2"
                        value={bbqSpecialNotes}
                        placeholder="e.g. Need 4 pure Jain skewers; please bring mild spice for young kids; park chef van near visitor parking."
                        onChange={(e) => setBbqSpecialNotes(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 500, fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Review & Confirm BBQ Reservation
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
                      Double check your party details and transparent pricing breakdown before scheduling your pitmaster.
                    </p>

                    {/* Summary Card */}
                    <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '22px', marginBottom: '22px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>GUEST COUNT</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>{bbqGuests} Guests</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>VENUE & SLOT</span>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>{bbqVenueType}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{bbqEventDate} • {bbqEventType.split('(')[0]}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>MENU PROFILE</span>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>{bbqDietType}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{bbqSpiceLevel}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '14px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '8px' }}>
                          Selected Grilling Items ({bbqSelectedItems.length}):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {bbqSelectedItems.map(id => {
                            const match = BBQ_SKEWER_MENU.find(i => i.id === id);
                            return match ? (
                              <span key={id} style={{ fontSize: '0.75rem', fontWeight: 700, background: theme.bgSoft, color: theme.color, padding: '4px 10px', borderRadius: '12px', border: `1px solid ${theme.color}33` }}>
                                {match.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Transparent Price Breakdown */}
                    {(() => {
                      const { baseRate, guestAddon, addonsTotal, subtotal, gst, total } = calcBbqTotal();
                      return (
                        <div style={{ background: '#f8fafc', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '20px', marginBottom: '22px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block', marginBottom: '14px' }}>
                            Itemized Pricing Summary
                          </span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                            <span>Base BBQ Pitmaster & Grill Setup (up to 6 guests)</span>
                            <span style={{ fontWeight: 700 }}>₹{baseRate}</span>
                          </div>
                          {guestAddon > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                              <span>Extra Guests Headcount ({bbqGuests - 6} × ₹350)</span>
                              <span style={{ fontWeight: 700 }}>+₹{guestAddon}</span>
                            </div>
                          )}
                          {addonsTotal > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                              <span>Selected Party Upgrades ({bbqAddons.length})</span>
                              <span style={{ fontWeight: 700 }}>+₹{addonsTotal}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                            <span>GST (18% Catering & Live Cooking)</span>
                            <span style={{ fontWeight: 700 }}>₹{gst}</span>
                          </div>
                          <div style={{ borderTop: '2px dashed var(--gray-300)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--navy-900)' }}>Total Payable</span>
                            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{total}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {/* ══════════════════════════════════════════════════════
                FLOW 2: IN-HOME BAKING MASTERCLASS
            ══════════════════════════════════════════════════════ */}
            {flowType === 'baking' && (
              <>
                {step === 1 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Select Masterclass Course & Format
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '22px' }}>
                      Choose your specialized baking curriculum. Our 5-star hotel pastry chefs teach private, hands-on masterclasses right at your home counter.
                    </p>

                    {/* Courses List */}
                    <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
                      {BAKING_COURSES.map((course) => {
                        const isSelected = bakingCourse === course.name;
                        return (
                          <div
                            key={course.id}
                            onClick={() => setBakingCourse(course.name)}
                            style={{
                              padding: '18px', borderRadius: '16px',
                              border: `2px solid ${isSelected ? theme.color : 'var(--gray-200)'}`,
                              background: isSelected ? theme.bgSoft : 'white',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              boxShadow: isSelected ? theme.shadowActive : '0 2px 6px rgba(0,0,0,0.02)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ paddingRight: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#be185d', background: '#fce7f3', padding: '2px 8px', borderRadius: '12px' }}>
                                  {course.badge} • {course.duration}
                                </span>
                              </div>
                              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block', marginBottom: '4px' }}>
                                {course.name}
                              </span>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0, lineHeight: 1.4 }}>
                                {course.desc}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '90px' }}>
                              <span style={{ fontSize: '1.15rem', fontWeight: 900, color: theme.color, display: 'block' }}>
                                ₹{course.basePrice}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>all ingredients incl.</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Participant Format */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '10px' }}>
                        Session Format & Participant Count
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        {[
                          { id: 'Solo 1-on-1 Master Mentorship (1 Person)', icon: '👩‍🍳', sub: 'Deep personal guidance', extra: 'Base' },
                          { id: 'Duo / Couple Baking Date (2 Persons)', icon: '💑', sub: 'Romantic fun date-night', extra: '+₹600' },
                          { id: 'Family / Squad Hands-on Workshop (Up to 4 Persons)', icon: '👨‍👩‍👧‍👦', sub: 'Kids & friends celebration', extra: '+₹1,400' }
                        ].map((fmt) => (
                          <div
                            key={fmt.id}
                            onClick={() => setBakingFormat(fmt.id)}
                            style={{
                              padding: '14px', borderRadius: '14px',
                              border: `2px solid ${bakingFormat === fmt.id ? theme.color : 'var(--gray-200)'}`,
                              background: bakingFormat === fmt.id ? theme.bgSoft : 'white',
                              cursor: 'pointer', textAlign: 'center'
                            }}
                          >
                            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '4px' }}>{fmt.icon}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: bakingFormat === fmt.id ? theme.color : 'var(--navy-800)', display: 'block' }}>
                              {fmt.id.split('(')[0]}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', display: 'block' }}>{fmt.sub}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.color, marginTop: '4px', display: 'block' }}>{fmt.extra}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Kitchen Oven, Dietary & Date
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '22px' }}>
                      Tell us about your kitchen setup so the chef calibrates oven temperatures, baking trays, and ingredient formulations.
                    </p>

                    {/* Oven Type */}
                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>
                        Your Kitchen Oven Type
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        {[
                          { id: 'OTG (Oven Toaster Griller)', sub: 'Bajaj, Morphy, Borosil etc.' },
                          { id: 'Convection Microwave Oven', sub: 'Samsung, LG, IFB etc.' },
                          { id: 'Built-in Modular Electric Oven', sub: 'Bosch, Faber, Hafele' },
                          { id: 'Chef to bring Portable Convection Oven (+₹499)', sub: 'Chef brings plug-and-play oven' }
                        ].map((ov) => (
                          <div
                            key={ov.id}
                            onClick={() => setBakingOvenType(ov.id)}
                            style={{
                              padding: '12px 14px', borderRadius: '12px',
                              border: `2px solid ${bakingOvenType === ov.id ? theme.color : 'var(--gray-200)'}`,
                              background: bakingOvenType === ov.id ? theme.bgSoft : 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: bakingOvenType === ov.id ? theme.color : 'var(--navy-800)', display: 'block' }}>
                              {ov.id}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{ov.sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Preference */}
                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>
                        Dietary Formulation
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                        {[
                          { id: '100% Eggless (Strict)', icon: '🟢' },
                          { id: 'Standard Pastry (With Eggs)', icon: '🥚' },
                          { id: 'Vegan / Dairy-Free', icon: '🌱' },
                          { id: 'Gluten-Free Flour Base', icon: '🌾' }
                        ].map((dt) => (
                          <div
                            key={dt.id}
                            onClick={() => setBakingDietConstraint(dt.id)}
                            style={{
                              padding: '12px', borderRadius: '12px',
                              border: `2px solid ${bakingDietConstraint === dt.id ? theme.color : 'var(--gray-200)'}`,
                              background: bakingDietConstraint === dt.id ? theme.bgSoft : 'white',
                              cursor: 'pointer', textAlign: 'center'
                            }}
                          >
                            <span style={{ fontSize: '1.1rem', display: 'block', marginBottom: '2px' }}>{dt.icon}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: bakingDietConstraint === dt.id ? theme.color : 'var(--navy-800)' }}>
                              {dt.id}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date & Slot */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '22px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                          Masterclass Date
                        </label>
                        <input
                          type="date"
                          value={bakingDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setBakingDate(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 700, fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                          Preferred Slot
                        </label>
                        <select
                          value={bakingTimeSlot}
                          onChange={(e) => setBakingTimeSlot(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 700, fontSize: '0.85rem' }}
                        >
                          <option value="Morning Masterclass (10:30 AM - 01:30 PM)">Morning Masterclass (10:30 AM - 01:30 PM)</option>
                          <option value="Afternoon Tea Session (03:00 PM - 06:00 PM)">Afternoon Tea Session (03:00 PM - 06:00 PM)</option>
                          <option value="Weekend Intensive (11:00 AM - 03:00 PM)">Weekend Intensive (11:00 AM - 03:00 PM)</option>
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                        Your Kitchen Address
                      </label>
                      <input
                        type="text"
                        value={bakingAddress}
                        placeholder="e.g. Flat 402, Sunshine Apartments, Bopal"
                        onChange={(e) => setBakingAddress(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 600, fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Chef Kit, Keepsakes & Certificate
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '22px' }}>
                      Everything needed for professional baking is brought by the chef. Add customized aprons or keepsake toolkits.
                    </p>

                    {/* What Chef Brings */}
                    <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <HiOutlineCake size={22} color="#db2777" />
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#9d174d' }}>
                          What Master Chef Brings to Your Kitchen (100% Included)
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.8rem', color: '#831843' }}>
                        <div>🍫 Callebaut Belgian Couverture Chocolate</div>
                        <div>🧈 French Pure Creamery Butter & Madagascar Vanilla</div>
                        <div>🧁 Heavy Rotating Cake Turntable & Offset Spatulas</div>
                        <div>📐 Digital Gram Scales & Pastry Thermometers</div>
                        <div>📖 Laminated Masterclass Recipe Handbook to Keep</div>
                        <div>🎁 Luxury Pastry Gift Boxes with Ribbons for Family</div>
                      </div>
                    </div>

                    {/* Student Names for Certificate */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                        Student Name(s) for Personalized Signed Certificate
                      </label>
                      <input
                        type="text"
                        value={bakingStudentNames}
                        placeholder="e.g. Pooja & Rahul Patel"
                        onChange={(e) => setBakingStudentNames(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 700, fontSize: '0.95rem' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px', display: 'block' }}>
                        We issue official, individually signed ServeCircle Masterclass certificates for each attendee.
                      </span>
                    </div>

                    {/* Add-ons */}
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '12px' }}>
                      Optional Baker's Keepsake Upgrades
                    </label>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {BAKING_ADDONS_LIST.map((addon) => {
                        const isChecked = bakingAddons.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => {
                              if (isChecked) {
                                setBakingAddons(bakingAddons.filter(a => a !== addon.id));
                              } else {
                                setBakingAddons([...bakingAddons, addon.id]);
                              }
                            }}
                            style={{
                              padding: '16px', borderRadius: '14px',
                              border: `2px solid ${isChecked ? theme.color : 'var(--gray-200)'}`,
                              background: isChecked ? theme.bgSoft : 'white',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{
                                width: '24px', height: '24px', borderRadius: '6px',
                                border: `2px solid ${isChecked ? theme.color : 'var(--gray-300)'}`,
                                background: isChecked ? theme.color : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                              }}>
                                {isChecked && <HiOutlineCheckCircle size={18} />}
                              </div>
                              <div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>
                                  {addon.name}
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                                  {addon.desc}
                                </span>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.color, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                              +₹{addon.price}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Review & Confirm Baking Masterclass
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
                      Confirm your class schedule, kitchen setup and transparent itemized breakdown.
                    </p>

                    {/* Summary Box */}
                    <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '22px', marginBottom: '22px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>COURSE</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>{bakingCourse}</span>
                          <span style={{ fontSize: '0.78rem', color: theme.color, fontWeight: 700 }}>{bakingFormat}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>SCHEDULE & VENUE</span>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>{bakingDate}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{bakingTimeSlot}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>OVEN & DIET</span>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>{bakingOvenType.split('(')[0]}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{bakingDietConstraint}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)' }}>
                          🎓 Certificate Recipient(s): <strong>{bakingStudentNames}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    {(() => {
                      const { basePrice, formatFee, ovenFee, addonsTotal, subtotal, gst, total } = calcBakingTotal();
                      return (
                        <div style={{ background: '#f8fafc', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '20px', marginBottom: '22px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block', marginBottom: '14px' }}>
                            Itemized Pricing Summary
                          </span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                            <span>Base Masterclass Course Tuition</span>
                            <span style={{ fontWeight: 700 }}>₹{basePrice}</span>
                          </div>
                          {formatFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                              <span>Format Adjustment ({bakingFormat.split('(')[0]})</span>
                              <span style={{ fontWeight: 700 }}>+₹{formatFee}</span>
                            </div>
                          )}
                          {ovenFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                              <span>Portable Convection Oven Rental</span>
                              <span style={{ fontWeight: 700 }}>+₹{ovenFee}</span>
                            </div>
                          )}
                          {addonsTotal > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                              <span>Keepsake Upgrades & Toolkits ({bakingAddons.length})</span>
                              <span style={{ fontWeight: 700 }}>+₹{addonsTotal}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                            <span>GST (18% Culinary Coaching)</span>
                            <span style={{ fontWeight: 700 }}>₹{gst}</span>
                          </div>
                          <div style={{ borderTop: '2px dashed var(--gray-300)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--navy-900)' }}>Total Payable</span>
                            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{total}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {/* ══════════════════════════════════════════════════════
                FLOW 3: KITCHEN & PANTRY DEEP SANITIZATION
            ══════════════════════════════════════════════════════ */}
            {flowType === 'kitchen-clean' && (
              <>
                {step === 1 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Kitchen Size, Area & Initial Condition
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '22px' }}>
                      Select your kitchen footprint. Our certified deep cleaning crew arrives with industrial 140°C steam generators.
                    </p>

                    {/* Kitchen Size Selection */}
                    <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
                      {KITCHEN_SIZES.map((size) => {
                        const isSelected = cleanKitchenSize === size.name;
                        return (
                          <div
                            key={size.id}
                            onClick={() => setCleanKitchenSize(size.name)}
                            style={{
                              padding: '18px', borderRadius: '16px',
                              border: `2px solid ${isSelected ? theme.color : 'var(--gray-200)'}`,
                              background: isSelected ? theme.bgSoft : 'white',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              boxShadow: isSelected ? theme.shadowActive : '0 2px 6px rgba(0,0,0,0.02)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ paddingRight: '12px' }}>
                              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block', marginBottom: '4px' }}>
                                {size.name}
                              </span>
                              <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0, lineHeight: 1.4 }}>
                                {size.desc}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '85px' }}>
                              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: theme.color, display: 'block' }}>
                                ₹{size.basePrice}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>all equipment incl.</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Condition Assessment */}
                    <div style={{ marginBottom: '22px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>
                        Current Kitchen Grease & Dirt Level
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        {[
                          { id: 'Light Maintenance Wipe', sub: 'Regularly cleaned, light dust' },
                          { id: 'Moderate Cooking Grease & Dust', sub: 'Tadka yellow stains & sticky cabinets' },
                          { id: 'Heavy Post-Festive / Oil Layer', sub: 'Stubborn hardened oil and blackened tiles' },
                          { id: 'Move-in / Move-out Restoration', sub: 'Deep complete rejuvenation' }
                        ].map((c) => (
                          <div
                            key={c.id}
                            onClick={() => setCleanCurrentCondition(c.id)}
                            style={{
                              padding: '12px 14px', borderRadius: '12px',
                              border: `2px solid ${cleanCurrentCondition === c.id ? theme.color : 'var(--gray-200)'}`,
                              background: cleanCurrentCondition === c.id ? theme.bgSoft : 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: cleanCurrentCondition === c.id ? theme.color : 'var(--navy-800)', display: 'block' }}>
                              {c.id}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{c.sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                        Kitchen Address / Flat Details
                      </label>
                      <input
                        type="text"
                        value={cleanAddress}
                        placeholder="e.g. Flat 402, Sunshine Apartments, Bopal"
                        onChange={(e) => setCleanAddress(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 600, fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Heavy Appliance Degreasing Treatments
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '22px' }}>
                      Add specialized high-pressure steam treatments for kitchen appliances that standard maids cannot reach.
                    </p>

                    {/* Appliance List */}
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                      {CLEAN_APPLIANCE_LIST.map((item) => {
                        const isChecked = cleanApplianceAddons.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              if (isChecked) {
                                setCleanApplianceAddons(cleanApplianceAddons.filter(a => a !== item.id));
                              } else {
                                setCleanApplianceAddons([...cleanApplianceAddons, item.id]);
                              }
                            }}
                            style={{
                              padding: '16px', borderRadius: '14px',
                              border: `2px solid ${isChecked ? theme.color : 'var(--gray-200)'}`,
                              background: isChecked ? theme.bgSoft : 'white',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{
                                width: '24px', height: '24px', borderRadius: '6px',
                                border: `2px solid ${isChecked ? theme.color : 'var(--gray-300)'}`,
                                background: isChecked ? theme.color : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                              }}>
                                {isChecked && <HiOutlineCheckCircle size={18} />}
                              </div>
                              <div>
                                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>
                                  {item.name}
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                                  {item.desc}
                                </span>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.color, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                              +₹{item.price}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* High-Temp Steam Note */}
                    <div style={{ padding: '16px 20px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.5rem' }}>💨</span>
                      <div style={{ fontSize: '0.82rem', color: '#0369a1', lineHeight: 1.4 }}>
                        <strong>140°C High-Pressure Steam Sanitization:</strong> Destroys 99.9% of bacteria, dissolves yellow oil without corrosive acids, and sanitizes hidden cockroach nesting spots behind appliances.
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Pantry Makeover, Date & Safety Assurance
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '22px' }}>
                      Choose your pantry organization tier and schedule your deep cleaning shift.
                    </p>

                    {/* Pantry Tier */}
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '10px' }}>
                        Pantry Organization Scope
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                        {[
                          {
                            id: 'Standard Shelf Clean & Discard Expired Items',
                            price: 'Included',
                            desc: 'Wiping cabinet interiors, cleaning bottle exteriors & disposing of expired staples'
                          },
                          {
                            id: 'Aesthetic Pantry Makeover & Decanting',
                            price: '+₹999',
                            desc: 'Full decanting into uniform airtight containers, custom waterproof spice/pulse labels & shelf liners'
                          }
                        ].map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setCleanPantryTier(p.id)}
                            style={{
                              padding: '16px', borderRadius: '14px',
                              border: `2px solid ${cleanPantryTier === p.id ? theme.color : 'var(--gray-200)'}`,
                              background: cleanPantryTier === p.id ? theme.bgSoft : 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: cleanPantryTier === p.id ? theme.color : 'var(--navy-800)' }}>
                                {p.id.split('&')[0]}
                              </span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.color }}>{p.price}</span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', margin: 0, lineHeight: 1.4 }}>
                              {p.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chemical Reassurance Box */}
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px 20px', borderRadius: '14px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <HiOutlineShieldCheck size={20} color="#059669" />
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#065f46' }}>
                          100% Bio-Enzymatic Food-Grade Safe Guarantee
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#047857', margin: 0, lineHeight: 1.4 }}>
                        We strictly use non-acidic, food-safe bio-enzymes. Zero hazardous fumes, completely safe for children, pets, and spice containers.
                      </p>
                    </div>

                    {/* Date & Slot */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '22px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                          Cleaning Date
                        </label>
                        <input
                          type="date"
                          value={cleanDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCleanDate(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 700, fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                          Arrival Slot
                        </label>
                        <select
                          value={cleanTimeSlot}
                          onChange={(e) => setCleanTimeSlot(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 700, fontSize: '0.85rem' }}
                        >
                          <option value="Morning Fresh (08:30 AM - 12:30 PM)">Morning Fresh (08:30 AM - 12:30 PM)</option>
                          <option value="Afternoon Slot (01:30 PM - 05:30 PM)">Afternoon Slot (01:30 PM - 05:30 PM)</option>
                        </select>
                      </div>
                    </div>

                    {/* Special Notes */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '6px' }}>
                        Special Instructions / Material Cautions
                      </label>
                      <input
                        type="text"
                        value={cleanSpecialNotes}
                        placeholder="e.g. Italian quartz countertop; please handle soft-close drawers gently."
                        onChange={(e) => setCleanSpecialNotes(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--gray-300)', fontWeight: 500, fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="animate-fade-in-up">
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
                      Review & Confirm Kitchen Sanitization
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
                      Review your service coverage, appliance treatments and 48-hour re-clean guarantee.
                    </p>

                    {/* Summary Box */}
                    <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '22px', marginBottom: '22px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>KITCHEN SIZE</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>{cleanKitchenSize.split('(')[0]}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Condition: {cleanCurrentCondition}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>SCHEDULE & LOCATION</span>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block' }}>{cleanDate}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{cleanTimeSlot}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>PANTRY TIER</span>
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: theme.color, display: 'block' }}>{cleanPantryTier.split('&')[0]}</span>
                        </div>
                      </div>

                      {cleanApplianceAddons.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '12px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--navy-800)', display: 'block', marginBottom: '6px' }}>
                            Selected Heavy Appliance Steam Treatments:
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {cleanApplianceAddons.map(id => {
                              const match = CLEAN_APPLIANCE_LIST.find(a => a.id === id);
                              return match ? (
                                <span key={id} style={{ fontSize: '0.75rem', fontWeight: 700, background: theme.bgSoft, color: theme.color, padding: '4px 10px', borderRadius: '12px', border: `1px solid ${theme.color}33` }}>
                                  {match.name.split('&')[0]}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 48-Hour Re-Clean Guarantee Badge */}
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '16px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                      <span style={{ fontSize: '1.8rem' }}>🛡️</span>
                      <div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#166534', display: 'block' }}>
                          ServeCircle 48-Hour Zero-Grease Satisfaction Guarantee
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#15803d' }}>
                          If any stubborn oil streak or grease layer remains after completion, our team returns for a free re-scrub within 48 hours.
                        </span>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    {(() => {
                      const { basePrice, applianceTotal, pantryFee, subtotal, gst, total } = calcCleanTotal();
                      return (
                        <div style={{ background: '#f8fafc', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '20px', marginBottom: '22px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)', display: 'block', marginBottom: '14px' }}>
                            Itemized Pricing Summary
                          </span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                            <span>Base Kitchen Steam & Degreasing</span>
                            <span style={{ fontWeight: 700 }}>₹{basePrice}</span>
                          </div>
                          {applianceTotal > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                              <span>Appliance Treatments ({cleanApplianceAddons.length})</span>
                              <span style={{ fontWeight: 700 }}>+₹{applianceTotal}</span>
                            </div>
                          )}
                          {pantryFee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                              <span>Aesthetic Pantry Decanting & Custom Labels</span>
                              <span style={{ fontWeight: 700 }}>+₹{pantryFee}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--navy-700)', marginBottom: '8px' }}>
                            <span>GST (18% Deep Cleaning)</span>
                            <span style={{ fontWeight: 700 }}>₹{gst}</span>
                          </div>
                          <div style={{ borderTop: '2px dashed var(--gray-300)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--navy-900)' }}>Total Payable</span>
                            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{total}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="animate-fade-in-up" style={{ color: '#ef4444', background: '#fef2f2', padding: '14px 18px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' }}>
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            {/* Footer Navigation Buttons */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '14px 22px', fontSize: '0.95rem', fontWeight: 800,
                    background: 'white', color: 'var(--navy-800)', border: '2px solid var(--gray-200)',
                    borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                style={{
                  flex: 1, padding: '15px 24px', fontSize: '1.05rem', fontWeight: 800,
                  background: theme.gradient, color: 'white', border: 'none',
                  borderRadius: '16px', cursor: 'pointer',
                  boxShadow: `0 8px 20px -6px ${theme.color}`,
                  transition: 'transform 0.1s, box-shadow 0.2s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Processing Reservation...' : step === maxSteps ? 'Confirm & Book Experience →' : `Continue to Step ${step + 1} →`}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPremiumFlow;
