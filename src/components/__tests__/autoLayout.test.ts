import { Node, Edge } from 'reactflow';
import { getElkLayout } from '../autoLayout';

// Small helper to compare closeness
function close(a: number, b: number, eps = 8) {
  return Math.abs(a - b) <= eps;
}

describe('getElkLayout', () => {
  it('positions partners on same Y and parents above children and siblings align', async () => {
    // Create a simple family: A and B are partners, they have children C and D (siblings)
    const nodes: Node[] = [
      { id: 'A', type: 'family', data: {}, position: { x: 0, y: 0 } },
      { id: 'B', type: 'family', data: {}, position: { x: 0, y: 0 } },
      { id: 'C', type: 'family', data: {}, position: { x: 0, y: 0 } },
      { id: 'D', type: 'family', data: {}, position: { x: 0, y: 0 } },
    ];

    const edges: Edge[] = [
      { id: 'pAB', source: 'A', target: 'B', type: 'default', label: 'Partner' },
      { id: 'A-C', source: 'A', target: 'C', type: 'default', label: 'Parent' },
      { id: 'B-C', source: 'B', target: 'C', type: 'default', label: 'Parent' },
      { id: 'A-D', source: 'A', target: 'D', type: 'default', label: 'Parent' },
      { id: 'B-D', source: 'B', target: 'D', type: 'default', label: 'Parent' },
    ];

    const out = await getElkLayout(nodes, edges, { direction: 'TB', compact: true });

    const A = out.find(n => n.id === 'A')!;
    const B = out.find(n => n.id === 'B')!;
    const C = out.find(n => n.id === 'C')!;
    const D = out.find(n => n.id === 'D')!;

    // partners A and B roughly same Y
    expect(close(A.position.y, B.position.y)).toBe(true);
    // parents above children
    expect(A.position.y).toBeLessThan(C.position.y);
    expect(B.position.y).toBeLessThan(C.position.y);
    expect(A.position.y).toBeLessThan(D.position.y);
    expect(B.position.y).toBeLessThan(D.position.y);
    // siblings C and D same Y-ish
    expect(close(C.position.y, D.position.y)).toBe(true);
  });
});
