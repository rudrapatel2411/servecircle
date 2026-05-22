import { useState } from 'react';
import '../Dashboard.css';

const WorkerAuthPrompt = ({ onSignIn, loading, error }) => {
  const [email, setEmail] = useState('ramesh@test.com');
  const [password, setPassword] = useState('test123');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }

    try {
      await onSignIn(email, password);
    } catch {
      // Error is shown from parent state
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Worker Panel</h1>
          <p className="page-subtitle">Sign in to manage jobs, schedule, and earnings.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <h3 style={{ marginBottom: 8 }}>Worker Login</h3>
        <p style={{ color: 'var(--gray-500)', marginBottom: 18, fontSize: '0.9rem' }}>
          Demo credentials are prefilled from the seeded database.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="worker-email">Email</label>
            <input
              id="worker-email"
              className="input-field"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="worker-password">Password</label>
            <input
              id="worker-password"
              className="input-field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          {(formError || error) && (
            <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.88rem' }}>
              {formError || error}
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in as Worker'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerAuthPrompt;
