/**
 * Get a value from localStorage with proper error handling
 */
export const getLocalStorage = <T = string>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      // If not valid JSON, return as string
      return value as unknown as T;
    }
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Set a value in localStorage with proper error handling
 */
export const setLocalStorage = (key: string, value: any): void => {
  try {
    const valueToStore =
      typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, valueToStore);
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
  }
};

/**
 * Remove a value from localStorage with proper error handling
 */
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};
