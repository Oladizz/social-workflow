import React from 'react';
import { useExecutionStore } from '../../store/useExecutionStore';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function NodeExecutionBadge({ nodeId }: { nodeId: string }) {
  const { runs, activeRunId } = useExecutionStore();
  
  if (!activeRunId) return null;
  
  const activeRun = runs.find(r => r.id === activeRunId);
  if (!activeRun) return null;
  
  const stepLog = activeRun.steps.find(s => s.stepId === nodeId);
  if (!stepLog) return null;

  const getIcon = () => {
    if (stepLog.status === 'success') return <CheckCircle2 size={16} color="#10b981" />;
    if (stepLog.status === 'error') return <XCircle size={16} color="#ef4444" />;
    if (stepLog.status === 'running') return <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(138,43,226,0.3)', borderTopColor: '#8a2be2', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />;
    return <Clock size={16} color="#f5a623" />;
  };

  return (
    <div style={{
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      background: 'var(--bg-dark)',
      borderRadius: '50%',
      padding: '2px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
      zIndex: 20
    }}>
      {getIcon()}
    </div>
  );
}
