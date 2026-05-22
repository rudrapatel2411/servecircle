import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesRegistry } from '../../data/servicesRegistry';
import { getServiceImage } from '../../utils/imageHelpers';
import { HiOutlineArrowLeft, HiOutlineSparkles, HiOutlineStar, HiOutlineClock, HiOutlineCurrencyRupee } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const GardenOutdoorHub = () => {
  const { t } = useTranslation();
  const categoryServices = servicesRegistry.filter((s) => s.category === 'garden-outdoor');

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      <Link to="/customer/services" className="sidebar-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '20px' }}>
        <HiOutlineArrowLeft /> {t('common.viewAll', 'Back to Directory')}
      </Link>

      <div className="page-header" style={{ background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', borderRadius: 'var(--radius-xl)', padding: '36px 30px', color: 'white', marginBottom: '32px', borderLeft: '5px solid #22c55e', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🪴</span>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 900 }}>{t('categories.gardenOutdoor')}</h1>
            <p style={{ color: '#bbf7d0', fontSize: '0.9rem', marginTop: '4px' }}>{t('categories.gardenOutdoorDesc')}</p>
          </div>
        </div>
      </div>

      <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {categoryServices.map((service) => (
          <Link key={service.id} to={`/customer/services/garden-outdoor/${service.id}`} className="service-card hover-lift" style={{ '--card-accent': '#22c55e', display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}>
            <div className="service-card-accent" style={{ background: '#10b981', display: 'none' }} />
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
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>{t(service.nameKey)}</h4>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: '8px', lineHeight: 1.4, minHeight: '40px', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{t(service.descKey)}</p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px' }}><HiOutlineStar style={{ color: '#fcd34d' }} /> {service.rating}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px' }}><HiOutlineClock style={{ color: '#cbd5e1' }} /> {service.jobsDone}+ done</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.15rem', fontWeight: 900, color: 'white' }}><HiOutlineCurrencyRupee /> ₹{service.basePrice}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white', background: '#10b981', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>Book now →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GardenOutdoorHub;
