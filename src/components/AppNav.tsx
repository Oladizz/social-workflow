import React, { useState, useEffect } from 'react';
import { Brain, Zap, LayoutDashboard, Workflow, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

export type AppPage = 'builder' | 'dashboard' | 'knowledge' | 'connections';

interface AppNavProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export default function AppNav({ currentPage, onNavigate }: AppNavProps) {
  const [collapsed, setCollapsed] = useState(false);

  const NAV = [
    { id: 'builder' as AppPage,     icon: <Workflow size={18} />,       label: 'Builder',     color: '#a78bfa' },
    { id: 'dashboard' as AppPage,   icon: <LayoutDashboard size={18} />, label: 'Dashboard',   color: '#60a5fa' },
    { id: 'knowledge' as AppPage,   icon: <Brain size={18} />,          label: 'Knowledge',   color: '#f59e0b' },
    { id: 'connections' as AppPage, icon: <Zap size={18} />,            label: 'Connections', color: '#10b981' },
  ];

  return (
    <nav style={{
      width: collapsed ? '52px' : '180px', flexShrink: 0, height: '100vh',
      background: 'rgba(6,6,10,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease', overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{ padding: '14px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '52px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#8a2be2,#4169e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#fff', flexShrink: 0 }}>S</div>
        {!collapsed && <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', whiteSpace: 'nowrap' }}>SocialFlow</span>}
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV.map(item => {
          const active = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} title={collapsed ? item.label : undefined} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: collapsed ? '9px' : '9px 10px', borderRadius: '9px',
              background: active ? `${item.color}18` : 'transparent',
              border: active ? `1px solid ${item.color}30` : '1px solid transparent',
              color: active ? item.color : 'rgba(255,255,255,0.45)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.83rem', fontWeight: active ? 600 : 400,
              transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start',
              whiteSpace: 'nowrap', width: '100%', textAlign: 'left'
            }}>
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </button>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        margin: '8px', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
        color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </nav>
  );
}
