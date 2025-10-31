import { createContext, useContext, useState, ReactNode } from 'react';
import { ClipboardData } from '@/libs/clipboard';

interface ClipboardContextType {
  clipboard: ClipboardData | null;
  setClipboard: (data: ClipboardData | null) => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  return (
    <ClipboardContext.Provider value={{ clipboard, setClipboard }}>
      {children}
    </ClipboardContext.Provider>
  );
}

export function useClipboard() {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
}
