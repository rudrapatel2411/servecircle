import { useState } from 'react';
import {
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocumentCheck,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineCurrencyRupee,
  HiOutlineArrowRight,
  HiOutlinePhone,
  HiOutlineSpeakerWave,
  HiOutlineBolt,
  HiOutlineDocumentText
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_EVENT_JOBS = [
  {
    id: 'EVT-PROD-901',
    type: 'wedding-sangeet',
    title: 'Grand Sangeet & Reception AV Rig (Dual Line-Array & DMX Lighting)',
    customer: 'Dr. Rohan & Sneha Parikh',
    phone: '+91 98251 88776',
    venue: 'The Courtyard Lawn, Sindhu Bhavan Road, Ahmedabad',
    guestCount: '450 Guests',
    payout: 14500,
    currentStage: 1, // 1: Rig Loading & Sound Check, 2: Live Show Cue Execution, 3: Tear-Down & Venue Handover
    stages: [
      { num: 1, label: 'Rig Loading & Sound Check (Freq Sweep)' },
      { num: 2, label: 'Live Show Execution & Audio Cueing' },
      { num: 3, label: 'Tear-down & Zero-Damage Handover' }
    ],
    timeline: [
      { slot: '02:00 PM - 03:30 PM', task: 'Stage Trussing & JBL Line-Array Rigging', status: 'Completed' },
      { slot: '03:30 PM - 04:30 PM', task: 'Frequency Scan & 4x Shure Cordless Mic Sync', status: 'In Progress' },
      { slot: '05:00 PM - 06:00 PM', task: 'Artist & Choreographer Dry Audio Rehearsal', status: 'Pending' },
      { slot: '06:30 PM - 10:30 PM', task: 'Live Event Cue Control & DJ Console Active', status: 'Pending' },
      { slot: '10:30 PM - 12:00 AM', task: 'Tear-down, Cable Wrapping & Venue Clearance', status: 'Pending' }
    ],
    avHardwareChecks: {
      powerGeneratorStabilizerTested: true,
      lineArrayAudioBalanceChecked: true,
      wirelessMicsRfFrequencySynced: true,
      dmxLightingPresetsProgrammed: false,
      earPlugsAndSpareXlrCablesReady: true
    },
    clientPoc: 'Mr. Hardik Patel (Event Manager, Horizon Events)',
    pocPhone: '+91 97240 55443'
  },
  {
    id: 'EVT-CORP-902',
    type: 'corporate-summit',
    title: 'Annual Leadership Summit (Podium Mic, Dual 85" LED Screen Sync)',
    customer: 'Apex Global Tech Ltd (HR Dept)',
    phone: '+91 99099 22334',
    venue: 'Grand Ball Room, Hyatt Regency, Ashram Road, Ahmedabad',
    guestCount: '180 Delegates',
    payout: 8500,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Podium Setup & Video Matrix Check' },
      { num: 2, label: 'Keynote Session Live Audio Monitoring' },
      { num: 3, label: 'Post-Convene Packing & Clearance' }
    ],
    timeline: [
      { slot: '07:30 AM - 08:30 AM', task: 'Gooseneck Podium Mic & Teleprompter Sync', status: 'Completed' },
      { slot: '08:30 AM - 09:00 AM', task: 'HDMI 4K Matrix Splitter & Presentation Clicker Test', status: 'In Progress' },
      { slot: '09:00 AM - 01:30 PM', task: 'Keynotes & Panel Discussions Audio Supervision', status: 'Pending' },
      { slot: '02:00 PM - 03:00 PM', task: 'Safe Dismantling & Hotel Banquet Clearance', status: 'Pending' }
    ],
    avHardwareChecks: {
      powerGeneratorStabilizerTested: true,
      lineArrayAudioBalanceChecked: true,
      wirelessMicsRfFrequencySynced: true,
      dmxLightingPresetsProgrammed: true,
      earPlugsAndSpareXlrCablesReady: true
    },
    clientPoc: 'Ms. Devina Roy (Corporate Communications)',
    pocPhone: '+91 98244 11229'
  }
];

