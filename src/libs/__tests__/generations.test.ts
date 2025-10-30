import { calculateGenerationLevels, filterByGenerationLevel, calculateExtendedGenerationInfo } from '@/libs/generations';
import { Node, Edge } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';
import { RelationshipType } from '@/types/RelationshipEdgeData';

describe('calculateGenerationLevels', () => {
  it('returns empty map for non-existent node', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'person1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'person1',
          name: 'John',
          dateOfBirth: '1980-01-01',
          children: [],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const result = calculateGenerationLevels(nodes, [], 'nonexistent');
    expect(result.size).toBe(0);
  });
  
  it('assigns generation 0 to selected node', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'person1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'person1',
          name: 'John',
          dateOfBirth: '1980-01-01',
          children: [],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const result = calculateGenerationLevels(nodes, [], 'person1');
    expect(result.get('person1')).toBe(0);
  });
  
  it('assigns generation 1 to parents', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '1990-01-01',
          children: [],
          parents: ['parent'],
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
          dateOfBirth: '1960-01-01',
          children: ['child'],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
    ];
    
    const result = calculateGenerationLevels(nodes, edges, 'child');
    expect(result.get('child')).toBe(0);
    expect(result.get('parent')).toBe(1);
  });
  
  it('assigns generation 2 to grandparents', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'grandchild',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandchild',
          name: 'Grandchild',
          dateOfBirth: '2000-01-01',
          children: [],
          parents: ['parent'],
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
          children: ['grandchild'],
          parents: ['grandparent'],
          partners: [],
        },
      },
      {
        id: 'grandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent',
          name: 'Grandparent',
          dateOfBirth: '1940-01-01',
          children: ['parent'],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'grandparent-parent',
        source: 'grandparent',
        target: 'parent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-grandchild',
        source: 'parent',
        target: 'grandchild',
        data: { relationship: RelationshipType.Parent },
      },
    ];
    
    const result = calculateGenerationLevels(nodes, edges, 'grandchild');
    expect(result.get('grandchild')).toBe(0);
    expect(result.get('parent')).toBe(1);
    expect(result.get('grandparent')).toBe(2);
  });
  
  it('assigns negative generations to descendants', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'parent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'parent',
          name: 'Parent',
          dateOfBirth: '1970-01-01',
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
          dateOfBirth: '2000-01-01',
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
    ];
    
    const result = calculateGenerationLevels(nodes, edges, 'parent');
    expect(result.get('parent')).toBe(0);
    expect(result.get('child')).toBe(-1);
  });
  
  it('includes partners at the same generation', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'person1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'person1',
          name: 'Person 1',
          dateOfBirth: '1980-01-01',
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
          children: [],
          parents: [],
          partners: ['person1'],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'person1-person2',
        source: 'person1',
        target: 'person2',
        data: { relationship: RelationshipType.Partner },
      },
    ];
    
    const result = calculateGenerationLevels(nodes, edges, 'person1');
    expect(result.get('person1')).toBe(0);
    expect(result.get('person2')).toBe(0);
  });
  
  it('includes siblings at generation 0', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'sibling1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'sibling1',
          name: 'Sibling 1',
          dateOfBirth: '1990-01-01',
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
      {
        id: 'sibling2',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'sibling2',
          name: 'Sibling 2',
          dateOfBirth: '1992-01-01',
          children: [],
          parents: ['parent'],
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
          dateOfBirth: '1960-01-01',
          children: ['sibling1', 'sibling2'],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'parent-sibling1',
        source: 'parent',
        target: 'sibling1',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-sibling2',
        source: 'parent',
        target: 'sibling2',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'sibling1-sibling2',
        source: 'sibling1',
        target: 'sibling2',
        data: { relationship: RelationshipType.Sibling },
      },
    ];
    
    const result = calculateGenerationLevels(nodes, edges, 'sibling1');
    expect(result.get('sibling1')).toBe(0);
    expect(result.get('sibling2')).toBe(0);
    expect(result.get('parent')).toBe(1);
  });
});

