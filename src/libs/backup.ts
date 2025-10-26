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

export const handleBackup = async (currentTreeId?: string): Promise<void> => {
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    let records: FamilyTreeObject[] = [];

    if (currentTreeId) {
      // Export only a specific record
      const record = await new Promise<FamilyTreeObject | undefined>((resolve, reject) => {
        const request = store.get(currentTreeId);
        request.onsuccess = () => resolve(request.result as FamilyTreeObject | undefined);
        request.onerror = () => reject(request.error);
      });

      if (!record) {
        console.warn(`No record found for key: ${currentTreeId}`);
        return;
      }

      records = [record];
    } else {
      // Export all records
      records = await new Promise<FamilyTreeObject[]>((resolve, reject) => {
        const items: FamilyTreeObject[] = [];
        const cursorRequest = store.openCursor();

        cursorRequest.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue | null>).result;
          if (cursor) {
            items.push(cursor.value as FamilyTreeObject);
            cursor.continue();
          } else {
            resolve(items);
          }
        };

        cursorRequest.onerror = () => reject(cursorRequest.error);
      });
    }

    const exportData: ExportDataMap<FamilyTreeObject> = {
      [STORE_NAME]: {
        schema: {
          keyPath: store.keyPath,
          autoIncrement: store.autoIncrement ?? false,
        },
        data: records,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentTreeId
      ? `${DB_NAME}-${currentTreeId}-backup.json`
      : `${DB_NAME}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
  }
};

export const handleImport = async (
  file: File,
  setLoading: (isLoading: boolean) => void
): Promise<void> => {
  setLoading(true);
  try {
    const text = await file.text();

    const importData: ExportDataMap<FamilyTreeObject> = JSON.parse(text);

    const newVersion = DB_VERSION + 1;

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, newVersion);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        for (const storeName of Object.keys(importData)) {
          const { schema } = importData[storeName];
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, {
              keyPath: schema.keyPath ?? undefined,
              autoIncrement: schema.autoIncrement,
            });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
    });

    // Import data into each store
    for (const storeName of Object.keys(importData)) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        for (const item of importData[storeName].data) {
          store.put(item);
        }

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    }

    console.log("Import completed successfully!");
  } catch (err) {
    console.error("Import failed:", err);
  } finally {
    setLoading(false);
  }
};
