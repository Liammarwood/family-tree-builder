import { useEffect, useState, useCallback, SetStateAction } from "react";
import { openDB } from "idb";

const DB_NAME = "family-tree-builder";
const STORE_NAME = "family-tree-store";

/**
 * useIndexedDBState
 * Stores and syncs a piece of state in IndexedDB (client-side)
 * 
 * @param key Unique key for this record (e.g., "currentUserProgress")
 * @param defaultValue Default value if no data exists
 */
export function useIndexedDBState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize DB and load initial value
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        },
      });

      const saved = await db.get(STORE_NAME, key);
      if (!cancelled) {
        setValue(saved ?? defaultValue);
        setIsLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, defaultValue]);

  // Save value whenever it changes. Accept either a value or a functional updater (like React's setState)
  const saveValue = useCallback((newValue: SetStateAction<T>) => {
    // Use functional setState to compute the next state from the previous one
    setValue((prev) => {
      const next = typeof newValue === "function"
        ? (newValue as (prevState: T) => T)(prev)
        : newValue;

      // Persist asynchronously; don't block the state update/render
      (async () => {
        const db = await openDB(DB_NAME, 1);
        await db.put(STORE_NAME, next, key);
      })();

      return next;
    });
  }, [key]);

  return { value, setValue: saveValue, isLoaded };
}
