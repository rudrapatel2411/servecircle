import { useState } from 'react';
import {
  HiOutlineHomeModern,
  HiOutlineCheckCircle,
  HiOutlinePhone,
  HiOutlineBolt,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineUserGroup,
  HiOutlineKey
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import { useSpecializedJobs } from './useSpecializedJobs';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_SOCIETY_JOBS = [
  {
    id: 'SOC-JOB-601',
    type: 'waterless-wash',
    typeLabel: 'Daily Waterless Car Wash',
    title: 'Daily Waterless Car Wash Contract: Godrej Garden City (Wing B2)',
    customer: 'Godrej Garden City RWA Committee',
    phone: '+91 98251 11223',
    venue: 'Basement B2 Parking Bays 101 to 120',
    timeSlot: '05:00 AM - 08:30 AM (Daily Morning Shift)',
    payout: 3800,
    status: 'accepted',
    currentStage: 2, // 1: Security Gate PIN, 2: Vehicle Roster Wash, 3: RWA Daily Signoff
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
    technicalChecks: {
      waterlessEcoConcentrateDiluted: true,
      microfiberClothsColorCoded: true,
      scratchFreeTireDressingApplied: true,
      waterSaved960LitersLogged: true,
      rwaBasementSupervisorApproved: false
    }
  },
  {
    id: 'SOC-JOB-602',
    type: 'ev-charger',
    typeLabel: 'EV Fast Wallbox Setup',
    title: 'EV Fast Wallbox Charger Installation (7.4kW Fast Setup)',
    customer: 'Nikhil Mehta (Flat 602, Tower 3)',
    phone: '+91 98990 66778',
    venue: 'Tower 3 Personal Parking Slot #38, Orchid Greens',
    timeSlot: '11:00 AM - 02:00 PM',
    payout: 4999,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'RWA NOC & Electrical Audit' },
      { num: 2, label: 'Wallbox Mounting & Wiring' },
      { num: 3, label: 'Load Test & RFID Activation' }
    ],
    gatePass: {
      pin: '9120',
      securityContact: 'Tower 3 Lobby Desk',
      guardClearance: 'RWA Work Permit Issued ✓'
    },
    technicalChecks: {
      rwaWrittenNocVerified: true,
      heavyDutyCopperArmouredCableLaid: true,
      shockProtectionRccbBreakerFitted: true,
      earthingResistanceBelow2OhmsTested: true,
      rfidCardSyncAndCustomerAppPaired: false
    }
  },
  {
    id: 'SOC-JOB-603',
    type: 'security-guard',
    typeLabel: 'Security Staffing & Gate Sync',
    title: 'RWA Security Guard Shift Handover & Visitor Gate Audit',
    customer: 'Shivalik Greens RWA (Security Desk)',
    phone: '+91 98244 55112',
    venue: 'Main Gate 1 & Tower Security Booths, Shivalik Greens',
    timeSlot: '07:00 AM - 03:00 PM (Day Shift)',
    payout: 2500,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Guard Roster & Biometric Attendance' },
      { num: 2, label: 'Visitor Pass & Boom Barrier Audit' },
      { num: 3, label: 'Night Incident Handover Log' }
    ],
    gatePass: {
      pin: '1001',
      securityContact: 'Main Security Booth #1',
      guardClearance: 'Shift Supervisor Badge Active'
    },
    technicalChecks: {
      guardsInCleanUniformWithBadges: true,
      boomBarrierOpticalSensorsTested: true,
      visitorIdVerificationCameraAligned: true,
      patrolWandNfcCheckpointsScanned: true,
      emergencySirenManualOverrideChecked: false
    }
  },
  {
    id: 'SOC-JOB-604',
    type: 'water-tank',
    typeLabel: 'Deep Tank UV Disinfection',
    title: 'Underground Sump & Overhead Tank High-Pressure Jet Clean',
    customer: 'Sterling City Society Committee',
    phone: '+91 99099 33221',
    venue: 'Main Pump House, Sterling City, Bopal (50,000L Sump)',
    timeSlot: '09:00 AM - 01:00 PM',
    payout: 5800,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Draining & Sludge Extraction' },
      { num: 2, label: 'High-Pressure Rotary Jet & UV Scrub' },
      { num: 3, label: 'Chlorine PPM Test & Water Refill' }
    ],
    gatePass: {
      pin: '7721',
      securityContact: 'Clubhouse Maintenance Office',
      guardClearance: 'Drainage Alert Broadcast to Residents'
    },
    technicalChecks: {
      sludgeSubmersiblePumpLoaded: true,
      highPressureRotaryJetMachineTested: true,
      foodGradeAntibacterialBleachApplied: true,
      uvSterilizerLampRadiated: true,
      residualChlorineBelow2PpmTested: false
    }
  },
  {
    id: 'SOC-JOB-605',
    type: 'bulk-clean',
    typeLabel: 'Common Area Deep Sanitation',
    title: 'Clubhouse & Swimming Pool Deep Sanitization Shift',
    customer: 'Iscon Platinum RWA (Facility Desk)',
    phone: '+91 97250 88334',
    venue: 'Clubhouse Level 1 & Swimming Pool Deck',
    timeSlot: '02:00 PM - 06:00 PM',
    payout: 3400,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Gym Equipment & Pool Deck Scrub' },
      { num: 2, label: 'Staircase Corridors Floor Polishing' },
      { num: 3, label: 'RWA Inspection Signoff' }
    ],
    gatePass: {
      pin: '3309',
      securityContact: 'Facility Head Office',
      guardClearance: 'Maintenance Pass Active'
    },
    technicalChecks: {
      gymCardioMachinesSanitizedWithQuaternary: true,
      poolDeckAntislipTilesScrubbed: true,
      poolPhWaterTestBalanced7_4: true,
      lobbyFloorSingleDiscBuffingCompleted: false,
      refuseChuteSteamDisinfected: false
    }
  }
];

