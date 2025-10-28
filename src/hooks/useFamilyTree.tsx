"use client";

import { DB_NAME, LOCAL_STORAGE_SELECTED_TREE_KEY, NEW_TREE, STORE_NAME } from "@/libs/constants";
import {
    FamilyTreeMeta,
    FamilyTreeObject,
    FamilyTreeSummary
} from "@/types/FamilyTreeObject";
import { useState, useEffect, useCallback, SetStateAction } from "react";
import { useError } from "./useError";
import React from "react";

function useFamilyTree(dbName = DB_NAME, storeName = STORE_NAME) {
    // Tree list state
    const [trees, setTrees] = useState<FamilyTreeSummary[]>([]);
    const [selectedTreeId, _setSelectedTreeId] = useState<string | null>(null);
    const { showError } = useError();

    const setSelectedTreeId = useCallback((id: string | null) => {
        setIsTreeLoaded(false);
        if (id) {
            localStorage.setItem(LOCAL_STORAGE_SELECTED_TREE_KEY, id);
        }
        _setSelectedTreeId(id);
    }, []);

    // Load selectedTreeId after mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(LOCAL_STORAGE_SELECTED_TREE_KEY);
            if (stored) _setSelectedTreeId(stored);
        } else {
            _setSelectedTreeId(trees[0]?.id);
        }
    }, [trees]);

    // Current tree data state
    const [currentTree, setCurrentTree] = useState<FamilyTreeObject | undefined>();
    const [isTreeLoaded, setIsTreeLoaded] = useState(false);

    // DB instance and ready state
    const [db, setDb] = useState<IDBDatabase | null>(null);
    const [isDbReady, setIsDbReady] = useState(false);

    // 🔹 Initialize IndexedDB
    useEffect(() => {
        let dbInstance: IDBDatabase | null = null;

        const openDB = () => {
            const openRequest = indexedDB.open(dbName, 1);

            openRequest.onupgradeneeded = () => {
                const db = openRequest.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: "id" });
                }
            };

            openRequest.onsuccess = () => {
                dbInstance = openRequest.result;
                setDb(dbInstance);
                setIsDbReady(true);
            };

            openRequest.onerror = (e) => {
                console.error("IndexedDB error:", e);
                setIsDbReady(false);
            };
        };

        openDB();

        return () => {
            if (dbInstance) {
                dbInstance.close();
                setIsDbReady(false);
            }
        };
    }, [dbName, storeName]);


    useEffect(() => {
        if (selectedTreeId && !trees.some(t => t.id === selectedTreeId)) {
            setSelectedTreeId(null);
        }
    }, [trees, selectedTreeId, setSelectedTreeId]);

    // 🔹 Load tree summaries
    const loadTrees = useCallback(() => {
        if (!db || !isDbReady) return;
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
            const result: FamilyTreeMeta[] = request.result;
            const summaries = result.map(({ id, name }) => ({ id, name }));
            setTrees(summaries);
        };

        request.onerror = () => console.error("Failed to load trees");
    }, [db, isDbReady, storeName]);

    useEffect(() => {
        loadTrees();
    }, [loadTrees]);

    // 🔹 Load current tree data when selectedTreeId changes
    useEffect(() => {
        console.log("Called")
        if (!db || !isDbReady || !selectedTreeId) {
            setCurrentTree(undefined);
            setIsTreeLoaded(true);
            console.log("failed")
            return;
        }

        setIsTreeLoaded(false);
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const request = store.get(selectedTreeId);

        request.onsuccess = () => {
            const result = request.result as FamilyTreeObject | undefined;
            console.log(result)
            setCurrentTree(result);
            setIsTreeLoaded(true);

        };

        request.onerror = () => {
            console.error("Failed to load tree data");
            setCurrentTree(NEW_TREE());
            setIsTreeLoaded(true);
        };
    }, [db, isDbReady, selectedTreeId, storeName]);

    // Save current tree data
    const saveTree = useCallback(
        (newValue: SetStateAction<FamilyTreeObject>) => {
            if (!db || !isDbReady) {
                showError("Database not initialized yet. Please wait a moment and try again.");
                return;
            }

            if (selectedTreeId) {
                setCurrentTree((prev) => {
                    const next =
                        typeof newValue === "function"
                            ? (newValue as (prev?: FamilyTreeObject) => FamilyTreeObject)(prev)
                            : newValue;

                    // Ensure the tree has the correct ID and updated timestamp
                    const treeToSave = {
                        ...next,
                        id: selectedTreeId,
                        updatedAt: Date.now(),
                    };

                    // Save to IndexedDB
                    const tx = db.transaction(storeName, "readwrite");
                    const store = tx.objectStore(storeName);
                    store.put(treeToSave);
                    console.log("Saved: ", selectedTreeId)

                    tx.onerror = () => console.error("Failed to save tree");

                    return treeToSave;
                });
            } else {
                // Handle function case properly
                setCurrentTree((prev) => {
                    const next =
                        typeof newValue === "function"
                            ? (newValue as (prev?: FamilyTreeObject) => FamilyTreeObject)(prev)
                            : newValue;

                    // Ensure the tree has the correct ID and updated timestamp
                    const treeToSave = {
                        ...next,
                        updatedAt: Date.now(),
                    };

                    // Save to IndexedDB
                    const tx = db.transaction(storeName, "readwrite");
                    const store = tx.objectStore(storeName);
                    store.put(treeToSave);
                    console.log("Saved: ", treeToSave.id)

                    tx.oncomplete = () => {
                        // Update trees list after successful save
                        loadTrees();
                    };

                    tx.onerror = () => console.error("Failed to save tree");

                    setSelectedTreeId(treeToSave.id ?? null);

                    return treeToSave;
                });
            }
        },
        [db, isDbReady, selectedTreeId, storeName, setSelectedTreeId, loadTrees, showError]
    );

    // Create a new tree
    const createTree = useCallback(
        (name: string) => {
            if (!db || !isDbReady) {
                showError("Database not initialized yet. Please wait a moment and try again.");
                return;
            }

            const newTree: FamilyTreeObject = NEW_TREE(name);
            const tx = db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).add(newTree);

            tx.oncomplete = () => {
                setTrees((prev) => [...prev, { id: newTree.id, name: newTree.name }]);
                setSelectedTreeId(newTree.id);
                setCurrentTree(newTree);
            };

            tx.onerror = () => console.error("Failed to create tree");
        },
        [db, isDbReady, storeName, setSelectedTreeId, showError]
    );

    // Delete a tree
    const deleteTree = useCallback(
        (id: string) => {
            if (!db || !isDbReady) {
                showError("Database not initialized yet. Please wait a moment and try again.");
                return;
            }

            const tx = db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).delete(id);

            tx.oncomplete = () => {
                setTrees((prev) => prev.filter((t) => t.id !== id));
                if (selectedTreeId === id) {
                    setSelectedTreeId(null);
                    setCurrentTree(undefined);
                }
            };

            tx.onerror = () => console.error("Failed to delete tree");
        },
        [db, isDbReady, storeName, selectedTreeId, setSelectedTreeId, showError]
    );

    // Rename a tree
    const renameTree = useCallback(
        (id: string, newName: string) => {
            if (!db || !isDbReady) {
                showError("Database not initialized yet. Please wait a moment and try again.");
                return;
            }

            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            const getReq = store.get(id);

            getReq.onsuccess = () => {
                const tree = getReq.result as FamilyTreeObject;
                if (!tree) return;

                const updated = { ...tree, name: newName, updatedAt: Date.now() };
                store.put(updated);

                setTrees((prev) =>
                    prev.map((t) => (t.id === id ? { id, name: newName } : t))
                );

                // Update current tree if it's the one being renamed
                if (selectedTreeId === id) {
                    setCurrentTree(updated);
                }
            };

            getReq.onerror = () => console.error("Failed to rename tree");
        },
        [db, isDbReady, storeName, selectedTreeId, showError]
    );

    return {
        // Tree list management
        trees,
        selectedTreeId,
        setSelectedTreeId,
        createTree,
        deleteTree,
        renameTree,
        reloadTrees: loadTrees,

        // Current tree data
        currentTree,
        saveTree,
        isTreeLoaded,
        isDbReady,
    };
}

const FamilyTreeContext = React.createContext<ReturnType<typeof useFamilyTree> | null>(null);

export const FamilyTreeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useFamilyTree();
  return <FamilyTreeContext.Provider value={value}>{children}</FamilyTreeContext.Provider>;
};

export const useFamilyTreeContext = () => {
  const ctx = React.useContext(FamilyTreeContext);
  if (!ctx) throw new Error("useFamilyTreeContext must be used within FamilyTreeProvider");
  return ctx;
};