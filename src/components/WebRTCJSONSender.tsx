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
} from "@mui/material";
import { useFirestoreSignaling } from "@/hooks/useFirestoreSignaling";
import { RequireAuth } from "@/components/RequireAuth";
import { QRCodeSVG } from "qrcode.react";
import { FamilyTreeObject } from "@/types/FamilyTreeObject";
import { CheckCircle, HourglassEmpty } from "@mui/icons-material";

type WebRTCJsonModalProps = {
    open: boolean;
    onClose: () => void;
    json: FamilyTreeObject | undefined;
};

export const WebRTCJsonModal: React.FC<WebRTCJsonModalProps> = ({
    open,
    onClose,
    json,
}) => {
    const [callId, setCallId] = useState<string | null>(null);
    const [callInput, _setCallInput] = useState<string>("");
    const [connected, setConnected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [channel, setChannel] = useState<RTCDataChannel | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isReceiver, setIsReceiver] = useState<boolean>(false);

    const setCallInput = (input: string) => {
        setIsReceiver(true);
        _setCallInput(input);
    }

    const { createOffer, joinCall } = useFirestoreSignaling();
    const pc = React.useRef<RTCPeerConnection | null>(null);

    // 🔹 Reset state and cleanup connection
    const handleClose = () => {
        resetState();
        onClose();
    };

    const resetState = () => {
        cleanupConnection();
        setCallId(null);
        setCallInput("");
        setConnected(false);
        setLoading(false);
        setChannel(null);
        setSuccessMessage(null);
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
            handleJoinCall(callParam);
        }
        // Cleanup on modal close/unmount
        return () => cleanupConnection();
    }, [open, cleanupConnection]);

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

    const setupDataChannel = (dc: RTCDataChannel) => {
        setChannel(dc);

        dc.onopen = () => {
            console.log("Data channel open ✅");
            // Send JSON once channel is open
            if (isReceiver) {
                console.warn("Only the initiator can send JSON data.");
                return;
            } else {
                dc.send(JSON.stringify(json));
                setSuccessMessage(`${json?.name} Family Tree Sent`);
            }
        };

        dc.onmessage = (e) => {
            try {
                const receivedJson: FamilyTreeObject = JSON.parse(e.data);
                console.log("📥 Received JSON:", receivedJson);
                setSuccessMessage(`Received the ${receivedJson.name} family tree`)
            } catch (err) {
                console.warn("Received non-JSON message:", e.data, err);
            }
        };
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
                    <Typography variant="h6">Share Family Trees</Typography>

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
                                    disabled={!callInput}
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
                        {!callId && !loading ? <Button variant="contained" onClick={handleCreateOffer}>
                            Share {json?.name} Family Tree
                        </Button> : <Button variant="contained" onClick={resetState}>Restart</Button>
                    }
                    <Button onClick={handleClose}>Cancel</Button>
                    </Stack>

                </Box>
            </Modal>
        </RequireAuth>
    );
};
