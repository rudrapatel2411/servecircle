import { useState } from 'react';
import {
  HiOutlineHomeModern,
  HiOutlineCheckCircle,
  HiOutlinePhone,
  HiOutlineBolt,
  HiOutlineSparkles,
  HiOutlineArrowRight
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_SOCIETY_JOBS = [
  {
    id: 'SOC-JOB-601',
    type: 'waterless-wash',
    title: 'Daily Waterless Car Wash Contract: Godrej Garden City (Wing B2)',
    customer: 'Godrej Garden City RWA Committee',
    phone: '+91 98251 11223',
    venue: 'Basement B2 Parking Bays 101 to 120',
    timeSlot: '05:00 AM - 08:30 AM (Daily Morning Shift)',
    payout: 3800,
    currentStage: 2, // 1: Gate Security Clearance, 2: Bay Roster Wash, 3: RWA Daily Signoff
    stages: [
      { num: 1, label: 'Security Gate Pass PIN' },
      { num: 2, label: 'Basement Bay Wash Roster' },
      { num: 3, label: 'RWA Daily Report Signoff' }
    ],
    gatePass: {
      pin: '4892',
      securityContact: 'Gate 2 Intercom #104',
      guardClearance: 'Logged in MyGate ✓'
    },
    vehicleRoster: [
      { bay: 'B2-104', car: 'Creta White (GJ-01-XX-1234)', washed: true },
      { bay: 'B2-108', car: 'Honda City Silver (GJ-01-YY-5678)', washed: true },
      { bay: 'B2-112', car: 'Nexon EV Blue (GJ-01-ZZ-9012)', washed: false },
      { bay: 'B2-116', car: 'Innova Crysta Black (GJ-01-AB-3456)', washed: false }
    ],
    waterSavedLiters: 960
  },
  {
    id: 'SOC-JOB-602',
    type: 'ev-charger',
    title: 'EV Fast Wallbox Charger Installation (7.4kW Fast Setup)',
    customer: 'Nikhil Mehta (Flat 602, Tower 3)',
    phone: '+91 98990 66778',
    venue: 'Tower 3 Personal Parking Slot #38, Orchid Greens',
    timeSlot: '11:00 AM - 02:00 PM',
    payout: 4999,
    currentStage: 1,
    stages: [
      { num: 1, label: 'RWA NOC & Electrical Audit' },
      { num: 2, label: 'Wallbox Mounting & Wiring' },
      { num: 3, label: 'Load Test & RFID Activation' }
    ],
    gatePass: {
      pin: '9120',
      securityContact: 'Main Gate Security',
      guardClearance: 'Pending'
    },
    vehicleRoster: []
  }
];

const WorkerSocietyManagement = () => {
  const { dutyStatus, updateDuty } = useWorkerAuth();
  const [jobs, setJobs] = useState(DEMO_SOCIETY_JOBS);
  const [selectedJobId, setSelectedJobId] = useState(DEMO_SOCIETY_JOBS[0].id);
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
    showToast('Society operations stage advanced!');
  };

  const toggleCar = (jobId, idx) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const updated = [...j.vehicleRoster];
      updated[idx].washed = !updated[idx].washed;
      return { ...j, vehicleRoster: updated };
    }));
    showToast('Vehicle wash verified with timestamp & uploaded!');
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
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        color: 'white', borderRadius: '24px', padding: '28px', marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.25)', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', color: '#ede9fe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <HiOutlineHomeModern size={16} /> Society & RWA Operations
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Society Operations & EV Command
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#ede9fe', maxWidth: '640px' }}>
            Manage daily waterless car wash bay rosters, security gate PIN clearance, and EV charging station electrical installations.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <WorkerDutySwitch dutyStatus={dutyStatus} onUpdateDuty={updateDuty} compact />
        </div>
      </div>

      {/* Main Two-Col Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left: Active Contracts */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '14px' }}>
            Assigned Society Contracts ({jobs.length})
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
                    border: `2px solid ${isSelected ? '#7c3aed' : '#e2e8f0'}`,
                    padding: '18px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px rgba(124, 58, 237, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '6px' }}>
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
                    <div>⏰ <strong>Shift:</strong> {job.timeSlot}</div>
                    <div>📍 <strong>Venue:</strong> {job.venue}</div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>🏢 {job.customer}</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#7c3aed' }}>₹{job.payout}</span>
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
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: '10px' }}>
                Active Society Work Order • {currentJob.id}
              </span>
              <a href={`tel:${currentJob.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#7c3aed', textDecoration: 'none' }}>
                <HiOutlinePhone /> Call RWA Lead
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
                      background: done ? '#16a34a' : active ? '#7c3aed' : '#e2e8f0',
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

          {/* STAGE 1: GATE ACCESS & PIN */}
          {currentJob.currentStage === 1 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 1: Society Gate Clearance & Security PIN Pass
              </h4>

              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '14px', padding: '16px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#6d28d9', fontSize: '1.1rem', marginBottom: '4px' }}>
                  🔑 Security Gate PIN: {currentJob.gatePass.pin}
                </div>
                <div style={{ color: '#5b21b6' }}>
                  Show this PIN to the security guard at Gate 2 intercom to record official entry into MyGate/NoBroker.
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: BAY ROSTER WASH */}
          {currentJob.currentStage === 2 && currentJob.vehicleRoster.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                  Stage 2: Daily Waterless Wash Matrix ({currentJob.vehicleRoster.length} Vehicles)
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700 }}>
                  Tap button when washed
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {currentJob.vehicleRoster.map((v, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--navy-900)' }}>{v.bay}</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>🚘 {v.car}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCar(currentJob.id, idx)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none',
                        background: v.washed ? '#16a34a' : '#7c3aed',
                        color: 'white', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer'
                      }}
                    >
                      {v.washed ? '✓ Washed + Photo' : 'Mark Washed'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3: RWA DAILY REPORT */}
          {currentJob.currentStage === 3 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 3: RWA Daily Completion Report & Water Saved Audit
              </h4>

              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                  ✓ Eco-Wash Shift Completed
                </div>
                <div style={{ color: '#14532d', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  1. All cars in basement bay washed with zero runoff water.<br/>
                  2. Total estimated fresh drinking water saved: <strong>960 Liters</strong>.<br/>
                  3. Digital summary dispatched to RWA Society Management Committee.
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Button */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Operations Payout</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--navy-900)' }}>₹{currentJob.payout}</div>
            </div>

            <button
              type="button"
              onClick={() => advanceStage(currentJob.id)}
              style={{
                background: currentJob.currentStage === 3 ? '#16a34a' : '#7c3aed',
                color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 800,
                fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {currentJob.currentStage === 1 ? <>Gate Cleared • Start Operations <HiOutlineArrowRight /></> :
               currentJob.currentStage === 2 ? <>Roster Finished • Generate Report <HiOutlineCheckCircle /></> :
               <>Submit RWA Report ✓</>}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WorkerSocietyManagement;
