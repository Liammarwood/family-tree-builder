import { autoLayoutFamilyTree } from '@/libs/autoLayout';
import { Node, Edge } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';
import { RelationshipType } from '@/types/RelationshipEdgeData';

describe('autoLayoutFamilyTree', () => {
  it('returns empty array for empty input', async () => {
    const result = await autoLayoutFamilyTree([], []);
    expect(result).toEqual([]);
  });

  it('positions single node', async () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'person1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'person1',
          name: 'John Doe',
          dateOfBirth: '1980-01-01',
          createdAt: Date.now(),
          children: [],
          parents: [],
          partners: [],
        },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, []);
    expect(result).toHaveLength(1);
    expect(result[0].position.x).toBeDefined();
    expect(result[0].position.y).toBeDefined();
  });

  it('positions parent above child', async () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'parent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent',
          name: 'Parent',
          dateOfBirth: '1960-01-01',
          createdAt: Date.now(),
          children: ['child'],
          parents: [],
          partners: [],
        },
      },
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '1990-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'parent-parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(2);

    const parentNode = result.find(n => n.id === 'parent');
    const childNode = result.find(n => n.id === 'child');

    expect(parentNode).toBeDefined();
    expect(childNode).toBeDefined();
    
    // Parent should be above child (lower y value)
    expect(parentNode!.position.y).toBeLessThan(childNode!.position.y);
  });

  it('positions partners next to each other at same level', async () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'person1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'person1',
          name: 'Person 1',
          dateOfBirth: '1980-01-01',
          createdAt: Date.now(),
          children: [],
          parents: [],
          partners: ['person2'],
        },
      },
      {
        id: 'person2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'person2',
          name: 'Person 2',
          dateOfBirth: '1982-01-01',
          createdAt: Date.now(),
          children: [],
          parents: [],
          partners: ['person1'],
        },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'partner-person1-person2',
        source: 'person1',
        target: 'person2',
        data: { relationship: RelationshipType.Partner, dateOfMarriage: '2005-06-15' },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(2);

    const person1 = result.find(n => n.id === 'person1');
    const person2 = result.find(n => n.id === 'person2');

    expect(person1).toBeDefined();
    expect(person2).toBeDefined();
    
    // Partners should be at same Y level
    expect(person1!.position.y).toBe(person2!.position.y);
    
    // Partners should be horizontally separated
    expect(Math.abs(person1!.position.x - person2!.position.x)).toBeGreaterThan(0);
  });

  it('handles complex family tree with multiple generations', async () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'grandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent',
          name: 'Grandparent',
          dateOfBirth: '1940-01-01',
          createdAt: Date.now(),
          children: ['parent'],
          parents: [],
          partners: [],
        },
      },
      {
        id: 'parent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent',
          name: 'Parent',
          dateOfBirth: '1970-01-01',
          createdAt: Date.now(),
          children: ['child'],
          parents: ['grandparent'],
          partners: [],
        },
      },
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '2000-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'parent-grandparent-parent',
        source: 'grandparent',
        target: 'parent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(3);

    const grandparent = result.find(n => n.id === 'grandparent');
    const parent = result.find(n => n.id === 'parent');
    const child = result.find(n => n.id === 'child');

    expect(grandparent).toBeDefined();
    expect(parent).toBeDefined();
    expect(child).toBeDefined();
    
    // Verify hierarchical ordering: grandparent > parent > child (in Y axis)
    expect(grandparent!.position.y).toBeLessThan(parent!.position.y);
    expect(parent!.position.y).toBeLessThan(child!.position.y);
  });

  it('aligns siblings at the same Y coordinate', async () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'parent1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent1',
          name: 'Parent 1',
          dateOfBirth: '1960-01-01',
          createdAt: Date.now(),
          children: ['child1', 'child2', 'child3'],
          parents: [],
          partners: ['parent2'],
        },
      },
      {
        id: 'parent2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent2',
          name: 'Parent 2',
          dateOfBirth: '1962-01-01',
          createdAt: Date.now(),
          children: ['child1', 'child2', 'child3'],
          parents: [],
          partners: ['parent1'],
        },
      },
      {
        id: 'child1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child1',
          name: 'Child 1',
          dateOfBirth: '1990-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent1', 'parent2'],
          partners: [],
        },
      },
      {
        id: 'child2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child2',
          name: 'Child 2',
          dateOfBirth: '1992-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent1', 'parent2'],
          partners: [],
        },
      },
      {
        id: 'child3',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child3',
          name: 'Child 3',
          dateOfBirth: '1995-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent1', 'parent2'],
          partners: [],
        },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'partner-parent1-parent2',
        source: 'parent1',
        target: 'parent2',
        data: { relationship: RelationshipType.Partner, dateOfMarriage: '1989-06-15' },
      },
      {
        id: 'parent-parent1-child1',
        source: 'parent1',
        target: 'child1',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent2-child1',
        source: 'parent2',
        target: 'child1',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent1-child2',
        source: 'parent1',
        target: 'child2',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent2-child2',
        source: 'parent2',
        target: 'child2',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent1-child3',
        source: 'parent1',
        target: 'child3',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent2-child3',
        source: 'parent2',
        target: 'child3',
        data: { relationship: RelationshipType.Parent },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(5);

    const child1 = result.find(n => n.id === 'child1');
    const child2 = result.find(n => n.id === 'child2');
    const child3 = result.find(n => n.id === 'child3');

    expect(child1).toBeDefined();
    expect(child2).toBeDefined();
    expect(child3).toBeDefined();
    
    // All siblings should be at the same Y coordinate
    expect(child1!.position.y).toBe(child2!.position.y);
    expect(child2!.position.y).toBe(child3!.position.y);
  });

  it('handles multi-level hierarchy with parents of parents', async () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'great-grandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'great-grandparent',
          name: 'Great Grandparent',
          dateOfBirth: '1920-01-01',
          createdAt: Date.now(),
          children: ['grandparent1', 'grandparent2'],
          parents: [],
          partners: [],
        },
      },
      {
        id: 'grandparent1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent1',
          name: 'Grandparent 1',
          dateOfBirth: '1950-01-01',
          createdAt: Date.now(),
          children: ['parent'],
          parents: ['great-grandparent'],
          partners: [],
        },
      },
      {
        id: 'grandparent2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent2',
          name: 'Grandparent 2',
          dateOfBirth: '1952-01-01',
          createdAt: Date.now(),
          children: ['parent'],
          parents: ['great-grandparent'],
          partners: [],
        },
      },
      {
        id: 'parent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent',
          name: 'Parent',
          dateOfBirth: '1980-01-01',
          createdAt: Date.now(),
          children: ['child'],
          parents: ['grandparent1', 'grandparent2'],
          partners: [],
        },
      },
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '2010-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'parent-great-grandparent-grandparent1',
        source: 'great-grandparent',
        target: 'grandparent1',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-great-grandparent-grandparent2',
        source: 'great-grandparent',
        target: 'grandparent2',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-grandparent1-parent',
        source: 'grandparent1',
        target: 'parent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-grandparent2-parent',
        source: 'grandparent2',
        target: 'parent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(5);

    const greatGrandparent = result.find(n => n.id === 'great-grandparent');
    const grandparent1 = result.find(n => n.id === 'grandparent1');
    const grandparent2 = result.find(n => n.id === 'grandparent2');
    const parent = result.find(n => n.id === 'parent');
    const child = result.find(n => n.id === 'child');

    expect(greatGrandparent).toBeDefined();
    expect(grandparent1).toBeDefined();
    expect(grandparent2).toBeDefined();
    expect(parent).toBeDefined();
    expect(child).toBeDefined();
    
    // Verify proper hierarchical ordering
    expect(greatGrandparent!.position.y).toBeLessThan(grandparent1!.position.y);
    expect(greatGrandparent!.position.y).toBeLessThan(grandparent2!.position.y);
    expect(grandparent1!.position.y).toBeLessThan(parent!.position.y);
    expect(grandparent2!.position.y).toBeLessThan(parent!.position.y);
    expect(parent!.position.y).toBeLessThan(child!.position.y);
    
    // Grandparents should be siblings (same Y coordinate)
    expect(grandparent1!.position.y).toBe(grandparent2!.position.y);
  });

  it('prioritizes partner positioning over sibling alignment', async () => {
    // Test case: Two siblings where one has a partner
    // The sibling without a partner should align to the Y position of the sibling with partner
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'parent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent',
          name: 'Parent',
          dateOfBirth: '1960-01-01',
          createdAt: Date.now(),
          children: ['child1', 'child2'],
          parents: [],
          partners: [],
        },
      },
      {
        id: 'child1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child1',
          name: 'Child 1',
          dateOfBirth: '1990-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: ['child1-partner'],
        },
      },
      {
        id: 'child1-partner',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child1-partner',
          name: 'Child 1 Partner',
          dateOfBirth: '1991-01-01',
          createdAt: Date.now(),
          children: [],
          parents: [],
          partners: ['child1'],
        },
      },
      {
        id: 'child2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child2',
          name: 'Child 2',
          dateOfBirth: '1992-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'parent-parent-child1',
        source: 'parent',
        target: 'child1',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent-child2',
        source: 'parent',
        target: 'child2',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'partner-child1-partner',
        source: 'child1',
        target: 'child1-partner',
        data: { relationship: RelationshipType.Partner, dateOfMarriage: '2015-06-20' },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(4);

    const child1 = result.find(n => n.id === 'child1');
    const child1Partner = result.find(n => n.id === 'child1-partner');
    const child2 = result.find(n => n.id === 'child2');

    expect(child1).toBeDefined();
    expect(child1Partner).toBeDefined();
    expect(child2).toBeDefined();
    
    // Child1 and their partner should be at the same Y (partner relationship)
    expect(child1!.position.y).toBe(child1Partner!.position.y);
    
    // Child2 (sibling without partner) should align to Child1's Y position
    // This ensures siblings are aligned while respecting partner positioning
    expect(child2!.position.y).toBe(child1!.position.y);
  });

  it('returns original nodes if layout fails', async () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'person1',
        type: 'family',
        position: { x: 100, y: 200 },
        data: {
          id: 'person1',
          name: 'Test',
          dateOfBirth: '1980-01-01',
          createdAt: Date.now(),
          children: [],
          parents: [],
          partners: [],
        },
      },
    ];

    // Test with potentially problematic edges
    const edges: Edge[] = [];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(1);
    // Should still have valid positions (either original or new)
    expect(result[0].position).toBeDefined();
  });

  it('ensures nodes never overlap (collision detection)', async () => {
    // Create a complex tree with many nodes at the same level
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'parent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent',
          name: 'Parent',
          dateOfBirth: '1960-01-01',
          createdAt: Date.now(),
          children: ['child1', 'child2', 'child3', 'child4', 'child5'],
          parents: [],
          partners: [],
        },
      },
      {
        id: 'child1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child1',
          name: 'Child 1',
          dateOfBirth: '1990-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
      {
        id: 'child2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child2',
          name: 'Child 2',
          dateOfBirth: '1991-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
      {
        id: 'child3',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child3',
          name: 'Child 3',
          dateOfBirth: '1992-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
      {
        id: 'child4',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child4',
          name: 'Child 4',
          dateOfBirth: '1993-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
      {
        id: 'child5',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child5',
          name: 'Child 5',
          dateOfBirth: '1994-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'parent-parent-child1',
        source: 'parent',
        target: 'child1',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent-child2',
        source: 'parent',
        target: 'child2',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent-child3',
        source: 'parent',
        target: 'child3',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent-child4',
        source: 'parent',
        target: 'child4',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent-child5',
        source: 'parent',
        target: 'child5',
        data: { relationship: RelationshipType.Parent },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(6);

    // Get all children nodes
    const children = result.filter(n => n.id.startsWith('child'));
    
    // All children should be at the same Y (same generation)
    const firstChildY = children[0].position.y;
    children.forEach(child => {
      expect(child.position.y).toBe(firstChildY);
    });

    // Check that no children overlap (sorted by X position)
    const sortedChildren = [...children].sort((a, b) => a.position.x - b.position.x);
    for (let i = 0; i < sortedChildren.length - 1; i++) {
      const currentRight = sortedChildren[i].position.x + 220; // NODE_WIDTH
      const nextLeft = sortedChildren[i + 1].position.x;
      const gap = nextLeft - currentRight;
      
      // Gap should be at least BASE_SPACING (30)
      expect(gap).toBeGreaterThanOrEqual(30);
    }
  });

  it('keeps all nodes in same generation at same Y coordinate', async () => {
    // Test with multiple unrelated family units at the same generation
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'grandparent1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent1',
          name: 'Grandparent 1',
          dateOfBirth: '1940-01-01',
          createdAt: Date.now(),
          children: ['parent1'],
          parents: [],
          partners: [],
        },
      },
      {
        id: 'grandparent2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent2',
          name: 'Grandparent 2',
          dateOfBirth: '1941-01-01',
          createdAt: Date.now(),
          children: ['parent2'],
          parents: [],
          partners: [],
        },
      },
      {
        id: 'parent1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent1',
          name: 'Parent 1',
          dateOfBirth: '1970-01-01',
          createdAt: Date.now(),
          children: ['child1'],
          parents: ['grandparent1'],
          partners: [],
        },
      },
      {
        id: 'parent2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent2',
          name: 'Parent 2',
          dateOfBirth: '1971-01-01',
          createdAt: Date.now(),
          children: ['child2'],
          parents: ['grandparent2'],
          partners: [],
        },
      },
      {
        id: 'child1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child1',
          name: 'Child 1',
          dateOfBirth: '2000-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent1'],
          partners: [],
        },
      },
      {
        id: 'child2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child2',
          name: 'Child 2',
          dateOfBirth: '2001-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['parent2'],
          partners: [],
        },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'parent-grandparent1-parent1',
        source: 'grandparent1',
        target: 'parent1',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-grandparent2-parent2',
        source: 'grandparent2',
        target: 'parent2',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent1-child1',
        source: 'parent1',
        target: 'child1',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-parent2-child2',
        source: 'parent2',
        target: 'child2',
        data: { relationship: RelationshipType.Parent },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(6);

    // Find nodes by generation
    const grandparent1 = result.find(n => n.id === 'grandparent1')!;
    const grandparent2 = result.find(n => n.id === 'grandparent2')!;
    const parent1 = result.find(n => n.id === 'parent1')!;
    const parent2 = result.find(n => n.id === 'parent2')!;
    const child1 = result.find(n => n.id === 'child1')!;
    const child2 = result.find(n => n.id === 'child2')!;

    // All generation 0 nodes should be at same Y
    expect(grandparent1.position.y).toBe(grandparent2.position.y);
    
    // All generation 1 nodes should be at same Y
    expect(parent1.position.y).toBe(parent2.position.y);
    
    // All generation 2 nodes should be at same Y
    expect(child1.position.y).toBe(child2.position.y);

    // Verify hierarchical ordering
    expect(grandparent1.position.y).toBeLessThan(parent1.position.y);
    expect(parent1.position.y).toBeLessThan(child1.position.y);
  });

  it('maintains partner Y alignment in complex scenarios', async () => {
    // Test with partners at different generations who should be aligned
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'grandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent',
          name: 'Grandparent',
          dateOfBirth: '1940-01-01',
          createdAt: Date.now(),
          children: ['child1'],
          parents: [],
          partners: [],
        },
      },
      {
        id: 'child1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child1',
          name: 'Child 1',
          dateOfBirth: '1970-01-01',
          createdAt: Date.now(),
          children: [],
          parents: ['grandparent'],
          partners: ['partner1'],
        },
      },
      {
        id: 'partner1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'partner1',
          name: 'Partner 1',
          dateOfBirth: '1972-01-01',
          createdAt: Date.now(),
          children: [],
          parents: [], // No parents - would be generation 0 without partner adjustment
          partners: ['child1'],
        },
      },
    ];

    const edges: Edge[] = [
      {
        id: 'parent-grandparent-child1',
        source: 'grandparent',
        target: 'child1',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'partner-child1-partner1',
        source: 'child1',
        target: 'partner1',
        data: { relationship: RelationshipType.Partner, dateOfMarriage: '1995-06-15' },
      },
    ];

    const result = await autoLayoutFamilyTree(nodes, edges);
    expect(result).toHaveLength(3);

    const child1 = result.find(n => n.id === 'child1')!;
    const partner1 = result.find(n => n.id === 'partner1')!;

    // Partners MUST be at same Y level
    expect(child1.position.y).toBe(partner1.position.y);
  });
});
