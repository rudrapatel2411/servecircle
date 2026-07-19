import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HiOutlineHeart, 
  HiOutlineCamera, 
  HiOutlineCheckCircle, 
  HiOutlineArrowRight,
  HiOutlineInformationCircle
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const PetRelocationDemo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [petData, setPetData] = useState({
    type: 'Dog',
    name: '',
    breed: '',
    hasVaccination: false
  });
  const [transportMode, setTransportMode] = useState('');
  
  // Tracking State
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!petData.name || !petData.breed || !petData.hasVaccination) {
        setErrorMsg("Please fill pet's name, breed, and click 'Upload' for vaccination.");
        return;
      }
    }
    if (step === 2 && !transportMode) {
      setErrorMsg("Please select a transport mode.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(step + 1);
    }, 1000);
  };

  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setTrackingProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => navigate('/customer/review/DEMO-PET-123?service=Pet%20Relocation&price=4999'), 2000);
            return 100;
          }
          return p + 10;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, navigate]);

  return (
    <div className="page-content" style={{ minHeight: '92vh', background: 'var(--gray-50)', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', padding: '40px 24px', borderRadius: '0 0 24px 24px', marginBottom: '24px', borderBottom: '1px solid #f0abfc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#86198f', marginBottom: '8px' }}>
            Premium Pet Relocation
          </h1>
          <p style={{ color: '#a21caf', fontSize: '0.95rem', fontWeight: 600 }}>Safe, Comfortable, and Live Monitored Travel for your Furry Friend.</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Progress Bar */}
        {step < 3 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: '6px', borderRadius: '3px', background: s <= step ? '#d946ef' : 'var(--gray-200)', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}

        {/* STEP 1: Pet Profile */}
        {step === 1 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', background: '#fae8ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#c026d3' }}>
                🐾
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>Pet Details & Health</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>Tell us about your pet so we can ensure the best care.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <button 
                className="btn"
                onClick={() => setPetData({...petData, type: 'Dog'})}
                style={{ 
                  background: petData.type === 'Dog' ? '#fae8ff' : 'white',
                  border: `2px solid ${petData.type === 'Dog' ? '#d946ef' : 'var(--gray-200)'}`,
                  color: petData.type === 'Dog' ? '#a21caf' : 'var(--gray-600)',
                  padding: '16px', fontSize: '1.2rem', fontWeight: 800
                }}
              >
                🐶 Dog
              </button>
              <button 
                className="btn"
                onClick={() => setPetData({...petData, type: 'Cat'})}
                style={{ 
                  background: petData.type === 'Cat' ? '#fae8ff' : 'white',
                  border: `2px solid ${petData.type === 'Cat' ? '#d946ef' : 'var(--gray-200)'}`,
                  color: petData.type === 'Cat' ? '#a21caf' : 'var(--gray-600)',
                  padding: '16px', fontSize: '1.2rem', fontWeight: 800
                }}
              >
                🐱 Cat
              </button>
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label>Pet's Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Max" 
                value={petData.name}
                onChange={e => setPetData({...petData, name: e.target.value})}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label>Breed</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Golden Retriever" 
                value={petData.breed}
                onChange={e => setPetData({...petData, breed: e.target.value})}
              />
            </div>

            <div style={{ background: '#f0f9ff', border: '1px dashed #38bdf8', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ color: '#0369a1', fontWeight: 800, margin: '0 0 4px 0' }}>Vaccination Certificate</h4>
                <p style={{ color: '#0ea5e9', fontSize: '0.8rem', margin: 0 }}>Required for travel safety.</p>
              </div>
              <button 
                className="btn" 
                onClick={() => setPetData({...petData, hasVaccination: true})}
                style={{ background: petData.hasVaccination ? '#3b7dc1' : 'white', color: petData.hasVaccination ? 'white' : '#0ea5e9', border: `1px solid ${petData.hasVaccination ? '#3b7dc1' : '#38bdf8'}` }}
              >
                {petData.hasVaccination ? <><HiOutlineCheckCircle /> Uploaded</> : <><HiOutlineCamera /> Upload</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Transport Mode */}
        {step === 2 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', background: '#fae8ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#c026d3' }}>
                🚐
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>Choose Transport Mode</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>Select how {petData.name} will travel.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'shared', title: 'Shared Pet AC Carrier', desc: 'Travels with up to 3 other pets. Economical.', price: 1499, icon: '🚌' },
                { id: 'private', title: 'Private VIP AC Cab', desc: 'Dedicated car only for your pet. Premium care.', price: 4999, icon: '🚕' },
                { id: 'air', title: 'Domestic Air Cargo', desc: 'Fastest transit. Requires standard IATA crate.', price: 8999, icon: '✈️' }
              ].map(mode => (
                <div 
                  key={mode.id}
                  onClick={() => setTransportMode(mode.id)}
                  style={{
                    border: `2px solid ${transportMode === mode.id ? '#d946ef' : 'var(--gray-200)'}`,
                    background: transportMode === mode.id ? '#fae8ff' : 'white',
                    borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '16px'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>{mode.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>{mode.title}</h4>
                      <span style={{ fontWeight: 900, color: '#c026d3' }}>₹{mode.price}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0 }}>{mode.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Tracking Dashboard */}
        {step === 3 && (
          <div className="card animate-fade-in-up" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', padding: '24px', color: 'white', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '16px', color: '#38bdf8' }}>
                <span className="pulsing-dot" style={{ background: '#38bdf8' }}></span> Live GPS & Vitals Active
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>{petData.name}'s Journey</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Mumbai → Pune (ETA: 2 Hours)</p>
            </div>

            <div style={{ padding: '24px', background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
              {/* Simulated Pet Cam */}
              <div style={{ background: '#000', borderRadius: '12px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                 <div style={{ position: 'absolute', top: '12px', left: '12px', color: 'red', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <span className="pulsing-dot" style={{ background: 'red' }}></span> REC
                 </div>
                 <div style={{ position: 'absolute', bottom: '12px', right: '12px', color: '#fff', fontSize: '0.75rem', opacity: 0.7, fontFamily: 'monospace' }}>
                   CAM-1 (BACK SEAT)
                 </div>
                 
                 {/* Fake camera feed static effect */}
                 <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.4) 100%)' }}></div>
                 
                 <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                   <div style={{ fontSize: '3rem', filter: 'brightness(0.8) sepia(0.2)' }}>{petData.type === 'Cat' ? '🐱' : '🐶'}</div>
                   <div style={{ color: '#cbd5e1', fontSize: '0.8rem', marginTop: '8px', letterSpacing: '2px' }}>{petData.name.toUpperCase()} IS SLEEPING...</div>
                 </div>
              </div>
            </div>

            <div style={{ padding: '24px', background: 'white' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Cab Temp</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>22°C <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>❄️ AC ON</span></div>
                </div>
                <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Last Fed/Walked</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#b45309' }}>1H <span style={{ fontSize: '0.8rem', color: '#d97706' }}>ago</span></div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy-800)', marginBottom: '16px' }}>Journey Timeline</h4>
              
              <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '12px', paddingLeft: '24px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#3b7dc1', border: '2px solid white' }}></div>
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{ fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>Pickup from Home</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: 0 }}>9:00 AM - {petData.name} settled in the carrier.</p>
                </div>

                <div style={{ position: 'absolute', left: '-7px', top: '50%', width: '12px', height: '12px', borderRadius: '50%', background: trackingProgress > 30 ? '#3b7dc1' : '#cbd5e1', border: '2px solid white', transition: 'all 0.5s' }}></div>
                <div style={{ marginBottom: '20px', opacity: trackingProgress > 30 ? 1 : 0.4, transition: 'all 0.5s' }}>
                  <h5 style={{ fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>Bio-Break & Water</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: 0 }}>10:30 AM - Stopped at Lonavala bypass.</p>
                </div>

                <div style={{ position: 'absolute', left: '-7px', bottom: '0', width: '12px', height: '12px', borderRadius: '50%', background: trackingProgress > 80 ? '#3b7dc1' : '#cbd5e1', border: '2px solid white', transition: 'all 0.5s' }}></div>
                <div style={{ opacity: trackingProgress > 80 ? 1 : 0.4, transition: 'all 0.5s' }}>
                  <h5 style={{ fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>Arrival</h5>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: 0 }}>Approaching destination.</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      {step < 3 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '16px', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ maxWidth: '800px', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
             <button className="btn" onClick={() => step === 1 ? navigate(-1) : setStep(1)} style={{ padding: '12px 24px', fontWeight: 800, color: 'var(--gray-600)' }}>
               Back
             </button>
             <button className="btn btn-primary" onClick={handleNext} disabled={loading} style={{ padding: '12px 32px', fontWeight: 800, background: '#c026d3', borderColor: '#c026d3', display: 'flex', alignItems: 'center', gap: '8px' }}>
               {loading ? 'Processing...' : (step === 2 ? `Pay & Confirm Booking` : `Next`)} 
               {!loading && <HiOutlineArrowRight />}
             </button>
          </div>
          {errorMsg && (
            <div style={{ color: 'var(--danger-500)', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', width: '100%', maxWidth: '800px', marginTop: '8px' }}>
              {errorMsg}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default PetRelocationDemo;
