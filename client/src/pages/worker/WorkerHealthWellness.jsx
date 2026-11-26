import { useState } from 'react';
import {
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlinePhone,
  HiOutlineDocumentText,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineHeart
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import { useSpecializedJobs } from './useSpecializedJobs';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_HEALTH_JOBS = [
  {
    id: 'HLT-JOB-501',
    type: 'doctor-visit',
    typeLabel: 'Doctor Home Visit',
    title: 'General Physician Home Consult: Fever & Clinical Exam',
    patient: 'Rameshchandra Dave (Age 68)',
    phone: '+91 98251 44332',
    address: 'Bungalow 14, Sun Villa, Science City Road',
    timeSlot: '10:00 AM - 10:45 AM',
    payout: 899,
    status: 'accepted',
    currentStage: 1, // 1: Vitals & History, 2: Examination & Diagnosis, 3: Digital Prescription
    stages: [
      { num: 1, label: 'Pre-Vitals & Clinical History' },
      { num: 2, label: 'Physical Exam & Diagnosis' },
      { num: 3, label: 'Digital Rx Upload & Advice' }
    ],
    vitals: {
      preBp: '130/84 mmHg',
      pulse: '76 bpm',
      spO2: '98%',
      temperature: '100.2°F (Mild Fever)'
    },
    sterileChecks: {
      stethoscopeAndSphygmomanometerSanitized: true,
      digitalThermometerSterileCap: true,
      pulseOximeterCalibrated: true,
      ePrescriptionPadReady: true,
      emergencyReferralCardCarried: true
    }
  },
  {
    id: 'HLT-JOB-502',
    type: 'iv-drip',
    typeLabel: 'IV Drip Therapy at Home',
    title: 'In-Home IV Drip Therapy: Immunity Booster & Glutathione Glow',
    patient: 'Dr. Radhika Sen',
    phone: '+91 98220 99001',
    address: 'Penthouse 1102, The Banyan, Ambli Road',
    timeSlot: '11:00 AM - 12:00 PM (45-Min Home Infusion)',
    payout: 2499,
    status: 'accepted',
    currentStage: 2,
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
      sharpsDisposalPouchReady: true,
      infusionDripRate45DropsMin: true
    }
  },
  {
    id: 'HLT-JOB-503',
    type: 'physiotherapy',
    typeLabel: 'Sports Recovery & Rehab',
    title: 'Sports Recovery Physio: Deep Tissue Theragun & Cupping Therapy',
    patient: 'Aakash Verma (Marathon Runner)',
    phone: '+91 98980 66554',
    address: 'Flat 502, Shivalik Highstreet, Vastrapur',
    timeSlot: '02:00 PM - 03:00 PM',
    payout: 1699,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Myofascial Trigger Point Assessment' },
      { num: 2, label: 'Theragun PRO Percussion & Cupping' },
      { num: 3, label: 'Assisted PNF Stretch Protocol' }
    ],
    vitals: {
      preBp: '118/76 mmHg',
      pulse: '64 bpm (Athlete Resting)',
      spO2: '99%'
    },
    sterileChecks: {
      theragunAttachmentsAlcoholSwabbed: true,
      medicalGradeSiliconeCuppingCupsSterilized: true,
      pnfHamstringResistanceBandsReady: true,
      tensPainGateStimulatorOperational: true
    }
  },
  {
    id: 'HLT-JOB-504',
    type: 'elderly-care',
    typeLabel: 'Elderly Care Physio',
    title: 'Elderly Mobility & Arthritis Physio: Smt. Pushpa Patel',
    patient: 'Pushpa Patel (Contact: Sameer Patel, Son)',
    phone: '+91 98790 33441',
    address: 'Flat 204, Ashray Flats, Satellite',
    timeSlot: '04:00 PM - 05:00 PM (Session 6 of 12)',
    payout: 999,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Joint Mobility & Pain Assessment' },
      { num: 2, label: 'Theragun Percussion & TENS Therapy' },
      { num: 3, label: 'WhatsApp Video Report to Family' }
    ],
    vitals: {
      preBp: '135/85 mmHg',
      pulse: '74 bpm',
      spO2: '97%'
    },
    sterileChecks: {
      fallRiskGaitBalanceAssessed: true,
      osteoarthritisJointGlideGentle: true,
      tens15MinStimulationApplied: true,
      postSessionMobilityScoreLogged: false
    }
  },
  {
    id: 'HLT-JOB-505',
    type: 'lab-diagnostics',
    typeLabel: 'Home Blood Sample Collection',
    title: 'Fasting Comprehensive Health Package: Blood & Urine Sample',
    patient: 'Kavita & Sanjay Singhal',
    phone: '+91 97230 11445',
    address: 'Bungalow 9, Sterling City, Bopal',
    timeSlot: '07:30 AM - 08:15 AM (Fasting)',
    payout: 650,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Barcoded Vacutainer Verification' },
      { num: 2, label: 'Sterile Butterfly Needle Draw' },
      { num: 3, label: 'Cold-Box Dispatch to NABL Lab' }
    ],
    vitals: {
      fastingHours: '12 Hours Fasting Confirmed',
      tubesCount: '4 Vacutainers (EDTA, Gel, Fluoride, Citrate)'
    },
    sterileChecks: {
      sterileButterflyNeedleKitSealed: true,
      barcodesMatchingPatientAadhaar: true,
      centrifugeColdGelIcePacksActive: true,
      sharpsBoxImmediateDisposal: true
    }
  }
];

