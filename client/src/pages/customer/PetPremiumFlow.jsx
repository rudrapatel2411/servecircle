import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  HiOutlineUserGroup,
  HiOutlineStar,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineTruck,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCurrencyRupee,
  HiOutlineVideoCamera,
  HiOutlineInformationCircle,
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
  const [boardingTemperament, setBoardingTemperament] = useState('social'); // social, selective, solo
  const [boardingWalks, setBoardingWalks] = useState('2x Daily (Morning & Evening)');
  const [boardingNotes, setBoardingNotes] = useState('Max loves belly rubs and is slightly scared of sudden loud thunder sounds.');
  const [boardingAddons, setBoardingAddons] = useState(['pet-taxi', 'bubble-bath']);

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
  const [subPetWeight, setSubPetWeight] = useState('Large (25 - 45 kg)');
  const [subChewPreference, setSubChewPreference] = useState('Heavy Chewer (Natural Antlers & Yak Chews)');
  const [subDeliveryDay, setSubDeliveryDay] = useState('1st of every month');
  const [subAddons, setSubAddons] = useState(['tick-flea-sub']);

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
  // STEP NAVIGATION & VALIDATION
  // ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    setErrorMsg('');

    if (flowType === 'boarding') {
      if (step === 1 && (!checkInDate || !checkOutDate)) {
        setErrorMsg('Please select both check-in and check-out dates.');
        return;
      }
      if (step === 1 && new Date(checkOutDate) <= new Date(checkInDate)) {
        setErrorMsg('Check-out date must be at least 1 day after check-in date.');
        return;
      }
    }

    if (flowType === 'training') {
      if (step === 2 && !trainingAddress.trim()) {
        setErrorMsg('Please provide your training session home address.');
        return;
      }
    }

    if (flowType === 'photography') {
      if (step === 3 && (!photoDate || !photoLocationAddress.trim())) {
        setErrorMsg('Please provide a preferred shoot date and address/park name.');
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFinalize();
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step > 1) {
      setStep(step - 1);
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
        notes = `Stay: ${checkInDate} to ${checkOutDate} (${boardingNights} nights). Diet: ${boardingDiet}. Routine: ${boardingWalks}. Notes: ${boardingNotes}`;
      } else if (flowType === 'training') {
        serviceTitle = `Pet Training: ${TRAINING_PACKAGES.find(p => p.id === trainingPackage)?.name} (${petNameParam})`;
        notes = `Program: ${trainingProgram}. Schedule: ${trainingDays}, ${trainingSlot}. Address: ${trainingAddress}. Details: ${trainingNotes}`;
      } else if (flowType === 'photography') {
        serviceTitle = `Pet Photoshoot: ${PHOTO_SETTINGS.find(s => s.id === photoSetting)?.name} (${petNameParam})`;
        notes = `Collection: ${PHOTO_PACKAGES.find(p => p.id === photoPackage)?.name}. Date: ${photoDate} (${photoSlot}). Venue: ${photoLocationAddress}. Temperament: ${photoPetTemperament}`;
      } else if (flowType === 'subscription') {
        serviceTitle = `Monthly Pet Box: ${SUB_TIERS.find(s => s.id === subTier)?.name} (${petNameParam})`;
        notes = `Recipe: ${subDietRecipe}. Pet Stage: ${subPetAgeGroup}, ${subPetWeight}. Chews: ${subChewPreference}. Dispatch: ${subDeliveryDay}`;
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
    }, 900);
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
        
        {/* TOP BAR / BACK NAVIGATION */}
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
                {petTypeParam} • Verified Profile
              </div>
            </div>
          </div>
        </div>

        {/* HERO HEADER */}
        <div style={{
          background: theme.accentBg,
          color: 'white',
          borderRadius: '24px',
          padding: '32px 28px',
          marginBottom: '28px',
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
              marginBottom: '12px'
            }}>
              <HiOutlineSparkles size={14} /> {theme.badgeText}
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 10px 0', lineHeight: 1.2 }}>
              {theme.title}
            </h1>
            <p style={{ margin: 0, fontSize: '0.98rem', opacity: 0.95, lineHeight: 1.5, maxWidth: '640px' }}>
              {theme.subtitle}
            </p>
          </div>
          <div style={{
            width: '68px',
            height: '68px',
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

        {/* 4-STEP PROGRESS INDICATOR */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '18px 24px',
          marginBottom: '32px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', position: 'relative' }}>
            {[
              { num: 1, label: 'Preferences' },
              { num: 2, label: 'Care & Routine' },
              { num: 3, label: 'Add-ons & Schedule' },
              { num: 4, label: 'Review & Match' }
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
                    margin: '0 auto 8px',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? `0 4px 12px ${theme.color}44` : 'none'
                  }}>
                    {isDone ? <HiOutlineCheckCircle size={22} /> : s.num}
                  </div>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? 'var(--navy-900)' : '#64748b'
                  }}>
                    {s.label}
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
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <HiOutlineInformationCircle size={22} />
            {errorMsg}
          </div>
        )}

        {/* MAIN INTERACTIVE CONTAINER */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* FLOW: BOARDING & SITTING */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {flowType === 'boarding' && (
            <div>
              {/* STEP 1: DATES & MODEL */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* DATES PICKER */}
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HiOutlineCalendarDays size={22} color={theme.color} /> Select Boarding Dates
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Check-in Date (Drop off after 08:00 AM)
                        </label>
                        <input
                          type="date"
                          value={checkInDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Check-out Date (Pick up before 08:00 PM)
                        </label>
                        <input
                          type="date"
                          value={checkOutDate}
                          min={checkInDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600 }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', background: '#f0fdf4', padding: '10px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700 }}>
                      <HiOutlineCheckBadge size={20} />
                      Stay Duration: {boardingNights} {boardingNights === 1 ? 'Night' : 'Nights'} calculated
                      {boardingNights >= 5 && ' • 🎉 5+ Nights Long Stay Discount applied!'}
                    </div>
                  </div>

                  {/* BOARDING TIERS */}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                      Choose Boarding Environment for {petNameParam}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                      {BOARDING_TIERS.map((tier) => {
                        const isSelected = boardingTier === tier.id;
                        return (
                          <div
                            key={tier.id}
                            onClick={() => setBoardingTier(tier.id)}
                            style={{
                              background: isSelected ? '#fff5f5' : 'white',
                              border: isSelected ? '2px solid #ef4444' : '1px solid #e2e8f0',
                              borderRadius: '18px',
                              padding: '22px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: isSelected ? '0 8px 20px rgba(239, 68, 68, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)',
                              transition: 'all 0.2s ease',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <span style={{
                                background: isSelected ? '#ef4444' : '#f1f5f9',
                                color: isSelected ? 'white' : '#475569',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '4px 10px',
                                borderRadius: '20px'
                              }}>
                                {tier.badge}
                              </span>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ef4444' }}>
                                  ₹{tier.pricePerNight}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}> /night</span>
                              </div>
                            </div>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '4px 0 8px' }}>
                              {tier.name}
                            </h4>
                            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, margin: 0, flex: 1 }}>
                              {tier.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DIET & TEMPERAMENT */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* MEAL PREFERENCE */}
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      🍲 Feeding & Nutrition Routine
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      {[
                        { id: 'provided', name: 'Parent-Provided Food', extra: 'Included (₹0)', desc: 'We feed your pet\'s exact measured kibble or home rations brought by you.' },
                        { id: 'fresh-cooked', name: 'Fresh Homestyle Chicken & Rice', extra: '+₹199 /day', desc: 'Cooked fresh twice daily with boiled eggs and seasonal pumpkin/carrots.' },
                        { id: 'premium-kibble', name: 'Grain-Free Royal Canin / Farmina', extra: '+₹249 /day', desc: 'High-protein veterinary-approved premium kibble with wet gravy toppers.' }
                      ].map((diet) => {
                        const isSelected = boardingDiet === diet.id;
                        return (
                          <div
                            key={diet.id}
                            onClick={() => setBoardingDiet(diet.id)}
                            style={{
                              border: isSelected ? '2px solid #ef4444' : '1px solid #e2e8f0',
                              background: isSelected ? '#fff5f5' : 'white',
                              borderRadius: '16px',
                              padding: '18px',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{diet.name}</span>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef4444' }}>{diet.extra}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{diet.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* TEMPERAMENT & ROUTINE */}
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      🐕 Temperament with Other Pets
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                      {[
                        { id: 'social', title: 'Loves Other Pets', badge: 'Playgroup Friendly', desc: 'Loves romping with friendly dogs in fenced lawn.' },
                        { id: 'selective', title: 'Selective / Slow Intro', badge: '1-on-1 Focus', desc: 'Prefers human company or calm slow supervised introductions.' },
                        { id: 'solo', title: 'Solo Stay Only', badge: 'Zero Other Pets', desc: 'Strict private suite with zero interaction with other animals.' }
                      ].map((temp) => (
                        <div
                          key={temp.id}
                          onClick={() => setBoardingTemperament(temp.id)}
                          style={{
                            border: boardingTemperament === temp.id ? '2px solid #ef4444' : '1px solid #e2e8f0',
                            background: boardingTemperament === temp.id ? '#fff5f5' : 'white',
                            borderRadius: '14px',
                            padding: '16px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--navy-900)', marginBottom: '4px' }}>
                            {temp.title}
                          </div>
                          <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                            {temp.badge}
                          </span>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '8px 0 0', lineHeight: 1.4 }}>
                            {temp.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* NOTES & WALKS */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Special Instructions, Medication or Allergies:
                      </label>
                      <textarea
                        rows={3}
                        value={boardingNotes}
                        onChange={(e) => setBoardingNotes(e.target.value)}
                        placeholder="e.g. Needs ear drops after dinner, allergic to chicken skin, afraid of thunderstorms..."
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: TRUST SHIELD & ADDONS */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* PET PARENT SAFETY SHIELD */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <HiOutlineShieldCheck size={28} color="#4ade80" />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                        ServeCircle Pet Parent Trust Guarantee™ (Included Free)
                      </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>📹</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>3x Daily WhatsApp Video</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Breakfast, afternoon play & bedtime updates sent directly to your phone.</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>🩺</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>24/7 Vet On-Call</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Instant tele-vet consultations and emergency partner animal hospital protocol.</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>👮‍♂️</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>Police-Checked Hosts</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>100% verified pet parents with fenced balconies and clean sanitized floors.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OPTIONAL ADDONS */}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                      Recommended Care Add-ons for {petNameParam}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {BOARDING_ADDONS_LIST.map((addon) => {
                        const isAdded = boardingAddons.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(boardingAddons, setBoardingAddons, addon.id)}
                            style={{
                              border: isAdded ? '2px solid #ef4444' : '1px solid #e2e8f0',
                              background: isAdded ? '#fff5f5' : 'white',
                              borderRadius: '16px',
                              padding: '18px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{addon.name}</span>
                                <span style={{ fontWeight: 900, color: '#ef4444', fontSize: '1rem' }}>+₹{addon.price}</span>
                              </div>
                              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{addon.desc}</p>
                            </div>
                            <div style={{ marginTop: '14px', textAlign: 'right' }}>
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: isAdded ? '#dc2626' : '#64748b'
                              }}>
                                {isAdded ? '✓ Added to stay' : '+ Click to add'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & MATCH */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* ASSIGNED HOST CARD */}
                  <div className="card" style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        fontWeight: 900
                      }}>
                        🏡
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy-900)', margin: 0 }}>
                            Sneha & Rohit - Paw Haven Homestay
                          </h4>
                          <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                            Top Rated Host
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span>⭐ 4.98 (140+ Boarders)</span>
                          <span>📍 3.2 km away</span>
                          <span>🔒 Police Verified</span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '6px 0 0' }}>
                          "We have a 1,200 sq.ft fenced terrace garden. Max will receive endless cuddles, organic treats, and dedicated care."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ITEMIZED RECEIPT */}
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      📋 Booking Summary & Invoice
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#334155' }}>
                        <span>{calculation.label}</span>
                        <span style={{ fontWeight: 700 }}>₹{calculation.base}</span>
                      </div>
                      {boardingAddons.map(id => {
                        const addon = BOARDING_ADDONS_LIST.find(a => a.id === id);
                        if (!addon) return null;
                        return (
                          <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                            <span>+ {addon.name}</span>
                            <span style={{ fontWeight: 600 }}>₹{addon.price}</span>
                          </div>
                        );
                      })}
                      {calculation.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#16a34a' }}>
                          <span>Long Stay Courtesy Discount</span>
                          <span style={{ fontWeight: 700 }}>-₹{calculation.discount}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                        <span>3x Daily WhatsApp Video Updates & Vet Backup</span>
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>FREE (₹0)</span>
                      </div>
                      <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                        <span>Total Payable</span>
                        <span style={{ color: '#ef4444' }}>₹{calculation.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* FLOW: CERTIFIED TRAINING */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {flowType === 'training' && (
            <div>
              {/* STEP 1: PROGRAM & PACKAGES */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* SELECT TRAINING PROGRAM */}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                      Select Training Focus for {petNameParam}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {TRAINING_PROGRAMS.map((prog) => {
                        const isSelected = trainingProgram === prog.id;
                        return (
                          <div
                            key={prog.id}
                            onClick={() => setTrainingProgram(prog.id)}
                            style={{
                              background: isSelected ? '#fffbeb' : 'white',
                              border: isSelected ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                              borderRadius: '16px',
                              padding: '20px',
                              cursor: 'pointer',
                              boxShadow: isSelected ? '0 6px 18px rgba(245, 158, 11, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                            }}
                          >
                            <span style={{
                              background: isSelected ? '#f59e0b' : '#f1f5f9',
                              color: isSelected ? 'white' : '#475569',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '12px'
                            }}>
                              {prog.badge}
                            </span>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '8px 0 6px' }}>
                              {prog.name}
                            </h4>
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                              {prog.focus}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SELECT PACKAGE */}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                      Choose Coaching Package
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                      {TRAINING_PACKAGES.map((pkg) => {
                        const isSelected = trainingPackage === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setTrainingPackage(pkg.id)}
                            style={{
                              background: isSelected ? '#fffbeb' : 'white',
                              border: isSelected ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                              borderRadius: '18px',
                              padding: '22px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: isSelected ? '0 8px 20px rgba(245, 158, 11, 0.18)' : '0 2px 4px rgba(0,0,0,0.03)'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <span style={{
                                  background: isSelected ? '#f59e0b' : '#f1f5f9',
                                  color: isSelected ? 'white' : '#475569',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '4px 10px',
                                  borderRadius: '20px'
                                }}>
                                  {pkg.badge}
                                </span>
                                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f59e0b' }}>
                                  ₹{pkg.price}
                                </span>
                              </div>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '4px 0 4px' }}>
                                {pkg.name}
                              </h4>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginBottom: '8px' }}>
                                ⏱️ {pkg.sessions}
                              </div>
                              <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                                {pkg.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: METHODOLOGY & SCHEDULE */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* FORCE-FREE PROMISE BANNER */}
                  <div style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '1px solid #fde68a',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '2.4rem' }}>🌟</span>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#92400e', margin: '0 0 4px' }}>
                        100% Positive Reinforcement (Force-Free Guarantee)
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0, lineHeight: 1.4 }}>
                        We adhere strictly to LIMA principles. We NEVER use shock collars, choke chains, shouting, or fear. All learning is driven by rewards, games, and genuine bonding.
                      </p>
                    </div>
                  </div>

                  {/* SCHEDULE SELECTION */}
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      📅 Preferred Days & Timings
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Preferred Days
                        </label>
                        <select
                          value={trainingDays}
                          onChange={(e) => setTrainingDays(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          <option>Weekends (Saturday & Sunday)</option>
                          <option>Weekdays (Mon - Wed - Fri)</option>
                          <option>Alternate Evenings (Tue - Thu - Sat)</option>
                          <option>Trainer Flexible / On Demand</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Preferred Time Slot
                        </label>
                        <select
                          value={trainingSlot}
                          onChange={(e) => setTrainingSlot(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          <option>Morning Mindful Slot (07:30 AM - 09:30 AM)</option>
                          <option>Afternoon Calm Slot (11:30 AM - 01:30 PM)</option>
                          <option>Evening Focus Slot (05:00 PM - 07:00 PM)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Home Address for Trainer Sessions:
                      </label>
                      <input
                        type="text"
                        value={trainingAddress}
                        onChange={(e) => setTrainingAddress(e.target.value)}
                        placeholder="House / Flat No., Society, Landmark, City"
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', marginBottom: '16px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Specific Behavioral Challenges or Target Goals:
                      </label>
                      <textarea
                        rows={2}
                        value={trainingNotes}
                        onChange={(e) => setTrainingNotes(e.target.value)}
                        placeholder="e.g. Pulls on leash when seeing other dogs, chews shoes when left alone..."
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: GEAR & ADDONS */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                    Recommended Training Gear Kits
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {TRAINING_ADDONS_LIST.map((addon) => {
                      const isAdded = trainingAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(trainingAddons, setTrainingAddons, addon.id)}
                          style={{
                            border: isAdded ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                            background: isAdded ? '#fffbeb' : 'white',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{addon.name}</span>
                              <span style={{ fontWeight: 900, color: '#f59e0b', fontSize: '1rem' }}>+₹{addon.price}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{addon.desc}</p>
                          </div>
                          <div style={{ marginTop: '14px', textAlign: 'right' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: isAdded ? '#b45309' : '#64748b'
                            }}>
                              {isAdded ? '✓ Kit Added' : '+ Add Gear to Plan'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* ASSIGNED TRAINER CARD */}
                  <div className="card" style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#fef3c7',
                      color: '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      fontWeight: 900
                    }}>
                      🎓
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy-900)', margin: 0 }}>
                          Coach Vikramaditya Singh
                        </h4>
                        <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                          KCI Certified Behaviorist
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>⭐ 5.0 (450+ Pets Trained)</span>
                        <span>🎖️ 8+ Years Experience</span>
                        <span>📍 In-Home Visits</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '6px 0 0' }}>
                        "Every dog communicates with clarity once we understand their motivation. I look forward to working with {petNameParam}!"
                      </p>
                    </div>
                  </div>

                  {/* ITEMIZED RECEIPT */}
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      📋 Training Fee Summary
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#334155' }}>
                        <span>{calculation.label}</span>
                        <span style={{ fontWeight: 700 }}>₹{calculation.base}</span>
                      </div>
                      {trainingAddons.map(id => {
                        const addon = TRAINING_ADDONS_LIST.find(a => a.id === id);
                        if (!addon) return null;
                        return (
                          <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                            <span>+ {addon.name}</span>
                            <span style={{ fontWeight: 600 }}>₹{addon.price}</span>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                        <span>Personalized Homework Diary & Video Evaluation</span>
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>FREE (₹0)</span>
                      </div>
                      <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                        <span>Total Investment</span>
                        <span style={{ color: '#f59e0b' }}>₹{calculation.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* FLOW: PET PHOTOGRAPHY */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {flowType === 'photography' && (
            <div>
              {/* STEP 1: SETTING & THEME */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                    Select Photoshoot Environment for {petNameParam}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                    {PHOTO_SETTINGS.map((setting) => {
                      const isSelected = photoSetting === setting.id;
                      return (
                        <div
                          key={setting.id}
                          onClick={() => setPhotoSetting(setting.id)}
                          style={{
                            background: isSelected ? '#fdf4ff' : 'white',
                            border: isSelected ? '2px solid #c026d3' : '1px solid #e2e8f0',
                            borderRadius: '18px',
                            padding: '22px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isSelected ? '0 8px 20px rgba(192, 38, 211, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <span style={{
                              background: isSelected ? '#c026d3' : '#f1f5f9',
                              color: isSelected ? 'white' : '#475569',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '20px'
                            }}>
                              {setting.badge}
                            </span>
                            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#c026d3' }}>
                              ₹{setting.basePrice}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '4px 0 8px' }}>
                            {setting.name}
                          </h4>
                          <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.4, margin: 0, flex: 1 }}>
                            {setting.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: DELIVERABLES & ALBUM PACKAGES */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                    Select Deliverables & Album Collection
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                    {PHOTO_PACKAGES.map((pkg) => {
                      const isSelected = photoPackage === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setPhotoPackage(pkg.id)}
                          style={{
                            background: isSelected ? '#fdf4ff' : 'white',
                            border: isSelected ? '2px solid #c026d3' : '1px solid #e2e8f0',
                            borderRadius: '18px',
                            padding: '22px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isSelected ? '0 8px 20px rgba(192, 38, 211, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <span style={{
                              background: isSelected ? '#c026d3' : '#f1f5f9',
                              color: isSelected ? 'white' : '#475569',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '20px'
                            }}>
                              {pkg.badge}
                            </span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#c026d3' }}>
                              {pkg.extraPrice === 0 ? 'Included' : `+₹${pkg.extraPrice}`}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '4px 0 12px' }}>
                            {pkg.name}
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {pkg.perks.map((perk, i) => (
                              <li key={i}>{perk}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: SCHEDULE, LOCATION & ADDONS */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      📸 Photoshoot Slot & Location
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Shoot Date
                        </label>
                        <input
                          type="date"
                          value={photoDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setPhotoDate(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Lighting Time Slot
                        </label>
                        <select
                          value={photoSlot}
                          onChange={(e) => setPhotoSlot(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          <option>Morning Golden Hour (07:00 AM - 09:00 AM)</option>
                          <option>Afternoon Studio Slot (02:00 PM - 04:00 PM)</option>
                          <option>Sunset Golden Hour (04:30 PM - 06:30 PM)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Shoot Address / Desired Park:
                      </label>
                      <input
                        type="text"
                        value={photoLocationAddress}
                        onChange={(e) => setPhotoLocationAddress(e.target.value)}
                        placeholder="Home Address or Park Name"
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  {/* PHOTOGRAPHY ADDONS */}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                      Photoshoot Extras
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {PHOTO_ADDONS_LIST.map((addon) => {
                        const isAdded = photoAddons.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(photoAddons, setPhotoAddons, addon.id)}
                            style={{
                              border: isAdded ? '2px solid #c026d3' : '1px solid #e2e8f0',
                              background: isAdded ? '#fdf4ff' : 'white',
                              borderRadius: '16px',
                              padding: '18px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{addon.name}</span>
                                <span style={{ fontWeight: 900, color: '#c026d3', fontSize: '1rem' }}>+₹{addon.price}</span>
                              </div>
                              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{addon.desc}</p>
                            </div>
                            <div style={{ marginTop: '14px', textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isAdded ? '#86198f' : '#64748b' }}>
                                {isAdded ? '✓ Added' : '+ Add Extra'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div className="card" style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#fae8ff',
                      color: '#86198f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      fontWeight: 900
                    }}>
                      📸
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy-900)', margin: 0 }}>
                          Priya Sharma — Lead Pet Photographer
                        </h4>
                        <span style={{ background: '#fae8ff', color: '#86198f', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                          Featured in PetLife India
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>⭐ 4.99 (260+ Shoots)</span>
                        <span>📷 Sony A1 Full-Frame 50MP</span>
                        <span>🦴 Squeakers & Treats Included</span>
                      </div>
                    </div>
                  </div>

                  {/* ITEMIZED RECEIPT */}
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      📋 Photoshoot Invoice
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#334155' }}>
                        <span>{calculation.label}</span>
                        <span style={{ fontWeight: 700 }}>₹{calculation.base}</span>
                      </div>
                      {photoAddons.map(id => {
                        const addon = PHOTO_ADDONS_LIST.find(a => a.id === id);
                        if (!addon) return null;
                        return (
                          <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                            <span>+ {addon.name}</span>
                            <span style={{ fontWeight: 600 }}>₹{addon.price}</span>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                        <span>1 Year Private Digital Cloud Gallery</span>
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>FREE (₹0)</span>
                      </div>
                      <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                        <span>Total Payable</span>
                        <span style={{ color: '#c026d3' }}>₹{calculation.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* FLOW: SUBSCRIPTION BOX */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {flowType === 'subscription' && (
            <div>
              {/* STEP 1: PET PROFILE & DIET */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      🐾 Pet Profile Formulations
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Life Stage
                        </label>
                        <select
                          value={subPetAgeGroup}
                          onChange={(e) => setSubPetAgeGroup(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          <option>Puppy (&lt; 12 Months)</option>
                          <option>Adult (1 - 7 Years)</option>
                          <option>Senior (7+ Years)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Pet Weight Category
                        </label>
                        <select
                          value={subPetWeight}
                          onChange={(e) => setSubPetWeight(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          <option>Toy (&lt; 5 kg)</option>
                          <option>Small (5 - 10 kg)</option>
                          <option>Medium (10 - 25 kg)</option>
                          <option>Large (25 - 45 kg)</option>
                          <option>Giant (45+ kg)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* RECIPES */}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                      Select Nutritional Recipe for {petNameParam}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {SUB_DIET_RECIPES.map((recipe) => {
                        const isSelected = subDietRecipe === recipe.id;
                        return (
                          <div
                            key={recipe.id}
                            onClick={() => setSubDietRecipe(recipe.id)}
                            style={{
                              background: isSelected ? '#f0fdf4' : 'white',
                              border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                              borderRadius: '16px',
                              padding: '20px',
                              cursor: 'pointer',
                              boxShadow: isSelected ? '0 6px 18px rgba(22, 163, 74, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                            }}
                          >
                            <span style={{
                              background: isSelected ? '#16a34a' : '#f1f5f9',
                              color: isSelected ? 'white' : '#475569',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '12px'
                            }}>
                              {recipe.tag}
                            </span>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '8px 0 6px' }}>
                              {recipe.name}
                            </h4>
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                              {recipe.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SUBSCRIPTION TIER */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                    Choose Monthly Box Plan
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {SUB_TIERS.map((tier) => {
                      const isSelected = subTier === tier.id;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => setSubTier(tier.id)}
                          style={{
                            background: isSelected ? '#f0fdf4' : 'white',
                            border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                            borderRadius: '20px',
                            padding: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: isSelected ? '0 10px 25px rgba(22, 163, 74, 0.18)' : '0 2px 4px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                              <span style={{
                                background: isSelected ? '#16a34a' : '#f1f5f9',
                                color: isSelected ? 'white' : '#475569',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '4px 10px',
                                borderRadius: '20px'
                              }}>
                                {tier.badge}
                              </span>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>
                                  ₹{tier.monthlyPrice}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}> /month</span>
                              </div>
                            </div>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--navy-900)', margin: '0 0 16px' }}>
                              {tier.name}
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.84rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {tier.highlights.map((h, i) => (
                                <li key={i}>{h}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: DISPATCH & WELLNESS ADDONS */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      🚚 Delivery Date & Chew Toughness
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Monthly Dispatch Day
                        </label>
                        <select
                          value={subDeliveryDay}
                          onChange={(e) => setSubDeliveryDay(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          <option>1st of every month (Standard Cycle)</option>
                          <option>15th of every month (Mid-month Cycle)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                          Chew Preference
                        </label>
                        <select
                          value={subChewPreference}
                          onChange={(e) => setSubChewPreference(e.target.value)}
                          className="input"
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          <option>Heavy Chewer (Natural Antlers & Yak Chews)</option>
                          <option>Gentle / Soft Chewer (Soft Biscuits & Jerky)</option>
                          <option>Puppy Teething (Flexible Dental Rubbers)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* WELLNESS ADDONS */}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                      Monthly Preventative Healthcare Add-ons
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {SUB_ADDONS_LIST.map((addon) => {
                        const isAdded = subAddons.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(subAddons, setSubAddons, addon.id)}
                            style={{
                              border: isAdded ? '2px solid #16a34a' : '1px solid #e2e8f0',
                              background: isAdded ? '#f0fdf4' : 'white',
                              borderRadius: '16px',
                              padding: '18px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{addon.name}</span>
                                <span style={{ fontWeight: 900, color: '#16a34a', fontSize: '1rem' }}>+₹{addon.price}/mo</span>
                              </div>
                              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{addon.desc}</p>
                            </div>
                            <div style={{ marginTop: '14px', textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isAdded ? '#15803d' : '#64748b' }}>
                                {isAdded ? '✓ Added to box' : '+ Add to Monthly Box'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {/* ZERO LOCK-IN GUARANTEE */}
                  <div style={{
                    background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
                    color: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <span style={{ fontSize: '2.5rem' }}>🛡️</span>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 4px' }}>
                        Zero-Lock-in Commitment
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#bbf7d0', margin: 0, lineHeight: 1.4 }}>
                        Pause anytime, skip any month, or cancel with 1-click right inside your customer dashboard. No cancellation fees, no phone calls needed.
                      </p>
                    </div>
                  </div>

                  {/* ITEMIZED RECEIPT */}
                  <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                      📋 Monthly Subscription Breakdown
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#334155' }}>
                        <span>{calculation.label}</span>
                        <span style={{ fontWeight: 700 }}>₹{calculation.base}</span>
                      </div>
                      {subAddons.map(id => {
                        const addon = SUB_ADDONS_LIST.find(a => a.id === id);
                        if (!addon) return null;
                        return (
                          <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                            <span>+ {addon.name}</span>
                            <span style={{ fontWeight: 600 }}>₹{addon.price}/mo</span>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#16a34a' }}>
                        <span>First Month Welcome Discount</span>
                        <span style={{ fontWeight: 700 }}>-₹{calculation.discount}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                        <span>Monthly Doorstep Express Shipping</span>
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>FREE (₹0)</span>
                      </div>
                      <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                        <span>1st Month Total</span>
                        <span style={{ color: '#16a34a' }}>₹{calculation.total}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'right' }}>
                        Renews monthly at ₹{calculation.base + calculation.addonsTotal}/mo • Cancel or pause anytime
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOTTOM FLOATING / FIXED ACTION DOCK */}
          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px 24px',
            marginTop: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                {step === 4 ? 'Total Amount' : 'Estimated Pricing'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: theme.color }}>
                  ₹{calculation.total}
                </span>
                {flowType === 'subscription' && (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/first month</span>
                )}
                {calculation.discount > 0 && (
                  <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    Save ₹{calculation.discount}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn"
                  style={{
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="btn"
                style={{
                  background: theme.color,
                  color: 'white',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px ${theme.color}44`
                }}
              >
                {loading ? 'Processing...' : step === 4 ? (
                  <>Proceed to Booking <HiOutlineCheckCircle size={20} /></>
                ) : (
                  <>Continue <HiOutlineArrowRight size={18} /></>
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
