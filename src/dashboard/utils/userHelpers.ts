/**
 * Shared utility functions for user-related components
 */

/**
 * Generate avatar emoji based on display name or username
 * @param name - Display name (can be undefined)
 * @param username - Username (fallback)
 * @returns Emoji string representing the user
 */
export const getAvatarEmoji = (name: string | undefined | null, username: string): string => {
  const displayName = name || username;
  const firstChar = displayName.charAt(0).toLowerCase();
  
  const emojiMap: { [key: string]: string } = {
    'a': '👨‍💻', 'b': '👩‍🎨', 'c': '👨‍🍳', 'd': '👩‍🏫', 'e': '👨‍🎤',
    'f': '👩‍⚕️', 'g': '👨‍🔬', 'h': '👩‍💼', 'i': '👨', 'j': '👩‍🚀',
    'k': '👨‍🏭', 'l': '👩‍🌾', 'm': '👨', 'n': '👩‍🎓', 'o': '👨‍💼',
    'p': '👩‍🔧', 'q': '👨‍🎨', 'r': '👩‍🏭', 's': '👨‍⚕️', 't': '👩',
    'u': '👨‍🌾', 'v': '👩', 'w': '👨‍🚀', 'x': '👩‍💻', 'y': '👨‍🎓',
    'z': '👩‍🔬'
  };
  
  return emojiMap[firstChar] || '👤';
};

/**
 * Format date for display with improved validation and timezone handling
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    // Validate input
    if (!dateString || typeof dateString !== 'string') {
      return 'Unknown';
    }

    // Parse date with validation
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    
    // Calculate time difference in milliseconds using UTC timestamps
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    // Handle future dates
    if (diffInMs < 0) {
      return 'In the future';
    }
    
    // Relative time formatting
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    if (diffInYears >= 1) return `${diffInYears}y ago`;
    
    // For dates older than a year, show the actual date in user's timezone
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown';
  }
};

/**
 * Format date for profile display (e.g., "Joined January 2023")
 * @param dateString - ISO date string to format
 * @returns Formatted date string for profile display
 */
export const formatProfileDate = (dateString: string): string => {
  try {
    if (!dateString || typeof dateString !== 'string') {
      return 'Recently';
    }

    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Recently';
    }

    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting profile date:', error);
    return 'Recently';
  }
}; 