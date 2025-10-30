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
    LinearProgress,
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
    const [hasJoined, setHasJoined] = useState<boolean>(false);
    const [pendingTree, setPendingTree] = useState<FamilyTreeObject | null>(null);
    const [existingTreeForMerge, setExistingTreeForMerge] = useState<FamilyTreeObject | null>(null);
    const [showOverrideDialog, setShowOverrideDialog] = useState<boolean>(false);
    const [showMergeDialog, setShowMergeDialog] = useState<boolean>(false);
    const [transferProgress, setTransferProgress] = useState<{ current: number; total: number } | null>(null);
    const { isDbReady, trees, saveTree, currentTree } = useFamilyTreeContext();

    const setCallInput = (input: string) => {
        _setCallInput(input);
    }

    const { createOffer, joinCall } = useFirestoreSignaling();
    const pc = React.useRef<RTCPeerConnection | null>(null);
    const { showError } = useError();
    const suppressDataChannelErrors = React.useRef(false);

    // Reset state and cleanup connection
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
        setHasJoined(false);
        setTransferProgress(null);
    };

    const cleanupConnection = () => {
        // Suppress data channel errors that may fire when intentionally
        // closing the connection (avoid showing "transfer may have failed").
        suppressDataChannelErrors.current = true;

        if (pc.current) {
            pc.current.onconnectionstatechange = null;
            pc.current.onicecandidate = null;
            try {
                pc.current.close();
            } catch (e) {
                logger.warn("Error while closing peer connection", e);
            }
            pc.current = null;
        }
        if (channel) {
            try {
                channel.close();
            } catch (e) {
                logger.warn("Error while closing data channel", e);
            }
        }

        // Re-enable error reporting after a short grace period to allow any
        // closure-related events to settle without showing user-facing errors.
        setTimeout(() => {
            suppressDataChannelErrors.current = false;
        }, 500);
    };

    const handleJoinCall = async (id?: string) => {
        // The user is explicitly joining as the receiver
        setIsReceiver(true);
        setLoading(true);
        const joinId = id || callInput;
        pc.current = initPeerConnection();

        pc.current.ondatachannel = (e) => {
            const dc = e.channel;
            // This side did NOT create the channel, so it's the receiver side for this channel
            setupDataChannel(dc, false);
        };

        try {
            await joinCall(pc.current, joinId);
            setCallId(joinId);
            // mark that we've joined so the receive input is disabled
            setHasJoined(true);
            // Clear the typed call input to avoid confusion now that we've joined
            _setCallInput("");
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
            logger.info(`Peer connection state changed to: ${peer.connectionState}`);
            if (peer.connectionState === "connected") {
                setConnected(true);
            } else if (peer.connectionState === "failed" || peer.connectionState === "disconnected") {
                logger.warn(`Peer connection ${peer.connectionState}`);
            }
        };
        return peer;
    };

    const handleCreateOffer = async () => {
        // Creating an offer means this side is the initiator
        setIsReceiver(false);
        setLoading(true);
        pc.current = initPeerConnection();

        const dataChannel = pc.current.createDataChannel("json");
    // We created this data channel, so we're the initiator for it
    setupDataChannel(dataChannel, true);

        try {
            const newCallId = await createOffer(pc.current);
            setCallId(newCallId);
            // Clear any typed call input when switching to initiator
            _setCallInput("");
        } finally {
            setLoading(false);
        }
    };

    const handleReceivedTree = (receivedTree: FamilyTreeObject) => {
        // Check if tree with same ID already exists
        const existingTreeSummary = trees.find(t => t.id === receivedTree.id);
        
        if (existingTreeSummary) {
            // Show merge dialog if this is the current tree (full data available)
            if (currentTree && currentTree.id === receivedTree.id) {
                // Show merge dialog with detailed comparison
                setPendingTree(receivedTree);
                setExistingTreeForMerge(currentTree);
                setShowMergeDialog(true);
            } else {
                // Fallback to simple override dialog for non-current trees
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

    const setupDataChannel = (dc: RTCDataChannel, isLocalInitiator: boolean) => {
        setChannel(dc);

        // Buffer for receiving chunked data
        let receivedChunks: string[] = [];
        let expectedChunks = 0;

        dc.onopen = () => {
            // If this side created the data channel (initiator), send the tree.
            // If this is the remote-created channel (receiver), do nothing and wait for onmessage.
            if (isLocalInitiator) {
                try {
                    // Verify we have a tree to send
                    if (!currentTree) {
                        logger.error("Cannot send family tree: currentTree is null or undefined");
                        showError("Cannot share tree: No tree is currently loaded.");
                        return;
                    }

                    // Verify the data channel is in the correct state
                    if (dc.readyState !== 'open') {
                        logger.error(`Cannot send data: data channel state is ${dc.readyState}, expected 'open'`);
                        showError("Cannot share tree: Connection not ready.");
                        return;
                    }

                    const treeData = JSON.stringify(currentTree);
                    logger.info(`Sending family tree data, size: ${treeData.length} bytes`);
                    
                    // Chunk size: 16KB (safe for most WebRTC implementations)
                    const CHUNK_SIZE = 16 * 1024;
                    
                    if (treeData.length <= CHUNK_SIZE) {
                        // Small data, send directly
                        dc.send(JSON.stringify({ type: 'single', data: treeData }));
                        logger.info("Family tree sent successfully (single message)");
                        setSuccessMessage(`${currentTree.name} Family Tree Sent`);
                    } else {
                        // Large data, send in chunks
                        const totalChunks = Math.ceil(treeData.length / CHUNK_SIZE);
                        logger.info(`Splitting data into ${totalChunks} chunks of max ${CHUNK_SIZE} bytes`);
                        
                        // Show initial progress
                        setTransferProgress({ current: 0, total: totalChunks });
                        
                        for (let i = 0; i < totalChunks; i++) {
                            const start = i * CHUNK_SIZE;
                            const end = Math.min(start + CHUNK_SIZE, treeData.length);
                            const chunk = treeData.substring(start, end);
                            
                            const message = JSON.stringify({
                                type: 'chunk',
                                index: i,
                                total: totalChunks,
                                data: chunk
                            });
                            
                            dc.send(message);
                            logger.info(`Sent chunk ${i + 1}/${totalChunks}`);
                            
                            // Update progress
                            setTransferProgress({ current: i + 1, total: totalChunks });
                        }
                        logger.info("All chunks sent successfully");
                        
                        // Clear progress and show success message
                        setTimeout(() => {
                            setTransferProgress(null);
                            setSuccessMessage(`${currentTree.name} Family Tree Sent`);
                        }, 500);
                    }
                } catch (e) {
                    logger.error("Failed to send family tree over data channel", e);
                    showError("Failed to send the family tree. Please try again.");
                }
            }
            setConnected(true);
        };

        dc.onmessage = (e) => {
            try {
                logger.info(`Received message, size: ${e.data.length} bytes`);
                const message = JSON.parse(e.data);
                
                if (message.type === 'single') {
                    // Single message, parse directly
                    const receivedJson: FamilyTreeObject = JSON.parse(message.data);
                    logger.info(`Successfully parsed family tree: ${receivedJson.name}`);
                    handleReceivedTree(receivedJson);
                } else if (message.type === 'chunk') {
                    // Chunked message
                    if (expectedChunks === 0) {
                        expectedChunks = message.total;
                        receivedChunks = new Array(message.total);
                        logger.info(`Receiving chunked data: ${message.total} chunks expected`);
                        // Initialize progress
                        setTransferProgress({ current: 0, total: message.total });
                    }
                    
                    receivedChunks[message.index] = message.data;
                    logger.info(`Received chunk ${message.index + 1}/${message.total}`);
                    
                    // Update progress
                    const receivedCount = receivedChunks.filter(chunk => chunk !== undefined).length;
                    setTransferProgress({ current: receivedCount, total: message.total });
                    
                    // Check if all chunks received
                    const allReceived = receivedChunks.every(chunk => chunk !== undefined);
                    if (allReceived) {
                        const completeData = receivedChunks.join('');
                        logger.info(`All chunks received, total size: ${completeData.length} bytes`);
                        
                        const receivedJson: FamilyTreeObject = JSON.parse(completeData);
                        logger.info(`Successfully parsed family tree: ${receivedJson.name}`);
                        handleReceivedTree(receivedJson);
                        
                        // Reset for next transfer
                        receivedChunks = [];
                        expectedChunks = 0;
                        // Clear progress after a short delay
                        setTimeout(() => setTransferProgress(null), 500);
                    }
                } else {
                    logger.warn("Received message with unknown type:", message.type);
                }
            } catch (err) {
                logger.error("Failed to parse received message as family tree", err);
                logger.warn("Received data:", e.data);
                showError("Received invalid data. The transfer may have failed.");
                // Reset chunked transfer state on error
                receivedChunks = [];
                expectedChunks = 0;
            }
        };

        dc.onerror = (e) => {
            // If we're intentionally closing the connection, suppress this
            // error because it's expected during shutdown.
            if (suppressDataChannelErrors.current) {
                logger.info("Suppressed data channel error during cleanup", e);
                return;
            }
            logger.error("Data channel error occurred", e);
            // Log the error details for debugging
            if (typeof RTCErrorEvent !== 'undefined' && e instanceof RTCErrorEvent) {
                logger.error("RTCErrorEvent details:", {
                    error: e.error,
                    message: e.message
                });
            }
            showError("A data channel error occurred. The transfer may have failed.");
        }

        dc.onclose = () => {
            logger.info("Data channel closed");
            // Clean up any partial transfers
            receivedChunks = [];
            expectedChunks = 0;
        };
    };

    const handleCopyLink = async () => {
        if (!callId) return;
        const shareUrl = `${window.location.origin}?call=${callId}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch (err) {
            logger.warn("Failed to copy share link", err);
        }
    };

    const handleCopyId = async () => {
        if (!callId) return;
        try {
            await navigator.clipboard.writeText(callId);
        } catch (err) {
            logger.warn("Failed to copy call id", err);
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

                    {transferProgress && (
                        <Box sx={{ width: '100%' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="body2" color="text.secondary">
                                    {isReceiver ? 'Receiving data...' : 'Sending data...'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {transferProgress.current} / {transferProgress.total} chunks
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={(transferProgress.current / transferProgress.total) * 100}
                                sx={{ height: 8, borderRadius: 1 }}
                            />
                        </Box>
                    )}

                    {!callId && !loading && (
                        <>
                            <Box display="flex" gap={1}>
                                <TextField
                                    label="Receive Family Tree ID"
                                    value={callInput}
                                    onChange={(e) => setCallInput(e.target.value)}
                                    disabled={hasJoined}
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => handleJoinCall()}
                                    disabled={!callInput || !isDbReady || hasJoined}
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
                                <br />
                                <QRCodeSVG
                                    value={`${window.location.origin}?call=${callId}`}
                                    size={180}
                                />
                            </Box>
                            <Box display="flex" gap={1} alignItems="center" justifyContent="center">
                                <Button onClick={handleCopyLink}>Copy Shareable Link</Button>
                                <Button onClick={handleCopyId}>
                                    Copy ID
                                </Button>
                            </Box>

                            {connected ? (
                                <Chip
                                    icon={<CheckCircle />}
                                    label={isReceiver ? "Connected — waiting for data" : "Connected"}
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