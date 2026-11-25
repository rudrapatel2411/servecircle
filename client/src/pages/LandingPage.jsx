import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineHome,
  HiOutlineShieldCheck,
  HiOutlineBuildingOffice2,
  HiOutlineWrench,
  HiOutlineTruck,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineCube,
} from 'react-icons/hi2';
import ServeCircleLogo, { ServeCircleMark } from '../components/ServeCircleLogo';
import './LandingPage.css';

const NODES = {
  homes: {
    title: 'Homes & Families',
    role: 'Book 110+ services with upfront prices & live OTP tracking.',
    path: '/customer/services',
    cta: 'Book a Service',
  },
  workers: {
    title: 'Verified Workers',
    role: 'Get direct jobs, 0% cut on parts & instant daily UPI payouts.',
    path: '/worker',
    cta: 'Partner Portal',
  },
  societies: {
    title: 'Gated Societies',
    role: 'Approve crews with 4-digit Gate PINs & one monthly GST bill.',
    path: '/b2b',
    cta: 'Society Portal',
  },
};

const HUBS = [
  { label: 'Home Repairs', sub: 'From ₹199', icon: <HiOutlineWrench />, path: '/customer/general-services/repair-services' },
  { label: 'Travel & Cab', sub: 'Airport & School', icon: <HiOutlineTruck />, path: '/customer/travel-commute' },
  { label: 'Food & Chef', sub: 'Party & Tiffin', icon: <HiOutlineSparkles />, path: '/customer/food-kitchen' },
  { label: 'Pet Care', sub: 'Spa & Home Vet', icon: <HiOutlineHeart />, path: '/customer/pet-services' },
  { label: 'Packers & Movers', sub: 'Safe Transit', icon: <HiOutlineCube />, path: '/customer/relocation' },
  { label: 'Society Ops', sub: 'RWA & AMC', icon: <HiOutlineBuildingOffice2 />, path: '/b2b' },
];

