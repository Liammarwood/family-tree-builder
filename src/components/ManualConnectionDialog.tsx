import { Dialog, Box, Typography, FormControl, InputLabel, Select, MenuItem, Stack, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";

export type ManualConnectionDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (form: ManualConnectionForm) => void;
};

export type ManualConnectionForm = {
    type: 'parent' | 'sibling' | 'child' | 'partner' | 'ex-partner';
    dom?: string; 
    dod?: string
}

export function ManualConnectionDialog({ isOpen, onClose, onConfirm }: ManualConnectionDialogProps) {
    const [form, setForm] = useState<ManualConnectionForm>({ type: "partner", dod: "", dom: "" });

    useEffect(() => {
        setForm({ type: "partner", dod: "", dom: "" });
    }, [isOpen]);

    return (
        <Dialog open={!!isOpen} onClose={onClose}>
            <Box sx={{ p: 2, minWidth: 320 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Add Relationship</Typography>
                <Stack spacing={2}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="rel-type-label">Relationship</InputLabel>
                        <Select
                            labelId="rel-type-label"
                            value={form.type}
                            label="Relationship"
                            onChange={e => setForm({ type: e.target.value, dod: "", dom: "" })}
                        >
                            <MenuItem value="partner">Married Partner</MenuItem>
                            <MenuItem value="ex-partner">Divorced Partner</MenuItem>
                            <MenuItem value="child">Child</MenuItem>
                            <MenuItem value="parent">Parent</MenuItem>
                            <MenuItem value="sibling">Sibling</MenuItem>
                        </Select>
                    </FormControl>
                    {["partner", "ex-partner"].includes(form.type) && <TextField
                        label="Date of Marriage"
                        type="date"
                        variant="outlined"
                        value={form.dom}
                        onChange={e => setForm({ ...form, dom: e.target.value })}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                    />}
                    {form.type === "ex-partner" && <TextField
                        label={"Date of Divorce"}
                        type="date"
                        variant="outlined"
                        value={form.dod}
                        onChange={e => setForm({ ...form, dod: e.target.value })}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                    />}
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" onClick={() => onConfirm(form)}>Add</Button>
                </Stack>
            </Box>
        </Dialog>
    )
}