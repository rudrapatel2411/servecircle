import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineCheckBadge,
  HiOutlineShieldCheck,
  HiOutlineHomeModern,
  HiOutlineAcademicCap,
  HiOutlineCamera,
  HiOutlineShoppingBag,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineTruck,
  HiOutlineCurrencyRupee,
  HiOutlineArrowRight
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import '../Dashboard.css';
import './CustomerPages.css';

const PetPremiumFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const flowType = searchParams.get('type') || 'boarding'; // boarding, training, photography, subscription

  const petNameParam = searchParams.get('petName') || 'Max';
  const petTypeParam = searchParams.get('petType') || 'Dog';
  const petBreedParam = searchParams.get('petBreed') || 'Golden Retriever';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ─────────────────────────────────────────────────────────────
  // 1. BOARDING & SITTING STATE
  // ─────────────────────────────────────────────────────────────
  const [boardingTier, setBoardingTier] = useState('homestay'); // homestay, resort, sitter
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 3);
    return d.toISOString().split('T')[0];
  });
  const [boardingDiet, setBoardingDiet] = useState('provided'); // provided, fresh-cooked, premium-kibble
  const [boardingNotes, setBoardingNotes] = useState('Max loves belly rubs and is slightly scared of sudden loud thunder sounds.');
  const [boardingAddons, setBoardingAddons] = useState(['pet-taxi', 'bubble-bath']);
  const [boardingAddress, setBoardingAddress] = useState('Flat 402, Green Meadows, Sector 14');

  const BOARDING_TIERS = [
    {
      id: 'homestay',
      name: 'Verified Family Homestay',
      pricePerNight: 899,
      badge: 'Most Popular',
      desc: 'Cage-free loving family home with fenced garden/balcony. Max 2 guest pets. Ideal for cozy care & sensitive dogs.'
    },
    {
      id: 'resort',
      name: 'Luxury Pet Resort & Daycare',
      pricePerNight: 1499,
      badge: 'Ultra Luxury',
      desc: 'Private climate-controlled suite, heated splash pool, agility fun lawn, and 24/7 on-site veterinary nurse.'
    },
    {
      id: 'sitter',
      name: 'In-Home Trusted Pet Sitter',
      pricePerNight: 1199,
      badge: 'Zero Relocation Stress',
      desc: 'Verified sitter stays or visits 3x/day at your home so your pet sleeps in their own bed and familiar smells.'
    }
  ];

  const BOARDING_ADDONS_LIST = [
    { id: 'pet-taxi', name: 'AC Pet Taxi (Pick & Drop)', price: 499, desc: 'Sanitized pet-safe carrier transport to and from host home' },
    { id: 'bubble-bath', name: 'Pre-Return Bubble Bath & De-shedding', price: 699, desc: 'Deep herbal bath, ear cleaning, paw massage & coat blow-dry before return' },
    { id: 'tick-flea', name: 'Anti-Tick & Flea Spot-on Treatment', price: 399, desc: 'Bayer/Frontline pipette applied on arrival for complete stay protection' },
    { id: 'puzzle-toys', name: 'Daily Brain Puzzle & Agility Sessions', price: 199, desc: 'Interactive snuffle mats & KONG treat dispensers to prevent boredom' }
  ];

  const boardingNights = useMemo(() => {
    try {
      const inD = new Date(checkInDate);
      const outD = new Date(checkOutDate);
      const diff = Math.ceil((outD - inD) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 2;
    }
  }, [checkInDate, checkOutDate]);

  // ─────────────────────────────────────────────────────────────
  // 2. CERTIFIED TRAINING STATE
  // ─────────────────────────────────────────────────────────────
  const [trainingProgram, setTrainingProgram] = useState('puppy');
  const [trainingPackage, setTrainingPackage] = useState('bootcamp'); // trial, bootcamp, transform
  const [trainingDays, setTrainingDays] = useState('Weekends (Saturday & Sunday)');
  const [trainingSlot, setTrainingSlot] = useState('Morning Mindful Slot (07:30 AM - 09:30 AM)');
  const [trainingAddress, setTrainingAddress] = useState('Flat 402, Green Meadows, Sector 14');
  const [trainingNotes, setTrainingNotes] = useState('Jumps up excitedly when guests arrive at the main door.');
  const [trainingAddons, setTrainingAddons] = useState(['treats-pack']);

  const TRAINING_PROGRAMS = [
    {
      id: 'puppy',
      name: 'Puppy Foundation & Housebreaking (2-6 Months)',
      badge: 'Early Essentials',
      focus: 'Potty schedules, bite inhibition, crate confidence, sit/down/stay, leash familiarity.'
    },
    {
      id: 'leash',
      name: 'Leash Manners & Anti-Pulling Bootcamp',
      badge: 'Everyday Freedom',
      focus: 'Loose-leash walking, polite greetings, impulse control, passing barking dogs calmly.'
    },
    {
      id: 'behavior',
      name: 'Behavior Modification (Reactivity & Anxiety)',
      badge: 'Rehab Specialist',
      focus: 'Separation anxiety, excessive doorbell barking, resource guarding, fear desensitization.'
    },
    {
      id: 'advanced',
      name: 'Advanced Off-Leash Recall & Fun Tricks Masterclass',
      badge: 'Master Level',
      focus: '100% emergency recall, long-distance stay, agility jumps, roll-over, fetch & release.'
    }
  ];

  const TRAINING_PACKAGES = [
    {
      id: 'trial',
      name: '1 Trial Assessment Session',
      price: 1299,
      sessions: '1 Session (60 mins)',
      badge: 'Introductory',
      desc: 'In-home behavioral evaluation, temperament audit & tailored 4-week roadmap.'
    },
    {
      id: 'bootcamp',
      name: '6-Session Foundation Bootcamp',
      price: 6999,
      sessions: '6 Sessions (2x / week)',
      badge: 'Best Value • Save ₹795',
      desc: 'Hands-on parent coaching, habit tracking diary, and certified command mastery.'
    },
    {
      id: 'transform',
      name: '12-Session Complete Transformation',
      price: 12999,
      sessions: '12 Sessions + 3 Mo WhatsApp Support',
      badge: 'Complete Guarantee • Save ₹2,589',
      desc: 'Deep behavioral rehab, unlimited video reviews, official graduation certificate & medal.'
    }
  ];

  const TRAINING_ADDONS_LIST = [
    { id: 'kit-basic', name: 'Pro Clicker & Silicone Treat Pouch', price: 499, desc: 'Quick-access magnetic belt pouch with ergonomic training clicker' },
    { id: 'kit-longline', name: '15ft Biothane Waterproof Recall Line', price: 699, desc: 'Essential tether line for practicing open-field recalls safely' },
    { id: 'treats-pack', name: 'Freeze-Dried Chicken & Liver Treats (300g)', price: 399, desc: 'Single-ingredient, high-value motivation treats that keep focus sharp' },
    { id: 'kit-pro', name: 'Complete Master Training Gear Bundle', price: 1299, desc: 'Includes clicker, pouch, 15ft line, and double treat pouch (Save ₹298)' }
  ];

  // ─────────────────────────────────────────────────────────────
  // 3. PET PHOTOGRAPHY STATE
  // ─────────────────────────────────────────────────────────────
  const [photoSetting, setPhotoSetting] = useState('home'); // home, park, studio
  const [photoPackage, setPhotoPackage] = useState('royal'); // classic, royal, heirloom
  const [photoDate, setPhotoDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 3);
    return d.toISOString().split('T')[0];
  });
  const [photoSlot, setPhotoSlot] = useState('Sunset Golden Hour (04:30 PM - 06:30 PM)');
  const [photoLocationAddress, setPhotoLocationAddress] = useState('Riverfront Promenade / Home Lawn');
  const [photoPetTemperament, setPhotoPetTemperament] = useState('High Energy / Playful');
  const [photoAddons, setPhotoAddons] = useState(['groom-fluff']);

  const PHOTO_SETTINGS = [
    {
      id: 'home',
      name: 'Cozy In-Home Lifestyle Shoot',
      basePrice: 2499,
      badge: 'Stress Free',
      desc: 'Authentic candid portraits on your living sofa, bed, and balcony. Softbox portable ambient lighting provided.'
    },
    {
      id: 'park',
      name: 'Outdoor Golden Hour Action Shoot',
      basePrice: 3499,
      badge: 'High Action',
      desc: 'Sunset or dawn session at a green pet park or beach. Captures running leaps, frisbee catches & glowing fur.'
    },
    {
      id: 'studio',
      name: 'Aesthetic Studio Portrait Session',
      basePrice: 4499,
      badge: 'Vogue Editorial',
      desc: 'Professional studio with creative backdrops, studio flash, festive floral props, and velvet bowties.'
    }
  ];

  const PHOTO_PACKAGES = [
    {
      id: 'classic',
      name: 'Classic Pawrait Collection',
      extraPrice: 0,
      badge: 'Included',
      perks: ['15 Retouched Digital High-Res Photos', '1 Framed 8x10 Desk Print', 'Private Online Gallery for 1 Year']
    },
    {
      id: 'royal',
      name: 'Royal Pet Portfolio',
      extraPrice: 1499,
      badge: 'Most Loved',
      perks: ['35 Retouched High-Res Photos', '1 Hardcover Linen Photobook (20 Pages)', '2 Framed 5x7 Prints', 'Mobile Wallpaper Pack']
    },
    {
      id: 'heirloom',
      name: 'Family & Pet Heirloom Collection',
      extraPrice: 2499,
      badge: 'Ultimate Keepsake',
      perks: ['50+ Photos (Family Portraits Included)', '1 Luxury Velvet Album (30 Pages)', '1 4K Cinematic 60-Sec Reel', '2 Canvas Wall Arts (12x18)']
    }
  ];

  const PHOTO_ADDONS_LIST = [
    { id: 'groom-fluff', name: 'Pre-Shoot Fluff & Shine Grooming Kit', price: 399, desc: 'Scented styling mist, paw butter gloss & coat comb-out before the first shutter click' },
    { id: 'outfits', name: 'Designer Bowties, Bandanas & Flower Wreaths', price: 499, desc: 'Set of 3 handcrafted photo-ready pet accessories to style during shoot' },
    { id: 'express-edit', name: 'Express 48-Hour Priority Turnaround', price: 799, desc: 'Receive your retouched gallery in 48 hours instead of standard 7 days' }
  ];

  // ─────────────────────────────────────────────────────────────
  // 4. SUBSCRIPTION BOX STATE
  // ─────────────────────────────────────────────────────────────
  const [subTier, setSubTier] = useState('deluxe'); // standard, deluxe
  const [subDietRecipe, setSubDietRecipe] = useState('chicken-veggie');
  const [subPetAgeGroup, setSubPetAgeGroup] = useState('Adult (1 - 7 Years)');
  const [subDeliveryDay, setSubDeliveryDay] = useState('1st of every month');
  const [subAddons, setSubAddons] = useState(['tick-flea-sub']);
  const [subAddress, setSubAddress] = useState('Flat 402, Green Meadows, Sector 14');

  const SUB_TIERS = [
    {
      id: 'standard',
      name: 'Standard Essentials Box',
      monthlyPrice: 1999,
      badge: 'Nutritional Core',
      highlights: [
        '4kg Breed-Customized Kibble + 4 Gravy Pouches',
        '2 Bags Natural Single-Ingredient Treats',
        '1 Long-Lasting Natural Dental Chew Bone',
        '1 Squeaker Plush or Tennis Ball Toy',
        'Free Doorstep Delivery on 1st of month'
      ]
    },
    {
      id: 'deluxe',
      name: 'Deluxe Pamper & Wellness Box',
      monthlyPrice: 2999,
      badge: 'Most Popular • Loved by 94% Pets',
      highlights: [
        '6kg Ultra-Premium Breed Food + Organic Bone Broth Topper',
        '4 Bags Gourmet Freeze-Dried Treats & Jerky',
        '1 Pack 30-Day Probiotic Dental Chew Sticks',
        '2 Heavy-Chewer Tested Tough Toys (KONG / Rubber)',
        '1 Full-Size Wellness Item (Aloe Paw Balm or Coat Mist)',
        '🎁 Surprise Birthday Gift Box in pet\'s birthday month!'
      ]
    }
  ];

  const SUB_DIET_RECIPES = [
    {
      id: 'chicken-veggie',
      name: 'Free-Run Chicken & Mountain Veggies',
      tag: 'Lean Muscle & High Vitality',
      desc: 'Farm-fresh boneless chicken with spinach, pumpkin & carrots. Rich in bioavailable protein.'
    },
    {
      id: 'salmon-omega',
      name: 'Wild Ocean Salmon & Brown Rice',
      tag: 'Coat Shine & Joint Protection',
      desc: 'Cold-water salmon packed with natural EPA/DHA Omega-3 oils to eliminate flaky dander.'
    },
    {
      id: 'lamb-pumpkin',
      name: 'Gentle Digestion New Zealand Lamb & Pumpkin',
      tag: 'Hypoallergenic & Sensitive Stomachs',
      desc: 'Single novel protein for dogs with poultry sensitivity or loose stool tendencies.'
    },
    {
      id: 'turkey-cranberry',
      name: 'Low-Calorie Turkey & Superfood Cranberries',
      tag: 'Weight Management & Urinary Care',
      desc: 'Lean trimmed turkey breast with wholesome fibers for neutered or indoor calm pets.'
    }
  ];

  const SUB_ADDONS_LIST = [
    { id: 'tick-flea-sub', name: 'Monthly Anti-Tick/Flea Spot-on Pipette', price: 449, desc: 'Weight-matched Bayer/Frontline pipette delivered every month right when it is due' },
    { id: 'joint-chews', name: 'Daily Glucosamine & Chondroitin Hip Chews (30ct)', price: 599, desc: 'Veterinary formula for smooth joints and active running mobility' },
    { id: 'groom-wipes', name: 'Hypoallergenic Aloe Grooming Wet Wipes (80 Pack)', price: 299, desc: 'Alcohol-free, pH-balanced paw and tear stain cleaning wipes' }
  ];

  // ─────────────────────────────────────────────────────────────
  // THEME CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  const theme = useMemo(() => {
    switch (flowType) {
      case 'boarding':
        return {
          title: 'Pet Boarding & Sitting Homestay',
          subtitle: `Verified, cage-free loving homes with 3x daily WhatsApp updates for ${petNameParam}`,
          icon: <HiOutlineHomeModern size={36} color="white" />,
          color: '#ef4444',
          accentBg: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          softBg: '#fef2f2',
          badgeText: 'Boarding Setup'
        };
      case 'training':
        return {
          title: 'Certified In-Home Pet Training',
          subtitle: `100% Force-free, positive reinforcement coaching tailored for ${petNameParam}`,
          icon: <HiOutlineAcademicCap size={36} color="white" />,
          color: '#f59e0b',
          accentBg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          softBg: '#fffbeb',
          badgeText: 'Training Program'
        };
      case 'photography':
        return {
          title: 'Professional Pet Photography',
          subtitle: `Capture heartwarming, high-resolution portraits & memories of ${petNameParam}`,
          icon: <HiOutlineCamera size={36} color="white" />,
          color: '#c026d3',
          accentBg: 'linear-gradient(135deg, #c026d3 0%, #86198f 100%)',
          softBg: '#fdf4ff',
          badgeText: 'Photoshoot Studio'
        };
      case 'subscription':
      default:
        return {
          title: `Custom Monthly Pet Box for ${petNameParam}`,
          subtitle: `Breed-tailored nutrition, healthy treats, dental chews & tough toys on the 1st of every month`,
          icon: <HiOutlineShoppingBag size={36} color="white" />,
          color: '#16a34a',
          accentBg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          softBg: '#f0fdf4',
          badgeText: 'Subscription Setup'
        };
    }
  }, [flowType, petNameParam]);

  // ─────────────────────────────────────────────────────────────
  // PRICE CALCULATION
  // ─────────────────────────────────────────────────────────────
  const calculation = useMemo(() => {
    let base = 0;
    let addonsTotal = 0;
    let discount = 0;
    let label = '';

    if (flowType === 'boarding') {
      const selectedTierObj = BOARDING_TIERS.find(t => t.id === boardingTier) || BOARDING_TIERS[0];
      let nightRate = selectedTierObj.pricePerNight;
      if (boardingDiet === 'fresh-cooked') nightRate += 199;
      if (boardingDiet === 'premium-kibble') nightRate += 249;

      base = nightRate * boardingNights;
      label = `${selectedTierObj.name} (${boardingNights} Nights)`;

      boardingAddons.forEach(addonId => {
        const item = BOARDING_ADDONS_LIST.find(a => a.id === addonId);
        if (item) addonsTotal += item.price;
      });

      if (boardingNights >= 5) {
        discount = 500; // Long stay perk
      }
    } else if (flowType === 'training') {
      const pkg = TRAINING_PACKAGES.find(p => p.id === trainingPackage) || TRAINING_PACKAGES[1];
      base = pkg.price;
      label = `${pkg.name}`;

      trainingAddons.forEach(addonId => {
        const item = TRAINING_ADDONS_LIST.find(a => a.id === addonId);
        if (item) addonsTotal += item.price;
      });
    } else if (flowType === 'photography') {
      const setting = PHOTO_SETTINGS.find(s => s.id === photoSetting) || PHOTO_SETTINGS[0];
      const pkg = PHOTO_PACKAGES.find(p => p.id === photoPackage) || PHOTO_PACKAGES[1];
      base = setting.basePrice + pkg.extraPrice;
      label = `${setting.name} + ${pkg.name}`;

      photoAddons.forEach(addonId => {
        const item = PHOTO_ADDONS_LIST.find(a => a.id === addonId);
        if (item) addonsTotal += item.price;
      });
    } else if (flowType === 'subscription') {
      const tierObj = SUB_TIERS.find(s => s.id === subTier) || SUB_TIERS[1];
      base = tierObj.monthlyPrice;
      label = `${tierObj.name} (Monthly)`;

      subAddons.forEach(addonId => {
        const item = SUB_ADDONS_LIST.find(a => a.id === addonId);
        if (item) addonsTotal += item.price;
      });

      discount = 300; // First month introductory discount
    }

    const total = Math.max(0, base + addonsTotal - discount);
    return { base, addonsTotal, discount, total, label };
  }, [
    flowType,
    boardingTier,
    boardingDiet,
    boardingNights,
    boardingAddons,
    trainingPackage,
    trainingAddons,
    photoSetting,
    photoPackage,
    photoAddons,
    subTier,
    subAddons
  ]);

  // ─────────────────────────────────────────────────────────────
  // STEP NAVIGATION & VALIDATION (STREAMLINED 2-STEP FLOW)
  // ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    setErrorMsg('');

    if (step === 1) {
      if (flowType === 'boarding') {
        if (!checkInDate || !checkOutDate) {
          setErrorMsg('Please select both check-in and check-out dates.');
          return;
        }
        if (new Date(checkOutDate) <= new Date(checkInDate)) {
          setErrorMsg('Check-out date must be at least 1 day after check-in date.');
          return;
        }
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 2 validation
      if (flowType === 'boarding' && !boardingAddress.trim()) {
        setErrorMsg('Please provide your home address for pick-up/drop.');
        return;
      }
      if (flowType === 'training' && !trainingAddress.trim()) {
        setErrorMsg('Please provide your training session home address.');
        return;
      }
      if (flowType === 'photography' && (!photoDate || !photoLocationAddress.trim())) {
        setErrorMsg('Please provide a shoot date and preferred location address.');
        return;
      }
      if (flowType === 'subscription' && !subAddress.trim()) {
        setErrorMsg('Please provide your monthly box delivery address.');
        return;
      }
      handleFinalize();
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step === 2) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/customer/pet-services');
    }
  };

  const handleFinalize = () => {
    setLoading(true);
    setTimeout(() => {
      let serviceTitle = '';
      let notes = '';

      if (flowType === 'boarding') {
        serviceTitle = `Pet Boarding: ${BOARDING_TIERS.find(t => t.id === boardingTier)?.name} (${petNameParam})`;
        notes = `Stay: ${checkInDate} to ${checkOutDate} (${boardingNights} nights). Diet: ${boardingDiet}. Address: ${boardingAddress}. Notes: ${boardingNotes}`;
      } else if (flowType === 'training') {
        serviceTitle = `Pet Training: ${TRAINING_PACKAGES.find(p => p.id === trainingPackage)?.name} (${petNameParam})`;
        notes = `Program: ${trainingProgram}. Schedule: ${trainingDays}, ${trainingSlot}. Address: ${trainingAddress}. Details: ${trainingNotes}`;
      } else if (flowType === 'photography') {
        serviceTitle = `Pet Photoshoot: ${PHOTO_SETTINGS.find(s => s.id === photoSetting)?.name} (${petNameParam})`;
        notes = `Collection: ${PHOTO_PACKAGES.find(p => p.id === photoPackage)?.name}. Date: ${photoDate} (${photoSlot}). Venue: ${photoLocationAddress}. Temperament: ${photoPetTemperament}`;
      } else if (flowType === 'subscription') {
        serviceTitle = `Monthly Pet Box: ${SUB_TIERS.find(s => s.id === subTier)?.name} (${petNameParam})`;
        notes = `Recipe: ${subDietRecipe}. Stage: ${subPetAgeGroup}. Dispatch: ${subDeliveryDay}. Address: ${subAddress}`;
      }

      const queryParams = new URLSearchParams({
        service: serviceTitle,
        category: 'pet-services',
        price: calculation.total.toString(),
        notes: notes,
        petName: petNameParam,
        petBreed: petBreedParam,
        type: flowType
      });

      navigate(`/customer/book?${queryParams.toString()}`);
    }, 700);
  };

  const toggleAddon = (list, setList, id) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', padding: '20px 16px 120px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#faf9f6' }}>
      <div style={{ width: '100%', maxWidth: '960px', marginTop: '12px' }}>
        
        {/* TOP BAR / NAVIGATION */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
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
            {step === 1 ? 'Back to Pet Hub' : 'Previous Step'}
          </button>

          {/* PET PROFILE CHIP */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'white',
            border: '1px solid #e2e8f0',
            padding: '8px 16px',
            borderRadius: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🐾</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                {petNameParam} ({petBreedParam})
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {petTypeParam} • Verified Care Profile
              </div>
            </div>
          </div>
        </div>

        {/* HERO HEADER */}
        <div style={{
          background: theme.accentBg,
          color: 'white',
          borderRadius: '24px',
          padding: '28px 24px',
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
              <HiOutlineSparkles size={14} /> {theme.badgeText}
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

        {/* STREAMLINED 2-STEP PROGRESS INDICATOR */}
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
              { num: 1, label: '1. Select Plan & Key Options', desc: 'Choose tier, custom diet & add-ons' },
              { num: 2, label: '2. Schedule & Confirm', desc: 'Set timing, home address & match host' }
            ].map((s) => {
              const isDone = step > s.num;
              const isActive = step === s.num;
              return (
                <div key={s.num} style={{ textAlign: 'center', position: 'relative' }}>
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
            
            {/* 1.1 BOARDING SETUP */}
            {flowType === 'boarding' && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Select Boarding Experience Tier
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {BOARDING_TIERS.map(t => {
                      const selected = boardingTier === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setBoardingTier(t.id)}
                          style={{
                            border: `2px solid ${selected ? '#ef4444' : '#e2e8f0'}`,
                            background: selected ? '#fff5f5' : '#ffffff',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          {t.badge && (
                            <span style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              background: selected ? '#ef4444' : '#f1f5f9',
                              color: selected ? 'white' : '#64748b',
                              padding: '2px 8px',
                              borderRadius: '10px'
                            }}>
                              {t.badge}
                            </span>
                          )}
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy-900)', marginBottom: '6px' }}>
                            {t.name}
                          </div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ef4444', marginBottom: '8px' }}>
                            ₹{t.pricePerNight}<span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}> / night</span>
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.4 }}>
                            {t.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stay Dates & Diet */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Stay Dates & Diet Plan
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        📅 Check-in Date
                      </label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={e => setCheckInDate(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        📅 Check-out Date
                      </label>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={e => setCheckOutDate(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        🍲 Nutrition Preference
                      </label>
                      <select
                        value={boardingDiet}
                        onChange={e => setBoardingDiet(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="provided">Parent Provides Own Food (₹0)</option>
                        <option value="fresh-cooked">Fresh Cooked Chicken & Rice (+₹199/day)</option>
                        <option value="premium-kibble">Royal Canin / Farmina Grain-Free (+₹249/day)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                    Total Stay: <span style={{ color: '#ef4444', fontWeight: 900 }}>{boardingNights} Nights</span> • 3x Daily WhatsApp Video Check-ins Included
                  </div>
                </div>

                {/* Boarding Addons */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Recommended Care Add-ons
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {BOARDING_ADDONS_LIST.map(a => {
                      const active = boardingAddons.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => toggleAddon(boardingAddons, setBoardingAddons, a.id)}
                          style={{
                            border: `2px solid ${active ? '#ef4444' : '#e2e8f0'}`,
                            background: active ? '#fff5f5' : '#ffffff',
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
                          <div style={{ fontWeight: 900, color: '#ef4444', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                            +₹{a.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 1.2 TRAINING SETUP */}
            {flowType === 'training' && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    1. Select Training Program Focus
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {TRAINING_PROGRAMS.map(p => {
                      const selected = trainingProgram === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setTrainingProgram(p.id)}
                          style={{
                            border: `2px solid ${selected ? '#f59e0b' : '#e2e8f0'}`,
                            background: selected ? '#fffbeb' : '#ffffff',
                            borderRadius: '14px',
                            padding: '16px',
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, background: selected ? '#f59e0b' : '#f1f5f9', color: selected ? 'white' : '#64748b', padding: '2px 8px', borderRadius: '8px' }}>
                            {p.badge}
                          </span>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)', margin: '8px 0 4px' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {p.focus}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    2. Select Package Tier
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {TRAINING_PACKAGES.map(pkg => {
                      const selected = trainingPackage === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setTrainingPackage(pkg.id)}
                          style={{
                            border: `2px solid ${selected ? '#f59e0b' : '#e2e8f0'}`,
                            background: selected ? '#fffbeb' : '#ffffff',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy-900)' }}>{pkg.name}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '8px' }}>{pkg.badge}</span>
                          </div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginBottom: '6px' }}>
                            ₹{pkg.price}
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            {pkg.sessions}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {pkg.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Training Gear & Treat Add-ons
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {TRAINING_ADDONS_LIST.map(a => {
                      const active = trainingAddons.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => toggleAddon(trainingAddons, setTrainingAddons, a.id)}
                          style={{
                            border: `2px solid ${active ? '#f59e0b' : '#e2e8f0'}`,
                            background: active ? '#fffbeb' : '#ffffff',
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
                          <div style={{ fontWeight: 900, color: '#f59e0b', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                            +₹{a.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 1.3 PHOTOGRAPHY SETUP */}
            {flowType === 'photography' && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    1. Select Shoot Location Setting
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {PHOTO_SETTINGS.map(s => {
                      const selected = photoSetting === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setPhotoSetting(s.id)}
                          style={{
                            border: `2px solid ${selected ? '#c026d3' : '#e2e8f0'}`,
                            background: selected ? '#fdf4ff' : '#ffffff',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '4px' }}>
                            {s.name}
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#c026d3', marginBottom: '6px' }}>
                            ₹{s.basePrice}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {s.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    2. Select Photo Album Package
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {PHOTO_PACKAGES.map(pkg => {
                      const selected = photoPackage === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setPhotoPackage(pkg.id)}
                          style={{
                            border: `2px solid ${selected ? '#c026d3' : '#e2e8f0'}`,
                            background: selected ? '#fdf4ff' : '#ffffff',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--navy-900)' }}>{pkg.name}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fae8ff', color: '#a21caf', padding: '2px 8px', borderRadius: '8px' }}>
                              {pkg.extraPrice === 0 ? 'Included' : `+₹${pkg.extraPrice}`}
                            </span>
                          </div>
                          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                            {pkg.perks.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Photoshoot Add-ons
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {PHOTO_ADDONS_LIST.map(a => {
                      const active = photoAddons.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => toggleAddon(photoAddons, setPhotoAddons, a.id)}
                          style={{
                            border: `2px solid ${active ? '#c026d3' : '#e2e8f0'}`,
                            background: active ? '#fdf4ff' : '#ffffff',
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
                          <div style={{ fontWeight: 900, color: '#c026d3', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                            +₹{a.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 1.4 SUBSCRIPTION BOX SETUP */}
            {flowType === 'subscription' && (
              <>
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Select Monthly Subscription Plan
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                    {SUB_TIERS.map(s => {
                      const selected = subTier === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSubTier(s.id)}
                          style={{
                            border: `2px solid ${selected ? '#16a34a' : '#e2e8f0'}`,
                            background: selected ? '#f0fdf4' : '#ffffff',
                            borderRadius: '16px',
                            padding: '20px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy-900)' }}>{s.name}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '8px' }}>{s.badge}</span>
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16a34a', marginBottom: '10px' }}>
                            ₹{s.monthlyPrice}<span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}> / month</span>
                          </div>
                          <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                            {s.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Recipe Formula & Age Tailoring
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                    {SUB_DIET_RECIPES.map(r => {
                      const selected = subDietRecipe === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setSubDietRecipe(r.id)}
                          style={{
                            border: `2px solid ${selected ? '#16a34a' : '#e2e8f0'}`,
                            background: selected ? '#f0fdf4' : '#ffffff',
                            borderRadius: '14px',
                            padding: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy-900)', marginBottom: '4px' }}>{r.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, marginBottom: '4px' }}>{r.tag}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{r.desc}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        Pet Life Stage
                      </label>
                      <select
                        value={subPetAgeGroup}
                        onChange={e => setSubPetAgeGroup(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="Puppy (2 - 12 Months)">Puppy (2 - 12 Months)</option>
                        <option value="Adult (1 - 7 Years)">Adult (1 - 7 Years)</option>
                        <option value="Senior (7+ Years)">Senior (7+ Years)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        Monthly Dispatch Schedule
                      </label>
                      <select
                        value={subDeliveryDay}
                        onChange={e => setSubDeliveryDay(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                      >
                        <option value="1st of every month">1st of every month</option>
                        <option value="10th of every month">10th of every month</option>
                        <option value="20th of every month">20th of every month</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                    Monthly Wellness Essentials
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {SUB_ADDONS_LIST.map(a => {
                      const active = subAddons.includes(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => toggleAddon(subAddons, setSubAddons, a.id)}
                          style={{
                            border: `2px solid ${active ? '#16a34a' : '#e2e8f0'}`,
                            background: active ? '#f0fdf4' : '#ffffff',
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
                          <div style={{ fontWeight: 900, color: '#16a34a', marginLeft: '12px', whiteSpace: 'nowrap' }}>
                            +₹{a.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SCHEDULE, SPECIALIST & CONFIRM */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 2.1 SCHEDULE & ADDRESS INPUTS */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                Service Schedule & Address
              </h3>

              {flowType === 'boarding' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      🏠 Home Address for Pick-up / Drop
                    </label>
                    <input
                      type="text"
                      value={boardingAddress}
                      onChange={e => setBoardingAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Green Meadows, Sector 14"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📝 Care Notes / Special Habits
                    </label>
                    <textarea
                      rows={2}
                      value={boardingNotes}
                      onChange={e => setBoardingNotes(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              )}

              {flowType === 'training' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📅 Training Days Preference
                    </label>
                    <select
                      value={trainingDays}
                      onChange={e => setTrainingDays(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="Weekends (Saturday & Sunday)">Weekends (Saturday & Sunday)</option>
                      <option value="Weekday Mornings (Tue & Thu)">Weekday Mornings (Tue & Thu)</option>
                      <option value="Weekday Evenings (Mon & Wed)">Weekday Evenings (Mon & Wed)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Time Slot
                    </label>
                    <select
                      value={trainingSlot}
                      onChange={e => setTrainingSlot(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="Morning Mindful Slot (07:30 AM - 09:30 AM)">Morning Mindful Slot (07:30 AM - 09:30 AM)</option>
                      <option value="Late Afternoon (04:00 PM - 06:00 PM)">Late Afternoon (04:00 PM - 06:00 PM)</option>
                      <option value="Evening Sunset Slot (05:30 PM - 07:30 PM)">Evening Sunset Slot (05:30 PM - 07:30 PM)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      🏠 Training Session Address
                    </label>
                    <input
                      type="text"
                      value={trainingAddress}
                      onChange={e => setTrainingAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Green Meadows, Sector 14"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}

              {flowType === 'photography' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📅 Shoot Date
                    </label>
                    <input
                      type="date"
                      value={photoDate}
                      onChange={e => setPhotoDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      ⏰ Timing Slot
                    </label>
                    <select
                      value={photoSlot}
                      onChange={e => setPhotoSlot(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    >
                      <option value="Sunset Golden Hour (04:30 PM - 06:30 PM)">Sunset Golden Hour (04:30 PM - 06:30 PM)</option>
                      <option value="Morning Crisp Light (07:30 AM - 09:30 AM)">Morning Crisp Light (07:30 AM - 09:30 AM)</option>
                      <option value="Indoor Afternoon (01:00 PM - 03:00 PM)">Indoor Afternoon (01:00 PM - 03:00 PM)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📍 Shoot Location / Park Address
                    </label>
                    <input
                      type="text"
                      value={photoLocationAddress}
                      onChange={e => setPhotoLocationAddress(e.target.value)}
                      placeholder="e.g. Riverfront Promenade or Home Living Room"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}

              {flowType === 'subscription' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      📦 Monthly Box Delivery Address
                    </label>
                    <input
                      type="text"
                      value={subAddress}
                      onChange={e => setSubAddress(e.target.value)}
                      placeholder="e.g. Flat 402, Green Meadows, Sector 14"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2.2 SPECIALIST ASSURANCE CARD */}
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
                  {flowType === 'boarding' ? '🏡' : flowType === 'training' ? '🎓' : flowType === 'photography' ? '📸' : '📦'}
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#38bdf8', fontWeight: 800 }}>
                    ServeCircle Care Guarantee
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '2px 0' }}>
                    {flowType === 'boarding' ? 'Police-Verified Host Family & 24/7 Vet On-Call' :
                     flowType === 'training' ? 'KCI & LIMA Certified Positive Reinforcement Coach' :
                     flowType === 'photography' ? 'Award-Winning Pet Portraitist with Calming Techniques' :
                     'Nutritionist-Formulated Fresh Batch Guarantee'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Zero lock-in • 100% money-back satisfaction guarantee • 24/7 dedicated support
                  </div>
                </div>
              </div>
            </div>

            {/* 2.3 ITEMIZED SUMMARY */}
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                Booking Summary & Breakdown
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>{calculation.label}</span>
                <span style={{ fontWeight: 800, color: 'var(--navy-900)' }}>₹{calculation.base}</span>
              </div>
              {calculation.addonsTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Selected Add-ons</span>
                  <span style={{ fontWeight: 800, color: 'var(--navy-900)' }}>+₹{calculation.addonsTotal}</span>
                </div>
              )}
              {calculation.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.92rem', color: '#16a34a' }}>
                  <span style={{ fontWeight: 600 }}>Promotional Discount</span>
                  <span style={{ fontWeight: 800 }}>-₹{calculation.discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                <span>Final Payable</span>
                <span style={{ color: theme.color }}>₹{calculation.total}</span>
              </div>
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
          <div style={{ width: '100%', maxWidth: '960px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Payable</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{calculation.total}</div>
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
                  background: theme.accentBg,
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
                  <>Confirm Booking & Pay <HiOutlineCheckCircle size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PetPremiumFlow;
