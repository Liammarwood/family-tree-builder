"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Available tree modes for the application
 * - family: Traditional family tree with parents, children, partners
 * - org: Organization chart with managers and reports
 * - generic: Generic tree structure
 */
export type Mode = 'family' | 'org' | 'generic';

/**
 * Mode context value containing current mode and setter
 */
type ModeContextType = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

/**
 * Provider component for mode context
 * Defaults to 'family' mode to preserve existing behavior
 */
export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('family');

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

/**
 * Hook to access and update the current mode
 * @throws Error if used outside ModeProvider
 */
export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

/**
 * Mode display names for UI
 */
export const MODE_LABELS: Record<Mode, string> = {
  family: 'Family Tree',
  org: 'Org Chart',
  generic: 'Generic Tree',
};
