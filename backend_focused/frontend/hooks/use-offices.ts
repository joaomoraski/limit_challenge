import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOffice,
  deleteOffice,
  fetchAllOffices,
  fetchOffices,
  fetchOfficeSummary,
  updateOffice,
} from '@/services/api';
import type { Office } from '@/types';

export function useOffices(page = 1) {
  return useQuery({
    queryKey: ['offices', page],
    queryFn: () => fetchOffices(page),
  });
}

export function useAllOffices() {
  return useQuery({
    queryKey: ['offices', 'all'],
    queryFn: fetchAllOffices,
  });
}

export function useOfficeSummary(page = 1) {
  return useQuery({
    queryKey: ['offices', 'summary', page],
    queryFn: () => fetchOfficeSummary(page),
  });
}

export function useCreateOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Office, 'id'>) => createOffice(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offices'] }),
  });
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Office> }) => updateOffice(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offices'] }),
  });
}

export function useDeleteOffice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteOffice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offices'] }),
  });
}
