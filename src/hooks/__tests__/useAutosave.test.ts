import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutosave } from '../useAutosave';
import * as storage from '../../libs/storage';

jest.mock('../../libs/storage');

describe('useAutosave', () => {
  const mockSaveTreeToLocal = storage.saveTreeToLocal as jest.MockedFunction<typeof storage.saveTreeToLocal>;
  const mockLoadTreeFromLocal = storage.loadTreeFromLocal as jest.MockedFunction<typeof storage.loadTreeFromLocal>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('initializes with isSaved as false (pending first save)', () => {
    const { result } = renderHook(() => useAutosave({ test: 'data' }));
    
    // Hook marks as unsaved on first render since tree changed from null to initial value
    expect(result.current.isSaved).toBe(false);
  });

  it('debounces saves when tree changes', async () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    
    const { result, rerender } = renderHook(
      ({ tree }) => useAutosave(tree, { debounceMs: 2000 }),
      { initialProps: { tree: { data: 'initial' } } }
    );
    
    // Tree changes
    rerender({ tree: { data: 'changed' } });
    
    // Should mark as unsaved immediately
    expect(result.current.isSaved).toBe(false);
    
    // Save should not happen immediately
    expect(mockSaveTreeToLocal).not.toHaveBeenCalled();
    
    // Fast-forward time past debounce
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Now save should have been called
    await waitFor(() => {
      expect(mockSaveTreeToLocal).toHaveBeenCalledWith({ data: 'changed' });
    });
  });

  it('saveNow triggers immediate save', async () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    
    const { result } = renderHook(() => useAutosave({ test: 'data' }));
    
    await act(async () => {
      const success = await result.current.saveNow();
      expect(success).toBe(true);
    });
    
    expect(mockSaveTreeToLocal).toHaveBeenCalledWith({ test: 'data' });
  });

  it('calls onSaved callback on successful save', async () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    const onSaved = jest.fn();
    
    const { result } = renderHook(() =>
      useAutosave({ test: 'data' }, { onSaved })
    );
    
    await act(async () => {
      await result.current.saveNow();
    });
    
    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({ savedAt: expect.any(String) })
    );
  });

  it('calls onError callback on save failure', async () => {
    mockSaveTreeToLocal.mockReturnValue(false);
    const onError = jest.fn();
    
    const { result } = renderHook(() =>
      useAutosave({ test: 'data' }, { onError })
    );
    
    await act(async () => {
      await result.current.saveNow();
    });
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Failed to save to localStorage' })
    );
  });

  it('suspend prevents saves', async () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    
    const { result, rerender } = renderHook(
      ({ tree }) => useAutosave(tree, { debounceMs: 1000 }),
      { initialProps: { tree: { data: 'initial' } } }
    );
    
    // Suspend saves
    act(() => {
      result.current.suspend();
    });
    
    // Change tree
    rerender({ tree: { data: 'changed' } });
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Save should not have happened
    expect(mockSaveTreeToLocal).not.toHaveBeenCalled();
  });

  it('resume allows saves again', async () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    
    const { result, rerender } = renderHook(
      ({ tree }) => useAutosave(tree, { debounceMs: 1000 }),
      { initialProps: { tree: { data: 'initial' } } }
    );
    
    // Suspend and resume
    act(() => {
      result.current.suspend();
      result.current.resume();
    });
    
    // Change tree
    rerender({ tree: { data: 'changed' } });
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Save should have happened
    await waitFor(() => {
      expect(mockSaveTreeToLocal).toHaveBeenCalledWith({ data: 'changed' });
    });
  });

  it('restoreIfPresent returns saved data', () => {
    const mockPayload = {
      version: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      savedAt: '2024-01-01T00:00:00.000Z',
      data: { test: 'restored' },
    };
    mockLoadTreeFromLocal.mockReturnValue(mockPayload);
    
    const { result } = renderHook(() => useAutosave({ test: 'current' }));
    
    const restored = result.current.restoreIfPresent();
    
    expect(restored).toEqual({ test: 'restored' });
  });

  it('restoreIfPresent returns null when no saved data', () => {
    mockLoadTreeFromLocal.mockReturnValue(null);
    
    const { result } = renderHook(() => useAutosave({ test: 'current' }));
    
    const restored = result.current.restoreIfPresent();
    
    expect(restored).toBeNull();
  });

  it('does not save when enabled is false', async () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    
    const { rerender } = renderHook(
      ({ tree }) => useAutosave(tree, { enabled: false, debounceMs: 1000 }),
      { initialProps: { tree: { data: 'initial' } } }
    );
    
    rerender({ tree: { data: 'changed' } });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(mockSaveTreeToLocal).not.toHaveBeenCalled();
  });

  it('does not autosave when requireManual is true', async () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    
    const { rerender } = renderHook(
      ({ tree }) => useAutosave(tree, { requireManual: true, debounceMs: 1000 }),
      { initialProps: { tree: { data: 'initial' } } }
    );
    
    rerender({ tree: { data: 'changed' } });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(mockSaveTreeToLocal).not.toHaveBeenCalled();
  });

  it('allows manual save even when requireManual is true', async () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    
    const { result } = renderHook(() =>
      useAutosave({ test: 'data' }, { requireManual: true })
    );
    
    await act(async () => {
      await result.current.saveNow();
    });
    
    expect(mockSaveTreeToLocal).toHaveBeenCalled();
  });

  it('uses custom isEqual function to avoid unnecessary saves', async () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    
    const isEqual = jest.fn((a, b) => a.id === b.id);
    
    const { rerender } = renderHook(
      ({ tree }) => useAutosave(tree, { isEqual, debounceMs: 1000 }),
      { initialProps: { tree: { id: 'same', value: 1 } } }
    );
    
    // Change value but keep same id
    rerender({ tree: { id: 'same', value: 2 } });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should not save because isEqual returned true
    expect(mockSaveTreeToLocal).not.toHaveBeenCalled();
  });

  it('clears pending timer on unmount', () => {
    mockSaveTreeToLocal.mockReturnValue(true);
    
    const { unmount, rerender } = renderHook(
      ({ tree }) => useAutosave(tree, { debounceMs: 2000 }),
      { initialProps: { tree: { data: 'initial' } } }
    );
    
    rerender({ tree: { data: 'changed' } });
    
    // Unmount before timer fires
    unmount();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Save should not have happened
    expect(mockSaveTreeToLocal).not.toHaveBeenCalled();
  });
});
