import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSparkles,
  HiOutlineWrenchScrewdriver,
  HiOutlineShieldCheck,
  HiOutlineHomeModern,
  HiOutlineXMark,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { MdOutlinePestControl, MdOutlineAcUnit, MdOutlinePark, MdOutlineRecycling } from 'react-icons/md';
import '../Dashboard.css';
import './B2BPages.css';

const B2BClientServices = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [form, setForm] = useState({ location: '', date: '', time: '', quantity: '1', notes: '' });
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const savedLocs = localStorage.getItem('b2bClientBlocks');
    if (savedLocs) setLocations(JSON.parse(savedLocs));
  }, []);

  const categories = [
    { id: 'cleaning', title: t('b2bClient.services.categories.cleaning'), desc: t('b2bClient.services.categories.cleaningDesc'), icon: HiOutlineSparkles, color: '#3b82f6' },
    { id: 'pest', title: t('b2bClient.services.categories.pestControl'), desc: t('b2bClient.services.categories.pestControlDesc'), icon: MdOutlinePestControl, color: '#ef4444' },
    { id: 'maintenance', title: t('b2bClient.services.categories.maintenance'), desc: t('b2bClient.services.categories.maintenanceDesc'), icon: HiOutlineWrenchScrewdriver, color: '#f59e0b' },
    { id: 'ac', title: t('b2bClient.services.categories.acAppliance'), desc: t('b2bClient.services.categories.acApplianceDesc'), icon: MdOutlineAcUnit, color: '#06b6d4' },
    { id: 'security', title: t('b2bClient.services.categories.security'), desc: t('b2bClient.services.categories.securityDesc'), icon: HiOutlineShieldCheck, color: '#6366f1' },
    { id: 'garden', title: t('b2bClient.services.categories.garden'), desc: t('b2bClient.services.categories.gardenDesc'), icon: MdOutlinePark, color: '#10b981' },
    { id: 'common', title: t('b2bClient.services.categories.commonArea'), desc: t('b2bClient.services.categories.commonAreaDesc'), icon: HiOutlineHomeModern, color: '#8b5cf6' },
    { id: 'waste', title: t('b2bClient.services.categories.waste'), desc: t('b2bClient.services.categories.wasteDesc'), icon: MdOutlineRecycling, color: '#14b8a6' },
  ];

  const servicesData = {
    cleaning: [
      { id: 'c1', name: t('b2bClient.services.servicesList.s1'), price: 4500, time: '3-4 hrs' },
      { id: 'c2', name: t('b2bClient.services.servicesList.s2'), price: 2500, time: '2 hrs' },
      { id: 'c3', name: t('b2bClient.services.servicesList.s3'), price: 8000, time: '1 day' },
      { id: 'c4', name: t('b2bClient.services.servicesList.s4'), price: 15000, time: 'Monthly AMC' },
      { id: 'c5', name: t('b2bClient.services.servicesList.s5'), price: 6000, time: '5 hrs' },
      { id: 'c6', name: t('b2bClient.services.servicesList.s6'), price: 3000, time: '3 hrs' },
    ],
    pest: [
      { id: 'p1', name: t('b2bClient.services.servicesList.s7'), price: 1800, time: '2 hrs' },
      { id: 'p2', name: t('b2bClient.services.servicesList.s8'), price: 2200, time: '2 hrs' },
      { id: 'p3', name: t('b2bClient.services.servicesList.s9'), price: 5500, time: '4 hrs' },
      { id: 'p4', name: t('b2bClient.services.servicesList.s10'), price: 1500, time: '1 hr' },
      { id: 'p5', name: t('b2bClient.services.servicesList.s11'), price: 2800, time: '3 hrs' },
    ],
    maintenance: [
      { id: 'm1', name: t('b2bClient.services.servicesList.s12'), price: 800, time: '1 hr' },
      { id: 'm2', name: t('b2bClient.services.servicesList.s13'), price: 900, time: '1 hr' },
      { id: 'm3', name: t('b2bClient.services.servicesList.s14'), price: 1200, time: '2 hrs' },
      { id: 'm4', name: t('b2bClient.services.servicesList.s15'), price: 1500, time: '3 hrs' },
      { id: 'm5', name: t('b2bClient.services.servicesList.s16'), price: 12000, time: '2 days' },
    ],
    ac: [
      { id: 'a1', name: t('b2bClient.services.servicesList.s17'), price: 1200, time: '1.5 hrs' },
      { id: 'a2', name: t('b2bClient.services.servicesList.s18'), price: 45000, time: 'Annual AMC' },
      { id: 'a3', name: t('b2bClient.services.servicesList.s19'), price: 3500, time: '3 hrs' },
      { id: 'a4', name: t('b2bClient.services.servicesList.s20'), price: 85000, time: 'Annual AMC' },
      { id: 'a5', name: t('b2bClient.services.servicesList.s21'), price: 5500, time: '4 hrs' },
    ],
    security: [
      { id: 's1', name: t('b2bClient.services.servicesList.s22'), price: 22000, time: 'Monthly/Guard' },
      { id: 's2', name: t('b2bClient.services.servicesList.s23'), price: 12000, time: 'Annual AMC' },
      { id: 's3', name: t('b2bClient.services.servicesList.s24'), price: 800, time: 'Per Unit' },
      { id: 's4', name: t('b2bClient.services.servicesList.s25'), price: 15000, time: 'One Time' },
    ],
    garden: [
      { id: 'g1', name: t('b2bClient.services.servicesList.s26'), price: 4500, time: 'Monthly' },
      { id: 'g2', name: t('b2bClient.services.servicesList.s27'), price: 3000, time: '4 hrs' },
      { id: 'g3', name: t('b2bClient.services.servicesList.s28'), price: 2500, time: 'Monthly' },
      { id: 'g4', name: t('b2bClient.services.servicesList.s29'), price: 1800, time: '2 hrs' },
    ],
    common: [
      { id: 'ca1', name: t('b2bClient.services.servicesList.s30'), price: 18000, time: 'Monthly AMC' },
      { id: 'ca2', name: t('b2bClient.services.servicesList.s31'), price: 12000, time: 'Annual AMC' },
      { id: 'ca3', name: t('b2bClient.services.servicesList.s32'), price: 8500, time: '1 day' },
      { id: 'ca4', name: t('b2bClient.services.servicesList.s33'), price: 5000, time: '4 hrs' },
      { id: 'ca5', name: t('b2bClient.services.servicesList.s34'), price: 3500, time: '3 hrs' },
      { id: 'ca6', name: t('b2bClient.services.servicesList.s35'), price: 6500, time: '6 hrs' },
    ],
    waste: [
      { id: 'w1', name: t('b2bClient.services.servicesList.s36'), price: 15000, time: 'Monthly' },
      { id: 'w2', name: t('b2bClient.services.servicesList.s37'), price: 8000, time: 'Monthly AMC' },
      { id: 'w3', name: t('b2bClient.services.servicesList.s38'), price: 4000, time: 'Per Load' },
      { id: 'w4', name: t('b2bClient.services.servicesList.s39'), price: 0, time: 'On Request' },
    ]
  };

  const handleBook = (e) => {
    e.preventDefault();
    if (!form.location || !form.date) return;
    
    const saved = localStorage.getItem('b2bClientContracts');
    const existing = saved ? JSON.parse(saved) : [];
    
    const newContract = {
      id: `AMC-${Math.floor(Math.random() * 90000) + 10000}`,
      name: bookingModal.name,
      type: bookingModal.time.includes('AMC') || bookingModal.time.includes('Monthly') ? 'AMC' : 'Ad-hoc',
      vendor: 'ServeCircle Partner',
      startDate: form.date,
      endDate: 'N/A',
      frequency: bookingModal.time,
      value: bookingModal.price,
      status: 'active',
      locations: 1,
    };
    
    localStorage.setItem('b2bClientContracts', JSON.stringify([...existing, newContract]));
    
    alert(`${t('b2bClient.services.modal.successMsg')} ${newContract.id}`);
    setBookingModal(null);
    setForm({ location: '', date: '', time: '', quantity: '1', notes: '' });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bClient.services.title')}</h1>
          <p className="page-subtitle">{t('b2bClient.services.subtitle')}</p>
        </div>
      </div>

      {!activeCategory ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="b2b-card hover-lift"
              style={{ cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', borderTop: `4px solid ${cat.color}` }}
              onClick={() => setActiveCategory(cat.id)}
            >
              <cat.icon style={{ fontSize: '3rem', color: cat.color, marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', marginBottom: '8px' }}>{cat.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: '1.4' }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button className="btn btn-outline" style={{ marginBottom: '20px' }} onClick={() => setActiveCategory(null)}>
            {t('b2bClient.services.backToCategories')}
          </button>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {servicesData[activeCategory].map((svc) => (
              <div key={svc.id} className="b2b-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', marginBottom: '8px' }}>{svc.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                      {svc.price > 0 ? `${t('b2bClient.common.rupees')}${svc.price.toLocaleString('en-IN')}` : 'On Inspection'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '4px 8px', borderRadius: '4px' }}>
                      {t('b2bClient.services.duration')}: {svc.time}
                    </span>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setBookingModal(svc)}>
                  {t('b2bClient.services.bookService')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', position: 'relative' }}>
            <button onClick={() => setBookingModal(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--gray-400)' }}>
              <HiOutlineXMark />
            </button>
            
            <h2 style={{ fontSize: '1.3rem', color: 'var(--navy-800)', marginBottom: '4px' }}>{t('b2bClient.services.bookService')}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '20px' }}>{bookingModal.name}</p>

            <form onSubmit={handleBook} className="b2b-form-grid">
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>{t('b2bClient.services.modal.selectLocation')}</label>
                <select className="input-field" required value={form.location} onChange={e => setForm({...form, location: e.target.value})}>
                  <option value="">-- {t('b2bClient.services.modal.selectLocation')} --</option>
                  <option value="all">Entire Society Campus</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.tower} - {loc.floor}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>{t('b2bClient.services.modal.preferredDate')}</label>
                <input type="date" className="input-field" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="input-group">
                <label>{t('b2bClient.services.modal.preferredTime')}</label>
                <input type="time" className="input-field" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>{t('b2bClient.services.modal.quantity')}</label>
                <input type="text" className="input-field" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>{t('b2bClient.services.modal.additionalNotes')}</label>
                <textarea className="input-field" rows="3" placeholder={t('b2bClient.services.modal.notesPlaceholder')} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
              </div>
              
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '12px', background: 'var(--primary-50)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--navy-700)' }}>Estimated Cost:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                  {t('b2bClient.common.rupees')}{bookingModal.price > 0 ? (bookingModal.price * (parseFloat(form.quantity) || 1)).toLocaleString('en-IN') : 'TBD'}
                </span>
              </div>
              
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{t('b2bClient.services.modal.confirmBooking')}</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setBookingModal(null)}>{t('b2bClient.common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BClientServices;
