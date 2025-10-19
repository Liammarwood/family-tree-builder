import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Stack, MenuItem, FormControl, InputLabel, Select, RadioGroup, FormControlLabel, Radio, Drawer } from "@mui/material";
import { getNames } from 'country-list';
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { Edge } from "reactflow";
import { EditMode } from "@/types/EditMode";
import { RelationshipEdgeData, RelationshipType } from "@/types/RelationshipEdgeData";

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

export default function RelationshipDetailsPane({
  selectedEdge,
  onSave,
  onCancel,
  onDelete
}: {
  selectedEdge: Edge<RelationshipEdgeData> | undefined;
  onSave: (form: FamilyDetailsPaneForm) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<FamilyDetailsPaneForm>(initialFormState);

  const countryList = getNames();

  const getTitle = () => {
    if (selectedEdge && selectedEdge.data?.relationship === RelationshipType.Partner) {
      return "Edit Partner Relationship";
    } else if (selectedEdge && selectedEdge.data?.relationship === RelationshipType.DivorcedPartner) {
      return "Edit Divorced Partner Relationship";
    } else if (selectedEdge && selectedEdge.data?.relationship === RelationshipType.Parent) {
      return "Edit Parent Relationship";
    } else if (selectedEdge && selectedEdge.data?.relationship === RelationshipType.Child) {
      return "Edit Child Relationship";
    } else {
      return "Edit Relationship";
    }
  }

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={selectedEdge !== undefined}
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
        {selectedEdge !== undefined ? (<Stack spacing={2}>
          <TextField
            label="Date of Marriage"
            type="date"
            variant="outlined"
            value={form.dom}
            onChange={e => setForm({ ...form, dom: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label={"Date of Divorce"}
            type="date"
            variant="outlined"
            value={form.dod}
            onChange={e => setForm({ ...form, dodiv: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => onSave(form)}>Save</Button>
            <Button onClick={onCancel}>Cancel</Button>
            <Button variant="outlined" color="error" onClick={onDelete}>Delete</Button>
          </Stack>
        </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">No relationship selected</Typography>
        )}
      </Box>
    </Drawer>
  );
}
