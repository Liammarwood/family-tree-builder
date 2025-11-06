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

/**
 * Autosave functionality for family trees
 */

export type PersistedPayload<T> = {
  version: number;
  createdAt: string;
  savedAt: string;
  data: T;
};

const AUTOSAVE_KEY = "family-tree-autosave:v1";

export function saveTreeToLocal<T>(tree: T): boolean {
  try {
    const payload: PersistedPayload<T> = {
      version: 1,
      createdAt: new Date().toISOString(),
      savedAt: new Date().toISOString(),
      data: tree,
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    // localStorage might be full or blocked
    console.error("Failed to save tree to localStorage:", err);
    return false;
  }
}

export function loadTreeFromLocal<T>(): PersistedPayload<T> | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedPayload<T>;
    return parsed;
  } catch (err) {
    console.error("Failed to load tree from localStorage:", err);
    return null;
  }
}

export function removeAutosave(): void {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch (err) {
    console.warn("Failed to remove autosave:", err);
  }
}

export function getAutosaveSavedAt(): string | null {
  try {
    const payload = loadTreeFromLocal<any>();
    return payload?.savedAt ?? null;
  } catch {
    return null;
  }
}
