import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography color="text.secondary" variant="body1">
        {message}
      </Typography>
    </Box>
  );
}
