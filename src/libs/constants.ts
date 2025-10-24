import DraggableEdge from "@/components/DraggableEdge";
import { FamilyTreeNode } from "@/components/FamilyNode";
import { RelationshipEdge } from "@/components/RelationshipEdge";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { Node } from "reactflow";

export const ParentRelationship = "Parent";
export const MarriedRelationship = "Married";
export const PartnerRelationship = "Partner";
export const DivorcedRelationship = "Divorced";
export const DB_NAME = "family-tree-builder";
export const STORE_NAME = "family-tree-store";
export const LOCAL_STORAGE_SELECTED_TREE_KEY = "selected-tree-id";
export const INITIAL_ROOT_ID = "root"
export const INITIAL_NODE: Node<FamilyNodeData> = {
    id: INITIAL_ROOT_ID,
    type: "family",
    position: { x: 0, y: 0 },
    data: {
        id: INITIAL_ROOT_ID,
        name: "Me",
        dateOfBirth: "",
        countryOfBirth: "",
        gender: undefined,
        createdAt: Date.now(),
        children: [],
        parents: [],
        partners: [],
    },
};
export const INITIAL_TREE = { nodes: [INITIAL_NODE], edges: [] };
export const NODE_TYPES = { family: FamilyTreeNode };
export const EDGE_TYPES = { partner: RelationshipEdge, draggable: DraggableEdge }
export function GENERATE_ID() {
    return Math.random().toString(36).substring(2, 9);
}
export const DEFAULT_TREE_NAME = "Family Tree";
export function NEW_TREE(name?: string) {
    return ({
        id: crypto.randomUUID(),
        name: name ?? DEFAULT_TREE_NAME,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nodes: [],
        edges: []
    }
    )
}
export const GRID_SIZE = 20;