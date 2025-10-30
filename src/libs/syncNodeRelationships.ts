import { Node, Edge } from "reactflow";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { RelationshipType } from "@/types/RelationshipEdgeData";

/**
 * Synchronizes the parents, children, and partners arrays in node data
 * based on the current edges in the tree.
 * 
 * This ensures consistency between edge relationships and node data arrays.
 * 
 * @param nodes - All nodes in the tree
 * @param edges - All edges in the tree
 * @returns Updated nodes with synchronized relationship arrays
 */
export function syncNodeRelationships(
  nodes: Node<FamilyNodeData>[],
  edges: Edge[]
): Node<FamilyNodeData>[] {
  // Create maps to track relationships
  const parentMap = new Map<string, Set<string>>(); // nodeId -> Set of parent IDs
  const childMap = new Map<string, Set<string>>(); // nodeId -> Set of child IDs
  const partnerMap = new Map<string, Set<string>>(); // nodeId -> Set of partner IDs

  // Initialize maps for all nodes
  nodes.forEach((node) => {
    parentMap.set(node.id, new Set());
    childMap.set(node.id, new Set());
    partnerMap.set(node.id, new Set());
  });

  // Process edges to build relationship maps
  edges.forEach((edge) => {
    const { source, target, data } = edge;
    
    if (!data?.relationship) return;

    switch (data.relationship) {
      case RelationshipType.Parent:
        // Parent edge: source is parent, target is child
        childMap.get(source)?.add(target);
        parentMap.get(target)?.add(source);
        break;
      
      case RelationshipType.Partner:
      case RelationshipType.Divorced:
        // Partner/Divorced edge: bidirectional relationship
        partnerMap.get(source)?.add(target);
        partnerMap.get(target)?.add(source);
        break;
    }
  });

  // Update node data with synchronized arrays
  return nodes.map((node) => {
    const parents = Array.from(parentMap.get(node.id) || []);
    const children = Array.from(childMap.get(node.id) || []);
    const partners = Array.from(partnerMap.get(node.id) || []);

    return {
      ...node,
      data: {
        ...node.data,
        parents: parents.length > 0 ? parents : undefined,
        children: children.length > 0 ? children : undefined,
        partners: partners.length > 0 ? partners : undefined,
      },
    };
  });
}

/**
 * Validates that adding a parent relationship won't exceed the 2-parent limit.
 * 
 * @param childId - The ID of the child node
 * @param parentId - The ID of the parent to add
 * @param nodes - All nodes in the tree
 * @returns { valid: boolean, error?: string }
 */
export function validateParentAddition(
  childId: string,
  parentId: string,
  nodes: Node<FamilyNodeData>[]
): { valid: boolean; error?: string } {
  const childNode = nodes.find((n) => n.id === childId);
  
  if (!childNode) {
    return { valid: false, error: "Child node not found" };
  }

  const currentParents = childNode.data.parents || [];
  
  // Check if parent already exists
  if (currentParents.includes(parentId)) {
    return { valid: false, error: "This parent relationship already exists" };
  }

  // Check if adding this parent would exceed the limit
  if (currentParents.length >= 2) {
    return {
      valid: false,
      error: "Cannot add more than 2 parents to a node",
    };
  }

  return { valid: true };
}
