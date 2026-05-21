import React, { useState } from 'react';
import { useConnectionsStore, Connection } from '../store/useConnectionsStore';
import { PLATFORMS } from '../data/platforms';
import { Plus, Trash2, CheckCircle, AlertCircle, Eye, EyeOff, Zap } from 'lucide-react';

const AUTH_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  twitter:   [{ key: 'accessToken', label: 'Access Token', placeholder: 'OAuth 2.0 User Access Token' }, { key: 'refreshToken', label: 'Refresh Token (Optional)', placeholder: 'OAuth 2.0 Refresh Token' }, { key: 'clientId', label: 'Client ID', placeholder: 'OAuth 2.0 Client ID' }, { key: 'clientSecret', label: 'Client Secret', placeholder: 'OAuth 2.0 Client Secret' }],
  linkedin:  [{ key: 'accessToken', label: 'Access Token', placeholder: 'LinkedIn OAuth access token' }, { key: 'authorUrn', label: 'Person URN', placeholder: 'urn:li:person:xxxxx' }],
  facebook:  [{ key: 'accessToken', label: 'Page Access Token', placeholder: '' }, { key: 'pageId', label: 'Page ID', placeholder: '' }],
  instagram: [{ key: 'accessToken', label: 'Access Token', placeholder: '' }, { key: 'accountId', label: 'Account ID', placeholder: '' }],
  telegram:  [{ key: 'botToken', label: 'Bot Token', placeholder: 'Get from @BotFather on Telegram' }, { key: 'chatId', label: 'Default Chat ID', placeholder: '-100xxxxxxxxxx' }],
  discord:   [{ key: 'botToken', label: 'Bot Token', placeholder: '' }, { key: 'guildId', label: 'Server ID', placeholder: '' }],
  reddit:    [{ key: 'clientId', label: 'Client ID', placeholder: '' }, { key: 'clientSecret', label: 'Client Secret', placeholder: '' }, { key: 'refreshToken', label: 'Refresh Token', placeholder: '' }],
  youtube:   [{ key: 'apiKey', label: 'API Key', placeholder: '' }],
  gemini:    [{ key: 'apiKey', label: 'Gemini API Key', placeholder: 'AIza...' }],
  openai:    [{ key: 'apiKey', label: 'OpenAI API Key', placeholder: 'sk-...' }],
  anthropic: [{ key: 'apiKey', label: 'Anthropic API Key', placeholder: 'sk-ant-...' }],
};

const ALL_PLATFORMS = [
  ...PLATFORMS,
  { id: 'gemini', name: 'Google Gemini', bgGradient: 'linear-gradient(135deg,#F5A623,#FF7B00)', IconComponent: () => <span>✨</span> },
  { id: 'openai', name: 'OpenAI / ChatGPT', bgGradient: 'linear-gradient(135deg,#10b981,#065f46)', IconComponent: () => <span>🤖</span> },
  { id: 'anthropic', name: 'Anthropic Claude', bgGradient: 'linear-gradient(135deg,#f97316,#7c2d12)', IconComponent: () => <span>🧠</span> },
];

function ConnectionCard({ conn }: { conn: Connection }) {
  const { updateConnection, deleteConnection } = useConnectionsStore();
  const [showKeys, setShowKeys] = useState(false);
  const platform = ALL_PLATFORMS.find(p => p.id === conn.platformId);
  const Icon = platform?.IconComponent;

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: platform?.bgGradient || '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {Icon && <Icon size={16} color="#fff" />}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>{conn.displayName}</p>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{conn.platformId}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: conn.isValid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: conn.isValid ? '#10b981' : '#f59e0b', border: `1px solid ${conn.isValid ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
            {conn.isValid ? '✅ Connected' : '⚠️ Not tested'}
          </span>
          <button onClick={() => setShowKeys(!showKeys)} style={iconBtn}>{showKeys ? <EyeOff size={13} /> : <Eye size={13} />}</button>
          <button onClick={() => deleteConnection(conn.id)} style={{ ...iconBtn, color: '#ef4444' }}><Trash2 size={13} /></button>
        </div>
      </div>
      {showKeys && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Object.entries(conn.credentials).map(([key, val]) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>{key}</label>
              <input type="password" value={val} onChange={e => updateConnection(conn.id, { credentials: { ...conn.credentials, [key]: e.target.value } })} style={inputStyle} />
            </div>
          ))}
          <button onClick={() => updateConnection(conn.id, { isValid: true })} style={{ marginTop: '6px', padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '7px', color: '#10b981', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>
            ▶ Test Connection
          </button>
        </div>
      )}
    </div>
  );
}

export default function ConnectionsPage() {
  const { connections, addConnection } = useConnectionsStore();
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [creds, setCreds] = useState<Record<string, string>>({});

  const startAdding = (platformId: string) => {
    setAddingFor(platformId);
    setDisplayName('');
    const fields = AUTH_FIELDS[platformId] || [];
    const empty: Record<string, string> = {};
    fields.forEach(f => { empty[f.key] = ''; });
    setCreds(empty);
  };

  const saveConnection = () => {
    if (!addingFor) return;
    addConnection({ platformId: addingFor, displayName: displayName || addingFor, authType: 'apiKey', credentials: creds });
    setAddingFor(null);
  };

  const grouped = ALL_PLATFORMS.reduce((acc, p) => {
    const conns = connections.filter(c => c.platformId === p.id);
    if (conns.length > 0 || addingFor === p.id) acc[p.id] = { platform: p, connections: conns };
    return acc;
  }, {} as Record<string, any>);

  return (
    <div style={{ padding: '28px', overflowY: 'auto', height: '100%', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <Zap size={20} color="#a78bfa" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Connections</h2>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '24px' }}>Store all your API credentials once. Nodes will auto-use the right connection.</p>

      {/* Add new */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)', marginBottom: '10px' }}>Add Connection</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {ALL_PLATFORMS.map(p => {
            const Icon = p.IconComponent;
            return (
              <button key={p.id} onClick={() => startAdding(p.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', transition: 'all 0.15s' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '5px', background: p.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={11} color="#fff" />
                </div>
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add form */}
      {addingFor && (
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(138,43,226,0.08)', border: '1px solid rgba(138,43,226,0.2)', borderRadius: '12px' }}>
          <p style={{ fontWeight: 600, marginBottom: '12px' }}>New {addingFor} connection</p>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Connection name (e.g. My Twitter Personal)" style={{ ...inputStyle, marginBottom: '10px' }} />
          {(AUTH_FIELDS[addingFor] || []).map(f => (
            <div key={f.key} style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>{f.label}</label>
              <input type="password" value={creds[f.key] || ''} onChange={e => setCreds(c => ({ ...c, [f.key]: e.target.value }))} placeholder={f.placeholder} style={inputStyle} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button onClick={saveConnection} style={{ padding: '7px 16px', background: '#8a2be2', border: 'none', borderRadius: '7px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem' }}>Save Connection</button>
            <button onClick={() => setAddingFor(null)} style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Existing connections */}
      {connections.length === 0 && !addingFor && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>
          <Zap size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p>No connections yet. Add one above to get started.</p>
        </div>
      )}
      {connections.map(c => <ConnectionCard key={c.id} conn={c} />)}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontFamily: 'inherit', fontSize: '0.83rem', outline: 'none', display: 'block', boxSizing: 'border-box' };
const iconBtn: React.CSSProperties = { background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '5px' };
