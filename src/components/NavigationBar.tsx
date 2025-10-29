import { AppBar, Box, Toolbar, Typography, useMediaQuery } from "@mui/material";
import ConfigurationMenu from "@/components/ConfigurationMenu";
import FamilyTreeToolbar from "./FamilyTreeToolbar";
import { EditMode } from "@/types/EditMode";
import { APP_VERSION } from '@/libs/version';

type Props = {
    setEditMode: (edit: EditMode) => void;
    editMode: EditMode | null;
};

export default function NavigationBar({ setEditMode }: Props) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* Left side: burger + title */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ConfigurationMenu />
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
                </Box>}
            </Toolbar>
        </AppBar>
    )
}