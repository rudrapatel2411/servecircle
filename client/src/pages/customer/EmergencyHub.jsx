import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineBolt, HiOutlineShieldCheck, HiOutlineExclamationTriangle,
  HiOutlineClock, HiOutlinePhone, HiOutlineUserGroup, HiOutlineMapPin
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const emergencyPresets = [
  {
    id: 'leakage',
    name: 'Major Water Leakage / Flood',
    description: 'Burst pipelines, overflowing overhead tanks, or active bathroom floods.',
    icon: '💧',
    service: 'Water Leakage Plumber',
    price: 699,
    actionNeeded: 'Close the main washroom control valve immediately.'
  },
  {
    id: 'short-circuit',
    name: 'Short Circuit / Sparking Wire',
    description: 'Electrical spark noises, burning plastic smell, or total room blackout.',
    icon: '⚡',
    service: 'Electrical Emergency Specialist',
    price: 599,
    actionNeeded: 'Flip the main circuit breaker (MCB) switch to OFF immediately.'
  },
  {
    id: 'locked-out',
    name: 'Home Locked Out / Key Stuck',
    description: 'Keys lost, lock barrel jammed, or children locked inside a room.',
    icon: '🔑',
    service: 'Emergency Locksmith',
    price: 499,
    actionNeeded: 'Do not attempt to force the handle. Wait for locksmith tools.'
  },
  {
    id: 'gas-leak',
    name: 'LPG Gas Cylinder Seepage',
    description: 'Pungent sulfur gas odor detected near kitchen stove or cylinder.',
    icon: '⛽',
    service: 'Gas Line Emergency Specialist',
    price: 799,
    actionNeeded: 'Open all windows immediately. Do NOT turn on any light switches.'
  },
  {
    id: 'roof-collapse',
    name: 'Roof Collapse & Structural Risk',
    description: 'Severe ceiling plaster cracking, concrete crumbling, or structural sagging.',
    icon: '🏚️',
    service: 'Civil Structure Expert',
    price: 999,
    actionNeeded: 'Evacuate the affected room/area immediately and stay away from load-bearing beams.'
  },
  {
    id: 'vehicle-breakdown',
    name: 'Roadside Vehicle Breakdown',
    description: 'Car/bike engine failure, flat tyre puncture on highway, or battery dead mid-transit.',
    icon: '🚗',
    service: 'On-Demand Emergency Mechanic',
    price: 399,
    actionNeeded: 'Park the vehicle safely on the shoulder, turn on hazard lights, and wait in a safe area.'
  },
  {
    id: 'medical-first-aid',
    name: 'Immediate Paramedic First Aid',
    description: 'Minor household burns, sprains, high fever spikes, or emergency dressing assistance.',
    icon: '🚑',
    service: 'Home Paramedic Attendant',
    price: 499,
    actionNeeded: 'Apply basic first aid if trained, keep the patient calm, and do not self-medicate.'
  },
  {
    id: 'animal-removal',
    name: 'Emergency Animal/Stray Removal',
    description: 'Stray dogs, snakes, wild monkeys, or dangerous nests inside residential premises.',
    icon: '🐍',
    service: 'Verified Wildlife/Stray Expert',
    price: 599,
    actionNeeded: 'Keep a safe distance, do not lock eyes, and monitor the animal from a secure room.'
  }
];

