import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl, Stack, Typography, Box, TextField, InputAdornment } from '@mui/material';
import AvatarVariantDropdown from './AvatarVariantDropdown';
import { useConfiguration } from '@/hooks/useConfiguration';
import { NodeStyle, ThemeConfig } from '@/types/ConfigurationTypes';
import { FamilyTreeObject } from '@/types/FamilyTreeObject';
import { useFamilyTreeContext } from '@/hooks/useFamilyTree';
import { FamilyTreeNode } from './FamilyNode';
import { NODE_WIDTH } from '@/libs/spacing';

type Props = {
  open: boolean;
  onClose: () => void;
}

export default function FamilyTreeConfigurationDialog({ open, onClose }: Props) {
  const { showHandles, toggleHandles, avatarVariant, setAvatarVariant, nodeColor, setNodeColor, edgeColor, setEdgeColor, textColor, setTextColor, fontFamily, setFontFamily, nodeStyle, setNodeStyle } = useConfiguration();
  const { currentTree, saveTree } = useFamilyTreeContext();

  // When dialog opens, load current tree config into the configuration context
  useEffect(() => {
    if (!currentTree || !open) return;
    const cfg: ThemeConfig | undefined = currentTree.config;
    if (cfg) {
      setNodeColor(cfg.nodeColor || nodeColor);
      setEdgeColor(cfg.edgeColor || edgeColor);
      setTextColor(cfg.textColor || textColor || '#5d4e37');
      setFontFamily(cfg.fontFamily || fontFamily);
      setNodeStyle(cfg.nodeStyle || nodeStyle);
    }
  }, [open, currentTree]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Family Tree Configuration</DialogTitle>
  <DialogContent sx={{ overflowX: 'hidden' }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControlLabel control={<Switch checked={showHandles} onChange={() => toggleHandles()} />} label={showHandles ? 'Show Handles' : 'Hide Handles'} />

          <div>
            <AvatarVariantDropdown />
          </div>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2">Node color</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 40, height: 28, borderRadius: 1, border: '1px solid rgba(0,0,0,0.12)', bgcolor: nodeColor }}>
                <input
                  type="color"
                  value={nodeColor}
                  onChange={(e) => setNodeColor(e.target.value)}
                  aria-label="node-color-picker"
                  style={{ width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0, margin: 0, background: 'transparent' }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2">Edge color</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 40, height: 28, borderRadius: 1, border: '1px solid rgba(0,0,0,0.12)', bgcolor: edgeColor }}>
                <input
                  type="color"
                  value={edgeColor}
                  onChange={(e) => setEdgeColor(e.target.value)}
                  aria-label="edge-color-picker"
                  style={{ width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0, margin: 0, background: 'transparent' }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2">Text color</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 40, height: 28, borderRadius: 1, border: '1px solid rgba(0,0,0,0.12)', bgcolor: textColor }}>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  aria-label="text-color-picker"
                  style={{ width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0, margin: 0, background: 'transparent' }}
                />
              </Box>
            </Box>
          </Box>

          <FormControl fullWidth>
            <InputLabel id="font-select-label">Font family</InputLabel>
            <Select labelId="font-select-label" value={fontFamily} label="Font family" onChange={(e) => setFontFamily(e.target.value)}>
                <MenuItem value={'Inter, Roboto, "Helvetica Neue", Arial'}>System (Inter/Roboto)</MenuItem>
                <MenuItem value={'Georgia, serif'}>Serif (Georgia)</MenuItem>
                <MenuItem value={'"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'}>UI (Segoe)</MenuItem>
                <MenuItem value={'"Courier New", Courier, monospace'}>Monospace (Courier New)</MenuItem>
                <MenuItem value={'"Comic Sans MS", "Comic Sans", cursive'}>Casual (Comic Sans)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="node-style-label">Node style</InputLabel>
            <Select labelId="node-style-label" value={nodeStyle} label="Node style" onChange={(e) => setNodeStyle(e.target.value as NodeStyle)}>
              <MenuItem value={'card'}>Card</MenuItem>
              <MenuItem value={'compact'}>Compact</MenuItem>
              <MenuItem value={'rounded'}>Rounded</MenuItem>
            </Select>
          </FormControl>
          {/* Live preview of a node using current configuration */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
            {/* Wrap preview in a scaling container so the fixed NODE_WIDTH doesn't cause horizontal scroll */}
            <Box sx={{ maxWidth: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: NODE_WIDTH, transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                <FamilyTreeNode preview selected={false as any} data={{ id: 'preview', name: 'John Doe', dateOfBirth: '1980-01-01', occupation: 'Carpenter', image: '', gender: 'Male' } as any} id={''} type={''} zIndex={0} isConnectable={false} xPos={0} yPos={0} dragging={false} />
              </Box>
            </Box>
          </Box>

        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => {
          // Save current configuration into the tree and persist
          if (currentTree) {
            const updated: FamilyTreeObject = {
              ...currentTree,
              config: {
                nodeColor,
                edgeColor,
                textColor,
                fontFamily,
                nodeStyle,
              }
            };
            saveTree(updated);
          }
          onClose();
        }} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  )
}
