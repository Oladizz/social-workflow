import { create } from 'zustand';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface KnowledgeDocument {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'pdf' | 'url' | 'post';
  createdAt: string;
}

export interface PlatformVoice {
  platformId: string;
  tone: string;
  lengthHint: string;
  example: string;
}

type KnowledgeState = {
  // Personal profile
  name: string;
  bio: string;
  occupation: string;
  topics: string[];       // ['AI', 'startups', 'automation']
  blocklist: string[];    // Topics to never post about
  
  // Brand voice
  globalTone: string;
  vocabularyRules: string;
  platformVoices: PlatformVoice[];
  
  // Documents
  documents: KnowledgeDocument[];
  
  // Computed system prompt injected into AI nodes
  getSystemPrompt: (platformId?: string) => string;
  
  // Actions
  setProfile: (profile: Partial<KnowledgeState>) => void;
  addDocument: (doc: Omit<KnowledgeDocument, 'id' | 'createdAt'>) => void;
  removeDocument: (id: string) => void;
  setPlatformVoice: (voice: PlatformVoice) => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
  saveToFirestore: () => Promise<void>;
  loadFromFirestore: () => Promise<void>;
};

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  name: '',
  bio: '',
  occupation: '',
  topics: [],
  blocklist: [],
  globalTone: 'professional yet approachable',
  vocabularyRules: '',
  platformVoices: [],
  documents: [],

  getSystemPrompt: (platformId?: string) => {
    const s = get();
    const platformVoice = platformId ? s.platformVoices.find(v => v.platformId === platformId) : null;
    const docs = s.documents.map(d => `[${d.name}]: ${d.content.slice(0, 500)}`).join('\n');

    let prompt = '## ABOUT THE AUTHOR\n';
    if (s.name) prompt += `Name: ${s.name}\n`;
    if (s.occupation) prompt += `Role: ${s.occupation}\n`;
    if (s.bio) prompt += `Bio: ${s.bio}\n`;
    if (s.topics.length) prompt += `Topics they post about: ${s.topics.join(', ')}\n`;
    
    prompt += '\n## BRAND VOICE\n';
    prompt += `Tone: ${platformVoice?.tone || s.globalTone}\n`;
    if (s.vocabularyRules) prompt += `Voice rules: ${s.vocabularyRules}\n`;
    if (platformVoice?.example) prompt += `Example in their style: "${platformVoice.example}"\n`;
    if (platformVoice?.lengthHint) prompt += `Length: ${platformVoice.lengthHint}\n`;

    if (s.blocklist.length) prompt += `\nNEVER write about: ${s.blocklist.join(', ')}\n`;
    
    if (docs) {
      prompt += '\n## KNOWLEDGE BASE (use this context when relevant)\n';
      prompt += docs;
    }

    prompt += '\n\nAlways write AS this person in first person. Match their voice exactly.';
    return prompt;
  },

  setProfile: (profile) => {
    set(s => ({ ...s, ...profile }));
    get().saveToStorage();
    get().saveToFirestore();
  },
  addDocument: (doc) => {
    const newDoc: KnowledgeDocument = { ...doc, id: `doc_${Date.now()}`, createdAt: new Date().toISOString() };
    set(s => ({ documents: [...s.documents, newDoc] }));
    get().saveToStorage();
    get().saveToFirestore();
  },
  removeDocument: (id) => {
    set(s => ({ documents: s.documents.filter(d => d.id !== id) }));
    get().saveToStorage();
    get().saveToFirestore();
  },
  setPlatformVoice: (voice) => {
    set(s => ({
      platformVoices: [
        ...s.platformVoices.filter(v => v.platformId !== voice.platformId),
        voice,
      ],
    }));
    get().saveToStorage();
    get().saveToFirestore();
  },
  saveToStorage: () => {
    const { name, bio, occupation, topics, blocklist, globalTone, vocabularyRules, platformVoices, documents } = get();
    localStorage.setItem('sf_knowledge', JSON.stringify({ name, bio, occupation, topics, blocklist, globalTone, vocabularyRules, platformVoices, documents }));
  },
  loadFromStorage: () => {
    try {
      const data = localStorage.getItem('sf_knowledge');
      if (data) set(prev => ({ ...prev, ...JSON.parse(data) }));
    } catch {}
  },
  saveToFirestore: async () => {
    const { name, bio, occupation, topics, blocklist, globalTone, vocabularyRules, platformVoices, documents } = get();
    try {
      await setDoc(doc(db, 'appData', 'knowledge'), {
        name, bio, occupation, topics, blocklist, globalTone, vocabularyRules, platformVoices, documents,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Error saving knowledge to Firestore:', e);
    }
  },
  loadFromFirestore: async () => {
    try {
      const snap = await getDoc(doc(db, 'appData', 'knowledge'));
      if (snap.exists()) {
        const data = snap.data();
        set(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error('Error loading knowledge from Firestore:', e);
    }
  },
}));
