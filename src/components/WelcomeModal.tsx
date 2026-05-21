import React from 'react';
import { Sparkles, LayoutTemplate, X } from 'lucide-react';

interface WelcomeModalProps {
  onStartBlank: () => void;
  onUseTemplate: () => void;
}

export default function WelcomeModal({ onStartBlank, onUseTemplate }: WelcomeModalProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      animation: 'fadeInModal 0.3s ease-out'
    }}>
      <div style={{
        background: 'rgba(12, 12, 18, 0.99)', backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
        padding: '48px 40px', maxWidth: '520px', width: '100%', textAlign: 'center',
        animation: 'slideUpModal 0.3s ease-out', boxShadow: '0 40px 120px rgba(0,0,0,0.7)'
      }}>
        {/* Logo */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #8a2be2, #4169e1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', boxShadow: '0 8px 30px rgba(138,43,226,0.4)'
        }}>
          S
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Welcome to SocialFlow
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 40px', lineHeight: 1.6 }}>
          Automate your social media presence with AI-powered workflows. Build your first flow in minutes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Template option */}
          <button onClick={onUseTemplate} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '16px 20px', borderRadius: '14px', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(138,43,226,0.2), rgba(65,105,225,0.15))',
            border: '1px solid rgba(138,43,226,0.4)', color: '#fff',
            fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s ease',
            width: '100%'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(138,43,226,0.35), rgba(65,105,225,0.25))'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(138,43,226,0.2), rgba(65,105,225,0.15))'}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(138,43,226,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LayoutTemplate size={20} color="#a78bfa" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>Start from a Template</div>
              <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.45)' }}>Choose from 6 pre-built workflows — ready in 1 click</div>
            </div>
          </button>

          {/* Blank option */}
          <button onClick={onStartBlank} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '16px 20px', borderRadius: '14px', cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontFamily: 'inherit', textAlign: 'left',
            transition: 'all 0.2s ease', width: '100%'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={20} color="rgba(255,255,255,0.5)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px' }}>Start from Blank</div>
              <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.45)' }}>Drag pieces from the left sidebar to build your own flow</div>
            </div>
          </button>
        </div>

        <p style={{ marginTop: '24px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>
          You can always access templates from the header menu
        </p>
      </div>
    </div>
  );
}
