"use client";


import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, MarkerType, ReactFlowInstance, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import { FamilyNodeData } from "./FamilyNode";
import Toolbar from "./Toolbar";
import { getElkLayout } from "./autoLayout";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { Dialog, TextField, Button, Typography, Box, Divider, Stack, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import FamilyDetailsPane, { EditMode } from "./FamilyDetailsPane";
import { FamilyNodeType, FamilyTreeData, generateId, getInitialTree, initialRootId, nodeTypes, computeGenerations } from "@/libs/familyTreeUtils";

const GRID_SIZE = 20;

export default function FamilyTree() {
  const [tree, setTree] = useState<FamilyTreeData>(getInitialTree());
  const [selectedId, setSelectedId] = useState<string | null>(initialRootId);
  const [editMode, setEditMode] = useState<EditMode>(null);

  const [showGrid, setShowGrid] = useState(true);
  const [compactLayout, setCompactLayout] = useState(false);
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
    setConnectDialog(null);
  };

  const handleConnectCancel = () => setConnectDialog(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Convert tree to reactflow nodes/edges
  // Compute generations dynamically
  const generations = computeGenerations(tree);
  const nodes: Node<FamilyNodeData>[] = Object.values(tree).map((node) => ({
    id: node.id,
    type: "family",
    data: { name: node.name, dob: node.dob, countryOfBirth: node.countryOfBirth, dod: node.dod, occupation: node.occupation, maidenName: node.maidenName, photo: node.photo },
    position: node.x !== undefined && node.y !== undefined ? { x: node.x, y: node.y } : { x: (generations[node.id] || 0) * 250, y: 100 * Math.random() },
    selected: selectedId === node.id,
  }));

  // --- Shared parent connection logic ---
  // 1. Find all unique parent groups (with >1 parent and >1 child)
  const parentGroupMap: { [groupKey: string]: { parents: string[], children: string[] } } = {};
  Object.values(tree).forEach(node => {
    const parents = node.parentIds?.slice().sort() || [];
    if (parents.length > 1) {
      const key = parents.join(",");
      if (!parentGroupMap[key]) parentGroupMap[key] = { parents, children: [] };
      parentGroupMap[key].children.push(node.id);
    }
  });

  // 2. Build nodes: add dummy nodes for each parent group
  const dummyNodes: Node[] = [];
  Object.entries(parentGroupMap).forEach(([key, group], i) => {
    if (group.children.length > 1) {
      dummyNodes.push({
        id: `parentgroup-${key}`,
        type: 'input', // invisible, but must exist
        data: { label: '' },
        position: { x: 0, y: 0 },
        hidden: true,
      });
    }
  });

  // 3. Build edges: use dummy node for shared parent group, otherwise direct parent->child
  const edges: Edge[] = [];
  const siblingEdgeIds = new Set<string>();
  Object.values(tree).forEach((node) => {
    const parents = node.parentIds?.slice().sort() || [];
    let usedDummy = false;
    if (parents.length > 1) {
      const key = parents.join(",");
      const group = parentGroupMap[key];
      if (group && group.children.length > 1) {
        // Use dummy node for this group
        edges.push({
          id: `pg-${key}->${node.id}`,
          source: `parentgroup-${key}`,
          target: node.id,
          markerEnd: { type: MarkerType.ArrowClosed },
          label: 'Parent',
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#fff', color: '#333', fillOpacity: 0.8 },
        });
        usedDummy = true;
      }
    }
    if (!usedDummy) {
      // Direct parent->child edges
      parents.forEach(parentId => {
        edges.push({
          id: `${parentId}->${node.id}`,
          source: parentId,
          target: node.id,
          markerEnd: { type: MarkerType.ArrowClosed },
          label: 'Parent',
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#fff', color: '#333', fillOpacity: 0.8 },
        });
      });
    }
    // Sibling edges: link all nodes with the same parent(s)
    (node.parentIds || []).forEach((parentId) => {
      const siblings = (tree[parentId]?.children || []).filter((id) => id !== node.id);
      siblings.forEach((sibId) => {
        // Always sort ids to ensure uniqueness regardless of order
        const [a, b] = [node.id, sibId].sort();
        const edgeId = `sib-${a}-${b}`;
        if (!siblingEdgeIds.has(edgeId)) {
          siblingEdgeIds.add(edgeId);
          edges.push({
            id: edgeId,
            source: a,
            target: b,
            style: { stroke: "#888", strokeDasharray: "4 2" },
            type: "smoothstep",
            markerEnd: undefined,
            animated: true,
            label: "Sibling",
            labelBgPadding: [4, 2],
            labelBgBorderRadius: 4,
            labelBgStyle: { fill: '#fff', color: '#333', fillOpacity: 0.8 },
            sourceHandle: "right",
            targetHandle: "left",
          });
        }
      });
    });
    // Partner edges (use side handles)
    (node.partners || []).forEach((partnerId) => {
      if (node.id < partnerId) {
        edges.push({
          id: `partner-${node.id}-${partnerId}`,
          source: node.id,
          target: partnerId,
          style: { stroke: "#b77", strokeDasharray: "2 2" },
          type: "smoothstep",
          markerEnd: undefined,
          animated: false,
          label: "Partner",
          labelBgPadding: [4, 2],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: '#fff', color: '#b77', fillOpacity: 0.8 },
          sourceHandle: 'right',
          targetHandle: 'left',
        });
      }
    });
  });

  // Add dummy nodes to nodes array
  const allNodes = [...nodes, ...dummyNodes];

  // Add node logic (stage in left pane)
  const handleAddNode = (relation: "parent" | "sibling" | "child" | "partner") => {
    if (!selectedId) return;
    const selected = tree[selectedId];
    if (relation === "parent") {
      // Allow multiple parents
      // Optionally, check for duplicate parent
    }
    setEditMode({ type: "add", relation });
  };

  // Edit node logic (stage in left pane)
  const handleEditNode = () => {
    if (!selectedId) return;
    setEditMode({ type: "edit", nodeId: selectedId });
    // form will be set by useEffect above
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
        setSelectedId(newId); // select new parent
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
      setEditMode(null);
    }
  };

  // Export tree as JSON
  const handleExport = () => {
    const data = JSON.stringify(tree, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    let filename = prompt("Enter filename to save as:", "family-tree.json");
    if (!filename || !filename.trim()) filename = "family-tree.json";
    if (!filename.endsWith('.json')) filename += '.json';
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save as PNG
  const handleExportPNG = async () => {
    if (!reactFlowWrapper.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(reactFlowWrapper.current, {
        cacheBust: true,
        backgroundColor: '#fff',
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "family-tree.png";
      a.click();
    } catch (err) {
      alert("Failed to export image. Try a different browser or check for unsupported elements.");
      console.error(err);
    }
  };

  // Save as PDF
  const handleExportPDF = async () => {
    if (!reactFlowWrapper.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(reactFlowWrapper.current, {
        cacheBust: true,
        backgroundColor: '#fff',
        pixelRatio: 2,
      });
      const pdf = new jsPDF({ orientation: "landscape" });
      // Fit image to page size
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Use a margin
      const margin = 10;
      pdf.addImage(dataUrl, "PNG", margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
      pdf.save("family-tree.pdf");
    } catch (err) {
      alert("Failed to export PDF. Try a different browser or check for unsupported elements.");
      console.error(err);
    }
  };

  // Import tree from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setTree(imported);
        setSelectedId(Object.keys(imported)[0]);
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  // Node click handler
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedId(node.id);
  }, []);

  // Drag end: update node position in model
  const onNodeDragStop = useCallback((_: any, node: Node) => {
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
    const newNodes = await getElkLayout(nodes, edges, { compact: compactLayout });
    const updatedTree = { ...tree };
    newNodes.forEach((n) => {
      updatedTree[n.id] = {
        ...updatedTree[n.id],
        x: n.position.x,
        y: n.position.y,
      };
    });
    setTree(updatedTree);
  };
  const toggleCompact = () => setCompactLayout(c => !c);

  // NOTE: layout is applied only when the user clicks "Auto Layout".
  // Orientation/compact changes update state but do not trigger an automatic re-layout.

  // Toggle grid
  const handleToggleGrid = () => setShowGrid((g) => !g);

  // Zoom fit
  const handleZoomFit = () => {
    if (rfInstance) rfInstance.fitView();
  };

  // New tree
  const handleNew = () => {
    setTree(getInitialTree());
    setSelectedId(Object.keys(getInitialTree())[0]);
  };

  // Save as (download JSON)
  const handleSaveAs = handleExport;

  // Open (import JSON)
  const handleOpen = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e: any) => handleImport(e);
    input.click();
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
            onOpen={handleOpen}
            onSave={handleExport}
            onSaveAs={handleSaveAs}
            onExportPNG={handleExportPNG}
            onExportPDF={handleExportPDF}
            onAutoLayout={handleAutoLayout}
            onToggleGrid={handleToggleGrid}
            onZoomFit={handleZoomFit}
            onAddParent={() => handleAddNode('parent')}
            onAddSibling={() => handleAddNode('sibling')}
            onAddChild={() => handleAddNode('child')}
            onAddPartner={() => handleAddNode('partner')}
            onToggleOrientation={undefined}
            onToggleCompact={toggleCompact}
          />
          <Box ref={reactFlowWrapper} sx={{ flex: 1, minHeight: 0, background: '#f5f5f5', borderRadius: 2, boxShadow: 1, mx: 2, mb: 2 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
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
              <MiniMap />
              <Controls />
              <Background gap={GRID_SIZE} color="#e0e0e0" variant={showGrid ? BackgroundVariant.Lines : BackgroundVariant.Dots} />
            </ReactFlow>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}