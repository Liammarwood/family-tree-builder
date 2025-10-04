import React from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";

export default function FamilyNavigation({
  onAdd,
  onExport,
  onImport
}: {
  onAdd: (type: "parent" | "sibling" | "child") => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => onAdd("parent")} sx={{ mr: 1 }}>Add Parent</Button>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => onAdd("sibling")} sx={{ mr: 1 }}>Add Sibling</Button>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => onAdd("child")} sx={{ mr: 1 }}>Add Child</Button>
      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onExport} sx={{ mr: 1 }}>Export JSON</Button>
      <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
        Import JSON
        <input type="file" accept="application/json" hidden onChange={onImport} />
      </Button>
    </div>
  );
}
