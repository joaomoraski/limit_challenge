from datetime import date
from decimal import Decimal

import pytest

from fleet.factories import MaintenanceRecordFactory, MechanicFactory, VehicleFactory

pytestmark = pytest.mark.django_db

URL = "/api/mechanics/workload/"


class TestMechanicWorkload:
    def test_workload_counts_current_year_only(self, api_client):
        mechanic = MechanicFactory()
        vehicle = VehicleFactory()
        current_year = date.today().year

        MaintenanceRecordFactory(
            mechanic=mechanic, vehicle=vehicle,
            maintenance_date=date(current_year, 3, 1), cost=Decimal("100.00"),
        )
        MaintenanceRecordFactory(
            mechanic=mechanic, vehicle=vehicle,
            maintenance_date=date(current_year - 1, 6, 1), cost=Decimal("500.00"),
        )

        resp = api_client.get(URL)
        result = resp.data["results"][0]
        assert result["records_this_year"] == 1
        assert Decimal(result["total_cost_this_year"]) == Decimal("100.00")

    def test_ordering_busiest_first(self, api_client):
        m_busy = MechanicFactory()
        m_idle = MechanicFactory()
        vehicle = VehicleFactory()
        current_year = date.today().year

        for month in range(1, 4):
            MaintenanceRecordFactory(
                mechanic=m_busy, vehicle=vehicle,
                maintenance_date=date(current_year, month, 1),
            )
        MaintenanceRecordFactory(
            mechanic=m_idle, vehicle=vehicle,
            maintenance_date=date(current_year, 1, 1),
        )

        resp = api_client.get(URL)
        results = resp.data["results"]
        assert results[0]["id"] == m_busy.pk
        assert results[0]["records_this_year"] == 3
        assert results[1]["id"] == m_idle.pk
        assert results[1]["records_this_year"] == 1

    def test_mechanic_with_no_records(self, api_client):
        MechanicFactory()
        resp = api_client.get(URL)
        result = resp.data["results"][0]
        assert result["records_this_year"] == 0
        assert Decimal(result["total_cost_this_year"]) == Decimal("0.00")
