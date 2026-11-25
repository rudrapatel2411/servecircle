import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesRegistry } from '../../data/servicesRegistry';
import ServiceImage from '../../components/ServiceImage';
import {
  HiOutlineArrowLeft, HiOutlineMagnifyingGlass, HiOutlineStar,
  HiOutlineClock, HiOutlineCurrencyRupee, HiOutlineFunnel,
  HiOutlineArrowRight, HiOutlineAdjustmentsHorizontal
} from 'react-icons/hi2';
import {
  GlassCard,
  PrimaryButton,
  StatusPill,
  IconTile,
  GlassButton,
  EmptyState
} from '../../components/ui';
import '../Dashboard.css';
import './CustomerPages.css';

const categoryMeta = {
  'home-repairs': { nameKey: 'categories.homeRepairs', descKey: 'categories.homeRepairsDesc', color: 'var(--blue)', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
  'vehicle-services': { nameKey: 'categories.vehicleServices', descKey: 'categories.vehicleServicesDesc', color: 'var(--blue)', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80' },
  'cleaning': { nameKey: 'categories.cleaning', descKey: 'categories.cleaningDesc', color: 'var(--blue)', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' },
  'home-it': { nameKey: 'categories.homeIT', descKey: 'categories.homeITDesc', color: 'var(--blue)', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80' },
  'care-family': { nameKey: 'categories.careFamily', descKey: 'categories.careFamilyDesc', color: 'var(--blue)', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80' },
  'utility-daily': { nameKey: 'categories.utilityDaily', descKey: 'categories.utilityDailyDesc', color: 'var(--blue)', image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80' },
  'learning-support': { nameKey: 'categories.learningSupport', descKey: 'categories.learningSupportDesc', color: 'var(--blue)', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80' },
  'property-services': { nameKey: 'categories.propertyServices', descKey: 'categories.propertyServicesDesc', color: 'var(--blue)', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80' },
  'festive-seasonal': { nameKey: 'categories.festiveSeasonal', descKey: 'categories.festiveSeasonalDesc', color: 'var(--blue)', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80' }
};

const CategoryHub = () => {
  const { category } = useParams();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [maxBudget, setMaxBudget] = useState(5000);
  const navigate = useNavigate();

  const meta = categoryMeta[category] || {
    nameKey: 'common.loading',
    descKey: 'common.loading',
    color: 'var(--blue)'
  };

  const categoryServices = servicesRegistry.filter((s) => s.category === category);

  const filteredServices = categoryServices.filter((s) => {
    if (s.basePrice > maxBudget) return false;
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
    <div className="page-content" style={{ minHeight: '92vh', maxWidth: '1240px', margin: '0 auto', width: '100%', padding: '8px 4px 32px' }}>
      {/* Back Button Link */}
      <Link to="/customer/services" className="glass-sm" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '999px',
        color: 'var(--ink)', fontWeight: 600, fontSize: '0.85rem',
        textDecoration: 'none', marginBottom: '22px', width: 'fit-content'
      }}>
        <HiOutlineArrowLeft /> Back to Directory
      </Link>

      {/* Dynamic Header */}
      <GlassCard style={{
        padding: '28px 30px',
        borderRadius: '26px',
        borderLeft: '5px solid var(--blue)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
              {t(meta.nameKey)}
            </h1>
            <p className="page-subtitle" style={{ fontSize: '0.9rem', color: 'var(--ink2)', margin: '6px 0 0 0' }}>
              {t(meta.descKey)}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Internal Category Search and Sorting Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <div className="sunken" style={{ flex: 1, minWidth: '260px', padding: '6px 16px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HiOutlineMagnifyingGlass style={{ color: 'var(--blue)', fontSize: '1.2rem' }} />
          <input
            type="text"
            placeholder={`Search within ${t(meta.nameKey)}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', color: 'var(--ink)', fontSize: '0.92rem' }}
          />
        </div>
        <div className="sunken" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px' }}>
          <HiOutlineFunnel style={{ color: 'var(--blue)' }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--ink)', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Interactive Budget Line Slider */}
      <div className="budget-slider-card">
        <div className="budget-slider-header">
          <span className="budget-slider-title">
            <HiOutlineAdjustmentsHorizontal style={{ color: 'var(--blue)', fontSize: '1.2rem' }} />
            Filter by Max Price
          </span>
          <span className="budget-slider-val">₹{maxBudget.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min="200"
          max="5000"
          step="50"
          value={maxBudget}
          onChange={(e) => setMaxBudget(Number(e.target.value))}
          aria-label="Filter by Max Price"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.78rem', color: 'var(--ink3)' }}>
          <span>Min: ₹200</span>
          <span>Showing {sortedServices.length} of {categoryServices.length} services</span>
          <span>Max: ₹5,000</span>
        </div>
      </div>

      {/* Category Services Grid */}
      {sortedServices.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '22px' }}>
          {sortedServices.map((service) => (
            <Link
              key={service.id}
              to={`/customer/services/${category}/${service.id}`}
              className="glass is-clickable"
              style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', borderRadius: '26px', overflow: 'hidden' }}
            >
              <div style={{ height: '190px', width: '100%', position: 'relative' }}>
                <ServiceImage serviceId={service.id} alt={t(service.nameKey)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <StatusPill status="confirmed">{service.rating} Rating</StatusPill>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif', margin: '0 0 6px 0' }}>
                    {t(service.nameKey)}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--ink2)', lineHeight: 1.5, minHeight: '40px', margin: 0 }}>
                    {t(service.descKey)}
                  </p>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                    <StatusPill status="in progress">{service.jobsDone}+ jobs done</StatusPill>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(22, 70, 214, 0.08)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>
                    <HiOutlineCurrencyRupee style={{ marginRight: '2px', color: 'var(--blue)' }} />{service.basePrice}
                  </span>
                  <span className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                    Book now <HiOutlineArrowRight size={13} style={{ display: 'inline', marginLeft: '4px' }} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <GlassCard style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '26px' }}>
          <EmptyState
            title="No specific services found"
            description="Try adjusting your search terms or filter criteria."
          />
        </GlassCard>
      )}
    </div>
  );
};

export default CategoryHub;
