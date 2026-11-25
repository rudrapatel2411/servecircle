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
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { ServeCircleMark } from './ServeCircleLogo';
import './ServeCircleHeroVisual.css';

const PILLARS = {
  homes: {
    id: 'homes',
    title: 'Homes & Families',
    detail: '15-min emergency dispatch & upfront pricing across 110+ services',
  },
  societies: {
    id: 'societies',
    title: 'Gated Societies',
    detail: 'QR gate-pass security, RWA AMC & consolidated monthly billing',
  },
  workers: {
    id: 'workers',
    title: 'Verified Workers',
    detail: '0% commission on parts, fair pay & instant daily UPI payouts',
  },
};

export default function ServeCircleHeroVisual() {
  const [activePillar, setActivePillar] = useState('homes');
  const pillar = PILLARS[activePillar] || PILLARS.homes;

  return (
    <div className="sc-hero-visual-wrapper">
      <div className="sc-ambient-disc" />

      <div className="sc-grand-circle">
        {/* Clean Luminous SVG Orbital Rings */}
        <svg className="sc-svg-canvas" viewBox="0 0 400 400" aria-hidden="true">
          <defs>
            <linearGradient id="scOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4C86FF" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#1646D6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          <circle
            cx="200"
            cy="200"
            r="168"
            fill="none"
            stroke="url(#scOrbitGrad)"
            strokeWidth="2"
            strokeDasharray="10 8"
            className="sc-ring-spin"
          />
          <circle
            cx="200"
            cy="200"
            r="134"
            fill="none"
            stroke="rgba(22, 70, 214, 0.12)"
            strokeWidth="1.25"
          />
        </svg>

        {/* 3 Interactive Pillar Nodes */}
        <button
          type="button"
          className={`sc-orbit-pillar-node pillar-top ${activePillar === 'homes' ? 'is-active' : ''}`}
          onClick={() => setActivePillar('homes')}
          onMouseEnter={() => setActivePillar('homes')}
        >
          <span className="sc-pillar-icon-circle icon-homes">
            <HiOutlineHome size={16} />
          </span>
          <span className="sc-pillar-pill">Homes</span>
        </button>

        <button
          type="button"
          className={`sc-orbit-pillar-node pillar-right ${activePillar === 'societies' ? 'is-active' : ''}`}
          onClick={() => setActivePillar('societies')}
          onMouseEnter={() => setActivePillar('societies')}
        >
          <span className="sc-pillar-icon-circle icon-societies">
            <HiOutlineBuildingOffice2 size={16} />
          </span>
          <span className="sc-pillar-pill">Societies</span>
        </button>

        <button
          type="button"
          className={`sc-orbit-pillar-node pillar-left ${activePillar === 'workers' ? 'is-active' : ''}`}
          onClick={() => setActivePillar('workers')}
          onMouseEnter={() => setActivePillar('workers')}
        >
          <span className="sc-pillar-icon-circle icon-workers">
            <HiOutlineShieldCheck size={16} />
          </span>
          <span className="sc-pillar-pill">Workers</span>
        </button>

        {/* Center Sapphire Glass Hub */}
        <div className="sc-core-hub">
          <div className="sc-hub-logo-wrap">
            <ServeCircleMark size={38} />
          </div>
          <h3 className="sc-hub-brand">ServeCircle</h3>
          <div className="sc-hub-dynamic-pill">
            <span className="sc-hub-active-label">{pillar.title}</span>
            <span className="sc-hub-active-desc">{pillar.detail}</span>
          </div>
          <div className="sc-hub-live-badge">
            <span className="sc-hub-live-dot" />
            <span>110+ Services • 100% Verified</span>
          </div>
        </div>
      </div>

      {/* 4 Clean Floating Frosted Service Chips */}
      <Link to="/customer/general-services/repair-services" className="sc-art-badge art-top-left">
        <span className="sc-art-icon-circle art-icon-wrench"><HiOutlineWrench size={16} /></span>
        <span className="sc-art-text">
          <strong className="sc-art-title">AC & Home Repair</strong>
          <span className="sc-art-sub">From ₹499</span>
        </span>
      </Link>

      <Link to="/customer/food-kitchen" className="sc-art-badge art-top-right">
        <span className="sc-art-icon-circle art-icon-chef"><HiOutlineSparkles size={16} /></span>
        <span className="sc-art-text">
          <strong className="sc-art-title">Home Chef & BBQ</strong>
          <span className="sc-art-sub">Live Party Setup</span>
        </span>
      </Link>

      <Link to="/customer/travel-commute" className="sc-art-badge art-mid-left">
        <span className="sc-art-icon-circle art-icon-cab"><HiOutlineTruck size={16} /></span>
        <span className="sc-art-text">
          <strong className="sc-art-title">Cab & Commute</strong>
          <span className="sc-art-sub">Airport & School</span>
        </span>
      </Link>

      <Link to="/customer/pet-services" className="sc-art-badge art-mid-right">
        <span className="sc-art-icon-circle art-icon-pet"><HiOutlineHeart size={16} /></span>
        <span className="sc-art-text">
          <strong className="sc-art-title">Pet & Health Care</strong>
          <span className="sc-art-sub">At Your Doorstep</span>
        </span>
      </Link>

      <div className="sc-art-bottom-pill">
        <HiOutlineCheckBadge className="sc-pill-badge-icon" />
        <span>One Circle Uniting <strong>Homes</strong>, <strong>Workers</strong> & <strong>Societies</strong></span>
      </div>
    </div>
  );
}
