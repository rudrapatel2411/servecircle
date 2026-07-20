import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlinePlusCircle,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const initialLocations = [
  { id: 1, city: 'Ahmedabad', branch: 'Green Valley Society', floor: 'Block A', manager: 'Rudra Shah', units: 48 },
  { id: 2, city: 'Ahmedabad', branch: 'Green Valley Society', floor: 'Block B', manager: 'Priya Desai', units: 44 },
  { id: 3, city: 'Ahmedabad', branch: 'Green Valley Society', floor: 'Club House', manager: 'Amit Patel', units: 1 },
];

const B2BLocations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('b2bLocations');
    let currentLocations = saved ? JSON.parse(saved) : [...initialLocations];
    
    try {
      const savedContracts = JSON.parse(localStorage.getItem('b2bContracts') || '[]');
      let nextLocId = currentLocations.length > 0 ? Math.max(...currentLocations.map(l => l.id)) + 1 : 4;
      let isUpdated = false;
      
      savedContracts.forEach(contract => {
        // Check if this contract has any locations assigned
        const hasLocations = currentLocations.some(loc => loc.branch === contract.name);
        if (!hasLocations) {
          // Generate mock locations based on contract.locations count
          const count = contract.locations || 1;
          for (let i = 1; i <= count; i++) {
            currentLocations.push({
              id: nextLocId++,
              city: 'Ahmedabad', // default city
              branch: contract.name,
              floor: `Site / Block ${i}`,
              manager: 'Unassigned',
              units: 1
            });
          }
          isUpdated = true;
        }
      });
      
      if (isUpdated) {
        localStorage.setItem('b2bLocations', JSON.stringify(currentLocations));
      }
    } catch (e) {
      console.error("Error generating dynamic locations", e);
    }
    
    return currentLocations;
  });
  const locationState = useLocation();
  const [filterBranch, setFilterBranch] = useState(locationState.state?.filterBranch || null);
  const [form, setForm] = useState({ city: 'Ahmedabad', branch: filterBranch || '', floor: '', manager: '', units: 1 });
  const [activeLocation, setActiveLocation] = useState(null);

  const displayedLocations = useMemo(
    () => locations.filter(loc => !filterBranch || loc.branch === filterBranch),
    [locations, filterBranch]
  );

  const groupedBranches = useMemo(() => {
    if (filterBranch) return null;
    const groups = {};
    displayedLocations.forEach(loc => {
      if (!groups[loc.branch]) {
        groups[loc.branch] = { name: loc.branch, count: 0, units: 0 };
      }
      groups[loc.branch].count += 1;
      groups[loc.branch].units += Number(loc.units) || 0;
    });
    return Object.values(groups);
  }, [displayedLocations, filterBranch]);

  useEffect(() => {
    localStorage.setItem('b2bLocations', JSON.stringify(locations));
  }, [locations]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleAdd = () => {
    if (!form.city || !form.branch || !form.floor) return;
    setLocations((current) => ([
      ...current,
      { id: Date.now(), ...form, units: Number(form.units) || 1 },
    ]));
    setForm({ city: 'Ahmedabad', branch: '', floor: '', manager: '', units: 1 });
  };

  const totalUnits = useMemo(
    () => displayedLocations.reduce((sum, location) => sum + (Number(location.units) || 0), 0),
    [displayedLocations]
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bExtended.locTitle', 'Locations')}</h1>
          <p className="page-subtitle">{t('b2bExtended.locSubtitle', 'Manage buildings, blocks, and operational points.')}</p>
        </div>
      </div>

      <div className="b2b-kpi-strip">
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.totalLocations', 'Total Locations')}</span>
          <span className="b2b-kpi-value">{displayedLocations.length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/locations')}>
          <span className="b2b-kpi-label">{t('b2bExtended.units', 'Total Units')}</span>
          <span className="b2b-kpi-value">{totalUnits}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/locations')}>
          <span className="b2b-kpi-label">{t('b2bExtended.primaryCity', 'Primary City')}</span>
          <span className="b2b-kpi-value">Ahmedabad</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/contracts')}>
          <span className="b2b-kpi-label">{t('b2bExtended.coverageType', 'Coverage Type')}</span>
          <span className="b2b-kpi-value">Residential + Shared</span>
        </div>
      </div>

      <div className="b2b-two-col">
        <section className="b2b-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>
              {filterBranch ? `Registered Locations (${filterBranch})` : t('b2bExtended.registeredLocations', 'Registered Locations')}
            </h3>
            {filterBranch && (
              <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setFilterBranch(null)}>
                Clear Filter
              </button>
            )}
          </div>
          <div className="b2b-location-grid">
            {!filterBranch && groupedBranches ? (
              groupedBranches.map((group) => (
                <div 
                  key={group.name} 
                  className="b2b-location-card hover-lift"
                  style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '2px solid var(--primary-100)', background: 'var(--primary-50)' }}
                  onClick={() => setFilterBranch(group.name)}
                >
                  <div className="b2b-location-title" style={{ fontSize: '1.2rem', color: 'var(--navy-800)' }}>
                    <HiOutlineBuildingOffice2 style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    {group.name}
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'white', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--primary-200)', fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                      {group.count} Sub-locations
                    </span>
                    <span style={{ background: 'white', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--gray-200)', fontSize: '0.85rem', color: 'var(--gray-700)' }}>
                      {group.units} Total Units
                    </span>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    View all sites &rarr;
                  </div>
                </div>
              ))
            ) : (
              displayedLocations.map((location) => (
                <div 
                  key={location.id} 
                  className="b2b-location-card hover-lift"
                  style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onClick={() => setActiveLocation(location)}
                >
                  <div className="b2b-location-title">{location.branch} - {location.floor}</div>
                  <p className="b2b-location-text">{location.city}</p>
                  <div className="b2b-meta-list">
                    <span><HiOutlineBuildingOffice2 /> {t('b2bExtended.managerPrefix', 'Manager: ')}{location.manager || t('b2bExtended.managerUnassigned', 'Unassigned')}</span>
                    <span><HiOutlineMapPin /> {location.units} Units</span>
                  </div>
                  <div className="b2b-mini-actions">
                    <button className="b2b-mini-btn" onClick={(e) => { e.stopPropagation(); navigate('/b2b/booking'); }}>{t('b2bExtended.btnBookLoc', 'Book Here')}</button>
                    <button className="b2b-mini-btn" onClick={(e) => { e.stopPropagation(); alert('Location deactivated'); }}>{t('b2bExtended.btnDeactivate', 'Deactivate')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="b2b-card">
          <h3>{t('b2bExtended.addNewLocation', 'Add New Location')}</h3>
          <div className="input-group">
            <label>{t('b2bExtended.locCityLabel', 'City')}</label>
            <input className="input-field" value={form.city} onChange={(event) => update('city', event.target.value)} placeholder="e.g. Mumbai, Ahmedabad" />
          </div>
          <div className="input-group">
            <label>{t('b2bExtended.locBranchLabel', 'Branch / Site Name')}</label>
            <input className="input-field" value={form.branch} onChange={(event) => update('branch', event.target.value)} placeholder="e.g. Green Valley Society" />
          </div>
          <div className="input-group">
            <label>{t('b2bExtended.locFloorLabel', 'Block / Floor')}</label>
            <input className="input-field" value={form.floor} onChange={(event) => update('floor', event.target.value)} placeholder="e.g. Block A / 2nd Floor" />
          </div>
          <div className="input-group">
            <label>{t('b2bExtended.locManagerLabel', 'Location Manager')}</label>
            <input className="input-field" value={form.manager} onChange={(event) => update('manager', event.target.value)} placeholder="Manager name" />
          </div>
          <div className="input-group">
            <label>{t('b2bExtended.unitsCovered', 'Units / Floors Covered')}</label>
            <input className="input-field" type="number" min="1" value={form.units} onChange={(event) => update('units', event.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleAdd}><HiOutlinePlusCircle /> {t('b2bExtended.btnAddLoc', 'Add Location')}</button>
        </aside>
      </div>

      {/* Detail Modal */}
      {activeLocation && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="card animate-scale-in" style={{
            width: '100%', maxWidth: '450px', background: 'white',
            borderRadius: '16px', padding: '30px', boxShadow: 'var(--shadow-xl)', position: 'relative'
          }}>
            <button 
              onClick={() => setActiveLocation(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'var(--gray-100)',
                border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy-800)', margin: '0 0 4px 0' }}>{activeLocation.branch}</h2>
            <p style={{ color: 'var(--gray-500)', margin: '0 0 20px 0' }}>{activeLocation.floor} • {activeLocation.city}</p>
            
            <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Location ID</span>
                <span style={{ fontWeight: 700 }}>LOC-{activeLocation.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--gray-500)' }}>City</span>
                <span style={{ fontWeight: 700 }}>{activeLocation.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Units Covered</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-700)' }}>{activeLocation.units}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-200)', paddingTop: '8px', marginTop: '8px' }}>
                <span style={{ color: 'var(--gray-500)' }}>Assigned Manager</span>
                <span style={{ fontWeight: 700 }}>{activeLocation.manager || 'Unassigned'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setActiveLocation(null); alert('Location deactivated'); }}>Deactivate</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/b2b/booking')}>Book Here</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BLocations;
