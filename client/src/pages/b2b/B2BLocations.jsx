import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlinePlusCircle,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const initialLocations = [
  { id: 1, name: 'Block A', address: 'Green Valley Society, Satellite, Ahmedabad', manager: 'Rudra Shah', units: 48 },
  { id: 2, name: 'Block B', address: 'Green Valley Society, Satellite, Ahmedabad', manager: 'Priya Desai', units: 44 },
  { id: 3, name: 'Club House', address: 'Green Valley Society, Common Area', manager: 'Amit Patel', units: 1 },
];

const B2BLocations = () => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState(initialLocations);
  const [form, setForm] = useState({ name: '', address: '', manager: '', units: 1 });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleAdd = () => {
    if (!form.name || !form.address) return;
    setLocations((current) => ([
      ...current,
      { id: Date.now(), ...form, units: Number(form.units) || 1 },
    ]));
    setForm({ name: '', address: '', manager: '', units: 1 });
  };

  const totalUnits = useMemo(
    () => locations.reduce((sum, location) => sum + (Number(location.units) || 0), 0),
    [locations]
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
          <span className="b2b-kpi-value">{locations.length}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.units', 'Total Units')}</span>
          <span className="b2b-kpi-value">{totalUnits}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.primaryCity', 'Primary City')}</span>
          <span className="b2b-kpi-value">Ahmedabad</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.coverageType', 'Coverage Type')}</span>
          <span className="b2b-kpi-value">Residential + Shared</span>
        </div>
      </div>

      <div className="b2b-two-col">
        <section className="b2b-card">
          <h3>{t('b2bExtended.registeredLocations', 'Registered Locations')}</h3>
          <div className="b2b-location-grid">
            {locations.map((location) => (
              <div key={location.id} className="b2b-location-card">
                <div className="b2b-location-title">{location.name}</div>
                <p className="b2b-location-text">{location.address}</p>
                <div className="b2b-meta-list">
                  <span><HiOutlineBuildingOffice2 /> {t('b2bExtended.managerPrefix', 'Manager: ')}{location.manager || t('b2bExtended.managerUnassigned', 'Unassigned')}</span>
                  <span><HiOutlineMapPin /> {t('b2bExtended.unitsPrefix', 'Units: ')}{location.units}</span>
                </div>
                <div className="b2b-mini-actions">
                  <button className="b2b-mini-btn">{t('b2bExtended.btnEdit', 'Edit')}</button>
                  <button className="b2b-mini-btn">{t('b2bExtended.btnDeactivate', 'Deactivate')}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="b2b-card">
          <h3>{t('b2bExtended.addNewLocation', 'Add New Location')}</h3>
          <div className="input-group">
            <label>{t('b2bExtended.locNameLabel', 'Location Name')}</label>
            <input className="input-field" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Block D / Tower 2 / Branch Name" />
          </div>
          <div className="input-group">
            <label>{t('b2bExtended.addressLabel', 'Address')}</label>
            <textarea className="input-field" rows={3} value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Full location address" />
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
    </div>
  );
};

export default B2BLocations;
