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
  HiOutlineDocumentText,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineCamera,
  HiOutlineMusicalNote
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import { useSpecializedJobs } from './useSpecializedJobs';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_EVENT_JOBS = [
  {
    id: 'EVT-PROD-901',
    type: 'theme-birthday',
    typeLabel: 'Theme Birthday Decor',
    title: 'Safari Jungle Balloon Arch & Neon Sign Backdrop (Aarav 5th B\'day)',
    customer: 'Megha & Kunal Patel',
    phone: '+91 98255 11990',
    venue: 'Clubhouse Banquet Hall, South Bopal Greens',
    guestCount: '60 Guests',
    payout: 4200,
    status: 'accepted',
    currentStage: 1, // 1: Rig & Decor Setup, 2: Party Showtime, 3: Tear-Down & Packup
    stages: [
      { num: 1, label: 'Balloon Arch & Backdrop Rigging' },
      { num: 2, label: 'Cake Cutting & Live Sound Cues' },
      { num: 3, label: 'Tear-Down & Hall Broom Clean' }
    ],
    timeline: [
      { slot: '02:30 PM - 04:30 PM', task: 'Jungle Balloon Garland Arch & Neon Lettering Setup', status: 'Completed' },
      { slot: '04:30 PM - 05:00 PM', task: 'Cake Table Props & Cutout Animals Positioning', status: 'In Progress' },
      { slot: '05:30 PM - 08:30 PM', task: 'Party Duration & Bluetooth PA Speaker Music Control', status: 'Pending' },
      { slot: '08:30 PM - 09:30 PM', task: 'Balloon Pop Dismantle & Zero-Tape Residue Clean', status: 'Pending' }
    ],
    avHardwareChecks: {
      organicLatexBalloonArchSecured: true,
      ledNeonSignPowerAdapterTested: true,
      portableBluetoothSpeakerSynced: true,
      zeroWallPaintPeelingTapeUsed: true,
      cakeTableSpotlightAdjusted: false
    },
    clientPoc: 'Mrs. Megha Patel (Host)',
    pocPhone: '+91 98255 11990'
  },
  {
    id: 'EVT-PROD-902',
    type: 'wedding-sangeet',
    typeLabel: 'Grand Sangeet AV Production',
    title: 'Grand Sangeet & Reception AV Rig (Dual Line-Array & DMX Lighting)',
    customer: 'Dr. Rohan & Sneha Parikh',
    phone: '+91 98251 88776',
    venue: 'The Courtyard Lawn, Sindhu Bhavan Road, Ahmedabad',
    guestCount: '450 Guests',
    payout: 14500,
    status: 'accepted',
    currentStage: 1,
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
    id: 'EVT-PROD-903',
    type: 'corporate-summit',
    typeLabel: 'Corporate Summit AV',
    title: 'Annual Leadership Summit (Podium Mic, Dual 85" LED Screen Sync)',
    customer: 'Apex Global Tech Ltd (HR Dept)',
    phone: '+91 99099 22334',
    venue: 'Grand Ball Room, Hyatt Regency, Ashram Road, Ahmedabad',
    guestCount: '180 Delegates',
    payout: 8500,
    status: 'accepted',
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
  },
  {
    id: 'EVT-PROD-904',
    type: 'dj-setup',
    typeLabel: 'Live DJ Console & Sound',
    title: 'College Fest DJ Night: 2x 18" Subwoofers & Pioneer CDJ Console',
    customer: 'Nirma Youth Festival Committee',
    phone: '+91 98790 88221',
    venue: 'Open Air Amphitheatre, Nirma Campus, SG Highway',
    guestCount: '800 Students',
    payout: 12000,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Subwoofers & DJ Console Rig' },
      { num: 2, label: 'High-Energy EDM Bass Sweep' },
      { num: 3, label: 'Midnight Shutdown & Decibel Compliance' }
    ],
    timeline: [
      { slot: '04:00 PM - 05:30 PM', task: 'Pioneer CDJ-3000 & DJM-900NXS2 Setup', status: 'Completed' },
      { slot: '05:30 PM - 06:30 PM', task: 'Bass Decibel Calibration (Under 90 dB Boundary)', status: 'In Progress' },
      { slot: '07:00 PM - 10:00 PM', task: 'Live DJ Performance & Strobe Smoke Cues', status: 'Pending' },
      { slot: '10:00 PM - 11:30 PM', task: 'Flight Cases Packup & Equipment Storage', status: 'Pending' }
    ],
    avHardwareChecks: {
      pioneerCdjFirmwareUpdated: true,
      subwooferCrossoversSet80Hz: true,
      smokeHazeMachineFluidNonToxic: true,
      heavyDutyGafferTapeCablesTaped: true,
      decibelMeterLimiterEngaged: true
    },
    clientPoc: 'Aman Shah (Student Council Head)',
    pocPhone: '+91 98790 88221'
  },
  {
    id: 'EVT-PROD-905',
    type: 'photographer-pro',
    typeLabel: 'Cinematic Photography & 4K Drone',
    title: 'Ring Ceremony Candid Coverage & Instant Guest QR Album',
    customer: 'Tanvi & Aniket Vora',
    phone: '+91 98251 77224',
    venue: 'Taj Skyline Grand Lawn, Sindhu Bhavan Road',
    guestCount: '250 Guests',
    payout: 9500,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Camera Sensor & Drone Battery Check' },
      { num: 2, label: 'Ring Exchange Candid & Drone Flyover' },
      { num: 3, label: 'Raw SD Cards Backup & Cloud QR Upload' }
    ],
    timeline: [
      { slot: '05:00 PM - 06:00 PM', task: 'Stage Lighting Ambient White Balance Calibration', status: 'Completed' },
      { slot: '06:30 PM - 09:30 PM', task: 'Couple Portrait & Family Stage Candid Photo Walk', status: 'In Progress' },
      { slot: '09:30 PM - 10:30 PM', task: 'Drone 4K Rose Petal Shower Aerial Capture', status: 'Pending' },
      { slot: '10:30 PM - 11:30 PM', task: 'Live Display Screen Photo Slide Feed Sync', status: 'Pending' }
    ],
    avHardwareChecks: {
      four4kSonyMirrolessBatteriesCharged: true,
      droneDirectorateGeneralCivilAviationNoc: true,
      gimbalStabilizerBalanceTuned: true,
      dualHighSpeedSdCards128GbEach: true,
      instantQrLivePhotoDriveActive: false
    },
    clientPoc: 'Mr. Aniket Vora (Groom)',
    pocPhone: '+91 98251 77224'
  }
];

