"use client"
import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import { AvatarTypes } from "@/types/ConfigurationTypes"

interface ConfigurationState {
  showHandles: boolean;
  setShowHandles: (show: boolean) => void;
  toggleHandles: () => void;
  objectStoreName: string;
  setObjectStoreName: (name: string) => void;
  avatarVariant: AvatarTypes;
  setAvatarVariant: (type: AvatarTypes) => void
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
  const [avatarVariant, setAvatarVariant] = useState<AvatarTypes>(AvatarTypes.Circular)
  const [objectStoreName, setObjectStoreName] = useState<string>("");

  const toggleHandles = () => {
    console.log("Toggling handles from", showHandles, "to", !showHandles);
    setShowHandles(!showHandles);
  }

  return (
    <ConfigurationContext.Provider value={{ showHandles, toggleHandles, setShowHandles, objectStoreName, setObjectStoreName, setAvatarVariant, avatarVariant }}>
      {children} {/* <-- must return children here */}
    </ConfigurationContext.Provider>
  );
};
