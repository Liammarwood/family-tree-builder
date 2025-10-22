import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Stack, MenuItem, FormControl, InputLabel, Select, RadioGroup, FormControlLabel, Radio, Avatar } from "@mui/material";
import { getNames } from 'country-list';
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { Node } from "reactflow";
import { EditMode } from "@/types/EditMode";
import ImageModal from "./ImageModal";
import { PersonDetailsForm } from "@/types/PersonDetailsForm";

const initialFormState: PersonDetailsForm = {
  name: "",
  dateOfBirth: "",
  countryOfBirth: "",
  gender: 'Male',
  occupation: "",
  maidenName: "",
  dateOfDeath: "",
  dateOfMarriage: "",
  dateOfDivorce: "",
  image: undefined
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
  onSave: (form: PersonDetailsForm) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<PersonDetailsForm>(initialFormState);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    // Depend only on stable primitives to avoid loops when parent passes a new
    // object identity each render. Use selectedNode?.id and editMode?.type.
    let newForm = null;
    if (editMode?.type === "add") {
      newForm = initialFormState;
    } else if (selectedNode) {
      newForm = {
        name: selectedNode.data.name || "",
        dateOfBirth: selectedNode.data.dateOfBirth || "",
        countryOfBirth: selectedNode.data.countryOfBirth || "",
        gender: selectedNode.data.gender || "Male",
        occupation: selectedNode.data.occupation || "",
        maidenName: selectedNode.data.maidenName || "",
        dateOfDeath: selectedNode.data.dateOfDeath || "",
        dateOfMarriage: "",
        dateOfDivorce: "",
        image: selectedNode.data.image || undefined
      };
    }

    if (newForm) {
      // Shallow compare to avoid triggering state updates when nothing changed
      const keys: (keyof typeof newForm)[] = ["name", "dateOfBirth", "countryOfBirth", "gender", "occupation", "maidenName", "dateOfDeath"];
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
     
    console.log("Selected node or edit mode changed", selectedNode?.id, editMode?.type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.id, editMode?.type]);

  const countryList = getNames();

  const getTitle = () => {
    if (editMode?.type === "add" && editMode?.relation && editMode.relation === "partner") {
      return "Add Partner";
    } else if (editMode?.type === "add" && editMode?.relation && editMode.relation === "divorced-partner") {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setImageModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Typography variant="h6" sx={{ mb: 1 }}>{getTitle()}</Typography>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          {editMode?.type === "add" && editMode?.relation && ["partner", "divorced-partner"].includes(editMode.relation) && <TextField
            label="Date of Marriage"
            type="date"
            variant="outlined"
            value={form.dateOfMarriage}
            onChange={e => setForm({ ...form, dateOfMarriage: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />}
          {editMode?.type === "add" && editMode?.relation && editMode.relation === "divorced-partner" && <TextField
            label={"Date of Divorce"}
            type="date"
            variant="outlined"
            value={form.dateOfDivorce}
            onChange={e => setForm({ ...form, dateOfDivorce: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />}
          <Avatar
            src={form.image || undefined}
            alt="User Avatar"
            sx={{ width: 120, height: 120 }}
          >
            {!form.image && 'Photo'}
          </Avatar>
          <Box>
            <input
              accept="image/*"
              id="avatar-upload"
              type="file"
              hidden
              onChange={handleFileChange}
            />
            <label htmlFor="avatar-upload">
              <Button variant="contained" component="span">
                {form.image ? 'Change Avatar' : 'Upload Avatar'}
              </Button>
            </label>
          </Box>
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
            value={form.dateOfBirth}
            onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Date of Death"
            type="date"
            variant="outlined"
            value={form.dateOfDeath}
            onChange={e => setForm({ ...form, dateOfDeath: e.target.value })}
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
      <ImageModal cropSrc={cropSrc || undefined} open={imageModalOpen} onClose={() => setImageModalOpen(false)} saveImage={(img) => setForm({ ...form, image: img })} />
    </>
  );
}
