import React, { useState } from 'react';
import { useConnectionsStore } from '../store/useConnectionsStore';
import { Key, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../store/useToastStore';
import ConfirmModal from '../components/ConfirmModal';

export default function IntegrationsPage() {
  const { connections, addConnection, deleteConnection } = useConnectionsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [connToDelete, setConnToDelete] = useState<string | null>(null);
  const toast = useToast();

  const [platform, setPlatform] = useState('twitter');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [twitterEmail, setTwitterEmail] = useState('');

  const platforms = [
    { id: 'twitter', name: 'Twitter / X', auth: 'oauth' },
    { id: 'discord', name: 'Discord', auth: 'botToken' },
    { id: 'slack', name: 'Slack', auth: 'botToken' },
    { id: 'github', name: 'GitHub', auth: 'bearer' },
    { id: 'gemini', name: 'Google Gemini', auth: 'apiKey' },
    { id: 'openai', name: 'OpenAI', auth: 'apiKey' },
    { id: 'anthropic', name: 'Anthropic', auth: 'apiKey' }
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;

    const selectedPlatform = platforms.find(p => p.id === platform);
    
    addConnection({
      platformId: platform,
      displayName: selectedPlatform?.name || platform,
      authType: (selectedPlatform?.auth as any) || 'apiKey',
      credentials: { apiKey, apiSecret, twitterEmail },
      isValid: true,
    });

    toast.success(`${selectedPlatform?.name} connection added successfully!`);
    setShowAdd(false);
    setApiKey('');
    setApiSecret('');
    setTwitterEmail('');
  };

  const confirmDelete = () => {
    if (connToDelete) {
      deleteConnection(connToDelete);
      toast.info('Connection removed');
      setConnToDelete(null);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px' }}>Integrations & APIs</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>Connect your favorite services and manage API keys globally.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            background: 'linear-gradient(135deg, #8a2be2, #06b6d4)',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {showAdd ? <XCircle size={18} /> : <Plus size={18} />}
          {showAdd ? 'Cancel' : 'New Connection'}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem' }}>Add New Connection</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Platform</label>
              <select 
                value={platform} 
                onChange={(e) => setPlatform(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
              >
                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {platform === 'twitter' ? (
              <>
                <div style={{ padding: '12px', background: 'rgba(138,43,226,0.1)', border: '1px solid rgba(138,43,226,0.3)', borderRadius: '8px', marginBottom: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#e9d5ff', lineHeight: 1.5 }}>
                    <strong>Note:</strong> We use an advanced headless browser to automate Twitter. You do NOT need an official Twitter Developer API Key! Just enter your normal login details below.
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Twitter Username (e.g. @oladizz)</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value.replace('@', ''))}
                    required
                    placeholder="Enter Username"
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Twitter Account Email</label>
                  <input
                    type="email"
                    value={twitterEmail}
                    onChange={(e) => setTwitterEmail(e.target.value)}
                    required
                    placeholder="Enter Email Address"
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Twitter Password</label>
                  <input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    required
                    placeholder="Enter Password"
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>API Key / Token</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                    placeholder="Enter your API Key or Token"
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>API Secret (Optional)</label>
                  <input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Enter API Secret if required"
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
              </>
            )}

            <button type="submit" style={{ padding: '12px', background: '#8a2be2', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
              Save Connection
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {connections.length === 0 && !showAdd && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Key size={40} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.8)' }}>No connections yet</h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)' }}>Add your API keys to start automating tasks across platforms.</p>
          </div>
        )}

        {connections.map(conn => (
          <div key={conn.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={20} color="#a78bfa" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{conn.displayName}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{conn.authType}</span>
                </div>
              </div>
              <button 
                onClick={() => setConnToDelete(conn.id)}
                style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                title="Remove Connection"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: conn.isValid ? '#22c55e' : 'rgba(255,255,255,0.5)' }}>
              <CheckCircle size={14} /> Connected
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!connToDelete}
        title="Delete Connection"
        message="Are you sure you want to remove this connection? Workflows relying on this connection will fail."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConnToDelete(null)}
      />
    </div>
  );
}
