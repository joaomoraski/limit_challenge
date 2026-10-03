import pytest
from django.db import IntegrityError
from django.db.models import ProtectedError

from fleet.factories import (
    MaintenanceRecordFactory,
    MechanicFactory,
    OfficeFactory,
    VehicleFactory,
)

pytestmark = pytest.mark.django_db


class TestVehicleConstraints:
    def test_unique_vin(self):
        VehicleFactory(vin="DUPLICATE_VIN_0001")
        with pytest.raises(IntegrityError):
            VehicleFactory(vin="DUPLICATE_VIN_0001")

    def test_unique_active_license_plate(self):
        VehicleFactory(license_plate="XYZ-1234", is_active=True)
        with pytest.raises(IntegrityError):
            VehicleFactory(license_plate="XYZ-1234", is_active=True)

    def test_inactive_vehicles_can_share_plate(self):
        VehicleFactory(license_plate="XYZ-1234", is_active=True)
        vehicle = VehicleFactory(license_plate="XYZ-1234", inactive=True)
        assert vehicle.pk is not None

    def test_two_inactive_vehicles_can_share_plate(self):
        VehicleFactory(license_plate="XYZ-1234", inactive=True)
        vehicle = VehicleFactory(license_plate="XYZ-1234", inactive=True)
        assert vehicle.pk is not None


class TestOnDeleteBehavior:
    def test_office_protected_from_deletion(self):
        vehicle = VehicleFactory()
        with pytest.raises(ProtectedError):
            vehicle.office.delete()

    def test_mechanic_protected_from_deletion(self):
        record = MaintenanceRecordFactory()
        with pytest.raises(ProtectedError):
            record.mechanic.delete()

    def test_vehicle_deletion_cascades_to_records(self):
        record = MaintenanceRecordFactory()
        vehicle = record.vehicle
        vehicle_pk = vehicle.pk
        record_pk = record.pk

        vehicle.delete()

        from fleet.models import MaintenanceRecord, Vehicle

        assert not Vehicle.objects.filter(pk=vehicle_pk).exists()
        assert not MaintenanceRecord.objects.filter(pk=record_pk).exists()


class TestModelStr:
    def test_office_str(self):
        office = OfficeFactory.build(name="Downtown")
        assert str(office) == "Downtown"

    def test_vehicle_str(self):
        vehicle = VehicleFactory.build(year=2023, make="Toyota", model="Camry")
        assert str(vehicle) == "2023 Toyota Camry"

    def test_mechanic_str(self):
        mechanic = MechanicFactory.build(name="John Doe")
        assert str(mechanic) == "John Doe"
