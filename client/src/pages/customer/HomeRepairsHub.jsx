import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesRegistry } from '../../data/servicesRegistry';
import ServiceImage from '../../components/ServiceImage';
import { HiOutlineArrowLeft, HiOutlineWrench, HiOutlineStar, HiOutlineClock, HiOutlineCurrencyRupee } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const HomeRepairsHub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const categoryServices = servicesRegistry.filter((s) => s.category === 'home-repairs');

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      <Link to="/customer/general-services" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '20px' }}>
        <HiOutlineArrowLeft /> Back to General Services
      </Link>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            <HiOutlineWrench />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Repair Services</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>Expert technicians — electrical, plumbing, carpentry &amp; more</p>
          </div>
        </div>
      </div>

      <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {categoryServices.map((service) => (
          <Link key={service.id} to={`/customer/services/home-repairs/${service.id}`} className="service-card hover-lift" style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px dashed var(--gray-300)' }}>
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <ServiceImage serviceId={service.id} alt={t(service.nameKey)} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) contrast(1.1)' }} />
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '6px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--gray-200)' }}>
                <HiOutlineStar /> {service.rating}
              </div>
            </div>
            <div className="service-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px' }}>{t(service.nameKey)}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, minHeight: '40px' }}>{t(service.descKey)}</p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(17,24,39,0.05)', color: 'var(--gray-700)', padding: '6px 10px', borderRadius: '8px', fontWeight: 600 }}><HiOutlineClock /> {service.jobsDone}+ jobs done</span>
                </div>
              </div>
              <div style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', fontWeight: 900, color: 'var(--gray-900)' }}><HiOutlineCurrencyRupee style={{ marginRight: '2px', color: 'var(--gray-500)' }} />{service.basePrice}</span>
                <span style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: 'white', background: 'var(--gray-900)', padding: '10px 20px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>Book now →</span>
              </div>
            </div>
            </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeRepairsHub;
