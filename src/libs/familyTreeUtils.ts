// Utility types and functions for the family tree

import { FamilyTreeNode } from "../components/FamilyNode";

export type FamilyNodeType = {
  id: string;
  name: string;
  dob: string;
  countryOfBirth?: string;
  gender?: 'Male' | 'Female';
  occupation?: string;
  dod?: string; // date of death
  maidenName?: string;
  photo?: string; // URL or base64
  // Relationships
  parentIds?: string[]; // multiple parents
  children: string[];
  partners?: string[]; // partner node ids
  createdAt?: number;
  x?: number;
  y?: number;
};

export type FamilyTreeData = {
  [id: string]: FamilyNodeType;
};

export const nodeTypes = { family: FamilyTreeNode };

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export const initialRootId = generateId();
export function getInitialTree(): FamilyTreeData {
  return {
    [initialRootId]: {
      id: initialRootId,
      name: "Me",
      dob: "",
      countryOfBirth: "",
      gender: undefined,
      createdAt: Date.now(),
      children: [],
      parentIds: [],
      partners: [],
    },
  };
}

// Recursively compute generation for each node (root = 0)
export function computeGenerations(tree: FamilyTreeData): Record<string, number> {
  // Find root(s): nodes with no parentIds or empty parentIds
  const roots = Object.values(tree).filter(n => !n.parentIds || n.parentIds.length === 0);
  const generations: Record<string, number> = {};
  function dfs(node: FamilyNodeType, gen: number, visited = new Set<string>()) {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    generations[node.id] = gen;
    node.children.forEach(childId => {
      const child = tree[childId];
      if (child) dfs(child, gen + 1, visited);
    });
  }
  roots.forEach(root => dfs(root, 0));
  return generations;
}
