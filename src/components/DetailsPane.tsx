import { Box, SxProps, Theme, Typography } from "@mui/material"
import React from "react";

export const DetailsPane = ({ children, sx }: { sx: SxProps<Theme>, children?: React.ReactNode[] }) => {
    const validChildren = React.Children.toArray(children).filter(Boolean);
    return (
        <Box justifyContent="center" alignItems="center" textAlign="center" sx={{ height: '90vh', overflowY: "auto", width: 320, p: 1, borderRadius: 0, bgcolor: '#fff', gap: 2, ...sx }}>
            {validChildren !== undefined && validChildren.length === 1 ? validChildren :

                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                    sx={{ height: '100%' }}
                ><Typography
                    fontWeight="bold"
                    textAlign="center"
                    variant="body2"
                    color="text.secondary">Select either a person or relationship to edit.</Typography></Box>}
        </Box>
    )
}