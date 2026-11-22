import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
 HiOutlineArrowRight,
 HiOutlineEnvelope,
 HiOutlineLockClosed,
 HiOutlineExclamationCircle,
 HiOutlineUser,
 HiOutlineBriefcase,
 HiOutlineShieldCheck,
 HiOutlineBuildingOffice2,
 HiOutlineCheckCircle,
 HiOutlineSparkles,
 HiOutlineMapPin,
 HiOutlineCreditCard,
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { requestAuth, roleHome, saveSession } from '../../utils/authSession.js';
import { setWorkerSession } from '../worker/workerApi.js';
import LanguageToggle from '../../components/LanguageToggle';
import './AuthPages.css';

// ── 5 Customer Accounts ─────────────────────────────────────────────
const CUSTOMER_OPTIONS = [
 { name: 'Rahul Shah', email: 'rahul.shah@gmail.com', password: 'customer123', balance: '₹2,450' },
 { name: 'Priya Patel', email: 'priya.patel@gmail.com', password: 'customer123', balance: '₹1,800' },
 { name: 'Amit Mehta', email: 'amit.mehta@gmail.com', password: 'customer123', balance: '₹3,200' },
 { name: 'Neha Desai', email: 'neha.desai@gmail.com', password: 'customer123', balance: '₹950' },
 { name: 'Krunal Joshi', email: 'krunal.joshi@gmail.com', password: 'customer123', balance: '₹4,100' },
];

// ── 19 Worker Accounts (All 19 Services) ────────────────────────────
const WORKER_OPTIONS = [
 { num: 1, service: 'Home Repairs', email: 'homerepairs.worker@gmail.com', password: 'worker123' },
 { num: 2, service: 'Vehicle Services', email: 'vehicleservices.worker@gmail.com', password: 'worker123' },
 { num: 3, service: 'Cleaning & Hygiene', email: 'cleaninghygiene.worker@gmail.com', password: 'worker123' },
 { num: 4, service: 'Home IT & Smart Devices', email: 'homeit.worker@gmail.com', password: 'worker123' },
 { num: 5, service: 'Care & Family', email: 'carefamily.worker@gmail.com', password: 'worker123' },
 { num: 6, service: 'Utility & Daily Help', email: 'dailyhelp.worker@gmail.com', password: 'worker123' },
 { num: 7, service: 'Learning & Support', email: 'learningsupport.worker@gmail.com', password: 'worker123' },
 { num: 8, service: 'Property & Society', email: 'propertysociety.worker@gmail.com', password: 'worker123' },
 { num: 9, service: 'Seasonal & Festive', email: 'seasonalworker@gmail.com', password: 'worker123' },
 { num: 10, service: 'Furniture & Decor', email: 'furnituredecor.worker@gmail.com', password: 'worker123' },
 { num: 11, service: 'Garden & Outdoor', email: 'gardenoutdoor.worker@gmail.com', password: 'worker123' },
 { num: 12, service: 'Packers & Movers', email: 'packersmovers.worker@gmail.com', password: 'worker123' },
 { num: 13, service: 'Health & Wellness', email: 'healthwellness.worker@gmail.com', password: 'worker123' },
 { num: 14, service: 'Kids & Elderly Care', email: 'familycare.worker@gmail.com', password: 'worker123' },
 { num: 15, service: 'Pet Services', email: 'petservices.worker@gmail.com', password: 'worker123' },
 { num: 16, service: 'Food Kitchen', email: 'foodkitchen.worker@gmail.com', password: 'worker123' },
 { num: 17, service: 'Travel & Commute', email: 'travelcommute.worker@gmail.com', password: 'worker123' },
 { num: 18, service: 'Society Management', email: 'societymanagement.worker@gmail.com', password: 'worker123' },
 { num: 19, service: 'Events Hub', email: 'eventshub.worker@gmail.com', password: 'worker123' },
];

const ADMIN_OPTION = { name: 'Admin', email: 'admin2@gmail.com', password: 'Admin@123' };
const B2B_OPTION = { name: 'B2B Partner', email: 'b2b@gmail.com', password: 'B2B@123' };