const normalizeSocietyBooking = (b) => {
  const isWash = (b.service || '').toLowerCase().includes('wash') || (b.service || '').toLowerCase().includes('car');
  const isEv = (b.service || '').toLowerCase().includes('ev') || (b.service || '').toLowerCase().includes('charger');
  const isSecurity = (b.service || '').toLowerCase().includes('security') || (b.service || '').toLowerCase().includes('guard');
  const isTank = (b.service || '').toLowerCase().includes('tank');
  const type = isWash ? 'waterless-wash' : isEv ? 'ev-charger' : isSecurity ? 'security-guard' : isTank ? 'water-tank' : 'bulk-clean';
  const typeLabel = isWash ? 'Daily Waterless Car Wash' : isEv ? 'EV Fast Charger Wallbox' : isSecurity ? 'Security Guard Staffing' : isTank ? 'Deep Water Tank Clean' : 'Common Area Scrub';

  return {
    type,
    typeLabel,
    title: `${b.service || 'Society Contract'}: ${b.address || 'Society Premises'}`,
    customer: b.customer?.name || 'RWA Secretary',
    phone: b.customer?.phone || '+91 98251 00000',
    venue: b.address || 'Ahmedabad Society',
    timeSlot: b.scheduledTime || '06:00 AM - 09:00 AM',
    payout: b.amount ? Math.round(b.amount * 0.85) : 3800,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Security Gate Pass PIN' },
      { num: 2, label: 'Operations Execution' },
      { num: 3, label: 'RWA Daily Signoff' }
    ],
    gatePass: {
      pin: '4892',
      authorizedGate: 'Gate 2 (Service Staff Entry)',
      supervisorContact: '+91 98251 00000'
    },
    vehicleRoster: isWash ? [
      { bay: 'Bay 101', flat: 'Flat 401', vehicle: 'Creta White', washed: false },
      { bay: 'Bay 102', flat: 'Flat 602', vehicle: 'Honda City Silver', washed: false }
    ] : undefined,
    technicalChecks: {
      rwaNocVerified: true,
      circuitBreakerTested: true,
      waterMeterReadingLogged: true,
      workerSafetyGlovesWorn: true
    }
  };
};

const FILTER_TABS = [
  { id: 'all', label: 'All Society Operations' },
  { id: 'waterless-wash', label: '🚗 Waterless Car Wash' },
  { id: 'ev-charger', label: '⚡ EV Charger Wallbox' },
  { id: 'security-guard', label: '🛡️ Security Staffing' },
  { id: 'water-tank', label: '💧 Water Tank Clean' },
  { id: 'bulk-clean', label: '🏢 Common Area Scrub' }
];

