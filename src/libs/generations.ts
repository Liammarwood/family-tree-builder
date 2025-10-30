import { Node, Edge } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';
import { RelationshipType } from '@/types/RelationshipEdgeData';

/**
 * Calculate the generation level of each node relative to a selected node.
 * Positive values = ancestors (1 = parents, 2 = grandparents, etc.)
 * Negative values = descendants (-1 = children, -2 = grandchildren, etc.)
 * 0 = the selected node itself and its partners/siblings
 * 
 * @param nodes - All nodes in the tree
 * @param edges - All edges in the tree
 * @param selectedNodeId - The ID of the selected node
 * @returns Map of node ID to generation level
 */
export function calculateGenerationLevels(
  nodes: Node<FamilyNodeData>[],
  edges: Edge[],
  selectedNodeId: string
): Map<string, number> {
  const generationMap = new Map<string, number>();
  
  // Find the selected node
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) {
    return generationMap;
  }
  
  // Start with selected node at generation 0
  generationMap.set(selectedNodeId, 0);
  
  // Build adjacency map for parent-child relationships
  const parentToChildren = new Map<string, string[]>();
  const childToParents = new Map<string, string[]>();
  const partners = new Map<string, string[]>();
  const siblings = new Map<string, string[]>();
  
  edges.forEach(edge => {
    const relationship = edge.data?.relationship;
    
    if (relationship === RelationshipType.Parent) {
      // Parent edge: source is parent, target is child
      if (!parentToChildren.has(edge.source)) {
        parentToChildren.set(edge.source, []);
      }
      parentToChildren.get(edge.source)!.push(edge.target);
      
      if (!childToParents.has(edge.target)) {
        childToParents.set(edge.target, []);
      }
      childToParents.get(edge.target)!.push(edge.source);
    } else if (relationship === RelationshipType.Partner || 
               relationship === RelationshipType.Married ||
               relationship === RelationshipType.Divorced) {
      // Partner relationships
      if (!partners.has(edge.source)) {
        partners.set(edge.source, []);
      }
      partners.get(edge.source)!.push(edge.target);
      
      if (!partners.has(edge.target)) {
        partners.set(edge.target, []);
      }
      partners.get(edge.target)!.push(edge.source);
    } else if (relationship === RelationshipType.Sibling) {
      // Sibling relationships
      if (!siblings.has(edge.source)) {
        siblings.set(edge.source, []);
      }
      siblings.get(edge.source)!.push(edge.target);
      
      if (!siblings.has(edge.target)) {
        siblings.set(edge.target, []);
      }
      siblings.get(edge.target)!.push(edge.source);
    }
  });
  
  // BFS to find all ancestors (going up the tree)
  const visitedAncestors = new Set<string>([selectedNodeId]);
  let currentLevelAncestors = [selectedNodeId];
  let ancestorLevel = 0;
  
  while (currentLevelAncestors.length > 0) {
    const nextLevel: string[] = [];
    ancestorLevel++;
    
    for (const nodeId of currentLevelAncestors) {
      const parents = childToParents.get(nodeId) || [];
      
      for (const parentId of parents) {
        if (!visitedAncestors.has(parentId)) {
          visitedAncestors.add(parentId);
          generationMap.set(parentId, ancestorLevel);
          nextLevel.push(parentId);
          
          // Include partners of ancestors at the same generation
          const parentPartners = partners.get(parentId) || [];
          for (const partnerId of parentPartners) {
            if (!visitedAncestors.has(partnerId)) {
              visitedAncestors.add(partnerId);
              generationMap.set(partnerId, ancestorLevel);
              nextLevel.push(partnerId);
            }
          }
        }
      }
    }
    
    currentLevelAncestors = nextLevel;
  }
  
  // BFS to find all descendants (going down the tree)
  const visitedDescendants = new Set<string>([selectedNodeId]);
  let currentLevelDescendants = [selectedNodeId];
  let descendantLevel = 0;
  
  while (currentLevelDescendants.length > 0) {
    const nextLevel: string[] = [];
    descendantLevel--;
    
    for (const nodeId of currentLevelDescendants) {
      const children = parentToChildren.get(nodeId) || [];
      
      for (const childId of children) {
        if (!visitedDescendants.has(childId)) {
          visitedDescendants.add(childId);
          generationMap.set(childId, descendantLevel);
          nextLevel.push(childId);
          
          // Include partners of descendants at the same generation
          const childPartners = partners.get(childId) || [];
          for (const partnerId of childPartners) {
            if (!visitedDescendants.has(partnerId)) {
              visitedDescendants.add(partnerId);
              generationMap.set(partnerId, descendantLevel);
              nextLevel.push(partnerId);
            }
          }
        }
      }
    }
    
    currentLevelDescendants = nextLevel;
  }
  
  // Include siblings of selected node at generation 0
  const selectedSiblings = siblings.get(selectedNodeId) || [];
  for (const siblingId of selectedSiblings) {
    if (!generationMap.has(siblingId)) {
      generationMap.set(siblingId, 0);
      
      // Include partners of siblings at generation 0
      const siblingPartners = partners.get(siblingId) || [];
      for (const partnerId of siblingPartners) {
        if (!generationMap.has(partnerId)) {
          generationMap.set(partnerId, 0);
        }
      }
    }
  }
  
  // Include partners of selected node at generation 0
  const selectedPartners = partners.get(selectedNodeId) || [];
  for (const partnerId of selectedPartners) {
    if (!generationMap.has(partnerId)) {
      generationMap.set(partnerId, 0);
    }
  }
  
  return generationMap;
}

/**
 * Filter nodes and edges based on generation levels relative to a selected node.
 * 
 * @param nodes - All nodes in the tree
 * @param edges - All edges in the tree
 * @param selectedNodeId - The ID of the selected node
 * @param ancestorGenerations - Number of ancestor generations to show (0 = none, 1 = parents, 2 = grandparents, etc.)
 * @param descendantGenerations - Number of descendant generations to show (0 = none, 1 = children, 2 = grandchildren, etc.)
 * @returns Filtered nodes and edges
 */
export function filterByGenerationLevel(
  nodes: Node<FamilyNodeData>[],
  edges: Edge[],
  selectedNodeId: string | null,
  ancestorGenerations: number,
  descendantGenerations: number
): { nodes: Node<FamilyNodeData>[]; edges: Edge[] } {
  // If no node is selected or filtering is disabled (both values are 0 or negative), return all
  if (!selectedNodeId || (ancestorGenerations <= 0 && descendantGenerations <= 0)) {
    return { nodes, edges };
  }
  
  // Calculate generation levels
  const generationMap = calculateGenerationLevels(nodes, edges, selectedNodeId);
  
  // Filter nodes based on generation levels
  const filteredNodes = nodes.filter(node => {
    const generation = generationMap.get(node.id);
    if (generation === undefined) return false;
    
    // Keep nodes within the specified range
    // Ancestors have positive generation values
    // Descendants have negative generation values
    // Selected node and its partners/siblings have generation 0
    return generation <= ancestorGenerations && generation >= -descendantGenerations;
  });
  
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  
  // Filter edges to only include connections between visible nodes
  const filteredEdges = edges.filter(edge => {
    return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
  });
  
  return { nodes: filteredNodes, edges: filteredEdges };
}
