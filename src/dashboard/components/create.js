import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { postService } from '../../services/postService';
import { eventService } from '../../services/eventService';
import { imageUploadService } from '../../services/imageUploadService';
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
  const [eventFormData, setEventFormData] = useState({
    title: '',
    location: '',
    tags: '',
    imageUrl: '',
    price: '',
    scheduledTime: ''
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
    setTimeout(() => setNotification({ open: false, message: '', type: '' }), 2500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEventInputChange = (field, value) => {
    setEventFormData(prev => ({ ...prev, [field]: value }));
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

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        imageUploadService.validateImageFile(file);
        setSelectedImageFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
        
        // Clear URL input when file is selected
        setEventFormData(prev => ({ ...prev, imageUrl: '' }));
      } catch (error) {
        showNotification(error.message, 'error');
        e.target.value = '';
      }
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventFormData.title.trim()) return;
    setIsSubmitting(true);
    try {
      let finalImageUrl = eventFormData.imageUrl;
      
      // Upload image file if selected
      if (selectedImageFile) {
        const { publicUrl } = await imageUploadService.uploadEventImage(selectedImageFile);
        finalImageUrl = publicUrl;
      }
      
      // Create event with image URL
      await eventService.createEvent({
        ...eventFormData,
        imageUrl: finalImageUrl
      });
      
      // Reset form
      setEventFormData({ title: '', location: '', tags: '', imageUrl: '', price: '', scheduledTime: '' });
      setSelectedImageFile(null);
      setImagePreview(null);
      
      showNotification('Event created successfully!', 'success');
    } catch (err) {
      showNotification('Failed to create event: ' + (err.message || err), 'error');
      console.error('Create event error:', err);
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
        {activeTab === 'events' && (
          <div style={{ maxWidth: 900, width: '100%', margin: '0 auto' }}>
            <form onSubmit={handleEventSubmit} className="create-post-form">
              <div className="form-group">
                <label htmlFor="eventTitle">Event Title</label>
                <input
                  type="text"
                  id="eventTitle"
                  value={eventFormData.title}
                  onChange={(e) => handleEventInputChange('title', e.target.value)}
                  placeholder="What's your event called?"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="eventLocation">Location</label>
                <input
                  type="text"
                  id="eventLocation"
                  value={eventFormData.location}
                  onChange={(e) => handleEventInputChange('location', e.target.value)}
                  placeholder="Where is the event happening?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="eventTime">Event Time (optional)</label>
                <input
                  type="datetime-local"
                  id="eventTime"
                  value={eventFormData.scheduledTime}
                  onChange={(e) => handleEventInputChange('scheduledTime', e.target.value)}
                  placeholder="When is the event happening?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="eventPrice">Price (optional)</label>
                <div className="price-input-container">
                  <span className="price-symbol">$</span>
                  <input
                    type="number"
                    id="eventPrice"
                    value={eventFormData.price}
                    onChange={(e) => handleEventInputChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="price-hint">Leave empty for free events</div>
              </div>
              <div className="form-group">
                <label htmlFor="eventTags">Tags (optional)</label>
                <input
                  type="text"
                  id="eventTags"
                  value={eventFormData.tags}
                  onChange={(e) => handleEventInputChange('tags', e.target.value)}
                  placeholder="Add tags separated by commas (e.g., #party, #music, #networking)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="eventImage">Event Image (optional)</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="eventImage"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="image-upload-input"
                  />
                  <label htmlFor="eventImage" className="image-upload-label">
                    <div className="image-upload-content">
                      <span className="image-upload-icon">📷</span>
                      <span className="image-upload-text">Choose an image or drag here</span>
                      <span className="image-upload-hint">Max 5MB • JPEG, PNG, WebP, GIF</span>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="eventImageUrl">Or provide image URL (optional)</label>
                <input
                  type="url"
                  id="eventImageUrl"
                  value={eventFormData.imageUrl}
                  onChange={(e) => {
                    handleEventInputChange('imageUrl', e.target.value);
                    // Clear file selection when URL is entered
                    setSelectedImageFile(null);
                    setImagePreview(null);
                  }}
                  placeholder="https://example.com/event-image.jpg"
                />
              </div>
              
              {(imagePreview || eventFormData.imageUrl) && (
                <div className="image-preview">
                  <img 
                    src={imagePreview || eventFormData.imageUrl} 
                    alt="Preview" 
                    onError={(e) => e.target.style.display = 'none'} 
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={!eventFormData.title.trim() || isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        )}
        {activeTab !== 'posts' && activeTab !== 'events' && (
          <div style={{ textAlign: 'center', color: '#86868b', padding: '2rem' }}>
            <p>Coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateService; 