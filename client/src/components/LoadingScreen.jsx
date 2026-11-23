import React from 'react';

export const LoadingSpinner = ({ size = 38, color = '#1E40AF' }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* Outer rotating ring */}
    <span
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        border: '3px solid rgba(226, 232, 240, 0.65)',
        borderTopColor: color,
        animation: 'scSpin 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      }}
    />
    {/* Inner pulsating core */}
    <span
      style={{
        width: `${Math.round(size * 0.38)}px`,
        height: `${Math.round(size * 0.38)}px`,
        borderRadius: '50%',
        background: '#2563EB',
        animation: 'scPulse 1.4s ease-in-out infinite',
      }}
    />
  </div>
);

const LoadingScreen = ({ message = 'Loading experience...', fullScreen = false }) => {
  return (
    <div
      style={{
        minHeight: fullScreen ? '100vh' : '55vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '32px 16px',
        animation: 'fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        }}
      >
        <LoadingSpinner size={42} color="#1E40AF" />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            margin: '0 0 4px 0',
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.01em',
          }}
        >
          {message}
        </p>
        <span
          style={{
            fontSize: '0.75rem',
            color: '#64748B',
            fontWeight: 600,
          }}
        >
          ServeCircle • Seamless Smart Living
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;
