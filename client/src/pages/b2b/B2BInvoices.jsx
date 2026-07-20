import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  HiOutlineBanknotes,
  HiOutlineDocumentArrowDown,
  HiOutlineReceiptPercent,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';
import PaymentModal from '../../components/PaymentModal';
import PdfViewerModal from '../../components/PdfViewerModal';

const initialInvoiceRows = [
  { id: 'INV-5001', month: 'May 2026', contract: 'CON-1001', amount: 29500, status: 'sent', dueDate: '31 May 2026' },
  { id: 'INV-5000', month: 'Apr 2026', contract: 'CON-1001', amount: 29500, status: 'paid', dueDate: '30 Apr 2026' },
  { id: 'INV-4998', month: 'Mar 2026', contract: 'CON-1002', amount: 23600, status: 'overdue', dueDate: '31 Mar 2026' },
  { id: 'INV-4999', month: 'Apr 2026', contract: 'CON-1002', amount: 23600, status: 'paid', dueDate: '30 Apr 2026' },
  { id: 'INV-5002', month: 'May 2026', contract: 'CON-1003', amount: 105020, status: 'sent', dueDate: '31 May 2026' },
  { id: 'INV-5003', month: 'Jun 2026', contract: 'CON-1003', amount: 105020, status: 'paid', dueDate: '30 Jun 2026' },
];

