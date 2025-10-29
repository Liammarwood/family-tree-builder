import { FamilyTreeObject } from "@/types/FamilyTreeObject";
import { DB_NAME, DB_VERSION, STORE_NAME } from "./constants";

interface ObjectStoreSchema {
  keyPath: string | string[] | null;
  autoIncrement: boolean;
}

interface ExportStoreData<T> {
  schema: ObjectStoreSchema;
  data: T[];
}

type ExportDataMap<T> = Record<string, ExportStoreData<T>>;

/**
 * 🔹 Export a single record from IndexedDB and download as JSON
 */
export const handleExport = async (currentTreeId: string | undefined): Promise<void> => {
  if(!currentTreeId) return;
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const record = await new Promise<FamilyTreeObject | undefined>((resolve, reject) => {
      const request = store.get(currentTreeId);
      request.onsuccess = () => resolve(request.result as FamilyTreeObject | undefined);
      request.onerror = () => reject(request.error);
    });

    if (!record) {
      // Indicate up to caller that no record was found so UI can show a friendly warning
      throw new Error("NO_RECORD_FOUND");
    }

    const exportData: ExportDataMap<FamilyTreeObject> = {
      [STORE_NAME]: {
        schema: {
          keyPath: store.keyPath,
          autoIncrement: store.autoIncrement ?? false,
        },
        data: [record],
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${DB_NAME}-${currentTreeId}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);

    // exported successfully
  } catch (err) {
    throw err;
  }
};

/**
 * 🔹 Import a single record JSON file and store it back into IndexedDB
 */
export const handleImport = async (
  file: File,
  setLoading: (isLoading: boolean) => void,
  reload: () => void
): Promise<void> => {
  setLoading(true);
  try {
    const text = await file.text();
    const importData: ExportDataMap<FamilyTreeObject> = JSON.parse(text);

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    for (const storeName of Object.keys(importData)) {
      const { data } = importData[storeName];
      if (!data || data.length === 0) {
        // Propagate a specific error so callers can display a warning instead of a failure
        throw new Error("NO_DATA_IN_IMPORT");
      }

      const record = data[0];

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        store.put(record);

        transaction.oncomplete = () => {
          // record imported
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    }

    reload();
  } catch (err) {
    throw err;
  } finally {
    setLoading(false);
  }
};
