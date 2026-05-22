import { useMemo, useState } from 'react';
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
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Monitor invoice status, due dates, and payment movement.</p>
        </div>
      </div>

      <div className="tabs-bar">
        {[
          { key: 'all', label: 'All' },
          { key: 'sent', label: 'Sent' },
          { key: 'paid', label: 'Paid' },
          { key: 'overdue', label: 'Overdue' },
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
          <span className="b2b-kpi-label">Pending Receivables</span>
          <span className="b2b-kpi-value">Rs {sentAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Paid Amount</span>
          <span className="b2b-kpi-value">Rs {paidAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Overdue Bills</span>
          <span className="b2b-kpi-value">{invoiceRows.filter((row) => row.status === 'overdue').length}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Total Invoices</span>
          <span className="b2b-kpi-value">{invoiceRows.length}</span>
        </div>
      </div>

      <div className="b2b-card">
        <h3><HiOutlineReceiptPercent style={{ verticalAlign: 'middle' }} /> Invoice Ledger</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Cycle</th>
              <th>Contract</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
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
                  <button className="b2b-mini-btn"><HiOutlineDocumentArrowDown style={{ verticalAlign: 'middle' }} /> PDF</button>
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
