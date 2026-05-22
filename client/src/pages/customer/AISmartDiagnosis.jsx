import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineCpuChip, HiOutlineArrowUpTray, HiOutlineSparkles,
  HiOutlineWrenchScrewdriver, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineArrowRight, HiOutlineExclamationTriangle, HiOutlineArrowPath
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const presetIssues = [
  {
    id: 'ac',
    title: 'AC is making rattling noise & blowing warm air',
    category: 'Home Repairs',
    service: 'AC & Appliance Repair',
    price: 500,
    issueDetails: 'Worn out fan blades or faulty compressor capacitor.',
    severity: 'Medium',
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'leak',
    title: 'Water leaking heavily from bathroom pipe connector',
    category: 'Home Repairs',
    service: 'Plumbing',
    price: 350,
    issueDetails: 'Damaged thread seal or high-pressure corrosion hole.',
    severity: 'High',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 'spark',
    title: 'Main circuit breaker keeps tripping with sparks',
    category: 'Emergency 24/7',
    service: 'Electrical Emergency',
    price: 600,
    issueDetails: 'Severe short circuit due to overloaded cabling or moisture.',
    severity: 'Critical',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=60'
  }
];

const AISmartDiagnosis = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [diagnosisStepText, setDiagnosisStepText] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let interval;
    if (diagnosing) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 4;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setDiagnosing(false);
              const source = selectedPreset || {
                title: uploadedFile?.name || 'Custom Uploaded Issue',
                category: 'Home Repairs',
                service: 'Electrical Work',
                price: 300,
                issueDetails: 'General cable fault or loose contact in terminals.',
                severity: 'Low',
                image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=60'
              };
              setResult({
                ...source,
                aiConfidence: '94%',
                confidenceScore: 0.94,
                diagnosisCode: 'SC-AI-' + Math.floor(1000 + Math.random() * 9000),
                recommendations: [
                  'Do not try to disassemble the unit yourself.',
                  'Keep children away from the affected area.',
                  'A verified professional is required to isolate and resolve this issue safely.'
                ]
              });
            }, 800);
            return 100;
          }

          // Dynamic step text during scanning
          if (next < 25) setDiagnosisStepText('Analyzing photo/video pixels for anomaly signatures...');
          else if (next < 50) setDiagnosisStepText('Matching with global service knowledge base...');
          else if (next < 75) setDiagnosisStepText('Calculating component failure probability and safety risks...');
          else setDiagnosisStepText('Finalizing estimated repair costs and routing rules...');

          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [diagnosing, selectedPreset, uploadedFile]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setSelectedPreset(null);
      setResult(null);
    }
  };

  const startDiagnosis = () => {
    if (!selectedPreset && !uploadedFile) return;
    setDiagnosing(true);
    setProgress(0);
    setResult(null);
  };

  const resetDiagnosis = () => {
    setSelectedPreset(null);
    setUploadedFile(null);
    setResult(null);
    setProgress(0);
    setDiagnosing(false);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customer.aiDiagnosis')} 🤖</h1>
          <p className="page-subtitle">Upload a photo/video or select a common issue to diagnose instantly.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: result ? '1fr' : '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Main interactive area */}
        <div className="card" style={{ padding: '28px', border: '1px solid var(--gray-200)', position: 'relative' }}>
          
          <AnimatePresence mode="wait">
            {!diagnosing && !result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key="upload-selection"
              >
                <h3 style={{ marginBottom: '16px', color: 'var(--navy-800)', fontSize: '1.2rem' }}>Step 1: Choose what to diagnose</h3>
                
                {/* Drag and drop upload mock */}
                <div style={{
                  border: '2px dashed var(--primary-300)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: uploadedFile ? 'var(--primary-50)' : 'var(--gray-50)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  marginBottom: '24px'
                }}>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'
                    }}
                  />
                  <HiOutlineArrowUpTray style={{ fontSize: '3rem', color: 'var(--primary-500)', marginBottom: '12px' }} />
                  <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>
                    {uploadedFile ? uploadedFile.name : 'Upload issue photo or video'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    {uploadedFile ? 'Click or drag new to replace' : 'Drag & drop image/video or click to browse'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--gray-400)' }}>
                  <hr style={{ flex: 1, borderColor: 'var(--gray-200)' }} />
                  <span style={{ padding: '0 10px', fontSize: '0.8rem', fontWeight: 600 }}>OR SELECT FROM PRESETS</span>
                  <hr style={{ flex: 1, borderColor: 'var(--gray-200)' }} />
                </div>

                {/* Preset List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {presetIssues.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedPreset(preset);
                        setUploadedFile(null);
                        setResult(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: selectedPreset?.id === preset.id ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                        background: selectedPreset?.id === preset.id ? 'var(--primary-50)' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <img src={preset.image} alt="" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy-800)' }}>{preset.title}</h4>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>{preset.service}</span>
                          <span style={{ color: preset.severity === 'Critical' ? 'var(--danger)' : preset.severity === 'High' ? '#f59e0b' : 'var(--gray-500)', fontWeight: 700 }}>
                            {preset.severity} Severity
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  disabled={!selectedPreset && !uploadedFile}
                  onClick={startDiagnosis}
                >
                  <HiOutlineCpuChip /> Run AI Smart Diagnosis
                </button>
              </motion.div>
            )}

            {diagnosing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="diagnosing-loader"
                style={{ textAlign: 'center', padding: '40px 0' }}
              >
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
                  {/* Holographic animated scanning circle */}
                  <div className="scanning-circle" style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    border: '4px solid rgba(16, 185, 129, 0.1)',
                    borderTopColor: 'var(--primary-500)',
                    animation: 'spin 1.5s linear infinite'
                  }} />
                  <HiOutlineSparkles style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: '3rem', color: 'var(--primary-500)',
                    animation: 'pulse 1s ease-in-out infinite'
                  }} />
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>AI Analysis in Progress...</h3>
                <div className="progress-bar" style={{ width: '280px', margin: '0 auto 16px', height: '8px' }}>
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', minHeight: '24px' }}>
                  {diagnosisStepText}
                </p>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                key="diagnosis-results"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--navy-800)', fontWeight: 800 }}>Diagnosis Results</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '4px' }}>Code: {result.diagnosisCode} • AI Confidence: {result.aiConfidence}</p>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={resetDiagnosis} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HiOutlineArrowPath /> Start Over
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
                  <div>
                    <div className="card" style={{ background: 'var(--gray-50)', padding: '16px', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--gray-400)', letterSpacing: '0.5px' }}>DETECTED PROBLEM</h4>
                      <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-800)', marginTop: '6px' }}>{result.title}</p>
                    </div>

                    <div className="card" style={{ background: 'var(--gray-50)', padding: '16px', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--gray-400)', letterSpacing: '0.5px' }}>AI COMPONENT ANALYSIS</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', marginTop: '6px', lineHeight: 1.5 }}>{result.issueDetails}</p>
                    </div>

                    <div className="card" style={{ background: 'var(--gray-50)', padding: '16px' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--gray-400)', letterSpacing: '0.5px', marginBottom: '8px' }}>SAFETY ADVISORY</h4>
                      <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="card" style={{ border: '1.5px solid var(--primary-200)', background: 'var(--primary-50)', padding: '20px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--primary-800)', textTransform: 'uppercase', fontWeight: 700 }}>RECOMMENDED SERVICE</h4>
                        <div style={{ fontSize: '2.5rem', margin: '14px 0' }}>🔧</div>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800 }}>{result.service}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '6px' }}>Category: {result.category}</p>
                      </div>

                      <div style={{ margin: '20px 0' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', display: 'block' }}>ESTIMATED SERVICE COST</span>
                        <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-700)' }}>₹{result.price}</span>
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => navigate(`/customer/book?service=${encodeURIComponent(result.service)}&category=${encodeURIComponent(result.category)}&price=${result.price}`)}
                      >
                        Book Recommended <HiOutlineArrowRight />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Informational Sidebar */}
        {!result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-700)', marginBottom: '12px' }}>
                <HiOutlineSparkles style={{ fontSize: '1.3rem' }} />
                <h4 style={{ fontWeight: 800 }}>Why use AI Diagnosis?</h4>
              </div>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                <li><strong>Instant Identification</strong>: Get instant detection of mechanical or electrical failure zones.</li>
                <li><strong>No Fake Service Calls</strong>: AI filters out simple issues that can be solved with local guidance.</li>
                <li><strong>Transparent Estimates</strong>: View highly accurate price range estimates based on part costs and assembly charges before booking.</li>
              </ul>
            </div>

            <div className="card" style={{ padding: '20px', border: '1px solid var(--gray-200)', background: 'linear-gradient(135deg, #fef3c7, #fffbef)', borderColor: '#fef3c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b45309', marginBottom: '12px' }}>
                <HiOutlineExclamationTriangle style={{ fontSize: '1.3rem' }} />
                <h4 style={{ fontWeight: 800 }}>Critical Note</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#78350f', lineHeight: 1.4 }}>
                For high-risk emergency situations like heavy active water flooding, gas leaks, or sparks, skip AI diagnosis and book <strong>Emergency 24/7</strong> services directly for immediate dispatch.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AISmartDiagnosis;
