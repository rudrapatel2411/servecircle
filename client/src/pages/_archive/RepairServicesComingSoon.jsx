import { Link } from 'react-router-dom';
import { HiOutlineWrench, HiOutlineArrowLeft, HiOutlineBell, HiOutlineEnvelope } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const repairTimeline = [
  { phase: 'Q1 2027', milestone: 'Electrician & Plumber Services', icon: '⚡', status: 'planned' },
  { phase: 'Q2 2027', milestone: 'Carpenter & Furniture Repair', icon: '🪚', status: 'planned' },
  { phase: 'Q3 2027', milestone: 'AC / Appliance Repair', icon: '❄️', status: 'planned' },
  { phase: 'Q4 2027', milestone: 'Full Home Repair Suite', icon: '🏠', status: 'planned' },
];

const RepairServicesComingSoon = () => {
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
          <div className="cs-hero-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
            <HiOutlineWrench />
          </div>
          <div className="cs-hero-pulse" style={{ background: 'rgba(59, 130, 246, 0.15)' }} />
        </div>

        <div className="cs-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
          🔧 Repair Services
        </div>

        <h1 className="cs-title">
          We're Building<br />
          <span style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Something Incredible
          </span>
        </h1>

        <p className="cs-subtitle">
          Our Repair Services vertical is currently being crafted with a network of 1,200+ background-verified technicians
          covering electrical, plumbing, carpentry, appliance repair, and much more.
        </p>

        {/* Progress bar */}
        <div className="cs-progress-wrap">
          <div className="cs-progress-header">
            <span className="cs-progress-label">Development Progress</span>
            <span className="cs-progress-pct" style={{ color: '#3b82f6' }}>68%</span>
          </div>
          <div className="cs-progress-bar">
            <div className="cs-progress-fill" style={{ width: '68%', background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="cs-timeline-section">
        <h2 className="cs-section-title">Launch Roadmap</h2>
        <div className="cs-timeline">
          {repairTimeline.map((item, i) => (
            <div key={i} className="cs-timeline-item">
              <div className="cs-timeline-dot" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                {item.icon}
              </div>
              {i < repairTimeline.length - 1 && <div className="cs-timeline-line" />}
              <div className="cs-timeline-content">
                <span className="cs-timeline-phase">{item.phase}</span>
                <span className="cs-timeline-milestone">{item.milestone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notify CTA */}
      <div className="cs-notify-card" style={{ borderColor: 'rgba(59, 130, 246, 0.2)', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
        <div className="cs-notify-icon" style={{ background: '#3b82f6' }}>
          <HiOutlineBell />
        </div>
        <div className="cs-notify-text">
          <h3>Get Notified at Launch</h3>
          <p>Be the first to access Repair Services when we go live in your area.</p>
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
        <p className="cs-alt-subtitle">While Repair Services gets ready, explore these live categories:</p>
        <div className="cs-alt-grid">
          {[
            { path: '/customer/travel-commute', emoji: '🚗', label: 'Travel & Commute', color: '#06b6d4' },
            { path: '/customer/food-kitchen', emoji: '🍽️', label: 'Food & Kitchen', color: '#3b7dc1' },
            { path: '/customer/pet-services', emoji: '🐾', label: 'Pet Services', color: '#ec4899' },
            { path: '/customer/health-wellness', emoji: '💊', label: 'Health & Wellness', color: '#f43f5e' },
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

export default RepairServicesComingSoon;
