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
  HiOutlineStar,
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlineCurrencyRupee
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import '../Dashboard.css';
import './CustomerPages.css';

const FoodPremiumFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const flowType = searchParams.get('type') || 'bbq'; // bbq, baking, kitchen-clean

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

  const BBQ_SKEWER_MENU = [
    { id: 'p-paneer', category: 'veg', name: 'Peri-Peri Malai Paneer Tikka', desc: 'Fresh malai paneer cubes with bell peppers & spicy citrus glaze', badge: 'Crowd Favorite' },
    { id: 'm-mush', category: 'veg', name: 'Smoked Herb Mushrooms & Tomatoes', desc: 'Plump button mushrooms marinated in olive oil, garlic & fresh herbs', badge: 'Gourmet' },
    { id: 'c-corn', category: 'veg', name: 'Charred Honey-Butter Pineapple & Corn', desc: 'Sweet pineapple spears with butter-charred sweet corn cobs', badge: 'Sweet & Smoky' },
    { id: 'a-capsicum', category: 'veg', name: 'Achari Stuffed Baby Capsicum', desc: 'Zesty pickling spice filling inside flame-blistered baby bell peppers', badge: 'Tangy' },
    { id: 's-chaap', category: 'veg', name: 'Tandoori Soya Chaap Skewers', desc: 'Juicy layered soya chaap in rich tandoori smoked yogurt masala', badge: 'High Protein' },
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
  const [cleanApplianceAddons, setCleanApplianceAddons] = useState(['chimney', 'fridge']);
  const [cleanPantryTier, setCleanPantryTier] = useState('Aesthetic Pantry Makeover & Decanting');
  const [cleanDate, setCleanDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [cleanTimeSlot, setCleanTimeSlot] = useState('Morning Fresh (08:30 AM - 12:30 PM)');
  const [cleanAddress, setCleanAddress] = useState('Flat 402, Sunshine Apartments, Bopal');

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

  // Validate flow type
  useEffect(() => {
    if (!['bbq', 'baking', 'kitchen-clean'].includes(flowType)) {
      navigate('/customer/food-kitchen');
    }
  }, [flowType, navigate]);

  // ─────────────────────────────────────────────────────────────
  // PRICING CALCULATIONS
  // ─────────────────────────────────────────────────────────────
  const calcBbqTotal = () => {
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

  const currentTotal = () => {
    if (flowType === 'bbq') return calcBbqTotal().total;
    if (flowType === 'baking') return calcBakingTotal().total;
    return calcCleanTotal().total;
  };

  // ─────────────────────────────────────────────────────────────
  // 2-STEP NAVIGATION & CHECKOUT
  // ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    setErrorMsg('');

    if (step === 1) {
      if (flowType === 'bbq' && bbqSelectedItems.length === 0) {
        return setErrorMsg('Please select at least 2 skewered BBQ items for the live grill.');
      }
      if (flowType === 'baking' && !bakingCourse) {
        return setErrorMsg('Please select a masterclass course theme.');
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 2 validations
      if (flowType === 'bbq') {
        if (!bbqAddress.trim()) return setErrorMsg('Please enter your event venue address or society name.');
        if (!bbqEventDate) return setErrorMsg('Please choose your event date.');
      } else if (flowType === 'baking') {
        if (!bakingAddress.trim()) return setErrorMsg('Please enter your home address where the class will be conducted.');
        if (!bakingDate) return setErrorMsg('Please select the date for the class.');
        if (!bakingStudentNames.trim()) return setErrorMsg('Please enter student name(s) for the signed masterclass certificate.');
      } else if (flowType === 'kitchen-clean') {
        if (!cleanAddress.trim()) return setErrorMsg('Please enter your home address or apartment number.');
        if (!cleanDate) return setErrorMsg('Please choose your preferred deep cleaning date.');
      }
      finalizeBooking();
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step === 2) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/customer/food-kitchen');
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
    }, 700);
  };

  const toggleItem = (list, setList, id) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
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
          borderActive: '#ea580c'
        };
      case 'baking':
        return {
          title: 'In-Home Baking Masterclass',
          subtitle: 'Private 5-Star Pastry Chef, Premium Ingredients & Certified Coaching',
          icon: <HiOutlineCake size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #db2777 0%, #9d174d 100%)',
          color: '#db2777',
          bgSoft: '#fdf2f8',
          borderActive: '#db2777'
        };
      case 'kitchen-clean':
      default:
        return {
          title: 'Kitchen & Pantry Deep Sanitization',
          subtitle: '140°C High-Pressure Steam Degreasing & Food-Safe Bio-Enzymatic Clean',
          icon: <HiOutlineSparkles size={36} color="white" />,
          gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
          color: '#0ea5e9',
          bgSoft: '#f0f9ff',
          borderActive: '#0ea5e9'
        };
    }
  };

  const theme = getThemeInfo();

  return (
    <div className="page-content" style={{ minHeight: '92vh', padding: '20px 16px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '920px', marginTop: '12px' }}>
        
        {/* Top Back Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            onClick={handleBack}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'white',
              border: '1px solid #e2e8f0',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 700,
              color: 'var(--navy-800)',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}
          >
            <HiOutlineArrowLeft size={18} />
            {step === 1 ? 'Back to Food & Kitchen Hub' : 'Previous Step'}
          </button>
        </div>

        {/* Hero Card */}
        <div style={{
          background: theme.gradient,
          borderRadius: '24px',
          padding: '28px 24px',
          color: 'white',
          marginBottom: '24px',
          boxShadow: '0 12px 30px -8px rgba(0,0,0,0.18)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              <HiOutlineSparkles size={14} /> 5-Star Hotel Chefs & Certified Hygiene
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 8px 0', lineHeight: 1.2 }}>
              {theme.title}
            </h1>
            <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95, lineHeight: 1.5, maxWidth: '640px' }}>
              {theme.subtitle}
            </p>
          </div>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)'
          }}>
            {theme.icon}
          </div>
        </div>

        {/* 2-Step Progress Indicator */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '16px 24px',
          marginBottom: '28px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', position: 'relative' }}>
            {[
              { num: 1, label: '1. Select Plan & Key Options', desc: 'Choose menu, course or kitchen size' },
              { num: 2, label: '2. Schedule & Confirm', desc: 'Set timing, home address & specialist' }
            ].map((s) => {
              const isDone = step > s.num;
              const isActive = step === s.num;
              return (
                <div key={s.num} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isDone ? '#10b981' : isActive ? theme.color : '#f1f5f9',
                    color: isDone || isActive ? 'white' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    margin: '0 auto 6px',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? `0 4px 12px ${theme.color}44` : 'none'
                  }}>
                    {isDone ? <HiOutlineCheckCircle size={22} /> : s.num}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? 'var(--navy-900)' : '#64748b'
                  }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    {s.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ERROR ALERT */}
        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '14px 20px',
            borderRadius: '14px',
            marginBottom: '24px',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: SELECT PLAN & OPTIONS */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* 1.1 BBQ CONFIGURATION */}
            {flowType === 'bbq' && (
              <>
                {/* Guest Scale & Venue */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    1. Gathering Scale & Venue Type
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        👥 Expected Guests
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          onClick={() => setBbqGuests(Math.max(4, bbqGuests - 2))}
                          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 900, cursor: 'pointer' }}
                        >-</button>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--navy-900)' }}>{bbqGuests} Guests</span>
                        <button
                          type="button"
                          onClick={() => setBbqGuests(bbqGuests + 2)}
                          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 900, cursor: 'pointer' }}
                        >+</button>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '6px' }}>Base includes 6 guests (₹350/extra guest)</span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🍖 Diet Preference
                      </label>
                      <select
                        value={bbqDietType}
                        onChange={e => setBbqDietType(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="Mixed">Mixed (Veg & Non-Veg Dedicated Grills)</option>
                        <option value="Veg">100% Pure Veg (Jain Options Available)</option>
                        <option value="Non-Veg">Specialty Non-Veg Feast</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🏡 Venue Setup Space
                      </label>
                      <select
                        value={bbqVenueType}
                        onChange={e => setBbqVenueType(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="Private Backyard Lawn">Private Backyard Lawn</option>
                        <option value="Terrace / Rooftop Garden">Terrace / Rooftop Garden</option>
                        <option value="Wide Balcony (Smoke Filtered)">Wide Balcony (Smoke Filtered)</option>
                        <option value="Society Clubhouse Lawn">Society Clubhouse Lawn</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Skewer Menu Selection */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                      2. Curate Live Grill Skewers ({bbqSelectedItems.length} Selected)
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 700 }}>Choose any 4-6 skewers</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    {BBQ_SKEWER_MENU.map(item => {
                      const isSelected = bbqSelectedItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItem(bbqSelectedItems, setBbqSelectedItems, item.id)}
                          style={{
                            border: `2px solid ${isSelected ? '#ea580c' : '#e2e8f0'}`,
                            background: isSelected ? '#fff7ed' : '#ffffff',
                            borderRadius: '14px',
                            padding: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--navy-900)' }}>{item.name}</span>
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: item.category === 'veg' ? '#dcfce7' : '#fee2e2', color: item.category === 'veg' ? '#15803d' : '#b91c1c', padding: '2px 6px', borderRadius: '6px' }}>
                                {item.category.toUpperCase()}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
                              {item.desc}
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ea580c' }}>{item.badge}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isSelected ? '#ea580c' : '#94a3b8' }}>
                              {isSelected ? '✓ Included' : '+ Tap to Add'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BBQ Add-ons */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Party Upgrades & Crew Add-ons
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {BBQ_ADDONS_LIST.map(a => {
                      const active = bbqAddons.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => toggleItem(bbqAddons, setBbqAddons, a.id)}
                          style={{
                            border: `2px solid ${active ? '#ea580c' : '#e2e8f0'}`,
                            background: active ? '#fff7ed' : '#ffffff',
                            borderRadius: '14px',
                            padding: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--navy-900)' }}>{a.name}</div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{a.desc}</div>
                          </div>
                          <div style={{ fontWeight: 900, color: '#ea580c', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                            +₹{a.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 1.2 BAKING CONFIGURATION */}
            {flowType === 'baking' && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    1. Select Masterclass Theme
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {BAKING_COURSES.map(c => {
                      const selected = bakingCourse === c.name;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setBakingCourse(c.name)}
                          style={{
                            border: `2px solid ${selected ? '#db2777' : '#e2e8f0'}`,
                            background: selected ? '#fdf2f8' : '#ffffff',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fce7f3', color: '#9d174d', padding: '2px 8px', borderRadius: '8px' }}>
                              {c.badge}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>
                              ⏱️ {c.duration}
                            </span>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy-900)', margin: '6px 0' }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#db2777', marginBottom: '8px' }}>
                            ₹{c.basePrice}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                            {c.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    2. Class Format & Kitchen Oven Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        👥 Student Coaching Format
                      </label>
                      <select
                        value={bakingFormat}
                        onChange={e => setBakingFormat(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="Solo Private Coaching (1 Person)">Solo 1-on-1 Coaching (₹0)</option>
                        <option value="Duo / Couple Baking Date (2 Persons)">Duo / Couple Baking Date (+₹600)</option>
                        <option value="Family & Friends Squad (3-4 Persons)">Family & Friends Squad (3-4 Persons) (+₹1,400)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🔥 Available Kitchen Oven
                      </label>
                      <select
                        value={bakingOvenType}
                        onChange={e => setBakingOvenType(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="OTG (Oven Toaster Griller)">OTG (Oven Toaster Griller) (₹0)</option>
                        <option value="Built-in Modular Microwave Convection">Built-in Microwave Convection (₹0)</option>
                        <option value="No Oven / Chef Brings Portable OTG">No Oven / Chef Brings Portable OTG (+₹499)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🥚 Egg Constraint
                      </label>
                      <select
                        value={bakingDietConstraint}
                        onChange={e => setBakingDietConstraint(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="100% Eggless (Strict)">100% Eggless (Strict)</option>
                        <option value="Classic French (With Fresh Farm Eggs)">Classic French (With Fresh Farm Eggs)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Chef Keepsakes & Toolkits
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {BAKING_ADDONS_LIST.map(a => {
                      const active = bakingAddons.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => toggleItem(bakingAddons, setBakingAddons, a.id)}
                          style={{
                            border: `2px solid ${active ? '#db2777' : '#e2e8f0'}`,
                            background: active ? '#fdf2f8' : '#ffffff',
                            borderRadius: '14px',
                            padding: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--navy-900)' }}>{a.name}</div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{a.desc}</div>
                          </div>
                          <div style={{ fontWeight: 900, color: '#db2777', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                            +₹{a.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 1.3 KITCHEN CLEAN CONFIGURATION */}
            {flowType === 'kitchen-clean' && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    1. Select Kitchen Scale
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {KITCHEN_SIZES.map(s => {
                      const selected = cleanKitchenSize === s.name;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setCleanKitchenSize(s.name)}
                          style={{
                            border: `2px solid ${selected ? '#0ea5e9' : '#e2e8f0'}`,
                            background: selected ? '#f0f9ff' : '#ffffff',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '4px' }}>
                            {s.name}
                          </div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0ea5e9', marginBottom: '8px' }}>
                            ₹{s.basePrice}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                            {s.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    2. Appliance Steam Degreasing Add-ons
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                    {CLEAN_APPLIANCE_LIST.map(a => {
                      const active = cleanApplianceAddons.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => toggleItem(cleanApplianceAddons, setCleanApplianceAddons, a.id)}
                          style={{
                            border: `2px solid ${active ? '#0ea5e9' : '#e2e8f0'}`,
                            background: active ? '#f0f9ff' : '#ffffff',
                            borderRadius: '14px',
                            padding: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--navy-900)' }}>{a.name}</div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{a.desc}</div>
                          </div>
                          <div style={{ fontWeight: 900, color: '#0ea5e9', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                            +₹{a.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>Aesthetic Pantry Makeover & Decanting</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Minimalist jar labeling, expiration audit & spice tier organizing</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCleanPantryTier(cleanPantryTier.includes('Aesthetic') ? 'Standard' : 'Aesthetic Pantry Makeover & Decanting')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: cleanPantryTier.includes('Aesthetic') ? '#0ea5e9' : '#e2e8f0',
                        color: cleanPantryTier.includes('Aesthetic') ? 'white' : '#64748b',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {cleanPantryTier.includes('Aesthetic') ? '✓ Added (+₹999)' : '+ Add (+₹999)'}
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SCHEDULE, ADDRESS & CONFIRM */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Schedule & Address Details */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                Event Schedule & Venue Address
              </h3>

              {flowType === 'bbq' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📅 Event Date
                    </label>
                    <input
                      type="date"
                      value={bbqEventDate}
                      onChange={e => setBbqEventDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Time Slot
                    </label>
                    <select
                      value={bbqEventType}
                      onChange={e => setBbqEventType(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="Evening Sundowner (05:00 PM - 09:00 PM)">Evening Sundowner (05:00 PM - 09:00 PM)</option>
                      <option value="Afternoon Lunch Grill (12:00 PM - 03:30 PM)">Afternoon Lunch Grill (12:00 PM - 03:30 PM)</option>
                      <option value="Late Night Sizzle (08:00 PM - 11:30 PM)">Late Night Sizzle (08:00 PM - 11:30 PM)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📍 Lawn / Terrace Venue Address
                    </label>
                    <input
                      type="text"
                      value={bbqAddress}
                      onChange={e => setBbqAddress(e.target.value)}
                      placeholder="e.g. Bunglow 14, Orchid Greens, South Bopal"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}

              {flowType === 'baking' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📅 Masterclass Date
                    </label>
                    <input
                      type="date"
                      value={bakingDate}
                      onChange={e => setBakingDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Session Slot
                    </label>
                    <select
                      value={bakingTimeSlot}
                      onChange={e => setBakingTimeSlot(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="Morning Masterclass (10:30 AM - 01:30 PM)">Morning Masterclass (10:30 AM - 01:30 PM)</option>
                      <option value="Afternoon Baking Date (03:30 PM - 06:30 PM)">Afternoon Baking Date (03:30 PM - 06:30 PM)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      🎓 Student Name(s) (For Certificate)
                    </label>
                    <input
                      type="text"
                      value={bakingStudentNames}
                      onChange={e => setBakingStudentNames(e.target.value)}
                      placeholder="e.g. Pooja & Rahul"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      🏠 Kitchen Home Address
                    </label>
                    <input
                      type="text"
                      value={bakingAddress}
                      onChange={e => setBakingAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Apartments, Bopal"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}

              {flowType === 'kitchen-clean' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📅 Deep Cleaning Date
                    </label>
                    <input
                      type="date"
                      value={cleanDate}
                      onChange={e => setCleanDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Time Slot
                    </label>
                    <select
                      value={cleanTimeSlot}
                      onChange={e => setCleanTimeSlot(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="Morning Fresh (08:30 AM - 12:30 PM)">Morning Fresh (08:30 AM - 12:30 PM)</option>
                      <option value="Afternoon Shift (01:30 PM - 05:30 PM)">Afternoon Shift (01:30 PM - 05:30 PM)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      🏠 Home Address & Floor
                    </label>
                    <input
                      type="text"
                      value={cleanAddress}
                      onChange={e => setCleanAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Apartments, Bopal"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Specialist Assurance Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: 'white',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem'
                }}>
                  {flowType === 'bbq' ? '🔥' : flowType === 'baking' ? '🎂' : '✨'}
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#38bdf8', fontWeight: 800 }}>
                    ServeCircle Culinary Standards
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '2px 0' }}>
                    {flowType === 'bbq' ? '5-Star Hotel Trained Master Pitmaster & Zero-Mess Crew' :
                     flowType === 'baking' ? 'Le Cordon Bleu / Oberoi Trained Executive Pastry Chef' :
                     'Certified 140°C High-Pressure Steam Hygiene Team'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    100% food-grade certified non-toxic agents • 48-hour re-clean guarantee • Post-party spotless sweep
                  </div>
                </div>
              </div>
            </div>

            {/* Transparent Bill Breakdown */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                Transparent Pricing Breakdown
              </h3>

              {flowType === 'bbq' && (() => {
                const b = calcBbqTotal();
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>Base Live Grill (Up to 6 Guests)</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{b.baseRate}</strong>
                    </div>
                    {b.guestAddon > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>Extra Guests ({bbqGuests - 6} × ₹350)</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{b.guestAddon}</strong>
                      </div>
                    )}
                    {b.addonsTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>Party & Service Add-ons</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{b.addonsTotal}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>Applicable GST (18%)</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{b.gst}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                      <span>Total Payable</span>
                      <span style={{ color: theme.color }}>₹{b.total}</span>
                    </div>
                  </>
                );
              })()}

              {flowType === 'baking' && (() => {
                const bk = calcBakingTotal();
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>{bakingCourse}</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{bk.basePrice}</strong>
                    </div>
                    {bk.formatFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>{bakingFormat}</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{bk.formatFee}</strong>
                      </div>
                    )}
                    {bk.ovenFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>Chef Portable OTG</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{bk.ovenFee}</strong>
                      </div>
                    )}
                    {bk.addonsTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>Gear & Hamper Keepsakes</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{bk.addonsTotal}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>Applicable GST (18%)</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{bk.gst}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                      <span>Total Payable</span>
                      <span style={{ color: theme.color }}>₹{bk.total}</span>
                    </div>
                  </>
                );
              })()}

              {flowType === 'kitchen-clean' && (() => {
                const c = calcCleanTotal();
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>{cleanKitchenSize}</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{c.basePrice}</strong>
                    </div>
                    {c.applianceTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>Appliance Steam Clean</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{c.applianceTotal}</strong>
                      </div>
                    )}
                    {c.pantryFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                        <span style={{ color: '#475569' }}>Pantry Makeover</span>
                        <strong style={{ color: 'var(--navy-900)' }}>+₹{c.pantryFee}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                      <span style={{ color: '#475569' }}>Applicable GST (18%)</span>
                      <strong style={{ color: 'var(--navy-900)' }}>₹{c.gst}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                      <span>Total Payable</span>
                      <span style={{ color: theme.color }}>₹{c.total}</span>
                    </div>
                  </>
                );
              })()}
            </div>

          </div>
        )}

        {/* BOTTOM FLOATING ACTION BAR */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'center',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
          zIndex: 100
        }}>
          <div style={{ width: '100%', maxWidth: '920px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total (Incl. Taxes)</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{currentTotal()}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleBack}
                className="btn"
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              <button
                onClick={handleNext}
                disabled={loading}
                className="btn"
                style={{
                  background: theme.gradient,
                  color: 'white',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 14px ${theme.color}44`
                }}
              >
                {loading ? 'Processing...' : step === 1 ? (
                  <>Continue to Schedule <HiOutlineArrowRight size={18} /></>
                ) : (
                  <>Confirm & Book <HiOutlineCheckCircle size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FoodPremiumFlow;
