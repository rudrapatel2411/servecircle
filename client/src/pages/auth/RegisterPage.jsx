import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineUserPlus } from 'react-icons/hi2';
import './AuthPages.css';

const defaultByRole = {
  customer: '/customer',
  worker: '/worker',
  admin: '/admin',
  b2b: '/b2b',
};

const RegisterPage = () => {
  const navigate = useNavigate();
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
      setError('Name, email, and password are required');
      return;
    }
    setError('');
    navigate(defaultByRole[form.role]);
  };

  return (
    <div className="auth-page">
      <div className="container auth-grid">
        <section className="auth-panel">
          <span className="auth-kicker">Join ServeCircle</span>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Set up your profile and get into your panel in one step.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                className="input-field"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-email">Email</label>
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
              <label htmlFor="register-phone">Phone</label>
              <input
                id="register-phone"
                className="input-field"
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
                placeholder="10-digit phone"
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                className="input-field"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                placeholder="Create password"
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-role">Account type</label>
              <select
                id="register-role"
                className="input-field"
                value={form.role}
                onChange={(event) => update('role', event.target.value)}
              >
                <option value="customer">Customer</option>
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
                <option value="b2b">B2B Partner</option>
              </select>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <div className="auth-form-footer">
              <button className="btn btn-primary" type="submit">
                Create account
                <HiOutlineArrowRight />
              </button>
              <span className="auth-hint">
                Already registered? <Link to="/login" className="auth-alt-link">Sign in</Link>
              </span>
            </div>
          </form>
        </section>

        <aside className="auth-panel">
          <h2 className="auth-side-title">What you get</h2>
          <div className="auth-role-grid">
            <div className="auth-role-card">
              <div className="auth-role-head"><span className="auth-role-name">Smart service flows</span><HiOutlineUserPlus /></div>
              <p className="auth-role-text">Role-specific dashboards for customer, worker, admin, and B2B operations.</p>
            </div>
            <div className="auth-role-card">
              <div className="auth-role-head"><span className="auth-role-name">Single design system</span><HiOutlineUserPlus /></div>
              <p className="auth-role-text">Consistent layout, tables, forms, and cards across every panel.</p>
            </div>
            <div className="auth-role-card">
              <div className="auth-role-head"><span className="auth-role-name">Scalable foundation</span><HiOutlineUserPlus /></div>
              <p className="auth-role-text">Ready to connect with backend auth and production-ready permission logic.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RegisterPage;
