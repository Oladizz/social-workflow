import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutGrid, Activity, User } from 'lucide-react';
import '../index.css';

export default function DashboardLayout() {
  const navItems = [
    { name: 'Workflows', path: '/dashboard', icon: LayoutGrid },
    { name: 'Runs', path: '/runs', icon: Activity },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0f', color: 'white' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '240px', 
        borderRight: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(20, 20, 25, 0.4)',
        backdropFilter: 'blur(10px)',
        padding: '24px 16px'
      }}>
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            <span style={{ color: 'var(--accent-primary)' }}>Social</span>Flow
          </h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map(item => (
            <NavLink 
              key={item.name} 
              to={item.path}
              end={item.path === '/dashboard'}
              style={({ isActive }) => ({
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                background: isActive ? 'rgba(138,43,226,0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease'
              })}
            >
              <item.icon size={18} color={/* isActive logic handled via CSS classes or just relying on inherit */ 'inherit'} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div style={{ 
          marginTop: 'auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.03)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Demo User</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Free Plan</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
