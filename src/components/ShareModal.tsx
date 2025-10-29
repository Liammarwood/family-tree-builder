"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Modal,
    TextField,
    Alert,
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import { useFirestoreSignaling } from "@/hooks/useFirestoreSignaling";
import { logger } from '@/libs/logger';
import { RequireAuth } from "@/components/RequireAuth";
import { useError } from "@/hooks/useError";
import { QRCodeSVG } from "qrcode.react";
import { FamilyTreeObject } from "@/types/FamilyTreeObject";
import { CheckCircle, HourglassEmpty, Warning } from "@mui/icons-material";
import { useFamilyTreeContext } from "@/hooks/useFamilyTree";
import { TreeMergeDialog } from "@/components/TreeMergeDialog";

type ShareModalProps = {
    open: boolean;
    onClose: () => void;
};

export const ShareModal: React.FC<ShareModalProps> = ({
    open,
    onClose
}) => {
    const [callId, setCallId] = useState<string | null>(null);
    const [callInput, _setCallInput] = useState<string>("");
    const [connected, setConnected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [channel, setChannel] = useState<RTCDataChannel | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isReceiver, setIsReceiver] = useState<boolean>(false);
    const [pendingTree, setPendingTree] = useState<FamilyTreeObject | null>(null);
    const [existingTreeForMerge, setExistingTreeForMerge] = useState<FamilyTreeObject | null>(null);
    const [showOverrideDialog, setShowOverrideDialog] = useState<boolean>(false);
    const [showMergeDialog, setShowMergeDialog] = useState<boolean>(false);
    const { isDbReady, trees, saveTree, currentTree } = useFamilyTreeContext();

    const setCallInput = (input: string) => {
        setIsReceiver(true);
        _setCallInput(input);
    }

    const { createOffer, joinCall } = useFirestoreSignaling();
    const pc = React.useRef<RTCPeerConnection | null>(null);
    const { showError } = useError();

    // 🔹 Reset state and cleanup connection
    const handleClose = () => {
        resetState();
        onClose();
    };

    const resetState = () => {
        cleanupConnection();
        setCallId(null);
        _setCallInput("");
        setConnected(false);
        setLoading(false);
        setChannel(null);
        setIsReceiver(false);
        setSuccessMessage(null);
        setPendingTree(null);
        setExistingTreeForMerge(null);
        setShowOverrideDialog(false);
        setShowMergeDialog(false);
    };

    const cleanupConnection = () => {
        if (pc.current) {
            pc.current.onconnectionstatechange = null;
            pc.current.onicecandidate = null;
            pc.current.close();
            pc.current = null;
        }
        if (channel) {
            channel.close();
        }
    };

    const handleJoinCall = async (id?: string) => {
        setLoading(true);
        const joinId = id || callInput;
        pc.current = initPeerConnection();

        pc.current.ondatachannel = (e) => {
            const dc = e.channel;
            setupDataChannel(dc);
        };

        try {
            await joinCall(pc.current, joinId);
            setCallId(joinId);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 🔹 Auto-join if ?call= is in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const callParam = urlParams.get("call");
        if (callParam && open) {
            setCallInput(callParam);
        }
        // Cleanup on modal close/unmount
        return () => cleanupConnection();
    }, [open]);

    const initPeerConnection = () => {
        const peer = new RTCPeerConnection();
        peer.onconnectionstatechange = () => {
            if (peer.connectionState === "connected") setConnected(true);
        };
        return peer;
    };

    const handleCreateOffer = async () => {
        setLoading(true);
        pc.current = initPeerConnection();

        const dataChannel = pc.current.createDataChannel("json");
        setupDataChannel(dataChannel);

        try {
            const newCallId = await createOffer(pc.current);
            setCallId(newCallId);
        } finally {
            setLoading(false);
        }
    };

    const handleReceivedTree = async (receivedTree: FamilyTreeObject) => {
        // Check if tree with same ID already exists
        const existingTreeSummary = trees.find(t => t.id === receivedTree.id);
        
        if (existingTreeSummary) {
            // Need to load the full existing tree to compare
            // This is a temporary workaround - ideally we'd have access to the full tree
            // For now, we'll use a simple override dialog for basic cases
            // and the merge dialog when we detect significant changes
            
            // Try to access the existing tree from context if it's the current tree
            if (currentTree && currentTree.id === receivedTree.id) {
                // Show merge dialog with detailed comparison
                setPendingTree(receivedTree);
                setExistingTreeForMerge(currentTree);
                setShowMergeDialog(true);
            } else {
                // Fallback to simple override dialog
                setPendingTree(receivedTree);
                setShowOverrideDialog(true);
            }
        } else {
            // No conflict, save directly
            saveTree(receivedTree);
            setSuccessMessage(`Received the ${receivedTree.name} family tree`);
        }
    };

    const handleConfirmOverride = () => {
        if (pendingTree) {
            saveTree(pendingTree);
            setSuccessMessage(`Overridden with the ${pendingTree.name} family tree`);
            setShowOverrideDialog(false);
            setPendingTree(null);
        }
    };

    const handleCancelOverride = () => {
        setShowOverrideDialog(false);
        setPendingTree(null);
        setSuccessMessage("Import cancelled - existing tree preserved");
    };

    const handleMergeCancel = () => {
        setShowMergeDialog(false);
        setPendingTree(null);
        setExistingTreeForMerge(null);
        setSuccessMessage("Import cancelled - existing tree preserved");
    };

    const handleMergeApply = (mergedTree: FamilyTreeObject) => {
        saveTree(mergedTree);
        setSuccessMessage(`Merged changes into ${mergedTree.name} family tree`);
        setShowMergeDialog(false);
        setPendingTree(null);
        setExistingTreeForMerge(null);
    };

    const setupDataChannel = (dc: RTCDataChannel) => {
        setChannel(dc);

        dc.onopen = () => {
            // Send JSON once channel is open
            if (isReceiver) {
                showError("Only the initiator can send data.", "warning");
                return;
            } else {
                dc.send(JSON.stringify(currentTree));
                setSuccessMessage(`${currentTree?.name} Family Tree Sent`);
            }
        };

        dc.onmessage = (e) => {
            try {
                const receivedJson: FamilyTreeObject = JSON.parse(e.data);
                handleReceivedTree(receivedJson);
            } catch (err) {
                logger.warn("Received non-JSON message:", e.data, err);
            }
        };

        dc.onerror = (e) => {
            showError("A data channel error occurred. The transfer may have failed.");
        }
    };

    const handleCopyLink = () => {
        if (callId) {
            const shareUrl = `${window.location.origin}?call=${callId}`;
            navigator.clipboard.writeText(shareUrl);
        }
    };

    return (
        <RequireAuth>
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: "absolute" as const,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h6">Share Family Tree</Typography>

                    {loading && <CircularProgress />}

                    {successMessage && <Alert severity="success">{successMessage}</Alert>}

                    {!callId && !loading && (
                        <>
                            <Box display="flex" gap={1}>
                                <TextField
                                    label="Receive Family Tree ID"
                                    value={callInput}
                                    onChange={(e) => setCallInput(e.target.value)}
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => handleJoinCall()}
                                    disabled={!callInput || !isDbReady}
                                >
                                    Receive
                                </Button>
                            </Box>
                        </>
                    )}

                    {!callInput && callId && (
                        <>
                            <Box textAlign="center" alignItems="center" justifyItems="center">
                                <Typography>Scan the QR Code to Join:</Typography>
                                <QRCodeSVG
                                    value={`${window.location.origin}?call=${callId}`}
                                    size={180}
                                />
                            </Box>

                            <Button onClick={handleCopyLink}>Copy Shareable Link</Button>

                            {connected ? (
                                <Chip
                                    icon={<CheckCircle />}
                                    label="Connected"
                                    color="success"
                                    variant="filled"
                                    sx={{ fontWeight: 500 }}
                                />
                            ) : (
                                <Chip
                                    icon={<HourglassEmpty />}
                                    label="Waiting for connection..."
                                    color="warning"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                />
                            )}
                        </>
                    )}

                    <Stack direction="row" spacing={2}>
                        {!callId && !loading ? (
                            <Button variant="contained" onClick={handleCreateOffer}>
                                Share {currentTree?.name} Family Tree
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={resetState}>
                                Restart
                            </Button>
                        )}
                        <Button onClick={handleClose}>Cancel</Button>
                    </Stack>
                </Box>
            </Modal>

            {/* Override Confirmation Dialog */}
            <Dialog
                open={showOverrideDialog}
                onClose={handleCancelOverride}
                aria-labelledby="override-dialog-title"
            >
                <DialogTitle id="override-dialog-title">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Warning color="warning" />
                        Tree Already Exists
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        A family tree with the same ID already exists in your collection.
                        {pendingTree && (
                            <>
                                <br /><br />
                                <strong>Existing tree:</strong> {trees.find(t => t.id === pendingTree.id)?.name}
                                <br />
                                <strong>Incoming tree:</strong> {pendingTree.name}
                                <br /><br />
                            </>
                        )}
                        Do you want to override your current progress with the received tree?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelOverride} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmOverride} color="error" variant="contained">
                        Override
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Tree Merge Dialog for detailed change comparison */}
            {showMergeDialog && pendingTree && existingTreeForMerge && (
                <TreeMergeDialog
                    open={showMergeDialog}
                    onClose={handleMergeCancel}
                    existingTree={existingTreeForMerge}
                    incomingTree={pendingTree}
                    onApplyChanges={handleMergeApply}
                />
            )}
        </RequireAuth>
    );
};