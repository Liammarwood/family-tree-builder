import { AppBar, Toolbar, Typography } from "@mui/material";
import ConfigurationMenu from "@/components/ConfigurationMenu";

export default function NavigationBar({name}: {name?: string}) {
    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" sx={{ px: 3, py: 0, fontWeight: 700, letterSpacing: 1 }}>Family Tree Builder ({name})</Typography>
                <ConfigurationMenu />
            </Toolbar>
        </AppBar>
    )
}