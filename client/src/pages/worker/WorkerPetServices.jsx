import { useState } from 'react';
import {
  HiOutlineHeart,
  HiOutlineCheckCircle,
  HiOutlineCalendarDays,
  HiOutlinePhone,
  HiOutlineCamera,
  HiOutlineVideoCamera,
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineXMark
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import { useSpecializedJobs } from './useSpecializedJobs';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_PET_JOBS = [
  {
    id: 'PET-JOB-401',
    type: 'pet-grooming',
    typeLabel: 'At-Home Full Grooming',
    title: 'Full Spa & Deshedding Bath: Leo (Shih Tzu, 2 Yrs)',
    customer: 'Pooja & Rohan Shah',
    phone: '+91 98250 44551',
    hostVenue: 'Flat 602, Orchid Harmony, South Bopal',
    timeSlot: '11:00 AM - 01:00 PM',
    payout: 1599,
    status: 'accepted',
    currentStage: 1, // 1: Health & Matting Check, 2: Bath & Grooming, 3: Fragrance & Polish Handover
    stages: [
      { num: 1, label: 'Coat Matting & Ear/Nail Check' },
      { num: 2, label: 'Herbal Bath & Blow Dry' },
      { num: 3, label: 'Styling Cut & Paw Polish' }
    ],
    petProfile: {
      name: 'Leo',
      breed: 'Shih Tzu (2 Yrs, 6.5 kg)',
      temperament: 'Gentle & playful. Sensitive around paws during nail clip.',
      allergies: 'Use hypoallergenic oat shampoo only (No artificial scent).'
    },
    serviceChecklist: {
      earCanalPluckingAndCleaning: true,
      nailClippingAndFilingDone: true,
      antiTickHerbalDipApplied: true,
      warmAirBlowDryAndDeshedding: false,
      sanitaryTrimAndPawBalm: false
    }
  },
  {
    id: 'PET-JOB-402',
    type: 'vet-visit',
    typeLabel: 'Vet Home Consultation',
    title: 'Annual Rabies & DHPPiL Booster Vaccine: Bruno (Labrador)',
    customer: 'Dr. Alok Verma',
    phone: '+91 98980 99221',
    hostVenue: 'Villa 12, Sterling Greenwoods, Bopal',
    timeSlot: '04:00 PM - 04:45 PM',
    payout: 999,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Pre-Vaccine Temperature & Weight' },
      { num: 2, label: 'Cold-Chain Vaccine Injection' },
      { num: 3, label: 'Digital Health Card Update' }
    ],
    petProfile: {
      name: 'Bruno',
      breed: 'Labrador Retriever (4 Yrs, 32 kg)',
      temperament: 'Friendly. Friendly with treats.',
      allergies: 'None.'
    },
    serviceChecklist: {
      temperatureLogged38_5C: true,
      heartLungAuscultationClear: true,
      vaccineColdChainSealVerified: true,
      dewormingTabletAdministered: false,
      postVaccine15MinObservation: false
    }
  },
  {
    id: 'PET-JOB-403',
    type: 'boarding',
    typeLabel: 'Cage-Free Boarding & Homestay',
    title: 'Family Homestay Boarding: Max (Golden Retriever, 3 Nights)',
    customer: 'Anjali Sharma',
    phone: '+91 98980 12345',
    hostVenue: 'Happy Paws Garden Homestay (Fenced Lawn)',
    timeSlot: '3 Nights Stay (Check-in 10 AM, Check-out 6 PM)',
    payout: 2697,
    status: 'accepted',
    currentStage: 2,
    stages: [
      { num: 1, label: 'Intake & Diet Protocol' },
      { num: 2, label: '3x Daily WhatsApp Updates' },
      { num: 3, label: 'Pre-Return Bath & Handover' }
    ],
    petProfile: {
      name: 'Max',
      breed: 'Golden Retriever (3 Yrs, 28 kg)',
      temperament: 'High energy, loves tennis balls. Afraid of thunder.',
      allergies: 'Boiled chicken & rice 2x daily (Provided by parent).'
    },
    dailyLogs: [
      { time: '08:00 AM', task: 'Morning Garden Walk & Breakfast Video', status: 'Sent to Parent ✓', sent: true },
      { time: '01:30 PM', task: 'Afternoon Snuffle Mat Play & Fresh Water Video', status: 'Pending Upload', sent: false },
      { time: '08:00 PM', task: 'Dinner & Cozy Bed Video Check-in', status: 'Pending Upload', sent: false }
    ],
    serviceChecklist: {
      fencedLawnSafetyCheck: true,
      feedingScheduleStrictlyFollowed: true,
      vetOnCallRegistered: true,
      brushingDailyDone: false
    }
  },
  {
    id: 'PET-JOB-404',
    type: 'training',
    typeLabel: 'KCI Certified Training',
    title: 'In-Home Leash Obedience & No-Pull Mastery (Session 4 of 6)',
    customer: 'Karan Dave',
    phone: '+91 99090 77889',
    hostVenue: 'Bungalow 18, Goyal Intercity, Drive-In Road',
    timeSlot: '08:00 AM - 09:30 AM',
    payout: 1299,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Gear Prep & High-Value Treats' },
      { num: 2, label: 'Hands-on Command Coaching' },
      { num: 3, label: 'Parent Homework Diary' }
    ],
    petProfile: {
      name: 'Rocky',
      breed: 'German Shepherd (1.5 Yrs)',
      temperament: 'Intelligent, pulls vigorously on leash when seeing other dogs.',
      allergies: 'Chicken treats allowed.'
    },
    serviceChecklist: {
      zeroShockCollarMandateChecked: true,
      looseLeashWalkingDrillsDone: true,
      sitStayDistractionTestPassed: false,
      recallEmergencyCueTrained: false
    }
  },
  {
    id: 'PET-JOB-405',
    type: 'pet-relocation',
    typeLabel: 'VIP Pet Transit Cab',
    title: 'AC Climate-Controlled Pet Transit: Bella (Beagle, Ahd ➔ Mumbai)',
    customer: 'Gaurav & Neha Sen',
    phone: '+91 98251 88990',
    hostVenue: 'Ahmedabad Dispatch Hub ➔ Powai, Mumbai',
    timeSlot: '06:00 AM Early Morning Dispatch',
    payout: 4500,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Crate Sanitization & Hydration' },
      { num: 2, label: 'Highway Travel & 2-Hour Stops' },
      { num: 3, label: 'Safe Delivery Handover' }
    ],
    petProfile: {
      name: 'Bella',
      breed: 'Beagle (2 Yrs, 11 kg)',
      temperament: 'Calm during car travel if given window mesh breeze.',
      allergies: 'Provide electrolyte water at every stop.'
    },
    serviceChecklist: {
      iataApprovedTravelCrateSecured: true,
      twoHourHydrationBreakLogged: true,
      certifiedPetHandlerAccompanying: true,
      vetFitnessTravelCertificateAttached: true
    }
  }
];

