import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Stack, MenuItem, FormControl, InputLabel, Select, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { getNames } from 'country-list';
import { FamilyNodeType } from "@/libs/familyTreeUtils";

export type EditMode = null | { type: "edit"; nodeId: string } | { type: "add"; relation: "parent" | "sibling" | "child" | "partner" };


export default function FamilyDetailsPane({
  selectedNode,
  editMode,
  onEdit,
  onSave,
  onCancel,
  onStartAdd,
  onDelete
}: {
  selectedNode: FamilyNodeType | null;
  editMode: EditMode;
  onEdit: () => void;
  onSave: (form: { name: string; dob: string; countryOfBirth?: string; gender?: 'Male' | 'Female' }) => void;
  onCancel: () => void;
  onStartAdd: (relation: "parent" | "sibling" | "child" | "partner") => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<{ name: string; dob: string; countryOfBirth?: string; gender?: 'Male' | 'Female'; occupation?: string; maidenName?: string; dod?: string }>({ name: "", dob: "", countryOfBirth: "", gender: undefined, occupation: "", maidenName: "", dod: "" });

  useEffect(() => {
    if (editMode?.type === "add") {
      setForm({ name: "", dob: "", countryOfBirth: "", gender: undefined, occupation: "", maidenName: "", dod: ""});
    } else if (selectedNode) {
      setForm({
        name: selectedNode.name,
        dob: selectedNode.dob,
        countryOfBirth: selectedNode.countryOfBirth || "",
        gender: selectedNode.gender || undefined,
        occupation: selectedNode.occupation || "",
        maidenName: selectedNode.maidenName || "",
        dod: selectedNode.dod || ""
      });
    } 
  }, [selectedNode, editMode]);

  const countryList = getNames();

  return (
    <Box sx={{ width: 320, minWidth: 260, maxWidth: 400, p: 3, borderRadius: 0, bgcolor: '#fff', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{editMode?.type === "add" ? "Add Person" : "Edit Person"}</Typography>
      {editMode?.type === "add" || selectedNode ? (
        <Stack spacing={2}>
          <TextField
            label="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            fullWidth
            variant="outlined" 
            autoFocus
          />
          <TextField
            label="Date of Birth"
            type="date"
            variant="outlined" 
            value={form.dob}
            onChange={e => setForm({ ...form, dob: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Date of Death"
            type="date"
            variant="outlined" 
            value={form.dod}
            onChange={e => setForm({ ...form, dod: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
          variant="outlined"
                      label="Maiden Name"
            value={form.maidenName}
            onChange={e => setForm({ ...form, maidenName: e.target.value })}
            fullWidth
          />
          <TextField
          variant="outlined" 
            label="Occupation"
            value={form.occupation}
            onChange={e => setForm({ ...form, occupation: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="country-label">Country of Birth</InputLabel>
            <Select
            variant="outlined" 
              labelId="country-label"
              value={form.countryOfBirth || ""}
              label="Country of Birth"
              onChange={e => setForm({ ...form, countryOfBirth: e.target.value })}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {countryList.sort().map((country) => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={form.gender || ''}
              onChange={e => setForm({ ...form, gender: e.target.value as 'Male' | 'Female' })}
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
            </RadioGroup>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => onSave(form)}>Save</Button>
            <Button onClick={onCancel}>Cancel</Button>
            {selectedNode && <Button variant="outlined" color="error" onClick={onDelete}>Delete</Button>}
          </Stack>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">No node selected</Typography>
      )}
    </Box>
  );
}
