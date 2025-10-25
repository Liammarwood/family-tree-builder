"use client";

import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import ReactFlow, { Background, Controls, Node, Edge, ReactFlowInstance, BackgroundVariant, useNodesState, useEdgesState, ConnectionLineType } from "reactflow";
import "reactflow/dist/style.css";
import { Box, Stack, useMediaQuery } from "@mui/material";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import { ManualConnectionDialog, ManualConnectionForm } from "./ManualConnectionDialog";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { ChildEdge, DivorcedEdge, ParentEdge, PartnerEdge, SiblingEdge } from "@/libs/edges";
import { DB_NAME, EDGE_TYPES, GENERATE_ID, GRID_SIZE, NODE_TYPES, ParentRelationship } from "@/libs/constants";
import { EditMode } from "@/types/EditMode";
import { Loading } from "@/components/Loading";
import PersonDetailsPane from "@/components/PersonDetailsPane";
import RelationshipDetailsPane from "@/components/RelationshipDetailsPane";
import FamilyTreeToolbar from "./FamilyTreeToolbar";
import { PersonDetailsForm } from "@/types/PersonDetailsForm";
import { RelationshipForm } from "@/types/RelationshipForm";
import { DetailsPane } from "./DetailsPane";
import NavigationBar from "./NavigationBar";
import { FamilyTreeSection } from "./FamilyTreeSelection";
import { useFamilyTreeContext } from "@/hooks/FamilyTreeContextProvider";
import { UploadModal } from "./UploadModal";
import { WebRTCJsonModal } from "./WebRTCJSONSender";
import { useSearchParams } from "next/navigation";

export default function FamilyTree() {
  const { selectedTreeId, currentTree, saveCurrentTree, isTreeLoaded } = useFamilyTreeContext();
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editMode, setEditMode] = useState<EditMode | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [connectDialog, setConnectDialog] = useState<{ open: boolean; source: string; target: string } | null>(null);
  const [isSelectModalOpen, setSelectModalOpen] = useState<boolean>(selectedTreeId === null);
  const [isUploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const selectedEdge = useMemo(() => edges.find((e) => e.selected), [edges]);
  const selectedNode = useMemo(() => nodes.find((e) => e.selected), [nodes]);
  const selectedNodes = useMemo(() => nodes.filter((e) => e.selected), [nodes]);
  const isOneNodeSelected = selectedNode !== undefined && selectedNodes.length === 1;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const searchParams = useSearchParams();

  const initialized = useRef(false);

  // 1️⃣ Reset nodes/edges when tree selection changes
  useEffect(() => {
    if (!currentTree) return;

    setNodes(currentTree.nodes);
    setEdges(currentTree.edges);
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
      saveCurrentTree({ ...currentTree, nodes, edges });
    }
  }, [isTreeLoaded, currentTree, nodes, edges, saveCurrentTree, selectedTreeId]);

  // Auto open modal if call is in params
  useEffect(() => {
    const callParam = searchParams.get("call")
    if (callParam) {
      setShareModalOpen(true);
    }
  }, [searchParams])
  
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
      if(!isMobile) {
        setEditMode({ type: 'edit', nodeId: node.id })
      }
      }
  }, [setNodes, isMobile]);

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

  const handleDownload = async () => {
    // setLoading(true);
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const exportData: Record<string, { schema: any; data: any[] }> = {};
      const storeNames = Array.from(db.objectStoreNames);

      for (const storeName of storeNames) {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);

        // TODO Fixup any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allRecords: any[] = await new Promise((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items: any[] = [];
          const cursorRequest = store.openCursor();
          cursorRequest.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest).result;
            if (cursor) {
              items.push(cursor.value);
              cursor.continue();
            } else {
              resolve(items);
            }
          };
          cursorRequest.onerror = () => reject(cursorRequest.error);
        });

        exportData[storeName] = {
          schema: {
            keyPath: store.keyPath,
            autoIncrement: store.autoIncrement,
          },
          data: allRecords,
        };
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${DB_NAME}-backup.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#f3f6fa' }}>
      {/* Title bar */}
      <NavigationBar name={currentTree?.name} />

      <FamilyTreeToolbar
        onEdit={() => setEditMode({ type: 'edit', nodeId: selectedNode?.id })}
        onDownload={handleDownload}
        onUpload={() => setUploadModalOpen(true)}
        onDelete={handleDeleteNode}
        onNew={() => setSelectModalOpen(true)}
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
        onShare={() => setShareModalOpen(true)}
        isNodeSelected={selectedNode != undefined && isOneNodeSelected}
        canAddSibling={doesSelectedPersonHaveParents()} />

      <Stack direction="row" spacing={0} sx={{ height: '82vh' }}>
        {/* Left: Node details */}
        {(!isMobile || (isMobile && editMode !== null)) && <DetailsPane>
          {((selectedNode && isOneNodeSelected) || (editMode?.type === "add" && editMode.relation === undefined)) && <PersonDetailsPane
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
        {/* Main: Graph */}
        <Box ref={reactFlowWrapper} sx={{ flex: 1, minHeight: 0, background: '#f5f5f5', borderRadius: 2, boxShadow: 1, mx: 2 }}>
          {!isTreeLoaded ? <Loading message="Loading family tree..." /> :
            <ReactFlow
              nodes={nodes}
              edges={edges}
              edgeTypes={EDGE_TYPES}
              nodeTypes={NODE_TYPES}
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

        {/* Upload Modal */}
        <UploadModal dbName={DB_NAME} open={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} />

        {/* Select Family Tree Modal */}
        <FamilyTreeSection open={isSelectModalOpen} onClose={() => setSelectModalOpen(false)} />

          {/* WebRTC Modal for Sharing Trees */}
          <WebRTCJsonModal open={isShareModalOpen} onClose={() => setShareModalOpen(false)} json={currentTree} />
      </Stack>
    </Box>
  );
}