const EmergencyHub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [activePreset, setActivePreset] = useState(emergencyPresets[0]);
  const [countdown, setCountdown] = useState(45);
  const [dispatchStatus, setDispatchStatus] = useState('idle'); // 'idle', 'dispatching', 'confirmed'
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Tick the live timer for matching
  useEffect(() => {
    let interval;
    if (dispatchStatus === 'idle') {
      interval = setInterval(() => {
        setCountdown((c) => (c > 1 ? c - 1 : 45));
      }, 1000);
    } else if (dispatchStatus === 'dispatching') {
      interval = setInterval(() => {
        setSecondsElapsed((s) => s + 1);
        if (secondsElapsed >= 4) {
          setDispatchStatus('confirmed');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [dispatchStatus, secondsElapsed]);

  const handleSOSDispatch = (e) => {
    e.preventDefault();
    setSecondsElapsed(0);
    setDispatchStatus('dispatching');
  };

  const handleGoToTracking = () => {
    navigate('/customer/live-tracking');
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* GLOWING CRIMSON URGENCY HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
        border: '2.5px solid #ef4444'
      }}>
        {/* Pulsing Neon Warning Ring */}
        <div style={{
          position: 'absolute', top: '12px', right: '16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(239, 68, 68, 0.25)',
          padding: '4px 12px', borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem', fontWeight: 800, border: '1px solid #f87171'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'block', animation: 'pulse 1s infinite' }} />
          <span>RED LEVEL PRIORITY RESPONSE ACTIVE</span>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
          <h1 className="page-title" style={{ color: 'white', fontSize: '2.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiOutlineBolt style={{ animation: 'bounce 2s infinite', color: '#f59e0b' }} /> {t('customer.emergencyHub')} 🚨
          </h1>
          <p style={{ color: '#fca5a5', fontSize: '0.95rem', marginTop: '8px', lineHeight: 1.5 }}>
            Instant dispatch for critical failures. Average booking-to-arrival matching takes under 45 seconds. **100% verified first-responders only.**
          </p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.25fr 0.95fr', gap: '28px' }}>
        
        {/* LEFT PANEL: Presets & Action Protocols */}
        <div>
          {/* Preset Grid Selection */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'white', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '16px' }}>
              Select Emergency Scenario
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              {emergencyPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    if (dispatchStatus === 'idle') {
                      setActivePreset(preset);
                    }
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: activePreset.id === preset.id ? '2px solid #ef4444' : '1px solid var(--gray-200)',
                    background: activePreset.id === preset.id ? 'rgba(239, 68, 68, 0.03)' : 'white',
                    cursor: dispatchStatus === 'idle' ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.8rem' }}>{preset.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 850, color: 'var(--navy-800)' }}>{preset.name}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Preset Protocol Guidelines */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'white', borderLeft: '4px solid #ef4444' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--navy-800)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <HiOutlineExclamationTriangle style={{ color: '#ef4444' }} /> Immediate First-Aid Safety Instruction:
            </h3>
            <div style={{ background: '#fef2f2', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #fee2e2' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#991b1b' }}>{activePreset.name} Guidelines:</h4>
              <p style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '6px', fontWeight: 700 }}>
                👉 {activePreset.actionNeeded}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '8px', lineHeight: 1.4 }}>
                Our dispatcher is already opening an immediate hotline line to coordinate dispatch. Please do not panic. Keep your mobile phone nearby.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: SOS Trigger & Active matching */}
        <div>
          <div className="card" style={{ padding: '28px', border: '2px solid #ef4444', background: 'white', textAlign: 'center' }}>
            
            {dispatchStatus === 'idle' && (
              <>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 850, marginBottom: '6px' }}>
                  Confirm SOS Dispatch
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '24px' }}>
                  Triggers an instant booking for: **{activePreset.service}**
                </p>

                {/* Match Timer */}
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  border: '3px solid #fee2e2',
                  borderTopColor: '#ef4444',
                  margin: '0 auto 24px auto',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  animation: 'spin 10s linear infinite'
                }}>
                  {/* Keep text unspun */}
                  <div style={{ animation: 'reverse-spin 10s linear infinite', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', display: 'block' }}>
                      {countdown}s
                    </span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--gray-400)', fontWeight: 800, textTransform: 'uppercase' }}>Match window</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifySpace: 'between', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: '16px', marginBottom: '24px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Emergency Flat rate</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy-800)' }}>₹{activePreset.price}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#10b981', fontWeight: 800 }}>
                    ✓ Match Guarantee<br />✓ No Night Charges
                  </div>
                </div>

                <button
                  onClick={handleSOSDispatch}
                  className="btn"
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#ef4444',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.35)',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.5px'
                  }}
                >
                  🔴 CONFIRM SOS EMERGENCY DISPATCH
                </button>
              </>
            )}

            {dispatchStatus === 'dispatching' && (
              <div style={{ padding: '20px 0' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#b91c1c', fontWeight: 900, marginBottom: '12px' }}>
                  Initiating Satellite Search...
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '24px' }}>
                  Checking geolocation coordinates of closest active first-responder Plumbers/Electricians...
                </p>

                {/* Radar scan pulser */}
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: 'rgba(239,68,68,0.06)', border: '2px solid #ef4444',
                  margin: '0 auto 24px auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'pulse 1.2s infinite'
                }}>
                  📡
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)' }}>
                  Contacting response fleet near you (ETA ~12 min)
                </div>
              </div>
            )}

            {dispatchStatus === 'confirmed' && (
              <div style={{ padding: '10px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>🎉</div>
                <h3 style={{ fontSize: '1.3rem', color: '#047857', fontWeight: 900, marginBottom: '6px' }}>
                  Responder Dispatched!
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '24px', lineHeight: 1.4 }}>
                  **Harish Mehta** (Level-3 Licensed Technician) has accepted the task and is driving towards your home. ETA: **11 minutes**.
                </p>

                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #a7f3d0',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'var(--navy-800)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                    }}>HM</div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--navy-800)' }}>Harish Mehta</h4>
                      <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>✓ background-checked & KYC verified</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGoToTracking}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  🗺️ Open Live Tracker & SOS Button
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

export default EmergencyHub;
