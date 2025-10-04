import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";

export default function FamilyDialog({
  open,
  type,
  form,
  setForm,
  onClose,
  onSubmit
}: {
  open: boolean;
  type: "parent" | "sibling" | "child" | null;
  form: { name: string; dob: string };
  setForm: (f: { name: string; dob: string }) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add {type} Node</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Date of Birth"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={form.dob}
          onChange={e => setForm({ ...form, dob: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
}
