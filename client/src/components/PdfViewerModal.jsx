import React, { useState } from 'react';
import { HiOutlineXMark, HiOutlineDocumentArrowDown, HiOutlineDocumentText } from 'react-icons/hi2';

const PdfViewerModal = ({ isOpen, onClose, fileName, pdfContent }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate a download delay
    setTimeout(() => {
      setIsDownloading(false);
      // Trigger a mock download success
      const link = document.createElement('a');
      // Using a dummy blob for demonstration, in a real app this would be a real file URL
      const blob = new Blob(['Simulated PDF content for ' + fileName], { type: 'application/pdf' });
      link.href = URL.createObjectURL(blob);
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="card animate-scale-up" style={{
        width: '100%', maxWidth: '800px', height: '80vh', background: 'white',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 24px', borderBottom: '1px solid var(--gray-200)',
          background: 'var(--gray-50)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)'
        }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineDocumentText style={{ color: 'var(--primary-500)', fontSize: '1.4rem' }} />
            {fileName || 'Document Preview'}
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleDownload}
              disabled={isDownloading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <HiOutlineDocumentArrowDown style={{ fontSize: '1.2rem' }} />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', padding: '4px' }}
            >
              <HiOutlineXMark style={{ fontSize: '1.5rem' }} />
            </button>
          </div>
        </div>

        {/* PDF Preview Body */}
        <div style={{ flex: 1, background: '#525659', padding: '24px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          {/* Simulated PDF Page */}
          <div style={{
            width: '100%', maxWidth: '600px', minHeight: '800px', background: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)', padding: '40px',
            position: 'relative', color: '#333'
          }}>
            {pdfContent ? (
              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Header for actual content */}
                <div style={{ borderBottom: '2px solid var(--gray-200)', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-700)', margin: 0 }}>ServeCircle</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Official Document</p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
                    <div>Ref: SC-{Math.floor(Math.random() * 10000)}</div>
                  </div>
                </div>
                {/* The injected context content */}
                <div>
                  {pdfContent}
                </div>
              </div>
            ) : (
              /* Skeleton/Placeholder Content */
              <>
                <div style={{ borderBottom: '2px solid var(--gray-200)', paddingBottom: '20px', marginBottom: '30px' }}>
                  <div style={{ width: '40%', height: '32px', background: 'var(--gray-200)', borderRadius: '4px', marginBottom: '16px' }}></div>
                  <div style={{ width: '25%', height: '16px', background: 'var(--gray-100)', borderRadius: '4px' }}></div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  <div style={{ width: '100%', height: '12px', background: 'var(--gray-100)', borderRadius: '4px' }}></div>
                  <div style={{ width: '100%', height: '12px', background: 'var(--gray-100)', borderRadius: '4px' }}></div>
                  <div style={{ width: '90%', height: '12px', background: 'var(--gray-100)', borderRadius: '4px' }}></div>
                  <div style={{ width: '95%', height: '12px', background: 'var(--gray-100)', borderRadius: '4px' }}></div>
                  <div style={{ width: '80%', height: '12px', background: 'var(--gray-100)', borderRadius: '4px' }}></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                  <div style={{ height: '120px', background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: '8px' }}></div>
                  <div style={{ height: '120px', background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: '8px' }}></div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ width: '100%', height: '12px', background: 'var(--gray-100)', borderRadius: '4px' }}></div>
                  <div style={{ width: '85%', height: '12px', background: 'var(--gray-100)', borderRadius: '4px' }}></div>
                </div>
              </>
            )}

            {/* Simulated Watermark */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)',
              fontSize: '4rem', fontWeight: 900, color: 'rgba(0,0,0,0.03)', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 1
            }}>
              ServeCircle Preview
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
