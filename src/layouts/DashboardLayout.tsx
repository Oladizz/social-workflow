import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Activity, User, LogOut, Plug } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import '../index.css';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const navItems = [
    { name: 'Workflows', path: '/dashboard', icon: LayoutGrid },
    { name: 'Runs', path: '/runs', icon: Activity },
    { name: 'Integrations', path: '/integrations', icon: Plug },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const currentUser = auth.currentUser;

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
              <item.icon size={18} color={'inherit'} />
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
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              <User size={16} />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {currentUser?.email || 'Free Plan'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