const normalizePetBooking = (b) => {
  const isVet = (b.service || '').toLowerCase().includes('vet');
  const isBoarding = (b.service || '').toLowerCase().includes('board') || (b.service || '').toLowerCase().includes('sit');
  const isTraining = (b.service || '').toLowerCase().includes('train');
  const isRelocation = (b.service || '').toLowerCase().includes('relocat') || (b.service || '').toLowerCase().includes('travel') || (b.service || '').toLowerCase().includes('transit');
  const type = isVet ? 'vet-visit' : isBoarding ? 'boarding' : isTraining ? 'training' : isRelocation ? 'pet-relocation' : 'pet-grooming';
  const typeLabel = isVet ? 'Vet Home Consult' : isBoarding ? 'Cage-Free Boarding' : isTraining ? 'Certified Training' : isRelocation ? 'Pet Relocation' : 'At-Home Full Grooming';

  const petName = b.requirements?.petName || 'Pet';
  const petBreed = b.requirements?.petBreed || 'Dog';

  return {
    type,
    typeLabel,
    title: `${b.service || 'Pet Care Service'}: ${petName} (${petBreed})`,
    customer: b.customer?.name || 'Pet Parent',
    phone: b.customer?.phone || '+91 98250 00000',
    hostVenue: b.address || 'Ahmedabad Residence',
    timeSlot: b.scheduledTime || '11:00 AM - 01:00 PM',
    payout: b.amount ? Math.round(b.amount * 0.85) : 1599,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Pet Health & Matting Check' },
      { num: 2, label: 'Service Care / Training Session' },
      { num: 3, label: 'Paw Polish & Safe Handover' }
    ],
    petProfile: {
      name: petName,
      breed: petBreed,
      temperament: 'Friendly & calm. Verified vaccinated.',
      allergies: 'Hypoallergenic organic shampoo only.'
    },
    serviceChecklist: {
      earCanalPluckingAndCleaning: true,
      nailClippingAndFilingDone: true,
      antiTickHerbalDipApplied: true,
      warmAirBlowDryAndDeshedding: false,
      sanitaryTrimAndPawBalm: false
    }
  };
};

const FILTER_TABS = [
  { id: 'all', label: 'All Pet Services' },
  { id: 'pet-grooming', label: '✂️ Pet Grooming' },
  { id: 'vet-visit', label: '🩺 Vet Home Visit' },
  { id: 'boarding', label: '🏡 Boarding & Daycare' },
  { id: 'training', label: '🎓 KCI Training' },
  { id: 'pet-relocation', label: '🐾 Pet Relocation' }
];