const LandingPage = () => {
  const [activeNode, setActiveNode] = useState('homes');
  const current = NODES[activeNode];

  return (
    <div className="lp-root">
      {/* ===== CLEAN EDITORIAL HERO ===== */}
      <section className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-copy">
            <span className="lp-kicker">ServeCircle Ecosystem</span>
            <h1 className="lp-h1">
              One circle connecting homes, workers &amp; societies.
            </h1>
            <p className="lp-lead">
              Book verified doorstep services with upfront pricing, give local pros fair instant payouts, and keep gated communities secure.
            </p>
            <div className="lp-actions">
              <Link to="/customer/services" className="lp-btn-primary">
                Explore Services <HiOutlineArrowRight />
              </Link>
              <Link to="/worker" className="lp-btn-ghost">
                Join as a Partner
              </Link>
            </div>
          </div>

          {/* Light Visual Relationship Graphic */}
          <div className="lp-diagram-wrap">
            <div className="lp-diagram-card">
              <svg className="lp-flow-svg" viewBox="0 0 420 300" fill="none" aria-hidden="true">
                {/* Connection paths from center SC hub (210, 128) to 3 nodes */}
                <path
                  d="M210 128 C145 128, 105 90, 82 58"
                  className={`lp-flow-path ${activeNode === 'homes' ? 'is-active' : ''}`}
                />
                <path
                  d="M210 128 C275 128, 315 90, 338 58"
                  className={`lp-flow-path ${activeNode === 'workers' ? 'is-active' : ''}`}
                />
                <path
                  d="M210 128 L210 228"
                  className={`lp-flow-path ${activeNode === 'societies' ? 'is-active' : ''}`}
                />
                {/* Subtle outer ring connecting all 3 */}
                <circle
                  cx="210"
                  cy="132"
                  r="116"
                  stroke="rgba(22, 70, 214, 0.1)"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
              </svg>

              {/* Top-Left Node: Homes */}
              <button
                type="button"
                className={`lp-node lp-node-homes ${activeNode === 'homes' ? 'is-active' : ''}`}
                onClick={() => setActiveNode('homes')}
                onMouseEnter={() => setActiveNode('homes')}
              >
                <span className="lp-node-ico ico-blue"><HiOutlineHome /></span>
                <span className="lp-node-text">
                  <strong>Homes</strong>
                  <small>Book &amp; Track</small>
                </span>
              </button>

              {/* Top-Right Node: Workers */}
              <button
                type="button"
                className={`lp-node lp-node-workers ${activeNode === 'workers' ? 'is-active' : ''}`}
                onClick={() => setActiveNode('workers')}
                onMouseEnter={() => setActiveNode('workers')}
              >
                <span className="lp-node-ico ico-green"><HiOutlineShieldCheck /></span>
                <span className="lp-node-text">
                  <strong>Workers</strong>
                  <small>Fair UPI Pay</small>
                </span>
              </button>

              {/* Center Hub: SC */}
              <div className="lp-center-sc" title="ServeCircle Platform">
                <ServeCircleMark size={48} />
              </div>

              {/* Bottom Node: Societies */}
              <button
                type="button"
                className={`lp-node lp-node-societies ${activeNode === 'societies' ? 'is-active' : ''}`}
                onClick={() => setActiveNode('societies')}
                onMouseEnter={() => setActiveNode('societies')}
              >
                <span className="lp-node-ico ico-amber"><HiOutlineBuildingOffice2 /></span>
                <span className="lp-node-text">
                  <strong>Societies</strong>
                  <small>Gate PIN &amp; AMC</small>
                </span>
              </button>

              {/* Active Relationship Caption */}
              <div className="lp-diagram-caption">
                <div>
                  <strong>{current.title}</strong>
                  <p>{current.role}</p>
                </div>
                <Link to={current.path} className="lp-caption-link">
                  {current.cta} <HiOutlineArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW THE CIRCLE CONNECTS (LIGHT & MINIMAL) ===== */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <h2>How the circle works</h2>
            <p>Every booking flows cleanly between customer, pro, and society.</p>
          </div>
          <div className="lp-flow-strip">
            <div className="lp-flow-step">
              <span className="lp-step-num">01</span>
              <h3>Customer books</h3>
              <p>Pick a service with upfront pricing and get a doorstep Start OTP.</p>
            </div>
            <div className="lp-flow-arrow" aria-hidden="true"><HiOutlineArrowRight /></div>
            <div className="lp-flow-step">
              <span className="lp-step-num">02</span>
              <h3>Society approves</h3>
              <p>Verified pro enters smoothly using a 4-digit Security Gate PIN.</p>
            </div>
            <div className="lp-flow-arrow" aria-hidden="true"><HiOutlineArrowRight /></div>
            <div className="lp-flow-step">
              <span className="lp-step-num">03</span>
              <h3>Worker gets paid</h3>
              <p>Job closes with OTP &amp; worker receives instant UPI payout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE SERVICE HUBS ===== */}
      <section className="lp-section" id="services">
        <div className="lp-container">
          <div className="lp-section-head lp-head-row">
            <div>
              <h2>Popular service hubs</h2>
              <p>110+ services across 19 everyday categories.</p>
            </div>
            <Link to="/customer/services" className="lp-text-link">
              View all services <HiOutlineArrowRight />
            </Link>
          </div>
          <div className="lp-hubs-grid">
            {HUBS.map((hub) => (
              <Link key={hub.label} to={hub.path} className="lp-hub-tile">
                <span className="lp-hub-ico">{hub.icon}</span>
                <div>
                  <strong>{hub.label}</strong>
                  <span>{hub.sub}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIGHT MINIMAL FOOTER ===== */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <ServeCircleLogo size={32} showText={true} light={false} />
          <div className="lp-footer-links">
            <Link to="/customer/services">Services</Link>
            <Link to="/worker">For Workers</Link>
            <Link to="/b2b">For Societies</Link>
            <Link to="/about">About</Link>
            <Link to="/customer/trust-safety">Trust &amp; Safety</Link>
          </div>
          <span className="lp-footer-copy">© 2026 ServeCircle</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
