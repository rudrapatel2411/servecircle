import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineTicket, HiOutlinePlusCircle, HiOutlineTrash,
  HiOutlinePencilSquare
} from 'react-icons/hi2';
import '../Dashboard.css';
import './AdminPages.css';

const mockCoupons = [
  { id: 1, code: 'WELCOME50', desc: 'New user welcome discount', type: 'percentage', value: 50, maxDiscount: 200, minOrder: 0, used: 142, limit: 500, validFrom: '2026-01-01', validUntil: '2026-12-31', active: true },
  { id: 2, code: 'CLEAN20', desc: '20% off Cleaning services', type: 'percentage', value: 20, maxDiscount: 500, minOrder: 0, used: 38, limit: 100, validFrom: '2026-05-01', validUntil: '2026-06-30', active: true },
  { id: 3, code: 'FLAT100', desc: '₹100 off on any service', type: 'flat', value: 100, maxDiscount: 100, minOrder: 300, used: 89, limit: 200, validFrom: '2026-05-01', validUntil: '2026-05-31', active: true },
  { id: 4, code: 'GOLD25', desc: '25% off for Gold members', type: 'percentage', value: 25, maxDiscount: 1000, minOrder: 0, used: 12, limit: 50, validFrom: '2026-05-01', validUntil: '2026-08-31', active: true },
  { id: 5, code: 'SUMMER10', desc: 'Summer sale 10% off', type: 'percentage', value: 10, maxDiscount: 300, minOrder: 200, used: 200, limit: 200, validFrom: '2026-04-01', validUntil: '2026-04-30', active: false },
];

const AdminCoupons = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState(mockCoupons);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', desc: '', type: 'percentage', value: '', maxDiscount: '', minOrder: '', limit: '', validFrom: '', validUntil: '' });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = () => {
    const newCoupon = { ...form, id: Date.now(), value: Number(form.value), maxDiscount: Number(form.maxDiscount), minOrder: Number(form.minOrder), limit: Number(form.limit), used: 0, active: true };
    setCoupons((p) => [newCoupon, ...p]);
    setShowForm(false);
    setForm({ code: '', desc: '', type: 'percentage', value: '', maxDiscount: '', minOrder: '', limit: '', validFrom: '', validUntil: '' });
  };

  const toggleActive = (id) => setCoupons((p) => p.map((c) => c.id === id ? { ...c, active: !c.active } : c));
  const deleteCoupon = (id) => setCoupons((p) => p.filter((c) => c.id !== id));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.coupons')} 🎟️</h1>
          <p className="page-subtitle">{coupons.length} coupons • {coupons.filter((c) => c.active).length} active</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><HiOutlinePlusCircle /> Create Coupon</button>
      </div>

      {showForm && (
        <div className="admin-form-card animate-fade-in-up">
          <h3>Create New Coupon</h3>
          <div className="form-grid">
            <div className="input-group"><label>Coupon Code</label><input className="input-field" placeholder="e.g. SUMMER30" value={form.code} onChange={(e) => update('code', e.target.value.toUpperCase())} /></div>
            <div className="input-group"><label>Description</label><input className="input-field" placeholder="Short description" value={form.desc} onChange={(e) => update('desc', e.target.value)} /></div>
            <div className="input-group"><label>Discount Type</label><select className="input-field" value={form.type} onChange={(e) => update('type', e.target.value)}><option value="percentage">Percentage (%)</option><option value="flat">Flat (₹)</option></select></div>
            <div className="input-group"><label>Discount Value</label><input className="input-field" type="number" placeholder="e.g. 20" value={form.value} onChange={(e) => update('value', e.target.value)} /></div>
            <div className="input-group"><label>Max Discount (₹)</label><input className="input-field" type="number" placeholder="e.g. 500" value={form.maxDiscount} onChange={(e) => update('maxDiscount', e.target.value)} /></div>
            <div className="input-group"><label>Min Order (₹)</label><input className="input-field" type="number" placeholder="e.g. 200" value={form.minOrder} onChange={(e) => update('minOrder', e.target.value)} /></div>
            <div className="input-group"><label>Usage Limit</label><input className="input-field" type="number" placeholder="e.g. 100" value={form.limit} onChange={(e) => update('limit', e.target.value)} /></div>
            <div className="input-group"><label>Valid From</label><input className="input-field" type="date" value={form.validFrom} onChange={(e) => update('validFrom', e.target.value)} /></div>
            <div className="input-group"><label>Valid Until</label><input className="input-field" type="date" value={form.validUntil} onChange={(e) => update('validUntil', e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleCreate}>Create Coupon</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="coupons-grid">
        {coupons.map((c) => (
          <div key={c.id} className={`coupon-card ${!c.active ? 'inactive' : ''}`}>
            <div className="coupon-top">
              <div className="coupon-code">{c.code}</div>
              <label className="toggle-switch"><input type="checkbox" checked={c.active} onChange={() => toggleActive(c.id)} /><span className="toggle-slider" /></label>
            </div>
            <p className="coupon-desc">{c.desc}</p>
            <div className="coupon-value">{c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}</div>
            <div className="coupon-meta">
              {c.maxDiscount > 0 && <span>Max: ₹{c.maxDiscount}</span>}
              {c.minOrder > 0 && <span>Min: ₹{c.minOrder}</span>}
            </div>
            <div className="coupon-usage">
              <div className="usage-bar-wrap"><div className="usage-bar" style={{ width: `${(c.used / c.limit) * 100}%` }} /></div>
              <span className="usage-text">{c.used}/{c.limit} used</span>
            </div>
            <div className="coupon-dates">
              <span>{c.validFrom} → {c.validUntil}</span>
            </div>
            <div className="coupon-actions">
              <button className="review-action-btn"><HiOutlinePencilSquare /> Edit</button>
              <button className="review-action-btn delete" onClick={() => deleteCoupon(c.id)}><HiOutlineTrash /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCoupons;
