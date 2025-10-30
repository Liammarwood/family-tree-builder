import { Edge, Node } from "reactflow";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { GENERATE_ID } from "@/libs/constants";

export interface ClipboardData {
  nodes: Node<FamilyNodeData>[];
  edges: Edge[];
}

/**
 * Copy selected nodes and only the edges that connect between the selected nodes
 * @param nodes All nodes in the tree
 * @param edges All edges in the tree
 * @returns ClipboardData containing selected nodes and their interlinking edges
 */
export function copySelectedNodes(
  nodes: Node<FamilyNodeData>[],
  edges: Edge[]
): ClipboardData | null {
  // Get selected nodes
  const selectedNodes = nodes.filter(node => node.selected);
  
  if (selectedNodes.length === 0) {
    return null;
  }
  
  // Create a set of selected node IDs for quick lookup
  const selectedNodeIds = new Set(selectedNodes.map(node => node.id));
  
  // Filter edges to only include those where both source and target are in selected nodes
  const interlinkingEdges = edges.filter(edge => 
    selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
  );
  
  return {
    nodes: selectedNodes,
    edges: interlinkingEdges
  };
}

/**
 * Paste clipboard data as new nodes with new IDs and recreated edges
 * @param clipboardData The data to paste
 * @param existingNodes Current nodes in the tree
 * @param offsetX Optional horizontal offset for pasted nodes (default 200)
 * @param offsetY Optional vertical offset for pasted nodes (default 200)
 * @returns Object containing new nodes and edges to add
 */
export function pasteClipboardData(
  clipboardData: ClipboardData,
  existingNodes: Node<FamilyNodeData>[],
  offsetX: number = 200,
  offsetY: number = 200
): { nodes: Node<FamilyNodeData>[]; edges: Edge[] } {
  // Create a mapping from old node IDs to new node IDs
  const idMapping = new Map<string, string>();
  
  // Generate new IDs for all nodes
  clipboardData.nodes.forEach(node => {
    idMapping.set(node.id, GENERATE_ID());
  });
  
  // Create new nodes with new IDs and offset positions
  const newNodes: Node<FamilyNodeData>[] = clipboardData.nodes.map(node => ({
    ...node,
    id: idMapping.get(node.id)!,
    data: {
      ...node.data,
      id: idMapping.get(node.id)!
    },
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    },
    selected: false // Deselect pasted nodes initially
  }));
  
  // Create new edges with updated source and target IDs
  const newEdges: Edge[] = clipboardData.edges
    .filter(edge => {
      const newSourceId = idMapping.get(edge.source);
      const newTargetId = idMapping.get(edge.target);
      return newSourceId && newTargetId;
    })
    .map(edge => {
      const newSourceId = idMapping.get(edge.source)!;
      const newTargetId = idMapping.get(edge.target)!;
      
      // Generate new edge ID based on the edge type and new node IDs
      let newEdgeId = edge.id;
      if (edge.id.startsWith('partner-')) {
        newEdgeId = `partner-${newSourceId}-${newTargetId}`;
      } else if (edge.id.startsWith('divorced-')) {
        newEdgeId = `divorced-${newSourceId}-${newTargetId}`;
      } else if (edge.id.startsWith('parent-')) {
        // Parent edge format is parent-{parent}-{child}
        newEdgeId = `parent-${newSourceId}-${newTargetId}`;
      }
      
      return {
        ...edge,
        id: newEdgeId,
        source: newSourceId,
        target: newTargetId,
        selected: false
      };
    });
  
  return {
    nodes: newNodes,
    edges: newEdges
  };
}
