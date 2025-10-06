import dagre from "dagre";
import { Node, Edge } from "reactflow";
import { NODE_WIDTH, NODE_HEIGHT } from "./FamilyNode";

export function getDagreLayout(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach((edge) => {
    // For partner edges, add a strong horizontal constraint
    if (edge.label === 'Partner') {
      dagreGraph.setEdge(edge.source, edge.target, { minlen: 1, weight: 100 });
    } else {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
      data: { ...node.data, autoPositioned: true },
    };
  });
}
