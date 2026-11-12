import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineWrench, HiOutlineTruck, HiOutlineSparkles, HiOutlineStar,
  HiOutlinePaintBrush, HiOutlineSun, HiOutlineBolt, HiOutlineBriefcase,
  HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineCheckCircle,
  HiOutlineHeart, HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineGlobeAlt,
  HiOutlineShieldCheck, HiOutlineClock, HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRight, HiXMark, HiOutlineCreditCard,
} from 'react-icons/hi2';
import { getSession } from '../utils/authSession';
import './LandingPage.css';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const session = getSession();

  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedPreviewPlan, setSelectedPreviewPlan] = useState(null);

  const categories = [
    { icon: <HiOutlineWrench />, key: 'homeRepairs', color: '#1e40af' },
    { icon: <HiOutlineTruck />, key: 'vehicleServices', color: '#4338ca' },
    { icon: <HiOutlineSparkles />, key: 'cleaning', color: '#0e7490' },
    { icon: <HiOutlineStar />, key: 'events', color: '#b45309' },
    { icon: <HiOutlinePaintBrush />, key: 'furniture', color: '#be185d' },
    { icon: <HiOutlineSun />, key: 'garden', color: '#047857' },
    { icon: <HiOutlineBolt />, key: 'emergency', color: '#b91c1c' },
    { icon: <HiOutlineAcademicCap />, key: 'learningSupport', color: '#4d7c0f' },
  ];

  const plans = [
    {
      key: 'basic',
      name: 'Basic',
      monthlyPrice: 0,
      discountPct: 0,
      features: ['Standard pricing', 'Basic support', 'Service history tracking', 'AI smart fault diagnosis'],
      color: '#475569',
    },
    {
      key: 'silver',
      name: 'Silver',
      monthlyPrice: 199,
      discountPct: 10,
      features: ['10% discount on all services', 'Priority booking slot', 'Dedicated helpline', '1 free consultation/month'],
      color: '#0284c7',
    },
    {
      key: 'gold',
      name: 'Gold',
      monthlyPrice: 499,
      discountPct: 20,
      popular: true,
      features: ['20% discount on all services', 'Priority emergency response (30 min)', 'Free quarterly AC/geyser check', 'Warranty tracker + reminders', '2 free video consultations/month'],
      color: '#1e40af',
    },
    {
      key: 'platinum',
      name: 'Platinum',
      monthlyPrice: 999,
      discountPct: 30,
      features: ['30% discount on all services', 'Dedicated personal manager', 'Unlimited consultations', 'Free annual home health audit', 'VIP emergency — 15 min response'],
      color: '#4338ca',
    },
  ];

  const getDisplayPrice = (monthlyPrice) => {
    if (!monthlyPrice) return { text: t('pricing.free', 'FREE'), amount: 0, period: '' };
    if (billingCycle === 'yearly') {
      const yearlyTotal = Math.round(monthlyPrice * 12 * 0.8); // 20% off annual
      return { text: `₹${yearlyTotal.toLocaleString('en-IN')}`, amount: yearlyTotal, period: '/year' };
    }
    return { text: `₹${monthlyPrice}`, amount: monthlyPrice, period: t('pricing.month', '/month') };
  };

  const handleChoosePlan = (plan) => {
    if (session?.user?.role === 'customer') {
      navigate(`/customer/subscriptions?plan=${plan.key}&billing=${billingCycle}`);
      return;
    }
    setSelectedPreviewPlan(plan);
  };

  const handleProceedToCheckout = () => {
    if (!selectedPreviewPlan) return;
    const target = `/customer/subscriptions?plan=${selectedPreviewPlan.key}&billing=${billingCycle}`;
    if (session?.user?.role === 'customer') {
      navigate(target);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
    }
  };

  const stats = [
    { value: '8', label: t('stats.menus') },
    { value: '50+', label: t('stats.services') },
    { value: '15+', label: t('stats.jobTypes') },
    { value: '24/7', label: t('stats.emergency') },
    { value: '4', label: t('stats.plans') },
  ];

  return (
    <div className="landing">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-content container">
          <div className="hero-text">
            <span className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <HiOutlineGlobeAlt /> {t('hero.badge')}
            </span>
            <h1 className="hero-title">
              {t('hero.title')} <br />
              <span className="hero-highlight">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="hero-subtitle">{t('hero.subtitle')}</p>
            <div className="hero-actions">
              <Link to="/customer" className="btn btn-primary btn-lg">{t('hero.cta')}</Link>
              <Link to="/worker" className="btn btn-outline btn-lg">{t('hero.ctaSecondary')}</Link>
            </div>
            <div className="hero-trust">
              <div className="trust-item"><HiOutlineShieldCheck /> {t('landing.verifiedWorkers')}</div>
              <div className="trust-item"><HiOutlineClock /> {t('landing.response30Min')}</div>
              <div className="trust-item"><HiOutlineChatBubbleLeftRight /> {t('landing.support247')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <span className="stat-number">{stat.value}</span>
                <span className="stat-text">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section" id="services">
        <div className="container">
          <h2 className="section-title">{t('categories.title')}</h2>
          <p className="section-subtitle">{t('categories.subtitle')}</p>
          <div className="categories-grid">
            {categories.map((cat) => (
              <div key={cat.key} className="category-card">
                <div className="category-icon" style={{ background: '#f8fafc', color: cat.color }}>
                  {cat.icon}
                </div>
                <h3 className="category-name">{t(`categories.${cat.key}`)}</h3>
                <p className="category-desc">{t(`categories.${cat.key}Desc`)}</p>
                <Link
                  to={cat.key === 'emergency' ? '/customer/emergency' : cat.key === 'events' ? '/customer/events' : '/customer/services'}
                  className="category-link"
                >
                  {t('common.bookNow')} <HiOutlineArrowRight style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section how-it-works-section">
        <div className="container">
          <h2 className="section-title">{t('howItWorks.title')}</h2>
          <p className="section-subtitle">{t('howItWorks.subtitle')}</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon-wrap"><HiOutlineMagnifyingGlass /></div>
              <h3>{t('howItWorks.step1Title')}</h3>
              <p>{t('howItWorks.step1Desc')}</p>
            </div>
            <div className="step-connector">
              <div className="connector-arrow">→</div>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon-wrap"><HiOutlineMapPin /></div>
              <h3>{t('howItWorks.step2Title')}</h3>
              <p>{t('howItWorks.step2Desc')}</p>
            </div>
            <div className="step-connector">
              <div className="connector-arrow">→</div>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon-wrap"><HiOutlineCheckCircle /></div>
              <h3>{t('howItWorks.step3Title')}</h3>
              <p>{t('howItWorks.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING (Interactive Subscriptions) ===== */}
      <section className="section" id="pricing">
        <div className="container">
          <h2 className="section-title">{t('pricing.title')}</h2>
          <p className="section-subtitle">{t('pricing.subtitle')}</p>

          {/* Billing Cycle Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '5px', borderRadius: '14px', border: '1px solid #e2e8f0', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: billingCycle === 'monthly' ? 'white' : 'transparent',
                  color: billingCycle === 'monthly' ? '#0f172a' : '#64748b',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: billingCycle === 'yearly' ? '#2563eb' : 'transparent',
                  color: billingCycle === 'yearly' ? 'white' : '#64748b',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: billingCycle === 'yearly' ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                }}
              >
                Annual Billing
                <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 7px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 900 }}>
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => {
              const display = getDisplayPrice(plan.monthlyPrice);
              const isCurrent = session?.user?.subscription === plan.key;
              return (
                <div key={plan.key} className={`pricing-card ${plan.popular ? 'pricing-popular' : ''}`}>
                  {plan.popular && <div className="popular-badge">{t('pricing.popular')}</div>}
                  <div className="plan-header">
                    <h3 className="plan-name" style={{ color: plan.color }}>{t(`pricing.${plan.key}`, plan.name)}</h3>
                    <div className="plan-price">
                      <span className="price-amount">{display.text}</span>
                      {display.period && <span className="price-period">{display.period}</span>}
                    </div>
                    {billingCycle === 'yearly' && plan.monthlyPrice > 0 && (
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                        Save ₹{Math.round(plan.monthlyPrice * 12 * 0.2).toLocaleString('en-IN')}/year
                      </span>
                    )}
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((f, j) => (
                      <li key={j}><HiOutlineCheckCircle className="check-icon" /> {f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleChoosePlan(plan)}
                    className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} plan-btn`}
                  >
                    {isCurrent ? 'Manage Current Plan' : t('pricing.choosePlan', 'Choose Plan')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL IMPACT ===== */}
      <section className="section impact-section" id="impact">
        <div className="container">
          <h2 className="section-title">{t('impact.title')}</h2>
          <p className="section-subtitle">{t('impact.subtitle')}</p>
          <div className="impact-grid">
            <Link to="/about/women-empowerment" className="impact-card">
              <div className="impact-icon" style={{ background: '#fdf2f8', color: '#be185d' }}><HiOutlineHeart /></div>
              <h3>{t('impact.women')}</h3>
              <p>{t('impact.womenDesc')}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#be185d', marginTop: '10px' }}>
                Explore Initiative <HiOutlineArrowRight />
              </span>
            </Link>
            <Link to="/about/first-job" className="impact-card">
              <div className="impact-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}><HiOutlineBriefcase /></div>
              <h3>{t('impact.firstJob')}</h3>
              <p>{t('impact.firstJobDesc')}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', marginTop: '10px' }}>
                Explore Program <HiOutlineArrowRight />
              </span>
            </Link>
            <Link to="/about/local-heroes" className="impact-card">
              <div className="impact-icon" style={{ background: '#fffbeb', color: '#b45309' }}><HiOutlineUserGroup /></div>
              <h3>{t('impact.localHero')}</h3>
              <p>{t('impact.localHeroDesc')}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginTop: '10px' }}>
                Read Stories &amp; Nominate <HiOutlineArrowRight />
              </span>
            </Link>
            <Link to="/about/ngo-partners" className="impact-card">
              <div className="impact-icon" style={{ background: '#f0fdf4', color: '#15803d' }}><HiOutlineGlobeAlt /></div>
              <h3>{t('impact.ngo')}</h3>
              <p>{t('impact.ngoDesc')}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#15803d', marginTop: '10px' }}>
                View Partners &amp; Apply <HiOutlineArrowRight />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>{t('landing.readyToGetStarted')}</h2>
            <p>{t('hero.tagline')}</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">{t('nav.register')}</Link>
              <Link to="/worker" className="btn btn-outline btn-lg" style={{ background: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}>{t('hero.ctaSecondary')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="navbar-logo" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--primary-700)', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                  SC
                </div>
                <span className="logo-text" style={{ color: '#ffffff' }}>ServeCircle</span>
              </div>
              <p className="footer-tagline">{t('footer.tagline')}</p>
            </div>
            <div className="footer-col">
              <h4>{t('footer.services')}</h4>
              <a href="#services">{t('categories.homeRepairs')}</a>
              <a href="#services">{t('categories.vehicleServices')}</a>
              <a href="#services">{t('categories.cleaning')}</a>
              <a href="#services">{t('categories.events')}</a>
            </div>
            <div className="footer-col">
              <h4>Social Impact</h4>
              <Link to="/about/women-empowerment">{t('impact.women')}</Link>
              <Link to="/about/first-job">{t('impact.firstJob')}</Link>
              <Link to="/about/local-heroes">{t('impact.localHero')}</Link>
              <Link to="/about/ngo-partners">{t('impact.ngo')}</Link>
            </div>
            <div className="footer-col">
              <h4>{t('footer.support')}</h4>
              <Link to="/project-summary">Project Changelog</Link>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Create Account</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('footer.rights')}</p>
          </div>
        </div>
      </footer>

      {/* ===== PLAN ACTIVATION PREVIEW MODAL (FOR GUESTS / NON-CUSTOMERS) ===== */}
      {selectedPreviewPlan && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
          onClick={() => setSelectedPreviewPlan(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '28px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)', position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPreviewPlan(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none',
                borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#475569',
              }}
            >
              <HiXMark size={18} />
            </button>

            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ServeCircle Membership
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 8px' }}>
              {selectedPreviewPlan.name} Plan ({billingCycle === 'yearly' ? 'Annual' : 'Monthly'})
            </h3>

            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Membership Price:</span>
                <strong style={{ fontSize: '1.4rem', color: selectedPreviewPlan.color }}>
                  {getDisplayPrice(selectedPreviewPlan.monthlyPrice).text}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{getDisplayPrice(selectedPreviewPlan.monthlyPrice).period}</span>
                </strong>
              </div>
              {selectedPreviewPlan.discountPct > 0 && (
                <p style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, margin: '6px 0 0' }}>
                  ✓ Instant {selectedPreviewPlan.discountPct}% automatic discount on all future bookings!
                </p>
              )}
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
              {selectedPreviewPlan.features.map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiOutlineCheckCircle style={{ color: '#10b981', flexShrink: 0 }} /> {feat}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <HiOutlineCreditCard />
              Sign In as Customer &amp; Complete Checkout
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b', marginTop: '12px', marginBottom: 0 }}>
              New to ServeCircle? <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>Create Customer Account</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
