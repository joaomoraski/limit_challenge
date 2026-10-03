import pytest

from fleet.factories import VehicleFactory

pytestmark = pytest.mark.django_db

URL = "/api/vehicles/duplicate-check/"


class TestDuplicateCheck:
    def test_no_conflicts(self, api_client):
        resp = api_client.post(URL, {"vin": "NEWVIN123", "license_plate": "NEW-0001"}, format="json")
        assert resp.status_code == 200
        assert resp.data["conflicts"] == []

    def test_vin_conflict(self, api_client):
        VehicleFactory(vin="EXISTING_VIN_001")
        resp = api_client.post(URL, {"vin": "EXISTING_VIN_001", "license_plate": "NEW-0001"}, format="json")
        assert resp.status_code == 200
        assert resp.data["conflicts"] == ["vin"]

    def test_plate_conflict_active_only(self, api_client):
        VehicleFactory(license_plate="DUP-PLATE", is_active=True)
        resp = api_client.post(URL, {"vin": "NEWVIN999", "license_plate": "DUP-PLATE"}, format="json")
        assert "license_plate" in resp.data["conflicts"]

    def test_plate_no_conflict_inactive(self, api_client):
        VehicleFactory(license_plate="INACTIVE-PLT", inactive=True)
        resp = api_client.post(URL, {"vin": "NEWVIN888", "license_plate": "INACTIVE-PLT"}, format="json")
        assert "license_plate" not in resp.data["conflicts"]

    def test_both_conflicts(self, api_client):
        VehicleFactory(vin="BOTH_VIN_001", license_plate="BOTH-PLT", is_active=True)
        resp = api_client.post(URL, {"vin": "BOTH_VIN_001", "license_plate": "BOTH-PLT"}, format="json")
        assert resp.data["conflicts"] == ["vin", "license_plate"]

    def test_at_least_one_field_required(self, api_client):
        resp = api_client.post(URL, {}, format="json")
        assert resp.status_code == 400
