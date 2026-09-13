import { useState } from 'react';
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
} from 'react-icons/hi2';
import './AuthPages.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Service Categories & Skills ─────────────────────────────────────
const SERVICE_CATEGORIES = [
  {
    id: 'home_repairs',
    label: 'Home Repairs',
    icon: '🔧',
    skills: ['AC Repair & Service', 'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Mason / Construction'],
  },
  {
    id: 'cleaning',
    label: 'Cleaning & Hygiene',
    icon: '🧹',
    skills: ['Home Deep Cleaning', 'Sofa / Carpet Cleaning', 'Pest Control', 'Water Tank Cleaning'],
  },
  {
    id: 'vehicle',
    label: 'Vehicle Services',
    icon: '🚗',
    skills: ['Car Washing & Detailing', 'Bike Repair', 'Car Mechanic', 'Tyre Puncture'],
  },
  {
    id: 'beauty',
    label: 'Beauty & Wellness',
    icon: '💆',
    skills: ['Mens Salon / Barber', 'Ladies Beauty', 'Massage Therapy', 'Yoga Instructor'],
  },
  {
    id: 'appliances',
    label: 'Appliance Repair',
    icon: '📺',
    skills: ['Washing Machine Repair', 'Refrigerator Repair', 'Microwave / Oven Repair', 'TV / LED Repair'],
  },
  {
    id: 'shifting',
    label: 'Shifting & Relocation',
    icon: '📦',
    skills: ['Packer & Mover', 'Loading / Unloading', 'Furniture Assembly'],
  },
];

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: '🎓 Fresher (No experience — will learn)' },
  { value: '1_2_years', label: '⭐ 1–2 Years Experience' },
  { value: '3_5_years', label: '💼 3–5 Years Experience' },
  { value: '5_plus', label: '🏆 5+ Years (Expert Level)' },
];

