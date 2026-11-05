import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineBriefcase,
  HiOutlineCheckCircle,
  HiOutlineWrenchScrewdriver,
  HiOutlineMapPin,
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { requestAuth, roleHome, saveSession } from '../../utils/authSession.js';
import { WORKER_SERVICE_CATEGORIES } from '../../utils/serviceCategories.js';
import './AuthPages.css';

const EXPERIENCE_OPTIONS = [
  { value: 'Fresher', label: 'Fresher (No prior experience — Rookie)' },
  { value: '1-2 Years', label: '1–2 Years Experience' },
  { value: '3-5 Years', label: '3–5 Years Experience' },
  { value: '5+ Years Expert', label: '5+ Years (Senior Expert Pro)' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    serviceCategory: 'Home Repairs',
    skills: ['Plumber', 'Electrician'],
    city: 'Ahmedabad',
    experience: '1-2 Years',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCategoryChange = (categoryLabel) => {
    const matched = WORKER_SERVICE_CATEGORIES.find((c) => c.label === categoryLabel);
    setForm((prev) => ({
      ...prev,
      serviceCategory: categoryLabel,
      skills: matched?.skills?.slice(0, 2) || [],
    }));
  };

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const selectedCategoryObj = WORKER_SERVICE_CATEGORIES.find((c) => c.label === form.serviceCategory);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError(t('auth.validationError', 'Name, email, and password are required'));
      return;
    }
    if (form.role === 'worker' && (!form.serviceCategory || form.skills.length === 0)) {
      setError('Please select at least one skill for your worker profile.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      };

      if (form.role === 'worker') {
        payload.serviceCategory = form.serviceCategory;
        payload.skills = form.skills;
        payload.city = form.city;
        payload.experience = form.experience;
      }

      const data = await requestAuth('/auth/register', payload);
      saveSession({ token: data.token, user: data.user });
      navigate(roleHome[data.user.role], { replace: true });
    } catch (submitError) {
      setError(submitError.message || t('auth.error', 'Unable to create your account'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-grid">
        <section className="auth-panel">
          <span className="auth-kicker">{t('auth.join', 'Join ServeCircle')}</span>
          <h1 className="auth-title">{t('auth.createAccount', 'Create Account')}</h1>
          <p className="auth-subtitle">{t('auth.setupProfile', 'Set up your profile and get into your panel in one step.')}</p>

          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            <div className="input-group">
              <label htmlFor="register-name">{t('auth.fullName', 'Full Name')}</label>
              <input
                id="register-name"
                className="input-field"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder={t('auth.enterFullName', 'Enter full name')}
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-email">{t('auth.email', 'Email Address')}</label>
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
              <label htmlFor="register-phone">{t('auth.phone', 'Phone Number')}</label>
              <input
                id="register-phone"
                className="input-field"
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                placeholder={t('auth.tenDigitPhone', '10-digit mobile phone')}
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
                placeholder={t('auth.createPassword', 'Create secure password')}
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-role">{t('auth.accountType', 'Account Type / Panel Role')}</label>
              <select
                id="register-role"
                className="input-field"
                value={form.role}
                onChange={(event) => update('role', event.target.value)}
              >
                <option value="customer">Customer Panel (Book Services & AI Diagnosis)</option>
                <option value="worker">Worker Panel (Receive Jobs in 19 Main Services)</option>
                <option value="admin">Admin Panel (Management, Verification & Dispatch)</option>
                <option value="b2b">B2B Partner (Society Contracts & Fleet)</option>
              </select>
            </div>

            {/* ── WORKER-SPECIFIC ROLE & 19 SERVICES SELECTION ── */}
            {form.role === 'worker' && (
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e3a8a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HiOutlineBriefcase style={{ color: '#2563eb' }} /> Select Worker Service Role (19 Main Services):
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700, background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                    19 Options Available
                  </span>
                </div>

                {/* 19 Main Services Dropdown */}
                <select
                  className="input-field"
                  value={form.serviceCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  style={{ background: 'white', fontWeight: 700, borderColor: '#93c5fd' }}
                >
                  {WORKER_SERVICE_CATEGORIES.map((cat, idx) => (
                    <option key={cat.id} value={cat.label}>
                      {idx + 1}. {cat.label} — ({cat.shortDesc})
                    </option>
                  ))}
                </select>

                {/* Specific Skills in Selected Category */}
                {selectedCategoryObj && (
                  <div>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Tap skills you can perform in <strong>{selectedCategoryObj.label}</strong>:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedCategoryObj.skills.map((skill) => {
                        const isSkillChecked = form.skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '20px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              border: `1.5px solid ${isSkillChecked ? '#2563eb' : '#cbd5e1'}`,
                              background: isSkillChecked ? '#2563eb' : 'white',
                              color: isSkillChecked ? 'white' : '#1e293b',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isSkillChecked && <HiOutlineCheckCircle />}
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* City and Experience */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      <HiOutlineMapPin style={{ verticalAlign: 'middle' }} /> Service City
                    </label>
                    <input
                      className="input-field"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      placeholder="e.g. Ahmedabad"
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Experience Level
                    </label>
                    <select
                      className="input-field"
                      value={form.experience}
                      onChange={(e) => update('experience', e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '8px' }}
                    >
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#166534', background: '#f0fdf4', padding: '8px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  💡 Want step-by-step visual onboarding? <Link to="/register/worker" style={{ color: '#15803d', fontWeight: 800 }}>Open Pro Worker Registration</Link>
                </div>
              </div>
            )}

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-form-footer">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('auth.creatingAccount', 'Creating account...') : t('auth.createAccountBtn', 'Create Account')}
                <HiOutlineArrowRight />
              </button>
              <span className="auth-hint">
                {t('auth.alreadyRegistered', 'Already registered? ')} <Link to="/login" className="auth-alt-link">{t('auth.signIn', 'Sign in')}</Link>
              </span>
            </div>
          </form>
        </section>

        {/* ── RIGHT ASIDE ── */}
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
              <div className="auth-role-head"><span className="auth-role-name" style={{ color: '#f59e0b' }}>{t('auth.benefit3Title', '19 Main Service Hubs')}</span><HiOutlineUserGroup style={{ color: '#f59e0b' }} /></div>
              <p className="auth-role-text">Seamless coverage across Home Repairs, Vehicle Care, IT, Events, Pet Care, Shifting & Society Management.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RegisterPage;
