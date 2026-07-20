import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  HiOutlineBanknotes,
  HiOutlineDocumentArrowDown,
  HiOutlineXMark,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';
import PaymentModal from '../../components/PaymentModal';
import PdfViewerModal from '../../components/PdfViewerModal';

const defaultInvoices = [
  { id: 'INV-7001', month: 'Jul 2026', contract: 'AMC-3001', service: 'Lobby & Staircase Cleaning', vendor: 'CleanMax Services', amount: 8000, status: 'sent', dueDate: '31 Jul 2026' },
  { id: 'INV-7002', month: 'Jul 2026', contract: 'AMC-3004', service: 'Security Guard Deployment', vendor: 'SIS Security', amount: 72000, status: 'sent', dueDate: '31 Jul 2026' },
  { id: 'INV-7003', month: 'Jun 2026', contract: 'AMC-3001', service: 'Lobby & Staircase Cleaning', vendor: 'CleanMax Services', amount: 8000, status: 'paid', dueDate: '30 Jun 2026' },
  { id: 'INV-7004', month: 'Jun 2026', contract: 'AMC-3002', service: 'Pest Control (All Towers)', vendor: 'Rentokil PCI', amount: 15000, status: 'paid', dueDate: '30 Jun 2026' },
  { id: 'INV-7005', month: 'Jun 2026', contract: 'AMC-3003', service: 'Elevator Maintenance', vendor: 'Otis Elevator India', amount: 24000, status: 'paid', dueDate: '30 Jun 2026' },
  { id: 'INV-7006', month: 'Jun 2026', contract: 'AMC-3004', service: 'Security Guard Deployment', vendor: 'SIS Security', amount: 72000, status: 'paid', dueDate: '30 Jun 2026' },
  { id: 'INV-7007', month: 'Jun 2026', contract: 'AMC-3006', service: 'Swimming Pool Maintenance', vendor: 'AquaCare India', amount: 12000, status: 'paid', dueDate: '30 Jun 2026' },
  { id: 'INV-7008', month: 'May 2026', contract: 'AMC-3008', service: 'STP Plant Operation', vendor: 'Aquatech Systems', amount: 25000, status: 'overdue', dueDate: '31 May 2026' },
  { id: 'INV-7009', month: 'Jul 2026', contract: 'AMC-3003', service: 'Elevator Maintenance', vendor: 'Otis Elevator India', amount: 24000, status: 'sent', dueDate: '31 Jul 2026' },
  { id: 'INV-7010', month: 'Jul 2026', contract: 'AMC-3006', service: 'Swimming Pool Maintenance', vendor: 'AquaCare India', amount: 12000, status: 'sent', dueDate: '31 Jul 2026' },
];

