import React from 'react';
import { renderHook } from '@testing-library/react';
import { FamilyTreeProvider, useFamilyTreeContext } from '@/hooks/useFamilyTree';
import { ErrorProvider } from '@/hooks/useError';

// Provide a minimal mock for indexedDB.open used in the hook so it doesn't throw in tests
function mockIndexedDB() {
  const fakeDB = { close: () => {} };
  (global as any).indexedDB = {
    open: jest.fn(() => {
      const req: any = {};
      setTimeout(() => {
        req.result = fakeDB;
        if (req.onsuccess) req.onsuccess();
      }, 0);
      return req;
    })
  };
}

describe('useFamilyTree basic', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockIndexedDB();
  });

  it('provides context methods', async () => {
    const wrapper: React.FC<any> = ({ children }) => (
      <ErrorProvider>
        <FamilyTreeProvider>{children}</FamilyTreeProvider>
      </ErrorProvider>
    );
    const { result } = renderHook(() => useFamilyTreeContext(), { wrapper });

    expect(result.current).toHaveProperty('createTree');
    expect(result.current).toHaveProperty('saveTree');
    expect(result.current).toHaveProperty('deleteTree');
  });
});
