from datetime import date, timedelta

import pytest

from fleet.factories import MaintenanceRecordFactory, VehicleFactory

pytestmark = pytest.mark.django_db

URL = "/api/vehicles/needing-maintenance/"


class TestVehiclesNeedingMaintenance:
    def test_never_maintained_vehicles(self, api_client):
        vehicle = VehicleFactory()
        resp = api_client.get(URL)
        assert resp.data["count"] == 1
        assert resp.data["results"][0]["id"] == vehicle.pk

    def test_old_maintenance_vehicles(self, api_client):
        vehicle = VehicleFactory()
        MaintenanceRecordFactory(
            vehicle=vehicle,
            maintenance_date=date.today() - timedelta(days=400),
        )

        resp = api_client.get(URL)
        assert resp.data["count"] == 1

    def test_recently_maintained_excluded(self, api_client):
        vehicle = VehicleFactory()
        MaintenanceRecordFactory(
            vehicle=vehicle,
            maintenance_date=date.today() - timedelta(days=30),
        )

        resp = api_client.get(URL)
        assert resp.data["count"] == 0

    def test_inactive_vehicles_excluded(self, api_client):
        VehicleFactory(inactive=True)
        resp = api_client.get(URL)
        assert resp.data["count"] == 0

    def test_ordering_nulls_first(self, api_client):
        never_maintained = VehicleFactory()
        old_maintained = VehicleFactory()
        MaintenanceRecordFactory(
            vehicle=old_maintained,
            maintenance_date=date.today() - timedelta(days=500),
        )

        resp = api_client.get(URL)
        results = resp.data["results"]
        assert len(results) == 2
        assert results[0]["id"] == never_maintained.pk
        assert results[0]["last_maintenance_date"] is None
        assert results[1]["id"] == old_maintained.pk
