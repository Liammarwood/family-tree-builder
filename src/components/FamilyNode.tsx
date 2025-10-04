import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Box, Typography } from "@mui/material";

export type FamilyNodeData = {
  name: string;
  dob: string;
};

export default function FamilyNode({ data }: NodeProps<FamilyNodeData>) {
  return (
    <Box sx={{ p: 2, border: "1px solid #1976d2", borderRadius: 2, background: "#fff", minWidth: 160 }}>
      <Typography variant="subtitle1"><b>{data.name}</b></Typography>
      <Typography variant="body2">DOB: {data.dob || "-"}</Typography>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} id="sibling" style={{ top: "50%" }} />
      <Handle type="target" position={Position.Right} id="sibling" style={{ top: "50%" }} />
    </Box>
  );
}
