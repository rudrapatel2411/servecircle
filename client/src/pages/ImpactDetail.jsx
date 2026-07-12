import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ImpactDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const titleMap = {
    'women-empowerment': t('impactDetail.womenEmpowerment', 'Women Empowerment'),
    'first-job': t('impactDetail.firstJob', 'First Job Initiatives'),
    'local-heroes': t('impactDetail.localHeroes', 'Local Hero Stories'),
    'ngo-partners': t('impactDetail.ngoPartners', 'NGO Partnerships')
  };

  const title = titleMap[id] || t('impactDetail.socialImpact', 'Social Impact');

  return (
    <div className="container" style={{ padding: '80px 24px', minHeight: '80vh', textAlign: 'center' }}>
      <h1 className="section-title" style={{ marginTop: '40px' }}>{title}</h1>
      <p className="section-subtitle">
        {t('impactDetail.workingOnIt', { title, defaultValue: `We are actively working on bringing you more details about our ${title} initiatives. Please check back soon for updates.` })}
      </p>
      
      <div style={{ marginTop: '40px' }}>
        <Link to="/" className="btn btn-primary">
          {t('impactDetail.returnHome', 'Return to Home')}
        </Link>
      </div>
    </div>
  );
};

export default ImpactDetail;
