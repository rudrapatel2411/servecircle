import { useState } from 'react';
import {
  HiOutlineCake,
  HiOutlineFire,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineBuildingStorefront
} from 'react-icons/hi2';
import WorkerDutySwitch from '../../components/WorkerDutySwitch';
import { useWorkerAuth } from './useWorkerAuth';
import { useSpecializedJobs } from './useSpecializedJobs';
import '../Dashboard.css';
import './WorkerPages.css';

const DEMO_FOOD_JOBS = [
  {
    id: 'FOD-JOB-301',
    type: 'home-chef',
    typeLabel: 'Private Home Chef',
    title: 'Traditional North Indian Feast: 8 Guests Dinner Party',
    customer: 'Vikas & Sunita Agrawal',
    phone: '+91 98254 99112',
    eventVenue: 'Bungalow 18, Gulmohar Enclave, Ambli Road',
    timeSlot: '06:00 PM - 09:30 PM (Dinner Service)',
    guestCount: 8,
    payout: 2800,
    status: 'accepted',
    currentStage: 1, // 1: Grocery & Prep, 2: Live Cooking, 3: Kitchen Sweep
    stages: [
      { num: 1, label: 'Recipe Prep & Grocery Audit' },
      { num: 2, label: 'Live Gourmet Cooking' },
      { num: 3, label: 'Kitchen Degrease & Handover' }
    ],
    menuItems: [
      { name: 'Paneer Butter Masala (Rich Cashew Gravy)', done: true },
      { name: 'Dal Makhani (Slow-Cooked Overnight)', done: true },
      { name: 'Amritsari Kulcha / Phulkas', done: false },
      { name: 'Kesari Matka Kulfi', done: false }
    ],
    prepChecklist: {
      apronAndChefHatClean: true,
      knivesSharpenedAndSterilized: true,
      spicesAndGheeInspected: true,
      lowSpicyJainPortionSeparated: true,
      burnersAndChimneyWipedPostCook: false
    },
    notes: '2 Guests are elderly with low sodium & zero chili spice preference.'
  },
  {
    id: 'FOD-JOB-302',
    type: 'bbq',
    typeLabel: 'Backyard Charcoal BBQ',
    title: 'Backyard BBQ Live Charcoal Grill: 12 Guests Sundowner Feast',
    customer: 'Mehul & Ritu Shah',
    phone: '+91 98240 55667',
    eventVenue: 'Villa 22, Sterling City, Bopal (Private Lawn)',
    timeSlot: '05:30 PM - 09:30 PM (Evening Sundowner)',
    guestCount: 12,
    payout: 4899,
    status: 'accepted',
    currentStage: 2,
    stages: [
      { num: 1, label: 'Marinade Prep & Hardware Rig' },
      { num: 2, label: 'Live Grill & Table Service' },
      { num: 3, label: 'Post-Party Spotless Sweep' }
    ],
    menuItems: [
      { name: 'Peri-Peri Malai Paneer Tikka (30 Skewers)', done: true },
      { name: 'Hickory-Smoked Chicken Tikka (25 Skewers)', done: true },
      { name: 'Awadhi Mutton Seekh Kebabs (20 Skewers)', done: true },
      { name: 'Smoked Herb Mushrooms & Sweet Corn (20 Skewers)', done: true }
    ],
    prepChecklist: {
      portableCastIronGrill: true,
      organicLumpCoal5kg: true,
      palmLeafPlatesAndTableware: true,
      fireExtinguisherLoaded: true,
      tongsAndBastingBrushes: true
    },
    notes: '2 Guests strictly Jain. Use dedicated pure-veg cast iron grill plate.'
  },
  {
    id: 'FOD-JOB-303',
    type: 'custom-cake',
    typeLabel: 'Designer Pastry & Cake',
    title: '2-Tier Red Velvet Anniversary Cake (Pickup & Cold Handover)',
    customer: 'Priya & Arjun Desai',
    phone: '+91 98980 11234',
    eventVenue: 'Flat 402, Riviera Elegance, Prahlad Nagar',
    timeSlot: '04:00 PM Sharp (Surprise Party)',
    guestCount: 20,
    payout: 1850,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Bakery Inspection & Cold-Box Packing' },
      { num: 2, label: 'Temperature-Safe Transit' },
      { num: 3, label: 'Doorstep Surprise Handover' }
    ],
    cakeMeta: {
      flavor: 'Rich Red Velvet with Cream Cheese Frosting',
      weight: '2.5 kg (Double Layer)',
      pipingMessage: 'Happy 10th Anniversary Priya & Arjun ❤️',
      boxType: 'Dry-Ice Thermal Insulated Carry Box'
    },
    prepChecklist: {
      frostingIntactCheck: true,
      candlesAndKnifeIncluded: true,
      acCoolingInTransit20C: true,
      photoTakenAtPickup: true,
      customerSignoffReceived: false
    }
  },
  {
    id: 'FOD-JOB-304',
    type: 'banquet-catering',
    typeLabel: 'Party Catering Setup',
    title: 'Corporate Celebration Banquet: 45 Guests Buffet Setup',
    customer: 'Nexus Corp (HR Department)',
    phone: '+91 97241 88990',
    eventVenue: 'Nexus Tower 3 Terrace Garden, Sindhu Bhavan Road',
    timeSlot: '12:30 PM - 03:30 PM (Lunch Banquet)',
    guestCount: 45,
    payout: 8500,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Chafing Dishes Rig & Crockery Setup' },
      { num: 2, label: 'Buffet Service & Live Pasta Counter' },
      { num: 3, label: 'Tear-down & Waste Disposal' }
    ],
    menuItems: [
      { name: 'Live Penne Alfredo & Arrabiata Station', done: true },
      { name: 'Paneer Lababdar & Subz Handi Buffet', done: true },
      { name: 'Assorted Breads & Garlic Naan Basket', done: false },
      { name: 'Gulab Jamun with Rabdi Pot', done: false }
    ],
    prepChecklist: {
      chafingDishesFuelCanisters: true,
      melaminePlatesAndCutlery45Sets: true,
      liveBurnerSafetyClearance: true,
      foodWarmersTempAbove65C: true,
      bioDegradableGarbageBagsReady: true
    }
  },
  {
    id: 'FOD-JOB-305',
    type: 'kitchen-clean',
    typeLabel: 'Kitchen Steam Clean',
    title: 'Commercial Steam Degrease & Chimney Decanting',
    customer: 'Radhika Trivedi',
    phone: '+91 98251 77665',
    eventVenue: 'Bungalow 4, Goyal Park, Vastrapur',
    timeSlot: '09:00 AM - 12:00 PM',
    guestCount: 1,
    payout: 2200,
    status: 'accepted',
    currentStage: 1,
    stages: [
      { num: 1, label: 'Chimney Filter Dismantle & Soak' },
      { num: 2, label: '140°C High-Pressure Steam Degrease' },
      { num: 3, label: 'Pantry Decanting & Re-Clean Signoff' }
    ],
    prepChecklist: {
      bioEnzymaticDegreaserReady: true,
      steamMachinePressureChecked: true,
      burnersSoakedInDecarbonizer: true,
      pantryMinimalistLabelCheck: true,
      exhaustFanAirflowTested: false
    }
  }
];

