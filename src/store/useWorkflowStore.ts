import { create } from 'zustand';
import {
  Connection, Edge, EdgeChange, Node, NodeChange,
  addEdge, OnNodesChange, OnEdgesChange, OnConnect,
  applyNodeChanges, applyEdgeChanges,
} from '@xyflow/react';
import { WorkflowTemplate } from '../data/templates';
import { doc, setDoc, getDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export type AppNode = Node;
export type AppEdge = Edge;

type WorkflowState = {
  nodes: AppNode[];
  edges: AppEdge[];
  workflowName: string;
  workflowId: string | null;
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  insertionContext: { type: 'afterNode' | 'betweenNodes'; sourceId: string; targetId?: string } | null;
  setInsertionContext: (context: { type: 'afterNode' | 'betweenNodes'; sourceId: string; targetId?: string } | null) => void;
  addNode: (type: 'trigger' | 'action' | 'ai' | string, data: any) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  autoLayout: () => void;
  loadTemplate: (template: WorkflowTemplate) => void;
  setWorkflowName: (name: string) => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  saveToFirestore: (id: string) => Promise<void>;
  loadFromFirestore: (id: string) => Promise<boolean>;
};

let idCounter = 100;
const getId = () => `node_${idCounter++}`;

const DEFAULT_NODES: AppNode[] = [
  {
    id: '1',
    type: 'triggerNode',
    position: { x: 400, y: 80 },
    data: { triggerType: 'schedule', scheduleFreq: 'daily', scheduleTime: '09:00' },
  },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: DEFAULT_NODES,
  edges: [],
  workflowName: 'My Workflow',
  workflowId: null,
  insertionContext: null,
  setInsertionContext: (context) => set({ insertionContext: context }),

  onNodesChange: (changes: NodeChange<AppNode>[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({
        ...connection, animated: true,
        style: { stroke: '#8a2be2', strokeWidth: 2 }
      }, get().edges),
    });
  },
  setInsertionContext: (context) => set({ insertionContext: context }),
  addNode: (type, data) => {
    // Logic nodes use the nodeType from data, everything else maps directly
    const LOGIC_TYPES = ['routerNode','loopNode','delayNode','filterNode','codeNode','httpNode','stopNode'];
    const nodeType =
      type === 'trigger'             ? 'triggerNode' :
      type === 'ai'                  ? 'aiNode' :
      type === 'knowledge'           ? 'knowledgeNode' :
      LOGIC_TYPES.includes(type)     ? type :
      data?.nodeType && LOGIC_TYPES.includes(data.nodeType) ? data.nodeType :
                                       'actionNode';

    const ctx = get().insertionContext;
    let newX = 280 + Math.random() * 200;
    let newY = 200 + Math.random() * 200;

    if (ctx) {
      const sourceNode = get().nodes.find(n => n.id === ctx.sourceId);
      if (sourceNode) {
        newX = sourceNode.position.x;
        newY = sourceNode.position.y + 150; // Place 150px below source node
      }
    }

    const newNode: AppNode = {
      id: getId(), type: nodeType,
      position: { x: newX, y: newY },
      data,
    };

    let newNodes = get().nodes.concat(newNode);
    let newEdges = get().edges;

    if (ctx) {
      if (ctx.type === 'afterNode') {
        newEdges = addEdge({ source: ctx.sourceId, target: newNode.id, animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } }, newEdges);
      } else if (ctx.type === 'betweenNodes' && ctx.targetId) {
        // Remove old edge
        newEdges = newEdges.filter(e => !(e.source === ctx.sourceId && e.target === ctx.targetId));
        // Add two new edges
        newEdges = addEdge({ source: ctx.sourceId, target: newNode.id, animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } }, newEdges);
        newEdges = addEdge({ source: newNode.id, target: ctx.targetId, animated: true, style: { stroke: '#8a2be2', strokeWidth: 2 } }, newEdges);
        
        // Push target nodes down
        newNodes = newNodes.map(n => {
          if (n.id === ctx.targetId || get().edges.some(e => e.source === ctx.targetId && e.target === n.id)) {
            return { ...n, position: { x: n.position.x, y: n.position.y + 150 } };
          }
          return n;
        });
      }
    }

    set({ nodes: newNodes, edges: newEdges, insertionContext: null });
  },
  updateNodeData: (nodeId, newData) => {
    set({
      nodes: get().nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n),
    });
  },
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    });
  },
  duplicateNode: (nodeId) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return;
    set({
      nodes: get().nodes.concat({
        ...node, id: getId(),
        position: { x: node.position.x + 80, y: node.position.y + 80 },
        selected: false,
      }),
    });
  },
  loadTemplate: (template) => {
    // Give template nodes fresh IDs to avoid collisions
    const idMap: Record<string, string> = {};
    template.nodes.forEach(n => { idMap[n.id] = getId(); });
    const newNodes = template.nodes.map(n => ({ ...n, id: idMap[n.id] }));
    const newEdges = template.edges.map(e => ({
      ...e, id: `e_${getId()}`,
      source: idMap[e.source], target: idMap[e.target]
    }));
    set({ nodes: newNodes, edges: newEdges, workflowName: template.name });
  },
  setWorkflowName: (name) => set({ workflowName: name }),
  saveToLocalStorage: () => {
    const { nodes, edges, workflowName } = get();
    const workflows = JSON.parse(localStorage.getItem('sf_workflows') || '[]');
    const existing = workflows.findIndex((w: any) => w.name === workflowName);
    const entry = { name: workflowName, nodes, edges, savedAt: new Date().toISOString() };
    if (existing >= 0) workflows[existing] = entry;
    else workflows.push(entry);
    localStorage.setItem('sf_workflows', JSON.stringify(workflows));
  },
  loadFromLocalStorage: () => {
    const data = localStorage.getItem('sf_workflows');
    if (!data) return false;
    try {
      const workflows = JSON.parse(data);
      if (workflows.length > 0) {
        const last = workflows[workflows.length - 1];
        set({ nodes: last.nodes, edges: last.edges, workflowName: last.name });
        return true;
      }
    } catch {}
    return false;
  },
  saveToFirestore: async (id: string) => {
    const { nodes, edges, workflowName } = get();
    try {
      const docRef = doc(db, 'workflows', id);
      await setDoc(docRef, {
        name: workflowName,
        nodes,
        edges,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.error('Error saving to Firestore:', e);
    }
  },
  loadFromFirestore: async (id: string) => {
    try {
      const docRef = doc(db, 'workflows', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({ nodes: data.nodes || [], edges: data.edges || [], workflowName: data.name || 'Untitled Workflow', workflowId: id });
        return true;
      }
    } catch (e) {
      console.error('Error loading from Firestore:', e);
    }
    return false;
  },
  autoLayout: () => {
    const { nodes, edges } = get();
    const incomingCount: Record<string, number> = {};
    nodes.forEach(n => { incomingCount[n.id] = 0; });
    edges.forEach(e => { incomingCount[e.target] = (incomingCount[e.target] || 0) + 1; });

    const roots = nodes.filter(n => !incomingCount[n.id]);
    const positioned: Record<string, { x: number; y: number }> = {};
    const colUsed: Record<number, number> = {};

    const processNode = (nodeId: string, depth: number, column: number) => {
      const y = depth * 150;
      const x = column * 160;
      colUsed[column] = Math.max(colUsed[column] || 0, depth);
      positioned[nodeId] = { x, y };
      const children = edges.filter(e => e.source === nodeId).map(e => e.target);
      children.forEach((childId, i) => processNode(childId, depth + 1, column + i));
    };

    roots.forEach((root, i) => processNode(root.id, 0, i * 3));

    const allX = Object.values(positioned).map(p => p.x);
    const midX = allX.length ? (Math.min(...allX) + Math.max(...allX)) / 2 : 0;
    const offsetX = 450 - midX;

    set({
      nodes: nodes.map(n => ({
        ...n,
        position: positioned[n.id]
          ? { x: positioned[n.id].x + offsetX, y: positioned[n.id].y + 80 }
          : n.position,
      })),
    });
  },
}));
