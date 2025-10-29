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
  // theme / styling
  nodeColor: string;
  setNodeColor: (c: string) => void;
  edgeColor: string;
  setEdgeColor: (c: string) => void;
  textColor: string;
  setTextColor: (c: string) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  nodeStyle: import('@/types/ConfigurationTypes').NodeStyle;
  setNodeStyle: (s: import('@/types/ConfigurationTypes').NodeStyle) => void;
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
  const [nodeColor, setNodeColor] = useState<string>('#ffffff');
  const [edgeColor, setEdgeColor] = useState<string>('#b1b1b7');
  const [textColor, setTextColor] = useState<string>('#5d4e37');
  const [fontFamily, setFontFamily] = useState<string>('Inter, Roboto, "Helvetica Neue", Arial');
  const [nodeStyle, setNodeStyle] = useState<import('@/types/ConfigurationTypes').NodeStyle>('card');

  const toggleHandles = () => {
    setShowHandles(!showHandles);
  }

  return (
    <ConfigurationContext.Provider value={{
      showHandles,
      toggleHandles,
      setShowHandles,
      objectStoreName,
      setObjectStoreName,
      setAvatarVariant,
      avatarVariant,
      nodeColor,
      setNodeColor,
      edgeColor,
      setEdgeColor,
      textColor,
      setTextColor,
      fontFamily,
      setFontFamily,
      nodeStyle,
      setNodeStyle,
    }}>
      {children} {/* <-- must return children here */}
    </ConfigurationContext.Provider>
  );
};
