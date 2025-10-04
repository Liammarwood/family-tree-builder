import React from "react";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import GridOnIcon from "@mui/icons-material/GridOn";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";

export default function Toolbar({
  onNew, onOpen, onSave, onSaveAs, onExportPNG, onExportPDF, onAutoLayout, onToggleGrid, onUndo, onRedo, onZoomFit,
  onAddParent, onAddSibling, onAddChild
}: {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onAutoLayout: () => void;
  onToggleGrid: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomFit: () => void;
  onAddParent: () => void;
  onAddSibling: () => void;
  onAddChild: () => void;
}) {
  return (
  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center', background: '#fff', borderRadius: 2, boxShadow: 1, p: 1 }}>
  <Tooltip title="Add Parent"><IconButton onClick={onAddParent}><FamilyRestroomIcon /></IconButton></Tooltip>
  <Tooltip title="Add Sibling"><IconButton onClick={onAddSibling}><GroupAddIcon /></IconButton></Tooltip>
  <Tooltip title="Add Child"><IconButton onClick={onAddChild}><PersonAddIcon /></IconButton></Tooltip>
      <Tooltip title="New Tree"><IconButton onClick={onNew}><AddIcon /></IconButton></Tooltip>
      <Tooltip title="Open"><IconButton onClick={onOpen}><FolderOpenIcon /></IconButton></Tooltip>
      <Tooltip title="Save"><IconButton onClick={onSave}><SaveIcon /></IconButton></Tooltip>
      <Tooltip title="Save As"><IconButton onClick={onSaveAs}><SaveIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Export PNG"><IconButton onClick={onExportPNG}><ImageIcon /></IconButton></Tooltip>
      <Tooltip title="Export PDF"><IconButton onClick={onExportPDF}><PictureAsPdfIcon /></IconButton></Tooltip>
      <Tooltip title="Auto Layout"><IconButton onClick={onAutoLayout}><AutorenewIcon /></IconButton></Tooltip>
      <Tooltip title="Toggle Snap/Grid"><IconButton onClick={onToggleGrid}><GridOnIcon /></IconButton></Tooltip>
      <Tooltip title="Undo"><IconButton onClick={onUndo}><UndoIcon /></IconButton></Tooltip>
      <Tooltip title="Redo"><IconButton onClick={onRedo}><RedoIcon /></IconButton></Tooltip>
      <Tooltip title="Zoom Fit"><IconButton onClick={onZoomFit}><ZoomOutMapIcon /></IconButton></Tooltip>
    </Box>
  );
}
