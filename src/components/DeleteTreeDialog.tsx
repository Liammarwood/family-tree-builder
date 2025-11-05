import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import { useFamilyTreeContext } from "@/hooks/useFamilyTree";

type DeleteTreeDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const DeleteTreeDialog: React.FC<DeleteTreeDialogProps> = ({
  open,
  onClose,
}) => {
  const { currentTree, deleteTree } = useFamilyTreeContext();

  const handleDelete = () => {
    if (currentTree) {
      deleteTree(currentTree.id);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Tree</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete &quot;{currentTree?.name}&quot;? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
