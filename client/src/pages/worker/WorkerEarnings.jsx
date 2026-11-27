import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
 HiOutlineArrowTrendingUp,
 HiOutlineBanknotes,
 HiOutlineClock,
 HiOutlineCurrencyRupee,
 HiOutlineBolt,
 HiOutlineCreditCard,
 HiOutlineArrowDownTray,
 HiOutlineCheckBadge,
 HiOutlineBuildingLibrary,
 HiOutlineQrCode,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import {
 fetchWorkerJobs,
 fetchPayoutAccount,
 savePayoutAccount,
 fetchWorkerLedger,
 requestWithdrawal,
} from './workerApi';
import { formatDate, formatInr } from './workerHelpers';
import { getWorkerCategory } from '../../utils/workerCategoryHelper';
import { getWorkflowWorkerEarnings, subscribeWorkflowUpdates } from '../../utils/serviceWorkflowEngine';
import '../Dashboard.css';
import './WorkerPages.css';

const WorkerEarnings = () => {
 const { t } = useTranslation();
 const { token, user, isAuthenticated, signIn, authError, authLoading, workerStatus } = useWorkerAuth();

 const [jobs, setJobs] = useState([]);
 const [ledger, setLedger] = useState(null);
 const [payoutAccount, setPayoutAccount] = useState(null);
 const [showPayoutModal, setShowPayoutModal] = useState(false);
 const [showWithdrawModal, setShowWithdrawModal] = useState(false);
 const [withdrawAmount, setWithdrawAmount] = useState('');
 const [withdrawSuccess, setWithdrawSuccess] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [savingAccount, setSavingAccount] = useState(false);
 const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

 const [payoutForm, setPayoutForm] = useState({
 payoutType: 'UPI',
 upiId: '',
 accountNumber: '',
 ifscCode: '',
 accountHolderName: '',
 });

 const [wfEarnings, setWfEarnings] = useState(() => getWorkflowWorkerEarnings());

 const loadData = async () => {
 setWfEarnings(getWorkflowWorkerEarnings());
 if (!token) return;
 setLoading(true);
 setError('');
 try {
 const [jobsData, ledgerData, accountData] = await Promise.all([
 fetchWorkerJobs(token).catch(() => []),
 fetchWorkerLedger(token).catch(() => null),
 fetchPayoutAccount(token).catch(() => null),
 ]);
 setJobs(Array.isArray(jobsData) ? jobsData : []);
 if (ledgerData) setLedger(ledgerData);
 if (accountData) {
 setPayoutAccount(accountData);
 setPayoutForm({
 payoutType: accountData.payoutType || 'UPI',
 upiId: accountData.upiId || '',
 accountNumber: accountData.accountNumber || '',
 ifscCode: accountData.ifscCode || '',
 accountHolderName: accountData.accountHolderName || '',
 });
 }
 } catch (err) {
 setError(err.message || 'Could not load earnings');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadData();
 const unsub = subscribeWorkflowUpdates(() => loadData());
 return unsub;
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [token]);

 const completedJobs = useMemo(
 () => jobs.filter((job) => job.status === 'completed'),
 [jobs]
 );

 const grossEarnings = useMemo(
 () => (ledger?.grossEarnings ?? completedJobs.reduce((sum, job) => sum + (job.amount || 0), 0)) + (wfEarnings?.totalEarned || 0),
 [ledger, completedJobs, wfEarnings]
 );

 const weeklyGross = useMemo(() => {
 const now = new Date();
 const weekAgo = new Date();
 weekAgo.setDate(now.getDate() - 7);

 return completedJobs
 .filter((job) => new Date(job.scheduledDate) >= weekAgo && new Date(job.scheduledDate) <= now)
 .reduce((sum, job) => sum + (job.amount || 0), 0) + (wfEarnings?.totalEarned || 0);
 }, [completedJobs, wfEarnings]);

 const receivedPayout = useMemo(
 () => ledger?.settledWithdrawals ?? completedJobs
 .filter((job) => job.paymentStatus === 'paid')
 .reduce((sum, job) => sum + (job.amount || 0), 0),
 [ledger, completedJobs]
 );

 const availableBalance = useMemo(
 () => ledger?.availableBalance ?? Math.max(0, grossEarnings - receivedPayout),
 [ledger, grossEarnings, receivedPayout]
 );

 const pendingPayout = useMemo(
 () => ledger?.pendingWithdrawals ?? completedJobs
 .filter((job) => job.paymentStatus !== 'paid')
 .reduce((sum, job) => sum + (job.amount || 0), 0),
 [ledger, completedJobs]
 );

 const totalPlatformFee = useMemo(
 () => completedJobs.reduce((sum, job) => sum + (job.platformCommission ?? Math.round(job.amount * 0.1)), 0),
 [completedJobs]
 );

 const totalTakeHome = useMemo(
 () => completedJobs.reduce((sum, job) => sum + (job.workerEarnings ?? Math.round(job.amount * 0.9)), 0),
 [completedJobs]
 );

 const monthlyRows = useMemo(() => {
 const bucket = {};
 completedJobs.forEach((job) => {
 const date = new Date(job.scheduledDate);
 const key = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
 if (!bucket[key]) {
 bucket[key] = { amount: 0, count: 0 };
 }
 bucket[key].amount += job.amount || 0;
 bucket[key].count += 1;
 });

 return Object.entries(bucket).map(([month, value]) => ({
 month,
 ...value,
 }));
 }, [completedJobs]);

 const handleSavePayoutAccount = async (e) => {
 e.preventDefault();
 if (!token) return;
 setSavingAccount(true);
 try {
 const saved = await savePayoutAccount(token, payoutForm);
 setPayoutAccount(saved);
 setShowPayoutModal(false);
 alert('Payout destination updated successfully!');
 } catch (err) {
 alert(err.message || 'Failed to update payout destination');
 } finally {
 setSavingAccount(false);
 }
 };

 const handleWithdrawalSubmit = async (e) => {
 e.preventDefault();
 const amountNum = Number(withdrawAmount);
 if (!amountNum || amountNum <= 0) {
 alert('Please enter a valid amount.');
 return;
 }
 if (amountNum > availableBalance) {
 alert(`Requested amount exceeds available balance (₹${availableBalance})`);
 return;
 }
 if (!payoutAccount?.isVerified) {
 alert('Please configure your verified UPI ID or Bank Account first.');
 setShowPayoutModal(true);
 return;
 }

 setSubmittingWithdrawal(true);
 try {
 const res = await requestWithdrawal(token, {
 amount: amountNum,
 notes: `Instant withdrawal to ${payoutAccount.payoutType}`,
 });
 setWithdrawSuccess(`Success! Withdrawal of ₹${amountNum} initiated (ID: ${res.id || 'REQ'}). Funds will credit within 2 hours.`);
 setShowWithdrawModal(false);
 setWithdrawAmount('');
 await loadData();
 setTimeout(() => setWithdrawSuccess(''), 8000);
 } catch (err) {
 alert(err.message || 'Withdrawal request failed');
 } finally {
 setSubmittingWithdrawal(false);
 }
 };

 if (!isAuthenticated) {
 return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} currentUser={user} workerStatus={workerStatus} />;
 }

 return (
 <div className="page-content worker-page-content">
 <div className="page-header">
 <div>
 <h1 className="page-title">{t('worker.earnings', 'Earnings & Settlements')}</h1>
 <p className="page-subtitle">Track ledger, cash collected (COD), payout accounts, and withdrawals.</p>
 </div>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button
 className="btn btn-outline"
 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
 onClick={() => setShowPayoutModal(true)}
 >
 <HiOutlineCreditCard /> Payout Account
 </button>
 <button
 className="btn btn-primary"
 style={{ background: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}
 onClick={() => {
 setWithdrawAmount(String(availableBalance > 0 ? availableBalance : ''));
 setShowWithdrawModal(true);
 }}
 disabled={availableBalance <= 0}
 >
 <HiOutlineBolt /> Withdraw Funds
 </button>
 </div>
 </div>

 <div className="dashboard-grid">
 <div className="stat-card">
 <div className="stat-icon" style={{ background: '#e1ebf5', color: '#224c82' }}>
 <HiOutlineBanknotes />
 </div>
 <div>
 <div className="stat-value">{formatInr(weeklyGross)}</div>
 <div className="stat-label">{t('worker.weeklyEarnings', 'Weekly Earnings')}</div>
 </div>
 </div>
 <div className="stat-card">
 <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}>
 <HiOutlineArrowTrendingUp />
 </div>
 <div>
 <div className="stat-value">{formatInr(availableBalance)}</div>
 <div className="stat-label">Available for Withdrawal</div>
 </div>
 </div>
 <div className="stat-card">
 <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
 <HiOutlineCheckBadge />
 </div>
 <div>
 <div className="stat-value">{formatInr(receivedPayout)}</div>
 <div className="stat-label">Total Settled Payouts</div>
 </div>
 </div>
 <div className="stat-card">
 <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
 <HiOutlineClock />
 </div>
 <div>
 <div className="stat-value">{formatInr(pendingPayout)}</div>
 <div className="stat-label">Pending / Processing</div>
 </div>
 </div>
 </div>

 {withdrawSuccess && (
 <div className="card" style={{ borderColor: '#86efac', background: '#f0fdf4', color: '#166534', padding: '16px', marginBottom: '16px' }}>
 <strong> Instant Withdrawal Initiated:</strong> {withdrawSuccess}
 </div>
 )}

 {error && (
 <div className="card" style={{ marginBottom: 16, borderColor: '#fecaca', color: '#991b1b' }}>
 {error}
 </div>
 )}

 {/* Payout Destination Info & COD Reconciliation Grid */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
 
 {/* Payout Destination Card */}
 <div className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)', background: 'white' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
 <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
 <HiOutlineCreditCard style={{ color: '#2563eb' }} /> Payout Destination
 </h3>
 <button
 className="btn btn-outline"
 style={{ fontSize: '0.75rem', padding: '4px 10px' }}
 onClick={() => setShowPayoutModal(true)}
 >
 {payoutAccount ? 'Edit' : '+ Add'}
 </button>
 </div>
 {payoutAccount ? (
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
 <span className="badge badge-success"> Active & Ready</span>
 <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-800)' }}>
 {payoutAccount.payoutType === 'UPI' ? 'UPI ID' : 'Bank Account'}
 </span>
 </div>
 <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--navy-900)' }}>
 <strong>Account:</strong> {payoutAccount.payoutType === 'UPI' ? payoutAccount.upiId : payoutAccount.accountNumber}
 </p>
 {payoutAccount.accountHolderName && (
 <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
 <strong>Beneficiary:</strong> {payoutAccount.accountHolderName}
 </p>
 )}
 {payoutAccount.ifscCode && (
 <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
 <strong>IFSC:</strong> {payoutAccount.ifscCode}
 </p>
 )}
 </div>
 ) : (
 <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem', padding: '10px 0' }}>
 No payout account linked yet. Link your UPI ID or bank account to receive withdrawals.
 </div>
 )}
 </div>

 {/* COD Cash in Hand & Platform Liability Card */}
 <div className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)', background: 'white' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
 <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
 <HiOutlineBanknotes style={{ color: '#f59e0b' }} /> COD Cash Reconciliation
 </h3>
 <span style={{ fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
 On-Site Cash
 </span>
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: 'var(--gray-600)' }}>Cash Collected in Hand:</span>
 <strong style={{ color: '#b45309' }}>{formatInr(ledger?.codCashInHand ?? 0)}</strong>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 <span style={{ color: 'var(--gray-600)' }}>Platform Commission (20%):</span>
 <strong style={{ color: '#dc2626' }}>{formatInr(ledger?.codLiability ?? 0)}</strong>
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
 <span style={{ fontWeight: 700, color: 'var(--navy-800)' }}>Net Available Balance:</span>
 <strong style={{ color: '#16a34a', fontSize: '1rem' }}>{formatInr(availableBalance)}</strong>
 </div>
 </div>
 <p style={{ margin: '10px 0 0 0', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
 *Platform commission on COD is automatically deducted from your digital earnings balance.
 </p>
 </div>

 </div>

 {loading && <div className="chart-placeholder">Loading earnings...</div>}

 {!loading && (
 <div className="dash-section">
 <div className="dash-section-header">
 <h3 className="dash-section-title">Earnings Breakdown</h3>
 <button 
 className="btn btn-primary" 
 style={{ background: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}
 onClick={() => {
 setWithdrawAmount(String(availableBalance > 0 ? availableBalance : ''));
 setShowWithdrawModal(true);
 }}
 disabled={availableBalance <= 0}
 >
 <HiOutlineBolt /> Instant Withdrawal
 </button>
 </div>
 
 <div className="card" style={{ marginBottom: 16 }}>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
 <div>
 <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', display: 'block' }}>Gross Customer Billings</span>
 <strong style={{ fontSize: '1.25rem', color: 'var(--navy-900)' }}>{formatInr(grossEarnings)}</strong>
 </div>
 <div>
 <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', display: 'block' }}>Platform Commission</span>
 <strong style={{ fontSize: '1.25rem', color: '#dc2626' }}>- {formatInr(totalPlatformFee)}</strong>
 </div>
 <div>
 <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', display: 'block' }}>Verified Net Take-Home</span>
 <strong style={{ fontSize: '1.25rem', color: '#16a34a' }}>{formatInr(totalTakeHome)}</strong>
 </div>
 </div>
 </div>
 <p className="page-subtitle">Platform commission applies strictly to labor. Tolls, fuel, spare parts, and outstation allowances are 100% pass-through with 0% platform fee.</p>
 </div>
 )}

 {!loading && monthlyRows.length > 0 && (
 <div className="dash-section">
 <h3 className="dash-section-title">Monthly Performance</h3>
 <table className="data-table">
 <thead>
 <tr>
 <th>Month</th>
 <th>Completed Jobs</th>
 <th>Total Amount</th>
 </tr>
 </thead>
 <tbody>
 {monthlyRows.map((row) => (
 <tr key={row.month}>
 <td>{row.month}</td>
 <td>{row.count}</td>
 <td>{formatInr(row.amount)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {!loading && completedJobs.length > 0 && (
 <div className="dash-section">
 <h3 className="dash-section-title">Recent Completed Jobs</h3>
 <table className="data-table">
 <thead>
 <tr>
 <th>Booking</th>
 <th>Service</th>
 <th>Date</th>
 <th>Amount</th>
 <th>Payment Status</th>
 </tr>
 </thead>
 <tbody>
 {completedJobs.slice(0, 8).map((job) => (
 <tr key={job._id || job.id}>
 <td>{job.bookingId}</td>
 <td>{job.service}</td>
 <td>{formatDate(job.scheduledDate)}</td>
 <td><HiOutlineCurrencyRupee style={{ verticalAlign: 'middle' }} /> {formatInr(job.amount)}</td>
 <td>
 <span className={`badge ${job.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
 {job.paymentStatus}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Payout Account Setup Modal */}
 {showPayoutModal && (
 <div style={{
 position: 'fixed', inset: 0, zIndex: 1000,
 background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
 }}>
 <div style={{ background: 'white', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <HiOutlineCreditCard style={{ color: '#2563eb' }} /> Payout Destination
 </h3>
 <form onSubmit={handleSavePayoutAccount}>
 <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
 <button
 type="button"
 className={payoutForm.payoutType === 'UPI' ? 'btn btn-primary' : 'btn btn-outline'}
 style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
 onClick={() => setPayoutForm((p) => ({ ...p, payoutType: 'UPI' }))}
 >
 <HiOutlineQrCode /> UPI ID
 </button>
 <button
 type="button"
 className={payoutForm.payoutType === 'BANK_ACCOUNT' ? 'btn btn-primary' : 'btn btn-outline'}
 style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
 onClick={() => setPayoutForm((p) => ({ ...p, payoutType: 'BANK_ACCOUNT' }))}
 >
 <HiOutlineBuildingLibrary /> Bank Account
 </button>
 </div>

 {payoutForm.payoutType === 'UPI' ? (
 <div style={{ marginBottom: '14px' }}>
 <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
 UPI ID (e.g. 9876543210@paytm or name@okaxis)
 </label>
 <input
 type="text"
 required
 placeholder="yourname@upi"
 value={payoutForm.upiId}
 onChange={(e) => setPayoutForm((p) => ({ ...p, upiId: e.target.value }))}
 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
 />
 </div>
 ) : (
 <>
 <div style={{ marginBottom: '12px' }}>
 <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
 Account Holder Name
 </label>
 <input
 type="text"
 required
 placeholder="Name as per Bank Record"
 value={payoutForm.accountHolderName}
 onChange={(e) => setPayoutForm((p) => ({ ...p, accountHolderName: e.target.value }))}
 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
 />
 </div>
 <div style={{ marginBottom: '12px' }}>
 <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
 Bank Account Number
 </label>
 <input
 type="text"
 required
 placeholder="Account number"
 value={payoutForm.accountNumber}
 onChange={(e) => setPayoutForm((p) => ({ ...p, accountNumber: e.target.value }))}
 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
 />
 </div>
 <div style={{ marginBottom: '14px' }}>
 <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
 IFSC Code
 </label>
 <input
 type="text"
 required
 placeholder="HDFC0001234"
 value={payoutForm.ifscCode}
 onChange={(e) => setPayoutForm((p) => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
 />
 </div>
 </>
 )}

 <div style={{ display: 'flex', gap: '10px' }}>
 <button
 type="button"
 className="btn btn-outline"
 style={{ flex: 1 }}
 onClick={() => setShowPayoutModal(false)}
 >
 Cancel
 </button>
 <button
 type="submit"
 className="btn btn-primary"
 style={{ flex: 1 }}
 disabled={savingAccount}
 >
 {savingAccount ? 'Saving...' : 'Save Account'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Withdrawal Request Modal */}
 {showWithdrawModal && (
 <div style={{
 position: 'fixed', inset: 0, zIndex: 1000,
 background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
 display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
 }}>
 <div style={{ background: 'white', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
 <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <HiOutlineBolt style={{ color: '#eab308' }} /> Request Withdrawal
 </h3>
 <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '14px' }}>
 Available Balance: <strong style={{ color: '#16a34a' }}>₹{availableBalance}</strong>
 </p>
 <form onSubmit={handleWithdrawalSubmit}>
 <div style={{ marginBottom: '14px' }}>
 <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>
 Withdrawal Amount (₹)
 </label>
 <input
 type="number"
 min="1"
 max={availableBalance}
 required
 placeholder="Amount"
 value={withdrawAmount}
 onChange={(e) => setWithdrawAmount(e.target.value)}
 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
 />
 </div>
 <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
 Transferring to: <strong>{payoutAccount ? (payoutAccount.payoutType === 'UPI' ? payoutAccount.upiId : payoutAccount.accountNumber) : 'None configured'}</strong>
 </div>
 <div style={{ display: 'flex', gap: '10px' }}>
 <button
 type="button"
 className="btn btn-outline"
 style={{ flex: 1 }}
 onClick={() => setShowWithdrawModal(false)}
 >
 Cancel
 </button>
 <button
 type="submit"
 className="btn btn-primary"
 style={{ flex: 1 }}
 disabled={submittingWithdrawal || !withdrawAmount || Number(withdrawAmount) > availableBalance}
 >
 {submittingWithdrawal ? 'Processing...' : 'Confirm Withdrawal'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 </div>
 );
};

export default WorkerEarnings;
