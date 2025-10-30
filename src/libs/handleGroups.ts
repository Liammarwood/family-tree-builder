import { Node, Edge } from "reactflow";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { RelationshipType } from "@/types/RelationshipEdgeData";

/**
 * Represents a group of children that share the same set of parents.
 * Each group should have its own handle on the parent node.
 */
export type ChildHandleGroup = {
  /** Unique identifier for this handle group */
  handleId: string;
  /** IDs of children in this group */
  childIds: string[];
  /** The other parent ID (if any) that these children share */
  otherParentId?: string;
};

/**
 * Computes handle groups for children of a given parent node.
 * Children are grouped by their other parent - children with the same
 * two parents should connect to the same handle.
 * 
 * @param parentNodeId - The ID of the parent node
 * @param nodes - All nodes in the tree
 * @param edges - All edges in the tree
 * @returns Array of handle groups for this parent's children
 */
export function getChildHandleGroups(
  parentNodeId: string,
  nodes: Node<FamilyNodeData>[],
  edges: Edge[]
): ChildHandleGroup[] {
  // Find all children of this parent (edges where this node is the source)
  const childEdges = edges.filter(
    (edge) =>
      edge.source === parentNodeId &&
      edge.data?.relationship === RelationshipType.Parent
  );

  if (childEdges.length === 0) {
    return [];
  }

  // Group children by their other parent
  const groupsByOtherParent = new Map<string | undefined, string[]>();

  childEdges.forEach((edge) => {
    const childId = edge.target;
    
    // Find the child node
    const childNode = nodes.find((n) => n.id === childId);
    if (!childNode) return;

    // Find the child's other parent (not the current parent)
    const childParents = childNode.data.parents || [];
    const otherParent = childParents.find((p) => p !== parentNodeId);

    // Group by other parent (undefined if no other parent)
    const key = otherParent || "none";
    if (!groupsByOtherParent.has(key)) {
      groupsByOtherParent.set(key, []);
    }
    groupsByOtherParent.get(key)!.push(childId);
  });

  // Convert map to array of handle groups
  const groups: ChildHandleGroup[] = [];
  let groupIndex = 0;

  groupsByOtherParent.forEach((childIds, otherParentKey) => {
    groups.push({
      handleId: `child-${groupIndex}`,
      childIds,
      otherParentId: otherParentKey === "none" ? undefined : otherParentKey,
    });
    groupIndex++;
  });

  return groups;
}

/**
 * Gets the appropriate handle ID for a specific parent-child relationship.
 * 
 * @param parentNodeId - The ID of the parent node
 * @param childNodeId - The ID of the child node
 * @param nodes - All nodes in the tree
 * @param edges - All edges in the tree
 * @returns The handle ID to use for this parent-child edge
 */
export function getChildHandleId(
  parentNodeId: string,
  childNodeId: string,
  nodes: Node<FamilyNodeData>[],
  edges: Edge[]
): string {
  const groups = getChildHandleGroups(parentNodeId, nodes, edges);
  
  // Find which group this child belongs to
  const group = groups.find((g) => g.childIds.includes(childNodeId));
  
  return group ? group.handleId : "child-0";
}

/**
 * Validates that a node doesn't have more than 2 parents.
 * 
 * @param nodeId - The ID of the node to validate
 * @param nodes - All nodes in the tree
 * @returns true if valid (0-2 parents), false if invalid (>2 parents)
 */
export function validateMaxParents(
  nodeId: string,
  nodes: Node<FamilyNodeData>[]
): boolean {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return true;

  const parents = node.data.parents || [];
  return parents.length <= 2;
}
