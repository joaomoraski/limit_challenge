'use client';

import { Box, Button, Typography } from '@mui/material';

interface PaginationProps {
  count: number;
  page: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ count, page, pageSize = 10, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(count / pageSize);
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, px: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {from}–{to} of {count}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
          {page} / {totalPages}
        </Typography>
        <Button size="small" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </Box>
    </Box>
  );
}
