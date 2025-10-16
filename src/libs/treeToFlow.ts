// Converts FamilyTreeData to React Flow nodes and edges
import { Node, Edge } from "reactflow";
import { FamilyTreeData } from "./familyTreeUtils";

export function treeToFlow(tree: FamilyTreeData, selectedId: string | null) {
  const nodes: Node[] = Object.values(tree).map((node) => ({
    id: node.id,
    type: "family",
    data: { name: node.name, dob: node.dob },
    position: node.x !== undefined && node.y !== undefined ? { x: node.x, y: node.y } : { x: 250, y: 100 * Math.random() },
    selected: selectedId === node.id,
  }));

  const edges: Edge[] = [];
  Object.values(tree).forEach((node) => {
    // Parent-child edges
    node.children.forEach((childId) => {
      edges.push({
        id: `e-${node.id}-${childId}`,
        source: node.id,
        target: childId,
        markerEnd: undefined,
        type: "default",
      });
    });
    // No sibling edges: siblings are represented by shared parent->child relationships only
  });
  return { nodes, edges };
}
