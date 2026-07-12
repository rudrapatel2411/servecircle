import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HiOutlineCheckCircle, 
  HiOutlineArrowRight,
  HiOutlineCamera,
  HiOutlineDocumentText
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const VehicleRelocationDemo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [vehicleData, setVehicleData] = useState({
    type: 'Car',
    brand: '',
    hasRC: false,
    hasPhotos: false
  });
  const [transportMode, setTransportMode] = useState('');
  
  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!vehicleData.brand || !vehicleData.hasRC || !vehicleData.hasPhotos) {
        setErrorMsg("Please fill brand details and upload both RC and Photos.");
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
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        // Find selected mode price
        const price = transportMode === 'open' ? 4999 : (transportMode === 'closed' ? 9999 : 15999);
        navigate(`/customer/live-tracking?service=Vehicle%20Relocation&price=${price}`);
      }
    }, 1000);
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', background: 'var(--gray-50)', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding: '40px 24px', borderRadius: '0 0 24px 24px', marginBottom: '24px', borderBottom: '1px solid #bfdbfe' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e40af', marginBottom: '8px' }}>
            VIP Vehicle Relocation
          </h1>
          <p style={{ color: '#1d4ed8', fontSize: '0.95rem', fontWeight: 600 }}>Insured and damage-free intercity transport for your vehicle.</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: '6px', borderRadius: '3px', background: s <= step ? '#3b82f6' : 'var(--gray-200)', transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* STEP 1: Vehicle Profile & Uploads */}
        {step === 1 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', background: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#2563eb' }}>
                🚗
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>Vehicle Details & Inspection</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>Digital verification for transit insurance.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <button 
                className="btn"
                onClick={() => setVehicleData({...vehicleData, type: 'Car'})}
                style={{ 
                  background: vehicleData.type === 'Car' ? '#dbeafe' : 'white',
                  border: `2px solid ${vehicleData.type === 'Car' ? '#3b82f6' : 'var(--gray-200)'}`,
                  color: vehicleData.type === 'Car' ? '#1d4ed8' : 'var(--gray-600)',
                  padding: '16px', fontSize: '1.2rem', fontWeight: 800
                }}
              >
                🚘 Car
              </button>
              <button 
                className="btn"
                onClick={() => setVehicleData({...vehicleData, type: 'Bike'})}
                style={{ 
                  background: vehicleData.type === 'Bike' ? '#dbeafe' : 'white',
                  border: `2px solid ${vehicleData.type === 'Bike' ? '#3b82f6' : 'var(--gray-200)'}`,
                  color: vehicleData.type === 'Bike' ? '#1d4ed8' : 'var(--gray-600)',
                  padding: '16px', fontSize: '1.2rem', fontWeight: 800
                }}
              >
                🏍️ Bike
              </button>
            </div>

            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label>Vehicle Brand & Model</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Honda City 2022" 
                value={vehicleData.brand}
                onChange={e => setVehicleData({...vehicleData, brand: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f8fafc', border: '1px dashed #94a3b8', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ color: 'var(--navy-800)', fontWeight: 800, margin: '0 0 4px 0' }}>Upload RC Copy</h4>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.8rem', margin: 0 }}>Registration certificate is mandatory.</p>
                </div>
                <button 
                  className="btn" 
                  onClick={() => setVehicleData({...vehicleData, hasRC: true})}
                  style={{ background: vehicleData.hasRC ? '#10b981' : 'white', color: vehicleData.hasRC ? 'white' : 'var(--gray-600)', border: `1px solid ${vehicleData.hasRC ? '#10b981' : 'var(--gray-300)'}` }}
                >
                  {vehicleData.hasRC ? <><HiOutlineCheckCircle /> Uploaded</> : <><HiOutlineDocumentText /> Upload</>}
                </button>
              </div>

              <div style={{ background: '#f8fafc', border: '1px dashed #94a3b8', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ color: 'var(--navy-800)', fontWeight: 800, margin: '0 0 4px 0' }}>Upload 4-Side Photos</h4>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.8rem', margin: 0 }}>To record pre-transit condition.</p>
                </div>
                <button 
                  className="btn" 
                  onClick={() => setVehicleData({...vehicleData, hasPhotos: true})}
                  style={{ background: vehicleData.hasPhotos ? '#10b981' : 'white', color: vehicleData.hasPhotos ? 'white' : 'var(--gray-600)', border: `1px solid ${vehicleData.hasPhotos ? '#10b981' : 'var(--gray-300)'}` }}
                >
                  {vehicleData.hasPhotos ? <><HiOutlineCheckCircle /> Verified</> : <><HiOutlineCamera /> Click</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Transport Mode */}
        {step === 2 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', background: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#2563eb' }}>
                🚛
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 4px 0' }}>Select Carrier Type</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>Choose how {vehicleData.brand} will be transported.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'open', title: 'Open Carrier', desc: 'Standard multi-car transport trailer.', price: 4999, icon: '🚛' },
                { id: 'closed', title: 'Closed AC Container', desc: 'Fully enclosed. Safe from weather and dust.', price: 9999, icon: '📦' },
                { id: 'vip', title: 'VIP Dedicated Flatbed', desc: 'Single-vehicle direct transport. Fastest.', price: 15999, icon: '🚀' }
              ].map(mode => (
                <div 
                  key={mode.id}
                  onClick={() => setTransportMode(mode.id)}
                  style={{
                    border: `2px solid ${transportMode === mode.id ? '#3b82f6' : 'var(--gray-200)'}`,
                    background: transportMode === mode.id ? '#eff6ff' : 'white',
                    borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '16px'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>{mode.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>{mode.title}</h4>
                      <span style={{ fontWeight: 900, color: '#2563eb' }}>₹{mode.price}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0 }}>{mode.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '16px', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <button className="btn" onClick={() => step === 1 ? navigate(-1) : setStep(1)} style={{ padding: '12px 24px', fontWeight: 800, color: 'var(--gray-600)' }}>
               Back
             </button>
             <button className="btn btn-primary" onClick={handleNext} disabled={loading} style={{ padding: '12px 32px', fontWeight: 800, background: '#2563eb', borderColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
               {loading ? 'Processing...' : (step === 2 ? `Pay & Confirm Booking` : `Next`)} 
               {!loading && <HiOutlineArrowRight />}
             </button>
           </div>
           {errorMsg && (
             <div style={{ color: 'var(--danger-500)', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', marginTop: '8px' }}>
               {errorMsg}
             </div>
           )}
        </div>
      </div>

    </div>
  );
};

export default VehicleRelocationDemo;
