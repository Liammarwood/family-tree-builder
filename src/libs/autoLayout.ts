import ELK, { ElkNode } from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';
import { RelationshipType } from '@/types/RelationshipEdgeData';
import { NODE_WIDTH, NODE_HEIGHT, BASE_SPACING, PARTNER_SPACING } from './spacing';

const elk = new ELK();

/**
 * Auto-layout nodes and edges using ELK.js to create a hierarchical family tree.
 * 
 * Layout rules:
 * - Parents are positioned above their children
 * - Partners are positioned next to each other (horizontally) at the same Y level
 * - Siblings are positioned at the same Y level
 * - All nodes in the same generation are at the same Y level
 * - Nodes NEVER overlap each other
 * 
 * @param nodes - React Flow nodes with family data
 * @param edges - React Flow edges representing relationships
 * @returns Nodes with updated positions
 */
export async function autoLayoutFamilyTree(
  nodes: Node<FamilyNodeData>[],
  edges: Edge[]
): Promise<Node<FamilyNodeData>[]> {
  if (nodes.length === 0) {
    return nodes;
  }

  try {
    // Build ELK graph structure
    const elkNodes: ElkNode[] = nodes.map(node => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    }));

    // Build ELK edges - only use parent relationships for hierarchy
    // Partner and sibling relationships are handled by positioning constraints
    const elkEdges = edges
      .filter(edge => edge.data?.relationship === RelationshipType.Parent)
      .map(edge => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      }));

    const graph: ElkNode = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': String(BASE_SPACING),
        'elk.layered.spacing.nodeNodeBetweenLayers': String(NODE_HEIGHT + BASE_SPACING),
        'elk.layered.spacing.edgeNodeBetweenLayers': String(BASE_SPACING),
        'elk.layered.nodePlacement.strategy': 'SIMPLE',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        // Enable hierarchical port constraints for better parent-child alignment
        'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      },
      children: elkNodes,
      edges: elkEdges,
    };

    // Run layout algorithm
    const layoutedGraph = await elk.layout(graph);

    // Map positions back to React Flow nodes
    const layoutedNodes = nodes.map(node => {
      const elkNode = layoutedGraph.children?.find(n => n.id === node.id);
      
      if (elkNode && elkNode.x !== undefined && elkNode.y !== undefined) {
        return {
          ...node,
          position: {
            x: elkNode.x,
            y: elkNode.y,
          },
        };
      }
      
      return node;
    });

    // Post-process to ensure layout requirements:
    // 1. Identify generations and establish Y coordinates
    // 2. Adjust partner positions (same Y, proper X spacing)
    // 3. Align siblings to same Y
    // 4. Ensure all nodes in same generation have same Y
    // 5. Detect and resolve any node overlaps
    
    let adjustedNodes = [...layoutedNodes];
    
    // Calculate generations for all nodes
    const generations = calculateGenerations(adjustedNodes, edges);
    
    // Position partners together (highest priority)
    adjustedNodes = adjustPartnerPositions(adjustedNodes, edges);
    
    // Align siblings to the same Y coordinate within their generation
    adjustedNodes = alignSiblings(adjustedNodes, nodes, edges);
    
    // Ensure all nodes in the same generation have the same Y coordinate
    adjustedNodes = alignGenerations(adjustedNodes, generations);
    
    // Detect and resolve any node overlaps (HARD requirement)
    adjustedNodes = resolveCollisions(adjustedNodes);

    return adjustedNodes;
  } catch (error) {
    console.error('Auto-layout failed:', error);
    // Return original nodes if layout fails
    return nodes;
  }
}

/**
 * Calculate the generation level for each node based on parent relationships.
 * Generation 0 = nodes with no parents, Generation N = max(parent generations) + 1
 * 
 * IMPORTANT: Partners are always in the same generation, regardless of their parent relationships.
 */