const normalizeHealthBooking = (b) => {
  const isDrip = (b.service || '').toLowerCase().includes('drip') || (b.service || '').toLowerCase().includes('iv');
  const isPhysio = (b.service || '').toLowerCase().includes('physio') || (b.service || '').toLowerCase().includes('recovery') || (b.service || '').toLowerCase().includes('pain');
  const isElderly = (b.service || '').toLowerCase().includes('elder') || (b.service || '').toLowerCase().includes('senior');
  const isLab = (b.service || '').toLowerCase().includes('lab') || (b.service || '').toLowerCase().includes('blood') || (b.service || '').toLowerCase().includes('diagnostic');
  const type = isDrip ? 'iv-drip' : isPhysio ? 'physiotherapy' : isElderly ? 'elderly-care' : isLab ? 'lab-diagnostics' : 'doctor-visit';
  const typeLabel = isDrip ? 'IV Drip Therapy' : isPhysio ? 'Sports Recovery Physio' : isElderly ? 'Elderly Care Physio' : isLab ? 'Lab Sample Pickup' : 'Doctor Home Visit';

  return {
    type,
    typeLabel,
    title: `${b.service || 'Clinical Therapy'}: ${b.customer?.name || 'Patient Consult'}`,
    patient: b.customer?.name || 'Patient Consult',
    phone: b.customer?.phone || '+91 98251 00000',
    address: b.address || 'Ahmedabad Residence',
    timeSlot: b.scheduledTime || '10:00 AM - 10:45 AM',
    payout: b.amount ? Math.round(b.amount * 0.85) : 1299,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Pre-Vitals & Clinical History' },
      { num: 2, label: 'Physical Exam & Therapy Procedure' },
      { num: 3, label: 'Prescription & Report Handover' }
    ],
    vitals: {
      preBp: '120/80 mmHg',
      pulse: '74 bpm',
      spo2: '99%',
      temp: '98.4°F'
    },
    sterileChecks: {
      sterileSingleUseInfusionKitVerified: true,
      doctorTeleSignoffApproved: true,
      allergyReactionHistoryAssessed: true,
      ivCannula22GInsertedPainless: false,
      flowRateRegulated60DropsPerMin: false
    }
  };
};

const FILTER_TABS = [
  { id: 'all', label: 'All Health Services' },
  { id: 'doctor-visit', label: '🩺 Doctor Home Visit' },
  { id: 'iv-drip', label: '💧 IV Drip Therapy' },
  { id: 'physiotherapy', label: '⚡ Sports Recovery' },
  { id: 'elderly-care', label: '👵 Elderly Care Physio' },
  { id: 'lab-diagnostics', label: '🧪 Lab Sample Pickup' }
];

