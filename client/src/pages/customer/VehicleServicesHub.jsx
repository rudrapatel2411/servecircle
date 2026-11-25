import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesRegistry } from '../../data/servicesRegistry';
import ServiceImage from '../../components/ServiceImage';
import { HiOutlineArrowLeft, HiOutlineTruck, HiOutlineStar, HiOutlineClock } from 'react-icons/hi2';
import { IconTile } from '../../components/ui';
import '../Dashboard.css';
import './CustomerPages.css';

const VehicleServicesHub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const categoryServices = servicesRegistry.filter((s) => s.category === 'vehicle-services');

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      <Link to="/customer/services" className="back-btn">
        <HiOutlineArrowLeft /> {t('vehicleHub.backToDirectory', 'Back to Directory')}
      </Link>

      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <IconTile icon={HiOutlineTruck} tone="violet" />
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Vehicle Care &amp; Services
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink2)', margin: 0, marginTop: '2px' }}>
              Doorstep car wash, bike service, battery jumpstart &amp; detailing
            </p>
          </div>
        </div>
      </div>

      <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
        {categoryServices.map((service) => (
          <Link
            key={service.id}
            to={`/customer/services/vehicle-services/${service.id}`}
            className="glass is-clickable"
            style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', borderRadius: '26px', overflow: 'hidden' }}
          >
            <div style={{ height: '200px', width: '100%', position: 'relative' }}>
              <ServiceImage serviceId={service.id} alt={t(service.nameKey)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span className="pill s-info" style={{ position: 'absolute', top: '12px', right: '12px', backdropFilter: 'blur(12px)', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <HiOutlineStar size={13} /> {service.rating}
              </span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px' }}>
              <div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                  {t(service.nameKey)}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--ink2)', lineHeight: 1.5, minHeight: '38px', margin: 0 }}>
                  {t(service.descKey)}
                </p>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <span className="pill s-teal" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <HiOutlineClock size={12} /> {service.jobsDone}+ jobs done
                  </span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(22, 70, 214, 0.08)', paddingTop: '16px', marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>
                  ₹{service.basePrice}
                </span>
                <span className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Book Now
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VehicleServicesHub;
