import React from 'react';

export function ServeCircleMark({ size = 36 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        background: 'rgba(255, 255, 255, 0.92)',
        border: '1.5px solid rgba(22, 70, 214, 0.25)',
        boxShadow: '0 6px 16px -6px rgba(22, 70, 214, 0.28), inset 0 1px 0 #ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Outfit, Inter, sans-serif',
        fontWeight: 800,
        fontSize: Math.round(size * 0.44),
        letterSpacing: '-0.04em',
        color: '#1646D6',
        lineHeight: 1,
        flexShrink: 0,
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      SC
    </span>
  );
}

export default function ServeCircleLogo({ size = 36, showText = true, light = false }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <ServeCircleMark size={size} />
      {showText && (
        <span
          style={{
            fontFamily: 'Outfit, Inter, sans-serif',
            fontWeight: 800,
            fontSize: size >= 40 ? '1.3rem' : '1.15rem',
            letterSpacing: '-0.025em',
            color: light ? '#FFFFFF' : '#0B1E4F',
            lineHeight: 1,
          }}
        >
          Serve<span style={{ color: light ? '#93C5FD' : '#1646D6' }}>Circle</span>
        </span>
      )}
    </span>
  );
}
