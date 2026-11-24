import { useState } from 'react';
import {
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineArrowRight,
  HiOutlineSparkles
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_HEALTH_JOBS = [
  {
    id: 'HLT-JOB-501',
    type: 'iv-drip',
    title: 'In-Home IV Drip Therapy: Immunity Booster & Glutathione Glow',
    patient: 'Dr. Radhika Sen',
    phone: '+91 98220 99001',
    address: 'Penthouse 1102, The Banyan, Ambli Road',
    timeSlot: '11:00 AM - 12:00 PM (45-Min Home Infusion)',
    payout: 2499,
    currentStage: 2, // 1: Vitals & Sterility Audit, 2: Infusion Protocol, 3: Post-Care Clinical Report
    stages: [
      { num: 1, label: 'Pre-Vitals & Doctor Signoff' },
      { num: 2, label: '45-Min Sterile Home Infusion' },
      { num: 3, label: 'Post-Care Vitals & Report' }
    ],
    vitals: {
      preBp: '120/80 mmHg',
      pulse: '72 bpm',
      spO2: '99%',
      doctorTeleSignoff: 'Dr. Mehta (MBBS, Reg #54921)'
    },
    sterileChecks: {
      singleUseKitSealIntact: true,
      coldChainThermometer4DegreesOk: true,
      emergencyAntihistamineKitReady: true,
      sharpsDisposalPouchReady: true
    }
  },
  {
    id: 'HLT-JOB-502',
    type: 'elderly-care',
    title: 'Elderly Mobility & Arthritis Physio: Smt. Pushpa Patel',
    patient: 'Pushpa Patel (Contact: Sameer Patel, Son)',
    phone: '+91 98790 33441',
    address: 'Flat 204, Ashray Flats, Satellite',
    timeSlot: '04:00 PM - 05:00 PM (Session 6 of 12)',
    payout: 999,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Joint Mobility & Pain Assessment' },
      { num: 2, label: 'Theragun Percussion & TENS Therapy' },
      { num: 3, label: 'WhatsApp Video Report to Family' }
    ],
    vitals: {
      preBp: '135/85 mmHg',
      pulse: '78 bpm',
      spO2: '97%',
      doctorTeleSignoff: 'Dr. Joshi (Orthopedic Surgeon)'
    },
    sterileChecks: {
      tensElectrodesSterile: true,
      resistanceBandsSanitized: true,
      fallRiskGaitAuditReady: true
    }
  }
];

const WorkerHealthWellness = () => {
  const { dutyStatus, updateDuty } = useWorkerAuth();
  const [jobs, setJobs] = useState(DEMO_HEALTH_JOBS);
  const [selectedJobId, setSelectedJobId] = useState(DEMO_HEALTH_JOBS[0].id);
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
    showToast('Clinical stage updated & synced with medical registry.');
  };

  const toggleSterile = (jobId, key) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        sterileChecks: {
          ...j.sterileChecks,
          [key]: !j.sterileChecks[key]
        }
      };
    }));
    showToast('Sterile safety check updated.');
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
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: 'white', borderRadius: '24px', padding: '28px', marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', color: '#dbeafe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <HiOutlineShieldCheck size={16} /> Certified Clinical Nurse & Physio Console
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Health & Wellness Clinical Operations
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#dbeafe', maxWidth: '640px' }}>
            Manage in-home IV sterile cold-chain infusions, patient pre-vitals logs, and orthopedic physiotherapy rehab routines.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <WorkerDutySwitch dutyStatus={dutyStatus} onUpdateDuty={updateDuty} compact />
        </div>
      </div>

      {/* Main Two-Col Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left: Active Patients */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '14px' }}>
            Scheduled Clinical Patients ({jobs.length})
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
                    border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                    padding: '18px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px rgba(37, 99, 235, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '6px' }}>
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
                    <div>⏰ <strong>Session:</strong> {job.timeSlot}</div>
                    <div>📍 <strong>Address:</strong> {job.address}</div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>🩺 Patient: {job.patient}</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563eb' }}>₹{job.payout}</span>
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
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '3px 10px', borderRadius: '10px' }}>
                Active Infusion/Session • {currentJob.id}
              </span>
              <a href={`tel:${currentJob.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#2563eb', textDecoration: 'none' }}>
                <HiOutlinePhone /> Call Patient
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
                      background: done ? '#16a34a' : active ? '#2563eb' : '#e2e8f0',
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

          {/* STAGE 1: PRE-VITALS INTAKE */}
          {currentJob.currentStage === 1 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 1: Patient Pre-Vitals & Doctor Signoff
              </h4>

              <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '14px', padding: '16px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#1e40af', marginBottom: '8px' }}>
                  🩺 Pre-Infusion Vitals Checklist:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#1e3a8a' }}>
                  <div>Blood Pressure: <strong>{currentJob.vitals.preBp}</strong></div>
                  <div>Heart Rate / Pulse: <strong>{currentJob.vitals.pulse}</strong></div>
                  <div>SpO2 Blood Oxygen: <strong>{currentJob.vitals.spO2}</strong></div>
                  <div>Doctor Clearance: <strong>{currentJob.vitals.doctorTeleSignoff}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: STERILE INFUSION IN-PROGRESS */}
          {currentJob.currentStage === 2 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 2: 45-Min Cold Sterile Infusion In-Progress
              </h4>

              <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--navy-900)', marginBottom: '8px' }}>
                  Sterility & Patient Safety Verification:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  {Object.keys(currentJob.sterileChecks).map(k => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentJob.sterileChecks[k]}
                        onChange={() => toggleSterile(currentJob.id, k)}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', fontSize: '0.8rem', color: '#166534' }}>
                ⏱️ Infusion Drip Rate: <strong>45 drops/min</strong> • Monitor patient every 15 minutes.
              </div>
            </div>
          )}

          {/* STAGE 3: POST-CARE REPORT */}
          {currentJob.currentStage === 3 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 3: Post-Care Clinical Report & Vitals Stability
              </h4>

              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                  ✓ Post-Session Nurse Signoff
                </div>
                <div style={{ color: '#14532d', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  1. IV cannula safely removed with sterile pressure swab.<br/>
                  2. Post-infusion BP & vitals stable.<br/>
                  3. Hydration advisory & next session date recorded in registry.
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Button */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Nurse / Physio Payout</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--navy-900)' }}>₹{currentJob.payout}</div>
            </div>

            <button
              type="button"
              onClick={() => advanceStage(currentJob.id)}
              style={{
                background: currentJob.currentStage === 3 ? '#16a34a' : '#2563eb',
                color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 800,
                fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {currentJob.currentStage === 1 ? <>Vitals OK • Begin Infusion <HiOutlineArrowRight /></> :
               currentJob.currentStage === 2 ? <>Infusion Complete • Log Vitals <HiOutlineCheckCircle /></> :
               <>Submit Medical Report ✓</>}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WorkerHealthWellness;
