import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePlayCircle,
  HiOutlineTrophy,
} from 'react-icons/hi2';
import WorkerAuthPrompt from './WorkerAuthPrompt';
import { useWorkerAuth } from './useWorkerAuth';
import { fetchWorkerJobs, fetchWorkerProfile } from './workerApi';
import '../Dashboard.css';

const modules = [
  {
    id: 'safety-101',
    title: 'Safety Basics for On-site Jobs',
    category: 'Core',
    duration: '18 min',
    lessonCount: 5,
  },
  {
    id: 'customer-comm',
    title: 'Customer Communication and Etiquette',
    category: 'Soft Skills',
    duration: '22 min',
    lessonCount: 6,
  },
  {
    id: 'home-repair-pro',
    title: 'Advanced Home Repair Troubleshooting',
    category: 'Technical',
    duration: '32 min',
    lessonCount: 8,
  },
  {
    id: 'service-photos',
    title: 'Before/After Photo Best Practices',
    category: 'Quality',
    duration: '14 min',
    lessonCount: 4,
  },
];

const WorkerTraining = () => {
  const { t } = useTranslation();
  const { token, isAuthenticated, signIn, authError, authLoading } = useWorkerAuth();

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
    return <WorkerAuthPrompt onSignIn={signIn} loading={authLoading} error={authError} />;
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('worker.training')}</h1>
          <p className="page-subtitle">Skill-up modules, progress tracking, and pro badge readiness.</p>
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
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#047857' }}>
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

      {loading && <div className="chart-placeholder">Loading training content...</div>}

      {!loading && (
        <>
          <div className="dash-section">
            <h3 className="dash-section-title">Pro Badge Unlock</h3>
            <div className="card" style={{ maxWidth: 620 }}>
              <p style={{ marginBottom: 8 }}>
                Complete 50 successful jobs to unlock your ServeCircle Verified Pro badge.
              </p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${badgeProgress}%` }} />
              </div>
              <p style={{ marginTop: 10, color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                Status: {isProUnlocked ? 'Unlocked' : 'In progress'}
              </p>
            </div>
          </div>

          <div className="dash-section">
            <h3 className="dash-section-title">Recommended for You</h3>
            <div className="card">
              <p style={{ marginBottom: 0 }}>
                {recommendedModules
                  .map((moduleId) => modules.find((module) => module.id === moduleId)?.title)
                  .filter(Boolean)
                  .join(' | ')}
              </p>
            </div>
          </div>

          <div className="dash-section">
            <h3 className="dash-section-title">Module Library</h3>
            <div className="training-grid">
              {modules.map((module) => {
                const done = watched.includes(module.id);
                return (
                  <div key={module.id} className="training-card">
                    <div className="training-thumb">
                      <HiOutlinePlayCircle />
                    </div>
                    <div className="training-info">
                      <h4>{module.title}</h4>
                      <p>{module.category} | {module.lessonCount} lessons</p>
                      <div className="training-meta">
                        <span className="training-duration"><HiOutlineClock style={{ verticalAlign: 'middle' }} /> {module.duration}</span>
                        <button
                          className={done ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                          onClick={() => toggleWatched(module.id)}
                        >
                          {done ? 'Watched' : 'Mark Watched'}
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
