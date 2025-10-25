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

type Props = {
  dbName: string;
  dbVersion?: number;
  open: boolean;
  onClose: () => void;
};

export const UploadModal: React.FC<Props> = ({ open, onClose, dbName, dbVersion }) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Import function ---
  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const importData: Record<string, { schema: any; data: any[] }> = JSON.parse(text);
      const newVersion = (dbVersion || 1) + 1;

      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, newVersion);
        request.onerror = () => reject(request.error);
        request.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          for (const storeName of Object.keys(importData)) {
            const { schema } = importData[storeName];
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, {
                keyPath: schema.keyPath,
                autoIncrement: schema.autoIncrement,
              });
            }
          }
        };
        request.onsuccess = () => resolve(request.result);
      });

      for (const storeName of Object.keys(importData)) {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        for (const item of importData[storeName].data) {
          store.put(item);
        }
      }
    } catch (err) {
      console.error("Import failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Drag & Drop ---
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleImport(e.dataTransfer.files[0]);
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
                  if (file) handleImport(file);
                }}
              />
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );
};