const WorkerPetServices = () => {
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
    category: 'Pet Services',
    categoryAliases: ['Pet', 'Pets'],
    defaultJobs: DEMO_PET_JOBS,
    normalizeIncomingBooking: normalizePetBooking,
  });

  const filteredJobs = jobs.filter(j => selectedTab === 'all' || j.type === selectedTab);
  const currentJob = filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0] || null;

  const toggleCheck = (jobId, key) => toggleChecklist(jobId, 'serviceChecklist', key);
  const toggleVideoLog = (jobId, idx) => toggleChecklist(jobId, 'dailyLogs', idx);

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
        background: 'linear-gradient(135deg, #be185d 0%, #831843 100%)',
        color: '#fff', padding: '24px 28px', borderRadius: '16px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Pet Care Operations Console
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>• Grooming, Vet Care, Homestays & KCI Training</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>Pet Handler & Vet Cockpit</h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              Execute spa grooming, veterinary home vaccinations, cage-free boarding 3x daily WhatsApp updates, and training milestones.
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
              const tabJobs = jobs.filter(j => tab.id === 'all' || j.type === tab.id);
              if (tabJobs.length > 0) {
                setSelectedJobId(tabJobs[0].id);
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: selectedTab === tab.id ? '2px solid #db2777' : '1px solid #cbd5e1',
              background: selectedTab === tab.id ? '#db2777' : '#fff',
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
              Pet Care Orders ({filteredJobs.length})
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#fce7f3', color: '#be185d', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
              Live Schedule
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
              No pet orders in this category right now.
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
                    border: isSelected ? '2px solid #db2777' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px -4px rgba(219, 39, 119, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                      color: '#be185d', background: '#fdf2f8', padding: '3px 8px', borderRadius: '6px'
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
                    <HiOutlineMapPin style={{ flexShrink: 0, color: '#db2777' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.hostVenue}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Pet: {job.petProfile?.name}</span>
                    <span style={{
                      color: job.status === 'completed' ? '#16a34a' : job.status === 'rejected' ? '#dc2626' : job.status === 'pending' ? '#ea580c' : '#db2777',
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be185d', background: '#fce7f3', padding: '2px 8px', borderRadius: '6px' }}>
                    {currentJob.id}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>• Time: {currentJob.timeSlot}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.82rem', color: '#475569' }}>
                  <HiOutlineMapPin style={{ color: '#db2777' }} />
                  <span><strong>Location:</strong> {currentJob.hostVenue}</span>
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
                  <HiOutlinePhone style={{ color: '#db2777' }} />
                  <span>Call Parent</span>
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
                    <HiOutlineXMark style={{ fontSize: '1.1rem' }} /> Order Declined
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
                    <HiOutlineCheckCircle style={{ fontSize: '1.1rem' }} /> Order Completed
                  </button>
                ) : (
                  <button
                    onClick={() => advanceStage(currentJob.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px',
                      borderRadius: '10px', background: currentJob.currentStage === 3 ? '#16a34a' : '#db2777',
                      color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    <span>{currentJob.currentStage === 3 ? 'Finish & Complete Order' : 'Next Stage'}</span>
                    <HiOutlineArrowRight />
                  </button>
                )}
              </div>
            </div>

            {/* Stage Stepper */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                Pet Care Operational Pipeline
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {currentJob.stages.map((stg) => {
                  const isPassed = currentJob.status === 'completed' || currentJob.currentStage > stg.num;
                  const isCurrent = currentJob.status !== 'completed' && currentJob.currentStage === stg.num;
                  return (
                    <div
                      key={stg.num}
                      style={{
                        background: isCurrent ? '#db2777' : isPassed ? '#16a34a' : '#fff',
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
              
              {/* Left Box: Pet Profile & 3x Daily Proof Center */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                
                {/* Pet Profile Card */}
                {currentJob.petProfile && (
                  <div style={{ background: '#fdf2f8', padding: '12px', borderRadius: '10px', border: '1px solid #fbcfe8', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, color: '#831843', fontSize: '1rem' }}>
                        🐾 {currentJob.petProfile.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: '#fff', color: '#be185d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {currentJob.petProfile.breed}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9d174d', marginBottom: '4px' }}>
                      <strong>Habits:</strong> {currentJob.petProfile.temperament}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      <strong>Care Notes:</strong> {currentJob.petProfile.allergies}
                    </div>
                  </div>
                )}

                {/* 3x Daily WhatsApp Video Proof Center */}
                {currentJob.dailyLogs && (
                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HiOutlineVideoCamera style={{ color: '#db2777' }} />
                      3x Daily WhatsApp Video Updates
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentJob.dailyLogs.map((log, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 10px', borderRadius: '6px', background: log.sent ? '#f0fdf4' : '#f8fafc',
                            border: '1px solid #e2e8f0', fontSize: '0.78rem'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{log.time}: </span>
                            <span style={{ color: '#475569' }}>{log.task}</span>
                          </div>
                          {log.sent ? (
                            <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.72rem' }}>Sent ✓</span>
                          ) : (
                            <button
                              onClick={() => toggleVideoLog(currentJob.id, idx)}
                              style={{
                                padding: '3px 8px', borderRadius: '6px', background: '#db2777',
                                color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer'
                              }}
                            >
                              Send Video
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Box: Protocol & Health Inspection Checklist */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineShieldCheck style={{ color: '#db2777', fontSize: '1.2rem' }} />
                  Care Protocol & Health Checklist
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(currentJob.serviceChecklist || {}).map(([key, val]) => (
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
                        style={{ accentColor: '#db2777', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: val ? 700 : 400 }}>
                        {key === 'earCanalPluckingAndCleaning' && 'Ear Canals Checked & Herbal Ear Cleaner Used'}
                        {key === 'nailClippingAndFilingDone' && 'Nails Clipped with Blood-Stop Quick Powder on Standby'}
                        {key === 'antiTickHerbalDipApplied' && 'Anti-Tick Flea Herbal Medicated Bath Completed'}
                        {key === 'warmAirBlowDryAndDeshedding' && 'Warm Air High-Velocity Undercoat Deshedding Blow Dry'}
                        {key === 'sanitaryTrimAndPawBalm' && 'Sanitary Hygiene Fur Trim & Organic Paw Wax Balm Applied'}
                        {key === 'temperatureLogged38_5C' && 'Digital Rectal Temperature Verified (Normal 38.3°C - 39.2°C)'}
                        {key === 'heartLungAuscultationClear' && 'Stethoscope Chest Auscultation Clear of Wheezing/Murmur'}
                        {key === 'vaccineColdChainSealVerified' && 'Cold-Chain 2°C - 8°C Vaccine Vial Barcode Scanned'}
                        {key === 'dewormingTabletAdministered' && 'Broad-Spectrum Deworming Dosage Administered'}
                        {key === 'postVaccine15MinObservation' && '15-Minute Observation for Allergic Anaphylaxis Passed'}
                        {key === 'fencedLawnSafetyCheck' && '6-Foot Boundary Lawn Fencing Locked & Escape-Proof'}
                        {key === 'feedingScheduleStrictlyFollowed' && 'Portion Scale Weighed & Filtered Drinking Water Kept'}
                        {key === 'vetOnCallRegistered' && 'Emergency Local Vet Hospital 24/7 on Speed Dial'}
                        {key === 'brushingDailyDone' && 'Daily Fur Brushing to Prevent Hairballs & Mats'}
                        {key === 'zeroShockCollarMandateChecked' && '100% Force-Free Positive Reinforcement Mandate Verified'}
                        {key === 'looseLeashWalkingDrillsDone' && 'Loose-Leash Walking with High-Value Liver Treats'}
                        {key === 'sitStayDistractionTestPassed' && 'Sit-Stay with Distractions Milestone Achieved'}
                        {key === 'recallEmergencyCueTrained' && 'High-Pitch Emergency Recall Whistle Conditioned'}
                        {key === 'iataApprovedTravelCrateSecured' && 'IATA-Approved Climate Travel Crate Bolted to Vehicle'}
                        {key === 'twoHourHydrationBreakLogged' && '2-Hour Leash Walking & Fresh Water Break Logged'}
                        {key === 'certifiedPetHandlerAccompanying' && 'Certified Pet Care Escort Sitting in Passenger Cabin'}
                        {key === 'vetFitnessTravelCertificateAttached' && 'Veterinary Fit-to-Fly / Fit-to-Travel Certificate Verified'}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '16px', padding: '10px', background: '#fdf2f8', borderRadius: '8px', border: '1px solid #fbcfe8', fontSize: '0.76rem', color: '#be185d' }}>
                  <strong>Parent Handover Guarantee:</strong> Zero force/punishment policy; full digital medical & behavior log submitted upon completion.
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
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pet Parent</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{currentJob.customer} ({currentJob.phone})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Handler Net Payout</span>
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
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐾</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#0f172a' }}>No pet care orders in this category</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.85rem' }}>Switch tabs or reset filters to view all active pet requests.</p>
            <button
              onClick={() => setSelectedTab('all')}
              style={{
                padding: '8px 16px', borderRadius: '8px', background: '#db2777', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
              }}
            >
              View All Pet Requests
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkerPetServices;
