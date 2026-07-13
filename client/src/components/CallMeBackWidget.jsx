import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlinePhone, HiOutlineXMark } from 'react-icons/hi2';

const CallMeBackWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [isRequested, setIsRequested] = useState(() => {
    return localStorage.getItem('callRequested') === 'true';
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert(t('callMeBack.invalidPhone', 'Please enter a valid 10-digit mobile number!'));
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      alert(t('callMeBack.successCallbackAlert', '🎉 Call request received! Our support agent is dialing your number right now.'));
      setIsOpen(false);
      setIsRequested(true);
      localStorage.setItem('callRequested', 'true');
    }, 1000);
  };

  if (isRequested) return null;

  return (
    <>
      {/* Floating Button with HSL pulse animation */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Glow rings */}
        <span style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px solid #10b981',
          animation: 'ping 1.5s infinite',
          opacity: 0.6
        }} />
        <HiOutlinePhone style={{ fontSize: '1.6rem' }} />
      </div>

      {/* Overlay Modal */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            width: '90%',
            maxWidth: '400px',
            padding: '28px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--gray-200)',
            color: 'var(--navy-900)'
          }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--gray-100)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--gray-600)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--gray-200)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--gray-100)'}
            >
              <HiOutlineXMark />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 16px'
              }}>
                <HiOutlinePhone />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-800)', margin: 0 }}>
                {t('callMeBack.callMeBackTitle', 'Need Help Booking?')}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginTop: '8px', lineHeight: 1.4 }}>
                {t('callMeBack.callMeBackDesc', 'Enter your phone number and our representative will call you in 10 seconds!')}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="tel"
                placeholder={t('callMeBack.phoneNumberPlaceholder', 'Enter 10-digit mobile number')}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--gray-300)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: 'var(--navy-800)',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = 'var(--gray-300)'}
              />

              <button
                type="submit"
                disabled={submitted}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                {submitted ? t('common.loading', 'Requesting...') : t('callMeBack.requestCallbackButton', 'Request Call Back 📞')}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px dashed var(--gray-200)', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', margin: 0 }}>
                {t('callMeBack.callSupportDirect', 'Or call us directly at 1800-419-3232 (Toll Free)')}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallMeBackWidget;
