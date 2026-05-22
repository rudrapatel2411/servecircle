import { useParams, Link } from 'react-router-dom';

const ImpactDetail = () => {
  const { id } = useParams();

  const titleMap = {
    'women-empowerment': 'Women Empowerment',
    'first-job': 'First Job Initiatives',
    'local-heroes': 'Local Hero Stories',
    'ngo-partners': 'NGO Partnerships'
  };

  const title = titleMap[id] || 'Social Impact';

  return (
    <div className="container" style={{ padding: '80px 24px', minHeight: '80vh', textAlign: 'center' }}>
      <h1 className="section-title" style={{ marginTop: '40px' }}>{title}</h1>
      <p className="section-subtitle">
        We are actively working on bringing you more details about our {title} initiatives.
        Please check back soon for updates.
      </p>
      
      <div style={{ marginTop: '40px' }}>
        <Link to="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ImpactDetail;
