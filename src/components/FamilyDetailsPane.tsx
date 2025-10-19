import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Stack, MenuItem, FormControl, InputLabel, Select, RadioGroup, FormControlLabel, Radio, Drawer } from "@mui/material";
import { getNames } from 'country-list';
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { Node } from "reactflow";
import { EditMode } from "@/types/EditMode";

export type FamilyDetailsPaneForm = {
  name: string;
  dob: string;
  countryOfBirth: string;
  gender: 'Male' | 'Female';
  occupation: string;
  maidenName: string;
  dod: string;
  dom: string;
  dodiv: string;
}

const initialFormState: FamilyDetailsPaneForm = {
  name: "",
  dob: "",
  countryOfBirth: "",
  gender: 'Male',
  occupation: "",
  maidenName: "",
  dod: "",
  dom: "",
  dodiv: ""
}

export default function FamilyDetailsPane({
  selectedNode,
  editMode,
  onSave,
  onCancel,
  onDelete
}: {
  selectedNode: Node<FamilyNodeData> | undefined;
  editMode: EditMode | null;
  onSave: (form: FamilyDetailsPaneForm) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<FamilyDetailsPaneForm>(initialFormState);

  useEffect(() => {
    // Depend only on stable primitives to avoid loops when parent passes a new
    // object identity each render. Use selectedNode?.id and editMode?.type.
    let newForm = null;
    if (editMode?.type === "add") {
      newForm = initialFormState;
    } else if (selectedNode) {
      newForm = {
        name: selectedNode.data.name,
        dob: selectedNode.data.dob,
        countryOfBirth: selectedNode.data.countryOfBirth || "",
        gender: selectedNode.data.gender || "Male",
        occupation: selectedNode.data.occupation || "",
        maidenName: selectedNode.data.maidenName || "",
        dod: selectedNode.data.dod || "",
        dom: "",
        dodiv: ""
      };
    }

    if (newForm) {
      // Shallow compare to avoid triggering state updates when nothing changed
      const keys: (keyof typeof newForm)[] = ["name", "dob", "countryOfBirth", "gender", "occupation", "maidenName", "dod"];
      let changed = false;
      for (const k of keys) {
        if (form[k] !== newForm[k]) {
          changed = true;
          break;
        }
      }

      if (changed) setForm(newForm);
    }

    // Debug: log only when id/type change
    // eslint-disable-next-line no-console
    console.log("Selected node or edit mode changed", selectedNode?.id, editMode?.type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.id, editMode?.type]);

  const countryList = getNames();

  const getTitle = () => {
    if(editMode?.type === "add" && editMode?.relation && editMode.relation === "partner") {
      return "Add Partner";
    } else if(editMode?.type === "add" && editMode?.relation && editMode.relation === "divorced-partner") {
      return "Add Divorced Partner";
    } else if (editMode?.type === "add" && editMode?.relation && editMode.relation === "parent") {
      return "Add Parent";
    } else if (editMode?.type === "add" && editMode?.relation && editMode.relation === "sibling") {
      return "Add Sibling";
    } else if (editMode?.type === "add" && editMode?.relation && editMode.relation === "child") {
      return "Add Child";
    } else if (editMode?.type === "add") {
      return "Add Person";
    } else {
      return "Edit Person";
    }
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={editMode?.type === "add" || selectedNode !== undefined}
      sx={{
        width: 320, minWidth: 260, maxWidth: 400,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          overflow: 'hidden',
          width: 320, minWidth: 260, maxWidth: 400,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ width: 320, minWidth: 260, maxWidth: 400, p: 3, borderRadius: 0, bgcolor: '#fff', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>{getTitle()}</Typography>
        {editMode?.type === "add" || selectedNode ? (
          <Stack spacing={2}>
            <TextField
              label="ID"
              value={selectedNode?.id}
              fullWidth
              variant="outlined"
              autoFocus
              disabled
            />
            {editMode?.type === "add" && editMode?.relation && ["partner", "divorced-partner"].includes(editMode.relation) && <TextField
              label="Date of Marriage"
              type="date"
              variant="outlined"
              value={form.dom}
              onChange={e => setForm({ ...form, dom: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />}
            {editMode?.type === "add" && editMode?.relation && editMode.relation === "divorced-partner" && <TextField
              label={"Date of Divorce"}
              type="date"
              variant="outlined"
              value={form.dod}
              onChange={e => setForm({ ...form, dod: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />}
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
    </Drawer>
  );
}
