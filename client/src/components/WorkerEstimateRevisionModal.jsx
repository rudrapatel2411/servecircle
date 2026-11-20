import React, { useState } from 'react';
import { HiOutlineXMark, HiOutlinePlus, HiOutlineTrash, HiOutlineCalculator } from 'react-icons/hi2';
import { submitQuoteRevision } from '../pages/worker/workerApi';

export default function WorkerEstimateRevisionModal({
  isOpen,
  onClose,
  token,
  bookingId,
  originalAmount = 0,
  onSuccess,
}) {
  const [items, setItems] = useState([
    { name: '', quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updated[index].quantity) || 0;
      const p = Number(updated[index].unitPrice) || 0;
      updated[index].amount = Math.round(q * p * 100) / 100;
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const extraTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalRevisedAmount = (Number(originalAmount) || 0) + extraTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validItems = items.filter((it) => it.name.trim() && Number(it.amount) > 0);
    if (validItems.length === 0) {
      setError('Please add at least one line item with a name and price.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitQuoteRevision(token, bookingId, {
        items: validItems,
        totalAmount: totalRevisedAmount,
        notes,
      });
      alert('Estimate revision submitted! The customer will be notified to review and approve.');
      if (onSuccess) onSuccess(res.revision);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit estimate revision');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #1e3a5f, #1e40af)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <HiOutlineCalculator style={{ fontSize: '1.2rem' }} />
            <span>Revise Job Estimate (Parts & Materials)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
          >
            <HiOutlineXMark />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto' }}>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>
            Add required spare parts or extra materials. Customer must approve before extra charges apply.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.88rem',
            }}
          >
            <span>Original Service Quote:</span>
            <span style={{ fontWeight: 700 }}>₹{originalAmount}</span>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>
              Line Items
            </label>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Part name / Material"
                  value={item.name}
                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                  style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  style={{ width: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                  style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={items.length <= 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: items.length > 1 ? '#ef4444' : '#cbd5e1',
                    cursor: items.length > 1 ? 'pointer' : 'default',
                    padding: '4px',
                  }}
                >
                  <HiOutlineTrash />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: '1px dashed #3b82f6',
                color: '#2563eb',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              <HiOutlinePlus /> Add Line Item
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
              Notes / Justification for Customer
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Copper pipe was rusted and needed immediate replacement..."
              rows={2}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: '#1e40af' }}>Total Revised Estimate:</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Original (₹{originalAmount}) + Extra (₹{extraTotal})</div>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8' }}>
              ₹{totalRevisedAmount}
            </div>
          </div>

          {error && (
            <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || extraTotal <= 0}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                cursor: loading || extraTotal <= 0 ? 'default' : 'pointer',
                fontWeight: 700,
                opacity: extraTotal <= 0 ? 0.6 : 1,
              }}
            >
              {loading ? 'Submitting...' : 'Submit Revision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
