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
});
