import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCamera, HiOutlineArchiveBox, HiOutlineUserGroup, 
  HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineCheckCircle,
  HiOutlineChevronRight, HiOutlineQrCode, HiOutlineWrenchScrewdriver,
  HiOutlineHomeModern, HiOutlineMapPin, HiOutlineTruck, HiOutlineExclamationCircle
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';

const SmartInventoryScanner = ({ onNext }) => {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState([]);
  const [done, setDone] = useState(false);

  const startScan = () => {
    setScanning(true);
    setTimeout(() => setItems(prev => [...prev, { name: '3-Seater Sofa', cft: 40, icon: '🛋️' }]), 1500);
    setTimeout(() => setItems(prev => [...prev, { name: 'Smart TV 55"', cft: 15, icon: '📺' }]), 3000);
    setTimeout(() => setItems(prev => [...prev, { name: 'Double Bed', cft: 65, icon: '🛏️' }]), 4500);
    setTimeout(() => setItems(prev => [...prev, { name: 'Fragile Cartons', cft: 10, icon: '📦' }]), 5500);
    setTimeout(() => {
      setScanning(false);
      setDone(true);
    }, 7000);
  };

  return (
    <div className="card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', background: '#0f172a', color: 'white', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}><span style={{color: '#38bdf8'}}>AI</span> {t('packersFlow.title1', 'Smart Inventory Scanner')}</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>{t('packersFlow.desc1', 'Point your camera at your room. Our AI will auto-calculate volume and quote instantly.')}</p>
      
      {!scanning && !done && (
        <button className="btn btn-primary" onClick={startScan} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #38bdf8, #2563eb)', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800 }}>
          <HiOutlineCamera style={{ fontSize: '1.4rem' }} /> {t('packersFlow.btnScan', 'Start AI Scan')}
        </button>
      )}

      {scanning && (
        <div style={{ position: 'relative', height: '250px', background: '#1e293b', borderRadius: '16px', border: '2px solid #38bdf8', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }} 
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', left: 0, width: '100%', height: '4px', background: '#38bdf8', boxShadow: '0 0 20px #38bdf8', zIndex: 10 }}
          />
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', padding: '20px' }}>
            <AnimatePresence>
              {items.map((item, idx) => (
                <motion.div key={idx} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.4)', backdropFilter: 'blur(4px)' }}>
                  <div style={{ fontSize: '2rem', textAlign: 'center' }}>{item.icon}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>{item.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>{item.cft} {t('packersFlow.itemsDetected', 'CFT detected')}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#94a3b8' }}>{t('packersFlow.totalItems', 'Total Items Scanned')}</span>
            <span style={{ fontWeight: 800 }}>{items.length} Items</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#94a3b8' }}>{t('packersFlow.totalVolume', 'Total Volume (Intercity Move)')}</span>
            <span style={{ fontWeight: 800, color: '#38bdf8' }}>130 CFT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingTop: '16px', borderTop: '1px dashed #334155' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{t('packersFlow.finalPrice', 'Instant Final Price')}</span>
            <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#10b981' }}>₹18,000</span>
          </div>
          <button className="btn btn-primary" onClick={onNext} style={{ width: '100%', padding: '16px', background: '#10b981', border: 'none', borderRadius: '12px', fontSize: '1.1rem' }}>
            {t('packersFlow.confirmProceed', 'Confirm & Proceed')} <HiOutlineChevronRight />
          </button>
        </motion.div>
      )}
    </div>
  );
};

const SharedLoadMatcher = ({ onNext }) => {
  const { t } = useTranslation();
  const [matching, setMatching] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMatching(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', borderRadius: '24px', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}><span style={{color: 'var(--primary-600)'}}>Tinder-style</span> {t('packersFlow.title2', 'Part Load Matcher')}</h2>
      <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '32px' }}>{t('packersFlow.desc2', 'Moving intercity? Share truck space with verified users and cut costs by 40%.')}</p>

      {matching ? (
        <div style={{ padding: '40px 0' }}>
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-200)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-600)', fontSize: '2rem' }}
          >
            <HiOutlineMapPin />
          </motion.div>
          <p style={{ fontWeight: 700, marginTop: '24px', color: 'var(--navy-700)' }}>{t('packersFlow.findingRoutes', 'Finding matching routes to Pune...')}</p>
        </div>
      ) : (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'var(--primary-50)', border: '2px solid var(--primary-200)', borderRadius: '16px', padding: '24px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>RK</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>{t('packersFlow.userMoving', 'Rahul K. is moving to Pune!')}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary-700)' }}>{t('packersFlow.userVerified', 'Verified Corporate User ✓')}</p>
              </div>
            </div>
            <div style={{ background: 'white', padding: '8px 12px', borderRadius: '20px', fontWeight: 800, color: 'var(--success)', border: '1px solid var(--gray-200)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              {t('packersFlow.discount', '- 40% OFF')}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--gray-200)', textDecoration: 'line-through', color: 'var(--gray-500)' }}>
              <span style={{ fontSize: '0.75rem', display: 'block' }}>{t('packersFlow.dedicatedTruck', 'Dedicated Truck')}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹18,000</span>
            </div>
            <div style={{ flex: 1, background: 'white', padding: '16px', borderRadius: '12px', border: '2px solid var(--primary-500)', color: 'var(--navy-900)', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--primary-600)', fontWeight: 700 }}>{t('packersFlow.sharedTruck', 'Shared Truck (You Pay)')}</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>₹10,500</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={onNext} style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
            {t('packersFlow.matchBook', 'Match & Book Shared Load')} <HiOutlineUserGroup />
          </button>
        </motion.div>
      )}
    </div>
  );
};

