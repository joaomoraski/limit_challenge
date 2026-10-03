'use client';

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import type { FormEvent, ReactNode } from 'react';

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
  children: ReactNode;
  submitLabel?: string;
}

export default function FormDialog({
  open,
  title,
  onClose,
  onSubmit,
  loading = false,
  children,
  submitLabel = 'Save',
}: FormDialogProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {children}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
