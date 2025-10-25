import React from "react";
import { useFamilyTree } from "@/hooks/useFamilyTree";

// FamilyTreeContext.tsx
const FamilyTreeContext = React.createContext<ReturnType<typeof useFamilyTree> | null>(null);

export const FamilyTreeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useFamilyTree();
  return <FamilyTreeContext.Provider value={value}>{children}</FamilyTreeContext.Provider>;
};

export const useFamilyTreeContext = () => {
  const ctx = React.useContext(FamilyTreeContext);
  if (!ctx) throw new Error("useFamilyTreeContext must be used within FamilyTreeProvider");
  return ctx;
};
