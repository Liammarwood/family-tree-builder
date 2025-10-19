"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import ReactFlow, { Background, Controls, Node, Edge, ReactFlowInstance, BackgroundVariant, useNodesState, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";
import Toolbar from "./Toolbar";
import { Typography, Box, Stack, styled } from "@mui/material";
import FamilyDetailsPane from "./FamilyDetailsPane";
import { edgeTypes, generateId, initialNode, initialRootId, nodeTypes } from "@/libs/familyTreeUtils";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import { useIndexedDBState } from "@/hooks/useIndexedDBState";
import { ManualConnectionDialog, ManualConnectionForm } from "./ManualConnectionDialog";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { ChildEdge, DivorcedEdge, ParentEdge, PartnerEdge, SiblingEdge } from "@/libs/edges";
import { ParentRelationship } from "@/libs/constants";
import { EditMode } from "@/types/EditMode";

const GRID_SIZE = 20;

type FamilyTreeSaveData = {
  nodes: Node<FamilyNodeData>[];
  edges: Edge[];
}

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));

// interface AppBarProps extends MuiAppBarProps {
//   open?: boolean;
// }

// const AppBar = styled(MuiAppBar, {
//   shouldForwardProp: (prop) => prop !== 'open',
// })<AppBarProps>(({ theme }) => ({
//   transition: theme.transitions.create(['margin', 'width'], {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.leavingScreen,
//   }),
//   variants: [
//     {
//       props: ({ open }) => open,
//       style: {
//         width: `calc(100% - ${drawerWidth}px)`,
//         marginLeft: `${drawerWidth}px`,
//         transition: theme.transitions.create(['margin', 'width'], {
//           easing: theme.transitions.easing.easeOut,
//           duration: theme.transitions.duration.enteringScreen,
//         }),
//       },
//     },
//   ],
// }));

