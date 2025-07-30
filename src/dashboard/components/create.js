import React, { useState } from 'react';
import { postService } from '../../services/postService';
import { eventService } from '../../services/eventService';
import { personService } from '../../services/personService';
import { imageUploadService } from '../../services/imageUploadService';
import { recommendService } from '../../services/recommendService';
import BusinessLocationForm from './create-components/business-location.tsx';
import './create.css';

const TABS = [
  { key: 'posts', label: 'Posts' },
  { key: 'recommend', label: 'Recommend' },
  { key: 'people', label: 'People' },
  { key: 'events', label: 'Events' },
  { key: 'business-locations', label: 'Locations' },
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
    description: '',
    tags: '',
    imageUrl: '',
    price: '',
    scheduledTime: '',
    capacity: '',
    eventType: 'general'
  });
  const [personFormData, setPersonFormData] = useState({
    service: '',
    description: '',
    location: '',
    contactInfo: '',
    serviceType: 'general',
    hourlyRate: '',
    imageUrl: ''
  });
  const [recommendFormData, setRecommendFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'place',
    imageUrl: '',
    rating: '',
    tags: ''
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedRecommendImageFile, setSelectedRecommendImageFile] = useState(null);
  const [recommendImagePreview, setRecommendImagePreview] = useState(null);
  const [selectedPeopleImageFile, setSelectedPeopleImageFile] = useState(null);
  const [peopleImagePreview, setPeopleImagePreview] = useState(null);
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

  const handlePersonInputChange = (field, value) => {
    setPersonFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecommendInputChange = (field, value) => {
    // Add validation for rating field
    if (field === 'rating') {
      const numValue = parseFloat(value);
      
      // If the value is not a valid number, don't update
      if (isNaN(numValue) && value !== '') {
        return;
      }
      
      // If the value is empty, allow it (for clearing the field)
      if (value === '') {
        setRecommendFormData(prev => ({ ...prev, [field]: value }));
        return;
      }
      
      // Clamp the value between 0 and 5
      const clampedValue = Math.max(0, Math.min(5, numValue));
      
      // Only update if the value is within the valid range or if it's being cleared
      if (clampedValue === numValue || value === '') {
        setRecommendFormData(prev => ({ ...prev, [field]: value }));
      } else {
        // If the value was clamped, update with the clamped value
        setRecommendFormData(prev => ({ ...prev, [field]: clampedValue.toString() }));
      }
    } else {
      // For non-rating fields, update normally
      setRecommendFormData(prev => ({ ...prev, [field]: value }));
    }
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

  // Cleanup for imagePreview blob URLs
  React.useEffect(() => {
    return () => {
      if (imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Reusable image file handling function
  const handleImageFileChange = (e, options) => {
    const { 
      setSelectedFile, 
      setImagePreview, 
      setFormData, 
      formDataKey = 'imageUrl' 
    } = options;
    
    const file = e.target.files[0];
    if (file) {
      try {
        imageUploadService.validateImageFile(file);
        setSelectedFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
        
        // Clear URL input when file is selected
        setFormData(prev => ({ ...prev, [formDataKey]: '' }));
      } catch (error) {
        showNotification(error.message, 'error');
        e.target.value = '';
      }
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!eventFormData.title.trim()) {
      showNotification('Event title is required.', 'error');
      return;
    }
    if (!eventFormData.location.trim()) {
      showNotification('Event location is required.', 'error');
      return;
    }
    if (!eventFormData.scheduledTime || isNaN(Date.parse(eventFormData.scheduledTime))) {
      showNotification('Event scheduled time is required and must be a valid date/time.', 'error');
      return;
    }
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
      setEventFormData({ 
        title: '', 
        location: '', 
        description: '', 
        tags: '', 
        imageUrl: '', 
        price: '', 
        scheduledTime: '', 
        capacity: '', 
        eventType: 'general' 
      });
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

  const handlePersonSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!personFormData.serviceType.trim()) {
      showNotification('Service type is required.', 'error');
      return;
    }
    if (!personFormData.location.trim()) {
      showNotification('Service area/location is required.', 'error');
      return;
    }
    if (!personFormData.contactInfo.trim()) {
      showNotification('Contact information is required.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      let finalImageUrl = personFormData.imageUrl;
      
      // Upload image file if selected
      if (selectedPeopleImageFile) {
        const { publicUrl } = await imageUploadService.uploadPeopleImage(selectedPeopleImageFile);
        finalImageUrl = publicUrl;
      }
      
      // Create person service with image URL
      await personService.createPerson({
        ...personFormData,
        imageUrl: finalImageUrl
      });
      
      // Reset form
      setPersonFormData({ 
        description: '', 
        location: '', 
        contactInfo: '', 
        serviceType: 'general', 
        hourlyRate: '',
        imageUrl: ''
      });
      setSelectedPeopleImageFile(null);
      setPeopleImagePreview(null);
      
      showNotification('Service created successfully!', 'success');
    } catch (err) {
      showNotification('Failed to create service: ' + (err.message || err), 'error');
      console.error('Create person error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleRecommendSubmit = async (e) => {
    e.preventDefault();
    if (!recommendFormData.title.trim() || !recommendFormData.description.trim()) {
      showNotification('Title and description are required.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      let finalImageUrl = recommendFormData.imageUrl;
      if (selectedRecommendImageFile) {
        const { publicUrl } = await imageUploadService.uploadRecommendationImage(selectedRecommendImageFile);
        finalImageUrl = publicUrl;
      }
      await recommendService.createRecommendation({
        ...recommendFormData,
        imageUrl: finalImageUrl
      });
      setRecommendFormData({
        title: '',
        description: '',
        location: '',
        type: 'place',
        imageUrl: '',
        rating: '',
        tags: ''
      });
      setSelectedRecommendImageFile(null);
      setRecommendImagePreview(null);
      showNotification('Recommendation created successfully!', 'success');
    } catch (err) {
      showNotification('Failed to create recommendation: ' + (err.message || err), 'error');
      console.error('Create recommendation error:', err);
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
                <label htmlFor="eventDescription">Description</label>
                <textarea
                  id="eventDescription"
                  value={eventFormData.description}
                  onChange={(e) => handleEventInputChange('description', e.target.value)}
                  placeholder="Tell people about your event..."
                  rows={4}
                  maxLength={1000}
                />
                <div className="char-count">
                  {eventFormData.description.length}/1000
                </div>
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
                <label htmlFor="eventCapacity">Capacity (optional)</label>
                <input
                  type="number"
                  id="eventCapacity"
                  value={eventFormData.capacity}
                  onChange={(e) => handleEventInputChange('capacity', e.target.value)}
                  placeholder="Maximum number of attendees"
                  min="1"
                />
                <div className="capacity-hint">Leave empty for unlimited capacity</div>
              </div>
              <div className="form-group">
                <label htmlFor="eventType">Event Type</label>
                <select
                  id="eventType"
                  value={eventFormData.eventType}
                  onChange={(e) => handleEventInputChange('eventType', e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="concert">Concert</option>
                  <option value="workshop">Workshop</option>
                  <option value="party">Party</option>
                  <option value="meetup">Meetup</option>
                  <option value="conference">Conference</option>
                  <option value="sports">Sports</option>
                  <option value="food">Food & Dining</option>
                  <option value="art">Art & Culture</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
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
                    onChange={(e) => handleImageFileChange(e, {
                      setSelectedFile: setSelectedImageFile,
                      setImagePreview: setImagePreview,
                      setFormData: setEventFormData,
                      formDataKey: 'imageUrl'
                    })}
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
        {activeTab === 'people' && (
          <div style={{ maxWidth: 900, width: '100%', margin: '0 auto' }}>
            <form onSubmit={handlePersonSubmit} className="create-post-form">

              <div className="form-group">
                <label htmlFor="personDescription">Service Description</label>
                <textarea
                  id="personDescription"
                  value={personFormData.description}
                  onChange={(e) => handlePersonInputChange('description', e.target.value)}
                  placeholder="Describe your service in detail..."
                  rows={4}
                  maxLength={1000}
                />
                <div className="char-count">
                  {personFormData.description.length}/1000
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="personLocation">Service Area</label>
                <input
                  type="text"
                  id="personLocation"
                  value={personFormData.location}
                  onChange={(e) => handlePersonInputChange('location', e.target.value)}
                  placeholder="Where do you provide your service?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="personContact">Contact Information</label>
                <input
                  type="text"
                  id="personContact"
                  value={personFormData.contactInfo}
                  onChange={(e) => handlePersonInputChange('contactInfo', e.target.value)}
                  placeholder="Email, phone, or preferred contact method"
                />
              </div>
              <div className="form-group">
                <label htmlFor="personServiceType">Service Type</label>
                <select
                  id="personServiceType"
                  value={personFormData.serviceType}
                  onChange={(e) => handlePersonInputChange('serviceType', e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="technical">Technical</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="consulting">Consulting</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="transportation">Transportation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="personHourlyRate">Hourly Rate (optional)</label>
                <div className="price-input-container">
                  <span className="price-symbol">$</span>
                  <input
                    type="number"
                    id="personHourlyRate"
                    value={personFormData.hourlyRate}
                    onChange={(e) => handlePersonInputChange('hourlyRate', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="price-hint">Leave empty for negotiable rates</div>
              </div>

              <div className="form-group">
                <label htmlFor="personImage">Service Image (optional)</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="personImage"
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e, {
                      setSelectedFile: setSelectedPeopleImageFile,
                      setImagePreview: setPeopleImagePreview,
                      setFormData: setPersonFormData,
                      formDataKey: 'imageUrl'
                    })}
                    className="image-upload-input"
                  />
                  <label htmlFor="personImage" className="image-upload-label">
                    <div className="image-upload-content">
                      <span className="image-upload-icon">📷</span>
                      <span className="image-upload-text">Choose an image or drag here</span>
                      <span className="image-upload-hint">Max 5MB • JPEG, PNG, WebP, GIF</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="personImageUrl">Or provide image URL (optional)</label>
                <input
                  type="url"
                  id="personImageUrl"
                  value={personFormData.imageUrl}
                  onChange={(e) => {
                    handlePersonInputChange('imageUrl', e.target.value);
                    setSelectedPeopleImageFile(null);
                    setPeopleImagePreview(null);
                  }}
                  placeholder="https://example.com/service-image.jpg"
                />
              </div>
              
              {(peopleImagePreview || personFormData.imageUrl) && (
                <div className="image-preview">
                  <img
                    src={peopleImagePreview || personFormData.imageUrl}
                    alt="Preview"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={!personFormData.serviceType.trim() || isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        )}
        {activeTab === 'recommend' && (
          <div style={{ maxWidth: 900, width: '100%', margin: '0 auto' }}>
            <form onSubmit={handleRecommendSubmit} className="create-post-form">
              <div className="form-group">
                <label htmlFor="recommendTitle">Title</label>
                <input
                  type="text"
                  id="recommendTitle"
                  value={recommendFormData.title}
                  onChange={(e) => handleRecommendInputChange('title', e.target.value)}
                  placeholder="What are you recommending?"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="recommendDescription">Description</label>
                <textarea
                  id="recommendDescription"
                  value={recommendFormData.description}
                  onChange={(e) => handleRecommendInputChange('description', e.target.value)}
                  placeholder="Describe your recommendation..."
                  rows={4}
                  maxLength={1000}
                  required
                />
                <div className="char-count">{recommendFormData.description.length}/1000</div>
              </div>
              <div className="form-group">
                <label htmlFor="recommendLocation">Location (optional)</label>
                <input
                  type="text"
                  id="recommendLocation"
                  value={recommendFormData.location}
                  onChange={(e) => handleRecommendInputChange('location', e.target.value)}
                  placeholder="Where is it?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recommendType">Type</label>
                <select
                  id="recommendType"
                  value={recommendFormData.type}
                  onChange={(e) => handleRecommendInputChange('type', e.target.value)}
                >
                  <option value="place">Place</option>
                  <option value="event">Event</option>
                  <option value="service">Service</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="recommendRating">Rating (optional)</label>
                <input
                  type="number"
                  id="recommendRating"
                  value={recommendFormData.rating}
                  onChange={(e) => handleRecommendInputChange('rating', e.target.value)}
                  placeholder="4.5"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recommendTags">Tags (optional)</label>
                <input
                  type="text"
                  id="recommendTags"
                  value={recommendFormData.tags}
                  onChange={(e) => handleRecommendInputChange('tags', e.target.value)}
                  placeholder="Add tags separated by commas (e.g., #food, #fun)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recommendImage">Image (optional)</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="recommendImage"
                    accept="image/*"
                    onChange={(e) => handleImageFileChange(e, {
                      setSelectedFile: setSelectedRecommendImageFile,
                      setImagePreview: setRecommendImagePreview,
                      setFormData: setRecommendFormData,
                      formDataKey: 'imageUrl'
                    })}
                    className="image-upload-input"
                  />
                  <label htmlFor="recommendImage" className="image-upload-label">
                    <div className="image-upload-content">
                      <span className="image-upload-icon">📷</span>
                      <span className="image-upload-text">Choose an image or drag here</span>
                      <span className="image-upload-hint">Max 5MB • JPEG, PNG, WebP, GIF</span>
                    </div>
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="recommendImageUrl">Or provide image URL (optional)</label>
                <input
                  type="url"
                  id="recommendImageUrl"
                  value={recommendFormData.imageUrl}
                  onChange={(e) => {
                    handleRecommendInputChange('imageUrl', e.target.value);
                    setSelectedRecommendImageFile(null);
                    setRecommendImagePreview(null);
                  }}
                  placeholder="https://example.com/recommend-image.jpg"
                />
              </div>
              {(recommendImagePreview || recommendFormData.imageUrl) && (
                <div className="image-preview">
                  <img
                    src={recommendImagePreview || recommendFormData.imageUrl}
                    alt="Preview"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>
              )}
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={!recommendFormData.title.trim() || !recommendFormData.description.trim() || isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Recommendation'}
                </button>
              </div>
            </form>
          </div>
        )}
        {activeTab === 'business-locations' && (
          <div style={{ maxWidth: 900, width: '100%', margin: '0 auto' }}>
            <BusinessLocationForm />
          </div>
        )}
        {activeTab !== 'posts' && activeTab !== 'events' && activeTab !== 'people' && activeTab !== 'recommend' && activeTab !== 'business-locations' && (
          <div style={{ textAlign: 'center', color: '#86868b', padding: '2rem' }}>
            <p>Coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateService; 