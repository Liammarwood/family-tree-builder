import React, { Fragment, useMemo, useState } from "react";
import {
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GridOnIcon from "@mui/icons-material/GridOn";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import {
  Delete,
  Edit,
  HeartBroken,
} from "@mui/icons-material";
import { useReactFlow, useStore, Node, Edge } from "reactflow";
import { RelationshipEdgeData, RelationshipType } from "@/types/RelationshipEdgeData";
import { EditMode } from "@/types/EditMode";
import { FamilyNodeData } from "@/types/FamilyNodeData";

type FamilyTreeToolbarProps = {
  setEditMode: (edit: EditMode) => void;
  hidden?: boolean;
};

export default function FamilyTreeToolbar({ setEditMode, hidden = false }: FamilyTreeToolbarProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { setNodes, setEdges, fitView } = useReactFlow();
  const nodes = useStore((state) => state.getNodes()) as Node<FamilyNodeData>[];
  const edges = useStore((state) => state.edges) as Edge<RelationshipEdgeData>[];
  const selectedEdge = useMemo(() => edges.find((e) => e.selected), [edges]);
  const selectedNode = useMemo(() => nodes.find((e) => e.selected), [nodes]);
  const selectedNodes = useMemo(() => nodes.filter((e) => e.selected), [nodes]);
  const isOneNodeSelected = useMemo(() => selectedNode !== undefined && selectedNodes.length === 1, [selectedNode, selectedNodes])
  const isOneEdgeSelected = useMemo(() => selectedEdge !== undefined && edges.filter((e) => e.selected).length === 1, [selectedEdge, edges])
  const isNodeSelected = useMemo(() => selectedNode != undefined && isOneNodeSelected, [selectedNode, isOneNodeSelected])
  const isEdgeSelected = useMemo(() => selectedEdge != undefined && isOneEdgeSelected, [selectedEdge, isOneEdgeSelected])
  const canAddSibling = useMemo(() => selectedNode !== undefined && edges.filter((e) => (e.target === selectedNode.id) && e.data?.relationship === RelationshipType.Parent).length > 0, [edges, selectedNode]);
  // Toggle grid
  const handleToggleGrid = () => console.log("Toggle Grid") //setShowGrid((g) => !g);

  // Zoom fit
  const handleZoomFit = () => {
    fitView();
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

  const actions = [
    { icon: <FamilyRestroomIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Parent', onClick: () => handleAddNode("parent"), isShown: isNodeSelected },
    { icon: <GroupAddIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Sibling', onClick: () => handleAddNode("sibling"), isShown: isNodeSelected && canAddSibling },
    { icon: <PersonAddIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Child', onClick: () => handleAddNode("child"), isShown: isNodeSelected },
    { icon: <FavoriteIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Partner', onClick: () => handleAddNode("partner"), isShown: isNodeSelected },
    { icon: <HeartBroken fontSize={isMobile ? "small" : "medium"} />, name: 'Add Divorced Partner', onClick: () => handleAddNode("divorced-partner"), isShown: isNodeSelected },
    { icon: <Delete fontSize={isMobile ? "small" : "medium"} />, name: 'Delete Person or Relationship', onClick: () => handleDeleteNode(), isShown: isNodeSelected || isEdgeSelected },
    { icon: <AddIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Add Person', onClick: () => handleAddNode(), isShown: true },
    { icon: <GridOnIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Toggle Grid', onClick: () => handleToggleGrid(), isShown: true },
    { icon: <ZoomOutMapIcon fontSize={isMobile ? "small" : "medium"} />, name: 'Zoom Fit', onClick: () => handleZoomFit(), isShown: true },
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

  return (
    <Fragment>
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