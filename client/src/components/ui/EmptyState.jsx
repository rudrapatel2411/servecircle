import React from 'react';
import { PrimaryButton } from './PrimaryButton.jsx';
import { IconTile } from './IconTile.jsx';

export function EmptyState({ title, description, actionText, onAction, icon: Icon, className = '', style = {} }) {
  return (
    <div
      className={`glass ${className}`}
      style={{
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '14px',
        width: '100%',
        ...style
      }}
    >
      {Icon ? <IconTile icon={Icon} tone="slate" /> : null}
      {title ? <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)' }}>{title}</h3> : null}
      {description ? (
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink2)', maxWidth: '420px' }}>
          {description}
        </p>
      ) : null}
      {actionText && onAction ? (
        <PrimaryButton onClick={onAction} style={{ marginTop: '8px' }}>
          {actionText}
        </PrimaryButton>
      ) : null}
    </div>
  );
}

export default EmptyState;