const WorkerSocietyManagement = () => {
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
    category: 'Society Management',
    categoryAliases: ['Property & Society', 'Society', 'Society Management'],
    defaultJobs: DEMO_SOCIETY_JOBS,
    normalizeIncomingBooking: normalizeSocietyBooking,
  });

  const filteredJobs = jobs.filter(j => selectedTab === 'all' || j.type === selectedTab);
  const currentJob = filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0] || null;

  const toggleVehicle = (jobId, idx) => toggleChecklist(jobId, 'vehicleRoster', idx);
  const toggleCheck = (jobId, key) => toggleChecklist(jobId, 'technicalChecks', key);

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
        background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
        color: '#fff', padding: '24px 28px', borderRadius: '16px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Society Management Operations Console
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>• Car Wash Matrix, EV Chargers, Water Tanks & Security</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>Society & Facility Worker Cockpit</h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              Validate RWA gate entry PINs, execute flat-by-flat waterless wash rosters, install 7.4kW EV chargers, and perform water tank UV cleans.
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
              border: selectedTab === tab.id ? '2px solid #059669' : '1px solid #cbd5e1',
              background: selectedTab === tab.id ? '#059669' : '#fff',
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
              Society Contracts ({filteredJobs.length})
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
              Live Roster
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
              No society operations in this category.
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
                    border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px -4px rgba(5, 150, 105, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                      color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px'
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
                    <HiOutlineMapPin style={{ flexShrink: 0, color: '#059669' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.venue}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Gate PIN: {job.gatePass?.pin}</span>
                    <span style={{
                      color: job.status === 'completed' ? '#16a34a' : job.status === 'rejected' ? '#dc2626' : job.status === 'pending' ? '#ea580c' : '#059669',
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '6px' }}>
                    {currentJob.id}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>• Time: {currentJob.timeSlot}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.82rem', color: '#475569' }}>
                  <HiOutlineMapPin style={{ color: '#059669' }} />
                  <span><strong>Society Location:</strong> {currentJob.venue}</span>
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
                  <HiOutlinePhone style={{ color: '#059669' }} />
                  <span>Call RWA</span>
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
                      <HiOutlineCheck /> Accept Order
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
                    <HiOutlineXMark style={{ fontSize: '1.1rem' }} /> Shift Declined
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
                    <HiOutlineCheckCircle style={{ fontSize: '1.1rem' }} /> Shift Completed
                  </button>
                ) : (
                  <button
                    onClick={() => advanceStage(currentJob.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: currentJob.currentStage === 3 ? '#16a34a' : '#059669',
                      color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    <span>{currentJob.currentStage === 3 ? 'Finish & Complete Shift' : 'Next Stage'}</span>
                    <HiOutlineArrowRight />
                  </button>
                )}
              </div>
            </div>

            {/* Stage Stepper */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                Society Operational Stepper
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {currentJob.stages.map((stg) => {
                  const isPassed = currentJob.status === 'completed' || currentJob.currentStage > stg.num;
                  const isCurrent = currentJob.status !== 'completed' && currentJob.currentStage === stg.num;
                  return (
                    <div
                      key={stg.num}
                      style={{
                        background: isCurrent ? '#059669' : isPassed ? '#16a34a' : '#fff',
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
              
              {/* Left Box: Gate Security PIN & Matrix */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                
                {/* Gate Pass Card */}
                {currentJob.gatePass && (
                  <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '10px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: '#065f46' }}>
                        Security Gate PIN Pass
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#d1fae5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        Verified by MyGate
                      </span>
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#065f46', letterSpacing: '0.1em' }}>
                      {currentJob.gatePass.pin}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px' }}>
                      Show to security guard at boom barrier for automated entry. Contact: {currentJob.gatePass.securityContact}
                    </div>
                  </div>
                )}

                {/* Car Wash Roster */}
                {currentJob.vehicleRoster && (
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                      🚗 Parking Bay Vehicle Wash Matrix ({currentJob.vehicleRoster.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentJob.vehicleRoster.map((v, idx) => (
                        <div
                          key={idx}
                          onClick={() => toggleVehicle(currentJob.id, idx)}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
                            background: v.washed ? '#f0fdf4' : '#fff',
                            border: '1px solid #e2e8f0', fontSize: '0.78rem'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 800, color: '#059669', marginRight: '6px' }}>{v.bay}:</span>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{v.car}</span>
                          </div>
                          <span style={{
                            fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 700,
                            background: v.washed ? '#dcfce7' : '#f1f5f9',
                            color: v.washed ? '#166534' : '#64748b'
                          }}>
                            {v.washed ? 'Cleaned ✓' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Box: RWA Protocol & Technical Checklist */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineShieldCheck style={{ color: '#059669', fontSize: '1.2rem' }} />
                  RWA Standard Operating Procedure Checklist
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(currentJob.technicalChecks || {}).map(([key, val]) => (
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
                        style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: val ? 700 : 400 }}>
                        {key === 'waterlessEcoConcentrateDiluted' && 'Waterless Bio-Enzymatic Spray Prepared (Zero Spill Mandate)'}
                        {key === 'microfiberClothsColorCoded' && '400 GSM Microfiber Towels Color-Coded (Body, Wheels, Glass)'}
                        {key === 'scratchFreeTireDressingApplied' && 'Silicone-Free Matt Tire Gloss Dressing Applied'}
                        {key === 'waterSaved960LitersLogged' && 'Water Conservation Meter: 960L Saved Logged for Society'}
                        {key === 'rwaBasementSupervisorApproved' && 'Basement Facility Supervisor Digital Signature Signoff'}
                        {key === 'rwaWrittenNocVerified' && 'RWA Written Electrical Installation NOC Attached'}
                        {key === 'heavyDutyCopperArmouredCableLaid' && '3-Core 6 sq.mm Copper Armoured Cable in Heavy Conduit'}
                        {key === 'shockProtectionRccbBreakerFitted' && '30mA RCCB Shock Protection Trip Breaker Tested'}
                        {key === 'earthingResistanceBelow2OhmsTested' && 'Earthing Megger Resistance Below 2 Ohms Confirmed'}
                        {key === 'rfidCardSyncAndCustomerAppPaired' && 'Dual RFID Cards & Customer Smartphone App Paired'}
                        {key === 'guardsInCleanUniformWithBadges' && 'Security Guards in Clean Uniform with Valid Police Verification'}
                        {key === 'boomBarrierOpticalSensorsTested' && 'Boom Barrier Auto-Reverse Infrared Optical Sensors Tested'}
                        {key === 'visitorIdVerificationCameraAligned' && 'Visitor License Plate & Face Recognition HD Cameras Aligned'}
                        {key === 'patrolWandNfcCheckpointsScanned' && 'Night Patrol Wand Scanned at All 12 Perimeter NFC Tags'}
                        {key === 'emergencySirenManualOverrideChecked' && 'Emergency Siren & Fire Alarm Panel Strobe Lights Operational'}
                        {key === 'sludgeSubmersiblePumpLoaded' && 'High-Capacity Sludge Extraction Pump Cleared Debris'}
                        {key === 'highPressureRotaryJetMachineTested' && '200-Bar High Pressure Jet Cleared Slime from Tank Walls'}
                        {key === 'foodGradeAntibacterialBleachApplied' && 'Food-Grade Sodium Hypochlorite Tank Disinfection Applied'}
                        {key === 'uvSterilizerLampRadiated' && 'Submerged UV Bacterial Sterilization Lamp Radiated 15 Mins'}
                        {key === 'residualChlorineBelow2PpmTested' && 'Potable Water Refill Tested for Neutral pH & <2 PPM Chlorine'}
                        {key === 'gymCardioMachinesSanitizedWithQuaternary' && 'Treadmills, Dumbbells & Steam Room Quaternary Sanitized'}
                        {key === 'poolDeckAntislipTilesScrubbed' && 'Poolside Deck Tiles Chemically Scrubbed to Prevent Algae'}
                        {key === 'poolPhWaterTestBalanced7_4' && 'Swimming Pool pH (7.2-7.6) & Chlorine (1.5 PPM) Balanced'}
                        {key === 'lobbyFloorSingleDiscBuffingCompleted' && 'Tower Lobby Italian Marble Single-Disc Scrubbing Done'}
                        {key === 'refuseChuteSteamDisinfected' && 'Garbage Chute High-Pressure Hot Steam Disinfected'}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '16px', padding: '10px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '0.76rem', color: '#065f46' }}>
                  <strong>RWA Facility Guarantee:</strong> Zero water wastage, clean basement floor post-shift, daily report submitted to management committee.
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
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>RWA Representative</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{currentJob.customer} ({currentJob.phone})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Contract Net Payout</span>
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
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏢</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0f172a' }}>No society operations in this category</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.85rem' }}>Switch tabs or reset filters to view all active society shifts.</p>
            <button
              onClick={() => setSelectedTab('all')}
              style={{
                padding: '8px 16px', borderRadius: '8px', background: '#059669', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              View All Society Shifts
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkerSocietyManagement;
