import { apiClient } from '@/lib/api-client';
import type {
  MaintenanceRecord,
  Mechanic,
  MechanicWorkload,
  Office,
  OfficeSummary,
  PaginatedResponse,
  Vehicle,
  VehicleDetail,
  VehicleSearchParams,
} from '@/types';

// Offices

export const fetchOffices = async (page = 1) => {
  const { data } = await apiClient.get<PaginatedResponse<Office>>('/offices/', { params: { page } });
  return data;
};

export const fetchAllOffices = async () => {
  const { data } = await apiClient.get<PaginatedResponse<Office>>('/offices/', { params: { page_size: 999 } });
  return data;
};

export const fetchOffice = async (id: number) => {
  const { data } = await apiClient.get<Office>(`/offices/${id}/`);
  return data;
};

export const createOffice = async (body: Omit<Office, 'id'>) => {
  const { data } = await apiClient.post<Office>('/offices/', body);
  return data;
};

export const updateOffice = async (id: number, body: Partial<Office>) => {
  const { data } = await apiClient.patch<Office>(`/offices/${id}/`, body);
  return data;
};

export const deleteOffice = async (id: number) => {
  await apiClient.delete(`/offices/${id}/`);
};

export const fetchOfficeSummary = async (page = 1) => {
  const { data } = await apiClient.get<PaginatedResponse<OfficeSummary>>('/offices/summary/', {
    params: { page },
  });
  return data;
};

// Vehicles

export const fetchVehicles = async (page = 1) => {
  const { data } = await apiClient.get<PaginatedResponse<Vehicle>>('/vehicles/', {
    params: { page },
  });
  return data;
};

export const fetchAllVehicles = async () => {
  const { data } = await apiClient.get<PaginatedResponse<Vehicle>>('/vehicles/', { params: { page_size: 999 } });
  return data;
};

export const fetchVehicle = async (id: number) => {
  const { data } = await apiClient.get<VehicleDetail>(`/vehicles/${id}/`);
  return data;
};

export const createVehicle = async (body: Omit<Vehicle, 'id' | 'office_name'>) => {
  const { data } = await apiClient.post<Vehicle>('/vehicles/', body);
  return data;
};

export const updateVehicle = async (id: number, body: Partial<Vehicle>) => {
  const { data } = await apiClient.patch<Vehicle>(`/vehicles/${id}/`, body);
  return data;
};

export const deleteVehicle = async (id: number) => {
  await apiClient.delete(`/vehicles/${id}/`);
};

export const searchVehicles = async (params: VehicleSearchParams) => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
  );
  const { data } = await apiClient.get<PaginatedResponse<Vehicle>>('/vehicles/search/', {
    params: filtered,
  });
  return data;
};

export const assignVehicle = async (id: number, officeId: number) => {
  const { data } = await apiClient.post<Vehicle>(`/vehicles/${id}/assign/`, {
    office_id: officeId,
  });
  return data;
};

export const fetchVehicleMaintenanceHistory = async (vehicleId: number, page = 1) => {
  const { data } = await apiClient.get<PaginatedResponse<MaintenanceRecord>>(
    `/vehicles/${vehicleId}/maintenance-history/`,
    { params: { page } },
  );
  return data;
};

export const fetchVehiclesNeedingMaintenance = async (page = 1) => {
  const { data } = await apiClient.get<PaginatedResponse<Vehicle>>(
    '/vehicles/needing-maintenance/',
    { params: { page } },
  );
  return data;
};

export const checkDuplicateVehicle = async (vin?: string, licensePlate?: string) => {
  const { data } = await apiClient.post<{ conflicts: string[] }>('/vehicles/duplicate-check/', {
    vin,
    license_plate: licensePlate,
  });
  return data;
};

// Mechanics

export const fetchMechanics = async (page = 1) => {
  const { data } = await apiClient.get<PaginatedResponse<Mechanic>>('/mechanics/', {
    params: { page },
  });
  return data;
};

export const fetchAllMechanics = async () => {
  const { data } = await apiClient.get<PaginatedResponse<Mechanic>>('/mechanics/', { params: { page_size: 999 } });
  return data;
};

export const createMechanic = async (body: Omit<Mechanic, 'id'>) => {
  const { data } = await apiClient.post<Mechanic>('/mechanics/', body);
  return data;
};

export const updateMechanic = async (id: number, body: Partial<Mechanic>) => {
  const { data } = await apiClient.patch<Mechanic>(`/mechanics/${id}/`, body);
  return data;
};

export const deleteMechanic = async (id: number) => {
  await apiClient.delete(`/mechanics/${id}/`);
};

export const fetchMechanicWorkload = async (page = 1) => {
  const { data } = await apiClient.get<PaginatedResponse<MechanicWorkload>>(
    '/mechanics/workload/',
    { params: { page } },
  );
  return data;
};

// Maintenance Records

export const fetchMaintenanceRecords = async (page = 1) => {
  const { data } = await apiClient.get<PaginatedResponse<MaintenanceRecord>>(
    '/maintenance-records/',
    { params: { page } },
  );
  return data;
};

export const createMaintenanceRecord = async (body: Omit<MaintenanceRecord, 'id' | 'mechanic_name'>) => {
  const { data } = await apiClient.post<MaintenanceRecord>('/maintenance-records/', body);
  return data;
};

export const updateMaintenanceRecord = async (id: number, body: Partial<MaintenanceRecord>) => {
  const { data } = await apiClient.patch<MaintenanceRecord>(`/maintenance-records/${id}/`, body);
  return data;
};

export const deleteMaintenanceRecord = async (id: number) => {
  await apiClient.delete(`/maintenance-records/${id}/`);
};
