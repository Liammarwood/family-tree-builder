import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { Box } from "@mui/material";

type DeleteTreeConfirmDialogProps = {
  open: boolean;
  treeName?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteTreeConfirmDialog: React.FC<DeleteTreeConfirmDialogProps> = ({
  open,
  treeName,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Delete Tree?
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete {treeName ? `"${treeName}"` : "this tree"}? 
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
