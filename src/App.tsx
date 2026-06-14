import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow, MiniMap, Controls, Background, NodeMouseHandler,
  EdgeLabelRenderer, BaseEdge, getBezierPath, EdgeProps, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Pages & Layout
import Header from './components/Header';

// Builder components
import Sidebar from './components/Sidebar';
import PropertiesSidebar from './components/PropertiesSidebar';
import NodeContextMenu from './components/NodeContextMenu';
import ExecutionLogPanel from './components/ExecutionLogPanel';
import ValidationBanner from './components/ValidationBanner';

// Overlays & modals
import ToastContainer from './components/ToastContainer';
import WelcomeModal from './components/WelcomeModal';
import TemplatesModal from './components/TemplatesModal';
import CommandPalette from './components/CommandPalette';



// Nodes
import TriggerNode from './components/nodes/TriggerNode';
import ActionNode from './components/nodes/ActionNode';
import GeminiNode from './components/nodes/GeminiNode';
import RouterNode, { LoopNode, DelayNode, FilterNode, CodeNode, HttpNode, StopNode } from './components/nodes/LogicNodes';
import KnowledgeNode from './components/nodes/KnowledgeNode';
import CustomEdge from './components/edges/CustomEdge';

// Store
import { useWorkflowStore } from './store/useWorkflowStore';
import { useConnectionsStore } from './store/useConnectionsStore';
import { useKnowledgeStore } from './store/useKnowledgeStore';
import { useExecutionStore } from './store/useExecutionStore';
import { useToast } from './store/useToastStore';
import './index.css';

// ─── Edge Types ─────────────────────────────────────────────

// ─── Empty canvas hint ────────────────────────────────────────────────────────
function EmptyHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
      <div style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚡</div>
        <p style={{ color: 'rgba(255,255,255,0.35)', margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 600 }}>Start building your automation</p>
        <p style={{ color: 'rgba(255,255,255,0.25)', margin: 0, fontSize: '0.8rem' }}>Press <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>⌘K</kbd> or drag a piece from the left sidebar</p>
      </div>
    </div>
  );
}

