import React from "react";
import { Avatar, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useConfiguration } from "@/hooks/useConfiguration";
import { AvatarTypes } from "@/types/ConfigurationTypes";

const variantMap: Record<AvatarTypes, string> = {
  circular: "Circular",
  rounded: "Rounded",
  square: "Square",
};

export default function AvatarVariantDropdown() {
  const { setAvatarVariant, avatarVariant} = useConfiguration();

  const handleChange = (event: SelectChangeEvent) => {
    setAvatarVariant(event.target.value as AvatarTypes);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="avatar-variant-label">Avatar Variant</InputLabel>
      <Select
        labelId="avatar-variant-label"
        value={avatarVariant}
        label="Avatar Variant"
        onChange={handleChange}
        renderValue={(value) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar variant={value as AvatarTypes}>A</Avatar>
            <Typography>{variantMap[value as AvatarTypes]}</Typography>
          </Box>
        )}
      >
        {Object.entries(variantMap).map(([key, label]) => (
          <MenuItem key={key} value={key}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar variant={key as AvatarTypes}>A</Avatar>
              <Typography>{label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
