'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import EmptyState from '@/components/EmptyState';
import ErrorAlert from '@/components/ErrorAlert';
import PageHeader from '@/components/PageHeader';
import {
  useCreateMechanic,
  useDeleteMechanic,
  useMechanics,
  useMechanicWorkload,
  useUpdateMechanic,
} from '@/hooks/use-mechanics';
import type { Mechanic } from '@/types';

const PAGE_SIZE = 10;

const formatCurrency = (value: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(value));

function MechanicsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get('tab') || 'list';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Mechanic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Mechanic | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [formName, setFormName] = useState('');
  const [formCert, setFormCert] = useState('');
  const [formActive, setFormActive] = useState(true);

  const mechanicsQuery = useMechanics(tabParam === 'list' ? page : 1);
  const workloadQuery = useMechanicWorkload(tabParam === 'workload' ? page : 1);
  const createMutation = useCreateMechanic();
  const updateMutation = useUpdateMechanic();
  const deleteMutation = useDeleteMechanic();

  const activeQuery = tabParam === 'workload' ? workloadQuery : mechanicsQuery;
  const totalPages = activeQuery.data ? Math.ceil(activeQuery.data.count / PAGE_SIZE) : 0;

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`${pathname}?${params.toString()}`);
  };

  const setTab = (tab: string) => updateParams({ tab, page: '' });
  const setPage = (p: number) => updateParams({ page: p > 1 ? String(p) : '' });

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormCert('');
    setFormActive(true);
    setFormOpen(true);
  };

  const openEdit = (m: Mechanic) => {
    setEditing(m);
    setFormName(m.name);
    setFormCert(m.certification_number);
    setFormActive(m.is_active);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const data = { name: formName, certification_number: formCert, is_active: formActive };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data });
        setSnackbar({ message: 'Mechanic updated.', severity: 'success' });
      } else {
        await createMutation.mutateAsync(data);
        setSnackbar({ message: 'Mechanic created.', severity: 'success' });
      }
      setFormOpen(false);
    } catch {
      setSnackbar({ message: 'Failed to save mechanic.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setSnackbar({ message: 'Mechanic deleted.', severity: 'success' });
      setDeleteTarget(null);
    } catch {
      setSnackbar({ message: 'Cannot delete mechanic with maintenance records.', severity: 'error' });
      setDeleteTarget(null);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      <PageHeader
        title="Mechanics"
        action={
          tabParam === 'list' ? (
            <Button variant="contained" size="small" startIcon={<Add />} onClick={openCreate}>
              Add Mechanic
            </Button>
          ) : undefined
        }
      />

      <Tabs value={tabParam} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Mechanics" value="list" />
        <Tab label="Workload" value="workload" />
      </Tabs>

      {activeQuery.isError && (
        <ErrorAlert message="Failed to load data." onRetry={() => activeQuery.refetch()} />
      )}

      {activeQuery.isLoading && (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} />
          ))}
        </Stack>
      )}

      {tabParam === 'list' && mechanicsQuery.data && (
        <>
          {mechanicsQuery.data.results.length === 0 ? (
            <EmptyState message="No mechanics found." />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Certification Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mechanicsQuery.data.results.map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>{m.name}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {m.certification_number}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={m.is_active ? 'Active' : 'Inactive'}
                          color={m.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(m)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(m)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {tabParam === 'workload' && workloadQuery.data && (
        <>
          {workloadQuery.data.results.length === 0 ? (
            <EmptyState message="No workload data." />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Certification</TableCell>
                    <TableCell align="right">Records This Year</TableCell>
                    <TableCell align="right">Total Cost This Year</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workloadQuery.data.results.map((m) => (
                    <TableRow key={m.id} hover>
                      <TableCell>{m.name}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {m.certification_number}
                      </TableCell>
                      <TableCell align="right">{m.records_this_year}</TableCell>
                      <TableCell align="right">{formatCurrency(m.total_cost_this_year)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

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

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Mechanic' : 'Add Mechanic'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Certification Number"
              value={formCert}
              onChange={(e) => setFormCert(e.target.value)}
              fullWidth
              required
              disabled={!!editing}
            />
            <FormControlLabel
              control={<Switch checked={formActive} onChange={(e) => setFormActive(e.target.checked)} />}
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formName || !formCert || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} /> : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Mechanic</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Mechanics with maintenance records cannot be deleted.
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

export default function MechanicsPage() {
  return (
    <Suspense>
      <MechanicsContent />
    </Suspense>
  );
}
