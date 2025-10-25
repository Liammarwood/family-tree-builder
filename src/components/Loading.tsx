import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingProps {
  /** Optional helper text under the spinner */
  message?: string;
  /** Size of the CircularProgress in px */
  size?: number;
  /** If true the box will take full height (100%) */
  height?: string;
  /** Optional additional Box sx props */
  sx?: React.ComponentProps<typeof Box>["sx"];
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  size = 48,
  height,
  sx,
}) => {
  return (
    <Box
      role="status"
      aria-busy="true"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        height: height ?? "auto",
        width: "100%",
        boxSizing: "border-box",
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CircularProgress size={size} />
        {message && (
          <Typography variant="body2" color="text.secondary" align="center">
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
