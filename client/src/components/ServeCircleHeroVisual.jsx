import React, { useState } from 'react';
import {
  HiOutlineWrench,
  HiOutlineTruck,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineHome,
  HiOutlineBuildingOffice2,
  HiOutlineHeart,
  HiOutlineCheckBadge,
  HiOutlineArrowPath,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import './ServeCircleHeroVisual.css';

const PILLARS = {
  homes: {
    id: 'homes',
    title: 'Homes & Families',
    tagline: '110+ Everyday Services',
    detail: '15-min emergency dispatch with upfront transparent pricing',
    badge: '1-Tap Booking',
    badgeColor: '#536D57',
  },
  societies: {
    title: 'Gated Societies',
    tagline: 'Safe Living & AMC',
    detail: 'QR-verified entry, gate-pass security & transparent RWA AMC',
    badge: 'Verified Entry',
    badgeColor: '#966B32',
  },
  workers: {
    title: 'Verified Workers',
    tagline: 'Dignity & Fair Pay',
    detail: '0% platform cut on parts/tolls, insurance & instant UPI daily cashout',
    badge: 'Zero Commission',
    badgeColor: '#2E7D32',
  },
};

export default function ServeCircleHeroVisual() {
  const [activePillar, setActivePillar] = useState('homes');
  const [hoveredBadge, setHoveredBadge] = useState(null);

  const pillar = PILLARS[activePillar] || PILLARS.homes;

  return (
    <div className="sc-hero-visual-wrapper">
      {/* Background Ambient Glow */}
      <div className="sc-ambient-disc" />

      {/* Main Circular Ecosystem Canvas */}
      <div className="sc-grand-circle">
        {/* SVG Orbit Tracks & Animated Flow */}
        <svg className="sc-svg-canvas" viewBox="0 0 400 400">
          <defs>
            <radialGradient id="scBaseGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#FAF7F2" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#EDE6D8" stopOpacity="0.8" />
            </radialGradient>
            <linearGradient id="scTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#536D57" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#966B32" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#29271F" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Base Background Disc */}
          <circle cx="200" cy="200" r="190" fill="url(#scBaseGrad)" stroke="#E8E0D2" strokeWidth="1.5" />
          
          {/* Outer Dashed Orbit Ring */}
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke="url(#scTrackGrad)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="sc-ring-spin"
          />

          {/* Inner Guidance Track */}
          <circle cx="200" cy="200" r="110" fill="none" stroke="#DCD8D1" strokeWidth="1" strokeDasharray="3 4" />

          {/* Animated Flow Particles Traveling along the Ring */}
          <circle cx="200" cy="50" r="4.5" fill="#536D57" className="sc-particle" />
          <circle cx="330" cy="275" r="4.5" fill="#966B32" className="sc-particle" />
          <circle cx="70" cy="275" r="4.5" fill="#29271F" className="sc-particle" />
        </svg>

        {/* 3 Circular Ecosystem Nodes on the Ring (The 3 Pillars of ServeCircle) */}
        
        {/* Node 1: Top (Homes) */}
        <button
          type="button"
          className={`sc-orbit-pillar-node pillar-top ${activePillar === 'homes' ? 'is-active' : ''}`}
          onClick={() => setActivePillar('homes')}
          onMouseEnter={() => setActivePillar('homes')}
          title="Homes & Families"
        >
          <div className="sc-pillar-icon-circle icon-homes">
            <HiOutlineHome size={18} />
          </div>
          <span className="sc-pillar-pill">Homes</span>
        </button>

        {/* Node 2: Bottom-Right (Societies) */}
        <button
          type="button"
          className={`sc-orbit-pillar-node pillar-right ${activePillar === 'societies' ? 'is-active' : ''}`}
          onClick={() => setActivePillar('societies')}
          onMouseEnter={() => setActivePillar('societies')}
          title="Gated Societies"
        >
          <div className="sc-pillar-icon-circle icon-societies">
            <HiOutlineBuildingOffice2 size={18} />
          </div>
          <span className="sc-pillar-pill">Societies</span>
        </button>

        {/* Node 3: Bottom-Left (Workers) */}
        <button
          type="button"
          className={`sc-orbit-pillar-node pillar-left ${activePillar === 'workers' ? 'is-active' : ''}`}
          onClick={() => setActivePillar('workers')}
          onMouseEnter={() => setActivePillar('workers')}
          title="Verified Workers"
        >
          <div className="sc-pillar-icon-circle icon-workers">
            <HiOutlineShieldCheck size={18} />
          </div>
          <span className="sc-pillar-pill">Workers</span>
        </button>

        {/* Central Core Medallion (The Heart of ServeCircle) */}
        <div className="sc-core-hub">
          {/* Logo Mark */}
          <div className="sc-hub-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10" />
              <path d="M8 12h8" />
            </svg>
          </div>

          <h3 className="sc-hub-brand">ServeCircle</h3>
          <span className="sc-hub-tagline">The Trusted Circle</span>

          {/* Active Pillar Showcase Inside the Core */}
          <div className="sc-hub-dynamic-pill">
            <span className="sc-hub-active-label">{pillar.title}</span>
            <span className="sc-hub-active-desc">{pillar.detail}</span>
          </div>

          {/* Live Status Pill */}
          <div className="sc-hub-live-badge">
            <span className="sc-hub-live-dot" />
            <span>110+ Services • 100% Verified</span>
          </div>
        </div>
      </div>

      {/* ===== 4 ARTBOARD-MATCHING FLOATING SERVICE BADGES ===== */}

      {/* Badge 1: Top-Left (AC Repair) */}
      <Link
        to="/customer/general-services/repair-services"
        className={`sc-art-badge art-top-left ${hoveredBadge === 'ac' ? 'is-hover' : ''}`}
        onMouseEnter={() => setHoveredBadge('ac')}
        onMouseLeave={() => setHoveredBadge(null)}
      >
        <div className="sc-art-icon-circle art-icon-wrench">
          <HiOutlineWrench size={16} />
        </div>
        <div className="sc-art-text">
          <strong className="sc-art-title">AC Repair</strong>
          <span className="sc-art-sub">₹499 onwards</span>
        </div>
      </Link>

      {/* Badge 2: Top-Right (Party Chef & Tiffin) */}
      <Link
        to="/customer/food-kitchen"
        className={`sc-art-badge art-top-right ${hoveredBadge === 'chef' ? 'is-hover' : ''}`}
        onMouseEnter={() => setHoveredBadge('chef')}
        onMouseLeave={() => setHoveredBadge(null)}
      >
        <div className="sc-art-icon-circle art-icon-chef">
          <HiOutlineSparkles size={16} />
        </div>
        <div className="sc-art-text">
          <strong className="sc-art-title">Party Chef</strong>
          <span className="sc-art-sub">& Tiffin Service</span>
        </div>
      </Link>

      {/* Badge 3: Middle/Bottom-Left (Cab Booking) */}
      <Link
        to="/customer/travel-commute"
        className={`sc-art-badge art-mid-left ${hoveredBadge === 'cab' ? 'is-hover' : ''}`}
        onMouseEnter={() => setHoveredBadge('cab')}
        onMouseLeave={() => setHoveredBadge(null)}
      >
        <div className="sc-art-icon-circle art-icon-cab">
          <HiOutlineTruck size={16} />
        </div>
        <div className="sc-art-text">
          <strong className="sc-art-title">Cab Booking</strong>
          <span className="sc-art-sub">in minutes</span>
        </div>
      </Link>

      {/* Badge 4: Middle/Bottom-Right (Pet Care & More) */}
      <Link
        to="/customer/pet-care"
        className={`sc-art-badge art-mid-right ${hoveredBadge === 'pet' ? 'is-hover' : ''}`}
        onMouseEnter={() => setHoveredBadge('pet')}
        onMouseLeave={() => setHoveredBadge(null)}
      >
        <div className="sc-art-icon-circle art-icon-pet">
          <HiOutlineHeart size={16} />
        </div>
        <div className="sc-art-text">
          <strong className="sc-art-title">Pet Care</strong>
          <span className="sc-art-sub">& More Services</span>
        </div>
      </Link>

      {/* Bottom Floating Pill */}
      <div className="sc-art-bottom-pill">
        <HiOutlineCheckBadge className="sc-pill-badge-icon" />
        <span>One Circle Uniting <strong>Homes</strong>, <strong>Workers</strong> & <strong>Societies</strong></span>
      </div>
    </div>
  );
}
