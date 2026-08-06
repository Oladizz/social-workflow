import React from 'react';
import { Handle, Position } from 'reactflow';
import { Sparkles, Settings, Copy, Trash2, Plus } from 'lucide-react';

interface ContentGeneratorNodeProps {
  data: {
    label?: string;
    product?: string;
    contentType?: string;
    platform?: string;
  };
  isConnectable: boolean;
}

export default function ContentGeneratorNode({ data, isConnectable }: ContentGeneratorNodeProps) {
  return (
    <div style={{
      background: 'rgba(20, 20, 25, 0.95)',
      border: '1px solid rgba(255, 120, 150, 0.3)',
      borderRadius: '16px',
      padding: '20px',
      width: '300px',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 8px 30px rgba(255,120,150,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)',
      position: 'relative',
      backdropFilter: 'blur(10px)'
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ background: '#ff7eb3', width: '12px', height: '12px', border: '2px solid #141419' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
        <div style={{ background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', padding: '8px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(255,117,140,0.3)' }}>
          <Sparkles size={16} color="white" />
        </div>
        <div style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '0.2px' }}>{data.label || 'Content Generator'}</div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', opacity: 0.6 }}>
          <Settings size={14} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.6'} />
          <Copy size={14} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.6'} />
          <Trash2 size={14} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0.6'} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Product</label>
          <select style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
            <option>{data.product || 'Select Product'}</option>
            <option>All Products</option>
            <option>Tymio</option>
            <option>Nuro</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Content Type</label>
          <select style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
            <option>{data.contentType || 'Select Type'}</option>
            <option>Launch Tweet</option>
            <option>Weekly Thread</option>
            <option>Blog Intro</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Platform</label>
          <select style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
            <option>{data.platform || 'Select Platform'}</option>
            <option>Twitter</option>
            <option>LinkedIn</option>
            <option>Reddit</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
          <Plus size={14} />
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ background: '#ff758c', width: '12px', height: '12px', border: '2px solid #141419' }} />
    </div>
  );
}