function calculateGenerations(
  nodes: Node<FamilyNodeData>[],
  edges: Edge[]
): Map<string, number> {
  const generations = new Map<string, number>();
  
  // Build parent map from edges
  const parentMap = new Map<string, Set<string>>();
  edges
    .filter(edge => edge.data?.relationship === RelationshipType.Parent)
    .forEach(edge => {
      if (!parentMap.has(edge.target)) {
        parentMap.set(edge.target, new Set());
      }
      parentMap.get(edge.target)!.add(edge.source);
    });
  
  // Build partner map
  const partnerMap = new Map<string, Set<string>>();
  edges
    .filter(edge => edge.data?.relationship === RelationshipType.Partner || 
                    edge.data?.relationship === RelationshipType.Divorced)
    .forEach(edge => {
      if (!partnerMap.has(edge.source)) {
        partnerMap.set(edge.source, new Set());
      }
      if (!partnerMap.has(edge.target)) {
        partnerMap.set(edge.target, new Set());
      }
      partnerMap.get(edge.source)!.add(edge.target);
      partnerMap.get(edge.target)!.add(edge.source);
    });
  
  // Recursive function to calculate generation
  const getGeneration = (nodeId: string, visited = new Set<string>()): number => {
    if (generations.has(nodeId)) {
      return generations.get(nodeId)!;
    }
    
    // Prevent infinite loops
    if (visited.has(nodeId)) {
      return 0;
    }
    visited.add(nodeId);
    
    const parents = parentMap.get(nodeId);
    if (!parents || parents.size === 0) {
      // No parents - this is generation 0
      generations.set(nodeId, 0);
      return 0;
    }
    
    // Generation is 1 + max generation of parents
    const parentGenerations = Array.from(parents).map(parentId => 
      getGeneration(parentId, new Set(visited))
    );
    const generation = Math.max(...parentGenerations) + 1;
    generations.set(nodeId, generation);
    return generation;
  };
  
  // Calculate generation for all nodes
  nodes.forEach(node => getGeneration(node.id));
  
  // Adjust generations so partners are always in the same generation
  // Partners take the maximum generation of the pair
  partnerMap.forEach((partners, nodeId) => {
    const nodeGen = generations.get(nodeId) ?? 0;
    partners.forEach(partnerId => {
      const partnerGen = generations.get(partnerId) ?? 0;
      const maxGen = Math.max(nodeGen, partnerGen);
      generations.set(nodeId, maxGen);
      generations.set(partnerId, maxGen);
    });
  });
  
  return generations;
}

/**
 * Adjust positions of partners to be next to each other horizontally.
 * Partners should be at the same vertical level.
 */
function adjustPartnerPositions(
  nodes: Node<FamilyNodeData>[],
  edges: Edge[]
): Node<FamilyNodeData>[] {
  const adjustedNodes = [...nodes];
  const processed = new Set<string>();

  // Find all partner relationships
  const partnerEdges = edges.filter(
    edge => edge.data?.relationship === RelationshipType.Partner || 
            edge.data?.relationship === RelationshipType.Divorced
  );

  partnerEdges.forEach(edge => {
    const sourceNode = adjustedNodes.find(n => n.id === edge.source);
    const targetNode = adjustedNodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return;
    if (processed.has(edge.source) && processed.has(edge.target)) return;

    // Position partners next to each other
    // Use the leftmost node's Y position for both
    const leftNode = sourceNode.position.x < targetNode.position.x ? sourceNode : targetNode;
    const rightNode = leftNode === sourceNode ? targetNode : sourceNode;

    // Align Y positions - use average
    const avgY = (leftNode.position.y + rightNode.position.y) / 2;
    leftNode.position.y = avgY;
    rightNode.position.y = avgY;

    // Ensure proper horizontal spacing
    rightNode.position.x = leftNode.position.x + PARTNER_SPACING;

    processed.add(edge.source);
    processed.add(edge.target);
  });

  return adjustedNodes;
}

/**
 * Align siblings (nodes with the same parents) to the same Y coordinate.
 * Siblings should be at the same generation level horizontally.
 * 
 * IMPORTANT: Partners have highest priority and must stay directly adjacent.
 * When aligning siblings, nodes with partners should not be moved - instead,
 * siblings without partners should align to the Y position of siblings who have partners.
 */
