import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePlayCircle,
  HiOutlineTrophy,
  HiOutlineIdentification,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs, fetchWorkerProfile } from './workerApi';
import '../Dashboard.css';
import './WorkerPages.css';

const modules = [
  {
    id: 'safety-101',
    title: 'Safety Basics for On-site Jobs',
    category: 'Core',
    duration: '18 min',
    lessonCount: 5,
    isGovt: true
  },
  {
    id: 'customer-comm',
    title: 'Customer Communication and Etiquette',
    category: 'Soft Skills',
    duration: '22 min',
    lessonCount: 6,
    isGovt: false
  },
  {
    id: 'home-repair-pro',
    title: 'Advanced Home Repair Troubleshooting',
    category: 'Technical',
    duration: '32 min',
    lessonCount: 8,
    isGovt: true
  },
  {
    id: 'service-photos',
    title: 'Before/After Photo Best Practices',
    category: 'Quality',
    duration: '14 min',
    lessonCount: 4,
    isGovt: false
  },
];

const WorkerTraining = () => {
  const { t } = useTranslation();
  const { token, user, isAuthenticated, signIn, authError, authLoading, workerStatus } = useWorkerAuth();

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [watched, setWatched] = useState(() => {
    try {
      const raw = localStorage.getItem('servecircle_worker_training_watched');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const loadTrainingData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [workerProfile, workerJobs] = await Promise.all([
        fetchWorkerProfile(token),
        fetchWorkerJobs(token),
      ]);
      setProfile(workerProfile);
      setJobs(workerJobs);
    } catch (err) {
      setError(err.message || 'Could not load training data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    localStorage.setItem('servecircle_worker_training_watched', JSON.stringify(watched));
  }, [watched]);

  const completedJobs = useMemo(
    () => jobs.filter((job) => job.status === 'completed').length,
    [jobs]
  );

  const isProUnlocked = completedJobs >= 50;
  const badgeProgress = Math.min(100, Math.round((completedJobs / 50) * 100));

  const recommendedModules = useMemo(() => {
    const skills = (profile?.skills || []).map((skill) => skill.toLowerCase());
    if (skills.some((skill) => skill.includes('electric') || skill.includes('ac') || skill.includes('plumb'))) {
      return ['home-repair-pro', 'safety-101'];
    }
    if (skills.some((skill) => skill.includes('clean') || skill.includes('pest'))) {
      return ['customer-comm', 'service-photos'];
    }
    return ['safety-101', 'customer-comm'];
  }, [profile]);

  const toggleWatched = (moduleId) => {
    setWatched((current) => (
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    ));
  };

  if (!isAuthenticated) {
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} currentUser={user} workerStatus={workerStatus} />;
  }

  return (
    <div className="page-content worker-page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('worker.training', 'Training & Certification')}</h1>
          <p className="page-subtitle">Complete Govt. certified training modules and track your pro status.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <HiOutlineAcademicCap />
          </div>
          <div>
            <div className="stat-value">{modules.length}</div>
            <div className="stat-label">Training Modules</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e1ebf5', color: '#224c82' }}>
            <HiOutlineCheckCircle />
          </div>
          <div>
            <div className="stat-value">{watched.length}</div>
            <div className="stat-label">Modules Watched</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <HiOutlineTrophy />
          </div>
          <div>
            <div className="stat-value">{completedJobs}/50</div>
            <div className="stat-label">Pro Badge Progress</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 16, borderColor: '#fecaca', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* NEW: First Job Initiative Callout */}
      {completedJobs < 5 && (
        <div className="card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderColor: '#f59e0b', color: '#b45309' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0', fontSize: '1.2rem', color: '#92400e' }}>
            🎉 First Job Initiative: 0% Commission
          </h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            You have completed {completedJobs} out of 5 jobs. Your first 5 jobs on ServeCircle are completely commission-free! Keep up the great work and build your portfolio.
          </p>
        </div>
      )}

      {loading && <div className="chart-placeholder">Loading training content...</div>}

      {!loading && (
        <>
          <div className="dash-section">
            <h3 className="dash-section-title">Digital Certificate & Pro Badge</h3>
            <div className="card" style={{ maxWidth: 620 }}>
              <p style={{ marginBottom: 16 }}>
                Complete 50 successful jobs to unlock your <strong style={{ color: '#7c3aed' }}>ServeCircle Verified Pro</strong> badge and official Digital Experience Certificate.
              </p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${badgeProgress}%`, background: '#7c3aed' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                <span>Status: {isProUnlocked ? <strong style={{ color: '#3b7dc1' }}>Unlocked!</strong> : 'In progress'}</span>
                <span>{completedJobs} / 50 Jobs</span>
              </div>
              
              {isProUnlocked && (
                <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <HiOutlineIdentification style={{ fontSize: '1.2rem' }} /> Download Digital Certificate
                </button>
              )}
            </div>
          </div>

          <div className="dash-section">
            <h3 className="dash-section-title">Module Library</h3>
            <div className="training-grid">
              {modules.map((module) => {
                const done = watched.includes(module.id);
                return (
                  <div key={module.id} className="training-card" style={{ border: done ? '1px solid #3b7dc1' : '1px solid var(--gray-200)' }}>
                    <div className="training-thumb" style={{ background: done ? '#e1ebf5' : '#f1f5f9', color: done ? '#3b7dc1' : '#64748b' }}>
                      <HiOutlinePlayCircle />
                    </div>
                    <div className="training-info">
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {module.title}
                        {module.isGovt && <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800 }}>Govt Certified (PMKVY)</span>}
                      </h4>
                      <p>{module.category} | {module.lessonCount} lessons</p>
                      <div className="training-meta">
                        <span className="training-duration"><HiOutlineClock style={{ verticalAlign: 'middle' }} /> {module.duration}</span>
                        <button
                          className={done ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                          onClick={() => toggleWatched(module.id)}
                          style={done ? { borderColor: '#3b7dc1', color: '#3b7dc1' } : {}}
                        >
                          {done ? 'Watched' : 'Watch Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerTraining;
