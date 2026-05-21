import React, { useState } from 'react';
import { useKnowledgeStore } from '../store/useKnowledgeStore';
import { Brain, Plus, Trash2, Upload, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PLATFORMS } from '../data/platforms';

type Section = 'profile' | 'voice' | 'documents' | 'platform';

export default function KnowledgeBasePage() {
  const store = useKnowledgeStore();
  const [section, setSection] = useState<Section>('profile');
  const [newTopic, setNewTopic] = useState('');
  const [newBlock, setNewBlock] = useState('');
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');

  const addTopic = () => { if (newTopic.trim()) { store.setProfile({ topics: [...store.topics, newTopic.trim()] }); setNewTopic(''); }};
  const addBlock = () => { if (newBlock.trim()) { store.setProfile({ blocklist: [...store.blocklist, newBlock.trim()] }); setNewBlock(''); }};
  const addDoc = () => {
    if (docName && docContent) {
      store.addDocument({ name: docName, content: docContent, type: 'text' });
      setDocName(''); setDocContent('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      store.addDocument({ name: file.name, content: ev.target?.result as string, type: 'text' });
    };
    reader.readAsText(file);
  };

  const nav = (s: Section, label: string) => (
    <button onClick={() => setSection(s)} style={{
      padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
      background: section === s ? 'rgba(138,43,226,0.2)' : 'transparent',
      color: section === s ? '#a78bfa' : 'rgba(255,255,255,0.5)',
      fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: section === s ? 600 : 400,
      borderLeft: section === s ? '2px solid #8b5cf6' : '2px solid transparent',
      textAlign: 'left', width: '100%', transition: 'all 0.15s'
    }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', height: '100%', color: '#fff' }}>
      {/* Sub-nav */}
      <div style={{ width: '160px', padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '14px' }}>Knowledge</p>
        {nav('profile', '👤 My Profile')}
        {nav('voice', '🎤 Brand Voice')}
        {nav('documents', '📄 Documents')}
        {nav('platform', '🎯 Per-Platform')}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
        {/* Profile */}
        {section === 'profile' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Your Profile</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '24px' }}>This context is automatically injected into every AI node so it writes as YOU.</p>
            {[
              { label: 'Your Name', key: 'name', placeholder: 'e.g. Oladizz' },
              { label: 'Occupation / Title', key: 'occupation', placeholder: 'e.g. AI Automation Founder & Builder' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>{label}</label>
                <input value={(store as any)[key]} onChange={e => store.setProfile({ [key]: e.target.value })} placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Bio / About You</label>
              <textarea value={store.bio} onChange={e => store.setProfile({ bio: e.target.value })}
                placeholder="Short bio that describes who you are, what you build, and your audience..."
                style={{ ...inputStyle, height: '90px', resize: 'vertical' }} />
            </div>
            {/* Topics */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Topics You Post About</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {store.topics.map((t, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(138,43,226,0.15)', border: '1px solid rgba(138,43,226,0.3)', fontSize: '0.78rem', color: '#a78bfa' }}>
                    {t} <button onClick={() => store.setProfile({ topics: store.topics.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={newTopic} onChange={e => setNewTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTopic()} placeholder="Add topic (press Enter)" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addTopic} style={btnStyle}><Plus size={14} /></button>
              </div>
            </div>
            {/* Blocklist */}
            <div>
              <label style={labelStyle}>Topics to NEVER Post About</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {store.blocklist.map((t, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.78rem', color: '#fca5a5' }}>
                    {t} <button onClick={() => store.setProfile({ blocklist: store.blocklist.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={newBlock} onChange={e => setNewBlock(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBlock()} placeholder="Add blocked topic" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addBlock} style={{ ...btnStyle, background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.3)' }}><Plus size={14} /></button>
              </div>
            </div>
          </div>
        )}

        {/* Voice */}
        {section === 'voice' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Brand Voice</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '24px' }}>Define HOW you write — the AI will match your style exactly.</p>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Global Tone</label>
              <input value={store.globalTone} onChange={e => store.setProfile({ globalTone: e.target.value })} placeholder="e.g. Confident, casual, witty, direct. Never use corporate buzzwords." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Vocabulary Rules & Style Notes</label>
              <textarea value={store.vocabularyRules} onChange={e => store.setProfile({ vocabularyRules: e.target.value })}
                placeholder="Examples of your writing style, words you use or avoid, sentence length preference..."
                style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(138,43,226,0.08)', border: '1px solid rgba(138,43,226,0.2)', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.78rem', color: '#a78bfa', margin: '0 0 8px' }}>💡 Preview: System prompt the AI will use</p>
              <pre style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {store.getSystemPrompt().slice(0, 400)}...
              </pre>
            </div>
          </div>
        )}

        {/* Documents */}
        {section === 'documents' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Knowledge Documents</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '24px' }}>Upload articles, bios, product descriptions. The AI reads these when generating content.</p>
            
            {/* Upload file */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: '2px dashed rgba(255,255,255,0.12)', cursor: 'pointer', marginBottom: '16px', transition: 'all 0.15s' }}>
              <Upload size={18} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>Upload .txt or .md file</span>
              <input type="file" accept=".txt,.md" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {/* Manual input */}
            <div style={{ marginBottom: '12px' }}>
              <input value={docName} onChange={e => setDocName(e.target.value)} placeholder="Document name" style={{ ...inputStyle, marginBottom: '8px' }} />
              <textarea value={docContent} onChange={e => setDocContent(e.target.value)} placeholder="Paste document content here..." style={{ ...inputStyle, height: '100px', resize: 'vertical', marginBottom: '8px' }} />
              <button onClick={addDoc} style={{ ...btnStyle, width: '100%', justifyContent: 'center' }}><Plus size={14} /> Add Document</button>
            </div>

            {/* Document list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {store.documents.map(doc => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.83rem', margin: '0 0 2px' }}>{doc.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.content.slice(0, 80)}...</p>
                  </div>
                  <button onClick={() => store.removeDocument(doc.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', flexShrink: 0 }}><Trash2 size={14} /></button>
                </div>
              ))}
              {store.documents.length === 0 && <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem', textAlign: 'center', padding: '24px' }}>No documents yet. Upload or paste content above.</p>}
            </div>
          </div>
        )}

        {/* Per-platform voice */}
        {section === 'platform' && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>Per-Platform Voice</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '20px' }}>Override your global tone for specific platforms.</p>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Select Platform</label>
              <select value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {PLATFORMS.map(p => <option key={p.id} value={p.id} style={{ background: '#0a0a0f' }}>{p.name}</option>)}
              </select>
            </div>
            {(() => {
              const existing = store.platformVoices.find(v => v.platformId === selectedPlatform);
              const [tone, setTone] = useState(existing?.tone || '');
              const [length, setLength] = useState(existing?.lengthHint || '');
              const [example, setExample] = useState(existing?.example || '');
              return (
                <div>
                  <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Tone on {selectedPlatform}</label><input value={tone} onChange={e => setTone(e.target.value)} placeholder="e.g. Short, punchy, witty. Use emojis." style={inputStyle} /></div>
                  <div style={{ marginBottom: '12px' }}><label style={labelStyle}>Length Hint</label><input value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. Max 280 chars. One strong sentence." style={inputStyle} /></div>
                  <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Example post in your voice</label><textarea value={example} onChange={e => setExample(e.target.value)} placeholder="Paste an example post that captures your style on this platform..." style={{ ...inputStyle, height: '80px', resize: 'vertical' }} /></div>
                  <button onClick={() => store.setPlatformVoice({ platformId: selectedPlatform, tone, lengthHint: length, example })} style={{ ...btnStyle, width: '100%', justifyContent: 'center' }}>Save {selectedPlatform} Voice</button>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: '5px', fontWeight: 500 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none', display: 'block', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(138,43,226,0.15)', border: '1px solid rgba(138,43,226,0.3)', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500 };
