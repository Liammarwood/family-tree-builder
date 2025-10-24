"use client";

import { DB_NAME, LOCAL_STORAGE_SELECTED_TREE_KEY, NEW_TREE, STORE_NAME } from "@/libs/constants";
import {
    FamilyTreeMeta,
    FamilyTreeObject,
    FamilyTreeSummary
} from "@/types/FamilyTreeObject";
import { useState, useEffect, useCallback, SetStateAction } from "react";

export function useFamilyTree(dbName = DB_NAME, storeName = STORE_NAME) {
    // Tree list state
    const [trees, setTrees] = useState<FamilyTreeSummary[]>([]);
    const [selectedTreeId, _setSelectedTreeId] = useState<string | null>(null);

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
        }
    }, []);

    // Current tree data state
    const [currentTree, setCurrentTree] = useState<FamilyTreeObject | undefined>();
    const [isTreeLoaded, setIsTreeLoaded] = useState(false);

    // DB instance
    const [db, setDb] = useState<IDBDatabase | null>(null);

    // 🔹 Initialize IndexedDB
    useEffect(() => {
        const openRequest = indexedDB.open(dbName, 1);

        openRequest.onupgradeneeded = () => {
            const database = openRequest.result;
            if (!database.objectStoreNames.contains(storeName)) {
                database.createObjectStore(storeName, { keyPath: "id" });
            }
        };

        openRequest.onsuccess = () => setDb(openRequest.result);
        openRequest.onerror = (e) => console.error("IndexedDB error:", e);

        return () => {
            if (openRequest.result) {
                openRequest.result.close();
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
        if (!db) return;
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
            const result: FamilyTreeMeta[] = request.result;
            const summaries = result.map(({ id, name }) => ({ id, name }));
            setTrees(summaries);
        };

        request.onerror = () => console.error("Failed to load trees");
    }, [db, storeName]);

    useEffect(() => {
        loadTrees();
    }, [loadTrees]);

    // 🔹 Load current tree data when selectedTreeId changes
    useEffect(() => {
        console.log("Called")
        if (!db || !selectedTreeId) {
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
    }, [db, selectedTreeId, storeName]);

    // 🔹 Save current tree data
    const saveCurrentTree = useCallback(
        (newValue: SetStateAction<FamilyTreeObject>) => {
            if (!db || !selectedTreeId) return;

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
                store.put(treeToSave, selectedTreeId);
                console.log("Saved: ", selectedTreeId)

                tx.onerror = () => console.error("Failed to save tree");

                return treeToSave;
            });
        },
        [db, selectedTreeId, storeName]
    );

    // 🔹 Create a new tree
    const createTree = useCallback(
        (name: string) => {
            if (!db) return;

            const newTree: FamilyTreeObject = NEW_TREE(name);
            const tx = db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).add(newTree, newTree.id);

            tx.oncomplete = () => {
                setTrees((prev) => [...prev, { id: newTree.id, name: newTree.name }]);
                setSelectedTreeId(newTree.id);
                setCurrentTree(newTree);
            };

            tx.onerror = () => console.error("Failed to create tree");
        },
        [db, storeName]
    );

    // 🔹 Delete a tree
    const deleteTree = useCallback(
        (id: string) => {
            if (!db) return;

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
        [db, storeName, selectedTreeId]
    );

    // 🔹 Rename a tree
    const renameTree = useCallback(
        (id: string, newName: string) => {
            if (!db) return;

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
        [db, storeName, selectedTreeId]
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
        saveCurrentTree,
        isTreeLoaded,
    };
}