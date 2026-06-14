import React from 'react';
import { useSEO } from '../hooks/useSEO';
import { Settings, Wrench, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  useSEO({
    title: 'We\'ll be right back! | Social Workflow',
    description: 'We are currently performing scheduled maintenance on our servers. We will be back online shortly.',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center',
      padding: '24px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background styling */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(138,43,226,0.05) 0%, transparent 60%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 60%)', filter: 'blur(80px)' }} />

      <div style={{
        width: '100px',
        height: '100px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ animation: 'spin 4s linear infinite', display: 'flex' }}>
          <Settings size={48} color="#a78bfa" />
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>

      <h1 style={{
        fontSize: '3rem',
        fontWeight: 800,
        marginBottom: '16px',
        position: 'relative',
        zIndex: 1
      }}>We're upgrading the engine.</h1>
      
      <p style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '1.15rem',
        maxWidth: '500px',
        lineHeight: 1.6,
        marginBottom: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        SocialFlow is currently undergoing scheduled maintenance to improve performance and add new features. 
        We expect to be back online shortly. Thank you for your patience!
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(138,43,226,0.1)',
        padding: '12px 24px',
        borderRadius: '32px',
        border: '1px solid rgba(138,43,226,0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        <RefreshCw size={18} color="#d8b4fe" />
        <span style={{ color: '#d8b4fe', fontWeight: 500 }}>Please check back in a few minutes.</span>
      </div>
    </div>
  );
}
