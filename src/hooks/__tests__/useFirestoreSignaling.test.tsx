import { useFirestoreSignaling } from '@/hooks/useFirestoreSignaling';

jest.mock('@/hooks/useError', () => ({
  useError: () => ({ showError: jest.fn() }),
}));

jest.mock('@/libs/logger', () => ({ logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() } }));

// Mock firebase/firestore to provide the functions used by the hook
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn((...args: any[]) => ({ id: args[args.length - 1] || 'generated-id' })),
  setDoc: jest.fn(() => Promise.resolve()),
  addDoc: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn((_ref: any, cb: any) => {
    // do nothing; return unsubscribe function
    return () => {};
  }),
  getDoc: jest.fn(() => Promise.resolve({ data: () => ({}) })),
  updateDoc: jest.fn(() => Promise.resolve()),
  getDocs: jest.fn(() => Promise.resolve({ docs: [], size: 0 })),
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  deleteDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(() => new Date()),
}));

describe('useFirestoreSignaling (unit)', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('throws and shows error when RTCPeerConnection is closed on createOffer', async () => {
    const { createOffer } = useFirestoreSignaling();

    const pc: any = { signalingState: 'closed' };

    await expect(createOffer(pc)).rejects.toThrow();
  });

  it('showError and returns when call doc has no offer on joinCall', async () => {
    const { joinCall } = useFirestoreSignaling();

    // Mock getDoc to return no offer
    const ff = require('firebase/firestore');
    ff.getDoc = jest.fn(() => Promise.resolve({ data: () => ({}) }));

    const pc: any = { onicecandidate: null };
    await expect(joinCall(pc, 'nonexistent')).resolves.toBeUndefined();
  });
});
