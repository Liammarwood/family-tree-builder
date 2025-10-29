import { PartnerEdge, DivorcedEdge, ParentEdge, ChildEdge, SiblingEdge } from '@/libs/edges';
import { RelationshipType } from '@/types/RelationshipEdgeData';

describe('edges helpers', () => {
  it('builds partner edge with expected fields', () => {
    const e = PartnerEdge('a', 'b', '2001-06-07');
    expect(e.id).toBe('partner-a-b');
    expect(e.source).toBe('a');
    expect(e.target).toBe('b');
    expect(e.data.relationship).toBe(RelationshipType.Partner);
    expect(e.data.dateOfMarriage).toBe('2001-06-07');
  });

  it('builds divorced edge with expected fields', () => {
    const e = DivorcedEdge('a', 'b', '2001-06-07', '2010-01-01');
    expect(e.id).toBe('divorced-a-b');
    expect(e.data.relationship).toBe(RelationshipType.Divorced);
    expect(e.data.dateOfDivorce).toBe('2010-01-01');
  });

  it('builds parent edge (parent -> child)', () => {
    const e = ParentEdge('child1', 'parent1');
    // ParentEdge returns source=parent and target=child
    expect(e.source).toBe('parent1');
    expect(e.target).toBe('child1');
    expect(e.data.relationship).toBe(RelationshipType.Parent);
    expect(e.id).toBe('parent-parent1-child1');
  });

  it('builds child edge (child -> parent)', () => {
    const e = ChildEdge('child1', 'parent1');
    expect(e.source).toBe('child1');
    expect(e.target).toBe('parent1');
    expect(e.data.relationship).toBe(RelationshipType.Parent);
    // note: ChildEdge uses id pattern `parent-${child}-${parent}` in implementation
    expect(e.id).toBe('parent-child1-parent1');
  });

  it('builds sibling edges from parent edges', () => {
    const parentEdges: any[] = [
      { source: 'p1' },
      { source: 'p2' },
    ];
    const siblings = SiblingEdge('t', parentEdges as any);
    expect(Array.isArray(siblings)).toBe(true);
    expect(siblings.length).toBe(2);
    expect(siblings[0].source).toBe('p1');
    expect(siblings[0].target).toBe('t');
  });
});
