"use client";

import { useFamilyTreeContext } from "@/hooks/FamilyTreeContextProvider";
import { Close } from "@mui/icons-material";
import {
  Modal,
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

export type FamilyTreeSectionProps = {
  open: boolean;
  onClose: () => void;
};

export const FamilyTreeSection: React.FC<FamilyTreeSectionProps> = ({
  open,
  onClose
}: FamilyTreeSectionProps) => {
  const { trees, setSelectedTreeId, selectedTreeId, createTree } = useFamilyTreeContext();
  const [localSelectedTreeId, setLocalSelectedId] = useState<string | null>(
    selectedTreeId
  );
  const [newTreeName, setNewTreeName] = useState<string>("");

  const hasTrees = trees.length > 0;
  const isCreatingNew = !hasTrees || localSelectedTreeId === "NEW";

  const handleSave = () => {
    if (isCreatingNew && newTreeName.trim() !== "") {
      // Create new tree and select it
      createTree(newTreeName);
    } else if (!isCreatingNew) {
      setSelectedTreeId(localSelectedTreeId);
    }
    onClose();
  };

  const handleClose = () => {
    if(selectedTreeId === null) {
        return;
    } else {
        onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="select-family-tree-modal-title"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 6,
          width: 400,
          p: 2,
          position: "relative",
        }}
      >
        {/* Close Button */}
       {selectedTreeId !== null && <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <Close />
        </IconButton>}

        {/* Title */}
        <Typography
          id="select-family-tree-modal-title"
          variant="h6"
          fontWeight={600}
          mb={2}
        >
          {hasTrees ? "Select or Create Family Tree" : "Create New Family Tree"}
        </Typography>

        {hasTrees && (
          <FormControl fullWidth>
            <InputLabel id="tree-select-label">Select Family Tree</InputLabel>
            <Select
              labelId="tree-select-label"
              value={localSelectedTreeId ?? ""}
              label="Select Family Tree"
              onChange={(e) => setLocalSelectedId(e.target.value || null)}
            >
              {trees.map((tree) => (
                <MenuItem key={tree.id} value={tree.id}>
                  {tree.name ? tree.name : tree.id}
                </MenuItem>
              ))}
              <MenuItem value="NEW">+ Create New Family Tree</MenuItem>
            </Select>
          </FormControl>
        )}

        {isCreatingNew && (
          <TextField
            fullWidth
            label="New Family Tree Name"
            value={newTreeName}
            onChange={(e) => setNewTreeName(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          {selectedTreeId !== null && <Button onClick={handleClose}>Cancel</Button>}
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isCreatingNew && newTreeName.trim() === ""}
          >
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};
