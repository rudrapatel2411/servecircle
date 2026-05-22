import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineShieldCheck, HiOutlineCheckCircle, HiOutlineLockClosed,
  HiOutlineDocumentCheck, HiOutlineBuildingLibrary, HiOutlinePhone,
  HiOutlineChatBubbleLeftRight, HiOutlineExclamationTriangle
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const TrustSafety = () => {
  const { t } = useTranslation();

  // Verification Steps State
  const [activeStep, setActiveStep] = useState(0);

  const verificationSteps = [
    {
      title: 'KYC & Aadhaar Verification',
      desc: 'Real-time validation of Aadhaar, PAN, and address proof using government API databases to verify absolute authenticity.',
      details: 'Every worker must supply bio-data and government ID cards. These are cross-referenced with national records to prevent identity theft.'
    },
    {
      title: 'Criminal Records Check',
      desc: 'Thorough background search of local police station records and court records to guarantee clean history.',
      details: 'We partner with premium background-check agencies who scan court records across national databases for past criminal histories.'
    },
    {
      title: 'Skill Assessment & Interview',
      desc: 'Every applicant undergoes an in-person hands-on skill test supervised by industry veterans before approval.',
      details: 'Electricians are tested on complex wiring, painters on finishes, and cleaning staff on standard hygiene protocols.'
    },
    {
      title: 'Safety Training & Code of Conduct',
      desc: 'Mandatory safe-behavior seminar including customer-privacy protocols, professional behavior, and hygiene standards.',
      details: 'Workers learn house entry protocols, respect guidelines, mask/sanitizer usage, and direct-to-app communication standards.'
    },
    {
      title: 'Continuous Review Audit',
      desc: 'Automated monitoring of customer feedback. Any worker dropping below 4.5 rating is suspended for retrial.',
      details: 'If a worker receives a low rating, an automated system holds their next dispatches and sends them for review.'
    }
  ];

  const protections = [
    {
      title: 'Call Masking / Number Privacy',
      desc: 'Your actual phone number is never shared. The app uses masked calls so workers only see a temporary virtual routing number.',
      icon: <HiOutlineLockClosed style={{ color: '#8b5cf6' }} />
    },
    {
      title: '₹10,000 Damage Insurance',
      desc: 'Any accidental home damage caused during service execution is fully covered up to ₹10,000 by ServeCircle insurance partners.',
      icon: <HiOutlineBuildingLibrary style={{ color: '#10b981' }} />
    },
    {
      title: '100% Satisfaction SLA',
      desc: 'Not satisfied with the service quality? We will dispatch another professional completely free or offer a full 100% refund.',
      icon: <HiOutlineShieldCheck style={{ color: '#3b82f6' }} />
    }
  ];

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.trustSafety')} 🛡️</h1>
          <p className="page-subtitle">Your safety is our absolute priority. Learn about our 5-tier verification process, caller-privacy protocols, and cash protection guarantees.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.7fr 1.3fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: 5-TIER VERIFICATION PROCESS & PROTECTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Background Check Verification Steps */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '8px' }}>
              The 5-Tier Background Check Process
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '24px' }}>
              Only <strong>1 out of 5 applicants</strong> makes it past our background screening checks. Click on the check tiers below to explore the details:
            </p>

            {/* Interactive Steps List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {verificationSteps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div 
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    style={{
                      padding: '16px',
                      background: isActive ? 'var(--gray-50)' : 'white',
                      border: isActive ? '1.5px solid var(--primary-400)' : '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <span style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isActive ? 'var(--gradient-primary)' : 'var(--gray-100)',
                        color: isActive ? 'white' : 'var(--gray-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </span>
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: isActive ? 'var(--primary-700)' : 'var(--navy-800)' }}>
                          {step.title}
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '3px' }}>
                          {step.desc}
                        </p>
                      </div>

                      <HiOutlineCheckCircle style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    </div>

                    {isActive && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--gray-200)', fontSize: '0.75rem', color: 'var(--gray-600)', lineHeight: 1.5, background: 'white', padding: '10px', borderRadius: '4px' }}>
                        📋 <strong>Implementation Detail:</strong> {step.details}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Protection SLA Guarantee */}
          <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px' }}>
              Three-Tier Protection Guarantee
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {protections.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.8rem', background: 'var(--gray-50)', padding: '10px', borderRadius: 'var(--radius-md)', display: 'inline-flex' }}>
                    {p.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--navy-800)' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '4px', lineHeight: 1.5 }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTEGRATED SOS DETAILS & IMMEDIATE HELPDESK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SOS Dispatch Emergency Panel */}
          <div 
            className="card animate-pulse" 
            style={{ 
              padding: '28px', 
              border: '1.5px solid #fca5a5', 
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              color: '#991b1b',
              textAlign: 'center'
            }}
          >
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#ef4444', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px',
              fontSize: '1.8rem',
              boxShadow: '0 0 0 8px rgba(239, 68, 68, 0.15)'
            }}>
              <HiOutlineExclamationTriangle />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '6px' }}>24/7 SOS Safety Dispatch</h3>
            <p style={{ fontSize: '0.8rem', lineHeight: 1.5, opacity: 0.9, margin: '0 10px 18px' }}>
              Are you experiencing a safety concern, standard emergency, or misbehavior during an active home service? Tap the SOS dispatch hotline immediately.
            </p>

            <button 
              className="btn" 
              style={{ background: '#ef4444', color: 'white', border: 'none', width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem' }}
              onClick={() => alert('🚨 SOS Alarm triggered! Your active coordinates have been dispatched to our nearby area manager and emergency safety contacts.')}
            >
              📞 SOS Emergency Callback
            </button>
            
            <span style={{ fontSize: '0.7rem', opacity: 0.8, display: 'inline-block', marginTop: '10px' }}>
              Immediate response guarantee: less than 60 seconds.
            </span>
          </div>

          {/* Helpdesk Support Panel */}
          <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '16px' }}>
              Need Help With a Booking?
            </h3>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '18px' }}>
              Our dedicated trust officers are available around the clock to support you with ongoing dispute resolutions or checking worker verification documents.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px', 
                  border: '1.5px solid var(--gray-200)', 
                  borderRadius: 'var(--radius-md)', 
                  cursor: 'pointer' 
                }}
                onClick={() => alert('Opening live chat with Trust Officer...')}
              >
                <HiOutlineChatBubbleLeftRight style={{ color: 'var(--primary-600)', fontSize: '1.25rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>Live Trust Chat</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '2px' }}>Average response: 2 mins</p>
                </div>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px', 
                  border: '1.5px solid var(--gray-200)', 
                  borderRadius: 'var(--radius-md)', 
                  cursor: 'pointer' 
                }}
                onClick={() => alert('Dialing safety hotline +91 1800 247 7233...')}
              >
                <HiOutlinePhone style={{ color: 'var(--primary-600)', fontSize: '1.25rem' }} />
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--navy-800)' }}>Safety Toll-Free Line</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '2px' }}>Dial: 1800-247-SAFE</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TrustSafety;
