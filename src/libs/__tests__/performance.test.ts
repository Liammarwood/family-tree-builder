/**
 * Performance tests to validate optimizations
 */

import { Node, Edge } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';
import { calculateEarliestDateOfBirth } from '../nodes';
import { autoLayoutFamilyTree } from '../autoLayout';
import { RelationshipType } from '@/types/RelationshipEdgeData';

describe('Performance optimizations', () => {
  describe('calculateEarliestDateOfBirth', () => {
    it('should handle large arrays efficiently', () => {
      // Create 1000 nodes with dates
      const nodes: Node<FamilyNodeData>[] = [];
      const startYear = 1900;
      
      for (let i = 0; i < 1000; i++) {
        nodes.push({
          id: `node-${i}`,
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: `node-${i}`,
            name: `Person ${i}`,
            dateOfBirth: `${startYear + i}-01-01`,
            children: [],
          },
        });
      }
      
      const start = performance.now();
      const result = calculateEarliestDateOfBirth(nodes);
      const duration = performance.now() - start;
      
      // Should complete in less than 10ms for 1000 nodes
      expect(duration).toBeLessThan(10);
      expect(result.getFullYear()).toBe(startYear);
    });

    it('should handle nodes with no dates', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'node-1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'node-1',
            name: 'Person 1',
            dateOfBirth: '',
            children: [],
          },
        },
      ];
      
      const result = calculateEarliestDateOfBirth(nodes);
      
      // Should return current date when no valid dates
      expect(result.getTime()).toBeGreaterThan(Date.now() - 1000);
    });

    it('should handle mixed valid and invalid dates', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'node-1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'node-1',
            name: 'Person 1',
            dateOfBirth: '1950-01-01',
            children: [],
          },
        },
        {
          id: 'node-2',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'node-2',
            name: 'Person 2',
            dateOfBirth: '',
            children: [],
          },
        },
        {
          id: 'node-3',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'node-3',
            name: 'Person 3',
            dateOfBirth: '1960-01-01',
            children: [],
          },
        },
      ];
      
      const result = calculateEarliestDateOfBirth(nodes);
      expect(result.getFullYear()).toBe(1950);
    });
  });

  describe('autoLayoutFamilyTree', () => {
    it('should handle medium-sized trees efficiently', async () => {
      // Create a tree with 50 nodes
      const nodes: Node<FamilyNodeData>[] = [];
      const edges: Edge[] = [];
      
      for (let i = 0; i < 50; i++) {
        nodes.push({
          id: `node-${i}`,
          type: 'family',
          position: { x: Math.random() * 1000, y: Math.random() * 1000 },
          data: {
            id: `node-${i}`,
            name: `Person ${i}`,
            dateOfBirth: `1980-01-01`,
            children: [],
            parents: i > 0 ? [`node-${Math.floor(i / 2)}`] : [],
          },
        });
        
        // Add parent edges
        if (i > 0) {
          edges.push({
            id: `edge-${i}`,
            source: `node-${Math.floor(i / 2)}`,
            target: `node-${i}`,
            data: { relationship: RelationshipType.Parent },
          });
        }
      }
      
      const start = performance.now();
      const result = await autoLayoutFamilyTree(nodes, edges);
      const duration = performance.now() - start;
      
      // Should complete in less than 500ms for 50 nodes
      expect(duration).toBeLessThan(500);
      expect(result).toHaveLength(50);
      
      // All nodes should have positions
      result.forEach(node => {
        expect(node.position.x).toBeDefined();
        expect(node.position.y).toBeDefined();
      });
    });

    it('should optimize sibling grouping', async () => {
      // Create nodes with same parents (siblings)
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'parent1',
          type: 'family',
          position: { x: 0, y: 0 },
          data: {
            id: 'parent1',
            name: 'Parent 1',
            dateOfBirth: '1950-01-01',
            children: ['child1', 'child2', 'child3'],
          },
        },
        {
          id: 'parent2',
          type: 'family',
          position: { x: 100, y: 0 },
          data: {
            id: 'parent2',
            name: 'Parent 2',
            dateOfBirth: '1950-01-01',
            children: ['child1', 'child2', 'child3'],
          },
        },
        {
          id: 'child1',
          type: 'family',
          position: { x: 0, y: 200 },
          data: {
            id: 'child1',
            name: 'Child 1',
            dateOfBirth: '1980-01-01',
            children: [],
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
            dateOfBirth: '1982-01-01',
            children: [],
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
            dateOfBirth: '1984-01-01',
            children: [],
            parents: ['parent1', 'parent2'],
          },
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
          source: 'parent1',
          target: 'child2',
          data: { relationship: RelationshipType.Parent },
        },
        {
          id: 'edge3',
          source: 'parent1',
          target: 'child3',
          data: { relationship: RelationshipType.Parent },
        },
        {
          id: 'edge4',
          source: 'parent2',
          target: 'child1',
          data: { relationship: RelationshipType.Parent },
        },
        {
          id: 'edge5',
          source: 'parent2',
          target: 'child2',
          data: { relationship: RelationshipType.Parent },
        },
        {
          id: 'edge6',
          source: 'parent2',
          target: 'child3',
          data: { relationship: RelationshipType.Parent },
        },
      ];
      
      const start = performance.now();
      const result = await autoLayoutFamilyTree(nodes, edges);
      const duration = performance.now() - start;
      
      // Should complete quickly for small tree
      expect(duration).toBeLessThan(100);
      
      // Siblings should be at the same Y position
      const child1 = result.find(n => n.id === 'child1');
      const child2 = result.find(n => n.id === 'child2');
      const child3 = result.find(n => n.id === 'child3');
      
      expect(child1).toBeDefined();
      expect(child2).toBeDefined();
      expect(child3).toBeDefined();
      
      // All siblings should have same Y coordinate (allowing small floating point differences)
      if (child1 && child2 && child3) {
        expect(Math.abs(child1.position.y - child2.position.y)).toBeLessThan(1);
        expect(Math.abs(child2.position.y - child3.position.y)).toBeLessThan(1);
      }
    });
  });
});
