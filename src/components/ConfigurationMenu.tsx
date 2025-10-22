import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Divider, ListItemIcon, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import LogoutIcon from '@mui/icons-material/Logout';
import { useConfiguration } from '@/hooks/useConfiguration';

const ConfigMenu: React.FC = () => {
    const { showHandles, toggleHandles } = useConfiguration();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                size="large"
                sx={{ ml: "auto" }}
            >
                <SettingsIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Typography variant="subtitle2" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>
                    Configuration
                </Typography>

                <MenuItem onClick={() => toggleHandles()}>
                    <ListItemIcon>
                        <TuneIcon fontSize="small" />
                    </ListItemIcon>
                    {showHandles ? "Hide" : "Show"} Handles
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => console.log('Logout clicked')}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout (Currently not implemented)
                </MenuItem>
            </Menu>
        </>
    );
};

export default ConfigMenu;