function alignSiblings(
  nodes: Node<FamilyNodeData>[],
  originalNodes: Node<FamilyNodeData>[],
  edges: Edge[]
): Node<FamilyNodeData>[] {
  const adjustedNodes = [...nodes];
  
  // Identify all nodes that have partners
  const nodesWithPartners = new Set<string>();
  const partnerEdges = edges.filter(
    edge => edge.data?.relationship === RelationshipType.Partner || 
            edge.data?.relationship === RelationshipType.Divorced
  );
  
  partnerEdges.forEach(edge => {
    nodesWithPartners.add(edge.source);
    nodesWithPartners.add(edge.target);
  });
  
  // Group nodes by their parents to identify siblings
  const siblingGroups = new Map<string, string[]>();
  
  originalNodes.forEach(node => {
    if (node.data.parents && node.data.parents.length > 0) {
      // Create a key from sorted parent IDs to group siblings
      const parentKey = [...node.data.parents].sort().join(',');
      
      if (!siblingGroups.has(parentKey)) {
        siblingGroups.set(parentKey, []);
      }
      siblingGroups.get(parentKey)!.push(node.id);
    }
  });
  
  // For each sibling group, align siblings
  // Priority: Nodes with partners define the Y position, siblings without partners align to them
  siblingGroups.forEach((siblingIds) => {
    if (siblingIds.length > 1) {
      const siblings = adjustedNodes.filter(n => siblingIds.includes(n.id));
      
      if (siblings.length > 1) {
        // Separate siblings into those with partners and those without
        const siblingsWithPartners = siblings.filter(s => nodesWithPartners.has(s.id));
        
        let targetY: number;
        
        if (siblingsWithPartners.length > 0) {
          // If some siblings have partners, use their average Y position
          // (their positions were already set by adjustPartnerPositions)
          targetY = siblingsWithPartners.reduce((sum, node) => sum + node.position.y, 0) / siblingsWithPartners.length;
        } else {
          // If no siblings have partners, use average of all siblings
          targetY = siblings.reduce((sum, node) => sum + node.position.y, 0) / siblings.length;
        }
        
        // Align all siblings to the same Y (including those with partners)
        siblings.forEach(sibling => {
          sibling.position.y = targetY;
        });
      }
    }
  });
  
  return adjustedNodes;
}

/**
 * Align all nodes in the same generation to have the same Y coordinate.
 * This ensures that all nodes at the same hierarchical level are visually aligned.
 */
function alignGenerations(
  nodes: Node<FamilyNodeData>[],
  generations: Map<string, number>
): Node<FamilyNodeData>[] {
  const adjustedNodes = [...nodes];
  
  // Group nodes by generation
  const generationGroups = new Map<number, Node<FamilyNodeData>[]>();
  
  adjustedNodes.forEach(node => {
    const gen = generations.get(node.id) ?? 0;
    if (!generationGroups.has(gen)) {
      generationGroups.set(gen, []);
    }
    generationGroups.get(gen)!.push(node);
  });
  
  // For each generation, calculate the average Y and align all nodes
  generationGroups.forEach((genNodes) => {
    if (genNodes.length > 0) {
      // Calculate average Y position for this generation
      const avgY = genNodes.reduce((sum, node) => sum + node.position.y, 0) / genNodes.length;
      
      // Align all nodes in this generation to the same Y
      genNodes.forEach(node => {
        node.position.y = avgY;
      });
    }
  });
  
  return adjustedNodes;
}

/**
 * Detect and resolve node overlaps by adjusting X positions.
 * Nodes are considered overlapping if they are too close horizontally at the same Y level.
 * 
 * HARD REQUIREMENT: Nodes must NEVER overlap each other.
 */
function resolveCollisions(
  nodes: Node<FamilyNodeData>[]
): Node<FamilyNodeData>[] {
  const adjustedNodes = [...nodes];
  
  // Group nodes by Y position (with small tolerance for floating point comparison)
  const yTolerance = 5; // pixels
  const rowGroups = new Map<number, Node<FamilyNodeData>[]>();
  
  adjustedNodes.forEach(node => {
    // Round Y to nearest tolerance to group nodes in same row
    const roundedY = Math.round(node.position.y / yTolerance) * yTolerance;
    if (!rowGroups.has(roundedY)) {
      rowGroups.set(roundedY, []);
    }
    rowGroups.get(roundedY)!.push(node);
  });
  
  // For each row, sort nodes by X position and resolve overlaps
  rowGroups.forEach(rowNodes => {
    if (rowNodes.length <= 1) return;
    
    // Sort nodes by X position
    rowNodes.sort((a, b) => a.position.x - b.position.x);
    
    // Detect and resolve overlaps by spreading nodes apart
    for (let i = 0; i < rowNodes.length - 1; i++) {
      const currentNode = rowNodes[i];
      const nextNode = rowNodes[i + 1];
      
      const currentRight = currentNode.position.x + NODE_WIDTH;
      const nextLeft = nextNode.position.x;
      const gap = nextLeft - currentRight;
      
      if (gap < BASE_SPACING) {
        // Nodes are too close or overlapping
        // Push the next node (and all subsequent nodes) to the right
        const adjustment = BASE_SPACING - gap;
        
        for (let j = i + 1; j < rowNodes.length; j++) {
          rowNodes[j].position.x += adjustment;
        }
      }
    }
  });
  
  return adjustedNodes;
}
