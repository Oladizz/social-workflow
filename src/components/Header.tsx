import React, { useState, useRef, useEffect } from 'react';
import { Play, Save, AlignCenter, LayoutTemplate, ArrowLeft } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onSave: () => void;
  onRun: () => void;
  onAutoLayout: () => void;
  onOpenTemplates: () => void;
  isDebugMode?: boolean;
}

export default function Header({ onSave, onRun, onAutoLayout, onOpenTemplates, isDebugMode }: HeaderProps) {
  const { workflowName, setWorkflowName } = useWorkflowStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(workflowName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(workflowName); }, [workflowName]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commitName = () => {
    setWorkflowName(draft.trim() || 'My Workflow');
    setEditing(false);
  };

  return (
    <header style={{
      width: '100%', borderBottom: '1px solid var(--glass-border)',
      padding: '0 1.25rem', height: '52px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexShrink: 0, zIndex: 10,
      background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)'
    }}>
      {/* Left: Back Button + Logo + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link to={isDebugMode ? '/runs' : '/dashboard'} style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', textDecoration: 'none', marginRight: '8px' }} title="Back">
          <ArrowLeft size={20} />
        </Link>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
          background: 'linear-gradient(135deg, #8a2be2, #4169e1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.85rem'
        }}>S</div>

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setDraft(workflowName); setEditing(false); }}}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px', color: '#fff', fontFamily: 'inherit', fontWeight: 600,
              fontSize: '0.95rem', padding: '3px 8px', outline: 'none', width: '200px'
            }}
          />
        ) : (
          <button onClick={() => { if (!isDebugMode) setEditing(true); }} title={isDebugMode ? '' : "Click to rename"} style={{
            background: 'none', border: 'none', color: '#fff', fontFamily: 'inherit',
            fontWeight: 600, fontSize: '0.95rem', cursor: isDebugMode ? 'default' : 'text', padding: '3px 4px',
            borderRadius: '5px', transition: 'background 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {workflowName}
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginLeft: '6px' }}>✏️</span>
          </button>
        )}

        <span style={{
          fontSize: '0.6rem', padding: '2px 7px', borderRadius: '20px',
          background: 'rgba(138,43,226,0.15)', border: '1px solid rgba(138,43,226,0.3)', color: '#a78bfa'
        }}>ENTERPRISE</span>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HeaderButton icon={<AlignCenter size={14} />} label="Auto Layout" onClick={onAutoLayout} />
        {!isDebugMode && (
          <>
            <HeaderButton icon={<LayoutTemplate size={14} />} label="Templates" onClick={onOpenTemplates} />
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            <HeaderButton icon={<Save size={14} />} label="Save" onClick={onSave} primary />
            <button
              onClick={onRun}
              className="capsule glow-effect"
              style={{
                marginLeft: '8px', padding: '6px 16px', background: 'var(--accent-primary)',
                color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(138,43,226,0.3)', transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Play size={14} fill="currentColor" /> Run Flow
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function HeaderButton({ icon, label, onClick, primary }: { icon: React.ReactNode; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px',
      background: primary ? '#8a2be2' : 'rgba(255,255,255,0.05)',
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
      borderRadius: '7px', color: '#fff', cursor: 'pointer',
      fontFamily: 'inherit', fontWeight: 500, fontSize: '0.8rem',
      transition: 'all 0.15s ease'
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {icon}{label}
    </button>
  );
}
