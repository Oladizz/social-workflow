import { create } from 'zustand';
import { doc, setDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export type StepStatus = 'pending' | 'running' | 'success' | 'error' | 'skipped';

export interface StepLog {
  stepId: string;
  stepType: string;
  stepLabel: string;
  status: StepStatus;
  input?: any;
  output?: any;
  error?: string;
  durationMs?: number;
}

export interface ExecutionRun {
  id: string;
  workflowName: string;
  startedAt: string;
  finishedAt?: string;
  status: 'running' | 'success' | 'error' | 'cancelled';
  steps: StepLog[];
  triggerData?: any;
}

type ExecutionState = {
  runs: ExecutionRun[];
  activeRunId: string | null;
  startRun: (workflowName: string, triggerData?: any) => string;
  updateStep: (runId: string, step: StepLog) => void;
  finishRun: (runId: string, status: 'success' | 'error' | 'cancelled') => void;
  clearRuns: () => void;
  replayRun: (runId: string) => void;
  saveRunsToFirestore: () => Promise<void>;
  loadRunsFromFirestore: () => Promise<void>;
};

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  runs: [],
  activeRunId: null,
  startRun: (workflowName, triggerData) => {
    const id = `run_${Date.now()}`;
    const run: ExecutionRun = {
      id, workflowName, status: 'running',
      startedAt: new Date().toISOString(), steps: [], triggerData
    };
    set(s => ({ runs: [run, ...s.runs].slice(0, 50), activeRunId: id }));
    return id;
  },
  updateStep: (runId, step) => {
    set(s => ({
      runs: s.runs.map(r =>
        r.id === runId
          ? { ...r, steps: [...r.steps.filter(st => st.stepId !== step.stepId), step] }
          : r
      )
    }));
  },
  finishRun: (runId, status) => {
    set(s => ({
      runs: s.runs.map(r =>
        r.id === runId ? { ...r, status, finishedAt: new Date().toISOString() } : r
      ),
      activeRunId: null,
    }));
    // Persist last 20 runs to localStorage and Firestore
    const { runs } = get();
    localStorage.setItem('sf_runs', JSON.stringify(runs.slice(0, 20)));
    get().saveRunsToFirestore();
  },
  clearRuns: () => {
    set({ runs: [], activeRunId: null });
    localStorage.removeItem('sf_runs');
  },
  replayRun: (runId) => {
    const run = get().runs.find(r => r.id === runId);
    if (run) {
      // Trigger re-execution with original trigger data
      console.log('Replaying run', runId, 'with trigger data:', run.triggerData);
    }
  },
  saveRunsToFirestore: async () => {
    const { runs } = get();
    try {
      // Save the last 20 runs as individual docs
      const toSave = runs.slice(0, 20);
      for (const run of toSave) {
        await setDoc(doc(db, 'executionRuns', run.id), run);
      }
    } catch (e) {
      console.error('Error saving runs to Firestore:', e);
    }
  },
  loadRunsFromFirestore: async () => {
    try {
      const q = query(collection(db, 'executionRuns'), orderBy('startedAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      const runs: ExecutionRun[] = [];
      snap.forEach(d => {
        runs.push(d.data() as ExecutionRun);
      });
      if (runs.length > 0) {
        set({ runs });
      }
    } catch (e) {
      console.error('Error loading runs from Firestore:', e);
    }
  },
}));
