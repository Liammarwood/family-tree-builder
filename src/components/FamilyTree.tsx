"use client";


import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, MarkerType, ReactFlowInstance, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import FamilyNode, { FamilyNodeData } from "./FamilyNode";
import Toolbar from "./Toolbar";
import { getDagreLayout } from "./autoLayout";
import htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { Dialog, TextField, Button, Typography, Box, Paper, Divider, Stack } from "@mui/material";
import FamilyDialog from "./FamilyDialog";

const GRID_SIZE = 20;

export type FamilyNodeType = {
  id: string;
  name: string;
  dob: string;
  parentId?: string;
  children: string[];
  generation: number;
  x?: number;
  y?: number;
};

export type FamilyTreeData = {
  [id: string]: FamilyNodeType;
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const initialRootId = generateId();
const initialTree: FamilyTreeData = {
  [initialRootId]: {
    id: initialRootId,
    name: "Root Person",
    dob: "",
    children: [],
    generation: 0,
  },
};

const nodeTypes = { family: FamilyNode };

export default function FamilyTree() {
  const [tree, setTree] = useState<FamilyTreeData>(initialTree);
  const [selectedId, setSelectedId] = useState<string | null>(initialRootId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"parent" | "sibling" | "child" | null>(null);
  const [form, setForm] = useState({ name: "", dob: "" });
  const [nodeEditor, setNodeEditor] = useState<{ open: boolean; nodeId: string | null }>({ open: false, nodeId: null });
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState<FamilyTreeData[]>([]);
  const [future, setFuture] = useState<FamilyTreeData[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Convert tree to reactflow nodes/edges
  const nodes: Node<FamilyNodeData>[] = Object.values(tree).map((node) => ({
    id: node.id,
    type: "family",
    data: { name: node.name, dob: node.dob },
    position: node.x !== undefined && node.y !== undefined ? { x: node.x, y: node.y } : { x: node.generation * 250, y: 100 * Math.random() },
    selected: selectedId === node.id,
  }));

  // Edges: parent-child and sibling-sibling
  const edges: Edge[] = [];
  Object.values(tree).forEach((node) => {
    // Parent-child edges
    node.children.forEach((childId) => {
      edges.push({
        id: `${node.id}->${childId}`,
        source: node.id,
        target: childId,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    });
    // Sibling edges
    if (node.parentId) {
      const siblings = tree[node.parentId]?.children.filter((id) => id !== node.id) || [];
      siblings.forEach((sibId) => {
        if (node.id < sibId) {
          edges.push({
            id: `sib-${node.id}-${sibId}`,
            source: node.id,
            target: sibId,
            style: { stroke: "#888", strokeDasharray: "4 2" },
            type: "default",
            markerEnd: undefined,
            animated: true,
            label: "Sibling",
            sourceHandle: "sibling",
            targetHandle: "sibling",
          });
        }
      });
    }
  });

  // Add node logic
  const handleAddNode = (type: "parent" | "sibling" | "child") => {
    setDialogType(type);
    setDialogOpen(true);
    setForm({ name: "", dob: "" });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType(null);
  };

  const handleDialogSubmit = () => {
    if (!selectedId || !dialogType) return;
    const newId = generateId();
    const selected = tree[selectedId];
    let newNode: FamilyNodeType;
    let updatedTree = { ...tree };
    if (dialogType === "parent") {
      newNode = {
        id: newId,
        name: form.name,
        dob: form.dob,
        children: [selected.id],
        generation: selected.generation - 1,
        x: (selected.x || 0) - 200,
        y: (selected.y || 0),
      };
      updatedTree[newId] = newNode;
      updatedTree[selected.id] = { ...selected, parentId: newId, generation: selected.generation };
    } else if (dialogType === "sibling") {
      newNode = {
        id: newId,
        name: form.name,
        dob: form.dob,
        parentId: selected.parentId,
        children: [],
        generation: selected.generation,
        x: (selected.x || 0) + 200,
        y: (selected.y || 0),
      };
      updatedTree[newId] = newNode;
      if (selected.parentId) {
        updatedTree[selected.parentId] = {
          ...updatedTree[selected.parentId],
          children: [...updatedTree[selected.parentId].children, newId],
        };
      }
    } else if (dialogType === "child") {
      newNode = {
        id: newId,
        name: form.name,
        dob: form.dob,
        parentId: selected.id,
        children: [],
        generation: selected.generation + 1,
        x: (selected.x || 0),
        y: (selected.y || 0) + 200,
      };
      updatedTree[newId] = newNode;
      updatedTree[selected.id] = {
        ...selected,
        children: [...selected.children, newId],
      };
    }
    setTree(updatedTree);
    setDialogOpen(false);
    setDialogType(null);
  };

  // Export tree as JSON
  const handleExport = () => {
    const data = JSON.stringify(tree, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-tree.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save as PNG
  const handleExportPNG = async () => {
    if (!reactFlowWrapper.current) return;
    const dataUrl = await htmlToImage.toPng(reactFlowWrapper.current);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "family-tree.png";
    a.click();
  };

  // Save as PDF
  const handleExportPDF = async () => {
    if (!reactFlowWrapper.current) return;
    const dataUrl = await htmlToImage.toPng(reactFlowWrapper.current);
    const pdf = new jsPDF({ orientation: "landscape" });
    pdf.addImage(dataUrl, "PNG", 10, 10, 270, 180);
    pdf.save("family-tree.pdf");
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

  // Double click node: open NodeEditor
  const onNodeDoubleClick = useCallback((_: any, node: Node) => {
    setNodeEditor({ open: true, nodeId: node.id });
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
  const handleAutoLayout = () => {
    const newNodes = getDagreLayout(nodes, edges);
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

  // Toggle grid
  const handleToggleGrid = () => setShowGrid((g) => !g);

  // Undo/Redo
  const handleUndo = () => {
    if (history.length > 0) {
      setFuture([tree, ...future]);
      setTree(history[history.length - 1]);
      setHistory(history.slice(0, -1));
    }
  };
  const handleRedo = () => {
    if (future.length > 0) {
      setHistory([...history, tree]);
      setTree(future[0]);
      setFuture(future.slice(1));
    }
  };

  // Zoom fit
  const handleZoomFit = () => {
    if (rfInstance) rfInstance.fitView();
  };

  // New tree
  const handleNew = () => {
    setTree(initialTree);
    setSelectedId(Object.keys(initialTree)[0]);
    setHistory([]);
    setFuture([]);
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleExport();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        handleExportPNG();
      } else if (e.key === "N" || e.key === "n") {
        handleAddNode("child");
      } else if (e.key === "Delete") {
        if (selectedId) {
          const updated = { ...tree };
          delete updated[selectedId];
          setTree(updated);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        handleRedo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#f3f6fa' }}>
      <Box sx={{ px: 0, py: 0, width: '100%', boxShadow: 2, bgcolor: 'primary.main', color: 'primary.contrastText', mb: 2 }}>
        <Typography variant="h5" sx={{ px: 3, py: 2, fontWeight: 700, letterSpacing: 1 }}>Family Tree Builder</Typography>
      </Box>
      <Stack direction="row" spacing={0} sx={{ height: 'calc(100vh - 64px)' }}>
        {/* Left: Node details */}
        <Paper elevation={2} sx={{ width: 320, minWidth: 260, maxWidth: 400, p: 3, borderRadius: 0, bgcolor: '#fff', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Selected Node</Typography>
          {selectedId && tree[selectedId] ? (
            <>
              <Typography variant="subtitle1"><b>{tree[selectedId].name}</b></Typography>
              <Typography variant="body2">DOB: {tree[selectedId].dob || '-'}</Typography>
              {/* Add more details here as needed */}
              <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => setNodeEditor({ open: true, nodeId: selectedId })}>Edit Details</Button>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">No node selected</Typography>
          )}
        </Paper>
        {/* Main: Toolbar + Graph */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f3f6fa' }}>
          <Toolbar
            onNew={handleNew}
            onOpen={handleOpen}
            onSave={handleExport}
            onSaveAs={handleSaveAs}
            onExportPNG={handleExportPNG}
            onExportPDF={handleExportPDF}
            onAutoLayout={handleAutoLayout}
            onToggleGrid={handleToggleGrid}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onZoomFit={handleZoomFit}
            onAddParent={() => handleAddNode('parent')}
            onAddSibling={() => handleAddNode('sibling')}
            onAddChild={() => handleAddNode('child')}
          />
          <Divider sx={{ mb: 1 }} />
          <Box ref={reactFlowWrapper} sx={{ flex: 1, minHeight: 0, background: '#f5f5f5', borderRadius: 2, boxShadow: 1, mx: 2, mb: 2 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              onNodeDragStop={onNodeDragStop}
              fitView
              snapToGrid={showGrid}
              snapGrid={[GRID_SIZE, GRID_SIZE]}
              onInit={setRfInstance}
            >
              <MiniMap />
              <Controls />
              <Background gap={GRID_SIZE} color="#e0e0e0" variant={showGrid ? BackgroundVariant.Lines : BackgroundVariant.Dots} />
            </ReactFlow>
          </Box>
        </Box>
      </Stack>
      <FamilyDialog open={dialogOpen} type={dialogType} form={form} setForm={setForm} onClose={handleDialogClose} onSubmit={handleDialogSubmit} />
      {/* NodeEditor modal (scaffold) */}
      <Dialog open={nodeEditor.open} onClose={() => setNodeEditor({ open: false, nodeId: null })}>
        <Box sx={{ p: 2, minWidth: 320 }}>
          <Typography variant="h6">Edit Node</Typography>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={nodeEditor.nodeId ? tree[nodeEditor.nodeId]?.name : ""}
            onChange={e => {
              if (!nodeEditor.nodeId) return;
              setTree(prev => ({ ...prev, [nodeEditor.nodeId!]: { ...prev[nodeEditor.nodeId!], name: e.target.value } }));
            }}
          />
          <TextField
            label="Date of Birth"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={nodeEditor.nodeId ? tree[nodeEditor.nodeId]?.dob : ""}
            onChange={e => {
              if (!nodeEditor.nodeId) return;
              setTree(prev => ({ ...prev, [nodeEditor.nodeId!]: { ...prev[nodeEditor.nodeId!], dob: e.target.value } }));
            }}
          />
          {/* Add more fields: placeOfBirth, dod, occupation, relationship meta controls */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setNodeEditor({ open: false, nodeId: null })}>Close</Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}