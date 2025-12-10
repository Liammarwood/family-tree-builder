import { AltFamilyTreeNode } from "@/components/reactflow/AltFamilyTreeNode";
import { FamilyTreeNode } from "@/components/reactflow/FamilyNode";
import { GenericNode } from "@/components/reactflow/GenericNode";
import DraggableEdge from "@/components/DraggableEdge";
import { RelationshipEdge } from "@/components/reactflow/RelationshipEdge";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { Node } from "reactflow";
import { NodeComponentType } from "@/types/ConfigurationTypes";
import { FamilyTreeEdge } from "@/components/reactflow/FamilyTreeEdge";

export const DB_VERSION = 1;
export const DB_NAME = "family-tree-builder";
export const STORE_NAME = "family-tree-store";
export const LOCAL_STORAGE_SELECTED_TREE_KEY = "selected-tree-id";
export const LOCAL_STORAGE_FIRST_VISIT_KEY = "has-visited-before";
export const NEW_TREE_OPTION_VALUE = "NEW";
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
// Use GenericNode as the default to support mode switching
export const NODE_TYPES = { family: GenericNode };
export const EDGE_TYPES = { partner: RelationshipEdge, family: FamilyTreeEdge, draggable: DraggableEdge }
export const getNodeTypes = (nodeComponentType: NodeComponentType) => ({
    family: nodeComponentType === 'FamilyTreeNode' ? FamilyTreeNode : AltFamilyTreeNode
});
export function GENERATE_ID() {
    // Use crypto.randomUUID for better performance and uniqueness
    return crypto.randomUUID();
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