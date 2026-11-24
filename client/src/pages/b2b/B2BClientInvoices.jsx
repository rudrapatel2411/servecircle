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
import Pagination from '../../components/Pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const [invoices, setInvoices] = useState(() => {
    let rows = [...defaultInvoices];
    // Sync with completed work orders
    try {
      const orders = JSON.parse(localStorage.getItem('b2bWorkOrders') || '[]');
      orders.forEach(o => {
        const invId = `INV-${o.id.replace('SC-B2B-', 'B2B-')}`;
        if (!rows.some(r => r.id === invId || r.contract === o.id)) {
          rows.unshift({
            id: invId,
            month: 'Jul 2026',
            contract: o.id,
            service: o.service,
            vendor: 'ServeCircle Verified Fleet',
            amount: o.amount || o.cost || 2500,
            status: o.status === 'completed' ? 'paid' : 'sent',
            dueDate: '31 Jul 2026',
          });
        }
      });
    } catch (e) { /* ignore */ }

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
            service: c.name || c.type, vendor: c.vendor || 'ServeCircle Verified Fleet',
            amount: monthly, status: 'sent', dueDate: '31 Jul 2026',
          });
          rows.push({
            id: `INV-${nextId++}`, month: 'Jun 2026', contract: c.id,
            service: c.name || c.type, vendor: c.vendor || 'ServeCircle Verified Fleet',
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

  const exportCSV = () => {
    const headers = ['Invoice ID', 'Service', 'Vendor', 'Month', 'Due Date', 'Amount (INR)', 'Status'];
    const rows = invoices.map(inv => [
      inv.id,
      `"${inv.service.replace(/"/g, '""')}"`,
      `"${inv.vendor.replace(/"/g, '""')}"`,
      inv.month,
      inv.dueDate,
      inv.amount,
      inv.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ServeCircle_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Invoices exported and downloaded as CSV successfully!');
  };

  const handleRaiseDispute = (invId) => {
    setInvoices(prev => prev.map(inv => inv.id === invId ? { ...inv, disputed: true } : inv));
    showToast(`Dispute ticket #DSP-${Math.floor(1000 + Math.random() * 9000)} registered for ${invId}. Our RWA accounts team will review within 24 hours.`);
  };

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
      try {
        const raw = localStorage.getItem('b2bWorkOrders');
        if (raw) {
          const orders = JSON.parse(raw);
          const updated = orders.map(ord => {
            if (ord.id === activePaymentInvoice.id || ord.id === activePaymentInvoice.contract) {
              return { ...ord, paymentStatus: 'paid' };
            }
            return ord;
          });
          localStorage.setItem('b2bWorkOrders', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Error updating b2bWorkOrders payment status:', e);
      }
      showToast(`Payment of ₹${activePaymentInvoice.amount.toLocaleString('en-IN')} confirmed for Invoice ${activePaymentInvoice.id}!`);
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
          <button className="btn btn-outline" onClick={exportCSV}>
            Export CSV
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
            onClick={() => {
              setStatusFilter(tab.key);
              setCurrentPage(1);
            }}
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
            {filteredRows
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((row) => (
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
                      <button className="b2b-mini-btn" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => handleRaiseDispute(row.id)}>
                        {row.disputed ? 'Disputed' : 'Dispute'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRows.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRows.length}
          pageSize={pageSize}
          pageSizeOptions={[8, 16, 32]}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          itemName="invoices"
        />
      )}

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

      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#0f172a',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          maxWidth: '420px',
        }}>
          <HiOutlineCheckCircle style={{ color: '#22c55e', fontSize: '1.4rem', flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default B2BClientInvoices;
