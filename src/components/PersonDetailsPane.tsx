import React, { useState, useEffect, Fragment } from "react";
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
  Divider,
  FormLabel,
} from "@mui/material";
import { getNames } from "country-list";
import { EditMode } from "@/types/EditMode";
import ImageModal from "@/components/ImageModal";
import GooglePhotosPicker from "@/components/GooglePhotosPicker";
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
        image: editMode.nodeData.image || undefined,
      });
    }
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress the image before cropping to reduce memory usage
      const { compressImageFile } = await import('@/libs/imageCompression');
      const compressedImage = await compressImageFile(file);
      setCropSrc(compressedImage);
      setImageModalOpen(true);
    } catch (error) {
      console.error('Error compressing image:', error);
      // Fallback to original behavior if compression fails
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setImageModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGooglePhotosSelect = (imageUrl: string) => {
    setCropSrc(imageUrl);
    setImageModalOpen(true);
  };

  const showRelationshipSection =
    editMode?.relation === "partner" || editMode?.relation === "divorced-partner";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1,
          borderBottom: "1px solid #ddd",
          background: (theme) => theme.palette.background.paper,
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Typography variant="h6">{getTitle()}</Typography>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
        }}
      >
        <Stack spacing={3}>


          {/* Relationship Details (conditional) */}
          {showRelationshipSection && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Relationship Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <TextField
                  label="Date of Marriage"
                  type="date"
                  value={form.dateOfMarriage}
                  onChange={(e) => setForm({ ...form, dateOfMarriage: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />

                {editMode?.relation === "divorced-partner" && (
                  <TextField
                    label="Date of Divorce"
                    type="date"
                    value={form.dateOfDivorce}
                    onChange={(e) => setForm({ ...form, dateOfDivorce: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                    fullWidth
                  />
                )}
              </Stack>
            </Box>
          )}
          {/* Person Details */}
          <Box>
            {showRelationshipSection && <Fragment>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Person Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Fragment>}

            <Stack spacing={2} alignItems="center">
              <Avatar src={form.image || undefined} alt="User Avatar" sx={{ width: 120, height: 120 }}>
                {!form.image && "Photo"}
              </Avatar>

              <Stack direction="row" spacing={1}>
                <Box>
                  <input accept="image/*" id="avatar-upload" type="file" hidden onChange={handleFileChange} />
                  <label htmlFor="avatar-upload">
                    <Button variant="contained" component="span">
                      {form.image ? "Change Avatar" : "Upload Avatar"}
                    </Button>
                  </label>
                </Box>
                <GooglePhotosPicker onImageSelected={handleGooglePhotosSelect} />
              </Stack>

              <TextField
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Date of Death"
                type="date"
                value={form.dateOfDeath}
                onChange={(e) => setForm({ ...form, dateOfDeath: e.target.value })}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Maiden Name"
                value={form.maidenName}
                onChange={(e) => setForm({ ...form, maidenName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Occupation"
                value={form.occupation}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="country-label">Country of Birth</InputLabel>
                <Select
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

              {/* ✅ Gender Label Added */}
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ textAlign: "left"}}>Gender</FormLabel>
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
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1,
          borderTop: "1px solid #ddd",
          background: (theme) => theme.palette.background.paper,
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
