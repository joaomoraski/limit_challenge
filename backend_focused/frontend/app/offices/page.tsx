'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ErrorAlert from '@/components/ErrorAlert';
import OfficeForm from '@/components/OfficeForm';
import PageHeader from '@/components/PageHeader';
import {
  useCreateOffice,
  useDeleteOffice,
  useOffices,
  useOfficeSummary,
  useUpdateOffice,
} from '@/hooks/use-offices';
import type { Office } from '@/types';

function formatCurrency(value: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    parseFloat(value),
  );
}

function formatDate(value: string | null) {
  if (!value) return '—';
  const [y, m, d] = value.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

export default function OfficesPage() {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOffice, setEditOffice] = useState<Office | null>(null);
  const [deleteOffice, setDeleteOffice] = useState<Office | null>(null);
  const [snackbar, setSnackbar] = useState('');

  const { data: summaryData, isLoading: summaryLoading, isError: summaryError, refetch: summaryRefetch } =
    useOfficeSummary(page);
  const { data: listData, isLoading: listLoading, isError: listError, refetch: listRefetch } =
    useOffices(page);

  const createMutation = useCreateOffice();
  const updateMutation = useUpdateOffice();
  const deleteMutation = useDeleteOffice();

  const PAGE_SIZE = 10;
  const activeData = tab === 0 ? summaryData : listData;
  const totalPages = activeData ? Math.ceil(activeData.count / PAGE_SIZE) : 0;

  return (
    <Box>
      <PageHeader
        title="Offices"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
            Add Office
          </Button>
        }
      />

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(1); }} sx={{ mb: 3 }}>
        <Tab label="Summary" />
        <Tab label="Manage" />
      </Tabs>

      {/* Summary Tab */}
      {tab === 0 && (
        <>
          {summaryError && <ErrorAlert message="Failed to load summary." onRetry={summaryRefetch} />}

          {summaryLoading && (
            <Grid container spacing={3}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          )}

          {summaryData && summaryData.results.length === 0 && <EmptyState message="No offices yet." />}

          {summaryData && summaryData.results.length > 0 && (
            <Grid container spacing={3}>
              {summaryData.results.map((office) => (
                <Grid key={office.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {office.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        {office.city}
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Active Vehicles
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {office.active_vehicle_count}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Maint. Cost (12 mo)
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(office.maintenance_cost_last_year)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Last Maintenance
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(office.last_maintenance)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Manage Tab */}
      {tab === 1 && (
        <>
          {listError && <ErrorAlert message="Failed to load offices." onRetry={listRefetch} />}

          {listLoading && (
            <Stack spacing={1}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          )}

          {listData && listData.results.length === 0 && <EmptyState message="No offices yet." />}

          {listData && listData.results.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listData.results.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>{o.name}</TableCell>
                      <TableCell>{o.city}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => setEditOffice(o)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteOffice(o)}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 2 }}>
          <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Typography variant="body2">{page} / {totalPages}</Typography>
          <Button size="small" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </Stack>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Office</DialogTitle>
        <DialogContent>
          <OfficeForm
            onSubmit={(formData) => {
              createMutation.mutate(formData, {
                onSuccess: () => {
                  setCreateOpen(false);
                  setSnackbar('Office created.');
                },
              });
            }}
            loading={createMutation.isPending}
          />
          {createMutation.isError && <ErrorAlert message="Failed to create office." />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button type="submit" form="office-form" variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOffice} onClose={() => setEditOffice(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Office</DialogTitle>
        <DialogContent>
          {editOffice && (
            <OfficeForm
              defaultValues={{ name: editOffice.name, city: editOffice.city }}
              onSubmit={(formData) => {
                updateMutation.mutate(
                  { id: editOffice.id, data: formData },
                  {
                    onSuccess: () => {
                      setEditOffice(null);
                      setSnackbar('Office updated.');
                    },
                  },
                );
              }}
              loading={updateMutation.isPending}
            />
          )}
          {updateMutation.isError && <ErrorAlert message="Failed to update office." />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOffice(null)}>Cancel</Button>
          <Button type="submit" form="office-form" variant="contained" disabled={updateMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteOffice} onClose={() => setDeleteOffice(null)}>
        <DialogTitle>Delete Office?</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{deleteOffice?.name}</strong>? This will fail if the office still has vehicles assigned.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOffice(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!deleteOffice) return;
              deleteMutation.mutate(deleteOffice.id, {
                onSuccess: () => {
                  setDeleteOffice(null);
                  setSnackbar('Office deleted.');
                },
                onError: () => {
                  setDeleteOffice(null);
                  setSnackbar('Cannot delete: office has vehicles assigned.');
                },
              });
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        message={snackbar}
      />
    </Box>
  );
}
