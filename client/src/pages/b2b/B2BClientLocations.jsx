import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePlusCircle,
  HiOutlineXMark,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const PRE_SEEDED_BLOCKS = [
  { id: '101', tower: 'Tower A', floor: 'All Floors', type: 'Residential', manager: 'Rajesh M', flats: 48, status: 'active' },
  { id: '102', tower: 'Tower B', floor: 'All Floors', type: 'Residential', manager: 'Sunita K', flats: 48, status: 'active' },
  { id: '103', tower: 'Tower C', floor: 'All Floors', type: 'Residential', manager: 'Amit P', flats: 48, status: 'active' },
  { id: '104', tower: 'Tower D', floor: 'All Floors', type: 'Residential', manager: 'Neha S', flats: 48, status: 'active' },
  { id: '201', tower: 'Clubhouse', floor: 'Main Hall', type: 'Amenities', manager: 'Vijay T', flats: 0, status: 'active' },
  { id: '202', tower: 'Clubhouse', floor: 'Swimming Pool', type: 'Amenities', manager: 'Vijay T', flats: 0, status: 'active' },
  { id: '203', tower: 'Clubhouse', floor: 'Gymnasium', type: 'Amenities', manager: 'Vijay T', flats: 0, status: 'active' },
  { id: '301', tower: 'Common Area', floor: 'Central Garden', type: 'Utilities', manager: 'Kisan (Head Mali)', flats: 0, status: 'active' },
  { id: '302', tower: 'Common Area', floor: 'Basement Parking', type: 'Utilities', manager: 'Security Team', flats: 0, status: 'active' },
  { id: '303', tower: 'Common Area', floor: 'STP / Generator', type: 'Utilities', manager: 'Maintenance Team', flats: 0, status: 'active' },
];

