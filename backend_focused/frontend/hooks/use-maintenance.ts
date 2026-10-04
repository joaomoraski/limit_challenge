import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMaintenanceRecord,
  deleteMaintenanceRecord,
  fetchMaintenanceRecords,
} from '@/services/api';
import type { MaintenanceRecord } from '@/types';

export function useMaintenanceRecords(page = 1) {
  return useQuery({
    queryKey: ['maintenance-records', page],
    queryFn: () => fetchMaintenanceRecords(page),
  });
}

export function useCreateMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MaintenanceRecord, 'id' | 'mechanic_name'>) =>
      createMaintenanceRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useDeleteMaintenanceRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMaintenanceRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
