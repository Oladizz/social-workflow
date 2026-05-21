import React from 'react';
import { TEMPLATES, WorkflowTemplate } from '../data/templates';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { useToast } from '../store/useToastStore';
import { X, Zap } from 'lucide-react';
import { getPlatformById } from '../data/platforms';

interface TemplatesModalProps {
  onClose: () => void;
}

export default function TemplatesModal({ onClose }: TemplatesModalProps) {
  const { loadTemplate } = useWorkflowStore();
  const toast = useToast();

  const handleSelect = (template: WorkflowTemplate) => {
    loadTemplate(template);
    toast.success(`Template "${template.name}" loaded!`);
    onClose();
  };

  // Get unique platform icons from template nodes
  const getTemplateIcons = (template: WorkflowTemplate) => {
    return template.nodes
      .filter(n => n.type === 'actionNode')
      .map(n => getPlatformById(n.data.platform as string))
      .filter(Boolean)
      .slice(0, 4);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', animation: 'fadeInModal 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeInModal { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUpModal { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .template-card:hover { background: rgba(255,255,255,0.07) !important; transform: translateY(-2px); border-color: rgba(138,43,226,0.5) !important; }
      `}</style>
      <div style={{
        background: 'rgba(12, 12, 18, 0.98)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
        width: '100%', maxWidth: '780px', maxHeight: '85vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        animation: 'slideUpModal 0.25s ease-out', boxShadow: '0 40px 120px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #8a2be2, #4169e1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Workflow Templates</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Start fast with a pre-built workflow</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Grid */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {TEMPLATES.map(template => {
            const icons = getTemplateIcons(template);
            return (
              <div key={template.id} className="template-card" onClick={() => handleSelect(template)} style={{
                padding: '18px', borderRadius: '14px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: '10px'
              }}>
                <div style={{ fontSize: '2rem' }}>{template.icon}</div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 600 }}>{template.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{template.description}</p>
                </div>
                {/* Platform icons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '4px' }}>
                  {icons.map(p => {
                    if (!p) return null;
                    const Icon = p.IconComponent;
                    return (
                      <div key={p.id} title={p.name} style={{ width: '24px', height: '24px', borderRadius: '6px', background: p.bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={13} color="#fff" />
                      </div>
                    );
                  })}
                  {template.nodes.some(n => n.type === 'aiNode') && (
                    <div title="Gemini AI" style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #F5A623, #FF7B00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>✨</div>
                  )}
                </div>
                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {template.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '20px', background: 'rgba(138,43,226,0.15)', color: '#a78bfa', border: '1px solid rgba(138,43,226,0.25)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