const B2BInvoices = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [invoiceRows, setInvoiceRows] = useState(() => {
    let generatedRows = [...initialInvoiceRows];
    try {
      const savedContracts = JSON.parse(localStorage.getItem('b2bContracts') || '[]');
      let nextInvId = 5004;
      
      savedContracts.forEach(contract => {
        // Check if this contract already has invoices
        const hasInvoices = generatedRows.some(row => row.contract === contract.id);
        if (!hasInvoices) {
          // Generate 2 mock invoices for this contract
          const baseAmount = contract.value || 15000;
          const gstAmount = baseAmount * 0.18;
          const totalAmount = baseAmount + gstAmount;
          
          generatedRows.push({
            id: `INV-${nextInvId++}`,
            month: 'Current Month',
            contract: contract.id,
            amount: totalAmount,
            status: 'sent',
            dueDate: 'End of Month'
          });
          
          generatedRows.push({
            id: `INV-${nextInvId++}`,
            month: 'Previous Month',
            contract: contract.id,
            amount: totalAmount,
            status: 'paid',
            dueDate: 'Paid'
          });
        }
      });
    } catch (e) {
      console.error("Error generating dynamic invoices", e);
    }
    return generatedRows;
  });
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Filter by contract if passed via navigation state
  const [targetContractId, setTargetContractId] = useState(location.state?.contractId || null);

  // Modals state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [activePdfInvoice, setActivePdfInvoice] = useState(null);
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentInvoice, setActivePaymentInvoice] = useState(null);

  const filteredRows = useMemo(
    () => invoiceRows.filter((row) => {
      const statusMatch = statusFilter === 'all' || row.status === statusFilter;
      const contractMatch = !targetContractId || row.contract === targetContractId;
      return statusMatch && contractMatch;
    }),
    [statusFilter, invoiceRows, targetContractId]
  );

  const sentAmount = useMemo(
    () => invoiceRows.filter((row) => row.status !== 'paid').reduce((sum, row) => sum + row.amount, 0),
    [invoiceRows]
  );

  const paidAmount = useMemo(
    () => invoiceRows.filter((row) => row.status === 'paid').reduce((sum, row) => sum + row.amount, 0),
    [invoiceRows]
  );

  const handlePaymentSuccess = () => {
    if (activePaymentInvoice) {
      setInvoiceRows((prev) => 
        prev.map(row => row.id === activePaymentInvoice.id ? { ...row, status: 'paid' } : row)
      );
    }
    setPaymentModalOpen(false);
    setActivePaymentInvoice(null);
  };

  const handleOpenPdf = (fileName, row = null) => {
    setPdfFileName(fileName);
    setActivePdfInvoice(row);
    setPdfModalOpen(true);
  };

  const handlePayNow = (row) => {
    setActivePaymentInvoice(row);
    setPaymentModalOpen(true);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bExtended.invTitle', 'Invoices')}</h1>
          <p className="page-subtitle">{t('b2bExtended.invSubtitle', 'Monitor invoice status, due dates, and payment movement.')}</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => handleOpenPdf('Consolidated_GST_Invoice_May_2026.pdf')}
        >
          <HiOutlineDocumentArrowDown style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Generate Consolidated GST Invoice
        </button>
      </div>

      <div className="tabs-bar">
        {[
          { key: 'all', label: t('b2bExtended.tabAll', 'All') },
          { key: 'sent', label: t('b2bExtended.tabSent', 'Sent') },
          { key: 'paid', label: t('b2bExtended.tabPaid', 'Paid') },
          { key: 'overdue', label: t('b2bExtended.tabOverdue', 'Overdue') },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="b2b-kpi-strip">
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('sent')}>
          <span className="b2b-kpi-label">{t('b2bExtended.pendingReceivables', 'Pending Receivables')}</span>
          <span className="b2b-kpi-value">Rs {sentAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('paid')}>
          <span className="b2b-kpi-label">{t('b2bExtended.paidAmount', 'Paid Amount')}</span>
          <span className="b2b-kpi-value">Rs {paidAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('overdue')}>
          <span className="b2b-kpi-label">{t('b2bExtended.overdueBills', 'Overdue Bills')}</span>
          <span className="b2b-kpi-value">{invoiceRows.filter((row) => row.status === 'overdue').length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('all')}>
          <span className="b2b-kpi-label">{t('b2bExtended.totalInvoices', 'Total Invoices')}</span>
          <span className="b2b-kpi-value">{invoiceRows.length}</span>
        </div>
      </div>

      <div className="b2b-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>
            <HiOutlineReceiptPercent style={{ verticalAlign: 'middle' }} /> 
            {targetContractId ? ` Invoice Ledger (Showing ${targetContractId})` : ` ${t('b2bExtended.invoiceLedger', 'Invoice Ledger')}`}
          </h3>
          {targetContractId && (
            <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setTargetContractId(null)}>
              Clear Filter
            </button>
          )}
        </div>
        <div className="table-responsive-wrapper">
          <table className="data-table">
          <thead>
            <tr>
              <th>{t('b2bExtended.invoice', 'Invoice')}</th>
              <th>{t('b2bExtended.cycle', 'Cycle')}</th>
              <th>{t('b2bExtended.contract', 'Contract')}</th>
              <th>{t('b2bExtended.dueDate', 'Due Date')}</th>
              <th>{t('b2bExtended.amount', 'Amount')}</th>
              <th>{t('b2bExtended.status', 'Status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.id}</strong></td>
                <td>{row.month}</td>
                <td>{row.contract}</td>
                <td>{row.dueDate}</td>
                <td><HiOutlineBanknotes style={{ verticalAlign: 'middle' }} /> Rs {row.amount.toLocaleString('en-IN')}</td>
                <td>
                  <span className={`b2b-chip ${row.status === 'paid' ? 'completed' : row.status === 'sent' ? 'active' : 'pending'}`}>
                    {row.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="b2b-mini-btn" 
                    onClick={() => row.status === 'paid' ? handleOpenPdf(`Invoice_${row.id}.pdf`, row) : handlePayNow(row)}
                  >
                    <HiOutlineDocumentArrowDown style={{ verticalAlign: 'middle' }} /> 
                    {row.status === 'paid' ? t('b2bExtended.btnPdf', 'PDF') : t('b2bExtended.btnPay', 'Pay Now')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <PdfViewerModal 
        isOpen={pdfModalOpen} 
        onClose={() => setPdfModalOpen(false)} 
        fileName={pdfFileName}
        pdfContent={
          <div style={{ padding: '20px', background: '#fafafa', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
              {activePdfInvoice ? `Tax Invoice (${activePdfInvoice.id})` : 'B2B Consolidated Tax Invoice'}
            </h3>
            <p><strong>Document ID:</strong> {pdfFileName}</p>
            <p><strong>Billed To:</strong> {activePdfInvoice ? (JSON.parse(localStorage.getItem('b2bContracts') || '[]').find(c => c.id === activePdfInvoice.contract)?.name || activePdfInvoice.contract) : 'Acme Corp (B2B Partner)'}</p>
            {activePdfInvoice && (
              <>
                <p><strong>Billing Cycle:</strong> {activePdfInvoice.month}</p>
                <p><strong>Due Date:</strong> {activePdfInvoice.dueDate}</p>
                <p><strong>Status:</strong> {activePdfInvoice.status.toUpperCase()}</p>
              </>
            )}
            <p>This document serves as the official tax invoice for services rendered. All values are inclusive of 18% GST where applicable.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '8px', border: '1px solid #ccc' }}>Description</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {activePdfInvoice ? `Facility Management Services - ${JSON.parse(localStorage.getItem('b2bContracts') || '[]').find(c => c.id === activePdfInvoice.contract)?.name || activePdfInvoice.contract}` : 'Monthly Maintenance Services'}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    Rs {activePdfInvoice ? Math.round(activePdfInvoice.amount / 1.18).toLocaleString('en-IN') : '25,000'}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>GST (18%)</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    Rs {activePdfInvoice ? Math.round(activePdfInvoice.amount - (activePdfInvoice.amount / 1.18)).toLocaleString('en-IN') : '4,500'}
                  </td>
                </tr>
                <tr style={{ fontWeight: 'bold' }}>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>Total</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    Rs {activePdfInvoice ? activePdfInvoice.amount.toLocaleString('en-IN') : '29,500'}
                  </td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666' }}>Thank you for your business. For any discrepancies, please contact our billing department within 7 days.</p>
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

export default B2BInvoices;
