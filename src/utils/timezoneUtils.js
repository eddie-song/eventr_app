/**
 * Timezone utility functions for handling event scheduling
 */

import { DateTime } from 'luxon';

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
    if (userTimezone === 'UTC') {
      return utcDate;
    }
    // Use Intl.DateTimeFormat to get the correct parts in the user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(utcDate);
    const get = (type) => parts.find(p => p.type === type)?.value;
    const year = get('year');
    const month = get('month');
    const day = get('day');
    const hour = get('hour');
    const minute = get('minute');
    const second = get('second');
    // Construct a new Date object in local time
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
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
    // Use Luxon to parse the local time in the user's timezone and convert to UTC
    // Try parsing as ISO first
    let dt = DateTime.fromISO(localTime, { zone: userTimezone });
    if (!dt.isValid) {
      // Fallback: try parsing as 'yyyy-MM-ddTHH:mm' (datetime-local input format)
      dt = DateTime.fromFormat(localTime, 'yyyy-MM-dd\THH:mm', { zone: userTimezone });
    }
    if (!dt.isValid) throw new Error('Invalid date format');
    return dt.toUTC().toISO();
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
    // Create a Date object from utcTime and let toLocaleString handle the timezone
    const date = new Date(utcTime);
    const defaultOptions = {
      timeZone: userTimezone
    };
    return date.toLocaleString('en-US', { ...defaultOptions, ...options });
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
    // Create a Date object from the UTC string; browser will interpret as local time
    const date = new Date(utcTime);
    // Extract local components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error converting UTC to datetime-local:', error);
    return '';
  }
}; 