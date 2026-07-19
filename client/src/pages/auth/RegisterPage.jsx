import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineUserPlus, HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineClock } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import './AuthPages.css';

const defaultByRole = {
  customer: '/customer',
  worker: '/worker',
  admin: '/admin',
  b2b: '/b2b',
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState('');

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError(t('auth.validationError', 'Name, email, and password are required'));
      return;
    }
    setError('');
    navigate(defaultByRole[form.role]);
  };

  return (
    <div className="auth-page">
      <div className="container auth-grid">
        <section className="auth-panel">
          <span className="auth-kicker">{t('auth.join', 'Join ServeCircle')}</span>
          <h1 className="auth-title">{t('auth.createAccount', 'Create account')}</h1>
          <p className="auth-subtitle">{t('auth.setupProfile', 'Set up your profile and get into your panel in one step.')}</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="register-name">{t('auth.fullName', 'Full name')}</label>
              <input
                id="register-name"
                className="input-field"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder={t('auth.enterFullName', 'Enter full name')}
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-email">{t('auth.email', 'Email')}</label>
              <input
                id="register-email"
                type="email"
                className="input-field"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-phone">{t('auth.phone', 'Phone')}</label>
              <input
                id="register-phone"
                className="input-field"
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                placeholder={t('auth.tenDigitPhone', '10-digit phone')}
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-password">{t('auth.password', 'Password')}</label>
              <input
                id="register-password"
                type="password"
                className="input-field"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                placeholder={t('auth.createPassword', 'Create password')}
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-role">{t('auth.accountType', 'Account type')}</label>
              <select
                id="register-role"
                className="input-field"
                value={form.role}
                onChange={(event) => update('role', event.target.value)}
              >
                <option value="customer">{t('auth.customer', 'Customer')}</option>
                <option value="worker">{t('auth.worker', 'Worker')}</option>
                <option value="admin">{t('auth.admin', 'Admin')}</option>
                <option value="b2b">{t('auth.b2b', 'B2B Partner')}</option>
              </select>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-form-footer">
              <button className="btn btn-primary" type="submit">
                {t('auth.createAccountBtn', 'Create account')}
                <HiOutlineArrowRight />
              </button>
              <span className="auth-hint">
                {t('auth.alreadyRegistered', 'Already registered? ')} <Link to="/login" className="auth-alt-link">{t('auth.signIn', 'Sign in')}</Link>
              </span>
            </div>
          </form>
        </section>

        <aside className="auth-panel">
          <h2 className="auth-side-title">{t('auth.whatYouGet', 'What you get')}</h2>
          <div className="auth-role-grid">
            <div className="auth-role-card">
              <div className="auth-role-head"><span className="auth-role-name" style={{ color: '#2563eb' }}>{t('auth.benefit1Title', 'Under 30-min Response')}</span><HiOutlineClock style={{ color: '#2563eb' }} /></div>
              <p className="auth-role-text">{t('auth.benefit1Desc', 'Get verified professionals at your doorstep instantly or schedule for later.')}</p>
            </div>
            <div className="auth-role-card">
              <div className="auth-role-head"><span className="auth-role-name" style={{ color: '#3b7dc1' }}>{t('auth.benefit2Title', 'Secure & Verified')}</span><HiOutlineShieldCheck style={{ color: '#3b7dc1' }} /></div>
              <p className="auth-role-text">{t('auth.benefit2Desc', 'Every service provider undergoes a strict police verification and background check.')}</p>
            </div>
            <div className="auth-role-card">
              <div className="auth-role-head"><span className="auth-role-name" style={{ color: '#f59e0b' }}>{t('auth.benefit3Title', 'Community Discounts')}</span><HiOutlineUserGroup style={{ color: '#f59e0b' }} /></div>
              <p className="auth-role-text">{t('auth.benefit3Desc', "Join your society's active bookings and unlock up to 30% group discounts.")}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RegisterPage;
