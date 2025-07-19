/**
 * Timezone utility functions for handling event scheduling
 */

/**
 * Convert UTC time to user's local timezone
 * @param {string} utcTime - ISO string in UTC
 * @param {string} userTimezone - User's timezone (e.g., 'America/New_York')
 * @returns {Date} Date object in user's timezone
 */
export const convertUTCToLocal = (utcTime, userTimezone = 'UTC') => {
  if (!utcTime) return null;
  
  try {
    const utcDate = new Date(utcTime);
    
    // If userTimezone is UTC, return as is
    if (userTimezone === 'UTC') {
      return utcDate;
    }
    
    // Convert to user's timezone
    const localDate = new Date(utcDate.toLocaleString('en-US', { timeZone: userTimezone }));
    return localDate;
  } catch (error) {
    console.error('Error converting UTC to local time:', error);
    return new Date(utcTime); // Fallback to original time
  }
};

/**
 * Convert local time to UTC for storage
 * @param {string} localTime - ISO string in local timezone
 * @param {string} userTimezone - User's timezone
 * @returns {string} ISO string in UTC
 */
export const convertLocalToUTC = (localTime, userTimezone = 'UTC') => {
  if (!localTime) return null;
  
  try {
    const localDate = new Date(localTime);
    
    // If userTimezone is UTC, return as is
    if (userTimezone === 'UTC') {
      return localDate.toISOString();
    }
    
    // Convert to UTC
    const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
    return utcDate.toISOString();
  } catch (error) {
    console.error('Error converting local to UTC:', error);
    return localTime; // Fallback to original time
  }
};

/**
 * Format date for display in user's timezone
 * @param {string} utcTime - ISO string in UTC
 * @param {string} userTimezone - User's timezone
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateInTimezone = (utcTime, userTimezone = 'UTC', options = {}) => {
  if (!utcTime) return null;
  
  try {
    const localDate = convertUTCToLocal(utcTime, userTimezone);
    if (!localDate) return null;
    
    const defaultOptions = {
      timeZone: userTimezone
    };
    
    return localDate.toLocaleString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    return new Date(utcTime).toLocaleString('en-US'); // Fallback
  }
};

/**
 * Get user's timezone from browser
 * @returns {string} Timezone string (e.g., 'America/New_York')
 */
export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting user timezone:', error);
    return 'UTC';
  }
};

/**
 * Get list of common timezones
 * @returns {Array} Array of timezone objects
 */
export const getCommonTimezones = () => {
  return [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' }
  ];
};

/**
 * Convert UTC time to datetime-local format for input fields
 * @param {string} utcTime - ISO string in UTC
 * @param {string} userTimezone - User's timezone
 * @returns {string} datetime-local format string (YYYY-MM-DDTHH:MM)
 */
export const convertUTCToDatetimeLocal = (utcTime, userTimezone = 'UTC') => {
  if (!utcTime) return '';
  
  try {
    const localDate = convertUTCToLocal(utcTime, userTimezone);
    if (!localDate) return '';
    
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error converting UTC to datetime-local:', error);
    return '';
  }
}; 