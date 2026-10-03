export interface Office {
  id: number;
  name: string;
  city: string;
}

export interface Vehicle {
  id: number;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  office: number;
  office_name: string;
  is_active: boolean;
}

export interface Mechanic {
  id: number;
  name: string;
  certification_number: string;
  is_active: boolean;
}

export interface MaintenanceRecord {
  id: number;
  vehicle: number;
  mechanic: number;
  mechanic_name: string;
  maintenance_date: string;
  maintenance_type: string;
  cost: string;
  notes: string;
}

export interface MaintenanceRecordDetail {
  id: number;
  vehicle: number;
  mechanic: Mechanic;
  maintenance_date: string;
  maintenance_type: string;
  cost: string;
  notes: string;
}

export interface VehicleDetail {
  id: number;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  office: Office;
  is_active: boolean;
  maintenance_records: MaintenanceRecordDetail[];
}

export interface OfficeSummary extends Office {
  active_vehicle_count: number;
  maintenance_cost_last_year: string;
  last_maintenance: string | null;
}

export interface MechanicWorkload {
  id: number;
  name: string;
  certification_number: string;
  records_this_year: number;
  total_cost_this_year: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface VehicleSearchParams {
  office?: string;
  is_active?: string;
  make?: string;
  model?: string;
  maintenance_from?: string;
  maintenance_to?: string;
  mechanic_cert?: string;
  page?: string;
}
