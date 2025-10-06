import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SaveIcon from "@mui/icons-material/Save";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import GridOnIcon from "@mui/icons-material/GridOn";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import { Delete } from "@mui/icons-material";

type ToolbarProps = {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onAutoLayout: () => void;
  onToggleGrid: () => void;
  onZoomFit: () => void;
  onAddParent: () => void;
  onAddSibling: () => void;
  onAddChild: () => void;
  onAddPartner: () => void;
  onDelete: () => void;
};

export default function Toolbar({
  onNew, onOpen, onSave, onSaveAs, onExportPNG, onExportPDF, onAutoLayout, onToggleGrid, onZoomFit,
  onAddParent, onAddSibling, onAddChild, onAddPartner, onDelete
}: ToolbarProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center', background: '#fff', boxShadow: 1, p: 1 }}>
      <Tooltip title="Add Parent"><IconButton onClick={onAddParent}><FamilyRestroomIcon /></IconButton></Tooltip>
      <Tooltip title="Add Sibling"><IconButton onClick={onAddSibling}><GroupAddIcon /></IconButton></Tooltip>
      <Tooltip title="Add Child"><IconButton onClick={onAddChild}><PersonAddIcon /></IconButton></Tooltip>
      <Tooltip title="Add Partner"><IconButton onClick={onAddPartner}><FavoriteIcon /></IconButton></Tooltip>
      <Tooltip title="New Tree"><IconButton onClick={onNew}><AddIcon /></IconButton></Tooltip>
      <Tooltip title="Open"><IconButton onClick={onOpen}><FolderOpenIcon /></IconButton></Tooltip>
      <Tooltip title="Save"><IconButton onClick={onSave}><SaveIcon /></IconButton></Tooltip>
      <Tooltip title="Save As"><IconButton onClick={onSaveAs}><SaveIcon fontSize="small" /></IconButton></Tooltip>
      <Tooltip title="Export PNG"><IconButton onClick={onExportPNG}><ImageIcon /></IconButton></Tooltip>
      <Tooltip title="Export PDF"><IconButton onClick={onExportPDF}><PictureAsPdfIcon /></IconButton></Tooltip>
      <Tooltip title="Auto Layout"><IconButton onClick={onAutoLayout}><AutorenewIcon /></IconButton></Tooltip>
      <Tooltip title="Toggle Snap/Grid"><IconButton onClick={onToggleGrid}><GridOnIcon /></IconButton></Tooltip>
      <Tooltip title="Delete Node"><IconButton onClick={onDelete}><Delete /></IconButton></Tooltip>
      <Tooltip title="Zoom Fit"><IconButton onClick={onZoomFit}><ZoomOutMapIcon /></IconButton></Tooltip>
    </Box>
  );
}
