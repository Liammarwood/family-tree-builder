"use client"
import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import { AvatarTypes, NodeComponentType } from "@/types/ConfigurationTypes"

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
  // export configuration
  exportTitle: string;
  setExportTitle: (title: string) => void;
  showDates: boolean;
  setShowDates: (show: boolean) => void;
  showTitleDates: boolean;
  setShowTitleDates: (show: boolean) => void;
  nameFontSize: number;
  setNameFontSize: (size: number) => void;
  titleFontSize: number;
  setTitleFontSize: (size: number) => void;
  dateFontSize: number;
  setDateFontSize: (size: number) => void;
  nodeComponentType: NodeComponentType;
  setNodeComponentType: (type: NodeComponentType) => void;
  titleDateFontSize: number;
  setTitleDateFontSize: (size: number) => void;
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
  const [exportTitle, setExportTitle] = useState<string>('');
  const [showDates, setShowDates] = useState<boolean>(true);
  const [nameFontSize, setNameFontSize] = useState<number>(16);
  const [titleFontSize, setTitleFontSize] = useState<number>(16);
  const [dateFontSize, setDateFontSize] = useState<number>(12);
  const [nodeComponentType, setNodeComponentType] = useState<NodeComponentType>('AltFamilyTreeNode');
  const [showTitleDates, setShowTitleDates] = useState<boolean>(true);
  const [titleDateFontSize, setTitleDateFontSize] = useState<number>(12);
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
      exportTitle,
      setExportTitle,
      showDates,
      setShowDates,
      nameFontSize,
      setNameFontSize,
      dateFontSize,
      setDateFontSize,
      nodeComponentType,
      setNodeComponentType,
      titleFontSize,
      setTitleFontSize,
      showTitleDates,
      setShowTitleDates,
      titleDateFontSize,
      setTitleDateFontSize
    }}>
      {children} {/* <-- must return children here */}
    </ConfigurationContext.Provider>
  );
};
