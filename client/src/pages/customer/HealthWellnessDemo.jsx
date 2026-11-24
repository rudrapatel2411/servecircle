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

  // 1. IV DRIP THERAPY STATE
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
      desc: 'Master antioxidant formula for luminous skin glow, collagen synthesis, and deep liver detoxification.'
    },
    {
      id: 'immunity',
      title: 'Immunity Mega-Shield & Vitality',
      price: 2499,
      badge: 'Fast Cellular Rebound',
      desc: 'High-dose Vitamin C, Zinc, B-Complex & Methylcobalamin to fight fatigue and exhaustion.'
    },
    {
      id: 'hangover',
      title: 'Rapid Hydration & Hangover Detox',
      price: 1999,
      badge: 'Instant Relief (45 Mins)',
      desc: 'Immediate nausea reduction, headache relief, and rapid vascular electrolyte rehydration.'
    },
    {
      id: 'athletic',
      title: 'Athletic Muscle Recovery & Electrolytes',
      price: 2499,
      badge: 'Lactic Acid Flush',
      desc: 'Accelerates muscle repair, prevents cramping, and restores glycogen reserves after workouts.'
    },
    {
      id: 'nad-plus',
      title: 'NAD+ Cellular Anti-Aging & Brain Focus',
      price: 4499,
      badge: 'Executive Longevity',
      desc: 'Reverses brain fog, elevates mental focus, restores sleep cycles, and repairs cellular fatigue.'
    }
  ];

  const IV_ADDONS = [
    { id: 'd3-shot', name: 'Vitamin D3 / B12 Intramuscular Booster Shot', price: 399 },
    { id: 'sugar-hb', name: 'Instant 5-Minute Blood Sugar & Hb Spot Check', price: 199 }
  ];

  // 2. SPORTS RECOVERY STATE
  const [sportsTargetArea, setSportsTargetArea] = useState('Lower Back & Glutes / Sciatica');
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
      badge: '60 Minutes Deep Release',
      desc: 'Neuromuscular trigger point therapy with herbal arnica balm to break chronic muscle knots.'
    },
    {
      id: 'cupping-theragun',
      title: 'Theragun PRO Percussion & Myofascial Cupping',
      price: 2299,
      badge: '75 Minutes • Most Popular',
      desc: 'Medical pneumatic cupping for microvascular blood flow + 16mm deep Theragun percussion.'
    },
    {
      id: 'elite-protocol',
      title: 'Elite Athlete Full-Spectrum Protocol',
      price: 2999,
      badge: '90 Minutes Comprehensive',
      desc: 'Biomechanics audit, dry cupping, assisted PNF stretching, and pneumatic compression.'
    }
  ];

  const SPORTS_ADDONS = [
    { id: 'compression-boots', name: 'Pneumatic Compression Boots Lymphatic Flush (20 Mins)', price: 499 },
    { id: 'rocktape', name: 'Kinesiology Taping (RockTape) Joint Support', price: 299 }
  ];

  // 3. ELDERLY PHYSIO SUBSCRIPTION STATE
  const [elderlyCondition, setElderlyCondition] = useState('Knee Osteoarthritis & Joint Stiffness');
  const [elderlyPlanId, setElderlyPlanId] = useState('monthly-8');
  const [elderlyParentName, setElderlyParentName] = useState('Suresh Patel');
  const [elderlyParentAge, setElderlyParentAge] = useState('68');
  const [elderlyChildPhone, setElderlyChildPhone] = useState('+91 98765 43210');
  const [elderlyDate, setElderlyDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [elderlySlot, setElderlySlot] = useState('Morning Gentle Slot (10:00 AM - 11:30 AM)');
  const [elderlyAddress, setElderlyAddress] = useState('Bunglow 14, Orchid Greens, South Bopal');
  const [elderlyAddons, setElderlyAddons] = useState(['home-safety']);

  const ELDERLY_PLANS = [
    {
      id: 'trial',
      title: '1 Trial Assessment Session',
      price: 799,
      badge: '60 Mins Intro Audit',
      desc: 'In-home geriatric evaluation, gait analysis, joint range check & customized exercise roadmap.'
    },
    {
      id: 'monthly-8',
      title: 'Bi-Weekly Mobility Plan (8 Sessions)',
      price: 4999,
      badge: 'Recommended • Knee & Spine',
      desc: '8 In-home physio visits (₹625/session). Consistent senior doctor & weekly WhatsApp report.'
    },
    {
      id: 'monthly-16',
      title: 'Intensive Daily Neuro-Rehab (16 Sessions)',
      price: 8999,
      badge: 'Post-Stroke & Parkinson’s',
      desc: '16 Intensive therapy sessions with assisted gait training, balance re-education & caregiver guidance.'
    }
  ];

  const ELDERLY_ADDONS = [
    { id: 'home-safety', name: 'Home Safety & Fall-Risk Audit (Grab Bars & Slip-Proofing Check)', price: 499 }
  ];

  // Theme info
  const theme = useMemo(() => {
    if (type === 'iv') {
      return {
        title: 'IV Drip Therapy at Home',
        subtitle: 'Administered safely by hospital-certified BSc nurses with MD doctor tele-review.',
        color: '#0284c7',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        bgSoft: '#f0f9ff'
      };
    }
    if (type === 'sports') {
      return {
        title: 'Sports Recovery & Pain Management',
        subtitle: 'Targeted deep tissue massage, Theragun PRO percussion, and medical myofascial cupping.',
        color: '#ea580c',
        gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        bgSoft: '#fff7ed'
      };
    }
    return {
      title: 'Elderly Care & In-Home Physiotherapy',
      subtitle: 'Gentle, compassionate in-home mobility and joint rehabilitation for aging parents.',
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      bgSoft: '#eff6ff'
    };
  }, [type]);

  // Price Calculation
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
      discount = 200;
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
      if (elderlyPlanId !== 'trial') discount = 500;
    }

    const total = Math.max(0, base + addonsTotal - discount);
    return { base, addonsTotal, discount, total, label };
  }, [type, ivDripId, ivAddons, sportsModalityId, sportsAddons, elderlyPlanId, elderlyAddons]);

  const totalSteps = 2;

  const handleNext = () => {
    setErrorMsg('');

    if (step === 1) {
      if (type === 'elderly' && !elderlyParentName.trim()) {
        return setErrorMsg('Please provide the parent or patient name.');
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (type === 'iv' && (!ivScheduleDate || !ivAddress.trim())) {
        return setErrorMsg('Please provide your infusion date and home address.');
      }
      if (type === 'sports' && (!sportsDate || !sportsAddress.trim())) {
        return setErrorMsg('Please select a session date and provide your home address.');
      }
      if (type === 'elderly' && (!elderlyChildPhone.trim() || !elderlyAddress.trim())) {
        return setErrorMsg('Please enter your WhatsApp contact number and home address.');
      }
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
        notes = `Focus Area: ${sportsTargetArea}. Date: ${sportsDate} (${sportsSlot}). Address: ${sportsAddress}. Certified Sports Physio requested.`;
      } else if (type === 'elderly') {
        serviceTitle = `Elderly Care: ${ELDERLY_PLANS.find(p => p.id === elderlyPlanId)?.title}`;
        notes = `Parent: ${elderlyParentName} (Age: ${elderlyParentAge}). Condition: ${elderlyCondition}. Date: ${elderlyDate} (${elderlySlot}). Guardian WhatsApp: ${elderlyChildPhone}. Address: ${elderlyAddress}.`;
      }

      const queryParams = new URLSearchParams({
        service: serviceTitle,
        category: 'health-wellness',
        price: calculation.total.toString(),
        notes: notes,
        therapyType: type
      });

      navigate(`/customer/book?${queryParams.toString()}`);
    }, 800);
  };

  /* =========================================================================
     1. IV DRIP FLOW (2-STEP STREAMLINED)
     ========================================================================= */
  const renderIVStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        1. Select IV Drip Formulation
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Hospital-grade sterile IV drips administered bedside by certified BSc nurses.
      </p>

      {/* Drip formulations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {IV_DRIPS.map((drip) => {
          const isSelected = ivDripId === drip.id;
          return (
            <div
              key={drip.id}
              onClick={() => setIvDripId(drip.id)}
              style={{
                padding: '16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: isSelected ? theme.color : '#f1f5f9', color: isSelected ? 'white' : '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                {drip.badge}
              </span>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)', marginTop: '8px' }}>
                {drip.title}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 8px 0' }}>{drip.desc}</p>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: theme.color }}>₹{drip.price}</span>
            </div>
          );
        })}
      </div>

      {/* Patient Basic Info */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)' }}>Patient Medical Details</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Patient Full Name</label>
            <input type="text" value={ivPatientName} onChange={(e) => setIvPatientName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Patient Age</label>
            <input type="number" value={ivPatientAge} onChange={(e) => setIvPatientAge(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Known Allergies / Medicines</label>
            <input type="text" value={ivAllergies} onChange={(e) => setIvAllergies(e.target.value)} placeholder="e.g. None or Penicillin" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>

      {/* Add-on Boosters */}
      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy-900)' }}>Optional Clinical Boosters</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
          {IV_ADDONS.map(addon => {
            const isChecked = ivAddons.includes(addon.id);
            return (
              <label key={addon.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) setIvAddons(ivAddons.filter(i => i !== addon.id));
                    else setIvAddons([...ivAddons, addon.id]);
                  }}
                  style={{ accentColor: theme.color, width: '16px', height: '16px' }}
                />
                {addon.name} (+₹{addon.price})
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderIVStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        2. Infusion Schedule, Address & Confirm
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Select your preferred time slot and review medical team assignment.
      </p>

      {/* Schedule & Address */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Preferred Infusion Date</label>
            <input type="date" value={ivScheduleDate} onChange={(e) => setIvScheduleDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Preferred Time Slot</label>
            <select value={ivSlot} onChange={(e) => setIvSlot(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}>
              <option value="Morning Energy Slot (09:00 AM - 11:00 AM)">Morning Energy Slot (09:00 AM - 11:00 AM)</option>
              <option value="Afternoon Revive (01:00 PM - 03:00 PM)">Afternoon Revive (01:00 PM - 03:00 PM)</option>
              <option value="Evening Recharge (05:00 PM - 07:00 PM)">Evening Recharge (05:00 PM - 07:00 PM)</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Home Doorstep Address</label>
          <input type="text" value={ivAddress} onChange={(e) => setIvAddress(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Clinical Specialist Card */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          🩺
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)' }}>Sister Ananya Roy, BSc Nursing</h4>
            <span style={{ background: '#f0f9ff', color: theme.color, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>Certified ICU Nurse</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Doctor Tele-Signoff by Dr. Meera Iyer (MD) • Hospital-grade sterile single-use disposable venflon
          </p>
        </div>
      </div>

      {/* Price Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '6px' }}>
          <span>{calculation.label}</span>
          <span>₹{calculation.base}</span>
        </div>
        {calculation.addonsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
            <span>Clinical Add-on Boosters</span>
            <span>+₹{calculation.addonsTotal}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
          <span>Pre-Infusion MD Tele-Consult & Bedside Monitoring</span>
          <span>FREE (₹0)</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Total Payable:</strong>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{calculation.total}</span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     2. SPORTS RECOVERY FLOW (2-STEP STREAMLINED)
     ========================================================================= */
  const renderSportsStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        1. Select Recovery Modality & Focus Area
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Theragun PRO percussion, myofascial cupping, and targeted neuromuscular stretch.
      </p>

      {/* Modalities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {SPORTS_MODALITIES.map((mod) => {
          const isSelected = sportsModalityId === mod.id;
          return (
            <div
              key={mod.id}
              onClick={() => setSportsModalityId(mod.id)}
              style={{
                padding: '16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: isSelected ? theme.color : '#f1f5f9', color: isSelected ? 'white' : '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                {mod.badge}
              </span>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)', marginTop: '8px' }}>
                {mod.title}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 8px 0' }}>{mod.desc}</p>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: theme.color }}>₹{mod.price}</span>
            </div>
          );
        })}
      </div>

      {/* Focus Area */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)' }}>Target Muscle / Pain Area</h4>
        <select value={sportsTargetArea} onChange={(e) => setSportsTargetArea(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}>
          <option value="Lower Back & Glutes / Sciatica">Lower Back & Glutes / Sciatica</option>
          <option value="Knees, Quads & IT Band">Knees, Quads & IT Band</option>
          <option value="Shoulders, Rotator Cuff & Upper Back">Shoulders, Rotator Cuff & Upper Back</option>
          <option value="Neck & Postural Cervical Stress">Neck & Postural Cervical Stress</option>
          <option value="Full Body Athletic Overhaul">Full Body Athletic Overhaul</option>
        </select>
      </div>

      {/* Add-ons */}
      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--navy-900)' }}>Recovery Add-ons</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
          {SPORTS_ADDONS.map(addon => {
            const isChecked = sportsAddons.includes(addon.id);
            return (
              <label key={addon.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy-900)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) setSportsAddons(sportsAddons.filter(i => i !== addon.id));
                    else setSportsAddons([...sportsAddons, addon.id]);
                  }}
                  style={{ accentColor: theme.color, width: '16px', height: '16px' }}
                />
                {addon.name} (+₹{addon.price})
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSportsStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        2. Session Timing, Address & Confirm
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Physiotherapist brings sanitized orthopedic massage table & equipment to your home.
      </p>

      {/* Schedule & Address */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Session Date</label>
            <input type="date" value={sportsDate} onChange={(e) => setSportsDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Time Slot</label>
            <select value={sportsSlot} onChange={(e) => setSportsSlot(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}>
              <option value="Morning Active (07:30 AM - 09:00 AM)">Morning Active (07:30 AM - 09:00 AM)</option>
              <option value="Afternoon Rest (02:00 PM - 03:30 PM)">Afternoon Rest (02:00 PM - 03:30 PM)</option>
              <option value="Evening Post-Workout (05:30 PM - 07:00 PM)">Evening Post-Workout (05:30 PM - 07:00 PM)</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Home Doorstep Address</label>
          <input type="text" value={sportsAddress} onChange={(e) => setSportsAddress(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Specialist Card */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          ⚡
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)' }}>Dr. Kunal Sengupta, BPT, MPT</h4>
            <span style={{ background: '#fff7ed', color: theme.color, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>Sports Medicine Specialist</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Theragun Certified • Clinical myofascial decompression & deep tissue trigger release
          </p>
        </div>
      </div>

      {/* Price Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '6px' }}>
          <span>{calculation.label}</span>
          <span>₹{calculation.base}</span>
        </div>
        {calculation.addonsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
            <span>Recovery Add-ons</span>
            <span>+₹{calculation.addonsTotal}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
          <span>Portable Orthopedic Table & Sanitized Linens Included</span>
          <span>FREE (₹0)</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Total Payable:</strong>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{calculation.total}</span>
        </div>
      </div>
    </div>
  );

  /* =========================================================================
     3. ELDERLY CARE FLOW (2-STEP STREAMLINED)
     ========================================================================= */
  const renderElderlyStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        1. Select Elderly Care Plan & Patient Details
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        In-home physiotherapy visits with weekly progress reports sent to your WhatsApp.
      </p>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {ELDERLY_PLANS.map((plan) => {
          const isSelected = elderlyPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setElderlyPlanId(plan.id)}
              style={{
                padding: '16px', borderRadius: '14px',
                border: `2px solid ${isSelected ? theme.color : '#e2e8f0'}`,
                background: isSelected ? theme.bgSoft : 'white',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, background: isSelected ? theme.color : '#f1f5f9', color: isSelected ? 'white' : '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                {plan.badge}
              </span>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? theme.color : 'var(--navy-900)', marginTop: '8px' }}>
                {plan.title}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 8px 0' }}>{plan.desc}</p>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.color }}>₹{plan.price}</span>
            </div>
          );
        })}
      </div>

      {/* Parent Information */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-900)' }}>Senior Parent Information</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Parent Full Name</label>
            <input type="text" value={elderlyParentName} onChange={(e) => setElderlyParentName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Age</label>
            <input type="number" value={elderlyParentAge} onChange={(e) => setElderlyParentAge(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Primary Condition</label>
            <select value={elderlyCondition} onChange={(e) => setElderlyCondition(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}>
              <option value="Knee Osteoarthritis & Joint Stiffness">Knee Osteoarthritis & Joint Stiffness</option>
              <option value="Post-Stroke Neuro Rehabilitation">Post-Stroke Neuro Rehabilitation</option>
              <option value="Cervical / Lumbar Spondylosis">Cervical / Lumbar Spondylosis</option>
              <option value="Age-Related Frailty & Fall Risk">Age-Related Frailty & Fall Risk</option>
              <option value="Parkinson’s Functional Motor Coaching">Parkinson’s Functional Motor Coaching</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderElderlyStep2 = () => (
    <div className="animate-fade-in-up">
      <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', fontWeight: 800, marginBottom: '6px' }}>
        2. Schedule, Address & Confirm Plan
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '18px' }}>
        Set starting date and guardian contact for weekly WhatsApp progress updates.
      </p>

      {/* Schedule & Address */}
      <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Starting Date</label>
            <input type="date" value={elderlyDate} onChange={(e) => setElderlyDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Preferred Time Slot</label>
            <select value={elderlySlot} onChange={(e) => setElderlySlot(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}>
              <option value="Morning Gentle Slot (10:00 AM - 11:30 AM)">Morning Gentle Slot (10:00 AM - 11:30 AM)</option>
              <option value="Afternoon Warm Slot (03:00 PM - 04:30 PM)">Afternoon Warm Slot (03:00 PM - 04:30 PM)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Son/Daughter WhatsApp Contact</label>
            <input type="tel" value={elderlyChildPhone} onChange={(e) => setElderlyChildPhone(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Parent Home Address</label>
          <input type="text" value={elderlyAddress} onChange={(e) => setElderlyAddress(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Specialist Card */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0', display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: theme.gradient, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          👵
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)' }}>Dr. Sunita Deshmukh, MPT</h4>
            <span style={{ background: '#eff6ff', color: theme.color, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>Geriatric Neuro-Rehab Specialist</span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Consistent senior doctor guarantee • Weekly video progress report sent directly to your phone
          </p>
        </div>
      </div>

      {/* Price Summary */}
      <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '6px' }}>
          <span>{calculation.label}</span>
          <span>₹{calculation.base}</span>
        </div>
        {calculation.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', marginBottom: '6px', fontWeight: 700 }}>
            <span>Senior Care Welcome Subsidy</span>
            <span>-₹{calculation.discount}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
          <span>In-Home Ultrasound & TENS Equipment Usage</span>
          <span>FREE (₹0)</span>
        </div>
        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Total Investment:</strong>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.color }}>₹{calculation.total}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-content" style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/customer/health-wellness')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            color: 'var(--navy-800)', fontSize: '0.95rem', fontWeight: 700, padding: 0
          }}
        >
          <HiOutlineArrowLeft size={18} />
          Back to Health & Wellness
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          <HiOutlineShieldCheck color="#059669" size={18} />
          <span>MD Certified & Safe</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="b2b-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        
        {/* Banner */}
        <div style={{
          background: theme.gradient,
          padding: '28px 32px',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>{theme.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.88rem', margin: '4px 0 0 0', fontWeight: 600 }}>{theme.subtitle}</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px' }}>
            <HiOutlineHeart size={32} color="white" />
          </div>
        </div>

        {/* Progress Tracker (2-step) */}
        <div style={{ padding: '20px 28px 10px 28px', background: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: theme.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Step {step} of {totalSteps}
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                {step === 1 ? 'Select Plan & Options' : 'Schedule & Confirm'}
              </div>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
              {Math.round((step / totalSteps) * 100)}% Completed
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalSteps}, 1fr)`, gap: '8px' }}>
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div 
                key={idx} 
                style={{
                  height: '6px',
                  borderRadius: '8px',
                  background: idx + 1 <= step ? theme.color : '#e2e8f0',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 32px' }}>
          {type === 'iv' && (
            <>
              {step === 1 && renderIVStep1()}
              {step === 2 && renderIVStep2()}
            </>
          )}

          {type === 'sports' && (
            <>
              {step === 1 && renderSportsStep1()}
              {step === 2 && renderSportsStep2()}
            </>
          )}

          {type === 'elderly' && (
            <>
              {step === 1 && renderElderlyStep1()}
              {step === 2 && renderElderlyStep2()}
            </>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="animate-fade-in-up" style={{ color: '#ef4444', background: '#fef2f2', padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, marginTop: '18px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca' }}>
              <HiOutlineInformationCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Navigation Footer */}
          <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
            {step > 1 && (
              <button 
                onClick={handleBack}
                style={{
                  padding: '14px 22px', fontSize: '1rem', fontWeight: 800,
                  background: 'white', color: 'var(--navy-800)', border: '2px solid var(--gray-200)',
                  borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Previous Step
              </button>
            )}
            
            <button 
              onClick={handleNext}
              disabled={loading}
              style={{ 
                flex: 1, padding: '14px', fontSize: '1.05rem', fontWeight: 800,
                background: theme.color, color: 'white', border: 'none',
                borderRadius: '14px', cursor: 'pointer',
                boxShadow: `0 6px 18px -4px ${theme.color}`,
                transition: 'transform 0.1s, box-shadow 0.2s',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : step === totalSteps ? `Confirm Booking (₹${calculation.total})` : 'Continue to Schedule & Address →'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HealthWellnessDemo;
