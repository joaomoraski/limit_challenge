'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PropsWithChildren, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function useTheme() {
  return useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark',
          primary: { main: '#3b82f6' },
          success: { main: '#22c55e' },
          error: { main: '#ef4444' },
          warning: { main: '#f59e0b' },
          info: { main: '#38bdf8' },
          background: { default: '#0b1120', paper: '#151f32' },
          divider: 'rgba(148, 163, 184, 0.16)',
          text: { primary: '#e6edf7', secondary: '#94a3b8' },
        },
        shape: { borderRadius: 8 },
        typography: { fontFamily: 'inherit' },
        components: {
          MuiPaper: {
            styleOverrides: { root: { backgroundImage: 'none' } },
          },
          MuiAppBar: {
            styleOverrides: {
              root: { backgroundColor: '#0f172a', backgroundImage: 'none' },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  color: '#94a3b8',
                  backgroundColor: '#111a2b',
                },
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: { '&.MuiTableRow-hover:hover': { backgroundColor: 'rgba(59, 130, 246, 0.08)' } },
            },
          },
        },
      }),
    [],
  );
}

export default function Providers({ children }: PropsWithChildren) {
  const theme = useTheme();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
