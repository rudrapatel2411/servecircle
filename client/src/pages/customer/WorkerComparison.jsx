import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineShieldCheck, HiOutlineStar, HiOutlineCheckBadge, HiOutlineBriefcase, HiOutlineClock, HiOutlineSparkles, HiOutlineCheckCircle } from 'react-icons/hi2';

export const mockWorkersForService = (serviceName, basePrice) => [
  {
    id: 'w1',
    name: 'Rajesh Kumar',
    rating: 4.9,
    reviews: 142,
    experience: '8 Years',
    rateMultiplier: 1.0, // Standard
    pmkvyCertified: true,
    ngoBadge: true,
    verifiedBadge: true,
    speed: 'Fast (30m arrival)',
    completedJobs: 820,
    specialty: 'Precision Fit & Heavy Assembly',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80',
    recentJob: 'Restored antique mahogany sideboard cabinet'
  },
  {
    id: 'w2',
    name: 'Amit Patel',
    rating: 4.8,
    reviews: 98,
    experience: '5 Years',
    rateMultiplier: 0.9, // Budget friendly
    pmkvyCertified: true,
    ngoBadge: false,
    verifiedBadge: true,
    speed: 'Standard (1h arrival)',
    completedJobs: 410,
    specialty: 'Speedy Repairs & Cable Management',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80',
    recentJob: 'Concealed complex modular desk wire harnesses'
  },
  {
    id: 'w3',
    name: 'Vikram Singh (Premium)',
    rating: 5.0,
    reviews: 215,
    experience: '12 Years',
    rateMultiplier: 1.25, // 25% pricing boost for ultra-premium/govt certified master
    pmkvyCertified: true,
    ngoBadge: true,
    verifiedBadge: true,
    speed: 'VIP Dispatch (Instant)',
    completedJobs: 1480,
    specialty: 'Custom Bespoke Restoration & Carpentry',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    recentJob: 'Designed & assembled floating geometric walnut shelves'
  }
];

const WorkerComparison = ({ service, selectedWorkerId, onSelectWorker }) => {
  const { t } = useTranslation();
  const rawWorkers = mockWorkersForService(service?.name || t('bookingFlow.selectedService', 'Home Service'), service?.basePrice || 499);
  
  const workers = rawWorkers.map(w => ({
    ...w,
    name: t('workers.' + w.id + '.name', w.name),
    specialty: t('workers.' + w.id + '.specialty', w.specialty),
    speed: t('workers.' + w.id + '.speed', w.speed),
    experience: t('workers.' + w.id + '.experience', w.experience),
    recentJob: t('workers.' + w.id + '.recentJob', w.recentJob)
  }));

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      color: 'white',
      margin: '20px 0'
    }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
          {t('workerComparison.title')}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          {t('workerComparison.subtitle')} <strong style={{ color: 'white' }}>{service?.name ? t(service.name) : t('bookingFlow.selectedService', 'Selected Service')}</strong>
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {workers.map((w) => {
          const finalPrice = Math.round((service?.basePrice || 499) * w.rateMultiplier);
          const isSelected = selectedWorkerId === w.id;

          return (
            <div
              key={w.id}
              style={{
                background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'rgba(30, 41, 59, 0.5)',
                border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '18px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
                <img
                  src={w.avatar}
                  alt={w.name}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {w.name}
                    {w.verifiedBadge && <HiOutlineCheckBadge style={{ color: '#3b82f6', fontSize: '1.25rem' }} />}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#fbbf24', marginTop: '2px' }}>
                    <HiOutlineStar /> <span style={{ fontWeight: 700 }}>{w.rating}</span> <span style={{ color: '#94a3b8' }}>({w.reviews} {t('workerComparison.reviews')})</span>
                  </div>
                </div>
              </div>
              {w.id === 'w3' && (
                <span style={{ background: '#fbbf24', color: '#9a3412', fontSize: '0.65rem', fontWeight: 900, padding: '2px 8px', borderRadius: '12px', position: 'absolute', top: '12px', right: '12px' }}>
                  {t('workerComparison.topChoice')}
                </span>
              )}
              {isSelected && <HiOutlineCheckCircle style={{ color: '#3b7dc1', fontSize: '1.2rem', position: 'absolute', top: '38px', right: '16px' }} />}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><HiOutlineBriefcase style={{ verticalAlign: 'text-bottom' }} /> {t('workerComparison.experience')}</span>
                  <span style={{ color: 'white', fontWeight: 700 }}>{w.experience}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><HiOutlineCheckCircle style={{ verticalAlign: 'text-bottom', color: '#ef4444' }} /> {t('workerComparison.completedJobs')}</span>
                  <span style={{ color: 'white', fontWeight: 700 }}>{w.completedJobs}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><HiOutlineClock style={{ verticalAlign: 'text-bottom', color: '#f97316' }} /> {t('workerComparison.responseTime')}</span>
                  <span style={{ color: '#3b7dc1', fontWeight: 700 }}>{w.speed}</span>
                </div>
              </div>

              <div style={{ marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, letterSpacing: '0.05em' }}>{t('workerComparison.signatureSpecialty')}</span>
                <p style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>{w.specialty}</p>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}><HiOutlineSparkles /> {t('workerComparison.verifiedPortfolio')}</span>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic' }}>"{w.recentJob}"</p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{t('workerComparison.serviceFee')}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>₹{finalPrice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectWorker(w)}
                  style={{
                    background: isSelected ? '#3b7dc1' : 'transparent',
                    color: 'white',
                    border: isSelected ? 'none' : '1px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {isSelected ? `✓ ${t('workerComparison.professionalSelected')}` : t('workerComparison.chooseProfessional')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkerComparison;
