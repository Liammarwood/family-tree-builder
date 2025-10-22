"use client"
import React, { createContext, useContext, useState, ReactNode, FC } from 'react';

interface ConfigurationState {
  showHandles: boolean;
  toggleHandles: () => void;
}

// Create context
const ConfigurationContext = createContext<ConfigurationState | undefined>(undefined);

// Hook to use context
export const useConfiguration = (): ConfigurationState => {
  const context = useContext(ConfigurationContext);
  if (!context) throw new Error('useConfiguration must be used within a ConfigurationProvider');
  return context;
};

// Provider
export const ConfigurationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [showHandles, setShowHandles] = useState<boolean>(true);

  const toggleHandles = () => {
    console.log("Toggling handles from", showHandles, "to", !showHandles);
    setShowHandles(!showHandles);
  }

  return (
    <ConfigurationContext.Provider value={{ showHandles, toggleHandles }}>
      {children} {/* <-- must return children here */}
    </ConfigurationContext.Provider>
  );
};
