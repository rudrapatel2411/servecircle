import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineWrenchScrewdriver,
  HiOutlineBolt,
  HiOutlineSparkles,
  HiOutlineTruck,
  HiOutlineHome,
  HiOutlineHeart,
  HiOutlineShieldCheck,
  HiOutlineMapPin,
  HiOutlineCalendarDays,
  HiOutlineTv,
  HiOutlineCube,
  HiOutlineCheck,
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice2,
  HiOutlineSun,
  HiOutlineUserGroup,
  HiOutlineCake,
  HiOutlineKey,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';
import './AuthPages.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── 19 Service Categories & Roles for Workers ───────────────────────
const SERVICE_CATEGORIES = [
  {
    id: 'home-repairs',
    label: 'Home Repairs',
    icon: HiOutlineWrenchScrewdriver,
    skills: ['Plumber', 'Electrician', 'AC Technician', 'Carpenter', 'Painter', 'Mason / Construction'],
  },
  {
    id: 'vehicle-services',
    label: 'Vehicle Services',
    icon: HiOutlineTruck,
    skills: ['Car Mechanic', 'Bike Mechanic', 'Car Washing & Detailing', 'Tyre Puncture & Alignment', 'Auto Electrician'],
  },
  {
    id: 'cleaning-hygiene',
    label: 'Cleaning & Hygiene',
    icon: HiOutlineSparkles,
    skills: ['Home Deep Cleaning', 'Sofa & Carpet Cleaning', 'Pest Control Specialist', 'Water Tank Cleaning', 'Kitchen & Bathroom Cleaning'],
  },
  {
    id: 'home-it-smart-devices',
    label: 'Home IT & Smart Devices',
    icon: HiOutlineTv,
    skills: ['CCTV Installation', 'WiFi & Router Setup', 'Laptop / PC Repair', 'Smart TV & Home Automation', 'Printer & Network Support'],
  },
  {
    id: 'care-family',
    label: 'Care & Family',
    icon: HiOutlineHeart,
    skills: ['Patient Caretaker', 'Senior Citizen Companion', 'Post-Operative Nursing', 'Special Needs Attendant'],
  },
  {
    id: 'utility-daily-help',
    label: 'Utility & Daily Help',
    icon: HiOutlineHome,
    skills: ['Full-Time House Maid', 'Clothes Laundry & Ironing', 'Grocery & Daily Errands', 'Cook Assistant'],
  },
  {
    id: 'learning-support',
    label: 'Learning & Support',
    icon: HiOutlineAcademicCap,
    skills: ['Private Home Tutor', 'English / Language Coach', 'Music & Guitar Teacher', 'Personal Yoga & Fitness Coach'],
  },
  {
    id: 'property-society',
    label: 'Property & Society',
    icon: HiOutlineBuildingOffice2,
    skills: ['Society Security Guard', 'Facility Supervisor', 'Water Pump Operator', 'Gate & Intercom Tech', 'Boundary Painter'],
  },
  {
    id: 'seasonal-festive',
    label: 'Seasonal & Festive',
    icon: HiOutlineSun,
    skills: ['Festive Light Cascading Tech', 'Pre-Diwali Deep Cleaner', 'Holi & Party Cleanup', 'Monsoon Roof Waterproofing'],
  },
  {
    id: 'furniture-decor',
    label: 'Furniture & Decor',
    icon: HiOutlineCube,
    skills: ['Custom Furniture Carpenter', 'Modular Wardrobe Assembly', 'Upholstery & Cushion Maker', 'Wallpaper & Wall Panel Installer'],
  },
  {
    id: 'garden-outdoor',
    label: 'Garden & Outdoor',
    icon: HiOutlineSparkles,
    skills: ['Professional Gardener', 'Lawn Mower & Trimmer', 'Balcony Planter Designer', 'Organic Pest & Fertilizer Expert'],
  },
  {
    id: 'packers-movers',
    label: 'Packers & Movers',
    icon: HiOutlineTruck,
    skills: ['Household Shifting Mover', 'Fragile Packing Specialist', 'Loading & Unloading Porter', 'Transit Truck Driver'],
  },
  {
    id: 'health-wellness',
    label: 'Health & Wellness',
    icon: HiOutlineShieldCheck,
    skills: ['Home Physiotherapist', 'Certified Home Nurse', 'Blood Sample Collector', 'Elderly Healthcare Assistant'],
  },
  {
    id: 'kids-elderly-care',
    label: 'Kids & Elderly Care',
    icon: HiOutlineUserGroup,
    skills: ['Certified Nanny / Babysitter', 'Infant Caregiver', 'Elderly Bedside Assistant', 'Child Homework Support'],
  },
  {
    id: 'pet-services',
    label: 'Pet Services',
    icon: HiOutlineHeart,
    skills: ['Professional Pet Groomer', 'Certified Dog Walker', 'Vet Assistant at Home', 'Pet Boarding & Sitting Caretaker'],
  },
  {
    id: 'food-kitchen',
    label: 'Food Kitchen',
    icon: HiOutlineCake,
    skills: ['Gourmet Home Chef', 'North/South Indian Family Cook', 'Mughlai & Biryani Master', 'Custom Cake Baker & Decorator'],
  },
  {
    id: 'travel-commute',
    label: 'Travel & Commute',
    icon: HiOutlineKey,
    skills: ['Verified Outstation Chauffeur', 'Daily City Car Driver', 'Airport Commute Driver', 'Luxury Car Chauffeur'],
  },
  {
    id: 'society-management',
    label: 'Society Management',
    icon: HiOutlineBuildingOffice2,
    skills: ['Biometric Guard Supervisor', 'Society Electrician & Plumber', 'Lift Maintenance Tech', 'RWA Desk Coordinator'],
  },
  {
    id: 'events-hub',
    label: 'Events Hub',
    icon: HiOutlineCalendarDays,
    skills: ['Theme Balloon & Floral Decorator', 'Sound & DJ Setup Specialist', 'Candid Event Photographer', 'Party Event Coordinator'],
  },
];

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher (No experience — will learn & shadow)' },
  { value: '1_2_years', label: '⭐ 1–2 Years Experience' },
  { value: '3_5_years', label: '3–5 Years Experience' },
  { value: '5_plus', label: '5+ Years (Senior Expert Level)' },
];

