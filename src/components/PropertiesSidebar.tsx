import React, { useMemo, useState, useRef } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { Settings, Key, MessageSquare, Sparkles, Globe, Rss, Zap, Database, CheckCircle2, XCircle } from 'lucide-react';
import { useExecutionStore } from '../store/useExecutionStore';
import { getPlatformById } from '../data/platforms';
import { TRIGGER_TYPES } from './nodes/TriggerNode';

const insertAtCursor = (inputEl: HTMLInputElement | HTMLTextAreaElement | null, textToInsert: string, currentValue: string, onChange: (v: string) => void) => {
  if (!inputEl) {
    onChange(currentValue + textToInsert);
    return;
  }
  const start = inputEl.selectionStart ?? currentValue.length;
  const end = inputEl.selectionEnd ?? currentValue.length;
  const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
  onChange(newValue);
  // Set cursor position after inserted text
  setTimeout(() => {
    inputEl.focus();
    inputEl.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
  }, 0);
};

function ExpressionInput({ label, value, onChange, placeholder, type = 'text', currentNodeId, nodes }: any) {
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const otherNodes = useMemo(() => nodes.filter((n: any) => n.id !== currentNodeId), [nodes, currentNodeId]);

  return (
    <div style={{ marginBottom: '12px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</label>
        {otherNodes.length > 0 && (
          <button type="button" onClick={() => setShowDropdown(!showDropdown)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '0.68rem', padding: '0 4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>{'{ }'}</span> Insert Variable
          </button>
        )}
      </div>
      <input ref={ref} type={type} placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} style={inputStyle} />
      {showDropdown && (
        <div style={dropdownStyle}>
          <div style={{ padding: '6px 8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>Upstream variables</div>
          {otherNodes.map((n: any) => {
            const labelStr = n.type === 'triggerNode' ? 'Trigger' : n.type === 'aiNode' ? 'AI' : n.data?.platform || n.type;
            const refStr = `{{${n.id}.output}}`;
            return (
              <button key={n.id} type="button" onClick={() => { insertAtCursor(ref.current, refStr, value || '', onChange); setShowDropdown(false); }} style={dropdownItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span style={{ color: '#a78bfa', fontWeight: 500 }}>{labelStr}</span> <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>({n.id})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExpressionTextarea({ label, value, onChange, placeholder, currentNodeId, nodes, style }: any) {
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const otherNodes = useMemo(() => nodes.filter((n: any) => n.id !== currentNodeId), [nodes, currentNodeId]);

  return (
    <div style={{ marginBottom: '12px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{label}</label>
        {otherNodes.length > 0 && (
          <button type="button" onClick={() => setShowDropdown(!showDropdown)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '0.68rem', padding: '0 4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>{'{ }'}</span> Insert Variable
          </button>
        )}
      </div>
      <textarea ref={ref} placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, height: '100px', resize: 'vertical', ...style }} />
      {showDropdown && (
        <div style={dropdownStyle}>
          <div style={{ padding: '6px 8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>Upstream variables</div>
          {otherNodes.map((n: any) => {
            const labelStr = n.type === 'triggerNode' ? 'Trigger' : n.type === 'aiNode' ? 'AI' : n.data?.platform || n.type;
            const refStr = `{{${n.id}.output}}`;
            return (
              <button key={n.id} type="button" onClick={() => { insertAtCursor(ref.current, refStr, value || '', onChange); setShowDropdown(false); }} style={dropdownItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span style={{ color: '#a78bfa', fontWeight: 500 }}>{labelStr}</span> <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>({n.id})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PropertiesSidebar({ isDebugMode = false }: { isDebugMode?: boolean }) {
  const { nodes, updateNodeData } = useWorkflowStore();
  const { runs, activeRunId } = useExecutionStore();
  const selectedNode = useMemo(() => nodes.find(n => n.selected), [nodes]);

  if (!selectedNode) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'rgba(10, 10, 15, 0.45)', backdropFilter: 'blur(20px)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', boxSizing: 'border-box' }}>
        <Settings size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
        <p style={{ textAlign: 'center', fontSize: '0.875rem', lineHeight: 1.6 }}>
          Click any node on the canvas to configure its settings here.
        </p>
      </div>
    );
  }

  const { id, type, data } = selectedNode;

  if (isDebugMode) {
    const activeRun = runs.find(r => r.id === activeRunId) || runs[0];
    const stepLog = activeRun?.steps.find(s => s.stepId === id);

    return (
      <div className="properties-sidebar" style={{ width: '100%', height: '100%', background: 'rgba(10, 10, 15, 0.45)', backdropFilter: 'blur(20px)', padding: '20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {stepLog?.status === 'success' ? <CheckCircle2 size={16} color="#10b981" /> : stepLog?.status === 'error' ? <XCircle size={16} color="#ef4444" /> : <Settings size={16} />}
          Node Execution Data
        </h3>
        
        {stepLog ? (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Input Payload</label>
              <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.7rem', color: '#a78bfa', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(stepLog.input || {}, null, 2)}
              </pre>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', display: 'block' }}>Output Result</label>
              <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.7rem', color: stepLog.status === 'error' ? '#ef4444' : '#10b981', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                {stepLog.error || JSON.stringify(stepLog.output || {}, null, 2)}
              </pre>
            </div>
          </>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            No execution data found for this step in the current run.
          </div>
        )}
      </div>
    );
  }
  const platform = type === 'actionNode' ? getPlatformById(data.platform as string) : null;
  const handle = (key: string, value: any) => updateNodeData(id, { [key]: value });

  const SectionHeader = ({ icon: Icon, label }: any) => (
    <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Icon size={12} />{label}
    </h4>
  );

  const Input = ({ label, value, onChange, type: iType = 'text', placeholder }: any) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{label}</label>
      <input type={iType} placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </div>
  );

  const Select = ({ label, value, onChange, options }: any) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value} style={{ background: '#0a0a0f' }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderTriggerSettings = () => {
    const triggerType = (data.triggerType as string) || 'schedule';
    return (
      <>
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Zap} label="Trigger Type" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {TRIGGER_TYPES.map(t => (
              <button key={t.id} onClick={() => handle('triggerType', t.id)} style={{
                padding: '8px', borderRadius: '8px', border: `1px solid ${triggerType === t.id ? t.color : 'rgba(255,255,255,0.08)'}`,
                background: triggerType === t.id ? `${t.color}22` : 'transparent',
                color: triggerType === t.id ? t.color : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.2s'
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {triggerType === 'schedule' && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader icon={Settings} label="Schedule Settings" />
            <Select label="Frequency" value={data.scheduleFreq} onChange={(v: string) => handle('scheduleFreq', v)} options={[
              { value: 'hourly', label: '⏰ Every Hour' },
              { value: 'daily', label: '📅 Every Day' },
              { value: 'weekly', label: '📆 Every Week' },
              { value: 'monthly', label: '🗓️ Every Month' },
              { value: 'cron', label: '⚙️ Custom Cron' },
            ]} />
            {data.scheduleFreq === 'daily' && <Input label="Time (24h)" placeholder="09:00" value={data.scheduleTime} onChange={(v: string) => handle('scheduleTime', v)} />}
            {data.scheduleFreq === 'weekly' && (
              <>
                <Select label="Day of Week" value={data.scheduleDay} onChange={(v: string) => handle('scheduleDay', v)} options={[
                  { value: '1', label: 'Monday' }, { value: '2', label: 'Tuesday' }, { value: '3', label: 'Wednesday' },
                  { value: '4', label: 'Thursday' }, { value: '5', label: 'Friday' }, { value: '6', label: 'Saturday' }, { value: '0', label: 'Sunday' }
                ]} />
                <Input label="Time (24h)" placeholder="09:00" value={data.scheduleTime} onChange={(v: string) => handle('scheduleTime', v)} />
              </>
            )}
            {data.scheduleFreq === 'monthly' && (
              <>
                <Input label="Day of Month (1-31)" placeholder="1" value={data.scheduleMonthDay} onChange={(v: string) => handle('scheduleMonthDay', v)} />
                <Input label="Time (24h)" placeholder="09:00" value={data.scheduleTime} onChange={(v: string) => handle('scheduleTime', v)} />
              </>
            )}
            {data.scheduleFreq === 'cron' && <Input label="Cron Expression" placeholder="0 9 * * *" value={data.cron} onChange={(v: string) => handle('cron', v)} />}
          </div>
        )}

        {triggerType === 'webhook' && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader icon={Globe} label="Webhook" />
            <div style={{ padding: '10px', background: 'rgba(0,212,170,0.08)', borderRadius: '8px', border: '1px solid rgba(0,212,170,0.2)', marginBottom: '8px' }}>
              <p style={{ fontSize: '0.7rem', color: '#00d4aa', marginBottom: '8px' }}>Your webhook URL:</p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <code style={{ flex: 1, padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all', userSelect: 'all' }}>
                  {`https://us-central1-my-portfolio-7cd72.cloudfunctions.net/webhookTrigger/${useWorkflowStore.getState().workflowName.replace(/\s+/g, '-').toLowerCase()}`}
                </code>
              </div>
              <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px', lineHeight: 1.4 }}>
                Send a POST or GET request to this URL to trigger this workflow. Payload data will be available as <code>{`{{trigger.body}}`}</code> or <code>{`{{trigger.query}}`}</code>.
              </p>
            </div>
          </div>
        )}

        {triggerType === 'rss' && (
          <div style={{ marginBottom: '20px' }}>
            <SectionHeader icon={Rss} label="RSS Feed" />
            <ExpressionInput label="Feed URL" placeholder="https://example.com/feed.xml" value={data.rssUrl} onChange={(v: string) => handle('rssUrl', v)} currentNodeId={id} nodes={nodes} />
            <Select label="Check Frequency" value={data.rssFreq} onChange={(v: string) => handle('rssFreq', v)} options={[
              { value: '15', label: 'Every 15 min' },
              { value: '30', label: 'Every 30 min' },
              { value: '60', label: 'Every hour' },
              { value: '360', label: 'Every 6 hours' },
            ]} />
          </div>
        )}
      </>
    );
  };

  const renderAISettings = () => {
    const provider = (data.provider as string) || (data.model?.startsWith('gpt') ? 'openai' : data.model?.startsWith('claude') ? 'claude' : 'gemini');
    const aiTask = (data.aiTask as string) || 'generate';

    const modelOptions: Record<string, {value:string;label:string}[]> = {
      gemini: [
        { value: 'gemini-2.5-flash', label: '⚡ Gemini 2.5 Flash' },
        { value: 'gemini-2.5-pro', label: '🧠 Gemini 2.5 Pro' },
      ],
      openai: [
        { value: 'gpt-4o', label: '🧠 GPT-4o' },
        { value: 'gpt-4o-mini', label: '⚡ GPT-4o Mini' },
        { value: 'o3-mini', label: '💡 o3-mini' },
      ],
      claude: [
        { value: 'claude-sonnet-4-20250514', label: '🧠 Claude 4 Sonnet' },
        { value: 'claude-opus-4-20250514', label: '🔬 Claude 4 Opus' },
        { value: 'claude-3-5-haiku-20241022', label: '⚡ Claude 3.5 Haiku' },
      ],
    };

    const apiKeyLabel = provider === 'openai' ? 'OpenAI API Key' : provider === 'claude' ? 'Anthropic API Key' : 'Gemini API Key';
    const apiKeyPlaceholder = provider === 'openai' ? 'sk-...' : provider === 'claude' ? 'sk-ant-...' : 'AIza...';

    return (
      <>
        {/* Provider Selection */}
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Sparkles} label="AI Provider" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
            {[
              { id: 'gemini', label: '✨ Gemini', color: '#F5A623' },
              { id: 'openai', label: '🤖 OpenAI', color: '#10b981' },
              { id: 'claude', label: '🧠 Claude', color: '#f97316' },
            ].map(p => (
              <button key={p.id} onClick={() => { handle('provider', p.id); handle('model', modelOptions[p.id][0].value); }} style={{
                padding: '6px 4px', borderRadius: '7px', fontSize: '0.7rem', fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${provider === p.id ? p.color : 'rgba(255,255,255,0.08)'}`,
                background: provider === p.id ? `${p.color}22` : 'transparent',
                color: provider === p.id ? p.color : 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s',
              }}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* AI Task Type */}
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Sparkles} label="AI Task" />
          <Select label="Task" value={aiTask} onChange={(v: string) => handle('aiTask', v)} options={[
            { value: 'generate', label: '✍️ Generate Text' },
            { value: 'chat', label: '💬 Multi-Turn Chat' },
            { value: 'vision', label: '👁️ Analyze Image (Vision)' },
            { value: 'sentiment', label: '😊 Sentiment Analysis' },
            { value: 'classify', label: '🏷️ Classify Text' },
            { value: 'extract', label: '🔍 Extract Entities' },
            { value: 'summarize', label: '📝 Summarize Text' },
            { value: 'translate', label: '🌐 Translate Text' },
            ...(provider === 'openai' ? [
              { value: 'transcribe', label: '🎤 Transcribe Audio (Whisper)' },
              { value: 'tts', label: '🔊 Text to Speech' },
            ] : []),
          ]} />
        </div>

        {/* Model */}
        <div style={{ marginBottom: '20px' }}>
          <Select label="Model" value={data.model} onChange={(v: string) => handle('model', v)} options={modelOptions[provider] || modelOptions.gemini} />
        </div>

        {/* Task-specific fields */}
        {(aiTask === 'generate' || aiTask === 'chat') && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionTextarea label="System Prompt (optional)" placeholder="You are a helpful assistant..." value={data.systemPrompt} onChange={(v: string) => handle('systemPrompt', v)} currentNodeId={id} nodes={nodes} style={{ height: '60px' }} />
            <ExpressionTextarea label="Prompt" placeholder="Write a professional tweet about AI trends..." value={data.prompt} onChange={(v: string) => handle('prompt', v)} currentNodeId={id} nodes={nodes} />
            <Select label="Tone" value={data.tone} onChange={(v: string) => handle('tone', v)} options={[
              { value: 'professional', label: '👔 Professional' },
              { value: 'casual', label: '😊 Casual & Friendly' },
              { value: 'witty', label: '😄 Witty & Fun' },
              { value: 'motivational', label: '🔥 Motivational' },
              { value: 'educational', label: '📚 Educational' },
            ]} />
            <ExpressionInput label="Temperature" placeholder="0.7" value={data.temperature} onChange={(v: string) => handle('temperature', v)} currentNodeId={id} nodes={nodes} />
          </div>
        )}

        {aiTask === 'vision' && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionInput label="Image URL" placeholder="https://example.com/image.jpg" value={data.imageUrl} onChange={(v: string) => handle('imageUrl', v)} currentNodeId={id} nodes={nodes} />
            <ExpressionTextarea label="Prompt" placeholder="Describe this image..." value={data.prompt} onChange={(v: string) => handle('prompt', v)} currentNodeId={id} nodes={nodes} />
          </div>
        )}

        {(aiTask === 'sentiment' || aiTask === 'extract' || aiTask === 'summarize') && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionTextarea label="Input Text" placeholder="Paste text to analyze or use {{nodeId.output}}" value={data.text || data.prompt} onChange={(v: string) => { handle('text', v); handle('prompt', v); }} currentNodeId={id} nodes={nodes} />
            {aiTask === 'summarize' && (
              <Select label="Summary Length" value={data.length} onChange={(v: string) => handle('length', v)} options={[
                { value: 'short', label: '📌 Short (1-2 sentences)' },
                { value: 'medium', label: '📝 Medium (3-5 sentences)' },
                { value: 'long', label: '📄 Long (1-2 paragraphs)' },
              ]} />
            )}
          </div>
        )}

        {aiTask === 'classify' && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionTextarea label="Input Text" placeholder="Text to classify..." value={data.text || data.prompt} onChange={(v: string) => { handle('text', v); handle('prompt', v); }} currentNodeId={id} nodes={nodes} />
            <ExpressionInput label="Categories" placeholder="business, tech, sports, entertainment" value={data.categories} onChange={(v: string) => handle('categories', v)} currentNodeId={id} nodes={nodes} />
          </div>
        )}

        {aiTask === 'translate' && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionTextarea label="Input Text" placeholder="Text to translate..." value={data.text || data.prompt} onChange={(v: string) => { handle('text', v); handle('prompt', v); }} currentNodeId={id} nodes={nodes} />
            <ExpressionInput label="Target Language" placeholder="Spanish" value={data.targetLanguage} onChange={(v: string) => handle('targetLanguage', v)} currentNodeId={id} nodes={nodes} />
          </div>
        )}

        {aiTask === 'transcribe' && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionInput label="Audio URL" placeholder="https://example.com/audio.mp3" value={data.audioUrl} onChange={(v: string) => handle('audioUrl', v)} currentNodeId={id} nodes={nodes} />
            <Select label="Language" value={data.language} onChange={(v: string) => handle('language', v)} options={[
              { value: 'en', label: '🇺🇸 English' }, { value: 'es', label: '🇪🇸 Spanish' }, { value: 'fr', label: '🇫🇷 French' },
              { value: 'de', label: '🇩🇪 German' }, { value: 'ja', label: '🇯🇵 Japanese' }, { value: 'ar', label: '🇸🇦 Arabic' },
            ]} />
          </div>
        )}

        {aiTask === 'tts' && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionTextarea label="Text to Speak" placeholder="Text to convert to speech..." value={data.text || data.prompt} onChange={(v: string) => { handle('text', v); handle('prompt', v); }} currentNodeId={id} nodes={nodes} />
            <Select label="Voice" value={data.voice} onChange={(v: string) => handle('voice', v)} options={[
              { value: 'alloy', label: '🎤 Alloy' }, { value: 'echo', label: '🎤 Echo' }, { value: 'fable', label: '🎤 Fable' },
              { value: 'onyx', label: '🎤 Onyx' }, { value: 'nova', label: '🎤 Nova' }, { value: 'shimmer', label: '🎤 Shimmer' },
            ]} />
          </div>
        )}
      </>
    );
  };

  const renderActionSettings = () => {
    if (!platform) return null;
    const Icon = platform.IconComponent;
    const selectedAction = (data.selectedAction as string) || platform.actions[0]?.id;

    return (
      <>
        {/* Platform header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: `${platform.color}15`, border: `1px solid ${platform.color}30`, marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: platform.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{platform.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Configure action below</p>
          </div>
        </div>

        {/* Action selector */}
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Settings} label="What to Do" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {platform.actions.map(action => (
              <button key={action.id} onClick={() => handle('selectedAction', action.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                borderRadius: '8px', border: `1px solid ${selectedAction === action.id ? platform.color : 'rgba(255,255,255,0.08)'}`,
                background: selectedAction === action.id ? `${platform.color}20` : 'rgba(255,255,255,0.02)',
                color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.83rem',
                textAlign: 'left', transition: 'all 0.15s ease'
              }}>
                <span style={{ fontSize: '1.1rem' }}>{action.icon}</span>
                <div>
                  <div style={{ fontWeight: 500, color: selectedAction === action.id ? platform.color : '#fff' }}>{action.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{action.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={MessageSquare} label="Content" />
          <ExpressionTextarea label="Manual content (optional)" placeholder="Leave empty to use AI-generated content, or type custom content..." value={data.message} onChange={(v: string) => handle('message', v)} currentNodeId={id} nodes={nodes} />
        </div>
      </>
    );
  };

  const renderLogicSettings = () => {
    if (type === 'routerNode') {
      const branches = (data.branches as string[]) || ['Branch 1', 'Branch 2'];
      return (
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Settings} label="Router Settings" />
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
            Configure branches. The flow will branch out from here.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {branches.map((b, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  value={b}
                  onChange={e => {
                    const newB = [...branches];
                    newB[idx] = e.target.value;
                    handle('branches', newB);
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                />
                {branches.length > 2 && (
                  <button
                    onClick={() => {
                      const newB = branches.filter((_, i) => i !== idx);
                      handle('branches', newB);
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              handle('branches', [...branches, `Branch ${branches.length + 1}`]);
            }}
            style={{ ...btnStyle, width: '100%', justifyContent: 'center' }}
          >
            ➕ Add Branch
          </button>
        </div>
      );
    }

    if (type === 'loopNode') {
      return (
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Settings} label="Loop Settings" />
          <ExpressionInput
            label="Loop Items (Array)"
            placeholder="e.g. {{node_1.output.items}}"
            value={data.inputPath}
            onChange={(v: string) => handle('inputPath', v)}
            currentNodeId={id}
            nodes={nodes}
          />
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            Reference an array variable from a previous step. Downstream steps will run once for each item in the array.
          </p>
        </div>
      );
    }

    if (type === 'delayNode') {
      return (
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Settings} label="Delay Settings" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="Amount"
              type="number"
              value={data.amount}
              onChange={(v: string) => handle('amount', parseInt(v) || 0)}
            />
            <Select
              label="Unit"
              value={data.unit}
              onChange={(v: string) => handle('unit', v)}
              options={[
                { value: 'seconds', label: 'Seconds' },
                { value: 'minutes', label: 'Minutes' },
                { value: 'hours', label: 'Hours' },
                { value: 'days', label: 'Days' },
              ]}
            />
          </div>
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            Wait for this amount of time before executing the next steps.
          </p>
        </div>
      );
    }

    if (type === 'filterNode') {
      return (
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Settings} label="Filter Settings" />
          <ExpressionInput
            label="Condition"
            placeholder="e.g. {{node_1.output.text}} contains 'AI'"
            value={data.condition}
            onChange={(v: string) => handle('condition', v)}
            currentNodeId={id}
            nodes={nodes}
          />
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            Only continue flow execution if this condition is met.
          </p>
        </div>
      );
    }

    if (type === 'codeNode') {
      return (
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Settings} label="Code (JavaScript)" />
          <ExpressionTextarea
            label="JavaScript Code"
            placeholder="// Enter your JavaScript here..."
            value={data.code}
            onChange={(v: string) => handle('code', v)}
            currentNodeId={id}
            nodes={nodes}
            style={{ fontFamily: 'monospace', fontSize: '0.78rem', height: '240px' }}
          />
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            Write clean JavaScript. Return an object representing the step output.
          </p>
        </div>
      );
    }

    if (type === 'httpNode') {
      return (
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Settings} label="HTTP Settings" />
          <Select
            label="HTTP Method"
            value={data.method}
            onChange={(v: string) => handle('method', v)}
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'DELETE', label: 'DELETE' },
              { value: 'PATCH', label: 'PATCH' },
            ]}
          />
          <ExpressionInput
            label="URL"
            placeholder="https://api.example.com/data"
            value={data.url}
            onChange={(v: string) => handle('url', v)}
            currentNodeId={id}
            nodes={nodes}
          />
          <ExpressionTextarea
            label="Headers (JSON)"
            placeholder='{ "Authorization": "Bearer token" }'
            value={data.headers}
            onChange={(v: string) => handle('headers', v)}
            currentNodeId={id}
            nodes={nodes}
            style={{ height: '70px', fontFamily: 'monospace' }}
          />
          {['POST', 'PUT', 'PATCH'].includes(data.method as string) && (
            <ExpressionTextarea
              label="Request Body"
              placeholder='{ "key": "value" }'
              value={data.body}
              onChange={(v: string) => handle('body', v)}
              currentNodeId={id}
              nodes={nodes}
              style={{ height: '100px', fontFamily: 'monospace' }}
            />
          )}
        </div>
      );
    }

    if (type === 'stopNode') {
      return (
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader icon={Settings} label="Stop Flow Settings" />
          <ExpressionInput
            label="Reason / Response Output"
            placeholder="e.g. Filtered out due to spam"
            value={data.reason}
            onChange={(v: string) => handle('reason', v)}
            currentNodeId={id}
            nodes={nodes}
          />
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
            Terminate flow immediately and log this custom output message.
          </p>
        </div>
      );
    }

    return null;
  };

  const NodeTitle = () => {
    if (type === 'triggerNode') return <><span>⚡</span> Trigger</>;
    if (type === 'aiNode') return <><span>✨</span> Gemini AI</>;
    if (type === 'routerNode') return <><span>🔀</span> Router</>;
    if (type === 'loopNode') return <><span>🔁</span> Loop</>;
    if (type === 'delayNode') return <><span>⏱️</span> Delay</>;
    if (type === 'filterNode') return <><span>🚫</span> Filter</>;
    if (type === 'codeNode') return <><span>💻</span> Code Step</>;
    if (type === 'httpNode') return <><span>🌐</span> HTTP Request</>;
    if (type === 'stopNode') return <><span>⏹</span> Stop Flow</>;
    if (platform) return <><span style={{ fontSize: '1rem' }}>⚙️</span> {platform.name}</>;
    return <><span>⚙️</span> Node Settings</>;
  };

  const renderKnowledgeSettings = () => {
    const actionType = data.actionType || 'search_vector_db';
    
    return (
      <>
        {/* Knowledge header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '10px', background: `rgba(16, 185, 129, 0.15)`, border: `1px solid rgba(16, 185, 129, 0.3)`, marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Knowledge Base</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>RAG & Data Extraction</p>
          </div>
        </div>

        {/* Action Specific Fields */}
        {actionType === 'scrape_url' && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionTextarea label="Target URL" placeholder="https://example.com/article" value={data.url} onChange={(v: string) => handle('url', v)} currentNodeId={id} nodes={nodes} />
          </div>
        )}

        {actionType === 'parse_pdf' && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionTextarea label="PDF URL" placeholder="https://example.com/document.pdf" value={data.pdfUrl} onChange={(v: string) => handle('pdfUrl', v)} currentNodeId={id} nodes={nodes} />
          </div>
        )}

        {actionType === 'upsert_to_vector_db' && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionTextarea label="Text Content" placeholder="Text to index..." value={data.text} onChange={(v: string) => handle('text', v)} currentNodeId={id} nodes={nodes} />
            <div style={{ height: '10px' }} />
            <Input label="Collection Name" placeholder="knowledge_base" value={data.collectionName} onChange={(v: string) => handle('collectionName', v)} />
            <div style={{ height: '10px' }} />
            <ExpressionTextarea label="Metadata (JSON)" placeholder='{"source": "wiki"}' value={data.metadata} onChange={(v: string) => handle('metadata', v)} currentNodeId={id} nodes={nodes} />
          </div>
        )}

        {actionType === 'search_vector_db' && (
          <div style={{ marginBottom: '20px' }}>
            <ExpressionTextarea label="Search Query" placeholder="What are the main topics?" value={data.query} onChange={(v: string) => handle('query', v)} currentNodeId={id} nodes={nodes} />
            <div style={{ height: '10px' }} />
            <Input label="Collection Name" placeholder="knowledge_base" value={data.collectionName} onChange={(v: string) => handle('collectionName', v)} />
            <div style={{ height: '10px' }} />
            <Input label="Max Results (Limit)" type="number" placeholder="3" value={data.limit} onChange={(v: string) => handle('limit', v)} />
          </div>
        )}
      </>
    );
  };

  const isLogic = ['routerNode', 'loopNode', 'delayNode', 'filterNode', 'codeNode', 'httpNode', 'stopNode'].includes(type);

  return (
    <div style={{ width: '100%', height: '100%', background: 'rgba(10, 10, 15, 0.45)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <NodeTitle />
        </h3>
      </div>

      {/* Scrollable settings */}
      <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flexGrow: 1, boxSizing: 'border-box' }}>
        {type === 'triggerNode' && renderTriggerSettings()}
        {type === 'aiNode' && renderAISettings()}
        {type === 'actionNode' && renderActionSettings()}
        {type === 'knowledgeNode' && renderKnowledgeSettings()}
        {isLogic && renderLogicSettings()}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px',
  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#fff', fontFamily: 'inherit', fontSize: '0.85rem',
  outline: 'none', transition: 'border-color 0.2s ease', display: 'block', boxSizing: 'border-box'
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: '100%', right: 0, background: '#0e0e16',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', zIndex: 100,
  width: '100%', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  padding: '4px'
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '6px 10px', background: 'none', border: 'none',
  color: '#fff', textAlign: 'left', fontSize: '0.72rem', cursor: 'pointer', borderRadius: '4px',
  transition: 'background 0.1s', fontFamily: 'inherit'
};

const btnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(138,43,226,0.15)', border: '1px solid rgba(138,43,226,0.3)', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500 };
