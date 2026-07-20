import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineChevronDown, HiOutlineEnvelope, HiOutlinePhone, HiOutlineUserCircle } from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const B2BClientSupport = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({ type: 'Complaint', subject: '', desc: '' });

  const faqs = [
    { q: t('b2bClient.support.faqs.q1'), a: t('b2bClient.support.faqs.a1') },
    { q: t('b2bClient.support.faqs.q2'), a: t('b2bClient.support.faqs.a2') },
    { q: t('b2bClient.support.faqs.q3'), a: t('b2bClient.support.faqs.a3') },
    { q: t('b2bClient.support.faqs.q4'), a: t('b2bClient.support.faqs.a4') },
    { q: t('b2bClient.support.faqs.q5'), a: t('b2bClient.support.faqs.a5') },
    { q: t('b2bClient.support.faqs.q6'), a: t('b2bClient.support.faqs.a6') },
    { q: t('b2bClient.support.faqs.q7'), a: t('b2bClient.support.faqs.a7') },
    { q: t('b2bClient.support.faqs.q8'), a: t('b2bClient.support.faqs.a8') },
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.desc) return;
    const ticketId = `TKT-${Math.floor(Math.random() * 90000) + 10000}`;
    alert(`${t('b2bClient.support.form.successMsg')} ${ticketId}`);
    setTicketForm({ type: 'Complaint', subject: '', desc: '' });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bClient.support.title')}</h1>
          <p className="page-subtitle">{t('b2bClient.support.subtitle')}</p>
        </div>
      </div>

      <div className="b2b-two-col">
        {/* Left Column: FAQs */}
        <section className="b2b-card" style={{ flex: 2 }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', marginBottom: '16px' }}>{t('b2bClient.support.faqsTitle')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                style={{ 
                  border: '1px solid var(--gray-200)', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                <button
                  style={{
                    width: '100%',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: openFaq === i ? 'var(--primary-50)' : 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: openFaq === i ? 'var(--primary-700)' : 'var(--navy-700)',
                    fontSize: '0.95rem'
                  }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <HiOutlineChevronDown style={{ 
                    transform: openFaq === i ? 'rotate(180deg)' : 'none', 
                    transition: 'transform 0.2s' 
                  }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 16px 16px 16px', color: 'var(--gray-600)', fontSize: '0.9rem', lineHeight: '1.5', background: 'var(--primary-50)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Contact & Ticket */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          
          {/* Contact Methods */}
          <section className="b2b-card" style={{ background: 'var(--navy-800)', color: 'white' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>{t('b2bClient.support.contactUs')}</h2>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' }}>
                  <HiOutlinePhone style={{ fontSize: '1.4rem' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('b2bClient.support.helpline')}</div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>1800-123-4567</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' }}>
                  <HiOutlineEnvelope style={{ fontSize: '1.4rem' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('b2bClient.support.emailSupport')}</div>
                  <div style={{ fontWeight: 600 }}>b2bsupport@servecircle.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' }}>
                  <HiOutlineUserCircle style={{ fontSize: '1.4rem' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('b2bClient.support.accountManager')}</div>
                  <div style={{ fontWeight: 600 }}>Ananya Sharma</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>+91 98765 00000</div>
                </div>
              </div>
            </div>
          </section>

          {/* Raise Ticket Form */}
          <section className="b2b-card">
            <h2 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', marginBottom: '16px' }}>{t('b2bClient.support.raiseTicket')}</h2>
            <form onSubmit={handleTicketSubmit} className="b2b-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>{t('b2bClient.support.form.ticketType')}</label>
                <select 
                  className="input-field" 
                  value={ticketForm.type}
                  onChange={e => setTicketForm({...ticketForm, type: e.target.value})}
                >
                  <option value="Complaint">{t('b2bClient.support.ticketTypes.complaint')}</option>
                  <option value="Query">{t('b2bClient.support.ticketTypes.query')}</option>
                  <option value="Feedback">{t('b2bClient.support.ticketTypes.feedback')}</option>
                  <option value="Billing">{t('b2bClient.support.ticketTypes.billing')}</option>
                  <option value="Emergency">{t('b2bClient.support.ticketTypes.emergency')}</option>
                </select>
              </div>
              <div className="input-group">
                <label>{t('b2bClient.support.form.subject')}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  value={ticketForm.subject}
                  onChange={e => setTicketForm({...ticketForm, subject: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  required
                  placeholder={t('b2bClient.support.form.describeIssue')}
                  value={ticketForm.desc}
                  onChange={e => setTicketForm({...ticketForm, desc: e.target.value})}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>
                {t('b2bClient.support.form.submitTicket')}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default B2BClientSupport;