const WorkerEvents = () => {
  const { dutyStatus, updateDuty } = useWorkerAuth();
  const [jobs, setJobs] = useState(DEMO_EVENT_JOBS);
  const [selectedJobId, setSelectedJobId] = useState(DEMO_EVENT_JOBS[0].id);
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
    showToast('Event operations advanced to next stage successfully!');
  };

  const toggleCheck = (jobId, key) => {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      return {
        ...j,
        avHardwareChecks: {
          ...j.avHardwareChecks,
          [key]: !j.avHardwareChecks[key]
        }
      };
    }));
    showToast('AV technical checklist updated in master schedule.');
  };

  return (
    <div className="worker-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          background: '#0f172a',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 12,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          border: '1px solid #334155'
        }}>
          <HiOutlineCheckCircle style={{ color: '#22c55e', fontSize: 20 }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="worker-hero-card" style={{
        background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)',
        color: '#fff',
        padding: '24px 28px',
        borderRadius: 16,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{
                background: 'rgba(255,255,255,0.18)',
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Events & Production Operations Console
              </span>
              <span style={{ fontSize: 13, opacity: 0.85 }}>• AV Hardware & Live Stage Coordination</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Events Hub Worker Cockpit</h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: 14 }}>
              Execute sound-checks, live cue timing, DMX stage lighting, and zero-damage venue handovers for weddings and summits.
            </p>
          </div>
          <WorkerDutySwitch dutyStatus={dutyStatus} updateDuty={updateDuty} />
        </div>
      </div>

      {/* Main Grid: Orders on Left, Operational Console on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Scheduled Production Jobs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Scheduled Productions ({jobs.length})
            </h3>
            <span style={{ fontSize: 12, background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
              Live Roster
            </span>
          </div>

          {jobs.map(job => {
            const isSelected = job.id === currentJob.id;
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                style={{
                  background: '#fff',
                  border: isSelected ? '2px solid #4338ca' : '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 18,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 8px 20px -4px rgba(67, 56, 202, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: job.type === 'wedding-sangeet' ? '#d97706' : '#2563eb',
                    background: job.type === 'wedding-sangeet' ? '#fef3c7' : '#eff6ff',
                    padding: '3px 8px',
                    borderRadius: 6
                  }}>
                    {job.type === 'wedding-sangeet' ? 'Wedding Sangeet' : 'Corporate Summit'}
                  </span>
                  <span style={{ fontWeight: 800, color: '#16a34a', fontSize: 16 }}>
                    ₹{job.payout.toLocaleString('en-IN')}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                  {job.title}
                </h4>
                <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <HiOutlineMapPin style={{ flexShrink: 0, color: '#4338ca' }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.venue}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Client: <strong>{job.customer}</strong></span>
                  <span style={{
                    color: job.currentStage === 3 ? '#16a34a' : '#d97706',
                    fontWeight: 700
                  }}>
                    Stage {job.currentStage}/3: {job.stages[job.currentStage - 1].label.slice(0, 18)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Production Workflow Cockpit */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          
          {/* Header of selected job */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#4338ca', background: '#e0e7ff', padding: '3px 8px', borderRadius: 6 }}>
                  {currentJob.id}
                </span>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>• Expected: {currentJob.guestCount}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                {currentJob.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 13, color: '#475569' }}>
                <HiOutlineMapPin style={{ color: '#4338ca', fontSize: 16 }} />
                <span>{currentJob.venue}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href={`tel:${currentJob.pocPhone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 14px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                <HiOutlinePhone style={{ color: '#4338ca' }} />
                <span>Call Venue POC</span>
              </a>
              <button
                onClick={() => advanceStage(currentJob.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 10,
                  background: currentJob.currentStage === 3 ? '#16a34a' : '#4338ca',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                <span>{currentJob.currentStage === 3 ? 'Production Completed' : 'Next Stage'}</span>
                <HiOutlineArrowRight />
              </button>
            </div>
          </div>

          {/* Multi-Stage Visual Pipeline */}
          <div style={{
            background: '#f8fafc',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.04em' }}>
              Production Operational Pipeline
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {currentJob.stages.map((stg) => {
                const isPassed = currentJob.currentStage > stg.num;
                const isCurrent = currentJob.currentStage === stg.num;
                return (
                  <div
                    key={stg.num}
                    style={{
                      background: isCurrent ? '#4338ca' : isPassed ? '#16a34a' : '#fff',
                      color: isCurrent || isPassed ? '#fff' : '#64748b',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: isCurrent || isPassed ? 'none' : '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}
                  >
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: isCurrent || isPassed ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 12
                    }}>
                      {stg.num}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
                      {stg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Details Content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            
            {/* Run-of-Show Timeline */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <HiOutlineClock style={{ color: '#4338ca', fontSize: 20 }} />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  Run-of-Show Cue Timeline
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentJob.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: item.status === 'Completed' ? '#f0fdf4' : item.status === 'In Progress' ? '#e0e7ff' : '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: 12
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: '#334155' }}>{item.slot}</span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: item.status === 'Completed' ? '#16a34a' : item.status === 'In Progress' ? '#4338ca' : '#94a3b8'
                      }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ color: '#475569', fontWeight: 500 }}>{item.task}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AV Rig & Safety Signoff Checklist */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <HiOutlineSpeakerWave style={{ color: '#4338ca', fontSize: 20 }} />
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                  AV Sound & Safety Rig Checklist
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'powerGeneratorStabilizerTested', label: 'Generator Voltage Stabilizer & Earthing Verified (230V ±5V)' },
                  { key: 'lineArrayAudioBalanceChecked', label: 'JBL Line-Array Left/Right Decibel Sweep & EQ Balancing Done' },
                  { key: 'wirelessMicsRfFrequencySynced', label: 'Shure Wireless Cordless RF Frequency Synced (Zero Interference)' },
                  { key: 'dmxLightingPresetsProgrammed', label: 'DMX Stage Wash & Moving Heads Spot Cues Programmed' },
                  { key: 'earPlugsAndSpareXlrCablesReady', label: 'Emergency XLR Spares, DI Boxes & Heavy-Duty Tape Secured' }
                ].map(item => {
                  const isChecked = currentJob.avHardwareChecks?.[item.key] || false;
                  return (
                    <label
                      key={item.key}
                      onClick={() => toggleCheck(currentJob.id, item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        cursor: 'pointer',
                        fontSize: 13,
                        color: isChecked ? '#0f172a' : '#64748b'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ marginTop: 2, accentColor: '#4338ca', width: 16, height: 16 }}
                      />
                      <span style={{ fontWeight: isChecked ? 600 : 400, lineHeight: 1.3 }}>{item.label}</span>
                    </label>
                  );
                })}
              </div>

              <div style={{
                marginTop: 18,
                padding: 12,
                borderRadius: 8,
                background: '#faf5ff',
                border: '1px solid #e9d5ff',
                fontSize: 12,
                color: '#6b21a8'
              }}>
                <strong>Venue Handover Promise:</strong> All cables secured with hazard gaffer tape; zero sound-level violations post 10:00 PM as per municipal guidelines.
              </div>
            </div>

          </div>

          {/* Contact Details & Payout Card */}
          <div style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Client Contact</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{currentJob.customer} ({currentJob.phone})</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Venue Coordinator</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{currentJob.clientPoc}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Guaranteed Operator Payout</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>₹{currentJob.payout.toLocaleString('en-IN')}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default WorkerEvents;
