/**
 * Utility functions for business-related operations
 */

/**
 * Converts a business type string to a human-readable label
 * @param type - The business type string
 * @returns The formatted business type label
 */
export const getBusinessTypeLabel = (type: string): string => {
  const typeLabels: Record<string, string> = {
    'general': 'General',
    'restaurant': 'Restaurant',
    'retail': 'Retail',
    'service': 'Service',
    'entertainment': 'Entertainment',
    'healthcare': 'Healthcare',
    'fitness': 'Fitness',
    'beauty': 'Beauty & Spa',
    'professional': 'Professional Services',
    'other': 'Other'
  };
  return typeLabels[type] || type;
};

/**
 * Converts a price range string to a human-readable label
 * @param range - The price range string (e.g., '$', '$$', '$$$', '$$$$')
 * @returns The formatted price range label
 */
export const getPriceRangeLabel = (range?: string): string => {
  if (!range) return 'Not specified';
  const rangeLabels: Record<string, string> = {
    '$': '$ (Inexpensive)',
    '$$': '$$ (Moderate)',
    '$$$': '$$$ (Expensive)',
    '$$$$': '$$$$ (Very Expensive)'
  };
  return rangeLabels[range] || range;
}; 