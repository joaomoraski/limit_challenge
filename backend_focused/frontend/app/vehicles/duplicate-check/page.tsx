'use client';

import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useDuplicateCheck } from '@/hooks/use-vehicles';

export default function DuplicateCheckPage() {
  const router = useRouter();
  const [vin, setVin] = useState('');
  const [plate, setPlate] = useState('');
  const mutation = useDuplicateCheck();

  const canSubmit = vin.trim() || plate.trim();

  const handleCheck = () => {
    if (!canSubmit) return;
    mutation.mutate({
      vin: vin.trim() || undefined,
      licensePlate: plate.trim() || undefined,
    });
  };

  const conflictLabels: Record<string, string> = {
    vin: 'A vehicle with this VIN already exists.',
    license_plate: 'An active vehicle with this license plate already exists.',
  };

  return (
    <Box>
      <Button size="small" onClick={() => router.push('/vehicles')} sx={{ mb: 1 }}>
        ← Back to vehicles
      </Button>
      <PageHeader title="Duplicate Vehicle Check" />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Check whether a VIN or license plate is already in use before creating a new vehicle.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 500 }}>
        <Stack spacing={2}>
          <TextField
            label="VIN"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 17 } }}
            placeholder="e.g. 1HGBH41JXMN109186"
          />
          <TextField
            label="License Plate"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="e.g. ABC-1234"
          />
          <Button
            variant="contained"
            onClick={handleCheck}
            disabled={!canSubmit || mutation.isPending}
            sx={{ alignSelf: 'flex-start' }}
          >
            {mutation.isPending ? 'Checking...' : 'Check for Duplicates'}
          </Button>
        </Stack>

        {mutation.isSuccess && mutation.data.conflicts.length === 0 && (
          <Alert severity="success" sx={{ mt: 3 }}>
            No duplicates found. You can safely create a vehicle with these values.
          </Alert>
        )}

        {mutation.isSuccess && mutation.data.conflicts.length > 0 && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Conflicts found:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {mutation.data.conflicts.map((field) => (
                <li key={field}>{conflictLabels[field] ?? field}</li>
              ))}
            </ul>
          </Alert>
        )}

        {mutation.isError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Failed to check. Provide at least one of VIN or license plate.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
