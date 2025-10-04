// Utility types and functions for the family tree

import FamilyNode from "../components/FamilyNode";

export type FamilyNodeType = {
  id: string;
  name: string;
  dob: string;
  parentId?: string;
  children: string[];
  generation: number;
  x?: number;
  y?: number;
};

export type FamilyTreeData = {
  [id: string]: FamilyNodeType;
};

export const nodeTypes = { family: FamilyNode };

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export const initialRootId = generateId();
export function getInitialTree(): FamilyTreeData {
  return {
    [initialRootId]: {
      id: initialRootId,
      name: "Root Person",
      dob: "",
      children: [],
      generation: 0,
    },
  };
}