const DigitalInventoryQR = ({ onNext }) => {
  const { t } = useTranslation();
  const [scanned, setScanned] = useState(false);

  return (
    <div className="card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', borderRadius: '24px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>{t('packersFlow.title3', 'Smart QR Unpacking Guide')}</h2>
      <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '32px' }}>{t('packersFlow.desc3', "Boxes are labelled with QR codes. Scan them at your destination to know exactly what's inside.")}</p>

      {!scanned ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--gray-50)', borderRadius: '16px', border: '2px dashed var(--gray-300)', cursor: 'pointer' }} onClick={() => setScanned(true)}>
          <HiOutlineQrCode style={{ fontSize: '4rem', color: 'var(--navy-400)', margin: '0 auto 16px' }} />
          <h4 style={{ fontWeight: 800, color: 'var(--navy-800)' }}>{t('packersFlow.simulateScan', 'Tap to Simulate QR Scan')}</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{t('packersFlow.scanningBox', 'Scanning Box #104...')}</p>
        </div>
      ) : (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
          <div style={{ background: 'var(--navy-900)', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{t('packersFlow.boxHeader', '📦 Box #104')}</h3>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t('packersFlow.boxSub', 'Fragile • Kitchen Room')}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
              {t('packersFlow.statusSafe', 'Status: Safe')}
            </div>
          </div>
          <div style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>{t('packersFlow.contents', 'Contents Inside')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--navy-800)' }}>
                <span>{t('packersFlow.item1', '🍽️ Bone China Plates (Set of 12)')}</span>
                <span style={{ color: 'var(--success)' }}><HiOutlineCheckCircle /> {t('packersFlow.packed', 'Packed')}</span>
              </li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--navy-800)' }}>
                <span>{t('packersFlow.item2', '🍷 Wine Glasses (Set of 4)')}</span>
                <span style={{ color: 'var(--success)' }}><HiOutlineCheckCircle /> {t('packersFlow.packed', 'Packed')}</span>
              </li>
              <li style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--navy-800)' }}>
                <span>{t('packersFlow.item3', '🥣 Ceramic Bowls (Set of 6)')}</span>
                <span style={{ color: 'var(--success)' }}><HiOutlineCheckCircle /> {t('packersFlow.packed', 'Packed')}</span>
              </li>
            </ul>
            <button className="btn btn-primary" onClick={onNext} style={{ width: '100%', padding: '14px', marginTop: '24px' }}>
              {t('packersFlow.markUnpacked', 'Mark Unpacked & Proceed')} <HiOutlineChevronRight />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const DamageClaimAI = ({ onNext }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('idle'); // idle, analyzing, approved

  const handleUpload = () => {
    setStatus('analyzing');
    setTimeout(() => setStatus('approved'), 3000);
  };

  return (
    <div className="card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', borderRadius: '24px', textAlign: 'center' }}>
      <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px 16px', borderRadius: '20px', display: 'inline-block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '16px' }}>
        <HiOutlineExclamationCircle style={{ display: 'inline', marginBottom: '-2px', fontSize: '1rem' }} /> {t('packersFlow.warningScenario', 'SCENARIO: WHAT IF A SCRATCH HAPPENS?')}
      </div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>{t('packersFlow.title4', 'Zero-Hassle AI Claim')}</h2>
      <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '32px' }}>{t('packersFlow.desc4', "Most moves are 100% safe. But if an accident occurs, users don't need to fight with customer support. They just use this feature.")}</p>

      {status === 'idle' && (
        <>
          <div style={{ border: '2px dashed var(--gray-300)', borderRadius: '16px', padding: '40px', cursor: 'pointer', background: 'var(--gray-50)', marginBottom: '16px' }} onClick={handleUpload}>
            <HiOutlineCamera style={{ fontSize: '3rem', color: 'var(--navy-400)', margin: '0 auto 16px' }} />
            <h4 style={{ fontWeight: 800, color: 'var(--navy-800)' }}>{t('packersFlow.simulateDamage', 'Simulate Damage Upload')}</h4>
          </div>
          <button className="btn btn-outline" onClick={onNext} style={{ width: '100%', padding: '14px', border: '1px solid var(--gray-300)', color: 'var(--gray-600)', background: 'transparent', fontWeight: 700, borderRadius: '12px' }}>
            {t('packersFlow.skipDamage', 'Skip this (No damage occurred)')}
          </button>
        </>
      )}

      {status === 'analyzing' && (
        <div style={{ padding: '40px 0' }}>
           <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ width: '64px', height: '64px', border: '4px solid var(--gray-200)', borderTop: '4px solid var(--primary-500)', borderRadius: '50%', margin: '0 auto 24px' }}
          />
          <h4 style={{ fontWeight: 800, color: 'var(--navy-800)' }}>{t('packersFlow.aiVerifying', 'AI Verifying...')}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{t('packersFlow.comparingLogs', 'Comparing with pre-move inspection logs')}</p>
        </div>
      )}

      {status === 'approved' && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}>
            <HiOutlineShieldCheck />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', marginBottom: '8px' }}>{t('packersFlow.claimApproved', 'Claim Approved Instantly!')}</h3>
          <p style={{ color: '#15803d', fontSize: '0.9rem', marginBottom: '24px' }}>{t('packersFlow.aiVerifiedMsg', 'AI verified a new minor scratch on the Sofa edge.')}</p>
          <div style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', border: '1px dashed #86efac' }}>
             <span style={{ fontWeight: 800, color: '#166534' }}>{t('packersFlow.compensationCredited', 'Compensation Credited')}</span>
             <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>+ ₹850</span>
          </div>
          <button className="btn btn-primary" onClick={onNext} style={{ width: '100%', padding: '14px', background: '#166534', border: 'none' }}>
            {t('packersFlow.awesomeProceed', 'Awesome, Proceed')} <HiOutlineChevronRight />
          </button>
        </motion.div>
      )}
    </div>
  );
};

