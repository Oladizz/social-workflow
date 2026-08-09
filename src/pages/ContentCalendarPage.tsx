import React, { useState } from 'react';
import { Calendar, Clock, Filter, Plus, Edit2, Trash2, Sparkles, Send, Eye } from 'lucide-react';
// import { platforms } from '../data/platforms'; // Assuming this exists based on requirements
import { contentTemplates } from '../data/contentTemplates';

// Mock platforms to simulate the data
const platforms = {
  twitter: { color: '#1DA1F2', icon: '🐦', name: 'Twitter' },
  linkedin: { color: '#0A66C2', icon: '💼', name: 'LinkedIn' },
  reddit: { color: '#FF4500', icon: '🤖', name: 'Reddit' },
  instagram: { color: '#E1306C', icon: '📸', name: 'Instagram' }
};

interface ScheduledPost {
  id: string;
  date: string;
  time: string;
  platform: keyof typeof platforms;
  content: string;
  status: 'draft' | 'scheduled' | 'posted';
}

const mockPosts: ScheduledPost[] = [
  { id: '1', date: new Date().toISOString().split('T')[0], time: '10:00 AM', platform: 'twitter', content: 'Just launched our new feature! Check it out.', status: 'scheduled' },
  { id: '2', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '02:00 PM', platform: 'linkedin', content: 'Here is what we learned building in public this week.', status: 'draft' },
];

export default function ContentCalendarPage() {
  const [view, setView] = useState<'month' | 'week'>('month');
  const [posts, setPosts] = useState<ScheduledPost[]>(mockPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');

  const stats = {
    total: posts.length,
    activePlatforms: new Set(posts.map(p => p.platform)).size,
    today: posts.filter(p => p.date === new Date().toISOString().split('T')[0]).length,
    upcoming: posts.filter(p => p.status === 'scheduled').length
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const filteredPosts = posts.filter(p => 
    (filterPlatform === 'all' || p.platform === filterPlatform)
  );

  return (
    <div style={{ padding: '24px', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Content Calendar</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={filterPlatform} 
            onChange={(e) => setFilterPlatform(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', color: 'white', outline: 'none' }}>
            <option value="all">All Platforms</option>
            {Object.keys(platforms).map(p => <option key={p} value={p}>{platforms[p as keyof typeof platforms].name}</option>)}
          </select>
          <select 
            value={filterProduct} 
            onChange={(e) => setFilterProduct(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', color: 'white', outline: 'none' }}>
            <option value="all">All Products</option>
            <option value="tymio">Tymio</option>
            <option value="nuro">Nuro</option>
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{ background: 'linear-gradient(to right, #8a2be2, #a78bfa)', border: 'none', padding: '8px 16px', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
            <Plus size={16} /> New Post
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[ 
          { label: 'Total Posts This Month', value: stats.total },
          { label: 'Platforms Active', value: stats.activePlatforms },
          { label: 'Posts Today', value: stats.today },
          { label: 'Upcoming Posts', value: stats.upcoming }
        ].map((stat, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00B2FF', textShadow: '0 0 10px rgba(0,178,255,0.3)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px' }}>
           <button onClick={() => setView('month')} style={{ background: view === 'month' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>Month</button>
           <button onClick={() => setView('week')} style={{ background: view === 'week' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>Week</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{ padding: '12px', background: '#0a0a0f', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayPosts = filteredPosts.filter(p => p.date === dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div key={i} 
                   onClick={() => handleDayClick(dateStr)}
                   style={{ background: '#0a0a0f', minHeight: '130px', padding: '8px', cursor: 'pointer', border: isToday ? '1px solid #8a2be2' : 'none', position: 'relative', transition: 'background 0.2s' }}
                   onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                   onMouseOut={e => e.currentTarget.style.background = '#0a0a0f'}
                   >
                <div style={{ fontSize: '13px', fontWeight: isToday ? 'bold' : 'normal', color: isToday ? '#a78bfa' : 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                  {date.getDate()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {dayPosts.map(post => (
                    <div key={post.id} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.04)', padding: '6px', borderRadius: '6px', borderLeft: `3px solid ${platforms[post.platform]?.color || '#fff'}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px' }}>{platforms[post.platform]?.icon}</span>
                      <span style={{ opacity: 0.8 }}>{post.time}</span>
                      <span style={{ opacity: 0.5, marginLeft: 'auto' }}>
                        {post.status === 'draft' ? '📝' : post.status === 'scheduled' ? '🕒' : '✅'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#0f0f15', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '550px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit2 size={20} color="#00B2FF" /> Create Post
            </h2>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Platform</label>
                <select style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}>
                  {Object.keys(platforms).map(p => <option key={p} value={p}>{platforms[p as keyof typeof platforms].name}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Product</label>
                <select style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}>
                  <option value="all">Global</option>
                  <option value="tymio">Tymio</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Content</label>
              <textarea 
                rows={6}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', resize: 'vertical', outline: 'none', lineHeight: 1.5 }}
                placeholder="What do you want to share with your audience?"
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Publish Date</label>
                <input type="date" defaultValue={selectedDate} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Time</label>
                <input type="time" defaultValue="10:00" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={{ background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.3)', padding: '12px 16px', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                <Sparkles size={16} /> Auto-Generate
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer', transition: 'background 0.2s' }}>
                  Cancel
                </button>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'linear-gradient(to right, #8a2be2, #00B2FF)', border: 'none', padding: '12px 28px', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(138,43,226,0.3)' }}>
                  <Send size={16} /> Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}