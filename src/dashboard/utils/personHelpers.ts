/**
 * Shared utility functions for person-related components
 */

// Service type color mapping
export const SERVICE_TYPE_COLORS: { [key: string]: string } = {
  professional: 'bg-blue-100 text-blue-800',
  creative: 'bg-purple-100 text-purple-800',
  technical: 'bg-green-100 text-green-800',
  healthcare: 'bg-red-100 text-red-800',
  education: 'bg-yellow-100 text-yellow-800',
  consulting: 'bg-indigo-100 text-indigo-800',
  maintenance: 'bg-gray-100 text-gray-800',
  transportation: 'bg-orange-100 text-orange-800',
  general: 'bg-gray-100 text-gray-800'
};

/**
 * Get the CSS color classes for a service type
 * @param serviceType - The service type string
 * @returns CSS color classes for the service type
 */
export const getServiceTypeColor = (serviceType: string): string => {
  return SERVICE_TYPE_COLORS[serviceType] || SERVICE_TYPE_COLORS.general;
};

/**
 * Format a price value for display
 * @param price - The price value (optional)
 * @returns Formatted price string
 */
export const formatPrice = (price?: number): string => {
  if (!price) return 'Negotiable';
  return `$${price.toFixed(2)}/hr`;
};

/**
 * Format a rating value for display
 * @param rating - The rating value (optional)
 * @returns Formatted rating string or null if no rating
 */
export const formatRating = (rating?: number): string | null => {
  if (!rating || rating === 0) return null;
  return rating.toFixed(1);
};

/**
 * Format a date string for display
 * @param dateString - The date string (optional)
 * @returns Formatted date string
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Recently';
  
  // Create a Date object and validate it
  const date = new Date(dateString);
  
  // Check if the date is valid (not NaN and not Invalid Date)
  if (isNaN(date.getTime())) {
    return 'Recently';
  }
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}; 