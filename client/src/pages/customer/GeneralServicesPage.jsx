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
import '../Dashboard.css';
import './CustomerPages.css';
import { generalServicesData as categories } from '../../data/generalServicesData';



const stats = [
  { value: '500+', label: 'Verified Pros', icon: '🏅' },
  { value: '4.8★', label: 'Average Rating', icon: '⭐' },
  { value: '15 min', label: 'Avg Response', icon: '⚡' },
  { value: '50K+', label: 'Happy Customers', icon: '😊' },
];

const GeneralServicesPage = () => {
  return (
    <div className="page-content gs-page" style={{ minHeight: '92vh' }}>



      {/* ===== CATEGORY GRID ===== */}
      <div className="gs-categories-section">
        <div className="gs-section-header">
          <h2 className="gs-section-title">Browse Categories</h2>
          <p className="gs-section-sub">Select a category to explore available services</p>
        </div>

        <div className="gs-categories-grid">
          {categories.map((cat) => (
            cat.comingSoon ? (
              <div key={cat.id} className="gs-category-card gs-category-card--coming-soon">
                <div className="gs-category-card-top" style={{ background: cat.gradient }}>
                  <div className="gs-category-emoji">{cat.emoji}</div>
                  <span className="gs-coming-soon-pill">
                    <HiOutlineClock />
                    Coming Soon
                  </span>
                </div>
                <div className="gs-category-card-body">
                  <h3 className="gs-category-title">{cat.label}</h3>
                  <p className="gs-category-desc">{cat.description}</p>
                  <div className="gs-category-services">
                    {cat.services.map((s, i) => (
                      <span key={i} className="gs-service-tag gs-service-tag--muted">{s}</span>
                    ))}
                  </div>
                  <div className="gs-category-footer">
                    <span className="gs-coming-soon-text">We're working on this! Stay tuned.</span>
                  </div>
                </div>
              </div>
            ) : (
              <Link key={cat.id} to={cat.path} className="gs-category-card">
                <div className="gs-category-card-top" style={{ background: cat.gradient }}>
                  <div className="gs-category-emoji">{cat.emoji}</div>
                  <span className="gs-live-pill">
                    <span className="gs-live-dot" />
                    Live
                  </span>
                </div>
                <div className="gs-category-card-body">
                  <h3 className="gs-category-title">{cat.label}</h3>
                  <p className="gs-category-desc">{cat.description}</p>
                  <div className="gs-category-services">
                    {cat.services.map((s, i) => (
                      <span key={i} className="gs-service-tag" style={{ background: cat.bg, color: cat.color }}>{s}</span>
                    ))}
                  </div>
                  <div className="gs-category-footer">
                    <span className="gs-explore-link" style={{ color: cat.color }}>
                      Explore Category <HiOutlineArrowRight className="gs-arrow" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>

      {/* ===== BOTTOM CTA ===== */}
      <div className="gs-bottom-cta">
        <div className="gs-bottom-cta-content">
          <h3>Can't find what you need?</h3>
          <p>Use our AI Concierge to describe your problem and we'll route you to the right expert instantly.</p>
        </div>
        <Link to="/customer/services" className="btn btn-primary" style={{ textTransform: 'none', padding: '12px 28px', fontSize: '0.95rem' }}>
          Try AI Concierge Search
        </Link>
      </div>

    </div>
  );
};

export default GeneralServicesPage;
