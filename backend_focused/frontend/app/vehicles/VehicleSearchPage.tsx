'use client';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
  Typography,
} from '@mui/material';
import { Add, FilterAltOff } from '@mui/icons-material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ErrorAlert from '@/components/ErrorAlert';
import PageHeader from '@/components/PageHeader';
import VehicleForm from '@/components/VehicleForm';
import { useDebounce } from '@/hooks/use-debounce';
import { useAllOffices } from '@/hooks/use-offices';
import { useCreateVehicle, useVehicleSearch } from '@/hooks/use-vehicles';

const PAGE_SIZE = 10;

export default function VehicleSearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [makeInput, setMakeInput] = useState(searchParams.get('make') || '');
  const [modelInput, setModelInput] = useState(searchParams.get('model') || '');
  const [certInput, setCertInput] = useState(searchParams.get('mechanic_cert') || '');

  const debouncedMake = useDebounce(makeInput);
  const debouncedModel = useDebounce(modelInput);
  const debouncedCert = useDebounce(certInput);

  const [createOpen, setCreateOpen] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  const skipUrlUpdate = useRef(false);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      if (skipUrlUpdate.current) return;
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      if (!updates.page) next.delete('page');
      router.replace(`${pathname}?${next.toString()}`);
    },
    [searchParams, pathname, router],
  );

  useEffect(() => {
    updateParams({ make: debouncedMake });
  }, [debouncedMake]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateParams({ model: debouncedModel });
  }, [debouncedModel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    updateParams({ mechanic_cert: debouncedCert });
  }, [debouncedCert]); // eslint-disable-line react-hooks/exhaustive-deps

  const params = {
    office: searchParams.get('office') || '',
    is_active: searchParams.get('is_active') || '',
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    maintenance_from: searchParams.get('maintenance_from') || '',
    maintenance_to: searchParams.get('maintenance_to') || '',
    mechanic_cert: searchParams.get('mechanic_cert') || '',
    page: searchParams.get('page') || '1',
  };

  const { data, isLoading, isError, refetch } = useVehicleSearch(params);
  const { data: officesData } = useAllOffices();
  const createVehicle = useCreateVehicle();

  const currentPage = parseInt(params.page, 10) || 1;
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  const clearFilters = () => {
    skipUrlUpdate.current = true;
    setMakeInput('');
    setModelInput('');
    setCertInput('');
    skipUrlUpdate.current = false;
    router.replace(pathname);
  };

  const hasFilters = Object.entries(params).some(
    ([k, v]) => k !== 'page' && v !== '',
  );

  return (
    <Box>
      <PageHeader
        title="Vehicles"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
            Add Vehicle
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Office</InputLabel>
            <Select
              label="Office"
              value={params.office}
              onChange={(e) => updateParams({ office: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              {officesData?.results.map((o) => (
                <MenuItem key={o.id} value={String(o.id)}>
                  {o.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={params.is_active}
              onChange={(e) => updateParams({ is_active: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Make"
            value={makeInput}
            onChange={(e) => setMakeInput(e.target.value)}
            sx={{ width: 110 }}
          />

          <TextField
            size="small"
            label="Model"
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            sx={{ width: 110 }}
          />

          <TextField
            size="small"
            label="From"
            type="date"
            value={params.maintenance_from}
            onChange={(e) => updateParams({ maintenance_from: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 145 }}
          />

          <TextField
            size="small"
            label="To"
            type="date"
            value={params.maintenance_to}
            onChange={(e) => updateParams({ maintenance_to: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 145 }}
          />

          <TextField
            size="small"
            label="Mech. Cert"
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            sx={{ width: 120 }}
          />

          {hasFilters && (
            <Button size="small" startIcon={<FilterAltOff />} onClick={clearFilters}>
              Clear
            </Button>
          )}
        </Stack>
      </Paper>

      {isError && <ErrorAlert message="Failed to load vehicles." onRetry={refetch} />}

      {isLoading && (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      )}

      {data && data.results.length === 0 && !isLoading && (
        <EmptyState message="No vehicles found matching your filters." />
      )}

      {data && data.results.length > 0 && (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>VIN</TableCell>
                  <TableCell>License Plate</TableCell>
                  <TableCell>Make</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Office</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.results.map((v) => (
                  <TableRow
                    key={v.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/vehicles/${v.id}`)}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {v.vin}
                    </TableCell>
                    <TableCell>{v.license_plate}</TableCell>
                    <TableCell>{v.make}</TableCell>
                    <TableCell>{v.model}</TableCell>
                    <TableCell>{v.year}</TableCell>
                    <TableCell>{v.office_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={v.is_active ? 'Active' : 'Inactive'}
                        color={v.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {data.count} vehicle{data.count !== 1 ? 's' : ''} found
            </Typography>
            {totalPages > 1 && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  size="small"
                  disabled={currentPage <= 1}
                  onClick={() => updateParams({ page: String(currentPage - 1) })}
                >
                  Previous
                </Button>
                <Typography variant="body2">
                  {currentPage} / {totalPages}
                </Typography>
                <Button
                  size="small"
                  disabled={currentPage >= totalPages}
                  onClick={() => updateParams({ page: String(currentPage + 1) })}
                >
                  Next
                </Button>
              </Stack>
            )}
          </Stack>
        </>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Vehicle</DialogTitle>
        <DialogContent>
          {officesData && (
            <VehicleForm
              offices={officesData.results}
              onSubmit={(formData) => {
                createVehicle.mutate(formData, {
                  onSuccess: () => {
                    setCreateOpen(false);
                    setSnackbar('Vehicle created.');
                  },
                });
              }}
              loading={createVehicle.isPending}
            />
          )}
          {createVehicle.isError && (
            <ErrorAlert message="Failed to create vehicle. Check for duplicate VIN or license plate." />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            form="vehicle-form"
            variant="contained"
            disabled={createVehicle.isPending}
          >
            {createVehicle.isPending ? 'Creating...' : 'Create'}
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
