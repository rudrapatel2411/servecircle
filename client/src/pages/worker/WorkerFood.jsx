import { useState } from 'react';
import {
  HiOutlineCake,
  HiOutlineFire,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineArrowRight
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_FOOD_JOBS = [
  {
    id: 'FOD-JOB-301',
    type: 'bbq',
    title: 'Backyard BBQ Live Charcoal Grill: 12 Guests Feast',
    customer: 'Mehul & Ritu Shah',
    phone: '+91 98240 55667',
    eventVenue: 'Villa 22, Sterling City, Bopal (Private Lawn)',
    timeSlot: '05:30 PM - 09:30 PM (Evening Sundowner)',
    guestCount: 12,
    payout: 4899,
    currentStage: 2, // 1: Kitchen Prep & Loading, 2: Live Sizzle & Service, 3: Zero-Mess Clean & Close
    stages: [
      { num: 1, label: 'Marinade Prep & Hardware Rig' },
      { num: 2, label: 'Live Grill & Table Service' },
      { num: 3, label: 'Post-Party Spotless Sweep' }
    ],
    skewerMenu: [
      { name: 'Peri-Peri Malai Paneer Tikka (30 Skewers)', type: 'veg', prepped: true },
      { name: 'Hickory-Smoked Chicken Tikka (25 Skewers)', type: 'nonveg', prepped: true },
      { name: 'Awadhi Mutton Seekh Kebabs (20 Skewers)', type: 'nonveg', prepped: true },
      { name: 'Smoked Herb Mushrooms & Sweet Corn (20 Skewers)', type: 'veg', prepped: true }
    ],
    hardwareChecklist: {
      portableCastIronGrill: true,
      organicLumpCoal5kg: true,
      palmLeafPlatesAndTableware: true,
      fireExtinguisherLoaded: true,
      tongsAndBastingBrushes: true
    },
    notes: '2 Guests strictly Jain (no onion, garlic). Use dedicated pure-veg cast iron grill plate.'
  },
  {
    id: 'FOD-JOB-302',
    type: 'baking',
    title: 'In-Home Masterclass: Classic French Macarons & Choux Pastry',
    customer: 'Neha Singhal',
    phone: '+91 97230 44112',
    eventVenue: 'Flat 901, Iscon Platinum, Bopal (Home Kitchen)',
    timeSlot: '10:30 AM - 01:30 PM',
    guestCount: 2,
    payout: 3499,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Ingredients & Toolkits Packed' },
      { num: 2, label: 'Hands-on Kitchen Masterclass' },
      { num: 3, label: 'Signed Certificate Handover' }
    ],
    skewerMenu: [
      { name: 'Callebaut Belgian Chocolate (1kg)', type: 'ingredient', prepped: true },
      { name: 'French Almond Flour & Fine Sugar', type: 'ingredient', prepped: true },
      { name: 'Silicone Macaron Mats & Piping Kit', type: 'tool', prepped: true },
      { name: 'Printed & Signed Masterclass Certificates', type: 'cert', prepped: true }
    ],
    hardwareChecklist: {
      chefApronsPacked: true,
      digitalThermometerWorking: true,
      benchScrapersAndSpatulas: true
    },
    notes: 'Couple date masterclass. Teach precision macaronage and ruffled feet.'
  }
];

