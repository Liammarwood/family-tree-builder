import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import GridOnIcon from "@mui/icons-material/GridOn";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Delete } from "@mui/icons-material";

type ToolbarProps = {
  onNew: () => void;
  onToggleGrid: () => void;
  onZoomFit: () => void;
  onAddParent: () => void;
  onAddSibling: () => void;
  onAddChild: () => void;
  onAddPartner: () => void;
  canAddSibling?: boolean;
  onDelete: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
};

export default function Toolbar({
  onNew, onToggleGrid, onZoomFit,
  onAddParent, onAddSibling, onAddChild, onAddPartner, onDelete, onExportPDF, onExportPNG, canAddSibling = true
}: ToolbarProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center', background: '#fff', boxShadow: 1, p: 1 }}>
      <Tooltip title="Add Parent"><IconButton onClick={onAddParent}><FamilyRestroomIcon /></IconButton></Tooltip>
      <Tooltip title={canAddSibling ? "Add Sibling" : "Add Sibling (requires parents)"}>
        <span>
          <IconButton onClick={onAddSibling} disabled={!canAddSibling}><GroupAddIcon /></IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Add Child"><IconButton onClick={onAddChild}><PersonAddIcon /></IconButton></Tooltip>
      <Tooltip title="Add Partner"><IconButton onClick={onAddPartner}><FavoriteIcon /></IconButton></Tooltip>
      <Tooltip title="New Tree"><IconButton onClick={onNew}><AddIcon /></IconButton></Tooltip>
      <Tooltip title="Toggle Snap/Grid"><IconButton onClick={onToggleGrid}><GridOnIcon /></IconButton></Tooltip>
      <Tooltip title="Delete Node"><IconButton onClick={onDelete}><Delete /></IconButton></Tooltip>
      <Tooltip title="Zoom Fit"><IconButton onClick={onZoomFit}><ZoomOutMapIcon /></IconButton></Tooltip>
      <Tooltip title="Export PNG"><IconButton onClick={onExportPNG}><ImageIcon /></IconButton></Tooltip>
      <Tooltip title="Export PDF"><IconButton onClick={onExportPDF}><PictureAsPdfIcon /></IconButton></Tooltip>
    </Box>
  );
}
