import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { getPlatformById } from '../../data/platforms';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { Settings2, Copy, Trash2, Plus } from 'lucide-react';
import NodeExecutionBadge from './NodeExecutionBadge';

export default function ActionNode({ data, selected, id }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { deleteNode, duplicateNode, setInsertionContext } = useWorkflowStore();
  const platform = data.platform as string;
  const selectedAction = data.selectedAction as string | undefined;
  const config = getPlatformById(platform);
  const actionLabel = config?.actions.find(a => a.id === selectedAction)?.label || config?.actions[0]?.label || 'Action';
  const Icon = config?.IconComponent;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer', position: 'relative' }}
    >
      <NodeExecutionBadge nodeId={id} />
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, background: config?.color || '#8a2be2', border: '2px solid rgba(0,0,0,0.4)', top: '-4px' }} />

      {/* Hover action bar */}
      {hovered && (
        <div style={{
          position: 'absolute', top: '-34px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '4px', background: 'rgba(15,15,22,0.95)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px',
          zIndex: 100, animation: 'fadeInMenu 0.15s ease-out'
        }}>
          {[
            { icon: <Settings2 size={12} />, title: 'Settings', action: () => {} },
            { icon: <Copy size={12} />, title: 'Duplicate', action: () => duplicateNode(id) },
            { icon: <Trash2 size={12} />, title: 'Delete', action: () => deleteNode(id), danger: true },
          ].map((btn, i) => (
            <button key={i} title={btn.title} onClick={btn.action} style={{
              width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', color: btn.danger ? '#ef4444' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer', borderRadius: '5px', transition: 'background 0.1s'
            }}>
              {btn.icon}
            </button>
          ))}
        </div>
      )}

      {/* Pill Container */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '4px 12px 4px 4px',
        borderRadius: '24px',
        background: 'rgba(15,15,22,0.95)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${config?.color || '#8a2be2'}66`,
        boxShadow: selected ? `0 0 0 2px var(--bg-dark), 0 0 0 4px ${config?.color || '#8a2be2'}` : hovered ? '0 4px 15px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.15s ease',
        transform: hovered ? 'scale(1.02)' : selected ? 'scale(1.01)' : 'scale(1)',
        minWidth: '130px'
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
          background: config?.bgGradient || 'linear-gradient(135deg,#8a2be2,#4169e1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {Icon ? <Icon size={14} color="#fff" /> : <Settings2 size={14} color="#fff" />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '4px', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{actionLabel}</span>
          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.2 }}>{config?.name || platform}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: config?.color || '#8a2be2', border: '2px solid rgba(0,0,0,0.4)', bottom: '-4px' }} />

      {/* Insert Node Button */}
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); setInsertionContext({ type: 'afterNode', sourceId: id }); }}
          style={{
            position: 'absolute', bottom: '-26px', left: '50%', transform: 'translateX(-50%)',
            width: '20px', height: '20px', borderRadius: '50%',
            background: 'var(--accent-primary)', color: '#fff', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10, animation: 'fadeInMenu 0.15s'
          }}
          title="Add node after"
        >
          <Plus size={12} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
