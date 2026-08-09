import React, { useState } from 'react';
import { Search, TrendingUp, ShoppingBag, Target, Brain, ArrowUpRight, Download, Star } from 'lucide-react';
import { useCompetitorStore } from '../store/useCompetitorStore';

export default function CompetitorSpyPage() {
  const { 
    activeTab, 
    setActiveTab, 
    trendingProducts, 
    watchedStores, 
    savedAds, 
    aiInsights,
    analyzeStore,
    isLoading,
    searchAds
  } = useCompetitorStore();

  const [storeUrl, setStoreUrl] = useState('');
  const [adQuery, setAdQuery] = useState('');

  return (
    <div style={{ padding: '24px', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Competitor Spy</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>Analyze trends, spy on stores, and uncover winning ads.</p>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        {[
          { id: 'trending', label: 'Trending Products', icon: TrendingUp },
          { id: 'stores', label: 'Store Spy', icon: ShoppingBag },
          { id: 'ads', label: 'Ad Spy', icon: Target },
          { id: 'intelligence', label: 'My Intelligence', icon: Brain },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: isActive ? 'rgba(138, 43, 226, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(138, 43, 226, 0.3)' : '1px solid transparent',
                padding: '10px 18px',
                borderRadius: '8px',
                color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                fontWeight: isActive ? 600 : 'normal',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 0 10px rgba(138,43,226,0.1)' : 'none'
              }}
            >
              <Icon size={18} /> {tab.label}
            </button>
          )
        })}
      </div>

      <div>
        {activeTab === 'trending' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'rgba(255,255,255,0.5)' }} />
                <input 
                  type="text" 
                  placeholder="Search keywords, niches, or products..." 
                  style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <select style={{ padding: '0 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', outline: 'none' }}>
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {trendingProducts.map(product => (
                <div key={product.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', backdropFilter: 'blur(10px)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#00B2FF', background: 'rgba(0, 178, 255, 0.1)', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{product.category}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: product.demand === 'rising' ? '#4ade80' : product.demand === 'falling' ? '#f87171' : '#9ca3af' }}>
                      <TrendingUp size={16} />
                      <span style={{ fontWeight: 'bold' }}>{product.trendScore}</span>
                    </div>
                  </div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>{product.name}</h3>
                  
                  <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: '16px' }}>
                    {product.sparkline.map((val, i) => (
                      <div key={i} style={{ flex: 1, background: 'linear-gradient(to top, #8a2be2, #00B2FF)', height: `${val}%`, borderRadius: '3px', opacity: 0.8 }}></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <input 
                type="text" 
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="Enter Shopify or Ecommerce store URL (e.g., myshop.com)..." 
                style={{ flex: 1, padding: '14px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', outline: 'none' }}
              />
              <button 
                onClick={() => analyzeStore(storeUrl)}
                disabled={!storeUrl || isLoading}
                style={{ background: 'linear-gradient(to right, #00B2FF, #8a2be2)', border: 'none', padding: '14px 32px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: storeUrl ? 'pointer' : 'not-allowed', opacity: storeUrl ? 1 : 0.5, boxShadow: '0 4px 15px rgba(0,178,255,0.2)' }}>
                {isLoading ? 'Scanning...' : 'Analyze Store'}
              </button>
            </div>

            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Watched Stores</h3>
            {watchedStores.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'rgba(255,255,255,0.4)' }}>
                No stores watched yet. Analyze a competitor store to add it to your intelligence watchlist.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {watchedStores.map(store => (
                  <div key={store.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {store.name} <a href={store.url} target="_blank" rel="noreferrer" style={{ color: '#00B2FF' }}><ArrowUpRight size={18} /></a>
                        </h4>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Last checked: {new Date(store.lastChecked).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '32px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Est. Products</div>
                          <div style={{ fontWeight: 'bold', fontSize: '24px', color: '#a78bfa' }}>{store.productCount}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Price Range</div>
                          <div style={{ fontWeight: 'bold', fontSize: '24px', color: '#00B2FF' }}>{store.priceRange}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '14px', marginBottom: '16px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Top Products Found</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {store.topProducts.map(p => (
                        <div key={p.id} style={{ display: 'flex', gap: '16px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}></div>
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{p.title}</div>
                            <div style={{ fontSize: '13px', color: '#4ade80' }}>{p.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ads' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <input 
                type="text" 
                value={adQuery}
                onChange={e => setAdQuery(e.target.value)}
                placeholder="Search by brand name or ad keywords..." 
                style={{ flex: 1, padding: '14px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', outline: 'none' }}
              />
              <button 
                onClick={() => searchAds(adQuery)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 32px', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                {isLoading ? 'Searching...' : 'Spy on Ads'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {(savedAds.length ? savedAds : [1,2,3,4]).map((item: any, i) => {
                const isMock = typeof item === 'number';
                const id = isMock ? `mock-${i}` : item.id;
                const brand = isMock ? `BrandName ${i}` : item.brand;
                const copy = isMock ? 'This is the winning ad copy that is currently scaling. Notice the hook in the first line...' : item.copy;
                
                return (
                  <div key={id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '180px', background: 'linear-gradient(45deg, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      Ad Creative Placeholder
                    </div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{brand}</div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '10px', background: '#1877F2', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>FB</span>
                          <span style={{ fontSize: '10px', background: '#E1306C', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>IG</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px 0', lineHeight: 1.5, flex: 1 }}>
                        {copy}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>Active {isMock ? '14' : item.daysActive} days</span>
                        <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', color: 'white', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                           <Star size={14} /> Save to Swipe File
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>AI Insights & Predictions</h3>
              <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                <Download size={16} /> Export Intel Report
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {aiInsights.map(insight => (
                <div key={insight.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${insight.type === 'opportunity' ? 'rgba(74, 222, 128, 0.2)' : insight.type === 'warning' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(0, 178, 255, 0.2)'}`, borderRadius: '12px', padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', color: insight.type === 'opportunity' ? '#4ade80' : insight.type === 'warning' ? '#f87171' : '#00B2FF' }}>
                    <Brain size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px', color: 'rgba(255,255,255,0.9)' }}>{insight.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.6 }}>{insight.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}