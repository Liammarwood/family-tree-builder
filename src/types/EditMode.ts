import { FamilyNodeData } from "@/types/FamilyNodeData";

export type EditMode = { 
  type: "edit" | "add";
  nodeId?: string 
  relation?: "parent" | "sibling" | "child" | "partner" | "divorced-partner"
  nodeData?: FamilyNodeData
};