// ── Main Component ──────────────────────────────────────────────────
const WorkerRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Basic Info, 2 = Skills, 3 = Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    serviceCategory: '',
    skills: [],
    experience: '',
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
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy-900)', marginBottom: '12px' }}>
            Application Submitted!
          </h1>
          <p style={{ color: 'var(--navy-500)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '28px' }}>
            Your registration is received. The next step is to <strong>visit your nearest ServeCircle Hub/Office</strong> for a brief in-person interview and practical skill test.
          </p>

          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            <h3 style={{ fontWeight: 800, color: '#92400e', marginBottom: '12px', fontSize: '0.95rem' }}>📋 What Happens Next?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { emoji: '1️⃣', text: 'Visit ServeCircle Hub with your Aadhar Card / ID proof.' },
                { emoji: '2️⃣', text: 'You will have a short interview and skill demonstration.' },
                { emoji: '3️⃣', text: 'Our team will activate your account within 24 hours of clearing the test.' },
                { emoji: '4️⃣', text: 'If you are a Fresher, you will start as a "Rookie" and shadow a Senior Pro for your first 15 jobs.' },
                { emoji: '5️⃣', text: 'After rookie training, you can take Solo jobs and earn on your own!' },
              ].map((item) => (
                <div key={item.emoji} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#78350f' }}>
                  <span>{item.emoji}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', marginBottom: '28px', fontSize: '0.85rem', color: '#166534' }}>
            <HiOutlineMapPin style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            <strong>ServeCircle Hub, {form.city || 'Ahmedabad'}</strong> — Our team will contact you on{' '}
            <strong>{form.phone}</strong> to schedule your visit slot.
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
              { n: 2, label: 'Skills' },
            ].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.8rem',
                  background: step >= s.n ? 'var(--primary-600)' : '#e2e8f0',
                  color: step >= s.n ? 'white' : '#94a3b8',
                }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: step >= s.n ? 'var(--navy-800)' : '#94a3b8' }}>{s.label}</span>
                {i < 1 && <div style={{ width: '32px', height: '2px', background: step > s.n ? 'var(--primary-500)' : '#e2e8f0' }} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              <span className="auth-kicker">Join as a Worker</span>
              <h1 className="auth-title">Basic Information</h1>
              <p className="auth-subtitle">Enter your personal details to create your worker account.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
                <div className="input-group">
                  <label htmlFor="w-name">Full Name</label>
                  <input id="w-name" className="input-field" placeholder="As on Aadhar Card" value={form.name} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div className="input-group">
                  <label htmlFor="w-email">Email Address</label>
                  <input id="w-email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
                </div>
                <div className="input-group">
                  <label htmlFor="w-phone">Mobile Number</label>
                  <input id="w-phone" className="input-field" placeholder="10-digit mobile" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
                <div className="input-group">
                  <label htmlFor="w-city">Your City</label>
                  <input id="w-city" className="input-field" placeholder="e.g. Ahmedabad, Surat, Vadodara" value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
                <div className="input-group">
                  <label htmlFor="w-pass">Password</label>
                  <input id="w-pass" type="password" className="input-field" placeholder="Create a strong password" value={form.password} onChange={(e) => update('password', e.target.value)} />
                </div>
              </div>

              <div className="auth-form-footer" style={{ marginTop: '24px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  style={{ opacity: canProceedToStep2 ? 1 : 0.5 }}
                >
                  Next: Choose Skills <HiOutlineArrowRight />
                </button>
                <span className="auth-hint">
                  Already registered? <Link to="/login" className="auth-alt-link">Sign in</Link>
                </span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <span className="auth-kicker">Step 2 of 2</span>
              <h1 className="auth-title">Your Skills & Services</h1>
              <p className="auth-subtitle">Choose your primary service category and the specific skills you can offer.</p>

              {/* Service Category Selection */}
              <div style={{ marginTop: '20px', marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-700)', marginBottom: '10px', display: 'block' }}>
                  Primary Service Category *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `2px solid ${form.serviceCategory === cat.id ? 'var(--primary-500)' : '#e2e8f0'}`,
                        background: form.serviceCategory === cat.id ? 'var(--primary-50)' : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: form.serviceCategory === cat.id ? 'var(--primary-700)' : 'var(--navy-700)',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Selection */}
              {selectedCategoryObj && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-700)', marginBottom: '10px', display: 'block' }}>
                    Specific Skills (Select all that apply) *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedCategoryObj.skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '100px',
                          border: `2px solid ${form.skills.includes(skill) ? 'var(--primary-500)' : '#e2e8f0'}`,
                          background: form.skills.includes(skill) ? 'var(--primary-500)' : 'white',
                          color: form.skills.includes(skill) ? 'white' : 'var(--navy-700)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {form.skills.includes(skill) && <HiOutlineCheckCircle style={{ fontSize: '0.85rem' }} />}
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Level */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-700)', marginBottom: '10px', display: 'block' }}>
                  Your Experience Level *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('experience', opt.value)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: `2px solid ${form.experience === opt.value ? 'var(--primary-500)' : '#e2e8f0'}`,
                        background: form.experience === opt.value ? 'var(--primary-50)' : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: form.experience === opt.value ? 'var(--primary-700)' : 'var(--navy-700)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>❌ {error}</p>}

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
                  {loading ? 'Submitting...' : 'Submit Application'} {!loading && <HiOutlineArrowRight />}
                </button>
              </div>
            </>
          )}
        </section>

        {/* RIGHT: Info Panel */}
        <aside className="auth-panel">
          <h2 className="auth-side-title">How the Process Works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '📝', title: 'Register Online', desc: 'Fill your details and choose your service category & skills.' },
              { icon: '🏢', title: 'Visit ServeCircle Hub', desc: 'Come to our office with your Aadhar Card for a short interview and skill test.' },
              { icon: '✅', title: 'Get Approved', desc: 'Our team verifies your skills and activates your account within 24 hours.' },
              { icon: '🎓', title: 'Rookie Training (Freshers)', desc: 'If new, you\'ll shadow a Senior Pro for 15 jobs — you\'ll earn a small stipend during this phase.' },
              { icon: '💰', title: 'Start Earning Solo', desc: 'Once training is done, you receive jobs directly and keep your earnings minus the platform commission.' },
            ].map((item) => (
              <div key={item.title} className="auth-role-card">
                <div className="auth-role-head">
                  <span className="auth-role-name">{item.icon} {item.title}</span>
                </div>
                <p className="auth-role-text">{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', background: '#f0fdf4', borderRadius: '10px', padding: '14px', fontSize: '0.8rem', color: '#166534' }}>
            <HiOutlineShieldCheck style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            <strong>100% Secure:</strong> Your data is encrypted. Aadhar verification done physically at our office only.
          </div>
        </aside>

      </div>
    </div>
  );
};

export default WorkerRegister;
