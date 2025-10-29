import { calculateEarliestDateOfBirth } from '@/libs/nodes';
import { Node } from 'reactflow';
import { FamilyNodeData } from '@/types/FamilyNodeData';

describe('calculateEarliestDateOfBirth', () => {
  it('returns the earliest date among nodes', () => {
    const nodes: Node<FamilyNodeData>[] = [
      { id: '1', type: 'family', position: { x: 0, y: 0 }, data: { id: '1', name: 'A', dateOfBirth: '2000-01-01', createdAt: 0, children: [], parents: [], partners: [] } },
      { id: '2', type: 'family', position: { x: 0, y: 0 }, data: { id: '2', name: 'B', dateOfBirth: '1980-05-10', createdAt: 0, children: [], parents: [], partners: [] } },
      { id: '3', type: 'family', position: { x: 0, y: 0 }, data: { id: '3', name: 'C', dateOfBirth: '1990-07-20', createdAt: 0, children: [], parents: [], partners: [] } },
    ];

    const earliest = calculateEarliestDateOfBirth(nodes);
    expect(earliest).toBeInstanceOf(Date);
    expect(earliest.toISOString().startsWith('1980-05-10')).toBe(true);
  });

  it('ignores nodes without dateOfBirth', () => {
    const nodes: Node<FamilyNodeData>[] = [
      { id: '1', type: 'family', position: { x: 0, y: 0 }, data: { id: '1', name: 'A', dateOfBirth: '', createdAt: 0, children: [], parents: [], partners: [] } },
    ];

    const earliest = calculateEarliestDateOfBirth(nodes);
    expect(earliest).toBeInstanceOf(Date);
  });
});
