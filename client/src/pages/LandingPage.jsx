import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
 HiOutlineWrench, HiOutlineTruck, HiOutlineSparkles, HiOutlineStar, 
 HiOutlinePaintBrush, HiOutlineSun, HiOutlineBolt, HiOutlineBriefcase,
 HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineCheckCircle,
 HiOutlineHeart, HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineGlobeAlt,
 HiOutlineShieldCheck, HiOutlineClock, HiOutlineChatBubbleLeftRight,
 HiOutlineArrowRight, HiOutlineCurrencyRupee, HiOutlineCube, HiOutlineBuildingOffice2,
 HiOutlineHome
} from 'react-icons/hi2';
import ServeCircleHeroVisual from '../components/ServeCircleHeroVisual';
import './LandingPage.css';

const LandingPage = () => {
 const { t } = useTranslation();

 const categories = [
 { icon: <HiOutlineWrench />, key: 'homeRepairs', color: '#536D57' },
 { icon: <HiOutlineTruck />, key: 'vehicleServices', color: '#364335' },
 { icon: <HiOutlineSparkles />, key: 'cleaning', color: '#536D57' },
 { icon: <HiOutlineStar />, key: 'events', color: '#1E40AF' },
 { icon: <HiOutlinePaintBrush />, key: 'furniture', color: '#536D57' },
 { icon: <HiOutlineSun />, key: 'garden', color: '#364335' },
 { icon: <HiOutlineBolt />, key: 'emergency', color: '#A63B34' },
 { icon: <HiOutlineAcademicCap />, key: 'learningSupport', color: '#536D57' },
 ];

 const plans = [
 {
 key: 'basic', price: t('pricing.free', 'Free'), priceNum: null,
 features: ['Standard pricing', 'Basic support', 'Service history tracking'],
 color: '#475569',
 },
 {
 key: 'silver', price: '₹199', priceNum: 199,
 features: ['10% discount on all services', 'Priority booking slot', 'Dedicated helpline', '1 free consultation/month'],
 color: '#536D57',
 },
 {
 key: 'gold', price: '₹499', priceNum: 499, popular: true,
 features: ['20% discount on all services', 'Priority emergency response', 'Free quarterly AC/geyser check', 'Warranty tracker + reminders', '2 free video consultations/month'],
 color: '#1E40AF',
 },
 {
 key: 'platinum', price: '₹999', priceNum: 999,
 features: ['30% discount on all services', 'Dedicated personal manager', 'Unlimited consultations', 'Free annual home health audit', 'VIP emergency — 15 min response'],
 color: '#364335',
 },
 ];

 return (
 <div className="landing">
 {/* ===== HERO SECTION (Artboard Match) ===== */}
 <section className="hero">
 <div className="container hero-container">
 <div className="hero-text-side">
 <div className="hero-pill-badge">
 <span className="pill-dot">●</span> India's 1st All-in-One Service Platform
 </div>
 <h1 className="hero-headline">
 A trusted circle<br />for everyday life.
 </h1>
 <p className="hero-subheading">
 Book services, connect with professionals, and get things done — all in one place.
 </p>
 <div className="hero-cta-group">
 <Link to="/customer/services" className="btn btn-primary btn-lg hero-btn-primary">
 Explore Services <HiOutlineArrowRight />
 </Link>
 <a href="#services" className="btn btn-outline btn-lg hero-btn-video">
 <span className="play-icon-circle">▶</span> Watch Video
 </a>
 </div>
 </div>

 <div className="hero-visual-side">
            <ServeCircleHeroVisual />
          </div>
 </div>

 {/* ===== HORIZONTAL CATEGORY BAR ===== */}
 <div className="container" style={{ marginTop: '36px' }}>
 <div className="hero-category-bar">
 <div className="cat-browse-header">
 <strong>Browse</strong>
 <span>Our Services <HiOutlineArrowRight /></span>
 </div>
 <div className="cat-divider" />
 <div className="cat-items-scroller">
 <Link to="/customer/general-services/repair-services" className="cat-item-link">
 <span className="cat-item-icon"><HiOutlineHome size={18} /></span>
 <span className="cat-item-title">Home Services</span>
 </Link>
 <Link to="/customer/travel-commute" className="cat-item-link">
 <span className="cat-item-icon"><HiOutlineTruck size={18} /></span>
 <span className="cat-item-title">Travel & Transport</span>
 </Link>
 <Link to="/customer/relocation" className="cat-item-link">
 <span className="cat-item-icon"><HiOutlineCube size={18} /></span>
 <span className="cat-item-title">Packers & Movers</span>
 </Link>
 <Link to="/customer/food-kitchen" className="cat-item-link">
 <span className="cat-item-icon"><HiOutlineSparkles size={18} /></span>
 <span className="cat-item-title">Food & Chef</span>
 </Link>
 <Link to="/customer/pet-care" className="cat-item-link">
 <span className="cat-item-icon"><HiOutlineHeart size={18} /></span>
 <span className="cat-item-title">Pet Care</span>
 </Link>
 <Link to="/customer/health-wellness" className="cat-item-link">
 <span className="cat-item-icon"><HiOutlineHeart size={18} /></span>
 <span className="cat-item-title">Health & Doctor</span>
 </Link>
 <Link to="/customer/society-life" className="cat-item-link">
 <span className="cat-item-icon"><HiOutlineBuildingOffice2 size={18} /></span>
 <span className="cat-item-title">Society Services</span>
 </Link>
 <Link to="/customer/services" className="cat-item-link">
 <span className="cat-item-icon"><HiOutlineSparkles size={18} /></span>
 <span className="cat-item-title">More Services</span>
 </Link>
 </div>
 </div>
 </div>

 {/* ===== VALUE & TRUST STRIP ===== */}
 <div className="container" style={{ marginTop: '24px' }}>
 <div className="hero-trust-strip">
 <div className="trust-strip-item">
 <HiOutlineShieldCheck className="trust-icon" />
 <div>
 <strong>Verified Professionals</strong>
 <span>You Can Trust</span>
 </div>
 </div>
 <div className="trust-strip-item">
 <HiOutlineCurrencyRupee className="trust-icon" />
 <div>
 <strong>Transparent Pricing</strong>
 <span>No Hidden Charges</span>
 </div>
 </div>
 <div className="trust-strip-item">
 <HiOutlineUserGroup className="trust-icon" />
 <div>
 <strong>100% Worker Protection</strong>
 <span>Zero Commission on Pass-Throughs</span>
 </div>
 </div>
 <div className="trust-strip-item">
 <HiOutlineBolt className="trust-icon" />
 <div>
 <strong>Instant UPI Payouts</strong>
 <span>For Workers</span>
 </div>
 </div>
 </div>
 </div>

 {/* ===== 3 HERO BANNER CARDS ===== */}
 <div className="container" style={{ marginTop: '28px', marginBottom: '40px' }}>
 <div className="hero-triple-banners">
 {/* Banner 1: For Workers */}
 <div className="hero-worker-card">
 <div className="worker-card-content">
 <span className="worker-card-tag">For Workers</span>
 <h3>Earn More.<br />Work Freely.</h3>
 <p>Get fair pay, zero commission on pass-throughs and instant payouts.</p>
 <Link to="/worker" className="btn btn-primary btn-sm">
 Join as Worker <HiOutlineArrowRight />
 </Link>
 </div>
 <div className="worker-card-img-wrap">
 <img
 src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"
 alt="Technician at work"
 />
 </div>
 </div>

 {/* Banner 2: Statistics */}
 <div className="hero-stat-box-card">
 <div className="stat-box-row">
 <div className="stat-unit">
 <span className="stat-num">110+</span>
 <span className="stat-lbl">Services</span>
 </div>
 <div className="stat-unit">
 <span className="stat-num">19</span>
 <span className="stat-lbl">Categories</span>
 </div>
 <div className="stat-unit">
 <span className="stat-num">8</span>
 <span className="stat-lbl">Specialized Hubs</span>
 </div>
 </div>
 <div className="stat-box-footer">
 <div className="avatar-group">
 <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Customer" />
 <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Customer" />
 <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="Customer" />
 <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="Customer" />
 </div>
 <div>
 <span className="trusted-text">Trusted by</span>
 <strong className="trusted-count">1M+ Indians</strong>
 </div>
 </div>
 </div>

 {/* Banner 3: Why Choose */}
 <div className="hero-checklist-card">
 <h3>Why Choose ServeCircle?</h3>
 <ul className="checklist-items">
 <li><HiOutlineCheckCircle className="check-ok" /> One Platform for 110+ Services</li>
 <li><HiOutlineCheckCircle className="check-ok" /> Trusted & Verified Professionals</li>
 <li><HiOutlineCheckCircle className="check-ok" /> Fair Earnings for Workers</li>
 <li><HiOutlineCheckCircle className="check-ok" /> Transparent & Secure</li>
 </ul>
 <Link to="/customer/services" className="checklist-footer-link">
 Together for a Better Tomorrow <HiOutlineArrowRight />
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* ===== CATEGORIES DIRECTORY ===== */}
 <section className="section" id="services">
 <div className="container">
 <h2 className="section-title">{t('categories.title', 'Our Services')}</h2>
 <p className="section-subtitle">{t('categories.subtitle', 'Find what you need, all in one place.')}</p>
 <div className="categories-grid">
 {categories.map((cat) => (
 <div key={cat.key} className="category-card">
 <div className="category-icon" style={{ background: 'var(--sc-bg-primary, #FAF9F6)', color: cat.color }}>
 {cat.icon}
 </div>
 <h3 className="category-name">{t(`categories.${cat.key}`)}</h3>
 <p className="category-desc">{t(`categories.${cat.key}Desc`)}</p>
 <Link 
 to={cat.key === 'emergency' ? '/customer/emergency' : cat.key === 'events' ? '/customer/events' : '/customer/services'} 
 className="category-link"
 >
 {t('common.bookNow', 'Book Now')} <HiOutlineArrowRight style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
 </Link>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ===== HOW IT WORKS ===== */}
 <section className="section how-it-works-section">
 <div className="container">
 <h2 className="section-title">{t('howItWorks.title', 'How It Works')}</h2>
 <p className="section-subtitle">{t('howItWorks.subtitle', 'Book a verified expert in 3 simple steps.')}</p>
 <div className="steps-grid">
 <div className="step-card">
 <div className="step-number">1</div>
 <div className="step-icon-wrap"><HiOutlineMagnifyingGlass /></div>
 <h3>{t('howItWorks.step1Title', 'Choose a Service')}</h3>
 <p>{t('howItWorks.step1Desc', 'Browse over 110+ specialized services with transparent upfront rates.')}</p>
 </div>
 <div className="step-connector">
 <div className="connector-arrow">→</div>
 </div>
 <div className="step-card">
 <div className="step-number">2</div>
 <div className="step-icon-wrap"><HiOutlineMapPin /></div>
 <h3>{t('howItWorks.step2Title', 'Book & Track')}</h3>
 <p>{t('howItWorks.step2Desc', 'Select your preferred time slot and track your verified pro live on the map.')}</p>
 </div>
 <div className="step-connector">
 <div className="connector-arrow">→</div>
 </div>
 <div className="step-card">
 <div className="step-number">3</div>
 <div className="step-icon-wrap"><HiOutlineCheckCircle /></div>
 <h3>{t('howItWorks.step3Title', 'Service Done & Pay')}</h3>
 <p>{t('howItWorks.step3Desc', 'Inspect the completed work, verify with OTP, and pay securely via UPI or COD.')}</p>
 </div>
 </div>
 </div>
 </section>

 {/* ===== WHY CHOOSE SERVECIRCLE (Artboard Bottom Grid) ===== */}
 <section className="section why-choose-platform-section">
 <div className="container">
 <div className="why-choose-header-center">
 <h2>Why Choose ServeCircle?</h2>
 <p>A platform built for people, with people in mind.</p>
 </div>

 <div className="why-choose-platform-grid">
 <div className="platform-feat-card">
 <div className="feat-icon"><HiOutlineShieldCheck /></div>
 <h4>Trusted & Verified Professionals</h4>
 <p>Background check & QR ID verification for every technician.</p>
 </div>

 <div className="platform-feat-card">
 <div className="feat-icon"><HiOutlineCurrencyRupee /></div>
 <h4>Transparent Pricing</h4>
 <p>No hidden charges. Know the exact cost before booking.</p>
 </div>

 <div className="platform-feat-card">
 <div className="feat-icon"><HiOutlineUserGroup /></div>
 <h4>Worker Welfare</h4>
 <p>Zero commission on pass-throughs and 100% transparent payouts.</p>
 </div>

 <div className="platform-feat-card">
 <div className="feat-icon"><HiOutlineWrench /></div>
 <h4>All-in-One</h4>
 <p>110+ Services across 19 categories and 8 specialized hubs.</p>
 </div>

 <div className="platform-feat-card">
 <div className="feat-icon"><HiOutlineHeart /></div>
 <h4>Community First</h4>
 <p>A better, connected and safer service ecosystem for India.</p>
 </div>

 <div className="platform-join-card">
 <h3>Join ServeCircle Today</h3>
 <p>Be a part of a smarter, safer and fairer service ecosystem.</p>
 <Link to="/register" className="btn btn-join-free">
 Sign Up Free <HiOutlineArrowRight />
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* ===== PRICING ===== */}
 <section className="section" id="pricing">
 <div className="container">
 <h2 className="section-title">{t('pricing.title', 'Simple Membership Plans')}</h2>
 <p className="section-subtitle">{t('pricing.subtitle', 'Unlock extra discounts, free audits, and priority booking.')}</p>
 <div className="pricing-grid">
 {plans.map((plan) => (
 <div key={plan.key} className={`pricing-card ${plan.popular ? 'pricing-popular' : ''}`}>
 {plan.popular && <div className="popular-badge">{t('pricing.popular', 'Most Popular')}</div>}
 <div className="plan-header">
 <h3 className="plan-name" style={{ color: plan.color }}>{t(`pricing.${plan.key}`)}</h3>
 <div className="plan-price">
 <span className="price-amount">{plan.price}</span>
 {plan.priceNum && <span className="price-period">{t('pricing.month', '/month')}</span>}
 </div>
 </div>
 <ul className="plan-features">
 {plan.features.map((f, j) => (
 <li key={j}><HiOutlineCheckCircle className="check-icon" /> {f}</li>
 ))}
 </ul>
 <Link to="/customer/subscriptions" className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} plan-btn`}>
 {t('pricing.choosePlan', 'Choose Plan')}
 </Link>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ===== FOOTER ===== */}
 <footer className="footer">
 <div className="container">
 <div className="footer-grid">
 <div className="footer-brand">
 <div className="navbar-logo" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <div style={{ width: '32px', height: '32px', background: 'var(--sc-primary-accent, #536D57)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
 SC
 </div>
 <span className="logo-text" style={{ color: '#ffffff' }}>ServeCircle</span>
 </div>
 <p className="footer-tagline">{t('footer.tagline', 'Empowering everyday life with reliable local services.')}</p>
 </div>
 <div className="footer-col">
 <h4>{t('footer.services', 'Services')}</h4>
 <a href="#services">{t('categories.homeRepairs', 'Home Repairs')}</a>
 <a href="#services">{t('categories.vehicleServices', 'Vehicle Services')}</a>
 <a href="#services">{t('categories.cleaning', 'Cleaning')}</a>
 <a href="#services">{t('categories.events', 'Events')}</a>
 </div>
 <div className="footer-col">
 <h4>{t('footer.company', 'Company')}</h4>
 <Link to="/about">{t('footer.aboutUs', 'About Us')}</Link>
 <Link to="/worker">{t('footer.careers', 'For Workers')}</Link>
 <Link to="/b2b">{t('b2b.title', 'For Societies & B2B')}</Link>
 </div>
 <div className="footer-col">
 <h4>{t('footer.support', 'Support')}</h4>
 <Link to="/customer/help">{t('footer.helpCenter', 'Help Center')}</Link>
 <Link to="/customer">{t('footer.terms', 'Terms & Conditions')}</Link>
 <Link to="/customer">{t('footer.privacy', 'Privacy Policy')}</Link>
 </div>
 </div>
 <div className="footer-bottom">
 <p>{t('footer.rights', '© 2026 ServeCircle Technologies. All rights reserved.')}</p>
 </div>
 </div>
 </footer>
 </div>
 );
};

export default LandingPage;