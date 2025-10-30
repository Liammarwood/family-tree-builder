import { Node, Edge } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';
import { RelationshipType } from '@/types/RelationshipEdgeData';

/**
 * Extended generation info including whether a node is a lateral sibling at that generation
 */
export type GenerationInfo = {
  generation: number;
  isSiblingAtGeneration: boolean; // True if this node is a sibling of someone at this generation (aunts/uncles/cousins)
};

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
 * Calculate extended generation information including sibling relationships at each generation.
 * This allows filtering to control whether to show aunts/uncles, great aunts/uncles, etc.
 * 
 * @param nodes - All nodes in the tree
 * @param edges - All edges in the tree
 * @param selectedNodeId - The ID of the selected node
 * @returns Map of node ID to GenerationInfo
 */
export function calculateExtendedGenerationInfo(
  nodes: Node<FamilyNodeData>[],
  edges: Edge[],
  selectedNodeId: string
): Map<string, GenerationInfo> {
  const generationInfoMap = new Map<string, GenerationInfo>();
  
  // Find the selected node
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) {
    return generationInfoMap;
  }
  
  // Start with selected node at generation 0
  generationInfoMap.set(selectedNodeId, { generation: 0, isSiblingAtGeneration: false });
  
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
  
  // Track which nodes are direct ancestors/descendants vs siblings
  const directLineage = new Set<string>([selectedNodeId]);
  
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
          directLineage.add(parentId);
          generationInfoMap.set(parentId, { generation: ancestorLevel, isSiblingAtGeneration: false });
          nextLevel.push(parentId);
          
          // Include partners of ancestors at the same generation (not siblings)
          const parentPartners = partners.get(parentId) || [];
          for (const partnerId of parentPartners) {
            if (!visitedAncestors.has(partnerId)) {
              visitedAncestors.add(partnerId);
              directLineage.add(partnerId);
              generationInfoMap.set(partnerId, { generation: ancestorLevel, isSiblingAtGeneration: false });
              nextLevel.push(partnerId);
            }
          }
          
          // Mark siblings of this ancestor (aunts/uncles at this generation)
          const ancestorSiblings = siblings.get(parentId) || [];
          for (const siblingId of ancestorSiblings) {
            if (!generationInfoMap.has(siblingId)) {
              generationInfoMap.set(siblingId, { generation: ancestorLevel, isSiblingAtGeneration: true });
              
              // Include partners of these siblings
              const siblingPartners = partners.get(siblingId) || [];
              for (const partnerId of siblingPartners) {
                if (!generationInfoMap.has(partnerId)) {
                  generationInfoMap.set(partnerId, { generation: ancestorLevel, isSiblingAtGeneration: true });
                }
              }
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
          directLineage.add(childId);
          generationInfoMap.set(childId, { generation: descendantLevel, isSiblingAtGeneration: false });
          nextLevel.push(childId);
          
          // Include partners of descendants at the same generation (not siblings)
          const childPartners = partners.get(childId) || [];
          for (const partnerId of childPartners) {
            if (!visitedDescendants.has(partnerId)) {
              visitedDescendants.add(partnerId);
              directLineage.add(partnerId);
              generationInfoMap.set(partnerId, { generation: descendantLevel, isSiblingAtGeneration: false });
              nextLevel.push(partnerId);
            }
          }
          
          // Mark siblings of this descendant (cousins at descendant level)
          const descendantSiblings = siblings.get(childId) || [];
          for (const siblingId of descendantSiblings) {
            if (!generationInfoMap.has(siblingId)) {
              generationInfoMap.set(siblingId, { generation: descendantLevel, isSiblingAtGeneration: true });
              
              // Include partners of these siblings
              const siblingPartners = partners.get(siblingId) || [];
              for (const partnerId of siblingPartners) {
                if (!generationInfoMap.has(partnerId)) {
                  generationInfoMap.set(partnerId, { generation: descendantLevel, isSiblingAtGeneration: true });
                }
              }
            }
          }
        }
      }
    }
    
    currentLevelDescendants = nextLevel;
  }
  
  // Include siblings of selected node at generation 0 (marked as siblings)
  const selectedSiblings = siblings.get(selectedNodeId) || [];
  for (const siblingId of selectedSiblings) {
    if (!generationInfoMap.has(siblingId)) {
      generationInfoMap.set(siblingId, { generation: 0, isSiblingAtGeneration: true });
      
      // Include partners of siblings at generation 0
      const siblingPartners = partners.get(siblingId) || [];
      for (const partnerId of siblingPartners) {
        if (!generationInfoMap.has(partnerId)) {
          generationInfoMap.set(partnerId, { generation: 0, isSiblingAtGeneration: true });
        }
      }
    }
  }
  
  // Include partners of selected node at generation 0 (not siblings)
  const selectedPartners = partners.get(selectedNodeId) || [];
  for (const partnerId of selectedPartners) {
    if (!generationInfoMap.has(partnerId)) {
      generationInfoMap.set(partnerId, { generation: 0, isSiblingAtGeneration: false });
    }
  }
  
  return generationInfoMap;
}