const WorkerHealthWellness = () => {
  const { dutyStatus, updateDuty } = useWorkerAuth();
  const [selectedTab, setSelectedTab] = useState('all');

  const {
    jobs,
    selectedJobId,
    setSelectedJobId,
    currentJob: activeSpecializedJob,
    handleJobAction,
    advanceStage,
    toggleChecklist,
    toastMsg,
  } = useSpecializedJobs({
    category: 'Health & Wellness',
    categoryAliases: ['Health', 'Wellness'],
    defaultJobs: DEMO_HEALTH_JOBS,
    normalizeIncomingBooking: normalizeHealthBooking,
  });

  const filteredJobs = jobs.filter(j => selectedTab === 'all' || j.type === selectedTab);
  const currentJob = filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0] || null;

  const toggleCheck = (jobId, key) => toggleChecklist(jobId, 'sterileChecks', key);

  return (
    <div className="worker-page">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: '#0f172a',
          color: '#fff', padding: '12px 20px', borderRadius: '12px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          border: '1px solid #334155', fontWeight: 600
        }}>
          <HiOutlineCheckCircle style={{ color: '#22c55e', fontSize: '1.25rem' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="worker-hero-card" style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: '#fff', padding: '24px 28px', borderRadius: '16px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Health & Wellness Clinical Console
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>• Home Doctors, IV Drip, Physiotherapy & Diagnostics</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>Medical & Wellness Practitioner Cockpit</h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              Execute patient pre-vitals intake, sterile cold-chain IV infusions, sports Theragun therapy, and digital clinical signoffs.
            </p>
          </div>
          <WorkerDutySwitch dutyStatus={dutyStatus} updateDuty={updateDuty} />
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedTab(tab.id);
              const nextFiltered = jobs.filter(j => tab.id === 'all' || j.type === tab.id);
              if (nextFiltered.length > 0) {
                setSelectedJobId(nextFiltered[0].id);
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: selectedTab === tab.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
              background: selectedTab === tab.id ? '#0284c7' : '#fff',
              color: selectedTab === tab.id ? '#fff' : '#475569',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Job Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Patient Appointments ({filteredJobs.length})
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
              Live Clinical Roster
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
              No appointments in this category right now.
            </div>
          ) : (
            filteredJobs.map(job => {
              const isSelected = job.id === currentJob.id;
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  style={{
                    background: '#fff',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px -4px rgba(2, 132, 199, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                      color: '#0284c7', background: '#f0f9ff', padding: '3px 8px', borderRadius: '6px'
                    }}>
                      {job.typeLabel}
                    </span>
                    <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.05rem' }}>
                      ₹{job.payout.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                    {job.title}
                  </h4>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <HiOutlineMapPin style={{ flexShrink: 0, color: '#0284c7' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.address}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Patient: {job.patient}</span>
                    <span style={{
                      color: job.status === 'completed' ? '#16a34a' : job.status === 'rejected' ? '#dc2626' : job.status === 'pending' ? '#ea580c' : '#0284c7',
                      fontWeight: 700
                    }}>
                      {job.status === 'completed' ? 'Completed ✓' : job.status === 'rejected' ? 'Declined ✗' : job.status === 'pending' ? 'Pending Action' : `Stage ${job.currentStage}/3`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Operational Cockpit */}
        {currentJob ? (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                    {currentJob.id}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>• Slot: {currentJob.timeSlot}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.82rem', color: '#475569' }}>
                  <HiOutlineMapPin style={{ color: '#0284c7' }} />
                  <span><strong>Patient Address:</strong> {currentJob.address}</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a
                  href={`tel:${(currentJob.phone || '').replace(/[^0-9+]/g, '')}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                    borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1',
                    color: '#0f172a', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700
                  }}
                >
                  <HiOutlinePhone style={{ color: '#0284c7' }} />
                  <span>Call Patient</span>
                </a>

                {['pending', 'assigned', 'broadcast'].includes(String(currentJob.status || '').toLowerCase()) ? (
                  <>
                    <button
                      onClick={() => handleJobAction(currentJob.id, 'accepted')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                        borderRadius: '10px', background: '#16a34a', color: '#fff', border: 'none',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                      }}
                    >
                      <HiOutlineCheck /> Accept Consult
                    </button>
                    <button
                      onClick={() => handleJobAction(currentJob.id, 'rejected')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                        borderRadius: '10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                      }}
                    >
                      <HiOutlineXMark /> Decline
                    </button>
                  </>
                ) : currentJob.status === 'rejected' ? (
                  <button
                    disabled
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                      fontWeight: 700, fontSize: '0.82rem', cursor: 'default'
                    }}
                  >
                    <HiOutlineXMark style={{ fontSize: '1.1rem' }} /> Consult Declined
                  </button>
                ) : currentJob.status === 'completed' ? (
                  <button
                    disabled
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: '#16a34a', color: '#fff', border: 'none',
                      fontWeight: 700, fontSize: '0.82rem', cursor: 'default'
                    }}
                  >
                    <HiOutlineCheckCircle style={{ fontSize: '1.1rem' }} /> Session Completed
                  </button>
                ) : (
                  <button
                    onClick={() => advanceStage(currentJob.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: currentJob.currentStage === 3 ? '#16a34a' : '#0284c7',
                      color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    <span>{currentJob.currentStage === 3 ? 'Finish & Complete Session' : 'Next Stage'}</span>
                    <HiOutlineArrowRight />
                  </button>
                )}
              </div>
            </div>

            {/* Stage Stepper */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                Clinical Operational Pipeline
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {currentJob.stages.map((stg) => {
                  const isPassed = currentJob.status === 'completed' || currentJob.currentStage > stg.num;
                  const isCurrent = currentJob.status !== 'completed' && currentJob.currentStage === stg.num;
                  return (
                    <div
                      key={stg.num}
                      style={{
                        background: isCurrent ? '#0284c7' : isPassed ? '#16a34a' : '#fff',
                        color: isCurrent || isPassed ? '#fff' : '#64748b',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isCurrent || isPassed ? 'none' : '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '999px',
                        background: isCurrent || isPassed ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.75rem'
                      }}>
                        {isPassed && currentJob.status === 'completed' ? '✓' : stg.num}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {stg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service-Specific Interactive Tools */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Left Box: Patient Pre-Vitals Intake Form */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineHeart style={{ color: '#0284c7', fontSize: '1.2rem' }} />
                  Patient Intake & Vital Signs Log
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Blood Pressure</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginTop: '2px' }}>{currentJob.vitals?.preBp || '120/80 mmHg'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Pulse Rate</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginTop: '2px' }}>{currentJob.vitals?.pulse || '72 bpm'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Oxygen SpO2</div>
                    <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1rem', marginTop: '2px' }}>{currentJob.vitals?.spO2 || '99%'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Session Mode</div>
                    <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.85rem', marginTop: '2px' }}>Home Visit</div>
                  </div>
                </div>

                {currentJob.vitals?.doctorTeleSignoff && (
                  <div style={{ marginTop: '12px', background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.78rem', color: '#166534' }}>
                    👨‍⚕️ <strong>Tele-Doctor Approval:</strong> {currentJob.vitals.doctorTeleSignoff}
                  </div>
                )}
                {currentJob.vitals?.temperature && (
                  <div style={{ marginTop: '12px', background: '#fffbeb', padding: '10px', borderRadius: '8px', border: '1px solid #fef3c7', fontSize: '0.78rem', color: '#92400e' }}>
                    🌡️ <strong>Temp Reading:</strong> {currentJob.vitals.temperature}
                  </div>
                )}
                {currentJob.vitals?.fastingHours && (
                  <div style={{ marginTop: '12px', background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.78rem', color: '#1e40af' }}>
                    🧪 <strong>Lab Protocol:</strong> {currentJob.vitals.fastingHours} ({currentJob.vitals.tubesCount})
                  </div>
                )}
              </div>

              {/* Right Box: Sterile Equipment & Safety Checklist */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineShieldCheck style={{ color: '#0284c7', fontSize: '1.2rem' }} />
                  Sterility, Protocol & Medical Safety Checklist
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(currentJob.sterileChecks || {}).map(([key, val]) => (
                    <label
                      key={key}
                      onClick={() => toggleCheck(currentJob.id, key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        fontSize: '0.82rem', color: val ? '#0f172a' : '#64748b'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => {}}
                        style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: val ? 700 : 400 }}>
                        {key === 'stethoscopeAndSphygmomanometerSanitized' && 'Stethoscope Diaphragm & BP Cuff Isopropyl Sanitized'}
                        {key === 'digitalThermometerSterileCap' && 'Digital Oral Thermometer Single-Use Sheath Applied'}
                        {key === 'pulseOximeterCalibrated' && 'Pulse Oximeter Optical Sensor Calibrated'}
                        {key === 'ePrescriptionPadReady' && 'Digital Medical Rx Signature Tablet Synced'}
                        {key === 'emergencyReferralCardCarried' && 'Tertiary Hospital Emergency Ambulance Card Ready'}
                        {key === 'singleUseKitSealIntact' && 'IV Cannula & Sterile Tubing Holographic Seal Verified'}
                        {key === 'coldChainThermometer4DegreesOk' && 'Cold-Chain 4°C Pouch Thermometer Reading Confirmed'}
                        {key === 'emergencyAntihistamineKitReady' && 'Emergency Avil / Hydrocortisone Ampoule on Hand'}
                        {key === 'sharpsDisposalPouchReady' && 'Puncture-Proof Sharps Bio-Hazard Waste Container Ready'}
                        {key === 'infusionDripRate45DropsMin' && 'Gravity Drip Calibrated at 45 Drops/Min (45-min Session)'}
                        {key === 'theragunAttachmentsAlcoholSwabbed' && 'Theragun Dampener & Cone Heads Alcohol Swabbed'}
                        {key === 'medicalGradeSiliconeCuppingCupsSterilized' && 'Medical-Grade Myofascial Cupping Cups Sterilized'}
                        {key === 'pnfHamstringResistanceBandsReady' && 'TheraBand Resistance Loop & Goniometer Angle Ready'}
                        {key === 'tensPainGateStimulatorOperational' && 'Dual-Channel TENS Electro-Therapy Electrodes Checked'}
                        {key === 'fallRiskGaitBalanceAssessed' && 'Tinetti Mobility & Fall-Risk Score Assessed'}
                        {key === 'osteoarthritisJointGlideGentle' && 'Gentle Grade II/III Passive Knee Joint Mobilization Done'}
                        {key === 'tens15MinStimulationApplied' && '15-Minute Analgesic High-Frequency TENS Applied'}
                        {key === 'postSessionMobilityScoreLogged' && 'Post-Session Range-of-Motion Angle Logged in App'}
                        {key === 'sterileButterflyNeedleKitSealed' && 'BD Vacutainer Ultra-Fine Butterfly Needle Sealed'}
                        {key === 'barcodesMatchingPatientAadhaar' && 'Diagnostic Barcode Strips Matching Patient ID'}
                        {key === 'centrifugeColdGelIcePacksActive' && 'Insulated Specimen Cold Box below 8°C Verified'}
                        {key === 'sharpsBoxImmediateDisposal' && 'Needle Retracted into Sharps Container with Zero Recapping'}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '16px', padding: '10px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #e0f2fe', fontSize: '0.76rem', color: '#0369a1' }}>
                  <strong>NABH / Clinical Protocol:</strong> Bio-medical waste categorized strictly into yellow/red bins as per municipal health directives.
                </div>
              </div>

            </div>

            {/* Bottom Contact & Payout Bar */}
            <div style={{
              marginTop: '20px', padding: '14px 18px', borderRadius: '12px', background: '#f8fafc',
              border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Patient Contact</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{currentJob.patient} ({currentJob.phone})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Practitioner Net Payout</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>₹{currentJob.payout.toLocaleString('en-IN')}</div>
              </div>
            </div>

          </div>
        ) : (
          <div style={{
            background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1',
            padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🩺</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0f172a' }}>No clinical consults in this category</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.85rem' }}>Switch tabs or reset filters to view all active health consults.</p>
            <button
              onClick={() => setSelectedTab('all')}
              style={{
                padding: '8px 16px', borderRadius: '8px', background: '#0284c7', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              View All Health Consults
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkerHealthWellness;
