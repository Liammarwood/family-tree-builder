import { Box, Typography } from "@mui/material"
import React from "react";

export const DetailsPane = ({ children }: { children?: React.ReactNode[] }) => {
    const validChildren = React.Children.toArray(children).filter(Boolean);
    return (
        <Box justifyContent="center" alignItems="center" textAlign="center" sx={{ height: '82vh', overflowY: "auto", width: 320, minWidth: 260, maxWidth: 400, p: 3, borderRadius: 0, bgcolor: '#fff', gap: 2 }}>
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