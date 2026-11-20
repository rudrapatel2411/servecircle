import { useState } from 'react';
import { HiOutlinePhone } from 'react-icons/hi2';
import '../pages/worker/WorkerPages.css';

const CallModal = ({ onClose }) => {
  return (
    <div className="sos-modal-overlay" onClick={onClose}>
      <div className="sos-modal" onClick={e => e.stopPropagation()}>
        <h2 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiOutlinePhone size={22} />
          <span>Call Customer / Support</span>
        </h2>
        <p>Start a consultation with the customer or contact ServeCircle support.</p>
        <div className="sos-btn-group">
          <button className="btn-police" style={{ background: 'var(--primary-600)' }}>Start Consultation with Customer</button>
          <button className="btn-support" style={{ background: 'var(--navy-700)' }}>Call Platform Support</button>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const WorkerCallWidget = () => {
  const [showCall, setShowCall] = useState(false);

  return (
    <>
      <button 
        className="call-floating-btn" 
        onClick={() => setShowCall(true)} 
        title="Call / Support Consultation"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <HiOutlinePhone size={20} />
      </button>

      {showCall && <CallModal onClose={() => setShowCall(false)} />}
    </>
  );
};

export default WorkerCallWidget;
