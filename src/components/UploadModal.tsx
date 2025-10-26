import React, { useState, useRef } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Modal,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { handleImport } from "@/libs/backup";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const UploadModal: React.FC<Props> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Drag & Drop ---
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleImport(e.dataTransfer.files[0], setLoading);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="indexeddb-modal-title"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          position: "relative",
          width: 400,
          maxWidth: "90vw",
          p: 4,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Title */}
        <Typography id="indexeddb-modal-title" variant="h6" fontWeight={600}>
          Upload Family Tree
        </Typography>

        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
            <CircularProgress />
            <Typography mt={2}>Processing...</Typography>
          </Box>
        ) : (
          <>
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: "100%",
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #aaa",
                borderRadius: 2,
                cursor: "pointer",
                textAlign: "center",
                p: 2,
              }}
            >
              <Typography color="text.secondary">
                Drag & Drop JSON file here or click to select
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file, setLoading);
                }}
              />
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );
};
