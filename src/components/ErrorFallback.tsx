import React, { useState } from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertOctagon, RotateCcw, Home, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

interface ErrorFallbackProps {
  error?: any;
  resetErrorBoundary?: () => void;
}

export default function ErrorFallback({ error: propError, resetErrorBoundary }: ErrorFallbackProps) {
  let routerError: any = null;
  let navigate: any = null;
  
  // Safely call react-router hooks if we are inside a RouterProvider context
  try {
    routerError = useRouteError();
    navigate = useNavigate();
  } catch (e) {
    // Not in router context, ignore
  }

  const error = propError || routerError;
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const is404 = error?.status === 404;
  const errorMessage = is404
    ? `No route matches URL: "${window.location.pathname}"`
    : error?.message || error?.statusText || (typeof error === 'string' ? error : 'An unexpected error occurred');
  const errorStack = error?.stack || JSON.stringify(error, null, 2);

  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (navigate) {
      navigate('/dashboard');
    } else {
      window.location.href = '/dashboard';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${errorMessage}\n\nStack:\n${errorStack}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', width: '100vw', padding: '2rem', boxSizing: 'border-box',
      background: is404
        ? 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.15), transparent 60%), radial-gradient(circle at 10% 10%, #12121c, transparent), radial-gradient(circle at 90% 90%, #0a0a0f, transparent)'
        : 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.15), transparent 60%), radial-gradient(circle at 10% 10%, #12121c, transparent), radial-gradient(circle at 90% 90%, #0a0a0f, transparent)',
      color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Decorative glowing orb */}
      <div style={{
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: is404
          ? 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)',
        filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none', transform: 'translateY(-10%)'
      }} />

      <div className="glass-panel" style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '580px',
        padding: '2.5rem', borderRadius: '24px', textAlign: 'center',
        border: is404 ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
        boxShadow: is404
          ? '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(245, 158, 11, 0.05)'
          : '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.05)'
      }}>
        {/* Error icon with pulse animation */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '72px', height: '72px', borderRadius: '20px',
          background: is404
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
          border: is404 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: '1.5rem'
        }}>
          <AlertOctagon size={36} color={is404 ? '#f59e0b' : '#ef4444'} style={{ animation: 'pulse 2s infinite' }} />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '-0.5px' }}>
          {is404 ? 'URL Does Not Exist' : 'System Malfunction'}
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {is404
            ? 'The page or workflow endpoint you tried to reach does not exist.'
            : 'We encountered an unexpected issue while executing this screen. The details have been logged.'}
        </p>

        {/* Highlighted error message */}
        <div style={{
          background: is404 ? 'rgba(245, 158, 11, 0.06)' : 'rgba(239, 68, 68, 0.06)',
          border: is404 ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '12px', padding: '12px 16px', color: is404 ? '#fcd34d' : '#fca5a5',
          fontSize: '0.88rem', fontWeight: 500, textAlign: 'left', marginBottom: '2rem',
          wordBreak: 'break-word', fontFamily: 'monospace'
        }}>
          {is404 ? `Error 404: Route Not Found` : `Error: ${errorMessage}`}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '2rem' }}>
          <button onClick={handleReload} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem',
            background: 'var(--accent-primary)', border: 'none', borderRadius: '12px',
            color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(138, 43, 226, 0.3)', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(138, 43, 226, 0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(138, 43, 226, 0.3)'; }}>
            <RotateCcw size={16} /> Reload Page
          </button>

          <button onClick={handleGoHome} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: '12px',
            color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}>
            <Home size={16} /> Dashboard
          </button>
        </div>

        {/* Collapsible stack trace */}
        <div style={{ textAlign: 'left', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.8rem', padding: 0, fontWeight: 500
            }}
          >
            {showDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {showDetails ? 'Hide Diagnostics' : 'Show Diagnostics'}
          </button>

          {showDetails && (
            <div style={{ marginTop: '1rem', position: 'relative' }}>
              <div style={{
                position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px'
              }}>
                <button
                  onClick={handleCopy}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                    padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <pre style={{
                background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--glass-border)',
                borderRadius: '8px', padding: '16px', fontSize: '0.75rem', color: '#94a3b8',
                overflowX: 'auto', maxHeight: '200px', fontFamily: 'monospace', whiteSpace: 'pre-wrap'
              }}>
                {errorStack}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      {/* Inline styles for keyframe animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
