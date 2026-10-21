import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiMenu, HiX } from 'react-icons/hi';
import LanguageToggle from './LanguageToggle';
import './Navbar.css';

const Navbar = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isLanding = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isLanding ? 'navbar-landing' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10" />
              <path d="M8 12h8" />
            </svg>
          </div>
          <span className="logo-text">ServeCircle</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'navbar-links-open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>{t('nav.home')}</Link>
          <a href="#services">{t('nav.services')}</a>
          <Link to="/customer/ai-chat" className={location.pathname === '/customer/ai-chat' ? 'active' : ''}>
            AI Assistant
          </Link>
          <a href="#pricing">{t('nav.pricing')}</a>
          <a href="#impact">{t('nav.about')}</a>
        </div>

        <div className="navbar-actions">
          <LanguageToggle />
          <Link to="/login" className="btn btn-outline btn-sm">{t('nav.login')}</Link>
          <Link to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</Link>
          <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
