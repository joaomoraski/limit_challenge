'use client';

import { Stack, TextField } from '@mui/material';
import { useState } from 'react';

interface OfficeFormData {
  name: string;
  city: string;
}

interface OfficeFormProps {
  defaultValues?: Partial<OfficeFormData>;
  onSubmit: (data: OfficeFormData) => void;
  loading?: boolean;
}

export default function OfficeForm({ defaultValues, onSubmit, loading }: OfficeFormProps) {
  const [form, setForm] = useState<OfficeFormData>({
    name: defaultValues?.name ?? '',
    city: defaultValues?.city ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form id="office-form" onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          disabled={loading}
        />
        <TextField
          label="City"
          value={form.city}
          onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
          required
          disabled={loading}
        />
      </Stack>
    </form>
  );
}
