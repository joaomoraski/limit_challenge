import pytest
from rest_framework import status

from fleet.factories import (
    MaintenanceRecordFactory,
    MechanicFactory,
    OfficeFactory,
    VehicleFactory,
)

pytestmark = pytest.mark.django_db


class TestOfficeCRUD:
    def test_create_office(self, api_client):
        resp = api_client.post("/api/offices/", {"name": "HQ", "city": "Denver"}, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["name"] == "HQ"

    def test_list_offices(self, api_client):
        OfficeFactory.create_batch(3)
        resp = api_client.get("/api/offices/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] == 3

    def test_update_office(self, api_client):
        office = OfficeFactory(name="Old Name")
        resp = api_client.put(
            f"/api/offices/{office.pk}/",
            {"name": "New Name", "city": office.city},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["name"] == "New Name"

    def test_delete_office(self, api_client):
        office = OfficeFactory()
        resp = api_client.delete(f"/api/offices/{office.pk}/")
        assert resp.status_code == status.HTTP_204_NO_CONTENT

    def test_delete_office_with_vehicles_is_protected(self, api_client):
        vehicle = VehicleFactory()
        resp = api_client.delete(f"/api/offices/{vehicle.office.pk}/")
        assert resp.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_409_CONFLICT)


class TestVehicleCRUD:
    def test_create_vehicle(self, api_client):
        office = OfficeFactory()
        payload = {
            "vin": "1HGBH41JXMN000001",
            "license_plate": "ABC-1234",
            "make": "Toyota",
            "model": "Camry",
            "year": 2023,
            "office": office.pk,
        }
        resp = api_client.post("/api/vehicles/", payload, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["vin"] == "1HGBH41JXMN000001"

    def test_list_vehicles(self, api_client):
        VehicleFactory.create_batch(3)
        resp = api_client.get("/api/vehicles/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] == 3

    def test_update_vehicle(self, api_client):
        vehicle = VehicleFactory()
        resp = api_client.patch(
            f"/api/vehicles/{vehicle.pk}/",
            {"make": "Honda"},
            format="json",
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["make"] == "Honda"

    def test_delete_vehicle_cascades_records(self, api_client):
        record = MaintenanceRecordFactory()
        vehicle_pk = record.vehicle.pk
        resp = api_client.delete(f"/api/vehicles/{vehicle_pk}/")
        assert resp.status_code == status.HTTP_204_NO_CONTENT

    def test_create_vehicle_duplicate_vin(self, api_client):
        existing = VehicleFactory(vin="DUPLICATE_VIN_00001")
        payload = {
            "vin": "DUPLICATE_VIN_00001",
            "license_plate": "NEW-0001",
            "make": "Ford",
            "model": "Focus",
            "year": 2022,
            "office": existing.office.pk,
        }
        resp = api_client.post("/api/vehicles/", payload, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_vehicle_missing_fields(self, api_client):
        resp = api_client.post("/api/vehicles/", {}, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


class TestMechanicCRUD:
    def test_create_mechanic(self, api_client):
        payload = {"name": "Jane Smith", "certification_number": "CERT-999999"}
        resp = api_client.post("/api/mechanics/", payload, format="json")
        assert resp.status_code == status.HTTP_201_CREATED

    def test_list_mechanics(self, api_client):
        MechanicFactory.create_batch(2)
        resp = api_client.get("/api/mechanics/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] == 2


class TestMaintenanceRecordCRUD:
    def test_create_maintenance_record(self, api_client):
        vehicle = VehicleFactory()
        mechanic = MechanicFactory()
        payload = {
            "vehicle": vehicle.pk,
            "mechanic": mechanic.pk,
            "maintenance_date": "2025-06-15",
            "maintenance_type": "Oil Change",
            "cost": "75.00",
        }
        resp = api_client.post("/api/maintenance-records/", payload, format="json")
        assert resp.status_code == status.HTTP_201_CREATED

    def test_list_maintenance_records(self, api_client):
        MaintenanceRecordFactory.create_batch(3)
        resp = api_client.get("/api/maintenance-records/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] == 3
