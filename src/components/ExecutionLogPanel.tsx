import React, { useState } from 'react';
import { useExecutionStore } from '../store/useExecutionStore';
import { Activity, ChevronDown, ChevronRight, RefreshCw, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

function StepRow({ step }: { step: any }) {
  const [open, setOpen] = useState(false);
  const c = step.status === 'success' ? '#10b981' : step.status === 'error' ? '#ef4444' : step.status === 'running' ? '#f59e0b' : 'rgba(255,255,255,0.3)';
  const icon = step.status === 'success' ? <CheckCircle size={13} color={c} /> : step.status === 'error' ? <XCircle size={13} color={c} /> : <Clock size={13} color={c} />;

  return (
    <div style={{ borderLeft: `2px solid ${c}`, paddingLeft: '10px', marginBottom: '4px' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', padding: '4px 0', width: '100%', textAlign: 'left' }}>
        {icon}
        <span style={{ flex: 1 }}>{step.stepLabel}</span>
        {step.durationMs && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{step.durationMs}ms</span>}
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <div style={{ marginTop: '6px', marginBottom: '8px' }}>
          {step.output && (
            <div style={{ marginBottom: '6px' }}>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>Output</p>
              <pre style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '6px', padding: '8px', color: '#6ee7b7', margin: 0, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(step.output, null, 2).slice(0, 500)}
              </pre>
            </div>
          )}
          {step.error && (
            <div>
              <p style={{ fontSize: '0.65rem', color: 'rgba(239,68,68,0.7)', marginBottom: '3px' }}>ERROR</p>
              <pre style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '8px', color: '#fca5a5', margin: 0, whiteSpace: 'pre-wrap' }}>{step.error}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RunRow({ run }: { run: any }) {
  const [open, setOpen] = useState(false);
  const { replayRun } = useExecutionStore();
  const statusColor = run.status === 'success' ? '#10b981' : run.status === 'error' ? '#ef4444' : run.status === 'running' ? '#f59e0b' : 'rgba(255,255,255,0.3)';
  const duration = run.finishedAt ? `${((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000).toFixed(1)}s` : 'running...';

  return (
    <div style={{ marginBottom: '8px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
        background: 'rgba(255,255,255,0.02)', border: 'none', color: '#fff',
        cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, flexShrink: 0, boxShadow: run.status === 'running' ? `0 0 8px ${statusColor}` : 'none' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 500 }}>{run.workflowName}</p>
          <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
            {new Date(run.startedAt).toLocaleString()} · {duration} · {run.steps.length} steps
          </p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); replayRun(run.id); }} title="Replay" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '3px', borderRadius: '5px', display: 'flex' }}>
          <RefreshCw size={13} />
        </button>
        {open ? <ChevronDown size={14} color="rgba(255,255,255,0.4)" /> : <ChevronRight size={14} color="rgba(255,255,255,0.4)" />}
      </button>
      {open && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {run.steps.length === 0 ? <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>No steps logged.</p> : run.steps.map((s: any) => <StepRow key={s.stepId} step={s} />)}
        </div>
      )}
    </div>
  );
}

export default function ExecutionLogPanel() {
  const { runs, clearRuns } = useExecutionStore();

  return (
    <div style={{ padding: '20px 16px', overflowY: 'auto', height: '100%', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Activity size={16} color="#a78bfa" />
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, flex: 1 }}>Execution Log</h3>
        {runs.length > 0 && (
          <button onClick={clearRuns} title="Clear log" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '3px', borderRadius: '5px', display: 'flex' }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {runs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.2)' }}>
          <Activity size={36} style={{ marginBottom: '10px', opacity: 0.3 }} />
          <p style={{ fontSize: '0.82rem' }}>No runs yet. Hit Run Flow to see execution history here.</p>
        </div>
      ) : (
        runs.map(run => <RunRow key={run.id} run={run} />)
      )}
    </div>
  );
}
