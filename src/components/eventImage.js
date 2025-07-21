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

        // Check if this is a Supabase storage URL (contains our bucket name)
        if (imageUrl.includes('event-images')) {
          // Extract filename from the URL
          const urlParts = imageUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          
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
    return () => {
      isMounted = false;
    };
  }, [imageUrl, onError]);

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
