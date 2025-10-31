import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import ShareIcon from '@mui/icons-material/Share';
import ForestIcon from '@mui/icons-material/Forest';
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import KeyboardIcon from '@mui/icons-material/Keyboard';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function HelpModal({ open, onClose }: Props) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="help-dialog-title"
    >
      <DialogTitle id="help-dialog-title">
        Family Tree Builder - User Guide
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" paragraph>
          Welcome to Family Tree Builder! This guide will help you understand how to use all the features.
        </Typography>

        {/* Getting Started */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Getting Started</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {`When you first open the app, you'll see your family tree canvas. Click on any person (node) to select them, which will reveal additional actions in the toolbar and details pane on the left.`}
            </Typography>
            <Typography variant="body2">
              <strong>Navigation:</strong>
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="• Pan: Click and drag on empty space"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• Zoom: Use mouse wheel or pinch gesture"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• Select: Click on any person or relationship line"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Adding People */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Adding People</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              {`To add people to your family tree, first select an existing person (or start with "Add Person" for the first member).`}
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Add Person"
                  secondary="Add a standalone person to start or expand your tree"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FamilyRestroomIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Add Parent"
                  secondary="Add a parent to the selected person. Creates parent-child relationship."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Add Child"
                  secondary="Add a child to the selected person. Creates parent-child relationship."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <GroupAddIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Add Sibling"
                  secondary="Add a sibling to the selected person. Both will share the same parents."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FavoriteIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Add Partner"
                  secondary="Add a partner/spouse to the selected person. Creates a partnership relationship."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HeartBrokenIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Add Divorced Partner"
                  secondary="Add a divorced partner to the selected person. Shows relationship differently."
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> {`After clicking an "Add" button, fill in the person's details in the left panel, then click "Save" to add them to your tree.`}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Editing and Deleting */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Editing and Deleting</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Edit Person"
                  secondary="Select a person and click Edit in the left panel to modify their details (name, dates, photo, etc.)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DeleteIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Delete Person or Relationship"
                  secondary="Select a person or relationship line, then click the Delete button in the toolbar. This will remove them and their connections."
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>Person Details Include:</strong>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Name" size="small" />
              <Chip label="Date of Birth" size="small" />
              <Chip label="Date of Death" size="small" />
              <Chip label="Country of Birth" size="small" />
              <Chip label="Gender" size="small" />
              <Chip label="Occupation" size="small" />
              <Chip label="Maiden Name" size="small" />
              <Chip label="Photo" size="small" />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Copy and Paste */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Copy and Paste Nodes</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Copy and paste multiple family members to create subtrees or duplicate parts of your family tree. 
              This is useful for creating focused trees for export or organizing related family groups.
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ContentCopyIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Copy Selected Nodes"
                  secondary="Select one or more people (hold Ctrl/Cmd or Shift while clicking), then click Copy button or press Ctrl+C (Cmd+C on Mac)"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ContentPasteIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Paste Nodes"
                  secondary="After copying, click Paste button or press Ctrl+V (Cmd+V on Mac) to create new copies with new IDs"
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Only relationships between the selected people are copied. 
                External relationships (to people not in the selection) are excluded, allowing you to extract clean subtrees.
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
              How it works:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Pasted nodes get new unique IDs to avoid conflicts" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Pasted nodes appear offset by 200px (right and down)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• All person details (names, dates, photos) are preserved" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Partner, parent-child, and sibling relationships are maintained" />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Manual Connections */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Creating Manual Connections</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <LinkIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Connect People"
                  secondary="Drag from the connection handle (small circle) on one person to another to create a custom relationship"
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              When you create a connection, a dialog will appear asking you to specify the relationship type 
              (Parent, Child, Partner, Sibling, or Divorced). This gives you full control over complex family structures.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Layout and View Controls */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Layout and View Controls</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AccountTreeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Auto Layout"
                  secondary="Automatically arranges your tree hierarchically with parents above children, partners side-by-side, and siblings at the same level"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ZoomOutMapIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Zoom Fit"
                  secondary="Adjusts the view to show your entire family tree on screen"
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Pro Tip:</strong> {`After adding multiple people, click "Auto Layout" to organize your tree beautifully. The algorithm uses ELK.js to create a hierarchical structure that's easy to read.`}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Export Features */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Export and Save</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Access export features from the menu (☰ icon in the top-left):
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ImageIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Export as PNG"
                  secondary="Download your tree as a high-resolution PNG image for printing or sharing"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PictureAsPdfIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Export as PDF"
                  secondary="Generate a PDF document of your family tree"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Export Data"
                  secondary="Download your tree data as a JSON file for backup or transfer"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Import Features */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Import Data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <UploadIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Import Data"
                  secondary="Load a previously exported JSON file to restore or merge family tree data"
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You can choose to merge imported data with your current tree or replace it entirely.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Tree Management */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Tree Management</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Manage multiple family trees from the menu:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ForestIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Select or Create New Tree"
                  secondary="Switch between different family trees or create a new one"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Rename Tree"
                  secondary="Give your tree a meaningful name (e.g., 'Smith Family', 'Maternal Line')"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DeleteIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Delete Tree"
                  secondary="Permanently remove a family tree (use with caution!)"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Appearance Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Appearance Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TuneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Customize Appearance"
                  secondary="Change node colors, edge colors, font family, node style (card/compact), and text colors"
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {`Access appearance settings from the menu to personalize your tree's look and feel. Settings are saved per-tree, so each family tree can have its own style.`}
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Share Features */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Sharing Your Tree</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ShareIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Share Tree"
                  secondary="Generate a shareable link or QR code to let others view your tree"
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              The share feature creates a link that others can use to view your family tree in real-time.
              You can also generate a QR code for easy sharing via mobile devices.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Keyboard Shortcuts */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Keyboard Shortcuts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Use keyboard shortcuts for faster workflow when editing your family tree:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <KeyboardIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" component="span">Copy Selected Nodes</Typography>
                      <Chip label="Ctrl+C" size="small" sx={{ fontFamily: 'monospace' }} />
                      <Typography variant="body2" component="span" color="text.secondary">or</Typography>
                      <Chip label="Cmd+C" size="small" sx={{ fontFamily: 'monospace' }} />
                      <Typography variant="body2" component="span" color="text.secondary">(Mac)</Typography>
                    </Box>
                  }
                  secondary="Copy selected people and their interlinking relationships to clipboard"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <KeyboardIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" component="span">Paste Nodes</Typography>
                      <Chip label="Ctrl+V" size="small" sx={{ fontFamily: 'monospace' }} />
                      <Typography variant="body2" component="span" color="text.secondary">or</Typography>
                      <Chip label="Cmd+V" size="small" sx={{ fontFamily: 'monospace' }} />
                      <Typography variant="body2" component="span" color="text.secondary">(Mac)</Typography>
                    </Box>
                  }
                  secondary="Paste copied nodes with new IDs at offset position"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <KeyboardIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" component="span">Delete Selected</Typography>
                      <Chip label="Delete" size="small" sx={{ fontFamily: 'monospace' }} />
                      <Typography variant="body2" component="span" color="text.secondary">or</Typography>
                      <Chip label="Backspace" size="small" sx={{ fontFamily: 'monospace' }} />
                      <Typography variant="body2" component="span" color="text.secondary">(Mac)</Typography>
                    </Box>
                  }
                  secondary="Delete selected person or relationship. Removes all connected edges."
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.main', color: 'success.contrastText', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Keyboard shortcuts are automatically disabled when typing in input fields, 
                so you can safely enter names and dates without triggering actions.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Tips and Tricks */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Tips and Best Practices</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Mobile Users:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Use the floating action button (bottom-right) to access all toolbar actions" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Pinch to zoom in and out" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Tap and hold to select multiple nodes" />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
              Desktop Users:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Use mouse wheel to zoom" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Toolbar icons appear at the top for quick access" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Click and drag nodes to reposition manually" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Hold Ctrl/Cmd or Shift while clicking to select multiple people" />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
              Workflow Tips:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• After adding several people, use Auto Layout to organize your tree hierarchically" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Use copy-paste to duplicate family branches for focused subtrees" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Export your tree regularly as JSON backup to prevent data loss" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Customize appearance per tree to visually distinguish different family lines" />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.main', color: 'warning.contrastText', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Data Privacy:</strong> Your family tree data is stored locally on your device and in your Firebase account. 
                Always export backups regularly to ensure your data is safe.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
