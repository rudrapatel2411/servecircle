import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  HiOutlineCheckCircle, 
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const HealthWellnessDemo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type'); // 'iv', 'sports', or 'elderly'
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // States for IV Drip
  const [ivData, setIvData] = useState({ allergies: '', noConditions: false, drip: '' });
  
  // States for Sports
  const [sportsData, setSportsData] = useState({ focusArea: '', therapy: '' });
  
  // States for Elderly
  const [elderlyData, setElderlyData] = useState({ plan: '', days: '' });

  const handleNext = () => {
    setErrorMsg('');
    
    // Validation
    if (type === 'iv') {
      if (step === 1 && !ivData.noConditions) {
        setErrorMsg('Please confirm you have no major untreated medical conditions.'); return;
      }
      if (step === 2 && !ivData.drip) {
        setErrorMsg('Please select a drip therapy.'); return;
      }
    } else if (type === 'sports') {
      if (step === 1 && !sportsData.focusArea) {
        setErrorMsg('Please select a focus area.'); return;
      }
      if (step === 2 && !sportsData.therapy) {
        setErrorMsg('Please select a therapy type.'); return;
      }
    } else if (type === 'elderly') {
      if (step === 1 && !elderlyData.plan) {
        setErrorMsg('Please select a subscription plan.'); return;
      }
      if (step === 2 && !elderlyData.days) {
        setErrorMsg('Please select your preferred days.'); return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        let serviceName = '';
        let price = 499;
        
        if (type === 'iv') {
          serviceName = `IV Drip (${ivData.drip})`;
          price = ivData.drip === 'Hangover' ? 1999 : (ivData.drip === 'Vitamin-C' ? 2999 : 2499);
        } else if (type === 'sports') {
          serviceName = `Sports Recovery (${sportsData.therapy})`;
          price = sportsData.therapy === 'Cupping' ? 1499 : (sportsData.therapy === 'Theragun' ? 2499 : 1999);
        } else if (type === 'elderly') {
          serviceName = `Elderly Physio (${elderlyData.plan} Plan)`;
          price = elderlyData.plan === '1-Month' ? 499 : (elderlyData.plan === '3-Month' ? 399 : 299);
        }

        navigate(`/customer/book?service=${encodeURIComponent(serviceName)}&price=${price}`);
      }
    }, 800);
  };

  const getHeader = () => {
    if (type === 'iv') return { title: 'IV Drip Therapy', desc: 'Safe & Certified Home Administration', color: '#0ea5e9', bg: '#e0f2fe' };
    if (type === 'sports') return { title: 'Sports Recovery', desc: 'Professional Pain Management & Rehab', color: '#ea580c', bg: '#ffedd5' };
    if (type === 'elderly') return { title: 'Elderly Care Subscription', desc: 'Compassionate In-Home Physiotherapy', color: '#3b7dc1', bg: '#e1ebf5' };
    return { title: 'Health & Wellness', desc: 'Premium Services', color: '#6366f1', bg: '#e0e7ff' };
  };
  const header = getHeader();

  return (
    <div className="page-content" style={{ minHeight: '92vh', background: 'var(--gray-50)', paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${header.bg} 0%, white 100%)`, padding: '40px 24px', borderRadius: '0 0 24px 24px', marginBottom: '24px', borderBottom: `1px solid ${header.color}40` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: header.color, marginBottom: '8px' }}>
            {header.title}
          </h1>
          <p style={{ color: 'var(--navy-600)', fontSize: '0.95rem', fontWeight: 600 }}>{header.desc}</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: '6px', borderRadius: '3px', background: s <= step ? header.color : 'var(--gray-200)', transition: 'all 0.3s' }} />
          ))}
        </div>

        {/* --- IV DRIP FLOW --- */}
        {type === 'iv' && step === 1 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>Medical Questionnaire</h2>
            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label>Any known allergies to vitamins or medicines?</label>
              <input type="text" className="input-field" placeholder="e.g. None" value={ivData.allergies} onChange={e => setIvData({...ivData, allergies: e.target.value})} />
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input type="checkbox" style={{ width: '24px', height: '24px' }} checked={ivData.noConditions} onChange={e => setIvData({...ivData, noConditions: e.target.checked})} />
              <label style={{ margin: 0, fontSize: '0.9rem', color: 'var(--navy-800)' }}>I confirm that I do not have severe kidney, liver, or heart diseases requiring immediate medical intervention.</label>
            </div>
          </div>
        )}
        {type === 'iv' && step === 2 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>Select Drip Formulation</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{ id: 'Immunity', title: 'Immunity Booster', desc: 'High dose Vitamin C, B-Complex & Zinc.', price: 2499 },
                { id: 'Hangover', title: 'Hangover Cure', desc: 'Hydration, anti-nausea, and painkillers.', price: 1999 },
                { id: 'Vitamin-C', title: 'Vitamin-C Glow', desc: 'Glutathione & Vitamin C for skin brightening.', price: 2999 }].map(d => (
                <div key={d.id} onClick={() => setIvData({...ivData, drip: d.id})} style={{ border: `2px solid ${ivData.drip === d.id ? header.color : 'var(--gray-200)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', background: ivData.drip === d.id ? header.bg : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ fontWeight: 800, margin: 0 }}>{d.title}</h4>
                    <span style={{ fontWeight: 800, color: header.color }}>₹{d.price}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: 0 }}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SPORTS RECOVERY FLOW --- */}
        {type === 'sports' && step === 1 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>Select Focus Area</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '24px' }}>Where are you experiencing the most pain or tightness?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {['Shoulders & Neck', 'Lower Back', 'Knees & Legs', 'Full Body'].map(area => (
                <button key={area} className="btn" onClick={() => setSportsData({...sportsData, focusArea: area})} style={{ background: sportsData.focusArea === area ? header.color : 'white', color: sportsData.focusArea === area ? 'white' : 'var(--navy-700)', border: `1px solid ${sportsData.focusArea === area ? header.color : 'var(--gray-300)'}`, padding: '16px', fontWeight: 800 }}>
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}
        {type === 'sports' && step === 2 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>Select Therapy Type</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{ id: 'Deep Tissue', title: 'Deep Tissue Massage', desc: 'Relieves chronic muscle tension.', price: 1999 },
                { id: 'Cupping', title: 'Cupping Therapy', desc: 'Improves blood flow and reduces inflammation.', price: 1499 },
                { id: 'Theragun', title: 'Theragun Percussion', desc: 'High-frequency muscle treatment for athletes.', price: 2499 }].map(t => (
                <div key={t.id} onClick={() => setSportsData({...sportsData, therapy: t.id})} style={{ border: `2px solid ${sportsData.therapy === t.id ? header.color : 'var(--gray-200)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', background: sportsData.therapy === t.id ? header.bg : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ fontWeight: 800, margin: 0 }}>{t.title}</h4>
                    <span style={{ fontWeight: 800, color: header.color }}>₹{t.price}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: 0 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ELDERLY CARE FLOW --- */}
        {type === 'elderly' && step === 1 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>Select Subscription Plan</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '24px' }}>Plans include 2 visits per week by a certified physiotherapist.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{ id: '1-Month', title: '1-Month Trial Plan', desc: 'Cancel anytime. Billed monthly.', price: 499 },
                { id: '3-Month', title: '3-Month Recovery Plan', desc: 'Ideal for post-surgery rehab.', price: 399 },
                { id: '6-Month', title: '6-Month Care Plan', desc: 'Long-term maintenance for arthritis.', price: 299 }].map(p => (
                <div key={p.id} onClick={() => setElderlyData({...elderlyData, plan: p.id})} style={{ border: `2px solid ${elderlyData.plan === p.id ? header.color : 'var(--gray-200)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', background: elderlyData.plan === p.id ? header.bg : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <h4 style={{ fontWeight: 800, margin: 0 }}>{p.title}</h4>
                    <span style={{ fontWeight: 800, color: header.color }}>₹{p.price} <small style={{ color: 'var(--gray-500)', fontSize: '0.65rem' }}>/ visit</small></span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', margin: 0 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {type === 'elderly' && step === 2 && (
          <div className="card animate-fade-in-up" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '16px' }}>Preferred Schedule</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '24px' }}>Select the days you prefer the therapist to visit.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {['Mon & Thu', 'Tue & Fri', 'Wed & Sat'].map(days => (
                <button key={days} className="btn" onClick={() => setElderlyData({...elderlyData, days: days})} style={{ background: elderlyData.days === days ? header.color : 'white', color: elderlyData.days === days ? 'white' : 'var(--navy-700)', border: `1px solid ${elderlyData.days === days ? header.color : 'var(--gray-300)'}`, padding: '16px', fontWeight: 800 }}>
                  {days}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '16px', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <button className="btn" onClick={() => step === 1 ? navigate(-1) : setStep(1)} style={{ padding: '12px 24px', fontWeight: 800, color: 'var(--gray-600)' }}>
               Back
             </button>
             <button className="btn btn-primary" onClick={handleNext} disabled={loading} style={{ padding: '12px 32px', fontWeight: 800, background: header.color, borderColor: header.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
               {loading ? 'Processing...' : (step === 2 ? `Continue to Checkout` : `Next`)} 
               {!loading && <HiOutlineArrowRight />}
             </button>
           </div>
           {errorMsg && (
             <div style={{ color: 'var(--danger-500)', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', marginTop: '8px' }}>
               {errorMsg}
             </div>
           )}
        </div>
      </div>

    </div>
  );
};

export default HealthWellnessDemo;
