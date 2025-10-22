import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Stack, MenuItem, FormControl, InputLabel, Select, RadioGroup, FormControlLabel, Radio, Drawer } from "@mui/material";
import { getNames } from 'country-list';
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { Edge } from "reactflow";
import { EditMode } from "@/types/EditMode";
import { RelationshipEdgeData, RelationshipType } from "@/types/RelationshipEdgeData";
import { RelationshipForm } from "@/types/RelationshipForm";

const initialFormState: RelationshipForm = {
  dateOfMarriage: "",
  dateOfDivorce: ""
}

export default function RelationshipDetailsPane({
  selectedEdge,
  onSave,
  onCancel,
  onDelete
}: {
  selectedEdge: Edge<RelationshipEdgeData>;
  onSave: (form: RelationshipForm) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<RelationshipForm>(initialFormState);

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
    <>
      <Typography variant="h6" sx={{ mb: 1 }}>{getTitle()}</Typography>
      <Stack spacing={2}>
        {(selectedEdge.data?.relationship === RelationshipType.DivorcedPartner || selectedEdge.data?.relationship === RelationshipType.Partner) && <TextField
          label="Date of Marriage"
          type="date"
          variant="outlined"
          value={form.dateOfMarriage}
          onChange={e => setForm({ ...form, dateOfMarriage: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />}
        {selectedEdge.data?.relationship === RelationshipType.DivorcedPartner && <TextField
          label={"Date of Divorce"}
          type="date"
          variant="outlined"
          value={form.dateOfDivorce}
          onChange={e => setForm({ ...form, dateOfDivorce: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />}
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => onSave(form)}>Save</Button>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="outlined" color="error" onClick={onDelete}>Delete</Button>
        </Stack>
      </Stack>
    </>
  );
}
