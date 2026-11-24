import { useState } from 'react';
import {
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineCamera,
  HiOutlineShieldCheck,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineCalendarDays,
  HiOutlineArrowRight,
  HiOutlineKey,
  HiOutlineAcademicCap
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_TRAVEL_JOBS = [
  {
    id: 'TRV-JOB-201',
    type: 'school-commute',
    title: 'School Safe Commute: DPS Bopal Kids Van #4 (Morning Shift)',
    customer: 'DPS Bopal Transport Desk',
    phone: '+91 98765 01234',
    pickupAddress: 'Sector 14 to South Bopal Corridor',
    destination: 'DPS Bopal Main Campus Gate 1',
    timeSlot: '07:15 AM - 08:00 AM',
    payout: 3499,
    currentStage: 2, // 1: Vehicle Audit, 2: Student Pickup Manifest, 3: Campus Gate Drop
    stages: [
      { num: 1, label: 'Vehicle Safety Audit' },
      { num: 2, label: 'Kids Pickup Manifest' },
      { num: 3, label: 'Campus Safe Drop' }
    ],
    vehicleAudit: {
      tiresOk: true,
      fuelOrBatteryOk: true,
      dashcamOnline: true,
      femaleEscortOnBoard: true,
      sanitizedAndAcOn: true
    },
    students: [
      { name: 'Aarav Patel (Grade 3-B)', stop: 'Block C, Orchid Greens', status: 'Boarded', parentPhone: '9876501234' },
      { name: 'Ananya Sharma (Grade 4-A)', stop: 'Main Gate, Gala Aria', status: 'Boarded', parentPhone: '9822011223' },
      { name: 'Reyansh Mehta (Grade 2-C)', stop: 'Bunglow 12, Sterling City', status: 'Pending', parentPhone: '9899033445' },
      { name: 'Diya Joshi (Grade 1-A)', stop: 'Flat 402, Sunshine Apts', status: 'Pending', parentPhone: '9711044556' }
    ]
  },
  {
    id: 'TRV-JOB-202',
    type: 'luxury-rental',
    title: 'VIP Chauffeur Delivery: Ford Mustang GT Convertible',
    customer: 'Vikramaditya Singhania',
    phone: '+91 98250 88990',
    pickupAddress: 'ServeCircle VIP Fleet Hub, Prahlad Nagar',
    destination: 'Courtyard by Marriott, Satellite Road',
    timeSlot: '10:00 AM Handover',
    payout: 7999,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Pre-Dispatch Fleet Inspection' },
      { num: 2, label: 'Doorstep Delivery Handover' },
      { num: 3, label: 'Trip Return / Signoff' }
    ],
    vehicleAudit: {
      flatbedSecured: true,
      zeroScratchAuditDone: true,
      fuelTank100Percent: true,
      licenseVerified: true
    },
    specs: 'Triple Yellow • 5.0L V8 • 2-Door Convertible Sports'
  }
];

const WorkerTravel = () => {
  const { dutyStatus, updateDuty } = useWorkerAuth();
  const [jobs, setJobs] = useState(DEMO_TRAVEL_JOBS);
  const [selectedJobId, setSelectedJobId] = useState(DEMO_TRAVEL_JOBS[0].id);
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
    showToast('Travel workflow updated!');
  };

  const toggleAudit = (jobId, key) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        vehicleAudit: {
          ...j.vehicleAudit,
          [key]: !j.vehicleAudit[key]
        }
      };
    }));
    showToast('Vehicle audit check saved.');
  };

  const toggleStudent = (jobId, idx) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const updated = [...j.students];
      updated[idx].status = updated[idx].status === 'Boarded' ? 'Dropped / Safe' : 'Boarded';
      return { ...j, students: updated };
    }));
    showToast('Student attendance updated & parent notified via SMS!');
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
        background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
        color: 'white', borderRadius: '24px', padding: '28px', marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.25)', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', color: '#ccfbf1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <HiOutlineTruck size={16} /> Fleet & Transit Command
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Travel & Commute Pilot Operations
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccfbf1', maxWidth: '640px' }}>
            Manage daily school van rosters, passenger manifests, luxury car deliveries, and live dashcam audit protocols.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <WorkerDutySwitch dutyStatus={dutyStatus} onUpdateDuty={updateDuty} compact />
        </div>
      </div>

      {/* Main Two-Col Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left: Active Roster */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '14px' }}>
            Assigned Routes & Chauffeur Trips ({jobs.length})
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
                    border: `2px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`,
                    padding: '18px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px rgba(15, 118, 110, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#f0fdfa', color: '#0f766e', padding: '2px 8px', borderRadius: '6px' }}>
                      {job.id} • {job.type.replace('-', ' ').toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e' }}>
                      Stage {job.currentStage} of 3
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 6px' }}>
                    {job.title}
                  </h4>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>⏰ <strong>Schedule:</strong> {job.timeSlot}</div>
                    <div>🎯 <strong>Destination:</strong> {job.destination}</div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>👤 {job.customer}</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f766e' }}>₹{job.payout}</span>
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
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e', background: '#ccfbf1', padding: '3px 10px', borderRadius: '10px' }}>
                Active Route • {currentJob.id}
              </span>
              <a href={`tel:${currentJob.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', textDecoration: 'none' }}>
                <HiOutlinePhone /> Contact Desk
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
                      background: done ? '#16a34a' : active ? '#0f766e' : '#e2e8f0',
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

          {/* STAGE 1: VEHICLE SAFETY AUDIT */}
          {currentJob.currentStage === 1 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 1: Pre-Departure Safety & Sanitization Audit
              </h4>

              <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '14px', padding: '16px', marginBottom: '18px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f766e', marginBottom: '8px' }}>
                  Mandatory Pilot Checklist:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  {Object.keys(currentJob.vehicleAudit).map(k => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentJob.vehicleAudit[k]}
                        onChange={() => toggleAudit(currentJob.id, k)}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: PASSENGER MANIFEST & ATTENDANCE */}
          {currentJob.currentStage === 2 && currentJob.students && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                  Stage 2: Student Pickup Manifest ({currentJob.students.length} Kids)
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 700 }}>
                  Tap button to board/drop
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {currentJob.students.map((st, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--navy-900)' }}>{st.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>📍 {st.stop} • 📞 {st.parentPhone}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleStudent(currentJob.id, idx)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: 'none',
                        background: st.status === 'Boarded' ? '#0f766e' : st.status === 'Dropped / Safe' ? '#16a34a' : '#e2e8f0',
                        color: st.status === 'Pending' ? '#475569' : 'white',
                        fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer'
                      }}
                    >
                      {st.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3: DESTINATION DROPOFF */}
          {currentJob.currentStage === 3 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 3: Safe Campus Handover & Shift Close
              </h4>

              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                  ✓ Route Completed Successfully
                </div>
                <div style={{ color: '#14532d', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  All students safely handed over to campus security and teachers. Automated notification dispatched to parents. Vehicle returned to parking bay.
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Button */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Trip Driver Earnings</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--navy-900)' }}>₹{currentJob.payout}</div>
            </div>

            <button
              type="button"
              onClick={() => advanceStage(currentJob.id)}
              style={{
                background: currentJob.currentStage === 3 ? '#16a34a' : '#0f766e',
                color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 800,
                fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {currentJob.currentStage === 1 ? <>Audit OK • Start Route <HiOutlineArrowRight /></> :
               currentJob.currentStage === 2 ? <>Arrived at Campus Gate <HiOutlineCheckCircle /></> :
               <>Close Route & Log Payout ✓</>}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WorkerTravel;
