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

type NodeChange = {
    id: string;
    type: 'added' | 'modified' | 'deleted';
    existingNode?: Node;
    incomingNode?: Node;
    selected: boolean;
};

type EdgeChange = {
    id: string;
    type: 'added' | 'deleted';
    edge: Edge;
    selected: boolean;
};

// Helper function to compare node data more reliably
const areNodesEqual = (node1: Node, node2: Node): boolean => {
    const data1 = node1.data as FamilyNodeData;
    const data2 = node2.data as FamilyNodeData;
    
    return (
        data1.name === data2.name &&
        data1.dateOfBirth === data2.dateOfBirth &&
        data1.dateOfDeath === data2.dateOfDeath &&
        data1.countryOfBirth === data2.countryOfBirth &&
        data1.gender === data2.gender &&
        data1.occupation === data2.occupation &&
        data1.maidenName === data2.maidenName &&
        data1.image === data2.image &&
        JSON.stringify(data1.parents?.sort()) === JSON.stringify(data2.parents?.sort()) &&
        JSON.stringify(data1.children.sort()) === JSON.stringify(data2.children.sort()) &&
        JSON.stringify(data1.partners?.sort()) === JSON.stringify(data2.partners?.sort())
    );
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
                nodeChanges.push({
                    id,
                    type: 'modified',
                    existingNode,
                    incomingNode,
                    selected: true,
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

    // Reset selections when trees change
    React.useEffect(() => {
        setSelectedNodeChanges(new Map(nodeChanges.map(nc => [nc.id, nc.selected])));
        setSelectedEdgeChanges(new Map(edgeChanges.map(ec => [ec.id, ec.selected])));
    }, [nodeChanges, edgeChanges]);

    const handleNodeToggle = (id: string) => {
        setSelectedNodeChanges(prev => {
            const newMap = new Map(prev);
            newMap.set(id, !prev.get(id));
            return newMap;
        });
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
        setSelectedNodeChanges(new Map(nodeChanges.map(nc => [nc.id, !allSelected])));
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
            if (selectedNodeChanges.get(change.id)) {
                if (change.type === 'added' && change.incomingNode) {
                    existingNodeMap.set(change.id, change.incomingNode);
                } else if (change.type === 'modified' && change.incomingNode) {
                    existingNodeMap.set(change.id, change.incomingNode);
                } else if (change.type === 'deleted') {
                    existingNodeMap.delete(change.id);
                }
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
        } else if (change.type === 'modified' && change.existingNode && change.incomingNode) {
            const existingData = change.existingNode.data as FamilyNodeData;
            const incomingData = change.incomingNode.data as FamilyNodeData;
            return (
                <Box sx={{ pl: 2, fontSize: '0.875rem' }}>
                    {existingData.name !== incomingData.name && (
                        <Typography variant="body2">
                            Name: <s>{existingData.name}</s> → {incomingData.name}
                        </Typography>
                    )}
                    {existingData.dateOfBirth !== incomingData.dateOfBirth && (
                        <Typography variant="body2">
                            Birth: <s>{existingData.dateOfBirth}</s> → {incomingData.dateOfBirth}
                        </Typography>
                    )}
                    {existingData.dateOfDeath !== incomingData.dateOfDeath && (
                        <Typography variant="body2">
                            Death: <s>{existingData.dateOfDeath || 'None'}</s> → {incomingData.dateOfDeath || 'None'}
                        </Typography>
                    )}
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

    const totalChanges = nodeChanges.length + edgeChanges.length;
    const selectedChangesCount = 
        Array.from(selectedNodeChanges.values()).filter(Boolean).length +
        Array.from(selectedEdgeChanges.values()).filter(Boolean).length;

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
