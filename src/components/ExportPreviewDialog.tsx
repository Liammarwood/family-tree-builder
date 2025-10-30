"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
} from "@mui/material";
import { exportToPNG, exportToPDF, triggerDownload } from "@/libs/export";
import { useConfiguration } from "@/hooks/useConfiguration";
import { ExportType } from "@/types/ExportTypes";
import ReactFlow, { Controls, ReactFlowInstance, useReactFlow } from "reactflow"
import { EDGE_TYPES, getNodeTypes, GRID_SIZE } from "@/libs/constants";
import { useFamilyTreeContext } from "@/hooks/useFamilyTree";
import ThemeFromConfig from '@/components/ThemeFromConfig';
import { FamilyTreeName } from '@/components/FamilyTreeName';

type ExportPreviewDialogProps = {
    open: boolean;
    onClose: () => void;
    exportType?: ExportType;
};

const ExportPreviewDialog: React.FC<ExportPreviewDialogProps> = ({
    open,
    onClose,
    exportType
}) => {
    const { setShowHandles, exportTitle, nodeComponentType } = useConfiguration();
    const { getNodes, getEdges } = useReactFlow();
    const exportRef = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const { currentTree } = useFamilyTreeContext();
    // Fit view when dialog opens or ReactFlow instance is ready
    useEffect(() => {
        if (open && reactFlowInstance) {
            setShowHandles(false)
            // Small delay to ensure container is measured
            setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.1, minZoom: 0.05, maxZoom: 1 });
            }, 100);
        }
    }, [open, reactFlowInstance, setShowHandles]);

    const handleClose = () => {
        setShowHandles(false);
        onClose();
    }

    const handleExportPNG = async () => {
        if (!exportRef.current) return;
        const pngDataUrl = await exportToPNG(exportRef.current);
        triggerDownload(pngDataUrl, "family-tree.png");
    };

    const handleExportPDF = async () => {
        if (!exportRef.current) return;
        const pdfBlob = await exportToPDF(exportRef.current);
        triggerDownload(pdfBlob, "family-tree.pdf");
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>Export Preview</DialogTitle>
            <DialogContent>
                <Box
                    ref={exportRef}
                    sx={{
                        width: "100%",
                        height: "60vh",
                        overflow: "hidden",
                        background: "#fff",
                        position: "relative",
                        borderWidth: "2px",
                        borderColor: "black",
                    }}
                >                    
                    <ThemeFromConfig>
                    <FamilyTreeName name={exportTitle || `${currentTree?.name} Family Tree`} nodes={getNodes()} />
                    <ReactFlow
                        nodes={getNodes()}
                        edges={getEdges()}
                        edgeTypes={useMemo(() => EDGE_TYPES, [])}
                        nodeTypes={useMemo(() => getNodeTypes(nodeComponentType), [nodeComponentType])}
                        minZoom={0.05}
                        maxZoom={2}
                        fitView
                        snapToGrid={true}
                        snapGrid={[GRID_SIZE, GRID_SIZE]}
                        onInit={setReactFlowInstance}
                        attributionPosition={"top-center"}
                    >
                        <Controls />
                    </ReactFlow>
                    </ThemeFromConfig>
                </Box>
            </DialogContent>
            <DialogActions>
                {exportType === ExportType.PNG ? <Button onClick={handleExportPNG} variant="contained" color="primary">
                    Export as PNG
                </Button> :
                    <Button onClick={handleExportPDF} variant="contained" color="primary">
                        Export as PDF
                    </Button>}
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportPreviewDialog;