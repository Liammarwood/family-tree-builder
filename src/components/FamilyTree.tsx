"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import ReactFlow, { Background, Controls, Node, Edge, ReactFlowInstance, BackgroundVariant, useNodesState, useEdgesState, ConnectionLineType } from "reactflow";
import "reactflow/dist/style.css";
import { Box, Stack, useMediaQuery } from "@mui/material";
import { edgeTypes, generateId, initialNode, nodeTypes } from "@/libs/familyTreeUtils";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import { useIndexedDBState } from "@/hooks/useIndexedDBState";
import { ManualConnectionDialog, ManualConnectionForm } from "./ManualConnectionDialog";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { ChildEdge, DivorcedEdge, ParentEdge, PartnerEdge, SiblingEdge } from "@/libs/edges";
import { ParentRelationship } from "@/libs/constants";
import { EditMode } from "@/types/EditMode";
import { Loading } from "@/components/Loading";
import PersonDetailsPane from "@/components/PersonDetailsPane";
import RelationshipDetailsPane from "@/components/RelationshipDetailsPane";
import FamilyTreeToolbar from "./FamilyTreeToolbar";
import { PersonDetailsForm } from "@/types/PersonDetailsForm";
import { RelationshipForm } from "@/types/RelationshipForm";
import { DetailsPane } from "./DetailsPane";
import NavigationBar from "./NavigationBar";
import { useFlowSync } from "@/hooks/useSyncFlow";
const GRID_SIZE = 20;

type FamilyTreeSaveData = {
  nodes: Node<FamilyNodeData>[];
  edges: Edge[];
}

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
  const selectedNodes = useMemo(() => nodes.filter((e) => e.selected), [nodes]);
  const isOneNodeSelected = selectedNode !== undefined && selectedNodes.length === 1;
  const isMobile = useMediaQuery('(max-width: 768px)');

  useFlowSync(isLoaded, value, setValue, nodes, setNodes, edges, setEdges);

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
        newEdges.push(PartnerEdge(source, target, form.dateOfMarriage || ""));
        break;
      case "divorced-partner":
        newEdges.push(DivorcedEdge(source, target, form.dateOfMarriage || "", form.dateOfDivorce || ""));
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
    setEditMode(null);
    deselectAll();
  };

  const handleDeleteNode = () => {
    const currentSelectedEdge = selectedEdge;
    if (currentSelectedEdge) {
      console.log("Deleting edge:", currentSelectedEdge.id);
      setEdges((eds) =>
        eds.filter((e) => e.id !== currentSelectedEdge.id)
      );
    } else if (selectedNode && isOneNodeSelected) {
      console.log("Deleting node:", selectedNode.id);
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
    } else {
      return;
    }
  };

  // Used to check if "Add Sibling" should be enabled
  const doesSelectedPersonHaveParents = () => {
    return selectedNode !== undefined && edges.filter((e) => (e.target === selectedNode.id) && e.data?.relationship === ParentRelationship).length > 0;
  }

  const handleRelationshipSave = (form: RelationshipForm) => {
    if (!selectedEdge) return; // TODO Display error using snackbar/toast
    setEdges((currentEdges) => {
      return currentEdges.map(edge => {
        if (edge.id === selectedEdge.id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              dateOfMarriage: form.dateOfMarriage,
              dateOfDivorce: form.dateOfDivorce
            }
          }
        } else {
          return edge;
        }
      });
    });
    setEditMode(null);
    deselectAll();
  }

  const handleSave = (form: PersonDetailsForm) => {
    console.log('save');
    if (!editMode) return;
    console.log(editMode);
    console.log(selectedNode);

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
                dateOfBirth: form.dateOfBirth,
                dateOfDeath: form.dateOfDeath || "",
                countryOfBirth: form.countryOfBirth || "",
                gender: form.gender,
                occupation: form.occupation || "",
                maidenName: form.maidenName || "",
                image: form.image
              },
            }
            : n
        )
      );
    } else if (editMode.type === "add") {
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
          dateOfBirth: form.dateOfBirth,
          dateOfDeath: form.dateOfDeath || "",
          countryOfBirth: form.countryOfBirth || "",
          gender: form.gender,
          occupation: form.occupation || "",
          maidenName: form.maidenName || "",
          image: form.image
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
    }
    setEditMode(null);
    deselectAll();
  };

  function isMultiSelectKey(event: React.MouseEvent<Element, MouseEvent>): boolean {
    return event.shiftKey || event.ctrlKey || event.metaKey;
  }

  // Node click handler
  const onNodeClick = useCallback((event: React.MouseEvent<Element, MouseEvent>, node: Node) => {
    // Toggle selection of clicked node
    if (isMultiSelectKey(event)) {
      // Toggle selection of clicked node
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, selected: node.selected } : n
        )
      );
    } else {
      // Select only clicked node
      setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: n.id === node.id }))
      );
      setEditMode({ type: 'edit', nodeId: node.id })
    }
  }, [setNodes]);

  // Drag end: update node position in model by snapping to the grid
  const onNodeDragStop = (_: React.MouseEvent<Element, MouseEvent>, node: Node) => {
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
  };

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

  // Used to deselect nodes/edges when clicking on pane
  const deselectAll = () => {
    // Deselect all nodes and edges
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
  };

  const onPaneClick = (event: React.MouseEvent) => {
    if (!isMultiSelectKey(event)) {
      deselectAll();
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#f3f6fa' }}>
      {/* Title bar */}
      <NavigationBar />


      <Stack direction="row" spacing={0} sx={{ height: 'calc(100vh - 64px)' }}>
        {/* Left: Node details */}
        {!isMobile && <DetailsPane>
          {selectedNode && isOneNodeSelected && <PersonDetailsPane
            selectedNode={selectedNode}
            editMode={editMode}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDeleteNode}
          />}
          {selectedEdge && (!selectedNode || !isOneNodeSelected) && <RelationshipDetailsPane
            selectedEdge={selectedEdge}
            onSave={handleRelationshipSave}
            onCancel={handleCancel}
            onDelete={handleDeleteNode}
          />}
        </DetailsPane>}
        {/* Main: Toolbar + Graph */}
        <Box sx={{ width: '100vw', flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f3f6fa' }}>
          <FamilyTreeToolbar
            onDelete={handleDeleteNode}
            onNew={handleNew}
            onToggleGrid={handleToggleGrid}
            onZoomFit={handleZoomFit}
            onAddPerson={() => handleAddNode()}
            onAddParent={() => handleAddNode('parent')}
            onAddSibling={() => handleAddNode('sibling')}
            onAddChild={() => handleAddNode('child')}
            onAddPartner={() => handleAddNode('partner')}
            onAddDivorcedPartner={() => handleAddNode("divorced-partner")}
            onExportPDF={handleExportPDF}
            onExportPNG={handleExportPNG}
            isNodeSelected={selectedNode != undefined && isOneNodeSelected}
            canAddSibling={doesSelectedPersonHaveParents()} />
          <Box ref={reactFlowWrapper} sx={{ flex: 1, minHeight: 0, background: '#f5f5f5', borderRadius: 2, boxShadow: 1, mx: 2, mb: 2 }}>
            {!isLoaded ? <Loading message="Loading family tree..." /> :
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
                onPaneClick={onPaneClick}
                onNodeDragStop={onNodeDragStop}
                fitView
                snapToGrid={showGrid}
                snapGrid={[GRID_SIZE, GRID_SIZE]}
                onInit={setRfInstance}
                onConnect={onConnect}
                connectionLineType={ConnectionLineType.Step}
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