const PostMoveConcierge = ({ onNext }) => {
  const { t } = useTranslation();
  const [added, setAdded] = useState({});

  const toggleAdd = (id) => setAdded(prev => ({ ...prev, [id]: !prev[id] }));

  const services = [
    { id: 1, name: t('packersFlow.service1', 'Double Bed Assembly'), price: '₹599', icon: <HiOutlineWrenchScrewdriver /> },
    { id: 2, name: t('packersFlow.service2', 'Smart TV Wall Mounting'), price: '₹399', icon: <HiOutlineHomeModern /> },
    { id: 3, name: t('packersFlow.service3', 'Deep Home Cleaning'), price: '₹1,499', icon: <HiOutlineSparkles /> },
  ];

  return (
    <div className="card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', borderRadius: '24px', background: 'var(--navy-900)', color: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '8px', color: 'white' }}>{t('packersFlow.welcomeMsg', 'Welcome to your new home! 🎉')}</h2>
        <p style={{ color: 'var(--navy-300)', fontSize: '0.9rem' }}>{t('packersFlow.needHelpMsg', 'Need help settling in? Book verified experts instantly.')}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {services.map(s => (
          <div key={s.id} style={{ background: 'rgba(255,255,255,0.05)', border: added[s.id] ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#38bdf8' }}>
              {s.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{s.name}</h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--navy-300)' }}>{t('packersFlow.topRated', 'Top Rated Expert')}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '4px' }}>{s.price}</div>
              <button 
                onClick={() => toggleAdd(s.id)}
                style={{ 
                  background: added[s.id] ? '#38bdf8' : 'transparent', 
                  color: added[s.id] ? 'var(--navy-900)' : '#38bdf8', 
                  border: '1px solid #38bdf8', borderRadius: '20px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' 
                }}
              >
                {added[s.id] ? t('packersFlow.addedText', '✓ Added') : t('packersFlow.addText', '+ Add')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={() => alert(t('packersFlow.alertMsg', "Demo Complete! This flow proves we can build a 10x better UX."))} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #38bdf8, #2563eb)', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>
        {t('packersFlow.completeBooking', 'Complete Booking & Get Experts')} <HiOutlineChevronRight />
      </button>
    </div>
  );
};


const PackersDemo = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(prev => prev + 1);

  const steps = [
    { id: 1, title: 'AI Scanner', component: <SmartInventoryScanner onNext={nextStep} /> },
    { id: 2, title: 'Shared Load', component: <SharedLoadMatcher onNext={nextStep} /> },
    { id: 3, title: 'QR Tracking', component: <DigitalInventoryQR onNext={nextStep} /> },
    { id: 4, title: 'AI Claim', component: <DamageClaimAI onNext={nextStep} /> },
    { id: 5, title: 'Concierge', component: <PostMoveConcierge onNext={nextStep} /> },
  ];

  return (
    <div className="page-content" style={{ minHeight: '92vh', background: 'var(--gray-50)', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', background: 'white', padding: '8px 16px', borderRadius: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '16px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-600)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {t('packersFlow.badgeMsg', '✨ Premium Feature Showcase')}
        </div>
        <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>{t('packersFlow.pageTitle', 'Packers & Movers 2.0')}</h1>
        <p className="page-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>{t('packersFlow.pageSubtitle', 'Experience the ultimate logistics flow designed for maximum conversion, transparency, and trust.')}</p>
      </div>

      {/* Progress Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
        {steps.map(s => (
          <div key={s.id} onClick={() => setStep(s.id)} style={{ padding: '8px 16px', background: step === s.id ? 'var(--navy-900)' : 'white', color: step === s.id ? 'white' : 'var(--gray-400)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', border: '1px solid', borderColor: step === s.id ? 'var(--navy-900)' : 'var(--gray-200)', transition: 'all 0.2s', boxShadow: step === s.id ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'none' }}>
            {s.id}. {s.title}
          </div>
        ))}
      </div>

      {/* Render Current Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {steps.find(s => s.id === step)?.component}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PackersDemo;
