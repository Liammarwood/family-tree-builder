"use client";

import FamilyTree, { GenerationFilter } from "@/components/FamilyTree";
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

export default function Home() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [editMode, setEditMode] = useState<EditMode | null>(null);
  const [generationFilter, setGenerationFilter] = useState<GenerationFilter>({
    enabled: false,
    ancestorGenerations: 2,
    descendantGenerations: 2,
    siblingGenerations: 2,
  });

  return (
    <ErrorProvider>
      <RequireAuth>
        <ConfigurationProvider>
          <FamilyTreeProvider>
            <ReactFlowProvider>
              <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: '#f3f6fa' }}>
                <NavigationBar 
                  editMode={editMode} 
                  setEditMode={setEditMode}
                  generationFilter={generationFilter}
                  setGenerationFilter={setGenerationFilter}
                />
                <FamilyTree 
                  showGrid 
                  editMode={editMode} 
                  setEditMode={setEditMode}
                  generationFilter={generationFilter}
                />
                {isMobile && editMode === null && <FamilyTreeToolbar setEditMode={setEditMode} hidden={!isMobile || editMode !== null} />}
              </Box>
            </ReactFlowProvider>
          </FamilyTreeProvider>
        </ConfigurationProvider>
      </RequireAuth>
    </ErrorProvider>);
}
