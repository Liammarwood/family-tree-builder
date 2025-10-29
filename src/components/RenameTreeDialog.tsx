import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useFamilyTreeContext } from "@/hooks/useFamilyTree";
import { useError } from "@/hooks/useError";

type RenameTreeDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const RenameTreeDialog: React.FC<RenameTreeDialogProps> = ({
  open,
  onClose,
}) => {
  const { showError } = useError();
  const { currentTree, renameTree } = useFamilyTreeContext();
  const [newName, setNewName] = useState("");

  // Pre-fill the current tree name when dialog opens
  useEffect(() => {
    if (open && currentTree?.name) {
      setNewName(currentTree.name);
    }
  }, [open, currentTree]);

  const handleSave = async () => {
    if (!currentTree || !newName.trim() || newName === currentTree?.name) {
      onClose();
      return;
    }

    try {
      await renameTree(currentTree?.id, newName.trim());
    } catch {
      showError("Renaming the current tree failed. Please try again.");
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Rename Tree</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="normal"
          label="Tree Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
