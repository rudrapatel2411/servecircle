import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineUserGroup,
  HiOutlineStar,
  HiOutlineInformationCircle,
  HiOutlineArrowRight,
  HiOutlineCheckBadge
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const HealthWellnessDemo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'iv'; // 'iv', 'sports', or 'elderly'

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ─────────────────────────────────────────────────────────────
  // 1. IV DRIP THERAPY STATE
  // ─────────────────────────────────────────────────────────────
  const [ivDripId, setIvDripId] = useState('glutathione');
  const [ivPatientName, setIvPatientName] = useState('Rudra Patel');
  const [ivPatientAge, setIvPatientAge] = useState('28');
  const [ivAllergies, setIvAllergies] = useState('None');
  const [ivHasConditionConsent, setIvHasConditionConsent] = useState(true);
  const [ivScheduleDate, setIvScheduleDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [ivSlot, setIvSlot] = useState('Morning Energy Slot (09:00 AM - 11:00 AM)');
  const [ivAddress, setIvAddress] = useState('Bunglow 14, Orchid Greens, South Bopal');
  const [ivAddons, setIvAddons] = useState(['d3-shot']);

  const IV_DRIPS = [
    {
      id: 'glutathione',
      title: 'Glutathione Royal Radiance & Detox',
      price: 2999,
      badge: 'Skin & Cellular Glow',
      composition: '1200mg Japanese Glutathione + High-Dose Vitamin C + Alpha Lipoic Acid',
      desc: 'Master antioxidant formula for luminous skin glow, collagen synthesis, and deep liver detoxification.'
    },
    {
      id: 'immunity',
      title: 'Immunity Mega-Shield & Vitality',
      price: 2499,
      badge: 'Fast Cellular Rebound',
      composition: 'High-Dose Vitamin C, Zinc Sulfate, Meyer’s B-Complex & Methylcobalamin B12',
      desc: 'Rapid immune boost to fight seasonal flu, fatigue, chronic exhaustion, and stress burnout.'
    },
    {
      id: 'hangover',
      title: 'Rapid Hydration & Hangover Detox',
      price: 1999,
      badge: 'Instant Relief (45 Mins)',
      composition: 'Ringer’s Lactate, Ondansetron, Electrolytes, Magnesium & B-Vitamins',
      desc: 'Immediate nausea reduction, headache relief, and rapid vascular rehydration after celebrations.'
    },
    {
      id: 'athletic',
      title: 'Athletic Muscle Recovery & Electrolytes',
      price: 2499,
      badge: 'Lactic Acid Flush',
      composition: 'L-Carnitine, Taurine, Amino Acids, Magnesium Sulfate & Balanced Saline',
      desc: 'Accelerates muscle repair, prevents cramping, and restores glycogen reserves after intense workouts.'
    },
    {
      id: 'nad-plus',
      title: 'NAD+ Cellular Anti-Aging & Brain Focus',
      price: 4499,
      badge: 'Executive Longevity',
      composition: 'Pure Coenzyme NAD+ (250mg) + Mitochondria Support Complex',
      desc: 'Reverses brain fog, elevates mental focus, restores sleep cycles, and repairs cellular DNA damage.'
    }
  ];

  const IV_ADDONS = [
    { id: 'd3-shot', name: 'Vitamin D3 (60,000 IU) / B12 Intramuscular Booster', price: 399, desc: 'Single-shot booster for bone density & sustained energy' },
    { id: 'sugar-hb', name: 'Instant 5-Minute Blood Sugar & Hb Spot Check', price: 199, desc: 'Capillary blood check with digital report by attending nurse' },
    { id: 'mask-comfort', name: 'Calming Aromatherapy & Organic Eye Mask', price: 149, desc: 'Lavender calming eye compress to relax during the 45-min infusion' }
  ];

  // ─────────────────────────────────────────────────────────────
  // 2. SPORTS RECOVERY STATE
  // ─────────────────────────────────────────────────────────────
  const [sportsTargetArea, setSportsTargetArea] = useState('Lower Back & Glutes / Sciatica');
  const [sportsPainScale, setSportsPainScale] = useState('Moderate Sore Knots (Pain Scale 5/10)');
  const [sportsModalityId, setSportsModalityId] = useState('cupping-theragun');
  const [sportsDate, setSportsDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [sportsSlot, setSportsSlot] = useState('Evening Post-Workout (05:30 PM - 07:00 PM)');
  const [sportsAddress, setSportsAddress] = useState('Flat 402, Green Meadows, Sector 14');
  const [sportsAddons, setSportsAddons] = useState(['compression-boots']);

  const SPORTS_MODALITIES = [
    {
      id: 'myofascial',
      title: 'Targeted Myofascial Deep Tissue & Active Stretch',
      price: 1699,
      duration: '60 Minutes',
      badge: 'Deep Release',
      desc: 'Neuromuscular trigger point therapy with herbal arnica balm to break chronic muscle knots.'
    },
    {
      id: 'cupping-theragun',
      title: 'Theragun PRO Percussion & Myofascial Cupping',
      price: 2299,
      duration: '75 Minutes',
      badge: 'Most Popular • Pro Recovery',
      desc: 'Medical-grade pneumatic cupping for microvascular blood flow + 16mm deep Theragun percussion.'
    },
    {
      id: 'elite-protocol',
      title: 'Elite Athlete Full-Spectrum Protocol',
      price: 2999,
      duration: '90 Minutes',
      badge: 'Comprehensive Rehab',
      desc: 'Sports physio biomechanical audit, dry cupping, assisted PNF stretching, and compression therapy.'
    }
  ];

  const SPORTS_ADDONS = [
    { id: 'compression-boots', name: 'Pneumatic Compression Boots Lymphatic Flush (20 Mins)', price: 499, desc: 'Normatec-style intermittent pneumatic compression to flush heavy legs' },
    { id: 'hot-stone', name: 'Hot Basalt Volcanic Stone Compression Therapy', price: 399, desc: 'Thermal heat penetration for deep spinal and lower back release' },
    { id: 'rocktape', name: 'Kinesiology Taping (RockTape) Joint Support', price: 299, desc: 'Waterproof elastic therapeutic tape for knees, shoulders or lower back' }
  ];

  // ─────────────────────────────────────────────────────────────
  // 3. ELDERLY PHYSIO SUBSCRIPTION STATE
  // ─────────────────────────────────────────────────────────────
  const [elderlyCondition, setElderlyCondition] = useState('knee-osteoarthritis');
  const [elderlyMobility, setElderlyMobility] = useState('Walks with Stick / Support');
  const [elderlyPlanId, setElderlyPlanId] = useState('monthly-8');
  const [elderlyParentName, setElderlyParentName] = useState('Suresh Patel');
  const [elderlyParentAge, setElderlyParentAge] = useState('68');
  const [elderlyChildPhone, setElderlyChildPhone] = useState('+91 98765 43210');
  const [elderlyDays, setElderlyDays] = useState('Mon - Wed - Fri (3 Days / Week)');
  const [elderlySlot, setElderlySlot] = useState('Morning Gentle Slot (10:00 AM - 11:30 AM)');
  const [elderlyAddress, setElderlyAddress] = useState('Bunglow 14, Orchid Greens, South Bopal');
  const [elderlyAddons, setElderlyAddons] = useState(['home-safety']);

  const ELDERLY_CONDITIONS = [
    { id: 'knee-osteoarthritis', name: 'Knee Osteoarthritis & Joint Stiffness', badge: 'Mobility Rehab', desc: 'Quadriceps strengthening, joint lubrication, and pain-free standing.' },
    { id: 'stroke-neuro', name: 'Post-Stroke Neuro Rehabilitation', badge: 'Neuro Specialist', desc: 'Gait re-education, limb motor recovery, and neurological balance training.' },
    { id: 'spine-cervical', name: 'Cervical / Lumbar Spondylosis & Disc Care', badge: 'Postural Alignment', desc: 'Gentle spinal decompression, core stability, and nerve mobilization.' },
    { id: 'fall-prevention', name: 'Age-Related Frailty & Fall Prevention', badge: 'Balance & Confidence', desc: 'Proprioception training, dynamic balance, and safe transfer techniques.' },
    { id: 'parkinsons', name: 'Parkinson’s Functional Motor Coaching', badge: 'Rhythmic Movement', desc: 'High-amplitude movement training to overcome freezing and tremors.' }
  ];

  const ELDERLY_PLANS = [
    {
      id: 'trial',
      title: '1 Trial Assessment Session',
      price: 799,
      sessions: '1 Session (60 mins)',
      badge: 'Introductory Audit',
      desc: 'In-home geriatric evaluation, gait analysis, joint range check & customized home exercise roadmap.'
    },
    {
      id: 'monthly-8',
      title: 'Bi-Weekly Mobility Plan (8 Sessions)',
      price: 4999,
      sessions: '8 In-Home Visits (₹625 / session)',
      badge: 'Recommended • Knee & Spine Care',
      desc: 'Consistent visits 2x/week by the same assigned physiotherapist with weekly family progress updates.'
    },
    {
      id: 'monthly-16',
      title: 'Intensive Daily Care Plan (16 Sessions)',
      price: 8999,
      sessions: '16 In-Home Visits (₹562 / session)',
      badge: 'Best Value • Stroke & Post-Surgery',
      desc: 'Intensive rehabilitation 4x/week, digital TENS therapy, and dedicated family WhatsApp video reports.'
    }
  ];

  const ELDERLY_ADDONS = [
    { id: 'home-safety', name: 'Senior Home Safety & Fall-Risk Audit', price: 499, desc: 'Physiotherapist reviews bathroom grab bars, floor slips, and bed heights' },
    { id: 'nurse-vitals', name: 'Monthly Geriatric Nurse Vitals & 12-Lead ECG Visit', price: 699, desc: 'Nurse checks BP, Blood Sugar, SpO2, and baseline 12-lead portable ECG' }
  ];

  // ─────────────────────────────────────────────────────────────
  // THEME & HEADER CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  const theme = useMemo(() => {
    if (type === 'iv') {
      return {
        title: 'IV Drip Therapy at Home',
        subtitle: 'Hospital-grade sterile micronutrient drips administered by certified BSc Nursing Officers with doctor tele-signoff',
        color: '#0ea5e9',
        accentBg: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
        softBg: '#e0f2fe',
        badgeText: 'Home Infusion Clinic',
        iconEmoji: '💧'
      };
    }
    if (type === 'sports') {
      return {
        title: 'Sports Recovery & Pain Management',
        subtitle: 'Targeted deep myofascial release, Theragun PRO percussion, and medical pneumatic cupping by licensed sports physios',
        color: '#ea580c',
        accentBg: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        softBg: '#ffedd5',
        badgeText: 'Athletic Recovery Hub',
        iconEmoji: '⚡'
      };
    }
    return {
      title: 'Elderly In-Home Physiotherapy Subscription',
      subtitle: 'Compassionate, patient-centered geriatric physiotherapy to relieve arthritis, restore stroke mobility, and prevent falls',
      color: '#1d4ed8',
      accentBg: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
      softBg: '#e1ebf5',
      badgeText: 'Geriatric Care Plan',
      iconEmoji: '👵'
    };
  }, [type]);

  // ─────────────────────────────────────────────────────────────
  // PRICE CALCULATION
  // ─────────────────────────────────────────────────────────────
  const calculation = useMemo(() => {
    let base = 0;
    let addonsTotal = 0;
    let discount = 0;
    let label = '';

    if (type === 'iv') {
      const dripObj = IV_DRIPS.find(d => d.id === ivDripId) || IV_DRIPS[0];
      base = dripObj.price;
      label = dripObj.title;

      ivAddons.forEach(id => {
        const item = IV_ADDONS.find(a => a.id === id);
        if (item) addonsTotal += item.price;
      });

      discount = 200; // First booking courtesy discount
    } else if (type === 'sports') {
      const modObj = SPORTS_MODALITIES.find(m => m.id === sportsModalityId) || SPORTS_MODALITIES[1];
      base = modObj.price;
      label = modObj.title;

      sportsAddons.forEach(id => {
        const item = SPORTS_ADDONS.find(a => a.id === id);
        if (item) addonsTotal += item.price;
      });

      discount = 200;
    } else if (type === 'elderly') {
      const planObj = ELDERLY_PLANS.find(p => p.id === elderlyPlanId) || ELDERLY_PLANS[1];
      base = planObj.price;
      label = planObj.title;

      elderlyAddons.forEach(id => {
        const item = ELDERLY_ADDONS.find(a => a.id === id);
        if (item) addonsTotal += item.price;
      });

      if (elderlyPlanId !== 'trial') {
        discount = 500; // Senior care welcome subsidy
      }
    }

    const total = Math.max(0, base + addonsTotal - discount);
    return { base, addonsTotal, discount, total, label };
  }, [type, ivDripId, ivAddons, sportsModalityId, sportsAddons, elderlyPlanId, elderlyAddons]);

  // ─────────────────────────────────────────────────────────────
  // STEP NAVIGATION & VALIDATION
  // ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    setErrorMsg('');

    if (type === 'iv') {
      if (step === 2 && !ivHasConditionConsent) {
        setErrorMsg('Please confirm the clinical safety disclosure before proceeding.');
        return;
      }
      if (step === 3 && (!ivScheduleDate || !ivAddress.trim())) {
        setErrorMsg('Please provide your infusion date and home address.');
        return;
      }
    } else if (type === 'sports') {
      if (step === 3 && (!sportsDate || !sportsAddress.trim())) {
        setErrorMsg('Please select a session date and provide your home address.');
        return;
      }
    } else if (type === 'elderly') {
      if (step === 1 && !elderlyParentName.trim()) {
        setErrorMsg('Please provide the parent / patient name.');
        return;
      }
      if (step === 3 && (!elderlyChildPhone.trim() || !elderlyAddress.trim())) {
        setErrorMsg('Please enter your WhatsApp contact number for progress updates and home address.');
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
      navigate('/customer/health-wellness');
    }
  };

  const handleFinalize = () => {
    setLoading(true);
    setTimeout(() => {
      let serviceTitle = '';
      let notes = '';

      if (type === 'iv') {
        serviceTitle = `Home IV Therapy: ${IV_DRIPS.find(d => d.id === ivDripId)?.title}`;
        notes = `Patient: ${ivPatientName} (Age: ${ivPatientAge}). Date: ${ivScheduleDate} (${ivSlot}). Address: ${ivAddress}. Allergies: ${ivAllergies}. Tele-consult pre-approved.`;
      } else if (type === 'sports') {
        serviceTitle = `Sports Recovery: ${SPORTS_MODALITIES.find(m => m.id === sportsModalityId)?.title}`;
        notes = `Focus Area: ${sportsTargetArea} (${sportsPainScale}). Date: ${sportsDate} (${sportsSlot}). Address: ${sportsAddress}. Certified Sports Physio requested.`;
      } else if (type === 'elderly') {
        serviceTitle = `Elderly Care: ${ELDERLY_PLANS.find(p => p.id === elderlyPlanId)?.title}`;
        notes = `Parent: ${elderlyParentName} (Age: ${elderlyParentAge}). Condition: ${elderlyCondition}. Mobility: ${elderlyMobility}. Schedule: ${elderlyDays} (${elderlySlot}). Guardian WhatsApp: ${elderlyChildPhone}. Address: ${elderlyAddress}.`;
      }

      const queryParams = new URLSearchParams({
        service: serviceTitle,
        category: 'health-wellness',
        price: calculation.total.toString(),
        notes: notes,
        therapyType: type
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
            {step === 1 ? 'Back to Health Hub' : 'Previous Step'}
          </button>

          {/* CLINICAL TRUST BADGE */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            border: '1px solid #e2e8f0',
            padding: '8px 16px',
            borderRadius: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: 'var(--navy-900)'
          }}>
            <HiOutlineShieldCheck size={18} color="#10b981" />
            Licensed Clinical Protocols • Verified Medical Pros
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
            <p style={{ margin: 0, fontSize: '0.96rem', opacity: 0.95, lineHeight: 1.5, maxWidth: '640px' }}>
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
            fontSize: '2.5rem',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)'
          }}>
            {theme.iconEmoji}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { num: 1, label: 'Formulation' },
              { num: 2, label: 'Clinical Triage' },
              { num: 3, label: 'Schedule & Add-ons' },
              { num: 4, label: 'Review & Confirm' }
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

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* FLOW: IV DRIP THERAPY */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {type === 'iv' && (
          <div>
            {/* STEP 1: FORMULATION SELECTION */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                    Select Clinical IV Drip Formulation
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                    {IV_DRIPS.map((drip) => {
                      const isSelected = ivDripId === drip.id;
                      return (
                        <div
                          key={drip.id}
                          onClick={() => setIvDripId(drip.id)}
                          style={{
                            background: isSelected ? '#f0f9ff' : 'white',
                            border: isSelected ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                            borderRadius: '18px',
                            padding: '22px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isSelected ? '0 8px 20px rgba(14, 165, 233, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <span style={{
                              background: isSelected ? '#0ea5e9' : '#f1f5f9',
                              color: isSelected ? 'white' : '#475569',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '20px'
                            }}>
                              {drip.badge}
                            </span>
                            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0ea5e9' }}>
                              ₹{drip.price}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '4px 0 6px' }}>
                            {drip.title}
                          </h4>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', marginBottom: '8px' }}>
                            💊 {drip.composition}
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, margin: 0, flex: 1 }}>
                            {drip.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PATIENT INFO */}
                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    👤 Recipient Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Patient Full Name
                      </label>
                      <input
                        type="text"
                        value={ivPatientName}
                        onChange={(e) => setIvPatientName(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Patient Age
                      </label>
                      <input
                        type="number"
                        value={ivPatientAge}
                        onChange={(e) => setIvPatientAge(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CLINICAL SAFETY TRIAGE */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <HiOutlineShieldCheck size={28} color="#38bdf8" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                      Doctor Clinical Tele-Signoff (Included Free ₹0)
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: '0 0 16px', lineHeight: 1.5 }}>
                    For your total safety, our Medical Director Dr. Meera Iyer (MBBS, MD) performs a mandatory 2-minute clinical tele-signoff and checks your baseline health status before the attending nurse punctures the vein.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.82rem', color: '#94a3b8' }}>
                    <div>✓ 100% Sterile Hospital Cannula</div>
                    <div>✓ Pre-infusion Blood Pressure & SpO2 Check</div>
                    <div>✓ Bedside Registered ICU Nurse</div>
                  </div>
                </div>

                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    📋 Pre-Infusion Health Disclosure
                  </h3>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      Any known allergies to antibiotics, vitamins, sulfa drugs, or latex?
                    </label>
                    <input
                      type="text"
                      value={ivAllergies}
                      onChange={(e) => setIvAllergies(e.target.value)}
                      placeholder="e.g. None, or penicillin allergy"
                      className="input"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={ivHasConditionConsent}
                      onChange={(e) => setIvHasConditionConsent(e.target.checked)}
                      style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#0ea5e9' }}
                    />
                    <span style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.4, fontWeight: 600 }}>
                      I confirm that I do not have active congestive heart failure, severe untreated chronic kidney disease (dialysis), or G6PD deficiency requiring hospital-based ICU admission.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: SCHEDULE, ADDRESS & ADDONS */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    🕒 Nursing Visit Timing & Address
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Infusion Date
                      </label>
                      <input
                        type="date"
                        value={ivScheduleDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setIvScheduleDate(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Preferred Time Slot
                      </label>
                      <select
                        value={ivSlot}
                        onChange={(e) => setIvSlot(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      >
                        <option>Morning Energy Slot (09:00 AM - 11:00 AM)</option>
                        <option>Noon Boost Slot (12:00 PM - 02:00 PM)</option>
                        <option>Evening Relax Slot (04:00 PM - 06:00 PM)</option>
                        <option>Night SOS Recovery (07:30 PM - 09:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      Home Address for Nurse Visit:
                    </label>
                    <input
                      type="text"
                      value={ivAddress}
                      onChange={(e) => setIvAddress(e.target.value)}
                      placeholder="Flat / House No, Society / Apartment, City"
                      className="input"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* ADDONS */}
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                    Recommended Clinical Add-ons
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {IV_ADDONS.map((addon) => {
                      const isAdded = ivAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(ivAddons, setIvAddons, addon.id)}
                          style={{
                            border: isAdded ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                            background: isAdded ? '#f0f9ff' : 'white',
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
                              <span style={{ fontWeight: 900, color: '#0ea5e9', fontSize: '1rem' }}>+₹{addon.price}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{addon.desc}</p>
                          </div>
                          <div style={{ marginTop: '14px', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isAdded ? '#0284c7' : '#64748b' }}>
                              {isAdded ? '✓ Added to Visit' : '+ Add Clinical Extra'}
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
                    background: '#e0f2fe',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 900
                  }}>
                    🩺
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy-900)', margin: 0 }}>
                        Sister Ananya Roy, BSc Nursing
                      </h4>
                      <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                        BLS & ACLS Certified
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span>⭐ 4.98 (380+ Infusions)</span>
                      <span>🏥 Ex-Apollo ICU Nurse</span>
                      <span>🕒 45-Min Bedside Care</span>
                    </div>
                  </div>
                </div>

                {/* INVOICE */}
                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    📋 Medical Infusion Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#334155' }}>
                      <span>{calculation.label}</span>
                      <span style={{ fontWeight: 700 }}>₹{calculation.base}</span>
                    </div>
                    {ivAddons.map(id => {
                      const addon = IV_ADDONS.find(a => a.id === id);
                      if (!addon) return null;
                      return (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                          <span>+ {addon.name}</span>
                          <span style={{ fontWeight: 600 }}>₹{addon.price}</span>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#16a34a' }}>
                      <span>Doctor Tele-Signoff & Sterile Cannula Kit</span>
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>FREE (₹0)</span>
                    </div>
                    {calculation.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#16a34a' }}>
                        <span>First Session Wellness Subsidy</span>
                        <span style={{ fontWeight: 700 }}>-₹{calculation.discount}</span>
                      </div>
                    )}
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                      <span>Total Investment</span>
                      <span style={{ color: '#0ea5e9' }}>₹{calculation.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* FLOW: SPORTS RECOVERY & PAIN MANAGEMENT */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {type === 'sports' && (
          <div>
            {/* STEP 1: TARGET FOCUS AREA */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                    Select Body Target Focus Area
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {[
                      'Lower Back & Glutes / Sciatica',
                      'Shoulders, Rotator Cuff & Traps',
                      'Knees, Quads & IT Band Tightness',
                      'Cervical Neck & Desk Posture Knots',
                      'Full Body Athletic Overhaul'
                    ].map((area) => {
                      const isSelected = sportsTargetArea === area;
                      return (
                        <div
                          key={area}
                          onClick={() => setSportsTargetArea(area)}
                          style={{
                            background: isSelected ? '#ffedd5' : 'white',
                            border: isSelected ? '2px solid #ea580c' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '18px',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 6px 18px rgba(234, 88, 12, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                          }}
                        >
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                            {area}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    ⚡ Pain & Soreness Scale
                  </h3>
                  <select
                    value={sportsPainScale}
                    onChange={(e) => setSportsPainScale(e.target.value)}
                    className="input"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option>Mild Muscle Tightness (Pain Scale 2-3/10)</option>
                    <option>Moderate Sore Knots (Pain Scale 5/10)</option>
                    <option>Acute Post-Workout Lactic Soreness (Pain Scale 7/10)</option>
                    <option>Severe Chronic Trigger Point Restriction (Pain Scale 8-9/10)</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: MODALITY & PACKAGE */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                  Choose Recovery Protocol
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  {SPORTS_MODALITIES.map((mod) => {
                    const isSelected = sportsModalityId === mod.id;
                    return (
                      <div
                        key={mod.id}
                        onClick={() => setSportsModalityId(mod.id)}
                        style={{
                          background: isSelected ? '#ffedd5' : 'white',
                          border: isSelected ? '2px solid #ea580c' : '1px solid #e2e8f0',
                          borderRadius: '18px',
                          padding: '22px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: isSelected ? '0 8px 20px rgba(234, 88, 12, 0.18)' : '0 2px 4px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{
                            background: isSelected ? '#ea580c' : '#f1f5f9',
                            color: isSelected ? 'white' : '#475569',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '20px'
                          }}>
                            {mod.badge}
                          </span>
                          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ea580c' }}>
                            ₹{mod.price}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '4px 0 4px' }}>
                          {mod.title}
                        </h4>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c', marginBottom: '8px' }}>
                          ⏱️ {mod.duration}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                          {mod.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: SCHEDULE & ADDONS */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    🕒 Session Date, Time & Address
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Session Date
                      </label>
                      <input
                        type="date"
                        value={sportsDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSportsDate(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Time Slot
                      </label>
                      <select
                        value={sportsSlot}
                        onChange={(e) => setSportsSlot(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      >
                        <option>Morning Pre-Workout (07:30 AM - 09:00 AM)</option>
                        <option>Noon Recovery (12:00 PM - 01:30 PM)</option>
                        <option>Evening Post-Workout (05:30 PM - 07:00 PM)</option>
                        <option>Night Muscle Reset (08:00 PM - 09:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      Home / Gym Studio Address:
                    </label>
                    <input
                      type="text"
                      value={sportsAddress}
                      onChange={(e) => setSportsAddress(e.target.value)}
                      placeholder="Flat No, Apartment, Landmark, City"
                      className="input"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* ADDONS */}
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                    Targeted Recovery Enhancements
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {SPORTS_ADDONS.map((addon) => {
                      const isAdded = sportsAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(sportsAddons, setSportsAddons, addon.id)}
                          style={{
                            border: isAdded ? '2px solid #ea580c' : '1px solid #e2e8f0',
                            background: isAdded ? '#ffedd5' : 'white',
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
                              <span style={{ fontWeight: 900, color: '#ea580c', fontSize: '1rem' }}>+₹{addon.price}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{addon.desc}</p>
                          </div>
                          <div style={{ marginTop: '14px', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isAdded ? '#c2410c' : '#64748b' }}>
                              {isAdded ? '✓ Added' : '+ Add Therapy'}
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
                    background: '#ffedd5',
                    color: '#c2410c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 900
                  }}>
                    ⚡
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy-900)', margin: 0 }}>
                        Dr. Kunal Sengupta, BPT, MPT (Sports Medicine)
                      </h4>
                      <span style={{ background: '#ffedd5', color: '#c2410c', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                        Ranji Trophy Specialist
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span>⭐ 5.0 (520+ Athletes)</span>
                      <span>🎖️ Theragun Certified</span>
                      <span>🧴 Organic Arnica Balms</span>
                    </div>
                  </div>
                </div>

                {/* INVOICE */}
                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    📋 Sports Recovery Fee Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#334155' }}>
                      <span>{calculation.label}</span>
                      <span style={{ fontWeight: 700 }}>₹{calculation.base}</span>
                    </div>
                    {sportsAddons.map(id => {
                      const addon = SPORTS_ADDONS.find(a => a.id === id);
                      if (!addon) return null;
                      return (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                          <span>+ {addon.name}</span>
                          <span style={{ fontWeight: 600 }}>₹{addon.price}</span>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#16a34a' }}>
                      <span>Portable Orthopedic Table & Disposables</span>
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>FREE (₹0)</span>
                    </div>
                    {calculation.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#16a34a' }}>
                        <span>Athlete Courtesy Discount</span>
                        <span style={{ fontWeight: 700 }}>-₹{calculation.discount}</span>
                      </div>
                    )}
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                      <span>Total Investment</span>
                      <span style={{ color: '#ea580c' }}>₹{calculation.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* FLOW: ELDERLY PHYSIOTHERAPY SUBSCRIPTION */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {type === 'elderly' && (
          <div>
            {/* STEP 1: PATIENT & CONDITION */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    👵 Senior Patient Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Parent / Patient Name
                      </label>
                      <input
                        type="text"
                        value={elderlyParentName}
                        onChange={(e) => setElderlyParentName(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Parent Age (Years)
                      </label>
                      <input
                        type="number"
                        value={elderlyParentAge}
                        onChange={(e) => setElderlyParentAge(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      Current Mobility Status
                    </label>
                    <select
                      value={elderlyMobility}
                      onChange={(e) => setElderlyMobility(e.target.value)}
                      className="input"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    >
                      <option>Independent Walking (Mild Limp / Joint Pain)</option>
                      <option>Walks with Stick / Support</option>
                      <option>Uses Walker Frame</option>
                      <option>Bedbound / Requires 2-Person Transfer Assistance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                    Primary Clinical Concern
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {ELDERLY_CONDITIONS.map((cond) => {
                      const isSelected = elderlyCondition === cond.id;
                      return (
                        <div
                          key={cond.id}
                          onClick={() => setElderlyCondition(cond.id)}
                          style={{
                            background: isSelected ? '#eff6ff' : 'white',
                            border: isSelected ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '20px',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 6px 18px rgba(29, 78, 216, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)'
                          }}
                        >
                          <span style={{
                            background: isSelected ? '#1d4ed8' : '#f1f5f9',
                            color: isSelected ? 'white' : '#475569',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '12px'
                          }}>
                            {cond.badge}
                          </span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '8px 0 6px' }}>
                            {cond.name}
                          </h4>
                          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                            {cond.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SUBSCRIPTION PLAN */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                  Choose Geriatric Physiotherapy Plan
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  {ELDERLY_PLANS.map((plan) => {
                    const isSelected = elderlyPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setElderlyPlanId(plan.id)}
                        style={{
                          background: isSelected ? '#eff6ff' : 'white',
                          border: isSelected ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                          borderRadius: '18px',
                          padding: '22px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: isSelected ? '0 8px 20px rgba(29, 78, 216, 0.18)' : '0 2px 4px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{
                            background: isSelected ? '#1d4ed8' : '#f1f5f9',
                            color: isSelected ? 'white' : '#475569',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '20px'
                          }}>
                            {plan.badge}
                          </span>
                          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1d4ed8' }}>
                            ₹{plan.price}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '4px 0 4px' }}>
                          {plan.title}
                        </h4>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>
                          🩺 {plan.sessions}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                          {plan.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: SCHEDULE, GUARDIAN WHATSAPP & ADDONS */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    📅 Schedule & Family WhatsApp Updates
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Preferred Frequency
                      </label>
                      <select
                        value={elderlyDays}
                        onChange={(e) => setElderlyDays(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      >
                        <option>Mon - Wed - Fri (3 Days / Week)</option>
                        <option>Tue - Thu - Sat (3 Days / Week)</option>
                        <option>Mon through Fri (5 Days / Week)</option>
                        <option>Alternate Days Flexible</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                        Preferred Time of Day
                      </label>
                      <select
                        value={elderlySlot}
                        onChange={(e) => setElderlySlot(e.target.value)}
                        className="input"
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      >
                        <option>Morning Gentle Slot (10:00 AM - 11:30 AM)</option>
                        <option>Afternoon Calm Slot (01:00 PM - 02:30 PM)</option>
                        <option>Evening Restorative Slot (04:30 PM - 06:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      Guardian (Son/Daughter) WhatsApp Phone for Progress Reports:
                    </label>
                    <input
                      type="text"
                      value={elderlyChildPhone}
                      onChange={(e) => setElderlyChildPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="input"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                      Parents' Residence Address:
                    </label>
                    <input
                      type="text"
                      value={elderlyAddress}
                      onChange={(e) => setElderlyAddress(e.target.value)}
                      placeholder="House / Flat No, Society, City"
                      className="input"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* ADDONS */}
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>
                    Geriatric Care Add-ons
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {ELDERLY_ADDONS.map((addon) => {
                      const isAdded = elderlyAddons.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(elderlyAddons, setElderlyAddons, addon.id)}
                          style={{
                            border: isAdded ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                            background: isAdded ? '#eff6ff' : 'white',
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
                              <span style={{ fontWeight: 900, color: '#1d4ed8', fontSize: '1rem' }}>+₹{addon.price}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{addon.desc}</p>
                          </div>
                          <div style={{ marginTop: '14px', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isAdded ? '#1e40af' : '#64748b' }}>
                              {isAdded ? '✓ Added' : '+ Add to Plan'}
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
                    background: '#e1ebf5',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 900
                  }}>
                    👵
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy-900)', margin: 0 }}>
                        Dr. Sunita Deshmukh, MPT (Geriatric Neuro-Rehab)
                      </h4>
                      <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                        Gold Medalist • 12+ Yrs
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span>⭐ 4.99 (600+ Elders)</span>
                      <span>🩺 Dedicated Same Physio</span>
                      <span>📹 Weekly Family Video Progress</span>
                    </div>
                  </div>
                </div>

                {/* INVOICE */}
                <div className="card" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 16px 0' }}>
                    📋 Elderly Care Fee Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#334155' }}>
                      <span>{calculation.label}</span>
                      <span style={{ fontWeight: 700 }}>₹{calculation.base}</span>
                    </div>
                    {elderlyAddons.map(id => {
                      const addon = ELDERLY_ADDONS.find(a => a.id === id);
                      if (!addon) return null;
                      return (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#64748b' }}>
                          <span>+ {addon.name}</span>
                          <span style={{ fontWeight: 600 }}>₹{addon.price}</span>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#16a34a' }}>
                      <span>Portable TENS & Ultrasound Equipment</span>
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>FREE (₹0)</span>
                    </div>
                    {calculation.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#16a34a' }}>
                        <span>Senior Care Welcome Subsidy</span>
                        <span style={{ fontWeight: 700 }}>-₹{calculation.discount}</span>
                      </div>
                    )}
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                      <span>Total Investment</span>
                      <span style={{ color: '#1d4ed8' }}>₹{calculation.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM ACTION DOCK */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '20px 24px',
          marginTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              {step === 4 ? 'Total Payable' : 'Estimated Pricing'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: theme.color }}>
                ₹{calculation.total}
              </span>
              {type === 'elderly' && elderlyPlanId !== 'trial' && (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/month</span>
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
  );
};

export default HealthWellnessDemo;