/**
 * Filter nodes and edges based on generation levels relative to a selected node.
 * 
 * @param nodes - All nodes in the tree
 * @param edges - All edges in the tree
 * @param selectedNodeId - The ID of the selected node
 * @param ancestorGenerations - Number of ancestor generations to show (0 = none, 1 = parents, 2 = grandparents, etc.)
 * @param descendantGenerations - Number of descendant generations to show (0 = none, 1 = children, 2 = grandchildren, etc.)
 * @param siblingGenerations - Number of sibling generation hops to show (0 = none, 1 = own siblings, 2 = aunts/uncles, 3 = great aunts/uncles, etc.). If undefined, shows all siblings.
 * @returns Filtered nodes and edges
 */
export function filterByGenerationLevel(
  nodes: Node<FamilyNodeData>[],
  edges: Edge[],
  selectedNodeId: string | null,
  ancestorGenerations: number,
  descendantGenerations: number,
  siblingGenerations?: number
): { nodes: Node<FamilyNodeData>[]; edges: Edge[] } {
  // If no node is selected or filtering is disabled (all values are 0 or negative), return all
  if (!selectedNodeId || (ancestorGenerations <= 0 && descendantGenerations <= 0 && (siblingGenerations === undefined || siblingGenerations <= 0))) {
    return { nodes, edges };
  }
  
  // If siblingGenerations is not specified, use the old simple calculation
  if (siblingGenerations === undefined) {
    // Calculate generation levels (old behavior)
    const generationMap = calculateGenerationLevels(nodes, edges, selectedNodeId);
    
    // Filter nodes based on generation levels
    const filteredNodes = nodes.filter(node => {
      const generation = generationMap.get(node.id);
      if (generation === undefined) return false;
      
      // Keep nodes within the specified range
      return generation <= ancestorGenerations && generation >= -descendantGenerations;
    });
    
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    
    // Filter edges to only include connections between visible nodes
    const filteredEdges = edges.filter(edge => {
      return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
    });
    
    return { nodes: filteredNodes, edges: filteredEdges };
  }
  
  // Calculate extended generation info to track siblings separately
  const generationInfoMap = calculateExtendedGenerationInfo(nodes, edges, selectedNodeId);
  
  // Filter nodes based on generation levels AND sibling status
  const filteredNodes = nodes.filter(node => {
    const info = generationInfoMap.get(node.id);
    if (info === undefined) return false;
    
    const { generation, isSiblingAtGeneration } = info;
    
    // Check if node is within ancestor/descendant range
    const withinGenerationRange = generation <= ancestorGenerations && generation >= -descendantGenerations;
    
    if (!withinGenerationRange) {
      return false;
    }
    
    // If it's not a sibling at this generation, always include it
    if (!isSiblingAtGeneration) {
      return true;
    }
    
    // If it's a sibling at this generation, check if we should include siblings at this level
    // siblingGenerations controls how many "hops" from direct lineage:
    // - siblingGenerations = 1: show siblings of selected person (gen 0)
    // - siblingGenerations = 2: show siblings of parents (gen 1) = aunts/uncles
    // - siblingGenerations = 3: show siblings of grandparents (gen 2) = great aunts/uncles
    const absGeneration = Math.abs(generation);
    return siblingGenerations > absGeneration;
  });
  
  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  
  // Filter edges to only include connections between visible nodes
  const filteredEdges = edges.filter(edge => {
    return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
  });
  
  return { nodes: filteredNodes, edges: filteredEdges };
}
