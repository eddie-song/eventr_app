import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { postService } from '../../services/postService';
import './create.css';

const TABS = [
  { key: 'posts', label: 'Posts' },
  { key: 'recommend', label: 'Recommend' },
  { key: 'people', label: 'People' },
  { key: 'events', label: 'Events' },
  { key: 'locations', label: 'Locations' },
];

const CreateService = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [formData, setFormData] = useState({
    content: '',
    location: '',
    tags: '',
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
    setTimeout(() => setNotification({ open: false, message: '', type: '' }), 2500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;
    setIsSubmitting(true);
    try {
      await postService.createPost(formData);
      setFormData({ content: '', location: '', tags: '', imageUrl: '' });
      showNotification('Post created successfully!', 'success');
    } catch (err) {
      showNotification('Failed to create post: ' + (err.message || err), 'error');
      console.error('Create post error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-container" style={{ paddingTop: 40 }}>
      <div className="home-feed">
        <div className="feed-header">
          <h1>Create</h1>
        </div>
        {notification.open && (
          <div style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: notification.type === 'error' ? '#ff3b30' : '#007AFF',
            color: 'white',
            padding: '12px 32px',
            borderRadius: 12,
            fontSize: 16,
            zIndex: 2000,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}>
            {notification.message}
          </div>
        )}
        {/* Apple-inspired Tab Bar */}
        <div
          style={{
            display: 'flex',
            marginBottom: 32,
            background: '#f8f8fa',
            borderRadius: 24,
            border: '1px solid #e5e6ea',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            overflow: 'visible',
            width: '100%',
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
            padding: 4,
            position: 'relative',
          }}
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`filter-btn${isActive ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  minWidth: 0,
                  flex: 1,
                  border: 'none',
                  margin: 0,
                  background: 'transparent',
                  color: isActive ? '#222' : '#86868b',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif',
                  fontSize: 16,
                  outline: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 2,
                  padding: '12px 8px',
                  borderRadius: 20,
                  transition: 'color 0.18s cubic-bezier(.4,0,.2,1)',
                }}
              >
                {/* Pill highlight for active tab */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 6,
                      right: 6,
                      top: 2,
                      bottom: 2,
                      background: 'white',
                      borderRadius: 20,
                      zIndex: 1,
                      transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                    }}
                  />
                )}
                <span style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'block',
                  width: '100%',
                }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
        {activeTab === 'posts' && (
          <div style={{ maxWidth: 900, width: '100%', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} className="create-post-form">
              <div className="form-group">
                <label htmlFor="content">What's happening?</label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Share your experience, thoughts, or recommend..."
                  rows={4}
                  maxLength={500}
                  required
                />
                <div className="char-count">
                  {formData.content.length}/500
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="location">Location (optional)</label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Where are you?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tags">Tags (optional)</label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Add tags separated by commas (e.g., #food, #datenight)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="imageUrl">Image URL (optional)</label>
                <input
                  type="url"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formData.imageUrl && (
                <div className="image-preview">
                  <img src={formData.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={!formData.content.trim() || isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        )}
        {activeTab !== 'posts' && (
          <div style={{ textAlign: 'center', color: '#86868b', padding: '2rem' }}>
            <p>Coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateService; 