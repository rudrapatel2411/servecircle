import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineHeart, HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineGlobeAlt,
  HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineShieldCheck,
  HiOutlineSparkles, HiOutlineAcademicCap, HiOutlineStar, HiOutlineArrowRight,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import { broadcastNotificationToTabs } from '../utils/notificationSync';
import './Dashboard.css';

const IMPACT_DATA = {
  'women-empowerment': {
    slug: 'women-empowerment',
    title: 'Women Empowerment Initiative',
    badge: 'Safe-Zone Program • Zero Onboarding Fee',
    color: '#be185d',
    gradient: 'linear-gradient(135deg, #be185d 0%, #db2777 100%)',
    bgLight: '#fdf2f8',
    icon: <HiOutlineHeart />,
    subtitle:
      'Enabling women across India to build financially independent careers in home care, beauty wellness, tutoring, cooking, and smart home support with Aadhar-verified safe-zone guarantees.',
    stats: [
      { value: '2,450+', label: 'Active Women Pros' },
      { value: '100%', label: 'Aadhar-Verified Customers' },
      { value: '₹28,500', label: 'Avg Monthly Income' },
      { value: '0%', label: 'Platform Fee (First 90 Days)' },
    ],
    pillars: [
      {
        title: 'Daytime Safe-Zone Guarantee',
        desc: 'Workers choose strict 9 AM–6 PM operating windows and only receive requests from KYC-verified households.',
      },
      {
        title: 'Free Vocational Certification & Kit',
        desc: 'Includes a ₹4,500 branded hygiene & tool starter kit plus hands-on training in salon care, deep cleaning, or tutoring.',
      },
      {
        title: 'Instant Emergency SOS & Live GPS',
        desc: 'Every visit includes real-time family check-in alerts and 1-tap ServeCircle 24x7 rapid response monitoring.',
      },
    ],
    stories: [
      {
        name: 'Sunita Chauhan',
        role: 'Deep Cleaning Specialist • Ahmedabad',
        quote: 'Started with 2 weekend bookings while managing my kids. Today I lead a 4-woman team earning ₹36,000/month.',
        metric: '420+ Jobs • 4.9★',
      },
      {
        name: 'Kavita Desai',
        role: 'Home Tutor & Wellness Coach • Vadodara',
        quote: 'The Aadhar-verified safe zone gave my family total peace of mind. Payments arrive straight to my bank every Friday.',
        metric: '310+ Sessions • 5.0★',
      },
    ],
    formTitle: 'Join Women Safe-Zone Program or Sponsor a Kit',
    formBtn: 'Submit Application / Pledge',
    formTypeLabel: 'I want to',
    formOptions: [
      'Apply as a Women Service Partner',
      'Sponsor a ₹1,500 Safety & Skill Starter Kit',
      'Refer a Woman Candidate for Training',
    ],
  },
  'first-job': {
    slug: 'first-job',
    title: 'First Job & Youth Apprenticeship',
    badge: 'Fresher Friendly • Paid Shadow Training',
    color: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    bgLight: '#eff6ff',
    icon: <HiOutlineBriefcase />,
    subtitle:
      'Turning first-time job seekers with zero prior experience into certified technicians through our 15-job Rookie Shadow Program with guaranteed weekly stipends.',
    stats: [
      { value: '1,820+', label: 'First Jobs Launched' },
      { value: '15 Jobs', label: 'Paid Shadow Mentorship' },
      { value: '₹12,000+', label: 'Guaranteed Starting Stipend' },
      { value: '94%', label: 'Graduation to Solo Pro' },
    ],
    pillars: [
      {
        title: 'Step 1: Rookie Shadow Trainee',
        desc: 'Pair directly with a 4.9★ Senior Pro on real customer jobs to learn customer etiquette, diagnostics, and safety.',
      },
      {
        title: 'Step 2: ServeCircle Hub Certification',
        desc: 'Clear a practical skill check at our city hub to unlock your verified Digital Worker ID Card and Solo Jobs.',
      },
      {
        title: 'Step 3: Senior Mentor Bonus',
        desc: 'After 50 solo jobs, become a Senior Mentor and earn ₹50 extra per job for training new youth entrants.',
      },
    ],
    stories: [
      {
        name: 'Rohan Parmar',
        role: 'AC & Appliance Technician • Surat',
        quote: 'I joined at 19 with zero experience. My Senior Mentor guided me through 15 shadow visits—now I own my tools and earn ₹32,000/month.',
        metric: '190 Solo Jobs Completed',
      },
      {
        name: 'Deepak Solanki',
        role: 'Home IT & CCTV Installer • Ahmedabad',
        quote: 'College dropouts rarely get structured apprenticeships. ServeCircle gave me technical certification in 3 weeks.',
        metric: '4.9★ Certified Pro',
      },
    ],
    formTitle: 'Apply for Paid First-Job Apprenticeship',
    formBtn: 'Apply for Rookie Program',
    formTypeLabel: 'Preferred Skill Track',
    formOptions: [
      'Home Repairs (Electrical / Plumbing / AC)',
      'Vehicle Services & EV Detailing',
      'Home IT, WiFi & CCTV Setup',
      'Cleaning, Hospitality & Events',
    ],
  },
  'local-heroes': {
    slug: 'local-heroes',
    title: 'Local Hero Stories & Hall of Fame',
    badge: 'Community Champions • Verified Excellence',
    color: '#b45309',
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
    bgLight: '#fffbeb',
    icon: <HiOutlineUserGroup />,
    subtitle:
      'Celebrating dedicated technicians, drivers, caretakers, and helpers who went beyond the call of duty during emergencies to protect homes and families.',
    stats: [
      { value: '480+', label: 'Recognized Local Heroes' },
      { value: '18 Min', label: 'Fastest Emergency Rescue' },
      { value: '₹10L+', label: 'Hero Cash Awards Paid' },
      { value: '4.95★', label: 'Average Community Rating' },
    ],
    pillars: [
      {
        title: 'Midnight Monsoon Rescue Award',
        desc: 'Double payout + ₹5,000 Hero Bonus for workers who resolve flooding, power outages, or highway breakdowns at night.',
      },
      {
        title: 'Senior Citizen Guardian Badge',
        desc: 'Awarded to professionals consistently trusted by elderly families for honest pricing and compassionate care.',
      },
      {
        title: 'Zero-Complaint Gold Streak',
        desc: 'Professionals completing 100+ consecutive jobs with zero escalations receive free family health insurance.',
      },
    ],
    stories: [
      {
        name: 'Ramesh Kumar',
        role: 'Senior Plumber & Emergency Lead • Ahmedabad',
        quote: 'Responded at 1:30 AM to stop a burst main pipe inside an elderly couple’s apartment within 16 minutes of the SOS alert.',
        metric: 'Midnight Hero Winner • 650+ Jobs',
      },
      {
        name: 'Vikram Jadeja',
        role: 'Roadside Vehicle Mechanic • Rajkot Highway',
        quote: 'Helped a family stranded 45 km outside city limits during heavy rain—jumped battery, changed tyre, and refused extra tip.',
        metric: '4.98★ Roadside Savior',
      },
    ],
    formTitle: 'Nominate a ServeCircle Local Hero',
    formBtn: 'Submit Hero Nomination',
    formTypeLabel: 'Hero Award Category',
    formOptions: [
      'Emergency Rapid Response Hero',
      'Honesty & Zero-Overcharge Champion',
      'Elderly & Family Care Excellence',
      'Cleanliness & Community Impact Star',
    ],
  },
  'ngo-partners': {
    slug: 'ngo-partners',
    title: 'NGO Partnerships & Civic Drives',
    badge: 'Grassroots Collaborations •CSR & Skill Drives',
    color: '#15803d',
    gradient: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)',
    bgLight: '#f0fdf4',
    icon: <HiOutlineGlobeAlt />,
    subtitle:
      'Partnering with verified NGOs, Resident Welfare Associations (RWAs), and vocational institutes to train underserved workers and run neighborhood sustainability drives.',
    stats: [
      { value: '18', label: 'Active Partner NGOs' },
      { value: '6,400+', label: 'Workers Trained & Placed' },
      { value: '120+', label: 'Society Cleanliness Drives' },
      { value: '₹42L', label: 'CSR & Tool Grants Deployed' },
    ],
    pillars: [
      {
        title: 'Direct Placement Pipeline',
        desc: 'NGO vocational graduates skip middlemen and onboard directly onto ServeCircle with verified IDs and active bookings.',
      },
      {
        title: 'Society Waste & Water Audits',
        desc: 'Partnering with RWAs for rainwater harvesting maintenance, solar cleaning, and eco-friendly pest control.',
      },
      {
        title: 'Transparent Impact Dashboard',
        desc: 'Every partner NGO gets monthly job-completion metrics, worker income growth, and retention reports.',
      },
    ],
    stories: [
      {
        name: 'SEWA Craft & Home Guild',
        role: 'Women Livelihood Partner • Gujarat',
        quote: 'Over 420 women artisans and home cooks trained by our center now earn sustainable monthly incomes through ServeCircle.',
        metric: '420+ Women Placed',
      },
      {
        name: 'Yuva Unstoppable Tech Hub',
        role: 'Youth Vocational Partner • Western India',
        quote: 'Together we launched electrical safety and smart-home CCTV bootcamps across 14 districts.',
        metric: '91% Placement Rate',
      },
    ],
    formTitle: 'Partner Your NGO or Sponsor a Community Drive',
    formBtn: 'Submit NGO Partnership Request',
    formTypeLabel: 'Collaboration Type',
    formOptions: [
      'Onboard NGO Skill Training Graduates',
      'Co-Host Society Cleanliness / Water Audit Drive',
      'CSR Funding / Tool Kit Sponsorship',
      'RWA Community Welfare Partnership',
    ],
  },
};

