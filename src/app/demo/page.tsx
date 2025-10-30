"use client";

import React, { useState } from 'react';
import { ConfigurationProvider } from '@/hooks/useConfiguration';
import { FamilyTreeProvider } from '@/hooks/useFamilyTree';
import { ErrorProvider } from '@/hooks/useError';
import FamilyTreeConfigurationDialog from '@/components/FamilyTreeConfigurationDialog';
import { Button, Box, Container, Typography } from '@mui/material';
import { ReactFlowProvider } from 'reactflow';

export default function DemoPage() {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <ErrorProvider>
      <ConfigurationProvider>
        <FamilyTreeProvider>
          <ReactFlowProvider>
          <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            Export Configuration Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            This demo page showcases the new export configuration features.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => setConfigOpen(true)}
            sx={{ mt: 2 }}
          >
            Open Configuration Dialog
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            New Features:
          </Typography>
          <ul>
            <li>
              <Typography variant="body1">
                <strong>Custom Export Title:</strong> Set a custom title for your exported family tree
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Node Component Selection:</strong> Choose between FamilyTreeNode and AltFamilyTreeNode styles
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Show/Hide Dates:</strong> Toggle visibility of birth and death dates
              </Typography>
            </li>
            <li>
              <Typography variant="body1">
                <strong>Font Size Control:</strong> Adjust name and date font sizes with sliders (10-24px for names, 8-18px for dates)
              </Typography>
            </li>
          </ul>
        </Box>

            <FamilyTreeConfigurationDialog 
              open={configOpen} 
              onClose={() => setConfigOpen(false)} 
            />
          </Container>
          </ReactFlowProvider>
        </FamilyTreeProvider>
      </ConfigurationProvider>
    </ErrorProvider>
  );
}