const normalizeEventsBooking = (b) => {
  const isBirthday = (b.service || '').toLowerCase().includes('birthday') || (b.service || '').toLowerCase().includes('balloon') || (b.service || '').toLowerCase().includes('theme');
  const isSangeet = (b.service || '').toLowerCase().includes('sangeet') || (b.service || '').toLowerCase().includes('wedding');
  const isSummit = (b.service || '').toLowerCase().includes('corporate') || (b.service || '').toLowerCase().includes('summit');
  const isDj = (b.service || '').toLowerCase().includes('dj') || (b.service || '').toLowerCase().includes('sound');
  const type = isBirthday ? 'theme-birthday' : isSangeet ? 'wedding-sangeet' : isSummit ? 'corporate-summit' : isDj ? 'dj-setup' : 'photographer-pro';
  const typeLabel = isBirthday ? 'Theme Birthday Decor' : isSangeet ? 'Wedding Sangeet AV' : isSummit ? 'Corporate Summit' : isDj ? 'Live DJ Console' : 'Cinematic Photo & Drone';

  return {
    type,
    typeLabel,
    title: `${b.service || 'Event Production'}: ${b.address || 'Banquet Hall'}`,
    customer: b.customer?.name || 'Event Host',
    phone: b.customer?.phone || '+91 98255 00000',
    venue: b.address || 'Ahmedabad Venue',
    guestCount: `${b.requirements?.guests || 50} Guests`,
    payout: b.amount ? Math.round(b.amount * 0.85) : 4200,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Rig & Stage Decor Setup' },
      { num: 2, label: 'Live Showtime & Sound Cues' },
      { num: 3, label: 'Tear-Down & Venue Handover' }
    ],
    timeline: [
      { slot: '04:00 PM - 05:30 PM', task: 'Stage Rigging, Backdrop & Sound Check', status: 'Pending' },
      { slot: '06:00 PM - 09:00 PM', task: 'Live Showtime & Program Cues', status: 'Pending' },
      { slot: '09:30 PM - 10:30 PM', task: 'Tear-Down & Packup', status: 'Pending' }
    ],
    avHardwareChecks: {
      lineArrayFlownAndAimed: true,
      wirelessMicsScanned: true,
      dbLimiterLocked90dB: true,
      dgBackupSyncTested: true
    }
  };
};

