"use client";

import React, { useState, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Stack,
    Alert,
} from "@mui/material";
import {
    ExpandMore,
    PersonAdd,
    PersonRemove,
    Edit,
    Link as LinkIcon,
    LinkOff,
    Warning,
} from "@mui/icons-material";
import { FamilyTreeObject } from "@/types/FamilyTreeObject";
import { Node, Edge } from "reactflow";
import { FamilyNodeData } from "@/types/FamilyNodeData";

type TreeMergeDialogProps = {
    open: boolean;
    onClose: () => void;
    existingTree: FamilyTreeObject;
    incomingTree: FamilyTreeObject;
    onApplyChanges: (mergedTree: FamilyTreeObject) => void;
};

type FieldChange = {
    field: string;
    label: string;
    oldValue: string | string[] | null | undefined;
    newValue: string | string[] | null | undefined;
    selected: boolean;
};

type NodeChange = {
    id: string;
    type: 'added' | 'modified' | 'deleted';
    existingNode?: Node;
    incomingNode?: Node;
    selected: boolean;
    fieldChanges?: FieldChange[]; // Only for 'modified' type
};

type EdgeChange = {
    id: string;
    type: 'added' | 'deleted';
    edge: Edge;
    selected: boolean;
};

// Helper to compare string arrays
const areArraysEqual = (arr1?: string[], arr2?: string[]): boolean => {
    if (!arr1 && !arr2) return true;
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((val, idx) => val === sorted2[idx]);
};

// Helper function to compare node data more reliably
const areNodesEqual = (node1: Node, node2: Node): boolean => {
    const data1 = node1.data as FamilyNodeData;
    const data2 = node2.data as FamilyNodeData;
    
    return (
        node1.position.x === node2.position.x &&
        node1.position.y === node2.position.y &&
        data1.name === data2.name &&
        data1.dateOfBirth === data2.dateOfBirth &&
        data1.dateOfDeath === data2.dateOfDeath &&
        data1.countryOfBirth === data2.countryOfBirth &&
        data1.gender === data2.gender &&
        data1.occupation === data2.occupation &&
        data1.maidenName === data2.maidenName &&
        data1.image === data2.image &&
        areArraysEqual(data1.parents, data2.parents) &&
        areArraysEqual(data1.children, data2.children) &&
        areArraysEqual(data1.partners, data2.partners)
    );
};

// Helper function to detect field-level changes in modified nodes
const detectFieldChanges = (existingNode: Node, incomingNode: Node): FieldChange[] => {
    const existingData = existingNode.data as FamilyNodeData;
    const incomingData = incomingNode.data as FamilyNodeData;
    const changes: FieldChange[] = [];

    // Check position changes
    if (existingNode.position.x !== incomingNode.position.x || existingNode.position.y !== incomingNode.position.y) {
        changes.push({
            field: 'position',
            label: 'Node Position',
            oldValue: null, // We don't show coordinates to user
            newValue: null,
            selected: true,
        });
    }

    // Check data field changes
    if (existingData.name !== incomingData.name) {
        changes.push({
            field: 'name',
            label: 'Name',
            oldValue: existingData.name,
            newValue: incomingData.name,
            selected: true,
        });
    }

    if (existingData.dateOfBirth !== incomingData.dateOfBirth) {
        changes.push({
            field: 'dateOfBirth',
            label: 'Date of Birth',
            oldValue: existingData.dateOfBirth,
            newValue: incomingData.dateOfBirth,
            selected: true,
        });
    }

    if (existingData.dateOfDeath !== incomingData.dateOfDeath) {
        changes.push({
            field: 'dateOfDeath',
            label: 'Date of Death',
            oldValue: existingData.dateOfDeath || 'None',
            newValue: incomingData.dateOfDeath || 'None',
            selected: true,
        });
    }

    if (existingData.countryOfBirth !== incomingData.countryOfBirth) {
        changes.push({
            field: 'countryOfBirth',
            label: 'Country of Birth',
            oldValue: existingData.countryOfBirth || 'None',
            newValue: incomingData.countryOfBirth || 'None',
            selected: true,
        });
    }

    if (existingData.gender !== incomingData.gender) {
        changes.push({
            field: 'gender',
            label: 'Gender',
            oldValue: existingData.gender || 'None',
            newValue: incomingData.gender || 'None',
            selected: true,
        });
    }

    if (existingData.occupation !== incomingData.occupation) {
        changes.push({
            field: 'occupation',
            label: 'Occupation',
            oldValue: existingData.occupation || 'None',
            newValue: incomingData.occupation || 'None',
            selected: true,
        });
    }

    if (existingData.maidenName !== incomingData.maidenName) {
        changes.push({
            field: 'maidenName',
            label: 'Maiden Name',
            oldValue: existingData.maidenName || 'None',
            newValue: incomingData.maidenName || 'None',
            selected: true,
        });
    }

    if (existingData.image !== incomingData.image) {
        changes.push({
            field: 'image',
            label: 'Photo',
            oldValue: existingData.image ? 'Set' : 'None',
            newValue: incomingData.image ? 'Set' : 'None',
            selected: true,
        });
    }

    if (!areArraysEqual(existingData.parents, incomingData.parents)) {
        changes.push({
            field: 'parents',
            label: 'Parents',
            oldValue: existingData.parents,
            newValue: incomingData.parents,
            selected: true,
        });
    }

    if (!areArraysEqual(existingData.children, incomingData.children)) {
        changes.push({
            field: 'children',
            label: 'Children',
            oldValue: existingData.children,
            newValue: incomingData.children,
            selected: true,
        });
    }

    if (!areArraysEqual(existingData.partners, incomingData.partners)) {
        changes.push({
            field: 'partners',
            label: 'Partners',
            oldValue: existingData.partners,
            newValue: incomingData.partners,
            selected: true,
        });
    }

    return changes;
};

