import { getChildHandleGroups, getChildHandleId, validateMaxParents } from '../handleGroups';
import { Node, Edge } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';
import { RelationshipType } from '@/types/RelationshipEdgeData';

describe('handleGroups', () => {
  describe('getChildHandleGroups', () => {
    it('returns empty array when node has no children', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'parent1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: { id: 'parent1', name: 'Parent 1', dateOfBirth: '1980-01-01' },
        },
      ];
      const edges: Edge[] = [];

      const groups = getChildHandleGroups('parent1', nodes, edges);
      expect(groups).toEqual([]);
    });

    it('creates single group when all children have same two parents', () => {
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
          position: { x: 0, y: 200 },
          data: {
            id: 'child1',
            name: 'Child 1',
            dateOfBirth: '2000-01-01',
            parents: ['parent1', 'parent2'],
          },
        },
        {
          id: 'child2',
          type: 'family',
          position: { x: 100, y: 200 },
          data: {
            id: 'child2',
            name: 'Child 2',
            dateOfBirth: '2002-01-01',
            parents: ['parent1', 'parent2'],
          },
        },
      ];
      const edges: Edge[] = [
        {
          id: 'parent-parent1-child1',
          source: 'parent1',
          target: 'child1',
          data: { relationship: RelationshipType.Parent },
        },
        {
          id: 'parent-parent1-child2',
          source: 'parent1',
          target: 'child2',
          data: { relationship: RelationshipType.Parent },
        },
      ];

      const groups = getChildHandleGroups('parent1', nodes, edges);
      expect(groups).toHaveLength(1);
      expect(groups[0].handleId).toBe('child-0');
      expect(groups[0].childIds).toEqual(['child1', 'child2']);
      expect(groups[0].otherParentId).toBe('parent2');
    });

    it('creates multiple groups when children have different other parents', () => {
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
          id: 'parent3',
          type: 'family',
          position: { x: 200, y: 0 },
          data: { id: 'parent3', name: 'Parent 3', dateOfBirth: '1982-01-01' },
        },
        {
          id: 'child1',
          type: 'family',
          position: { x: 0, y: 200 },
          data: {
            id: 'child1',
            name: 'Child 1',
            dateOfBirth: '2000-01-01',
            parents: ['parent1', 'parent2'],
          },
        },
        {
          id: 'child2',
          type: 'family',
          position: { x: 100, y: 200 },
          data: {
            id: 'child2',
            name: 'Child 2',
            dateOfBirth: '2002-01-01',
            parents: ['parent1', 'parent2'],
          },
        },
        {
          id: 'child3',
          type: 'family',
          position: { x: 200, y: 200 },
          data: {
            id: 'child3',
            name: 'Child 3',
            dateOfBirth: '2005-01-01',
            parents: ['parent1', 'parent3'],
          },
        },
      ];
      const edges: Edge[] = [
        {
          id: 'parent-parent1-child1',
          source: 'parent1',
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
          id: 'parent-parent1-child3',
          source: 'parent1',
          target: 'child3',
          data: { relationship: RelationshipType.Parent },
        },
      ];

      const groups = getChildHandleGroups('parent1', nodes, edges);
      expect(groups).toHaveLength(2);
      
      // Find group with parent2 as other parent
      const group1 = groups.find(g => g.otherParentId === 'parent2');
      expect(group1).toBeDefined();
      expect(group1!.childIds).toEqual(['child1', 'child2']);
      
      // Find group with parent3 as other parent
      const group2 = groups.find(g => g.otherParentId === 'parent3');
      expect(group2).toBeDefined();
      expect(group2!.childIds).toEqual(['child3']);
    });

    it('handles children with only one parent', () => {
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
          data: {
            id: 'child1',
            name: 'Child 1',
            dateOfBirth: '2000-01-01',
            parents: ['parent1'],
          },
        },
      ];
      const edges: Edge[] = [
        {
          id: 'parent-parent1-child1',
          source: 'parent1',
          target: 'child1',
          data: { relationship: RelationshipType.Parent },
        },
      ];

      const groups = getChildHandleGroups('parent1', nodes, edges);
      expect(groups).toHaveLength(1);
      expect(groups[0].otherParentId).toBeUndefined();
      expect(groups[0].childIds).toEqual(['child1']);
    });
  });

  describe('getChildHandleId', () => {
    it('returns correct handle ID for child in specific group', () => {
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
          position: { x: 0, y: 200 },
          data: {
            id: 'child1',
            name: 'Child 1',
            dateOfBirth: '2000-01-01',
            parents: ['parent1', 'parent2'],
          },
        },
      ];
      const edges: Edge[] = [
        {
          id: 'parent-parent1-child1',
          source: 'parent1',
          target: 'child1',
          data: { relationship: RelationshipType.Parent },
        },
      ];

      const handleId = getChildHandleId('parent1', 'child1', nodes, edges);
      expect(handleId).toBe('child-0');
    });

    it('defaults to child-0 when no groups found', () => {
      const nodes: Node<FamilyNodeData>[] = [];
      const edges: Edge[] = [];

      const handleId = getChildHandleId('parent1', 'child1', nodes, edges);
      expect(handleId).toBe('child-0');
    });
  });

  describe('validateMaxParents', () => {
    it('returns true for node with 0 parents', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'node1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: { id: 'node1', name: 'Node 1', dateOfBirth: '1980-01-01' },
        },
      ];

      expect(validateMaxParents('node1', nodes)).toBe(true);
    });

    it('returns true for node with 1 parent', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'node1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'node1',
            name: 'Node 1',
            dateOfBirth: '1980-01-01',
            parents: ['parent1'],
          },
        },
      ];

      expect(validateMaxParents('node1', nodes)).toBe(true);
    });

    it('returns true for node with 2 parents', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'node1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'node1',
            name: 'Node 1',
            dateOfBirth: '1980-01-01',
            parents: ['parent1', 'parent2'],
          },
        },
      ];

      expect(validateMaxParents('node1', nodes)).toBe(true);
    });

    it('returns false for node with more than 2 parents', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'node1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'node1',
            name: 'Node 1',
            dateOfBirth: '1980-01-01',
            parents: ['parent1', 'parent2', 'parent3'],
          },
        },
      ];

      expect(validateMaxParents('node1', nodes)).toBe(false);
    });

    it('returns true for non-existent node', () => {
      const nodes: Node<FamilyNodeData>[] = [];
      expect(validateMaxParents('node1', nodes)).toBe(true);
    });
  });
});
