import React, { useState, useEffect } from 'react';
import { imageUploadService } from '../services/imageUploadService';

const EventImage = ({ imageUrl, alt, className, onError, ...props }) => {
  const [displayUrl, setDisplayUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadImage = async () => {
      if (!imageUrl) {
        if (isMounted) {
          setDisplayUrl(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setHasError(false);
        }

        // Robustly parse the URL
        let fileName = null;
        let isSupabaseEventImage = false;
        try {
          const urlObj = new URL(imageUrl, window.location.origin);
          // Check if the pathname contains the expected bucket path
          // Example: /storage/v1/object/public/event-images/userid/filename.jpg
          const pathMatch = urlObj.pathname.match(/event-images\/(.+)$/);
          if (pathMatch) {
            fileName = pathMatch[1].split('?')[0]; // Remove any query params
            isSupabaseEventImage = true;
          }
        } catch (e) {
          // Not a valid URL, fallback to old logic
          if (typeof imageUrl === 'string' && imageUrl.includes('event-images/')) {
            const match = imageUrl.match(/event-images\/(.+?)(\?|$)/);
            if (match) {
              fileName = match[1];
              isSupabaseEventImage = true;
            }
          }
        }

        if (isSupabaseEventImage && fileName) {
          // If it's a signed URL, use it directly
          if (imageUrl.includes('?token=')) {
            if (isMounted) setDisplayUrl(imageUrl);
          } else {
            // Get a new signed URL
            const signedUrl = await imageUploadService.getSignedUrl(fileName);
            if (isMounted) setDisplayUrl(signedUrl);
          }
        } else {
          // External URL, use as is
          if (isMounted) setDisplayUrl(imageUrl);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          setHasError(true);
          if (onError) onError(error);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadImage();
    // Note: onError is intentionally not included in the dependency array.
    // If you use a custom onError, memoize it in the parent to avoid unnecessary effect runs.
    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  if (isLoading) {
    return (
      <div className={`${className} image-loading`} {...props}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          background: '#f8f9fa',
          color: '#86868b'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (hasError || !displayUrl) {
    return (
      <div className={`${className} image-error`} {...props}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          background: '#f8f9fa',
          color: '#86868b'
        }}>
          📷
        </div>
      </div>
    );
  }

  return (
    <img
      src={displayUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
      {...props}
    />
  );
};

export default EventImage; 
