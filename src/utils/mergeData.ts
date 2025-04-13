import merge from 'lodash.merge';

/**
 * Merges stored program data with default data to ensure all default structure is preserved
 * while keeping any existing user data
 * 
 * @param storedData The data retrieved from storage
 * @param defaultData The default data structure to ensure is included
 * @returns Merged program data
 */
export const mergeData = <T extends object>(
  storedData: T | null,
  defaultData: T
): T => {
  // If no stored data, return default data
  if (!storedData) return defaultData;
  
  // Always perform deep merge
  return merge({}, defaultData, storedData);
}; 