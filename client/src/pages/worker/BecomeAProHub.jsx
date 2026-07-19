import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineAcademicCap, HiOutlineCheckBadge, HiOutlineSparkles,
  HiOutlineBriefcase, HiOutlineCheckCircle, HiOutlineCurrencyRupee,
  HiOutlineUserGroup, HiOutlinePlusCircle
} from 'react-icons/hi2';
import '../Dashboard.css';
import '../customer/CustomerPages.css';

const BecomeAProHub = () => {
  const { t } = useTranslation();

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    skillTrack: 'Electrical & Smart Devices',
    experience: 'Fresher (Training Needed)',
    city: '',
    pincode: '',
    agreedToPmkvy: true
  });

  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Local Hero Leaderboard Data
  const leaderboard = [
    { rank: 1, name: 'Rajesh Kumar', profession: 'Electrician & Smart Home Specialist', jobs: 284, rating: 4.9, earnings: '₹48,500/mo', isWomenTrack: false },
    { rank: 2, name: 'Priya Sharma', profession: 'Home Salon & Beautician Pro', jobs: 215, rating: 4.8, earnings: '₹39,200/mo', isWomenTrack: true },
    { rank: 3, name: 'Amit Patel', profession: 'Plumbing & Drainage Expert', jobs: 198, rating: 4.9, earnings: '₹36,800/mo', isWomenTrack: false },
    { rank: 4, name: 'Sunita Devi', profession: 'Gourmet Home Chef / Tiffin Hub', jobs: 174, rating: 4.7, earnings: '₹28,600/mo', isWomenTrack: true },
    { rank: 5, name: 'Vikram Singh', profession: 'Home IT & Wi-Fi Installer', jobs: 145, rating: 4.8, earnings: '₹31,400/mo', isWomenTrack: false }
  ];

  // Benefits List
  const benefits = [
    {
      title: 'Zero Onboarding Fees',
      desc: 'No hidden registration charges. Join our circle completely free and start receiving jobs.',
      icon: <HiOutlineCheckCircle style={{ color: '#3b7dc1' }} />
    },
    {
      title: 'First 5 Jobs: 0% Commission',
      desc: 'Get absolute 100% of your earnings for the first 5 customer jobs. Build trust and ratings.',
      icon: <HiOutlineCurrencyRupee style={{ color: '#fbbf24' }} />
    },
    {
      title: 'Govt PMKVY Training Integration',
      desc: 'Free skill upgrade certifications partnered with Pradhan Mantri Kaushal Vikas Yojana.',
      icon: <HiOutlineAcademicCap style={{ color: '#3b82f6' }} />
    },
    {
      title: 'Weekly Payouts',
      desc: 'No waiting for month-ends. Your wallet earnings are directly transferred to your bank weekly.',
      icon: <HiOutlineCheckBadge style={{ color: '#8b5cf6' }} />
    }
  ];

  // Skill Tracks
  const skillTracks = [
    { id: 'electrical', title: 'Electrical & Smart Devices', desc: 'CCTV setup, Wi-Fi router configuring, smart lighting, appliance repairs.' },
    { id: 'care', title: 'Care & Family Attendant', desc: 'Senior care attender, child companion, special medical helpers.' },
    { id: 'salon', title: 'Beauty & Wellness', desc: 'Home salon beautician, bridal makeup, wellness therapy.' },
    { id: 'utility', title: 'Daily Help & Errands', desc: 'On-demand drivers, relocation helpers, daily home chef.' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.city || !formData.pincode) {
      setAlertMsg('All fields are mandatory. Please fill to proceed.');
      return;
    }

    setLoading(true);
    setAlertMsg('');

    // Simulate Onboarding API Call
    setTimeout(() => {
      setLoading(false);
      setRegistered(true);
    }, 1500);
  };

  return (
    <div className="page-content">
      {/* Page Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.becomeAPro')} 🚀</h1>
          <p className="page-subtitle">Zero Commission, Free PMKVY Government Certification, and Safe Earnings for Local Professionals.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.7fr 1.3fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: BENEFITS & TRAINING TRACKS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Welcome Panel */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'var(--gradient-dark)', color: 'white' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>Empower Your Career with ServeCircle</h2>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.9, marginBottom: '16px' }}>
              Whether you are an experienced technician, a student looking for part-time gigs, or a home-based woman wanting to offer culinary/salon services, ServeCircle gives you a premium, commission-free platform to double your income safely.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>⚡ 0% commission first 5 jobs</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>🎓 PMKVY Skills Alliance</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>🏠 Women Empowerment Track</span>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px' }}>Why Join Our Circle?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.6rem', marginTop: '2px' }}>{b.icon}</div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)' }}>{b.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '4px', lineHeight: 1.5 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training tracks */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <HiOutlineAcademicCap style={{ color: 'var(--primary-600)', fontSize: '1.2rem' }} />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-800)', fontWeight: 800 }}>Available Skill Upgrade Tracks</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '18px' }}>
              Complete the digital or hands-on PMKVY training track. Upon completion, get a verified **Pro Badge** that increases matching speed by 40% and booking rates by 25%.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {skillTracks.map((track) => (
                <div key={track.id} style={{ padding: '16px', background: 'var(--gray-5', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', transition: 'all 0.2s' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>{track.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '6px', lineHeight: 1.4 }}>{track.desc}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-600)', fontWeight: 700, display: 'inline-block', marginTop: '10px' }}>
                    Govt Certification Available →
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: APPLICATION FORM & LEADERBOARD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Candidate Registration Card */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '4px' }}>Registration Portal</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '20px' }}>Submit your application today. Our local manager will call within 24 hours.</p>

            {registered ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f0f5fa', border: '1px solid #c2d7ea', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#065f46', marginTop: '12px' }}>Application Registered!</h4>
                <p style={{ fontSize: '0.8rem', color: '#224c82', marginTop: '6px', lineHeight: 1.5 }}>
                  Thank you, <strong>{formData.fullName}</strong>. Your candidate ID is <strong>SC-PRO-{Math.floor(Math.random() * 90000) + 10000}</strong>. 
                  Our local verification officer will contact you on <strong>{formData.phone}</strong> for document checks and setting up your PMKVY training.
                </p>
                <button className="btn btn-primary" onClick={() => setRegistered(false)} style={{ background: '#3b7dc1', marginTop: '16px', fontSize: '0.8rem' }}>
                  Register Another Candidate
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {alertMsg && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ {alertMsg}</div>}
                
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Full Name (as in Aadhaar) *</label>
                  <input type="text" name="fullName" className="input-field" placeholder="e.g. Rajesh Kumar" value={formData.fullName} onChange={handleInputChange} style={{ padding: '10px 14px', fontSize: '0.85rem' }} />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Mobile Number *</label>
                  <input type="tel" name="phone" className="input-field" placeholder="e.g. 9876543210" value={formData.phone} onChange={handleInputChange} style={{ padding: '10px 14px', fontSize: '0.85rem' }} />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Primary Skill Track</label>
                  <select name="skillTrack" className="input-field" value={formData.skillTrack} onChange={handleInputChange} style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                    <option value="Electrical & Smart Devices">Electrical & Smart Devices</option>
                    <option value="Care & Family Attendant">Care & Family Attendant</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                    <option value="Daily Help & Errands">Daily Help & Errands</option>
                    <option value="Tailoring & Alteration">Tailoring & Alteration</option>
                    <option value="Home Tuition & senior computer setup">Home Tuition & Senior Computer Setup</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Existing Experience</label>
                  <select name="experience" className="input-field" value={formData.experience} onChange={handleInputChange} style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                    <option value="Fresher (Training Needed)">Fresher (Training Needed)</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5+ Years">5+ Years (Expert Track)</option>
                  </select>
                </div>

                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: 0 }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>City *</label>
                    <input type="text" name="city" className="input-field" placeholder="e.g. Vadodara" value={formData.city} onChange={handleInputChange} style={{ padding: '10px 14px', fontSize: '0.85rem' }} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Pincode *</label>
                    <input type="text" name="pincode" className="input-field" placeholder="390001" value={formData.pincode} onChange={handleInputChange} style={{ padding: '10px 14px', fontSize: '0.85rem' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                  <input type="checkbox" name="agreedToPmkvy" id="pmkvy-chk" checked={formData.agreedToPmkvy} onChange={handleInputChange} style={{ marginTop: '3px' }} />
                  <label htmlFor="pmkvy-chk" style={{ fontSize: '0.75rem', color: 'var(--gray-500)', cursor: 'pointer', lineHeight: 1.4 }}>
                    I want to enroll in the free <strong>PMKVY Certification Scheme</strong> to receive government accreditation and a verified Pro Badge.
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                  {loading ? 'Submitting...' : 'Register as a Pro'}
                </button>
              </form>
            )}
          </div>

          {/* Local Hero Leaderboard Card */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <HiOutlineSparkles style={{ color: '#fbbf24', fontSize: '1.25rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800 }}>Local Hero Leaderboard</h3>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '14px' }}>
              Meet our top-performing partners active in your neighborhood this month:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaderboard.map((hero) => (
                <div 
                  key={hero.rank} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 12px', 
                    background: hero.rank === 1 ? '#fffbeb' : 'var(--gray-50)', 
                    border: hero.rank === 1 ? '1.5px solid #fde68a' : '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 900, 
                      color: hero.rank === 1 ? '#b45309' : 'var(--gray-500)', 
                      width: '20px'
                    }}>
                      #{hero.rank}
                    </span>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                        {hero.name} {hero.isWomenTrack && '🚺'}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '2px' }}>
                        {hero.profession}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-700)', display: 'block' }}>{hero.earnings}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>⭐ {hero.rating} • {hero.jobs} jobs</span>
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
