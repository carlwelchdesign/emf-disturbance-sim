'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface WelcomeDialogProps {
  open: boolean;
  zIndex: number;
  onClose: () => void;
}

export function WelcomeDialog({ open, zIndex, onClose }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth sx={{ zIndex }}>
      <DialogTitle>Welcome to EMF Visualizer</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          This project is an interactive electromagnetic field lab built to make RF behavior easier to
          explore in real time. You can configure emitters, compare interference patterns, and inspect
          how source geometry, phase, frequency, and power shape field behavior in a live 3D scene.
        </DialogContentText>
        <DialogContentText>
          The goal is to combine fast exploratory modeling with a structured path toward higher-fidelity
          Maxwell-based analysis, while keeping the experience approachable and performance-safe in the
          browser. It is designed to support both intuitive visual learning and deeper engineering
          validation workflows.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" autoFocus>
          Enter Lab
        </Button>
      </DialogActions>
    </Dialog>
  );
}