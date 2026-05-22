import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowPath,
  HiOutlineCheckBadge,
  HiOutlineUserCircle,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import {
  fetchWorkerJobs,
  fetchWorkerProfile,
  updateWorkerProfile,
} from './workerApi';
import { formatInr } from './workerHelpers';
import '../Dashboard.css';

const WorkerProfile = () => {
  const { t } = useTranslation();
  const {
    token,
    isAuthenticated,
    signIn,
    authError,
    authLoading,
    refreshProfile,
  } = useWorkerAuth();

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatar: '',
    skills: '',
  });

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [profileData, jobsData] = await Promise.all([
        fetchWorkerProfile(token),
        fetchWorkerJobs(token),
      ]);
      setProfile(profileData);
      setJobs(jobsData);
      setForm({
        name: profileData.name || '',
        phone: profileData.phone || '',
        avatar: profileData.avatar || '',
        skills: (profileData.skills || []).join(', '),
      });
    } catch (err) {
      setError(err.message || 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.status === 'completed').length,
    [jobs]
  );

  const monthlyEarnings = useMemo(() => {
    const now = new Date();
    return jobs
      .filter((job) => {
        if (job.status !== 'completed') return false;
        const date = new Date(job.scheduledDate);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, job) => sum + (job.amount || 0), 0);
  }, [jobs]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess('');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!token) return;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      avatar: form.avatar.trim(),
      skills: form.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
    };

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateWorkerProfile(token, payload);
      setProfile(updated);
      setSuccess('Profile updated successfully');
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} />;
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('worker.profile')}</h1>
          <p className="page-subtitle">Manage worker details, skills, and visibility profile.</p>
        </div>
        <button className="btn btn-outline" onClick={loadProfile}>
          <HiOutlineArrowPath /> Refresh
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <HiOutlineUserCircle />
          </div>
          <div>
            <div className="stat-value">{profile?.rating || 0}</div>
            <div className="stat-label">Current Rating</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <HiOutlineCheckBadge />
          </div>
          <div>
            <div className="stat-value">{completedJobs}</div>
            <div className="stat-label">Completed Jobs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#047857' }}>
            <HiOutlineCheckBadge />
          </div>
          <div>
            <div className="stat-value">{formatInr(monthlyEarnings)}</div>
            <div className="stat-label">This Month Earnings</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, borderColor: '#fecaca', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="card" style={{ marginBottom: 16, borderColor: '#bbf7d0', color: '#166534' }}>
          {success}
        </div>
      )}

      {loading ? (
        <div className="chart-placeholder">Loading profile...</div>
      ) : (
        <div className="dash-section">
          <h3 className="dash-section-title">Profile Details</h3>
          <form className="card" onSubmit={handleSave} style={{ maxWidth: 760 }}>
            <div className="input-group">
              <label htmlFor="worker-name">Full Name</label>
              <input
                id="worker-name"
                className="input-field"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="worker-phone">Phone</label>
              <input
                id="worker-phone"
                className="input-field"
                value={form.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="worker-avatar">Avatar URL</label>
              <input
                id="worker-avatar"
                className="input-field"
                value={form.avatar}
                onChange={(event) => handleChange('avatar', event.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="input-group">
              <label htmlFor="worker-skills">Skills (comma separated)</label>
              <input
                id="worker-skills"
                className="input-field"
                value={form.skills}
                onChange={(event) => handleChange('skills', event.target.value)}
                placeholder="Electrician, AC Repair, Plumbing"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" className="btn btn-outline" onClick={loadProfile}>
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {!loading && profile && (
        <div className="dash-section">
          <h3 className="dash-section-title">Account Snapshot</h3>
          <table className="data-table">
            <tbody>
              <tr>
                <td><strong>Email</strong></td>
                <td>{profile.email}</td>
              </tr>
              <tr>
                <td><strong>Role</strong></td>
                <td>{profile.role}</td>
              </tr>
              <tr>
                <td><strong>Verification</strong></td>
                <td>{profile.isVerified ? 'Verified' : 'Pending Verification'}</td>
              </tr>
              <tr>
                <td><strong>Earnings (lifetime)</strong></td>
                <td>{formatInr(profile.earnings || 0)}</td>
              </tr>
              <tr>
                <td><strong>Pro Badge</strong></td>
                <td>{profile.isProBadge ? 'Unlocked' : 'Not unlocked yet'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkerProfile;
