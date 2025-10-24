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
} from "@mui/material";
import { useFirestoreSignaling } from "@/hooks/useFirestoreSignaling";
import { RequireAuth } from "@/components/RequireAuth";
import { QRCodeSVG } from "qrcode.react";

type WebRTCJsonModalProps = {
    open: boolean;
    onClose: () => void;
    json: any;
};

export const WebRTCJsonModal: React.FC<WebRTCJsonModalProps> = ({
    open,
    onClose,
    json,
}) => {
    const [callId, setCallId] = useState<string | null>(null);
    const [callInput, setCallInput] = useState("");
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [channel, setChannel] = useState<RTCDataChannel | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { createOffer, joinCall } = useFirestoreSignaling();
    const pc = React.useRef<RTCPeerConnection | null>(null);

    // 🔹 Reset state and cleanup connection
    const handleClose = () => {
        cleanupConnection();
        setCallId(null);
        setCallInput("");
        setConnected(false);
        setLoading(false);
        setChannel(null);
        setSuccessMessage(null);
        onClose();
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

    const [isInitiator, setIsInitiator] = useState<boolean>(false);

    useEffect(() => {
        // 🔹 Auto-join if ?call= is in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const callParam = urlParams.get("call");
        if (callParam && open) {
            setCallInput(callParam);
            handleJoinCall(callParam);
            setIsInitiator(false);
        } else {
            setIsInitiator(true);
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

    const handleJoinCall = async (id?: string) => {
        setLoading(true);
        setIsInitiator(true);
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

    const setupDataChannel = (dc: RTCDataChannel) => {
        setChannel(dc);

        dc.onopen = () => {
            console.log("Data channel open ✅");
            // Send JSON once channel is open
            if (!isInitiator) {
                console.warn("Only the initiator can send JSON data.");
                return;
            } else {
                dc.send(JSON.stringify(json));
                setSuccessMessage("✅ JSON message sent successfully!");
            }
        };

        dc.onmessage = (e) => {
            try {
                const receivedJson = JSON.parse(e.data);
                console.log("📥 Received JSON:", receivedJson);
            } catch (err) {
                console.warn("Received non-JSON message:", e.data);
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
                    <Typography variant="h6">Share JSON via WebRTC</Typography>

                    {loading && <CircularProgress />}

                    {successMessage && <Alert severity="success">{successMessage}</Alert>}

                    {!callId && !loading && (
                        <>
                            <Button variant="contained" onClick={handleCreateOffer}>
                                Host (Create Offer)
                            </Button>

                            <Box display="flex" gap={1}>
                                <TextField
                                    label="Join Call ID"
                                    value={callInput}
                                    onChange={(e) => setCallInput(e.target.value)}
                                    fullWidth
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => handleJoinCall()}
                                    disabled={!callInput}
                                >
                                    Join
                                </Button>
                            </Box>
                        </>
                    )}

                    {callId && (
                        <>
                            <Typography>Call ID: {callId}</Typography>
                            <Button onClick={handleCopyLink}>Copy Shareable Link</Button>

                            <Box textAlign="center" alignItems="center" justifyItems="center">
                                <Typography>Scan QR to Join:</Typography>
                                <QRCodeSVG
                                    value={`${window.location.origin}?call=${callId}`}
                                    size={180}
                                />
                            </Box>

                            {connected ? (
                                <Typography color="green">Connected ✅</Typography>
                            ) : (
                                <Typography color="orange">Waiting for peer...</Typography>
                            )}
                        </>
                    )}
                </Box>
            </Modal>
        </RequireAuth>
    );
};
