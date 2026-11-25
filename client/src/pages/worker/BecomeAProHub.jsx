import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineAcademicCap,
  HiOutlineCheckBadge,
  HiOutlineSparkles,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineCurrencyRupee,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineMapPin,
  HiOutlineTruck,
  HiOutlineBuildingOffice2,
  HiOutlineHeart,
  HiOutlineArrowRight,
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import '../Dashboard.css';
import '../customer/CustomerPages.css';

const SKILL_TRACKS = [
  {
    id: 'electrical',
    title: 'Electrical & Smart Devices',
    desc: 'CCTV setup, inverter wiring, smart lighting, appliance repairs & automation.',
    icon: <HiOutlineSparkles style={{ color: '#0284c7' }} />,
    color: '#0284c7',
    badge: 'High Demand'
  },
  {
    id: 'travel',
    title: 'Travel & Outstation Chauffeur',
    desc: 'Commercial passenger cabs, airport VIP transit, outstation & multi-day tours.',
    icon: <HiOutlineTruck style={{ color: '#0d9488' }} />,
    color: '#0d9488',
    badge: 'Daily Payouts'
  },
  {
    id: 'culinary',
    title: 'Gourmet Chef & Culinary Pro',
    desc: 'In-home private dining, live backyard BBQ grill master, custom baking & party tiffin.',
    icon: <HiOutlineSparkles style={{ color: '#ea580c' }} />,
    color: '#ea580c',
    badge: 'Premium Tip Rates'
  },
  {
    id: 'pet',
    title: 'Certified Pet Care & Boarding',
    desc: 'Vet-certified handling, dog walking, medicated grooming & cage-free home boarding.',
    icon: <HiOutlineHeart style={{ color: '#db2777' }} />,
    color: '#db2777',
    badge: 'Pet Lovers Favorite'
  },
  {
    id: 'health',
    title: 'Clinical Health & Home Nursing',
    desc: 'Doctor home visits, sterile IV drip therapy, geriatric elder care & sports physio.',
    icon: <HiOutlineShieldCheck style={{ color: '#0284c7' }} />,
    color: '#0284c7',
    badge: 'Paramedic Accredit'
  },
  {
    id: 'society',
    title: 'Society Facility & Infrastructure',
    desc: 'Waterless car wash matrix, 7.4kW EV wallbox setups, water tank hygiene & RWA ops.',
    icon: <HiOutlineBuildingOffice2 style={{ color: '#16a34a' }} />,
    color: '#16a34a',
    badge: 'Guaranteed Volume'
  },
  {
    id: 'relocation',
    title: 'Packers & Relocation Logistics',
    desc: 'Hydraulic container transport, bubble wrapping, furniture dismantle & scrap declutter.',
    icon: <HiOutlineTruck style={{ color: '#2563eb' }} />,
    color: '#2563eb',
    badge: 'High Ticket'
  },
  {
    id: 'events',
    title: 'Events AV & Stage Production',
    desc: 'Line-array concert audio, live DJ consoles, DMX lighting rigs & cinematic drones.',
    icon: <HiOutlineSparkles style={{ color: '#6366f1' }} />,
    color: '#6366f1',
    badge: 'Weekend Rush'
  },
  {
    id: 'salon',
    title: 'Salon & Women Wellness Pro',
    desc: 'Doorstep bridal makeup, organic facials, waxing, manicures & herbal hair care.',
    icon: <HiOutlineSparkles style={{ color: '#d97706' }} />,
    color: '#d97706',
    badge: 'Women Empowerment'
  }
];

const LEADERBOARD = [
  { rank: 1, name: 'Rajesh Kumar', profession: 'Smart Electrician & Home Automation Pro', jobs: 284, rating: 4.9, earnings: '₹54,500/mo', isWomenTrack: false },
  { rank: 2, name: 'Priya Sharma', profession: 'Home Salon & Bridal Beautician Pro', jobs: 226, rating: 4.8, earnings: '₹42,800/mo', isWomenTrack: true },
  { rank: 3, name: 'Harpreet Singh', profession: 'Outstation Fleet Chauffeur (Travel)', jobs: 215, rating: 4.9, earnings: '₹47,200/mo', isWomenTrack: false },
  { rank: 4, name: 'Chef Sanjeev Joshi', profession: 'Private Gourmet Home Chef & BBQ Master', jobs: 189, rating: 4.9, earnings: '₹62,000/mo', isWomenTrack: false },
  { rank: 5, name: 'Vikram & Team', profession: 'SafeMove Packers & Container Logistics', jobs: 168, rating: 4.8, earnings: '₹68,400/mo', isWomenTrack: false }
];

