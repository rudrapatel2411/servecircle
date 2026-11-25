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
      const blob = new Blob(['Simulated PDF content for ' + fileName], { type: 'application/pdf' });
      link.href = URL.createObjectURL(blob);
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div
      className="modal-glass-overlay"
      onClick={onClose}
    >
      <div
        className="glass animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '820px',
          height: '82vh',
          borderRadius: '28px',
          boxShadow: 'var(--sh-card)',
          border: '1px solid var(--glass-edge)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid var(--glass-edge)',
            background: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <h3
            style={{
              fontSize: '1.15rem',
              color: 'var(--ink)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div className="tile tile-blue" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
              <HiOutlineDocumentText style={{ fontSize: '1.3rem' }} />
            </div>
            {fileName || 'Document Preview'}
          </h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={handleDownload}
              disabled={isDownloading}
              style={{
                padding: '8px 20px',
                fontSize: '0.85rem',
              }}
            >
              <HiOutlineDocumentArrowDown style={{ fontSize: '1.15rem' }} />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
            <button 
              onClick={onClose}
              className="glass-sm"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--glass-edge)',
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
            >
              <HiOutlineXMark style={{ fontSize: '1.25rem' }} />
            </button>
          </div>
        </div>

        {/* PDF Preview Body */}
        <div
          style={{
            flex: 1,
            background: 'rgba(11, 30, 79, 0.08)',
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* Simulated PDF Page */}
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              minHeight: '800px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(11, 30, 79, 0.12)',
              padding: '40px',
              position: 'relative',
              color: 'var(--ink)',
            }}
          >
            {pdfContent ? (
              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Header for actual content */}
                <div
                  style={{
                    borderBottom: '2px solid rgba(22, 70, 214, 0.12)',
                    paddingBottom: '20px',
                    marginBottom: '30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        color: 'var(--blue)',
                        fontFamily: 'var(--font-heading)',
                        margin: 0,
                      }}
                    >
                      ServeCircle
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--ink-3)' }}>
                      Official Document
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
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
                <div style={{ borderBottom: '2px solid rgba(22, 70, 214, 0.12)', paddingBottom: '20px', marginBottom: '30px' }}>
                  <div className="skeleton-shimmer" style={{ width: '40%', height: '32px', marginBottom: '16px' }} />
                  <div className="skeleton-shimmer" style={{ width: '25%', height: '16px' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '14px' }} />
                  <div className="skeleton-shimmer" style={{ width: '90%', height: '14px' }} />
                  <div className="skeleton-shimmer" style={{ width: '95%', height: '14px' }} />
                  <div className="skeleton-shimmer" style={{ width: '70%', height: '14px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="skeleton-shimmer" style={{ width: '85%', height: '14px' }} />
                  <div className="skeleton-shimmer" style={{ width: '92%', height: '14px' }} />
                  <div className="skeleton-shimmer" style={{ width: '60%', height: '14px' }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