export default function FamilyTree() {
  const { value, setValue, isLoaded } = useIndexedDBState<FamilyTreeSaveData>("family-tree", { nodes: [initialNode], edges: [] });
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editMode, setEditMode] = useState<EditMode | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [connectDialog, setConnectDialog] = useState<{ open: boolean; source: string; target: string } | null>(null);

  const selectedEdge = useMemo(() => edges.find((e) => e.selected), [edges]);
  const selectedNode = useMemo(() => nodes.find((e) => e.selected), [nodes]);

  useEffect(() => {
    if (isLoaded) {
      setNodes(value.nodes);
      setEdges(value.edges);
      console.log(nodes, edges)
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      setValue({ nodes, edges });
      console.log('Saved to IndexedDB')
    }
  }, [nodes, edges]);

  // Handle manual connection between nodes
  const onConnect = useCallback((params: { source: string | null; target: string | null }) => {
    console.log('COnnect');
    if (!params.source || !params.target) return;
    setConnectDialog({ open: true, source: params.source, target: params.target });
  }, []);

  const handleConnectConfirm = (form: ManualConnectionForm) => {
    console.log("ConnectConfirm");
    if (!connectDialog) return;

    const { source, target } = connectDialog;

    // Defensive checks
    if (!source || !target || source === target) return;

    // Update edges depending on relationship type
    const newEdges: Edge[] = [];
    switch (form.type) {
      case "partner":
        newEdges.push(PartnerEdge(source, target, form.dom || ""));
        break;
      case "divorced-partner":
        newEdges.push(DivorcedEdge(source, target, form.dom || "", form.dod || ""));
        break;
      case "child":
        newEdges.push(ChildEdge(source, target));
        break;
      case "parent":
        newEdges.push(ParentEdge(target, source));
        break;
      case "sibling":
        newEdges.push(...SiblingEdge(target, edges.filter((e) => e.target === source && e.data?.relationship === ParentRelationship)));
        break;
      default:
        break;
    }

    // Update edges state
    setEdges((prev) => [
      ...prev.filter(
        (e) =>
          !(
            e.source === source &&
            e.target === target &&
            e.data?.relation === form.type
          )
      ),
      ...newEdges,
    ]);

    setConnectDialog(null);
  };

  const handleExportPNG = async () => {
    console.log('exportpng');

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
    console.log('export pdf');

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

  // Add node logic (stage in left pane)
  const handleAddNode = (relation?: "parent" | "sibling" | "child" | "partner" | "divorced-partner") => {
    console.log('add node');

    if (!selectedNode && relation) return;
    console.log('Setting edit mode to add', relation);
    console.log(selectedNode);
    setEditMode({ type: "add", relation });
  };

  // Cancel add/edit
  const handleCancel = () => {
    handlePaneClick();
    setEditMode(null);
  };

  const handleDeleteNode = () => {
    const currentSelectedEdge = selectedEdge;
    if (currentSelectedEdge) {
      console.log("Deleting edge:", currentSelectedEdge.id);
      setEdges((eds) =>
        eds.filter((e) => e.id !== currentSelectedEdge.id)
      );
    } else if (selectedNode) {
      console.log("Deleting node:", selectedNode.id);
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
    } else {
      return;
    }
  };

  const handleSave = (form: {
    name: string;
    dob: string;
    dod?: string;
    countryOfBirth?: string;
    gender?: "Male" | "Female";
    occupation?: string;
    maidenName?: string;
  }) => {
    console.log('save');
    if (!editMode) return;
    console.log(editMode);
    console.log(selectedNode);

    // EDIT MODE
    if (editMode.type === "edit" && selectedNode) {
      console.log('save edit')
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? {
              ...n,
              data: {
                ...n.data,
                name: form.name,
                dob: form.dob,
                dod: form.dod || "",
                countryOfBirth: form.countryOfBirth || "",
                gender: form.gender,
                occupation: form.occupation || "",
                maidenName: form.maidenName || "",
              },
            }
            : n
        )
      );
      setEditMode(null);
      return;
    }

    // ADD MODE
    if (editMode.type === "add") {
      const newId = generateId();

      const newNode: Node = {
        id: newId,
        type: "family",
        position: {
          x: selectedNode ? selectedNode.position.x + 200 : 0, // simple offset
          y: selectedNode ? selectedNode.position.y + 200 : 0,
        },
        data: {
          name: form.name,
          dob: form.dob,
          dod: form.dod || "",
          countryOfBirth: form.countryOfBirth || "",
          gender: form.gender,
          occupation: form.occupation || "",
          maidenName: form.maidenName || "",
        },
      };

      console.log(newNode)

      // Add node
      setNodes([...nodes, newNode]);

      // Add edge(s) based on relationship
      setEdges((currentEdges) => {
        // If no node is selected then there can't be any relationships
        if (!selectedNode || editMode.relation === undefined) return [...currentEdges]

        const newEdges: Edge[] = [];
        switch (editMode.relation) {
          case "parent":
            newEdges.push(ParentEdge(selectedNode.id, newId));
            break;
          case "child":
            newEdges.push(ChildEdge(selectedNode.id, newId));
            break;
          case "partner":
            newEdges.push(PartnerEdge(selectedNode.id, newId, ""));
            break;
          case "sibling":
            newEdges.push(...SiblingEdge(newId, currentEdges.filter((e) => e.target === selectedNode.id && e.data?.relationship === ParentRelationship)));
            break;
          default:
            break;
        }
        return [...currentEdges, ...newEdges];
      });

      setEditMode(null);
    }
  };

  // Node click handler
  const onNodeClick = useCallback((_: any, node: Node) => {
    setEditMode({ type: 'edit', nodeId: node.id })
  }, []);

  // Drag end: update node position in model by snapping to the grid
  const onNodeDragStop = useCallback((_: any, node: Node) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? {
            ...n,
            position: {
              x: Math.round(node.position.x / GRID_SIZE) * GRID_SIZE,
              y: Math.round(node.position.y / GRID_SIZE) * GRID_SIZE,
            },
          }
          : n
      )
    );
  }, []);

  // Toggle grid
  const handleToggleGrid = () => setShowGrid((g) => !g);

  // Zoom fit
  const handleZoomFit = () => {
    console.log('zoom');
    if (rfInstance) rfInstance.fitView();
  };

  // New tree
  const handleNew = () => {
    console.log('new');
    setValue({ nodes: [initialNode], edges: [] });
    setNodes([initialNode]);
    setEdges([]);
  };

  const handlePaneClick = () => {
    // Deselect all nodes and edges
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#f3f6fa' }}>
      <Box sx={{ px: 0, py: 1, width: '100%', boxShadow: 2, bgcolor: 'primary.main', color: 'primary.contrastText', mb: 2 }}>
        <Typography variant="h6" sx={{ px: 3, py: 0, fontWeight: 700, letterSpacing: 1 }}>Family Tree Builder</Typography>
      </Box>
      <Stack direction="row" spacing={0} sx={{ height: 'calc(100vh - 64px)' }}>
        {/* Left: Node details */}
        <FamilyDetailsPane
          selectedNode={selectedNode}
          editMode={editMode}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDeleteNode}
        />
        {/* Main: Toolbar + Graph */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f3f6fa' }}>
          <Toolbar
            onDelete={handleDeleteNode}
            onNew={handleNew}
            onToggleGrid={handleToggleGrid}
            onZoomFit={handleZoomFit}
            onAddPerson={() => handleAddNode()}
            onAddParent={() => handleAddNode('parent')}
            onAddSibling={() => handleAddNode('sibling')}
            onAddChild={() => handleAddNode('child')}
            onAddPartner={() => handleAddNode('partner')}
            onExportPDF={handleExportPDF}
            onExportPNG={handleExportPNG}
            isNodeSelected={selectedNode != undefined}
            onAddDivorcedPartner={() => handleAddNode("divorced-partner")} />
          <Box ref={reactFlowWrapper} sx={{ flex: 1, minHeight: 0, background: '#f5f5f5', borderRadius: 2, boxShadow: 1, mx: 2, mb: 2 }}>
            {!isLoaded ? <p>Loading saved progress...</p> :
              <ReactFlow
                nodes={nodes}
                edges={edges}
                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onEdgesChange={onEdgesChange}
                onNodesChange={onNodesChange}
                // onEdgeClick={(event, edge) => {
                //   console.log('Clicked edge:', edge);
                // }}
                onPaneClick={handlePaneClick}
                onNodeDragStop={onNodeDragStop}
                fitView
                snapToGrid={showGrid}
                snapGrid={[GRID_SIZE, GRID_SIZE]}
                onInit={setRfInstance}
                onConnect={onConnect}
              >
                {/* Manual connect dialog */}
                <ManualConnectionDialog onClose={() => setConnectDialog(null)} isOpen={!!connectDialog} onConfirm={handleConnectConfirm} />
                <Controls />
                <Background gap={GRID_SIZE} color="#e0e0e0" variant={showGrid ? BackgroundVariant.Lines : BackgroundVariant.Dots} />
              </ReactFlow>}
          </Box>
        </Box>

      </Stack>
    </Box>
  );
}