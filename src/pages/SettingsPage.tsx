import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { User, Settings, Shield, Bell, Save, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../store/useToastStore';

export default function SettingsPage() {
  const currentUser = auth.currentUser;
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhotoURL(currentUser.photoURL || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName, photoURL });
      toast.success('Profile updated successfully!');
      // Force reload to update sidebar
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, margin: '0 0 8px' }}>Settings</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '1.05rem' }}>Manage your account preferences and profile details.</p>
      </header>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Settings Navigation Sidebar */}
        <aside style={{ width: '240px', flexShrink: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(138,43,226,0.1)', color: '#fff', border: '1px solid rgba(138,43,226,0.2)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, textAlign: 'left', transition: 'all 0.2s' }}>
              <User size={18} /> General Profile
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid transparent', borderRadius: '12px', cursor: 'not-allowed', textAlign: 'left' }}>
              <Shield size={18} /> Security (Coming Soon)
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid transparent', borderRadius: '12px', cursor: 'not-allowed', textAlign: 'left' }}>
              <Bell size={18} /> Notifications
            </button>
          </nav>
        </aside>

        {/* Settings Content Area */}
        <main style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={24} color="#a78bfa" /> Profile Information
          </h2>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Avatar Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photoURL ? (
                  <img src={photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={32} color="rgba(255,255,255,0.5)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', fontWeight: 500 }}>Avatar Image URL</label>
                <div style={{ position: 'relative' }}>
                  <ImageIcon size={18} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    style={{
                      width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8a2be2'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', fontWeight: 500 }}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: '100%', maxWidth: '400px', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8a2be2'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            {/* Email (Disabled) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                style={{
                  width: '100%', maxWidth: '400px', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', outline: 'none', cursor: 'not-allowed', boxSizing: 'border-box'
                }}
              />
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>Your email address cannot be changed at this time.</p>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #8a2be2, #06b6d4)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: loading ? 0.7 : 1,
                  transition: 'transform 0.1s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(138, 43, 226, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
