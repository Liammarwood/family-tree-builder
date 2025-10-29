import { handleExport, handleImport } from '@/libs/backup';
import { DB_NAME, STORE_NAME } from '@/libs/constants';

describe('backup helpers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // Mock URL helpers
    (global as any).URL.createObjectURL = jest.fn(() => 'blob://1');
    (global as any).URL.revokeObjectURL = jest.fn();
  });

  it('exports an existing record (calls createObjectURL and clicks anchor)', async () => {
    // Fake DB and store.get returning a record
    const fakeRecord = { id: 'tree-1', name: 'T' };

    (global as any).indexedDB = {
      open: jest.fn(() => {
        const req: any = {};
        setTimeout(() => {
          req.result = {
            transaction: () => ({
              objectStore: () => ({
                keyPath: 'id',
                autoIncrement: false,
                get: () => {
                  const r: any = {};
                  Object.defineProperty(r, 'onsuccess', {
                    set(fn: any) {
                      // call the provided onsuccess asynchronously so caller can set it
                      setTimeout(() => {
                        r.result = fakeRecord;
                        fn();
                      }, 0);
                    },
                  });
                  return r;
                },
              }),
            }),
          };
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
    };

    const clickSpy = jest.fn();
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(() => ({ href: '', download: '', click: clickSpy } as any));

    await handleExport('tree-1');

    expect((global as any).URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  it('throws NO_RECORD_FOUND when record missing', async () => {
    (global as any).indexedDB = {
      open: jest.fn(() => {
        const req: any = {};
        setTimeout(() => {
          req.result = {
            transaction: () => ({
              objectStore: () => ({
                keyPath: 'id',
                autoIncrement: false,
                get: () => {
                  const r: any = {};
                  Object.defineProperty(r, 'onsuccess', {
                    set(fn: any) {
                      setTimeout(() => {
                        r.result = undefined;
                        fn();
                      }, 0);
                    },
                  });
                  return r;
                },
              }),
            }),
          };
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
    };

    await expect(handleExport('tree-xyz')).rejects.toThrow('NO_RECORD_FOUND');
  });

  it('imports a file and calls reload on success', async () => {
    const importObj = {
      [STORE_NAME]: {
        schema: { keyPath: 'id', autoIncrement: false },
        data: [{ id: 'tree-1', name: 'T' }],
      },
    };

    const fakeFile = { text: async () => JSON.stringify(importObj) } as unknown as File;

    (global as any).indexedDB = {
      open: jest.fn(() => {
        const req: any = {};
        setTimeout(() => {
          req.result = {
            transaction: (_name: string, _mode: string) => {
              const t: any = {};
              setTimeout(() => {
                if (t.oncomplete) t.oncomplete();
              }, 0);
              return {
                objectStore: () => ({ put: (_r: any) => {} }),
                // allow test code to set t.oncomplete via the returned object
                set oncomplete(fn: any) { t.oncomplete = fn; },
                set onerror(fn: any) { t.onerror = fn; },
              };
            },
          };
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
    };

    // Make the transaction call oncomplete once put is called
    const reload = jest.fn();
    const setLoading = jest.fn();

    (global as any).indexedDB = {
      open: jest.fn(() => {
        const req: any = {};
        setTimeout(() => {
          req.result = {
            transaction: (_name: string, _mode: string) => {
              const t: any = {};
              const ret: any = {
                objectStore: () => ({ put: (_r: any) => {} }),
                set oncomplete(fn: any) { t.oncomplete = fn; },
                set onerror(fn: any) { t.onerror = fn; },
              };
              // call oncomplete asynchronously after the setter is attached
              setTimeout(() => {
                if (t.oncomplete) t.oncomplete();
              }, 0);
              return ret;
            },
          };
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
    };

    await handleImport(fakeFile, setLoading, reload);

    expect(reload).toHaveBeenCalled();
    // setLoading should have been toggled off at the end
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it('throws NO_DATA_IN_IMPORT when data array is empty', async () => {
    const importObj = {
      [STORE_NAME]: {
        schema: { keyPath: 'id', autoIncrement: false },
        data: [],
      },
    };

    const fakeFile = { text: async () => JSON.stringify(importObj) } as unknown as File;

    (global as any).indexedDB = {
      open: jest.fn(() => {
        const req: any = {};
        setTimeout(() => {
          req.result = { transaction: () => ({ objectStore: () => ({ put: (_: any) => {} }) }) };
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
    };

    const reload = jest.fn();
    const setLoading = jest.fn();

    await expect(handleImport(fakeFile, setLoading, reload)).rejects.toThrow('NO_DATA_IN_IMPORT');
    expect(setLoading).toHaveBeenCalledWith(false);
  });
});
