import { useState } from 'react';
import {
  HiOutlineHeart,
  HiOutlineCheckCircle,
  HiOutlineCalendarDays,
  HiOutlinePhone,
  HiOutlineCamera,
  HiOutlineVideoCamera,
  HiOutlineAcademicCap,
  HiOutlineArrowRight
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_PET_JOBS = [
  {
    id: 'PET-JOB-401',
    type: 'boarding',
    title: 'Family Homestay Boarding: Max (Golden Retriever)',
    customer: 'Anjali Sharma',
    phone: '+91 98980 12345',
    hostVenue: 'Happy Paws Garden Homestay (Fenced Lawn)',
    timeSlot: '3 Nights Stay (Check-in 10 AM, Check-out 6 PM)',
    payout: 2697,
    currentStage: 2, // 1: Intake & Health Check, 2: 3x Daily Logs & Updates, 3: Handover & Bath
    stages: [
      { num: 1, label: 'Intake & Diet Protocol' },
      { num: 2, label: '3x Daily WhatsApp Updates' },
      { num: 3, label: 'Pre-Return Bath & Handover' }
    ],
    petProfile: {
      name: 'Max',
      breed: 'Golden Retriever (3 Yrs)',
      diet: 'Fresh boiled chicken & rice 2x daily (Provided by parent)',
      allergies: 'None. Afraid of sudden loud thunder / firecrackers.',
      vaccinationValid: true,
      antiTickTreated: true
    },
    dailyLogs: [
      { time: '08:00 AM', task: 'Morning Garden Walk & Breakfast Video', status: 'Sent to Parent ✓', sent: true },
      { time: '01:30 PM', task: 'Afternoon Snuffle Mat Play & Fresh Water Video', status: 'Pending Upload', sent: false },
      { time: '08:00 PM', task: 'Dinner & Cozy Bed Video Check-in', status: 'Pending Upload', sent: false }
    ]
  },
  {
    id: 'PET-JOB-402',
    type: 'training',
    title: 'Certified KCI Training: Foundation Bootcamp (Session 4 of 6)',
    customer: 'Karan Dave',
    phone: '+91 99090 77889',
    hostVenue: 'Bunglow 18, Goyal Intercity, Drive-In Road (Client Home)',
    timeSlot: '08:00 AM - 09:30 AM',
    payout: 1299,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Gear Prep & Treats Check' },
      { num: 2, label: 'Hands-on Command Coaching' },
      { num: 3, label: 'Parent Homework Diary' }
    ],
    petProfile: {
      name: 'Bruno',
      breed: 'Beagle (9 Months)',
      diet: 'High energy, food motivated',
      allergies: 'None',
      vaccinationValid: true,
      antiTickTreated: true
    },
    trainingMilestones: [
      { skill: 'Loose-Leash Walking Without Pulling', mastery: '85% Mastered', done: true },
      { skill: 'Doorbell Impulse Control (No Jumping)', mastery: 'Focus For Today', done: false },
      { skill: '15-Foot Emergency Recall in Open Lawn', mastery: 'Pending Next Session', done: false }
    ]
  }
];

