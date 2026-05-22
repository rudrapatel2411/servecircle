import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesRegistry } from '../../data/servicesRegistry';
import { getServiceImage } from '../../utils/imageHelpers';
import {
  HiOutlineArrowLeft, HiOutlineMagnifyingGlass, HiOutlineStar,
  HiOutlineClock, HiOutlineCurrencyRupee, HiOutlineFunnel
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const categoryMeta = {
  'home-repairs': { nameKey: 'categories.homeRepairs', descKey: 'categories.homeRepairsDesc', icon: '🔧', color: '#3b82f6', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' },
  'vehicle-services': { nameKey: 'categories.vehicleServices', descKey: 'categories.vehicleServicesDesc', icon: '🚗', color: '#8b5cf6', image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80' },
  'cleaning': { nameKey: 'categories.cleaning', descKey: 'categories.cleaningDesc', icon: '🧹', color: '#06b6d4', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
  'home-it': { nameKey: 'categories.homeIT', descKey: 'categories.homeITDesc', icon: '💻', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80' },
  'care-family': { nameKey: 'categories.careFamily', descKey: 'categories.careFamilyDesc', icon: '❤️', color: '#ec4899', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80' },
  'utility-daily': { nameKey: 'categories.utilityDaily', descKey: 'categories.utilityDailyDesc', icon: '🕒', color: '#10b981', image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=400&q=80' },
  'learning-support': { nameKey: 'categories.learningSupport', descKey: 'categories.learningSupportDesc', icon: '🎓', color: '#84cc16', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=80' },
  'property-services': { nameKey: 'categories.propertyServices', descKey: 'categories.propertyServicesDesc', icon: '🏢', color: '#4b5563', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80' },
  'festive-seasonal': { nameKey: 'categories.festiveSeasonal', descKey: 'categories.festiveSeasonalDesc', icon: '✨', color: '#f97316', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80' }
};

const CategoryHub = () => {
  const { category } = useParams();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const meta = categoryMeta[category] || {
    nameKey: 'common.loading',
    descKey: 'common.loading',
    icon: '📂',
    color: '#10b981'
  };

  const categoryServices = servicesRegistry.filter((s) => s.category === category);

  const filteredServices = categoryServices.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const translatedName = t(s.nameKey).toLowerCase();
    const translatedDesc = t(s.descKey).toLowerCase();
    return translatedName.includes(q) || translatedDesc.includes(q);
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'price_low') return a.basePrice - b.basePrice;
    if (sortBy === 'price_high') return b.basePrice - a.basePrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.jobsDone - a.jobsDone; // Default popular
  });

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* Back Button Link */}
      <Link to="/customer/services" className="sidebar-link" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to Directory
      </Link>

      {/* Dynamic Header */}
      <div className="page-header animate-fade-in-up" style={{
        padding: '28px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        background: 'white',
        borderLeft: `5px solid ${meta.color}`,
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '2.5rem' }}>{meta.icon}</span>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--navy-800)' }}>
              {t(meta.nameKey)}
            </h1>
            <p className="page-subtitle" style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '4px' }}>
              {t(meta.descKey)}
            </p>
          </div>
        </div>
      </div>

      {/* Internal Category Search and Sorting Filters */}
      <div className="search-filter-bar" style={{ marginBottom: '24px' }}>
        <div className="search-input-wrap">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={`Search within ${t(meta.nameKey)}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <HiOutlineFunnel />
          <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Category Services Grid */}
      {sortedServices.length > 0 ? (
        <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {sortedServices.map((service) => (
            <Link
              key={service.id}
              to={`/customer/services/${category}/${service.id}`}
              className="service-card hover-lift"
              style={{ '--card-accent': meta.color, display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}
            >
              <div className="service-card-accent" style={{ background: meta.color, display: 'none' }} />
              <div className="service-card-body" style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between', 
                padding: '20px',
                background: `linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(15, 23, 42, 0.6) 100%), url(${getServiceImage(service.id)}) center/cover no-repeat`,
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <h4 className="service-card-name" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    {t(service.nameKey)}
                  </h4>
                  <p className="service-card-desc" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: '8px', lineHeight: 1.4, minHeight: '40px', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                    {t(service.descKey)}
                  </p>
                  
                  {/* Reviews & Jobs Meta */}
                  <div className="service-card-meta" style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span className="service-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px' }}>
                      <HiOutlineStar style={{ color: '#fcd34d' }} /> {service.rating}
                    </span>
                    <span className="service-jobs" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px' }}>
                      <HiOutlineClock style={{ color: '#cbd5e1' }} /> {service.jobsDone}+ done
                    </span>
                  </div>
                </div>

                <div className="service-card-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="service-price" style={{ display: 'flex', alignItems: 'center', fontSize: '1.15rem', fontWeight: 900, color: 'white' }}>
                    <HiOutlineCurrencyRupee /> ₹{service.basePrice}
                  </span>
                  <span className="service-book-btn" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white', background: meta.color, padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Book now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ padding: '60px', textAlign: 'center', border: '1.5px dashed var(--gray-300)', borderRadius: 'var(--radius-lg)', background: 'white' }}>
          <p style={{ fontSize: '0.95rem', color: 'var(--gray-500)' }}>😕 No specific services found matching your filters.</p>
        </div>
      )}

    </div>
  );
};

export default CategoryHub;