describe('filterByGenerationLevel', () => {
  it('returns all nodes when no node is selected', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'person1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'person1',
          name: 'Person 1',
          dateOfBirth: '1980-01-01',
          children: [],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const result = filterByGenerationLevel(nodes, [], null, 2, 2);
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
  });
  
  it('returns all nodes when both generation limits are 0', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'person1',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'person1',
          name: 'Person 1',
          dateOfBirth: '1980-01-01',
          children: [],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const result = filterByGenerationLevel(nodes, [], 'person1', 0, 0);
    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
  });
  
  it('filters to show only parents (1 generation up)', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '1990-01-01',
          children: [],
          parents: ['parent'],
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
          dateOfBirth: '1960-01-01',
          children: ['child'],
          parents: ['grandparent'],
          partners: [],
        },
      },
      {
        id: 'grandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent',
          name: 'Grandparent',
          dateOfBirth: '1930-01-01',
          children: ['parent'],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'grandparent-parent',
        source: 'grandparent',
        target: 'parent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
    ];
    
    const result = filterByGenerationLevel(nodes, edges, 'child', 1, 0);
    expect(result.nodes).toHaveLength(2); // child and parent
    expect(result.nodes.map(n => n.id).sort()).toEqual(['child', 'parent']);
    expect(result.edges).toHaveLength(1); // parent-child edge
  });
  
  it('filters to show up to grandparents (2 generations up)', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '1990-01-01',
          children: [],
          parents: ['parent'],
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
          dateOfBirth: '1960-01-01',
          children: ['child'],
          parents: ['grandparent'],
          partners: [],
        },
      },
      {
        id: 'grandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent',
          name: 'Grandparent',
          dateOfBirth: '1930-01-01',
          children: ['parent'],
          parents: ['greatgrandparent'],
          partners: [],
        },
      },
      {
        id: 'greatgrandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'greatgrandparent',
          name: 'Great Grandparent',
          dateOfBirth: '1900-01-01',
          children: ['grandparent'],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'greatgrandparent-grandparent',
        source: 'greatgrandparent',
        target: 'grandparent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'grandparent-parent',
        source: 'grandparent',
        target: 'parent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
    ];
    
    const result = filterByGenerationLevel(nodes, edges, 'child', 2, 0);
    expect(result.nodes).toHaveLength(3); // child, parent, grandparent
    expect(result.nodes.map(n => n.id).sort()).toEqual(['child', 'grandparent', 'parent']);
    expect(result.edges).toHaveLength(2); // grandparent-parent and parent-child edges
  });
  
  it('filters to show children and grandchildren', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'grandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent',
          name: 'Grandparent',
          dateOfBirth: '1940-01-01',
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
          children: ['grandchild'],
          parents: ['parent'],
          partners: [],
        },
      },
      {
        id: 'grandchild',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandchild',
          name: 'Grandchild',
          dateOfBirth: '2020-01-01',
          children: [],
          parents: ['child'],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'grandparent-parent',
        source: 'grandparent',
        target: 'parent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'child-grandchild',
        source: 'child',
        target: 'grandchild',
        data: { relationship: RelationshipType.Parent },
      },
    ];
    
    const result = filterByGenerationLevel(nodes, edges, 'grandparent', 0, 2);
    expect(result.nodes).toHaveLength(3); // grandparent, parent, child
    expect(result.nodes.map(n => n.id).sort()).toEqual(['child', 'grandparent', 'parent']);
    expect(result.edges).toHaveLength(2);
  });
  
  it('includes partners in filtered results', () => {
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '1990-01-01',
          children: [],
          parents: ['parent1'],
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
          dateOfBirth: '1960-01-01',
          children: ['child'],
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
          children: ['child'],
          parents: [],
          partners: ['parent1'],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'parent1-child',
        source: 'parent1',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent1-parent2',
        source: 'parent1',
        target: 'parent2',
        data: { relationship: RelationshipType.Partner },
      },
    ];
    
    const result = filterByGenerationLevel(nodes, edges, 'child', 1, 0);
    expect(result.nodes).toHaveLength(3); // child, parent1, parent2
    expect(result.nodes.map(n => n.id).sort()).toEqual(['child', 'parent1', 'parent2']);
  });
  
  it('filters siblings at generation levels with siblingGenerations parameter', () => {
    // Create a family tree with aunts/uncles
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '1990-01-01',
          children: [],
          parents: ['parent'],
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
          dateOfBirth: '1960-01-01',
          children: ['child'],
          parents: ['grandparent'],
          partners: [],
        },
      },
      {
        id: 'aunt',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'aunt',
          name: 'Aunt',
          dateOfBirth: '1962-01-01',
          children: [],
          parents: ['grandparent'],
          partners: [],
        },
      },
      {
        id: 'grandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent',
          name: 'Grandparent',
          dateOfBirth: '1930-01-01',
          children: ['parent', 'aunt'],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'grandparent-parent',
        source: 'grandparent',
        target: 'parent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'grandparent-aunt',
        source: 'grandparent',
        target: 'aunt',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-aunt',
        source: 'parent',
        target: 'aunt',
        data: { relationship: RelationshipType.Sibling },
      },
      {
        id: 'parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
    ];
    
    // Test 1: Show parents but not aunts/uncles (siblingGenerations: 0)
    const result1 = filterByGenerationLevel(nodes, edges, 'child', 1, 0, 0);
    expect(result1.nodes).toHaveLength(2); // child, parent (no aunt)
    expect(result1.nodes.map(n => n.id).sort()).toEqual(['child', 'parent']);
    
    // Test 2: Show parents and aunts/uncles (siblingGenerations: 1)
    const result2 = filterByGenerationLevel(nodes, edges, 'child', 1, 0, 1);
    expect(result2.nodes).toHaveLength(3); // child, parent, aunt
    expect(result2.nodes.map(n => n.id).sort()).toEqual(['aunt', 'child', 'parent']);
    
    // Test 3: Show grandparents and aunts/uncles (siblingGenerations: 1)
    const result3 = filterByGenerationLevel(nodes, edges, 'child', 2, 0, 1);
    expect(result3.nodes).toHaveLength(4); // child, parent, aunt, grandparent
    expect(result3.nodes.map(n => n.id).sort()).toEqual(['aunt', 'child', 'grandparent', 'parent']);
  });
  
  it('filters great aunts/uncles with siblingGenerations parameter', () => {
    // Create a family tree with great aunts/uncles
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '1990-01-01',
          children: [],
          parents: ['parent'],
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
          dateOfBirth: '1960-01-01',
          children: ['child'],
          parents: ['grandparent'],
          partners: [],
        },
      },
      {
        id: 'grandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'grandparent',
          name: 'Grandparent',
          dateOfBirth: '1930-01-01',
          children: ['parent'],
          parents: ['greatgrandparent'],
          partners: [],
        },
      },
      {
        id: 'greataunt',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'greataunt',
          name: 'Great Aunt',
          dateOfBirth: '1932-01-01',
          children: [],
          parents: ['greatgrandparent'],
          partners: [],
        },
      },
      {
        id: 'greatgrandparent',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'greatgrandparent',
          name: 'Great Grandparent',
          dateOfBirth: '1900-01-01',
          children: ['grandparent', 'greataunt'],
          parents: [],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'greatgrandparent-grandparent',
        source: 'greatgrandparent',
        target: 'grandparent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'greatgrandparent-greataunt',
        source: 'greatgrandparent',
        target: 'greataunt',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'grandparent-greataunt',
        source: 'grandparent',
        target: 'greataunt',
        data: { relationship: RelationshipType.Sibling },
      },
      {
        id: 'grandparent-parent',
        source: 'grandparent',
        target: 'parent',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
    ];
    
    // Test 1: Show up to great-grandparents but no great aunts/uncles (siblingGenerations: 1)
    const result1 = filterByGenerationLevel(nodes, edges, 'child', 3, 0, 1);
    expect(result1.nodes).toHaveLength(4); // child, parent, grandparent, greatgrandparent (no greataunt)
    expect(result1.nodes.map(n => n.id).sort()).toEqual(['child', 'grandparent', 'greatgrandparent', 'parent']);
    
    // Test 2: Show up to great-grandparents and great aunts/uncles (siblingGenerations: 2)
    const result2 = filterByGenerationLevel(nodes, edges, 'child', 3, 0, 2);
    expect(result2.nodes).toHaveLength(5); // all nodes
    expect(result2.nodes.map(n => n.id).sort()).toEqual(['child', 'grandparent', 'greataunt', 'greatgrandparent', 'parent']);
  });
  
  it('maintains backward compatibility when siblingGenerations is undefined', () => {
    // Existing tests should still work when siblingGenerations is not provided
    const nodes: Node<FamilyNodeData>[] = [
      {
        id: 'child',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'child',
          name: 'Child',
          dateOfBirth: '1990-01-01',
          children: [],
          parents: ['parent'],
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
          dateOfBirth: '1960-01-01',
          children: ['child'],
          parents: [],
          partners: [],
        },
      },
      {
        id: 'sibling',
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
          id: 'sibling',
          name: 'Sibling',
          dateOfBirth: '1992-01-01',
          children: [],
          parents: ['parent'],
          partners: [],
        },
      },
    ];
    
    const edges: Edge[] = [
      {
        id: 'parent-child',
        source: 'parent',
        target: 'child',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'parent-sibling',
        source: 'parent',
        target: 'sibling',
        data: { relationship: RelationshipType.Parent },
      },
      {
        id: 'child-sibling',
        source: 'child',
        target: 'sibling',
        data: { relationship: RelationshipType.Sibling },
      },
    ];
    
    // When siblingGenerations is undefined, siblings at generation 0 should be included (old behavior)
    const result = filterByGenerationLevel(nodes, edges, 'child', 1, 0);
    expect(result.nodes).toHaveLength(3); // child, parent, sibling
    expect(result.nodes.map(n => n.id).sort()).toEqual(['child', 'parent', 'sibling']);
  });
});
