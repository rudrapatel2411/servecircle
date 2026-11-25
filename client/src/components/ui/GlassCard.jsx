import React from 'react';

export function GlassCard({ clickable = false, index, className = '', style = {}, children, ...rest }) {
  const cls = [
    'glass',
    clickable ? 'is-clickable' : '',
    index !== undefined ? 'enter' : '',
    className
  ].filter(Boolean).join(' ');

  const computedStyle = {
    ...style,
    ...(index !== undefined ? { '--i': Math.min(Number(index) || 0, 10) } : {})
  };

  return (
    <div className={cls} style={computedStyle} {...rest}>
      {children}
    </div>
  );
}
