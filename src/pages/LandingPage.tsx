import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { Zap, ArrowRight, Activity, Workflow, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  useSEO({
    title: 'Cirlo | Automate Your Digital Life',
    description: 'The ultimate workflow automation tool. Connect apps, build complex logic visually, and run tasks efficiently in the cloud. Save time and focus on what matters.',
    keywords: 'workflow automation, task automation, no-code, cloud workflows, productivity, connect apps',
    ogUrl: 'https://cirlo.app'
  });

  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      overflowX: 'hidden'
    }} id="landing-page">
      
      {/* Navigation */}
      <header id="landing-header" style={{
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8a2be2, #06b6d4)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.5px' }}>Cirlo</span>
        </div>
        <nav aria-label="Main Navigation">
          <ul style={{ display: 'flex', gap: '32px', listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>
            <li><a href="#features" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color='#fff'} onMouseOut={(e) => e.currentTarget.style.color='rgba(255,255,255,0.7)'}>Features</a></li>
            <li><a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color='#fff'} onMouseOut={(e) => e.currentTarget.style.color='rgba(255,255,255,0.7)'}>How it Works</a></li>
            <li>
              <button 
                id="btn-nav-login"
                onClick={() => navigate('/login')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '10px 24px',
                  borderRadius: '24px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Sign In
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section id="hero-section" style={{
          padding: '100px 48px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          minHeight: '85vh',
          maxWidth: '1400px',
          margin: '0 auto',
          flexWrap: 'wrap'
        }}>
          {/* Ambient Backgrounds */}
          <div style={{ position: 'absolute', top: '10%', left: '20%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, animation: 'pulse 8s infinite alternate' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, animation: 'pulse 6s infinite alternate-reverse' }} />

          {/* Left Text Content */}
          <div style={{ position: 'relative', zIndex: 1, flex: '1 1 500px', maxWidth: '600px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(138, 43, 226, 0.2)', color: '#d8b4fe', borderRadius: '24px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
              ✨ The New Standard for Automation
            </span>
            <h1 id="main-heading" style={{
              fontSize: '4.5rem',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '24px',
              background: 'linear-gradient(to right, #fff, #a78bfa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              Automate the Impossible
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '48px', lineHeight: 1.6 }}>
              Connect your favorite apps, design intelligent workflows visually, and let Cirlo handle the repetitive tasks while you focus on creativity.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button
                id="btn-hero-cta"
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'linear-gradient(135deg, #8a2be2, #06b6d4)',
                  color: '#fff',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '32px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 10px 30px rgba(138, 43, 226, 0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(138, 43, 226, 0.6)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(138, 43, 226, 0.4)'; }}
              >
                Start Building Free <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Right 3D Visual */}
          <div style={{ position: 'relative', zIndex: 1, flex: '1 1 500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <img 
               src="/hero-3d.jpg" 
               alt="Cirlo 3D Node Builder Illustration" 
               style={{
                 width: '100%',
                 maxWidth: '650px',
                 height: 'auto',
                 borderRadius: '24px',
                 boxShadow: '0 25px 60px rgba(6, 182, 212, 0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                 transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                 transition: 'transform 0.5s ease',
               }}
               onMouseOver={(e) => { e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'; }}
               onMouseOut={(e) => { e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'; }}
             />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ padding: '100px 24px', background: 'rgba(0,0,0,0.2)', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>Supercharge Your Productivity</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>Everything you need to orchestrate complex workflows seamlessly.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {/* Feature 1 */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', transition: 'transform 0.3s, background 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(138,43,226,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#a78bfa' }}>
                  <Workflow size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>Visual Builder</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Drag and drop nodes to create powerful logic without writing a single line of code.</p>
              </div>
              {/* Feature 2 */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', transition: 'transform 0.3s, background 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(6,182,212,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#22d3ee' }}>
                  <Globe size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>100+ Integrations</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Connect effortlessly with Twitter, Discord, Slack, Gmail, and many other platforms.</p>
              </div>
              {/* Feature 3 */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '24px', transition: 'transform 0.3s, background 0.3s' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(245,166,35,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#F5A623' }}>
                  <Activity size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>Real-time Execution</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>Watch your workflows execute step-by-step with live logs and instant feedback.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="landing-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 24px', textAlign: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <Zap size={24} color="#8a2be2" />
          <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cirlo</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>© {new Date().getFullYear()} Cirlo. Built for efficiency.</p>
      </footer>
    </div>
  );
}
