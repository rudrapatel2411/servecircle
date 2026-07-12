import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  HiOutlineWrench, HiOutlineTruck, HiOutlineSparkles, HiOutlineStar, 
  HiOutlinePaintBrush, HiOutlineSun, HiOutlineBolt, HiOutlineBriefcase,
  HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineCheckCircle,
  HiOutlineHeart, HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineGlobeAlt,
  HiOutlineShieldCheck, HiOutlineClock, HiOutlineChatBubbleLeftRight
} from 'react-icons/hi2';
import './LandingPage.css';

const LandingPage = () => {
  const { t } = useTranslation();

  const categories = [
    { icon: <HiOutlineWrench />, key: 'homeRepairs', color: '#3b82f6' },
    { icon: <HiOutlineTruck />, key: 'vehicleServices', color: '#8b5cf6' },
    { icon: <HiOutlineSparkles />, key: 'cleaning', color: '#06b6d4' },
    { icon: <HiOutlineStar />, key: 'events', color: '#f59e0b' },
    { icon: <HiOutlinePaintBrush />, key: 'furniture', color: '#ec4899' },
    { icon: <HiOutlineSun />, key: 'garden', color: '#10b981' },
    { icon: <HiOutlineBolt />, key: 'emergency', color: '#ef4444' },
    { icon: <HiOutlineAcademicCap />, key: 'learningSupport', color: '#84cc16' },
  ];

  const plans = [
    {
      key: 'basic', price: t('pricing.free'), priceNum: null,
      features: ['Standard pricing', 'Basic support', 'Service history tracking'],
      color: 'var(--gray-500)',
    },
    {
      key: 'silver', price: '₹199', priceNum: 199,
      features: ['10% discount on all services', 'Priority booking slot', 'Dedicated helpline', '1 free consultation/month'],
      color: '#9ca3af',
    },
    {
      key: 'gold', price: '₹1499', priceNum: 1499, popular: true,
      features: ['20% discount on all services', 'Priority emergency response', 'Free quarterly AC/geyser check', 'Warranty tracker + reminders', '2 free video consultations/month'],
      color: '#f59e0b',
    },
    {
      key: 'platinum', price: '₹1999', priceNum: 1999,
      features: ['30% discount on all services', 'Dedicated personal manager', 'Unlimited consultations', 'Free annual home health audit', 'VIP emergency — 15 min response'],
      color: '#8b5cf6',
    },
  ];

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
        <div className="hero-bg-pattern" />
        <div className="hero-content container">
          <div className="hero-text">
            <span className="hero-badge animate-fade-in-up">{t('hero.badge')}</span>
            <h1 className="hero-title animate-fade-in-up stagger-1">
              {t('hero.title')} <br />
              <span className="hero-highlight">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up stagger-2">{t('hero.subtitle')}</p>
            <div className="hero-actions animate-fade-in-up stagger-3">
              <Link to="/customer" className="btn btn-primary btn-lg">{t('hero.cta')}</Link>
              <Link to="/worker" className="btn btn-outline btn-lg">{t('hero.ctaSecondary')}</Link>
            </div>
            <div className="hero-trust animate-fade-in-up stagger-4">
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
              <div key={i} className="stat-item animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
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
            {categories.map((cat, i) => (
              <div key={cat.key} className="category-card animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="category-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                  {cat.icon}
                </div>
                <h3 className="category-name">{t(`categories.${cat.key}`)}</h3>
                <p className="category-desc">{t(`categories.${cat.key}Desc`)}</p>
                <Link 
                  to={cat.key === 'emergency' ? '/customer/emergency' : cat.key === 'events' ? '/customer/events' : '/customer/services'} 
                  className="category-link"
                >
                  {t('common.bookNow')} →
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
            <div className="step-card animate-fade-in-up stagger-1">
              <div className="step-number">1</div>
              <div className="step-icon-wrap"><HiOutlineMagnifyingGlass /></div>
              <h3>{t('howItWorks.step1Title')}</h3>
              <p>{t('howItWorks.step1Desc')}</p>
            </div>
            <div className="step-connector">
              <div className="connector-line" />
              <div className="connector-arrow">→</div>
            </div>
            <div className="step-card animate-fade-in-up stagger-2">
              <div className="step-number">2</div>
              <div className="step-icon-wrap"><HiOutlineMapPin /></div>
              <h3>{t('howItWorks.step2Title')}</h3>
              <p>{t('howItWorks.step2Desc')}</p>
            </div>
            <div className="step-connector">
              <div className="connector-line" />
              <div className="connector-arrow">→</div>
            </div>
            <div className="step-card animate-fade-in-up stagger-3">
              <div className="step-number">3</div>
              <div className="step-icon-wrap"><HiOutlineCheckCircle /></div>
              <h3>{t('howItWorks.step3Title')}</h3>
              <p>{t('howItWorks.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="section" id="pricing">
        <div className="container">
          <h2 className="section-title">{t('pricing.title')}</h2>
          <p className="section-subtitle">{t('pricing.subtitle')}</p>
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div key={plan.key} className={`pricing-card ${plan.popular ? 'pricing-popular' : ''} animate-fade-in-up`} style={{ animationDelay: `${i * 0.1}s` }}>
                {plan.popular && <div className="popular-badge">{t('pricing.popular')}</div>}
                <div className="plan-header">
                  <h3 className="plan-name" style={{ color: plan.color }}>{t(`pricing.${plan.key}`)}</h3>
                  <div className="plan-price">
                    <span className="price-amount">{plan.price}</span>
                    {plan.priceNum && <span className="price-period">{t('pricing.month')}</span>}
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((f, j) => (
                    <li key={j}><HiOutlineCheckCircle className="check-icon" /> {f}</li>
                  ))}
                </ul>
                <button className="btn btn-primary plan-btn" style={plan.popular ? {} : { background: 'var(--gray-800)' }}>
                  {t('pricing.choosePlan')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL IMPACT ===== */}
      <section className="section impact-section" id="impact">
        <div className="container">
          <h2 className="section-title">{t('impact.title')}</h2>
          <p className="section-subtitle">{t('impact.subtitle')}</p>
          <div className="impact-grid">
            <Link to="/about/women-empowerment" className="impact-card animate-fade-in-up stagger-1" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="impact-icon" style={{ background: '#fce7f3', color: '#db2777' }}><HiOutlineHeart /></div>
              <h3>{t('impact.women')}</h3>
              <p>{t('impact.womenDesc')}</p>
            </Link>
            <Link to="/about/first-job" className="impact-card animate-fade-in-up stagger-2" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="impact-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><HiOutlineBriefcase /></div>
              <h3>{t('impact.firstJob')}</h3>
              <p>{t('impact.firstJobDesc')}</p>
            </Link>
            <Link to="/about/local-heroes" className="impact-card animate-fade-in-up stagger-3" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="impact-icon" style={{ background: '#fef3c7', color: '#d97706' }}><HiOutlineUserGroup /></div>
              <h3>{t('impact.localHero')}</h3>
              <p>{t('impact.localHeroDesc')}</p>
            </Link>
            <Link to="/about/ngo-partners" className="impact-card animate-fade-in-up stagger-4" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="impact-icon" style={{ background: '#d1fae5', color: '#059669' }}><HiOutlineGlobeAlt /></div>
              <h3>{t('impact.ngo')}</h3>
              <p>{t('impact.ngoDesc')}</p>
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
              <Link to="/worker" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>{t('hero.ctaSecondary')}</Link>
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
                <div style={{ width: '36px', height: '36px', background: 'var(--primary-600)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  <HiOutlineSparkles />
                </div>
                <span className="logo-text" style={{ color: 'white' }}>ServeCircle</span>
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
              <h4>{t('footer.company')}</h4>
              <a href="#">{t('footer.aboutUs')}</a>
              <a href="#">{t('footer.careers')}</a>
              <a href="#">{t('footer.blog')}</a>
            </div>
            <div className="footer-col">
              <h4>{t('footer.support')}</h4>
              <a href="#">{t('footer.helpCenter')}</a>
              <a href="#">{t('footer.terms')}</a>
              <a href="#">{t('footer.privacy')}</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
