import { useState } from 'react';
import '../pages/worker/WorkerPages.css'; // ensure styles are imported

const CallModal = ({ onClose }) => {
  return (
    <div className="sos-modal-overlay" onClick={onClose}>
      <div className="sos-modal" onClick={e => e.stopPropagation()}>
        <h2 style={{ color: '#2563eb' }}>📞 Call Customer / Support</h2>
        <p>Start a video consultation with the customer or contact ServeCircle support.</p>
        <div className="sos-btn-group">
          <button className="btn-police" style={{ background: '#2563eb' }}>Start Video Call with Customer</button>
          <button className="btn-support" style={{ background: '#3b7dc1' }}>Call Platform Support</button>
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
        title="Call / Video Consultation"
      >
        📞
      </button>

      {showCall && <CallModal onClose={() => setShowCall(false)} />}
    </>
  );
};

export default WorkerCallWidget;
