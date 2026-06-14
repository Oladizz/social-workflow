import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Activity, Clock, Trash2, Edit2 } from 'lucide-react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import ConfirmModal from '../components/ConfirmModal';
import '../index.css';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wfToDelete, setWfToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const q = query(collection(db, 'workflows'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      setWorkflows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewWorkflow = async () => {
    try {
      const docRef = await addDoc(collection(db, 'workflows'), {
        name: 'Untitled Workflow',
        nodes: [],
        edges: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      navigate(`/flows/${docRef.id}`);
    } catch (e) {
      console.error('Error creating workflow:', e);
    }
  };

  const deleteWorkflow = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWfToDelete(id);
  };

  const confirmDelete = async () => {
    if (wfToDelete) {
      try {
        await deleteDoc(doc(db, 'workflows', wfToDelete));
        setWorkflows(workflows.filter(w => w.id !== wfToDelete));
      } catch (error) {
        console.error('Error deleting workflow:', error);
      } finally {
        setWfToDelete(null);
      }
    }
  };

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }} className="fade-in-up">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Workflows</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your social media automation</p>
        </div>
        
        <button onClick={createNewWorkflow} className="capsule" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
          background: 'var(--accent-primary)', color: 'white', border: 'none',
          fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(138, 43, 226, 0.4)'
        }}>
          <Plus size={20} /> New Workflow
        </button>
      </header>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Activity size={48} color="var(--accent-primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No workflows yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Create your first automation workflow to get started.</p>
          <button onClick={createNewWorkflow} className="capsule" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Create Workflow
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {workflows.map((wf, idx) => (
            <div 
              key={wf.id} 
              onClick={() => navigate(`/flows/${wf.id}`)}
              className="glass-panel custom-node fade-in-up" 
              style={{ width: '100%', animationDelay: `${0.05 * (idx + 1)}s`, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(138,43,226,0.2), transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Activity size={20} color="var(--accent-primary)" />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/flows/${wf.id}`); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => deleteWorkflow(e, wf.id)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.7)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{wf.name || 'Untitled Workflow'}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
                <Clock size={14} /> 
                {wf.updatedAt?.toDate ? `Updated ${wf.updatedAt.toDate().toLocaleDateString()}` : 'Just now'}
                <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>
                  {wf.nodes?.length || 0} nodes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!wfToDelete}
        title="Delete Workflow"
        message="Are you sure you want to delete this workflow? This action cannot be undone."
        confirmText="Delete Workflow"
        onConfirm={confirmDelete}
        onCancel={() => setWfToDelete(null)}
      />
    </div>
  );
}
