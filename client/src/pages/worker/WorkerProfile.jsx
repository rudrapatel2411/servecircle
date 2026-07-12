import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineArrowPath,
  HiOutlineCheckBadge,
  HiOutlineUserCircle,
  HiOutlineShieldCheck
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
import './WorkerPages.css';

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

  const isProUnlocked = completedJobs >= 50;

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
    <div className="page-content worker-page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {t('worker.profile', 'My Profile')}
            {isProUnlocked && <HiOutlineShieldCheck style={{ color: '#7c3aed', fontSize: '1.8rem' }} title="ServeCircle Verified Pro" />}
          </h1>
          <p className="page-subtitle">Manage your details, skills, and visibility profile.</p>
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
            <div className="stat-value">{profile?.rating || '4.9'} <span style={{ fontSize: '1rem', color: '#f59e0b' }}>★</span></div>
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
        <div className="card" style={{ marginBottom: 16, borderColor: '#bbf7d0', color: '#166534', background: '#f0fdf4' }}>
          ✅ {success}
        </div>
      )}

      {loading ? (
        <div className="chart-placeholder">Loading profile...</div>
      ) : (
        <div className="b2b-two-col">
          <div className="dash-section" style={{ flex: 1, margin: 0 }}>
            <h3 className="dash-section-title">Profile Details</h3>
            <form className="card" onSubmit={handleSave}>
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

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
                <button type="button" className="btn btn-outline" onClick={loadProfile}>
                  Reset
                </button>
              </div>
            </form>
          </div>

          {!loading && profile && (
            <div className="dash-section" style={{ flex: 1, margin: 0 }}>
              <h3 className="dash-section-title">Account Snapshot</h3>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <strong style={{ color: 'var(--navy-600)' }}>Email</strong>
                  <span>{profile.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <strong style={{ color: 'var(--navy-600)' }}>Role</strong>
                  <span>{profile.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <strong style={{ color: 'var(--navy-600)' }}>Verification</strong>
                  <span style={{ color: profile.isVerified ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                    {profile.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <strong style={{ color: 'var(--navy-600)' }}>Earnings (Lifetime)</strong>
                  <span>{formatInr(profile.earnings || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--navy-600)' }}>Pro Badge</strong>
                  <span style={{ color: isProUnlocked ? '#7c3aed' : 'var(--gray-500)', fontWeight: 700 }}>
                    {isProUnlocked ? 'Unlocked' : 'Not unlocked yet'}
                  </span>
                </div>
              </div>
              
              {isProUnlocked && (
                <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', borderColor: '#d8b4fe', textAlign: 'center' }}>
                  <HiOutlineShieldCheck style={{ fontSize: '3rem', color: '#9333ea', margin: '0 auto 12px' }} />
                  <h4 style={{ color: '#6b21a8', margin: '0 0 8px 0' }}>Verified Pro Status Active</h4>
                  <p style={{ color: '#7e22ce', fontSize: '0.9rem', margin: 0 }}>You are receiving priority job requests and premium listings in your service area.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerProfile;
