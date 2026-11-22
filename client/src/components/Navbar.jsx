import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLanding = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isLanding ? 'navbar-landing' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo" aria-label="ServeCircle Home">
          <div className="navbar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10" />
              <path d="M8 12h8" />
            </svg>
          </div>
          <span className="logo-text">ServeCircle</span>
        </Link>

        {/* Smart & Clean: No cluttering home/services links */}

        <div className="navbar-actions">
          <LanguageToggle />
          <Link
            to="/login"
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: '24px',
              padding: '8px 22px',
              fontWeight: 700,
              fontSize: '0.875rem',
              background: 'var(--sc-dark-accent, #29271F)',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(41, 39, 31, 0.16)',
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
