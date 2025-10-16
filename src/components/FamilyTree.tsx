"use client";


import React, { useState, useCallback, useRef } from "react";
import ReactFlow, { Background, Controls, Node, Edge, ReactFlowInstance, BackgroundVariant, useNodesState, useEdgesState, applyNodeChanges, applyEdgeChanges } from "reactflow";
import "reactflow/dist/style.css";
import { FamilyNodeData } from "./FamilyNode";
import Toolbar from "./Toolbar";
import { getElkLayout } from "./autoLayout";
import { Dialog, Button, Typography, Box, Stack, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import FamilyDetailsPane, { EditMode } from "./FamilyDetailsPane";
import { FamilyNodeType, FamilyTreeData, generateId, getInitialTree, initialRootId, nodeTypes } from "@/libs/familyTreeUtils";
import { treeToFlow, flowToTree } from '@/libs/flowConverters';

const GRID_SIZE = 20;

export default function FamilyTree() {
  const [tree, setTree] = useState<FamilyTreeData>(getInitialTree());
  const [selectedId, setSelectedId] = useState<string | null>(initialRootId);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [showGrid, setShowGrid] = useState(true);
  // For manual connect
  const [connectDialog, setConnectDialog] = useState<{ open: boolean; source: string; target: string } | null>(null);
  const [connectType, setConnectType] = useState<'partner' | 'child' | 'parent' | 'sibling'>('partner');
  // Handle manual connection between nodes
  const onConnect = useCallback((params: { source: string | null; target: string | null }) => {
    if (!params.source || !params.target) return;
    setConnectDialog({ open: true, source: params.source, target: params.target });
    setConnectType('partner');
  }, []);

  const handleConnectConfirm = () => {
    if (!connectDialog) return;
    const { source, target } = connectDialog;
    let updatedTree = { ...tree };
    if (connectType === 'partner') {
      // Add each as partner to the other
      updatedTree[source] = {
        ...updatedTree[source],
        partners: [...(updatedTree[source].partners || []), target],
      };
      updatedTree[target] = {
        ...updatedTree[target],
        partners: [...(updatedTree[target].partners || []), source],
      };
    } else if (connectType === 'child') {
      // Source is parent, target is child
      updatedTree[source] = {
        ...updatedTree[source],
        children: [...(updatedTree[source].children || []), target],
      };
      updatedTree[target] = {
        ...updatedTree[target],
        parentIds: [...(updatedTree[target].parentIds || []), source],
      };
    } else if (connectType === 'parent') {
      // Source is child, target is parent
      updatedTree[target] = {
        ...updatedTree[target],
        children: [...(updatedTree[target].children || []), source],
      };
      updatedTree[source] = {
        ...updatedTree[source],
        parentIds: [...(updatedTree[source].parentIds || []), target],
      };
    } else if (connectType === 'sibling') {
      // Add all parents of source to target and vice versa
      const sourceParents = updatedTree[source].parentIds || [];
      const targetParents = updatedTree[target].parentIds || [];
      updatedTree[source] = {
        ...updatedTree[source],
        parentIds: Array.from(new Set([...(updatedTree[source].parentIds || []), ...targetParents])),
      };
      updatedTree[target] = {
        ...updatedTree[target],
        parentIds: Array.from(new Set([...(updatedTree[target].parentIds || []), ...sourceParents])),
      };
      // Add both as children to all shared parents
      [...sourceParents, ...targetParents].forEach(pid => {
        updatedTree[pid] = {
          ...updatedTree[pid],
          children: Array.from(new Set([...(updatedTree[pid].children || []), source, target])),
        };
      });
    }
    setTree(updatedTree);
    // sync flow representation
    syncFlowFromTree(updatedTree);
    setConnectDialog(null);
  };
  const handleConnectCancel = () => setConnectDialog(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const syncFlowFromTree = (treeState?: FamilyTreeData) => {
    const src = treeState || tree;
    const flow = treeToFlow(src);
    setRfNodes(flow.nodes as any);
    setRfEdges(flow.edges as any);
  };

  // Convert tree to flow using converter
  const initialFlow = treeToFlow(tree);
  const initialNodes = initialFlow.nodes as Node<FamilyNodeData>[];
  const initialEdges = initialFlow.edges as Edge[];

  // Use React Flow state hooks
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Add node logic (stage in left pane)
  const handleAddNode = (relation: "parent" | "sibling" | "child" | "partner") => {
    if (!selectedId) return;
    setEditMode({ type: "add", relation });
  };

  // Edit node logic (stage in left pane)
  const handleEditNode = () => {
    if (!selectedId) return;
    setEditMode({ type: "edit", nodeId: selectedId });
  };


  // Cancel add/edit
  const handleCancel = () => {
    setEditMode(null);
  };

  const handleDeleteNode = () => {
    if (!selectedId) return;
    const updated = { ...tree };
    // Remove node from parents' children, partners, and children's parentIds
    Object.values(updated).forEach(n => {
      n.children = (n.children || []).filter(cid => cid !== selectedId);
      n.partners = (n.partners || []).filter(pid => pid !== selectedId);
      n.parentIds = (n.parentIds || []).filter(pid => pid !== selectedId);
    });
    delete updated[selectedId];
    // Select another node if any left
    const remainingIds = Object.keys(updated);
    setTree(updated);
    syncFlowFromTree(updated);
    setSelectedId(remainingIds.length > 0 ? remainingIds[0] : null);
  }

  // Save add/edit (form comes from FamilyDetailsPane)
  const handleSave = (form: { name: string; dob: string; dod?: string; countryOfBirth?: string; gender?: 'Male' | 'Female'; occupation?: string; maidenName?: string }) => {
    if (editMode?.type === "add" && selectedId) {
      const newId = generateId();
      const selected = tree[selectedId];
      let updatedTree = { ...tree };
      if (editMode.relation === "parent") {
        // Add a new parent to selected node (multiple parents supported)
        const newNode: FamilyNodeType = {
          id: newId,
          name: form.name,
          dob: form.dob,
          dod: form.dod || "",
          countryOfBirth: form.countryOfBirth || "",
          gender: form.gender,
          occupation: form.occupation || "",
          maidenName: form.maidenName || "",
          children: [selected.id],
          parentIds: [],
          partners: [],
        };
        updatedTree[newId] = newNode;
        updatedTree[selected.id] = {
          ...selected,
          parentIds: [...(selected.parentIds || []), newId],
        };
        setTree(updatedTree);
        syncFlowFromTree(updatedTree);
        setEditMode(null);
        return;
      } else if (editMode.relation === "sibling") {
        // Add a new sibling (inherits all parents from selected)
        const parentIds = [...(selected.parentIds || [])];
        const newNode: FamilyNodeType = {
          id: newId,
          name: form.name,
          dob: form.dob,
          dod: form.dod || "",
          countryOfBirth: form.countryOfBirth || "",
          gender: form.gender,
          occupation: form.occupation || "",
          maidenName: form.maidenName || "",
          parentIds,
          children: [],
          partners: [],
        };
        updatedTree[newId] = newNode;
        // Ensure all parents' children arrays include all siblings (including selected and new)
        parentIds.forEach(parentId => {
          const allSiblings = Array.from(new Set([...(updatedTree[parentId].children || []), selected.id, newId]));
          updatedTree[parentId] = {
            ...updatedTree[parentId],
            children: allSiblings,
          };
        });
      } else if (editMode.relation === "child") {
        // Add a new child to selected node
        const newNode: FamilyNodeType = {
          id: newId,
          name: form.name,
          dob: form.dob,
          dod: form.dod || "",
          countryOfBirth: form.countryOfBirth || "",
          gender: form.gender,
          occupation: form.occupation || "",
          maidenName: form.maidenName || "",
          parentIds: [selected.id],
          children: [],
          partners: [],
        };
        updatedTree[newId] = newNode;
        updatedTree[selected.id] = {
          ...selected,
          children: [...selected.children, newId],
        };
      } else if (editMode.relation === "partner") {
        // Add a partner to selected node
        // If selected node has children, new partner should also be parent of those children
        const sharedChildren = selected.children || [];
        const newNode: FamilyNodeType = {
          id: newId,
          name: form.name,
          dob: form.dob,
          dod: form.dod || "",
          countryOfBirth: form.countryOfBirth || "",
          gender: form.gender,
          occupation: form.occupation || "",
          maidenName: form.maidenName || "",
          parentIds: [],
          children: [...sharedChildren],
          partners: [selected.id],
        };
        updatedTree[newId] = newNode;
        updatedTree[selected.id] = {
          ...selected,
          partners: [...(selected.partners || []), newId],
        };
        // For each shared child, add new partner as parent
        sharedChildren.forEach(childId => {
          if (updatedTree[childId]) {
            updatedTree[childId] = {
              ...updatedTree[childId],
              parentIds: Array.from(new Set([...(updatedTree[childId].parentIds || []), newId]))
            };
          }
        });
      }
      setTree(updatedTree);
      syncFlowFromTree(updatedTree);
      setEditMode(null);
    } else if (editMode?.type === "edit" && editMode.nodeId) {
      setTree(prev => ({
        ...prev,
        [editMode.nodeId!]: {
          ...prev[editMode.nodeId!],
          name: form.name,
          dob: form.dob,
          dod: form.dod || "",
          countryOfBirth: form.countryOfBirth || "",
          gender: form.gender,
          occupation: form.occupation || "",
          maidenName: form.maidenName || "",
        },
      }));
      syncFlowFromTree();
      setEditMode(null);
    }
  };

  // Node click handler
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedId(node.id);
  }, []);

  // Drag end: update node position in model
  const onNodeDragStop = useCallback((_: any, node: Node) => {
    // update rfNodes position via setRfNodes
    setRfNodes((nds) => nds.map(n => n.id === node.id ? { ...n, position: { x: Math.round(node.position.x / GRID_SIZE) * GRID_SIZE, y: Math.round(node.position.y / GRID_SIZE) * GRID_SIZE } } : n));
    // and sync to tree
    setTree((prev) => ({
      ...prev,
      [node.id]: {
        ...prev[node.id],
        x: Math.round(node.position.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(node.position.y / GRID_SIZE) * GRID_SIZE,
      },
    }));
  }, []);

  // Auto layout
  const handleAutoLayout = async () => {
    const newNodes = await getElkLayout(rfNodes, rfEdges);
    // Update rfNodes positions
    setRfNodes((nds) => nds.map(n => {
      const found = newNodes.find(nn => nn.id === n.id);
      return found ? { ...n, position: found.position } : n;
    }));
    // Sync back to tree
    const updatedTree = flowToTree(newNodes, rfEdges, tree);
    setTree(updatedTree);
  };

  // Toggle grid
  const handleToggleGrid = () => setShowGrid((g) => !g);

  // Zoom fit
  const handleZoomFit = () => {
    if (rfInstance) rfInstance.fitView();
  };

  // New tree
  const handleNew = () => {
    const nt = getInitialTree();
    setTree(nt);
    syncFlowFromTree(nt);
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#f3f6fa' }}>
      <Box sx={{ px: 0, py: 1, width: '100%', boxShadow: 2, bgcolor: 'primary.main', color: 'primary.contrastText', mb: 2 }}>
        <Typography variant="h6" sx={{ px: 3, py: 0, fontWeight: 700, letterSpacing: 1 }}>Family Tree Builder</Typography>
      </Box>
      <Stack direction="row" spacing={0} sx={{ height: 'calc(100vh - 64px)' }}>
        {/* Left: Node details */}
        <FamilyDetailsPane
          selectedNode={selectedId ? tree[selectedId] : null}
          editMode={editMode ? editMode : (selectedId ? { type: 'edit', nodeId: selectedId } : null)}
          onEdit={handleEditNode}
          onSave={handleSave}
          onCancel={handleCancel}
          onStartAdd={handleAddNode}
          onDelete={handleDeleteNode}
        />
        {/* Main: Toolbar + Graph */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f3f6fa' }}>
          <Toolbar
            onDelete={handleDeleteNode}
            onNew={handleNew}
            onAutoLayout={handleAutoLayout}
            onToggleGrid={handleToggleGrid}
            onZoomFit={handleZoomFit}
            onAddParent={() => handleAddNode('parent')}
            onAddSibling={() => handleAddNode('sibling')}
            onAddChild={() => handleAddNode('child')}
            onAddPartner={() => handleAddNode('partner')}
          />
          <Box ref={reactFlowWrapper} sx={{ flex: 1, minHeight: 0, background: '#f5f5f5', borderRadius: 2, boxShadow: 1, mx: 2, mb: 2 }}>
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              onNodesChange={(changes) => {
                const next = applyNodeChanges(changes, rfNodes);
                setRfNodes(next as any);
                // sync positional/data changes back to tree
                setTree(flowToTree(next, rfEdges, tree));
              }}
              onEdgesChange={(changes) => {
                const next = applyEdgeChanges(changes, rfEdges);
                setRfEdges(next as any);
                setTree(flowToTree(rfNodes, next, tree));
              }}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onNodeDragStop={onNodeDragStop}
              fitView
              snapToGrid={showGrid}
              snapGrid={[GRID_SIZE, GRID_SIZE]}
              onInit={setRfInstance}
              onConnect={onConnect}
            >
              {/* Manual connect dialog */}
              <Dialog open={!!connectDialog} onClose={handleConnectCancel}>
                <Box sx={{ p: 2, minWidth: 320 }}>
                  <Typography variant="h6">Add Relationship</Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="rel-type-label">Relationship</InputLabel>
                    <Select
                      labelId="rel-type-label"
                      value={connectType}
                      label="Relationship"
                      onChange={e => setConnectType(e.target.value as any)}
                    >
                      <MenuItem value="partner">Partner (Married)</MenuItem>
                      <MenuItem value="child">Child</MenuItem>
                      <MenuItem value="parent">Parent</MenuItem>
                      <MenuItem value="sibling">Sibling</MenuItem>
                    </Select>
                  </FormControl>
                  <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                    <Button onClick={handleConnectCancel}>Cancel</Button>
                    <Button variant="contained" onClick={handleConnectConfirm}>Add</Button>
                  </Stack>
                </Box>
              </Dialog>
              <Controls />
              <Background gap={GRID_SIZE} color="#e0e0e0" variant={showGrid ? BackgroundVariant.Lines : BackgroundVariant.Dots} />
            </ReactFlow>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}