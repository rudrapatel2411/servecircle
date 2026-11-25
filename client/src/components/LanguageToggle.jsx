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
        className="glass-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '999px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          color: 'var(--ink)',
          border: '1px solid var(--glass-edge)',
        }}
      >
        <HiOutlineGlobeAlt size={18} color="var(--blue)" />
        {languages.find(l => l.code === i18n.language)?.label || 'EN'}
      </button>
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: '#ffffff',
            border: '1px solid rgba(22, 70, 214, 0.14)',
            boxShadow: '0 16px 48px rgba(11, 30, 79, 0.16)',
            borderRadius: '20px',
            padding: '8px',
            minWidth: '140px',
            zIndex: 1200,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                localStorage.setItem('servecircle_language', lang.code);
                setIsOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 14px',
                background: i18n.language === lang.code ? 'rgba(22, 70, 214, 0.12)' : 'transparent',
                color: i18n.language === lang.code ? 'var(--blue)' : 'var(--ink)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={(e) => { if(i18n.language !== lang.code) e.currentTarget.style.background = 'rgba(22, 70, 214, 0.06)'; }}
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
