import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineStar, HiOutlineUserCircle, HiOutlineClock, HiOutlineDocumentText } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const HealthWellnessHub = () => {
  const { t } = useTranslation();
  const [selectedSpecialist, setSelectedSpecialist] = useState(null); // default null to show category grid
  const [labPackage, setLabPackage] = useState('full-body'); 
  const [labStep, setLabStep] = useState(0); 

  const specialists = {
    physician: [
      { id: 'sp1', name: 'Dr. Aranya Sen', degree: 'MBBS, MD (General Medicine)', experience: '14 Years', rating: 4.9, clinic: 'Manipal Hospitals Alumni', price: 799, avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp2', name: 'Dr. Neha Sharma', degree: 'MBBS, DNB (Internal Medicine)', experience: '9 Years', rating: 4.8, clinic: 'Fortis Clinic Veteran', price: 799, avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=100&auto=format&fit=crop&q=80' }
    ],
    physio: [
      { id: 'sp3', name: 'Dr. Rahul Verma (PT)', degree: 'BPT, MPT (Orthopaedics)', experience: '8 Years', rating: 4.9, clinic: 'Sports Injury Specialist', price: 499, avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp4', name: 'Dr. Priya Shah (PT)', degree: 'BPT, MPT (Neuro-rehab)', experience: '11 Years', rating: 5.0, clinic: 'Stroke & Joint Restoration', price: 499, avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&auto=format&fit=crop&q=80' }
    ],
    dietitian: [
      { id: 'sp5', name: 'Dt. Shikha Agarwal', degree: 'B.Sc, M.Sc (Clinical Nutrition)', experience: '12 Years', rating: 4.7, clinic: 'Weight & PCOS Expert', price: 599, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp6', name: 'Dt. Rakesh Kumar', degree: 'PG Diploma in Dietetics', experience: '6 Years', rating: 4.6, clinic: 'Sports Nutrition Hub', price: 499, avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80' }
    ],
    mental: [
      { id: 'sp7', name: 'Dr. Kavita Menon', degree: 'Ph.D in Clinical Psychology', experience: '15 Years', rating: 4.9, clinic: 'Anxiety & Trauma Center', price: 999, avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp8', name: 'Dr. Aman Singh', degree: 'MD (Psychiatry)', experience: '10 Years', rating: 4.8, clinic: 'Mind & Wellness Clinic', price: 1200, avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&auto=format&fit=crop&q=80' }
    ],
    derma: [
      { id: 'sp9', name: 'Dr. Sneha Patil', degree: 'MBBS, DDVL', experience: '7 Years', rating: 4.8, clinic: 'Glow Skin Clinic', price: 699, avatar: 'https://images.unsplash.com/photo-1594824436998-efa4c6b8bf81?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp10', name: 'Dr. Vikram Reddy', degree: 'MBBS, MD (Dermatology)', experience: '14 Years', rating: 4.9, clinic: 'Advanced Hair & Skin Center', price: 899, avatar: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d0?w=100&auto=format&fit=crop&q=80' }
    ],
    dentist: [
      { id: 'sp11', name: 'Dr. Priya Desai', degree: 'BDS, MDS (Orthodontics)', experience: '10 Years', rating: 4.8, clinic: 'Smile Dental Clinic', price: 499, avatar: 'https://images.unsplash.com/photo-1594824436998-efa4c6b8bf81?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp12', name: 'Dr. Amit Shah', degree: 'BDS', experience: '12 Years', rating: 4.7, clinic: 'Shah Dental Care', price: 399, avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80' }
    ],
    pediatrician: [
      { id: 'sp13', name: 'Dr. Ananya Roy', degree: 'MBBS, MD (Pediatrics)', experience: '8 Years', rating: 4.9, clinic: 'Kids Care Clinic', price: 699, avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp14', name: 'Dr. Rohan Gupta', degree: 'MBBS, DCH', experience: '15 Years', rating: 4.8, clinic: 'Little Angels Hospital', price: 799, avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&auto=format&fit=crop&q=80' }
    ],
    cardiologist: [
      { id: 'sp15', name: 'Dr. Sanjay Mehta', degree: 'MBBS, DM (Cardiology)', experience: '20 Years', rating: 5.0, clinic: 'Heart Institute', price: 1500, avatar: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d0?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp16', name: 'Dr. Meena Iyer', degree: 'MBBS, MD, FACC', experience: '18 Years', rating: 4.9, clinic: 'Iyer Cardiac Centre', price: 1200, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' }
    ],
    orthopedic: [
      { id: 'sp17', name: 'Dr. Vishal Kapoor', degree: 'MBBS, MS (Ortho)', experience: '16 Years', rating: 4.8, clinic: 'Bone & Joint Clinic', price: 900, avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp18', name: 'Dr. Suman Rao', degree: 'MBBS, D.Ortho', experience: '11 Years', rating: 4.7, clinic: 'OrthoCare Hospital', price: 800, avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&auto=format&fit=crop&q=80' }
    ]
  };

  const labPackagesData = [
    { id: 'full-body', name: 'Full Body Checkup', tests: '60+ Tests included', price: 599, color: '#fef2f2', border: '#fecaca', icon: '🩸' },
    { id: 'diabetes', name: 'Diabetes Care', tests: 'HbA1c, FBS, PPBS', price: 399, color: '#f0fdf4', border: '#bbf7d0', icon: '🩺' },
    { id: 'vitamins', name: 'Vitamin D & B12', tests: 'Bone & Nerve Health', price: 799, color: '#fffbeb', border: '#fde68a', icon: '☀️' },
    { id: 'women', name: 'Women\'s Wellness', tests: 'Thyroid, Iron, CBC', price: 999, color: '#fdf4ff', border: '#fbcfe8', icon: '👩' },
    { id: 'thyroid', name: 'Thyroid Profile', tests: 'T3, T4, TSH', price: 299, color: '#f0f9ff', border: '#bae6fd', icon: '🦋' },
  ];

  const stepsList = [
    { label: t('healthWellness.steps.placed', 'Order Placed'), desc: t('healthWellness.steps.placedDesc', 'Lab order received') },
    { label: t('healthWellness.steps.assigned', 'Phlebotomist Assigned'), desc: t('healthWellness.steps.assignedDesc', 'Expert on the way') },
    { label: t('healthWellness.steps.collected', 'Sample Collected'), desc: t('healthWellness.steps.collectedDesc', 'Sent to diagnostic center') },
    { label: t('healthWellness.steps.dispatched', 'Report Generated'), desc: t('healthWellness.steps.dispatchedDesc', 'Results are ready') },
    { label: 'Doctor Review', desc: 'Free analysis of your test results' }
  ];

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* Back Button */}
      <Link to="/customer/general-services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to General Services
      </Link>



      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>
        {/* Roster of Medical Specialists */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HiOutlineUserCircle style={{ color: '#3b82f6' }} /> 
              {selectedSpecialist ? 'Available Specialists' : 'Select a Category'}
            </h3>
            {selectedSpecialist && (
              <button 
                onClick={() => setSelectedSpecialist(null)}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                &larr; Back to Categories
              </button>
            )}
          </div>

          {!selectedSpecialist ? (
            /* Category Grid View */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '10px' }}>
              {[
                { id: 'physician', label: 'General Physician', icon: '🩺' },
                { id: 'physio', label: 'Physiotherapist', icon: '🦴' },
                { id: 'dietitian', label: 'Dietitian', icon: '🥗' },
                { id: 'mental', label: 'Mental Health', icon: '🧠' },
                { id: 'derma', label: 'Dermatologist', icon: '💆' },
                { id: 'dentist', label: 'Dentist', icon: '🦷' },
                { id: 'pediatrician', label: 'Pediatrician', icon: '👶' },
                { id: 'cardiologist', label: 'Cardiologist', icon: '❤️' },
                { id: 'orthopedic', label: 'Orthopedic', icon: '🦵' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSpecialist(cat.id)}
                  style={{
                    padding: '20px 12px',
                    borderRadius: '16px',
                    border: '1.5px solid var(--gray-200)',
                    background: 'white',
                    color: 'var(--navy-800)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          ) : (
            /* Roster Cards */
            <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {specialists[selectedSpecialist].map((sp) => (
              <div
                key={sp.id}
                style={{
                  border: '1px solid var(--gray-200)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  background: 'linear-gradient(to right, #ffffff, #f8fafc)'
                }}
              >
                <img
                  src={sp.avatar}
                  alt={sp.name}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--navy-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {sp.name} <HiOutlineShieldCheck style={{ color: '#10b981', fontSize: '1.1rem' }} title="Verified Medical License" />
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 650, display: 'block', marginTop: '2px' }}>
                    {sp.degree}
                  </span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
                    {sp.experience} • {sp.clinic}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>
                      <HiOutlineStar /> {sp.rating}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['physician', 'mental', 'derma', 'dietitian', 'pediatrician', 'cardiologist'].includes(selectedSpecialist) && (
                        <Link
                          to={`/customer/book?service=${encodeURIComponent('Video Consultation')}&price=299`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', borderColor: '#3b82f6', color: '#3b82f6' }}
                        >
                          📹 Video (₹299)
                        </Link>
                      )}
                      <Link
                        to={`/customer/book?service=${encodeURIComponent(selectedSpecialist === 'physician' ? 'Doctor Home Visit' : selectedSpecialist + ' Session')}&price=${sp.price}`}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 10px', fontSize: '0.75rem', background: '#3b82f6', borderColor: '#3b82f6' }}
                      >
                        🏠 Visit (₹{sp.price})
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Diagnostics & Lab Sample Tracker */}
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
              <HiOutlineDocumentText style={{ color: '#3b82f6' }} /> {t('healthWellness.homeLab')}
            </h3>

            {/* Diagnostics choice */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
              {labPackagesData.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => setLabPackage(pkg.id)}
                  style={{
                    flexShrink: 0,
                    width: '180px',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: labPackage === pkg.id ? '#3b82f6' : 'var(--gray-200)',
                    background: labPackage === pkg.id ? 'rgba(59, 130, 246, 0.05)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '12px',
                    textAlign: 'left',
                    boxShadow: labPackage === pkg.id ? '0 4px 12px rgba(59, 130, 246, 0.1)' : '0 2px 5px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: pkg.color, border: `1px solid ${pkg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      {pkg.icon}
                    </div>
                    {labPackage === pkg.id && <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6', border: '3px solid white', boxShadow: '0 0 0 1px #3b82f6' }}></div>}
                  </div>
                  
                  <div>
                    <span style={{ fontWeight: 800, color: 'var(--navy-800)', display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>{pkg.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{pkg.tests}</span>
                  </div>
                  
                  <div style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-700)', width: 'fit-content' }}>
                    ₹{pkg.price}
                  </div>
                </button>
              ))}
            </div>

            {/* Interactive Lab step simulator */}
            <div style={{
              background: 'var(--gray-50)',
              border: '1px solid var(--gray-200)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gray-400)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                {t('healthWellness.specimenStatus')}
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '20px' }}>
                <div style={{ position: 'absolute', left: '4px', top: '6px', bottom: '6px', width: '2px', background: 'var(--gray-200)' }} />
                {stepsList.map((step, idx) => {
                  const isActive = idx <= labStep;
                  return (
                    <div key={idx} style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-20px',
                        top: '2px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: isActive ? '#10b981' : 'var(--gray-300)',
                        boxShadow: isActive ? '0 0 6px #10b981' : 'none'
                      }} />
                      <div style={{ fontSize: '0.78rem', fontWeight: isActive ? 800 : 500, color: isActive ? 'var(--navy-800)' : 'var(--gray-400)' }}>
                        {step.label}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: isActive ? 'var(--gray-500)' : 'var(--gray-400)' }}>
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Simulation button */}
              <button
                onClick={() => setLabStep(prev => (prev + 1) % 5)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  background: 'white',
                  border: '1px solid var(--gray-300)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <HiOutlineClock /> {t('healthWellness.simNextStatus')}
              </button>

              {/* Dynamic PDF Report Download */}
              {labStep >= 3 && (
                <div className="animate-fade-in-up" style={{ marginTop: '16px', background: '#e0f2fe', padding: '12px', borderRadius: '8px', border: '1px dashed #7dd3fc', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, marginBottom: '8px' }}>{t('healthWellnessExt.resultsReady')}</span>
                  <button className="btn btn-primary btn-sm" style={{ background: '#0284c7', borderColor: '#0284c7', padding: '6px 16px', fontSize: '0.8rem', width: '100%', cursor: 'pointer' }} onClick={() => alert('Downloading PDF Report...')}>
                    📥 Download PDF Report
                  </button>
                </div>
              )}
              
              {/* Doctor Review Call-to-Action */}
              {labStep === 4 && (
                <div className="animate-fade-in-up" style={{ marginTop: '12px', background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #6ee7b7', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#047857', fontWeight: 700, marginBottom: '8px' }}>{t('healthWellnessExt.needHelp')}</span>
                  <button className="btn btn-primary btn-sm" style={{ background: '#10b981', borderColor: '#10b981', padding: '6px 16px', fontSize: '0.8rem', width: '100%', cursor: 'pointer' }} onClick={() => alert('Scheduling free doctor call...')}>
                    📞 Schedule Free Doctor Call
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{
            background: 'rgba(59, 130, 246, 0.03)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>{t('healthWellness.packagePrice', 'Package Price')}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{labPackagesData.find(p => p.id === labPackage)?.price}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent(labPackagesData.find(p => p.id === labPackage)?.name + ' at Home')}&price=${labPackagesData.find(p => p.id === labPackage)?.price}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#3b82f6', borderColor: '#3b82f6' }}
            >
              {t('healthWellness.bookHomeCollection', 'Book Home Collection')}
            </Link>
          </div>
        </div>

        {/* 3. Online Pharmacy & Prescription Upload */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '1.4rem' }}>💊</span> Express Pharmacy
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
            Upload your prescription for 30-minute doorstep medicine delivery.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {/* Upload File Option */}
            <div style={{
              flex: 1,
              background: '#f8fafc',
              border: '2px dashed var(--gray-300)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = '#f8fafc'; }}
            onClick={() => alert('Opening File Picker for Prescription...')}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '12px' }}>
                📄
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--navy-800)' }}>{t('healthWellnessExt.uploadFile')}</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{t('healthWellnessExt.uploadDesc')}</span>
            </div>

            {/* Direct Camera Option */}
            <div style={{
              flex: 1,
              background: '#f8fafc',
              border: '2px dashed var(--gray-300)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 12px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = '#f8fafc'; }}
            onClick={() => alert('Opening Device Camera...')}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '12px' }}>
                📸
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--navy-800)' }}>{t('healthWellnessExt.takePhoto')}</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{t('healthWellnessExt.takePhotoDesc')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <div>
              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#92400e' }}>10% FLAT OFF</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#b45309' }}>{t('healthWellnessExt.medicinesToday')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Wellness Therapies */}
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '20px' }}>{t('healthWellnessExt.premiumTherapies')}</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* IV Drip Therapy */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💧💉</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>{t('healthWellnessExt.ivDrip')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{t('healthWellnessExt.ivDripDesc')}</p>
          <Link to="/customer/health-demo?type=iv" className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: 'white', borderColor: '#0ea5e9', background: '#0ea5e9', textAlign: 'center', borderRadius: '10px', textDecoration: 'none' }}>
            Consult & Book
          </Link>
        </div>

        {/* Sports Recovery */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏋️‍♂️💪</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>{t('healthWellnessExt.sportsRecovery')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{t('healthWellnessExt.sportsRecoveryDesc')}</p>
          <Link to="/customer/health-demo?type=sports" className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: 'white', borderColor: '#ea580c', background: '#ea580c', textAlign: 'center', borderRadius: '10px', textDecoration: 'none' }}>
            Consult & Book
          </Link>
        </div>

        {/* Elderly Physio */}
        <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👵🦴</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '8px' }}>{t('healthWellnessExt.elderlyCare')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>{t('healthWellnessExt.elderlyCareDesc')}</p>
          <Link to="/customer/health-demo?type=elderly" className="btn btn-outline" style={{ width: '100%', padding: '10px', fontSize: '0.9rem', color: 'white', borderColor: '#10b981', background: '#10b981', textAlign: 'center', borderRadius: '10px', textDecoration: 'none' }}>
            Consult & Subscribe
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HealthWellnessHub;
