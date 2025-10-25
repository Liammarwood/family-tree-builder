"use client";
import React from "react";
import { Box, Button, Typography, Paper, Stack } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

type Props = {
  onSignIn: () => void; // Function to handle sign-in logic
};

export default function NotSignedIn({ onSignIn }: Props) {
  return (
     <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90vh",
        backgroundColor: (theme) => theme.palette.background.default,
        p: 2,
      }}
    >
        <Paper
        elevation={3}
        sx={{
            p: 4,
            textAlign: "center",
            maxWidth: 400,
            mx: "auto",
            mt: 8,
            borderRadius: 3,
        }}
        >
        <Stack spacing={3} alignItems="center">

            <Typography variant="h5" fontWeight={600}>
            You’re not signed in
            </Typography>

            <Typography variant="body1" color="text.secondary">
            Sign in with your Google account to continue to the Family Tree Builder.
            </Typography>

            <Button
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={onSignIn}
            sx={{
                textTransform: "none",
                fontWeight: 500,
                bgcolor: "#4285F4",
                "&:hover": { bgcolor: "#357ae8" },
            }}
            >
            Sign in with Google
            </Button>
        </Stack>
        </Paper>
    </Box>
  );
}