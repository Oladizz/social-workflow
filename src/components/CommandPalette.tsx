import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Zap, GitBranch, Code, Globe, Clock, Sparkles, X } from 'lucide-react';
import { PLATFORMS } from '../data/platforms';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { useToast } from '../store/useToastStore';

interface PaletteItem {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  onClose: () => void;
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNode } = useWorkflowStore();
  const toast = useToast();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const allItems = useMemo((): PaletteItem[] => {
    const triggers = [
      { id: 'schedule', label: 'Schedule Trigger', desc: 'Run on a time schedule' },
      { id: 'webhook', label: 'Webhook Trigger', desc: 'Run on incoming HTTP request' },
      { id: 'manual', label: 'Manual Trigger', desc: 'Run manually from dashboard' },
      { id: 'rss', label: 'RSS Feed Trigger', desc: 'Run when RSS feed updates' },
      { id: 'event', label: 'Event Trigger', desc: 'Run on platform event' },
    ].map(t => ({
      id: `trigger-${t.id}`, label: t.label, description: t.desc, category: 'Triggers',
      icon: <Clock size={14} color="#FFD700" />,
      action: () => { addNode('trigger', { triggerType: t.id }); toast.info(`${t.label} added`); onClose(); }
    }));

    const logic = [
      { id: 'routerNode', label: 'Router (If/Else)', desc: 'Split flow into branches based on conditions', color: '#f59e0b', emoji: '🔀' },
      { id: 'loopNode', label: 'Loop', desc: 'Iterate over a list of items', color: '#06b6d4', emoji: '🔁' },
      { id: 'delayNode', label: 'Delay', desc: 'Wait before continuing', color: '#8b5cf6', emoji: '⏱️' },
      { id: 'filterNode', label: 'Filter', desc: 'Only continue if condition is true', color: '#ec4899', emoji: '🚫' },
      { id: 'codeNode', label: 'Code (JavaScript)', desc: 'Run custom JS/TS code', color: '#6366f1', emoji: '</>' },
      { id: 'httpNode', label: 'HTTP Request', desc: 'Make any API call', color: '#10b981', emoji: '🌐' },
      { id: 'stopNode', label: 'Stop', desc: 'End the flow here', color: '#ef4444', emoji: '⏹' },
    ].map(n => ({
      id: n.id, label: n.label, description: n.desc, category: 'Logic',
      icon: <span style={{ fontSize: '13px' }}>{n.emoji}</span>,
      action: () => { addNode('logic' as any, { nodeType: n.id }); toast.info(`${n.label} added`); onClose(); }
    }));

    const ai = [
      { id: 'gemini', label: 'Gemini AI', desc: 'Generate text with Google Gemini' },
      { id: 'openai', label: 'OpenAI / GPT', desc: 'Generate text with ChatGPT' },
      { id: 'claude', label: 'Anthropic Claude', desc: 'Generate text with Claude' },
    ].map(a => ({
      id: `ai-${a.id}`, label: a.label, description: a.desc, category: 'AI',
      icon: <Sparkles size={14} color="#F5A623" />,
      action: () => { addNode('ai', { model: a.id }); toast.info(`${a.label} added`); onClose(); }
    }));

    const socials = PLATFORMS.map(p => {
      const Icon = p.IconComponent;
      return {
        id: `platform-${p.id}`, label: p.name, description: `Automate ${p.name} actions`, category: 'Social',
        icon: <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: p.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={10} color="#fff" /></div>,
        action: () => { addNode('action', { platform: p.id }); toast.info(`${p.name} node added`); onClose(); }
      };
    });

    return [...triggers, ...logic, ...ai, ...socials];
  }, [addNode, onClose, toast]);

  const filtered = useMemo(() => {
    if (!query) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(item => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [query, allItems]);

  const groups = useMemo(() => {
    const g: Record<string, PaletteItem[]> = {};
    filtered.forEach(item => { if (!g[item.category]) g[item.category] = []; g[item.category].push(item); });
    return g;
  }, [filtered]);

  const flatFiltered = filtered;

  useEffect(() => { setSelected(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, flatFiltered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter') { e.preventDefault(); flatFiltered[selected]?.action(); }
    if (e.key === 'Escape') onClose();
  };

  let globalIdx = 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '600px', background: 'rgba(12,12,18,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)', animation: 'slideUpModal 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={18} color="rgba(255,255,255,0.4)" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Search pieces, actions, logic nodes..." style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }} />
          <kbd style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: 'rgba(255,255,255,0.35)' }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {Object.entries(groups).map(([category, items]) => (
            <div key={category}>
              <p style={{ padding: '8px 16px 4px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{category}</p>
              {items.map(item => {
                const idx = globalIdx++;
                const isSelected = idx === selected;
                return (
                  <button key={item.id} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 16px', background: isSelected ? 'rgba(138,43,226,0.15)' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left', transition: 'background 0.1s', borderLeft: isSelected ? '2px solid #8a2be2' : '2px solid transparent' }}>
                    <div style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{item.description}</p>
                    </div>
                    {isSelected && <kbd style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>↵ Add</kbd>}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && <p style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>No pieces found for "{query}"</p>}
        </div>
      </div>
    </div>
  );
}
