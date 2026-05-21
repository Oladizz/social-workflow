import React, { useState } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { Clock, Zap, Globe, MousePointer, Rss, Sparkles, Search, GitBranch, Code, RotateCcw, Filter, Timer, StopCircle, Bot, Brain, FileText, Database } from 'lucide-react';
import { PLATFORMS } from '../data/platforms';

const LOGIC_ITEMS = [
  { label: 'Router', desc: 'Branch on condition', icon: <GitBranch size={15} color="#f59e0b" />, bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', nodeType: 'routerNode', data: { branches: ['Branch 1', 'Branch 2'] } },
  { label: 'Loop', desc: 'Iterate list', icon: <RotateCcw size={15} color="#06b6d4" />, bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', nodeType: 'loopNode', data: { inputPath: '{{trigger.items}}' } },
  { label: 'Delay', desc: 'Wait before next', icon: <Timer size={15} color="#8b5cf6" />, bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', nodeType: 'delayNode', data: { amount: 5, unit: 'minutes' } },
  { label: 'Filter', desc: 'Conditional stop', icon: <Filter size={15} color="#ec4899" />, bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', nodeType: 'filterNode', data: { condition: '' } },
  { label: 'Code', desc: 'Run custom JS', icon: <Code size={15} color="#6366f1" />, bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', nodeType: 'codeNode', data: { code: '// Write your code here\nreturn { result: "ok" };' } },
  { label: 'HTTP', desc: 'Any API call', icon: <Globe size={15} color="#10b981" />, bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', nodeType: 'httpNode', data: { method: 'GET', url: '' } },
  { label: 'Stop', desc: 'End flow here', icon: <StopCircle size={15} color="#ef4444" />, bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', nodeType: 'stopNode', data: {} },
];

const AI_ITEMS = [
  { label: 'Gemini AI', desc: 'Google Gemini', icon: <Sparkles size={15} color="#F5A623" />, bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.3)', model: 'gemini' },
  { label: 'GPT / OpenAI', desc: 'ChatGPT', icon: <Bot size={15} color="#10b981" />, bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', model: 'openai' },
  { label: 'Claude', desc: 'Anthropic', icon: <Brain size={15} color="#f97316" />, bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)', model: 'claude' },
];

const KNOWLEDGE_ITEMS = [
  { label: 'Scrape URL', desc: 'Extract web text', icon: <Globe size={15} color="#3b82f6" />, bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', actionType: 'scrape_url' },
  { label: 'Parse PDF', desc: 'Extract PDF text', icon: <FileText size={15} color="#ef4444" />, bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', actionType: 'parse_pdf' },
  { label: 'Save Vector', desc: 'Upsert to DB', icon: <Database size={15} color="#10b981" />, bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', actionType: 'upsert_to_vector_db' },
  { label: 'Search Vector', desc: 'Query Vector DB', icon: <Search size={15} color="#8b5cf6" />, bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', actionType: 'search_vector_db' },
];

const TRIGGER_ITEMS = [
  { label: 'Schedule', icon: <Clock size={15} color="#FFD700" />, bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.3)', triggerType: 'schedule' },
  { label: 'Webhook', icon: <Globe size={15} color="#00d4aa" />, bg: 'rgba(0,212,170,0.12)', border: 'rgba(0,212,170,0.3)', triggerType: 'webhook' },
  { label: 'Manual', icon: <MousePointer size={15} color="#a78bfa" />, bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', triggerType: 'manual' },
  { label: 'RSS Feed', icon: <Rss size={15} color="#f97316" />, bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', triggerType: 'rss' },
  { label: 'Event', icon: <Zap size={15} color="#fb7185" />, bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.3)', triggerType: 'event' },
];

export default function Sidebar() {
  const { addNode } = useWorkflowStore();
  const [search, setSearch] = useState('');
  const q = search.toLowerCase();

  const filteredPlatforms = PLATFORMS.filter(p => !q || p.name.toLowerCase().includes(q) || p.id.includes(q));
  const filteredLogic = LOGIC_ITEMS.filter(l => !q || l.label.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q));
  const filteredTriggers = TRIGGER_ITEMS.filter(t => !q || t.label.toLowerCase().includes(q));
  const filteredAI = AI_ITEMS.filter(a => !q || a.label.toLowerCase().includes(q));
  const filteredKnowledge = KNOWLEDGE_ITEMS.filter(k => !q || k.label.toLowerCase().includes(q) || k.desc.toLowerCase().includes(q));

  const drag = (e: React.DragEvent, type: string, extra: Record<string, string> = {}) => {
    e.dataTransfer.setData('application/reactflow', type);
    Object.entries(extra).forEach(([k, v]) => e.dataTransfer.setData(`application/reactflow-${k}`, v));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{ width: '220px', height: '100%', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,8,12,0.8)', backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
      {/* Search */}
      <div style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '6px 10px' }}>
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pieces…" style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '0.8rem', outline: 'none' }} />
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>Drag to canvas · Click to add · <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>⌘K</kbd> palette</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {/* Triggers */}
        {filteredTriggers.length > 0 && <Section label="Triggers">
          {filteredTriggers.map(t => <PieceItem key={t.triggerType} label={t.label} icon={t.icon} bg={t.bg} border={t.border} onDrag={(e) => drag(e, 'trigger', { triggertype: t.triggerType })} onClick={() => addNode('trigger', { triggerType: t.triggerType })} />)}
        </Section>}

        {/* Logic */}
        {filteredLogic.length > 0 && <Section label="Logic">
          {filteredLogic.map(l => <PieceItem key={l.nodeType} label={l.label} desc={l.desc} icon={l.icon} bg={l.bg} border={l.border} onDrag={(e) => drag(e, 'logic', { logictype: l.nodeType })} onClick={() => addNode(l.nodeType as any, l.data)} />)}
        </Section>}

        {/* AI */}
        {filteredAI.length > 0 && <Section label="AI & Models">
          {filteredAI.map(a => <PieceItem key={a.model} label={a.label} desc={a.desc} icon={a.icon} bg={a.bg} border={a.border} onDrag={(e) => drag(e, 'ai')} onClick={() => addNode('ai', { model: a.model, prompt: '' })} />)}
        </Section>}

        {/* Knowledge */}
        {filteredKnowledge.length > 0 && <Section label="Knowledge Base">
          {filteredKnowledge.map(k => <PieceItem key={k.actionType} label={k.label} desc={k.desc} icon={k.icon} bg={k.bg} border={k.border} onDrag={(e) => drag(e, 'knowledge', { actiontype: k.actionType })} onClick={() => addNode('knowledge', { actionType: k.actionType })} />)}
        </Section>}

        {/* Social platforms */}
        {filteredPlatforms.length > 0 && <Section label="Apps & Socials">
          {filteredPlatforms.map(p => {
            const Icon = p.IconComponent;
            return <PieceItem key={p.id} label={p.name} desc={`${p.actions.length} actions`} icon={<Icon size={15} color="#fff" />} bg={p.bgGradient} border="transparent" onDrag={(e) => drag(e, 'action', { platform: p.id })} onClick={() => addNode('action', { platform: p.id })} />;
          })}
        </Section>}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '1.2px', color: 'rgba(255,255,255,0.28)', fontWeight: 600, margin: '0 0 5px 2px' }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{children}</div>
    </div>
  );
}

function PieceItem({ label, desc, icon, bg, border, onDrag, onClick }: { label: string; desc?: string; icon: React.ReactNode; bg: string; border: string; onDrag: (e: React.DragEvent) => void; onClick: () => void }) {
  return (
    <div draggable onDragStart={onDrag} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', borderRadius: '7px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'grab', transition: 'all 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
      <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: bg, border: border !== 'transparent' ? `1px solid ${border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.32)' }}>{desc}</div>}
      </div>
    </div>
  );
}
