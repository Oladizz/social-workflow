import React, { useMemo } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { getPlatformById } from '../data/platforms';

export default function ValidationBanner() {
  const { nodes, edges } = useWorkflowStore();

  const issues = useMemo(() => {
    const problems: string[] = [];
    const hasTrigger = nodes.some(n => n.type === 'triggerNode');
    const hasActions = nodes.some(n => n.type === 'actionNode' || n.type === 'aiNode');

    if (!hasTrigger) problems.push('No trigger node — add a trigger to start the flow.');
    if (nodes.length > 1 && edges.length === 0) problems.push('Nodes are not connected — drag from a node handle to connect them.');

    nodes.forEach(n => {
      if (n.type === 'actionNode') {
        const platform = getPlatformById(n.data.platform as string);
        if (!n.data.apiKey) {
          problems.push(`${platform?.name || n.data.platform}: API key is missing in settings.`);
        }
      }
      if (n.type === 'aiNode' && !n.data.apiKey) {
        problems.push('Gemini AI: API key is missing in settings.');
      }
    });

    return problems;
  }, [nodes, edges]);

  const isValid = issues.length === 0 && nodes.length > 1;

  if (nodes.length <= 1 && issues.length === 0) return null;

  return (
    <div style={{
      padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: isValid ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
      display: 'flex', alignItems: 'flex-start', gap: '10px', flexShrink: 0,
      transition: 'all 0.3s ease'
    }}>
      {isValid ? (
        <>
          <CheckCircle size={15} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '0.78rem', color: '#10b981', margin: 0 }}>
            Workflow looks good! Hit <strong>Run Flow</strong> when you're ready.
          </p>
        </>
      ) : (
        <>
          <AlertTriangle size={15} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            {issues.map((issue, i) => (
              <p key={i} style={{ fontSize: '0.78rem', color: '#f59e0b', margin: '1px 0' }}>
                ⚠️ {issue}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
