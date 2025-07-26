import React, { useState } from 'react';
import { businessLocationService } from '../../../services/businessLocationService';
import { imageUploadService } from '../../../services/imageUploadService';

interface BusinessLocationFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  businessType: string;
  hoursOfOperation: string;
  priceRange: string;
  amenities: string[];
  tags: string[];
  imageUrl: string;
}

const BusinessLocationForm: React.FC = () => {
  const [formData, setFormData] = useState<BusinessLocationFormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: '',
    email: '',
    website: '',
    businessType: 'general',
    hoursOfOperation: '',
    priceRange: '',
    amenities: [],
    tags: [],
    imageUrl: ''
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; type: string }>({ 
    open: false, 
    message: '', 
    type: '' 
  });

  const showNotification = (message: string, type: string = 'success') => {
    setNotification({ open: true, message, type });
    setTimeout(() => setNotification({ open: false, message: '', type: '' }), 2500);
  };

  const handleInputChange = (field: keyof BusinessLocationFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        imageUploadService.validateImageFile(file);
        setSelectedImageFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
        
        // Clear URL input when file is selected
        setFormData(prev => ({ ...prev, imageUrl: '' }));
      } catch (error: any) {
        showNotification(error.message, 'error');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      showNotification('Business name is required.', 'error');
      return;
    }
    if (!formData.address.trim()) {
      showNotification('Address is required.', 'error');
      return;
    }
    if (!formData.city.trim()) {
      showNotification('City is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.imageUrl;
      
      // Upload image file if selected
      if (selectedImageFile) {
        const { publicUrl } = await imageUploadService.uploadBusinessLocationImage(selectedImageFile);
        finalImageUrl = publicUrl;
      }
      
      // Create business location
      await businessLocationService.createBusinessLocation({
        ...formData,
        imageUrl: finalImageUrl
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        phone: '',
        email: '',
        website: '',
        businessType: 'general',
        hoursOfOperation: '',
        priceRange: '',
        amenities: [],
        tags: [],
        imageUrl: ''
      });
      setSelectedImageFile(null);
      setImagePreview(null);
      
      showNotification('Business location created successfully!', 'success');
    } catch (err: any) {
      showNotification('Failed to create business location: ' + (err.message || err), 'error');
      console.error('Create business location error:', err);
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

  const businessTypes = [
    { value: 'general', label: 'General' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'retail', label: 'Retail' },
    { value: 'service', label: 'Service' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'beauty', label: 'Beauty & Spa' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'other', label: 'Other' }
  ];

  const priceRanges = [
    { value: '', label: 'Not specified' },
    { value: '$', label: '$ (Inexpensive)' },
    { value: '$$', label: '$$ (Moderate)' },
    { value: '$$$', label: '$$$ (Expensive)' },
    { value: '$$$$', label: '$$$$ (Very Expensive)' }
  ];

  const commonAmenities = [
    'Wi-Fi',
    'Parking',
    'Wheelchair Accessible',
    'Outdoor Seating',
    'Delivery',
    'Takeout',
    'Reservations',
    'Live Music',
    'Happy Hour',
    'Pet Friendly'
  ];

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <div className="form-group">
        <label htmlFor="businessName">Business Name *</label>
        <input
          type="text"
          id="businessName"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter business name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="businessType">Business Type</label>
        <select
          id="businessType"
          value={formData.businessType}
          onChange={(e) => handleInputChange('businessType', e.target.value)}
        >
          {businessTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your business..."
          rows={4}
          maxLength={1000}
        />
        <div className="char-count">
          {formData.description.length}/1000
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address">Street Address *</label>
        <input
          type="text"
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="123 Main Street"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="city">City *</label>
        <input
          type="text"
          id="city"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder="City"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="state">State</label>
        <input
          type="text"
          id="state"
          value={formData.state}
          onChange={(e) => handleInputChange('state', e.target.value)}
          placeholder="State"
        />
      </div>

      <div className="form-group">
        <label htmlFor="zipCode">ZIP Code</label>
        <input
          type="text"
          id="zipCode"
          value={formData.zipCode}
          onChange={(e) => handleInputChange('zipCode', e.target.value)}
          placeholder="12345"
        />
      </div>

      <div className="form-group">
        <label htmlFor="country">Country</label>
        <input
          type="text"
          id="country"
          value={formData.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          placeholder="Country"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="contact@business.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="website">Website</label>
        <input
          type="url"
          id="website"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          placeholder="https://www.business.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="hoursOfOperation">Hours of Operation</label>
        <input
          type="text"
          id="hoursOfOperation"
          value={formData.hoursOfOperation}
          onChange={(e) => handleInputChange('hoursOfOperation', e.target.value)}
          placeholder="Mon-Fri 9AM-5PM, Sat 10AM-3PM"
        />
      </div>

      <div className="form-group">
        <label htmlFor="priceRange">Price Range</label>
        <select
          id="priceRange"
          value={formData.priceRange}
          onChange={(e) => handleInputChange('priceRange', e.target.value)}
        >
          {priceRanges.map(range => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Amenities</label>
        <div className="amenities-grid">
          {commonAmenities.map(amenity => (
            <label key={amenity} className="amenity-checkbox">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
              />
              <span>{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <input
          type="text"
          id="tags"
          value={formData.tags.join(', ')}
          onChange={(e) => handleTagsChange(e.target.value)}
          placeholder="Add tags separated by commas (e.g., coffee, breakfast, wifi)"
        />
        <div className="form-hint">Tags help people find your business</div>
      </div>

      <div className="form-group">
        <label htmlFor="businessImage">Business Image</label>
        <div className="image-upload-container">
          <input
            type="file"
            id="businessImage"
            accept="image/*"
            onChange={handleImageFileChange}
            className="image-upload-input"
          />
          <label htmlFor="businessImage" className="image-upload-label">
            <div className="image-upload-content">
              <span className="image-upload-icon">📷</span>
              <span className="image-upload-text">Choose an image or drag here</span>
              <span className="image-upload-hint">Max 5MB • JPEG, PNG, WebP, GIF</span>
            </div>
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="imageUrl">Or provide image URL</label>
        <input
          type="url"
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => {
            handleInputChange('imageUrl', e.target.value);
            setSelectedImageFile(null);
            setImagePreview(null);
          }}
          placeholder="https://example.com/business-image.jpg"
        />
      </div>

      {(imagePreview || formData.imageUrl) && (
        <div className="image-preview">
          <img
            src={imagePreview || formData.imageUrl}
            alt="Preview"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={!formData.name.trim() || !formData.address.trim() || !formData.city.trim() || isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Business Location'}
        </button>
      </div>

      {/* Notification */}
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
    </form>
  );
};

export default BusinessLocationForm;