const WorkerFood = () => {
  const { dutyStatus, updateDuty } = useWorkerAuth();
  const [jobs, setJobs] = useState(DEMO_FOOD_JOBS);
  const [selectedJobId, setSelectedJobId] = useState(DEMO_FOOD_JOBS[0].id);
  const [toastMsg, setToastMsg] = useState('');

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const advanceStage = (jobId) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const next = j.currentStage < 3 ? j.currentStage + 1 : 3;
      return { ...j, currentStage: next };
    }));
    showToast('Culinary stage updated!');
  };

  const toggleHardware = (jobId, key) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        hardwareChecklist: {
          ...j.hardwareChecklist,
          [key]: !j.hardwareChecklist[key]
        }
      };
    }));
    showToast('Hardware checklist saved.');
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh', padding: '20px 20px 100px', background: '#f8fafc' }}>
      
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: 'var(--navy-900)',
          color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <HiOutlineCheckCircle color="#38bdf8" size={20} /> {toastMsg}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)',
        color: 'white', borderRadius: '24px', padding: '28px', marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(194, 65, 12, 0.25)', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', color: '#ffedd5', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <HiOutlineFire size={16} /> 5-Star Culinary Operations
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Chef & Pitmaster Operations Console
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#ffedd5', maxWidth: '640px' }}>
            Manage BBQ marinades, equipment loading, student pastry toolkits, and post-event spotless cleanliness sweeps.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <WorkerDutySwitch dutyStatus={dutyStatus} onUpdateDuty={updateDuty} compact />
        </div>
      </div>

      {/* Main Two-Col Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left: Active Bookings */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '14px' }}>
            Upcoming Culinary Engagements ({jobs.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {jobs.map(job => {
              const isSelected = job.id === selectedJobId;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    border: `2px solid ${isSelected ? '#c2410c' : '#e2e8f0'}`,
                    padding: '18px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px rgba(194, 65, 12, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '6px' }}>
                      {job.id} • {job.type.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a' }}>
                      Stage {job.currentStage} of 3
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 6px' }}>
                    {job.title}
                  </h4>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>⏰ <strong>Time:</strong> {job.timeSlot}</div>
                    <div>📍 <strong>Venue:</strong> {job.eventVenue}</div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>👥 {job.guestCount} Guests • {job.customer}</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#c2410c' }}>₹{job.payout}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Operational Cockpit */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          
          {/* Stage Progress Bar */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c2410c', background: '#ffedd5', padding: '3px 10px', borderRadius: '10px' }}>
                Active Session • {currentJob.id}
              </span>
              <a href={`tel:${currentJob.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#c2410c', textDecoration: 'none' }}>
                <HiOutlinePhone /> Call Host
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {currentJob.stages.map(s => {
                const done = currentJob.currentStage > s.num;
                const active = currentJob.currentStage === s.num;
                return (
                  <div key={s.num} style={{ textAlign: 'center' }}>
                    <div style={{
                      height: '6px', borderRadius: '4px',
                      background: done ? '#16a34a' : active ? '#c2410c' : '#e2e8f0',
                      marginBottom: '6px'
                    }}></div>
                    <div style={{ fontSize: '0.72rem', fontWeight: active ? 800 : 600, color: active ? '#1e293b' : '#94a3b8' }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STAGE 1: INGREDIENTS & HARDWARE RIG */}
          {currentJob.currentStage === 1 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 1: Skewers Marinade & Hardware Rig Loading
              </h4>

              {/* Skewers List */}
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#c2410c', marginBottom: '6px' }}>
                  Marinated Skewers Ready for Transport:
                </div>
                {currentJob.skewerMenu.map((m, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px solid #ffedd5' }}>
                    <span>{m.name}</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>Prepped ✓</span>
                  </div>
                ))}
              </div>

              {/* Hardware checklist */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--navy-900)', marginBottom: '8px' }}>
                  Hardware Rig Checklist:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  {Object.keys(currentJob.hardwareChecklist).map(k => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentJob.hardwareChecklist[k]}
                        onChange={() => toggleHardware(currentJob.id, k)}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: LIVE GRILLING / SERVICE */}
          {currentJob.currentStage === 2 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 2: Live Charcoal Sizzle & Platter Running
              </h4>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: '#c2410c', marginBottom: '6px' }}>
                  Live Party Guidelines:
                </div>
                <div style={{ color: '#475569', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  1. Keep charcoal flame indirect; maintain smoky glaze temperature.<br/>
                  2. Pass freshly grilled skewers in 3 staggered rounds.<br/>
                  3. Dedicated tong for Jain/Veg skewers strictly observed.<br/>
                  4. Palm leaf tableware replenished.
                </div>
              </div>

              {currentJob.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px', borderRadius: '10px', fontSize: '0.78rem', color: '#92400e' }}>
                  ⚠️ Special Host Note: {currentJob.notes}
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: POST-PARTY SWEEP */}
          {currentJob.currentStage === 3 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 3: Spotless Cleanliness & Ash Disposal
              </h4>

              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                  ✓ Clean-Up Guarantee Checklist
                </div>
                <div style={{ color: '#14532d', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  1. Charcoal extinguished and ash packed in fireproof bag.<br/>
                  2. Cast iron grill wiped with organic citrus degreaser.<br/>
                  3. Lawn / kitchen floor swept spotless with zero skewer trash.<br/>
                  4. Host digital review recorded.
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Button */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Chef Payout</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--navy-900)' }}>₹{currentJob.payout}</div>
            </div>

            <button
              type="button"
              onClick={() => advanceStage(currentJob.id)}
              style={{
                background: currentJob.currentStage === 3 ? '#16a34a' : '#c2410c',
                color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 800,
                fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {currentJob.currentStage === 1 ? <>Rig Ready • Start Live Sizzle <HiOutlineArrowRight /></> :
               currentJob.currentStage === 2 ? <>Service Done • Begin Clean-Up <HiOutlineCheckCircle /></> :
               <>Submit Cleanliness Proof & Close ✓</>}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WorkerFood;
