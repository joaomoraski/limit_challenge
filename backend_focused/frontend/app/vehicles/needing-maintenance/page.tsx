'use client';

import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ErrorAlert from '@/components/ErrorAlert';
import PageHeader from '@/components/PageHeader';
import { useVehiclesNeedingMaintenance } from '@/hooks/use-vehicles';

const PAGE_SIZE = 10;

export default function NeedingMaintenancePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useVehiclesNeedingMaintenance(page);
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <Box>
      <Button size="small" onClick={() => router.push('/vehicles')} sx={{ mb: 1 }}>
        ← Back to vehicles
      </Button>
      <PageHeader title="Vehicles Needing Maintenance" />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Active vehicles that have never been maintained or whose last maintenance was over 365 days ago.
      </Typography>

      {isError && <ErrorAlert message="Failed to load data." onRetry={refetch} />}

      {isLoading && (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      )}

      {data && data.results.length === 0 && !isLoading && (
        <EmptyState message="All vehicles are up to date with maintenance." />
      )}

      {data && data.results.length > 0 && (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>VIN</TableCell>
                  <TableCell>License Plate</TableCell>
                  <TableCell>Make / Model</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Office</TableCell>
                  <TableCell>Last Maintenance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.results.map((v: any) => (
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
                    <TableCell>{v.make} {v.model}</TableCell>
                    <TableCell>{v.year}</TableCell>
                    <TableCell>{v.office_name}</TableCell>
                    <TableCell>
                      {v.last_maintenance_date ? (
                        <Chip label={v.last_maintenance_date} size="small" color="warning" />
                      ) : (
                        <Chip label="Never" size="small" color="error" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {data.count} vehicle{data.count !== 1 ? 's' : ''} need maintenance
            </Typography>
            {totalPages > 1 && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Typography variant="body2">{page} / {totalPages}</Typography>
                <Button size="small" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </Stack>
            )}
          </Stack>
        </>
      )}
    </Box>
  );
}
