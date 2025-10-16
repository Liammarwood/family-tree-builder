import { Node, Edge, MarkerType } from 'reactflow';
import { FamilyTreeData, FamilyNodeType } from './familyTreeUtils';
import { FamilyNodeData } from '@/components/FamilyNode';
import { NODE_WIDTH, NODE_HEIGHT, BASE_SPACING } from '@/libs/spacing';

// Convert tree model to React Flow nodes/edges
export function treeToFlow(tree: FamilyTreeData) {
  const nodes: Node<FamilyNodeData>[] = Object.values(tree).map(node => ({
    id: node.id,
    type: 'family',
    data: { name: node.name, dob: node.dob, countryOfBirth: node.countryOfBirth, dod: node.dod, occupation: node.occupation, maidenName: node.maidenName, photo: node.photo },
    position: node.x !== undefined && node.y !== undefined ? { x: node.x, y: node.y } : { x: 0, y: 0 },
    selected: false,
    dataWidth: NODE_WIDTH,
    dataHeight: NODE_HEIGHT,
  }));

  // Parent groups
  const parentGroupMap: { [key: string]: { parents: string[]; children: string[] } } = {};
  Object.values(tree).forEach(node => {
    const parents = (node.parentIds || []).slice().sort();
    if (parents.length > 1) {
      const key = parents.join(',');
      if (!parentGroupMap[key]) parentGroupMap[key] = { parents, children: [] };
      parentGroupMap[key].children.push(node.id);
    }
  });

  const dummyNodes: Node[] = [];
  Object.entries(parentGroupMap).forEach(([key, group]) => {
    if (group.children.length > 1) {
      dummyNodes.push({ id: `parentgroup-${key}`, type: 'input', data: { label: '' }, position: { x: 0, y: 0 }, hidden: true });
    }
  });

  const edges: Edge[] = [];
  const siblingEdgeIds = new Set<string>();

  // parent - child edges
  Object.values(tree).forEach(node => {
    const parents = (node.parentIds || []).slice().sort();
    let usedDummy = false;
    if (parents.length > 1) {
      const key = parents.join(',');
      const group = parentGroupMap[key];
      if (group && group.children.length > 1) {
        edges.push({ id: `pg-${key}->${node.id}`, type: "step", source: `parentgroup-${key}`, target: node.id, markerEnd: { type: MarkerType.ArrowClosed }, label: 'Parent' });
        usedDummy = true;
      }
    }
    if (!usedDummy) {
      parents.forEach(parentId => {
        edges.push({ id: `${parentId}->${node.id}`, type: "step", source: parentId, target: node.id, markerEnd: { type: MarkerType.ArrowClosed }, label: 'Parent' });
      });
    }

    // siblings
    (node.parentIds || []).forEach(parentId => {
      const siblings = (tree[parentId]?.children || []).filter(id => id !== node.id);
      siblings.forEach(sibId => {
        const [a, b] = [node.id, sibId].sort();
        const edgeId = `sib-${a}-${b}`;
        if (!siblingEdgeIds.has(edgeId)) {
          siblingEdgeIds.add(edgeId);
          edges.push({ id: edgeId, source: a, target: b, style: { stroke: '#888', strokeDasharray: '4 2' }, type: 'straight', markerEnd: undefined, animated: true, label: 'Sibling' });
        }
      });
    });

    // partners (draw side-to-side: right -> left)
    (node.partners || []).forEach(partnerId => {
      if (node.id < partnerId) {
        edges.push({
          id: `partner-${node.id}-${partnerId}`,
          source: node.id,
          target: partnerId,
          style: { stroke: '#b77', strokeDasharray: '2 2' },
          type: 'smoothstep',
          markerEnd: undefined,
          animated: false,
          label: 'Partner',
          sourceHandle: 'right',
          targetHandle: 'left',
        });
      }
    });
  });

  return { nodes: [...nodes, ...dummyNodes], edges };
}

// Convert React Flow nodes/edges back to tree model
export function flowToTree(nodes: Node[], edges: Edge[], existingTree?: FamilyTreeData): FamilyTreeData {
  const tree: FamilyTreeData = existingTree ? { ...existingTree } : {};

  // First, ensure all nodes exist or update data
  nodes.forEach(n => {
    // skip dummy parentgroup nodes
    if (n.id.startsWith('parentgroup-')) return;
    const existing = tree[n.id];
    const dataAny: any = (n.data || {});
    if (!existing) {
      tree[n.id] = {
        id: n.id,
        name: dataAny.name || '',
        dob: dataAny.dob || '',
        countryOfBirth: dataAny.countryOfBirth || '',
        dod: dataAny.dod || '',
        occupation: dataAny.occupation || '',
        maidenName: dataAny.maidenName || '',
        children: [],
        parentIds: [],
        partners: [],
      } as FamilyNodeType;
    } else {
      tree[n.id] = { ...existing, name: dataAny.name || existing.name, dob: dataAny.dob || existing.dob } as FamilyNodeType;
    }
    // position
    if (n.position) {
      tree[n.id].x = Math.round(n.position.x);
      tree[n.id].y = Math.round(n.position.y);
    }
  });

  // Reset relationships
  Object.values(tree).forEach(n => {
    n.children = n.children || [];
    n.parentIds = n.parentIds || [];
    n.partners = n.partners || [];
  });

  // Process edges
  edges.forEach(e => {
    if (!e.source || !e.target) return;
    if (e.id && e.id.startsWith('pg-')) {
      // parentgroup edge: source is parentgroup-<parents>
      const parts = e.source.replace('parentgroup-', '').split(',');
      const childId = e.target as string;
      parts.forEach(p => {
        if (!tree[p]) return;
        tree[p].children = Array.from(new Set([...(tree[p].children || []), childId]));
        tree[childId].parentIds = Array.from(new Set([...(tree[childId].parentIds || []), p]));
      });
      return;
    }

    // sibling edges and partner edges are labeled
    const label = (e.label || '').toString();
    if (label === 'Sibling') {
      const a = e.source as string;
      const b = e.target as string;
      // siblings share parents; we cannot infer parents here reliably, so skip
      return;
    }
    if (label === 'Partner') {
      const a = e.source as string;
      const b = e.target as string;
      tree[a].partners = Array.from(new Set([...(tree[a].partners || []), b]));
      tree[b].partners = Array.from(new Set([...(tree[b].partners || []), a]));
      return;
    }

    // default: parent edge parent->child
    const parentId = e.source as string;
    const childId = e.target as string;
    if (!tree[parentId] || !tree[childId]) return;
    tree[parentId].children = Array.from(new Set([...(tree[parentId].children || []), childId]));
    tree[childId].parentIds = Array.from(new Set([...(tree[childId].parentIds || []), parentId]));
  });

  return tree;
}
