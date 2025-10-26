import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
} from "@mui/material";
import { getNames } from "country-list";
import { EditMode } from "@/types/EditMode";
import ImageModal from "./ImageModal";
import { PersonDetailsForm } from "@/types/PersonDetailsForm";

const initialFormState: PersonDetailsForm = {
  name: "",
  dateOfBirth: "",
  countryOfBirth: "",
  gender: "Male",
  occupation: "",
  maidenName: "",
  dateOfDeath: "",
  dateOfMarriage: "",
  dateOfDivorce: "",
  image: undefined,
};

export default function FamilyDetailsPane({
  editMode,
  onSave,
  onCancel,
  onDelete,
}: {
  editMode: EditMode | null;
  onSave: (form: PersonDetailsForm) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<PersonDetailsForm>(initialFormState);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    console.log(editMode)
    if (editMode?.type === "add") {
      setForm(initialFormState);
    } else if (editMode?.nodeData) {
      setForm({
        name: editMode.nodeData.name || "",
        dateOfBirth: editMode.nodeData.dateOfBirth || "",
        countryOfBirth: editMode.nodeData.countryOfBirth || "",
        gender: editMode.nodeData.gender || "Male",
        occupation: editMode.nodeData.occupation || "",
        maidenName: editMode.nodeData.maidenName || "",
        dateOfDeath: editMode.nodeData.dateOfDeath || "",
        dateOfMarriage: "",
        dateOfDivorce: "",
        image: editMode.nodeData.image || undefined
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode?.nodeId, editMode?.type]);

  const countryList = getNames();

  const getTitle = () => {
    if (editMode?.type === "add" && editMode?.relation === "partner") return "Add Partner";
    if (editMode?.type === "add" && editMode?.relation === "divorced-partner")
      return "Add Divorced Partner";
    if (editMode?.type === "add" && editMode?.relation === "parent") return "Add Parent";
    if (editMode?.type === "add" && editMode?.relation === "sibling") return "Add Sibling";
    if (editMode?.type === "add" && editMode?.relation === "child") return "Add Child";
    if (editMode?.type === "add") return "Add Person";
    return "Edit Person";
  };

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // Fill available height
        overflow: "hidden", // Contain the scroll area
      }}
    >
      {/* Fixed Header */}
      <Box
        sx={{
          p: 1,
          borderBottom: "1px solid #ddd",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Typography variant="h6">{getTitle()}</Typography>
      </Box>

      {/* Scrollable Form Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
        }}
      >
        <Stack spacing={2} alignItems="center">
          {/* Avatar */}
          <Avatar src={form.image || undefined} alt="User Avatar" sx={{ width: 120, height: 120 }}>
            {!form.image && "Photo"}
          </Avatar>

          {/* Upload */}
          <Box>
            <input accept="image/*" id="avatar-upload" type="file" hidden onChange={handleFileChange} />
            <label htmlFor="avatar-upload">
              <Button variant="contained" component="span">
                {form.image ? "Change Avatar" : "Upload Avatar"}
              </Button>
            </label>
          </Box>

          {/* Fields */}
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            variant="outlined"
            autoFocus
          />
          <TextField
            label="Date of Birth"
            type="date"
            variant="outlined"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Date of Death"
            type="date"
            variant="outlined"
            value={form.dateOfDeath}
            onChange={(e) => setForm({ ...form, dateOfDeath: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Maiden Name"
            value={form.maidenName}
            onChange={(e) => setForm({ ...form, maidenName: e.target.value })}
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Occupation"
            value={form.occupation}
            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="country-label">Country of Birth</InputLabel>
            <Select
              variant="outlined"
              labelId="country-label"
              value={form.countryOfBirth || ""}
              label="Country of Birth"
              onChange={(e) => setForm({ ...form, countryOfBirth: e.target.value })}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {countryList.sort().map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl component="fieldset">
            <RadioGroup
              row
              value={form.gender || ""}
              onChange={(e) => setForm({ ...form, gender: e.target.value as "Male" | "Female" })}
            >
              <FormControlLabel value="Male" control={<Radio />} label="Male" />
              <FormControlLabel value="Female" control={<Radio />} label="Female" />
            </RadioGroup>
          </FormControl>
        </Stack>
      </Box>

      {/* Fixed Footer */}
      <Box
        sx={{
          p: 1,
          borderTop: "1px solid #ddd",
          background: "#fff",
          position: "sticky",
          bottom: 0,
          zIndex: 2,
        }}
      >
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button variant="contained" onClick={() => onSave(form)}>
            Save
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
          {editMode?.nodeId && (
            <Button variant="outlined" color="error" onClick={onDelete}>
              Delete
            </Button>
          )}
        </Stack>
      </Box>

      {/* Image Modal */}
      <ImageModal
        cropSrc={cropSrc || undefined}
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        saveImage={(img) => setForm({ ...form, image: img })}
      />
    </Box>
  );
}
