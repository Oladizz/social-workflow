import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  useSEO({
    title: '404 - Page Not Found | Social Workflow',
    description: 'The page you are looking for does not exist or has been moved.',
  });

  const navigate = useNavigate();

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
      padding: '24px'
    }}>
      <div style={{
        position: 'relative',
        display: 'inline-block',
        marginBottom: '32px'
      }}>
        <div style={{
          position: 'absolute',
          inset: '-20px',
          background: 'rgba(255, 68, 68, 0.15)',
          filter: 'blur(40px)',
          borderRadius: '50%',
          zIndex: 0
        }} />
        <h1 style={{
          fontSize: '8rem',
          fontWeight: 900,
          margin: 0,
          lineHeight: 1,
          background: 'linear-gradient(to right, #ff8a8a, #ff4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative',
          zIndex: 1
        }}>404</h1>
      </div>
      
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px', position: 'relative', zIndex: 1 }}>
        Lost in the Cloud?
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '500px', fontSize: '1.1rem', marginBottom: '40px', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
        We can't seem to find the page you're looking for. It might have been deleted, moved, or never existed in the first place.
      </p>

      <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <ArrowLeft size={18} /> Go Back
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #8a2be2, #06b6d4)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(138,43,226,0.3)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <Home size={18} /> Take Me Home
        </button>
      </div>
    </div>
  );
}
