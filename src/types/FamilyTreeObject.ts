import { Edge, Node } from "reactflow";


export type FamilyTreeSummary = {
  id: string;
  name: string;
};

export type FamilyTreeMeta = FamilyTreeSummary & {
  createdAt: number;
  updatedAt: number;
};

import { ThemeConfig } from '@/types/ConfigurationTypes';

export type FamilyTreeObject = FamilyTreeMeta & {
  nodes: Node[];
  edges: Edge[];
  // Optional per-tree theme/configuration
  config?: ThemeConfig;
}