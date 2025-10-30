import { AppBar, Box, Toolbar, Typography, useMediaQuery, IconButton, Tooltip } from "@mui/material";
import FamilyTreeMenu from "@/components/FamilyTreeMenu";
import FamilyTreeToolbar from "@/components/FamilyTreeToolbar";
import { EditMode } from "@/types/EditMode";
import { APP_VERSION } from '@/libs/version';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AboutModal from '@/components/AboutModal';
import HelpModal from '@/components/HelpModal';
import React from 'react';

type Props = {
    setEditMode: (edit: EditMode) => void;
    editMode: EditMode | null;
};

export default function NavigationBar({ setEditMode }: Props) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [aboutOpen, setAboutOpen] = React.useState(false);
    const [helpOpen, setHelpOpen] = React.useState(false);
    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* Left side: burger + title */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FamilyTreeMenu />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        <img
                            src="favicon.ico"
                            alt="icon"
                            width={24}
                            height={24}
                            style={{ display: "inline-block" }}
                        /> Family Tree Builder
                    </Typography>
                </Box>

                {/* Right side: toolbar actions + version */}
                {!isMobile && <Box sx={{ display: "flex", gap: 1, alignItems: 'center' }}>
                    <FamilyTreeToolbar setEditMode={setEditMode} />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        v{APP_VERSION}
                    </Typography>
                    <Tooltip title="Help">
                      <IconButton aria-label="help" size="small" onClick={() => setHelpOpen(true)}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="About">
                      <IconButton aria-label="about" size="small" onClick={() => setAboutOpen(true)}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
                    <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
                </Box>}
            </Toolbar>
        </AppBar>
    )
}