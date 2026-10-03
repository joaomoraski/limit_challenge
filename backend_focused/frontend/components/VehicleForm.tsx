'use client';

import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import type { Office } from '@/types';

interface VehicleFormData {
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  office: number;
  is_active: boolean;
}

interface VehicleFormProps {
  defaultValues?: Partial<VehicleFormData>;
  offices: Office[];
  onSubmit: (data: VehicleFormData) => void;
  loading?: boolean;
}

export default function VehicleForm({ defaultValues, offices, onSubmit, loading }: VehicleFormProps) {
  const [form, setForm] = useState<VehicleFormData>({
    vin: defaultValues?.vin ?? '',
    license_plate: defaultValues?.license_plate ?? '',
    make: defaultValues?.make ?? '',
    model: defaultValues?.model ?? '',
    year: defaultValues?.year ?? 2024,
    office: defaultValues?.office ?? (offices[0]?.id ?? 0),
    is_active: defaultValues?.is_active ?? true,
  });

  const update = (field: keyof VehicleFormData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form id="vehicle-form" onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          label="VIN"
          value={form.vin}
          onChange={(e) => update('vin', e.target.value)}
          required
          disabled={loading}
          slotProps={{ htmlInput: { maxLength: 17 } }}
        />
        <TextField
          label="License Plate"
          value={form.license_plate}
          onChange={(e) => update('license_plate', e.target.value)}
          required
          disabled={loading}
        />
        <Stack direction="row" spacing={2}>
          <TextField
            label="Make"
            value={form.make}
            onChange={(e) => update('make', e.target.value)}
            required
            disabled={loading}
            fullWidth
          />
          <TextField
            label="Model"
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
            required
            disabled={loading}
            fullWidth
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Year"
            type="number"
            value={form.year}
            onChange={(e) => update('year', parseInt(e.target.value, 10))}
            required
            disabled={loading}
            sx={{ width: 120 }}
          />
          <FormControl fullWidth>
            <InputLabel>Office</InputLabel>
            <Select
              label="Office"
              value={form.office || ''}
              onChange={(e) => update('office', Number(e.target.value))}
              disabled={loading}
            >
              {offices.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.name} — {o.city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <FormControlLabel
          control={
            <Switch
              checked={form.is_active}
              onChange={(e) => update('is_active', e.target.checked)}
              disabled={loading}
            />
          }
          label="Active"
        />
      </Stack>
    </form>
  );
}