const FILTER_TABS = [
  { id: 'all', label: 'All Event Productions' },
  { id: 'theme-birthday', label: '🎈 Birthday Theme' },
  { id: 'wedding-sangeet', label: '💍 Sangeet AV Rig' },
  { id: 'corporate-summit', label: '🏢 Corporate Summit' },
  { id: 'dj-setup', label: '🎧 Live DJ Console' },
  { id: 'photographer-pro', label: '📸 Cinematic Photo & Drone' }
];

const WorkerEvents = () => {
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
    category: 'Events Hub',
    categoryAliases: ['Events', 'Event', 'Events Hub'],
    defaultJobs: DEMO_EVENT_JOBS,
    normalizeIncomingBooking: normalizeEventsBooking,
  });

  const filteredJobs = jobs.filter(j => selectedTab === 'all' || j.type === selectedTab);
  const currentJob = filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0] || null;

  const toggleCheck = (jobId, key) => toggleChecklist(jobId, 'avHardwareChecks', key);

  return (
    <div className="worker-page">
      {/* Toast Notification */}
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
        background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)',
        color: '#fff', padding: '24px 28px', borderRadius: '16px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Events & Production Operations Console
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>• Birthday Themes, Weddings, Summits, DJ & Photography</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>Events Hub Worker Cockpit</h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              Execute sound checks, live cue timing, DMX stage lighting, drone photography, and zero-damage venue handovers.
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
              border: selectedTab === tab.id ? '2px solid #4338ca' : '1px solid #cbd5e1',
              background: selectedTab === tab.id ? '#4338ca' : '#fff',
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
        
        {/* Left Column: Scheduled Production Jobs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              Scheduled Productions ({filteredJobs.length})
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
              Live Roster
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
              No event productions in this category.
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
                    border: isSelected ? '2px solid #4338ca' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px -4px rgba(67, 56, 202, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                      color: '#4338ca', background: '#e0e7ff', padding: '3px 8px', borderRadius: '6px'
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
                    <HiOutlineMapPin style={{ flexShrink: 0, color: '#4338ca' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.venue}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Guests: {job.guestCount}</span>
                    <span style={{
                      color: job.status === 'completed' ? '#16a34a' : job.status === 'rejected' ? '#dc2626' : job.status === 'pending' ? '#ea580c' : '#4338ca',
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

        {/* Right Column: Active Production Workflow Cockpit */}
        {currentJob ? (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            
            {/* Header of selected job */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4338ca', background: '#e0e7ff', padding: '2px 8px', borderRadius: '6px' }}>
                    {currentJob.id}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>• Expected: {currentJob.guestCount}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.82rem', color: '#475569' }}>
                  <HiOutlineMapPin style={{ color: '#4338ca' }} />
                  <span><strong>Venue:</strong> {currentJob.venue}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a
                  href={`tel:${(currentJob.pocPhone || currentJob.phone || '').replace(/[^0-9+]/g, '')}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                    borderRadius: '10px', background: '#f8fafc', border: '1px solid #cbd5e1',
                    color: '#0f172a', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700
                  }}
                >
                  <HiOutlinePhone style={{ color: '#4338ca' }} />
                  <span>Call Venue POC</span>
                </a>

                {currentJob.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleJobAction(currentJob.id, 'accepted')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                        borderRadius: '10px', background: '#16a34a', color: '#fff', border: 'none',
                        fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                      }}
                    >
                      <HiOutlineCheck /> Accept Production
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
                    <HiOutlineXMark style={{ fontSize: '1.1rem' }} /> Production Declined
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
                    <HiOutlineCheckCircle style={{ fontSize: '1.1rem' }} /> Production Completed
                  </button>
                ) : (
                  <button
                    onClick={() => advanceStage(currentJob.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: currentJob.currentStage === 3 ? '#16a34a' : '#4338ca',
                      color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    <span>{currentJob.currentStage === 3 ? 'Finish & Complete Production' : 'Next Stage'}</span>
                    <HiOutlineArrowRight />
                  </button>
                )}
              </div>
            </div>

            {/* Multi-Stage Visual Pipeline */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                Event Production Pipeline
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {currentJob.stages.map((stg) => {
                  const isPassed = currentJob.status === 'completed' || currentJob.currentStage > stg.num;
                  const isCurrent = currentJob.status !== 'completed' && currentJob.currentStage === stg.num;
                  return (
                    <div
                      key={stg.num}
                      style={{
                        background: isCurrent ? '#4338ca' : isPassed ? '#16a34a' : '#fff',
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

            {/* Stage Details Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Run-of-Show Timeline */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineClock style={{ color: '#4338ca', fontSize: '1.2rem' }} />
                  Run-of-Show Cue Timeline
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentJob.timeline.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px', borderRadius: '8px',
                        background: item.status === 'Completed' ? '#f0fdf4' : item.status === 'In Progress' ? '#e0e7ff' : '#f8fafc',
                        border: '1px solid #e2e8f0', fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#334155' }}>{item.slot}</span>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
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

              {/* AV Rig & Technical Safety Checklist */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineSpeakerWave style={{ color: '#4338ca', fontSize: '1.2rem' }} />
                  AV Hardware, Rigging & Safety Checklist
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(currentJob.avHardwareChecks || {}).map(([key, val]) => (
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
                        style={{ accentColor: '#4338ca', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: val ? 700 : 400 }}>
                        {key === 'powerGeneratorStabilizerTested' && 'Generator Voltage Stabilizer Verified (230V ±5V)'}
                        {key === 'lineArrayAudioBalanceChecked' && 'JBL Line-Array Left/Right Decibel Sweep & EQ Balanced'}
                        {key === 'wirelessMicsRfFrequencySynced' && 'Shure Cordless RF Frequencies Synced (Zero Static)'}
                        {key === 'dmxLightingPresetsProgrammed' && 'DMX Stage Wash & Moving Heads Programmed'}
                        {key === 'earPlugsAndSpareXlrCablesReady' && 'Emergency XLR Spares, DI Boxes & Tape Secured'}
                        {key === 'organicLatexBalloonArchSecured' && 'Heavy Metal Base Plates Bolted for Balloon Arch'}
                        {key === 'ledNeonSignPowerAdapterTested' && 'Neon Lettering 12V DC Adapter Tested (Zero Heat)'}
                        {key === 'portableBluetoothSpeakerSynced' && 'Portable 120W Bluetooth PA Speaker Paired'}
                        {key === 'zeroWallPaintPeelingTapeUsed' && 'Removable Residue-Free Nano Tape for Wall Props'}
                        {key === 'cakeTableSpotlightAdjusted' && 'Warm White Cake Table Spotlight Aligned'}
                        {key === 'pioneerCdjFirmwareUpdated' && 'Pioneer CDJ-3000 & DJM-900NXS2 Firmware Synced'}
                        {key === 'subwooferCrossoversSet80Hz' && 'Subwoofer Low-Pass Filter Crossover Calibrated at 80 Hz'}
                        {key === 'smokeHazeMachineFluidNonToxic' && 'Water-Based Odorless Non-Toxic Haze Fluid Used'}
                        {key === 'heavyDutyGafferTapeCablesTaped' && 'Dancefloor Heavy Gaffer Cable Mats Taped Down'}
                        {key === 'decibelMeterLimiterEngaged' && 'Decibel Sound Limiter Engaged at 90 dB Mandate'}
                        {key === 'four4kSonyMirrolessBatteriesCharged' && '4x Full-Frame Sony Camera Batteries 100% Charged'}
                        {key === 'droneDirectorateGeneralCivilAviationNoc' && 'Drone Flight Clearance & Propeller Guards Verified'}
                        {key === 'gimbalStabilizerBalanceTuned' && '3-Axis Motorized Gimbal Balance Centered'}
                        {key === 'dualHighSpeedSdCards128GbEach' && 'Dual 128GB V90 High-Speed SD Cards Mounted'}
                        {key === 'instantQrLivePhotoDriveActive' && 'Live Instant Guest QR Photo Upload Cloud Link Live'}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '16px', padding: '10px', background: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff', fontSize: '0.76rem', color: '#6b21a8' }}>
                  <strong>Venue Handover Promise:</strong> All cables secured with gaffer tape; zero municipal sound limit violations post 10:00 PM.
                </div>
              </div>

            </div>

            {/* Bottom Contact & Payout Bar */}
            <div style={{
              marginTop: '20px', padding: '14px 18px', borderRadius: '12px', background: '#f8fafc',
              border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Host / Client</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{currentJob.customer} ({currentJob.phone})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Venue Coordinator</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{currentJob.clientPoc}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Operator Net Payout</span>
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
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎭</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0f172a' }}>No event productions in this category</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.85rem' }}>Switch tabs or reset filters to view all active productions.</p>
            <button
              onClick={() => setSelectedTab('all')}
              style={{
                padding: '8px 16px', borderRadius: '8px', background: '#4338ca', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              View All Event Productions
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkerEvents;