const WorkerPetServices = () => {
  const { dutyStatus, updateDuty } = useWorkerAuth();
  const [jobs, setJobs] = useState(DEMO_PET_JOBS);
  const [selectedJobId, setSelectedJobId] = useState(DEMO_PET_JOBS[0].id);
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
    showToast('Pet care workflow advanced!');
  };

  const toggleUpdate = (jobId, idx) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const updated = [...j.dailyLogs];
      updated[idx].sent = !updated[idx].sent;
      updated[idx].status = updated[idx].sent ? 'Sent to Parent ✓' : 'Pending Upload';
      return { ...j, dailyLogs: updated };
    }));
    showToast('WhatsApp video proof logged & sent to parent!');
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
        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        color: 'white', borderRadius: '24px', padding: '28px', marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25)', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', color: '#fee2e2', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <HiOutlineHeart size={16} /> Certified Pet Host & Trainer Console
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Pet Care & Boarding Operations
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#fee2e2', maxWidth: '640px' }}>
            Manage pet dietary routines, upload 3x daily WhatsApp video check-ins, and track KCI behavioral coaching milestones.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <WorkerDutySwitch dutyStatus={dutyStatus} onUpdateDuty={updateDuty} compact />
        </div>
      </div>

      {/* Main Two-Col Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left: Active Guest Pets */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '14px' }}>
            Assigned Pet Guests & Training ({jobs.length})
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
                    border: `2px solid ${isSelected ? '#ef4444' : '#e2e8f0'}`,
                    padding: '18px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px rgba(239, 68, 68, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '6px' }}>
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
                    <div>⏰ <strong>Stay/Time:</strong> {job.timeSlot}</div>
                    <div>🏡 <strong>Location:</strong> {job.hostVenue}</div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>🐾 Parent: {job.customer}</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ef4444' }}>₹{job.payout}</span>
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
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: '#fee2e2', padding: '3px 10px', borderRadius: '10px' }}>
                Active Session • {currentJob.id}
              </span>
              <a href={`tel:${currentJob.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#ef4444', textDecoration: 'none' }}>
                <HiOutlinePhone /> Call Parent
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
                      background: done ? '#16a34a' : active ? '#ef4444' : '#e2e8f0',
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

          {/* STAGE 1: INTAKE & PROFILE */}
          {currentJob.currentStage === 1 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 1: Pet Health & Routine Intake Check
              </h4>

              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '14px', padding: '16px', marginBottom: '16px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '6px' }}>
                  🐾 Guest Pet: {currentJob.petProfile.name} ({currentJob.petProfile.breed})
                </div>
                <div style={{ color: '#7f1d1d', lineHeight: 1.5 }}>
                  <div><strong>Diet:</strong> {currentJob.petProfile.diet}</div>
                  <div><strong>Behavior:</strong> {currentJob.petProfile.allergies}</div>
                  <div style={{ marginTop: '6px', color: '#166534', fontWeight: 700 }}>
                    ✓ Vaccination record verified • Anti-tick spot-on treatment verified
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: 3X DAILY UPDATES / TRAINING */}
          {currentJob.currentStage === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                  Stage 2: 3x Daily WhatsApp Video Proofs
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>
                  Tap to upload clip
                </span>
              </div>

              {currentJob.dailyLogs && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  {currentJob.dailyLogs.map((log, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--navy-900)' }}>⏰ {log.time}</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{log.task}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleUpdate(currentJob.id, idx)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', border: 'none',
                          background: log.sent ? '#16a34a' : '#ef4444',
                          color: 'white', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <HiOutlineVideoCamera size={14} /> {log.status}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Training milestones if training */}
              {currentJob.trainingMilestones && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#92400e', marginBottom: '8px' }}>
                    🎓 Command Coaching Progress:
                  </div>
                  {currentJob.trainingMilestones.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px solid #fef3c7' }}>
                      <span>{m.skill}</span>
                      <strong style={{ color: m.done ? '#16a34a' : '#b45309' }}>{m.mastery}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: RETURN HANDOVER */}
          {currentJob.currentStage === 3 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 12px' }}>
                Stage 3: Pre-Return Herbal Bath & Cozy Handover
              </h4>

              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '14px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                  ✓ Parent Handover Checklist
                </div>
                <div style={{ color: '#14532d', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  1. Pre-return herbal bubble bath & de-shedding blow dry done.<br/>
                  2. Parent belongings & favorite squeaker toy packed in bag.<br/>
                  3. Health handover signoff confirmed with parent via OTP.
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Button */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Host / Trainer Payout</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--navy-900)' }}>₹{currentJob.payout}</div>
            </div>

            <button
              type="button"
              onClick={() => advanceStage(currentJob.id)}
              style={{
                background: currentJob.currentStage === 3 ? '#16a34a' : '#ef4444',
                color: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 800,
                fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {currentJob.currentStage === 1 ? <>Intake Verified • Start Stay <HiOutlineArrowRight /></> :
               currentJob.currentStage === 2 ? <>Updates Done • Begin Handover <HiOutlineCheckCircle /></> :
               <>Handover Complete ✓</>}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WorkerPetServices;
