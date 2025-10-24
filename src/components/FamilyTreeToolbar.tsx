import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ParkIcon from "@mui/icons-material/Park";
import GridOnIcon from "@mui/icons-material/GridOn";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Delete, Download, HeartBroken, Share, Upload } from "@mui/icons-material";

type FamilyTreeToolbarProps = {
  isNodeSelected: boolean;
  canAddSibling: boolean;
  onNew: () => void;
  onToggleGrid: () => void;
  onZoomFit: () => void;
  onAddParent: () => void;
  onAddSibling: () => void;
  onAddChild: () => void;
  onAddPartner: () => void;
  onAddDivorcedPartner: () => void;
  onAddPerson: () => void;
  onDelete: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onUpload: () => void;
  onDownload: () => void;
};

export default function FamilyTreeToolbar({
  onNew, onToggleGrid, onZoomFit, onUpload, onDownload,
  onAddParent, onAddSibling, onAddChild, onAddPartner, onAddDivorcedPartner, onAddPerson, onDelete, onExportPDF, onExportPNG, canAddSibling, isNodeSelected
}: FamilyTreeToolbarProps) {

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', background: '#fff', boxShadow: 1, p: 1 }}>
      <Tooltip title="Add Parent"><IconButton onClick={onAddParent} disabled={!isNodeSelected}><FamilyRestroomIcon /></IconButton></Tooltip>
      <Tooltip title="Add Sibling"><IconButton onClick={onAddSibling} disabled={!isNodeSelected || !canAddSibling}><GroupAddIcon /></IconButton></Tooltip>
      <Tooltip title="Add Child"><IconButton onClick={onAddChild} disabled={!isNodeSelected}><PersonAddIcon /></IconButton></Tooltip>
      <Tooltip title="Add Partner"><IconButton onClick={onAddPartner} disabled={!isNodeSelected}><FavoriteIcon /></IconButton></Tooltip>
      <Tooltip title="Add Divorced Partner"><IconButton onClick={onAddDivorcedPartner} disabled={!isNodeSelected}><HeartBroken /></IconButton></Tooltip>
      <Tooltip title="Add Person"><IconButton onClick={onAddPerson}><AddIcon /></IconButton></Tooltip>
      <Tooltip title="Create or Select Tree"><IconButton onClick={onNew}><ParkIcon /></IconButton></Tooltip>
      <Tooltip title="Toggle Snap/Grid"><IconButton onClick={onToggleGrid}><GridOnIcon /></IconButton></Tooltip>
      <Tooltip title="Delete Person or Relationship"><IconButton onClick={onDelete}><Delete /></IconButton></Tooltip>
      <Tooltip title="Zoom Fit"><IconButton onClick={onZoomFit}><ZoomOutMapIcon /></IconButton></Tooltip>
      <Tooltip title="Export PNG"><IconButton onClick={onExportPNG}><ImageIcon /></IconButton></Tooltip>
      <Tooltip title="Export PDF"><IconButton onClick={onExportPDF}><PictureAsPdfIcon /></IconButton></Tooltip>
      <Tooltip title="Download Tree"><IconButton onClick={onDownload}><Download /></IconButton></Tooltip>
      <Tooltip title="Upload Tree"><IconButton onClick={onUpload}><Upload /></IconButton></Tooltip>
      <Tooltip title="Share"><IconButton><Share /></IconButton></Tooltip>

    </Box>
  );
}
