
export type EditMode = { 
  type: "edit" | "add";
  nodeId?: string 
  relation?: "parent" | "sibling" | "child" | "partner" | "divorced-partner"
};