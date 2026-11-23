import React from 'react';
import { HiOutlineShieldExclamation, HiOutlineArrowPath, HiOutlineHome } from 'react-icons/hi2';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ServeCircle ErrorBoundary caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/customer';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: this.props.inline ? '320px' : '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
              padding: '36px 32px',
              textAlign: 'center',
            }}
          >
            {/* Warning Shield Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(217, 119, 6, 0.12)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 18px',
                border: '1px solid rgba(217, 119, 6, 0.25)',
              }}
            >
              <HiOutlineShieldExclamation />
            </div>

            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#0F172A',
                margin: '0 0 10px 0',
                letterSpacing: '-0.01em',
              }}
            >
              Something went unexpectedly wrong
            </h3>

            <p
              style={{
                fontSize: '0.88rem',
                color: '#475569',
                lineHeight: 1.55,
                margin: '0 0 24px 0',
              }}
            >
              ServeCircle encountered an issue while loading this section. Your session, bookings, and data are completely safe.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  flex: '1 1 140px',
                  padding: '12px 18px',
                  background: '#1E40AF',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 3px 10px rgba(30, 64, 175, 0.25)',
                  transition: 'all 0.2s',
                }}
              >
                <HiOutlineArrowPath /> Try Again
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  flex: '1 1 140px',
                  padding: '12px 18px',
                  background: '#FAF9F6',
                  color: '#0F172A',
                  borderRadius: '12px',
                  border: '1.5px solid #E2E8F0',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <HiOutlineHome /> Dashboard
              </button>
            </div>

            {/* Technical Detail Collapsible (Dev mode aid) */}
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details
                style={{
                  marginTop: '20px',
                  textAlign: 'left',
                  background: '#FAF9F6',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.75rem',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#1E40AF' }}>
                  Technical Error Details
                </summary>
                <pre
                  style={{
                    marginTop: '8px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: '#b91c1c',
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
