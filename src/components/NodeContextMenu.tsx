import React, { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { getPlatformById } from '../data/platforms';

interface NodeContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export default function NodeContextMenu({ nodeId, x, y, onClose }: NodeContextMenuProps) {
  const { nodes, deleteNode, duplicateNode } = useWorkflowStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const node = nodes.find(n => n.id === nodeId);
  const platform = node?.data?.platform ? getPlatformById(node.data.platform as string) : null;

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  if (!node) return null;

  const menuStyle: React.CSSProperties = {
    position: 'fixed', top: y, left: x, zIndex: 9999,
    background: 'rgba(15, 15, 22, 0.95)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
    padding: '8px', minWidth: '200px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    animation: 'fadeInMenu 0.15s ease-out'
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.875rem', color: '#fff', transition: 'background 0.15s ease',
    background: 'transparent', border: 'none', width: '100%', textAlign: 'left'
  };

  const MenuItem = ({ icon, label, onClick, danger }: any) => (
    <button 
      style={{ ...itemStyle, color: danger ? '#ff5555' : '#fff' }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(255,50,50,0.1)' : 'rgba(255,255,255,0.07)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      onClick={() => { onClick(); onClose(); }}
    >
      <span>{icon}</span><span>{label}</span>
    </button>
  );

  return (
    <>
      <style>{`@keyframes fadeInMenu { from { opacity:0; transform: scale(0.95) translateY(-5px); } to { opacity:1; transform: scale(1) translateY(0); } }`}</style>
      <div ref={menuRef} style={menuStyle}>
        {/* Header */}
        {platform && (
          <div style={{ padding: '8px 12px 4px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '4px' }}>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {platform.name}
            </p>
          </div>
        )}

        <MenuItem icon="✏️" label="Edit Settings" onClick={() => {}} />
        <MenuItem icon="📋" label="Duplicate Node" onClick={() => duplicateNode(nodeId)} />
        
        {node.type === 'actionNode' && platform && (
          <>
            <div style={{ padding: '4px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '4px' }}>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Change Action</p>
              {platform.actions.map(action => (
                <MenuItem 
                  key={action.id}
                  icon={action.icon} 
                  label={action.label} 
                  onClick={() => {
                    useWorkflowStore.getState().updateNodeData(nodeId, { selectedAction: action.id });
                  }} 
                />
              ))}
            </div>
          </>
        )}
        
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '4px', paddingTop: '4px' }}>
          <MenuItem icon="🗑️" label="Delete Node" onClick={() => deleteNode(nodeId)} danger />
        </div>
      </div>
    </>
  );
}
