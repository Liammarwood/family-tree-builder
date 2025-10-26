"use client";

import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import ReactFlow, { Background, Controls, Node, Edge, BackgroundVariant, useNodesState, useEdgesState, ConnectionLineType } from "reactflow";
import "reactflow/dist/style.css";
import { Box, Stack, useMediaQuery } from "@mui/material";
import { ManualConnectionDialog, ManualConnectionForm } from "./ManualConnectionDialog";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { ChildEdge, DivorcedEdge, ParentEdge, PartnerEdge, SiblingEdge } from "@/libs/edges";
import { EDGE_TYPES, GENERATE_ID, GRID_SIZE, NODE_TYPES } from "@/libs/constants";
import { EditMode } from "@/types/EditMode";
import { Loading } from "@/components/Loading";
import PersonDetailsPane from "@/components/PersonDetailsPane";
import RelationshipDetailsPane from "@/components/RelationshipDetailsPane";
import { PersonDetailsForm } from "@/types/PersonDetailsForm";
import { RelationshipForm } from "@/types/RelationshipForm";
import { DetailsPane } from "./DetailsPane";
import { useFamilyTreeContext } from "@/hooks/useFamilyTree";
import { RelationshipType } from "@/types/RelationshipEdgeData";

type FamilyTreeProps = {
  showGrid: boolean;
  editMode: EditMode | null;
  setEditMode: (edit: EditMode | null) => void;
}
export default function FamilyTree({ showGrid, editMode, setEditMode }: FamilyTreeProps) {
  const { selectedTreeId, currentTree, isTreeLoaded, saveTree } = useFamilyTreeContext();
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [connectDialog, setConnectDialog] = useState<{ open: boolean; source: string; target: string } | null>(null);
  const selectedEdge = useMemo(() => edges.find((e) => e.selected), [edges]);
  const selectedNode = useMemo(() => nodes.find((e) => e.selected), [nodes]);
  const selectedNodes = useMemo(() => nodes.filter((e) => e.selected), [nodes]);
  const isOneNodeSelected = selectedNode !== undefined && selectedNodes.length === 1;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const initialized = useRef(false);

  // 1️⃣ Reset nodes/edges when tree selection changes
  useEffect(() => {
    if (currentTree) {
      setNodes(currentTree.nodes);
      setEdges(currentTree.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }

    // Handles when a Tree is deleted or none initially selected by the user.
    if (!selectedTreeId) {
      // TODO Fix Up setSelectModalOpen(true);
    }
    initialized.current = false; // mark as "not synced yet"
  }, [selectedTreeId, currentTree, setEdges, setNodes]);

  // 2️⃣ Sync effect
  useEffect(() => {
    if (!isTreeLoaded || !currentTree || !selectedTreeId) return;

    // First time: sync value → state
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    // After initial load: sync state → value only if changed
    if (currentTree.nodes !== nodes || currentTree.edges !== edges) {
      saveTree({ ...currentTree, nodes, edges });
    }
  }, [isTreeLoaded, currentTree, nodes, edges, saveTree, selectedTreeId]);

  // Handle manual connection between nodes
  const onConnect = useCallback((params: { source: string | null; target: string | null }) => {
    if (!params.source || !params.target) return;
    setConnectDialog({ open: true, source: params.source, target: params.target });
  }, []);

  const handleConnectConfirm = (form: ManualConnectionForm) => {
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
        newEdges.push(...SiblingEdge(target, edges.filter((e) => e.target === source && e.data?.relationship === RelationshipType.Parent)));
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

  // Cancel add/edit
  const handleCancel = () => {
    setEditMode(null);
    deselectAll();
  };

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
      const newId = GENERATE_ID();

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
          case "divorced-partner":
            newEdges.push(DivorcedEdge(selectedNode.id, newId, form.dateOfMarriage, form.dateOfDivorce));
            break;
          case "partner":
            newEdges.push(PartnerEdge(selectedNode.id, newId, form.dateOfMarriage));
            break;
          case "sibling":
            newEdges.push(...SiblingEdge(newId, currentEdges.filter((e) => e.target === selectedNode.id && e.data?.relationship === RelationshipType.Parent)));
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
  const onNodeClick = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, clickedNode: Node) => {
      setNodes((prevNodes) => {
        // If multi-select key is pressed, toggle only the clicked node
        if (isMultiSelectKey(event)) {
          return prevNodes.map((n) => {
            if (n.id !== clickedNode.id) return n;
            return { ...n, selected: !n.selected };
          });
        }

        // Otherwise, select only the clicked node
        return prevNodes.map((n) => {
          return n.id === clickedNode.id ? { ...n, selected: true } : { ...n, selected: false };
        });
      });

      // Defer non-visual work slightly to avoid blocking UI
      if (!isMobile) {
        requestAnimationFrame(() => {
          setEditMode({ type: 'edit', nodeId: clickedNode.id, nodeData: clickedNode.data });
        });
      }
    },
    [isMobile, setNodes, setEditMode]
  );


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
    <Stack
      direction="row"
      spacing={0}
      mt={1}
      mb={1}
      sx={{ height: '90vh', position: 'relative' }}
    >
      {/* Left: Details Pane */}
      {(!isMobile || (isMobile && editMode !== null)) && (
        <DetailsPane
          sx={{
            width: isMobile ? '100vw' : 350,
            flexShrink: 0,
            ...(isMobile && editMode !== null ? { mx: 0 } : {}),
          }}
        >
          {((selectedNode && isOneNodeSelected) ||
            (editMode?.type === 'add' && editMode.relation === undefined)) && (
              <PersonDetailsPane
                editMode={editMode}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={() => console.log("Delete")}
              />
            )}

          {selectedEdge &&
            (!selectedNode || !isOneNodeSelected) && (
              <RelationshipDetailsPane
                selectedEdge={selectedEdge}
                onSave={handleRelationshipSave}
                onCancel={handleCancel}
                onDelete={() => console.log("Delete")}
              />
            )}
        </DetailsPane>
      )}

      {/* Right: Graph */}
      {(!isMobile || (isMobile && editMode === null)) && (
        <Box
          ref={reactFlowWrapper}
          sx={{
            flex: 1,
            minHeight: 0,
            background: '#f5f5f5',
            borderRadius: 2,
            boxShadow: 1,
            mx: isMobile ? 0 : 2,
            ...(isMobile ? { width: '100%' } : {}),
          }}
        >
          {!isTreeLoaded ? (
            <Loading message="Loading family tree..." />
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              edgeTypes={EDGE_TYPES}
              nodeTypes={NODE_TYPES}
              onNodeClick={onNodeClick}
              onEdgesChange={onEdgesChange}
              onNodesChange={onNodesChange}
              onPaneClick={onPaneClick}
              onNodeDragStop={onNodeDragStop}
              fitView
              snapToGrid={true}
              snapGrid={[GRID_SIZE, GRID_SIZE]}
              onConnect={onConnect}
              connectionLineType={ConnectionLineType.Step}
              minZoom={0.05}
              maxZoom={2}
              attributionPosition={"top-center"}
            >
              <ManualConnectionDialog
                onClose={() => setConnectDialog(null)}
                isOpen={!!connectDialog}
                onConfirm={handleConnectConfirm}
              />
              <Controls />
              <Background
                gap={GRID_SIZE}
                color="#e0e0e0"
                variant={
                  showGrid ? BackgroundVariant.Lines : BackgroundVariant.Dots
                }
              />
            </ReactFlow>
          )}
        </Box>
      )}

      {/* Application Modals */}

    </Stack>
  );
}