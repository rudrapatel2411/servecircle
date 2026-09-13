import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesRegistry } from '../../data/servicesRegistry';
import ServiceImage from '../../components/ServiceImage';
import { HiOutlineArrowLeft, HiOutlineTruck, HiOutlineStar, HiOutlineClock, HiOutlineCurrencyRupee } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const VehicleServicesHub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const categoryServices = servicesRegistry.filter((s) => s.category === 'vehicle-services');

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      <Link to="/customer/services" className="sidebar-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '20px' }}>
        <HiOutlineArrowLeft /> {t('vehicleHub.backToDirectory')}
      </Link>



      <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {categoryServices.map((service) => (
          <Link key={service.id} to={`/customer/services/vehicle-services/${service.id}`} className="service-card hover-lift" style={{ '--card-accent': '#8b5cf6', display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--gray-200)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
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
                <span style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, color: 'white', background: 'var(--card-accent)', padding: '10px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s' }}>Book now →</span>
              </div>
            </div>
            </Link>
        ))}
      </div>
    </div>
  );
};

export default VehicleServicesHub;
