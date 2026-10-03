from datetime import date

import pytest
from rest_framework import status

from fleet.factories import MaintenanceRecordFactory, MechanicFactory, VehicleFactory

pytestmark = pytest.mark.django_db


class TestVehicleDetail:
    def test_detail_includes_nested_office(self, api_client):
        vehicle = VehicleFactory()
        resp = api_client.get(f"/api/vehicles/{vehicle.pk}/")

        assert resp.status_code == status.HTTP_200_OK
        office = resp.data["office"]
        assert isinstance(office, dict)
        assert "id" in office
        assert "name" in office
        assert "city" in office

    def test_detail_includes_maintenance_records(self, api_client):
        vehicle = VehicleFactory()
        MaintenanceRecordFactory.create_batch(3, vehicle=vehicle)

        resp = api_client.get(f"/api/vehicles/{vehicle.pk}/")

        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data["maintenance_records"]) == 3

    def test_detail_maintenance_records_ordered_newest_first(self, api_client):
        vehicle = VehicleFactory()
        MaintenanceRecordFactory(vehicle=vehicle, maintenance_date=date(2024, 1, 1))
        MaintenanceRecordFactory(vehicle=vehicle, maintenance_date=date(2025, 6, 15))
        MaintenanceRecordFactory(vehicle=vehicle, maintenance_date=date(2023, 3, 10))

        resp = api_client.get(f"/api/vehicles/{vehicle.pk}/")

        dates = [r["maintenance_date"] for r in resp.data["maintenance_records"]]
        assert dates == sorted(dates, reverse=True)

    def test_detail_includes_mechanic_in_records(self, api_client):
        vehicle = VehicleFactory()
        mechanic = MechanicFactory(name="Alice Wrench")
        MaintenanceRecordFactory(vehicle=vehicle, mechanic=mechanic)

        resp = api_client.get(f"/api/vehicles/{vehicle.pk}/")

        record = resp.data["maintenance_records"][0]
        assert isinstance(record["mechanic"], dict)
        assert record["mechanic"]["name"] == "Alice Wrench"
