import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineHeart, HiOutlineCheckCircle, HiOutlinePlusCircle } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const PetHub = () => {
  const [petProfile, setPetProfile] = useState({
    name: 'Max',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: '2 Years',
    specialNeeds: 'Sensitve Skin'
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...petProfile });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setPetProfile({ ...tempProfile });
    setShowProfileForm(false);
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* Back Button */}
      <Link to="/customer/services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to Directory
      </Link>

      {/* Header */}
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        borderLeft: '5px solid #ec4899',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🐕</span>
          <div>
            <h1 className="page-title" style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>
              ServeCircle Premium Pet Care 🐾
            </h1>
            <p className="page-subtitle" style={{ color: '#ccfbf1', fontSize: '0.9rem', marginTop: '4px' }}>
              Bespoke pet grooming spa, home veterinary checkups, dog walking, and custom nutrition advisory.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>
        {/* Interactive Pet Profile Card */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineHeart style={{ color: '#ec4899' }} /> Pet Profile Customizer
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
            Add your pet profile details to automatically customize our groomer’s shampoos, dewormers, and veterinary diagnostic checklists.
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
                <span>🧬 <strong>Type & Breed:</strong> {petProfile.type} ({petProfile.breed})</span>
                <span>🎂 <strong>Age:</strong> {petProfile.age}</span>
                <span>⚠️ <strong>Special Needs:</strong> {petProfile.specialNeeds || 'None'}</span>
              </div>
              <button
                onClick={() => { setTempProfile({ ...petProfile }); setShowProfileForm(true); }}
                style={{
                  marginTop: '16px',
                  background: '#be185d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit Profile Card
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Pet Name</label>
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Pet Type</label>
                <select
                  value={tempProfile.type}
                  onChange={(e) => setTempProfile({ ...tempProfile, type: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
                >
                  <option value="Dog">Dog 🐕</option>
                  <option value="Cat">Cat 🐈</option>
                  <option value="Rabbit">Rabbit 🐇</option>
                  <option value="Bird">Bird 🦜</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Breed</label>
                <input
                  type="text"
                  value={tempProfile.breed}
                  onChange={(e) => setTempProfile({ ...tempProfile, breed: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Age</label>
                  <input
                    type="text"
                    value={tempProfile.age}
                    onChange={(e) => setTempProfile({ ...tempProfile, age: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>Special Needs</label>
                  <input
                    type="text"
                    value={tempProfile.specialNeeds}
                    onChange={(e) => setTempProfile({ ...tempProfile, specialNeeds: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '8px' }}>Save Profile</button>
                <button type="button" onClick={() => setShowProfileForm(false)} className="btn btn-outline-secondary btn-sm" style={{ flex: 1, padding: '8px' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Pet Spa Packages & Veterinary Booking Slots */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineShieldCheck style={{ color: '#0d9488' }} /> Available Pet Services
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Pet Spa */}
              <div style={{
                border: '1px solid var(--gray-200)',
                borderRadius: '12px',
                padding: '16px',
                background: 'linear-gradient(to bottom, #ffffff, #f0fdfa)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                    🛁 Premium Grooming & Organic Spa
                  </h4>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0d9488' }}>₹599</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: '4px', lineHeight: 1.4 }}>
                  Includes oatmeal bath, nail clipping, ear flush sanitation, and full coat conditioning blowout customized for **{petProfile.name}**.
                </p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.68rem', color: '#0f766e', fontWeight: 700, marginTop: '10px' }}>
                  <span>✓ PH-Neutral Organic Shampoo</span>
                  <span>✓ Stress-Free Gentle Handling</span>
                </div>
                <Link
                  to={`/customer/book?service=${encodeURIComponent('Premium Pet Grooming & Spa')}&price=599`}
                  className="btn btn-primary btn-sm w-100"
                  style={{ marginTop: '12px', background: '#0d9488', borderColor: '#0d9488', fontSize: '0.78rem', fontWeight: 750 }}
                >
                  Book Grooming Spa
                </Link>
              </div>

              {/* Veterinary */}
              <div style={{
                border: '1px solid var(--gray-200)',
                borderRadius: '12px',
                padding: '16px',
                background: 'linear-gradient(to bottom, #ffffff, #f0fdfa)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--navy-800)' }}>
                    🩺 Veterinary Doctor Home Diagnostics
                  </h4>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0d9488' }}>₹799</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: '4px', lineHeight: 1.4 }}>
                  Licensed veterinary surgeon home consultation, general immunization, deworming, and diet planning.
                </p>
                <Link
                  to={`/customer/book?service=${encodeURIComponent('Veterinary Doctor Home Checkup')}&price=799`}
                  className="btn btn-primary btn-sm w-100"
                  style={{ marginTop: '12px', background: '#0d9488', borderColor: '#0d9488', fontSize: '0.78rem', fontWeight: 750 }}
                >
                  Book Vet Home Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetHub;
