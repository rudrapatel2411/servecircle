import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiMenu, HiX, HiOutlineSparkles } from 'react-icons/hi';
import LanguageToggle from './LanguageToggle';
import './Navbar.css';

const Navbar = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
        <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary-600)', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
            <HiOutlineSparkles />
          </div>
          <span className="logo-text">ServeCircle</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'navbar-links-open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>{t('nav.home')}</Link>
          <a href="#services">{t('nav.services')}</a>
          <a href="#pricing">{t('nav.pricing')}</a>
          <a href="#impact">{t('nav.about')}</a>
        </div>

        <div className="navbar-actions">
          <LanguageToggle />
          <Link to="/login" className="btn btn-outline btn-sm">{t('nav.login')}</Link>
          <Link to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</Link>
          <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
