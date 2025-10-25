import { Edge, Node } from "reactflow";


export type FamilyTreeSummary = {
  id: string;
  name: string;
};

export type FamilyTreeMeta = FamilyTreeSummary & {
  createdAt: number;
  updatedAt: number;
};

export type FamilyTreeObject = FamilyTreeMeta & {
    nodes: Node[];
    edges: Edge[];
}