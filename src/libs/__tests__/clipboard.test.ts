import { copySelectedNodes, pasteClipboardData, ClipboardData } from '@/libs/clipboard';
import { Node, Edge } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';
import { RelationshipType } from '@/types/RelationshipEdgeData';

describe('clipboard utilities', () => {
  describe('copySelectedNodes', () => {
    it('returns null when no nodes are selected', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'a',
          type: 'family',
          position: { x: 0, y: 0 },
          data: { id: 'a', name: 'Alice', dateOfBirth: '1980-01-01' },
          selected: false
        }
      ];
      const edges: Edge[] = [];
      
      const result = copySelectedNodes(nodes, edges);
      expect(result).toBeNull();
    });

    it('copies selected nodes and their interlinking edges', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'a',
          type: 'family',
          position: { x: 0, y: 0 },
          data: { id: 'a', name: 'Alice', dateOfBirth: '1980-01-01' },
          selected: true
        },
        {
          id: 'b',
          type: 'family',
          position: { x: 100, y: 0 },
          data: { id: 'b', name: 'Bob', dateOfBirth: '1982-01-01' },
          selected: true
        },
        {
          id: 'c',
          type: 'family',
          position: { x: 200, y: 0 },
          data: { id: 'c', name: 'Charlie', dateOfBirth: '1985-01-01' },
          selected: false
        }
      ];
      
      const edges: Edge[] = [
        {
          id: 'partner-a-b',
          source: 'a',
          target: 'b',
          type: 'partner',
          data: { relationship: RelationshipType.Partner }
        },
        {
          id: 'parent-b-c',
          source: 'b',
          target: 'c',
          type: 'step',
          data: { relationship: RelationshipType.Parent }
        }
      ];
      
      const result = copySelectedNodes(nodes, edges);
      
      expect(result).not.toBeNull();
      expect(result!.nodes.length).toBe(2);
      expect(result!.nodes[0].id).toBe('a');
      expect(result!.nodes[1].id).toBe('b');
      
      // Only the partner edge between a and b should be included
      expect(result!.edges.length).toBe(1);
      expect(result!.edges[0].id).toBe('partner-a-b');
      expect(result!.edges[0].source).toBe('a');
      expect(result!.edges[0].target).toBe('b');
    });

    it('excludes edges that connect to non-selected nodes', () => {
      const nodes: Node<FamilyNodeData>[] = [
        {
          id: 'parent',
          type: 'family',
          position: { x: 0, y: 0 },
          data: { id: 'parent', name: 'Parent', dateOfBirth: '1950-01-01' },
          selected: false
        },
        {
          id: 'child1',
          type: 'family',
          position: { x: 0, y: 100 },
          data: { id: 'child1', name: 'Child 1', dateOfBirth: '1980-01-01' },
          selected: true
        },
        {
          id: 'child2',
          type: 'family',
          position: { x: 100, y: 100 },
          data: { id: 'child2', name: 'Child 2', dateOfBirth: '1982-01-01' },
          selected: true
        }
      ];
      
      const edges: Edge[] = [
        {
          id: 'parent-parent-child1',
          source: 'parent',
          target: 'child1',
          type: 'step',
          data: { relationship: RelationshipType.Parent }
        },
        {
          id: 'parent-parent-child2',
          source: 'parent',
          target: 'child2',
          type: 'step',
          data: { relationship: RelationshipType.Parent }
        }
      ];
      
      const result = copySelectedNodes(nodes, edges);
      
      expect(result).not.toBeNull();
      expect(result!.nodes.length).toBe(2);
      // No edges should be included because the parent is not selected
      expect(result!.edges.length).toBe(0);
    });
  });

  describe('pasteClipboardData', () => {
    it('creates new nodes with new IDs and offset positions', () => {
      const clipboardData: ClipboardData = {
        nodes: [
          {
            id: 'a',
            type: 'family',
            position: { x: 0, y: 0 },
            data: { id: 'a', name: 'Alice', dateOfBirth: '1980-01-01' },
            selected: false
          },
          {
            id: 'b',
            type: 'family',
            position: { x: 100, y: 0 },
            data: { id: 'b', name: 'Bob', dateOfBirth: '1982-01-01' },
            selected: false
          }
        ],
        edges: []
      };
      
      const existingNodes: Node<FamilyNodeData>[] = [];
      
      const result = pasteClipboardData(clipboardData, existingNodes);
      
      expect(result.nodes.length).toBe(2);
      
      // New IDs should be different from original
      expect(result.nodes[0].id).not.toBe('a');
      expect(result.nodes[1].id).not.toBe('b');
      
      // Positions should be offset
      expect(result.nodes[0].position.x).toBe(200); // 0 + 200
      expect(result.nodes[0].position.y).toBe(200); // 0 + 200
      expect(result.nodes[1].position.x).toBe(300); // 100 + 200
      expect(result.nodes[1].position.y).toBe(200); // 0 + 200
      
      // Data should be preserved
      expect(result.nodes[0].data.name).toBe('Alice');
      expect(result.nodes[1].data.name).toBe('Bob');
    });

    it('recreates edges with new node IDs', () => {
      const clipboardData: ClipboardData = {
        nodes: [
          {
            id: 'a',
            type: 'family',
            position: { x: 0, y: 0 },
            data: { id: 'a', name: 'Alice', dateOfBirth: '1980-01-01' },
            selected: false
          },
          {
            id: 'b',
            type: 'family',
            position: { x: 100, y: 0 },
            data: { id: 'b', name: 'Bob', dateOfBirth: '1982-01-01' },
            selected: false
          }
        ],
        edges: [
          {
            id: 'partner-a-b',
            source: 'a',
            target: 'b',
            type: 'partner',
            data: { relationship: RelationshipType.Partner, dateOfMarriage: '2005-06-15' }
          }
        ]
      };
      
      const existingNodes: Node<FamilyNodeData>[] = [];
      
      const result = pasteClipboardData(clipboardData, existingNodes);
      
      expect(result.edges.length).toBe(1);
      
      // Edge should have new source and target IDs
      const newEdge = result.edges[0];
      expect(newEdge.source).not.toBe('a');
      expect(newEdge.target).not.toBe('b');
      
      // Edge source and target should match the new node IDs
      expect(newEdge.source).toBe(result.nodes[0].id);
      expect(newEdge.target).toBe(result.nodes[1].id);
      
      // Edge data should be preserved
      expect(newEdge.data.relationship).toBe(RelationshipType.Partner);
      expect(newEdge.data.dateOfMarriage).toBe('2005-06-15');
      
      // Edge ID should be updated
      expect(newEdge.id).toContain('partner-');
    });

    it('applies custom offset values', () => {
      const clipboardData: ClipboardData = {
        nodes: [
          {
            id: 'a',
            type: 'family',
            position: { x: 100, y: 100 },
            data: { id: 'a', name: 'Alice', dateOfBirth: '1980-01-01' },
            selected: false
          }
        ],
        edges: []
      };
      
      const existingNodes: Node<FamilyNodeData>[] = [];
      
      const result = pasteClipboardData(clipboardData, existingNodes, 50, 75);
      
      expect(result.nodes[0].position.x).toBe(150); // 100 + 50
      expect(result.nodes[0].position.y).toBe(175); // 100 + 75
    });

    it('handles parent edges correctly', () => {
      const clipboardData: ClipboardData = {
        nodes: [
          {
            id: 'parent',
            type: 'family',
            position: { x: 0, y: 0 },
            data: { id: 'parent', name: 'Parent', dateOfBirth: '1950-01-01' },
            selected: false
          },
          {
            id: 'child',
            type: 'family',
            position: { x: 0, y: 100 },
            data: { id: 'child', name: 'Child', dateOfBirth: '1980-01-01' },
            selected: false
          }
        ],
        edges: [
          {
            id: 'parent-parent-child',
            source: 'parent',
            target: 'child',
            type: 'step',
            data: { relationship: RelationshipType.Parent }
          }
        ]
      };
      
      const existingNodes: Node<FamilyNodeData>[] = [];
      
      const result = pasteClipboardData(clipboardData, existingNodes);
      
      expect(result.edges.length).toBe(1);
      
      const newEdge = result.edges[0];
      expect(newEdge.id).toContain('parent-');
      expect(newEdge.data.relationship).toBe(RelationshipType.Parent);
    });
  });
});
