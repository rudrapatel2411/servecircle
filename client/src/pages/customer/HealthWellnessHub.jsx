import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineStar, HiOutlineUserCircle, HiOutlineClock, HiOutlineDocumentText } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const HealthWellnessHub = () => {
  const [selectedSpecialist, setSelectedSpecialist] = useState('doctor'); // 'doctor' or 'physio'
  const [labPackage, setLabPackage] = useState('full-body'); // 'full-body' or 'sugar'
  const [labStep, setLabStep] = useState(0); // 0: Booked, 1: Phlebotomist Assigned, 2: Sample Collected, 3: Report Dispatched

  const specialists = {
    doctor: [
      { id: 'sp1', name: 'Dr. Aranya Sen', degree: 'MBBS, MD (General Medicine)', experience: '14 Yrs', rating: 4.9, clinic: 'Manipal Hospitals Alumni', price: 799, avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp2', name: 'Dr. Neha Sharma', degree: 'MBBS, DNB (Internal Medicine)', experience: '9 Yrs', rating: 4.8, clinic: 'Fortis Clinic Veteran', price: 799, avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=100&auto=format&fit=crop&q=80' }
    ],
    physio: [
      { id: 'sp3', name: 'Dr. Rahul Verma (PT)', degree: 'BPT, MPT (Orthopaedics)', experience: '8 Yrs', rating: 4.9, clinic: 'Sports Injury Specialist', price: 499, avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80' },
      { id: 'sp4', name: 'Dr. Priya Shah (PT)', degree: 'BPT, MPT (Neuro-rehab)', experience: '11 Yrs', rating: 5.0, clinic: 'Stroke & Joint Restoration', price: 499, avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=100&auto=format&fit=crop&q=80' }
    ]
  };

  const stepsList = [
    { label: 'Booking Placed', desc: 'Secure slot bound' },
    { label: 'Phlebotomist Assigned', desc: 'Technician on way' },
    { label: 'Sample Collected', desc: 'Chilled box transport' },
    { label: 'Report Dispatched', desc: 'Secure PDF health vault' }
  ];

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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        borderLeft: '5px solid #3b82f6',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🩺</span>
          <div>
            <h1 className="page-title" style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>
              ServeCircle Health & Clinical Care ⚕️
            </h1>
            <p className="page-subtitle" style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
              Home Doctor Consultations, Physiotherapists, Private Nursing, and Chilled Lab Sample Collection.
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
        {/* Roster of Medical Specialists */}
        <div style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineUserCircle style={{ color: '#3b82f6' }} /> Verified Clinical Roster
          </h3>

          {/* Specialist Toggle */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <button
              onClick={() => setSelectedSpecialist('doctor')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1.5px solid',
                borderColor: selectedSpecialist === 'doctor' ? '#3b82f6' : 'var(--gray-200)',
                background: selectedSpecialist === 'doctor' ? 'rgba(59, 130, 246, 0.05)' : 'white',
                color: selectedSpecialist === 'doctor' ? '#3b82f6' : 'var(--gray-700)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              General Physicians
            </button>
            <button
              onClick={() => setSelectedSpecialist('physio')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1.5px solid',
                borderColor: selectedSpecialist === 'physio' ? '#3b82f6' : 'var(--gray-200)',
                background: selectedSpecialist === 'physio' ? 'rgba(59, 130, 246, 0.05)' : 'white',
                color: selectedSpecialist === 'physio' ? '#3b82f6' : 'var(--gray-700)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Physiotherapists
            </button>
          </div>

          {/* Roster Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    {sp.experience} Exp • {sp.clinic}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>
                      <HiOutlineStar /> {sp.rating}
                    </span>
                    <Link
                      to={`/customer/book?service=${encodeURIComponent(selectedSpecialist === 'doctor' ? 'General Doctor Home Visit' : 'Orthopaedic Physiotherapy Session')}&price=${sp.price}`}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#3b82f6', borderColor: '#3b82f6' }}
                    >
                      Book Visit (₹{sp.price})
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <HiOutlineDocumentText style={{ color: '#3b82f6' }} /> Home Lab Sample Collections
            </h3>

            {/* Diagnostics choice */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => setLabPackage('full-body')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: labPackage === 'full-body' ? '#3b82f6' : 'var(--gray-200)',
                  background: labPackage === 'full-body' ? 'rgba(59, 130, 246, 0.05)' : 'white',
                  color: labPackage === 'full-body' ? '#3b82f6' : 'var(--gray-700)',
                  fontSize: '0.8rem',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                Full-Body Health (82 Tests)
              </button>
              <button
                onClick={() => setLabPackage('sugar')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: labPackage === 'sugar' ? '#3b82f6' : 'var(--gray-200)',
                  background: labPackage === 'sugar' ? 'rgba(59, 130, 246, 0.05)' : 'white',
                  color: labPackage === 'sugar' ? '#3b82f6' : 'var(--gray-700)',
                  fontSize: '0.8rem',
                  fontWeight: 650,
                  cursor: 'pointer'
                }}
              >
                HbA1c & Blood Sugar Pack
              </button>
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
                🔬 Lab Specimen Status Simulator
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
                onClick={() => setLabStep(prev => (prev + 1) % 4)}
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
                <HiOutlineClock /> Sim next status step
              </button>
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
              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', display: 'block' }}>Package Price</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-800)' }}>
                ₹{labPackage === 'full-body' ? '599' : '299'}
              </span>
            </div>
            <Link
              to={`/customer/book?service=${encodeURIComponent('Lab Sample Collection at Home')}&price=${labPackage === 'full-body' ? 599 : 299}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', background: '#3b82f6', borderColor: '#3b82f6' }}
            >
              Book Home Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthWellnessHub;
