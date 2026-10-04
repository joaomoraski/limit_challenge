import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMechanic,
  deleteMechanic,
  fetchAllMechanics,
  fetchMechanicWorkload,
  fetchMechanics,
  updateMechanic,
} from '@/services/api';
import type { Mechanic } from '@/types';

export function useMechanics(page = 1) {
  return useQuery({
    queryKey: ['mechanics', page],
    queryFn: () => fetchMechanics(page),
  });
}

export function useAllMechanics() {
  return useQuery({
    queryKey: ['mechanics', 'all'],
    queryFn: fetchAllMechanics,
  });
}

export function useMechanicWorkload(page = 1) {
  return useQuery({
    queryKey: ['mechanics', 'workload', page],
    queryFn: () => fetchMechanicWorkload(page),
  });
}

export function useCreateMechanic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Mechanic, 'id'>) => createMechanic(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mechanics'] }),
  });
}

export function useUpdateMechanic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Mechanic> }) =>
      updateMechanic(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mechanics'] }),
  });
}

export function useDeleteMechanic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMechanic(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mechanics'] }),
  });
}
