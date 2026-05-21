import { create } from 'zustand';
import { doc, setDoc, getDocs, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export interface Connection {
  id: string;
  platformId: string;
  displayName: string;
  authType: 'apiKey' | 'oauth' | 'botToken' | 'bearer';
  credentials: Record<string, string>; // { apiKey: '...', secret: '...' }
  isValid?: boolean;
  createdAt: string;
}

type ConnectionsState = {
  connections: Connection[];
  addConnection: (c: Omit<Connection, 'id' | 'createdAt'>) => string;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  getConnectionForPlatform: (platformId: string) => Connection | undefined;
  saveToStorage: () => void;
  loadFromStorage: () => void;
  saveToFirestore: () => Promise<void>;
  loadFromFirestore: () => Promise<void>;
};

export const useConnectionsStore = create<ConnectionsState>((set, get) => ({
  connections: [],
  addConnection: (c) => {
    const id = `conn_${Date.now()}`;
    const conn: Connection = { ...c, id, createdAt: new Date().toISOString() };
    set(s => ({ connections: [...s.connections, conn] }));
    get().saveToStorage();
    get().saveToFirestore();
    return id;
  },
  updateConnection: (id, updates) => {
    set(s => ({ connections: s.connections.map(c => c.id === id ? { ...c, ...updates } : c) }));
    get().saveToStorage();
    get().saveToFirestore();
  },
  deleteConnection: (id) => {
    set(s => ({ connections: s.connections.filter(c => c.id !== id) }));
    get().saveToStorage();
    try {
      deleteDoc(doc(db, 'connections', id));
    } catch (e) {
      console.error('Error deleting from Firestore:', e);
    }
  },
  getConnectionForPlatform: (platformId) => {
    return get().connections.find(c => c.platformId === platformId);
  },
  saveToStorage: () => {
    localStorage.setItem('sf_connections', JSON.stringify(get().connections));
  },
  loadFromStorage: () => {
    try {
      const data = localStorage.getItem('sf_connections');
      if (data) set({ connections: JSON.parse(data) });
    } catch {}
  },
  saveToFirestore: async () => {
    const { connections } = get();
    try {
      for (const conn of connections) {
        await setDoc(doc(db, 'connections', conn.id), conn);
      }
    } catch (e) {
      console.error('Error saving connections to Firestore:', e);
    }
  },
  loadFromFirestore: async () => {
    try {
      const snap = await getDocs(collection(db, 'connections'));
      const conns: Connection[] = [];
      snap.forEach(doc => {
        conns.push(doc.data() as Connection);
      });
      if (conns.length > 0) {
        set({ connections: conns });
      }
    } catch (e) {
      console.error('Error loading connections from Firestore:', e);
    }
  },
}));
