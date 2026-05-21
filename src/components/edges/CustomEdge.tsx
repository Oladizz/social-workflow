import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  source,
  target
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { setInsertionContext } = useWorkflowStore();

  const handleAddBetween = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInsertionContext({
      type: 'betweenNodes',
      sourceId: source,
      targetId: target
    });
    // Fire an event to open command palette (App.tsx listens to insertionContext)
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 10,
          }}
          className="nodrag nopan"
        >
          <button
            onClick={handleAddBetween}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(138,43,226,0.2)',
              border: '1px solid rgba(138,43,226,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#a78bfa',
              transition: 'all 0.15s',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(138,43,226,0.8)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(138,43,226,0.2)';
              e.currentTarget.style.color = '#a78bfa';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Insert node between"
          >
            <Plus size={12} strokeWidth={3} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
