import pytest
from rest_framework import status

from fleet.factories import OfficeFactory, VehicleFactory

pytestmark = pytest.mark.django_db


class TestAssignVehicle:
    def test_assign_to_new_office(self, api_client):
        vehicle = VehicleFactory()
        new_office = OfficeFactory()

        resp = api_client.post(
            f"/api/vehicles/{vehicle.pk}/assign/",
            {"office_id": new_office.pk},
            format="json",
        )

        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["office"] == new_office.pk

    def test_assign_to_nonexistent_office(self, api_client):
        vehicle = VehicleFactory()

        resp = api_client.post(
            f"/api/vehicles/{vehicle.pk}/assign/",
            {"office_id": 99999},
            format="json",
        )

        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_assign_to_same_office(self, api_client):
        vehicle = VehicleFactory()

        resp = api_client.post(
            f"/api/vehicles/{vehicle.pk}/assign/",
            {"office_id": vehicle.office.pk},
            format="json",
        )

        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["office"] == vehicle.office.pk
