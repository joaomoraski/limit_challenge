'use client';

import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Offices', href: '/offices' },
  { label: 'Mechanics', href: '/mechanics' },
  { label: 'Maintenance', href: '/maintenance' },
];

function getActiveTab(pathname: string): number {
  if (pathname === '/') return 0;
  const idx = NAV_ITEMS.findIndex(
    (item, i) => i > 0 && pathname.startsWith(item.href),
  );
  return idx >= 0 ? idx : 0;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 3 }}>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              mr: 2,
            }}
          >
            Fleet Tracker
          </Typography>
          <Tabs
            value={activeTab}
            textColor="inherit"
            TabIndicatorProps={{ sx: { backgroundColor: 'primary.main', height: 3 } }}
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                opacity: 0.75,
                '&.Mui-selected': { opacity: 1 },
              },
            }}
          >
            {NAV_ITEMS.map(({ label, href }) => (
              <Tab key={href} label={label} component={Link} href={href} />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
}