const B2BClientInvoices = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [invoices, setInvoices] = useState(() => {
    let rows = [...defaultInvoices];
    // Generate invoices for any client contracts that don't have default invoices
    try {
      const contracts = JSON.parse(localStorage.getItem('b2bClientContracts') || '[]');
      let nextId = 7011;
      contracts.forEach(c => {
        const has = rows.some(r => r.contract === c.id);
        if (!has) {
          const monthly = Math.round((c.value || 12000) / 12);
          rows.push({
            id: `INV-${nextId++}`, month: 'Jul 2026', contract: c.id,
            service: c.name || c.type, vendor: c.vendor || 'ServeCircle',
            amount: monthly, status: 'sent', dueDate: '31 Jul 2026',
          });
          rows.push({
            id: `INV-${nextId++}`, month: 'Jun 2026', contract: c.id,
            service: c.name || c.type, vendor: c.vendor || 'ServeCircle',
            amount: monthly, status: 'paid', dueDate: '30 Jun 2026',
          });
        }
      });
    } catch (e) { /* ignore */ }
    return rows;
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [targetContractId, setTargetContractId] = useState(location.state?.contractId || null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [activePdfInvoice, setActivePdfInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentInvoice, setActivePaymentInvoice] = useState(null);

  const filteredRows = useMemo(
    () => invoices.filter(r => {
      const statusMatch = statusFilter === 'all' || r.status === statusFilter;
      const contractMatch = !targetContractId || r.contract === targetContractId;
      return statusMatch && contractMatch;
    }),
    [statusFilter, invoices, targetContractId]
  );

  const pendingAmount = invoices.filter(r => r.status !== 'paid').reduce((s, r) => s + r.amount, 0);
  const paidAmount = invoices.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);

  const handlePaymentSuccess = () => {
    if (activePaymentInvoice) {
      setInvoices(prev => prev.map(r => r.id === activePaymentInvoice.id ? { ...r, status: 'paid' } : r));
    }
    setPaymentModalOpen(false);
    setActivePaymentInvoice(null);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices & Payments</h1>
          <p className="page-subtitle">Track all vendor bills, make payments, and download invoices for Green Valley Society.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => alert('Exporting all invoices to CSV...')}>
            📊 Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => { setPdfFileName('Consolidated_Statement_Jul_2026.pdf'); setActivePdfInvoice(null); setPdfModalOpen(true); }}>
            <HiOutlineDocumentArrowDown style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Download Statement
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="b2b-kpi-strip">
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('sent')}>
          <span className="b2b-kpi-label">Pending Bills</span>
          <span className="b2b-kpi-value">₹{pendingAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('paid')}>
          <span className="b2b-kpi-label">Paid This Quarter</span>
          <span className="b2b-kpi-value">₹{paidAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('overdue')}>
          <span className="b2b-kpi-label">Overdue</span>
          <span className="b2b-kpi-value" style={{ color: '#dc2626' }}>{invoices.filter(r => r.status === 'overdue').length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('all')}>
          <span className="b2b-kpi-label">Total Invoices</span>
          <span className="b2b-kpi-value">{invoices.length}</span>
        </div>
      </div>

      {/* Contract filter clear */}
      {targetContractId && (
        <div style={{
          padding: '10px 16px', borderRadius: '8px', marginBottom: '16px',
          background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.9rem',
        }}>
          <span>Showing invoices for contract: <strong>{targetContractId}</strong></span>
          <button className="btn btn-outline" style={{ padding: '2px 10px', fontSize: '0.8rem' }} onClick={() => setTargetContractId(null)}>
            Clear Filter
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-bar">
        {[
          { key: 'all', label: 'All' },
          { key: 'sent', label: 'Pending' },
          { key: 'paid', label: 'Paid' },
          { key: 'overdue', label: 'Overdue' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${statusFilter === tab.key ? 'tab-btn-active' : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="b2b-table-wrap" style={{ marginTop: '16px' }}>
        <table className="b2b-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Service</th>
              <th>Vendor</th>
              <th>Month</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td style={{ fontWeight: 600 }}>{row.id}</td>
                <td>{row.service}</td>
                <td>{row.vendor}</td>
                <td>{row.month}</td>
                <td>{row.dueDate}</td>
                <td style={{ fontWeight: 600 }}>₹{row.amount.toLocaleString('en-IN')}</td>
                <td>
                  <span style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                    background: row.status === 'paid' ? '#dcfce7' : row.status === 'overdue' ? '#fee2e2' : '#e0e7ff',
                    color: row.status === 'paid' ? '#166534' : row.status === 'overdue' ? '#991b1b' : '#3730a3',
                  }}>
                    {row.status === 'paid' ? 'Paid' : row.status === 'overdue' ? 'Overdue' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="b2b-mini-btn" onClick={() => { setPdfFileName(`${row.id}.pdf`); setActivePdfInvoice(row); setPdfModalOpen(true); }}>
                      PDF
                    </button>
                    {row.status !== 'paid' && (
                      <button className="b2b-mini-btn" style={{ background: '#dcfce7', color: '#166534' }} onClick={() => { setActivePaymentInvoice(row); setPaymentModalOpen(true); }}>
                        Pay Now
                      </button>
                    )}
                    {row.status !== 'paid' && (
                      <button className="b2b-mini-btn" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => alert(`Dispute raised for invoice ${row.id}. Our accounts team will review and contact you.`)}>
                        Dispute
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
          {t('common.noData')}
        </div>
      )}

      {/* PDF Modal */}
      <PdfViewerModal
        isOpen={pdfModalOpen}
        onClose={() => { setPdfModalOpen(false); setActivePdfInvoice(null); }}
        fileName={pdfFileName}
        pdfContent={
          <div style={{ padding: '20px', background: '#fafafa', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
              {activePdfInvoice ? `Tax Invoice (${activePdfInvoice.id})` : 'Consolidated Monthly Statement'}
            </h3>
            <p><strong>Society:</strong> Green Valley Society, Ahmedabad</p>
            {activePdfInvoice ? (
              <>
                <p><strong>Vendor:</strong> {activePdfInvoice.vendor}</p>
                <p><strong>Service:</strong> {activePdfInvoice.service}</p>
                <p><strong>Billing Period:</strong> {activePdfInvoice.month}</p>
                <p><strong>Due Date:</strong> {activePdfInvoice.dueDate}</p>
                <p><strong>Status:</strong> {activePdfInvoice.status.toUpperCase()}</p>
              </>
            ) : (
              <p>This document is a consolidated view of all service invoices for the current billing period.</p>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '8px', border: '1px solid #ccc' }}>Description</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {activePdfInvoice ? `${activePdfInvoice.service} — ${activePdfInvoice.vendor}` : 'All Services (Monthly)'}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    ₹{activePdfInvoice ? Math.round(activePdfInvoice.amount / 1.18).toLocaleString('en-IN') : pendingAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>GST (18%)</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    ₹{activePdfInvoice ? Math.round(activePdfInvoice.amount - (activePdfInvoice.amount / 1.18)).toLocaleString('en-IN') : Math.round(pendingAmount * 0.18).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr style={{ fontWeight: 'bold' }}>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>Total</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    ₹{activePdfInvoice ? activePdfInvoice.amount.toLocaleString('en-IN') : (pendingAmount + Math.round(pendingAmount * 0.18)).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#666' }}>Thank you for your business. Payment is expected within 7 working days of the due date.</p>
          </div>
        }
      />

      {activePaymentInvoice && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => { setPaymentModalOpen(false); setActivePaymentInvoice(null); }}
          onSuccess={handlePaymentSuccess}
          amount={activePaymentInvoice.amount}
        />
      )}
    </div>
  );
};

export default B2BClientInvoices;
