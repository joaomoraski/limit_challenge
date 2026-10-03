'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import EmptyState from '@/components/EmptyState';
import ErrorAlert from '@/components/ErrorAlert';
import PageHeader from '@/components/PageHeader';
import {
  useCreateMaintenanceRecord,
  useDeleteMaintenanceRecord,
  useMaintenanceRecords,
} from '@/hooks/use-maintenance';
import { useAllMechanics } from '@/hooks/use-mechanics';
import { useAllVehicles } from '@/hooks/use-vehicles';
import { updateMaintenanceRecord } from '@/services/api';
import type { MaintenanceRecord } from '@/types';

const PAGE_SIZE = 10;

const MAINTENANCE_TYPES = [
  'Oil Change',
  'Tire Rotation',
  'Brake Inspection',
  'Engine Tune-up',
  'Transmission Service',
  'Battery Replacement',
  'Alignment',
  'AC Service',
];

const formatCurrency = (value: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(value));

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRecord | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [formVehicle, setFormVehicle] = useState('');
  const [formMechanic, setFormMechanic] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formType, setFormType] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const recordsQuery = useMaintenanceRecords(page);
  const vehiclesQuery = useAllVehicles();
  const mechanicsQuery = useAllMechanics();
  const createMutation = useCreateMaintenanceRecord();
  const deleteMutation = useDeleteMaintenanceRecord();
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MaintenanceRecord> }) =>
      updateMaintenanceRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const totalPages = recordsQuery.data ? Math.ceil(recordsQuery.data.count / PAGE_SIZE) : 0;

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set('page', String(p));
    else params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const openCreate = () => {
    setEditing(null);
    setFormVehicle('');
    setFormMechanic('');
    setFormDate('');
    setFormType('');
    setFormCost('');
    setFormNotes('');
    setFormOpen(true);
  };

  const openEdit = (r: MaintenanceRecord) => {
    setEditing(r);
    setFormVehicle(String(r.vehicle));
    setFormMechanic(String(r.mechanic));
    setFormDate(r.maintenance_date);
    setFormType(r.maintenance_type);
    setFormCost(r.cost);
    setFormNotes(r.notes);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      vehicle: parseInt(formVehicle, 10),
      mechanic: parseInt(formMechanic, 10),
      maintenance_date: formDate,
      maintenance_type: formType,
      cost: formCost,
      notes: formNotes,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data });
        setSnackbar({ message: 'Record updated.', severity: 'success' });
      } else {
        await createMutation.mutateAsync(data as MaintenanceRecord);
        setSnackbar({ message: 'Record created.', severity: 'success' });
      }
      setFormOpen(false);
    } catch {
      setSnackbar({ message: 'Failed to save record.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setSnackbar({ message: 'Record deleted.', severity: 'success' });
      setDeleteTarget(null);
    } catch {
      setSnackbar({ message: 'Failed to delete record.', severity: 'error' });
      setDeleteTarget(null);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isFormValid = formVehicle && formMechanic && formDate && formType && formCost;

  const vehicles = vehiclesQuery.data?.results ?? [];
  const mechanics = mechanicsQuery.data?.results ?? [];

  return (
    <Box>
      <PageHeader
        title="Maintenance Records"
        action={
          <Button variant="contained" size="small" startIcon={<Add />} onClick={openCreate}>
            Add Record
          </Button>
        }
      />

      {recordsQuery.isError && (
        <ErrorAlert message="Failed to load maintenance records." onRetry={() => recordsQuery.refetch()} />
      )}

      {recordsQuery.isLoading && (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} />
          ))}
        </Stack>
      )}

      {recordsQuery.data && recordsQuery.data.results.length === 0 && (
        <EmptyState message="No maintenance records found." />
      )}

      {recordsQuery.data && recordsQuery.data.results.length > 0 && (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Mechanic</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recordsQuery.data.results.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.maintenance_date}</TableCell>
                    <TableCell>
                      <Link
                        href={`/vehicles/${r.vehicle}`}
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        Vehicle #{r.vehicle}
                      </Link>
                    </TableCell>
                    <TableCell>{r.mechanic_name}</TableCell>
                    <TableCell>{r.maintenance_type}</TableCell>
                    <TableCell align="right">{formatCurrency(r.cost)}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.notes || '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(r)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 2 }}>
              <Button size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Typography variant="body2">
                Page {page} of {totalPages}
              </Typography>
              <Button size="small" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </Stack>
          )}
        </>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Vehicle"
              select
              value={formVehicle}
              onChange={(e) => setFormVehicle(e.target.value)}
              fullWidth
              required
            >
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={String(v.id)}>
                  {v.year} {v.make} {v.model} — {v.vin}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Mechanic"
              select
              value={formMechanic}
              onChange={(e) => setFormMechanic(e.target.value)}
              fullWidth
              required
            >
              {mechanics
                .filter((m) => m.is_active)
                .map((m) => (
                  <MenuItem key={m.id} value={String(m.id)}>
                    {m.name} — {m.certification_number}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              label="Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Type"
              select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              fullWidth
              required
            >
              {MAINTENANCE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Cost"
              type="number"
              value={formCost}
              onChange={(e) => setFormCost(e.target.value)}
              fullWidth
              required
              slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
            />
            <TextField
              label="Notes"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Record</DialogTitle>
        <DialogContent>
          <Typography>
            Delete {deleteTarget?.maintenance_type} record from {deleteTarget?.maintenance_date}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense>
      <MaintenanceContent />
    </Suspense>
  );
}
