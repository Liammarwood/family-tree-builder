import {
  saveTreeToLocal,
  loadTreeFromLocal,
  removeAutosave,
  getAutosaveSavedAt,
  PersistedPayload,
} from '../storage';

describe('storage autosave functions', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveTreeToLocal', () => {
    it('saves tree data with version and timestamps', () => {
      const testData = { nodes: [], edges: [], id: 'test-tree' };
      const result = saveTreeToLocal(testData);
      
      expect(result).toBe(true);
      
      const saved = localStorage.getItem('family-tree-autosave:v1');
      expect(saved).not.toBeNull();
      
      const payload = JSON.parse(saved!) as PersistedPayload<typeof testData>;
      expect(payload.version).toBe(1);
      expect(payload.data).toEqual(testData);
      expect(payload.createdAt).toBeDefined();
      expect(payload.savedAt).toBeDefined();
    });
    
    it('preserves original createdAt on subsequent saves', () => {
      const testData = { nodes: [], edges: [], id: 'test-tree' };
      
      // First save
      saveTreeToLocal(testData);
      const firstSave = JSON.parse(localStorage.getItem('family-tree-autosave:v1')!) as PersistedPayload<typeof testData>;
      const originalCreatedAt = firstSave.createdAt;
      
      // Wait a bit and save again
      const updatedData = { ...testData, nodes: [{ id: '1' }] };
      saveTreeToLocal(updatedData);
      
      const secondSave = JSON.parse(localStorage.getItem('family-tree-autosave:v1')!) as PersistedPayload<typeof updatedData>;
      
      // createdAt should be preserved, savedAt should be different
      expect(secondSave.createdAt).toBe(originalCreatedAt);
      expect(secondSave.data).toEqual(updatedData);
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = saveTreeToLocal({ test: 'data' });
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Restore
      Storage.prototype.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadTreeFromLocal', () => {
    it('loads saved tree data', () => {
      const testData = { nodes: [], edges: [], id: 'test-tree' };
      saveTreeToLocal(testData);
      
      const loaded = loadTreeFromLocal<typeof testData>();
      
      expect(loaded).not.toBeNull();
      expect(loaded?.data).toEqual(testData);
      expect(loaded?.version).toBe(1);
    });

    it('returns null when no data exists', () => {
      const loaded = loadTreeFromLocal();
      expect(loaded).toBeNull();
    });

    it('handles JSON parse errors gracefully', () => {
      // Save invalid JSON
      localStorage.setItem('family-tree-autosave:v1', 'invalid json');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const loaded = loadTreeFromLocal();
      
      expect(loaded).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('removeAutosave', () => {
    it('removes autosave data from localStorage', () => {
      saveTreeToLocal({ test: 'data' });
      expect(localStorage.getItem('family-tree-autosave:v1')).not.toBeNull();
      
      removeAutosave();
      
      expect(localStorage.getItem('family-tree-autosave:v1')).toBeNull();
    });

    it('handles errors gracefully', () => {
      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = jest.fn(() => {
        throw new Error('Test error');
      });
      
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      removeAutosave();
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      // Restore
      Storage.prototype.removeItem = originalRemoveItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('getAutosaveSavedAt', () => {
    it('returns savedAt timestamp when data exists', () => {
      const testData = { test: 'data' };
      saveTreeToLocal(testData);
      
      const savedAt = getAutosaveSavedAt();
      
      expect(savedAt).not.toBeNull();
      expect(typeof savedAt).toBe('string');
      // Verify it's a valid ISO date string
      expect(new Date(savedAt!).toISOString()).toBe(savedAt);
    });

    it('returns null when no data exists', () => {
      const savedAt = getAutosaveSavedAt();
      expect(savedAt).toBeNull();
    });

    it('returns null on error', () => {
      localStorage.setItem('family-tree-autosave:v1', 'invalid');
      
      const savedAt = getAutosaveSavedAt();
      expect(savedAt).toBeNull();
    });
  });

  describe('JSON roundtrip', () => {
    it('correctly serializes and deserializes complex tree data', () => {
      const complexData = {
        id: 'tree-123',
        name: 'My Family',
        nodes: [
          { id: 'node-1', type: 'family', position: { x: 100, y: 200 }, data: { name: 'John' } },
          { id: 'node-2', type: 'family', position: { x: 300, y: 200 }, data: { name: 'Jane' } },
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'partner' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      saveTreeToLocal(complexData);
      const loaded = loadTreeFromLocal<typeof complexData>();
      
      expect(loaded?.data).toEqual(complexData);
    });
  });
});
