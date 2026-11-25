import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LanguageToggle from './LanguageToggle';
import ServeCircleLogo from './ServeCircleLogo';
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
        <Link to="/" className="navbar-logo" aria-label="ServeCircle Home" style={{ textDecoration: 'none' }}>
          <ServeCircleLogo size={36} showText={true} />
        </Link>

        {/* Smart & Clean: No cluttering home/services links */}

        <div className="navbar-actions">
          <LanguageToggle />
          <Link
            to="/register"
            className="btn btn-outline btn-sm navbar-create-btn"
            style={{
              borderRadius: '24px',
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: 'var(--sc-dark-accent, #1E40AF)',
              borderColor: 'var(--sc-surface-secondary, #E2E8F0)',
              background: 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: '24px',
              padding: '8px 22px',
              fontWeight: 700,
              fontSize: '0.875rem',
              background: 'var(--sc-primary-blue, #1E40AF)',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(30, 64, 175, 0.25)',
              textDecoration: 'none',
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
