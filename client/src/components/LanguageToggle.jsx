import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineGlobeAlt } from 'react-icons/hi2';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'gu', label: 'ગુજરાતી' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid var(--gray-200)', padding: '8px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontWeight: 600, color: 'var(--navy-800)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-400)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--gray-200)'}
      >
        <HiOutlineGlobeAlt size={20} color="var(--primary-600)" />
        {languages.find(l => l.code === i18n.language)?.label || 'EN'}
      </button>
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '8px', minWidth: '120px', zIndex: 50, animation: 'fadeInUp 0.2s ease-out' }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setIsOpen(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: i18n.language === lang.code ? 'var(--primary-50)' : 'transparent', color: i18n.language === lang.code ? 'var(--primary-700)' : 'var(--navy-700)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              onMouseOver={(e) => { if(i18n.language !== lang.code) e.currentTarget.style.background = 'var(--gray-50)'; }}
              onMouseOut={(e) => { if(i18n.language !== lang.code) e.currentTarget.style.background = 'transparent'; }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