const normalizeFoodBooking = (b) => {
  const isBbq = (b.service || '').toLowerCase().includes('bbq') || (b.service || '').toLowerCase().includes('barbecue');
  const isCake = (b.service || '').toLowerCase().includes('cake') || (b.service || '').toLowerCase().includes('baking');
  const isClean = (b.service || '').toLowerCase().includes('clean') || (b.service || '').toLowerCase().includes('pantry');
  const isCatering = (b.service || '').toLowerCase().includes('catering') || (b.service || '').toLowerCase().includes('banquet');
  const type = isBbq ? 'bbq' : isCake ? 'custom-cake' : isClean ? 'kitchen-clean' : isCatering ? 'banquet-catering' : 'home-chef';
  const typeLabel = isBbq ? 'Backyard BBQ' : isCake ? 'Custom Cake / Baking' : isClean ? 'Kitchen Clean' : isCatering ? 'Party Catering' : 'Private Home Chef';

  return {
    type,
    typeLabel,
    title: `${b.service || 'Culinary Experience'}: ${b.address || 'Venue'}`,
    customer: b.customer?.name || 'Gourmet Client',
    phone: b.customer?.phone || '+91 98254 00000',
    eventVenue: b.address || 'Ahmedabad Venue',
    timeSlot: b.scheduledTime || '06:00 PM - 09:30 PM',
    guestCount: b.requirements?.guests || 8,
    payout: b.amount ? Math.round(b.amount * 0.85) : 2800,
    currentStage: 1,
    stages: [
      { num: 1, label: 'Recipe Prep & Grocery Audit' },
      { num: 2, label: 'Live Gourmet Cooking' },
      { num: 3, label: 'Kitchen Degrease & Handover' }
    ],
    menuItems: [
      { name: b.requirements?.cakeFlavor ? `${b.requirements.cakeFlavor} Course` : 'Signature Dish', done: false },
      { name: 'Artisan Side Course', done: false },
      { name: 'Fresh Dessert Plating', done: false }
    ],
    prepChecklist: {
      apronAndChefHatClean: true,
      knivesSharpenedAndSterilized: true,
      spicesAndGheeInspected: true,
      lowSpicyJainPortionSeparated: true,
      burnersAndChimneyWipedPostCook: false
    },
    notes: b.description || 'Standard culinary package preferences.',
    cakeMeta: isCake ? {
      flavor: b.requirements?.cakeFlavor ? `${b.requirements.cakeFlavor} Custom Design` : 'Rich Chocolate Truffle',
      weight: b.requirements?.cakeWeight ? `${b.requirements.cakeWeight} kg` : '1.5 kg (Double Layer)',
      pipingMessage: b.requirements?.cakeMessage || 'Happy Celebration! 🎉',
      boxType: 'Thermal Insulated Cold Carry Box'
    } : undefined
  };
};

