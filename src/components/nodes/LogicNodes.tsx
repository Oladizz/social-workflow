import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch, Copy, Trash2, Plus } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import NodeExecutionBadge from './NodeExecutionBadge';

// Shared pill container
function LogicPill({ id, selected, hovered, color, icon, label, sublabel, children, onDuplicate, onDelete, setInsertionContext, showPlus = true }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
      <NodeExecutionBadge nodeId={id} />
      <Handle type="target" position={Position.Top} style={{ width: 8, height: 8, background: color, border: '2px solid rgba(0,0,0,0.4)', top: '-4px' }} />
      {hovered && <HoverBar id={id} onDuplicate={onDuplicate} onDelete={onDelete} />}
      
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '4px 12px 4px 4px',
        borderRadius: '24px',
        background: 'rgba(15,15,22,0.95)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${color}66`,
        boxShadow: selected ? `0 0 0 2px var(--bg-dark), 0 0 0 4px ${color}` : hovered ? '0 4px 15px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.15s ease',
        transform: hovered ? 'scale(1.02)' : selected ? 'scale(1.01)' : 'scale(1)',
        minWidth: '130px'
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '4px', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{label}</span>
          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.2 }}>{sublabel}</span>
        </div>
      </div>

      {children}

      {showPlus && hovered && (
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

export default function RouterNode({ data, selected, id }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { deleteNode, duplicateNode, setInsertionContext } = useWorkflowStore();
  const branches = (data.branches as string[]) || ['Branch 1', 'Branch 2'];

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <LogicPill
        id={id} selected={selected} hovered={hovered} color="#f59e0b"
        icon={<GitBranch size={14} color="#fff" />} label={`${branches.length} Branches`} sublabel="ROUTER"
        onDuplicate={() => duplicateNode(id)} onDelete={() => deleteNode(id)} setInsertionContext={setInsertionContext}
        showPlus={false} // Routers have custom bottoms
      >
        {branches.map((b, i) => (
          <div key={i} style={{ position: 'absolute', bottom: '-26px', left: `${((i + 1) / (branches.length + 1)) * 100}%`, transform: 'translateX(-50%)' }}>
            <Handle type="source" id={`branch-${i}`} position={Position.Bottom} style={{ width: 8, height: 8, background: '#f59e0b', border: '2px solid rgba(0,0,0,0.4)' }} />
            {hovered && (
               <button
                 onClick={(e) => { e.stopPropagation(); setInsertionContext({ type: 'afterNode', sourceId: id }); }}
                 style={{
                   position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                   width: '20px', height: '20px', borderRadius: '50%',
                   background: 'var(--accent-primary)', color: '#fff', border: 'none',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   cursor: 'pointer', zIndex: 10, animation: 'fadeInMenu 0.15s'
                 }}
               ><Plus size={12} strokeWidth={3} /></button>
            )}
          </div>
        ))}
      </LogicPill>
    </div>
  );
}

export function LoopNode({ data, selected, id }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { deleteNode, duplicateNode, setInsertionContext } = useWorkflowStore();
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <LogicPill
        id={id} selected={selected} hovered={hovered} color="#06b6d4"
        icon={<span style={{ fontSize: '14px' }}>🔁</span>} label="Loop" sublabel="LOGIC"
        onDuplicate={() => duplicateNode(id)} onDelete={() => deleteNode(id)} setInsertionContext={setInsertionContext}
        showPlus={false}
      >
        <Handle type="source" id="loop-body" position={Position.Bottom} style={{ width: 8, height: 8, background: '#06b6d4', border: '2px solid rgba(0,0,0,0.4)', bottom: '-4px', left: '30%' }} />
        <Handle type="source" id="loop-done" position={Position.Bottom} style={{ width: 8, height: 8, background: '#10b981', border: '2px solid rgba(0,0,0,0.4)', bottom: '-4px', left: '70%' }} />
        {hovered && (
           <button
             onClick={(e) => { e.stopPropagation(); setInsertionContext({ type: 'afterNode', sourceId: id }); }}
             style={{
               position: 'absolute', bottom: '-26px', left: '70%', transform: 'translateX(-50%)',
               width: '20px', height: '20px', borderRadius: '50%',
               background: 'var(--accent-primary)', color: '#fff', border: 'none',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               cursor: 'pointer', zIndex: 10, animation: 'fadeInMenu 0.15s'
             }}
           ><Plus size={12} strokeWidth={3} /></button>
        )}
      </LogicPill>
    </div>
  );
}