export const TreeMergeDialog: React.FC<TreeMergeDialogProps> = ({
    open,
    onClose,
    existingTree,
    incomingTree,
    onApplyChanges,
}) => {
    const { nodeChanges, edgeChanges } = useMemo(() => {
        const existingNodeMap = new Map(existingTree.nodes.map(n => [n.id, n]));
        const incomingNodeMap = new Map(incomingTree.nodes.map(n => [n.id, n]));
        const existingEdgeMap = new Map(existingTree.edges.map(e => [e.id, e]));
        const incomingEdgeMap = new Map(incomingTree.edges.map(e => [e.id, e]));

        const nodeChanges: NodeChange[] = [];
        const edgeChanges: EdgeChange[] = [];

        // Detect added and modified nodes
        for (const [id, incomingNode] of incomingNodeMap) {
            const existingNode = existingNodeMap.get(id);
            if (!existingNode) {
                nodeChanges.push({
                    id,
                    type: 'added',
                    incomingNode,
                    selected: true,
                });
            } else if (!areNodesEqual(existingNode, incomingNode)) {
                const fieldChanges = detectFieldChanges(existingNode, incomingNode);
                nodeChanges.push({
                    id,
                    type: 'modified',
                    existingNode,
                    incomingNode,
                    selected: true,
                    fieldChanges,
                });
            }
        }

        // Detect deleted nodes
        for (const [id, existingNode] of existingNodeMap) {
            if (!incomingNodeMap.has(id)) {
                nodeChanges.push({
                    id,
                    type: 'deleted',
                    existingNode,
                    selected: true,
                });
            }
        }

        // Detect added edges
        for (const [id, incomingEdge] of incomingEdgeMap) {
            if (!existingEdgeMap.has(id)) {
                edgeChanges.push({
                    id,
                    type: 'added',
                    edge: incomingEdge,
                    selected: true,
                });
            }
        }

        // Detect deleted edges
        for (const [id, existingEdge] of existingEdgeMap) {
            if (!incomingEdgeMap.has(id)) {
                edgeChanges.push({
                    id,
                    type: 'deleted',
                    edge: existingEdge,
                    selected: true,
                });
            }
        }

        return { nodeChanges, edgeChanges };
    }, [existingTree, incomingTree]);

    const [selectedNodeChanges, setSelectedNodeChanges] = useState<Map<string, boolean>>(() => 
        new Map(nodeChanges.map(nc => [nc.id, nc.selected]))
    );
    const [selectedEdgeChanges, setSelectedEdgeChanges] = useState<Map<string, boolean>>(() =>
        new Map(edgeChanges.map(ec => [ec.id, ec.selected]))
    );
    // Map of nodeId -> field -> boolean for field-level selections
    const [selectedFieldChanges, setSelectedFieldChanges] = useState<Map<string, Map<string, boolean>>>(() => {
        const map = new Map<string, Map<string, boolean>>();
        nodeChanges.forEach(nc => {
            if (nc.type === 'modified' && nc.fieldChanges) {
                const fieldMap = new Map<string, boolean>();
                nc.fieldChanges.forEach(fc => {
                    fieldMap.set(fc.field, fc.selected);
                });
                map.set(nc.id, fieldMap);
            }
        });
        return map;
    });

    // Reset selections when trees change
    React.useEffect(() => {
        setSelectedNodeChanges(new Map(nodeChanges.map(nc => [nc.id, nc.selected])));
        setSelectedEdgeChanges(new Map(edgeChanges.map(ec => [ec.id, ec.selected])));
        const fieldMap = new Map<string, Map<string, boolean>>();
        nodeChanges.forEach(nc => {
            if (nc.type === 'modified' && nc.fieldChanges) {
                const innerMap = new Map<string, boolean>();
                nc.fieldChanges.forEach(fc => {
                    innerMap.set(fc.field, fc.selected);
                });
                fieldMap.set(nc.id, innerMap);
            }
        });
        setSelectedFieldChanges(fieldMap);
    }, [nodeChanges, edgeChanges]);

    const handleNodeToggle = (id: string) => {
        const nodeChange = nodeChanges.find(nc => nc.id === id);
        const newValue = !selectedNodeChanges.get(id);
        
        setSelectedNodeChanges(prev => {
            const newMap = new Map(prev);
            newMap.set(id, newValue);
            return newMap;
        });

        // For modified nodes, also toggle all field changes
        if (nodeChange?.type === 'modified' && nodeChange.fieldChanges) {
            setSelectedFieldChanges(prev => {
                const newMap = new Map(prev);
                const fieldMap = new Map<string, boolean>();
                nodeChange.fieldChanges!.forEach(fc => {
                    fieldMap.set(fc.field, newValue);
                });
                newMap.set(id, fieldMap);
                return newMap;
            });
        }
    };

    const handleFieldToggle = (nodeId: string, field: string) => {
        let newFieldMap: Map<string, boolean> | undefined;
        
        setSelectedFieldChanges(prev => {
            const newMap = new Map(prev);
            const fieldMap = new Map(prev.get(nodeId) || new Map());
            fieldMap.set(field, !fieldMap.get(field));
            newMap.set(nodeId, fieldMap);
            newFieldMap = fieldMap;
            return newMap;
        });

        // Update parent node selection based on whether any fields are selected after toggle
        if (newFieldMap) {
            const anySelected = Array.from(newFieldMap.values()).some(v => v);
            setSelectedNodeChanges(prev => {
                const newMap = new Map(prev);
                newMap.set(nodeId, anySelected);
                return newMap;
            });
        }
    };

    const handleEdgeToggle = (id: string) => {
        setSelectedEdgeChanges(prev => {
            const newMap = new Map(prev);
            newMap.set(id, !prev.get(id));
            return newMap;
        });
    };

    const handleSelectAllNodes = () => {
        const allSelected = nodeChanges.every(nc => selectedNodeChanges.get(nc.id));
        const newValue = !allSelected;
        
        setSelectedNodeChanges(new Map(nodeChanges.map(nc => [nc.id, newValue])));
        
        // Also update all field selections for modified nodes
        const newFieldMap = new Map<string, Map<string, boolean>>();
        nodeChanges.forEach(nc => {
            if (nc.type === 'modified' && nc.fieldChanges) {
                const fieldMap = new Map<string, boolean>();
                nc.fieldChanges.forEach(fc => {
                    fieldMap.set(fc.field, newValue);
                });
                newFieldMap.set(nc.id, fieldMap);
            }
        });
        setSelectedFieldChanges(newFieldMap);
    };

    const handleSelectAllEdges = () => {
        const allSelected = edgeChanges.every(ec => selectedEdgeChanges.get(ec.id));
        setSelectedEdgeChanges(new Map(edgeChanges.map(ec => [ec.id, !allSelected])));
    };

    const handleApply = () => {
        // Start with existing tree's nodes and edges
        const existingNodeMap = new Map(existingTree.nodes.map(n => [n.id, n]));
        const existingEdgeMap = new Map(existingTree.edges.map(e => [e.id, e]));

        // Apply selected node changes
        for (const change of nodeChanges) {
            if (change.type === 'added' && change.incomingNode && selectedNodeChanges.get(change.id)) {
                existingNodeMap.set(change.id, change.incomingNode);
            } else if (change.type === 'modified' && change.existingNode && change.incomingNode && change.fieldChanges) {
                // For modified nodes, check if any field changes are selected
                const fieldSelections = selectedFieldChanges.get(change.id);
                const hasSelectedFields = fieldSelections && Array.from(fieldSelections.values()).some(v => v);

                if (hasSelectedFields && fieldSelections) {
                    // Create a merged node starting from existing
                    const existingNode = change.existingNode;
                    const incomingNode = change.incomingNode;
                    const mergedNode = { ...existingNode };
                    const mergedData = { ...(existingNode.data as FamilyNodeData) };

                    // Apply each selected field change
                    change.fieldChanges.forEach(fc => {
                        if (fieldSelections.get(fc.field)) {
                            if (fc.field === 'position') {
                                mergedNode.position = { ...incomingNode.position };
                            } else {
                                // Apply data field change
                                const incomingData = incomingNode.data as FamilyNodeData;
                                const key = fc.field as keyof FamilyNodeData;
                                (mergedData as Record<string, unknown>)[fc.field] = incomingData[key];
                            }
                        }
                    });

                    mergedNode.data = mergedData;
                    existingNodeMap.set(change.id, mergedNode);
                }
            } else if (change.type === 'deleted' && selectedNodeChanges.get(change.id)) {
                existingNodeMap.delete(change.id);
            }
        }

        // Apply selected edge changes
        for (const change of edgeChanges) {
            if (selectedEdgeChanges.get(change.id)) {
                if (change.type === 'added') {
                    existingEdgeMap.set(change.id, change.edge);
                } else if (change.type === 'deleted') {
                    existingEdgeMap.delete(change.id);
                }
            }
        }

        const mergedTree: FamilyTreeObject = {
            ...existingTree,
            // Preserve existing tree name unless user explicitly wants to change it
            // Future enhancement: make tree name part of selectable changes
            nodes: Array.from(existingNodeMap.values()),
            edges: Array.from(existingEdgeMap.values()),
            updatedAt: Date.now(),
        };

        onApplyChanges(mergedTree);
        onClose();
    };

    const getNodeDisplayName = (node?: Node): string => {
        if (!node) return 'Unknown';
        const data = node.data as FamilyNodeData;
        return data.name || 'Unnamed Person';
    };

    const getChangeIcon = (type: 'added' | 'modified' | 'deleted') => {
        switch (type) {
            case 'added':
                return <PersonAdd color="success" />;
            case 'modified':
                return <Edit color="primary" />;
            case 'deleted':
                return <PersonRemove color="error" />;
        }
    };

    const getEdgeChangeIcon = (type: 'added' | 'deleted') => {
        return type === 'added' ? <LinkIcon color="success" /> : <LinkOff color="error" />;
    };

    const renderNodeChangeDetails = (change: NodeChange) => {
        if (change.type === 'added' && change.incomingNode) {
            const data = change.incomingNode.data as FamilyNodeData;
            return (
                <Box sx={{ pl: 2, fontSize: '0.875rem' }}>
                    <Typography variant="body2">Name: {data.name}</Typography>
                    {data.dateOfBirth && <Typography variant="body2">Birth: {data.dateOfBirth}</Typography>}
                    {data.dateOfDeath && <Typography variant="body2">Death: {data.dateOfDeath}</Typography>}
                </Box>
            );
        } else if (change.type === 'modified' && change.fieldChanges) {
            // Show individual field changes with checkboxes
            const fieldSelections = selectedFieldChanges.get(change.id);
            return (
                <Box sx={{ pl: 4, mt: 1 }}>
                    <Stack spacing={0.5}>
                        {change.fieldChanges.map(fc => (
                            <FormControlLabel
                                key={fc.field}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={fieldSelections?.get(fc.field) || false}
                                        onChange={() => handleFieldToggle(change.id, fc.field)}
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        {fc.label}:{' '}
                                        {fc.field === 'position' ? (
                                            <span style={{ color: '#1976d2' }}>Changed</span>
                                        ) : (
                                            <>
                                                <s>{String(fc.oldValue)}</s> → {String(fc.newValue)}
                                            </>
                                        )}
                                    </Typography>
                                }
                            />
                        ))}
                    </Stack>
                </Box>
            );
        } else if (change.type === 'deleted' && change.existingNode) {
            const data = change.existingNode.data as FamilyNodeData;
            return (
                <Box sx={{ pl: 2, fontSize: '0.875rem' }}>
                    <Typography variant="body2" color="text.secondary">
                        {data.name} will be removed
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    // Calculate total changes including field-level changes for modified nodes
    const totalChanges = nodeChanges.reduce((total, nc) => {
        if (nc.type === 'modified' && nc.fieldChanges) {
            return total + nc.fieldChanges.length;
        }
        return total + 1;
    }, 0) + edgeChanges.length;
    
    const selectedChangesCount = (() => {
        let count = 0;
        // Count selected added/deleted nodes
        nodeChanges.forEach(nc => {
            if (nc.type !== 'modified' && selectedNodeChanges.get(nc.id)) {
                count += 1;
            } else if (nc.type === 'modified') {
                // Count selected field changes
                const fieldSelections = selectedFieldChanges.get(nc.id);
                if (fieldSelections) {
                    count += Array.from(fieldSelections.values()).filter(Boolean).length;
                }
            }
        });
        // Count selected edge changes
        count += Array.from(selectedEdgeChanges.values()).filter(Boolean).length;
        return count;
    })();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="tree-merge-dialog-title"
        >
            <DialogTitle id="tree-merge-dialog-title">
                <Box display="flex" alignItems="center" gap={1}>
                    <Warning color="warning" />
                    Merge Family Trees
                </Box>
            </DialogTitle>
            <DialogContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                    The incoming tree <strong>{incomingTree.name}</strong> has {totalChanges} change(s) compared to your existing tree <strong>{existingTree.name}</strong>.
                    Select which changes to apply.
                </Alert>

                {nodeChanges.length > 0 && (
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box display="flex" alignItems="center" gap={1} width="100%">
                                <Typography variant="h6">Person Changes</Typography>
                                <Chip
                                    label={`${Array.from(selectedNodeChanges.values()).filter(Boolean).length} of ${nodeChanges.length} selected`}
                                    size="small"
                                    color="primary"
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" justifyContent="flex-end" mb={1}>
                                <Button size="small" onClick={handleSelectAllNodes}>
                                    Toggle All
                                </Button>
                            </Box>
                            <Stack spacing={1}>
                                {nodeChanges.map(change => (
                                    <Box
                                        key={change.id}
                                        sx={{
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            p: 1,
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedNodeChanges.get(change.id) || false}
                                                    onChange={() => handleNodeToggle(change.id)}
                                                />
                                            }
                                            label={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getChangeIcon(change.type)}
                                                    <Typography>
                                                        {change.type === 'added' && `Add: ${getNodeDisplayName(change.incomingNode)}`}
                                                        {change.type === 'modified' && `Modify: ${getNodeDisplayName(change.existingNode)}`}
                                                        {change.type === 'deleted' && `Delete: ${getNodeDisplayName(change.existingNode)}`}
                                                    </Typography>
                                                    <Chip
                                                        label={change.type}
                                                        size="small"
                                                        color={
                                                            change.type === 'added' ? 'success' :
                                                            change.type === 'modified' ? 'primary' : 'error'
                                                        }
                                                    />
                                                </Box>
                                            }
                                        />
                                        {renderNodeChangeDetails(change)}
                                    </Box>
                                ))}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                )}

                {edgeChanges.length > 0 && (
                    <Accordion defaultExpanded={nodeChanges.length === 0}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box display="flex" alignItems="center" gap={1} width="100%">
                                <Typography variant="h6">Relationship Changes</Typography>
                                <Chip
                                    label={`${Array.from(selectedEdgeChanges.values()).filter(Boolean).length} of ${edgeChanges.length} selected`}
                                    size="small"
                                    color="primary"
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" justifyContent="flex-end" mb={1}>
                                <Button size="small" onClick={handleSelectAllEdges}>
                                    Toggle All
                                </Button>
                            </Box>
                            <Stack spacing={1}>
                                {edgeChanges.map(change => (
                                    <Box
                                        key={change.id}
                                        sx={{
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            p: 1,
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedEdgeChanges.get(change.id) || false}
                                                    onChange={() => handleEdgeToggle(change.id)}
                                                />
                                            }
                                            label={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getEdgeChangeIcon(change.type)}
                                                    <Typography>
                                                        {change.type === 'added' ? 'Add' : 'Remove'} relationship: {change.edge.source} → {change.edge.target}
                                                    </Typography>
                                                    <Chip
                                                        label={change.type}
                                                        size="small"
                                                        color={change.type === 'added' ? 'success' : 'error'}
                                                    />
                                                </Box>
                                            }
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                )}

                {totalChanges === 0 && (
                    <Alert severity="success">
                        No changes detected between the trees. They are identical.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
                    {selectedChangesCount} of {totalChanges} changes selected
                </Typography>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleApply}
                    variant="contained"
                    color="primary"
                    disabled={selectedChangesCount === 0}
                >
                    Apply Selected Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};
