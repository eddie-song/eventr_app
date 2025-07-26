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
    <div className="max-w-4xl mx-auto w-full">
      <form onSubmit={handleSubmit} className="space-y-6 m-0 p-0 border-0">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 m-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 m-0">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="m-0">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter business name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
                required
              />
            </div>

            <div className="m-0">
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Business Type
              </label>
              <select
                id="businessType"
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
              >
                {businessTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 m-0">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your business..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none m-0 box-border"
            />
            <div className="text-sm text-gray-500 mt-1 text-right m-0">
              {formData.description.length}/1000
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 m-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 m-0">Address Information</h3>
          
          <div className="space-y-4">
            <div className="m-0">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="m-0">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
                  required
                />
              </div>

              <div className="m-0">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
                />
              </div>

              <div className="m-0">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="12345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
                />
              </div>
            </div>

            <div className="m-0">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Country
              </label>
              <input
                type="text"
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Country"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 m-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 m-0">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="m-0">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
              />
            </div>

            <div className="m-0">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@business.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2 m-0">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.business.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
            />
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 m-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 m-0">Business Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="m-0">
              <label htmlFor="hoursOfOperation" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Hours of Operation
              </label>
              <input
                type="text"
                id="hoursOfOperation"
                value={formData.hoursOfOperation}
                onChange={(e) => handleInputChange('hoursOfOperation', e.target.value)}
                placeholder="Mon-Fri 9AM-5PM, Sat 10AM-3PM"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
              />
            </div>

            <div className="m-0">
              <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Price Range
              </label>
              <select
                id="priceRange"
                value={formData.priceRange}
                onChange={(e) => handleInputChange('priceRange', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 m-0">
              Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonAmenities.map(amenity => (
                <label key={amenity} className="flex items-center space-x-2 cursor-pointer m-0">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 m-0"
                  />
                  <span className="text-sm text-gray-700 m-0">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2 m-0">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="Add tags separated by commas (e.g., coffee, breakfast, wifi)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
            />
            <div className="text-sm text-gray-500 mt-1 m-0">
              Tags help people find your business
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 m-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 m-0">Business Image</h3>
          
          <div className="space-y-4">
            <div className="m-0">
              <label htmlFor="businessImage" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Upload Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors m-0">
                <input
                  type="file"
                  id="businessImage"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden m-0"
                />
                <label htmlFor="businessImage" className="cursor-pointer m-0">
                  <div className="space-y-2 m-0">
                    <div className="text-3xl m-0">📷</div>
                    <div className="text-sm text-gray-600 m-0">
                      Choose an image or drag here
                    </div>
                    <div className="text-xs text-gray-500 m-0">
                      Max 5MB • JPEG, PNG, WebP, GIF
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="m-0">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2 m-0">
                Or provide image URL
              </label>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors m-0 box-border"
              />
            </div>

            {(imagePreview || formData.imageUrl) && (
              <div className="mt-4 m-0">
                <label className="block text-sm font-medium text-gray-700 mb-2 m-0">
                  Preview
                </label>
                <div className="relative w-full h-48 rounded-xl overflow-hidden m-0">
                  <img
                    src={imagePreview || formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover m-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end m-0">
          <button
            type="submit"
            disabled={!formData.name.trim() || !formData.address.trim() || !formData.city.trim() || isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed m-0 border-0 cursor-pointer"
          >
            {isSubmitting ? 'Creating...' : 'Create Business Location'}
          </button>
        </div>
      </form>

      {/* Notification */}
      {notification.open && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-white font-medium shadow-lg m-0 ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default BusinessLocationForm;
