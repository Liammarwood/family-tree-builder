import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TreeMergeDialog } from '@/components/TreeMergeDialog';
import { FamilyTreeObject } from '@/types/FamilyTreeObject';
import { Node, Edge } from 'reactflow';

describe('TreeMergeDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnApplyChanges = jest.fn();

    const createNode = (id: string, name: string): Node => ({
        id,
        type: 'family',
        position: { x: 0, y: 0 },
        data: {
            id,
            name,
            dateOfBirth: '1990-01-01',
            children: [],
        },
    });

    const createEdge = (id: string, source: string, target: string): Edge => ({
        id,
        source,
        target,
    });

    const existingTree: FamilyTreeObject = {
        id: 'tree-1',
        name: 'Existing Tree',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nodes: [
            createNode('person-1', 'John Doe'),
            createNode('person-2', 'Jane Doe'),
        ],
        edges: [
            createEdge('edge-1', 'person-1', 'person-2'),
        ],
    };

    const incomingTree: FamilyTreeObject = {
        id: 'tree-1',
        name: 'Updated Tree',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nodes: [
            createNode('person-1', 'John Smith'), // Modified name
            createNode('person-3', 'Bob Smith'),   // Added person
        ],
        edges: [
            createEdge('edge-2', 'person-1', 'person-3'), // Added edge
        ],
    };

    beforeEach(() => {
        mockOnClose.mockClear();
        mockOnApplyChanges.mockClear();
    });

    it('renders the dialog when open', () => {
        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        expect(screen.getByText(/Merge Family Trees/i)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <TreeMergeDialog
                open={false}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        expect(screen.queryByText(/Merge Family Trees/i)).not.toBeInTheDocument();
    });

    it('detects added nodes', () => {
        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        expect(screen.getByText(/Add: Bob Smith/i)).toBeInTheDocument();
    });

    it('detects modified nodes', () => {
        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        expect(screen.getByText(/Modify: John Doe/i)).toBeInTheDocument();
    });

    it('detects deleted nodes', () => {
        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        expect(screen.getByText(/Delete: Jane Doe/i)).toBeInTheDocument();
    });

    it('allows toggling individual changes', () => {
        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        // All checkboxes should be checked by default
        checkboxes.forEach(checkbox => {
            expect(checkbox).toBeChecked();
        });

        // Uncheck the first checkbox
        fireEvent.click(checkboxes[0]);
        expect(checkboxes[0]).not.toBeChecked();
    });

    it('calls onApplyChanges with merged tree when Apply is clicked', () => {
        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        const applyButton = screen.getByRole('button', { name: /Apply Selected Changes/i });
        fireEvent.click(applyButton);

        expect(mockOnApplyChanges).toHaveBeenCalledTimes(1);
        const mergedTree = mockOnApplyChanges.mock.calls[0][0] as FamilyTreeObject;
        expect(mergedTree).toBeDefined();
        expect(mergedTree.id).toBe(existingTree.id);
    });

    it('calls onClose when Cancel is clicked', () => {
        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockOnApplyChanges).not.toHaveBeenCalled();
    });

    it('disables Apply button when no changes are selected', async () => {
        // Create a simple tree with only one change to make testing easier
        const simpleExisting: FamilyTreeObject = {
            id: 'tree-1',
            name: 'Existing',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            nodes: [createNode('person-1', 'John Doe')],
            edges: [],
        };

        const simpleIncoming: FamilyTreeObject = {
            id: 'tree-1',
            name: 'Incoming',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            nodes: [createNode('person-2', 'Jane Doe')], // Different person (added)
            edges: [],
        };

        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={simpleExisting}
                incomingTree={simpleIncoming}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        const applyButton = screen.getByRole('button', { name: /Apply Selected Changes/i });
        
        // Initially enabled (all changes selected by default)
        expect(applyButton).not.toBeDisabled();

        // Uncheck all checkboxes
        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach(checkbox => {
            fireEvent.click(checkbox);
        });

        // Now should be disabled
        expect(applyButton).toBeDisabled();
    });

    it('shows correct change count', () => {
        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        // Should show total changes (3 node changes + 2 edge changes = 5)
        expect(screen.getByText(/5 of 5 changes selected/i)).toBeInTheDocument();
    });

    it('shows success message when trees are identical', () => {
        const identicalTree: FamilyTreeObject = {
            ...existingTree,
            name: 'Identical Tree',
        };

        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={identicalTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        expect(screen.getByText(/No changes detected/i)).toBeInTheDocument();
    });

    it('applies only selected changes', () => {
        render(
            <TreeMergeDialog
                open={true}
                onClose={mockOnClose}
                existingTree={existingTree}
                incomingTree={incomingTree}
                onApplyChanges={mockOnApplyChanges}
            />
        );

        // Uncheck the first node change (should be the modified node)
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[0]); // Uncheck first change

        const applyButton = screen.getByRole('button', { name: /Apply Selected Changes/i });
        fireEvent.click(applyButton);

        expect(mockOnApplyChanges).toHaveBeenCalledTimes(1);
        const mergedTree = mockOnApplyChanges.mock.calls[0][0] as FamilyTreeObject;
        
        // The first node should still have the old name since we didn't apply the modification
        const person1 = mergedTree.nodes.find(n => n.id === 'person-1');
        expect(person1?.data.name).toBe('John Doe');
    });

    describe('Field-level change selection', () => {
        const createNodeWithMultipleFields = (
            id: string, 
            name: string, 
            dateOfBirth: string,
            dateOfDeath?: string,
            occupation?: string,
            position?: { x: number; y: number }
        ): Node => ({
            id,
            type: 'family',
            position: position || { x: 0, y: 0 },
            data: {
                id,
                name,
                dateOfBirth,
                dateOfDeath,
                occupation,
                children: [],
            },
        });

        it('shows individual field changes for modified nodes', () => {
            const existingWithFields: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Existing',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Doe', '1990-01-01', undefined, 'Engineer', { x: 100, y: 200 }),
                ],
                edges: [],
            };

            const incomingWithFields: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Incoming',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Smith', '1990-01-01', '2020-12-31', 'Doctor', { x: 150, y: 250 }),
                ],
                edges: [],
            };

            render(
                <TreeMergeDialog
                    open={true}
                    onClose={mockOnClose}
                    existingTree={existingWithFields}
                    incomingTree={incomingWithFields}
                    onApplyChanges={mockOnApplyChanges}
                />
            );

            // Should show individual field changes
            expect(screen.getByText(/Name:/)).toBeInTheDocument();
            expect(screen.getByText(/Date of Death:/)).toBeInTheDocument();
            expect(screen.getByText(/Occupation:/)).toBeInTheDocument();
            expect(screen.getByText(/Node Position/)).toBeInTheDocument();
        });

        it('allows selecting/deselecting individual field changes', () => {
            const existingWithFields: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Existing',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Doe', '1990-01-01', undefined, 'Engineer'),
                ],
                edges: [],
            };

            const incomingWithFields: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Incoming',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Smith', '1990-01-01', '2020-12-31', 'Doctor'),
                ],
                edges: [],
            };

            render(
                <TreeMergeDialog
                    open={true}
                    onClose={mockOnClose}
                    existingTree={existingWithFields}
                    incomingTree={incomingWithFields}
                    onApplyChanges={mockOnApplyChanges}
                />
            );

            const checkboxes = screen.getAllByRole('checkbox');
            
            // All field checkboxes should be checked by default (parent + 3 field changes)
            // Parent checkbox + Name, DateOfDeath, Occupation = 4 total
            expect(checkboxes.length).toBe(4);
            
            // The first checkbox is the parent node checkbox
            // The subsequent checkboxes are field-level checkboxes
            // Check that we have field-level checkboxes by looking for one that's not the parent
            expect(checkboxes[1]).toBeChecked();
            fireEvent.click(checkboxes[1]); // Click first field checkbox (whatever it is)
            expect(checkboxes[1]).not.toBeChecked();
        });

        it('applies only selected field changes', () => {
            const existingWithFields: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Existing',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Doe', '1990-01-01', undefined, 'Engineer'),
                ],
                edges: [],
            };

            const incomingWithFields: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Incoming',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Smith', '1990-01-01', '2020-12-31', 'Doctor'),
                ],
                edges: [],
            };

            render(
                <TreeMergeDialog
                    open={true}
                    onClose={mockOnClose}
                    existingTree={existingWithFields}
                    incomingTree={incomingWithFields}
                    onApplyChanges={mockOnApplyChanges}
                />
            );

            const checkboxes = screen.getAllByRole('checkbox');
            
            // We should have: parent checkbox + name + dateOfDeath + occupation = 4
            // (dateOfBirth hasn't changed so no checkbox for it)
            expect(checkboxes.length).toBe(4);
            
            // Uncheck all checkboxes first to verify we can selectively enable
            checkboxes.forEach(cb => {
                if ((cb as HTMLInputElement).checked) {
                    fireEvent.click(cb);
                }
            });
            
            // Re-enable only the occupation and date of death fields (skip parent and name)
            // Index 0 = parent, Index 1 = name, Index 2 = dateOfDeath, Index 3 = occupation
            fireEvent.click(checkboxes[2]); // Select dateOfDeath
            fireEvent.click(checkboxes[3]); // Select occupation

            const applyButton = screen.getByRole('button', { name: /Apply Selected Changes/i });
            fireEvent.click(applyButton);

            expect(mockOnApplyChanges).toHaveBeenCalledTimes(1);
            const mergedTree = mockOnApplyChanges.mock.calls[0][0] as FamilyTreeObject;
            const person1 = mergedTree.nodes.find(n => n.id === 'person-1');
            
            // Name should remain unchanged (we didn't select it)
            expect(person1?.data.name).toBe('John Doe');
            // Date of Birth should remain unchanged (field didn't change)
            expect(person1?.data.dateOfBirth).toBe('1990-01-01');
            // Date of Death should be updated
            expect(person1?.data.dateOfDeath).toBe('2020-12-31');
            // Occupation should be updated
            expect(person1?.data.occupation).toBe('Doctor');
        });

        it('detects and shows position changes', () => {
            const existingWithPosition: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Existing',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Doe', '1990-01-01', undefined, undefined, { x: 100, y: 200 }),
                ],
                edges: [],
            };

            const incomingWithPosition: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Incoming',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Doe', '1990-01-01', undefined, undefined, { x: 300, y: 400 }),
                ],
                edges: [],
            };

            render(
                <TreeMergeDialog
                    open={true}
                    onClose={mockOnClose}
                    existingTree={existingWithPosition}
                    incomingTree={incomingWithPosition}
                    onApplyChanges={mockOnApplyChanges}
                />
            );

            // Should show position change without coordinates
            expect(screen.getByText(/Node Position/)).toBeInTheDocument();
            expect(screen.getByText(/Changed/)).toBeInTheDocument();
            // Should NOT show actual coordinates
            expect(screen.queryByText(/100/)).not.toBeInTheDocument();
            expect(screen.queryByText(/300/)).not.toBeInTheDocument();
        });

        it('applies position change when selected', () => {
            const existingWithPosition: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Existing',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Doe', '1990-01-01', undefined, undefined, { x: 100, y: 200 }),
                ],
                edges: [],
            };

            const incomingWithPosition: FamilyTreeObject = {
                id: 'tree-1',
                name: 'Incoming',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                nodes: [
                    createNodeWithMultipleFields('person-1', 'John Doe', '1990-01-01', undefined, undefined, { x: 300, y: 400 }),
                ],
                edges: [],
            };

            render(
                <TreeMergeDialog
                    open={true}
                    onClose={mockOnClose}
                    existingTree={existingWithPosition}
                    incomingTree={incomingWithPosition}
                    onApplyChanges={mockOnApplyChanges}
                />
            );

            const applyButton = screen.getByRole('button', { name: /Apply Selected Changes/i });
            fireEvent.click(applyButton);

            expect(mockOnApplyChanges).toHaveBeenCalledTimes(1);
            const mergedTree = mockOnApplyChanges.mock.calls[0][0] as FamilyTreeObject;
            const person1 = mergedTree.nodes.find(n => n.id === 'person-1');
            
            // Position should be updated
            expect(person1?.position.x).toBe(300);
            expect(person1?.position.y).toBe(400);
        });
    });
});