const HERO_NOMINATIONS_KEY = 'servecircle_impact_submissions';

const ImpactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const activeKey = IMPACT_DATA[id] ? id : 'women-empowerment';
  const info = IMPACT_DATA[activeKey];

  const [formState, setFormState] = useState({
    name: '',
    contact: '',
    city: 'Ahmedabad',
    option: info.formOptions[0],
    notes: '',
  });
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [communitySubmissions, setCommunitySubmissions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HERO_NOMINATIONS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setSubmittedTicket(null);
    setFormState((prev) => ({ ...prev, option: info.formOptions[0], notes: '' }));
  }, [activeKey, info.formOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.contact.trim()) return;

    const ticketId = `SC-IMP-${Math.floor(10000 + Math.random() * 90000)}`;
    const entry = {
      id: ticketId,
      initiative: activeKey,
      initiativeTitle: info.title,
      name: formState.name.trim(),
      contact: formState.contact.trim(),
      city: formState.city.trim() || 'Ahmedabad',
      option: formState.option,
      notes: formState.notes.trim(),
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    const nextList = [entry, ...communitySubmissions].slice(0, 20);
    setCommunitySubmissions(nextList);
    localStorage.setItem(HERO_NOMINATIONS_KEY, JSON.stringify(nextList));
    setSubmittedTicket(entry);
    setFormState({ name: '', contact: '', city: 'Ahmedabad', option: info.formOptions[0], notes: '' });

    broadcastNotificationToTabs({
      id: `impact_${ticketId}`,
      title: `🌍 Social Impact Request: ${info.title}`,
      message: `${entry.name} (${entry.city}) submitted "${entry.option}" (${ticketId}).`,
      type: 'alert',
      targetAudience: 'admin',
    });
  };

  const currentSubmissions = communitySubmissions.filter((s) => s.initiative === activeKey);

  return (
    <div style={{ minHeight: '92vh', background: '#f8fafc', padding: '28px 20px 64px' }}>
      <div className="container" style={{ maxWidth: '1120px', margin: '0 auto' }}>
        {/* Back + Switcher Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#334155', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none',
            }}
          >
            <HiOutlineArrowLeft /> Back to Home
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.values(IMPACT_DATA).map((item) => {
              const isSelected = item.slug === activeKey;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => navigate(`/about/${item.slug}`)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '999px',
                    border: `1.5px solid ${isSelected ? item.color : '#cbd5e1'}`,
                    background: isSelected ? item.color : 'white',
                    color: isSelected ? 'white' : '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {item.title.split(' ')[0]} {item.title.split(' ')[1]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Banner */}
        <div
          style={{
            background: info.gradient,
            color: 'white',
            borderRadius: '24px',
            padding: '38px 32px',
            marginBottom: '28px',
            boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.2)', padding: '5px 14px',
              borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '12px',
            }}
          >
            <HiOutlineSparkles /> {info.badge}
          </span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, margin: '0 0 10px', color: 'white' }}>
            {info.title}
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.94, maxWidth: '760px', lineHeight: 1.6, margin: 0 }}>
            {info.subtitle}
          </p>

          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginTop: '26px' }}>
            {info.stats.map((st, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(8px)',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <strong style={{ fontSize: '1.5rem', fontWeight: 900, display: 'block' }}>{st.value}</strong>
                <span style={{ fontSize: '0.76rem', opacity: 0.9 }}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Program Pillars Grid */}
        <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiOutlineShieldCheck style={{ color: info.color }} /> How This Initiative Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '18px', marginBottom: '32px' }}>
          {info.pillars.map((p, i) => (
            <div
              key={i}
              className="card"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid #e2e8f0',
                borderTop: `4px solid ${info.color}`,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: info.color, textTransform: 'uppercase' }}>
                Pillar 0{i + 1}
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Real Stories + Interactive Action Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {/* Left: Impact Stories + Community Nominations */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineStar style={{ color: info.color }} /> Featured Impact Stories
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {info.stories.map((st, i) => (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{st.name}</h4>
                      <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>{st.role}</span>
                    </div>
                    <span style={{ background: info.bgLight, color: info.color, padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800 }}>
                      {st.metric}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
                    &ldquo;{st.quote}&rdquo;
                  </p>
                </div>
              ))}

              {/* Live Community Submissions for this Impact Page */}
              {currentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    background: info.bgLight,
                    borderRadius: '16px',
                    padding: '18px',
                    border: `1.5px solid ${info.color}40`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{sub.name}</strong>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: info.color }}>{sub.id}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#475569', marginBottom: '6px' }}>
                    <HiOutlineMapPin style={{ verticalAlign: 'middle' }} /> {sub.city} • {sub.option} • {sub.createdAt}
                  </div>
                  {sub.notes && <p style={{ margin: 0, fontSize: '0.82rem', color: '#1e293b' }}>{sub.notes}</p>}
                </div>
              ))}
            </div>

            {/* Direct CTA Links */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <Link to="/worker-register" className="btn btn-primary" style={{ background: info.color, borderColor: info.color }}>
                Onboard as Certified Worker <HiOutlineArrowRight />
              </Link>
              <Link to="/customer/services" className="btn btn-outline">
                Book Verified Services
              </Link>
            </div>
          </div>

          {/* Right: Working Application / Nomination / Partnership Form */}
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '26px',
              border: `1.5px solid ${info.color}30`,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: info.color, textTransform: 'uppercase' }}>
              Take Action Today
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 14px' }}>
              {info.formTitle}
            </h3>

            {submittedTicket && (
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px',
                  color: '#065f46',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem' }}>
                  <HiOutlineCheckCircle size={20} /> Request Submitted ({submittedTicket.id})
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
                  Thank you, <strong>{submittedTicket.name}</strong>! Our ServeCircle Impact Team &amp; Admin have received your submission for <strong>{submittedTicket.option}</strong>.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Full Name / Organization *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your name or NGO name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Mobile / Email *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="98765 43210"
                    value={formState.contact}
                    onChange={(e) => setFormState({ ...formState, contact: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  {info.formTypeLabel}
                </label>
                <select
                  className="input-field"
                  value={formState.option}
                  onChange={(e) => setFormState({ ...formState, option: e.target.value })}
                >
                  {info.formOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Story / Skills / Details
                </label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="Share details, hero story, or skill background..."
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontWeight: 800,
                  background: info.color,
                  borderColor: info.color,
                  marginTop: '4px',
                }}
              >
                {info.formBtn}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactDetail;
