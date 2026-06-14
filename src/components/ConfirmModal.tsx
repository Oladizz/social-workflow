import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'Inter, sans-serif'
    }}>
      <div 
        style={{
          background: 'rgba(25, 25, 30, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '400px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '16px', 
            background: isDestructive ? 'rgba(255, 68, 68, 0.15)' : 'rgba(138, 43, 226, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <AlertTriangle size={24} color={isDestructive ? '#ff4444' : '#a78bfa'} />
          </div>
          <button 
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <X size={20} />
          </button>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 12px', color: '#fff' }}>
          {title}
        </h3>
        <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: isDestructive ? '#ff4444' : '#8a2be2',
              border: 'none',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: isDestructive ? '0 4px 12px rgba(255, 68, 68, 0.3)' : '0 4px 12px rgba(138, 43, 226, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
