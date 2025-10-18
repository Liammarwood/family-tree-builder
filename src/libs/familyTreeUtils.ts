// Utility types and functions for the family tree

import { FamilyTreeNode } from "../components/FamilyNode";
import {RelationshipEdge} from "../components/RelationshipEdge";
import { FamilyNodeData } from "@/types/FamilyNodeData"
import { Node } from "reactflow";

export const nodeTypes = { family: FamilyTreeNode };
export const edgeTypes = { partner: RelationshipEdge}
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export const initialRootId = "root"
export const initialNode: Node<FamilyNodeData> = {
  id: initialRootId,
  type: "family",
  position: { x: 0, y: 0 },
  data: {
    id: initialRootId,
    name: "Me",
    dob: "",
    countryOfBirth: "",
    gender: undefined,
    createdAt: Date.now(),
    children: [],
    parents: [],
    partners: [],
  },
};
