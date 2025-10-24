import { useEffect, useState, useCallback, SetStateAction } from "react";
import { openDB } from "idb";
import { DB_NAME, NEW_TREE, STORE_NAME } from "@/libs/constants";
import { FamilyTreeObject } from "@/types/FamilyTreeObject";

/**
 * useIndexedDBState
 * Manages one family tree's data in IndexedDB under key (treeId)
 */
export function useIndexedDBState<T>(treeId: string | null) {
  const [value, setValue] = useState<FamilyTreeObject | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper: open DB and ensure store exists
  const openOrUpgradeDB = async () =>
    openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });

  // Load a tree’s data
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const db = await openOrUpgradeDB();

      if (!treeId) {
        if (!cancelled) {
          setValue(undefined);
          setIsLoaded(true);
        }
        return;
      }

      const saved = await db.get(STORE_NAME, treeId);
      if (!cancelled) {
        setValue(saved ?? NEW_TREE());
        setIsLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [treeId]);

  // Save data for this tree
  const saveValue = useCallback(
    (newValue: SetStateAction<FamilyTreeObject>) => {
      if (!treeId) return;

      setValue((prev) => {
        const next =
          typeof newValue === "function"
            ? (newValue as (prev?: FamilyTreeObject) => FamilyTreeObject)(prev)
            : newValue;

        (async () => {
          const db = await openOrUpgradeDB();
          await db.put(STORE_NAME, next, treeId);
        })();

        return next;
      });
    },
    [treeId]
  );

  return { value, setValue: saveValue, isLoaded };
}
