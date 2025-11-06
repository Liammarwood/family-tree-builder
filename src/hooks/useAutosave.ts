import { useEffect, useRef, useState, useCallback } from "react";
import { saveTreeToLocal, loadTreeFromLocal } from "@/libs/storage";

type Options<T> = {
  debounceMs?: number;
  enabled?: boolean;
  onError?: (err: Error) => void;
  onSaved?: (payload: { savedAt: string }) => void;
  // If true, don't autosave until user manually triggers save
  requireManual?: boolean;
  // Optional function to compare previous and next tree (fast/optimize)
  isEqual?: (a: T, b: T) => boolean;
};

export function useAutosave<T>(
  tree: T,
  options: Options<T> = {}
): {
  isSaved: boolean;
  saveNow: () => Promise<boolean>;
  restoreIfPresent: () => T | null;
  suspend: () => void;
  resume: () => void;
} {
  const {
    debounceMs = 2000,
    enabled = true,
    onError,
    onSaved,
    requireManual = false,
    isEqual,
  } = options;

  const [isSaved, setIsSaved] = useState(true);
  const suspendedRef = useRef(false);
  const prevTreeRef = useRef<T | null>(null);
  const timerRef = useRef<number | null>(null);

  const doSave = useCallback(async (): Promise<boolean> => {
    try {
      const ok = saveTreeToLocal(tree);
      if (ok) {
        setIsSaved(true);
        onSaved?.({ savedAt: new Date().toISOString() });
      } else {
        onError?.(new Error("Failed to save to localStorage"));
        setIsSaved(false);
      }
      return ok;
    } catch (err) {
      onError?.(err as Error);
      setIsSaved(false);
      return false;
    }
  }, [tree, onError, onSaved]);

  const saveNow = useCallback(async () => {
    if (suspendedRef.current) return false;
    if (!enabled) return false;
    if (requireManual) {
      // allow manual save even if requireManual is true
    }
    // clear any pending timer
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsSaved(false);
    const res = await doSave();
    return res;
  }, [doSave, enabled, requireManual]);

  const suspend = useCallback(() => {
    suspendedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    suspendedRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (suspendedRef.current) return;
    if (requireManual) return;
    const prev = prevTreeRef.current;
    if (prev && isEqual?.(prev, tree)) {
      prevTreeRef.current = tree;
      return;
    }
    // Only schedule a save if tree changed
    const schedule = () => {
      setIsSaved(false);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        if (suspendedRef.current) return;
        doSave();
        timerRef.current = null;
      }, debounceMs);
    };
    schedule();
    prevTreeRef.current = tree;
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [tree, debounceMs, enabled, doSave, requireManual, isEqual]);

  const restoreIfPresent = useCallback(() => {
    const payload = loadTreeFromLocal<T>();
    return payload?.data ?? null;
  }, []);

  return {
    isSaved,
    saveNow,
    restoreIfPresent,
    suspend,
    resume,
  };
}