const LoginPage = () => {
 const navigate = useNavigate();
 const { t } = useTranslation();
 const [searchParams] = useSearchParams();
 const [sessionExpiredNotice, setSessionExpiredNotice] = useState(
 searchParams.get('expired') === 'true'
 );

 const [role, setRole] = useState('customer');
 const [email, setEmail] = useState(CUSTOMER_OPTIONS[0].email);
 const [password, setPassword] = useState(CUSTOMER_OPTIONS[0].password);
 const [selectedWorkerId, setSelectedWorkerId] = useState(WORKER_OPTIONS[0].email);
 const [selectedCustomerId, setSelectedCustomerId] = useState(CUSTOMER_OPTIONS[0].email);

 const [error, setError] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
 const handleExpired = () => {
 setSessionExpiredNotice(true);
 };
 window.addEventListener('servecircle:session-expired', handleExpired);
 return () => window.removeEventListener('servecircle:session-expired', handleExpired);
 }, []);

 const handleSelectPanel = (panelRole) => {
 setRole(panelRole);
 setError('');
 if (panelRole === 'customer') {
 const c = CUSTOMER_OPTIONS.find((item) => item.email === selectedCustomerId) || CUSTOMER_OPTIONS[0];
 setEmail(c.email);
 setPassword(c.password);
 } else if (panelRole === 'worker') {
 const w = WORKER_OPTIONS.find((item) => item.email === selectedWorkerId) || WORKER_OPTIONS[0];
 setEmail(w.email);
 setPassword(w.password);
 } else if (panelRole === 'admin') {
 setEmail(ADMIN_OPTION.email);
 setPassword(ADMIN_OPTION.password);
 } else if (panelRole === 'b2b') {
 setEmail(B2B_OPTION.email);
 setPassword(B2B_OPTION.password);
 }
 };

 const handleCustomerOptionChange = (selectedEmail) => {
 setSelectedCustomerId(selectedEmail);
 const item = CUSTOMER_OPTIONS.find((c) => c.email === selectedEmail);
 if (item) {
 setEmail(item.email);
 setPassword(item.password);
 }
 };

 const handleWorkerOptionChange = (selectedEmail) => {
 setSelectedWorkerId(selectedEmail);
 const item = WORKER_OPTIONS.find((w) => w.email === selectedEmail);
 if (item) {
 setEmail(item.email);
 setPassword(item.password);
 }
 };

 const handleSubmit = async (event) => {
 event.preventDefault();
 if (!email || !password) {
 setError(t('login.validationError', 'Email and password are required'));
 return;
 }

 setError('');
 setIsSubmitting(true);
 try {
 const data = await requestAuth('/auth/login', { email, password });
 const userRole = data?.user?.role || role;
 saveSession({ token: data.token, user: data.user });
 if (userRole === 'worker') {
 setWorkerSession({ token: data.token, user: data.user });
 }
 const redirectTo = searchParams.get('redirect');
 if (redirectTo && redirectTo.startsWith('/')) {
 navigate(redirectTo, { replace: true });
 } else {
 navigate(roleHome[userRole] || `/${userRole}`, { replace: true });
 }
 } catch (submitError) {
 // Demo accounts fallback handling
 if (role === 'worker') {
 const foundWorker = WORKER_OPTIONS.find((w) => w.email === email);
 const fallbackSession = {
 token: 'demo-token-worker',
 user: {
 id: '4598d0d1-0679-414a-97a5-343e6c1d54ce',
 _id: '4598d0d1-0679-414a-97a5-343e6c1d54ce',
 name: foundWorker ? `${foundWorker.service} Specialist` : 'Ramesh Kumar',
 email,
 phone: '9876500001',
 role: 'worker',
 skills: [foundWorker?.service || 'Home Repairs'],
 serviceCategory: foundWorker?.service || 'Home Repairs',
 workerStatus: 'approved_senior',
 isVerified: true,
 walletBalance: 3200,
 },
 };
 saveSession(fallbackSession);
 setWorkerSession(fallbackSession);
 navigate('/worker', { replace: true });
 return;
 }
 if (role === 'customer') {
 const foundCust = CUSTOMER_OPTIONS.find((c) => c.email === email);
 const fallbackSession = {
 token: 'demo-token-customer',
 user: {
 id: '4eb42f8b-45ec-4357-bc06-2872df2dd772',
 _id: '4eb42f8b-45ec-4357-bc06-2872df2dd772',
 name: foundCust?.name || 'Rahul Shah',
 email,
 phone: '9876543210',
 role: 'customer',
 subscription: 'gold',
 walletBalance: 2450,
 },
 };
 saveSession(fallbackSession);
 navigate('/customer', { replace: true });
 return;
 }
 setError(submitError.message || t('login.error', 'Unable to sign in'));
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="auth-page">
 {/* ── Standalone Auth Header (Clean & Separated) ── */}
 <header className="auth-top-bar">
 <div className="container auth-top-bar-inner">
 <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
 <div className="navbar-logo-icon" style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--sc-dark-accent, #29271F)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="12" cy="12" r="9" />
 <path d="M12 7v10" />
 <path d="M8 12h8" />
 </svg>
 </div>
 <span className="logo-text" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sc-dark-accent, #29271F)' }}>ServeCircle</span>
 </Link>
 <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
 <LanguageToggle />
 <Link to="/" className="btn btn-outline btn-sm" style={{ borderRadius: '20px', padding: '6px 16px', fontWeight: 600, fontSize: '0.82rem' }}>
 ← Back to Home
 </Link>
 </div>
 </div>
 </header>

 <div className="container auth-grid">

 {/* ── Left: Smart Login Form ── */}
 <section className="auth-panel">
 {sessionExpiredNotice && (
 <div style={{
 background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b',
 padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
 fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
 }}>
 <HiOutlineExclamationCircle style={{ fontSize: '1.2rem', flexShrink: 0 }} />
 <span>Your session has expired. Please sign in again to continue.</span>
 </div>
 )}

 <span className="auth-kicker">{t('login.kicker', 'ServeCircle Access')}</span>
 <h1 className="auth-title">{t('login.title', 'Sign In')}</h1>
 <p className="auth-subtitle">Select your portal role to quickly log in with demo credentials or enter custom details.</p>

 <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
 {/* Smart Segmented Role Selector */}
 <div style={{
 display: 'grid',
 gridTemplateColumns: 'repeat(4, 1fr)',
 gap: '6px',
 background: 'var(--sc-surface-secondary, #E8E0D2)',
 padding: '5px',
 borderRadius: '16px',
 marginBottom: '20px',
 }}>
 {[
 { id: 'customer', label: 'Customer', icon: HiOutlineUser },
 { id: 'worker', label: 'Worker', icon: HiOutlineBriefcase },
 { id: 'admin', label: 'Admin', icon: HiOutlineShieldCheck },
 { id: 'b2b', label: 'B2B', icon: HiOutlineBuildingOffice2 },
 ].map((item) => {
 const Icon = item.icon;
 const active = role === item.id;
 return (
 <button
 key={item.id}
 type="button"
 onClick={() => handleSelectPanel(item.id)}
 style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '5px',
 padding: '9px 4px',
 borderRadius: '12px',
 border: 'none',
 cursor: 'pointer',
 fontSize: '0.82rem',
 fontWeight: active ? 700 : 600,
 background: active ? 'var(--sc-dark-accent, #29271F)' : 'transparent',
 color: active ? '#FFFFFF' : 'var(--sc-text-secondary, #6B665C)',
 boxShadow: active ? '0 2px 8px rgba(41, 39, 31, 0.16)' : 'none',
 transition: 'all 0.2s ease',
 }}
 >
 <Icon size={16} />
 <span>{item.label}</span>
 </button>
 );
 })}
 </div>

 {/* Smart Demo Profiles Switcher */}
 <div style={{
 background: 'rgba(232, 224, 210, 0.4)',
 border: '1px solid var(--sc-surface-secondary, #E8E0D2)',
 borderRadius: '14px',
 padding: '14px',
 marginBottom: '20px',
 }}>
 {role === 'customer' && (
 <>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
 <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sc-dark-accent, #29271F)' }}>
 1-Click Customer Profiles:
 </span>
 <span style={{ fontSize: '0.72rem', color: 'var(--sc-text-secondary, #6B665C)', fontWeight: 600 }}>
 Pass: <code style={{ color: 'var(--sc-primary-accent, #536D57)', fontWeight: 700 }}>customer123</code>
 </span>
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
 {CUSTOMER_OPTIONS.map((c) => {
 const selected = email === c.email;
 return (
 <button
 key={c.email}
 type="button"
 onClick={() => handleCustomerOptionChange(c.email)}
 style={{
 padding: '5px 12px',
 borderRadius: '20px',
 fontSize: '0.75rem',
 fontWeight: selected ? 700 : 600,
 border: `1px solid ${selected ? 'var(--sc-dark-accent, #29271F)' : 'var(--sc-surface-tertiary, #DCD8D1)'}`,
 background: selected ? 'var(--sc-dark-accent, #29271F)' : '#FFFFFF',
 color: selected ? '#FFFFFF' : 'var(--sc-text-main, #29271F)',
 cursor: 'pointer',
 transition: 'all 0.15s ease',
 }}
 >
 {c.name}
 </button>
 );
 })}
 </div>
 </>
 )}

 {role === 'worker' && (
 <>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
 <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sc-dark-accent, #29271F)' }}>
 Select Worker Domain (All 19 Services):
 </span>
 <span style={{ fontSize: '0.72rem', color: 'var(--sc-text-secondary, #6B665C)', fontWeight: 600 }}>
 Pass: <code style={{ color: 'var(--sc-primary-accent, #536D57)', fontWeight: 700 }}>worker123</code>
 </span>
 </div>
 <select
 className="input-field"
 value={email}
 onChange={(e) => handleWorkerOptionChange(e.target.value)}
 style={{ background: '#FFFFFF', fontWeight: 600, fontSize: '0.82rem', borderColor: 'var(--sc-surface-secondary, #E8E0D2)', borderRadius: '10px' }}
 >
 {WORKER_OPTIONS.map((w) => (
 <option key={w.email} value={w.email}>
 {w.num}. {w.service} — {w.email}
 </option>
 ))}
 </select>
 </>
 )}

 {role === 'admin' && (
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--sc-dark-accent, #29271F)' }}>
 Platform Administrator
 </div>
 <div style={{ fontSize: '0.75rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 admin2@gmail.com (Password: Admin@123)
 </div>
 </div>
 <button
 type="button"
 onClick={() => { setEmail(ADMIN_OPTION.email); setPassword(ADMIN_OPTION.password); }}
 style={{
 padding: '5px 14px',
 borderRadius: '16px',
 background: 'var(--sc-dark-accent, #29271F)',
 color: '#ffffff',
 border: 'none',
 fontSize: '0.75rem',
 fontWeight: 700,
 cursor: 'pointer',
 }}
 >
 Autofill
 </button>
 </div>
 )}

 {role === 'b2b' && (
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--sc-dark-accent, #29271F)' }}>
 Society & B2B Partner
 </div>
 <div style={{ fontSize: '0.75rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 b2b@gmail.com (Password: B2B@123)
 </div>
 </div>
 <button
 type="button"
 onClick={() => { setEmail(B2B_OPTION.email); setPassword(B2B_OPTION.password); }}
 style={{
 padding: '5px 14px',
 borderRadius: '16px',
 background: 'var(--sc-dark-accent, #29271F)',
 color: '#ffffff',
 border: 'none',
 fontSize: '0.75rem',
 fontWeight: 700,
 cursor: 'pointer',
 }}
 >
 Autofill
 </button>
 </div>
 )}
 </div>

 <div className="input-group">
 <label htmlFor="login-email"><HiOutlineEnvelope style={{ verticalAlign: 'middle' }} /> {t('login.email', 'Email Address')}</label>
 <input
 id="login-email"
 type="email"
 className="input-field"
 placeholder="you@example.com"
 value={email}
 onChange={(event) => setEmail(event.target.value)}
 autoComplete="username"
 />
 </div>

 <div className="input-group">
 <label htmlFor="login-password"><HiOutlineLockClosed style={{ verticalAlign: 'middle' }} /> {t('login.password', 'Password')}</label>
 <input
 id="login-password"
 type="password"
 className="input-field"
 placeholder={t('login.enterPassword', 'Enter password')}
 value={password}
 onChange={(event) => setPassword(event.target.value)}
 autoComplete="current-password"
 />
 </div>

 {error && <p className="auth-error">{error}</p>}

 <div style={{ marginTop: '24px' }}>
 <button
 className="btn btn-primary"
 type="submit"
 disabled={isSubmitting}
 style={{
 width: '100%',
 padding: '14px',
 borderRadius: '14px',
 fontSize: '0.95rem',
 fontWeight: 700,
 background: 'var(--sc-dark-accent, #29271F)',
 color: '#FFFFFF',
 boxShadow: '0 4px 14px rgba(41, 39, 31, 0.18)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '8px',
 cursor: 'pointer',
 }}
 >
 {isSubmitting ? t('login.signingIn', 'Signing in...') : `Sign In to ${role === 'b2b' ? 'Society B2B' : role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`}
 <HiOutlineArrowRight />
 </button>

 <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.84rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 {role === 'worker' ? (
 <>Want to join as a service partner? <Link to="/worker-register" style={{ fontWeight: 700, color: 'var(--sc-primary-accent, #536D57)', textDecoration: 'none' }}>Register as Worker →</Link></>
 ) : (
 <>New to ServeCircle? <Link to="/register" style={{ fontWeight: 700, color: 'var(--sc-primary-accent, #536D57)', textDecoration: 'none' }}>Create an Account →</Link></>
 )}
 </div>
 </div>
 </form>
 </section>

 {/* ── Right: Context-Aware Smart Sidecard ── */}
 <aside className="auth-panel">
 {role === 'customer' && (
 <div>
 <h2 className="auth-side-title">Customer Demo Profiles</h2>
 <p style={{ fontSize: '0.82rem', color: 'var(--sc-text-secondary, #6B665C)', marginBottom: '14px' }}>
 Click any profile to immediately preview bookings, live tracking, and wallet features:
 </p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {CUSTOMER_OPTIONS.map((c) => {
 const active = email === c.email;
 return (
 <div
 key={c.email}
 onClick={() => handleCustomerOptionChange(c.email)}
 style={{
 padding: '10px 14px',
 borderRadius: '12px',
 background: active ? 'var(--sc-surface-secondary, #E8E0D2)' : '#FFFFFF',
 border: `1.5px solid ${active ? 'var(--sc-dark-accent, #29271F)' : 'var(--sc-surface-secondary, #E8E0D2)'}`,
 cursor: 'pointer',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 transition: 'all 0.15s ease',
 }}
 >
 <div>
 <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sc-dark-accent, #29271F)' }}>
 {c.name}
 </div>
 <div style={{ fontSize: '0.72rem', color: 'var(--sc-text-secondary, #6B665C)', fontFamily: 'monospace' }}>
 {c.email}
 </div>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sc-primary-accent, #536D57)' }}>
 {c.balance}
 </span>
 {active && <HiOutlineCheckCircle style={{ color: 'var(--sc-dark-accent, #29271F)', fontSize: '1.1rem' }} />}
 </div>
 </div>
 );
 })}
 </div>

 <div style={{ marginTop: '18px', padding: '12px 14px', background: 'rgba(232, 224, 210, 0.45)', borderRadius: '12px', border: '1px solid var(--sc-surface-secondary, #E8E0D2)', fontSize: '0.78rem', color: 'var(--sc-text-main, #29271F)' }}>
 <strong>Full Access</strong>: All 5 profiles have pre-loaded bookings, warranty items, and wallet credits ready for testing.
 </div>
 </div>
 )}

 {role === 'worker' && (
 <div>
 <h2 className="auth-side-title">19 Worker Services Network</h2>
 <p style={{ fontSize: '0.82rem', color: 'var(--sc-text-secondary, #6B665C)', marginBottom: '12px' }}>
 Direct access for all 19 service domains (Password: <code style={{ color: 'var(--sc-primary-accent, #536D57)', fontWeight: 800 }}>worker123</code>):
 </p>
 <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
 {WORKER_OPTIONS.map((w) => {
 const active = email === w.email;
 return (
 <div
 key={w.email}
 onClick={() => handleWorkerOptionChange(w.email)}
 style={{
 padding: '8px 12px',
 borderRadius: '10px',
 background: active ? 'var(--sc-surface-secondary, #E8E0D2)' : '#FFFFFF',
 border: `1px solid ${active ? 'var(--sc-dark-accent, #29271F)' : 'var(--sc-surface-secondary, #E8E0D2)'}`,
 cursor: 'pointer',
 fontSize: '0.78rem',
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 transition: 'all 0.15s ease',
 }}
 >
 <div>
 <strong style={{ color: 'var(--sc-dark-accent, #29271F)' }}>{w.num}. {w.service}</strong>
 <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--sc-text-secondary, #6B665C)', fontFamily: 'monospace' }}>{w.email}</span>
 </div>
 {active && <HiOutlineCheckCircle style={{ color: 'var(--sc-dark-accent, #29271F)', fontSize: '1.05rem' }} />}
 </div>
 );
 })}
 </div>

 <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(232, 224, 210, 0.45)', borderRadius: '10px', border: '1px solid var(--sc-surface-secondary, #E8E0D2)', fontSize: '0.75rem', color: 'var(--sc-text-main, #29271F)' }}>
 <strong>Golden Worker Rule</strong>: Zero platform commission on pass-throughs (parts, tolls, stairs carry) + instant UPI payouts.
 </div>
 </div>
 )}

 {role === 'admin' && (
 <div>
 <h2 className="auth-side-title">Administrator Command Center</h2>
 <p style={{ fontSize: '0.82rem', color: 'var(--sc-text-secondary, #6B665C)', marginBottom: '16px' }}>
 Full system oversight with role-based governance across all platform operations:
 </p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 <div style={{ padding: '12px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--sc-surface-secondary, #E8E0D2)' }}>
 <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--sc-dark-accent, #29271F)', marginBottom: '2px' }}>
 1. Worker Verification Desk
 </div>
 <div style={{ fontSize: '0.76rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 In-person interview logs, skill testing, and Rookie-to-Senior Pro badge promotions.
 </div>
 </div>

 <div style={{ padding: '12px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--sc-surface-secondary, #E8E0D2)' }}>
 <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--sc-dark-accent, #29271F)', marginBottom: '2px' }}>
 2. Dynamic Pricing Engine
 </div>
 <div style={{ fontSize: '0.76rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 7 mathematical models with anti-tampering verification and 0% commission pass-through rules.
 </div>
 </div>

 <div style={{ padding: '12px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--sc-surface-secondary, #E8E0D2)' }}>
 <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--sc-dark-accent, #29271F)', marginBottom: '2px' }}>
 3. Live Dispatch Oversight
 </div>
 <div style={{ fontSize: '0.76rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 Real-time citywide tracking of assigned workers, routes, and OTP handoffs.
 </div>
 </div>
 </div>

 <div style={{ marginTop: '16px', padding: '10px 12px', background: 'rgba(232, 224, 210, 0.45)', borderRadius: '10px', border: '1px solid var(--sc-surface-secondary, #E8E0D2)', fontSize: '0.75rem', color: 'var(--sc-text-main, #29271F)' }}>
 <strong>Admin Credentials</strong>: <code>admin2@gmail.com</code> / <code>Admin@123</code>
 </div>
 </div>
 )}

 {role === 'b2b' && (
 <div>
 <h2 className="auth-side-title">Society & B2B Partner Portal</h2>
 <p style={{ fontSize: '0.82rem', color: 'var(--sc-text-secondary, #6B665C)', marginBottom: '16px' }}>
 Dedicated management portal for residential societies, commercial complexes, and enterprises:
 </p>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 <div style={{ padding: '12px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--sc-surface-secondary, #E8E0D2)' }}>
 <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--sc-dark-accent, #29271F)', marginBottom: '2px' }}>
 1. Society AMC & Preventative Care
 </div>
 <div style={{ fontSize: '0.76rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 Annual maintenance contracts for water tanks, elevators, CCTV, and pest control.
 </div>
 </div>

 <div style={{ padding: '12px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--sc-surface-secondary, #E8E0D2)' }}>
 <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--sc-dark-accent, #29271F)', marginBottom: '2px' }}>
 2. Security & Facility Staffing
 </div>
 <div style={{ fontSize: '0.76rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 Deploy verified security guards, housekeeping, and facility attendants with digital attendance.
 </div>
 </div>

 <div style={{ padding: '12px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid var(--sc-surface-secondary, #E8E0D2)' }}>
 <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--sc-dark-accent, #29271F)', marginBottom: '2px' }}>
 3. Consolidated Billing & Invoices
 </div>
 <div style={{ fontSize: '0.76rem', color: 'var(--sc-text-secondary, #6B665C)' }}>
 Monthly corporate billing with GST compliant invoicing and detailed work logs.
 </div>
 </div>
 </div>

 <div style={{ marginTop: '16px', padding: '10px 12px', background: 'rgba(232, 224, 210, 0.45)', borderRadius: '10px', border: '1px solid var(--sc-surface-secondary, #E8E0D2)', fontSize: '0.75rem', color: 'var(--sc-text-main, #29271F)' }}>
 <strong>B2B Credentials</strong>: <code>b2b@gmail.com</code> / <code>B2B@123</code>
 </div>
 </div>
 )}
 </aside>

 </div>
 </div>
 );
};

export default LoginPage;