const B2BClientLocations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeBlock, setActiveBlock] = useState(null);
  const [form, setForm] = useState({ tower: '', type: 'Residential', manager: '', flats: '' });

  useEffect(() => {
    const saved = localStorage.getItem('b2bClientBlocks');
    if (!saved) {
      localStorage.setItem('b2bClientBlocks', JSON.stringify(PRE_SEEDED_BLOCKS));
      setBlocks(PRE_SEEDED_BLOCKS);
    } else {
      setBlocks(JSON.parse(saved));
    }
  }, []);

  const typeColors = {
    'Residential': '#3b82f6',
    'Amenities': '#8b5cf6',
    'Utilities': '#f59e0b',
    'Commercial': '#10b981',
  };

  // Group by tower for the top-level view
  const groupedBlocks = blocks.reduce((acc, block) => {
    if (!acc[block.tower]) {
      acc[block.tower] = {
        name: block.tower,
        types: new Set(),
        flats: 0,
        count: 0,
        manager: block.manager, // take manager of first block as lead
      };
    }
    acc[block.tower].types.add(block.type);
    acc[block.tower].flats += (parseInt(block.flats) || 0);
    acc[block.tower].count += 1;
    return acc;
  }, {});

  const displayedBlocks = activeGroup 
    ? blocks.filter(b => b.tower === activeGroup)
    : Object.values(groupedBlocks);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.tower || !form.type) return;
    
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      tower: form.tower,
      floor: 'General Area',
      type: form.type,
      manager: form.manager || 'Unassigned',
      flats: parseInt(form.flats) || 0,
      status: 'active',
    };
    
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    localStorage.setItem('b2bClientBlocks', JSON.stringify(updated));
    setForm({ tower: '', type: 'Residential', manager: '', flats: '' });
    alert(t('b2bClient.locations.addForm.successMsg'));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bClient.locations.title')}</h1>
          <p className="page-subtitle">{t('b2bClient.locations.subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          document.getElementById('register-form').scrollIntoView({ behavior: 'smooth' });
        }}>
          <HiOutlinePlusCircle style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          {t('b2bClient.locations.registerNew')}
        </button>
      </div>

      {/* KPIs */}
      <div className="b2b-kpi-strip">
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setActiveGroup(null)}>
          <span className="b2b-kpi-label">{t('b2bClient.locations.residential')}</span>
          <span className="b2b-kpi-value">{blocks.filter(b => b.type === 'Residential').length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setActiveGroup('Clubhouse')}>
          <span className="b2b-kpi-label">{t('b2bClient.locations.amenities')}</span>
          <span className="b2b-kpi-value">{blocks.filter(b => b.type === 'Amenities').length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setActiveGroup('Common Area')}>
          <span className="b2b-kpi-label">{t('b2bClient.locations.utilities')}</span>
          <span className="b2b-kpi-value">{blocks.filter(b => b.type === 'Utilities').length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setActiveGroup(null)}>
          <span className="b2b-kpi-label">{t('b2bClient.locations.totalAreas')}</span>
          <span className="b2b-kpi-value">{blocks.length}</span>
        </div>
      </div>

      <div className="b2b-two-col">
        {/* Hierarchy View */}
        <section className="b2b-card" style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)' }}>
              {activeGroup ? `${activeGroup} (${displayedBlocks.length} ${t('b2bClient.locations.areas')})` : 'Society Hierarchy Overview'}
            </h3>
            {activeGroup && (
              <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setActiveGroup(null)}>
                {t('b2bClient.locations.backToAll')}
              </button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {!activeGroup ? (
              displayedBlocks.map((group) => (
                <div
                  key={group.name}
                  className="b2b-location-card hover-lift"
                  style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: `4px solid ${typeColors[[...group.types][0]] || '#6b7280'}` }}
                  onClick={() => setActiveGroup(group.name)}
                >
                  <div className="b2b-location-title">{group.name}</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '4px' }}>
                    Manager: <strong>{group.manager}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <span style={{ background: 'white', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--primary-200)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-700)' }}>
                      {group.count} {t('b2bClient.locations.areas')}
                    </span>
                    {group.flats > 0 && (
                      <span style={{ background: 'white', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--gray-200)', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                        {group.flats} {t('b2bClient.locations.flats')}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {[...group.types].map(type => (
                      <span key={type} style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                        background: `${typeColors[type] || '#6b7280'}20`,
                        color: typeColors[type] || '#6b7280',
                      }}>
                        {t(`b2bClient.locations.${type.toLowerCase()}`, type)}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                    {t('b2bClient.locations.viewAllFloors')}
                  </div>
                </div>
              ))
            ) : (
              displayedBlocks.map((block) => (
                <div
                  key={block.id}
                  className="b2b-location-card hover-lift"
                  style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: `4px solid ${typeColors[block.type] || '#6b7280'}` }}
                  onClick={() => setActiveBlock(block)}
                >
                  <div className="b2b-location-title">{block.tower} — {block.floor}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      background: `${typeColors[block.type] || '#6b7280'}20`,
                      color: typeColors[block.type] || '#6b7280',
                    }}>
                      {t(`b2bClient.locations.${block.type.toLowerCase()}`, block.type)}
                    </span>
                    {block.flats > 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{block.flats} {t('b2bClient.locations.flats')}</span>
                    )}
                  </div>
                  {block.manager && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '6px' }}>
                      👤 {block.manager}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button className="b2b-mini-btn" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); navigate('/b2b/services'); }}>
                      {t('b2bClient.locations.bookServiceBtn')}
                    </button>
                    <button className="b2b-mini-btn" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setActiveBlock(block); }}>
                      {t('b2bClient.locations.detailsBtn')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Add New Block Form */}
        <section id="register-form" className="b2b-card" style={{ flex: 1, alignSelf: 'flex-start' }}>
          <h3><HiOutlinePlusCircle style={{ verticalAlign: 'middle', marginRight: '8px' }} />{t('b2bClient.locations.addForm.title')}</h3>
          <div className="b2b-form-grid" style={{ marginTop: '16px' }}>
            <div className="input-group">
              <label>{t('b2bClient.locations.addForm.towerBuilding')}</label>
              <input className="input-field" placeholder="e.g. Tower E" value={form.tower} onChange={(e) => setForm(f => ({ ...f, tower: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>{t('b2bClient.locations.addForm.type')}</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="Residential">{t('b2bClient.locations.residential')}</option>
                <option value="Commercial">Commercial</option>
                <option value="Amenities">{t('b2bClient.locations.amenities')}</option>
                <option value="Utilities">{t('b2bClient.locations.utilities')}</option>
              </select>
            </div>
            <div className="input-group">
              <label>{t('b2bClient.locations.addForm.manager')}</label>
              <input className="input-field" placeholder="John Doe" value={form.manager} onChange={(e) => setForm(f => ({ ...f, manager: e.target.value }))} />
            </div>
            <div className="input-group">
              <label>{t('b2bClient.locations.addForm.flatsUnits')}</label>
              <input type="number" className="input-field" placeholder="Leave empty if none" value={form.flats} onChange={(e) => setForm(f => ({ ...f, flats: e.target.value }))} />
            </div>
            <button className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: '10px' }} onClick={handleRegister}>
              {t('b2bClient.locations.addForm.registerBtn')}
            </button>
          </div>
        </section>
      </div>

      {/* Detail Modal */}
      {activeBlock && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px',
            position: 'relative',
          }}>
            <button onClick={() => setActiveBlock(null)} style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--gray-400)'
            }}>
              <HiOutlineXMark />
            </button>

            <h2 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', marginBottom: '16px' }}>
              {activeBlock.tower} — {activeBlock.floor}
            </h2>
            <div style={{ display: 'grid', gap: '10px', fontSize: '0.9rem' }}>
              <div><strong>{t('b2bClient.locations.addForm.type')}:</strong> {t(`b2bClient.locations.${activeBlock.type.toLowerCase()}`, activeBlock.type)}</div>
              <div><strong>{t('b2bClient.locations.addForm.flatsUnits')}:</strong> {activeBlock.flats || 'N/A'}</div>
              <div><strong>{t('b2bClient.locations.addForm.manager')}:</strong> {activeBlock.manager || t('b2bClient.locations.detail.unassigned')}</div>
              <div><strong>{t('b2bClient.locations.detail.locationId')}:</strong> LOC-{activeBlock.id}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => { setActiveBlock(null); navigate('/b2b/services'); }}>
                {t('b2bClient.locations.bookServiceBtn')}
              </button>
              <button className="btn btn-outline" onClick={() => { setActiveBlock(null); navigate('/b2b/history'); }}>
                {t('b2bClient.contracts.detail.serviceHistory')}
              </button>
              <button className="btn btn-outline" onClick={() => { setActiveBlock(null); navigate('/b2b/contracts'); }}>
                {t('b2bClient.dashboard.quickActions.viewContracts')}
              </button>
              <button className="btn btn-outline" onClick={() => alert(`${t('b2bClient.locations.detail.editManagerAlert')}`)}>
                {t('b2bClient.locations.detail.editManagerBtn')}
              </button>
              <button className="btn btn-outline" onClick={() => { setActiveBlock(null); navigate('/b2b/support'); }}>
                {t('b2bClient.locations.detail.raiseIssueBtn')}
              </button>
              <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => {
                if (window.confirm(t('b2bClient.locations.detail.deactivateConfirm'))) {
                  setBlocks(prev => prev.filter(b => b.id !== activeBlock.id));
                  setActiveBlock(null);
                }
              }}>
                {t('b2bClient.locations.detail.deactivateBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BClientLocations;
