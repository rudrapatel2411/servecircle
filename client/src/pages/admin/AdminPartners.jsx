import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineBuildingOffice2, HiOutlinePlusCircle, HiOutlineGlobeAlt,
  HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';

const mockPartners = [
  { id: 1, name: 'PM Kaushal Vikas Yojana', type: 'government', contact: 'District Officer', email: 'pmkvy@gov.in', phone: '1800-123-4567', desc: 'Skill development training for underprivileged youth.', partnership: 'training', status: 'active', city: 'Pan India', since: 'Jan 2025' },
  { id: 2, name: 'Seva Foundation', type: 'ngo', contact: 'Rohit Sharma', email: 'info@sevafoundation.org', phone: '9876512345', desc: 'NGO supporting women empowerment through home-based services.', partnership: 'social_impact', status: 'active', city: 'Ahmedabad', since: 'Jun 2025' },
  { id: 3, name: 'TechPark Offices', type: 'corporate', contact: 'Ankit Mehta', email: 'admin@techpark.co', phone: '9876598765', desc: 'Corporate office maintenance contract.', partnership: 'bulk_client', status: 'active', city: 'Ahmedabad', since: 'Jan 2026' },
  { id: 4, name: 'Green Valley Society', type: 'society', contact: 'Secretary', email: 'gv@society.com', phone: '9876600001', desc: 'Residential society with 200+ flats.', partnership: 'bulk_client', status: 'active', city: 'Ahmedabad', since: 'Mar 2026' },
  { id: 5, name: 'Skill India Foundation', type: 'ngo', contact: 'Meera Patel', email: 'contact@skillindia.org', phone: '9876500100', desc: 'Training and placement for ITI graduates.', partnership: 'training', status: 'pending', city: 'Gujarat', since: '' },
];

const typeColors = { government: '#3b82f6', ngo: '#10b981', corporate: '#8b5cf6', society: '#f59e0b', other: '#6b7280' };

const AdminPartners = () => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'ngo', contact: '', email: '', phone: '', desc: '', partnership: 'service_provider', city: '' });
  const [partners, setPartners] = useState(mockPartners);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = () => {
    setPartners((p) => [{ ...form, id: Date.now(), status: 'pending', since: '' }, ...p]);
    setShowForm(false);
    setForm({ name: '', type: 'ngo', contact: '', email: '', phone: '', desc: '', partnership: 'service_provider', city: '' });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.partners')} 🤝</h1>
          <p className="page-subtitle">{partners.length} partners & NGOs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><HiOutlinePlusCircle /> Add Partner</button>
      </div>

      {showForm && (
        <div className="admin-form-card animate-fade-in-up">
          <h3>Add New Partner</h3>
          <div className="form-grid">
            <div className="input-group"><label>Organization Name</label><input className="input-field" value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
            <div className="input-group"><label>Type</label><select className="input-field" value={form.type} onChange={(e) => update('type', e.target.value)}><option value="ngo">NGO</option><option value="government">Government</option><option value="corporate">Corporate</option><option value="society">Society</option></select></div>
            <div className="input-group"><label>Contact Person</label><input className="input-field" value={form.contact} onChange={(e) => update('contact', e.target.value)} /></div>
            <div className="input-group"><label>Email</label><input className="input-field" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
            <div className="input-group"><label>Phone</label><input className="input-field" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
            <div className="input-group"><label>City</label><input className="input-field" value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}><label>Description</label><textarea className="input-field" rows={2} value={form.desc} onChange={(e) => update('desc', e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleCreate}>Add Partner</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="partners-grid">
        {partners.map((p) => (
          <div key={p.id} className="partner-card">
            <div className="partner-header">
              <div className="partner-type-badge" style={{ background: `${typeColors[p.type]}15`, color: typeColors[p.type] }}>{p.type}</div>
              <span className={`badge badge-${p.status === 'active' ? 'success' : 'warning'}`}>{p.status}</span>
            </div>
            <h4 className="partner-name">{p.name}</h4>
            <p className="partner-desc">{p.desc}</p>
            <div className="partner-details">
              <span><HiOutlinePhone /> {p.phone}</span>
              <span><HiOutlineEnvelope /> {p.email}</span>
              <span><HiOutlineMapPin /> {p.city}</span>
              {p.since && <span>Since {p.since}</span>}
            </div>
            <div className="partner-contact">Contact: <strong>{p.contact}</strong></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPartners;
