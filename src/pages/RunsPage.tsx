import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Play, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRuns() {
      try {
        const q = query(collection(db, 'executionLogs'), orderBy('startedAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRuns(data);
      } catch (e) {
        console.error('Failed to fetch runs:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchRuns();
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 size={18} color="#10b981" />;
    if (status === 'error' || status === 'failed') return <XCircle size={18} color="#ef4444" />;
    if (status === 'running') return <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(138,43,226,0.3)', borderTopColor: '#8a2be2', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />;
    return <Clock size={18} color="#f5a623" />;
  };

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Execution Runs</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View the history of all your automated workflow executions.</p>
      </header>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading runs...</div>
        ) : runs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No runs found yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Flow Name</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Trigger</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Started At</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(run.status)}
                      <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{run.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>{run.workflowName || 'Unnamed Flow'}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {run.triggerPayload?.rss ? 'RSS Feed' : run.triggerPayload?.webhook ? 'Webhook' : 'Manual'}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {run.startedAt?.toDate ? run.startedAt.toDate().toLocaleString() : 'Just now'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button 
                      onClick={() => navigate(`/runs/${run.id}`)}
                      className="capsule" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
