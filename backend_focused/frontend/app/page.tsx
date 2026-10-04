'use client';

import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useVehicleSearch, useVehiclesNeedingMaintenance } from '@/hooks/use-vehicles';
import { useOffices } from '@/hooks/use-offices';
import { useMechanics } from '@/hooks/use-mechanics';

function StatCard({
  label,
  value,
  loading,
  color = 'primary.main',
}: {
  label: string;
  value: number | string;
  loading: boolean;
  color?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 3, textAlign: 'center', borderTop: 3, borderTopColor: color }}
    >
      {loading ? (
        <Skeleton variant="text" width={60} sx={{ mx: 'auto', fontSize: '2rem' }} />
      ) : (
        <Typography variant="h3" fontWeight={700} color={color}>
          {value}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
    </Paper>
  );
}

const QUICK_LINKS = [
  {
    title: 'Vehicles Needing Maintenance',
    description: 'Active vehicles overdue for service or never maintained',
    href: '/vehicles/needing-maintenance',
    color: '#ef4444',
  },
  {
    title: 'Office Summary',
    description: 'Vehicle counts, costs, and maintenance dates per office',
    href: '/offices',
    color: '#3b82f6',
  },
  {
    title: 'Mechanic Workload',
    description: 'Current year workload ranked by records completed',
    href: '/mechanics?tab=workload',
    color: '#22c55e',
  },
  {
    title: 'Duplicate Check',
    description: 'Verify VIN and license plate before registering a vehicle',
    href: '/vehicles/duplicate-check',
    color: '#f59e0b',
  },
];

export default function DashboardPage() {
  const allVehicles = useVehicleSearch({ page: '1' });
  const activeVehiclesQ = useVehicleSearch({ is_active: 'true', page: '1' });
  const offices = useOffices();
  const mechanics = useMechanics();
  const needingMaintenance = useVehiclesNeedingMaintenance();

  const anyError = allVehicles.error || offices.error || mechanics.error;
  const anyLoading = allVehicles.isLoading || offices.isLoading || mechanics.isLoading;

  const totalVehicles = allVehicles.data?.count ?? 0;
  const activeVehicles = activeVehiclesQ.data?.count ?? 0;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Fleet overview and quick actions
      </Typography>

      {anyError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard data. Is the backend running?
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Total Vehicles" value={totalVehicles} loading={anyLoading} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Active Vehicles" value={activeVehicles} loading={anyLoading} color="success.main" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Offices" value={offices.data?.count ?? 0} loading={anyLoading} color="info.main" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Need Maintenance"
            value={needingMaintenance.data?.count ?? 0}
            loading={needingMaintenance.isLoading}
            color="error.main"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {QUICK_LINKS.map(({ title, description, href, color }) => (
          <Grid key={href} size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined" sx={{ borderLeft: 4, borderLeftColor: color }}>
              <CardActionArea component={Link} href={href}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
