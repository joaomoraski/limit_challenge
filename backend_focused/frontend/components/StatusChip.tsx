import { Chip } from '@mui/material';

interface StatusChipProps {
  active: boolean;
  size?: 'small' | 'medium';
}

export default function StatusChip({ active, size = 'small' }: StatusChipProps) {
  return (
    <Chip
      label={active ? 'Active' : 'Inactive'}
      color={active ? 'success' : 'default'}
      size={size}
      variant={active ? 'filled' : 'outlined'}
    />
  );
}
