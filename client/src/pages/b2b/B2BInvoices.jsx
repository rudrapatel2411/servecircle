import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineBanknotes,
  HiOutlineDocumentArrowDown,
  HiOutlineReceiptPercent,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const invoiceRows = [
  { id: 'INV-5001', month: 'May 2026', contract: 'CON-1001', amount: 29500, status: 'sent', dueDate: '31 May 2026' },
  { id: 'INV-5000', month: 'Apr 2026', contract: 'CON-1001', amount: 29500, status: 'paid', dueDate: '30 Apr 2026' },
  { id: 'INV-4998', month: 'Mar 2026', contract: 'CON-1002', amount: 23600, status: 'overdue', dueDate: '31 Mar 2026' },
];

const B2BInvoices = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRows = useMemo(
    () => invoiceRows.filter((row) => statusFilter === 'all' || row.status === statusFilter),
    [statusFilter]
  );

  const sentAmount = useMemo(
    () => invoiceRows.filter((row) => row.status !== 'paid').reduce((sum, row) => sum + row.amount, 0),
    []
  );

  const paidAmount = useMemo(
    () => invoiceRows.filter((row) => row.status === 'paid').reduce((sum, row) => sum + row.amount, 0),
    []
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bExtended.invTitle', 'Invoices')}</h1>
          <p className="page-subtitle">{t('b2bExtended.invSubtitle', 'Monitor invoice status, due dates, and payment movement.')}</p>
        </div>
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
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.pendingReceivables', 'Pending Receivables')}</span>
          <span className="b2b-kpi-value">Rs {sentAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.paidAmount', 'Paid Amount')}</span>
          <span className="b2b-kpi-value">Rs {paidAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.overdueBills', 'Overdue Bills')}</span>
          <span className="b2b-kpi-value">{invoiceRows.filter((row) => row.status === 'overdue').length}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">{t('b2bExtended.totalInvoices', 'Total Invoices')}</span>
          <span className="b2b-kpi-value">{invoiceRows.length}</span>
        </div>
      </div>

      <div className="b2b-card">
        <h3><HiOutlineReceiptPercent style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.invoiceLedger', 'Invoice Ledger')}</h3>
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
                  <button className="b2b-mini-btn"><HiOutlineDocumentArrowDown style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.btnPdf', 'PDF')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default B2BInvoices;
