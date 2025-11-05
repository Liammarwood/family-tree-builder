import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl, Stack, Typography, Box, TextField, Slider } from '@mui/material';
import AvatarVariantDropdown from '@/components/AvatarVariantDropdown';
import { useConfiguration } from '@/hooks/useConfiguration';
import { NodeStyle, ThemeConfig } from '@/types/ConfigurationTypes';
import { FamilyTreeObject } from '@/types/FamilyTreeObject';
import { useFamilyTreeContext } from '@/hooks/useFamilyTree';
import { FamilyTreeNode } from '@/components/reactflow/FamilyNode';
import { NODE_WIDTH } from '@/libs/spacing';
import { AltFamilyTreeNode } from '@/components/reactflow/AltFamilyTreeNode';
import { FamilyTreeName } from '@/components/FamilyTreeName';

type Props = {
  open: boolean;
  onClose: () => void;
}

export default function FamilyTreeConfigurationDialog({ open, onClose }: Props) {
  const {
    showHandles, toggleHandles,
    nodeColor, setNodeColor,
    edgeColor, setEdgeColor,
    textColor, setTextColor,
    fontFamily, setFontFamily,
    nodeStyle, setNodeStyle,
    avatarSize, setAvatarSize,
    exportTitle, setExportTitle,
    showDates, setShowDates,
    nameFontSize, setNameFontSize,
    dateFontSize, setDateFontSize,
    nodeComponentType, setNodeComponentType,
    titleFontSize, setTitleFontSize,
    titleDateFontSize, setTitleDateFontSize,
    showTitleDates, setShowTitleDates
  } = useConfiguration();
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
      setAvatarSize(cfg.avatarSize || avatarSize || 150);
      // Load export config if available
      if (cfg.exportConfig) {
        setExportTitle(cfg.exportConfig.title || '');
        setShowDates(cfg.exportConfig.showDates ?? true);
        setNameFontSize(cfg.exportConfig.nameFontSize || 16);
        setDateFontSize(cfg.exportConfig.dateFontSize || 12);
        setNodeComponentType(cfg.exportConfig.nodeComponentType || 'AltFamilyTreeNode');
      }
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

          <Box>
            <Typography variant="subtitle2" gutterBottom>Avatar Size: {avatarSize}px</Typography>
            <Slider
              value={avatarSize}
              onChange={(_, value) => setAvatarSize(value as number)}
              min={150}
              max={500}
              step={5}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

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
              <MenuItem value={'"Times New Roman", Times, serif'}>Times New Roman</MenuItem>
              <MenuItem value={'"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'}>UI (Segoe)</MenuItem>
              <MenuItem value={'Arial, Helvetica, sans-serif'}>Arial</MenuItem>
              <MenuItem value={'Verdana, Geneva, sans-serif'}>Verdana</MenuItem>
              <MenuItem value={'"Courier New", Courier, monospace'}>Monospace (Courier New)</MenuItem>
              <MenuItem value={'"Trebuchet MS", Helvetica, sans-serif'}>Trebuchet MS</MenuItem>
              <MenuItem value={'"Palatino Linotype", "Book Antiqua", Palatino, serif'}>Palatino</MenuItem>
              <MenuItem value={'"Lucida Sans Unicode", "Lucida Grande", sans-serif'}>Lucida Sans</MenuItem>
              <MenuItem value={'"Comic Sans MS", "Comic Sans", cursive'}>Casual (Comic Sans)</MenuItem>
              <MenuItem value={'Impact, Charcoal, sans-serif'}>Impact</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="node-style-label">Person Panel Background Style</InputLabel>
            <Select labelId="node-style-label" value={nodeStyle} label="Person Panel Background Style" onChange={(e) => setNodeStyle(e.target.value as NodeStyle)}>
              <MenuItem value={'card'}>Card</MenuItem>
              <MenuItem value={'compact'}>Compact</MenuItem>
              <MenuItem value={'rounded'}>Rounded</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="node-component-label">Person Panel Style</InputLabel>
            <Select
              labelId="node-component-label"
              value={nodeComponentType}
              label="Node Component"
              onChange={(e) => setNodeComponentType(e.target.value as import('@/types/ConfigurationTypes').NodeComponentType)}
            >
              <MenuItem value={'FamilyTreeNode'}>Family Tree Style 1</MenuItem>
              <MenuItem value={'AltFamilyTreeNode'}>Family Tree Style 2</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Name Font Size: {nameFontSize}px</Typography>
            <Slider
              value={nameFontSize}
              onChange={(_, value) => setNameFontSize(value as number)}
              min={10}
              max={24}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Date Font Size: {dateFontSize}px</Typography>
            <Slider
              value={dateFontSize}
              onChange={(_, value) => setDateFontSize(value as number)}
              min={8}
              max={18}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <FormControlLabel
            control={<Switch checked={showDates} onChange={(e) => setShowDates(e.target.checked)} />}
            label="Show Dates"
          />

          <Typography variant="subtitle1" gutterBottom>Person Panel Preview</Typography>

          {/* Live preview of a node using current configuration */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
            {/* Wrap preview in a scaling container so the fixed NODE_WIDTH doesn't cause horizontal scroll */}
            <Box sx={{ maxWidth: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: NODE_WIDTH, transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                {nodeComponentType === 'AltFamilyTreeNode' ? (
                  <AltFamilyTreeNode preview selected={false} data={{ id: 'preview', name: 'John Doe', dateOfBirth: '1980-01-01', occupation: 'Carpenter', image: '', gender: 'Male' }} id={''} type={''} zIndex={0} isConnectable={false} xPos={0} yPos={0} dragging={false} />
                ) : (
                  <FamilyTreeNode preview selected={false} data={{ id: 'preview', name: 'John Doe', dateOfBirth: '1980-01-01', occupation: 'Carpenter', image: '', gender: 'Male' }} id={''} type={''} zIndex={0} isConnectable={false} xPos={0} yPos={0} dragging={false} />
                )}
              </Box>
            </Box>
          </Box>

          {/* Family Tree Title Appearance Section */}
          <TextField
            fullWidth
            label="Family Tree Title"
            value={exportTitle}
            onChange={(e) => setExportTitle(e.target.value)}
            placeholder="e.g., Smith Family Tree"
            helperText="Leave empty to use default tree name"
          />

          <FormControlLabel
            control={<Switch checked={showTitleDates} onChange={(e) => setShowTitleDates(e.target.checked)} />}
            label="Show Title Dates"
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>Title Font Size: {titleFontSize}px</Typography>
            <Slider
              value={titleFontSize}
              onChange={(_, value) => setTitleFontSize(value as number)}
              min={10}
              max={24}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Title Date Font Size: {titleDateFontSize}px</Typography>
            <Slider
              value={titleDateFontSize}
              onChange={(_, value) => setTitleDateFontSize(value as number)}
              min={8}
              max={18}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Typography variant="subtitle1" gutterBottom>Title Preview</Typography>

          {/* Live preview of a node using current configuration */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
            <FamilyTreeName name={exportTitle || `${currentTree?.name} Family Tree`} nodes={[]} boxSx={{ position: "relative", transform: "none", left: "0%"}} />
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
                avatarSize,
                exportConfig: {
                  title: exportTitle,
                  showDates,
                  nameFontSize,
                  dateFontSize,
                  nodeComponentType,
                }
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