// ── Main Component ──────────────────────────────────────────────────
const WorkerRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Basic Info, 2 = Skills, 3 = Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    serviceCategory: 'home-repairs',
    skills: [],
    experience: '1_2_years',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const selectCategory = (catId) => {
    update('serviceCategory', catId);
    update('skills', []); // Reset skills on category change
  };

  const selectedCategoryObj = SERVICE_CATEGORIES.find((c) => c.id === form.serviceCategory);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return SERVICE_CATEGORIES;
    const q = categorySearch.toLowerCase().trim();
    return SERVICE_CATEGORIES.filter((c) =>
      c.label.toLowerCase().includes(q) || c.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [categorySearch]);

  // ── Step 1 Validation ──
  const canProceedToStep2 = form.name && form.email && form.phone && form.password && form.city;

  // ── Step 2 Validation ──
  const canSubmit = form.serviceCategory && form.skills.length > 0 && form.experience;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: 'worker',
          city: form.city,
          serviceCategory: selectedCategoryObj?.label || form.serviceCategory,
          skills: form.skills,
          experience: EXPERIENCE_OPTIONS.find((e) => e.value === form.experience)?.label || form.experience,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      setStep(3); // Show success screen
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Success Screen ──
  if (step === 3) {
    return (
      <div className="auth-page">
        <div className="container" style={{ maxWidth: '560px', textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <HiOutlineCheckCircle style={{ fontSize: '3.5rem', color: 'var(--primary-600)' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy-900)', marginBottom: '12px' }}>
            Application Submitted!
          </h1>
          <p style={{ color: 'var(--navy-500)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '28px' }}>
            Your registration for <strong>{selectedCategoryObj?.label}</strong> is received. The next step is to <strong>visit your nearest ServeCircle Hub/Office</strong> for verification and skill activation.
          </p>

          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            <h3 style={{ fontWeight: 800, color: '#92400e', marginBottom: '12px', fontSize: '0.95rem' }}>What Happens Next?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 1, text: 'Visit ServeCircle Hub with your Aadhar Card / ID proof.' },
                { id: 2, text: 'You will have a short interview and skill demonstration.' },
                { id: 3, text: 'Our team will activate your account within 24 hours of clearing the test.' },
                { id: 4, text: 'If you are a Fresher, you will start as a "Rookie" and shadow a Senior Pro for your first 15 jobs.' },
                { id: 5, text: 'After rookie training, you can take Solo jobs and earn on your own!' },
              ].map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.85rem', color: '#78350f' }}>
                  <span style={{ minWidth: '22px', height: '22px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                    {idx + 1}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', marginBottom: '28px', fontSize: '0.85rem', color: '#166534' }}>
            <HiOutlineMapPin style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            <strong>ServeCircle Hub, {form.city || 'Ahmedabad'}</strong> — Our team will contact you on{' '}
            <strong>{form.phone}</strong> to schedule your onboarding slot.
          </div>

          <Link to="/login" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            Go to Login <HiOutlineArrowRight style={{ marginLeft: '8px' }} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="container auth-grid">

        {/* LEFT: Form Panel */}
        <section className="auth-panel">
          {/* Progress Steps */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '28px' }}>
            {[
              { n: 1, label: 'Basic Info' },
              { n: 2, label: '19 Service Roles & Skills' },
            ].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.8rem',
                  background: step >= s.n ? 'var(--primary-600)' : '#e2e8f0',
                  color: step >= s.n ? 'white' : '#94a3b8',
                }}>
                  {step > s.n ? <HiOutlineCheck style={{ strokeWidth: 3 }} /> : s.n}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: step >= s.n ? 'var(--navy-800)' : '#94a3b8' }}>{s.label}</span>
                {i < 1 && <div style={{ width: '32px', height: '2px', background: step > s.n ? 'var(--primary-500)' : '#e2e8f0' }} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <span className="auth-kicker">Join as a Verified Professional</span>
              <h1 className="auth-title">Worker Basic Details</h1>
              <p className="auth-subtitle">Create your verified worker profile to start receiving direct job bookings.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                <div className="input-group">
                  <label htmlFor="w-name">Full Name</label>
                  <input id="w-name" className="input-field" placeholder="Full name as on Aadhar Card" value={form.name} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div className="input-group">
                  <label htmlFor="w-email">Email Address</label>
                  <input id="w-email" type="email" className="input-field" placeholder="worker@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
                </div>
                <div className="input-group">
                  <label htmlFor="w-phone">Mobile Number</label>
                  <input id="w-phone" className="input-field" placeholder="10-digit mobile number" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
                <div className="input-group">
                  <label htmlFor="w-city">Service City</label>
                  <input id="w-city" className="input-field" placeholder="e.g. Ahmedabad, Surat, Vadodara, Rajkot" value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
                <div className="input-group">
                  <label htmlFor="w-pass">Password</label>
                  <input id="w-pass" type="password" className="input-field" placeholder="Create a secure password" value={form.password} onChange={(e) => update('password', e.target.value)} />
                </div>
              </div>

              <div className="auth-form-footer" style={{ marginTop: '24px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  style={{ opacity: canProceedToStep2 ? 1 : 0.5 }}
                >
                  Next: Select Service Role (19 Services) <HiOutlineArrowRight />
                </button>
                <span className="auth-hint">
                  Already registered? <Link to="/login" className="auth-alt-link">Sign in</Link>
                </span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <span className="auth-kicker">Step 2 of 2: Service Selection</span>
              <h1 className="auth-title">Select Your Service Role</h1>
              <p className="auth-subtitle">Choose your primary service category from all 19 ServeCircle departments, then check your skills.</p>

              {/* Search filter for 19 services */}
              <div style={{ position: 'relative', marginTop: '16px', marginBottom: '12px' }}>
                <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search among 19 main services (e.g. Home Repairs, Travel, Electrician)..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              {/* 19 Service Categories Grid */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>19 Main Service Roles:</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Showing {filteredCategories.length} categories</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredCategories.map((cat, idx) => {
                    const isSelected = form.serviceCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => selectCategory(cat.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: `2px solid ${isSelected ? 'var(--primary-600)' : '#e2e8f0'}`,
                          background: isSelected ? '#eff6ff' : 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: isSelected ? '#1e40af' : 'var(--navy-800)',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ color: isSelected ? '#2563eb' : '#64748b', fontSize: '1.2rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          <Icon />
                        </span>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {idx + 1}. {cat.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills Selection for Chosen Category */}
              {selectedCategoryObj && (
                <div style={{ marginBottom: '18px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px', display: 'block' }}>
                    Select Your Specific Skills in <strong>{selectedCategoryObj.label}</strong> *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedCategoryObj.skills.map((skill) => {
                      const isSkillSelected = form.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '100px',
                            border: `2px solid ${isSkillSelected ? 'var(--primary-600)' : '#cbd5e1'}`,
                            background: isSkillSelected ? 'var(--primary-600)' : 'white',
                            color: isSkillSelected ? 'white' : 'var(--navy-800)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isSkillSelected && <HiOutlineCheckCircle style={{ fontSize: '0.9rem' }} />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  {form.skills.length === 0 && (
                    <span style={{ display: 'block', marginTop: '6px', fontSize: '0.74rem', color: '#d97706', fontWeight: 600 }}>
                      ⚠️ Please tap at least one skill you can perform.
                    </span>
                  )}
                </div>
              )}

              {/* Experience Level */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px', display: 'block' }}>
                  Your Experience Level *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('experience', opt.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: `2px solid ${form.experience === opt.value ? 'var(--primary-600)' : '#e2e8f0'}`,
                        background: form.experience === opt.value ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: form.experience === opt.value ? '#1e40af' : 'var(--navy-800)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1 }}>
                  <HiOutlineArrowLeft /> Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={!canSubmit || loading}
                  style={{ flex: 2, opacity: canSubmit && !loading ? 1 : 0.5 }}
                >
                  {loading ? 'Creating Worker Account...' : 'Complete Registration'} {!loading && <HiOutlineArrowRight />}
                </button>
              </div>
            </>
          )}
        </section>

        {/* RIGHT: Info Panel */}
        <aside className="auth-panel">
          <h2 className="auth-side-title">Worker Verification & Dispatch</h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
            ServeCircle connects workers across all 19 main service domains with verified customer bookings:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '1', title: 'Pick from 19 Main Services', desc: 'From Home Repairs and Vehicle Care to Events, Society and Travel Chauffeur.' },
              { icon: '2', title: 'Live Instant Notification', desc: 'When a customer books in your service category, get notified directly with call & job details.' },
              { icon: '3', title: 'Police / ID Verification', desc: 'Get your official digital badge and QR code after office identity check.' },
              { icon: '4', title: 'Transparent Payouts', desc: 'Direct earnings deposited into your wallet balance with zero hidden deductions.' },
            ].map((item) => (
              <div key={item.title} className="auth-role-card" style={{ padding: '12px 14px' }}>
                <div className="auth-role-head">
                  <span className="auth-role-name" style={{ fontSize: '0.82rem' }}>{item.icon}. {item.title}</span>
                </div>
                <p className="auth-role-text" style={{ fontSize: '0.74rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', background: '#f0fdf4', borderRadius: '10px', padding: '12px 14px', fontSize: '0.78rem', color: '#166534' }}>
            <HiOutlineShieldCheck style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            <strong>100% Verified Work Ecosystem</strong>: Only approved professionals receive customer booking requests and call connections.
          </div>
        </aside>

      </div>
    </div>
  );
};

export default WorkerRegister;
