import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineHeart, HiOutlineVideoCamera, HiOutlineMapPin, HiOutlineSparkles, HiOutlineClipboardDocumentList, HiOutlineShoppingBag, HiOutlineDocumentArrowUp } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const PetHub = () => {
  const { t } = useTranslation();
  const [petProfile, setPetProfile] = useState({
    name: 'Max',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: '2 Years',
    specialNeeds: 'Sensitve Skin'
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...petProfile });
  
  const [showWalkTracker, setShowWalkTracker] = useState(false);
  const [mapUrl, setMapUrl] = useState("https://maps.google.com/maps?q=12.9226343,77.6253457&t=&z=15&ie=UTF8&output=embed");

  useEffect(() => {
    if (showWalkTracker && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapUrl(`https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&output=embed`);
        },
        (error) => console.warn("Geolocation denied or failed, using default map.")
      );
    }
  }, [showWalkTracker]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setPetProfile({ ...tempProfile });
    setShowProfileForm(false);
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px' }}>
      
      {/* Back Button */}
      <Link to="/customer/general-services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to General Services
      </Link>



      {/* TOP SECTION: Dashboard (Profile & Health Vault) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>
        
        {/* Interactive Pet Profile Card */}
        <div className="card" style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineHeart style={{ color: '#ec4899' }} /> {t('petHub.customizer')}
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
            {t('petHub.customizerDesc')}
          </p>

          {!showProfileForm ? (
            <div style={{
              background: 'linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)',
              border: '1px solid rgba(236,72,153,0.15)',
              borderRadius: '16px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '5rem', opacity: 0.15 }}>🐾</div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#be185d', margin: '0 0 10px 0' }}>{petProfile.name} 👑</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#9d174d' }}>
                <span>🧬 <strong>{t('petHub.typeBreed')}:</strong> {t('petHub.' + petProfile.type.toLowerCase(), petProfile.type)} ({petProfile.breed})</span>
                <span>🎂 <strong>{t('petHub.age')}:</strong> {petProfile.age}</span>
                <span>⚠️ <strong>{t('petHub.specialNeeds')}:</strong> {petProfile.specialNeeds || t('petHub.none', 'None')}</span>
              </div>
              <button onClick={() => { setTempProfile({ ...petProfile }); setShowProfileForm(true); }} style={{ marginTop: '16px', background: '#be185d', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                {t('petHub.editProfileCard')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.petName')}</label>
                <input type="text" value={tempProfile.name} onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }} required />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.petType')}</label>
                <select value={tempProfile.type} onChange={(e) => setTempProfile({ ...tempProfile, type: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}>
                  <option value="Dog">{t('petHub.dog')}</option>
                  <option value="Cat">{t('petHub.cat')}</option>
                  <option value="Rabbit">{t('petHub.rabbit')}</option>
                  <option value="Bird">{t('petHub.bird')}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.breed')}</label>
                <input type="text" value={tempProfile.breed} onChange={(e) => setTempProfile({ ...tempProfile, breed: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.age')}</label>
                  <input type="text" value={tempProfile.age} onChange={(e) => setTempProfile({ ...tempProfile, age: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.specialNeeds')}</label>
                  <input type="text" value={tempProfile.specialNeeds} onChange={(e) => setTempProfile({ ...tempProfile, specialNeeds: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '8px' }}>{t('petHub.saveProfile')}</button>
                <button type="button" onClick={() => setShowProfileForm(false)} className="btn btn-outline-secondary btn-sm" style={{ flex: 1, padding: '8px' }}>{t('petHub.cancel')}</button>
              </div>
            </form>
          )}
        </div>

        {/* Digital Pet Health Vault */}
        <div className="card" style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#f3e8ff', color: '#9333ea', padding: '12px', borderRadius: '12px', fontSize: '1.5rem' }}>
              <HiOutlineClipboardDocumentList />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, margin: '0 0 4px 0' }}>Digital Pet Health Vault 🏥</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>{t('petHubExt.vaultDesc')}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>{t('petHubExt.antiRabies')}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{t('petHubExt.uploadedOn')}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'white', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #bbf7d0' }}>{t('petHubExt.activeStatus')}</span>
              </div>
              <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>{t('petHubExt.annualShot')}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{t('petHubExt.dueIn')}</div>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>{t('petHubExt.actionRequired')}</span>
              </div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer' }} onClick={() => alert("File upload dialog opened.")}>
              <HiOutlineDocumentArrowUp size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-700)' }}>{t('petHubExt.uploadDoc')}</div>
            </div>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Services Grid */}
      <h3 style={{ fontSize: '1.4rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <HiOutlineShieldCheck style={{ color: '#0d9488' }} /> Pet Services
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Grooming */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛁</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>Premium Grooming</h4>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0d9488', marginBottom: '12px' }}>₹599</span>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>{t('petHub.groomingDesc')}</p>
          <Link to={`/customer/book?service=${encodeURIComponent('Premium Pet Grooming')}&serviceId=pet-grooming&category=pet-services&price=599`} className="btn btn-outline" style={{ width: '100%', textAlign: 'center', borderColor: '#0d9488', color: '#0d9488', fontWeight: 700 }}>Book Grooming</Link>
        </div>

        {/* Vet */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🩺</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>Vet Home Checkup</h4>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0d9488', marginBottom: '12px' }}>₹799</span>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>{t('petHub.vetDesc')}</p>
          <Link to={`/customer/book?service=${encodeURIComponent('Vet Checkup')}&serviceId=vet-visit&category=pet-services&price=799`} className="btn btn-outline" style={{ width: '100%', textAlign: 'center', borderColor: '#0d9488', color: '#0d9488', fontWeight: 700 }}>Book Vet</Link>
        </div>

        {/* Dog Walking */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🦮</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>Daily Dog Walking</h4>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3b82f6', marginBottom: '12px' }}>₹199</span>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>45-min guided walk for {petProfile.name} with live GPS tracking.</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to={`/customer/book?service=${encodeURIComponent('Daily Dog Walking')}&serviceId=pet-walking&category=pet-services&price=199`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center', background: '#3b82f6', borderColor: '#3b82f6', fontWeight: 700 }}>Book Walk</Link>
            <button onClick={() => setShowWalkTracker(!showWalkTracker)} className="btn btn-outline" style={{ flex: 1, borderColor: '#3b82f6', color: '#3b82f6', fontWeight: 700 }}>Demo</button>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.4rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <HiOutlineSparkles style={{ color: '#c026d3' }} /> Premium Add-ons
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Boarding */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏡</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>Pet Boarding & Sitting</h4>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444', marginBottom: '12px' }}>₹899<span style={{fontSize: '0.75rem'}}>/night</span></span>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>Verified homestays for {petProfile.name} while you travel.</p>
          <Link to="/customer/pet-flow?type=boarding" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', background: '#ef4444', borderColor: '#ef4444', fontWeight: 700 }}>Book Boarding</Link>
        </div>

        {/* Training */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐕‍🦺</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>Certified Training</h4>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b', marginBottom: '12px' }}>₹1299<span style={{fontSize: '0.75rem'}}>/session</span></span>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>In-home obedience and behavioral training.</p>
          <Link to="/customer/pet-flow?type=training" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', background: '#f59e0b', borderColor: '#f59e0b', fontWeight: 700 }}>Book Trainer</Link>
        </div>

        {/* Photography */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📸</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>Pet Photography</h4>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#c026d3', marginBottom: '12px' }}>₹2499</span>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>Professional photoshoot for your pet. Includes album.</p>
          <Link to="/customer/pet-flow?type=photography" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', background: '#c026d3', borderColor: '#c026d3', fontWeight: 700 }}>Book Photoshoot</Link>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Custom Pet Supplies Subscription */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <HiOutlineShoppingBag size={16} /> Monthly Delivery
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--navy-900)', fontWeight: 900, margin: '0 0 8px 0' }}>Custom Box for {petProfile.name} 🥩</h3>
            <p style={{ fontSize: '0.9rem', color: '#166534', margin: 0, lineHeight: 1.5 }}>
              Premium {petProfile.type.toLowerCase()} food, healthy treats, and grooming supplies delivered to your door on the 1st of every month. Tailored for {petProfile.breed}s.
            </p>
          </div>
          <div>
            <Link to="/customer/pet-flow?type=subscription" className="btn" style={{ background: '#16a34a', color: 'white', fontWeight: 800, padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.3)' }}>
              Configure Subscription
            </Link>
          </div>
        </div>
        
        {/* Emergency Vet Video Consult CTA */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'white', color: '#ef4444', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                <HiOutlineVideoCamera size={24} />
              </span>
              Emergency Vet Consult 24/7
            </h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#fee2e2' }}>
              Connect with a certified veterinarian via video call instantly. First 5 mins are free.
            </p>
          </div>
          <button className="btn" style={{ background: 'white', color: '#b91c1c', fontWeight: 900, border: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} onClick={() => alert("Initiating emergency video call...")}>
            Connect Now
          </button>
        </div>

        {/* Live Dog Walk Tracker Widget */}
        {showWalkTracker && (
          <div className="card animate-fade-in-up" style={{
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 800, margin: 0 }}>
                  Live Walk Tracker: {petProfile.name} 🐕
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
                  Walker: Amit Singh • Route: Neighborhood Park
                </p>
              </div>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot" style={{ width: '8px', height: '8px', background: '#16a34a', borderRadius: '50%', display: 'inline-block' }}></span> Active
              </span>
            </div>

            <div style={{ width: '100%', height: '350px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--gray-200)' }}>
              <iframe
                src={mapUrl}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, zIndex: 1, filter: 'grayscale(0.1) contrast(1.1)' }}
                loading="lazy"
                title="Pet Walk Tracker"
              />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.4)', zIndex: 2, pointerEvents: 'none' }} />
              
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                <path
                  d="M 20 80 Q 50 20 80 80"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </svg>

              <div style={{
                position: 'absolute', top: '80%', left: '20%', transform: 'translate(-50%, -50%)',
                zIndex: 10, textAlign: 'center'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                  🐕
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetHub;
