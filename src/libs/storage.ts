/**
 * Utility functions for browser localStorage operations
 */

/**
 * Safely get an item from localStorage
 * Returns null if running in non-browser environment or if item doesn't exist
 */
export function getLocalStorageItem(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(key);
}

/**
 * Safely set an item in localStorage
 * Does nothing if running in non-browser environment
 */
export function setLocalStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(key, value);
}

/**
 * Check if this is the user's first visit
 * @param key The localStorage key to check
 * @returns true if the user has visited before, false otherwise
 */
export function hasVisitedBefore(key: string): boolean {
  return getLocalStorageItem(key) !== null;
}