const BENEFITS = [
  {
    title: 'Zero Onboarding Fees',
    desc: 'No hidden registration fees or security deposits. Join our circle completely free.',
    icon: <HiOutlineCheckCircle style={{ color: '#16a34a' }} />
  },
  {
    title: 'First 5 Jobs: 0% Commission',
    desc: 'Keep 100% of your earnings for the first 5 customer bookings to kickstart your ratings.',
    icon: <HiOutlineCurrencyRupee style={{ color: '#ea580c' }} />
  },
  {
    title: 'PMKVY Govt Certification',
    desc: 'Free skill upgrade certifications partnered with National Skill Development Corporation.',
    icon: <HiOutlineAcademicCap style={{ color: '#0284c7' }} />
  },
  {
    title: 'Weekly Guaranteed Payouts',
    desc: 'No waiting for month-ends. Your wallet earnings are directly transferred to your bank/UPI.',
    icon: <HiOutlineCheckBadge style={{ color: '#6366f1' }} />
  }
];

const BecomeAProHub = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    skillTrack: 'Electrical & Smart Devices',
    experience: 'Fresher (Training Needed)',
    shiftPreference: 'Flexible (Full Day)',
    city: 'Ahmedabad',
    pincode: '380015',
    agreedToPmkvy: true
  });

  const [registeredApp, setRegisteredApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [earningsTier, setEarningsTier] = useState('full-time'); // 'part-time', 'full-time', 'top-pro'

  // Load existing application if stored locally
  useEffect(() => {
    try {
      const saved = localStorage.getItem('servecircle_candidate_pro_app');
      if (saved) {
        setRegisteredApp(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectTrack = (trackTitle) => {
    setFormData(prev => ({ ...prev, skillTrack: trackTitle }));
    const formElement = document.getElementById('pro-register-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAlertMsg('');

    const cleanPhone = (formData.phone || '').replace(/[^0-9]/g, '');
    const cleanPincode = (formData.pincode || '').replace(/[^0-9]/g, '');

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setAlertMsg('Please enter your full official name (as on Aadhaar card).');
      return;
    }

    if (cleanPhone.length < 10) {
      setAlertMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.city.trim()) {
      setAlertMsg('Please enter your working city.');
      return;
    }

    if (cleanPincode.length !== 6) {
      setAlertMsg('Please enter a valid 6-digit postal pincode.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newApp = {
        candidateId: `SC-PRO-${Math.floor(10000 + Math.random() * 90000)}`,
        ...formData,
        phone: cleanPhone,
        pincode: cleanPincode,
        appliedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'Under Review',
        verificationOfficer: 'Captain Vikram Dave (Zonal Onboarding Head)',
        stages: [
          { num: 1, label: 'Application Submitted', done: true },
          { num: 2, label: 'Aadhaar & Background Check', done: false, active: true },
          { num: 3, label: 'PMKVY Kit & Pro ID Issuance', done: false }
        ]
      };

      try {
        localStorage.setItem('servecircle_candidate_pro_app', JSON.stringify(newApp));
      } catch (_) {}

      setRegisteredApp(newApp);
      setLoading(false);
    }, 1200);
  };

  const handleResetApplication = () => {
    try {
      localStorage.removeItem('servecircle_candidate_pro_app');
    } catch (_) {}
    setRegisteredApp(null);
    setFormData({
      fullName: '',
      phone: '',
      skillTrack: 'Electrical & Smart Devices',
      experience: 'Fresher (Training Needed)',
      shiftPreference: 'Flexible (Full Day)',
      city: 'Ahmedabad',
      pincode: '380015',
      agreedToPmkvy: true
    });
  };

  return (
    <div className="page-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff',
        padding: '30px 32px',
        borderRadius: '18px',
        marginBottom: '26px',
        boxShadow: '0 8px 24px rgba(15,23,42,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: '#d97706', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
                ServeCircle Partner Network
              </span>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• PMKVY NSDC Alliance Partner</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900 }}>{t('customer.becomeAPro', 'Become a Pro')}</h1>
            <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#94a3b8', maxWidth: '750px', lineHeight: 1.5 }}>
              Join over 12,000+ certified local professionals across India. Enjoy 0% commission on your first 5 jobs, free government skill accreditation, weekly bank payouts, and guaranteed customer bookings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="tel:+918000555666"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                borderRadius: '10px', background: 'rgba(255,255,255,0.12)', color: '#fff',
                textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <HiOutlinePhone />
              <span>Partner Helpline: 1800-055-5666</span>
            </a>
          </div>
        </div>

        {/* Highlight Pills */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
            ✓ 0% Commission First 5 Jobs
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
            ✓ Weekly UPI & Bank Account Deposits
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
            ✓ Free Toolkits & Uniform Allotted
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
            ✓ ₹5,00,000 Accident Insurance Cover
          </span>
        </div>
      </div>

      {/* Main Grid: Left Column Tracks & Benefits, Right Column Registration/Tracker */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Skill Tracks, Potential Calculator & Benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Monthly Earnings Potential Calculator */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineCurrencyRupee style={{ color: '#16a34a', fontSize: '1.35rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Monthly Net Earning Estimator
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '999px', fontWeight: 800 }}>
                Live Calculator
              </span>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>
              Choose your expected daily working commitment to estimate your monthly take-home earnings:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setEarningsTier('part-time')}
                style={{
                  padding: '12px 14px', borderRadius: '10px',
                  border: earningsTier === 'part-time' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  background: earningsTier === 'part-time' ? '#f0f9ff' : '#fff',
                  cursor: 'pointer', textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Part-Time</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0284c7', margin: '4px 0' }}>₹28,500</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>2-3 Jobs Daily</div>
              </button>

              <button
                type="button"
                onClick={() => setEarningsTier('full-time')}
                style={{
                  padding: '12px 14px', borderRadius: '10px',
                  border: earningsTier === 'full-time' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  background: earningsTier === 'full-time' ? '#f0fdf4' : '#fff',
                  cursor: 'pointer', textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Full-Time</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a', margin: '4px 0' }}>₹52,000</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>5-6 Jobs Daily</div>
              </button>

              <button
                type="button"
                onClick={() => setEarningsTier('top-pro')}
                style={{
                  padding: '12px 14px', borderRadius: '10px',
                  border: earningsTier === 'top-pro' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                  background: earningsTier === 'top-pro' ? '#fff7ed' : '#fff',
                  cursor: 'pointer', textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Specialist Pro</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ea580c', margin: '4px 0' }}>₹84,000+</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>8+ Jobs / Events</div>
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569' }}>
              💡 <strong>ServeCircle Bonus:</strong> 100% of customer tips belong directly to you without platform deductions.
            </div>
          </div>

          {/* Skill Upgrade Tracks */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HiOutlineAcademicCap style={{ color: '#0284c7', fontSize: '1.35rem' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Accredited Professional Tracks (Click to Apply)
              </h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748b' }}>
              Select a specialized category below to auto-fill your registration form:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {SKILL_TRACKS.map((track) => {
                const isSelected = formData.skillTrack === track.title;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track.title)}
                    style={{
                      padding: '16px',
                      background: isSelected ? '#f0f9ff' : '#f8fafc',
                      border: isSelected ? `2px solid ${track.color}` : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontSize: '1.4rem' }}>{track.icon}</div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#fff', color: track.color, padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        {track.badge}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      {track.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                      {track.desc}
                    </p>
                    <div style={{ marginTop: '10px', fontSize: '0.72rem', fontWeight: 700, color: track.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{isSelected ? '✓ Track Selected' : 'Enroll in this Track →'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits Grid */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Why Professionals Choose ServeCircle
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {BENEFITS.map((b, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem', marginTop: '2px' }}>{b.icon}</div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{b.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Application Portal & Active Application Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Registration / Active Application Card */}
          <div id="pro-register-form" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            
            {registeredApp ? (
              <div>
                {/* Active Candidate Application Tracker */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HiOutlineCheckCircle style={{ color: '#16a34a', fontSize: '1.5rem' }} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                        Partner Application Active
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Applied on: {registeredApp.appliedAt}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px' }}>
                    {registeredApp.status}
                  </span>
                </div>

                {/* Candidate Badge Card */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Candidate Ref ID</span>
                    <strong style={{ fontSize: '0.95rem', color: '#0284c7' }}>{registeredApp.candidateId}</strong>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{registeredApp.fullName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                    Track: <strong>{registeredApp.skillTrack}</strong> ({registeredApp.city})
                  </div>
                </div>

                {/* Verification Pipeline Stepper */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Onboarding Verification Steps
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <span style={{ color: '#16a34a', fontWeight: 900 }}>✓</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>1. Online Profile Logged</div>
                        <div style={{ fontSize: '0.7rem', color: '#15803d' }}>Aadhaar applicant details securely registered</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <span style={{ color: '#2563eb', fontWeight: 900 }}>⏳</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>2. Telephonic Document Verification</div>
                        <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>Officer will call on {registeredApp.phone} within 24 hrs</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 900 }}>3</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>3. Starter Kit & Pro Badge</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID Card, Uniform & Mobile App Activation</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href="tel:+918000555666"
                    style={{
                      flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px',
                      background: '#0284c7', color: '#fff', textDecoration: 'none',
                      fontWeight: 700, fontSize: '0.8rem'
                    }}
                  >
                    📞 Call Verification Officer
                  </a>
                  <button
                    onClick={handleResetApplication}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', background: '#f8fafc',
                      color: '#475569', border: '1px solid #cbd5e1', fontWeight: 700,
                      fontSize: '0.8rem', cursor: 'pointer'
                    }}
                  >
                    New Application
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                    Candidate Registration Form
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Fill your credentials to apply for verified partner status.
                  </p>
                </div>

                {alertMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.78rem', fontWeight: 600, marginBottom: '14px' }}>
                    {alertMsg}
                  </div>
                )}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Full Official Name (as on Aadhaar) *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Ramesh Patel"
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: '8px',
                        border: '1px solid #cbd5e1', fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Primary Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 98250 12345"
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: '8px',
                        border: '1px solid #cbd5e1', fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Skill Track Application
                    </label>
                    <select
                      name="skillTrack"
                      value={formData.skillTrack}
                      onChange={handleInputChange}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: '8px',
                        border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff'
                      }}
                    >
                      {SKILL_TRACKS.map(t => (
                        <option key={t.id} value={t.title}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Experience Level
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: '8px',
                          border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff'
                        }}
                      >
                        <option value="Fresher (Training Needed)">Fresher (Needs Training)</option>
                        <option value="1-2 Years">1-2 Years Working</option>
                        <option value="3-5 Years">3-5 Years Skilled</option>
                        <option value="5+ Years">5+ Years (Expert Pro)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Preferred Shift
                      </label>
                      <select
                        name="shiftPreference"
                        value={formData.shiftPreference}
                        onChange={handleInputChange}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: '8px',
                          border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff'
                        }}
                      >
                        <option value="Morning (07:00 - 14:00)">Morning (07:00 - 14:00)</option>
                        <option value="Evening (14:00 - 21:00)">Evening (14:00 - 21:00)</option>
                        <option value="Flexible (Full Day)">Flexible (Full Day)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Ahmedabad"
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: '8px',
                          border: '1px solid #cbd5e1', fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="e.g. 380015"
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: '8px',
                          border: '1px solid #cbd5e1', fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: '#475569', marginTop: '4px' }}>
                    <input
                      type="checkbox"
                      name="agreedToPmkvy"
                      checked={formData.agreedToPmkvy}
                      onChange={handleInputChange}
                      style={{ marginTop: '2px', accentColor: '#0284c7' }}
                    />
                    <span>
                      I agree to enroll in the free <strong>PMKVY Skill Certification</strong> scheme for government recognized credentials.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: '6px', padding: '12px', borderRadius: '10px',
                      background: '#d97706', color: '#fff', border: 'none',
                      fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(217,119,6,0.3)',
                      transition: 'background 0.2s'
                    }}
                  >
                    {loading ? 'Submitting Application...' : 'Register as a Pro Partner'}
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Local Hero Leaderboard */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <HiOutlineSparkles style={{ color: '#d97706', fontSize: '1.25rem' }} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Local Star Partners Leaderboard
              </h3>
            </div>
            
            <p style={{ margin: '0 0 14px', fontSize: '0.76rem', color: '#64748b' }}>
              Top certified professionals active in your region this month:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {LEADERBOARD.map((hero) => (
                <div
                  key={hero.rank}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: '10px',
                    background: hero.rank === 1 ? '#fef3c7' : '#f8fafc',
                    border: hero.rank === 1 ? '1px solid #fde68a' : '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontWeight: 900, fontSize: '0.85rem',
                      color: hero.rank === 1 ? '#b45309' : '#64748b',
                      width: '20px'
                    }}>
                      #{hero.rank}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{hero.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{hero.profession}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#16a34a' }}>{hero.earnings}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>⭐ {hero.rating} • {hero.jobs} jobs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BecomeAProHub;