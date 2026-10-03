'use client';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmLabel?: string;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmLabel = 'Confirm',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
