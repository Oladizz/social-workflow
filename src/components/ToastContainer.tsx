import React, { useEffect, useState } from 'react';
import { useToastStore, Toast } from '../store/useToastStore';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', icon: '#10b981', bar: '#10b981' },
  error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)',  icon: '#ef4444', bar: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', icon: '#f59e0b', bar: '#f59e0b' },
  info:    { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.35)', icon: '#6366f1', bar: '#6366f1' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const [progress, setProgress] = useState(100);
  const c = COLORS[toast.type];
  const duration = toast.duration || 4000;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.max(0, p - (100 / (duration / 100))));
    }, 100);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div style={{
      position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-start',
      gap: '10px', padding: '12px 14px', paddingRight: '36px',
      background: c.bg, backdropFilter: 'blur(20px)',
      border: `1px solid ${c.border}`, borderRadius: '10px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: '340px', minWidth: '260px',
      animation: 'slideInToast 0.25s ease-out',
    }}>
      {/* Icon */}
      <span style={{ color: c.icon, flexShrink: 0, marginTop: '1px' }}>{ICONS[toast.type]}</span>
      {/* Message */}
      <p style={{ fontSize: '0.85rem', lineHeight: 1.4, color: '#fff', margin: 0 }}>{toast.message}</p>
      {/* Close */}
      <button onClick={() => removeToast(toast.id)} style={{
        position: 'absolute', top: '8px', right: '8px',
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
        cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center'
      }}>
        <X size={13} />
      </button>
      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: '3px',
        width: `${progress}%`, background: c.bar,
        transition: 'width 0.1s linear', borderRadius: '0 0 0 10px'
      }} />
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToastStore();
  return (
    <>
      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px',
        alignItems: 'flex-end', pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} />
          </div>
        ))}
      </div>
    </>
  );
}
