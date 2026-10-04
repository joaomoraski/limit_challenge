from datetime import date, timedelta

import pytest

from fleet.factories import (
    MaintenanceRecordFactory,
    MechanicFactory,
    OfficeFactory,
    VehicleFactory,
)

pytestmark = pytest.mark.django_db

URL = "/api/vehicles/search/"


class TestVehicleSearch:
    def test_no_filters_returns_all(self, api_client):
        VehicleFactory.create_batch(3)
        resp = api_client.get(URL)
        assert resp.status_code == 200
        assert resp.data["count"] == 3

    def test_filter_by_office(self, api_client):
        office_a = OfficeFactory()
        office_b = OfficeFactory()
        VehicleFactory.create_batch(2, office=office_a)
        VehicleFactory(office=office_b)

        resp = api_client.get(URL, {"office": office_a.pk})
        assert resp.data["count"] == 2

    def test_filter_by_active(self, api_client):
        VehicleFactory.create_batch(2, is_active=True)
        VehicleFactory(inactive=True)

        resp = api_client.get(URL, {"is_active": "true"})
        assert resp.data["count"] == 2

    def test_filter_by_make(self, api_client):
        VehicleFactory(make="Toyota")
        VehicleFactory(make="toyota")
        VehicleFactory(make="Ford")

        resp = api_client.get(URL, {"make": "toyota"})
        assert resp.data["count"] == 2

    def test_filter_by_maintenance_date_range(self, api_client):
        v1 = VehicleFactory()
        v2 = VehicleFactory()
        v3 = VehicleFactory()

        MaintenanceRecordFactory(vehicle=v1, maintenance_date=date(2025, 3, 15))
        MaintenanceRecordFactory(vehicle=v2, maintenance_date=date(2025, 6, 10))
        MaintenanceRecordFactory(vehicle=v3, maintenance_date=date(2024, 1, 1))

        resp = api_client.get(URL, {
            "maintenance_from": "2025-01-01",
            "maintenance_to": "2025-12-31",
        })
        assert resp.data["count"] == 2

    def test_filter_by_mechanic_cert(self, api_client):
        mechanic = MechanicFactory(certification_number="CERT-SPECIAL")
        v1 = VehicleFactory()
        v2 = VehicleFactory()

        MaintenanceRecordFactory(vehicle=v1, mechanic=mechanic)
        MaintenanceRecordFactory(vehicle=v2)

        resp = api_client.get(URL, {"mechanic_cert": "CERT-SPECIAL"})
        assert resp.data["count"] == 1
        assert resp.data["results"][0]["id"] == v1.pk

    def test_combined_filters(self, api_client):
        office = OfficeFactory()
        VehicleFactory(office=office, make="Toyota", is_active=True)
        VehicleFactory(office=office, make="Ford", is_active=True)
        VehicleFactory(make="Toyota", is_active=True)

        resp = api_client.get(URL, {
            "office": office.pk,
            "make": "Toyota",
            "is_active": "true",
        })
        assert resp.data["count"] == 1

    def test_no_duplicates_from_joins(self, api_client):
        vehicle = VehicleFactory()
        mechanic = MechanicFactory(certification_number="CERT-DUP-TEST")
        MaintenanceRecordFactory(vehicle=vehicle, mechanic=mechanic, maintenance_date=date(2025, 1, 1))
        MaintenanceRecordFactory(vehicle=vehicle, mechanic=mechanic, maintenance_date=date(2025, 2, 1))

        resp = api_client.get(URL, {"mechanic_cert": "CERT-DUP-TEST"})
        assert resp.data["count"] == 1
