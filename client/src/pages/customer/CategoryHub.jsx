import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesRegistry } from '../../data/servicesRegistry';
import ServiceImage from '../../components/ServiceImage';
import {
  HiOutlineArrowLeft, HiOutlineMagnifyingGlass, HiOutlineStar,
  HiOutlineClock, HiOutlineCurrencyRupee, HiOutlineFunnel
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const categoryMeta = {
  'home-repairs': { nameKey: 'categories.homeRepairs', descKey: 'categories.homeRepairsDesc', icon: '🔧', color: '#3b82f6', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
  'vehicle-services': { nameKey: 'categories.vehicleServices', descKey: 'categories.vehicleServicesDesc', icon: '🚗', color: '#8b5cf6', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80' },
  'cleaning': { nameKey: 'categories.cleaning', descKey: 'categories.cleaningDesc', icon: '🧹', color: '#06b6d4', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' },
  'home-it': { nameKey: 'categories.homeIT', descKey: 'categories.homeITDesc', icon: '💻', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80' },
  'care-family': { nameKey: 'categories.careFamily', descKey: 'categories.careFamilyDesc', icon: '❤️', color: '#ec4899', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80' },
  'utility-daily': { nameKey: 'categories.utilityDaily', descKey: 'categories.utilityDailyDesc', icon: '🕒', color: '#3b7dc1', image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80' },
  'learning-support': { nameKey: 'categories.learningSupport', descKey: 'categories.learningSupportDesc', icon: '🎓', color: '#84cc16', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80' },
  'property-services': { nameKey: 'categories.propertyServices', descKey: 'categories.propertyServicesDesc', icon: '🏢', color: '#4b5563', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80' },
  'festive-seasonal': { nameKey: 'categories.festiveSeasonal', descKey: 'categories.festiveSeasonalDesc', icon: '✨', color: '#f97316', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80' }
};

const CategoryHub = () => {
  const { category } = useParams();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const navigate = useNavigate();

  const meta = categoryMeta[category] || {
    nameKey: 'common.loading',
    descKey: 'common.loading',
    icon: '📂',
    color: '#3b7dc1'
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
              key={service.id} to={`/customer/services/${category}/${service.id}`}
              className="service-card hover-lift" style={{ '--card-accent': meta.color, display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--gray-200)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            >
              <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                <ServiceImage serviceId={service.id} alt={t(service.nameKey)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '6px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <HiOutlineStar style={{ color: '#f59e0b' }} /> {service.rating}
                </div>
              </div>
              <div className="service-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '8px' }}>{t(service.nameKey)}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, minHeight: '40px' }}>{t(service.descKey)}</p>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--gray-50)', color: 'var(--gray-600)', padding: '6px 10px', borderRadius: '8px', fontWeight: 600 }}><HiOutlineClock style={{ color: 'var(--gray-400)' }} /> {service.jobsDone}+ jobs done</span>
                  </div>
                </div>
                <div style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}><HiOutlineCurrencyRupee style={{ marginRight: '2px', color: 'var(--gray-500)' }} />{service.basePrice}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', background: 'var(--card-accent)', padding: '10px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s' }}>Book now →</span>
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
