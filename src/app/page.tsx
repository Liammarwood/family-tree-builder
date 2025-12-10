"use client";

import FamilyTree from "@/components/FamilyTree";
import { RequireAuth } from "@/components/RequireAuth";
import { FamilyTreeProvider } from "@/hooks/useFamilyTree";
import { ConfigurationProvider } from "@/hooks/useConfiguration";
import { ErrorProvider } from "@/hooks/useError";
import { ReactFlowProvider } from "reactflow";
import { useState } from "react";
import FamilyTreeToolbar from "@/components/FamilyTreeToolbar";
import NavigationBar from "@/components/NavigationBar";
import { Box, useMediaQuery } from "@mui/material";
import { EditMode } from "@/types/EditMode";
import { ClipboardProvider } from "@/hooks/useClipboard";
import { ModeProvider } from "@/contexts/ModeContext";

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [editMode, setEditMode] = useState<EditMode | null>(null);

  return (
    <ErrorProvider>
      <RequireAuth>
        <ConfigurationProvider>
          <FamilyTreeProvider>
            <ModeProvider>
              <ClipboardProvider>
                <ReactFlowProvider>
                  <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#f3f6fa' }}>
                    <NavigationBar editMode={editMode} setEditMode={setEditMode} />
                    <FamilyTree  showGrid editMode={editMode} setEditMode={setEditMode} />
                    {isMobile && editMode === null && <FamilyTreeToolbar setEditMode={setEditMode} hidden={!isMobile || editMode !== null} />}
                  </Box>
                </ReactFlowProvider>
              </ClipboardProvider>
            </ModeProvider>
          </FamilyTreeProvider>
        </ConfigurationProvider>
      </RequireAuth>
    </ErrorProvider>);
}
