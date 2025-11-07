import React, { Fragment, useMemo, useState } from "react";
import {
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  useMediaQuery,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GridOnIcon from "@mui/icons-material/GridOn";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Delete,
  Edit,
  HeartBroken,
  AccountTree,
} from "@mui/icons-material";
import { useReactFlow, useStore, Node, Edge } from "reactflow";
import { RelationshipEdgeData, RelationshipType } from "@/types/RelationshipEdgeData";
import { EditMode } from "@/types/EditMode";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { autoLayoutFamilyTree } from "@/libs/autoLayout";
import { useClipboard } from "@/hooks/useClipboard";
import { copySelectedNodes, pasteClipboardData } from "@/libs/clipboard";

type FamilyTreeToolbarProps = {
  setEditMode: (edit: EditMode) => void;
  hidden?: boolean;
  saveState?: { isSaving: boolean; lastSavedAt: number | null; triggerSave: () => void };
};

export default function FamilyTreeToolbar({ setEditMode, hidden = false, saveState }: FamilyTreeToolbarProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { setNodes, setEdges, fitView } = useReactFlow();
  const nodes = useStore((state) => state.getNodes()) as Node<FamilyNodeData>[];
  const edges = useStore((state) => state.edges) as Edge<RelationshipEdgeData>[];
  const { clipboard, setClipboard } = useClipboard();
  
  // Format saved time for display
  const formattedSaveTime = useMemo(() => {
    if (!saveState?.lastSavedAt) return null;
    try {
      const date = new Date(saveState.lastSavedAt);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  }, [saveState?.lastSavedAt]);
  
  // Handle manual save
  const handleSaveNow = () => {
    if (!saveState?.triggerSave) return;
    saveState.triggerSave();
  };
  
  // Optimization: Combine related calculations into single memos to reduce passes
  const selectionState = useMemo(() => {
    let selectedNode: Node<FamilyNodeData> | undefined;
    let selectedEdge: Edge<RelationshipEdgeData> | undefined;
    let selectedNodeCount = 0;
    let selectedEdgeCount = 0;
    let hasParentEdge = false;
    
    // Single pass through nodes
    for (const node of nodes) {
      if (node.selected) {
        selectedNodeCount++;
        if (!selectedNode) selectedNode = node;
      }
    }
    
    // Single pass through edges
    for (const edge of edges) {
      if (edge.selected) {
        selectedEdgeCount++;
        if (!selectedEdge) selectedEdge = edge;
      }
      // Check parent edge for sibling capability while iterating
      if (selectedNode && edge.target === selectedNode.id && 
          edge.data?.relationship === RelationshipType.Parent) {
        hasParentEdge = true;
      }
    }
    
    return {
      selectedNode,
      selectedEdge,
      isOneNodeSelected: selectedNodeCount === 1,
      isOneEdgeSelected: selectedEdgeCount === 1,
      canAddSibling: hasParentEdge && selectedNodeCount === 1,
      hasAnyNodeSelected: selectedNodeCount > 0,
    };
  }, [nodes, edges]);
  
  const { selectedNode, selectedEdge, isOneNodeSelected, isOneEdgeSelected, canAddSibling, hasAnyNodeSelected } = selectionState;
  const isNodeSelected = selectedNode !== undefined && isOneNodeSelected;
  const isEdgeSelected = selectedEdge !== undefined && isOneEdgeSelected;
  
  // Toggle grid (no-op placeholder)
  const handleToggleGrid = () => { /* no-op */ };

  // Zoom fit
  const handleZoomFit = () => {
    fitView();
  };

  // Auto-layout
  const handleAutoLayout = async () => {
    const layoutedNodes = await autoLayoutFamilyTree(nodes, edges);
    setNodes(layoutedNodes);
    // Fit view after layout to show the entire tree
    setTimeout(() => fitView(), 100);
  };

  const handleDeleteNode = () => {
    const currentSelectedEdge = selectedEdge;
    if (currentSelectedEdge) {
      setEdges((eds) =>
        eds.filter((e) => e.id !== currentSelectedEdge.id)
      );
    } else if (selectedNode && isOneNodeSelected) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
    } else {
      return;
    }
  };

  // Add node logic (stage in left pane)
  const handleAddNode = (relation?: "parent" | "sibling" | "child" | "partner" | "divorced-partner") => {
    if (!selectedNode && relation) return;
    setEditMode({ type: "add", relation });
  };

  const handleEdit = () => {
    if (selectedNode) {
      setEditMode({ type: 'edit', nodeId: selectedNode.id, nodeData: selectedNode.data });
    }
  }

  // Copy selected nodes and their interlinking edges
  const handleCopy = () => {
    const clipboardData = copySelectedNodes(nodes, edges);
    if (clipboardData) {
      setClipboard(clipboardData);
    }
  };

  // Paste clipboard data as new nodes with offset positions
  const handlePaste = () => {
    if (!clipboard) return;
    
    const { nodes: newNodes, edges: newEdges } = pasteClipboardData(clipboard, nodes);
    
    // Add new nodes and edges to the tree, selecting only the new nodes
    setNodes((prevNodes) => [
      ...prevNodes.map(n => ({ ...n, selected: false })),
      ...newNodes.map(n => ({ ...n, selected: true }))
    ]);
    setEdges((prevEdges) => [...prevEdges, ...newEdges]);
  };

  const actions = [
    { icon: <FamilyRestroomIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Parent', onClick: () => handleAddNode("parent"), isShown: isNodeSelected },
    { icon: <GroupAddIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Sibling', onClick: () => handleAddNode("sibling"), isShown: isNodeSelected && canAddSibling },
    { icon: <PersonAddIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Child', onClick: () => handleAddNode("child"), isShown: isNodeSelected },
    { icon: <FavoriteIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Partner', onClick: () => handleAddNode("partner"), isShown: isNodeSelected },
    { icon: <HeartBroken fontSize={isMobile ? "small" : "medium"} />, name: 'Add Divorced Partner', onClick: () => handleAddNode("divorced-partner"), isShown: isNodeSelected },
    { icon: <Delete fontSize={isMobile ? "small" : "medium"} />, name: 'Delete Person or Relationship', onClick: () => handleDeleteNode(), isShown: isNodeSelected || isEdgeSelected },
    { icon: <ContentCopyIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Copy Selected Nodes', onClick: () => handleCopy(), isShown: hasAnyNodeSelected },
    { icon: <ContentPasteIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Paste Nodes', onClick: () => handlePaste(), isShown: clipboard !== null },
    { icon: <AddIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Person', onClick: () => handleAddNode(), isShown: true },
    { icon: <AccountTree fontSize={isMobile ? "small" : "medium"} />, name: 'Auto Layout', onClick: () => handleAutoLayout(), isShown: true },
    { icon: <GridOnIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Toggle Grid', onClick: () => handleToggleGrid(), isShown: true },
    { icon: <ZoomOutMapIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Zoom Fit', onClick: () => handleZoomFit(), isShown: true },
    { icon: saveState?.isSaving ? <CircularProgress size={isMobile ? 16 : 20} /> : <SaveIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Save Now (Ctrl/Cmd+S)', onClick: handleSaveNow, isShown: true },
    { icon: <Edit fontSize={isMobile ? "small" : "medium"} />, name: 'Edit Selected', onClick: () => handleEdit(), isShown: isMobile }
  ];

  if (isMobile) {
    return (
      <SpeedDial
        ariaLabel="Tree Actions"
        icon={<SpeedDialIcon />}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        hidden={hidden}
        sx={{
          position: "absolute",
          bottom: 24,
          right: 24,
          zIndex: 1500,
        }}
      >
        {actions
          .filter((a) => a.isShown)
          .map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              slotProps={{
                tooltip: {
                  title: action.name,
                  placement: "left"
                }
              }}
              onClick={action.onClick}
            />
          ))}
      </SpeedDial>
    );
  }

  // Save indicator component - shows status of IndexedDB saves
  const SaveIndicator = () => {
    if (!saveState) return null;
    
    const { isSaving, lastSavedAt } = saveState;
    const tooltipText = isSaving 
      ? 'Saving...' 
      : lastSavedAt && formattedSaveTime
        ? `Last saved at ${formattedSaveTime}` 
        : 'Ready to save';
    
    return (
      <Tooltip title={tooltipText}>
        <Box
          role="status"
          aria-live="polite"
          aria-label={tooltipText}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: isSaving ? 'info.light' : lastSavedAt ? 'success.light' : 'grey.300',
            color: isSaving ? 'info.dark' : lastSavedAt ? 'success.dark' : 'grey.700',
          }}
        >
          {isSaving ? (
            <CircularProgress size={16} sx={{ color: 'info.dark' }} />
          ) : lastSavedAt ? (
            <CheckCircleIcon fontSize="small" sx={{ fontSize: 16 }} />
          ) : (
            <SaveIcon fontSize="small" sx={{ fontSize: 16 }} />
          )}
          <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
            {isSaving ? 'Saving' : lastSavedAt ? 'Saved' : 'Ready'}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Fragment>
      <SaveIndicator />
      {actions.map(action => action.isShown ? <Tooltip key={action.name} title={action.name}>
        <IconButton
          onClick={action.onClick}
          disabled={!action.isShown}
          size={isMobile ? "small" : "medium"}
        >
          {action.icon}
        </IconButton>
      </Tooltip>
        : null)}
    </Fragment>
  );
}