import { useConfiguration } from "@/hooks/useConfiguration";
import { calculateEarliestDateOfBirth } from "@/libs/nodes";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { Node } from "reactflow";

export const FamilyTreeName: React.FC<{ name: string, nodes: Node[], boxSx?: SxProps<Theme> }> = ({ name, nodes, boxSx }) => {
    const { fontFamily, textColor, showTitleDates, titleFontSize, titleDateFontSize } = useConfiguration();

    return (
        <Box
            sx={{
                fontFamily: fontFamily,
                color: textColor,
                position: "absolute",
                top: 0,
                mt: "5px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                p: "12px 24px",
                bgcolor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 1,
                border: "2px solid black",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                textAlign: "center",
                ...boxSx,
            }}
        >
            <Typography variant="body1" sx={{
                fontSize: `${titleFontSize}px`,
            }}>{name}</Typography>
            {showTitleDates && <Typography variant="body1" fontWeight="bold" sx={{
                fontSize: `${titleDateFontSize}px`,
            }}>
                {`${calculateEarliestDateOfBirth(nodes).getFullYear()} - ${new Date().getFullYear()}`}
            </Typography>}
        </Box>
    );
}