export function DelayNode({ data, selected, id }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { deleteNode, duplicateNode, setInsertionContext } = useWorkflowStore();
  const amount = (data.amount as number | string) || 5;
  const unit = (data.unit as string) || 'minutes';
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <LogicPill
        id={id} selected={selected} hovered={hovered} color="#8b5cf6"
        icon={<span style={{ fontSize: '14px' }}>⏱️</span>} label={`${amount} ${unit}`} sublabel="DELAY"
        onDuplicate={() => duplicateNode(id)} onDelete={() => deleteNode(id)} setInsertionContext={setInsertionContext}
      >
        <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: '#8b5cf6', border: '2px solid rgba(0,0,0,0.4)', bottom: '-4px' }} />
      </LogicPill>
    </div>
  );
}

export function FilterNode({ data, selected, id }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { deleteNode, duplicateNode, setInsertionContext } = useWorkflowStore();
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <LogicPill
        id={id} selected={selected} hovered={hovered} color="#ec4899"
        icon={<span style={{ fontSize: '14px' }}>🚫</span>} label="Filter" sublabel="LOGIC"
        onDuplicate={() => duplicateNode(id)} onDelete={() => deleteNode(id)} setInsertionContext={setInsertionContext}
        showPlus={false}
      >
        <Handle type="source" id="pass" position={Position.Bottom} style={{ width: 8, height: 8, background: '#10b981', border: '2px solid rgba(0,0,0,0.4)', bottom: '-4px', left: '30%' }} />
        <Handle type="source" id="block" position={Position.Bottom} style={{ width: 8, height: 8, background: '#ef4444', border: '2px solid rgba(0,0,0,0.4)', bottom: '-4px', left: '70%' }} />
        {hovered && (
           <button
             onClick={(e) => { e.stopPropagation(); setInsertionContext({ type: 'afterNode', sourceId: id }); }}
             style={{
               position: 'absolute', bottom: '-26px', left: '30%', transform: 'translateX(-50%)',
               width: '20px', height: '20px', borderRadius: '50%',
               background: 'var(--accent-primary)', color: '#fff', border: 'none',
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               cursor: 'pointer', zIndex: 10, animation: 'fadeInMenu 0.15s'
             }}
           ><Plus size={12} strokeWidth={3} /></button>
        )}
      </LogicPill>
    </div>
  );
}

export function CodeNode({ data, selected, id }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { deleteNode, duplicateNode, setInsertionContext } = useWorkflowStore();
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <LogicPill
        id={id} selected={selected} hovered={hovered} color="#6366f1"
        icon={<span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{'</>'}</span>} label="Code" sublabel="JAVASCRIPT"
        onDuplicate={() => duplicateNode(id)} onDelete={() => deleteNode(id)} setInsertionContext={setInsertionContext}
      >
        <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: '#6366f1', border: '2px solid rgba(0,0,0,0.4)', bottom: '-4px' }} />
      </LogicPill>
    </div>
  );
}

export function HttpNode({ data, selected, id }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { deleteNode, duplicateNode, setInsertionContext } = useWorkflowStore();
  const method = (data.method as string) || 'GET';
  const methodColor: Record<string, string> = { GET: '#10b981', POST: '#3b82f6', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6' };
  const color = methodColor[method] || '#10b981';
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <LogicPill
        id={id} selected={selected} hovered={hovered} color={color}
        icon={<span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{method}</span>} label="HTTP" sublabel="REQUEST"
        onDuplicate={() => duplicateNode(id)} onDelete={() => deleteNode(id)} setInsertionContext={setInsertionContext}
      >
        <Handle type="source" position={Position.Bottom} style={{ width: 8, height: 8, background: color, border: '2px solid rgba(0,0,0,0.4)', bottom: '-4px' }} />
      </LogicPill>
    </div>
  );
}

export function StopNode({ data, selected, id }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { deleteNode, setInsertionContext } = useWorkflowStore();
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <LogicPill
        id={id} selected={selected} hovered={hovered} color="#ef4444"
        icon={<span style={{ fontSize: '14px' }}>⏹</span>} label="Stop" sublabel="END FLOW"
        onDuplicate={() => {}} onDelete={() => deleteNode(id)} setInsertionContext={setInsertionContext}
        showPlus={false}
      />
    </div>
  );
}

// Shared hover bar
function HoverBar({ id, onDuplicate, onDelete }: { id: string; onDuplicate: () => void; onDelete: () => void }) {
  return (
    <div style={{ position: 'absolute', top: '-34px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', background: 'rgba(15,15,22,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '4px', zIndex: 100, animation: 'fadeInMenu 0.15s ease-out' }}>
      <button onClick={onDuplicate} title="Duplicate" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', borderRadius: '5px' }}><Copy size={12} /></button>
      <button onClick={onDelete} title="Delete" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '5px' }}><Trash2 size={12} /></button>
    </div>
  );
}
