import ELK from "elkjs/lib/elk.bundled.js";
import { Node, Edge } from "reactflow";
import { NODE_WIDTH, NODE_HEIGHT, BASE_SPACING, PARTNER_SPACING, SIBLING_SPACING } from '@/libs/spacing';

// Use the bundled version of ELK (no web worker)
const elk = new ELK();

// Helper to group nodes by relationship type
function getGroups(nodes: Node[], edges: Edge[], label: string): string[][] {
  const groups: string[][] = [];
  const visited = new Set<string>();
  nodes.forEach((node: Node) => {
    if (visited.has(node.id)) return;
    const group: string[] = [node.id];
    edges.forEach((edge: Edge) => {
      if (edge.label === label && (edge.source === node.id || edge.target === node.id)) {
        const other = edge.source === node.id ? edge.target : edge.source;
        if (!group.includes(other)) group.push(other);
      }
    });
    group.forEach((id: string) => visited.add(id));
    if (group.length > 1) groups.push(group);
  });
  return groups;
}

/**
 * getElkLayout
 * - nodes, edges: React Flow Node/Edge arrays
 */
export async function getElkLayout(
  nodes: Node[],
  edges: Edge[]) {
  // Build base elk graph
  const elkGraph: any = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      // spacing tuned for family trees
      "elk.spacing.nodeNode": String(BASE_SPACING),
      "elk.layered.spacing.nodeNodeBetweenLayers": String(BASE_SPACING),
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES"
    },
    children: nodes.map(node => ({
      id: node.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      properties: {
        // hint to keep partners/siblings aligned on the same rank
        isFamilyNode: true
      }
    })),
    edges: [] as any[],
  };

  // We'll add invisible constraint nodes (dummy) to force same-rank alignment horizontally
  let dummyCounter = 0;
  function addAlignmentDummy(group: string[], kind: 'partner' | 'sibling') {
    // Create a thin dummy node that acts as an anchor for group members
    const id = `__align_${kind}_${dummyCounter++}`;
    elkGraph.children.push({ id, width: 1, height: 1, layoutOptions: { "elk.node.mergeEdges": "true" } });
    group.forEach(memberId => {
      elkGraph.edges.push({
        id: `e_${id}_${memberId}`,
        sources: [id],
        targets: [memberId],
        // use high priority so ELK keeps these nearby on same layer
        layoutOptions: {
          "elk.layered.priority.direction": "1000",
          "elk.edge.thickness": "0.1",
          // prefer orthogonal short edges
          "edgeRouting": "ORTHOGONAL"
        }
      });
    });
  }

  // Partners: group by partner edges
  const partnerGroups = getGroups(nodes, edges, "Partner");
  partnerGroups.forEach(g => {
    if (g.length > 1) addAlignmentDummy(g, 'partner');
  });

  // Siblings: group nodes that share the same set of parents
  const parentMap: Record<string, string[]> = {};
  edges.forEach((edge: Edge) => {
    if (edge.label === 'Parent') {
      // edge.source is parent, edge.target is child (per app code)
      if (!parentMap[edge.target]) parentMap[edge.target] = [];
      parentMap[edge.target].push(edge.source);
    }
  });
  const siblingGroups: Record<string, string[]> = {};
  Object.entries(parentMap).forEach(([child, parents]) => {
    const key = parents.slice().sort().join('|');
    if (!siblingGroups[key]) siblingGroups[key] = [];
    siblingGroups[key].push(child);
  });
  Object.values(siblingGroups).forEach(group => {
    if (group.length > 1) addAlignmentDummy(group, 'sibling');
  });

  // Add explicit ELK edges for parent->child relationships
  edges.forEach((edge: Edge) => {
    if (edge.label === 'Parent') {
      elkGraph.edges.push({
        id: `p_${edge.source}_${edge.target}`,
        sources: [edge.source],
        targets: [edge.target],
        layoutOptions: {
          // parents should be placed before children (higher in TB)
          "elk.layered.priority.direction": "1",
          // use port constraint to ensure parent is above child (south -> north)
          "elk.edge.sourcePort": "SOUTH",
          "elk.edge.targetPort": "NORTH",
        }
      });
    }
  });

  // Also add lower-priority edges for partner/sibling relationships so ELK considers them
  edges.forEach((edge: Edge) => {
    if (edge.label === 'Partner' || edge.label === 'Sibling') {
      elkGraph.edges.push({
        id: `r_${edge.source}_${edge.target}`,
        sources: [edge.source],
        targets: [edge.target],
        layoutOptions: {
          "elk.layered.priority.direction": "500",
        }
      });
    }
  });

  // Run ELK layout with a try/catch fallback
  let layout: any;
  try {
    layout = await elk.layout(elkGraph);
  } catch (err) {
    console.error('ELK layout failed', err);
    // Return original nodes unchanged
    return nodes.map(n => ({ ...n, data: { ...n.data, autoPositioned: false } }));
  }

  // Build a map for quick lookup (ELK nests nodes under layout.children)
  const nodeMap = new Map<string, any>();
  (layout.children || []).forEach((c: any) => nodeMap.set(c.id, c));

  // ELK coordinates refer to top-left of node box; convert to center-based React Flow coordinates
  // Convert elk nodes to positions
  const positioned: { [id: string]: { x: number; y: number; width: number; height: number } } = {};
  nodes.forEach((node: Node) => {
    const ln = nodeMap.get(node.id);
    if (!ln) return;
    positioned[node.id] = {
      x: (ln.x || 0) + (ln.width ? ln.width / 2 : NODE_WIDTH / 2) - NODE_WIDTH / 2,
      y: (ln.y || 0) + (ln.height ? ln.height / 2 : NODE_HEIGHT / 2) - NODE_HEIGHT / 2,
      width: ln.width || NODE_WIDTH,
      height: ln.height || NODE_HEIGHT,
    };
  });

  // Post-process: force partners and siblings to share the same Y (horizontal alignment)
  // Partners: find each partner edge and align the pair horizontally (same Y) and side-by-side
  const partnerEdges = edges.filter(e => e.label === 'Partner');
  const partnerGroupsList: [string, string][] = [];
  partnerEdges.forEach(e => {
    // ensure consistent ordering
    const a = e.source as string;
    const b = e.target as string;
    partnerGroupsList.push([a, b]);
  });

  partnerGroupsList.forEach(([a, b]) => {
    const pa = positioned[a];
    const pb = positioned[b];
    if (!pa || !pb) return;
    // Align Y to the minimum of the two (so partners sit at the higher/shallower Y)
    const y = Math.min(pa.y, pb.y);
    pa.y = y;
    pb.y = y;
    // Position side-by-side: center around the original midpoint
    const midX = (pa.x + pb.x) / 2;
    // Put a left and right placement depending on original order
    pa.x = midX - PARTNER_SPACING / 2;
    pb.x = midX + PARTNER_SPACING / 2;
  });

  // Siblings: group children sharing same parents and align their Y
  // Siblings: align children that share the same parent SET horizontally and on the same Y
  Object.values(siblingGroups).forEach(group => {
    if (!group || group.length <= 1) return;
    // filter to nodes we have positions for
    const members = group.filter(id => positioned[id]);
    if (members.length === 0) return;
    // compute average Y and set for all siblings
    const ys = members.map(id => positioned[id].y);
    const avgY = ys.reduce((s, v) => s + v, 0) / ys.length;
    // determine midpoint X from current positions
    const xs = members.map(id => positioned[id].x);
    const midX = xs.reduce((s, v) => s + v, 0) / xs.length;
    // sort deterministically (by id) for stable layout
    const sorted = members.slice().sort();
    const halfSpan = (sorted.length - 1) * SIBLING_SPACING / 2;
    sorted.forEach((id, idx) => {
      positioned[id].y = avgY;
      positioned[id].x = midX - halfSpan + idx * SIBLING_SPACING;
    });
  });

  // Ensure parent->child vertical spacing is at least NODE_HEIGHT + BASE_SPACINGs
  edges.forEach((edge: Edge) => {
    if (edge.label !== 'Parent') return;
    const parentId = edge.source as string;
    const childId = edge.target as string;
    const p = positioned[parentId];
    const c = positioned[childId];
    if (!p || !c) return;
    const minChildY = p.y + NODE_HEIGHT + BASE_SPACING;
    if (c.y < minChildY || c.y > minChildY) c.y = minChildY;
  });

  // Map back to nodes array
  return nodes.map((node: Node) => {
    const p = positioned[node.id];
    if (!p) return { ...node, data: { ...node.data, autoPositioned: false } };
    return { ...node, position: { x: Math.round(p.x), y: Math.round(p.y) }, data: { ...node.data, autoPositioned: true } };
  });
}
