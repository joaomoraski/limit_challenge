from datetime import date, timedelta
from decimal import Decimal

import pytest

from fleet.factories import MaintenanceRecordFactory, OfficeFactory, VehicleFactory

pytestmark = pytest.mark.django_db

URL = "/api/offices/summary/"


class TestOfficeSummary:
    def test_summary_returns_all_offices(self, api_client):
        OfficeFactory.create_batch(3)
        resp = api_client.get(URL)
        assert resp.status_code == 200
        assert resp.data["count"] == 3

    def test_active_vehicle_count(self, api_client):
        office = OfficeFactory()
        VehicleFactory.create_batch(3, office=office, is_active=True)
        VehicleFactory(office=office, inactive=True)

        resp = api_client.get(URL)
        result = resp.data["results"][0]
        assert result["active_vehicle_count"] == 3

    def test_maintenance_cost_last_year(self, api_client):
        office = OfficeFactory()
        vehicle = VehicleFactory(office=office)
        recent = date.today() - timedelta(days=30)
        old = date.today() - timedelta(days=400)

        MaintenanceRecordFactory(vehicle=vehicle, maintenance_date=recent, cost=Decimal("100.00"))
        MaintenanceRecordFactory(vehicle=vehicle, maintenance_date=recent, cost=Decimal("200.00"))
        MaintenanceRecordFactory(vehicle=vehicle, maintenance_date=old, cost=Decimal("999.00"))

        resp = api_client.get(URL)
        result = resp.data["results"][0]
        assert Decimal(result["maintenance_cost_last_year"]) == Decimal("300.00")

    def test_last_maintenance(self, api_client):
        office = OfficeFactory()
        vehicle = VehicleFactory(office=office)
        MaintenanceRecordFactory(vehicle=vehicle, maintenance_date=date(2025, 1, 15))
        MaintenanceRecordFactory(vehicle=vehicle, maintenance_date=date(2025, 6, 20))

        resp = api_client.get(URL)
        result = resp.data["results"][0]
        assert result["last_maintenance"] == "2025-06-20"

    def test_office_with_no_vehicles(self, api_client):
        OfficeFactory()
        resp = api_client.get(URL)
        result = resp.data["results"][0]
        assert result["active_vehicle_count"] == 0
        assert Decimal(result["maintenance_cost_last_year"]) == Decimal("0.00")
        assert result["last_maintenance"] is None