const FILTER_TABS = [
  { id: 'all', label: 'All Culinary Requests' },
  { id: 'home-chef', label: '👨‍🍳 Private Chef' },
  { id: 'bbq', label: '🔥 Backyard BBQ' },
  { id: 'custom-cake', label: '🎂 Designer Cake' },
  { id: 'banquet-catering', label: '🍽️ Party Catering' },
  { id: 'kitchen-clean', label: '✨ Kitchen Steam Clean' }
];

const WorkerFood = () => {
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
    category: 'Food Kitchen',
    categoryAliases: ['Food', 'Kitchen', 'Food & Kitchen'],
    defaultJobs: DEMO_FOOD_JOBS,
    normalizeIncomingBooking: normalizeFoodBooking,
  });

  const filteredJobs = jobs.filter(j => selectedTab === 'all' || j.type === selectedTab);
  const currentJob = filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0] || null;

  const toggleCheck = (jobId, key) => toggleChecklist(jobId, 'prepChecklist', key);
  const toggleMenuItem = (jobId, idx) => toggleChecklist(jobId, 'menuItems', idx);

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
        background: 'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)',
        color: '#fff', padding: '24px 28px', borderRadius: '16px', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Food & Kitchen Operations
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>• Private Chefs, BBQ Rig, Cakes & Banquet Feasts</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>Chef & Culinary Operations Cockpit</h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>
              Oversee ingredient preparation, live charcoal BBQ grilling, custom cake delivery, and spotless kitchen sweep signoffs.
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
              border: selectedTab === tab.id ? '2px solid #ea580c' : '1px solid #cbd5e1',
              background: selectedTab === tab.id ? '#ea580c' : '#fff',
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
              Culinary Orders ({filteredJobs.length})
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#ffedd5', color: '#c2410c', padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
              Live Kitchen Roster
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
              No culinary orders in this category.
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
                    border: isSelected ? '2px solid #ea580c' : '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 20px -4px rgba(234, 88, 12, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                      color: '#c2410c', background: '#fff7ed', padding: '3px 8px', borderRadius: '6px'
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
                    <HiOutlineMapPin style={{ flexShrink: 0, color: '#ea580c' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.eventVenue}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#475569', fontWeight: 600 }}>Guests: {job.guestCount} Pax</span>
                    <span style={{
                      color: job.status === 'completed' ? '#16a34a' : job.status === 'rejected' ? '#dc2626' : job.status === 'pending' ? '#ea580c' : '#c2410c',
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c2410c', background: '#ffedd5', padding: '2px 8px', borderRadius: '6px' }}>
                    {currentJob.id}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>• Time: {currentJob.timeSlot}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.82rem', color: '#475569' }}>
                  <HiOutlineMapPin style={{ color: '#ea580c' }} />
                  <span><strong>Venue:</strong> {currentJob.eventVenue} ({currentJob.guestCount} Guests)</span>
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
                  <HiOutlinePhone style={{ color: '#ea580c' }} />
                  <span>Call Host</span>
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
                      borderRadius: '10px', background: currentJob.currentStage === 3 ? '#16a34a' : '#ea580c',
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
                Culinary Operational Pipeline
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {currentJob.stages.map((stg) => {
                  const isPassed = currentJob.status === 'completed' || currentJob.currentStage > stg.num;
                  const isCurrent = currentJob.status !== 'completed' && currentJob.currentStage === stg.num;
                  return (
                    <div
                      key={stg.num}
                      style={{
                        background: isCurrent ? '#ea580c' : isPassed ? '#16a34a' : '#fff',
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
              
              {/* Left Box: Recipe / Menu Progress */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                
                {/* 1. Menu Items Checklist */}
                {currentJob.menuItems && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      🍲 Menu Dishes & Live Cooking Status
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentJob.menuItems.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => toggleMenuItem(currentJob.id, idx)}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px', borderRadius: '8px', cursor: 'pointer',
                            background: item.done ? '#f0fdf4' : '#fff',
                            border: '1px solid #e2e8f0', fontSize: '0.8rem'
                          }}
                        >
                          <span style={{ fontWeight: item.done ? 700 : 500, color: item.done ? '#166534' : '#0f172a' }}>
                            {item.name}
                          </span>
                          <span style={{
                            fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 700,
                            background: item.done ? '#dcfce7' : '#f1f5f9',
                            color: item.done ? '#166534' : '#64748b'
                          }}>
                            {item.done ? 'Ready / Served' : 'Pending Prep'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Cake Specs */}
                {currentJob.type === 'custom-cake' && currentJob.cakeMeta && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                      🎂 Custom Designer Cake Specs
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                      <div style={{ background: '#fdf2f8', padding: '10px', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                        <div style={{ color: '#9d174d', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Flavor & Weight</div>
                        <div style={{ fontWeight: 800, color: '#831843' }}>{currentJob.cakeMeta.flavor} ({currentJob.cakeMeta.weight})</div>
                      </div>
                      <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Piped Cake Message</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', margin: '4px 0' }}>
                          "{currentJob.cakeMeta.pipingMessage}"
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        📦 <strong>Packaging:</strong> {currentJob.cakeMeta.boxType}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chef Notes Alert */}
                {currentJob.notes && (
                  <div style={{ marginTop: '14px', padding: '10px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7', fontSize: '0.76rem', color: '#92400e' }}>
                    <strong>Dietary Alert:</strong> {currentJob.notes}
                  </div>
                )}

              </div>

              {/* Right Box: Hardware, Ingredients & Hygiene Checklist */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineShieldCheck style={{ color: '#ea580c', fontSize: '1.2rem' }} />
                  Food Safety, Hardware & Cleanliness Checklist
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(currentJob.prepChecklist || {}).map(([key, val]) => (
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
                        style={{ accentColor: '#ea580c', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: val ? 700 : 400 }}>
                        {key === 'apronAndChefHatClean' && 'Sterilized Chef Apron, Gloves & Chef Hat On'}
                        {key === 'knivesSharpenedAndSterilized' && 'Stainless Steel Chef Knives & Chopping Boards Sanitized'}
                        {key === 'spicesAndGheeInspected' && 'Fresh Organic Ghee, Spices & Farm Dairy Inspected'}
                        {key === 'lowSpicyJainPortionSeparated' && 'Dedicated Jain Utensil & Zero-Onion/Garlic Prep'}
                        {key === 'burnersAndChimneyWipedPostCook' && 'Stovetop, Countertops & Waste Degreased Post-Cooking'}
                        {key === 'portableCastIronGrill' && 'Cast-Iron Portable Charcoal Grill Cleaned & Stable'}
                        {key === 'organicLumpCoal5kg' && '5kg Organic Lump Charcoal & Natural Coconut Starters'}
                        {key === 'palmLeafPlatesAndTableware' && 'Eco-Friendly Areca Palm Leaf Tableware & Napkins'}
                        {key === 'fireExtinguisherLoaded' && 'Emergency Fire Blanket & CO2 Extinguisher on Standby'}
                        {key === 'tongsAndBastingBrushes' && 'Heat-Resistant Silicone Basting Brushes & Skewer Tongs'}
                        {key === 'frostingIntactCheck' && 'Cake Surface 100% Intact with Zero Transit Vibration Smudges'}
                        {key === 'candlesAndKnifeIncluded' && 'Complimentary Sparkler Candles & Cake Knife Packed'}
                        {key === 'acCoolingInTransit20C' && 'Vehicle AC Cooling at 20°C to Prevent Cream Melting'}
                        {key === 'photoTakenAtPickup' && 'High-Res Cake Photo Uploaded on Dispatch'}
                        {key === 'customerSignoffReceived' && 'Host Signature Received for Temperature & Presentation'}
                        {key === 'chafingDishesFuelCanisters' && 'Stainless Chafing Dishes & Ethanol Gel Fuel Cans Loaded'}
                        {key === 'melaminePlatesAndCutlery45Sets' && 'Premium Melamine Dinnerware & Cutlery Sets Counted'}
                        {key === 'liveBurnerSafetyClearance' && 'Live Counter Heat Shield & Table Linens Flame-Proofed'}
                        {key === 'foodWarmersTempAbove65C' && 'Food Warmer Temperature Calibrated Above 65°C Mandate'}
                        {key === 'bioDegradableGarbageBagsReady' && 'Commercial Heavy-Duty Waste Disposal Bags Ready'}
                        {key === 'bioEnzymaticDegreaserReady' && 'Food-Safe Bio-Enzymatic Degreasing Solvent Prepared'}
                        {key === 'steamMachinePressureChecked' && '140°C High-Pressure Steam Wand Calibrated'}
                        {key === 'burnersSoakedInDecarbonizer' && 'Brass Burners Submerged in Carbon Dissolution Bath'}
                        {key === 'pantryMinimalistLabelCheck' && 'Pantry Containers Cleaned & Aesthetic Minimalist Labels Applied'}
                        {key === 'exhaustFanAirflowTested' && 'Chimney Blower CFM & Suction Airflow Verified'}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: '16px', padding: '10px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5', fontSize: '0.76rem', color: '#c2410c' }}>
                  <strong>Zero-Mess Guarantee:</strong> All ash, grease, and kitchen waste packed in leak-proof bags; sink scrubbed clean before leaving.
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
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Host Contact</span>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{currentJob.customer} ({currentJob.phone})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Chef Net Payout</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>₹{currentJob.payout.toLocaleString('en-IN')}</div>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🍳</div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>No culinary orders in this category</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 16px' }}>
              There are currently no active bookings matching this filter. Switch back to view all requests.
            </p>
            <button
              onClick={() => { setSelectedTab('all'); if (jobs.length > 0) setSelectedJobId(jobs[0].id); }}
              style={{ padding: '8px 18px', borderRadius: '10px', background: '#ea580c', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              View All Culinary Requests
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkerFood;
