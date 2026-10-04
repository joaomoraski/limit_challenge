'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ErrorAlert from '@/components/ErrorAlert';
import VehicleForm from '@/components/VehicleForm';
import { useAllMechanics } from '@/hooks/use-mechanics';
import { useAllOffices } from '@/hooks/use-offices';
import {
  useAssignVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
  useVehicle,
  useVehicleMaintenanceHistory,
} from '@/hooks/use-vehicles';
import { useCreateMaintenanceRecord } from '@/hooks/use-maintenance';

const PAGE_SIZE = 10;

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const vehicleId = parseInt(id, 10);

  const { data: vehicle, isLoading, isError, refetch } = useVehicle(vehicleId);
  const { data: officesData } = useAllOffices();
  const { data: mechanicsData } = useAllMechanics();

  const assignMutation = useAssignVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();
  const createRecordMutation = useCreateMaintenanceRecord();

  const [historyPage, setHistoryPage] = useState(1);
  const { data: historyData } = useVehicleMaintenanceHistory(vehicleId, historyPage);
  const historyTotalPages = historyData ? Math.ceil(historyData.count / PAGE_SIZE) : 0;

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const [recordForm, setRecordForm] = useState({
    mechanic: '',
    maintenance_date: '',
    maintenance_type: '',
    cost: '',
    notes: '',
  });

  const handleAssign = () => {
    if (!selectedOffice) return;
    assignMutation.mutate(
      { id: vehicleId, officeId: parseInt(selectedOffice, 10) },
      {
        onSuccess: () => {
          setAssignOpen(false);
          setSelectedOffice('');
          setSnackbar('Vehicle reassigned.');
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(vehicleId, {
      onSuccess: () => {
        router.push('/vehicles');
      },
    });
  };

  const handleAddRecord = () => {
    createRecordMutation.mutate(
      {
        vehicle: vehicleId,
        mechanic: parseInt(recordForm.mechanic, 10),
        maintenance_date: recordForm.maintenance_date,
        maintenance_type: recordForm.maintenance_type,
        cost: recordForm.cost,
        notes: recordForm.notes,
      },
      {
        onSuccess: () => {
          setAddRecordOpen(false);
          setRecordForm({
            mechanic: '',
            maintenance_date: '',
            maintenance_type: '',
            cost: '',
            notes: '',
          });
          setSnackbar('Maintenance record added.');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  if (isError || !vehicle) {
    return <ErrorAlert message="Failed to load vehicle details." onRetry={refetch} />;
  }

  return (
    <Box>
      <Button size="small" onClick={() => router.push('/vehicles')} sx={{ mb: 2 }}>
        ← Back to vehicles
      </Button>

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
        <Typography variant="h4" component="h1">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Typography>
        <Chip
          label={vehicle.is_active ? 'Active' : 'Inactive'}
          color={vehicle.is_active ? 'success' : 'default'}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Tooltip title="Edit vehicle">
          <IconButton size="small" onClick={() => setEditOpen(true)}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete vehicle">
          <IconButton size="small" color="error" onClick={() => setDeleteOpen(true)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Vehicle Info
            </Typography>
            <Stack spacing={0.5}>
              <Typography><strong>VIN:</strong> {vehicle.vin}</Typography>
              <Typography><strong>Plate:</strong> {vehicle.license_plate}</Typography>
              <Typography><strong>Year:</strong> {vehicle.year}</Typography>
              <Typography><strong>Make:</strong> {vehicle.make}</Typography>
              <Typography><strong>Model:</strong> {vehicle.model}</Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Office
            </Typography>
            <Typography variant="h6">{vehicle.office.name}</Typography>
            <Typography color="text.secondary">{vehicle.office.city}</Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
              onClick={() => {
                setSelectedOffice(String(vehicle.office.id));
                setAssignOpen(true);
              }}
            >
              Reassign
            </Button>
          </CardContent>
        </Card>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">
          Maintenance History
          {historyData && ` (${historyData.count})`}
        </Typography>
        <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => setAddRecordOpen(true)}>
          Add Record
        </Button>
      </Stack>

      {historyData && historyData.results.length === 0 && (
        <EmptyState message="No maintenance records yet." />
      )}

      {historyData && historyData.results.length > 0 && (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Mechanic</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.maintenance_date}</TableCell>
                    <TableCell>{r.maintenance_type}</TableCell>
                    <TableCell>{r.mechanic_name}</TableCell>
                    <TableCell align="right">
                      ${parseFloat(r.cost).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>{r.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {historyTotalPages > 1 && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 2 }}>
              <Button
                size="small"
                disabled={historyPage <= 1}
                onClick={() => setHistoryPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Typography variant="body2">
                {historyPage} / {historyTotalPages}
              </Typography>
              <Button
                size="small"
                disabled={historyPage >= historyTotalPages}
                onClick={() => setHistoryPage((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          )}
        </>
      )}

      {/* Reassign Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <DialogTitle>Reassign Vehicle</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Office</InputLabel>
            <Select
              label="Office"
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
            >
              {officesData?.results.map((o) => (
                <MenuItem key={o.id} value={String(o.id)}>
                  {o.name} — {o.city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {assignMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>Failed to reassign.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedOffice || assignMutation.isPending}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Vehicle</DialogTitle>
        <DialogContent>
          {officesData && (
            <VehicleForm
              defaultValues={{
                vin: vehicle.vin,
                license_plate: vehicle.license_plate,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                office: vehicle.office.id,
                is_active: vehicle.is_active,
              }}
              offices={officesData.results}
              onSubmit={(formData) => {
                updateMutation.mutate(
                  { id: vehicleId, data: formData },
                  {
                    onSuccess: () => {
                      setEditOpen(false);
                      setSnackbar('Vehicle updated.');
                    },
                  },
                );
              }}
              loading={updateMutation.isPending}
            />
          )}
          {updateMutation.isError && <ErrorAlert message="Failed to update vehicle." />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            form="vehicle-form"
            variant="contained"
            disabled={updateMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Vehicle?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete <strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong> and
            all its maintenance records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Maintenance Record Dialog */}
      <Dialog open={addRecordOpen} onClose={() => setAddRecordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Maintenance Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Mechanic</InputLabel>
              <Select
                label="Mechanic"
                value={recordForm.mechanic}
                onChange={(e) => setRecordForm((p) => ({ ...p, mechanic: e.target.value }))}
              >
                {mechanicsData?.results
                  .filter((m) => m.is_active)
                  .map((m) => (
                    <MenuItem key={m.id} value={String(m.id)}>
                      {m.name} ({m.certification_number})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label="Date"
              type="date"
              value={recordForm.maintenance_date}
              onChange={(e) => setRecordForm((p) => ({ ...p, maintenance_date: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Type"
              value={recordForm.maintenance_type}
              onChange={(e) => setRecordForm((p) => ({ ...p, maintenance_type: e.target.value }))}
              placeholder="e.g. Oil Change, Brake Inspection"
            />
            <TextField
              label="Cost"
              type="number"
              value={recordForm.cost}
              onChange={(e) => setRecordForm((p) => ({ ...p, cost: e.target.value }))}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
            <TextField
              label="Notes"
              value={recordForm.notes}
              onChange={(e) => setRecordForm((p) => ({ ...p, notes: e.target.value }))}
              multiline
              rows={2}
            />
          </Stack>
          {createRecordMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>Failed to add record.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddRecordOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddRecord}
            disabled={
              !recordForm.mechanic || !recordForm.maintenance_type || !recordForm.cost || createRecordMutation.isPending
            }
          >
            {createRecordMutation.isPending ? 'Adding...' : 'Add'}
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