import { useParams } from 'react-router-dom';

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App({ isDebugMode = false }: { isDebugMode?: boolean }) {
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('sf_seen_welcome'));
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showExecLog, setShowExecLog] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);

  const { 
    nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, autoLayout, 
    saveToLocalStorage, saveToFirestore, loadFromFirestore,
    insertionContext, setInsertionContext
  } = useWorkflowStore();
  const { loadFromStorage: loadConns, loadFromFirestore: loadConnsFirestore, saveToFirestore: saveConnsFirestore } = useConnectionsStore();
  const { loadFromStorage: loadKB, loadFromFirestore: loadKBFirestore, saveToFirestore: saveKBFirestore } = useKnowledgeStore();
  const { startRun, loadRunsFromFirestore } = useExecutionStore();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();

  // Load and migrate: localStorage → Firestore (one-time migration + ongoing sync)
  useEffect(() => {
    const MIGRATION_KEY = 'sf_firestore_migrated';
    const initLoad = async () => {
      // Step 1: Always load localStorage first (instant, works offline)
      loadConns();
      loadKB();
      useWorkflowStore.getState().loadFromLocalStorage();
      // Load run history from localStorage
      try {
        const runsData = localStorage.getItem('sf_runs');
        if (runsData) {
          const runs = JSON.parse(runsData);
          if (runs.length > 0) useExecutionStore.setState({ runs });
        }
      } catch {}

      // Step 2: Try loading from Firestore
      try {
        if (isDebugMode && id) {
          console.log('[SocialFlow] Loading debug run:', id);
          // Load run data
          const { getDoc, collection, getDocs, doc } = await import('firebase/firestore');
          const { db } = await import('./firebase');
          const runDoc = await getDoc(doc(db, 'executionLogs', id));
          if (runDoc.exists()) {
            const runData = runDoc.data();
            const wfId = runData.workflowId;
            
            // Load original workflow
            if (wfId) await loadFromFirestore(wfId);

            // Load steps
            const stepsSnap = await getDocs(collection(db, 'executionLogs', id, 'steps'));
            const stepsData = stepsSnap.docs.map(d => ({ stepId: d.id, ...d.data() }));
            
            // Populate execution store
            useExecutionStore.setState({ 
              runs: [{ 
                id, 
                workflowName: runData.workflowName, 
                status: runData.status,
                startedAt: runData.startedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                steps: stepsData as any,
                triggerData: runData.triggerPayload
              }], 
              activeRunId: id 
            });
            console.log('[SocialFlow] Loaded debug run with', stepsData.length, 'steps');
          }
        } else if (id) {
          const wfLoaded = await loadFromFirestore(id);
          if (wfLoaded) {
            console.log('[SocialFlow] Loaded workflow', id, 'from Firestore');
          }
        }

        await loadConnsFirestore();
        await loadKBFirestore();
        await loadRunsFromFirestore();
      } catch (e) {
        console.warn('[SocialFlow] Firestore load failed:', e);
      }
    };
    initLoad();
  }, [id, isDebugMode, loadConns, loadKB, loadFromFirestore, loadConnsFirestore, loadKBFirestore, loadRunsFromFirestore]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    // Save to local storage first for speed/offline fallback
    saveToLocalStorage();
    useConnectionsStore.getState().saveToStorage();
    useKnowledgeStore.getState().saveToStorage();
    toast.info('Saving to cloud...');
    try {
      await Promise.all([
        saveToFirestore(id),
        saveConnsFirestore(),
        saveKBFirestore(),
      ]);
      toast.success('Saved to Firebase!');
    } catch (e) {
      toast.error('Cloud save failed, saved locally.');
    }
  }, [id, saveToLocalStorage, saveToFirestore, saveConnsFirestore, saveKBFirestore, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
      if (e.key === 'Escape') { setShowCommandPalette(false); setContextMenu(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const nodeTypes = useMemo(() => ({
    triggerNode: TriggerNode,
    actionNode: ActionNode,
    aiNode: GeminiNode,
    routerNode: RouterNode,
    loopNode: LoopNode,
    delayNode: DelayNode,
    filterNode: FilterNode,
    codeNode: CodeNode,
    httpNode: HttpNode,
    stopNode: StopNode,
    knowledgeNode: KnowledgeNode,
  }), []);

  const edgeTypes = useMemo(() => ({ default: CustomEdge, smoothstep: CustomEdge }), []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as any;
    const platform = event.dataTransfer.getData('application/reactflow-platform');
    const triggerType = event.dataTransfer.getData('application/reactflow-triggertype');
    const logicType = event.dataTransfer.getData('application/reactflow-logictype');
    const actionType = event.dataTransfer.getData('application/reactflow-actiontype');
    if (!type) return;

    const data =
      type === 'action'  ? { platform: platform || 'twitter' } :
      type === 'ai'      ? { prompt: '', model: 'gemini-2.5-flash' } :
      type === 'trigger' ? { triggerType: triggerType || 'schedule' } :
      type === 'logic'   ? { nodeType: logicType || 'routerNode' } :
      type === 'knowledge' ? { actionType: actionType || 'search_vector_db' } : {};

    addNode(type, data);
    toast.info(`Node added to canvas`);
  }, [addNode, toast]);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);
  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => { event.preventDefault(); setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY }); }, []);

  const handleRun = async () => {
    const runId = startRun(useWorkflowStore.getState().workflowName);
    toast.info('Workflow started...');
    setShowExecLog(true);

    const { executeWorkflow } = await import('./utils/executor');

    try {
      await executeWorkflow(
        runId,
        nodes,
        edges,
        (stepId) => {
          const node = nodes.find(n => n.id === stepId);
          if (node) {
            useExecutionStore.getState().updateStep(runId, {
              stepId: node.id,
              stepType: node.type || '',
              stepLabel: (node.data.platform as string) || (node.data.triggerType as string) || node.type || 'step',
              status: 'running',
              durationMs: 0
            });
          }
        },
        (stepId, status, output, error) => {
          const node = nodes.find(n => n.id === stepId);
          if (node) {
            useExecutionStore.getState().updateStep(runId, {
              stepId: node.id,
              stepType: node.type || '',
              stepLabel: (node.data.platform as string) || (node.data.triggerType as string) || node.type || 'step',
              status,
              output: output ?? null,
              error: error ?? null,
              durationMs: 500 // In a real app we'd calculate this
            });
          }
        }
      );

      // Check if any step failed
      const run = useExecutionStore.getState().runs.find(r => r.id === runId);
      const hasError = run?.steps.some(s => s.status === 'error');

      if (hasError) {
        useExecutionStore.getState().finishRun(runId, 'error');
        toast.error('Workflow failed!');
      } else {
        useExecutionStore.getState().finishRun(runId, 'success');
        toast.success('Workflow completed successfully!');
      }

    } catch (err: any) {
      toast.error(`Execution Error: ${err.message}`);
      useExecutionStore.getState().finishRun(runId, 'error');
    }
  };

  const handleWelcome = (openTemplates: boolean) => {
    localStorage.setItem('sf_seen_welcome', '1');
    setShowWelcome(false);
    if (openTemplates) setShowTemplates(true);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-dark)', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* ── BUILDER PAGE ── */}
        <Header
          onSave={handleSave}
          onRun={handleRun}
              onAutoLayout={() => { autoLayout(); toast.info('Canvas rearranged!'); }}
              onOpenTemplates={() => setShowTemplates(true)}
            />
            <ValidationBanner />
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
              {/* Piece sidebar */}
              {!isDebugMode && <Sidebar />}

              {/* Canvas */}
              <div style={{ flex: 1, position: 'relative' }} onDrop={!isDebugMode ? onDrop : undefined} onDragOver={!isDebugMode ? onDragOver : undefined}>
                {!isDebugMode && <EmptyHint show={nodes.length <= 1} />}
                <ReactFlow
                  nodes={nodes} edges={edges}
                  onNodesChange={!isDebugMode ? onNodesChange : undefined} 
                  onEdgesChange={!isDebugMode ? onEdgesChange : undefined} 
                  onConnect={!isDebugMode ? onConnect : undefined}
                  nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                  onNodeContextMenu={!isDebugMode ? onNodeContextMenu : undefined}
                  onPaneClick={() => setContextMenu(null)}
                  fitView fitViewOptions={{ padding: 0.4 }}
                  minZoom={0.15} maxZoom={3}
                  proOptions={{ hideAttribution: true }}
                  nodesDraggable={!isDebugMode}
                  nodesConnectable={!isDebugMode}
                  elementsSelectable={true}
                >
                  <Background color="rgba(255,255,255,0.035)" gap={28} size={1} />
                  <Controls style={{ bottom: '20px', left: '20px' }} />
                  <MiniMap
                    nodeColor={n => n.type === 'triggerNode' ? '#FFD700' : n.type === 'aiNode' ? '#F5A623' : n.type?.includes('Node') ? '#06b6d4' : '#8a2be2'}
                    maskColor="rgba(10,10,15,0.8)"
                    style={{ backgroundColor: 'rgba(10,10,15,0.85)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}
                  />
                </ReactFlow>
              </div>

              {/* Right panel: Properties + Exec Log */}
              <div style={{ width: showExecLog ? '320px' : '300px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, overflow: 'hidden' }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                  {[['Settings', false], ['Logs', true]].map(([label, isLog]) => (
                    <button key={label as string} onClick={() => setShowExecLog(isLog as boolean)} style={{ flex: 1, padding: '8px', background: 'none', border: 'none', color: showExecLog === isLog ? '#a78bfa' : 'rgba(255,255,255,0.35)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: showExecLog === isLog ? 600 : 400, borderBottom: showExecLog === isLog ? '2px solid #8a2be2' : '2px solid transparent' }}>
                      {label as string}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  {showExecLog ? <ExecutionLogPanel /> : <PropertiesSidebar isDebugMode={isDebugMode} />}
                </div>
              </div>
            </div>

            {/* Context menu */}
            {!isDebugMode && contextMenu && <NodeContextMenu nodeId={contextMenu.nodeId} x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} />}
      </div>

      {/* ── GLOBAL OVERLAYS ── */}
      <ToastContainer />
      {showWelcome && <WelcomeModal onStartBlank={() => handleWelcome(false)} onUseTemplate={() => handleWelcome(true)} />}
      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} />}
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} />}
      {insertionContext && <CommandPalette onClose={() => setInsertionContext(null)} />}
    </div>
  );
}
