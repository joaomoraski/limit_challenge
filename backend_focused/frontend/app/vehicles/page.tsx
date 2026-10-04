'use client';

import { Suspense } from 'react';
import VehicleSearchPage from './VehicleSearchPage';

export default function VehiclesPage() {
  return (
    <Suspense>
      <VehicleSearchPage />
    </Suspense>
  );
}
