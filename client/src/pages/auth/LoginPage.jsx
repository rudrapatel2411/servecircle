import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowRight,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
} from 'react-icons/hi2';
import './AuthPages.css';

const roleRoutes = {
  customer: '/customer',
  worker: '/worker',
  admin: '/admin',
  b2b: '/b2b',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setError('');
    navigate(roleRoutes[role]);
  };

  return (
    <div className="auth-page">
      <div className="container auth-grid">
        <section className="auth-panel">
          <span className="auth-kicker">ServeCircle Access</span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to access your panel and continue your workflow.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-email"><HiOutlineEnvelope style={{ verticalAlign: 'middle' }} /> Email</label>
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
              <label htmlFor="login-password"><HiOutlineLockClosed style={{ verticalAlign: 'middle' }} /> Password</label>
              <input
                id="login-password"
                type="password"
                className="input-field"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="input-group">
              <label htmlFor="login-role">Login as</label>
              <select
                id="login-role"
                className="input-field"
                value={role}
                onChange={(event) => setRole(event.target.value)}
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
                Continue
                <HiOutlineArrowRight />
              </button>
              <span className="auth-hint">
                New here? <Link to="/register" className="auth-alt-link">Create account</Link>
              </span>
            </div>
          </form>
        </section>

        <aside className="auth-panel">
          <h2 className="auth-side-title">Quick panel access</h2>
          <div className="auth-role-grid">
            <Link className="auth-role-card" to="/customer">
              <div className="auth-role-head"><span className="auth-role-name">Customer Panel</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">Book services, track jobs, and manage wallet.</p>
            </Link>
            <Link className="auth-role-card" to="/worker">
              <div className="auth-role-head"><span className="auth-role-name">Worker Panel</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">Accept jobs, manage schedule, and track earnings.</p>
            </Link>
            <Link className="auth-role-card" to="/admin">
              <div className="auth-role-head"><span className="auth-role-name">Admin Panel</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">Operate bookings, analytics, complaints, and partners.</p>
            </Link>
            <Link className="auth-role-card" to="/b2b">
              <div className="auth-role-head"><span className="auth-role-name">B2B Panel</span><HiOutlineArrowRight /></div>
              <p className="auth-role-text">Handle contracts, team accounts, and invoices.</p>
            </Link>
          </div>
          <p className="auth-note">
            Demo mode: navigation is role-based UI access. Authentication APIs can be wired directly later.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default LoginPage;
