import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

export default function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {action}
    </Box>
  );
}
