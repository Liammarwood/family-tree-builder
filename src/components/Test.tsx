"use client"
import React, {useState} from 'react';
import { AppBar, Toolbar, Typography, Box, Drawer, IconButton } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const DRAWER_WIDTH = 300;

export default function ArrowDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Title bar */}
      <AppBar position="fixed" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            My Application
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Floating arrow tab shown when the drawer is closed */}
      {!open && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: (theme) => theme.palette.background.paper,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
            boxShadow: 3,
            px: 0.5,
            py: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setOpen(true)}
            aria-label="Open drawer"
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}

      {/* Drawer clipped under the AppBar */}
      <Drawer
        variant="persistent"
        open={open}
        anchor="left"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: (theme) => theme.mixins.toolbar.minHeight,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.25,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6">Menu</Typography>
          <IconButton onClick={() => setOpen(false)} aria-label="Close drawer">
            <ArrowBackIosNewIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography paragraph>
            This is an example drawer clipped under the app bar.
          </Typography>
        </Box>
      </Drawer>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: (theme) => theme.mixins.toolbar.minHeight,
          transition: 'margin-left 300ms ease',
          marginLeft: open ? `${DRAWER_WIDTH}px` : 0,
        }}
      >
        <Typography variant="h5">Page content</Typography>
        <Typography sx={{ mt: 1 }}>
          The drawer now appears clipped beneath the title bar. Use the floating arrow to open it.
        </Typography>
      </Box>
    </>
  );
}