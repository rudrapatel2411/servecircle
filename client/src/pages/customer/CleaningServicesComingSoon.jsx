import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineArrowLeft, HiOutlineBell, HiOutlineEnvelope } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const cleaningTimeline = [
  { phase: 'Q2 2027', milestone: 'Deep Home Cleaning', icon: '🏠', status: 'planned' },
  { phase: 'Q3 2027', milestone: 'Sofa & Carpet Cleaning', icon: '🛋️', status: 'planned' },
  { phase: 'Q3 2027', milestone: 'Water Tank & Pest Control', icon: '🚿', status: 'planned' },
  { phase: 'Q4 2027', milestone: 'Full Hygiene Management Suite', icon: '✨', status: 'planned' },
];

const CleaningServicesComingSoon = () => {
  return (
    <div className="page-content cs-page" style={{ minHeight: '92vh' }}>

      {/* Back */}
      <Link
        to="/customer/general-services"
        className="cs-back-btn"
      >
        <HiOutlineArrowLeft />
        Back to General Services
      </Link>

      {/* Hero */}
      <div className="cs-hero">
        <div className="cs-hero-icon-wrap">
          <div className="cs-hero-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
            <HiOutlineSparkles />
          </div>
          <div className="cs-hero-pulse" style={{ background: 'rgba(139, 92, 246, 0.15)' }} />
        </div>

        <div className="cs-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed' }}>
          ✨ Cleaning Services
        </div>

        <h1 className="cs-title">
          Spotless Homes,<br />
          <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Coming Soon
          </span>
        </h1>

        <p className="cs-subtitle">
          Our Cleaning Services vertical is being built with an eco-friendly, chemical-safe approach —
          featuring trained hygiene specialists for deep cleaning, sofa cleaning, water tank sanitization, and more.
        </p>

        {/* Progress bar */}
        <div className="cs-progress-wrap">
          <div className="cs-progress-header">
            <span className="cs-progress-label">Development Progress</span>
            <span className="cs-progress-pct" style={{ color: '#8b5cf6' }}>45%</span>
          </div>
          <div className="cs-progress-bar">
            <div className="cs-progress-fill" style={{ width: '45%', background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="cs-timeline-section">
        <h2 className="cs-section-title">Launch Roadmap</h2>
        <div className="cs-timeline">
          {cleaningTimeline.map((item, i) => (
            <div key={i} className="cs-timeline-item">
              <div className="cs-timeline-dot" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                {item.icon}
              </div>
              {i < cleaningTimeline.length - 1 && <div className="cs-timeline-line" />}
              <div className="cs-timeline-content">
                <span className="cs-timeline-phase">{item.phase}</span>
                <span className="cs-timeline-milestone">{item.milestone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notify CTA */}
      <div className="cs-notify-card" style={{ borderColor: 'rgba(139, 92, 246, 0.2)', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' }}>
        <div className="cs-notify-icon" style={{ background: '#8b5cf6' }}>
          <HiOutlineBell />
        </div>
        <div className="cs-notify-text">
          <h3>Get Notified at Launch</h3>
          <p>Be the first to book an eco-friendly deep clean when we go live in your city.</p>
        </div>
        <div className="cs-notify-form">
          <input
            type="email"
            placeholder="your@email.com"
            className="cs-notify-input"
          />
          <button className="btn btn-primary" style={{ textTransform: 'none', padding: '10px 20px', fontSize: '0.875rem' }}>
            <HiOutlineEnvelope />
            Notify Me
          </button>
        </div>
      </div>

      {/* Available Now */}
      <div className="cs-alt-section">
        <h3 className="cs-alt-title">Available Right Now</h3>
        <p className="cs-alt-subtitle">While Cleaning Services gets ready, explore these live categories:</p>
        <div className="cs-alt-grid">
          {[
            { path: '/customer/health-wellness', emoji: '💊', label: 'Health & Wellness', color: '#f43f5e' },
            { path: '/customer/food-kitchen', emoji: '🍽️', label: 'Food & Kitchen', color: '#10b981' },
            { path: '/customer/pet-services', emoji: '🐾', label: 'Pet Services', color: '#ec4899' },
            { path: '/customer/society-management', emoji: '🏘️', label: 'Society Management', color: '#84cc16' },
          ].map((alt) => (
            <Link key={alt.path} to={alt.path} className="cs-alt-card">
              <span className="cs-alt-emoji">{alt.emoji}</span>
              <span className="cs-alt-label" style={{ color: alt.color }}>{alt.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CleaningServicesComingSoon;
