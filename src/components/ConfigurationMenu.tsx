import React, { useState, useEffect } from 'react';
import { IconButton, Menu, MenuItem, Divider, ListItemIcon, Typography } from '@mui/material';
import { AccountCircle, Delete, Download, Edit, Forest, PictureAsPdf, Upload } from "@mui/icons-material"
import ImageIcon from "@mui/icons-material/Image"
import TuneIcon from '@mui/icons-material/Tune';
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from '@mui/icons-material/Logout';
import { useConfiguration } from '@/hooks/useConfiguration';
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
import AvatarVariantDropdown from './AvatarVariantDropdown';
import { useFamilyTreeContext } from '@/hooks/useFamilyTree';
import { RenameTreeDialog } from './RenameTreeDialog';
import { handleExport } from '@/libs/backup';
import { ExportType } from '@/types/ExportTypes';
import ExportPreviewDialog from './ExportPreviewDialog';
import { FamilyTreeSection } from './FamilyTreeSelection';
import { ShareModal } from './ShareModal';
import { UploadModal } from './UploadModal';
import { useSearchParams } from 'next/navigation';

const ConfigMenu: React.FC = () => {
    const { showHandles, toggleHandles } = useConfiguration();
    const { currentTree, deleteTree } = useFamilyTreeContext();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isRenameTreeModalOpen, setRenameTreeModalOpen] = useState<boolean>(false);
    const [isSelectModalOpen, setSelectModalOpen] = useState<boolean>(false);
    const [isUploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
    const [isShareModalOpen, setShareModalOpen] = useState<boolean>(false);
    const [isExportPDFOpen, setExportPDFOpen] = useState<boolean>(false);
    const [isExportPNGOpen, setExportPNGOpen] = useState<boolean>(false);
    const searchParams = useSearchParams();

    const open = Boolean(anchorEl);

    // Auto open modal if call is in params
    useEffect(() => {
        const callParam = searchParams.get("call")
        if (callParam) {
            setShareModalOpen(true);
        }
    }, [searchParams])

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
                <MenuIcon />
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
                    User
                </Typography>

                <MenuItem>
                    <ListItemIcon>
                        <AccountCircle />
                    </ListItemIcon>
                    Signed in as {auth.currentUser?.displayName}
                </MenuItem>

                <Typography variant="subtitle2" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>
                    Configuration
                </Typography>

                <MenuItem onClick={() => toggleHandles()}>
                    <ListItemIcon>
                        <TuneIcon fontSize="small" />
                    </ListItemIcon>
                    {showHandles ? "Hide" : "Show"} Handles
                </MenuItem>

                <MenuItem>
                    <AvatarVariantDropdown />
                </MenuItem>

                <Divider />

                <Typography variant="subtitle2" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>
                    Current Family Tree
                </Typography>

                <MenuItem onClick={() => setRenameTreeModalOpen(true)}>
                    <ListItemIcon>
                        <Edit fontSize="small" />
                    </ListItemIcon>
                    Rename Tree
                </MenuItem>

                <MenuItem onClick={() => currentTree ? deleteTree(currentTree.id) : null}>
                    <ListItemIcon>
                        <Delete fontSize="small" />
                    </ListItemIcon>
                    Delete Tree
                </MenuItem>

                <MenuItem onClick={() => setExportPNGOpen(true)}>
                    <ListItemIcon>
                        <ImageIcon fontSize="small" />
                    </ListItemIcon>
                    Export as PNG
                </MenuItem>

                <MenuItem onClick={() => setExportPDFOpen(true)}>
                    <ListItemIcon>
                        <PictureAsPdf fontSize="small" />
                    </ListItemIcon>
                    Export as PDF
                </MenuItem>

                <MenuItem onClick={() => handleExport(currentTree?.id)}>
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    Export Data
                </MenuItem>

                <MenuItem onClick={() => setUploadModalOpen(true)}>
                    <ListItemIcon>
                        <Upload fontSize="small" />
                    </ListItemIcon>
                    Import Data
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => setSelectModalOpen(true)}>
                    <ListItemIcon>
                        <Forest fontSize="small" />
                    </ListItemIcon>
                    Select or Create New Tree
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => signOut(auth)}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
            <RenameTreeDialog open={isRenameTreeModalOpen} onClose={() => setRenameTreeModalOpen(false)} />
            <UploadModal
                open={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
            />
            <FamilyTreeSection
                open={isSelectModalOpen}
                onClose={() => setSelectModalOpen(false)}
            />
            <ShareModal
                open={isShareModalOpen}
                onClose={() => setShareModalOpen(false)}
            />
            <ExportPreviewDialog
                open={isExportPDFOpen || isExportPNGOpen}
                exportType={isExportPDFOpen ? ExportType.PDF : isExportPNGOpen ? ExportType.PNG : undefined}
                onClose={() => {
                    setExportPDFOpen(false);
                    setExportPNGOpen(false);
                }}
            />
        </>
    );
};

export default ConfigMenu;