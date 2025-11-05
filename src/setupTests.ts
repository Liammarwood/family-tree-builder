import '@testing-library/jest-dom';

// Set Firebase API key for tests
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyBS_SyGbSlojmIz9ys6dGMp5gMklqCf6rk';

// Mock crypto.randomUUID for tests
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  } as Crypto;
}
