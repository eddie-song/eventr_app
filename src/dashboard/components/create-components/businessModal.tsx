import React from 'react';
import { getBusinessTypeLabel, getPriceRangeLabel } from '../../../utils/businessUtils';
import { formatDateInTimezone } from '../../../utils/timezoneUtils';

interface BusinessLocationTag {
  tag: string;
}

interface BusinessLocation {
  uuid: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  country?: string;
  longitude?: number;
  latitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  business_type: string;
  hours_of_operation?: string;
  price_range?: string;
  amenities?: string[];
  image_url?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  business_location_tags?: BusinessLocationTag[];
}

interface UserProfile {
  uuid?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

interface BusinessModalProps {
  business: BusinessLocation;
  onClose: () => void;
  userProfile?: UserProfile;
}

const BusinessModal: React.FC<BusinessModalProps> = ({ business, onClose, userProfile }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  // Handle focus trapping
  React.useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Store the element that had focus before the modal opened
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the modal
    modal.focus();

    // Get all focusable elements within the modal
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab: move to previous element
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move to next element
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, []);

  // Prevent background scrolling and restore focus on unmount
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      // Restore focus to the previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  if (!business) return null;

  return (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-modal-title"
      tabIndex={-1}
      onClick={(e) => {
        // Close modal when clicking on the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Left side - Image */}
        <div style={{
          flex: '1',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          {business.image_url ? (
            <img
              src={business.image_url}
              alt={business.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div style={{
              color: '#666',
              fontSize: '18px',
              textAlign: 'center'
            }}>
              🏢 No image
            </div>
          )}
        </div>

        {/* Right side - Content */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '400px',
          minWidth: '300px'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e1e5e9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                '👤'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                {userProfile?.display_name || userProfile?.username || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: '#86868b' }}>
                {business.city}, {business.state}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                color: '#86868b'
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px'
          }}>
            {/* Business name and type */}
            <div style={{ marginBottom: '16px' }}>
              <h2 
                id="business-modal-title"
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: '#1d1d1f'
                }}
              >
                {business.name}
              </h2>
              <div style={{
                fontSize: '14px',
                color: '#007AFF',
                fontWeight: '500'
              }}>
                {getBusinessTypeLabel(business.business_type)}
              </div>
            </div>

            {/* Description */}
            {business.description && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.4',
                  margin: '0',
                  color: '#1d1d1f'
                }}>
                  {business.description}
                </p>
              </div>
            )}

            {/* Details */}
            <div style={{ marginBottom: '16px' }}>
              {/* Address */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#1d1d1f'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" style={{ color: 'currentColor', marginRight: '8px' }}>
                  <path fill="currentColor" d="M9.156 14.544C10.899 13.01 14 9.876 14 7A6 6 0 0 0 2 7c0 2.876 3.1 6.01 4.844 7.544a1.736 1.736 0 0 0 2.312 0M6 7a2 2 0 1 1 4 0a2 2 0 0 1-4 0"></path>
                </svg>
                <span>{business.address || 'Location not specified'}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#1d1d1f'
              }}>
                <span></span>
                <span>{business.city}, {business.state} {business.zip_code}</span>
              </div>

              {/* Contact Info */}
              {business.phone && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#1d1d1f'
                }}>
                  <span>📞</span>
                  <span>{business.phone}</span>
                </div>
              )}

              {business.email && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#1d1d1f'
                }}>
                  <span>✉️</span>
                  <span>{business.email}</span>
                </div>
              )}

              {business.website && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#1d1d1f'
                }}>
                  <span>🌐</span>
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#007AFF', textDecoration: 'none' }}
                  >
                    {business.website}
                  </a>
                </div>
              )}

              {/* Hours */}
              {business.hours_of_operation && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#1d1d1f'
                }}>
                  <span>🕒</span>
                  <span>{business.hours_of_operation}</span>
                </div>
              )}

              {/* Price Range */}
              {business.price_range && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#1d1d1f'
                }}>
                  <span>💰</span>
                  <span>{getPriceRangeLabel(business.price_range)}</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            {business.amenities && business.amenities.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: '#1d1d1f'
                }}>
                  Amenities
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {business.amenities.map((amenity, index) => (
                    <span key={index} style={{
                      backgroundColor: '#E3F2FD',
                      color: '#1976D2',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {business.business_location_tags && business.business_location_tags.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  color: '#1d1d1f'
                }}>
                  Tags
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {business.business_location_tags.map((tagItem, index) => (
                    <span key={index} style={{
                      backgroundColor: '#F3E5F5',
                      color: '#7B1FA2',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      #{tagItem.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div style={{
              fontSize: '12px',
              color: '#86868b',
              marginTop: '16px',
              borderTop: '1px solid #e1e5e9',
              paddingTop: '16px'
            }}>
              Created {formatDateInTimezone(business.created_at, 'MMM d, yyyy')}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e1e5e9'
          }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#86868b'
                }}
              >
                📤
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#86868b'
                }}
              >
                🔖
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#86868b'
                }}
              >
                🗺️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModal;
