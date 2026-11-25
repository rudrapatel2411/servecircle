import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineWrench,
  HiOutlineMap,
  HiOutlineBuildingOffice2,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineCheckBadge,
} from 'react-icons/hi2';
import {
  GlassCard,
  PrimaryButton,
  StatusPill,
  IconTile,
  GlassButton
} from '../../components/ui';
import '../Dashboard.css';
import './CustomerPages.css';
import { generalServicesData as categories } from '../../data/generalServicesData';

const GeneralServicesPage = () => {
  return (
    <div className="page-content gs-page" style={{ minHeight: '92vh', maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '8px 4px 32px' }}>
      {/* ===== CATEGORY GRID ===== */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
            Browse Categories
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink2)', margin: '4px 0 0 0' }}>
            Select a category to explore available services
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '22px' }}>
          {categories.map((cat) => (
            cat.comingSoon ? (
              <GlassCard
                key={cat.id}
                clickable={false}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: '26px',
                  opacity: 0.75,
                  padding: 0
                }}
              >
                <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden' }}>
                  <img src={cat.image} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    <StatusPill status="pending">Coming Soon</StatusPill>
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: '0 0 6px 0' }}>
                      {cat.label}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45, margin: 0 }}>
                      {cat.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                      {cat.services.map((s, i) => (
                        <span key={i} className="pill s-slate" style={{ fontSize: '0.72rem' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(22, 70, 214, 0.08)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink3)' }}>We're working on this! Stay tuned.</span>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <Link
                key={cat.id}
                to={cat.path}
                className="glass is-clickable"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  borderRadius: '26px',
                  height: '100%'
                }}
              >
                <div style={{ position: 'relative', height: '170px', width: '100%', overflow: 'hidden' }}>
                  <img src={cat.image} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    <StatusPill status="confirmed">Live</StatusPill>
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: '0 0 6px 0' }}>
                      {cat.label}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.45, margin: 0 }}>
                      {cat.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                      {cat.services.map((s, i) => (
                        <span key={i} className="pill s-slate" style={{ fontSize: '0.72rem' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(22, 70, 214, 0.08)' }}>
                    <span style={{ color: 'var(--blue)', fontWeight: 600, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Explore Category <HiOutlineArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>

      {/* ===== BOTTOM CTA ===== */}
      <GlassCard style={{
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        borderRadius: '26px'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: '0 0 6px 0' }}>
            Can't find what you need?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink2)', margin: 0 }}>
            Use our AI Concierge to describe your problem and we'll route you to the right expert instantly.
          </p>
        </div>
        <Link to="/customer/services" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px', fontSize: '0.92rem' }}>
          Try AI Concierge Search
        </Link>
      </GlassCard>
    </div>
  );
};

export default GeneralServicesPage;
