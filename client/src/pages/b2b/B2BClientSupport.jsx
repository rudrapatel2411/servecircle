import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineChevronDown,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineUserCircle,
  HiOutlineCheckCircle,
  HiOutlineTicket,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const B2BClientSupport = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({ type: 'Complaint', subject: '', desc: '' });
  const [tickets, setTickets] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('b2bSupportTickets');
      if (raw) setTickets(JSON.parse(raw));
      else {
        const initial = [
          { id: 'TKT-10482', type: 'Billing', subject: 'July GST Invoice Clarification', status: 'In Review', date: '22 Jul 2026' },
          { id: 'TKT-10391', type: 'Maintenance', subject: 'Basement Sensor Light Replacement', status: 'Resolved', date: '18 Jul 2026' },
        ];
        localStorage.setItem('b2bSupportTickets', JSON.stringify(initial));
        setTickets(initial);
      }
    } catch (e) { /* ignore */ }
  }, []);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.desc) return;
    const ticketId = `TKT-${Math.floor(Math.random() * 90000) + 10000}`;
    const newTicket = {
      id: ticketId,
      type: ticketForm.type,
      subject: ticketForm.subject,
      desc: ticketForm.desc,
      status: 'In Review',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem('b2bSupportTickets', JSON.stringify(updated));
    showToast(`Support Ticket ${ticketId} created! Assigned to Account Manager Ananya Sharma.`);
    setTicketForm({ type: 'Complaint', subject: '', desc: '' });
  };

  const faqs = [
    { q: t('b2bClient.support.faqs.q1', 'How do I raise an emergency repair ticket?'), a: t('b2bClient.support.faqs.a1', 'You can use the 24/7 Society Emergency Hotline button or raise an Emergency ticket from this page.') },
    { q: t('b2bClient.support.faqs.q2', 'How are AMC vendor payments processed?'), a: t('b2bClient.support.faqs.a2', 'All monthly and quarterly invoices are consolidated under Invoices & Payments with instant online payment.') },
    { q: t('b2bClient.support.faqs.q3', 'Can multiple committee members have access?'), a: t('b2bClient.support.faqs.a3', 'Yes, RWA Chairman, Secretary, and Treasurer can each have tailored access under Society Team.') },
    { q: t('b2bClient.support.faqs.q4', 'Where do security guards verify incoming technicians?'), a: t('b2bClient.support.faqs.a4', 'Each dispatched work order generates a 4-digit Security Gate PIN displayed in your Work Orders tracker.') },
  ];

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

          {/* Active Tickets List */}
          {tickets.length > 0 && (
            <section className="b2b-card" style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiOutlineTicket style={{ color: '#2563eb' }} /> Active Support Tickets
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tickets.map(tkt => (
                  <div key={tkt.id} style={{ padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ color: '#0f172a' }}>{tkt.id} &middot; {tkt.subject}</strong>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700,
                        background: tkt.status === 'Resolved' ? '#dcfce7' : '#eff6ff',
                        color: tkt.status === 'Resolved' ? '#166534' : '#1d4ed8'
                      }}>
                        {tkt.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Category: {tkt.type} &middot; Submitted: {tkt.date}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          maxWidth: '420px',
        }}>
          <HiOutlineCheckCircle style={{ color: '#22c55e', fontSize: '1.4rem', flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default B2BClientSupport;
