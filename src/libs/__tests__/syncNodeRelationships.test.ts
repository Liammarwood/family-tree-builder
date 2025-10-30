import { syncNodeRelationships, validateParentAddition } from '../syncNodeRelationships';
import { Node, Edge } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';
import { RelationshipType } from '@/types/RelationshipEdgeData';

describe('syncNodeRelationships', () => {
  describe('syncNodeRelationships', () => {
    it('syncs parent relationships from edges', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'parent1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: { id: 'parent1', name: 'Parent 1', dateOfBirth: '1980-01-01' },
        },
        {
          id: 'child1',
          type: 'family',
          position: { x: 0, y: 200 },
          data: { id: 'child1', name: 'Child 1', dateOfBirth: '2000-01-01' },
        },
      ];
      const edges: Edge[] = [
        {
          id: 'edge1',
          source: 'parent1',
          target: 'child1',
          data: { relationship: RelationshipType.Parent },
        },
      ];

      const synced = syncNodeRelationships(nodes, edges);
      
      const parent = synced.find(n => n.id === 'parent1');
      const child = synced.find(n => n.id === 'child1');
      
      expect(parent?.data.children).toEqual(['child1']);
      expect(child?.data.parents).toEqual(['parent1']);
    });

    it('syncs partner relationships bidirectionally', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'person1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: { id: 'person1', name: 'Person 1', dateOfBirth: '1980-01-01' },
        },
        {
          id: 'person2',
          type: 'family',
          position: { x: 100, y: 0 },
          data: { id: 'person2', name: 'Person 2', dateOfBirth: '1981-01-01' },
        },
      ];
      const edges: Edge[] = [
        {
          id: 'edge1',
          source: 'person1',
          target: 'person2',
          data: { relationship: RelationshipType.Partner },
        },
      ];

      const synced = syncNodeRelationships(nodes, edges);
      
      const person1 = synced.find(n => n.id === 'person1');
      const person2 = synced.find(n => n.id === 'person2');
      
      expect(person1?.data.partners).toEqual(['person2']);
      expect(person2?.data.partners).toEqual(['person1']);
    });

    it('handles multiple parents correctly', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'parent1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: { id: 'parent1', name: 'Parent 1', dateOfBirth: '1980-01-01' },
        },
        {
          id: 'parent2',
          type: 'family',
          position: { x: 100, y: 0 },
          data: { id: 'parent2', name: 'Parent 2', dateOfBirth: '1981-01-01' },
        },
        {
          id: 'child1',
          type: 'family',
          position: { x: 50, y: 200 },
          data: { id: 'child1', name: 'Child 1', dateOfBirth: '2000-01-01' },
        },
      ];
      const edges: Edge[] = [
        {
          id: 'edge1',
          source: 'parent1',
          target: 'child1',
          data: { relationship: RelationshipType.Parent },
        },
        {
          id: 'edge2',
          source: 'parent2',
          target: 'child1',
          data: { relationship: RelationshipType.Parent },
        },
      ];

      const synced = syncNodeRelationships(nodes, edges);
      
      const child = synced.find(n => n.id === 'child1');
      
      expect(child?.data.parents).toHaveLength(2);
      expect(child?.data.parents).toContain('parent1');
      expect(child?.data.parents).toContain('parent2');
    });

    it('clears relationships when no edges exist', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'node1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'node1',
            name: 'Node 1',
            dateOfBirth: '1980-01-01',
            parents: ['old-parent'],
            children: ['old-child'],
            partners: ['old-partner'],
          },
        },
      ];
      const edges: Edge[] = [];

      const synced = syncNodeRelationships(nodes, edges);
      
      const node = synced.find(n => n.id === 'node1');
      
      expect(node?.data.parents).toBeUndefined();
      expect(node?.data.children).toBeUndefined();
      expect(node?.data.partners).toBeUndefined();
    });
  });

  describe('validateParentAddition', () => {
    it('allows adding first parent', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'child1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: { id: 'child1', name: 'Child 1', dateOfBirth: '2000-01-01' },
        },
      ];

      const result = validateParentAddition('child1', 'parent1', nodes);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('allows adding second parent', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'child1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'child1',
            name: 'Child 1',
            dateOfBirth: '2000-01-01',
            parents: ['parent1'],
          },
        },
      ];

      const result = validateParentAddition('child1', 'parent2', nodes);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects adding third parent', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'child1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'child1',
            name: 'Child 1',
            dateOfBirth: '2000-01-01',
            parents: ['parent1', 'parent2'],
          },
        },
      ];

      const result = validateParentAddition('child1', 'parent3', nodes);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot add more than 2 parents');
    });

    it('rejects duplicate parent', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'child1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'child1',
            name: 'Child 1',
            dateOfBirth: '2000-01-01',
            parents: ['parent1'],
          },
        },
      ];

      const result = validateParentAddition('child1', 'parent1', nodes);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('returns error for non-existent child', () => {
      const nodes: Node<FamilyNodeData>[] = [];

      const result = validateParentAddition('child1', 'parent1', nodes);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
