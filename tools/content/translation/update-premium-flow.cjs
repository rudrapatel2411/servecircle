const fs = require('fs');

const path = 'client/src/pages/customer/SocietyPremiumFlow.jsx';
let code = fs.readFileSync(path, 'utf8');

// Find the return statement
const returnIndex = code.indexOf('return (');

const coreCardsLogic = `
  const coreServicesData = {
    cleanups: [
      { id: 'c1', title: 'Park & Garden Deep Clean', price: '₹1,999', desc: 'Thorough cleaning of common parks, kids play area, and benches.' },
      { id: 'c2', title: 'Lift Lobbies Pressure Washing', price: '₹1,499', desc: 'High-pressure wash for ground floor and basement lift lobbies.' },
      { id: 'c3', title: 'Boundary Wall Touch-ups', price: '₹2,999', desc: 'Scraping and painting of society exterior boundary walls.' }
    ],
    guards: [
      { id: 'g1', title: 'Standard Security Guard', price: '₹21,999/mo', desc: '12-hour shift, trained for gate management and visitor entry.' },
      { id: 'g2', title: 'Military Veteran Guard', price: '₹28,999/mo', desc: 'Highly disciplined ex-military personnel for strict security.' },
      { id: 'g3', title: 'Fire Safety Certified Guard', price: '₹24,999/mo', desc: 'Trained in emergency evacuation and fire extinguisher usage.' }
    ],
    contracts: [
      { id: 'co1', title: 'Society Pest Control', price: '₹4,999/mo', desc: 'Monthly fogging and pest control for all common areas.' },
      { id: 'co2', title: 'Garden Maintenance', price: '₹8,999/mo', desc: 'Weekly lawn mowing, trimming, and plant care by professionals.' },
      { id: 'co3', title: 'Lobby & Corridors Cleaning', price: '₹12,999/mo', desc: 'Daily sweeping and mopping of all floor corridors.' }
    ],
    packages: [
      { id: 'p1', title: 'Small Society (5-20 Homes)', price: '₹14,999/mo', desc: 'Basic cleaning and 1 guard for small independent floors.' },
      { id: 'p2', title: 'Medium Society (21-50 Homes)', price: '₹29,999/mo', desc: '2 guards, daily cleaning, and weekly garden maintenance.' },
      { id: 'p3', title: 'Mega Society (50+ Homes)', price: '₹49,999/mo', desc: '24/7 security, daily deep clean, pest control, and manager.' }
    ]
  };

  const isCoreFlow = ['cleanups', 'guards', 'contracts', 'packages'].includes(flowType);

  if (isCoreFlow) {
    const subServices = coreServicesData[flowType] || [];
    
    return (
      <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px', background: '#f8fafc' }}>
        <button onClick={() => navigate('/customer/society-management')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: 'var(--navy-600)', fontWeight: 800, fontSize: '0.9rem',
          background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '24px',
          padding: '8px 0'
        }}>
          <HiOutlineArrowLeft /> {t('societyFlow.back', 'Back to Hub')}
        </button>

        <div style={{
          background: theme.gradient,
          padding: '40px 30px',
          borderRadius: '24px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '16px', borderRadius: '20px', display: 'flex',
            backdropFilter: 'blur(10px)'
          }}>
            {theme.icon}
          </div>
          <div style={{ zIndex: 1 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{theme.title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', margin: '6px 0 0 0', fontWeight: 600 }}>Select a service plan to continue</p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {subServices.map((service) => (
            <div key={service.id} className="service-card-hover" style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--gray-200)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0, paddingRight: '12px' }}>
                    {service.title}
                  </h3>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: theme.color, background: 'var(--gray-50)', padding: '4px 10px', borderRadius: '8px' }}>
                    {service.price}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: '1.6', margin: 0 }}>
                  {service.desc}
                </p>
              </div>
              <button 
                onClick={handleNext}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  padding: '12px',
                  background: theme.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: \`0 4px 12px -4px \${theme.color}\`,
                  transition: 'transform 0.1s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

`;

const newCode = code.slice(0, returnIndex) + coreCardsLogic + code.slice(returnIndex);

fs.writeFileSync(path, newCode);
console.log('Premium flow redesigned for core services.');
