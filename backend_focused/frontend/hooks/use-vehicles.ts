import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignVehicle,
  checkDuplicateVehicle,
  createVehicle,
  deleteVehicle,
  fetchAllVehicles,
  fetchVehicle,
  fetchVehicleMaintenanceHistory,
  fetchVehicles,
  fetchVehiclesNeedingMaintenance,
  searchVehicles,
  updateVehicle,
} from '@/services/api';
import type { Vehicle, VehicleSearchParams } from '@/types';

export function useVehicles(page = 1) {
  return useQuery({
    queryKey: ['vehicles', page],
    queryFn: () => fetchVehicles(page),
  });
}

export function useAllVehicles() {
  return useQuery({
    queryKey: ['vehicles', 'all'],
    queryFn: fetchAllVehicles,
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => fetchVehicle(id),
    enabled: !!id,
  });
}

export function useVehicleSearch(params: VehicleSearchParams) {
  return useQuery({
    queryKey: ['vehicles', 'search', params],
    queryFn: () => searchVehicles(params),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Vehicle, 'id' | 'office_name'>) => createVehicle(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Vehicle> }) => updateVehicle(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteVehicle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });
}

export function useAssignVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, officeId }: { id: number; officeId: number }) => assignVehicle(id, officeId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useVehicleMaintenanceHistory(vehicleId: number, page = 1) {
  return useQuery({
    queryKey: ['vehicles', vehicleId, 'maintenance-history', page],
    queryFn: () => fetchVehicleMaintenanceHistory(vehicleId, page),
    enabled: !!vehicleId,
  });
}

export function useVehiclesNeedingMaintenance(page = 1) {
  return useQuery({
    queryKey: ['vehicles', 'needing-maintenance', page],
    queryFn: () => fetchVehiclesNeedingMaintenance(page),
  });
}

export function useDuplicateCheck() {
  return useMutation({
    mutationFn: ({ vin, licensePlate }: { vin?: string; licensePlate?: string }) =>
      checkDuplicateVehicle(vin, licensePlate),
  });
}
