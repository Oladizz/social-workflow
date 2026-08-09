import React, { useState } from 'react';
import { Sparkles, MoreHorizontal } from 'lucide-react';

type Stage = 'Ideas' | 'AI Generated' | 'Review Queue' | 'Scheduled' | 'Posted';

interface FunnelCard {
  id: string;
  stage: Stage;
  content: string;
  platform: string;
  product: string;
  scheduledTime?: string;
}

const mockCards: FunnelCard[] = [
  { id: '1', stage: 'Ideas', content: 'Discuss the challenges of starting a new project.', platform: 'Twitter', product: 'All' },
  { id: '2', stage: 'AI Generated', content: 'Did you know 90% of startups fail? Here is how to avoid it. #startup', platform: 'LinkedIn', product: 'ProductX' },
  { id: '3', stage: 'Review Queue', content: 'Our new feature drops tomorrow. Who is ready? 🚀', platform: 'Twitter', product: 'ProductX' },
  { id: '4', stage: 'Scheduled', content: '10 tips for better productivity. Thread 🧵', platform: 'Twitter', product: 'All', scheduledTime: 'Tomorrow, 10 AM' },
  { id: '5', stage: 'Posted', content: 'Launch day was a success! Thanks everyone.', platform: 'LinkedIn', product: 'ProductY', scheduledTime: 'Yesterday' },
];

export default function FunnelPage() {
  const [cards, setCards] = useState<FunnelCard[]>(mockCards);
  const stages: Stage[] = ['Ideas', 'AI Generated', 'Review Queue', 'Scheduled', 'Posted'];

  const handleGenerate = () => {
    const newCards: FunnelCard[] = Array.from({ length: 7 }).map((_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      stage: 'AI Generated',
      content: `🚀 Generated AI idea #${i + 1} for optimal engagement this week based on trending topics.`,
      platform: ['Twitter', 'LinkedIn', 'Reddit'][Math.floor(Math.random() * 3)],
      product: 'Auto'
    }));
    setCards(prev => [...prev, ...newCards]);
  };

  const moveCard = (id: string, newStage: Stage) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));
  };

  return (
    <div style={{ padding: '24px', color: 'white', fontFamily: 'Inter, sans-serif', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>Marketing Funnel</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>Manage your content pipeline from concept to published.</p>
        </div>
        <button 
          onClick={handleGenerate}
          style={{ background: 'linear-gradient(to right, #8a2be2, #a78bfa)', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(138,43,226,0.3)' }}>
          <Sparkles size={18} /> Generate Week
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', flex: 1, backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Conversion to Posted</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00B2FF' }}>42%</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', flex: 1, backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Posts in Queue</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a78bfa' }}>12</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', flex: 1, backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>AI Generation Rate</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>15/wk</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, overflowX: 'auto', paddingBottom: '16px' }}>
        {stages.map(stage => (
          <div key={stage} style={{ flex: '0 0 320px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.9)' }}>{stage}</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', color: '#00B2FF' }}>
                {cards.filter(c => c.stage === stage).length}
              </span>
            </div>
            
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
              {cards.filter(c => c.stage === stage).length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '40px 0', fontSize: '14px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  Drag items here
                </div>
              ) : (
                cards.filter(c => c.stage === stage).map(card => (
                  <div key={card.id} style={{ background: 'rgba(25,25,35,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '16px', transition: 'all 0.2s', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{card.platform}</span>
                      <MoreHorizontal size={16} color="rgba(255,255,255,0.4)" style={{ cursor: 'pointer' }} />
                    </div>
                    <p style={{ fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5, color: 'rgba(255,255,255,0.8)' }}>{card.content}</p>
                    
                    {card.scheduledTime && (
                      <div style={{ fontSize: '12px', color: '#00B2FF', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🕒 {card.scheduledTime}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '4px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                      {stages.indexOf(stage) > 0 && (
                         <button onClick={() => moveCard(card.id, stages[stages.indexOf(stage) - 1])} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '12px', transition: 'background 0.2s' }}>← Move Back</button>
                      )}
                      {stages.indexOf(stage) < stages.length - 1 && (
                         <button onClick={() => moveCard(card.id, stages[stages.indexOf(stage) + 1])} style={{ flex: 1, background: 'rgba(0,178,255,0.1)', border: '1px solid rgba(0,178,255,0.2)', color: '#00B2FF', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '12px', transition: 'background 0.2s' }}>Advance →</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}